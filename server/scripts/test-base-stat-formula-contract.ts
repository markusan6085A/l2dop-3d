/**
 * Regression — STR → P.Atk → physical damage contract (phase 4.1).
 */
import assert from 'node:assert/strict';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import {
  computeCombatStats,
} from '../src/data/l2dopCombatFormulas.js';
import {
  l2dopPhysicalBaseDamageCore,
  l2dopPhysicalCritDamageCore,
} from '../src/data/l2dopDamageFormulas.js';
import { resolveStrPhysicalAttackMultiplier } from '../src/domain/resolveStrPhysicalAttackMultiplier.js';
import {
  computePhysicalAttackBreakdown,
} from '../src/domain/physicalAttackBreakdown.js';
import { auditBattlePatkAndDamage } from '../src/domain/physicalAttackBreakdownAudit.js';
import { effectiveBattlePatkDisplay } from '../src/domain/battleEffectiveDisplay.js';
import { buildStatsRenderKey } from '../src/domain/buildStatsRenderKey.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import { effectiveMaxHpWithJewelFlat } from '../src/data/l2dopCombatFormulas.js';

const LVL = 40;
const WEAPON = 135;
const TARGET_PDEF = 450;

function eq(pieces: Record<string, number>): InventoryState['eq'] {
  const out: InventoryState['eq'] = {};
  for (const [slot, itemId] of Object.entries(pieces)) {
    out[slot as keyof InventoryState['eq']] = { itemId, enchant: 0 };
  }
  return out;
}

function inv(pieces: Record<string, number>): InventoryState {
  return { ...parseInventory(null), eq: eq({ l1: WEAPON, ...pieces }) };
}

function combatFor(pieces: Record<string, number> = {}) {
  return computeCombatStats(LVL, 'Human', 'fighter', inv(pieces), {
    weaponGradeMatchesArmor: true,
  });
}

function scenarioForStr(finalStr: number) {
  const inventory = inv({});
  const breakdown = computePhysicalAttackBreakdown({
    level: LVL,
    race: 'Human',
    classBranch: 'fighter',
    inv: inventory,
    options: { weaponGradeMatchesArmor: true },
    finalStrOverride: finalStr,
  });
  const combat = computeCombatStats(LVL, 'Human', 'fighter', inventory, {
    weaponGradeMatchesArmor: true,
  });
  const combatStrOverride = {
    ...combat,
    str: finalStr,
    pAtk: breakdown.canonicalPatk,
  };
  const dmg = auditBattlePatkAndDamage({
    combat: combatStrOverride,
    targetPDef: TARGET_PDEF,
    soulshotMul: 1,
  });
  return {
    preStrPAtk: breakdown.preStrPAtk,
    strMul: breakdown.strBreakdown.multiplier,
    displayedPatk: effectiveBattlePatkDisplay(breakdown.canonicalPatk, null, {}),
    battlePatk: dmg.battlePatk,
    normalCore: l2dopPhysicalBaseDamageCore(dmg.battlePatk, TARGET_PDEF),
    critCore: l2dopPhysicalCritDamageCore(
      dmg.battlePatk,
      TARGET_PDEF,
      combatStrOverride.critDmgMul,
      combatStrOverride.addCritDmg,
    ),
    canonicalPatk: breakdown.canonicalPatk,
  };
}

console.log('=== Base stat formula contract ===\n');

// A. STR 77 → multiplier 3.565
{
  const s = resolveStrPhysicalAttackMultiplier(77);
  assert.equal(s.multiplier, 3.565);
  console.log('A. STR 77 → multiplier 3.565 — OK');
}

// B. STR 81 → multiplier 3.745
{
  const s = resolveStrPhysicalAttackMultiplier(81);
  assert.equal(s.multiplier, 3.745);
  console.log('B. STR 81 → multiplier 3.745 — OK');
}

// C–E. STR 77 vs 81 ratio ≈ +5.05%
{
  const a = scenarioForStr(77);
  const b = scenarioForStr(81);
  assert.equal(a.preStrPAtk, b.preStrPAtk);
  assert.ok(b.displayedPatk > a.displayedPatk);
  assert.ok(b.battlePatk > a.battlePatk);
  assert.ok(b.normalCore > a.normalCore);
  assert.ok(b.critCore > a.critCore);
  const ratio = b.strMul / a.strMul;
  assert.ok(Math.abs(ratio - 1.0505) < 0.0001, `ratio ${ratio}`);
  const patkRatio = b.canonicalPatk / a.canonicalPatk;
  assert.ok(Math.abs(patkRatio - ratio) < 0.02, `patkRatio ${patkRatio}`);
  const dmgRatio = b.normalCore / a.normalCore;
  assert.ok(Math.abs(dmgRatio - ratio) < 0.02, `dmgRatio ${dmgRatio}`);
  console.log(
    `C–E. STR 77→81 ratio ${ratio.toFixed(4)}; P.Atk ${a.canonicalPatk}→${b.canonicalPatk}; normal dmg core ${a.normalCore.toFixed(2)}→${b.normalCore.toFixed(2)} — OK`,
  );
}

// F. Profile/snapshot/battle canonical P.Atk alignment
{
  const combat = combatFor();
  const snapshotPatk = effectiveBattlePatkDisplay(combat.pAtk, null, {});
  const battle = auditBattlePatkAndDamage({
    combat,
    targetPDef: TARGET_PDEF,
    soulshotMul: 1,
  });
  assert.equal(snapshotPatk, battle.displayedPatk);
  assert.equal(combat.pAtk, battle.displayedPatk);
  console.log('F. snapshot P.Atk = battle input P.Atk (no extra battle mods) — OK');
}

// G. STR bonus not applied twice
{
  const breakdown = computePhysicalAttackBreakdown({
    level: LVL,
    race: 'Human',
    classBranch: 'fighter',
    inv: inv({ l3: 398, l4: 418, lf: 2431 }),
    options: { weaponGradeMatchesArmor: true },
  });
  const combat = combatFor({ l3: 398, l4: 418, lf: 2431 });
  assert.equal(
    breakdown.patkAfterStr,
    Math.floor(breakdown.preStrPAtk * breakdown.strBreakdown.multiplier),
  );
  assert.equal(combat.pAtk, breakdown.canonicalPatk);
  console.log('G. STR multiplier applied exactly once — OK');
}

// H. Equip/unequip does not stack multiplier
{
  const bare = combatFor();
  const full = combatFor({ l3: 398, l4: 418, lf: 2431 });
  const again = combatFor({ l3: 398, l4: 418, lf: 2431 });
  assert.equal(full.pAtk, again.pAtk);
  assert.equal(full.str, again.str);
  const vitBare = computeVitals(LVL, 'Human', 'fighter', bare.con, bare.men);
  const keyBare = buildStatsRenderKey(
    bare,
    effectiveMaxHpWithJewelFlat(vitBare.maxHp, bare),
    vitBare.maxMp,
    0,
  );
  const vitFull = computeVitals(LVL, 'Human', 'fighter', full.con, full.men);
  const keyFull = buildStatsRenderKey(
    full,
    effectiveMaxHpWithJewelFlat(vitFull.maxHp, full),
    vitFull.maxMp,
    0,
  );
  assert.notEqual(keyBare, keyFull);
  console.log('H. equip/unequip stable multiplier + statsRenderKey changes — OK');
}

function assertSetStrDamage(
  label: string,
  pieces: Record<string, number>,
  expectedStrDelta: number,
): void {
  const noSet = combatFor();
  const withSet = combatFor(pieces);
  assert.equal(withSet.str, noSet.str + expectedStrDelta);
  assert.ok(withSet.pAtk > noSet.pAtk, `${label} P.Atk must increase`);
  const dmgNo = l2dopPhysicalBaseDamageCore(
    auditBattlePatkAndDamage({ combat: noSet, targetPDef: TARGET_PDEF }).battlePatk,
    TARGET_PDEF,
  );
  const dmgSet = l2dopPhysicalBaseDamageCore(
    auditBattlePatkAndDamage({ combat: withSet, targetPDef: TARGET_PDEF }).battlePatk,
    TARGET_PDEF,
  );
  assert.ok(dmgSet > dmgNo, `${label} damage must increase`);
  console.log(`${label} STR ${expectedStrDelta >= 0 ? '+' : ''}${expectedStrDelta} → damage up — OK`);
}

// I. Plated Leather STR +4
assertSetStrDamage('I. Plated Leather', { l3: 398, l4: 418, lf: 2431 }, 4);

// J. Blue Wolf STR +3
assertSetStrDamage(
  'J. Blue Wolf',
  { l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 },
  3,
);

// K. Dark Crystal STR -2
{
  const noSet = combatFor();
  const withSet = combatFor({ l3: 512, l4: 365, lh: 388, lg: 2472, lf: 563 });
  assert.equal(withSet.str, noSet.str - 2);
  assert.ok(withSet.pAtk < noSet.pAtk);
  console.log('K. Dark Crystal STR -2 reduces P.Atk — OK');
}

// L. Imperial STR +2
assertSetStrDamage(
  'L. Imperial',
  { l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376 },
  2,
);

// M. Draconic STR +1
assertSetStrDamage('M. Draconic', { l3: 6379, lh: 6382, lg: 6380, lf: 6381 }, 1);

// N. Negative STR modifiers
{
  const noSet = combatFor();
  const dc = combatFor({ l3: 512, l4: 365, lh: 388, lg: 2472, lf: 563 });
  assert.ok(dc.str < noSet.str);
  assert.ok(dc.pAtk < noSet.pAtk);
  console.log('N. Negative STR modifiers reduce P.Atk/damage — OK');
}

// O. DEX/CON/INT/WIT/MEN use final stats in implemented formulas
{
  const mystic = computeCombatStats(LVL, 'Human', 'mystic', inv({ l3: 441, l4: 472, lg: 2459 }), {
    weaponGradeMatchesArmor: true,
  });
  const bareMystic = computeCombatStats(LVL, 'Human', 'mystic', inv({ l1: 206 }), {
    weaponGradeMatchesArmor: true,
  });
  assert.ok(mystic.int > bareMystic.int);
  assert.ok(mystic.wit < bareMystic.wit);
  assert.ok(mystic.mAtk > bareMystic.mAtk || mystic.castSpd !== bareMystic.castSpd);
  console.log('O. INT/WIT final stats affect mystic derived stats — OK');
}

console.log('\nAll base stat formula contract tests passed.');
