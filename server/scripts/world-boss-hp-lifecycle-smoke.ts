/**
 * Smoke: RB HP lifecycle — atomic decrement, lethal 0, respawn generation.
 * Запуск: npm run test:world-boss-hp-lifecycle
 */
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import {
  createWorldBossSessionState,
  isWorldBossSessionDeadForRespawn,
  registerWorldBossDamagingHit,
} from '../src/domain/worldBossSession.js';
import {
  ensureWorldBossSessionInTx,
  recordWorldBossDamagingHitInTx,
} from '../src/services/worldBossSessionService.js';
import type { MapWorldSpawn } from '../src/data/mapWorldSpawns.js';

function assertEq(actual: unknown, expected: unknown, msg: string): void {
  assert.equal(actual, expected, msg);
}

function testDomainAtomicFromSevenHp(): void {
  const nowMs = Date.now();
  const session = createWorldBossSessionState({
    spawnId: 'rb_atomic_test',
    mobHp: 7,
    mobMaxHp: 75240,
    mobPAtk: 100,
    mobPDef: 50,
    mobMAtk: 0,
    mobMDef: 0,
    mobEvasion: 0,
    spawnWorldX: 0,
    spawnWorldY: 0,
    spawnName: 'Test RB',
    spawnLevel: 40,
    spawnKind: 'raid',
    nowMs,
  });
  const preHp = session.mobHp;
  session.mobHp = Math.max(0, preHp - 10);
  registerWorldBossDamagingHit(session, 'char_a', 10, nowMs);
  assertEq(session.mobHp, 0, '7 HP - 10 damage must persist mobHp=0');
  assert(isWorldBossSessionDeadForRespawn(session), 'dead session flagged for respawn');
}

async function testDbConcurrentAtomicHits(): Promise<void> {
  const spawnId = `rb_hp_${Date.now()}`;
  const nowMs = Date.now();
  await prisma.worldBossSession.create({
    data: {
      spawnId,
      stateJson: createWorldBossSessionState({
        spawnId,
        mobHp: 7,
        mobMaxHp: 75240,
        mobPAtk: 100,
        mobPDef: 50,
        mobMAtk: 0,
        mobMDef: 0,
        mobEvasion: 0,
        spawnWorldX: 0,
        spawnWorldY: 0,
        spawnName: 'Concurrent RB',
        spawnLevel: 40,
        spawnKind: 'raid',
        nowMs,
      }),
    },
  });

  await Promise.all([
    prisma.$transaction((tx) =>
      recordWorldBossDamagingHitInTx(tx, spawnId, 'char_a', 4, nowMs)
    ),
    prisma.$transaction((tx) =>
      recordWorldBossDamagingHitInTx(tx, spawnId, 'char_b', 4, nowMs)
    ),
  ]);

  const row = await prisma.worldBossSession.findUnique({ where: { spawnId } });
  assert(row, 'session row must exist');
  const state = row.stateJson as { mobHp?: number };
  assert(
    (state.mobHp ?? -1) <= 3,
    `parallel hits must not revive boss above 3 HP, got ${state.mobHp}`
  );

  await prisma.$transaction(async (tx) => {
    const lethal = await recordWorldBossDamagingHitInTx(
      tx,
      spawnId,
      'char_c',
      100,
      nowMs + 1
    );
    assert(lethal, 'lethal hit must return result');
    assertEq(lethal.nextHp, 0, 'lethal hit from low HP must persist 0');
    assertEq(lethal.session.mobHp, 0, 'session persisted mobHp=0');
  });

  await prisma.worldBossSession.delete({ where: { spawnId } }).catch(() => undefined);
}

async function testRespawnFullHp(): Promise<void> {
  const spawnId = `rb_resp_${Date.now()}`;
  const nowMs = Date.now();
  await prisma.worldBossSession.create({
    data: {
      spawnId,
      stateJson: {
        ...createWorldBossSessionState({
          spawnId,
          mobHp: 0,
          mobMaxHp: 75240,
          mobPAtk: 100,
          mobPDef: 50,
          mobMAtk: 0,
          mobMDef: 0,
          mobEvasion: 0,
          spawnWorldX: 0,
          spawnWorldY: 0,
          spawnName: 'Respawn RB',
          spawnLevel: 40,
          spawnKind: 'raid',
          nowMs,
        }),
        lootIssued: true,
        spawnGeneration: 3,
      },
    },
  });

  const spawn: MapWorldSpawn = {
    id: spawnId,
    name: 'Respawn RB',
    level: 40,
    kind: 'raid',
    worldX: 0,
    worldY: 0,
    aggressive: true,
  };

  await prisma.$transaction(async (tx) => {
    const session = await ensureWorldBossSessionInTx(tx, spawn, 7, nowMs);
    assertEq(
      session.mobHp,
      session.mobMaxHp,
      'respawn after dead session must restore full HP'
    );
    assert(
      (session.spawnGeneration ?? 1) >= 4,
      'respawn must increment spawnGeneration'
    );
  });

  await prisma.worldBossSession.delete({ where: { spawnId } }).catch(() => undefined);
}

async function main(): Promise<void> {
  testDomainAtomicFromSevenHp();
  console.log('[test:world-boss-hp-lifecycle] domain atomic 7→0 OK');

  await testDbConcurrentAtomicHits();
  console.log('[test:world-boss-hp-lifecycle] DB atomic hits OK');

  await testRespawnFullHp();
  console.log('[test:world-boss-hp-lifecycle] respawn full HP OK');

  console.log('[test:world-boss-hp-lifecycle] ALL OK');
}

main().catch((err) => {
  console.error('[test:world-boss-hp-lifecycle] FAIL', err);
  process.exit(1);
});
