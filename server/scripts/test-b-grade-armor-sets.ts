/**
 * Regression tests — B-grade armor sets, P.Def canon, buildItemClientView consistency.
 */
import assert from 'node:assert/strict';
import { B_GRADE_ARMOR_CATALOG, B_GRADE_ARMOR_BY_ID } from '../src/data/bGradeArmorCatalog.js';
import {
  buildItemClientView,
  resolveEquippedArmorSetBonuses,
} from '../src/data/armorSetResolver.js';
import {
  computeCombatStats,
  equippedShieldPDef,
  sumEquippedArmorPDef,
} from '../src/data/l2dopCombatFormulas.js';
import { dropsShieldPatchForEquipped } from '../src/data/l2dopDropsShieldPatches.js';
import { COL_EQUIPMENT_PRICE_B } from '../src/domain/dropsShopCoinOfLuckPricing.js';
import { dGradeFullArmorSetBonusDeltaLegacyOnly } from '../src/data/l2dopDGradeArmorSetBonuses.js';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';

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

console.log('=== B-grade armor sets regression ===\n');

// AVADON A. Any 2 core pieces
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 30002, lh: 30001 }));
  assert.equal(t.totals.poisonResistancePct, 60);
  assert.equal(t.totals.bleedResistancePct, 60);
  assert.equal(t.totals.pDefPct, 0);
  assert.equal(t.totals.castingSpdPct, 0);
  console.log('A. Avadon 2/4 → Poison + Bleed only — OK');
}

// AVADON B. Any 3 core pieces
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 30002, lh: 30001, lg: 30003 }));
  assert.equal(t.totals.poisonResistancePct, 60);
  assert.equal(t.totals.bleedResistancePct, 60);
  assert.equal(t.totals.pDefPct, 5.26);
  assert.equal(t.totals.castingSpdPct, 0);
  console.log('B. Avadon 3/4 → + P.Def% — OK');
}

// AVADON C. Full 4/4
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 30002, lh: 30001, lg: 30003, lf: 30004 })
  );
  assert.equal(t.totals.poisonResistancePct, 60);
  assert.equal(t.totals.bleedResistancePct, 60);
  assert.equal(t.totals.pDefPct, 5.26);
  assert.equal(t.totals.castingSpdPct, 15);
  console.log('C. Avadon 4/4 → all bonuses — OK');
}

// AVADON D. Shield does not replace boots
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 30002, lh: 30001, lg: 30003, l2: 673 })
  );
  assert.equal(t.totals.pDefPct, 5.26);
  assert.equal(t.totals.castingSpdPct, 0);
  assert.equal(t.activeSets[0]?.equippedCorePieces, 3);
  console.log('D. Avadon + Shield → 3/4 only — OK');
}

// BLUE WOLF E. 2/5
{
  assert.equal(totals('hpRegenPct')({ l3: 358, l4: 2380 }), 5.24);
  console.log('E. Blue Wolf 2/5 → HP Recovery +5.24% — OK');
}

// BLUE WOLF F. 3/5
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 358, l4: 2380, lh: 2416 }));
  assert.equal(t.totals.hpRegenPct, 5.24);
  assert.equal(t.totals.speedFlat, 7);
  console.log('F. Blue Wolf 3/5 → HP Recovery + Speed — OK');
}

// BLUE WOLF G. 4/5
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 358, l4: 2380, lh: 2416, lg: 2487 }));
  assert.equal(t.totals.hpRegenPct, 5.24);
  assert.equal(t.totals.speedFlat, 7);
  assert.equal(t.totals.stunResistancePct, 30);
  assert.equal(t.totals.strFlat, 0);
  console.log('G. Blue Wolf 4/5 → + Stun Resistance — OK');
}

// BLUE WOLF H. 5/5
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 })
  );
  assert.equal(t.totals.strFlat, 3);
  assert.equal(t.totals.conFlat, -1);
  assert.equal(t.totals.dexFlat, -2);
  console.log('H. Blue Wolf 5/5 → STR/CON/DEX — OK');
}

// DOOM LIGHT I. 2/4
{
  assert.equal(totals('mpRegenPct')({ l3: 30009, lh: 30008 }), 5.26);
  console.log('I. Doom Light 2/4 → MP Recovery +5.26% — OK');
}

// DOOM LIGHT J. 3/4
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 30009, lh: 30008, lg: 30010 }));
  assert.equal(t.totals.mpRegenPct, 5.26);
  assert.equal(t.totals.pAtkPct, 2.7);
  console.log('J. Doom Light 3/4 → MP Recovery + P.Atk — OK');
}

// DOOM LIGHT K. 4/4
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 30009, lh: 30008, lg: 30010, lf: 30011 })
  );
  assert.equal(t.totals.dexFlat, 3);
  assert.equal(t.totals.sleepHoldResistancePct, 50);
  console.log('K. Doom Light 4/4 → DEX + Sleep/Hold — OK');
}

// DOOM LIGHT L. Shield does not replace boots
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 30009, lh: 30008, lg: 30010, l2: 110 })
  );
  assert.equal(t.totals.pAtkPct, 2.7);
  assert.equal(t.totals.dexFlat, 0);
  assert.equal(t.activeSets[0]?.equippedCorePieces, 3);
  console.log('L. Doom Light + Shield → 3/4 only — OK');
}

console.log('\n=== B-grade shields regression ===\n');

// SHIELDS M. Avadon Shield
{
  const view = buildItemClientView(673);
  assert.equal(view.name, 'Avadon Shield');
  assert.equal(view.shieldDefense, 216);
  assert.equal(view.shieldBlockRatePct, 20);
  assert.equal(view.pDef, null);
  assert.equal(view.armorSetInfo, null);
  assert.equal(COL_EQUIPMENT_PRICE_B.shield, 20);
  console.log('M. Avadon Shield 673 → 216/20% — OK');
}

// SHIELDS N. Doom Shield
{
  const view = buildItemClientView(110);
  assert.equal(view.name, 'Doom Shield');
  assert.equal(view.shieldDefense, 230);
  assert.equal(view.shieldBlockRatePct, 20);
  assert.equal(view.pDef, null);
  assert.equal(view.armorSetInfo, null);
  console.log('N. Doom Shield 110 → 230/20% — OK');
}

// SHIELDS O. Shield of Pledge
{
  const view = buildItemClientView(111);
  assert.equal(view.name, 'Shield of Pledge');
  assert.equal(view.shieldDefense, 216);
  assert.equal(view.shieldBlockRatePct, 20);
  assert.equal(view.pDef, null);
  assert.equal(view.armorSetInfo, null);
  console.log('O. Shield of Pledge 111 → 216/20% — OK');
}

// SHIELDS P. Not in armor P.Def sum
{
  const withShield = inv({ l2: 673, l3: 358 });
  const pdef = sumEquippedArmorPDef(withShield.eq!);
  assert.equal(pdef, 166, 'only chest pDef, not shield');
  console.log('P. Shield excluded from armor P.Def sum — OK');
}

// SHIELDS Q. Shield defense once on successful block
{
  const pieces = inv({ l2: 673 });
  const once = equippedShieldPDef(pieces.eq!, 100, 0);
  assert.equal(once, 216);
  assert.equal(equippedShieldPDef(pieces.eq!, 0, 0), 0);
  console.log('Q. shieldDefense applied once on block — OK');
}

console.log('\n=== B-grade consistency ===\n');

// R. buildItemClientView / ITEM_CATALOG consistent
{
  for (const row of B_GRADE_ARMOR_CATALOG) {
    const view = buildItemClientView(row.itemId);
    assert.equal(view.itemId, row.itemId);
    assert.equal(view.name, row.name);
    assert.equal(view.grade, 'B');
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
      const coreIds = [
        30002, 30001, 30003, 30004, 358, 2380, 2416, 2487, 2439, 30009, 30008, 30010, 30011,
      ];
      if (coreIds.includes(row.itemId)) {
        assert.ok(view.armorSetInfo, `core piece ${row.itemId} should have setInfo`);
        assert.equal(view.setItemRole, 'core');
      }
    }
  }
  console.log('R. buildItemClientView / ITEM_CATALOG consistent — OK');
}

// S. Snapshot and battle stats agree on set effects
{
  const pieces2 = inv({ l3: 358, l4: 2380 });
  const pieces3 = inv({ l3: 358, l4: 2380, lh: 2416 });
  const combatNoSet = computeCombatStats(40, 'Human', 'fighter', inv({}), {});
  const combat2 = computeCombatStats(40, 'Human', 'fighter', pieces2, {});
  const combat3 = computeCombatStats(40, 'Human', 'fighter', pieces3, {});
  assert.ok(combat2.regenHp > combatNoSet.regenHp, 'hpRegenPct at 2/5');
  assert.ok(combat3.runSpeed > combat2.runSpeed, 'speedFlat +7 at 3/5');

  const pieces4 = inv({ l3: 358, l4: 2380, lh: 2416, lg: 2487 });
  const combat4 = computeCombatStats(40, 'Human', 'fighter', pieces4, {});
  assert.ok(combat4.stunResistPct > combat2.stunResistPct, 'stunResistance at 4/5');

  const pieces = inv({ l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 });
  const resolved = resolveEquippedArmorSetBonuses(pieces);
  const combat = computeCombatStats(40, 'Human', 'fighter', pieces, {});
  assert.equal(resolved.totals.strFlat, 3);
  assert.equal(resolved.totals.conFlat, -1);
  assert.equal(resolved.totals.dexFlat, -2);
  assert.equal(combat.str, combatNoSet.str + 3);
  assert.equal(combat.con, combatNoSet.con - 1);
  assert.equal(combat.dex, combatNoSet.dex - 2);
  console.log('S. resolveEquippedArmorSetBonuses ↔ computeCombatStats — OK');
}

// T. Unique canonical itemIds
{
  assert.equal(B_GRADE_ARMOR_CATALOG.length, B_GRADE_ARMOR_BY_ID.size);
  console.log('T. Unique B-grade itemIds — OK');
}

// U. No double legacy + staged B bonuses
{
  const avadonFull = inv({ l3: 30002, lh: 30001, lg: 30003, lf: 30004 });
  const legacy = dGradeFullArmorSetBonusDeltaLegacyOnly(avadonFull);
  assert.equal(Object.keys(legacy).length, 0);
  const staged = resolveEquippedArmorSetBonuses(avadonFull);
  assert.equal(staged.totals.castingSpdPct, 15);

  const blueWolfFull = inv({ l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(blueWolfFull)).length, 0);
  assert.equal(resolveEquippedArmorSetBonuses(blueWolfFull).totals.strFlat, 3);

  const doomFull = inv({ l3: 30009, lh: 30008, lg: 30010, lf: 30011 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(doomFull)).length, 0);
  assert.equal(resolveEquippedArmorSetBonuses(doomFull).totals.dexFlat, 3);
  console.log('U. No double legacy + staged B bonuses — OK');
}

// Modal payloads
{
  const avadon = buildItemClientView(30002);
  assert.equal(avadon.armorSetInfo?.setId, 'b_avadon_robe');
  assert.equal(avadon.armorSetInfo?.grade, 'B');
  assert.equal(avadon.armorSetInfo?.stages.length, 3);
  assert.equal(avadon.armorSetInfo?.pieceIds.length, 4);

  const blueWolf = buildItemClientView(358);
  assert.equal(blueWolf.armorSetInfo?.setId, 'b_blue_wolf_heavy');
  assert.equal(blueWolf.armorSetInfo?.stages.length, 4);
  assert.equal(blueWolf.armorSetInfo?.pieceIds.length, 5);

  const doom = buildItemClientView(30009);
  assert.equal(doom.armorSetInfo?.setId, 'b_doom_light');
  assert.equal(doom.name, 'Leather Armor of Doom');

  const avadonShield = buildItemClientView(673);
  assert.equal(avadonShield.armorSetInfo, null);
  assert.equal(avadonShield.shieldDefense, 216);

  const doomShield = buildItemClientView(110);
  assert.equal(doomShield.armorSetInfo, null);
  assert.equal(doomShield.shieldDefense, 230);

  const pledge = buildItemClientView(111);
  assert.equal(pledge.armorSetInfo, null);
  assert.equal(pledge.shieldDefense, 216);
  console.log('Modal payloads — Avadon/Blue Wolf/Doom/shields — OK');
}

// Shield patch consistency
{
  for (const id of [673, 110, 111] as const) {
    const view = buildItemClientView(id);
    const patch = dropsShieldPatchForEquipped(id, view.name);
    assert.equal(patch?.shieldDef, view.shieldDefense);
    assert.equal(patch?.shieldRatePercent, view.shieldBlockRatePct);
    assert.notEqual(patch?.shieldDef, 36);
    assert.notEqual(patch?.shieldDef, 39);
    assert.notEqual(patch?.shieldDef, 44);
  }
  console.log('Shield patch / client view consistent — OK');
}

console.log('\nAll B-grade armor set regression tests passed.');
