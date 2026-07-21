/**
 * Regression tests — A-grade armor sets, multi-set membership, shields.
 */
import assert from 'node:assert/strict';
import { A_GRADE_ARMOR_CATALOG, A_GRADE_ARMOR_BY_ID } from '../src/data/aGradeArmorCatalog.js';
import {
  A_APELLA_LIGHT_SET,
  A_DARK_CRYSTAL_HEAVY_SET,
  type ArmorSetDefinition,
} from '../src/data/armorSetCatalog.js';
import {
  armorSetIdsForCorePiece,
  getArmorSetsForItem,
} from '../src/data/armorSetCatalog.js';
import {
  buildItemClientView,
  resolveEquippedArmorSetBonuses,
} from '../src/data/armorSetResolver.js';
import { rollApellaPvpAttackerSpeedDebuff } from '../src/data/armorSetApellaPvpMetadata.js';
import {
  computeCombatStats,
  effectiveMaxCpWithFlat,
  equippedShieldBlockRatePct,
  sumEquippedArmorPDef,
} from '../src/data/l2dopCombatFormulas.js';
import { dropsShieldPatchForEquipped } from '../src/data/l2dopDropsShieldPatches.js';
import { COL_EQUIPMENT_PRICE_A } from '../src/domain/dropsShopCoinOfLuckPricing.js';
import { dGradeFullArmorSetBonusDeltaLegacyOnly } from '../src/data/l2dopDGradeArmorSetBonuses.js';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { computeVitals } from '../src/data/l2dopVitals.js';

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

function buildCorePieceMap(sets: readonly ArmorSetDefinition[]): Map<number, string[]> {
  const m = new Map<number, string[]>();
  for (const set of sets) {
    for (const id of set.corePieceIds) {
      const prev = m.get(id) ?? [];
      if (!prev.includes(set.setId)) m.set(id, [...prev, set.setId]);
    }
  }
  return m;
}

console.log('=== A-grade armor sets regression ===\n');

// APELLA A. 3/4 — no effects
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 7864, lh: 7860, lg: 7865 })
  );
  assert.equal(t.activeSets.length, 0);
  assert.equal(t.totals.maxCpFlat, 0);
  console.log('A. Apella 3/4 → no set effects — OK');
}

// APELLA B. 4/4 — full bonuses + PvP metadata
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 7864, lh: 7860, lg: 7865, lf: 7866 })
  );
  assert.equal(t.activeSets.length, 1);
  assert.equal(t.totals.maxCpFlat, 195);
  assert.equal(t.totals.cpRegenPct, 40);
  assert.equal(t.totals.pvpDeathExpPenaltyReductionPct, 10);
  assert.equal(t.totals.pvpAttackerSpeedDebuffChancePct, 20);
  const fx = t.activeSets[0]!.effects;
  assert.equal(fx.pvpAttackerSpeedDebuffSkillId, 3609);
  assert.equal(fx.pvpAttackerSpeedDebuffEffectId, 296975);
  console.log('B. Apella 4/4 → CP + PvP metadata — OK');
}

// APELLA C. PvP trigger rules
{
  assert.equal(
    rollApellaPvpAttackerSpeedDebuff(
      {
        defenderFullApellaLight: true,
        attackerIsPlayer: false,
        damageFromExternalAttacker: true,
      },
      () => 0
    ),
    false
  );
  assert.equal(
    rollApellaPvpAttackerSpeedDebuff(
      {
        defenderFullApellaLight: true,
        attackerIsPlayer: true,
        damageFromExternalAttacker: true,
      },
      () => 0.1
    ),
    true
  );
  assert.equal(
    rollApellaPvpAttackerSpeedDebuff(
      {
        defenderFullApellaLight: false,
        attackerIsPlayer: true,
        damageFromExternalAttacker: true,
      },
      () => 0
    ),
    false
  );
  console.log('C. Apella PvP trigger — mob blocked, PvP roll once — OK');
}

// DARK CRYSTAL D. 2/5
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 365, l4: 388 }));
  assert.equal(t.totals.hpRegenPct, 5.24);
  console.log('D. Dark Crystal 2/5 → HP Recovery +5.24% — OK');
}

// E. 3/5
{
  const t = resolveEquippedArmorSetBonuses(inv({ l3: 365, l4: 388, lh: 512 }));
  assert.equal(t.totals.hpRegenPct, 5.24);
  assert.equal(t.totals.healingReceivedPct, 4);
  console.log('E. Dark Crystal 3/5 → Healing Received +4% — OK');
}

// F. 4/5
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 365, l4: 388, lh: 512, lg: 2472 })
  );
  assert.equal(t.totals.paralysisResistancePct, 50);
  console.log('F. Dark Crystal 4/5 → Paralysis Resistance +50% — OK');
}

// G. 5/5
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 365, l4: 388, lh: 512, lg: 2472, lf: 563 })
  );
  assert.equal(t.totals.strFlat, -2);
  assert.equal(t.totals.conFlat, 2);
  assert.equal(t.totals.maxHpFlat, 238);
  console.log('G. Dark Crystal 5/5 → STR/CON/Max HP — OK');
}

// H. 5/5 without shield
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 365, l4: 388, lh: 512, lg: 2472, lf: 563 })
  );
  assert.equal(t.totals.shieldBlockRateMul, 1);
  console.log('H. Dark Crystal 5/5 no shield → no block rate mul — OK');
}

// I. 5/5 + shield → 24.8%
{
  const pieces = inv({ l3: 365, l4: 388, lh: 512, lg: 2472, lf: 563, l2: 641 });
  const t = resolveEquippedArmorSetBonuses(pieces);
  assert.equal(t.totals.shieldBlockRateMul, 1.24);
  const combat = computeCombatStats(60, 'Human', 'fighter', pieces, {});
  assert.equal(combat.shieldBlockRatePct, 24.8);
  assert.notEqual(combat.shieldBlockRatePct, 44);
  console.log('I. Dark Crystal 5/5 + shield → 20%×1.24=24.8% — OK');
}

// J. 4/5 + shield — no shield bonus
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 365, l4: 388, lh: 512, lg: 2472, l2: 641 })
  );
  assert.equal(t.totals.shieldBlockRateMul, 1);
  assert.equal(t.totals.maxHpFlat, 0);
  console.log('J. Dark Crystal 4/5 + shield → no shield bonus — OK');
}

// MAJESTIC K. 2/4
{
  assert.equal(
    resolveEquippedArmorSetBonuses(inv({ l3: 2409, lh: 2419 })).totals.mpRegenPct,
    8
  );
  console.log('K. Majestic 2/4 → MP Recovery +8% — OK');
}

// L. 3/4
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 2409, lh: 2419, lg: 2482 })
  );
  assert.equal(t.totals.menFlat, 1);
  assert.equal(t.totals.intFlat, -1);
  assert.equal(t.totals.maxMpFlat, 240);
  console.log('L. Majestic 3/4 → MEN/INT/Max MP — OK');
}

// M. 4/4
{
  const t = resolveEquippedArmorSetBonuses(
    inv({ l3: 2409, lh: 2419, lg: 2482, lf: 583 })
  );
  assert.equal(t.totals.castingSpdPct, 15);
  assert.equal(t.totals.stunResistancePct, 50);
  console.log('M. Majestic 4/4 → Casting Speed + Stun — OK');
}

console.log('\n=== Fullarmor ===\n');

// N. Apella Brigandine — single P.Def
{
  const pdef = sumEquippedArmorPDef(inv({ l3: 7864 }).eq!);
  assert.equal(pdef, 209);
  console.log('N. Apella Brigandine fullarmor → P.Def 209 once — OK');
}

// O. Majestic Robe — single P.Def
{
  const pdef = sumEquippedArmorPDef(inv({ l3: 2409 }).eq!);
  assert.equal(pdef, 147);
  console.log('O. Majestic Robe fullarmor → P.Def 147 once — OK');
}

console.log('\n=== A-grade shields ===\n');

// P. Dark Crystal Shield
{
  const view = buildItemClientView(641);
  assert.equal(view.shieldDefense, 243);
  assert.equal(view.shieldBlockRatePct, 20);
  assert.equal(view.pDef, null);
  assert.equal(view.armorSetInfos.length, 1);
  assert.equal(view.armorSetInfos[0]?.setId, 'a_dark_crystal_heavy');
  assert.equal(COL_EQUIPMENT_PRICE_A.shield, 35);
  console.log('P. Dark Crystal Shield 641 → 243/20% — OK');
}

// Q. Shield of Nightmare — no set link
{
  const view = buildItemClientView(2498);
  assert.equal(view.shieldDefense, 256);
  assert.equal(view.armorSetInfos.length, 0);
  console.log('Q. Shield of Nightmare 2498 → 256/20%, no set — OK');
}

// R. Shields excluded from armor P.Def
{
  assert.equal(sumEquippedArmorPDef(inv({ l2: 641, l3: 365 }).eq!), 171);
  console.log('R. Shield excluded from armor P.Def — OK');
}

console.log('\n=== Multi-set membership ===\n');

// S/T/U. Shared helms use array map (simulate future sets)
{
  assert.ok(armorSetIdsForCorePiece(7860).includes('a_apella_light'));
  assert.ok(armorSetIdsForCorePiece(512).includes('a_dark_crystal_heavy'));
  assert.ok(armorSetIdsForCorePiece(2419).includes('a_majestic_robe'));

  const fakeFutureHeavy: ArmorSetDefinition = {
    setId: 'a_apella_heavy_future',
    name: 'Apella Heavy (future)',
    grade: 'A',
    armorType: 'heavy',
    corePieceIds: [7860, 99999],
    stages: [],
  };
  const simulated = buildCorePieceMap([A_APELLA_LIGHT_SET, fakeFutureHeavy]);
  assert.deepEqual(simulated.get(7860), ['a_apella_light', 'a_apella_heavy_future']);

  const helmSets = getArmorSetsForItem(7860);
  assert.equal(helmSets.length, 1);
  assert.equal(helmSets[0]?.setId, 'a_apella_light');
  console.log('S/T/U. Multi-set map — no overwrite on shared helms — OK');
}

console.log('\n=== Consistency ===\n');

// V/W. buildItemClientView + combat
{
  for (const row of A_GRADE_ARMOR_CATALOG) {
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
  const pieces = inv({ l3: 365, l4: 388, lh: 512, lg: 2472, lf: 563 });
  const resolved = resolveEquippedArmorSetBonuses(pieces);
  const combat = computeCombatStats(60, 'Human', 'fighter', pieces, {});
  assert.equal(resolved.totals.strFlat, -2);
  assert.equal(combat.str, computeCombatStats(60, 'Human', 'fighter', inv({}), {}).str - 2);
  console.log('V/W. Catalog + snapshot/battle agree — OK');
}

// X. Unique itemIds
{
  assert.equal(A_GRADE_ARMOR_CATALOG.length, A_GRADE_ARMOR_BY_ID.size);
  console.log('X. Unique A-grade itemIds — OK');
}

// Y. No legacy double bonuses
{
  const apellaFull = inv({ l3: 7864, lh: 7860, lg: 7865, lf: 7866 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(apellaFull)).length, 0);
  const dcFull = inv({ l3: 365, l4: 388, lh: 512, lg: 2472, lf: 563 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(dcFull)).length, 0);
  const majesticFull = inv({ l3: 2409, lh: 2419, lg: 2482, lf: 583 });
  assert.equal(Object.keys(dGradeFullArmorSetBonusDeltaLegacyOnly(majesticFull)).length, 0);
  console.log('Y. No legacy + staged double A bonuses — OK');
}

// Apella maxCp in snapshot
{
  const pieces = inv({ l3: 7864, lh: 7860, lg: 7865, lf: 7866 });
  const combat = computeCombatStats(60, 'Human', 'fighter', pieces, {});
  const vit = computeVitals(60, 'Human', 'fighter', combat.con, combat.men);
  const maxCp = effectiveMaxCpWithFlat(vit.maxCp, combat);
  const maxCpNoSet = effectiveMaxCpWithFlat(
    vit.maxCp,
    computeCombatStats(60, 'Human', 'fighter', inv({}), {})
  );
  assert.ok(maxCp >= maxCpNoSet + 190);
  console.log('Apella Max CP +195 in snapshot pipeline — OK');
}

// Shield patch consistency
{
  for (const id of [641, 2498] as const) {
    const view = buildItemClientView(id);
    const patch = dropsShieldPatchForEquipped(id, view.name);
    assert.equal(patch?.shieldDef, view.shieldDefense);
    assert.notEqual(patch?.shieldDef, 47);
    assert.notEqual(patch?.shieldDef, 50);
  }
  assert.equal(equippedShieldBlockRatePct(inv({ l2: 641 }).eq!, 1), 20);
  console.log('Shield patches consistent — OK');
}

// Modal payloads
{
  const apella = buildItemClientView(7864);
  assert.equal(apella.armorSetInfos[0]?.setId, 'a_apella_light');
  assert.equal(apella.armorSetInfos.length, 1);

  const dc = buildItemClientView(365);
  assert.equal(dc.armorSetInfos[0]?.setId, 'a_dark_crystal_heavy');

  const dcShield = buildItemClientView(641);
  assert.equal(dcShield.setItemRole, 'optionalShield');

  const majestic = buildItemClientView(2409);
  assert.equal(majestic.armorSetInfos[0]?.setId, 'a_majestic_robe');

  const nightmare = buildItemClientView(2498);
  assert.equal(nightmare.armorSetInfos.length, 0);
  console.log('Modal payloads — Apella/DC/Majestic/shields — OK');
}

console.log('\nAll A-grade armor set regression tests passed.');
