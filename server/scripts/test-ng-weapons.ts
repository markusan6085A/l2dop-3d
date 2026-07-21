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
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';

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

  if (NG_WEAPON_CATALOG.length !== 42) {
    errors.push(`NG_WEAPON_CATALOG length: expected 42, got ${NG_WEAPON_CATALOG.length}`);
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

  for (const id of [308, 255, 254, 253] as const) {
    const e = NG_WEAPON_BY_ITEM_ID.get(id)!;
    expectEq(`#${id} fist`, ITEM_CATALOG[id]?.weaponType, 'fist', errors);
    expectEq(`#${id} speed 433`, ITEM_CATALOG[id]?.atkSpd, 433, errors);
    expectEq(
      `#${id} blocks shield`,
      itemBlocksShieldSlot(id, 'fist'),
      true,
      errors,
    );
  }

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

  console.log(`NG weapons smoke OK (${NG_WEAPON_CATALOG.length} items)`);
}

main();
