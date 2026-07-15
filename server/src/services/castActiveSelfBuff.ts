/**
 * Каст активного селф-бафа **поза боєм** (MVP): перезарядка, витрата MP, додавання
 * запису в `activeBuffsJson` з `expiresAt` (L2 Interlude). Після рестарту / F5 баф
 * лишається; знімається лише по закінченні `expiresAt`, смерті гравця або cancel.
 *
 * У бою касти досі проходять через `battleServicePerformBattleAction` — цей ендпоінт
 * вимагає, щоб гравець **не був у бою** (див. `isCharacterInBattle`). Коли пізніше
 * уніфікуємо з in-battle-шляхом, старі legacy-поля `battleMods.warCryPatkMul` тощо
 * будуть витіснені записами `activeBuffsJson`. Наразі, щоб уникнути подвійного
 * застосування (legacy battleMods + activeBuffsJson), при касті через новий шлях
 * стираю legacy-поля з `worldCombatStateJson` (`LEGACY_BATTLE_MODS_FIELD_BY_SKILL_ID`).
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  parseActiveBuffEntries,
  persistableActiveBuffsFromJson,
  type ActiveBuffEntry,
} from '../data/l2dopActiveBuffs.js';
import {
  activeBuffExpiresAt,
  buffDurationSecForSkillId,
} from '../data/l2dopBuffDurations.js';
import {
  cooldownSecForSkillId,
  isSkillReady,
  markSkillCast,
  parseSkillCooldowns,
} from '../data/skillCooldowns.js';
import { resolveBattleSkillCooldownSec } from '../data/skillCooldownScaling.js';
import { warCryMpAtRank } from '../data/warCryTables.js';
import {
  canonicalBattleSkillId,
  normalizeLearnedSkillsJson,
} from '../data/humanFighterSkillCatalog.js';
import { resolveAnyCatalogEntry } from '../data/selfBuffResolver.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import { resolveL2ProfessionForSkillsRow } from '../data/l2dopHumanFighterBattleSkills.js';
import { l2dopXmlMpPower } from '../data/l2dopXmlSkillLevels.lookup.js';
import {
  isCharacterInBattle,
  parseWorldCombatState,
} from '../domain/worldCombatState.js';
import type { BattleBattleMods } from '../domain/battle.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
} from './charConflict.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

/**
 * Legacy-поля `battleMods`, які встановлювалися старими in-battle-діями для тих же
 * бафів (щоб `effectiveBattle*Display` їх застосовували). Новий шлях веде через
 * `activeBuffsJson` + `combatBuffsFromActiveJson`, тож legacy-поле треба прибрати.
 */
const LEGACY_BATTLE_MODS_FIELD_BY_SKILL_ID: Readonly<
  Record<number, readonly (keyof BattleBattleMods)[]>
> = {
  78: ['warCryPatkMul'],
  121: ['battleRoarMaxHpMul'],
  130: ['thrillFightPatkMul'],
};

function stripLegacyBattleModsForSkill(
  worldRaw: Prisma.JsonValue | null,
  skillId: number
): Prisma.JsonValue | null {
  const fields = LEGACY_BATTLE_MODS_FIELD_BY_SKILL_ID[skillId];
  if (!fields?.length) return worldRaw;
  if (worldRaw == null || typeof worldRaw !== 'object' || Array.isArray(worldRaw)) {
    return worldRaw;
  }
  const o = worldRaw as Record<string, unknown>;
  const bm = o.battleMods;
  if (bm == null || typeof bm !== 'object' || Array.isArray(bm)) return worldRaw;
  const nextBm: Record<string, unknown> = { ...(bm as Record<string, unknown>) };
  let changed = false;
  for (const f of fields) {
    if (f in nextBm) {
      delete nextBm[f as string];
      changed = true;
    }
  }
  if (!changed) return worldRaw;
  return { ...o, battleMods: nextBm } as unknown as Prisma.JsonValue;
}

/** Побудова JSON для `worldCombatStateJson` з явними `playerMp` і `expiresAt` (30 хв). */
function buildWorldStateWithMp(
  prevRaw: Prisma.JsonValue | null,
  mpAfter: number,
  nowMs: number
): Prisma.JsonValue {
  const WORLD_TTL_MS = 30 * 60 * 1000;
  const parsed = parseWorldCombatState(prevRaw);
  const battleMods =
    parsed?.battleMods && typeof parsed.battleMods === 'object'
      ? parsed.battleMods
      : {};
  const next = {
    battleMods,
    playerMp: Math.max(0, Math.floor(mpAfter)),
    lastTickAt: nowMs,
    expiresAt: nowMs + WORLD_TTL_MS,
  };
  return next as unknown as Prisma.JsonValue;
}

/**
 * Додає/замінює `{skillId, level, expiresAt?}` у списку активних бафів.
 * Прострочені записи одразу зрізаються.
 */
function upsertActiveBuffEntry(
  raw: Prisma.JsonValue | null,
  skillId: number,
  level: number,
  nowMs: number
): ActiveBuffEntry[] {
  const current = persistableActiveBuffsFromJson(raw, nowMs);
  const exp = activeBuffExpiresAt(skillId, nowMs);
  const next: ActiveBuffEntry[] = [];
  let replaced = false;
  for (const e of current) {
    if (e.skillId === skillId) {
      next.push(
        exp !== undefined
          ? { skillId, level, expiresAt: exp }
          : { skillId, level }
      );
      replaced = true;
    } else {
      next.push(e);
    }
  }
  if (!replaced) {
    next.push(
      exp !== undefined
        ? { skillId, level, expiresAt: exp }
        : { skillId, level }
    );
  }
  return next;
}

export type CastSelfBuffError =
  | 'no_character'
  | 'skill_unknown'
  | 'skill_not_learned'
  | 'skill_not_self_buff'
  | 'skill_in_battle'
  | 'skill_on_cooldown'
  | 'skill_not_enough_mp';

/**
 * Каст активного селф-бафа поза боєм. Джерело `skillId`: канонічний `l2_<id>`.
 *
 * Лукап через `resolveAnyCatalogEntry`: HF → race-fighter → race-mystic. Гра
 * пропускає лише `kind === 'battle'` (toggle/passive у self-cast не входять —
 * див. `buildCastableSelfBuffs`).
 */
export async function castActiveSelfBuff(
  userId: string,
  battleIdOrL2: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const canon = canonicalBattleSkillId(battleIdOrL2);

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character' satisfies CastSelfBuffError);
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const row = char as CharacterRow;

    if (isCharacterInBattle(row.battleJson)) {
      throw new Error('skill_in_battle' satisfies CastSelfBuffError);
    }

    const prof = resolveL2ProfessionForSkillsRow(row);
    const entry = resolveAnyCatalogEntry(canon, row.race, row.classBranch, prof);
    if (!entry) {
      throw new Error('skill_unknown' satisfies CastSelfBuffError);
    }
    if (entry.kind !== 'battle') {
      /** Toggle/passive не каст-через-цей-ендпоінт; toggle — окремий шлях, passive — авто. */
      throw new Error('skill_not_self_buff' satisfies CastSelfBuffError);
    }

    const learned = filterLearnedSkillEntriesForCharacter(
      normalizeLearnedSkillsJson(row.skillsLearnedJson),
      row.race,
      row.classBranch,
      prof
    );
    const learnedOne = learned.find(
      (e) => canonicalBattleSkillId(e.battleId) === canon
    );
    if (!learnedOne || learnedOne.level < 1) {
      throw new Error('skill_not_learned' satisfies CastSelfBuffError);
    }

    const skillId = entry.l2SkillId;
    const skillLevel = Math.max(1, Math.floor(learnedOne.level));

    /** Маємо опис тривалості — інакше це не «self-buff» у нашому MVP. */
    if (buffDurationSecForSkillId(skillId) === undefined) {
      throw new Error('skill_not_self_buff' satisfies CastSelfBuffError);
    }

    const nowMs = Date.now();

    const cds = parseSkillCooldowns(row.skillCooldownsJson, nowMs);
    if (!isSkillReady(cds, skillId, nowMs)) {
      throw new Error('skill_on_cooldown' satisfies CastSelfBuffError);
    }

    /** MP cost з l2dop XML; War Cry (78) — l2db Interlude, якщо XML порожній. */
    const mpRow = l2dopXmlMpPower(skillId, skillLevel);
    const mpCost =
      skillId === 78
        ? (warCryMpAtRank(skillLevel) ?? mpRow?.mp)
        : mpRow?.mp;
    if (mpCost === undefined || !Number.isFinite(mpCost) || mpCost < 0) {
      throw new Error('skill_unknown' satisfies CastSelfBuffError);
    }

    /**
     * Валідація MP: рахуємо через `toSnapshot` (використовує `tickWorldCombatState`
     * щоб врахувати `parseWorldCombatState` + дренаж стійок). Це дає поточний MP
     * саме як у клієнтському снепшоті — один і той самий numeric simplex.
     */
    const preSnap = toSnapshot(row);
    if (preSnap.mp < mpCost) {
      throw new Error('skill_not_enough_mp' satisfies CastSelfBuffError);
    }

    const nextActiveBuffs = upsertActiveBuffEntry(
      row.activeBuffsJson,
      skillId,
      skillLevel,
      nowMs
    );

    const cdSecRaw = entry.cooldownSec ?? cooldownSecForSkillId(skillId);
    const cdSec =
      cdSecRaw !== undefined && cdSecRaw !== null
        ? resolveBattleSkillCooldownSec({
            classBranch: row.classBranch,
            category: undefined,
            kind: entry.kind,
            skillRank: skillLevel,
            baseCdSec: cdSecRaw,
            l2SkillId: skillId,
            castSpd: preSnap.castSpd,
            pAtkSpd: preSnap.pAtkSpd,
          })
        : undefined;
    const nextCooldowns =
      cdSec !== undefined && cdSec !== null
        ? markSkillCast(cds, skillId, cdSec, nowMs)
        : cds;

    const worldStripped = stripLegacyBattleModsForSkill(
      row.worldCombatStateJson,
      skillId
    );
    const mpAfter = preSnap.mp - mpCost;
    const nextWorld = buildWorldStateWithMp(worldStripped, mpAfter, nowMs);

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          activeBuffsJson: nextActiveBuffs as unknown as Prisma.InputJsonValue,
          skillCooldownsJson: nextCooldowns as unknown as Prisma.InputJsonValue,
          worldCombatStateJson: nextWorld as unknown as Prisma.InputJsonValue,
        } as Prisma.CharacterUpdateManyMutationInput,
      })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}

/** Тестові експорти для юніт-тестів пізніше (якщо з'являться). */
export const __testing = {
  parseActiveBuffEntries,
  stripLegacyBattleModsForSkill,
};
