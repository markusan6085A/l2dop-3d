/**
 * Heavy Armor Mastery — Interlude.
 *
 * - **232** (Knight / Temple / Shillien): flat +P.Def у важкій броні, 52 р., 74 лв.
 * - **231** (Warrior / Warlord / Orc / Dwarf …): % +P.Def у важкій броні, 50 р.
 */
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';
import { fighterPassiveHintUk } from './fighterCommonPassiveSkillDisplay.js';

export const HEAVY_ARMOR_KNIGHT_L2_SKILL_ID = 232;
export const HEAVY_ARMOR_WARRIOR_L2_SKILL_ID = 231;
export const HEAVY_ARMOR_KNIGHT_BATTLE_ID = 'l2_232';
export const HEAVY_ARMOR_KNIGHT_MAX_RANK = 52;

/** Flat +P.Def (лише skill 232, Knight-гілки). */
export const HEAVY_ARMOR_KNIGHT_PDEF_FLAT_BY_RANK = [
  0, 17.7, 19.1, 20.5, 23.5, 25, 26.7, 30, 31.8, 33.6, 37.4, 39.3, 41.3, 45.6,
  47.7, 50, 54.6, 57.1, 59.5, 62.1, 64.6, 67.3, 70, 72.7, 75.5, 78.4, 81.3,
  84.3, 87.3, 90.4, 93.5, 96.7, 99.9, 103.2, 106.5, 109.9, 113.3, 116.8, 120.3,
  123.8, 127.4, 131, 134.7, 138.4, 142.1, 145.8, 149.6, 153.4, 157.2, 161,
  164.9, 168.7, 172.6,
] as const;

export const HEAVY_ARMOR_KNIGHT_LEVEL_ROWS = [
  { level: 1, requiredLevel: 20, spCost: 1500 },
  { level: 2, requiredLevel: 20, spCost: 1500 },
  { level: 3, requiredLevel: 20, spCost: 1500 },
  { level: 4, requiredLevel: 24, spCost: 3300 },
  { level: 5, requiredLevel: 24, spCost: 3300 },
  { level: 6, requiredLevel: 24, spCost: 3300 },
  { level: 7, requiredLevel: 28, spCost: 4000 },
  { level: 8, requiredLevel: 28, spCost: 4000 },
  { level: 9, requiredLevel: 28, spCost: 4000 },
  { level: 10, requiredLevel: 32, spCost: 8300 },
  { level: 11, requiredLevel: 32, spCost: 8300 },
  { level: 12, requiredLevel: 32, spCost: 8300 },
  { level: 13, requiredLevel: 36, spCost: 13000 },
  { level: 14, requiredLevel: 36, spCost: 13000 },
  { level: 15, requiredLevel: 36, spCost: 13000 },
  { level: 16, requiredLevel: 40, spCost: 14000 },
  { level: 17, requiredLevel: 40, spCost: 14000 },
  { level: 18, requiredLevel: 40, spCost: 14000 },
  { level: 19, requiredLevel: 43, spCost: 14000 },
  { level: 20, requiredLevel: 43, spCost: 14000 },
  { level: 21, requiredLevel: 43, spCost: 14000 },
  { level: 22, requiredLevel: 46, spCost: 18000 },
  { level: 23, requiredLevel: 46, spCost: 18000 },
  { level: 24, requiredLevel: 46, spCost: 18000 },
  { level: 25, requiredLevel: 49, spCost: 27000 },
  { level: 26, requiredLevel: 49, spCost: 27000 },
  { level: 27, requiredLevel: 49, spCost: 27000 },
  { level: 28, requiredLevel: 52, spCost: 42000 },
  { level: 29, requiredLevel: 52, spCost: 42000 },
  { level: 30, requiredLevel: 52, spCost: 42000 },
  { level: 31, requiredLevel: 55, spCost: 49000 },
  { level: 32, requiredLevel: 55, spCost: 49000 },
  { level: 33, requiredLevel: 55, spCost: 49000 },
  { level: 34, requiredLevel: 58, spCost: 67000 },
  { level: 35, requiredLevel: 58, spCost: 67000 },
  { level: 36, requiredLevel: 58, spCost: 67000 },
  { level: 37, requiredLevel: 60, spCost: 130000 },
  { level: 38, requiredLevel: 60, spCost: 130000 },
  { level: 39, requiredLevel: 62, spCost: 170000 },
  { level: 40, requiredLevel: 62, spCost: 170000 },
  { level: 41, requiredLevel: 64, spCost: 190000 },
  { level: 42, requiredLevel: 64, spCost: 190000 },
  { level: 43, requiredLevel: 66, spCost: 290000 },
  { level: 44, requiredLevel: 66, spCost: 290000 },
  { level: 45, requiredLevel: 68, spCost: 330000 },
  { level: 46, requiredLevel: 68, spCost: 330000 },
  { level: 47, requiredLevel: 70, spCost: 390000 },
  { level: 48, requiredLevel: 70, spCost: 390000 },
  { level: 49, requiredLevel: 72, spCost: 580000 },
  { level: 50, requiredLevel: 72, spCost: 580000 },
  { level: 51, requiredLevel: 74, spCost: 960000 },
  { level: 52, requiredLevel: 74, spCost: 960000 },
] as const;

export const HEAVY_ARMOR_KNIGHT_HINT_UK =
  'Пасив: +P.Def (flat) у важкій броні. 1 р. — +17.7 (20 лв), 52 р. — +172.6 (74 лв). ' +
  'Діє лише з екіпованою важкою бронею. MP у бою не витрачається.';

const WARRIOR_PERCENT_ROW = TEXT_RPG_HF_PASSIVE_EFFECTS.find(
  (r) => r.l2SkillId === HEAVY_ARMOR_WARRIOR_L2_SKILL_ID
);

export const HEAVY_ARMOR_WARRIOR_MAX_RANK = WARRIOR_PERCENT_ROW?.maxRank ?? 50;

function formatNum(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function heavyArmorKnightFlatPdefAtRank(rank: number): number {
  const r = Math.max(
    1,
    Math.min(HEAVY_ARMOR_KNIGHT_MAX_RANK, Math.floor(rank))
  );
  return HEAVY_ARMOR_KNIGHT_PDEF_FLAT_BY_RANK[r] ?? 0;
}

export function heavyArmorWarriorPdefPercentAtRank(rank: number): number {
  if (!WARRIOR_PERCENT_ROW) return 0;
  const r = Math.max(
    1,
    Math.min(HEAVY_ARMOR_WARRIOR_MAX_RANK, Math.floor(rank))
  );
  const p = WARRIOR_PERCENT_ROW.powerByRank[r];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}

/** @deprecated alias — knight flat (232). */
export function heavyArmorMasteryPdefPercentAtRank(rank: number): number {
  return heavyArmorWarriorPdefPercentAtRank(rank);
}

export function heavyArmorKnightRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return HEAVY_ARMOR_KNIGHT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function heavyArmorKnightSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = HEAVY_ARMOR_KNIGHT_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function heavyArmorKnightStatsNoteUk(rank: number): string {
  const flat = heavyArmorKnightFlatPdefAtRank(rank);
  const lv = Math.max(1, Math.min(HEAVY_ARMOR_KNIGHT_MAX_RANK, Math.floor(rank)));
  const reqLv = HEAVY_ARMOR_KNIGHT_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  if (flat <= 0) return HEAVY_ARMOR_KNIGHT_HINT_UK;
  return (
    'Пасив: +' +
    formatNum(flat) +
    ' P.Def (flat) на р. ' +
    lv +
    ' скіла' +
    reqPart +
    '. Лише важка броня. MP у бою не витрачається.'
  );
}

export function heavyArmorWarriorStatsNoteUk(rank: number): string {
  const pct = heavyArmorWarriorPdefPercentAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (pct <= 0) {
    return (
      fighterPassiveHintUk(HEAVY_ARMOR_WARRIOR_L2_SKILL_ID) ??
      'Пасив: +P.Def (%) у важкій броні.'
    );
  }
  return (
    'Пасив: +' +
    formatNum(pct) +
    '% P.Def на р. ' +
    lv +
    ' скіла (лише важка броня). MP у бою не витрачається.'
  );
}

/** Human catalog l2_231 (warrior %) або l2_232 (knight flat). */
export function heavyArmorMasteryStatsNoteUk(
  rank: number,
  l2SkillId: number = HEAVY_ARMOR_WARRIOR_L2_SKILL_ID
): string {
  if (l2SkillId === HEAVY_ARMOR_KNIGHT_L2_SKILL_ID) {
    return heavyArmorKnightStatsNoteUk(rank);
  }
  return heavyArmorWarriorStatsNoteUk(rank);
}

/** Race-каталоги лицаря з l2SkillId 231, але flat pDef — той самий ефект, що 232. */
export function isHeavyArmorKnightFlatCatalogSkill(
  l2SkillId: number,
  effects: ReadonlyArray<{ stat: string; mode: string }>
): boolean {
  if (l2SkillId === HEAVY_ARMOR_KNIGHT_L2_SKILL_ID) return true;
  if (l2SkillId !== HEAVY_ARMOR_WARRIOR_L2_SKILL_ID) return false;
  return effects.some((fx) => fx.stat === 'pDef' && fx.mode === 'flat');
}
