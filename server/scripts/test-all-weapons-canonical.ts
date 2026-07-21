/**
 * Regression: канонічність усіх 144 зброї + стріли/щит/Frenzy/read-repair.
 * npm run test:all-weapons-canonical
 */
import {
  auditAllCanonWeapons,
  collectAllCanonWeapons,
  EXPECTED_GRADE_COUNTS,
  REGRESSION_ITEM_IDS,
  TOTAL_CANON_WEAPONS,
} from './lib/weaponCanonAuditCore.js';
import { ITEM_CATALOG, listGearCatalogForClient } from '../src/data/itemsCatalog.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
  parseInventoryRaw,
} from '../src/data/inventory.js';
import {
  assertBowArrowsForBattleAction,
  consumeBowArrowsOnHit,
} from '../src/domain/battleBowArrowConsumption.js';
import { equippedWeaponKind } from '../src/data/l2dopHumanFighterBattleSkills.js';
import {
  itemBlocksShieldSlot,
  itemRequiresArrowsHintsForClient,
} from '../src/data/l2dopTwoHandedWeapon.js';
import {
  isTwoHandHeavyWeaponType,
  requiresArrowsForWeaponType,
  weaponTypeBlocksShield,
} from '../src/data/weaponTypeContract.js';

function expectEq<T>(label: string, actual: T, expected: T, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function expectTrue(label: string, v: boolean, errors: string[]): void {
  if (!v) errors.push(`${label}: expected true`);
}

function expectFalse(label: string, v: boolean, errors: string[]): void {
  if (v) errors.push(`${label}: expected false`);
}

function eqItemId(slotVal: unknown): number | null {
  if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
  if (slotVal && typeof slotVal === 'object' && 'itemId' in slotVal) {
    const n = Number((slotVal as { itemId: unknown }).itemId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

/** Симуляція client fallback: explicit false не замінюється || fallback. */
function clientBlocksShieldResolve(item: {
  blocksShield?: boolean;
}): boolean {
  const fallback = weaponTypeBlocksShield('blunt');
  return Object.prototype.hasOwnProperty.call(item, 'blocksShield')
    ? item.blocksShield!
    : fallback;
}

function main(): void {
  const errors: string[] = [];
  const { issues } = auditAllCanonWeapons();
  for (const i of issues) {
    errors.push(`audit ${i.kind} #${i.itemId} ${i.name}: ${i.detail}`);
  }

  const rows = collectAllCanonWeapons();
  expectEq('total weapons', rows.length, TOTAL_CANON_WEAPONS, errors);

  for (const [grade, count] of Object.entries(EXPECTED_GRADE_COUNTS)) {
    const actual = rows.filter((r) => r.grade === grade).length;
    expectEq(`${grade} count`, actual, count, errors);
  }

  const gearById = new Map(listGearCatalogForClient().map((r) => [r.itemId, r]));
  for (const row of rows) {
    expectEq(
      `#${row.itemId} requiresArrows rule`,
      requiresArrowsForWeaponType(row.weaponType),
      row.requiresArrows,
      errors,
    );
    const gear = gearById.get(row.itemId);
    if (gear) {
      expectEq(
        `#${row.itemId} gear weaponType`,
        gear.weaponType,
        row.weaponType,
        errors,
      );
    }
    const catalog = ITEM_CATALOG[row.itemId];
    if (catalog) {
      expectEq(
        `#${row.itemId} catalog weaponType`,
        catalog.weaponType,
        row.weaponType,
        errors,
      );
    }
  }

  // Regression items
  const R = REGRESSION_ITEM_IDS;
  expectEq('308 weaponType', ITEM_CATALOG[R.buffaloHorn]?.weaponType, 'blunt', errors);
  expectFalse('308 blocksShield', itemBlocksShieldSlot(R.buffaloHorn, 'blunt'), errors);
  expectFalse('308 requiresArrows', requiresArrowsForWeaponType('blunt'), errors);

  expectEq('164 weaponType', ITEM_CATALOG[R.elysian]?.weaponType, 'blunt', errors);
  expectFalse('164 blocksShield', itemBlocksShieldSlot(R.elysian, 'blunt'), errors);

  expectEq('253 weaponType', ITEM_CATALOG[R.spikedGloves]?.weaponType, 'fist', errors);
  expectTrue('253 blocksShield', itemBlocksShieldSlot(R.spikedGloves, 'fist'), errors);
  expectFalse('253 requiresArrows', requiresArrowsForWeaponType('fist'), errors);

  expectEq('7575 weaponType', ITEM_CATALOG[R.draconicBow]?.weaponType, 'bow', errors);
  expectTrue('7575 blocksShield', itemBlocksShieldSlot(R.draconicBow, 'bow'), errors);
  expectTrue('7575 requiresArrows', requiresArrowsForWeaponType('bow'), errors);
  expectFalse('Frenzy bow isTwoHandHeavy', isTwoHandHeavyWeaponType('bow'), errors);

  expectEq('6368 weaponType', ITEM_CATALOG[R.shiningBow]?.weaponType, 'bow', errors);
  expectTrue('6368 requiresArrows', requiresArrowsForWeaponType('bow'), errors);

  expectEq('82 weaponType', ITEM_CATALOG[R.godsBlade]?.weaponType, 'sword', errors);
  expectFalse('82 blocksShield', itemBlocksShieldSlot(R.godsBlade, 'sword'), errors);

  // Battle: bow without arrows blocks attack
  let invBow = emptyInventory();
  invBow = addItemToBag(invBow, R.draconicBow, 1);
  invBow = equipFromBag(invBow, R.draconicBow, 0);
  expectEq('bow equipped kind', equippedWeaponKind(invBow), 'bow', errors);
  let bowBlocked = false;
  try {
    assertBowArrowsForBattleAction('attack', invBow, 'human', 'fighter');
  } catch (e) {
    if (e instanceof Error && e.message === 'battle_no_arrows') bowBlocked = true;
  }
  expectTrue('bow no arrows blocks attack', bowBlocked, errors);
  const consumeEmpty = consumeBowArrowsOnHit(invBow, 'attack', 'human', 'fighter');
  expectEq('bow no consume without arrows', consumeEmpty.consumed, 0, errors);

  // Blunt with arrows in bag still attacks
  let invBlunt = emptyInventory();
  invBlunt = addItemToBag(invBlunt, R.buffaloHorn, 1);
  invBlunt = addItemToBag(invBlunt, 17, 100);
  invBlunt = equipFromBag(invBlunt, R.buffaloHorn, 0);
  let bluntOk = true;
  try {
    assertBowArrowsForBattleAction('attack', invBlunt, 'human', 'fighter');
  } catch {
    bluntOk = false;
  }
  expectTrue('blunt attack not blocked by arrow check', bluntOk, errors);

  // Pole/fist without arrows
  for (const id of [253] as const) {
    let inv = emptyInventory();
    inv = addItemToBag(inv, id, 1);
    inv = equipFromBag(inv, id, 0);
    let ok = true;
    try {
      assertBowArrowsForBattleAction('attack', inv, 'human', 'fighter');
    } catch {
      ok = false;
    }
    expectTrue(`#${id} attack without arrows`, ok, errors);
  }

  // Client explicit false
  expectFalse(
    'client explicit blocksShield false',
    clientBlocksShieldResolve({ blocksShield: false }),
    errors,
  );
  expectTrue(
    'client explicit blocksShield true',
    clientBlocksShieldResolve({ blocksShield: true }),
    errors,
  );

  // Read-repair duplicate l1/l2 weapon
  const dup = parseInventoryRaw({
    stacks: [],
    eq: { l1: R.buffaloHorn, l2: R.buffaloHorn },
  });
  expectEq('read-repair l1', eqItemId(dup.eq.l1), R.buffaloHorn, errors);
  expectEq('read-repair l2 cleared', eqItemId(dup.eq.l2), null, errors);

  expectFalse('Frenzy bow isTwoHandHeavy (alias)', isTwoHandHeavyWeaponType('bow'), errors);
  expectTrue('Frenzy bigsword isTwoHandHeavy', isTwoHandHeavyWeaponType('bigsword'), errors);

  // Arrow hints only for bows
  const arrowHints = itemRequiresArrowsHintsForClient();
  for (const row of rows) {
    const hint = arrowHints[row.itemId] === true;
    expectEq(`#${row.itemId} arrow hint`, hint, row.requiresArrows, errors);
  }

  if (errors.length > 0) {
    console.error(
      'test:all-weapons-canonical FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'),
    );
    process.exit(1);
  }

  console.log(`test:all-weapons-canonical OK (${TOTAL_CANON_WEAPONS} weapons)`);
}

main();
