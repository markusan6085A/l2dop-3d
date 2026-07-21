/**
 * Regression: Buffalo's Horn (308) is 1H blunt — only eq.l1, never duplicate in eq.l2.
 * npm run test:buffalo-horn-equip
 */
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
  parseInventoryRaw,
  unequipSlot,
} from '../src/data/inventory.js';
import {
  itemBlocksShieldHintsForClient,
  itemBlocksShieldSlot,
} from '../src/data/l2dopTwoHandedWeapon.js';
import { NG_WEAPON_BY_ITEM_ID } from '../src/data/ngWeaponCatalog.js';

const BUFFALO_ID = 308;
const SHIELD_ID = 628;
const SPIKE_GLOVE_ID = 253;

function eqItemId(slotVal: unknown): number | null {
  if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
  if (slotVal && typeof slotVal === 'object' && 'itemId' in slotVal) {
    const n = Number((slotVal as { itemId: unknown }).itemId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function expectEq<T>(label: string, actual: T, expected: T, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function expectFalse(label: string, value: boolean, errors: string[]): void {
  if (value) errors.push(`${label}: expected false`);
}

function expectTrue(label: string, value: boolean, errors: string[]): void {
  if (!value) errors.push(`${label}: expected true`);
}

function main(): void {
  const errors: string[] = [];
  const canon = NG_WEAPON_BY_ITEM_ID.get(BUFFALO_ID);
  const catalog = ITEM_CATALOG[BUFFALO_ID];
  const hints = itemBlocksShieldHintsForClient();

  expectEq('canon weaponType', canon?.weaponType, 'blunt', errors);
  expectEq('catalog weaponType', catalog?.weaponType, 'blunt', errors);
  expectEq('canon blocksShield', canon?.blocksShield, false, errors);
  expectEq('catalog atkSpd', catalog?.atkSpd, 379, errors);
  expectFalse(
    'itemBlocksShieldSlot(308)',
    itemBlocksShieldSlot(BUFFALO_ID, catalog?.weaponType),
    errors,
  );
  expectEq('client shield hint', hints[BUFFALO_ID], false, errors);
  expectFalse(
    'stale fist weaponType must not block shield',
    itemBlocksShieldSlot(BUFFALO_ID, 'fist'),
    errors,
  );

  // Scenario 1: empty slots → equip Buffalo → l1 only
  let inv1 = emptyInventory();
  inv1 = addItemToBag(inv1, BUFFALO_ID, 1);
  inv1 = equipFromBag(inv1, BUFFALO_ID, 0);
  expectEq('S1 equip l1', eqItemId(inv1.eq.l1), BUFFALO_ID, errors);
  expectEq('S1 equip l2', eqItemId(inv1.eq.l2), null, errors);

  // Scenario 2: shield in l2 → equip Buffalo → shield stays
  let inv2 = emptyInventory();
  inv2 = addItemToBag(inv2, SHIELD_ID, 1);
  inv2 = addItemToBag(inv2, BUFFALO_ID, 1);
  inv2 = equipFromBag(inv2, SHIELD_ID, 0);
  inv2 = equipFromBag(inv2, BUFFALO_ID, 0);
  expectEq('S2 equip l1', eqItemId(inv2.eq.l1), BUFFALO_ID, errors);
  expectEq('S2 equip l2 shield', eqItemId(inv2.eq.l2), SHIELD_ID, errors);
  expectFalse('S2 shield not in bag', inv2.stacks.some((s) => s.itemId === SHIELD_ID), errors);

  // Scenario 3: corrupt l1=308, l2=308 → parse → l2 cleared
  const corrupt = parseInventoryRaw({
    stacks: [],
    eq: { l1: BUFFALO_ID, l2: BUFFALO_ID },
  });
  expectEq('S3 parse l1', eqItemId(corrupt.eq.l1), BUFFALO_ID, errors);
  expectEq('S3 parse l2', eqItemId(corrupt.eq.l2), null, errors);
  expectFalse(
    'S3 no duplicate weapon in bag',
    corrupt.stacks.some((s) => s.itemId === BUFFALO_ID),
    errors,
  );

  // Scenario 4: l1=308, l2=shield → parse → both kept
  const mixed = parseInventoryRaw({
    stacks: [],
    eq: { l1: BUFFALO_ID, l2: SHIELD_ID },
  });
  expectEq('S4 parse l1', eqItemId(mixed.eq.l1), BUFFALO_ID, errors);
  expectEq('S4 parse l2 shield', eqItemId(mixed.eq.l2), SHIELD_ID, errors);

  // Scenario 5: unequip Buffalo → only l1 cleared, shield stays
  let inv5 = emptyInventory();
  inv5 = addItemToBag(inv5, SHIELD_ID, 1);
  inv5 = addItemToBag(inv5, BUFFALO_ID, 1);
  inv5 = equipFromBag(inv5, SHIELD_ID, 0);
  inv5 = equipFromBag(inv5, BUFFALO_ID, 0);
  inv5 = unequipSlot(inv5, 'l1');
  expectEq('S5 unequip l1', eqItemId(inv5.eq.l1), null, errors);
  expectEq('S5 unequip l2 shield', eqItemId(inv5.eq.l2), SHIELD_ID, errors);
  expectTrue(
    'S5 Buffalo returned to bag',
    inv5.stacks.some((s) => s.itemId === BUFFALO_ID),
    errors,
  );

  // Scenario 6: Spike Gloves still 2H, block shield
  expectEq('S6 Spike Glove fist', ITEM_CATALOG[SPIKE_GLOVE_ID]?.weaponType, 'fist', errors);
  expectTrue(
    'S6 Spike Glove blocks shield',
    itemBlocksShieldSlot(SPIKE_GLOVE_ID, 'fist'),
    errors,
  );
  let inv6 = emptyInventory();
  inv6 = addItemToBag(inv6, SHIELD_ID, 1);
  inv6 = addItemToBag(inv6, SPIKE_GLOVE_ID, 1);
  inv6 = equipFromBag(inv6, SHIELD_ID, 0);
  inv6 = equipFromBag(inv6, SPIKE_GLOVE_ID, 0);
  expectEq('S6 equip l1', eqItemId(inv6.eq.l1), SPIKE_GLOVE_ID, errors);
  expectEq('S6 equip l2 cleared', eqItemId(inv6.eq.l2), null, errors);
  expectTrue(
    'S6 shield returned to bag',
    inv6.stacks.some((s) => s.itemId === SHIELD_ID),
    errors,
  );

  if (errors.length > 0) {
    console.error(
      "Buffalo's Horn equip FAILED:\n" + errors.map((e) => '  - ' + e).join('\n'),
    );
    process.exit(1);
  }
  console.log("Buffalo's Horn equip OK (6 scenarios)");
}

main();
