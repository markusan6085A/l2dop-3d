import type { InventoryState } from '../data/inventory.js';
import {
  fighterSoulshotGradeForItem,
  mysticSpiritshotGradeForItem,
} from '../data/chargeShotGrades.js';
import { equippedWeaponGmGrade } from '../data/l2dopHumanFighterBattleSkills.js';
import type { BattleJsonState } from './battleTypes.js';

/**
 * Хук-перевірка зарядів у бою: якщо змінили зброю, активні заряди мають
 * залишатися лише при відповідності грейду зброї та заряду.
 */
export function stripChargeShotsIfWeaponGradeMismatch(args: {
  inv: InventoryState;
  st: BattleJsonState;
  log: string[];
  classBranch: string;
}): void {
  const { inv, st, log } = args;
  const bm = st.battleMods;
  if (!bm) return;
  const weaponGrade = equippedWeaponGmGrade(inv);

  const fighterItemId =
    typeof bm.fighterSoulshotItemId === 'number' &&
    Number.isFinite(bm.fighterSoulshotItemId)
      ? Math.floor(bm.fighterSoulshotItemId)
      : undefined;
  if (fighterItemId && typeof bm.fighterSoulshotPatkMul === 'number') {
    const chargeGrade = fighterSoulshotGradeForItem(fighterItemId);
    if (!weaponGrade || !chargeGrade || chargeGrade !== weaponGrade) {
      delete bm.fighterSoulshotItemId;
      delete bm.fighterSoulshotPatkMul;
      log.push('Заряд душі вимкнено: грейд заряду не збігається з грейдом зброї.');
    }
  }

  const mysticItemId =
    typeof bm.mysticBlessedSpiritshotItemId === 'number' &&
    Number.isFinite(bm.mysticBlessedSpiritshotItemId)
      ? Math.floor(bm.mysticBlessedSpiritshotItemId)
      : undefined;
  if (
    mysticItemId &&
    typeof bm.mysticBlessedSpiritshotMatkMul === 'number'
  ) {
    const chargeGrade = mysticSpiritshotGradeForItem(mysticItemId);
    if (!weaponGrade || !chargeGrade || chargeGrade !== weaponGrade) {
      delete bm.mysticBlessedSpiritshotItemId;
      delete bm.mysticBlessedSpiritshotMatkMul;
      log.push(
        'Благословений заряд духу вимкнено: грейд заряду не збігається з грейдом зброї.'
      );
    }
  }

  if (Object.keys(bm).length === 0) {
    delete st.battleMods;
  }
}
