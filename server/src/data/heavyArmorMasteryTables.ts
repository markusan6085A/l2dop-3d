/**
 * Heavy Armor Mastery (skill 231) — % P. Def у важкій броні.
 * Канон Interlude / la2era; таблиця з `TEXT_RPG_HF_PASSIVE_EFFECTS`.
 */
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';

const HEAVY_ARMOR_ROW = TEXT_RPG_HF_PASSIVE_EFFECTS.find((r) => r.l2SkillId === 231);

export const HEAVY_ARMOR_MASTERY_MAX_RANK = HEAVY_ARMOR_ROW?.maxRank ?? 50;

function formatPct(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function heavyArmorMasteryPdefPercentAtRank(rank: number): number {
  if (!HEAVY_ARMOR_ROW) return 0;
  const r = Math.max(1, Math.min(HEAVY_ARMOR_ROW.maxRank, Math.floor(rank)));
  const p = HEAVY_ARMOR_ROW.powerByRank[r];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}

export const HEAVY_ARMOR_MASTERY_HINT_UK =
  'Пасив: підвищує P. Def (%) у важкій броні (1 р. — +1.9%, 50 р. — +79.3%).';

/** Текст для магістра / UI на конкретному рівні скіла (лише воїни-файтери). */
export function heavyArmorMasteryStatsNoteUk(rank: number): string {
  const pct = heavyArmorMasteryPdefPercentAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (pct <= 0) {
    return 'Пасив: підвищує P. Def у важкій броні. Діє лише з екіпованою важкою бронею.';
  }
  return (
    'Пасив: +' +
    formatPct(pct) +
    '% P. Def на рівні ' +
    lv +
    ' скіла (лише важка броня). MP у бою не витрачається.'
  );
}
