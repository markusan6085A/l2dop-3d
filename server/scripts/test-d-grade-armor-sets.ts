/**
 * Regression tests — D-grade armor sets, shields, buildItemClientView consistency.
 */
import assert from 'node:assert/strict';
import { D_GRADE_ARMOR_CATALOG, D_GRADE_ARMOR_BY_ID } from '../src/data/dGradeArmorCatalog.js';
import {
  buildItemClientView,
  resolveEquippedArmorSetBonuses,
} from '../src/data/armorSetResolver.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { dropsShieldPatchForEquipped } from '../src/data/l2dopDropsShieldPatches.js';

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

console.log('=== D-grade armor sets regression ===\n');

// A. Knowledge 2/3
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 436, l4: 469 }));
  assert.equal(t.totals.maxMpFlat, 40);
  assert.equal(t.totals.mAtkPct, 0);
  console.log('A. Knowledge Tunic+Stockings → Max MP +40 — OK');
}

// B. Knowledge 3/3
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 436, l4: 469, lg: 2447 }));
  assert.equal(t.totals.maxMpFlat, 40);
  assert.equal(t.totals.mAtkPct, 10);
  console.log('B. Knowledge full core → Max MP +40, M.Atk +10% — OK');
}

// C. Knowledge + Helmet (not core)
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 436, l4: 469, lh: 41 }));
  assert.equal(t.totals.maxMpFlat, 40);
  assert.equal(t.totals.mAtkPct, 0);
  console.log('C. Knowledge + Helmet → only Max MP +40 — OK');
}

// D. Reinforced 2/3
{
  assert.equal(totals('maxMpFlat')({ l3: 394, l4: 416 }), 80);
  console.log('D. Reinforced Shirt+Gaiters → Max MP +80 — OK');
}

// E. Reinforced 3/3
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 394, l4: 416, lf: 2422 }));
  assert.equal(t.totals.maxMpFlat, 80);
  assert.equal(t.totals.addCritDmg, 10);
  console.log('E. Reinforced full core → Max MP +80, addCritDmg +10 — OK');
}

// F. Reinforced + Gloves (not core)
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 394, l4: 416, lg: 720 }));
  assert.equal(t.totals.maxMpFlat, 80);
  assert.equal(t.totals.addCritDmg, 0);
  console.log('F. Reinforced + Gloves → only Max MP +80 — OK');
}

// G. Mithril 2/3
{
  assert.equal(totals('maxHpFlat')({ l3: 58, l4: 59 }), 126);
  console.log('G. Mithril Breastplate+Gaiters → Max HP +126 — OK');
}

// H. Mithril 3/3 core
{
  const t = resolveEquippedArmorSetBonuses(inv({ lh: 499, l3: 58, l4: 59 }));
  assert.equal(t.totals.maxHpFlat, 126);
  assert.equal(t.totals.poisonResistancePct, 20);
  console.log('H. Mithril full core → Max HP +126, Poison +20% — OK');
}

// I. Mithril + Hoplon
{
  const t = resolveEquippedArmorSetBonuses(inv({ lh: 499, l3: 58, l4: 59, l2: 628 }));
  assert.equal(t.totals.shieldDefensePct, 2.63);
  assert.equal(t.totals.maxHpFlat, 126);
  assert.equal(t.totals.poisonResistancePct, 20);
  console.log('I. Mithril + Hoplon → all three bonuses — OK');
}

// J. Mithril + Bronze Shield
{
  const t = resolveEquippedArmorSetBonuses(inv({ lh: 499, l3: 58, l4: 59, l2: 626 }));
  assert.equal(t.totals.shieldDefensePct, 0);
  console.log('J. Mithril + Bronze Shield → no Shield Defense +2.63% — OK');
}

// K. Shields
{
  const bronze = dropsShieldPatchForEquipped(626, 'Bronze Shield');
  const hoplon = dropsShieldPatchForEquipped(628, 'Hoplon');
  const plate = dropsShieldPatchForEquipped(2494, 'Plate Shield');
  assert.equal(bronze?.shieldDef, 101);
  assert.equal(bronze?.shieldRatePercent, 20);
  assert.equal(hoplon?.shieldDef, 128);
  assert.equal(hoplon?.shieldRatePercent, 20);
  assert.equal(plate?.shieldDef, 154);
  assert.equal(plate?.shieldRatePercent, 20);
  console.log('K. Shields Bronze/Hoplon/Plate stats — OK');
}

// L. buildItemClientView consistency
{
  for (const row of D_GRADE_ARMOR_CATALOG) {
    const view = buildItemClientView(row.itemId);
    assert.equal(view.itemId, row.itemId);
    assert.equal(view.name, row.name);
    if (row.pDef != null) assert.equal(view.pDef, row.pDef);
    if (row.shieldDefense != null) {
      assert.equal(view.shieldDefense, row.shieldDefense);
      assert.equal(view.shieldBlockRatePct, row.shieldBlockRatePct);
    }
    const meta = ITEM_CATALOG[row.itemId];
    assert.ok(meta, `ITEM_CATALOG missing ${row.itemId}`);
    if (row.pDef != null) assert.equal(meta.pDef, row.pDef);
  }
  console.log('L. buildItemClientView / ITEM_CATALOG consistent — OK');
}

// M. No duplicate canonical entries
{
  assert.equal(D_GRADE_ARMOR_CATALOG.length, D_GRADE_ARMOR_BY_ID.size);
  console.log('M. Unique D-grade itemIds — OK');
}

// N. Snapshot vs battle set effects
{
  const pieces = inv({ lh: 499, l3: 58, l4: 59, l2: 628 });
  const resolved = resolveEquippedArmorSetBonuses(pieces);
  const combat = computeCombatStats(40, 'Human', 'fighter', pieces, {});
  assert.ok(combat.jewelFlatMaxHp >= 126, 'flat max HP from set');
  assert.ok(combat.buffMaxMpMul >= 1);
  assert.ok(
    resolved.totals.maxHpFlat === 126 && resolved.totals.poisonResistancePct === 20
  );
  console.log('N. resolveEquippedArmorSetBonuses ↔ computeCombatStats — OK');
}

console.log('\nAll D-grade armor set regression tests passed.');
