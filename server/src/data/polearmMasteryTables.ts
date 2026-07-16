/**
 * Polearm Mastery (skill 216) — flat P. Atk зі списом / алебардою.
 * Канон Interlude / la2era; таблиця з `TEXT_RPG_HF_PASSIVE_EFFECTS`.
 */
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';

const POLEARM_ROW = TEXT_RPG_HF_PASSIVE_EFFECTS.find((r) => r.l2SkillId === 216);

export const POLEARM_MASTERY_MAX_RANK = POLEARM_ROW?.maxRank ?? 43;

function formatFlat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function polearmMasteryPatkFlatAtRank(rank: number): number {
  if (!POLEARM_ROW) return 0;
  const r = Math.max(1, Math.min(POLEARM_ROW.maxRank, Math.floor(rank)));
  const p = POLEARM_ROW.powerByRank[r];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}

import { fighterPassiveHintUk } from './fighterCommonPassiveSkillDisplay.js';

export const POLEARM_MASTERY_HINT_UK = fighterPassiveHintUk(216)!;

/** Текст для магістра / UI на конкретному рівні скіла (лише воїни-файтери). */
export function polearmMasteryStatsNoteUk(rank: number): string {
  const flat = polearmMasteryPatkFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) {
    return 'Пасив: підвищує P. Atk зі списом або алебардою. Діє лише з древковою зброєю в руці.';
  }
  return (
    'Пасив: +' +
    formatFlat(flat) +
    ' P. Atk (flat) на рівні ' +
    lv +
    ' скіла (лише спис/алебарда). MP у бою не витрачається.'
  );
}
