/**
 * Light Armor Mastery (skill 227) — % P. Def + flat ухилення в легкій броні.
 * P.Def % — `TEXT_RPG_HF_PASSIVE_EFFECTS`; ухилення — la2era Interlude.
 */
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';

const LIGHT_ARMOR_ROW = TEXT_RPG_HF_PASSIVE_EFFECTS.find((r) => r.l2SkillId === 227);

export const LIGHT_ARMOR_MASTERY_MAX_RANK = LIGHT_ARMOR_ROW?.maxRank ?? 50;

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
  const r = Math.max(1, Math.min(LIGHT_ARMOR_ROW.maxRank, Math.floor(rank)));
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

import { fighterPassiveHintUk } from './fighterCommonPassiveSkillDisplay.js';

export const LIGHT_ARMOR_MASTERY_HINT_UK = fighterPassiveHintUk(227)!;

/** Текст для магістра / UI на конкретному рівні скіла (лише воїни-файтери). */
export function lightArmorMasteryStatsNoteUk(rank: number): string {
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
