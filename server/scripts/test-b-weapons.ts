/**
 * Smoke: канонічна B-grade зброя — магазин, ITEM_CATALOG, щит, Coin of Luck.
 * npm run test:b-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  bGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopBWeaponDropsPatches.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import {
  B_WEAPON_BY_ITEM_ID,
  B_WEAPON_CATALOG,
} from '../src/data/bWeaponCatalog.js';
import { colPriceForBasEquipment } from '../src/domain/dropsShopCoinOfLuckPricing.js';

type OverrideRow = { itemId?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

const B_WEAPON_COL_PRICE = colPriceForBasEquipment('B', 'weapon');

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

  if (B_WEAPON_CATALOG.length !== 23) {
    errors.push(`B_WEAPON_CATALOG length: expected 23, got ${B_WEAPON_CATALOG.length}`);
  }

  if (B_WEAPON_COL_PRICE !== 60) {
    errors.push(`B weapon Coin of Luck price: expected 60, got ${String(B_WEAPON_COL_PRICE)}`);
  }

  for (const entry of B_WEAPON_CATALOG) {
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

    const patch = L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
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

    const previewLines = bGradeWeaponDropsPreviewLines(patch);
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

    if (B_WEAPON_BY_ITEM_ID.get(entry.itemId) !== entry) {
      errors.push(`#${entry.itemId} missing from B_WEAPON_BY_ITEM_ID`);
    }
  }

  // Regression spot checks
  expectEq('Art of Battle Axe blunt', ITEM_CATALOG[7834]?.weaponType, 'blunt', errors);
  expectEq('Art of Battle Axe speed', ITEM_CATALOG[7834]?.atkSpd, 379, errors);
  expectEq('Art of Battle Axe 1H', itemBlocksShieldSlot(7834, 'blunt'), false, errors);

  expectEq('Guardian Sword bigsword', ITEM_CATALOG[7883]?.weaponType, 'bigsword', errors);
  expectEq('Guardian Sword speed', ITEM_CATALOG[7883]?.atkSpd, 325, errors);
  expectEq('Guardian Sword 2H', itemBlocksShieldSlot(7883, 'bigsword'), true, errors);

  expectEq('Star Buster bigblunt', ITEM_CATALOG[7901]?.weaponType, 'bigblunt', errors);
  expectEq('Star Buster speed', ITEM_CATALOG[7901]?.atkSpd, 325, errors);
  expectEq('Star Buster 2H', itemBlocksShieldSlot(7901, 'bigblunt'), true, errors);

  expectEq('Kaim Vanul id', overrides['weapon_b/kaim_vanul_s_bones.jpg']?.itemId, 8340, errors);
  expectEq('Kaim Vanul blunt', ITEM_CATALOG[8340]?.weaponType, 'blunt', errors);
  expectEq('Kaim Vanul pAtk', ITEM_CATALOG[8340]?.pAtk, 155, errors);
  expectEq('Kaim Vanul mAtk', ITEM_CATALOG[8340]?.mAtk, 176, errors);
  expectEq('Kaim Vanul 1H', itemBlocksShieldSlot(8340, 'blunt'), false, errors);

  expectEq('Spell Breaker blunt', ITEM_CATALOG[7892]?.weaponType, 'blunt', errors);
  expectEq('Spell Breaker not rapier', ITEM_CATALOG[7892]?.weaponType !== 'rapier', true, errors);
  expectEq('Spell Breaker pAtk', ITEM_CATALOG[7892]?.pAtk, 140, errors);
  expectEq('Spell Breaker mAtk', ITEM_CATALOG[7892]?.mAtk, 203, errors);
  expectEq('Spell Breaker 1H', itemBlocksShieldSlot(7892, 'blunt'), false, errors);

  expectEq('Wizard Tear id', overrides['weapon_b/wizard_s_tear.jpg']?.itemId, 8336, errors);
  expectEq('Wizard Tear sword', ITEM_CATALOG[8336]?.weaponType, 'sword', errors);
  expectEq('Wizard Tear pAtk', ITEM_CATALOG[8336]?.pAtk, 155, errors);
  expectEq('Wizard Tear mAtk', ITEM_CATALOG[8336]?.mAtk, 236, errors);
  expectEq('Wizard Tear 1H', itemBlocksShieldSlot(8336, 'sword'), false, errors);

  expectEq('Damascus id', overrides['weapon_b/sword_of_damascus.jpg']?.itemId, 79, errors);
  expectEq('Damascus sword', ITEM_CATALOG[79]?.weaponType, 'sword', errors);
  expectEq('Damascus 1H', itemBlocksShieldSlot(79, 'sword'), false, errors);

  expectEq('Bellion Cestus id', overrides['weapon_b/bellion_cestus.jpg']?.itemId, 7893, errors);
  expectEq('Bellion Cestus fist', ITEM_CATALOG[7893]?.weaponType, 'fist', errors);
  expectEq('Bellion Cestus speed', ITEM_CATALOG[7893]?.atkSpd, 433, errors);
  expectEq('Bellion Cestus 2H', itemBlocksShieldSlot(7893, 'fist'), true, errors);

  expectEq('Spirit Staff id', overrides['weapon_b/spirit_s_staff.jpg']?.itemId, 7889, errors);
  expectEq('Spirit Staff bigblunt', ITEM_CATALOG[7889]?.weaponType, 'bigblunt', errors);
  expectEq('Spirit Staff speed', ITEM_CATALOG[7889]?.atkSpd, 325, errors);
  expectEq('Spirit Staff 2H', itemBlocksShieldSlot(7889, 'bigblunt'), true, errors);

  // Wrong legacy itemId bindings must not appear for these shop keys
  const wrongIds: Array<[string, number]> = [
    ['weapon_b/kaim_vanul_s_bones.jpg', 7893],
    ['weapon_b/sword_of_damascus.jpg', 7897],
    ['weapon_b/wizard_s_tear.jpg', 7889],
  ];
  for (const [shopKey, badId] of wrongIds) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`${shopKey} must not use legacy itemId ${badId}`);
    }
  }

  if (errors.length > 0) {
    console.error('B weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`B weapons smoke OK (${B_WEAPON_CATALOG.length} items)`);
}

main();
