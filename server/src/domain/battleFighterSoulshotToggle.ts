import { countBagQty } from '../data/inventory.js';
import {
  FIGHTER_PHYSICAL_SOULSHOT_ITEM_IDS,
} from '../data/fighterPhysicalSoulshot.js';
import { fighterSoulshotGradeForItem } from '../data/chargeShotGrades.js';
import { equippedWeaponGmGrade } from '../data/l2dopHumanFighterBattleSkills.js';
import { jsonFiniteNum } from './battleModsJson.js';
import type { BattleBattleMods, BattleJsonState } from './battleTypes.js';
import type { InventoryState } from '../data/inventory.js';

function rollSoulshotPatkMul(): number {
  const x = 1.8 + Math.random() * 0.2;
  return Math.round(x * 1000) / 1000;
}

/**
 * Тогл заряду душі в бою: увімкнути (новий множник 1.8–2.0) / вимкнути.
 * Не списує предмет — списання при успішному фіз. попаданні в `performBattleAction`.
 * Вимога Interlude: грейд заряду душі має збігатися з грейдом зброї в правій руці.
 */
export function applyFighterSoulshotToggle(args: {
  st: BattleJsonState;
  inv: InventoryState;
  log: string[];
  classBranch: string;
  itemId: number;
}): void {
  const { st, inv, log, itemId } = args;
  if (!Number.isFinite(itemId) || itemId <= 0) {
    throw new Error('battle_soulshot_bad_item');
  }
  const id = Math.floor(itemId);
  if (!FIGHTER_PHYSICAL_SOULSHOT_ITEM_IDS.has(id)) {
    throw new Error('battle_soulshot_bad_item');
  }
  const weaponGrade = equippedWeaponGmGrade(inv);
  if (!weaponGrade) {
    throw new Error('battle_soulshot_no_weapon_grade');
  }
  const shotGrade = fighterSoulshotGradeForItem(id);
  if (!shotGrade || shotGrade !== weaponGrade) {
    throw new Error('battle_soulshot_grade_mismatch');
  }

  const prev = st.battleMods;
  const bm: BattleBattleMods = prev ? { ...prev } : {};
  const activeIdRaw = bm.fighterSoulshotItemId;
  const activeId =
    typeof activeIdRaw === 'number' && Number.isFinite(activeIdRaw)
      ? Math.floor(activeIdRaw)
      : undefined;
  const activeMul = jsonFiniteNum(bm.fighterSoulshotPatkMul);
  const isOn =
    activeId === id &&
    activeMul !== undefined &&
    activeMul > 1 &&
    FIGHTER_PHYSICAL_SOULSHOT_ITEM_IDS.has(id);

  if (isOn) {
    delete bm.fighterSoulshotPatkMul;
    delete bm.fighterSoulshotItemId;
    if (Object.keys(bm).length === 0) {
      delete st.battleMods;
    } else {
      st.battleMods = bm;
    }
    log.push('Заряд душі вимкнено.');
    return;
  }

  if (countBagQty(inv, id) < 1) {
    throw new Error('battle_no_item');
  }

  bm.fighterSoulshotPatkMul = rollSoulshotPatkMul();
  bm.fighterSoulshotItemId = id;
  st.battleMods = bm;
  log.push('Заряд душі активний.');
}
