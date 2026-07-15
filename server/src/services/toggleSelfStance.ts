/**
import { gameConflictFromCharacter, gameConflictFromMutation } from './charConflict.js';
 * Перемикач (toggle) бойових стійок **поза боєм**.
 *
 * Дві гілки:
 *
 * 1. Human Fighter — три «класичні» стійки, які раніше вмикались лише з
 *    in-battle хардкод-екшенів (`accuracy_stance` / `vicious_stance` /
 *    `parry_stance` у `humanFighterTurn.ts`):
 *       - 256  Accuracy Stance  → `battleMods.stanceAccuracy`
 *       - 312  Vicious Stance   → `battleMods.stanceVicious` + `viciousStanceSkillRank`
 *       - 364  Parry Stance     → `battleMods.stanceParry`
 *    Прапори читає `effectiveBattle*Display` (через `resolveDisplayBattleMods`)
 *    і `tickWorldCombatState` (MP-дрен).
 *
 * 2. Інші раси / Mystic — будь-який скіл з `kind: 'toggle'` (Songs, Holy
 *    Blade, Guard Stance, Shield Fortress, Arcane Wisdom тощо). Їхній
 *    «увімкнено»-стан зберігається в `battleMods.raceToggleRanks` як мапа
 *    `l2_<id>` → ранг. Дельту до P.Atk / M.Atk / P.Def / Acc / тощо
 *    рахує `raceFighterToggleStanceCombatDelta` всередині
 *    `computeCombatStatsOptionsForCharacter`. MP стікає тим же `stanceCount`,
 *    що і HF-стійки.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { canonicalBattleSkillId } from '../data/humanFighterSkillCatalog.js';
import { resolveAnyCatalogEntry } from '../data/selfBuffResolver.js';
import { resolveL2ProfessionForSkillsRow } from '../data/l2dopHumanFighterBattleSkills.js';
import {
  isCharacterInBattle,
  parseWorldCombatState,
  type WorldCombatState,
} from '../domain/worldCombatState.js';
import type { BattleBattleMods } from '../domain/battle.js';
import { applyRiposteReflectToBattleMods } from '../domain/riposteStance.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
} from './charConflict.js';
import { toSnapshot } from './charSnapshotLogic.js';
import { combatOptsFromRow } from './charSnapshotLogic.js';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { parseInventory } from '../data/inventory.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

export type ToggleSelfStanceError =
  | 'no_character'
  | 'skill_in_battle'
  | 'skill_unknown'
  | 'skill_not_learned'
  | 'skill_not_toggle'
  | 'stance_not_supported';

const HF_STANCE_BY_SKILL_ID: Record<
  number,
  { flag: keyof BattleBattleMods; rankField?: keyof BattleBattleMods }
> = {
  256: { flag: 'stanceAccuracy' },
  312: { flag: 'stanceVicious', rankField: 'viciousStanceSkillRank' },
  364: { flag: 'stanceParry' },
};

const WORLD_COMBAT_MAX_MS = 30 * 60 * 1000;

function buildBaseWorldState(maxMp: number, nowMs: number): WorldCombatState {
  return {
    battleMods: {},
    playerMp: maxMp,
    lastTickAt: nowMs,
    expiresAt: nowMs + WORLD_COMBAT_MAX_MS,
  };
}

function maxMpForRow(row: CharacterRow): number {
  const inv = parseInventory(row.inventoryJson);
  const lvl = levelFromTotalExp(row.exp);
  const combat = computeCombatStats(
    lvl,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row)
  );
  const vit = computeVitals(lvl, row.race, row.classBranch, combat.con, combat.men);
  return effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
}

export async function toggleSelfStance(
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
    if (!char) throw new Error('no_character' satisfies ToggleSelfStanceError);
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const row = char as CharacterRow;
    if (isCharacterInBattle(row.battleJson)) {
      throw new Error('skill_in_battle' satisfies ToggleSelfStanceError);
    }

    const prof = resolveL2ProfessionForSkillsRow(row);
    const entry = resolveAnyCatalogEntry(canon, row.race, row.classBranch, prof);
    if (!entry) throw new Error('skill_unknown' satisfies ToggleSelfStanceError);
    if (entry.kind !== 'toggle') {
      throw new Error('skill_not_toggle' satisfies ToggleSelfStanceError);
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
      throw new Error('skill_not_learned' satisfies ToggleSelfStanceError);
    }

    const stance = HF_STANCE_BY_SKILL_ID[entry.l2SkillId];

    const nowMs = Date.now();
    const maxMp = maxMpForRow(row);
    const current =
      parseWorldCombatState(row.worldCombatStateJson) ??
      buildBaseWorldState(maxMp, nowMs);

    const mods: BattleBattleMods = { ...current.battleMods };

    if (stance) {
      const wasOn = !!mods[stance.flag];
      if (wasOn) {
        delete mods[stance.flag];
        if (stance.rankField) delete mods[stance.rankField];
      } else {
        (mods as Record<string, unknown>)[stance.flag] = true;
        if (stance.rankField) {
          (mods as Record<string, unknown>)[stance.rankField] = Math.max(
            1,
            Math.floor(learnedOne.level)
          );
        }
      }
    } else {
      /**
       * Расовий Fighter / Mystic toggle: фліпаємо ключ у `raceToggleRanks` за
       * `l2_<l2SkillId>`. Те саме поле потім читає
       * `raceFighterToggleStanceCombatDelta` для дельти бафу й `stanceCount`
       * для MP-дрену.
       */
      const key = `l2_${entry.l2SkillId}`;
      const prevRanks = mods.raceToggleRanks
        ? { ...mods.raceToggleRanks }
        : undefined;
      if (prevRanks && prevRanks[key] != null) {
        delete prevRanks[key];
        if (Object.keys(prevRanks).length > 0) {
          mods.raceToggleRanks = prevRanks;
        } else {
          delete mods.raceToggleRanks;
        }
      } else {
        const next = prevRanks ?? {};
        next[key] = Math.max(1, Math.floor(learnedOne.level));
        mods.raceToggleRanks = next;
      }
    }

    applyRiposteReflectToBattleMods(mods);

    const nextWorld: WorldCombatState = {
      ...current,
      battleMods: mods,
      lastTickAt: nowMs,
      expiresAt: nowMs + WORLD_COMBAT_MAX_MS,
    };

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          worldCombatStateJson: JSON.parse(
            JSON.stringify(nextWorld)
          ) as unknown as Prisma.InputJsonValue,
        } as Prisma.CharacterUpdateManyMutationInput,
      })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
