/**
 * Smoke: cooldown key identity + merged map (json vs mystic).
 * Запуск: npm run test:skill-cooldown
 */
import assert from 'node:assert/strict';
import { skillCooldownDisplaySec } from '../src/data/skillCooldowns.js';
import {
  isCooldownBlocked,
  assertSkillCooldownReady,
} from '../src/domain/battleSkills/humanFighterTurnHelpers.js';
import { BattleSkillNotAllowedError } from '../src/domain/battleSkillNotAllowedError.js';
import {
  mergeBattleCooldownMaps,
  normalizeBattleSkillId,
  resolveActionCooldownState,
  assertActionCooldownReady,
} from '../src/domain/battleSkillCooldownResolve.js';
import type { BattleJsonState } from '../src/domain/battle.js';
import type { CharacterRow } from '../src/services/charTypes.js';

function testDisplaySecCeil(): void {
  assert.equal(skillCooldownDisplaySec(999), 1, '999 ms → 1 s');
  assert.equal(skillCooldownDisplaySec(1), 1, '1 ms → 1 s (blocked)');
  assert.equal(skillCooldownDisplaySec(0), 0, '0 ms → available');
}

function testServerOffsetRemaining(): void {
  const serverNowMs = 1_000_000;
  const clientNowMs = serverNowMs - 10_000;
  const offsetMs = serverNowMs - clientNowMs;
  const cooldownUntilMs = serverNowMs + 500;
  const estimatedServerNowMs = clientNowMs + offsetMs;
  const remainingMs = Math.max(0, cooldownUntilMs - estimatedServerNowMs);
  assert.equal(remainingMs, 500, '±10 s clock skew keeps remainingMs');
}

function testNormalizeSkillId(): void {
  assert.equal(normalizeBattleSkillId('war_cry'), 'l2_78');
  assert.equal(normalizeBattleSkillId('l2_78'), 'l2_78');
  assert.equal(normalizeBattleSkillId('power_strike'), 'l2_3');
}

function testMergeMaxJsonOverMystic(): void {
  const nowMs = 1_000_000;
  const row = {
    skillCooldownsJson: [{ skillId: 78, readyAt: nowMs + 5000 }],
  } as unknown as CharacterRow;
  const st = {
    mysticSkillCdUntil: { l2_78: nowMs + 1000 },
  } as BattleJsonState;
  const merged = mergeBattleCooldownMaps(row, st, nowMs);
  assert.equal(merged.l2_78, nowMs + 5000, 'json max wins over shorter mystic');
}

function testMergeMaxMysticOverJson(): void {
  const nowMs = 1_000_000;
  const row = {
    skillCooldownsJson: [{ skillId: 78, readyAt: nowMs + 1000 }],
  } as unknown as CharacterRow;
  const st = {
    mysticSkillCdUntil: { l2_78: nowMs + 8000 },
  } as BattleJsonState;
  const merged = mergeBattleCooldownMaps(row, st, nowMs);
  assert.equal(merged.l2_78, nowMs + 8000, 'mystic max wins over shorter json');
}

function testExpiredKeysDropped(): void {
  const nowMs = 1_000_000;
  const row = { skillCooldownsJson: [] } as unknown as CharacterRow;
  const st = {
    mysticSkillCdUntil: { l2_78: nowMs - 500, attack: nowMs + 500 },
  } as BattleJsonState;
  const merged = mergeBattleCooldownMaps(row, st, nowMs);
  assert.equal(merged.l2_78, undefined);
  assert.equal(merged.attack, nowMs + 500);
}

function testResolveWarCryBlockedByJson(): void {
  const nowMs = 1_000_000;
  const row = {
    skillCooldownsJson: [{ skillId: 78, readyAt: nowMs + 3000 }],
  } as unknown as CharacterRow;
  const st = { mysticSkillCdUntil: {} } as BattleJsonState;
  const state = resolveActionCooldownState(row, st, 'war_cry', nowMs);
  assert.equal(state.normalizedSkillId, 'l2_78');
  assert.equal(state.skillCooldownUntilMs, nowMs + 3000);
  assert.equal(state.blockedBy, 'skill');
  assert.ok(state.remainingMs > 0);
}

function testResolveExpiredAllowsCast(): void {
  const nowMs = 1_000_000;
  const row = { skillCooldownsJson: [] } as unknown as CharacterRow;
  const st = {
    mysticSkillCdUntil: { l2_78: nowMs - 1000 },
  } as BattleJsonState;
  const state = resolveActionCooldownState(row, st, 'war_cry', nowMs);
  assert.equal(state.readyAtMs, undefined);
  assert.equal(state.remainingMs, 0);
  assertActionCooldownReady({
    characterId: 'test',
    row,
    st,
    action: 'war_cry',
    nowMs,
  });
}

function testGlobalBlocksAttack(): void {
  const nowMs = 1_000_000;
  const row = { skillCooldownsJson: [] } as unknown as CharacterRow;
  const st = {
    mysticSkillCdUntil: { attack: nowMs + 2000, l2_3: nowMs + 500 },
  } as BattleJsonState;
  const state = resolveActionCooldownState(row, st, 'attack', nowMs);
  assert.equal(state.blockedBy, 'global');
  assert.equal(state.readyAtMs, nowMs + 2000);
}

function testLegacyKeyNotUsedWithoutL2Prefix(): void {
  const nowMs = 1_000_000;
  const row = { skillCooldownsJson: [] } as unknown as CharacterRow;
  const st = {
    mysticSkillCdUntil: { '78': nowMs + 5000, l2_78: nowMs - 100 },
  } as BattleJsonState;
  const state = resolveActionCooldownState(row, st, 'war_cry', nowMs);
  assert.equal(
    state.skillCooldownUntilMs,
    undefined,
    'bare "78" key must not block l2_78 action'
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
  }
}

function main(): void {
  testDisplaySecCeil();
  testServerOffsetRemaining();
  testNormalizeSkillId();
  testMergeMaxJsonOverMystic();
  testMergeMaxMysticOverJson();
  testExpiredKeysDropped();
  testResolveWarCryBlockedByJson();
  testResolveExpiredAllowsCast();
  testGlobalBlocksAttack();
  testLegacyKeyNotUsedWithoutL2Prefix();
  testCooldownErrorShape();
  console.log('skill-cooldown-smoke: OK');
}

main();
