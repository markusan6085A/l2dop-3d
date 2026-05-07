/**
 * Список селф-бафів, доступних поточному персонажу для касту **поза боєм**
 * (`POST /character/skills/cast`). UI-агностичний: сервер віддає все, що треба для рендеру
 * (назва, іконка, MP, cooldown, чи активний, скільки лишилося).
 *
 * Критерій «скіл-селф-баф у MVP»:
 *   1) Є в каталозі для цього персонажа (`resolveAnyCatalogEntry` —
 *      HF / race-fighter / race-mystic, з перевіркою професії).
 *   2) Вивчено (level ≥ 1) у `skillsLearnedJson` (відфільтровано раніше через
 *      `filterLearnedSkillEntriesForCharacter`).
 *   3) Описана тривалість у `l2dopBuffDurations.ts` (інакше поза боєм не кастимо — без вигаданих чисел).
 *   4) Є MP cost у `l2dopXmlMpPower(skillId, level)`.
 *   5) `kind === 'battle'` — toggle/passive у self-cast не входять.
 */

import { skillIconUrlForClient } from './humanFighterSkillCatalog.js';
import type { LearnedSkillEntry } from './humanFighterSkillCatalog.types.js';
import {
  buffDurationSecForSkillId,
} from './l2dopBuffDurations.js';
import {
  cooldownSecForSkillId,
  parseSkillCooldowns,
  skillRemainingSec,
} from './skillCooldowns.js';
import { l2dopXmlMpPower } from './l2dopXmlSkillLevels.lookup.js';
import {
  persistableActiveBuffsFromJson,
} from './l2dopActiveBuffs.js';
import { resolveAnyCatalogEntry } from './selfBuffResolver.js';

export interface CastableSelfBuffEntry {
  battleId: string;
  l2SkillId: number;
  skillLevel: number;
  nameUk: string;
  iconUrl: string;
  mpCost: number;
  durationSec: number;
  cooldownSec: number | null;
  readyRemainingSec: number;
  active: boolean;
  activeRemainingSec: number | null;
}

export function buildCastableSelfBuffs(params: {
  learned: readonly LearnedSkillEntry[];
  l2Profession: string;
  race: string;
  classBranch: string;
  activeBuffsJson: unknown;
  skillCooldownsJson: unknown;
  nowMs: number;
}): CastableSelfBuffEntry[] {
  const {
    learned,
    l2Profession,
    race,
    classBranch,
    activeBuffsJson,
    skillCooldownsJson,
    nowMs,
  } = params;

  const activeById = new Map<number, { level: number; expiresAt?: number }>();
  for (const b of persistableActiveBuffsFromJson(activeBuffsJson, nowMs)) {
    activeById.set(b.skillId, { level: b.level, expiresAt: b.expiresAt });
  }

  const cooldowns = parseSkillCooldowns(skillCooldownsJson, nowMs);

  const out: CastableSelfBuffEntry[] = [];
  for (const le of learned) {
    if (le.level < 1) continue;
    const entry = resolveAnyCatalogEntry(
      le.battleId,
      race,
      classBranch,
      l2Profession
    );
    if (!entry) continue;
    /** Self-cast — лише активні (battle). Toggle потребує окремого toggle/off шляху,
     * passive — апроксимується автоматично. */
    if (entry.kind !== 'battle') continue;
    const durSec = buffDurationSecForSkillId(entry.l2SkillId);
    if (durSec === undefined) continue;
    /**
     * Sonic-скіли, що потребують накопичених Sonic Focus зарядів (442 Sonic Guard,
     * …), не мають сенсу поза боєм — у світовому стані зарядів немає доступу до
     * `SONIC_CHARGE_COST_BY_SKILL_ID` у цьому шляху. Sonic Move (451) чарджів не
     * потребує, тож його залишаємо.
     */
    if (entry.l2SkillId === 442) continue;
    const mpRow = l2dopXmlMpPower(entry.l2SkillId, le.level);
    if (!mpRow || !Number.isFinite(mpRow.mp) || mpRow.mp < 0) continue;

    const cdSec = entry.cooldownSec ?? cooldownSecForSkillId(entry.l2SkillId) ?? null;
    const readyRem = skillRemainingSec(cooldowns, entry.l2SkillId, nowMs);
    const act = activeById.get(entry.l2SkillId);
    const activeRem =
      act?.expiresAt !== undefined
        ? Math.max(0, Math.ceil((act.expiresAt - nowMs) / 1000))
        : act
          ? null
          : null;

    out.push({
      battleId: entry.battleId,
      l2SkillId: entry.l2SkillId,
      skillLevel: le.level,
      nameUk: entry.nameUk,
      iconUrl: skillIconUrlForClient(entry.l2SkillId),
      mpCost: Math.floor(mpRow.mp),
      durationSec: durSec,
      cooldownSec: cdSec,
      readyRemainingSec: readyRem,
      active: !!act,
      activeRemainingSec: activeRem,
    });
  }

  out.sort((a, b) => a.nameUk.localeCompare(b.nameUk, 'uk'));
  return out;
}
