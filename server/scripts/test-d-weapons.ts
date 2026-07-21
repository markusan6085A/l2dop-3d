/**
 * Smoke: канонічна D-grade зброя — магазин, ITEM_CATALOG, щит, тип зброї.
 * npm run test:d-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  dGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopDWeaponDropsPatches.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import {
  D_WEAPON_BY_ITEM_ID,
  D_WEAPON_CATALOG,
} from '../src/data/dWeaponCatalog.js';

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

function main(): void {
  const errors: string[] = [];

  if (D_WEAPON_CATALOG.length !== 10) {
    errors.push(`D_WEAPON_CATALOG length: expected 10, got ${D_WEAPON_CATALOG.length}`);
  }

  for (const entry of D_WEAPON_CATALOG) {
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

    const patch = L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
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

    const previewLines = dGradeWeaponDropsPreviewLines(patch);
    const previewText = previewLines.map((l) => l.valueUk).join(' ');
    if (entry.mode === 'magic') {
      if (!previewText.includes(`M.Atk: ${entry.mAtk}`)) {
        errors.push(`#${entry.itemId} shop preview missing M.Atk ${entry.mAtk}`);
      }
      if (!previewText.includes(`Speed: ${entry.atkSpd}`)) {
        errors.push(`#${entry.itemId} shop preview missing Speed ${entry.atkSpd}`);
      }
      if (!previewText.includes('Crit: —')) {
        errors.push(`#${entry.itemId} magic preview should show Crit: —`);
      }
      if (previewText.includes('P.Atk:')) {
        errors.push(`#${entry.itemId} magic preview must not show P.Atk`);
      }
    } else {
      if (!previewText.includes(`P.Atk: ${entry.pAtk}`)) {
        errors.push(`#${entry.itemId} shop preview missing P.Atk ${entry.pAtk}`);
      }
      if (!previewText.includes(`Speed: ${entry.atkSpd}`)) {
        errors.push(`#${entry.itemId} shop preview missing Speed ${entry.atkSpd}`);
      }
      if (!previewText.includes(`Crit: ${entry.displayCrit}`)) {
        errors.push(`#${entry.itemId} shop preview missing Crit ${entry.displayCrit}`);
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

  // Spot checks
  expectEq('Atuba blunt', ITEM_CATALOG[187]?.weaponType, 'blunt', errors);
  expectEq('Atuba 1H shield', itemBlocksShieldSlot(187, 'blunt'), false, errors);

  expectEq('Tomahawk blunt', ITEM_CATALOG[86]?.weaponType, 'blunt', errors);
  expectEq('Tomahawk not bigblunt', ITEM_CATALOG[86]?.weaponType !== 'bigblunt', true, errors);
  expectEq('Tomahawk 1H shield', itemBlocksShieldSlot(86, 'blunt'), false, errors);

  expectEq('Tome sword', ITEM_CATALOG[317]?.weaponType, 'sword', errors);
  expectEq('Tome pAtk', ITEM_CATALOG[317]?.pAtk, 9, errors);
  expectEq('Tome mAtk', ITEM_CATALOG[317]?.mAtk, 80, errors);
  expectEq('Tome shield', itemBlocksShieldSlot(317, 'sword'), false, errors);

  expectEq('War Hammer bigblunt', ITEM_CATALOG[293]?.weaponType, 'bigblunt', errors);
  expectEq('War Hammer not pole', ITEM_CATALOG[293]?.weaponType !== 'pole', true, errors);
  expectEq('War Hammer 2H', itemBlocksShieldSlot(293, 'bigblunt'), true, errors);

  expectEq('Jamadhr fist', ITEM_CATALOG[260]?.weaponType, 'fist', errors);
  expectEq('Jamadhr speed', ITEM_CATALOG[260]?.atkSpd, 433, errors);
  expectEq('Jamadhr 2H', itemBlocksShieldSlot(260, 'fist'), true, errors);

  expectEq('Two-Handed Sword bigsword', ITEM_CATALOG[124]?.weaponType, 'bigsword', errors);
  expectEq('Two-Handed Sword 2H', itemBlocksShieldSlot(124, 'bigsword'), true, errors);

  expectEq('Dark Elven Bow bow', ITEM_CATALOG[277]?.weaponType, 'bow', errors);
  expectEq('Dark Elven Bow crit', ITEM_CATALOG[277]?.wpnCrit, 120, errors);

  expectEq('Baguette dual', ITEM_CATALOG[261]?.weaponType, 'dual', errors);
  expectEq('Baguette not fist', ITEM_CATALOG[261]?.weaponType !== 'fist', true, errors);
  expectEq('Baguette 2H', itemBlocksShieldSlot(261, 'dual'), true, errors);

  if (errors.length > 0) {
    console.error('D weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`D weapons smoke OK (${D_WEAPON_CATALOG.length} items)`);
}

main();
