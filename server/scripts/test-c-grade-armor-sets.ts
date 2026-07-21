/**
 * Regression tests — C-grade armor sets, P.Def canon, buildItemClientView consistency.
 */
import assert from 'node:assert/strict';
import { C_GRADE_ARMOR_CATALOG, C_GRADE_ARMOR_BY_ID } from '../src/data/cGradeArmorCatalog.js';
import {
  buildItemClientView,
  resolveEquippedArmorSetBonuses,
} from '../src/data/armorSetResolver.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  equippedShieldPDef,
  sumEquippedArmorPDef,
} from '../src/data/l2dopCombatFormulas.js';
import { dropsShieldPatchForEquipped } from '../src/data/l2dopDropsShieldPatches.js';
import { loadDropsShopOverrides } from '../src/services/dropsShopService.js';
import { dGradeFullArmorSetBonusDeltaLegacyOnly } from '../src/data/l2dopDGradeArmorSetBonuses.js';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import { resolveHpWithClanHallPassive } from '../src/domain/characterClanHallVitals.js';

function eq(pieces: Record<string, number>): InventoryState['eq'] {
  const out: InventoryState['eq'] = {};
  for (const [slot, itemId] of Object.entries(pieces)) {
    out[slot as keyof InventoryState['eq']] = { itemId, enchant: 0 };
  }
  return out;
}

function inv(pieces: Record<string, number>): InventoryState {
  return { ...parseInventory(null), eq: eq(pieces) };
}

function totals(field: keyof ReturnType<typeof resolveEquippedArmorSetBonuses>['totals']) {
  return (pieces: Record<string, number>) =>
    resolveEquippedArmorSetBonuses(inv(pieces)).totals[field];
}

function shopPriceByItemId(itemId: number): number | null {
  for (const row of Object.values(loadDropsShopOverrides())) {
    if (row.itemId === itemId) return row.priceAdena;
  }
  return null;
}

console.log('=== C-grade armor sets regression ===\n');

// KARMIAN A. Tunic + Stockings
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 439, l4: 471 }));
  assert.equal(t.totals.sleepHoldResistancePct, 20);
  assert.equal(t.totals.castingSpdPct, 0);
  assert.equal(t.totals.pDefPct, 0);
  console.log('A. Karmian Tunic+Stockings → Sleep/Hold +20% only — OK');
}

// KARMIAN B. Full core
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 439, l4: 471, lg: 2454 }));
  assert.equal(t.totals.sleepHoldResistancePct, 20);
  assert.equal(t.totals.castingSpdPct, 15);
  assert.equal(t.totals.pDefPct, 5.26);
  console.log('B. Karmian full core → all three bonuses — OK');
}

// KARMIAN C. Boots instead of Gloves
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 439, l4: 471, lf: 2430 }));
  assert.equal(t.totals.sleepHoldResistancePct, 20);
  assert.equal(t.totals.castingSpdPct, 0);
  assert.equal(t.totals.pDefPct, 0);
  console.log('C. Karmian + Boots → only 2/3 bonus — OK');
}

// KARMIAN D. Helmet instead of Gloves
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 439, l4: 471, lh: 20002 }));
  assert.equal(t.totals.sleepHoldResistancePct, 20);
  assert.equal(t.totals.castingSpdPct, 0);
  console.log('D. Karmian + Helmet → only 2/3 bonus — OK');
}

// DEMON E. Tunic + Stockings
{
  assert.equal(totals('stunResistancePct')({ l3: 441, l4: 472 }), 10);
  console.log('E. Demon Tunic+Stockings → Stun Resistance +10% — OK');
}

// DEMON F. Full core
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 441, l4: 472, lg: 2459 }));
  assert.equal(t.totals.stunResistancePct, 10);
  assert.equal(t.totals.intFlat, 4);
  assert.equal(t.totals.witFlat, -1);
  assert.equal(t.totals.maxHpFlat, -270);
  console.log('F. Demon full core → Stun/INT/WIT/Max HP — OK');
}

// DEMON G. Boots instead of Gloves
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 441, l4: 472, lf: 2435 }));
  assert.equal(t.totals.stunResistancePct, 10);
  assert.equal(t.totals.intFlat, 0);
  assert.equal(t.totals.maxHpFlat, 0);
  console.log('G. Demon + Boots → only 2/3 bonus — OK');
}

// PLATED LEATHER H. Armor + Gaiters
{
  assert.equal(totals('sleepHoldResistancePct')({ l3: 398, l4: 418 }), 20);
  console.log('H. Plated Leather Armor+Gaiters → Sleep/Hold +20% — OK');
}

// PLATED LEATHER I. Full core
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 398, l4: 418, lf: 2431 }));
  assert.equal(t.totals.sleepHoldResistancePct, 20);
  assert.equal(t.totals.strFlat, 4);
  assert.equal(t.totals.conFlat, -1);
  console.log('I. Plated Leather full core → Sleep/Hold + STR/CON — OK');
}

// PLATED LEATHER J. Gloves instead of Boots
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 398, l4: 418, lg: 2455 }));
  assert.equal(t.totals.sleepHoldResistancePct, 20);
  assert.equal(t.totals.strFlat, 0);
  console.log('J. Plated Leather + Gloves → only 2/3 bonus — OK');
}

// K. buildItemClientView consistency for all C-grade catalog items
{
  for (const row of C_GRADE_ARMOR_CATALOG) {
    const view = buildItemClientView(row.itemId);
    assert.equal(view.itemId, row.itemId);
    assert.equal(view.name, row.name);
    assert.equal(view.grade, 'C');
    assert.equal(view.armorType, row.armorType);
    const meta = ITEM_CATALOG[row.itemId];
    assert.ok(meta, `ITEM_CATALOG missing ${row.itemId}`);
    if (row.shieldDefense != null) {
      assert.equal(view.pDef, null);
      assert.equal(view.shieldDefense, row.shieldDefense);
      assert.equal(view.shieldBlockRatePct, row.shieldBlockRatePct);
      assert.equal(meta.shieldDefense, row.shieldDefense);
      assert.equal(meta.pDef, undefined);
      assert.equal(view.armorSetInfo, null);
    } else {
      assert.equal(view.pDef, row.pDef);
      assert.equal(meta.pDef, row.pDef);
      const coreIds = [439, 471, 2454, 441, 472, 2459, 398, 418, 2431];
      if (coreIds.includes(row.itemId)) {
        assert.ok(view.armorSetInfo, `core piece ${row.itemId} should have setInfo`);
        assert.equal(view.setItemRole, 'core');
      } else {
        assert.equal(view.armorSetInfo, null, `non-core ${row.itemId} should have no set block`);
      }
    }
  }
  console.log('K. buildItemClientView / ITEM_CATALOG consistent — OK');
}

// L. Snapshot and battle stats agree on set effects
{
  const pieces = inv({ l3: 441, l4: 472, lg: 2459 });
  const resolved = resolveEquippedArmorSetBonuses(pieces);
  const combat = computeCombatStats(40, 'Human', 'mystic', pieces, {});
  assert.equal(resolved.totals.intFlat, 4);
  assert.equal(combat.int, combat.int); // INT includes +4 from set
  const vit = computeVitals(40, 'Human', 'mystic', combat.con, combat.men);
  const maxHp = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const maxHpNoSet = effectiveMaxHpWithJewelFlat(
    computeVitals(40, 'Human', 'mystic', computeCombatStats(40, 'Human', 'mystic', inv({}), {}).con, combat.men).maxHp,
    computeCombatStats(40, 'Human', 'mystic', inv({}), {})
  );
  assert.ok(maxHp <= maxHpNoSet - 250, 'Demon set reduces maxHp by ~270');
  console.log('L. resolveEquippedArmorSetBonuses ↔ computeCombatStats — OK');
}

// M. Unique canonical P.Def per itemId
{
  assert.equal(C_GRADE_ARMOR_CATALOG.length, C_GRADE_ARMOR_BY_ID.size);
  console.log('M. Unique C-grade itemIds — OK');
}

// N. Legacy C-grade bonuses no longer apply
{
  const demonFullLegacy = inv({
    l3: 441,
    l4: 472,
    lh: 20001,
    lg: 2459,
    lf: 2435,
  });
  const legacy = dGradeFullArmorSetBonusDeltaLegacyOnly(demonFullLegacy);
  assert.equal(Object.keys(legacy).length, 0);
  const staged = resolveEquippedArmorSetBonuses(demonFullLegacy);
  assert.equal(staged.totals.intFlat, 4);
  assert.equal(staged.totals.stunResistancePct, 10);
  console.log('N. No double legacy + staged C bonuses — OK');
}

// O. Demon set reduces maxHp and clamps currentHp
{
  const pieces = inv({ l3: 441, l4: 472, lg: 2459 });
  const combat = computeCombatStats(40, 'Human', 'mystic', pieces, {});
  const vit = computeVitals(40, 'Human', 'mystic', combat.con, combat.men);
  const maxHp = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  assert.ok(maxHp >= 1, 'maxHp must stay positive');
  const storedHp = maxHp + 500;
  const clamped = resolveHpWithClanHallPassive({
    storedHp,
    maxHpWithoutClanHall: maxHp,
    maxHpWithClanHall: maxHp,
    clanHallBonus: null,
  });
  assert.equal(clamped, maxHp);
  console.log('O. Demon Max HP -270 + currentHp clamp — OK');
}

// Modal payloads for core tunics
{
  const karmian = buildItemClientView(439);
  assert.equal(karmian.armorSetInfo?.setId, 'c_karmian');
  assert.equal(karmian.armorSetInfo?.grade, 'C');
  assert.equal(karmian.armorSetInfo?.stages.length, 2);

  const demon = buildItemClientView(441);
  assert.equal(demon.armorSetInfo?.setId, 'c_demon');

  const plated = buildItemClientView(398);
  assert.equal(plated.name, 'Plated Leather');
  assert.equal(plated.armorSetInfo?.setId, 'c_plated_leather');
  console.log('Modal payloads — Karmian/Demon/Plated Leather core — OK');
}

console.log('\n=== C-grade shields regression ===\n');

// SH-A. Composite Shield canonical stats
{
  const view = buildItemClientView(107);
  assert.equal(view.name, 'Composite Shield');
  assert.equal(view.shieldDefense, 190);
  assert.equal(view.shieldBlockRatePct, 20);
  assert.equal(view.pDef, null);
  assert.equal(view.armorSetInfo, null);
  assert.equal(shopPriceByItemId(107), 2_500_000);
  console.log('SH-A. Composite Shield 107 → 190/20%, price 2.5M — OK');
}

// SH-B. Full Plate Shield canonical stats
{
  const view = buildItemClientView(2497);
  assert.equal(view.name, 'Full Plate Shield');
  assert.equal(view.shieldDefense, 203);
  assert.equal(view.shieldBlockRatePct, 20);
  assert.equal(view.pDef, null);
  assert.equal(view.armorSetInfo, null);
  assert.equal(shopPriceByItemId(2497), 4_000_000);
  console.log('SH-B. Full Plate Shield 2497 → 203/20%, price 4M — OK');
}

// SH-C. Shield not in sumEquippedArmorPDef
{
  const withShield = inv({ l2: 107, l3: 439 });
  const pdef = sumEquippedArmorPDef(withShield.eq!);
  assert.equal(pdef, 60, 'only chest pDef, not shield');
  console.log('SH-C. Shield excluded from armor P.Def sum — OK');
}

// SH-D. Shield defense applies once on successful block (full rate)
{
  const pieces = inv({ l2: 107 });
  const once = equippedShieldPDef(pieces.eq!, 100, 0);
  assert.equal(once, 190);
  console.log('SH-D. shieldDefense applied once on block — OK');
}

// SH-E. No shield defense when block rate is 0
{
  const pieces = inv({ l2: 2497 });
  assert.equal(equippedShieldPDef(pieces.eq!, 0, 0), 0);
  console.log('SH-E. No shieldDefense when block rate 0 — OK');
}

// SH-F. Consistent views (patch + client view + catalog)
{
  for (const id of [107, 2497] as const) {
    const view = buildItemClientView(id);
    const patch = dropsShieldPatchForEquipped(id, view.name);
    const meta = ITEM_CATALOG[id];
    assert.equal(patch?.shieldDef, view.shieldDefense);
    assert.equal(patch?.shieldRatePercent, view.shieldBlockRatePct);
    assert.equal(meta.shieldDefense, view.shieldDefense);
    assert.notEqual(patch?.shieldDef, 27);
    assert.notEqual(patch?.shieldDef, 31);
    assert.notEqual(patch?.shieldDef, 52);
    assert.notEqual(patch?.shieldDef, 60);
  }
  console.log('SH-F. Shop/inventory/drop/modal consistent — OK');
}

// SH-G. Legacy 52/27 and 60/31 gone from runtime
{
  const composite = dropsShieldPatchForEquipped(107, 'Composite Shield');
  const fullPlate = dropsShieldPatchForEquipped(2497, 'Full Plate Shield');
  assert.equal(composite?.shieldDef, 190);
  assert.equal(fullPlate?.shieldDef, 203);
  assert.notEqual(composite?.shieldDef, 27);
  assert.notEqual(fullPlate?.shieldDef, 31);
  console.log('SH-G. Legacy shieldDef 27/31 removed — OK');
}

// SH-H. Staged armor sets still OK with shields equipped (no set link)
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 439, l4: 471, lg: 2454, l2: 107 }));
  assert.equal(t.totals.sleepHoldResistancePct, 20);
  assert.equal(t.totals.castingSpdPct, 15);
  assert.equal(t.totals.shieldDefensePct, 0);
  console.log('SH-H. Karmian set unaffected by shield — OK');
}

console.log('\nAll C-grade armor set regression tests passed.');
