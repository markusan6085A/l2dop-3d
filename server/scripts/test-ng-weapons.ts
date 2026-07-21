/**
 * Smoke: канонічна NG-зброя — магазин, ITEM_CATALOG, щит, тип зброї.
 * npm run test:ng-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  NG_WEAPON_BY_ITEM_ID,
  NG_WEAPON_CATALOG,
} from '../src/data/ngWeaponCatalog.js';
import {
  C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
  ITEM_CATALOG,
} from '../src/data/itemsCatalog.js';
import {
  L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  ngWeaponDropsPreviewLines,
} from '../src/data/l2dopNgWeaponDropsPatches.js';
import {
  itemBlocksShieldHintsForClient,
  itemBlocksShieldSlot,
} from '../src/data/l2dopTwoHandedWeapon.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
  parseInventoryRaw,
} from '../src/data/inventory.js';
import { lookupCanonWeaponSubtypeFromDisplayLabel } from '../src/domain/dropsShopWeaponSubtypeCanonLookup.js';
import { resolveDropsShopWeaponSubtype } from '../src/domain/dropsShopWeaponSubtype.js';
import { DROPS_SHOP_CATALOG } from '../src/data/dropsShopCatalog.generated.js';

type OverrideRow = { itemId?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

function shopKeyNorm(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
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

function eqItemId(slotVal: unknown): number | null {
  if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
  if (slotVal && typeof slotVal === 'object' && 'itemId' in slotVal) {
    const n = Number((slotVal as { itemId: unknown }).itemId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function main(): void {
  const errors: string[] = [];

  const expectedNgCount = Object.keys(overrides).filter((k) => k.startsWith('weapon_ng/')).length;
  if (NG_WEAPON_CATALOG.length !== expectedNgCount) {
    errors.push(
      `NG_WEAPON_CATALOG length: expected ${expectedNgCount}, got ${NG_WEAPON_CATALOG.length}`,
    );
  }

  const shopNgKeys = Object.keys(overrides).filter((k) => k.startsWith('weapon_ng/'));
  if (shopNgKeys.length !== NG_WEAPON_CATALOG.length) {
    errors.push(
      `NG shop overrides (${shopNgKeys.length}) must match NG_WEAPON_CATALOG (${NG_WEAPON_CATALOG.length})`,
    );
  }

  for (const entry of NG_WEAPON_CATALOG) {
    const key = shopKeyNorm(entry.shopKey);
    const override = overrides[entry.shopKey];
    const overrideItemId =
      override && typeof override.itemId === 'number' ? override.itemId : null;
    expectEq(
      `shopKey ${entry.shopKey} → itemId`,
      overrideItemId,
      entry.itemId,
      errors,
    );

    const patch = L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
    if (!patch) {
      errors.push(`missing shop patch for ${entry.shopKey}`);
      continue;
    }

    const catalog = ITEM_CATALOG[entry.itemId];
    if (!catalog) {
      errors.push(`missing ITEM_CATALOG[${entry.itemId}]`);
      continue;
    }

    expectEq(`#${entry.itemId} weaponType`, catalog.weaponType, entry.weaponType, errors);
    expectEq(`#${entry.itemId} atkSpd`, catalog.atkSpd, entry.atkSpd, errors);

    if (entry.mode === 'phys') {
      expectEq(`#${entry.itemId} pAtk`, catalog.pAtk, entry.pAtk, errors);
      expectEq(`#${entry.itemId} wpnCrit`, catalog.wpnCrit, entry.displayCrit, errors);
      if (entry.mAtk != null) {
        expectEq(`#${entry.itemId} mAtk`, catalog.mAtk, entry.mAtk, errors);
      }
      if (catalog.rCrit != null && catalog.rCrit !== 0) {
        errors.push(`#${entry.itemId} unexpected rCrit duplicate: ${catalog.rCrit}`);
      }
    } else {
      expectEq(`#${entry.itemId} pAtk`, catalog.pAtk, entry.pAtk, errors);
      expectEq(`#${entry.itemId} mAtk`, catalog.mAtk, entry.mAtk, errors);
    }

    const previewLines = ngWeaponDropsPreviewLines(patch);
    const previewText = previewLines.map((l) => l.valueUk).join(' ');
    if (entry.mode === 'phys') {
      if (!previewText.includes(`P.Atk: ${entry.pAtk}`)) {
        errors.push(`#${entry.itemId} shop preview missing P.Atk ${entry.pAtk}`);
      }
      if (!previewText.includes(`Speed: ${entry.atkSpd}`)) {
        errors.push(`#${entry.itemId} shop preview missing Speed ${entry.atkSpd}`);
      }
      if (!previewText.includes(`Crit: ${entry.displayCrit}`)) {
        errors.push(`#${entry.itemId} shop preview missing Crit ${entry.displayCrit}`);
      }
    } else {
      if (!previewText.includes(`M.Atk: ${entry.mAtk}`)) {
        errors.push(`#${entry.itemId} shop preview missing M.Atk ${entry.mAtk}`);
      }
      if (!previewText.includes(`Speed: ${entry.atkSpd}`)) {
        errors.push(`#${entry.itemId} shop preview missing Speed ${entry.atkSpd}`);
      }
      if (!previewText.includes('Crit: —')) {
        errors.push(`#${entry.itemId} magic shop preview should show Crit: —`);
      }
      if (previewText.includes('P.Atk:')) {
        errors.push(`#${entry.itemId} magic shop preview must not show P.Atk`);
      }
    }

    const blocksShield = itemBlocksShieldSlot(entry.itemId, catalog.weaponType);
    expectEq(
      `#${entry.itemId} blocksShield`,
      blocksShield,
      entry.blocksShield,
      errors,
    );
  }

  // Spot checks from task
  const viper = NG_WEAPON_BY_ITEM_ID.get(257)!;
  expectEq('Viper weaponType', ITEM_CATALOG[257]?.weaponType, 'dagger', errors);
  expectEq('Viper blocksShield', itemBlocksShieldSlot(257, 'dagger'), false, errors);
  expectEq('Viper pAtk', ITEM_CATALOG[257]?.pAtk, 45, errors);
  expectEq('Viper atkSpd', ITEM_CATALOG[257]?.atkSpd, 433, errors);
  expectEq('Viper wpnCrit', ITEM_CATALOG[257]?.wpnCrit, 80, errors);

  const sickle = NG_WEAPON_BY_ITEM_ID.get(153)!;
  expectEq('Sickle weaponType', ITEM_CATALOG[153]?.weaponType, 'sword', errors);
  expectEq('Sickle blocksShield', itemBlocksShieldSlot(153, 'sword'), false, errors);

  for (const id of [255, 254, 253] as const) {
    const e = NG_WEAPON_BY_ITEM_ID.get(id)!;
    if (!e) {
      errors.push(`missing NG_WEAPON_BY_ITEM_ID[${id}]`);
      continue;
    }
    expectEq(`#${id} fist`, ITEM_CATALOG[id]?.weaponType, 'fist', errors);
    expectEq(`#${id} speed 433`, ITEM_CATALOG[id]?.atkSpd, 433, errors);
    expectEq(
      `#${id} blocks shield`,
      itemBlocksShieldSlot(id, 'fist'),
      true,
      errors,
    );
  }

  const buffaloShopKey = 'weapon_ng/weapon_buffalo_horn_i00.png';
  const buffaloRow = DROPS_SHOP_CATALOG.find((r) => r.shopKey === buffaloShopKey);
  if (!buffaloRow) {
    errors.push('missing DROPS_SHOP_CATALOG row for Buffalo\'s Horn');
  }

  expectEq("Buffalo's Horn itemId", overrides[buffaloShopKey]?.itemId, 308, errors);
  expectEq("Buffalo's Horn shop name", NG_WEAPON_BY_ITEM_ID.get(308)?.shopNameUk, "Buffalo's Horn", errors);
  expectEq("Buffalo's Horn pAtk", ITEM_CATALOG[308]?.pAtk, 25, errors);
  expectEq("Buffalo's Horn mAtk", ITEM_CATALOG[308]?.mAtk, 8, errors);
  expectEq("Buffalo's Horn wpnCrit", ITEM_CATALOG[308]?.wpnCrit, 40, errors);
  expectEq("Buffalo's Horn blunt", ITEM_CATALOG[308]?.weaponType, 'blunt', errors);
  expectEq("Buffalo's Horn speed", ITEM_CATALOG[308]?.atkSpd, 379, errors);
  expectEq("Buffalo's Horn 1H", itemBlocksShieldSlot(308, 'blunt'), false, errors);
  expectEq("Buffalo's Horn client hint", itemBlocksShieldHintsForClient()[308], false, errors);
  expectEq(
    "Buffalo's Horn shop blunt",
    lookupCanonWeaponSubtypeFromDisplayLabel("Buffalo's Horn"),
    'blunt',
    errors,
  );
  expectFalse(
    "Buffalo's Horn not fist lookup",
    lookupCanonWeaponSubtypeFromDisplayLabel("Buffalo's Horn") === 'fist',
    errors,
  );
  if (buffaloRow) {
    expectEq(
      "Buffalo's Horn resolve subtype",
      resolveDropsShopWeaponSubtype(
        buffaloRow,
        buffaloShopKey.replace(/\\/g, '/').toLowerCase(),
        ITEM_CATALOG[308],
        "Buffalo's Horn",
      ),
      'blunt',
      errors,
    );
  }

  let inv = emptyInventory();
  inv = addItemToBag(inv, 628, 1);
  inv = addItemToBag(inv, 308, 1);
  inv = equipFromBag(inv, 628, 0);
  inv = equipFromBag(inv, 308, 0);
  expectEq("Buffalo equip l1", eqItemId(inv.eq.l1), 308, errors);
  expectEq("Buffalo equip l2 shield", eqItemId(inv.eq.l2), 628, errors);
  expectFalse(
    "Buffalo equip shield stays",
    inv.stacks.some((s) => s.itemId === 628),
    errors,
  );
  const buffaloReload = parseInventoryRaw(inv);
  expectEq("Buffalo reload l1", eqItemId(buffaloReload.eq.l1), 308, errors);
  expectEq("Buffalo reload l2", eqItemId(buffaloReload.eq.l2), 628, errors);

  expectEq('Spike Glove fist', ITEM_CATALOG[253]?.weaponType, 'fist', errors);
  expectEq('Spike Glove speed 433', ITEM_CATALOG[253]?.atkSpd, 433, errors);
  expectEq('Spike Glove 2H blocks shield', itemBlocksShieldSlot(253, 'fist'), true, errors);
  let invFist = emptyInventory();
  invFist = addItemToBag(invFist, 628, 1);
  invFist = addItemToBag(invFist, 253, 1);
  invFist = equipFromBag(invFist, 628, 0);
  invFist = equipFromBag(invFist, 253, 0);
  expectEq('Spike Glove equip l1', eqItemId(invFist.eq.l1), 253, errors);
  expectEq('Spike Glove clears l2', eqItemId(invFist.eq.l2), null, errors);
  expectTrue(
    'Spike Glove returns shield to bag',
    invFist.stacks.some((s) => s.itemId === 628),
    errors,
  );

  for (const id of [311, 309, 100] as const) {
    expectEq(`#${id} blunt`, ITEM_CATALOG[id]?.weaponType, 'blunt', errors);
    expectEq(
      `#${id} allows shield`,
      itemBlocksShieldSlot(id, 'blunt'),
      false,
      errors,
    );
  }

  for (const id of [176, 9, 8] as const) {
    expectEq(`#${id} bigblunt`, ITEM_CATALOG[id]?.weaponType, 'bigblunt', errors);
    expectEq(
      `#${id} blocks shield`,
      itemBlocksShieldSlot(id, 'bigblunt'),
      true,
      errors,
    );
  }

  // NG Apprentice's Spellbook — lineage id 99
  expectEq('NG spellbook itemId', 99, 99, errors);
  expectEq('NG #99 mAtk', ITEM_CATALOG[99]?.mAtk, 20, errors);
  expectEq('NG #99 pAtk', ITEM_CATALOG[99]?.pAtk, 15, errors);

  // C-grade Apprentice's Spellbook — окремий синтетичний id
  const cShopKey = 'weapon_c/apprentices_spellbook.jpg';
  const cOverride = overrides[cShopKey];
  expectEq(
    'C spellbook shop itemId',
    cOverride?.itemId,
    C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
    errors,
  );
  const cMeta = ITEM_CATALOG[C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID];
  if (!cMeta) {
    errors.push(`missing ITEM_CATALOG[${C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID}]`);
  } else {
    expectEq('C spellbook mAtk', cMeta.mAtk, 95, errors);
    expectEq('C spellbook pAtk', cMeta.pAtk, 9, errors);
    expectEq('C spellbook weaponType', cMeta.weaponType, 'sword', errors);
  }
  if (ITEM_CATALOG[99]?.mAtk === 12) {
    errors.push('NG merge must not leave C-grade mAtk on itemId 99');
  }

  const magicCount = NG_WEAPON_CATALOG.filter((e) => e.mode === 'magic').length;
  if (magicCount !== 10) {
    errors.push(`expected 10 magic NG weapons, got ${magicCount}`);
  }

  if (errors.length > 0) {
    console.error('NG weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`NG weapons smoke OK (${NG_WEAPON_CATALOG.length} items, incl. Buffalo's Horn #308)`);
}

main();
