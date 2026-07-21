/**
 * Smoke: канонічна S-grade зброя — магазин, ITEM_CATALOG, щит, Coin of Luck.
 * npm run test:s-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  sGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopSWeaponDropsPatches.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import {
  S_WEAPON_BY_ITEM_ID,
  S_WEAPON_CATALOG,
  S_WEAPON_EVENT_ITEM_IDS,
} from '../src/data/sWeaponCatalog.js';
import { colPriceForBasEquipment } from '../src/domain/dropsShopCoinOfLuckPricing.js';
import { RB_DROP_ITEM_S } from '../src/data/l2dopRaidBossDropSharedS.js';

type OverrideRow = { itemId?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;
const S_WEAPON_COL_PRICE = colPriceForBasEquipment('S', 'weapon');

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

  if (S_WEAPON_CATALOG.length !== 13) {
    errors.push(`S_WEAPON_CATALOG length: expected 13, got ${S_WEAPON_CATALOG.length}`);
  }

  if (S_WEAPON_COL_PRICE !== 200) {
    errors.push(`S weapon Coin of Luck price: expected 200, got ${String(S_WEAPON_COL_PRICE)}`);
  }

  for (const entry of S_WEAPON_CATALOG) {
    const key = shopKeyNorm(entry.shopKey);
    const override = overrides[entry.shopKey];
    const overrideItemId =
      override && typeof override.itemId === 'number' ? override.itemId : null;
    expectEq(`shopKey ${entry.shopKey} → itemId`, overrideItemId, entry.itemId, errors);

    const patch = L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
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

    const previewLines = sGradeWeaponDropsPreviewLines(patch);
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
      if (!previewText.includes(`Crit: ${entry.displayCrit ?? entry.wpnCrit}`)) {
        errors.push(`#${entry.itemId} preview missing Crit ${entry.displayCrit ?? entry.wpnCrit}`);
      }
    }

    const blocksShield = itemBlocksShieldSlot(entry.itemId, catalog.weaponType);
    expectEq(`#${entry.itemId} blocksShield`, blocksShield, entry.blocksShield, errors);

    if (S_WEAPON_BY_ITEM_ID.get(entry.itemId) !== entry) {
      errors.push(`#${entry.itemId} missing from S_WEAPON_BY_ITEM_ID`);
    }
  }

  // Regression spot checks
  expectEq('Angel Slayer id', overrides['weapon_s/angel_slayer.jpg']?.itemId, 6367, errors);
  expectEq('Angel Slayer dagger', ITEM_CATALOG[6367]?.weaponType, 'dagger', errors);
  expectEq('Angel Slayer speed', ITEM_CATALOG[6367]?.atkSpd, 433, errors);
  expectEq('Angel Slayer crit', ITEM_CATALOG[6367]?.wpnCrit, 80, errors);
  expectEq('Angel Slayer 1H', itemBlocksShieldSlot(6367, 'dagger'), false, errors);

  expectEq('Arcana Mace id', overrides['weapon_s/arcana_mace.jpg']?.itemId, 6579, errors);
  expectEq('Arcana Mace blunt', ITEM_CATALOG[6579]?.weaponType, 'blunt', errors);
  expectEq('Arcana Mace pAtk', ITEM_CATALOG[6579]?.pAtk, 225, errors);
  expectEq('Arcana Mace mAtk', ITEM_CATALOG[6579]?.mAtk, 458, errors);
  expectEq('Arcana Mace speed', ITEM_CATALOG[6579]?.atkSpd, 379, errors);
  expectEq('Arcana Mace 1H', itemBlocksShieldSlot(6579, 'blunt'), false, errors);

  expectEq('Basalt Battlehammer id', overrides['weapon_s/basalt_battlehammer.jpg']?.itemId, 6365, errors);
  expectEq('Basalt Battlehammer blunt', ITEM_CATALOG[6365]?.weaponType, 'blunt', errors);
  expectEq('Basalt Battlehammer speed', ITEM_CATALOG[6365]?.atkSpd, 379, errors);
  expectEq('Basalt Battlehammer 1H', itemBlocksShieldSlot(6365, 'blunt'), false, errors);

  expectEq('Demon Splinter id', overrides['weapon_s/demon_splinter.jpg']?.itemId, 6371, errors);
  expectEq('Demon Splinter fist', ITEM_CATALOG[6371]?.weaponType, 'fist', errors);
  expectEq('Demon Splinter speed', ITEM_CATALOG[6371]?.atkSpd, 433, errors);
  expectEq('Demon Splinter crit', ITEM_CATALOG[6371]?.wpnCrit, 40, errors);
  expectEq('Demon Splinter 2H', itemBlocksShieldSlot(6371, 'fist'), true, errors);

  expectEq('Draconic Bow id', overrides['weapon_s/draconic_bow.jpg']?.itemId, 7575, errors);
  expectEq('Draconic Bow not 20173', overrides['weapon_s/draconic_bow.jpg']?.itemId !== 20173, true, errors);
  expectEq('Draconic Bow bow', ITEM_CATALOG[7575]?.weaponType, 'bow', errors);
  expectEq('Draconic Bow speed', ITEM_CATALOG[7575]?.atkSpd, 293, errors);
  expectEq('Draconic Bow crit', ITEM_CATALOG[7575]?.wpnCrit, 120, errors);
  expectEq('Draconic Bow 2H', itemBlocksShieldSlot(7575, 'bow'), true, errors);

  expectEq('Dragon Hunter Axe id', overrides['weapon_s/dragon_hunter_axe.jpg']?.itemId, 6369, errors);
  expectEq('Dragon Hunter Axe bigblunt', ITEM_CATALOG[6369]?.weaponType, 'bigblunt', errors);
  expectEq('Dragon Hunter Axe 2H', itemBlocksShieldSlot(6369, 'bigblunt'), true, errors);

  expectEq("Heaven's Divider id", overrides['weapon_s/heaven_s_divider.jpg']?.itemId, 6372, errors);
  expectEq("Heaven's Divider bigsword", ITEM_CATALOG[6372]?.weaponType, 'bigsword', errors);
  expectEq("Heaven's Divider 2H", itemBlocksShieldSlot(6372, 'bigsword'), true, errors);

  expectEq('Imperial Staff id', overrides['weapon_s/imperial_staff.jpg']?.itemId, 6366, errors);
  expectEq('Imperial Staff bigblunt', ITEM_CATALOG[6366]?.weaponType, 'bigblunt', errors);
  expectEq('Imperial Staff pAtk', ITEM_CATALOG[6366]?.pAtk, 274, errors);
  expectEq('Imperial Staff mAtk', ITEM_CATALOG[6366]?.mAtk, 458, errors);
  expectEq('Imperial Staff 2H', itemBlocksShieldSlot(6366, 'bigblunt'), true, errors);

  expectEq('Saint Spear id', overrides['weapon_s/saint_spear.jpg']?.itemId, 6370, errors);
  expectEq('Saint Spear pole', ITEM_CATALOG[6370]?.weaponType, 'pole', errors);
  expectEq('Saint Spear 2H', itemBlocksShieldSlot(6370, 'pole'), true, errors);

  expectEq('Shining Bow id', overrides['weapon_s/shining_bow.jpg']?.itemId, 6368, errors);
  expectEq('Shining Bow not 910203', overrides['weapon_s/shining_bow.jpg']?.itemId !== 910203, true, errors);
  expectEq('Shining Bow bow', ITEM_CATALOG[6368]?.weaponType, 'bow', errors);
  expectEq('Shining Bow crit', ITEM_CATALOG[6368]?.wpnCrit, 120, errors);
  expectEq('Shining Bow 2H', itemBlocksShieldSlot(6368, 'bow'), true, errors);

  // Magic pAtk/mAtk regression
  expectEq('Spellbook pAtk', ITEM_CATALOG[910201]?.pAtk, 9, errors);
  expectEq('Spellbook mAtk', ITEM_CATALOG[910201]?.mAtk, 340, errors);

  // Event ID regression — active sources must not use temporary Event itemIds
  const eventIds = [...S_WEAPON_EVENT_ITEM_IDS];
  for (const [shopKey, row] of Object.entries(overrides)) {
    if (!shopKey.startsWith('weapon_s/')) continue;
    if (row.itemId != null && eventIds.includes(row.itemId)) {
      errors.push(`dropsShopOverrides ${shopKey} uses Event itemId ${row.itemId}`);
    }
  }
  for (const def of Object.values(RB_DROP_ITEM_S)) {
    if (!def.iconUrl.includes('/weapon_s/')) continue;
    if (eventIds.includes(def.l2ItemId)) {
      errors.push(`RB_DROP_ITEM_S ${def.displayName} uses Event itemId ${def.l2ItemId}`);
    }
  }

  const wrongIds: Array<[string, number]> = [
    ['weapon_s/heaven_s_divider.jpg', 20166],
    ['weapon_s/angel_slayer.jpg', 20167],
    ['weapon_s/basalt_battlehammer.jpg', 20168],
    ['weapon_s/dragon_hunter_axe.jpg', 20169],
    ['weapon_s/arcana_mace.jpg', 20170],
    ['weapon_s/imperial_staff.jpg', 20171],
    ['weapon_s/demon_splinter.jpg', 20172],
    ['weapon_s/draconic_bow.jpg', 20173],
    ['weapon_s/saint_spear.jpg', 20174],
    ['weapon_s/shining_bow.jpg', 910203],
  ];
  for (const [shopKey, badId] of wrongIds) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`${shopKey} must not use legacy itemId ${badId}`);
    }
  }

  if (errors.length > 0) {
    console.error('S weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`S weapons smoke OK (${S_WEAPON_CATALOG.length} items)`);
}

main();
