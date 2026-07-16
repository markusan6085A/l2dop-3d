/**
 * Light Armor Mastery (skill 227) — % P. Def + flat ухилення в легкій броні.
 * Warrior: % P.Def (`TEXT_RPG_HF_PASSIVE_EFFECTS`).
 * Rogue / Hawkeye / Treasure Hunter: flat P.Def + flat ухилення (окрема таблиця нижче).
 */
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';
import { fighterPassiveHintUk } from './fighterCommonPassiveSkillDisplay.js';

const LIGHT_ARMOR_ROW = TEXT_RPG_HF_PASSIVE_EFFECTS.find((r) => r.l2SkillId === 227);

export const LIGHT_ARMOR_MASTERY_L2_SKILL_ID = 227;
export const LIGHT_ARMOR_MASTERY_WARRIOR_MAX_RANK = LIGHT_ARMOR_ROW?.maxRank ?? 50;

/** Rogue → Hawkeye / Treasure Hunter — flat P.Def, 47 р. */
export const LIGHT_ARMOR_ROGUE_MAX_RANK = 47;

/** Flat ухилення за рангом (la2era: 1–2 → +3, 3–4 → +5, 5–50 → +6). */
export const LIGHT_ARMOR_EVASION_FLAT_BY_RANK = [
  0, 3, 3, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
] as const;

function formatPct(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function lightArmorMasteryPdefPercentAtRank(rank: number): number {
  if (!LIGHT_ARMOR_ROW) return 0;
  const r = Math.max(1, Math.min(LIGHT_ARMOR_MASTERY_WARRIOR_MAX_RANK, Math.floor(rank)));
  const p = LIGHT_ARMOR_ROW.powerByRank[r];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}

export function lightArmorMasteryEvasionFlatAtRank(rank: number): number {
  const r = Math.max(
    1,
    Math.min(LIGHT_ARMOR_EVASION_FLAT_BY_RANK.length - 1, Math.floor(rank))
  );
  return LIGHT_ARMOR_EVASION_FLAT_BY_RANK[r] ?? 0;
}

export const LIGHT_ARMOR_MASTERY_HINT_UK = fighterPassiveHintUk(227)!;

/** Текст для магістра / UI на конкретному рівні скіла (лише воїни-файтери). */
export function lightArmorMasteryStatsNoteUk(
  rank: number,
  l2Profession?: string
): string {
  if (isLightArmorMasteryRogueFlatProfession(l2Profession)) {
    return lightArmorMasteryRogueStatsNoteUk(rank);
  }
  const pct = lightArmorMasteryPdefPercentAtRank(rank);
  const eva = lightArmorMasteryEvasionFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (pct <= 0 && eva <= 0) {
    return 'Пасив: підвищує P. Def і ухилення в легкій броні. Діє лише з екіпованою легкою бронею.';
  }
  const parts: string[] = [];
  if (pct > 0) parts.push('+' + formatPct(pct) + '% P. Def');
  if (eva > 0) parts.push('+' + eva + ' ухилення');
  return (
    'Пасив: ' +
    parts.join(', ') +
    ' на рівні ' +
    lv +
    ' скіла (лише легка броня). MP у бою не витрачається.'
  );
}

/** Treasure Hunter / Adventurer: flat P.Def + ухилення в легкій броні. */
export const LIGHT_ARMOR_ROGUE_PDEF_FLAT_BY_RANK = [
  0, 1.3, 2.2, 3.2, 4.2, 5.3, 6.8, 8.4, 10.1, 11.9, 13.7, 15.7, 16.7, 17.8,
  18.8, 19.9, 21.1, 22.2, 23.4, 24.5, 25.8, 27, 28.2, 29.5, 30.8, 32.1, 33.5,
  34.8, 36.2, 37.6, 39.1, 40.5, 42, 43.5, 44.9, 46.5, 48, 49.5, 51.1, 52.7,
  54.2, 55.8, 57.4, 59.1, 60.7, 62.3, 63.9, 65.6,
] as const;

export const LIGHT_ARMOR_ROGUE_EVASION_BY_RANK = [
  0, 4, 4, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
] as const;

export const LIGHT_ARMOR_ROGUE_LEVEL_ROWS = [
  { level: 1, requiredLevel: 20, spCost: 1700 },
  { level: 2, requiredLevel: 20, spCost: 1700 },
  { level: 3, requiredLevel: 24, spCost: 2900 },
  { level: 4, requiredLevel: 24, spCost: 2900 },
  { level: 5, requiredLevel: 28, spCost: 5500 },
  { level: 6, requiredLevel: 28, spCost: 5500 },
  { level: 7, requiredLevel: 32, spCost: 9100 },
  { level: 8, requiredLevel: 32, spCost: 9100 },
  { level: 9, requiredLevel: 36, spCost: 16000 },
  { level: 10, requiredLevel: 36, spCost: 16000 },
  { level: 11, requiredLevel: 40, spCost: 12000 },
  { level: 12, requiredLevel: 40, spCost: 12000 },
  { level: 13, requiredLevel: 40, spCost: 12000 },
  { level: 14, requiredLevel: 43, spCost: 14000 },
  { level: 15, requiredLevel: 43, spCost: 14000 },
  { level: 16, requiredLevel: 43, spCost: 14000 },
  { level: 17, requiredLevel: 46, spCost: 15000 },
  { level: 18, requiredLevel: 46, spCost: 15000 },
  { level: 19, requiredLevel: 46, spCost: 15000 },
  { level: 20, requiredLevel: 49, spCost: 30000 },
  { level: 21, requiredLevel: 49, spCost: 30000 },
  { level: 22, requiredLevel: 49, spCost: 30000 },
  { level: 23, requiredLevel: 52, spCost: 38000 },
  { level: 24, requiredLevel: 52, spCost: 38000 },
  { level: 25, requiredLevel: 52, spCost: 38000 },
  { level: 26, requiredLevel: 55, spCost: 56000 },
  { level: 27, requiredLevel: 55, spCost: 56000 },
  { level: 28, requiredLevel: 55, spCost: 56000 },
  { level: 29, requiredLevel: 58, spCost: 67000 },
  { level: 30, requiredLevel: 58, spCost: 67000 },
  { level: 31, requiredLevel: 58, spCost: 67000 },
  { level: 32, requiredLevel: 60, spCost: 160000 },
  { level: 33, requiredLevel: 60, spCost: 160000 },
  { level: 34, requiredLevel: 62, spCost: 220000 },
  { level: 35, requiredLevel: 62, spCost: 220000 },
  { level: 36, requiredLevel: 64, spCost: 220000 },
  { level: 37, requiredLevel: 64, spCost: 220000 },
  { level: 38, requiredLevel: 66, spCost: 390000 },
  { level: 39, requiredLevel: 66, spCost: 390000 },
  { level: 40, requiredLevel: 68, spCost: 390000 },
  { level: 41, requiredLevel: 68, spCost: 390000 },
  { level: 42, requiredLevel: 70, spCost: 520000 },
  { level: 43, requiredLevel: 70, spCost: 520000 },
  { level: 44, requiredLevel: 72, spCost: 680000 },
  { level: 45, requiredLevel: 72, spCost: 680000 },
  { level: 46, requiredLevel: 74, spCost: 1300000 },
  { level: 47, requiredLevel: 74, spCost: 1300000 },
] as const;

export const LIGHT_ARMOR_ROGUE_HINT_UK =
  'Пасив: +P.Def (flat) і ухилення в легкій броні. 1 р. — +1.3 P.Def / +4 ухил. (20 лв), ' +
  '47 р. — +65.6 / +7 (74 лв). Rogue → Hawkeye / Treasure Hunter. MP у бою не витрачається.';

export const LIGHT_ARMOR_CATALOG_HINT_UK =
  'Пасив: бонуси в легкій броні. Rogue / Hawkeye / Treasure Hunter — flat +P.Def і ухилення (47 р., з 20 лв). ' +
  'Warrior — +% P.Def (50 р.). MP у бою не витрачається.';

export function isLightArmorMasteryRogueFlatProfession(
  l2Profession: string | undefined
): boolean {
  const p = String(l2Profession || '').trim();
  return (
    p === 'human_rogue' ||
    p === 'human_treasure_hunter' ||
    p === 'human_adventurer' ||
    p === 'human_hawkeye' ||
    p === 'human_sagittarius'
  );
}

export function lightArmorMasteryRogueFlatPdefAtRank(rank: number): number {
  const r = Math.max(1, Math.min(LIGHT_ARMOR_ROGUE_MAX_RANK, Math.floor(rank)));
  return LIGHT_ARMOR_ROGUE_PDEF_FLAT_BY_RANK[r] ?? 0;
}

export function lightArmorMasteryRogueEvasionFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(LIGHT_ARMOR_ROGUE_MAX_RANK, Math.floor(rank)));
  return LIGHT_ARMOR_ROGUE_EVASION_BY_RANK[r] ?? 0;
}

export function lightArmorMasteryRogueRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return LIGHT_ARMOR_ROGUE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function lightArmorMasteryRogueSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = LIGHT_ARMOR_ROGUE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function lightArmorMasteryRogueStatsNoteUk(rank: number): string {
  const pdef = lightArmorMasteryRogueFlatPdefAtRank(rank);
  const eva = lightArmorMasteryRogueEvasionFlatAtRank(rank);
  const lv = Math.max(1, Math.min(LIGHT_ARMOR_ROGUE_MAX_RANK, Math.floor(rank)));
  const reqLv = LIGHT_ARMOR_ROGUE_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  if (pdef <= 0 && eva <= 0) {
    return LIGHT_ARMOR_ROGUE_HINT_UK;
  }
  const parts: string[] = [];
  if (pdef > 0) parts.push('+' + formatPct(pdef) + ' P.Def');
  if (eva > 0) parts.push('+' + eva + ' ухилення');
  return (
    'Пасив: ' +
    parts.join(', ') +
    ' на р. ' +
    lv +
    ' скіла' +
    reqPart +
    '. Лише легка броня. MP у бою не витрачається.'
  );
}

export function lightArmorMasteryMaxRankForProfession(
  l2Profession: string | undefined
): number {
  if (isLightArmorMasteryRogueFlatProfession(l2Profession)) {
    return LIGHT_ARMOR_ROGUE_MAX_RANK;
  }
  return LIGHT_ARMOR_MASTERY_WARRIOR_MAX_RANK;
}
