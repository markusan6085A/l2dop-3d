/**
 * Accuracy (skill 256) — Human Rogue toggle-аура.
 * +Accuracy flat, MP при вмиканні та постійна витрата MP.
 */
export const ACCURACY_STANCE_L2_SKILL_ID = 256;
export const ACCURACY_STANCE_BATTLE_ID = 'l2_256';
export const ACCURACY_STANCE_MAX_RANK = 1;
export const ACCURACY_STANCE_MP_ACTIVATION = 1;
/** ~0.2 MP за такт (сек) поки аура активна. */
export const ACCURACY_STANCE_MP_DRAIN_PER_SEC = 0.2;
export const ACCURACY_STANCE_REQUIRED_LEVEL = 24;
export const ACCURACY_STANCE_SP_COST = 5_900;
export const ACCURACY_STANCE_ACCURACY_FLAT = 3;

export const ACCURACY_STANCE_HINT_UK =
  'Toggle-аура: +3 Accuracy, поки увімкнено. Rogue, 24 лв. ' +
  'MP ' +
  ACCURACY_STANCE_MP_ACTIVATION +
  ' при вмиканні, ~' +
  ACCURACY_STANCE_MP_DRAIN_PER_SEC +
  ' MP/с. Натисни ще раз — вимкнути.';

export function accuracyStanceFlatAtRank(_rank: number): number {
  return ACCURACY_STANCE_ACCURACY_FLAT;
}

export function accuracyStanceRequiredLevelAtRank(_rank: number): number {
  return ACCURACY_STANCE_REQUIRED_LEVEL;
}

export function accuracyStanceSpCostAtRank(_rank: number): number | undefined {
  return ACCURACY_STANCE_SP_COST;
}

export function accuracyStanceStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(ACCURACY_STANCE_MAX_RANK, Math.floor(rank)));
  return (
    'Toggle-аура: +' +
    accuracyStanceFlatAtRank(r) +
    ' Accuracy на р. ' +
    r +
    ' (Rogue, ' +
    ACCURACY_STANCE_REQUIRED_LEVEL +
    ' лв). MP ' +
    ACCURACY_STANCE_MP_ACTIVATION +
    ' при вмиканні, ~' +
    ACCURACY_STANCE_MP_DRAIN_PER_SEC +
    ' MP/с. Перемикач у бою та поза боєм.'
  );
}
