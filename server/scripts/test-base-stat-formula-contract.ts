/**
 * Regression — STR → P.Atk → physical damage (balance contract + wiring).
 */
import assert from 'node:assert/strict';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import {
  l2dopPhysicalBaseDamageCore,
  l2dopPhysicalCritDamageCore,
} from '../src/data/l2dopDamageFormulas.js';
import { resolveStrPhysicalAttackMultiplier } from '../src/domain/resolveStrPhysicalAttackMultiplier.js';
import { computePhysicalAttackBreakdown } from '../src/domain/physicalAttackBreakdown.js';
import { auditBattlePatkAndDamage } from '../src/domain/physicalAttackBreakdownAudit.js';
import { effectiveBattlePatkDisplay } from '../src/domain/battleEffectiveDisplay.js';

const LVL = 40;
const WEAPON = 135;
const TARGET_PDEF = 450;
const STR77_81_RATIO = 3.32 / 3.24;

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

function assertStrMul(str: number, expected: number, label: string): void {
  const s = resolveStrPhysicalAttackMultiplier(str);
  assert.equal(s.multiplier, expected, `${label}: got ${s.multiplier}`);
  console.log(`${label} — OK`);
}

console.log('=== Base stat formula contract ===\n');

// Balance contract — exact soft-cap values
assertStrMul(64, 2.98, 'A. STR 64 = 2.98');
assertStrMul(65, 3.0, 'B. STR 65 = 3.00');
assertStrMul(77, 3.24, 'C. STR 77 = 3.24');
assertStrMul(81, 3.32, 'D. STR 81 = 3.32');
assertStrMul(100, 3.7, 'E. STR 100 = 3.70');
assertStrMul(115, 4.0, 'F. STR 115 = 4.00');
assertStrMul(120, 4.0, 'G. STR 120 = 4.00 (hard cap)');

// H–J. STR 77→81 ≈ +2.47% P.Atk / damage
{
  const a = scenarioForStr(77);
  const b = scenarioForStr(81);
  assert.equal(a.preStrPAtk, b.preStrPAtk);
  assert.equal(a.strMul, 3.24);
  assert.equal(b.strMul, 3.32);
  const ratio = b.strMul / a.strMul;
  assert.ok(Math.abs(ratio - STR77_81_RATIO) < 0.0001, `mul ratio ${ratio}`);
  const patkRatio = b.canonicalPatk / a.canonicalPatk;
  assert.ok(Math.abs(patkRatio - ratio) < 0.02, `patkRatio ${patkRatio}`);
  const dmgRatio = b.normalCore / a.normalCore;
  assert.ok(Math.abs(dmgRatio - ratio) < 0.02, `dmgRatio ${dmgRatio}`);
  const critRatio = b.critCore / a.critCore;
  assert.ok(Math.abs(critRatio - ratio) < 0.02, `critRatio ${critRatio}`);
  console.log(
    `H–J. STR 77→81 ratio ${ratio.toFixed(6)} (~+2.47%); P.Atk ${a.canonicalPatk}→${b.canonicalPatk}; normal core ${a.normalCore.toFixed(2)}→${b.normalCore.toFixed(2)} — OK`,
  );
}

// K. Plated Leather STR +4 increases P.Atk
{
  const noSet = combatFor();
  const withSet = combatFor({ l3: 398, l4: 418, lf: 2431 });
  assert.equal(withSet.str, noSet.str + 4);
  assert.ok(withSet.pAtk > noSet.pAtk, 'Plated Leather P.Atk must increase');
  const dmgNo = l2dopPhysicalBaseDamageCore(
    auditBattlePatkAndDamage({ combat: noSet, targetPDef: TARGET_PDEF }).battlePatk,
    TARGET_PDEF,
  );
  const dmgSet = l2dopPhysicalBaseDamageCore(
    auditBattlePatkAndDamage({ combat: withSet, targetPDef: TARGET_PDEF }).battlePatk,
    TARGET_PDEF,
  );
  assert.ok(dmgSet > dmgNo, 'Plated Leather damage must increase');
  console.log('K. Plated Leather STR +4 → P.Atk and damage up — OK');
}

// L. Removing boots restores STR and P.Atk
{
  const full = combatFor({ l3: 398, l4: 418, lf: 2431 });
  const noBoots = combatFor({ l3: 398, l4: 418 });
  assert.equal(noBoots.str, full.str - 4);
  assert.ok(noBoots.pAtk < full.pAtk);
  const again = combatFor({ l3: 398, l4: 418, lf: 2431 });
  assert.equal(again.str, full.str);
  assert.equal(again.pAtk, full.pAtk);
  console.log('L. Removing boots restores STR and P.Atk — OK');
}

// M. STR multiplier applied exactly once
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
  console.log('M. STR multiplier applied exactly once — OK');
}

// N. Profile P.Atk = snapshot P.Atk = battle input P.Atk
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
  console.log('N. profile/snapshot/battle P.Atk aligned — OK');
}

console.log('\nAll base stat formula contract tests passed.');
console.log('(O. fullarmor tests: npm run test:fullarmor-equip)');
