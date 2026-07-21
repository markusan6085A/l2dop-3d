/**
 * Regression tests — S-grade armor sets, fullarmor, Imperial shield.
 */
import assert from 'node:assert/strict';
import { S_GRADE_ARMOR_CATALOG, S_GRADE_ARMOR_BY_ID } from '../src/data/sGradeArmorCatalog.js';
import {
  S_IMPERIAL_CRUSADER_HEAVY_SET,
  S_DRACONIC_LIGHT_SET,
  S_MAJOR_ARCANA_ROBE_SET,
} from '../src/data/armorSetCatalog.js';
import {
  buildItemClientView,
  resolveEquippedArmorSetBonuses,
} from '../src/data/armorSetResolver.js';
import {
  computeCombatStats,
  equippedShieldBlockRatePct,
  sumEquippedArmorPDef,
} from '../src/data/l2dopCombatFormulas.js';
import { dropsShieldPatchForEquipped } from '../src/data/l2dopDropsShieldPatches.js';
import { dGradeFullArmorSetBonusDeltaLegacyOnly } from '../src/data/l2dopDGradeArmorSetBonuses.js';
import {
  parseInventory,
  parseInventoryRaw,
  type InventoryState,
} from '../src/data/inventory.js';
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

console.log('=== S-grade armor sets regression ===\n');

// IMPERIAL A. 4/5 — no effects
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375 })
  );
  assert.equal(t.activeSets.length, 0);
  console.log('A. Imperial 4/5 → no set effects — OK');
}

// IMPERIAL B. 5/5 full core
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376 })
  );
  assert.equal(t.activeSets.length, 1);
  assert.equal(t.totals.pDefPct, 8);
  assert.equal(t.totals.maxHpFlat, 445);
  assert.equal(t.totals.sleepHoldResistancePct, 70);
  assert.equal(t.totals.strFlat, 2);
  assert.equal(t.totals.dexFlat, -2);
  console.log('B. Imperial 5/5 → P.Def/HP/Sleep/STR/DEX — OK');
}

// IMPERIAL C. 5/5 without shield — no poison/bleed
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376 })
  );
  assert.equal(t.totals.poisonResistancePct, 0);
  assert.equal(t.totals.bleedResistancePct, 0);
  console.log('C. Imperial 5/5 no shield → no Poison/Bleed — OK');
}

// IMPERIAL D. 5/5 + shield
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376, l2: 6377 })
  );
  assert.equal(t.totals.poisonResistancePct, 80);
  assert.equal(t.totals.bleedResistancePct, 80);
  console.log('D. Imperial 5/5 + shield → Poison/Bleed +80% — OK');
}

// IMPERIAL E. 4/5 + shield — no effects
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375, l2: 6377 })
  );
  assert.equal(t.activeSets.length, 0);
  console.log('E. Imperial 4/5 + shield → no set effects — OK');
}

// IMPERIAL F. Shield does not change core progress
{
  const pieces = inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375, l2: 6377 });
  const view = buildItemClientView(6373, pieces);
  assert.equal(view.equippedSetProgress?.equippedCorePieces, 4);
  assert.equal(view.equippedSetProgress?.totalCorePieces, 5);
  console.log('F. Shield does not change X/5 progress — OK');
}

console.log('\n=== Draconic ===\n');

// DRACONIC G. 3/4 — no effects
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 6379, lh: 6382, lg: 6380 }));
  assert.equal(t.activeSets.length, 0);
  console.log('G. Draconic 3/4 → no set effects — OK');
}

// DRACONIC H. 4/4 full
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6379, lh: 6382, lg: 6380, lf: 6381 })
  );
  assert.equal(t.totals.pAtkPct, 4);
  assert.equal(t.totals.atkSpdPct, 4);
  assert.equal(t.totals.maxMpFlat, 289);
  assert.equal(t.totals.weightLimitFlat, 5759);
  assert.equal(t.totals.strFlat, 1);
  assert.equal(t.totals.dexFlat, 1);
  assert.equal(t.totals.conFlat, -2);
  console.log('H. Draconic 4/4 → canonical bonuses — OK');
}

// DRACONIC I. Wrong legacy values not applied
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6379, lh: 6382, lg: 6380, lf: 6381 })
  );
  assert.notEqual(t.totals.strFlat, 2);
  assert.notEqual(t.totals.dexFlat, 2);
  assert.notEqual(t.totals.conFlat, -1);
  assert.notEqual(t.totals.pAtkPct, 8);
  console.log('I. Draconic — no wrong STR/DEX/CON/P.Atk — OK');
}

console.log('\n=== Major Arcana ===\n');

// MAJOR J. 3/4 — no effects
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 6383, lh: 6386, lg: 6384 }));
  assert.equal(t.activeSets.length, 0);
  console.log('J. Major Arcana 3/4 → no set effects — OK');
}

// MAJOR K. 4/4 full
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6383, lh: 6386, lg: 6384, lf: 6385 })
  );
  assert.equal(t.totals.mAtkPct, 17);
  assert.equal(t.totals.speedFlat, 7);
  assert.equal(t.totals.stunResistancePct, 50);
  assert.equal(t.totals.magicCancelReductionPct, 50);
  assert.equal(t.totals.weightLimitFlat, 5759);
  assert.equal(t.totals.witFlat, 1);
  assert.equal(t.totals.intFlat, 1);
  assert.equal(t.totals.menFlat, -2);
  console.log('K. Major Arcana 4/4 → canonical bonuses — OK');
}

// MAJOR L. Casting Speed buff not from set (castingSpdPct)
{
  const full = inv({ l3: 6383, lh: 6386, lg: 6384, lf: 6385 });
  const t = resolveEquippedArmorSetBonuses(full);
  assert.equal(t.totals.castingSpdPct ?? 0, 0);
  console.log('L. Major Arcana — no Casting Speed set buff — OK');
}

// MAJOR M. Wrong legacy values not applied
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 6383, lh: 6386, lg: 6384, lf: 6385 })
  );
  assert.notEqual(t.totals.mAtkPct, 8);
  assert.notEqual(t.totals.witFlat, 2);
  assert.notEqual(t.totals.intFlat, 2);
  assert.notEqual(t.totals.menFlat, -1);
  console.log('M. Major Arcana — no wrong M.Atk/WIT/INT/MEN — OK');
}

console.log('\n=== Fullarmor ===\n');

// N. Draconic P.Def once
{
  assert.equal(sumEquippedArmorPDef(inv({ l3: 6379, lh: 6382 }).eq!), 249 + 83);
  console.log('N. Draconic fullarmor → P.Def 249 once — OK');
}

// O. Major Arcana P.Def once
{
  assert.equal(sumEquippedArmorPDef(inv({ l3: 6383, lh: 6386 }).eq!), 166 + 83);
  console.log('O. Major Arcana fullarmor → P.Def 166 once — OK');
}

// P. Duplicate fullarmor repair
{
  const raw = parseInventoryRaw({
    stacks: [],
    eq: { l3: 6379, l4: 6379, lh: 6382 },
  });
  assert.ok(raw.eq.l3);
  assert.equal(raw.eq.l4, undefined);
  assert.equal(raw.stacks.length, 1);
  assert.equal(raw.stacks[0]?.itemId, 6379);
  console.log('P. Duplicate fullarmor chest/legs repaired — OK');
}

console.log('\n=== Imperial shield ===\n');

// Q. Shield stats
{
  const view = buildItemClientView(6377);
  assert.equal(view.shieldDefense, 290);
  assert.equal(view.shieldBlockRatePct, 20);
  assert.equal(view.pDef, null);
  console.log('Q. Imperial Crusader Shield 290/20% — OK');
}

// R. Shield excluded from armor P.Def
{
  assert.equal(sumEquippedArmorPDef(inv({ l2: 6377, l3: 6373 }).eq!), 205);
  console.log('R. Shield excluded from armor P.Def — OK');
}

// S. Shield defense in catalog + block rate (block pipeline)
{
  const meta = ITEM_CATALOG[6377];
  assert.equal(meta?.shieldDefense, 290);
  const patch = dropsShieldPatchForEquipped(6377, meta?.nameUk);
  assert.equal(patch?.shieldDef, 290);
  assert.equal(equippedShieldBlockRatePct(inv({ l2: 6377 }).eq!, 1), 20);
  console.log('S. Shield defense 290 in catalog/block pipeline — OK');
}

console.log('\n=== Consistency ===\n');

// T. Catalog consistency
{
  for (const row of S_GRADE_ARMOR_CATALOG) {
    const view = buildItemClientView(row.itemId);
    assert.equal(view.name, row.name);
    const meta = ITEM_CATALOG[row.itemId];
    assert.ok(meta);
    if (row.shieldDefense != null) {
      assert.equal(view.pDef, null);
      assert.equal(meta.shieldDefense, row.shieldDefense);
    } else {
      assert.equal(view.pDef, row.pDef);
      assert.equal(meta.pDef, row.pDef);
    }
  }
  console.log('T. Shop/inventory/drop/modal catalog consistent — OK');
}

// U. Snapshot/battle agree
{
  const imperial = inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376, l2: 6377 });
  const resolved = resolveEquippedArmorSetBonuses(imperial);
  const combat = computeCombatStats(76, 'Human', 'fighter', imperial, {});
  assert.equal(resolved.totals.strFlat, 2);
  assert.equal(combat.str, computeCombatStats(76, 'Human', 'fighter', inv({}), {}).str + 2);
  assert.equal(combat.dex, computeCombatStats(76, 'Human', 'fighter', inv({}), {}).dex - 2);
  assert.equal(combat.cancelResistPct, 0);

  const arcana = inv({ l3: 6383, lh: 6386, lg: 6384, lf: 6385 });
  const arcResolved = resolveEquippedArmorSetBonuses(arcana);
  const arcCombat = computeCombatStats(76, 'Human', 'mystic', arcana, {});
  assert.equal(arcResolved.totals.magicCancelReductionPct, 50);
  assert.equal(arcCombat.cancelResistPct, 50);
  assert.equal(arcCombat.weightLimitBonusFlat, 5759);
  console.log('U. Snapshot/battle set effects agree — OK');
}

// V. Unique itemIds
{
  assert.equal(S_GRADE_ARMOR_CATALOG.length, S_GRADE_ARMOR_BY_ID.size);
  console.log('V. Unique S-grade itemIds — OK');
}

// W. No legacy double bonuses
{
  const imperialFull = inv({ l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376, l2: 6377 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(imperialFull)).length, 0);
  const draconicFull = inv({ l3: 6379, lh: 6382, lg: 6380, lf: 6381 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(draconicFull)).length, 0);
  const arcanaFull = inv({ l3: 6383, lh: 6386, lg: 6384, lf: 6385 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(arcanaFull)).length, 0);
  console.log('W. No legacy + staged double S bonuses — OK');
}

// Modal payloads
{
  const breast = buildItemClientView(6373);
  assert.equal(breast.armorSetInfos[0]?.setId, 's_imperial_crusader_heavy');
  assert.equal(breast.setItemRole, 'core');

  const shield = buildItemClientView(6377);
  assert.equal(shield.setItemRole, 'optionalShield');
  assert.equal(shield.armorSetInfos[0]?.optionalShieldId, 6377);

  const draconic = buildItemClientView(6379);
  assert.equal(draconic.armorSetInfos[0]?.setId, 's_draconic_light');
  assert.deepEqual(draconic.occupies, ['chest', 'legs']);

  const robe = buildItemClientView(6383);
  assert.equal(robe.armorSetInfos[0]?.setId, 's_major_arcana_robe');
  assert.deepEqual(robe.occupies, ['chest', 'legs']);

  const patch = dropsShieldPatchForEquipped(6377, shield.name);
  assert.equal(patch?.shieldDef, 290);
  assert.notEqual(patch?.shieldDef, 56);
  console.log('Modal payloads — Imperial/Draconic/Major/shield — OK');
}

// Bound name normalization
{
  assert.equal(ITEM_CATALOG[6374]?.nameUk, 'Imperial Crusader Gaiters');
  assert.equal(ITEM_CATALOG[6376]?.nameUk, 'Imperial Crusader Boots');
  console.log('Bound → Imperial name normalization — OK');
}

// Set definitions sanity
{
  assert.equal(S_IMPERIAL_CRUSADER_HEAVY_SET.corePieceIds.length, 5);
  assert.equal(S_DRACONIC_LIGHT_SET.corePieceIds.length, 4);
  assert.equal(S_MAJOR_ARCANA_ROBE_SET.corePieceIds.length, 4);
  console.log('Set definitions — OK');
}

console.log('\nAll S-grade armor set regression tests passed.');
