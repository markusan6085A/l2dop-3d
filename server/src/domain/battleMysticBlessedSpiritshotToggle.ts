import { countBagQty } from '../data/inventory.js';
import { MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS } from '../data/mysticBlessedSpiritshot.js';
import { mysticSpiritshotGradeForItem } from '../data/chargeShotGrades.js';
import { equippedWeaponGmGrade } from '../data/l2dopHumanFighterBattleSkills.js';
import { jsonFiniteNum } from './battleModsJson.js';
import type { BattleBattleMods, BattleJsonState } from './battleTypes.js';
import type { InventoryState } from '../data/inventory.js';

function rollBlessedSpiritshotMatkMul(): number {
  const x = 2.6 + Math.random() * 0.4;
  return Math.round(x * 1000) / 1000;
}

/**
 * Тогл благословенного заряду духу в бої: ×2.6–3.0 до M.Atk для магічних кидків.
 * Списання патронів — при успішному попаданні (автоатака чи скіл), по 1 за хід.
 * Вимога Interlude: грейд blessed spiritshot має збігатися з грейдом зброї.
 */
export function applyMysticBlessedSpiritshotToggle(args: {
  st: BattleJsonState;
  inv: InventoryState;
  log: string[];
  classBranch: string;
  itemId: number;
}): void {
  const { st, inv, log, itemId } = args;
  if (!Number.isFinite(itemId) || itemId <= 0) {
    throw new Error('mystic_spiritshot_bad_item');
  }
  const id = Math.floor(itemId);
  if (!MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS.has(id)) {
    throw new Error('mystic_spiritshot_bad_item');
  }
  const weaponGrade = equippedWeaponGmGrade(inv);
  if (!weaponGrade) {
    throw new Error('mystic_spiritshot_no_weapon_grade');
  }
  const shotGrade = mysticSpiritshotGradeForItem(id);
  if (!shotGrade || shotGrade !== weaponGrade) {
    throw new Error('mystic_spiritshot_grade_mismatch');
  }

  const prev = st.battleMods;
  const bm: BattleBattleMods = prev ? { ...prev } : {};
  const activeIdRaw = bm.mysticBlessedSpiritshotItemId;
  const activeId =
    typeof activeIdRaw === 'number' && Number.isFinite(activeIdRaw)
      ? Math.floor(activeIdRaw)
      : undefined;
  const activeMul = jsonFiniteNum(bm.mysticBlessedSpiritshotMatkMul);
  const isOn =
    activeId === id &&
    activeMul !== undefined &&
    activeMul > 1 &&
    MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS.has(id);

  if (isOn) {
    delete bm.mysticBlessedSpiritshotMatkMul;
    delete bm.mysticBlessedSpiritshotItemId;
    if (Object.keys(bm).length === 0) {
      delete st.battleMods;
    } else {
      st.battleMods = bm;
    }
    log.push('Благословений заряд духу вимкнено.');
    return;
  }

  if (countBagQty(inv, id) < 1) {
    throw new Error('battle_no_item');
  }

  bm.mysticBlessedSpiritshotMatkMul = rollBlessedSpiritshotMatkMul();
  bm.mysticBlessedSpiritshotItemId = id;
  st.battleMods = bm;
  log.push('Благословений заряд духу активний.');
}
