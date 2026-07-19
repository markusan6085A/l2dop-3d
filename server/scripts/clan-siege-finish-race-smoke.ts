/**
 * Clan Siege — atomic finish / reward race regression.
 * npm run test:clan-siege-finish-race
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import {
  SIEGE_REWARD_CLAN_POINTS,
  SIEGE_WALL_DAMAGE_MIN,
  SIEGE_WALL_DAMAGE_MAX,
  SIEGE_WALL_MAX_HP,
} from '../src/domain/clanSiegeConfig.js';
import { CLAN_SIEGE_FINISH_REASON } from '../src/domain/clanSiegeConstants.js';
import { prisma } from '../src/lib/prisma.js';
import { attackSiegeWallForUser } from '../src/services/clanSiege/clanSiegeStateService.js';
import { finishClanSiegeInTx } from '../src/services/clanSiege/clanSiegeFinishService.js';

const CITY = 'l2dop_oren';
const RACE_ITERATIONS = 100;
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

type Acc = { userId: string; characterId: string; clanId: string };

async function createClanAccount(label: string): Promise<Acc> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `sgr_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `R${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId: CITY,
          worldX: 520_000,
          worldY: 520_000,
          hp: 5000,
        },
      },
    },
    include: { characters: true },
  });
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `GR${label}${suffix.slice(-4)}`.slice(0, 16),
      leaderId: c.id,
    },
  });
  await prisma.character.update({
    where: { id: c.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return { userId: user.id, characterId: c.id, clanId: clan.id };
}

async function seedActiveSiege(
  nowMs: number,
  opts: {
    wallHp?: number;
    endsAtMs?: number;
    cityId?: string;
  } = {}
) {
  return prisma.clanSiege.create({
    data: {
      cityId: opts.cityId ?? CITY,
      startsAt: new Date(nowMs - 60_000),
      endsAt: new Date(opts.endsAtMs ?? nowMs + 3_600_000),
      state: 'active',
      wallHp: opts.wallHp ?? SIEGE_WALL_MAX_HP,
      wallMaxHp: SIEGE_WALL_MAX_HP,
    },
  });
}

async function registerParticipant(
  siegeId: string,
  acc: Acc,
  nowMs: number
): Promise<void> {
  await prisma.clanSiegeParticipant.create({
    data: {
      siegeId,
      characterId: acc.characterId,
      clanId: acc.clanId,
      lastSeenAt: new Date(nowMs),
    },
  });
}

async function assertSingleFinishReward(args: {
  siegeId: string;
  expectedWinnerClanId?: string;
  ownerClanIdBefore: string | null;
  ptsBeforeByClanId: Record<string, number>;
  label: string;
}): Promise<void> {
  const siege = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: args.siegeId },
  });
  assert.equal(siege.state, 'finished');
  assert.ok(siege.winnerClanId);
  if (args.expectedWinnerClanId) {
    assert.equal(siege.winnerClanId, args.expectedWinnerClanId);
  }
  assert.ok(siege.finishedAt);
  assert.ok(siege.rewardGrantedAt);
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: args.siegeId } }),
    1
  );
  const ledger = await prisma.clanSiegeRewardLedger.findUniqueOrThrow({
    where: { siegeId: args.siegeId },
  });
  assert.equal(ledger.clanId, siege.winnerClanId);
  assert.equal(ledger.points, SIEGE_REWARD_CLAN_POINTS);

  for (const [clanId, ptsBefore] of Object.entries(args.ptsBeforeByClanId)) {
    const ptsAfter = (
      await prisma.clan.findUniqueOrThrow({ where: { id: clanId } })
    ).clanPoints;
    const delta = ptsAfter - ptsBefore;
    if (clanId === siege.winnerClanId) {
      assert.equal(delta, SIEGE_REWARD_CLAN_POINTS, `${args.label}: winner +8000`);
    } else {
      assert.equal(delta, 0, `${args.label}: loser unchanged`);
    }
  }

  const castle = await prisma.cityCastle.findUniqueOrThrow({
    where: { cityId: CITY },
  });
  assert.equal(castle.ownerClanId, siege.winnerClanId);
  if (args.ownerClanIdBefore && args.ownerClanIdBefore !== siege.winnerClanId) {
    assert.notEqual(castle.ownerClanId, args.ownerClanIdBefore);
  }
}

function runWithWallDamage(damage: number, fn: () => Promise<void>): Promise<void> {
  const span = SIEGE_WALL_DAMAGE_MAX - SIEGE_WALL_DAMAGE_MIN + 1;
  const clamped = Math.max(SIEGE_WALL_DAMAGE_MIN, Math.min(SIEGE_WALL_DAMAGE_MAX, damage));
  const normalized = (clamped - SIEGE_WALL_DAMAGE_MIN + 0.5) / span;
  const saved = Math.random;
  Math.random = () => normalized;
  return fn().finally(() => {
    Math.random = saved;
  });
}

async function runParallelFinishScenario(iteration: number): Promise<void> {
  await runWithWallDamage(50, async () => {
  const nowMs = Date.now() + iteration * 50_000;
  const owner = await createClanAccount(`o${iteration}`);
  await prisma.cityCastle.upsert({
    where: { cityId: CITY },
    create: { cityId: CITY, ownerClanId: owner.clanId },
    update: { ownerClanId: owner.clanId },
  });

  const siege = await seedActiveSiege(nowMs, { wallHp: 100 });
  const pA = await createClanAccount(`a${iteration}`);
  const pB = await createClanAccount(`b${iteration}`);
  await registerParticipant(siege.id, pA, nowMs + 1);
  await registerParticipant(siege.id, pB, nowMs + 1);
  await prisma.clanSiegeClanDamage.createMany({
    data: [
      {
        siegeId: siege.id,
        clanId: pA.clanId,
        totalDamage: 50,
        firstHitAt: new Date(nowMs),
        lastHitAt: new Date(nowMs),
      },
      {
        siegeId: siege.id,
        clanId: pB.clanId,
        totalDamage: 50,
        firstHitAt: new Date(nowMs + 1),
        lastHitAt: new Date(nowMs + 1),
      },
    ],
  });
  const ptsBeforeByClanId: Record<string, number> = {
    [pA.clanId]: (
      await prisma.clan.findUniqueOrThrow({ where: { id: pA.clanId } })
    ).clanPoints,
    [pB.clanId]: (
      await prisma.clan.findUniqueOrThrow({ where: { id: pB.clanId } })
    ).clanPoints,
  };

  const [r1, r2] = await Promise.all([
    attackSiegeWallForUser(pA.userId, CITY, `par-a-${iteration}`, pA.characterId, nowMs + 10),
    attackSiegeWallForUser(pB.userId, CITY, `par-b-${iteration}`, pB.characterId, nowMs + 10),
  ]);

  assert.ok(r1.ok);
  assert.ok(r2.ok);
  assert.ok(r1.finished || r2.finished);

  await assertSingleFinishReward({
    siegeId: siege.id,
    ownerClanIdBefore: owner.clanId,
    ptsBeforeByClanId,
    label: `iter ${iteration}`,
  });

  const finishedRows = await prisma.clanSiege.findMany({
    where: { id: siege.id },
    select: {
      winnerClanId: true,
      finishReason: true,
      finishedAt: true,
      rewardGrantedAt: true,
    },
  });
  assert.equal(finishedRows.length, 1);
  assert.equal(finishedRows[0]!.finishReason, CLAN_SIEGE_FINISH_REASON.wallDestroyed);

  await prisma.cityCastle.update({
    where: { cityId: CITY },
    data: { ownerClanId: owner.clanId },
  });
  await prisma.clanSiege.delete({ where: { id: siege.id } });
  await prisma.user.deleteMany({
    where: { id: { in: [owner.userId, pA.userId, pB.userId] } },
  });
  });
}

async function main(): Promise<void> {
  console.log('clan-siege-finish-race-smoke\n');
  const users: string[] = [];
  const nowMs = Date.now();

  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });
  const owner = await createClanAccount('own');
  users.push(owner.userId);
  await prisma.cityCastle.upsert({
    where: { cityId: CITY },
    create: { cityId: CITY, ownerClanId: owner.clanId },
    update: { ownerClanId: owner.clanId },
  });

  for (let i = 0; i < RACE_ITERATIONS; i += 1) {
    await runParallelFinishScenario(i);
  }
  ok(`${RACE_ITERATIONS}x parallel wall finish — single ledger, +8000, no 500`);

  const sameClanA = await createClanAccount('sc1');
  const sameClanB = await createClanAccount('sc2');
  users.push(sameClanA.userId, sameClanB.userId);
  await prisma.character.update({
    where: { id: sameClanB.characterId },
    data: { clanId: sameClanA.clanId, clanRole: 'member' },
  });
  sameClanB.clanId = sameClanA.clanId;
  const sameSiege = await seedActiveSiege(nowMs + 100_000, { wallHp: 100 });
  await registerParticipant(sameSiege.id, sameClanA, nowMs + 100_001);
  await registerParticipant(sameSiege.id, sameClanB, nowMs + 100_001);
  await prisma.clanSiegeClanDamage.create({
    data: {
      siegeId: sameSiege.id,
      clanId: sameClanA.clanId,
      totalDamage: 500,
      firstHitAt: new Date(nowMs + 100_000),
      lastHitAt: new Date(nowMs + 100_000),
    },
  });
  const samePtsBeforeByClanId = {
    [sameClanA.clanId]: (
      await prisma.clan.findUniqueOrThrow({ where: { id: sameClanA.clanId } })
    ).clanPoints,
  };
  await runWithWallDamage(50, async () => {
  const [s1, s2] = await Promise.all([
    attackSiegeWallForUser(
      sameClanA.userId,
      CITY,
      'same-a',
      sameClanA.characterId,
      nowMs + 100_010
    ),
    attackSiegeWallForUser(
      sameClanB.userId,
      CITY,
      'same-b',
      sameClanB.characterId,
      nowMs + 100_010
    ),
  ]);
  assert.ok(s1.ok && s2.ok);
  await assertSingleFinishReward({
    siegeId: sameSiege.id,
    expectedWinnerClanId: sameClanA.clanId,
    ownerClanIdBefore: owner.clanId,
    ptsBeforeByClanId: samePtsBeforeByClanId,
    label: 'same clan',
  });
  ok('two simultaneous last hits — same clan');
  });

  await runWithWallDamage(50, async () => {
  const diffSiege = await seedActiveSiege(nowMs + 110_000, { wallHp: 100 });
  const dA = await createClanAccount('da');
  const dB = await createClanAccount('db');
  users.push(dA.userId, dB.userId);
  await registerParticipant(diffSiege.id, dA, nowMs + 110_001);
  await registerParticipant(diffSiege.id, dB, nowMs + 110_001);
  await prisma.clanSiegeClanDamage.createMany({
    data: [
      {
        siegeId: diffSiege.id,
        clanId: dA.clanId,
        totalDamage: 50,
        firstHitAt: new Date(nowMs + 110_000),
        lastHitAt: new Date(nowMs + 110_000),
      },
      {
        siegeId: diffSiege.id,
        clanId: dB.clanId,
        totalDamage: 50,
        firstHitAt: new Date(nowMs + 110_001),
        lastHitAt: new Date(nowMs + 110_001),
      },
    ],
  });
  const diffPtsBeforeByClanId = {
    [dA.clanId]: (
      await prisma.clan.findUniqueOrThrow({ where: { id: dA.clanId } })
    ).clanPoints,
    [dB.clanId]: (
      await prisma.clan.findUniqueOrThrow({ where: { id: dB.clanId } })
    ).clanPoints,
  };
  await Promise.all([
    attackSiegeWallForUser(dA.userId, CITY, 'diff-a', dA.characterId, nowMs + 110_010),
    attackSiegeWallForUser(dB.userId, CITY, 'diff-b', dB.characterId, nowMs + 110_010),
  ]);
  await assertSingleFinishReward({
    siegeId: diffSiege.id,
    ownerClanIdBefore: owner.clanId,
    ptsBeforeByClanId: diffPtsBeforeByClanId,
    label: 'diff clans',
  });
  ok('two simultaneous last hits — different clans');
  });

  const timeoutSiege = await seedActiveSiege(nowMs + 120_000, {
    wallHp: 5000,
    endsAtMs: nowMs + 120_005,
  });
  const tA = await createClanAccount('ta');
  users.push(tA.userId);
  await registerParticipant(timeoutSiege.id, tA, nowMs + 120_001);
  await prisma.clanSiegeClanDamage.create({
    data: {
      siegeId: timeoutSiege.id,
      clanId: tA.clanId,
      totalDamage: 100,
      firstHitAt: new Date(nowMs + 120_000),
      lastHitAt: new Date(nowMs + 120_000),
    },
  });
  const ownerBeforeTimeout = (
    await prisma.cityCastle.findUniqueOrThrow({ where: { cityId: CITY } })
  ).ownerClanId;
  const at = nowMs + 120_010;
  const [wallRes, timeoutRes] = await Promise.all([
    attackSiegeWallForUser(tA.userId, CITY, 'timeout-wall', tA.characterId, at),
    prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        timeoutSiege.id,
        CLAN_SIEGE_FINISH_REASON.timeExpired,
        at
      )
    ),
  ]);
  assert.ok(wallRes.ok);
  assert.ok(timeoutRes);
  const afterTimeout = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: timeoutSiege.id },
  });
  assert.equal(afterTimeout.state, 'finished');
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: timeoutSiege.id } }),
    0
  );
  assert.equal(
    (
      await prisma.cityCastle.findUniqueOrThrow({ where: { cityId: CITY } })
    ).ownerClanId,
    ownerBeforeTimeout
  );
  ok('wall attack concurrent with timeout finalizer');

  const noElig = await createClanAccount('ne');
  users.push(noElig.userId);
  const noEligSiege = await seedActiveSiege(nowMs + 130_000, { wallHp: 50 });
  await registerParticipant(noEligSiege.id, noElig, nowMs + 130_001);
  await prisma.clanSiegeParticipant.update({
    where: {
      siegeId_characterId: {
        siegeId: noEligSiege.id,
        characterId: noElig.characterId,
      },
    },
    data: { eliminatedAt: new Date(nowMs + 130_002) },
  });
  await prisma.clanSiegeClanDamage.create({
    data: {
      siegeId: noEligSiege.id,
      clanId: noElig.clanId,
      totalDamage: 100_000,
      firstHitAt: new Date(nowMs + 130_000),
      lastHitAt: new Date(nowMs + 130_000),
    },
  });
  await prisma.clanSiege.update({
    where: { id: noEligSiege.id },
    data: { wallHp: 0 },
  });
  const [f1, f2] = await Promise.all([
    prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        noEligSiege.id,
        CLAN_SIEGE_FINISH_REASON.wallDestroyed,
        nowMs + 130_010
      )
    ),
    prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        noEligSiege.id,
        CLAN_SIEGE_FINISH_REASON.wallDestroyed,
        nowMs + 130_010
      )
    ),
  ]);
  assert.ok(f1 && f2);
  assert.equal(f1!.finishReason, CLAN_SIEGE_FINISH_REASON.wallDestroyedNoEligibleAttacker);
  assert.equal(f2!.finishReason, CLAN_SIEGE_FINISH_REASON.wallDestroyedNoEligibleAttacker);
  assert.equal(f1!.winnerClanId, null);
  assert.equal(f2!.winnerClanId, null);
  assert.equal(f1!.finishedAt!.getTime(), f2!.finishedAt!.getTime());
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: noEligSiege.id } }),
    0
  );
  ok('parallel wall_destroyed_no_eligible_attacker');

  const doneSiege = await seedActiveSiege(nowMs + 140_000, { wallHp: 0 });
  await prisma.clanSiege.update({
    where: { id: doneSiege.id },
    data: {
      state: 'finished',
      finishedAt: new Date(nowMs + 140_001),
      finishReason: CLAN_SIEGE_FINISH_REASON.wallDestroyedNoEligibleAttacker,
      winnerClanId: null,
    },
  });
  const [done1, done2] = await Promise.all([
    prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        doneSiege.id,
        CLAN_SIEGE_FINISH_REASON.wallDestroyed,
        nowMs + 140_010
      )
    ),
    prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        doneSiege.id,
        CLAN_SIEGE_FINISH_REASON.wallDestroyed,
        nowMs + 140_010
      )
    ),
  ]);
  assert.ok(done1 && done2);
  assert.equal(done1!.id, done2!.id);
  assert.equal(done1!.finishedAt!.getTime(), done2!.finishedAt!.getTime());
  ok('siege already finished before second request');

  const expireWall = await seedActiveSiege(nowMs + 150_000, {
    wallHp: 9000,
    endsAtMs: nowMs + 150_001,
  });
  const ownerBeforeExpire = (
    await prisma.cityCastle.findUniqueOrThrow({ where: { cityId: CITY } })
  ).ownerClanId;
  const [e1, e2] = await Promise.all([
    prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        expireWall.id,
        CLAN_SIEGE_FINISH_REASON.timeExpired,
        nowMs + 150_010
      )
    ),
    prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        expireWall.id,
        CLAN_SIEGE_FINISH_REASON.timeExpired,
        nowMs + 150_010
      )
    ),
  ]);
  assert.ok(e1 && e2);
  assert.equal(e1!.finishReason, CLAN_SIEGE_FINISH_REASON.timeExpired);
  assert.equal(e2!.finishReason, CLAN_SIEGE_FINISH_REASON.timeExpired);
  assert.ok(e1!.wallHp > 0);
  assert.equal(
    (
      await prisma.cityCastle.findUniqueOrThrow({ where: { cityId: CITY } })
    ).ownerClanId,
    ownerBeforeExpire
  );
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: expireWall.id } }),
    0
  );
  ok('parallel time_expired with live wall');

  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });

  console.log(`\n${passed} passed`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
