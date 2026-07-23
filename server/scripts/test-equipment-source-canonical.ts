/**
 * Канонічність джерел отримання NG/D/C/B зброї.
 * npm run test:equipment-source-canonical
 *
 * Перевіряє ланцюг: shop/drop source itemId → ITEM_CATALOG → *WeaponCatalog.
 * Дропи та магазин не повинні містити власні pAtk/mAtk, що розходяться з ITEM_CATALOG.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import { DROPS_SHOP_CATALOG } from '../src/data/dropsShopCatalog.generated.js';
import { L2DOP_GM_SHOP_WEAPONS } from '../src/data/l2dopGmShopCatalog.generated.js';
import { NG_WEAPON_CATALOG, type NgWeaponCanonEntry } from '../src/data/ngWeaponCatalog.js';
import { D_WEAPON_CATALOG, type DWeaponCanonEntry } from '../src/data/dWeaponCatalog.js';
import { C_WEAPON_CATALOG, type CWeaponCanonEntry } from '../src/data/cWeaponCatalog.js';
import {
  B_WEAPON_CATALOG,
  B_WEAPON_ITEM_IDS,
  type BWeaponCanonEntry,
} from '../src/data/bWeaponCatalog.js';
import {
  A_WEAPON_CATALOG,
  A_WEAPON_ITEM_IDS,
  type AWeaponCanonEntry,
} from '../src/data/aWeaponCatalog.js';
import {
  S_WEAPON_CATALOG,
  S_WEAPON_EVENT_ITEM_IDS,
  S_WEAPON_ITEM_IDS,
  type SWeaponCanonEntry,
} from '../src/data/sWeaponCatalog.js';
import { L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopNgWeaponDropsPatches.js';
import { L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopDWeaponDropsPatches.js';
import { L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopCWeaponDropsPatches.js';
import { L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopBWeaponDropsPatches.js';
import { L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopAWeaponDropsPatches.js';
import { L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../src/data/l2dopSWeaponDropsPatches.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import { auditDropsShopItemIdCollisions } from '../src/domain/dropsShopItemIdCollisions.js';
import { RB_DROP_ITEM } from '../src/data/l2dopRaidBossDropShared.js';
import { RB_DROP_ITEM_C } from '../src/data/l2dopRaidBossDropSharedC.js';
import { RB_DROP_ITEM_B } from '../src/data/l2dopRaidBossDropSharedB.js';
import { RB_DROP_ITEM_A } from '../src/data/l2dopRaidBossDropSharedA.js';
import { RB_DROP_ITEM_S } from '../src/data/l2dopRaidBossDropSharedS.js';
import { L2DOP_ITEM_GRADE_UK } from '../src/data/l2dopItemDisplayNameUk.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

type Grade = 'NG' | 'D' | 'C' | 'B' | 'A' | 'S';
type OverrideRow = { itemId?: number; priceAdena?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

const GRADE_BY_SHOP_KEY = new Map(
  DROPS_SHOP_CATALOG.map((row) => [
    row.shopKey.replace(/\\/g, '/').toLowerCase(),
    row.grade as Grade,
  ]),
);

function shopKeyNorm(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

function expectEq<T>(label: string, actual: T, expected: T, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function expectNoEmbeddedStats(obj: Record<string, unknown>, label: string, errors: string[]): void {
  for (const key of ['pAtk', 'mAtk', 'pDef', 'mDef', 'atkSpd', 'wpnCrit', 'rCrit'] as const) {
    if (obj[key] != null) {
      errors.push(`${label} must not embed ${key} (use ITEM_CATALOG via itemId only)`);
    }
  }
}

function resolveGrade(itemId: number, shopKey: string): Grade | null {
  const fromShop = GRADE_BY_SHOP_KEY.get(shopKeyNorm(shopKey));
  if (fromShop) return fromShop;
  const hint = L2DOP_ITEM_GRADE_UK[itemId];
  if (hint === 'NG' || hint === 'D' || hint === 'C' || hint === 'B' || hint === 'A' || hint === 'S') {
    return hint;
  }
  const gm = L2DOP_GM_SHOP_WEAPONS.find((w) => w.itemId === itemId);
  if (
    gm?.grade === 'NG' ||
    gm?.grade === 'D' ||
    gm?.grade === 'C' ||
    gm?.grade === 'B' ||
    gm?.grade === 'A' ||
    gm?.grade === 'S'
  ) {
    return gm.grade;
  }
  return null;
}

function checkNgEntry(entry: NgWeaponCanonEntry, errors: string[]): void {
  const key = shopKeyNorm(entry.shopKey);
  const override = overrides[entry.shopKey];
  expectEq(`NG ${entry.shopKey} override itemId`, override?.itemId ?? null, entry.itemId, errors);
  expectEq(`NG grade ${entry.shopKey}`, resolveGrade(entry.itemId, entry.shopKey), 'NG', errors);

  const catalog = ITEM_CATALOG[entry.itemId];
  if (!catalog) {
    errors.push(`NG missing ITEM_CATALOG[${entry.itemId}]`);
    return;
  }
  expectEq(`NG #${entry.itemId} weaponType`, catalog.weaponType, entry.weaponType, errors);
  expectEq(`NG #${entry.itemId} atkSpd`, catalog.atkSpd, entry.atkSpd, errors);
  expectEq(`NG #${entry.itemId} pAtk`, catalog.pAtk, entry.pAtk, errors);
  expectEq(`NG #${entry.itemId} mAtk`, catalog.mAtk, entry.mAtk, errors);
  expectEq(`NG #${entry.itemId} wpnCrit`, catalog.wpnCrit, entry.wpnCrit, errors);
  if (catalog.rCrit != null && catalog.rCrit !== 0) {
    errors.push(`NG #${entry.itemId} unexpected rCrit ${catalog.rCrit}`);
  }

  const patch = L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
  if (!patch) {
    errors.push(`NG missing preview patch ${entry.shopKey}`);
  }

  expectEq(
    `NG #${entry.itemId} shield`,
    itemBlocksShieldSlot(entry.itemId, catalog.weaponType),
    entry.blocksShield,
    errors,
  );
}

function checkDcbEntry(
  grade: 'D' | 'C' | 'B' | 'A' | 'S',
  entry:
    | DWeaponCanonEntry
    | CWeaponCanonEntry
    | BWeaponCanonEntry
    | AWeaponCanonEntry
    | SWeaponCanonEntry,
  patchMap: Record<string, { mode: string; pAtk?: number; mAtk?: number; speed?: number; crit?: number }>,
  errors: string[],
): void {
  const key = shopKeyNorm(entry.shopKey);
  const override = overrides[entry.shopKey];
  expectEq(`${grade} ${entry.shopKey} override itemId`, override?.itemId ?? null, entry.itemId, errors);
  expectEq(`${grade} grade ${entry.shopKey}`, resolveGrade(entry.itemId, entry.shopKey), grade, errors);

  const catalog = ITEM_CATALOG[entry.itemId];
  if (!catalog) {
    errors.push(`${grade} missing ITEM_CATALOG[${entry.itemId}]`);
    return;
  }
  expectEq(`${grade} #${entry.itemId} weaponType`, catalog.weaponType, entry.weaponType, errors);
  expectEq(`${grade} #${entry.itemId} pAtk`, catalog.pAtk, entry.pAtk, errors);
  expectEq(`${grade} #${entry.itemId} atkSpd`, catalog.atkSpd, entry.atkSpd, errors);
  expectEq(`${grade} #${entry.itemId} wpnCrit`, catalog.wpnCrit, entry.wpnCrit, errors);
  if (entry.mAtk != null) {
    expectEq(`${grade} #${entry.itemId} mAtk`, catalog.mAtk, entry.mAtk, errors);
  }
  if (catalog.rCrit != null && catalog.rCrit !== 0) {
    errors.push(`${grade} #${entry.itemId} unexpected rCrit ${catalog.rCrit}`);
  }

  const patch = patchMap[key];
  if (!patch) {
    errors.push(`${grade} missing preview patch ${entry.shopKey}`);
    return;
  }
  if (entry.mode === 'magic') {
    expectEq(`${grade} preview mAtk ${entry.itemId}`, patch.mAtk, entry.mAtk, errors);
    expectEq(`${grade} preview speed ${entry.itemId}`, patch.speed, entry.atkSpd, errors);
  } else {
    expectEq(`${grade} preview pAtk ${entry.itemId}`, patch.pAtk, entry.pAtk, errors);
    expectEq(`${grade} preview speed ${entry.itemId}`, patch.speed, entry.atkSpd, errors);
    const displayCrit = 'displayCrit' in entry ? entry.displayCrit : entry.wpnCrit;
    expectEq(`${grade} preview crit ${entry.itemId}`, patch.crit, displayCrit ?? entry.wpnCrit, errors);
  }

  expectEq(
    `${grade} #${entry.itemId} shield`,
    itemBlocksShieldSlot(entry.itemId, catalog.weaponType),
    entry.blocksShield,
    errors,
  );
}

function checkLegacyBItemIds(errors: string[]): void {
  const wrongShopBindings: Array<[string, number]> = [
    ['weapon_b/kaim_vanul_s_bones.jpg', 7893],
    ['weapon_b/sword_of_damascus.jpg', 7897],
    ['weapon_b/wizard_s_tear.jpg', 7889],
  ];
  for (const [shopKey, badId] of wrongShopBindings) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`dropsShopOverrides ${shopKey} still uses legacy itemId ${badId}`);
    }
  }

  const rbChecks: Array<[keyof typeof RB_DROP_ITEM_B, number, string]> = [
    ['kaimVanulsBones', 8340, "Kaim Vanul's Bones"],
    ['swordOfDamascus', 79, 'Sword of Damascus'],
    ['wizardsTear', 8336, "Wizard's Tear"],
    ['spiritsStaff', 7889, "Spirit's Staff"],
  ];
  for (const [key, expectedId, name] of rbChecks) {
    const def = RB_DROP_ITEM_B[key];
    expectEq(`RB B ${name} itemId`, def.l2ItemId, expectedId, errors);
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB_DROP_ITEM_B.${String(key)}`, errors);
  }

  // 7893 = Bellion, 7897 = C Dwarven Hammer — must not be B Damascus/Kaim/Wizard
  expectEq('7893 is Bellion in B canon shop', overrides['weapon_b/bellion_cestus.jpg']?.itemId, 7893, errors);
  expectEq('7897 is C Dwarven Hammer shop', overrides['weapon_c/dwarven_hammer.jpg']?.itemId, 7897, errors);
  expectEq('7889 is Spirit Staff shop', overrides['weapon_b/spirit_s_staff.jpg']?.itemId, 7889, errors);
}

function checkLegacySItemIds(errors: string[]): void {
  const eventIds = [...S_WEAPON_EVENT_ITEM_IDS, 910203];
  const wrongShopBindings: Array<[string, number]> = [
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
  for (const [shopKey, badId] of wrongShopBindings) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`dropsShopOverrides ${shopKey} still uses legacy itemId ${badId}`);
    }
  }

  for (const [shopKey, row] of Object.entries(overrides)) {
    if (!shopKey.startsWith('weapon_s/')) continue;
    if (row.itemId != null && eventIds.includes(row.itemId)) {
      errors.push(`dropsShopOverrides ${shopKey} uses Event/synthetic itemId ${row.itemId}`);
    }
  }

  const rbChecks: Array<[keyof typeof RB_DROP_ITEM_S, number, string]> = [
    ['angelSlayer', 6367, 'Angel Slayer'],
    ['arcanaMace', 6579, 'Arcana Mace'],
    ['basaltBattlehammer', 6365, 'Basalt Battlehammer'],
    ['demonSplinter', 6371, 'Demon Splinter'],
    ['draconicBow', 7575, 'Draconic Bow'],
    ['dragonHunterAxe', 6369, 'Dragon Hunter Axe'],
    ['heavensDivider', 6372, "Heaven's Divider"],
    ['imperialStaff', 6366, 'Imperial Staff'],
    ['saintSpear', 6370, 'Saint Spear'],
    ['shiningBow', 6368, 'Shining Bow'],
  ];
  for (const [key, expectedId, name] of rbChecks) {
    const def = RB_DROP_ITEM_S[key];
    expectEq(`RB S ${name} itemId`, def.l2ItemId, expectedId, errors);
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB_DROP_ITEM_S.${String(key)}`, errors);
    if (eventIds.includes(def.l2ItemId)) {
      errors.push(`RB S ${name} must not use Event itemId ${def.l2ItemId}`);
    }
  }
}

function checkGmDoesNotOverrideSCanon(errors: string[]): void {
  for (const entry of S_WEAPON_CATALOG) {
    const gm = L2DOP_GM_SHOP_WEAPONS.find((w) => w.itemId === entry.itemId);
    const catalog = ITEM_CATALOG[entry.itemId];
    if (!catalog || !gm) continue;

    const gmDiffersFromCanon =
      gm.pAtk !== entry.pAtk ||
      gm.atkSpd !== entry.atkSpd ||
      gm.weaponType !== entry.weaponType ||
      (entry.mAtk != null && gm.mAtk !== entry.mAtk);

    const catalogMatchesGmExactly =
      catalog.pAtk === gm.pAtk &&
      catalog.atkSpd === gm.atkSpd &&
      catalog.weaponType === gm.weaponType &&
      catalog.mAtk === gm.mAtk;

    if (gmDiffersFromCanon && catalogMatchesGmExactly) {
      errors.push(
        `S #${entry.itemId}: ITEM_CATALOG matches stale GM/itemsDB stats instead of S-canon`,
      );
    }
  }
}

function checkLegacyAItemIds(errors: string[]): void {
  const wrongShopBindings: Array<[string, number]> = [
    ['weapon_a/elysian.jpg', 290],
    ['weapon_a/soul_bow.jpg', 7575],
    ['weapon_a/dasparion_s_staff.jpg', 210],
    ['weapon_a/sword_of_miracles.jpg', 88],
  ];
  for (const [shopKey, badId] of wrongShopBindings) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`dropsShopOverrides ${shopKey} still uses legacy itemId ${badId}`);
    }
  }

  const rbChecks: Array<[keyof typeof RB_DROP_ITEM_A, number, string]> = [
    ['elysian', 164, 'Elysian'],
    ['soulBow', 289, 'Soul Bow'],
    ['dasparionsStaff', 212, "Dasparion's Staff"],
    ['swordOfMiracles', 151, 'Sword of Miracles'],
    ['soulSeparator', 900217, 'Soul Separator'],
  ];
  for (const [key, expectedId, name] of rbChecks) {
    const def = RB_DROP_ITEM_A[key];
    expectEq(`RB A ${name} itemId`, def.l2ItemId, expectedId, errors);
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB_DROP_ITEM_A.${String(key)}`, errors);
  }
}

function checkGmDoesNotOverrideACanon(errors: string[]): void {
  for (const entry of A_WEAPON_CATALOG) {
    const gm = L2DOP_GM_SHOP_WEAPONS.find((w) => w.itemId === entry.itemId);
    const catalog = ITEM_CATALOG[entry.itemId];
    if (!catalog || !gm) continue;

    const gmDiffersFromCanon =
      gm.pAtk !== entry.pAtk ||
      gm.atkSpd !== entry.atkSpd ||
      gm.weaponType !== entry.weaponType ||
      (entry.mAtk != null && gm.mAtk !== entry.mAtk);

    const catalogMatchesGmExactly =
      catalog.pAtk === gm.pAtk &&
      catalog.atkSpd === gm.atkSpd &&
      catalog.weaponType === gm.weaponType &&
      catalog.mAtk === gm.mAtk;

    if (gmDiffersFromCanon && catalogMatchesGmExactly) {
      errors.push(
        `A #${entry.itemId}: ITEM_CATALOG matches stale GM/itemsDB stats instead of A-canon`,
      );
    }
  }
}

function checkGmDoesNotOverrideBCanon(errors: string[]): void {
  for (const entry of B_WEAPON_CATALOG) {
    const gm = L2DOP_GM_SHOP_WEAPONS.find((w) => w.itemId === entry.itemId);
    const catalog = ITEM_CATALOG[entry.itemId];
    if (!catalog || !gm) continue;

    const gmDiffersFromCanon =
      gm.pAtk !== entry.pAtk ||
      gm.atkSpd !== entry.atkSpd ||
      gm.weaponType !== entry.weaponType ||
      (entry.mAtk != null && gm.mAtk !== entry.mAtk);

    const catalogMatchesGmExactly =
      catalog.pAtk === gm.pAtk &&
      catalog.atkSpd === gm.atkSpd &&
      catalog.weaponType === gm.weaponType &&
      catalog.mAtk === gm.mAtk;

    if (gmDiffersFromCanon && catalogMatchesGmExactly) {
      errors.push(
        `B #${entry.itemId}: ITEM_CATALOG matches stale GM/itemsDB stats instead of B-canon`,
      );
    }
  }
}

function checkAbsentLegacyFiles(errors: string[]): void {
  const legacyPaths = [
    'src/data/shop/questShop.ts',
    'src/data/items/itemsDB_b.ts',
    'server/src/data/shop/questShop.ts',
    'server/src/data/items/itemsDB_b.ts',
  ];
  for (const rel of legacyPaths) {
    const abs = path.join(REPO_ROOT, rel);
    if (fs.existsSync(abs)) {
      errors.push(`Legacy file should not be active runtime source: ${rel}`);
    }
  }
}

function collectRbWeaponIds(
  bag: Record<string, { l2ItemId: number; displayName: string; iconUrl: string; kind?: string }>,
  weaponPrefix: string,
): number[] {
  return Object.entries(bag)
    .filter(([key, def]) => key.startsWith(weaponPrefix) || def.iconUrl.includes('/weapon_'))
    .map(([, def]) => def.l2ItemId);
}

function checkRaidBossDropAlignment(errors: string[]): void {
  const dWeaponIds = new Set(D_WEAPON_CATALOG.map((e) => e.itemId));
  const cWeaponIds = new Set(C_WEAPON_CATALOG.map((e) => e.itemId));
  const bWeaponIds = B_WEAPON_ITEM_IDS;

  for (const def of Object.values(RB_DROP_ITEM)) {
    if (!def.iconUrl.includes('/weapon_d/')) continue;
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB D ${def.displayName}`, errors);
    if (!dWeaponIds.has(def.l2ItemId)) {
      errors.push(`RB D weapon ${def.l2ItemId} (${def.displayName}) not in D_WEAPON_CATALOG`);
    }
  }
  for (const def of Object.values(RB_DROP_ITEM_C)) {
    if (!def.iconUrl.includes('/weapon_c/')) continue;
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB C ${def.displayName}`, errors);
    if (!cWeaponIds.has(def.l2ItemId)) {
      errors.push(`RB C weapon ${def.l2ItemId} (${def.displayName}) not in C_WEAPON_CATALOG`);
    }
  }
  for (const def of Object.values(RB_DROP_ITEM_B)) {
    if (!def.iconUrl.includes('/weapon_b/')) continue;
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB B ${def.displayName}`, errors);
    if (!bWeaponIds.has(def.l2ItemId)) {
      errors.push(`RB B weapon ${def.l2ItemId} (${def.displayName}) not in B_WEAPON_CATALOG`);
    }
  }
  for (const def of Object.values(RB_DROP_ITEM_A)) {
    if (!def.iconUrl.includes('/weapon_a/')) continue;
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB A ${def.displayName}`, errors);
    if (!A_WEAPON_ITEM_IDS.has(def.l2ItemId)) {
      errors.push(`RB A weapon ${def.l2ItemId} (${def.displayName}) not in A_WEAPON_CATALOG`);
    }
  }
  for (const def of Object.values(RB_DROP_ITEM_S)) {
    if (!def.iconUrl.includes('/weapon_s/')) continue;
    expectNoEmbeddedStats(def as unknown as Record<string, unknown>, `RB S ${def.displayName}`, errors);
    if (!S_WEAPON_ITEM_IDS.has(def.l2ItemId)) {
      errors.push(`RB S weapon ${def.l2ItemId} (${def.displayName}) not in S_WEAPON_CATALOG`);
    }
  }

  // silence unused helper warning
  void collectRbWeaponIds;
}

function main(): void {
  const errors: string[] = [];

  checkAbsentLegacyFiles(errors);

  for (const entry of NG_WEAPON_CATALOG) checkNgEntry(entry, errors);
  for (const entry of D_WEAPON_CATALOG) {
    checkDcbEntry('D', entry, L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER, errors);
  }
  for (const entry of C_WEAPON_CATALOG) {
    checkDcbEntry('C', entry, L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER, errors);
  }
  for (const entry of B_WEAPON_CATALOG) {
    checkDcbEntry('B', entry, L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER, errors);
  }
  for (const entry of A_WEAPON_CATALOG) {
    checkDcbEntry('A', entry, L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER, errors);
  }
  for (const entry of S_WEAPON_CATALOG) {
    checkDcbEntry('S', entry, L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER, errors);
  }

  checkLegacyBItemIds(errors);
  checkLegacyAItemIds(errors);
  checkLegacySItemIds(errors);
  checkGmDoesNotOverrideBCanon(errors);
  checkGmDoesNotOverrideACanon(errors);
  checkGmDoesNotOverrideSCanon(errors);
  checkRaidBossDropAlignment(errors);

  const collisions = auditDropsShopItemIdCollisions();
  if (collisions.length > 0) {
    errors.push(`dropsShop itemId collisions: ${collisions.length} (run test:drops-item-id-collisions)`);
  }

  if (errors.length > 0) {
    console.error('equipment-source-canonical FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  const total =
    NG_WEAPON_CATALOG.length +
    D_WEAPON_CATALOG.length +
    C_WEAPON_CATALOG.length +
    B_WEAPON_CATALOG.length +
    A_WEAPON_CATALOG.length +
    S_WEAPON_CATALOG.length;

  console.log('equipment-source-canonical OK');
  console.log(`  questShop.ts: not present in repo (no runtime quest weapon shop)`);
  console.log(`  itemsDB_b.ts: not present in repo (canon via *WeaponCatalog → ITEM_CATALOG)`);
  console.log(`  runtime stats path: itemsCatalog.ts → mergeNg/D/C/B/A/S → ITEM_CATALOG`);
  console.log(`  build-time GM gen: gen-l2dop-gm-shop-from-text-rpg.ts → external text-rpg itemsDB.ts`);
  console.log(
    `  grade counts: NG ${NG_WEAPON_CATALOG.length} (incl. #308 Buffalo's Horn), D ${D_WEAPON_CATALOG.length}, C ${C_WEAPON_CATALOG.length}, B ${B_WEAPON_CATALOG.length}, A ${A_WEAPON_CATALOG.length}, S ${S_WEAPON_CATALOG.length}`,
  );
  console.log(`  checked ${total} canonical weapons across shop + RB drop sources`);
}

main();
