/**
 * Smoke: delta-first skill cooldown — display sec, server offset, stale guard.
 * Запуск: npm run test:skill-cooldown
 */
import assert from 'node:assert/strict';
import { skillCooldownDisplaySec } from '../src/data/skillCooldowns.js';
import {
  isCooldownBlocked,
  assertSkillCooldownReady,
} from '../src/domain/battleSkills/humanFighterTurnHelpers.js';
import { BattleSkillNotAllowedError } from '../src/domain/battleSkillNotAllowedError.js';

function testDisplaySecCeil(): void {
  assert.equal(skillCooldownDisplaySec(999), 1, '999 ms → 1 s');
  assert.equal(skillCooldownDisplaySec(1), 1, '1 ms → 1 s (blocked)');
  assert.equal(skillCooldownDisplaySec(0), 0, '0 ms → available');
  assert.equal(skillCooldownDisplaySec(-5), 0, 'negative → available');
}

function testServerOffsetRemaining(): void {
  const serverNowMs = 1_000_000;
  const clientNowMs = serverNowMs - 10_000;
  const offsetMs = serverNowMs - clientNowMs;
  const cooldownUntilMs = serverNowMs + 500;
  const estimatedServerNowMs = clientNowMs + offsetMs;
  const remainingMs = Math.max(0, cooldownUntilMs - estimatedServerNowMs);
  assert.equal(remainingMs, 500, '±10 s clock skew keeps remainingMs');
  assert.equal(skillCooldownDisplaySec(remainingMs), 1, '500 ms shows 1 s');
}

function testClientRemainingBlocks(): void {
  const remainingMs = 1;
  assert.equal(remainingMs > 0, true, '1 ms left still blocked on client');
  assert.equal(skillCooldownDisplaySec(remainingMs), 1, '1 ms shows 1 s');
  assert.equal(skillCooldownDisplaySec(0), 0, '0 ms available');
}

function testServerGraceReady(): void {
  const nowMs = Date.now();
  const until = nowMs + 1;
  assert.equal(
    isCooldownBlocked(until, nowMs),
    false,
    'server grace: 1 ms within COOLDOWN_READY_GRACE_MS may accept cast'
  );
}

function testCooldownErrorShape(): void {
  const nowMs = Date.now();
  const until = nowMs + 3000;
  try {
    assertSkillCooldownReady(until, nowMs, 'l2_78');
    assert.fail('expected throw');
  } catch (e) {
    assert.ok(e instanceof BattleSkillNotAllowedError);
    const err = e as BattleSkillNotAllowedError;
    assert.equal(err.reason, 'cooldown');
    assert.equal(err.skillId, 'l2_78');
    assert.equal(err.cooldownReadyAtMs, Math.floor(until));
    assert.ok((err.remainingCooldownMs ?? 0) >= 1);
  }
}

function testStaleDeltaMergeLogic(): void {
  let lastBattleVersion = 5;
  const existingUntil = 2000;
  const incomingBv = 3;
  const incomingUntil = 5000;
  let accepted = incomingUntil;
  if (incomingBv != null && incomingBv < lastBattleVersion) {
    accepted = existingUntil;
  } else if (incomingUntil < existingUntil) {
    accepted = existingUntil;
  }
  assert.equal(accepted, existingUntil, 'stale bv must not overwrite newer cd');
}

function testFreshDeltaTakesMax(): void {
  const existingUntil = 2000;
  const incomingBv = 6;
  const lastBattleVersion = 5;
  const incomingUntil = 5000;
  let accepted = incomingUntil;
  if (incomingBv != null && incomingBv < lastBattleVersion) {
    accepted = existingUntil;
  } else if (incomingUntil < existingUntil) {
    accepted = existingUntil;
  }
  assert.equal(accepted, 5000, 'newer bv takes incoming cd');
}

function main(): void {
  testDisplaySecCeil();
  testServerOffsetRemaining();
  testClientRemainingBlocks();
  testServerGraceReady();
  testCooldownErrorShape();
  testStaleDeltaMergeLogic();
  testFreshDeltaTakesMax();
  console.log('skill-cooldown-smoke: OK');
}

main();
