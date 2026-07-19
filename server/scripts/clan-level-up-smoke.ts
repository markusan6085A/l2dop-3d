/**
 * Clan level progression smoke (0 → 8, atomic level-up).
 * npm run test:clan-level-up
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import {
  CLAN_LEVEL_TOTAL_COST_TO_MAX,
  CLAN_MAX_LEVEL,
  CLAN_START_LEVEL,
  buildClanLevelProgression,
  clanLevelUpCost,
  clanLevelUpCostForTarget,
} from '../src/domain/clanLevel.js';
import { prisma } from '../src/lib/prisma.js';
import { fetchClanHallPassiveBonusByClanId } from '../src/services/clanHallService.js';
import {
  getClanLevelProgressForUser,
  levelUpClanForUser,
} from '../src/services/clanLevelService.js';
import { getClanMyForUser } from '../src/services/clanMyService.js';

const runSuffix = `${Date.now()}_${process.pid}_${randomUUID()}`;
let entityCounter = 0;
let passed = 0;

const created = {
  userIds: [] as string[],
  clanIds: [] as string[],
};

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function nextLabel(label: string): string {
  entityCounter += 1;
  return `${label}${entityCounter}`;
}

async function createLeaderClan(
  label: string,
  opts?: { clanPoints?: number; level?: number; emblemId?: number | null }
) {
  const tag = nextLabel(label);
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-10);
  const user = await prisma.user.create({
    data: {
      login: `clvl_${tag}_${runSuffix}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `CL${tag}${suffix}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId: 'l2dop_oren',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `K${tag}${suffix}`.slice(0, 16),
      leaderId: c.id,
      level: opts?.level ?? CLAN_START_LEVEL,
      clanPoints: opts?.clanPoints ?? 0,
      emblemId: opts?.emblemId ?? 7,
    },
  });
  created.clanIds.push(clan.id);
  await prisma.character.update({
    where: { id: c.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return { userId: user.id, characterId: c.id, clanId: clan.id };
}

async function createMember(clanId: string) {
  entityCounter += 1;
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const user = await prisma.user.create({
    data: {
      login: `clvm_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `CM${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 20,
          exp: BigInt(500_000),
          cityId: 'l2dop_oren',
          clanId,
          clanRole: 'member',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function cleanupTestData(): Promise<void> {
  if (created.clanIds.length) {
    await prisma.clan.deleteMany({
      where: { id: { in: [...new Set(created.clanIds)] } },
    });
  }
  if (created.userIds.length) {
    await prisma.user.deleteMany({
      where: { id: { in: [...new Set(created.userIds)] } },
    });
  }
}

async function main(): Promise<void> {
  console.log('clan-level-up smoke\n');

  const leader = await createLeaderClan('NEW');
  const freshClan = await prisma.clan.findUnique({ where: { id: leader.clanId } });
  assert.equal(freshClan!.level, 0);
  ok('new clan starts at level 0');

  const myView = await getClanMyForUser(leader.userId);
  assert.ok(myView);
  assert.equal(myView!.level, 0);
  ok('Clan DTO returns level 0');

  assert.equal(myView!.level ?? -1, 0);
  ok('serializer keeps level 0');

  const steps: Array<[number, number, number]> = [
    [0, 1, 6000],
    [1, 2, 16000],
    [2, 3, 32000],
    [3, 4, 56000],
    [4, 5, 90000],
    [5, 6, 140000],
    [6, 7, 200000],
    [7, 8, 300000],
  ];
  for (const [from, to, cost] of steps) {
    assert.equal(clanLevelUpCost(from), cost);
    assert.equal(clanLevelUpCostForTarget(to), cost);
  }
  ok('level-up costs match config for all 8 steps');

  const progression = buildClanLevelProgression();
  assert.equal(progression.length, 8);
  assert.equal(progression.at(-1)!.cumulativeCost, 840000);
  assert.equal(CLAN_LEVEL_TOTAL_COST_TO_MAX, 840000);
  ok('GET progression cumulative total is 840000');

  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { clanPoints: 5000, level: 0 },
  });
  await assert.rejects(
    () => levelUpClanForUser(leader.userId, 0),
    (err: unknown) =>
      err instanceof Error && err.message === 'clan_points_insufficient'
  );
  ok('insufficient points blocks level-up');

  const memberAcc = await createMember(leader.clanId);
  await assert.rejects(
    () => levelUpClanForUser(memberAcc.userId, 0),
    (err: unknown) =>
      err instanceof Error && err.message === 'clan_leader_required'
  );
  ok('member cannot level up');

  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { clanPoints: 8000, level: 0, emblemId: 12 },
  });
  const viewBefore = await getClanLevelProgressForUser(leader.userId);
  assert.ok(viewBefore?.nextUpgrade?.canUpgrade);
  const upgraded = await levelUpClanForUser(leader.userId, 0);
  assert.equal(upgraded.clan.level, 1);
  assert.equal(upgraded.clan.clanPoints, 2000);
  assert.equal(upgraded.clan.emblemId, 12);
  assert.equal(upgraded.clan.name, freshClan!.name);
  ok('leader level-up deducts 6000 and preserves emblem/name');

  const afterRow = await prisma.clan.findUnique({ where: { id: leader.clanId } });
  assert.equal(afterRow!.level, 1);
  assert.equal(afterRow!.clanPoints, 2000);
  assert.ok(afterRow!.clanPoints >= 0);
  ok('level increases by one and points stay non-negative');

  const siegeLeader = await createLeaderClan('SIEGE', { clanPoints: 8000, level: 0 });
  const siegeUp = await levelUpClanForUser(siegeLeader.userId, 0);
  assert.equal(siegeUp.clan.level, 1);
  assert.equal(siegeUp.clan.clanPoints, 2000);
  ok('siege-earned clanPoints can fund level-up');

  await prisma.clan.update({
    where: { id: leader.clanId },
    data: {
      level: CLAN_MAX_LEVEL,
      clanPoints: 999_999,
      hallBlessingAt: new Date(),
    },
  });
  await assert.rejects(
    () => levelUpClanForUser(leader.userId, CLAN_MAX_LEVEL),
    (err: unknown) => err instanceof Error && err.message === 'clan_max_level'
  );
  ok('max level 8 cannot level up again');

  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { level: 0, clanPoints: 0, hallBlessingAt: new Date() },
  });
  const bonus0 = await fetchClanHallPassiveBonusByClanId(leader.clanId);
  assert.equal(bonus0, null);
  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { level: 1 },
  });
  const bonus1 = await fetchClanHallPassiveBonusByClanId(leader.clanId);
  assert.ok(bonus1);
  assert.equal(bonus1!.pAtk, 75);
  ok('level 0 has no hall bonus; level 1 does');

  const raceLeader = await createLeaderClan('RACE', {
    clanPoints: 12000,
    level: 0,
  });
  const results = await Promise.allSettled([
    levelUpClanForUser(raceLeader.userId, 0),
    levelUpClanForUser(raceLeader.userId, 0),
  ]);
  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  const raceClan = await prisma.clan.findUnique({ where: { id: raceLeader.clanId } });
  assert.equal(raceClan!.level, 1);
  assert.equal(raceClan!.clanPoints, 6000);
  ok('concurrent level-up applies once (points and level)');

  console.log(`\n${passed} checks passed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanupTestData();
    } catch (cleanupErr) {
      console.error('clan-level-up cleanup failed:', cleanupErr);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    if (process.exitCode) process.exit(process.exitCode);
  });
