/**
 * Smoke: канонічна C-grade зброя — магазин, ITEM_CATALOG, щит, ціни.
 * npm run test:c-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  cGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopCWeaponDropsPatches.js';
import {
  C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
  ITEM_CATALOG,
} from '../src/data/itemsCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import {
  C_WEAPON_BY_ITEM_ID,
  C_WEAPON_CATALOG,
} from '../src/data/cWeaponCatalog.js';

type OverrideRow = { itemId?: number; priceAdena?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

/** Поточні авторські ціни з dropsShopOverrides — не змінювати кодом. */
const EXPECTED_PRICES: Record<string, number> = Object.fromEntries(
  C_WEAPON_CATALOG.map((e) => {
    const row = overrides[e.shopKey];
    return [e.shopKey, row?.priceAdena ?? -1];
  }),
);

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

  if (C_WEAPON_CATALOG.length !== 26) {
    errors.push(`C_WEAPON_CATALOG length: expected 26, got ${C_WEAPON_CATALOG.length}`);
  }

  for (const entry of C_WEAPON_CATALOG) {
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

    const price = override?.priceAdena;
    const expectedPrice = EXPECTED_PRICES[entry.shopKey];
    if (expectedPrice != null && expectedPrice > 0) {
      expectEq(`price ${entry.shopKey}`, price, expectedPrice, errors);
    }

    const patch = L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
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

    const previewLines = cGradeWeaponDropsPreviewLines(patch);
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
  }

  // Regression spot checks
  expectEq('Battle Axe blunt', ITEM_CATALOG[160]?.weaponType, 'blunt', errors);
  expectEq('Battle Axe speed', ITEM_CATALOG[160]?.atkSpd, 379, errors);
  expectEq('Battle Axe shield', itemBlocksShieldSlot(160, 'blunt'), false, errors);

  expectEq('Dwarven Hammer bigblunt', ITEM_CATALOG[7897]?.weaponType, 'bigblunt', errors);
  expectEq('Dwarven Hammer speed', ITEM_CATALOG[7897]?.atkSpd, 325, errors);
  expectEq('Dwarven Hammer 2H', itemBlocksShieldSlot(7897, 'bigblunt'), true, errors);

  expectEq('Heavy Doom Hammer bigblunt', ITEM_CATALOG[191]?.weaponType, 'bigblunt', errors);
  expectEq('Heavy Doom Hammer speed', ITEM_CATALOG[191]?.atkSpd, 325, errors);

  expectEq("Pa'agrio bigsword", ITEM_CATALOG[7882]?.weaponType, 'bigsword', errors);
  expectEq("Pa'agrio speed", ITEM_CATALOG[7882]?.atkSpd, 325, errors);
  expectEq("Pa'agrio mAtk", ITEM_CATALOG[7882]?.mAtk, 76, errors);
  expectEq("Pa'agrio 2H", itemBlocksShieldSlot(7882, 'bigsword'), true, errors);

  expectEq('Scorpion pole', ITEM_CATALOG[301]?.weaponType, 'pole', errors);
  expectEq('Scorpion not dagger', ITEM_CATALOG[301]?.weaponType !== 'dagger', true, errors);
  expectEq('Scorpion speed', ITEM_CATALOG[301]?.atkSpd, 325, errors);
  expectEq('Scorpion crit', ITEM_CATALOG[301]?.wpnCrit, 40, errors);
  expectEq('Scorpion 2H', itemBlocksShieldSlot(301, 'pole'), true, errors);

  expectEq('War Axe blunt', ITEM_CATALOG[162]?.weaponType, 'blunt', errors);
  expectEq('War Axe speed', ITEM_CATALOG[162]?.atkSpd, 379, errors);
  expectEq('War Axe shield', itemBlocksShieldSlot(162, 'blunt'), false, errors);

  expectEq('Widow Maker pole', ITEM_CATALOG[303]?.weaponType, 'pole', errors);
  expectEq('Widow Maker 2H', itemBlocksShieldSlot(303, 'pole'), true, errors);

  expectEq(
    'Apprentice spellbook id',
    C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
    900225,
    errors,
  );
  expectEq('Spellbook pAtk', ITEM_CATALOG[900225]?.pAtk, 9, errors);
  expectEq('Spellbook mAtk', ITEM_CATALOG[900225]?.mAtk, 95, errors);
  expectEq('Spellbook sword', ITEM_CATALOG[900225]?.weaponType, 'sword', errors);
  expectEq('Spellbook 1H', itemBlocksShieldSlot(900225, 'sword'), false, errors);

  expectEq('Demon Staff pAtk', ITEM_CATALOG[206]?.pAtk, 152, errors);
  expectEq('Demon Staff mAtk', ITEM_CATALOG[206]?.mAtk, 154, errors);
  expectEq('Demon Staff bigblunt', ITEM_CATALOG[206]?.weaponType, 'bigblunt', errors);
  expectEq('Demon Staff 2H', itemBlocksShieldSlot(206, 'bigblunt'), true, errors);

  expectEq('Heathen pAtk', ITEM_CATALOG[326]?.pAtk, 111, errors);
  expectEq('Heathen mAtk', ITEM_CATALOG[326]?.mAtk, 120, errors);
  expectEq('Heathen sword 1H', itemBlocksShieldSlot(326, 'sword'), false, errors);

  expectEq('Homunkulus pAtk', ITEM_CATALOG[84]?.pAtk, 111, errors);
  expectEq('Homunkulus mAtk', ITEM_CATALOG[84]?.mAtk, 140, errors);
  expectEq('Homunkulus sword 1H', itemBlocksShieldSlot(84, 'sword'), false, errors);

  expectEq('Ecliptic mAtk preserved', ITEM_CATALOG[7888]?.mAtk, 126, errors);
  expectEq('Ecliptic preview phys pAtk', ITEM_CATALOG[7888]?.pAtk, 190, errors);

  if (errors.length > 0) {
    console.error('C weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`C weapons smoke OK (${C_WEAPON_CATALOG.length} items)`);
}

main();
