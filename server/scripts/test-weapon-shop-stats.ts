/**
 * Аудит pAtk/mAtk усієї зброї + shop preview + Berserker Blade.
 * npm run test:weapon-shop-stats
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditAllCanonWeapons,
  collectAllCanonWeapons,
  TOTAL_CANON_WEAPONS,
} from './lib/weaponCanonAuditCore.js';
import { assertWeaponShopPreviewLines } from './lib/weaponShopPreviewTestCore.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { C_WEAPON_BY_ITEM_ID } from '../src/data/cWeaponCatalog.js';
import { buildDropsShopCatalogForClient } from '../src/services/dropsShopService.js';
import { buildWeaponShopPreviewLinesUk } from '../src/domain/weaponShopPreviewUk.js';
import embeddedDropsShopOverrides from '../src/data/dropsShopOverrides.json';
import { ngWeaponDropsPreviewLines } from '../src/data/l2dopNgWeaponDropsPatches.js';
import { dGradeWeaponDropsPreviewLines } from '../src/data/l2dopDWeaponDropsPatches.js';
import { cGradeWeaponDropsPreviewLines } from '../src/data/l2dopCWeaponDropsPatches.js';
import { bGradeWeaponDropsPreviewLines } from '../src/data/l2dopBWeaponDropsPatches.js';
import { aGradeWeaponDropsPreviewLines } from '../src/data/l2dopAWeaponDropsPatches.js';
import { sGradeWeaponDropsPreviewLines } from '../src/data/l2dopSWeaponDropsPatches.js';
import { L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopNgWeaponDropsPatches.js';
import { L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopDWeaponDropsPatches.js';
import { L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopCWeaponDropsPatches.js';
import { L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopBWeaponDropsPatches.js';
import { L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopAWeaponDropsPatches.js';
import { L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopSWeaponDropsPatches.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
} from '../src/data/inventory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

const GRADE_PREVIEW_FN = [
  { grade: 'NG', map: L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER, fn: ngWeaponDropsPreviewLines },
  { grade: 'D', map: L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER, fn: dGradeWeaponDropsPreviewLines },
  { grade: 'C', map: L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER, fn: cGradeWeaponDropsPreviewLines },
  { grade: 'B', map: L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER, fn: bGradeWeaponDropsPreviewLines },
  { grade: 'A', map: L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER, fn: aGradeWeaponDropsPreviewLines },
  { grade: 'S', map: L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER, fn: sGradeWeaponDropsPreviewLines },
] as const;

const BERSERKER_BLADE_ID = 5286;

function expectTrue(label: string, v: boolean, errors: string[]): void {
  if (!v) errors.push(label);
}

function main(): void {
  const errors: string[] = [];
  const rows = collectAllCanonWeapons();

  expectTrue('total weapons count', rows.length === TOTAL_CANON_WEAPONS, errors);

  const { issues } = auditAllCanonWeapons();
  for (const i of issues) {
    errors.push(`audit ${i.kind} #${i.itemId} ${i.name}: ${i.detail}`);
  }

  for (const row of rows) {
    const meta = ITEM_CATALOG[row.itemId];
    if (!meta) {
      errors.push(`#${row.itemId} missing ITEM_CATALOG`);
      continue;
    }
    if (meta.pAtk !== row.pAtk) {
      errors.push(`#${row.itemId} ITEM_CATALOG pAtk ${meta.pAtk} != canon ${row.pAtk}`);
    }
    if (meta.mAtk !== row.mAtk) {
      errors.push(`#${row.itemId} ITEM_CATALOG mAtk ${meta.mAtk} != canon ${row.mAtk}`);
    }
    if (meta.pAtk == null || meta.pAtk <= 0) {
      errors.push(`#${row.itemId} invalid pAtk=${String(meta.pAtk)}`);
    }
    if (meta.mAtk == null || meta.mAtk <= 0) {
      errors.push(`#${row.itemId} invalid mAtk=${String(meta.mAtk)}`);
    }
  }

  for (const { map, fn } of GRADE_PREVIEW_FN) {
    for (const patch of Object.values(map)) {
      assertWeaponShopPreviewLines(
        fn(patch),
        {
          pAtk: patch.pAtk,
          mAtk: patch.mAtk,
          atkSpd: patch.speed,
          wpnCrit: patch.crit,
        },
        -1,
        errors,
      );
    }
  }

  const shopCatalog = buildDropsShopCatalogForClient();
  let weaponRowCount = 0;
  for (const g of shopCatalog.grades) {
    for (const s of g.sections) {
      if (s.category !== 'weapon') continue;
      for (const row of s.items) {
        weaponRowCount++;
        const meta = ITEM_CATALOG[row.itemId];
        if (!meta || meta.slot !== 'rhand') continue;
        const preview = row.statsPreview?.lines ?? [];
        if (preview.length === 0) continue;
        const text = preview.map((l) => l.valueUk).join(' ');
        if (meta.pAtk != null && meta.pAtk > 0 && !text.includes(`Фіз. атака: ${meta.pAtk}`)) {
          errors.push(
            `#${row.itemId} shop catalog preview missing Фіз. атака: ${meta.pAtk}`,
          );
        }
        if (meta.mAtk != null && meta.mAtk > 0 && !text.includes(`Маг. атака: ${meta.mAtk}`)) {
          errors.push(
            `#${row.itemId} shop catalog preview missing Маг. атака: ${meta.mAtk}`,
          );
        }
      }
    }
  }

  const overrideKeys = Object.keys(embeddedDropsShopOverrides).filter(
    (k) => !k.startsWith('_'),
  );
  for (const key of overrideKeys) {
    const entry = (embeddedDropsShopOverrides as Record<string, unknown>)[key];
    if (entry && typeof entry === 'object') {
      if ('pAtk' in entry || 'mAtk' in entry) {
        errors.push(`dropsShopOverrides ${key} must not override pAtk/mAtk`);
      }
    }
  }

  const berserker = C_WEAPON_BY_ITEM_ID.get(BERSERKER_BLADE_ID);
  if (!berserker || berserker.pAtk !== 190 || berserker.mAtk !== 83) {
    errors.push('Berserker Blade canonical stats mismatch');
  }
  const berserkerPreview = buildWeaponShopPreviewLinesUk({
    pAtk: 190,
    mAtk: 83,
    atkSpd: 325,
    wpnCrit: berserker?.wpnCrit ?? 0,
  });
  assertWeaponShopPreviewLines(
    berserkerPreview,
    { pAtk: 190, mAtk: 83, atkSpd: 325, wpnCrit: berserker!.wpnCrit },
    BERSERKER_BLADE_ID,
    errors,
  );

  let inv = emptyInventory();
  inv = addItemToBag(inv, BERSERKER_BLADE_ID, 1);
  inv = equipFromBag(inv, BERSERKER_BLADE_ID, 0);
  const combat = computeCombatStats(40, 'Human', 'fighter', inv, {});
  const bare = computeCombatStats(40, 'Human', 'fighter', emptyInventory(), {});
  if (combat.pAtk <= bare.pAtk) {
    errors.push('Berserker Blade equip must increase pAtk');
  }

  const gmShopJs = fs.readFileSync(
    path.join(repoRoot, 'server/public/gm-shop.js'),
    'utf8',
  );
  if (!gmShopJs.includes('l2-gm-shop-row-stat-line')) {
    errors.push('gm-shop.js missing multi-line stat renderer');
  }

  if (errors.length > 0) {
    console.error(
      'test:weapon-shop-stats FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'),
    );
    process.exit(1);
  }

  console.log(
    `test:weapon-shop-stats OK (${TOTAL_CANON_WEAPONS} weapons, ${weaponRowCount} shop weapon rows)`,
  );
}

main();
