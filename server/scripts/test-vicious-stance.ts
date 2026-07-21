/**
 * Regression tests for Vicious Stance (skill 312) — global runtime contract.
 */
import assert from 'node:assert/strict';
import type { BattleBattleMods } from '../src/domain/battleTypes.js';
import { isStanceViciousActive } from '../src/domain/battleModsJson.js';
import {
  repairViciousStanceBattleModsInPlace,
  resolveViciousStanceEffect,
  resolveViciousStanceEffectRank,
} from '../src/data/viciousStanceTables.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { parseInventory } from '../src/data/inventory.js';

function pctFromMul(m: number): string {
  return Math.round((m - 1) * 100) + '%';
}

function profileAddCritDisplay(
  combat: ReturnType<typeof computeCombatStats>,
  mods: BattleBattleMods,
  learnedRank: number
): string {
  let mul = combat.critDmgMul;
  let flat = combat.addCritDmg;
  if (isStanceViciousActive(mods)) {
    const rk = resolveViciousStanceEffectRank(learnedRank);
    const vs = resolveViciousStanceEffect(rk);
    if (vs.addCritDmg) flat += vs.addCritDmg;
    if (vs.critDmgMul > 0 && Number.isFinite(vs.critDmgMul)) {
      mul *= vs.critDmgMul;
    }
  }
  return Math.floor((mul - 1) * 100) + '%+' + String(Math.floor(flat));
}

function battleCritTotals(
  combat: ReturnType<typeof computeCombatStats>,
  mods: BattleBattleMods,
  learnedRank: number
): { critDmgMul: number; addCritDmg: number } {
  let critDmgMul = combat.critDmgMul;
  let addCritDmg = combat.addCritDmg;
  if (isStanceViciousActive(mods)) {
    const vs = resolveViciousStanceEffect(resolveViciousStanceEffectRank(learnedRank));
    if (vs.addCritDmg) addCritDmg += vs.addCritDmg;
    if (vs.critDmgMul > 0) critDmgMul *= vs.critDmgMul;
  }
  return { critDmgMul, addCritDmg };
}

function emptyCombat(): ReturnType<typeof computeCombatStats> {
  return computeCombatStats(76, 'orc', 'fighter', parseInventory(null), {});
}

console.log('=== Vicious Stance regression (skill 312) ===\n');

// A. Destroyer: learned 20, persisted 5, stance active
{
  const mods: BattleBattleMods = {
    stanceVicious: true,
    viciousStanceSkillRank: 5,
  };
  const learned = 20;
  const rk = resolveViciousStanceEffectRank(learned);
  const vs = resolveViciousStanceEffect(rk);
  assert.equal(rk, 20, 'A: resolved rank must be learned 20, not persisted 5');
  assert.equal(vs.critDmgMul, 1, 'A: rank 20 critDmgMul must be 1');
  assert.equal(vs.addCritDmg, 609, 'A: rank 20 addCritDmg must be 609');
  const repaired = { ...mods };
  assert.equal(repairViciousStanceBattleModsInPlace(repaired, learned), true);
  assert.equal(repaired.viciousStanceSkillRank, 20);
  console.log('A. Destroyer learned 20 / persisted 5 → rank 20, mul=1, flat=609 — OK');
}

// B. Hawk Eye rank 20
{
  const vs = resolveViciousStanceEffect(20);
  assert.equal(vs.addCritDmg, 609, 'B: Hawk Eye rank 20 flat = 609');
  assert.equal(vs.critDmgMul, 1, 'B: Hawk Eye rank 20 mul = 1');
  console.log('B. Hawk Eye rank 20 → addCritDmg 609 — OK');
}

// C. Rank 5 → percentage only, no rank-20 flat
{
  const vs = resolveViciousStanceEffect(5);
  assert.equal(vs.addCritDmg, 0, 'C: rank 5 must not apply flat addCritDmg');
  assert.ok(vs.critDmgMul > 1, 'C: rank 5 must apply percentage critDmgMul');
  assert.notEqual(vs.addCritDmg, 609, 'C: rank 5 must not get rank-20 flat');
  console.log(
    `C. Rank 5 → critDmgMul ${vs.critDmgMul.toFixed(3)} (${pctFromMul(vs.critDmgMul)}), flat=0 — OK`
  );
}

// D. Stance inactive → no bonus
{
  const mods: BattleBattleMods = { viciousStanceSkillRank: 20 };
  const combat = emptyCombat();
  const vs = isStanceViciousActive(mods)
    ? resolveViciousStanceEffect(20)
    : { critDmgMul: 1, addCritDmg: 0, addCrit: 0 };
  assert.equal(vs.critDmgMul, 1);
  assert.equal(vs.addCritDmg, 0);
  const display = profileAddCritDisplay(combat, mods, 20);
  const baseDisplay = profileAddCritDisplay(combat, {}, 20);
  assert.equal(display, baseDisplay, 'D: inactive stance must not change profile display');
  console.log('D. Stance inactive → no Vicious bonus — OK');
}

// E. Client/persisted rank 5, learned 20 → effect rank 20
{
  const mods: BattleBattleMods = {
    stanceVicious: true,
    viciousStanceSkillRank: 5,
  };
  const learned = 20;
  const rk = resolveViciousStanceEffectRank(learned);
  const vs = resolveViciousStanceEffect(rk);
  assert.equal(rk, 20);
  assert.equal(vs.addCritDmg, 609);
  assert.equal(vs.critDmgMul, 1);
  const repaired = { ...mods };
  repairViciousStanceBattleModsInPlace(repaired, learned);
  assert.equal(repaired.viciousStanceSkillRank, 20);
  console.log('E. Client rank 5 ignored → learned rank 20 activated — OK');
}

// F. Profile, battle use same resolved rank/effect
{
  const combat = emptyCombat();
  const learned = 20;
  const mods: BattleBattleMods = {
    stanceVicious: true,
    viciousStanceSkillRank: 5,
  };
  const rk = resolveViciousStanceEffectRank(learned);
  const vs = resolveViciousStanceEffect(rk);
  const profile = profileAddCritDisplay(combat, mods, learned);
  const battle = battleCritTotals(combat, mods, learned);
  assert.equal(battle.addCritDmg, combat.addCritDmg + vs.addCritDmg);
  assert.ok(
    Math.abs(battle.critDmgMul - combat.critDmgMul * vs.critDmgMul) < 0.001,
    'F: battle critDmgMul must match helper'
  );
  const expectedProfile =
    Math.floor((combat.critDmgMul * vs.critDmgMul - 1) * 100) +
    '%+' +
    String(Math.floor(combat.addCritDmg + vs.addCritDmg));
  assert.equal(profile, expectedProfile, 'F: profile display must match battle totals');
  console.log('F. Profile/battle consistent — OK');
  console.log(`   rank=${rk}, Vicious mul=${vs.critDmgMul}, flat=${vs.addCritDmg}`);
  console.log(`   profile display: ${profile}`);
}

// Skill not learned → repair disables stance
{
  const mods: BattleBattleMods = {
    stanceVicious: true,
    viciousStanceSkillRank: 5,
  };
  const repaired = { ...mods };
  assert.equal(repairViciousStanceBattleModsInPlace(repaired, 0), true);
  assert.equal(isStanceViciousActive(repaired), false);
  assert.equal(repaired.viciousStanceSkillRank, undefined);
  console.log('Repair: skill not learned → stance off — OK');
}

console.log('\nAll Vicious Stance regression tests passed.');
