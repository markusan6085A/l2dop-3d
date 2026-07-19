/**
 * Clan City Siege Stage A — core smoke.
 * npm run test:clan-siege-core
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import {
  SIEGE_ATTACK_MIN_INTERVAL_MS,
  SIEGE_REWARD_CLAN_POINTS,
  SIEGE_WALL_DAMAGE_MAX,
  SIEGE_WALL_DAMAGE_MIN,
  SIEGE_WALL_MAX_HP,
} from '../src/domain/clanSiegeConfig.js';
import { CLAN_SIEGE_FINISH_REASON } from '../src/domain/clanSiegeConstants.js';
import { getZonedParts, zonedLocalToUtc } from '../src/domain/clanSiegeTime.js';
import { prisma } from '../src/lib/prisma.js';
import {
  SiegeAttackError,
  attackSiegeWallForUser,
  getSiegeStateForUser,
} from '../src/services/clanSiege/clanSiegeStateService.js';
import { finishClanSiegeInTx } from '../src/services/clanSiege/clanSiegeFinishService.js';
import {
  ensureSiegeScheduleForKyivDate,
} from '../src/services/clanSiege/clanSiegeScheduleService.js';
import { runClanSiegeServerTick } from '../src/services/clanSiege/clanSiegeTickService.js';
import {
  CLAN_SIEGE_TEST_ROW_KEY,
} from '../src/services/clanSiege/clanSiegeTestConfig.js';
import {
  ensureClanSiegeTestSiege,
  resetClanSiegeTestScheduleLogForTests,
} from '../src/services/clanSiege/clanSiegeTestService.js';
import { getClanMyForUser } from '../src/services/clanMyService.js';
import { spawnSync } from 'node:child_process';

const CITY = 'l2dop_oren';
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

type Acc = { userId: string; characterId: string; name: string };

async function createTestAccount(label: string, opts?: { clanId?: string }): Promise<Acc> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `siege_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `S${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 20,
          clanId: opts?.clanId ?? null,
          clanRole: opts?.clanId ? 'member' : null,
        },
      },
    },
    include: { characters: true },
  });
  const c = user.characters[0]!;
  return { userId: user.id, characterId: c.id, name: c.name };
}

async function createTestClan(label: string): Promise<Acc & { clanId: string }> {
  const acc = await createTestAccount(label);
  const clanName = `SG${label}${String(Date.now()).slice(-4)}`.slice(0, 16);
  const clan = await prisma.clan.create({
    data: {
      name: clanName,
      leaderId: acc.characterId,
    },
  });
  await prisma.character.update({
    where: { id: acc.characterId },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return { ...acc, clanId: clan.id };
}

async function seedActiveSiege(args?: {
  cityId?: string;
  wallHp?: number;
  startsAt?: Date;
  endsAt?: Date;
  state?: string;
}) {
  const now = Date.now();
  return prisma.clanSiege.create({
    data: {
      cityId: args?.cityId ?? CITY,
      startsAt: args?.startsAt ?? new Date(now - 60_000),
      endsAt: args?.endsAt ?? new Date(now + 3_600_000),
      state: args?.state ?? 'active',
      wallHp: args?.wallHp ?? SIEGE_WALL_MAX_HP,
      wallMaxHp: SIEGE_WALL_MAX_HP,
    },
  });
}

async function cleanupUsers(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

async function resetCitySieges(cityId = CITY): Promise<void> {
  await prisma.clanSiege.deleteMany({ where: { cityId } });
}

async function resetTestSiege(cityId: string): Promise<void> {
  await prisma.clanSiege.deleteMany({
    where: { cityId, testKey: CLAN_SIEGE_TEST_ROW_KEY },
  });
}

function findKyivCalendarProbeDate(): { year: number; month: number; day: number } {
  return { year: 2026, month: 7, day: 19 };
}

async function main(): Promise<void> {
  console.log('clan-siege-core-smoke\n');

  const winter = zonedLocalToUtc(2026, 1, 15, 18, 0, 'Europe/Kyiv');
  assert.equal(winter.toISOString(), '2026-01-15T16:00:00.000Z');
  const summer = zonedLocalToUtc(2026, 7, 19, 18, 0, 'Europe/Kyiv');
  assert.equal(summer.toISOString(), '2026-07-19T15:00:00.000Z');
  const wp = getZonedParts(winter, 'Europe/Kyiv');
  assert.equal(wp.hour, 18);
  ok('Europe/Kyiv winter/summer conversion');

  const users: string[] = [];
  const leaderA = await createTestClan('A');
  const leaderB = await createTestClan('B');
  const mateB = await createTestAccount('MB', { clanId: leaderB.clanId });
  users.push(mateB.userId);
  const noClan = await createTestAccount('NC');
  users.push(leaderA.userId, leaderB.userId, mateB.userId, noClan.userId);

  await prisma.cityCastle.upsert({
    where: { cityId: CITY },
    create: { cityId: CITY, ownerClanId: leaderA.clanId, capturedAt: new Date() },
    update: { ownerClanId: leaderA.clanId },
  });

  await prisma.clanSiege.deleteMany({});
  const scheduleProbeMs = zonedLocalToUtc(2026, 7, 15, 12, 0, 'Europe/Kyiv').getTime();
  const gludioSchedule = await getSiegeStateForUser(
    leaderB.userId,
    'l2dop_gludio',
    leaderB.characterId,
    scheduleProbeMs
  );
  assert.equal(gludioSchedule.state, 'scheduled');
  assert.ok(gludioSchedule.startsAt);
  assert.ok(gludioSchedule.endsAt);
  const expectedGludioStart = zonedLocalToUtc(2026, 7, 15, 19, 40, 'Europe/Kyiv');
  const expectedGludioEnd = new Date(
    expectedGludioStart.getTime() + 20 * 60_000
  );
  assert.equal(gludioSchedule.startsAt, expectedGludioStart.toISOString());
  assert.equal(gludioSchedule.endsAt, expectedGludioEnd.toISOString());
  ok('GET state without DB row returns upcoming daily Kyiv schedule for gludio');

  await resetCitySieges();

  const future = await seedActiveSiege({
    startsAt: new Date(Date.now() + 3600_000),
    endsAt: new Date(Date.now() + 7200_000),
    state: 'scheduled',
  });
  try {
    await attackSiegeWallForUser(leaderB.userId, CITY, 'pre-start', leaderB.characterId);
    assert.fail('expected pre-start reject');
  } catch (e) {
    assert.ok(e instanceof SiegeAttackError);
    assert.equal(e.code, 'siege_not_started');
  }
  ok('before startsAt attack blocked');
  await resetCitySieges();

  const past = await seedActiveSiege({
    startsAt: new Date(Date.now() - 7200_000),
    endsAt: new Date(Date.now() - 1000),
    state: 'active',
    wallHp: 100,
  });
  const postEnd = await attackSiegeWallForUser(
    leaderB.userId,
    CITY,
    'post-end',
    leaderB.characterId
  );
  assert.equal(postEnd.finished, true);
  assert.equal(postEnd.damage, 0);
  assert.equal(postEnd.state, 'finished');
  const pastDb = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: past.id },
  });
  assert.equal(pastDb.state, 'finished');
  assert.equal(pastDb.finishReason, CLAN_SIEGE_FINISH_REASON.timeExpired);
  assert.equal(pastDb.wallHp, 100);
  const pastState = await getSiegeStateForUser(
    leaderB.userId,
    CITY,
    leaderB.characterId,
    past.endsAt.getTime() - 500
  );
  assert.equal(pastState.state, 'finished');
  assert.equal(pastState.canAttackWall, false);
  ok('after endsAt attack finishes atomically without damage');
  await resetCitySieges();

  await seedActiveSiege({ wallHp: 1000 });
  try {
    await attackSiegeWallForUser(noClan.userId, CITY, 'noclan', noClan.characterId);
    assert.fail('expected no clan reject');
  } catch (e) {
    assert.ok(e instanceof SiegeAttackError);
    assert.equal(e.code, 'siege_no_clan');
  }
  ok('no clan cannot attack');
  await resetCitySieges();

  const activeDef = await seedActiveSiege({ wallHp: 50_000 });
  try {
    await attackSiegeWallForUser(
      leaderA.userId,
      CITY,
      'defender',
      leaderA.characterId
    );
    assert.fail('expected defender reject');
  } catch (e) {
    assert.ok(e instanceof SiegeAttackError);
    assert.equal(e.code, 'siege_defender');
  }
  ok('owner clan cannot attack own wall');
  await resetCitySieges();

  const active = await seedActiveSiege({ wallHp: 500_000 });
  const hit1 = await attackSiegeWallForUser(
    leaderB.userId,
    CITY,
    'hit-1',
    leaderB.characterId
  );
  assert.ok(hit1.damage >= SIEGE_WALL_DAMAGE_MIN && hit1.damage <= SIEGE_WALL_DAMAGE_MAX);
  assert.ok(hit1.wallHp >= 0);
  ok('damage in 1..1000 and wallHp >= 0');

  const hit2 = await attackSiegeWallForUser(
    mateB.userId,
    CITY,
    'hit-2',
    mateB.characterId
  );
  const clanRow = await prisma.clanSiegeClanDamage.findUnique({
    where: {
      siegeId_clanId: { siegeId: active.id, clanId: leaderB.clanId },
    },
  });
  assert.ok(clanRow);
  assert.equal(clanRow!.totalDamage, hit1.damage + hit2.damage);
  ok('two members same clan accumulate clan total');

  const fiveHits = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      createTestAccount(`F${i}`, { clanId: leaderB.clanId }).then((acc) => {
        users.push(acc.userId);
        return attackSiegeWallForUser(
          acc.userId,
          CITY,
          `five-${i}`,
          acc.characterId
        );
      })
    )
  );
  const clanAfterFive = await prisma.clanSiegeClanDamage.findUnique({
    where: {
      siegeId_clanId: { siegeId: active.id, clanId: leaderB.clanId },
    },
  });
  const sumFive = fiveHits.reduce((s, h) => s + h.damage, 0);
  assert.equal(
    clanAfterFive!.totalDamage,
    hit1.damage + hit2.damage + sumFive
  );
  ok('five attackers same clan — no lost damage');

  const clanC = await createTestClan('C');
  users.push(clanC.userId);
  const hitC = await attackSiegeWallForUser(
    clanC.userId,
    CITY,
    'clan-c-1',
    clanC.characterId
  );
  const clanCRow = await prisma.clanSiegeClanDamage.findUnique({
    where: {
      siegeId_clanId: { siegeId: active.id, clanId: clanC.clanId },
    },
  });
  assert.equal(clanCRow!.totalDamage, hitC.damage);
  ok('different clans have independent totals');

  await resetCitySieges();
  await seedActiveSiege({ wallHp: 50_000 });
  const cdChar = await createTestAccount('CD', { clanId: leaderB.clanId });
  users.push(cdChar.userId);
  await attackSiegeWallForUser(cdChar.userId, CITY, 'cd-1', cdChar.characterId);
  try {
    await attackSiegeWallForUser(
      cdChar.userId,
      CITY,
      'cd-2',
      cdChar.characterId
    );
    assert.fail('expected cooldown');
  } catch (e) {
    assert.ok(e instanceof SiegeAttackError);
    assert.equal(e.code, 'siege_cooldown');
  }
  ok('cooldown rejects second hit < 350ms');

  await new Promise((r) => setTimeout(r, SIEGE_ATTACK_MIN_INTERVAL_MS + 30));
  const afterCd = await attackSiegeWallForUser(
    cdChar.userId,
    CITY,
    'after-cd',
    cdChar.characterId
  );
  assert.ok(afterCd.damage > 0);
  ok('attack passes after cooldown');

  const replay = await attackSiegeWallForUser(
    cdChar.userId,
    CITY,
    'after-cd',
    cdChar.characterId
  );
  assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.damage, afterCd.damage);
  assert.equal(replay.wallHp, afterCd.wallHp);
  assert.equal(replay.siegeVersion, afterCd.siegeVersion);
  ok('same actionId is idempotent replay with original payload');

  await resetCitySieges();
  const sameCharSiege = await seedActiveSiege({ wallHp: 5000 });
  const parSame = await Promise.allSettled([
    attackSiegeWallForUser(cdChar.userId, CITY, 'sc-a', cdChar.characterId),
    attackSiegeWallForUser(cdChar.userId, CITY, 'sc-b', cdChar.characterId),
  ]);
  const appliedSame = parSame.filter(
    (r) => r.status === 'fulfilled' && r.value.damage > 0
  ).length;
  assert.equal(appliedSame, 1);
  ok('parallel POST same character — one damage application');

  await resetCitySieges();
  const seqSiege = await seedActiveSiege({ wallHp: 20_000 });
  const seqChar = await createTestAccount('SEQ', { clanId: leaderB.clanId });
  users.push(seqChar.userId);
  const hitA = await attackSiegeWallForUser(
    seqChar.userId,
    CITY,
    'seq-a',
    seqChar.characterId
  );
  await new Promise((r) => setTimeout(r, SIEGE_ATTACK_MIN_INTERVAL_MS + 30));
  const hitB = await attackSiegeWallForUser(
    seqChar.userId,
    CITY,
    'seq-b',
    seqChar.characterId
  );
  const siegeAfterB = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: seqSiege.id },
  });
  const clanAfterB = await prisma.clanSiegeClanDamage.findUnique({
    where: {
      siegeId_clanId: { siegeId: seqSiege.id, clanId: leaderB.clanId },
    },
  });
  const retryA = await attackSiegeWallForUser(
    seqChar.userId,
    CITY,
    'seq-a',
    seqChar.characterId
  );
  assert.equal(retryA.idempotentReplay, true);
  assert.equal(retryA.damage, hitA.damage);
  const siegeAfterRetry = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: seqSiege.id },
  });
  assert.equal(siegeAfterRetry.wallHp, siegeAfterB.wallHp);
  assert.equal(clanAfterB!.totalDamage, hitA.damage + hitB.damage);
  ok('A → B → retry A does not apply duplicate damage');

  await resetCitySieges();
  const parActSiege = await seedActiveSiege({ wallHp: 50_000 });
  const parAcc = await createTestAccount('PID', { clanId: leaderB.clanId });
  users.push(parAcc.userId);
  const [pa1, pa2] = await Promise.allSettled([
    attackSiegeWallForUser(parAcc.userId, CITY, 'same-act', parAcc.characterId),
    attackSiegeWallForUser(parAcc.userId, CITY, 'same-act', parAcc.characterId),
  ]);
  const fulfilledSame = [pa1, pa2]
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof attackSiegeWallForUser>>> =>
        r.status === 'fulfilled'
    )
    .map((r) => r.value);
  assert.equal(fulfilledSame.length, 2);
  const firstHits = fulfilledSame.filter((r) => !r.idempotentReplay);
  const replayHits = fulfilledSame.filter((r) => r.idempotentReplay);
  assert.equal(firstHits.length, 1);
  assert.equal(replayHits.length, 1);
  assert.equal(replayHits[0]!.damage, firstHits[0]!.damage);
  assert.equal(
    await prisma.clanSiegeWallAction.count({
      where: { siegeId: parActSiege.id, actionId: 'same-act' },
    }),
    1
  );
  ok('parallel same actionId applies once');

  await resetCitySieges();
  const endsAtMs = Date.now() - 1;
  const endsAt = new Date(endsAtMs);
  const barelyEnded = await seedActiveSiege({
    startsAt: new Date(endsAtMs - 3_600_000),
    endsAt,
    state: 'active',
    wallHp: 5000,
  });
  const lateHit = await attackSiegeWallForUser(
    leaderB.userId,
    CITY,
    'late-1ms',
    leaderB.characterId,
    endsAtMs + 1
  );
  assert.equal(lateHit.damage, 0);
  assert.equal(lateHit.finished, true);
  const barelyDb = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: barelyEnded.id },
  });
  assert.equal(barelyDb.wallHp, 5000);
  assert.equal(barelyDb.finishReason, CLAN_SIEGE_FINISH_REASON.timeExpired);
  const lateAgain = await attackSiegeWallForUser(
    leaderB.userId,
    CITY,
    'late-again',
    leaderB.characterId,
    endsAtMs + 2
  );
  assert.equal(lateAgain.finished, true);
  assert.equal(lateAgain.damage, 0);
  const barelyDb2 = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: barelyEnded.id },
  });
  assert.equal(barelyDb2.state, 'finished');
  assert.equal(barelyDb2.finishReason, CLAN_SIEGE_FINISH_REASON.timeExpired);
  ok('attack 1ms after endsAt forbidden and time_expired finish is once');

  await resetCitySieges();
  const wallBattle = await seedActiveSiege({ wallHp: 100 });
  const t1 = new Date(Date.now() - 5000);
  const t2 = new Date(Date.now() - 3000);
  await prisma.clanSiegeClanDamage.create({
    data: {
      siegeId: wallBattle.id,
      clanId: leaderB.clanId,
      totalDamage: 1500,
      firstHitAt: t1,
      lastHitAt: t1,
    },
  });
  await prisma.clanSiegeClanDamage.create({
    data: {
      siegeId: wallBattle.id,
      clanId: clanC.clanId,
      totalDamage: 1400,
      firstHitAt: t2,
      lastHitAt: t2,
    },
  });
  await prisma.clanSiege.update({
    where: { id: wallBattle.id },
    data: { wallHp: 100 },
  });
  await prisma.clanSiegeParticipant.create({
    data: {
      siegeId: wallBattle.id,
      characterId: leaderB.characterId,
      clanId: leaderB.clanId,
      lastSeenAt: new Date(),
    },
  });
  await prisma.character.update({
    where: { id: leaderB.characterId },
    data: { hp: 1000 },
  });
  const rewardClanBefore = await prisma.clan.findUniqueOrThrow({
    where: { id: leaderB.clanId },
    select: { clanPoints: true },
  });
  await attackSiegeWallForUser(
    clanC.userId,
    CITY,
    'final-blow',
    clanC.characterId
  );
  const finalReplay = await attackSiegeWallForUser(
    clanC.userId,
    CITY,
    'final-blow',
    clanC.characterId
  );
  assert.equal(finalReplay.idempotentReplay, true);
  assert.ok(finalReplay.damage > 0);
  const finished = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: wallBattle.id },
  });
  assert.equal(finished.state, 'finished');
  assert.equal(finished.finishReason, CLAN_SIEGE_FINISH_REASON.wallDestroyed);
  assert.equal(finished.winnerClanId, leaderB.clanId);
  ok('winner is highest totalDamage not last hit (tie-break lastHitAt ASC)');

  const ledgerCount = await prisma.clanSiegeRewardLedger.count({
    where: { siegeId: wallBattle.id },
  });
  assert.equal(ledgerCount, 1);
  const castle = await prisma.cityCastle.findUniqueOrThrow({
    where: { cityId: CITY },
  });
  assert.equal(castle.ownerClanId, leaderB.clanId);
  const rewardClanAfter = await prisma.clan.findUniqueOrThrow({
    where: { id: leaderB.clanId },
    select: { clanPoints: true },
  });
  assert.equal(
    rewardClanAfter.clanPoints - rewardClanBefore.clanPoints,
    SIEGE_REWARD_CLAN_POINTS
  );
  ok('wall destroyed grants 8000 clanPoints once + updates owner');
  ok('reward not duplicated on replay');

  await resetCitySieges();
  await prisma.cityCastle.update({
    where: { cityId: CITY },
    data: { ownerClanId: leaderA.clanId },
  });
  const parallelWall = await seedActiveSiege({ wallHp: 100 });
  const parA = await createTestAccount('PA', { clanId: clanC.clanId });
  const parB = await createTestAccount('PB', { clanId: clanC.clanId });
  users.push(parA.userId, parB.userId);
  const [p1, p2] = await Promise.allSettled([
    attackSiegeWallForUser(parA.userId, CITY, 'par-1', parA.characterId),
    attackSiegeWallForUser(parB.userId, CITY, 'par-2', parB.characterId),
  ]);
  const fulfilled = [p1, p2].filter(
    (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof attackSiegeWallForUser>>> =>
      r.status === 'fulfilled'
  );
  assert.ok(fulfilled.length >= 1);
  const parFinished = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: parallelWall.id },
  });
  assert.equal(parFinished.wallHp, 0);
  assert.equal(parFinished.state, 'finished');
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: parallelWall.id } }),
    1
  );
  assert.ok(fulfilled.some((r) => r.value.finished));
  ok('parallel final hits — single finish + single reward');

  await resetCitySieges();
  const expireSiege = await seedActiveSiege({
    wallHp: 999,
    startsAt: new Date(Date.now() - 7200_000),
    endsAt: new Date(Date.now() - 1000),
    state: 'active',
  });
  const ownerBefore = await prisma.cityCastle.findUniqueOrThrow({
    where: { cityId: CITY },
    select: { ownerClanId: true },
  });
  await prisma.$transaction((tx) =>
    finishClanSiegeInTx(
      tx,
      expireSiege.id,
      CLAN_SIEGE_FINISH_REASON.timeExpired,
      Date.now()
    )
  );
  const expired = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: expireSiege.id },
  });
  assert.equal(expired.finishReason, CLAN_SIEGE_FINISH_REASON.timeExpired);
  assert.equal(expired.winnerClanId, null);
  const ownerAfter = await prisma.cityCastle.findUniqueOrThrow({
    where: { cityId: CITY },
    select: { ownerClanId: true },
  });
  assert.equal(ownerAfter.ownerClanId, ownerBefore.ownerClanId);
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: expireSiege.id } }),
    0
  );
  ok('time expired keeps owner and grants no reward');

  const state = await getSiegeStateForUser(
    leaderB.userId,
    CITY,
    leaderB.characterId
  );
  assert.ok(typeof state.serverTime === 'string');
  assert.ok(typeof state.version === 'number');
  assert.ok(Array.isArray(state.topClans));
  ok('GET state returns contract fields');

  const TEST_CITY = 'l2dop_giran';
  const prevTestEnabled = process.env.CLAN_SIEGE_TEST_ENABLED;
  process.env.CLAN_SIEGE_TEST_ENABLED = 'true';
  process.env.CLAN_SIEGE_TEST_CITY_ID = TEST_CITY;
  process.env.CLAN_SIEGE_TEST_START_IN_MINUTES = '2';
  process.env.CLAN_SIEGE_TEST_DURATION_MINUTES = '20';
  await resetTestSiege(TEST_CITY);
  resetClanSiegeTestScheduleLogForTests();

  const testNow = Date.now();
  await ensureClanSiegeTestSiege(testNow);
  await ensureClanSiegeTestSiege(testNow + 1000);
  const testRows = await prisma.clanSiege.findMany({
    where: { cityId: TEST_CITY, testKey: CLAN_SIEGE_TEST_ROW_KEY },
  });
  assert.equal(testRows.length, 1);
  ok('test mode creates one siege row');

  await runClanSiegeServerTick(testNow);
  await runClanSiegeServerTick(testNow + 45_000);
  assert.equal(
    await prisma.clanSiege.count({
      where: { cityId: TEST_CITY, testKey: CLAN_SIEGE_TEST_ROW_KEY },
    }),
    1
  );
  ok('test mode tick does not duplicate siege');

  await prisma.clanSiege.update({
    where: { id: testRows[0]!.id },
    data: { wallHp: 12345, state: 'active' },
  });
  await ensureClanSiegeTestSiege(testNow + 5000);
  const afterReinit = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: testRows[0]!.id },
  });
  assert.equal(afterReinit.wallHp, 12345);
  ok('test mode re-init does not reset wall HP');

  process.env.CLAN_SIEGE_TEST_ENABLED = 'false';
  resetClanSiegeTestScheduleLogForTests();
  const beforeDisabled = await prisma.clanSiege.count({
    where: { cityId: TEST_CITY, testKey: CLAN_SIEGE_TEST_ROW_KEY },
  });
  await ensureClanSiegeTestSiege(testNow + 10_000);
  assert.equal(
    await prisma.clanSiege.count({
      where: { cityId: TEST_CITY, testKey: CLAN_SIEGE_TEST_ROW_KEY },
    }),
    beforeDisabled
  );
  ok('test mode disabled does not create new siege');

  const dayDate = findKyivCalendarProbeDate();
  const dayWindowStart = zonedLocalToUtc(
    dayDate.year,
    dayDate.month,
    dayDate.day,
    17,
    59,
    'Europe/Kyiv'
  );
  const dayWindowEnd = zonedLocalToUtc(
    dayDate.year,
    dayDate.month,
    dayDate.day,
    21,
    0,
    'Europe/Kyiv'
  );
  await prisma.clanSiege.deleteMany({
    where: {
      testKey: null,
      startsAt: { gte: dayWindowStart, lt: dayWindowEnd },
    },
  });
  await ensureSiegeScheduleForKyivDate(dayDate);
  assert.equal(
    await prisma.clanSiege.count({
      where: {
        testKey: null,
        startsAt: { gte: dayWindowStart, lt: dayWindowEnd },
      },
    }),
    8
  );
  ok('daily schedule creates 8 slots when test mode disabled');

  await prisma.clan.update({
    where: { id: leaderB.clanId },
    data: { clanPoints: 8000 },
  });
  const clanMy = await getClanMyForUser(leaderB.userId);
  assert.ok(clanMy);
  assert.equal(clanMy!.skillPoints, 8000);
  ok('clan-my returns real clanPoints as skillPoints');

  if (prevTestEnabled === undefined) delete process.env.CLAN_SIEGE_TEST_ENABLED;
  else process.env.CLAN_SIEGE_TEST_ENABLED = prevTestEnabled;
  await resetTestSiege(TEST_CITY);

  await cleanupUsers(users);
  await resetCitySieges();

  const clientSmoke = spawnSync(
    process.execPath,
    ['server/scripts/clan-siege-client-smoke.mjs'],
    { cwd: path.join(__dirname, '../..'), stdio: 'pipe', encoding: 'utf8' }
  );
  if (clientSmoke.status !== 0) {
    throw new Error(
      clientSmoke.stderr || clientSmoke.stdout || 'clan-siege-client-smoke failed'
    );
  }
  ok('client polling smoke');

  console.log(`\n${passed} passed`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
