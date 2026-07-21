/**
 * Smoke: канонічна A-grade зброя — магазин, ITEM_CATALOG, щит, Coin of Luck.
 * npm run test:a-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  aGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopAWeaponDropsPatches.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import {
  itemBlocksShieldHintsForClient,
  itemBlocksShieldSlot,
} from '../src/data/l2dopTwoHandedWeapon.js';
import {
  A_WEAPON_BY_ITEM_ID,
  A_WEAPON_CATALOG,
} from '../src/data/aWeaponCatalog.js';
import { colPriceForBasEquipment } from '../src/domain/dropsShopCoinOfLuckPricing.js';
import { RB_DROP_ITEM_A } from '../src/data/l2dopRaidBossDropSharedA.js';

type OverrideRow = { itemId?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

const A_WEAPON_COL_PRICE = colPriceForBasEquipment('A', 'weapon');

function shopKeyNorm(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

function expectEq<T>(label: string, actual: T, expected: T, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function main(): void {
  const errors: string[] = [];

  if (A_WEAPON_CATALOG.length !== 30) {
    errors.push(`A_WEAPON_CATALOG length: expected 30, got ${A_WEAPON_CATALOG.length}`);
  }

  if (A_WEAPON_COL_PRICE !== 110) {
    errors.push(`A weapon Coin of Luck price: expected 110, got ${String(A_WEAPON_COL_PRICE)}`);
  }

  for (const entry of A_WEAPON_CATALOG) {
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

    const patch = L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
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
    expectEq(`#${entry.itemId} pAtk`, catalog.pAtk, entry.pAtk, errors);
    expectEq(`#${entry.itemId} atkSpd`, catalog.atkSpd, entry.atkSpd, errors);
    expectEq(`#${entry.itemId} wpnCrit`, catalog.wpnCrit, entry.wpnCrit, errors);
    if (entry.mAtk != null) {
      expectEq(`#${entry.itemId} mAtk`, catalog.mAtk, entry.mAtk, errors);
    }
    if (catalog.rCrit != null && catalog.rCrit !== 0) {
      errors.push(`#${entry.itemId} unexpected rCrit: ${catalog.rCrit}`);
    }

    const previewLines = aGradeWeaponDropsPreviewLines(patch);
    const previewText = previewLines.map((l) => l.valueUk).join(' ');
    if (entry.mode === 'magic') {
      if (!previewText.includes(`M.Atk: ${entry.mAtk}`)) {
        errors.push(`#${entry.itemId} preview missing M.Atk ${entry.mAtk}`);
      }
      if (!previewText.includes(`Speed: ${entry.atkSpd}`)) {
        errors.push(`#${entry.itemId} preview missing Speed ${entry.atkSpd}`);
      }
      if (!previewText.includes('Crit: —')) {
        errors.push(`#${entry.itemId} magic preview should show Crit: —`);
      }
      if (previewText.includes('P.Atk:')) {
        errors.push(`#${entry.itemId} magic preview must not show P.Atk`);
      }
    } else {
      if (!previewText.includes(`P.Atk: ${entry.pAtk}`)) {
        errors.push(`#${entry.itemId} preview missing P.Atk ${entry.pAtk}`);
      }
      if (!previewText.includes(`Speed: ${entry.atkSpd}`)) {
        errors.push(`#${entry.itemId} preview missing Speed ${entry.atkSpd}`);
      }
      if (!previewText.includes(`Crit: ${entry.displayCrit}`)) {
        errors.push(`#${entry.itemId} preview missing Crit ${entry.displayCrit}`);
      }
    }

    const blocksShield = itemBlocksShieldSlot(entry.itemId, catalog.weaponType);
    expectEq(
      `#${entry.itemId} blocksShield`,
      blocksShield,
      entry.blocksShield,
      errors,
    );

    if (A_WEAPON_BY_ITEM_ID.get(entry.itemId) !== entry) {
      errors.push(`#${entry.itemId} missing from A_WEAPON_BY_ITEM_ID`);
    }
  }

  // Regression spot checks
  expectEq("Barakiel's Axe blunt", ITEM_CATALOG[900203]?.weaponType, 'blunt', errors);
  expectEq("Barakiel's Axe speed", ITEM_CATALOG[900203]?.atkSpd, 379, errors);
  expectEq("Barakiel's Axe 1H", itemBlocksShieldSlot(900203, 'blunt'), false, errors);

  expectEq('Behemoth bigblunt', ITEM_CATALOG[900204]?.weaponType, 'bigblunt', errors);
  expectEq('Behemoth speed', ITEM_CATALOG[900204]?.atkSpd, 325, errors);
  expectEq('Behemoth 2H', itemBlocksShieldSlot(900204, 'bigblunt'), true, errors);

  expectEq('Blood Tornado fist', ITEM_CATALOG[900205]?.weaponType, 'fist', errors);
  expectEq('Blood Tornado speed', ITEM_CATALOG[900205]?.atkSpd, 433, errors);
  expectEq('Blood Tornado crit', ITEM_CATALOG[900205]?.wpnCrit, 40, errors);
  expectEq('Blood Tornado 2H', itemBlocksShieldSlot(900205, 'fist'), true, errors);

  expectEq('Branch bigblunt', ITEM_CATALOG[900207]?.weaponType, 'bigblunt', errors);
  expectEq('Branch speed', ITEM_CATALOG[900207]?.atkSpd, 325, errors);
  expectEq('Branch 2H', itemBlocksShieldSlot(900207, 'bigblunt'), true, errors);

  expectEq('Daimon Crystal bigblunt', ITEM_CATALOG[900210]?.weaponType, 'bigblunt', errors);
  expectEq('Daimon Crystal speed', ITEM_CATALOG[900210]?.atkSpd, 325, errors);
  expectEq('Daimon Crystal 2H', itemBlocksShieldSlot(900210, 'bigblunt'), true, errors);

  expectEq('Elysian id', overrides['weapon_a/elysian.jpg']?.itemId, 164, errors);
  expectEq('Elysian blunt', ITEM_CATALOG[164]?.weaponType, 'blunt', errors);
  expectEq('Elysian speed', ITEM_CATALOG[164]?.atkSpd, 379, errors);
  expectEq('Elysian 1H', itemBlocksShieldSlot(164, 'blunt'), false, errors);
  expectEq('Elysian client hint', itemBlocksShieldHintsForClient()[164], false, errors);

  expectEq("Sobekk's Hurricane fist", ITEM_CATALOG[900216]?.weaponType, 'fist', errors);
  expectEq("Sobekk's Hurricane speed", ITEM_CATALOG[900216]?.atkSpd, 433, errors);
  expectEq("Sobekk's Hurricane 2H", itemBlocksShieldSlot(900216, 'fist'), true, errors);

  expectEq('Soul Bow id', overrides['weapon_a/soul_bow.jpg']?.itemId, 289, errors);
  expectEq('Soul Bow not 7575', overrides['weapon_a/soul_bow.jpg']?.itemId !== 7575, true, errors);
  expectEq('Soul Bow bow', ITEM_CATALOG[289]?.weaponType, 'bow', errors);
  expectEq('Soul Bow speed', ITEM_CATALOG[289]?.atkSpd, 293, errors);
  expectEq('Soul Bow crit', ITEM_CATALOG[289]?.wpnCrit, 120, errors);

  expectEq('Soul Separator id', overrides['weapon_a/soul_separator.jpg']?.itemId, 900217, errors);
  expectEq('Soul Separator dagger', ITEM_CATALOG[900217]?.weaponType, 'dagger', errors);
  expectEq('Soul Separator speed', ITEM_CATALOG[900217]?.atkSpd, 433, errors);
  expectEq('Soul Separator crit', ITEM_CATALOG[900217]?.wpnCrit, 80, errors);
  expectEq('Soul Separator 1H', itemBlocksShieldSlot(900217, 'dagger'), false, errors);

  expectEq('Spiritual Eye blunt', ITEM_CATALOG[900218]?.weaponType, 'blunt', errors);
  expectEq('Spiritual Eye speed', ITEM_CATALOG[900218]?.atkSpd, 379, errors);
  expectEq('Spiritual Eye 1H', itemBlocksShieldSlot(900218, 'blunt'), false, errors);

  expectEq('Sword of Ipos bigsword', ITEM_CATALOG[900219]?.weaponType, 'bigsword', errors);
  expectEq('Sword of Ipos speed', ITEM_CATALOG[900219]?.atkSpd, 325, errors);
  expectEq('Sword of Ipos 2H', itemBlocksShieldSlot(900219, 'bigsword'), true, errors);

  expectEq('Miracles id', overrides['weapon_a/sword_of_miracles.jpg']?.itemId, 151, errors);
  expectEq('Miracles sword', ITEM_CATALOG[151]?.weaponType, 'sword', errors);
  expectEq('Miracles 1H', itemBlocksShieldSlot(151, 'sword'), false, errors);
  expectEq('Miracles mAtk', ITEM_CATALOG[151]?.mAtk, 340, errors);

  expectEq('Tallum Blade sword', ITEM_CATALOG[900220]?.weaponType, 'sword', errors);
  expectEq('Tallum Blade not dual', ITEM_CATALOG[900220]?.weaponType !== 'dual', true, errors);
  expectEq('Tallum Blade 1H', itemBlocksShieldSlot(900220, 'sword'), false, errors);

  expectEq("Themis' Tongue sword", ITEM_CATALOG[900222]?.weaponType, 'sword', errors);
  expectEq("Themis' Tongue speed", ITEM_CATALOG[900222]?.atkSpd, 379, errors);
  expectEq("Themis' Tongue 1H", itemBlocksShieldSlot(900222, 'sword'), false, errors);
  expectEq("Themis' Tongue mAtk", ITEM_CATALOG[900222]?.mAtk, 310, errors);

  expectEq('Dasparion id', overrides['weapon_a/dasparion_s_staff.jpg']?.itemId, 212, errors);
  expectEq('Dasparion RB id', RB_DROP_ITEM_A.dasparionsStaff.l2ItemId, 212, errors);

  // Magic pAtk/mAtk regression
  expectEq('Spellbook pAtk', ITEM_CATALOG[900201]?.pAtk, 9, errors);
  expectEq('Spellbook mAtk', ITEM_CATALOG[900201]?.mAtk, 260, errors);
  expectEq('Behemoth pAtk', ITEM_CATALOG[900204]?.pAtk, 213, errors);
  expectEq('Behemoth mAtk', ITEM_CATALOG[900204]?.mAtk, 280, errors);
  expectEq('Branch pAtk', ITEM_CATALOG[900207]?.pAtk, 155, errors);
  expectEq('Branch mAtk', ITEM_CATALOG[900207]?.mAtk, 260, errors);
  expectEq('Daimon pAtk', ITEM_CATALOG[900210]?.pAtk, 152, errors);
  expectEq('Daimon mAtk', ITEM_CATALOG[900210]?.mAtk, 310, errors);
  expectEq('Dasparion pAtk', ITEM_CATALOG[212]?.pAtk, 189, errors);
  expectEq('Dasparion mAtk', ITEM_CATALOG[212]?.mAtk, 340, errors);
  expectEq('Spiritual Eye pAtk', ITEM_CATALOG[900218]?.pAtk, 98, errors);
  expectEq('Spiritual Eye mAtk', ITEM_CATALOG[900218]?.mAtk, 300, errors);
  expectEq('Miracles pAtk', ITEM_CATALOG[151]?.pAtk, 237, errors);
  expectEq('Themis pAtk', ITEM_CATALOG[900222]?.pAtk, 98, errors);

  const wrongIds: Array<[string, number]> = [
    ['weapon_a/elysian.jpg', 290],
    ['weapon_a/soul_bow.jpg', 7575],
    ['weapon_a/dasparion_s_staff.jpg', 210],
    ['weapon_a/sword_of_miracles.jpg', 88],
  ];
  for (const [shopKey, badId] of wrongIds) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`${shopKey} must not use legacy itemId ${badId}`);
    }
  }

  if (errors.length > 0) {
    console.error('A weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`A weapons smoke OK (${A_WEAPON_CATALOG.length} items)`);
}

main();
