/**
 * Regression: Elysian (164) is 1H blunt and keeps shield in eq.l2.
 * Control: Dragon Slayer / Sword of Ipos still block shield.
 * npm run test:elysian-equip-shield
 */
import { A_WEAPON_BY_ITEM_ID } from '../src/data/aWeaponCatalog.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
  LEGACY_ELYSIAN_BOW_ITEM_ID,
  parseInventoryRaw,
  remapLegacyElysianItemId,
} from '../src/data/inventory.js';
import {
  itemBlocksShieldHintsForClient,
  itemBlocksShieldSlot,
} from '../src/data/l2dopTwoHandedWeapon.js';

const ELYSIAN_ID = 164;
const SHIELD_ID = 628;
const DRAGON_SLAYER_ID = 900211;
const SWORD_OF_IPOS_ID = 900219;

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

function expectTrue(label: string, value: boolean, errors: string[]): void {
  if (!value) errors.push(`${label}: expected true`);
}

function expectFalse(label: string, value: boolean, errors: string[]): void {
  if (value) errors.push(`${label}: expected false`);
}

function main(): void {
  const errors: string[] = [];
  const canon = A_WEAPON_BY_ITEM_ID.get(ELYSIAN_ID);
  const catalog = ITEM_CATALOG[ELYSIAN_ID];
  const hints = itemBlocksShieldHintsForClient();

  expectEq('canon weaponType', canon?.weaponType, 'blunt', errors);
  expectEq('catalog weaponType', catalog?.weaponType, 'blunt', errors);
  expectEq('catalog atkSpd', catalog?.atkSpd, 379, errors);
  expectEq('canon blocksShield', canon?.blocksShield, false, errors);
  expectFalse(
    'itemBlocksShieldSlot(164)',
    itemBlocksShieldSlot(ELYSIAN_ID, catalog?.weaponType),
    errors,
  );
  expectEq('client shield hint', hints[ELYSIAN_ID], false, errors);
  expectFalse(
    'canon blocksShield overrides stale bigblunt weaponType',
    itemBlocksShieldSlot(ELYSIAN_ID, 'bigblunt'),
    errors,
  );
  expectEq(
    'legacy elysian remap',
    remapLegacyElysianItemId(LEGACY_ELYSIAN_BOW_ITEM_ID),
    ELYSIAN_ID,
    errors,
  );

  const legacyReload = parseInventoryRaw({
    stacks: [{ itemId: LEGACY_ELYSIAN_BOW_ITEM_ID, qty: 1 }],
    eq: { l1: LEGACY_ELYSIAN_BOW_ITEM_ID, l2: SHIELD_ID },
  });
  expectEq('legacy reload l1', eqItemId(legacyReload.eq.l1), ELYSIAN_ID, errors);
  expectEq('legacy reload l2', eqItemId(legacyReload.eq.l2), SHIELD_ID, errors);
  expectFalse(
    'legacy reload keeps shield with Elysian',
    legacyReload.stacks.some((s) => s.itemId === SHIELD_ID),
    errors,
  );

  let inv = emptyInventory();
  inv = addItemToBag(inv, SHIELD_ID, 1);
  inv = addItemToBag(inv, ELYSIAN_ID, 1);
  inv = equipFromBag(inv, SHIELD_ID, 0);
  inv = equipFromBag(inv, ELYSIAN_ID, 0);

  expectEq('eq.l1 Elysian', eqItemId(inv.eq.l1), ELYSIAN_ID, errors);
  expectEq('eq.l2 shield', eqItemId(inv.eq.l2), SHIELD_ID, errors);
  expectFalse('shield returned to bag', inv.stacks.some((s) => s.itemId === SHIELD_ID), errors);
  expectFalse('Elysian duplicated in eq.l2', eqItemId(inv.eq.l2) === ELYSIAN_ID, errors);

  const rawReload = parseInventoryRaw(inv);
  expectEq('reload eq.l1', eqItemId(rawReload.eq.l1), ELYSIAN_ID, errors);
  expectEq('reload eq.l2', eqItemId(rawReload.eq.l2), SHIELD_ID, errors);

  let inv2h = emptyInventory();
  inv2h = addItemToBag(inv2h, SHIELD_ID, 1);
  inv2h = addItemToBag(inv2h, DRAGON_SLAYER_ID, 1);
  inv2h = equipFromBag(inv2h, SHIELD_ID, 0);
  inv2h = equipFromBag(inv2h, DRAGON_SLAYER_ID, 0);
  expectTrue(
    'Dragon Slayer blocks shield',
    itemBlocksShieldSlot(DRAGON_SLAYER_ID, ITEM_CATALOG[DRAGON_SLAYER_ID]?.weaponType),
    errors,
  );
  expectEq('Dragon Slayer eq.l1', eqItemId(inv2h.eq.l1), DRAGON_SLAYER_ID, errors);
  expectEq('Dragon Slayer clears eq.l2', eqItemId(inv2h.eq.l2), null, errors);
  expectTrue(
    'Dragon Slayer returns shield to bag',
    inv2h.stacks.some((s) => s.itemId === SHIELD_ID),
    errors,
  );

  let invIpos = emptyInventory();
  invIpos = addItemToBag(invIpos, SHIELD_ID, 1);
  invIpos = addItemToBag(invIpos, SWORD_OF_IPOS_ID, 1);
  invIpos = equipFromBag(invIpos, SHIELD_ID, 0);
  invIpos = equipFromBag(invIpos, SWORD_OF_IPOS_ID, 0);
  expectTrue(
    'Sword of Ipos blocks shield',
    itemBlocksShieldSlot(SWORD_OF_IPOS_ID, ITEM_CATALOG[SWORD_OF_IPOS_ID]?.weaponType),
    errors,
  );
  expectEq('Sword of Ipos eq.l1', eqItemId(invIpos.eq.l1), SWORD_OF_IPOS_ID, errors);
  expectEq('Sword of Ipos clears eq.l2', eqItemId(invIpos.eq.l2), null, errors);

  if (errors.length > 0) {
    console.error('Elysian equip shield FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('Elysian equip shield OK');
}

main();
