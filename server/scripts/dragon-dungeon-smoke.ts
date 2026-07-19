/**
 * Clan dragon dungeon smoke.
 * npm run test:dragon-dungeon
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
  DRAGON_DUNGEON_BOSS_ORDER,
  DRAGON_DUNGEON_BOSSES,
  parseDragonBossId,
} from '../src/domain/dragonDungeon.js';
import { prisma } from '../src/lib/prisma.js';
import {
  getDragonDungeonForUser,
  unlockDragonForUser,
} from '../src/services/dragonDungeonService.js';

const runSuffix = `${Date.now()}_${process.pid}_${randomUUID()}`;
let passed = 0;
let entityCounter = 0;
const created = { userIds: [] as string[], clanIds: [] as string[] };

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

async function createLeaderClan(diamonds: number) {
  entityCounter += 1;
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const user = await prisma.user.create({
    data: {
      login: `drgc_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `DG${suffix}${entityCounter}`.slice(0, 16),
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
      name: `KD${suffix}${entityCounter}`.slice(0, 16),
      leaderId: c.id,
      diamonds,
      emblemId: 3,
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
      login: `drgm_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `DM${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 25,
          exp: BigInt(800_000),
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

async function createSoloUser() {
  entityCounter += 1;
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const user = await prisma.user.create({
    data: {
      login: `drgs_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `DS${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 20,
          cityId: 'l2dop_oren',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function cleanup(): Promise<void> {
  if (created.clanIds.length) {
    await prisma.clan.deleteMany({ where: { id: { in: [...new Set(created.clanIds)] } } });
  }
  if (created.userIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: [...new Set(created.userIds)] } } });
  }
}

async function main(): Promise<void> {
  console.log('dragon-dungeon smoke (clan)\n');

  assert.equal(await prisma.clan.count({ where: { name: '__never__' } }), 0);
  ok('Clan.diamonds default 0');

  assert.deepEqual(DRAGON_DUNGEON_BOSS_ORDER, ['green', 'blue', 'red']);
  assert.equal(DRAGON_DUNGEON_BOSSES.green.maxHp, 150_000);
  assert.equal(DRAGON_DUNGEON_BOSSES.blue.unlockCostDiamonds, 75);
  assert.equal(DRAGON_DUNGEON_BOSSES.red.reward.clanReputation, 150);
  ok('config HP/costs/rewards');

  assert.equal(parseDragonBossId('purple'), null);
  await assert.rejects(
    () => unlockDragonForUser('missing-user', 'green'),
    (e: unknown) => e instanceof Error && e.message === 'character_not_found'
  );
  ok('unknown dragon + missing character');

  const solo = await createSoloUser();
  const soloView = await getDragonDungeonForUser(solo.userId);
  assert.ok(soloView?.noClanMessageUk);
  assert.equal(soloView!.clan, null);
  await assert.rejects(
    () => unlockDragonForUser(solo.userId, 'green'),
    (e: unknown) => e instanceof Error && e.message === 'clan_required'
  );
  ok('no clan — unlock forbidden');

  const poorLeader = await createLeaderClan(10);
  const member = await createMember(poorLeader.clanId);
  await assert.rejects(
    () => unlockDragonForUser(member.userId, 'green'),
    (e: unknown) => e instanceof Error && e.message === 'clan_leader_required'
  );
  ok('member cannot unlock');

  await assert.rejects(
    () => unlockDragonForUser(poorLeader.userId, 'green'),
    (e: unknown) => e instanceof Error && e.message === 'clan_diamonds_insufficient'
  );
  const poorClan = await prisma.clan.findUnique({ where: { id: poorLeader.clanId } });
  assert.equal(poorClan!.diamonds, 10);
  ok('insufficient clan diamonds — no debit');

  const rich = await createLeaderClan(230);
  await unlockDragonForUser(rich.userId, 'green');
  const richClan = await prisma.clan.findUnique({ where: { id: rich.clanId } });
  assert.equal(richClan!.diamonds, 195);
  const active = await prisma.clanDragonDungeon.findFirst({ where: { clanId: rich.clanId } });
  assert.ok(active);
  assert.equal(active!.currentHp, BigInt(150_000));
  ok('leader opens green for 35');

  await assert.rejects(
    () => unlockDragonForUser(rich.userId, 'blue'),
    (e: unknown) => e instanceof Error && e.message === 'dragon_already_active'
  );
  ok('one active dragon per clan');

  const other = await createLeaderClan(75);
  await unlockDragonForUser(other.userId, 'blue');
  const otherActive = await prisma.clanDragonDungeon.count({ where: { clanId: other.clanId } });
  assert.equal(otherActive, 1);
  ok('other clan can have own active dragon');

  const richMember = await createMember(rich.clanId);
  const memberView = await getDragonDungeonForUser(richMember.userId);
  assert.ok(memberView?.activeDungeon);
  assert.equal(memberView!.clan!.diamonds, 195);
  ok('GET shows clan diamonds + active dungeon for member');

  await prisma.clanDragonDungeon.deleteMany({ where: { clanId: rich.clanId } });
  await prisma.clan.update({ where: { id: rich.clanId }, data: { diamonds: 120 } });
  await unlockDragonForUser(rich.userId, 'red');
  const redClan = await prisma.clan.findUnique({ where: { id: rich.clanId } });
  assert.equal(redClan!.diamonds, 0);
  ok('red unlock costs 120');

  const race = await createLeaderClan(35);
  const results = await Promise.allSettled([
    unlockDragonForUser(race.userId, 'green'),
    unlockDragonForUser(race.userId, 'green'),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  const raceClan = await prisma.clan.findUnique({ where: { id: race.clanId } });
  assert.equal(raceClan!.diamonds, 0);
  ok('concurrent unlock debits once');

  console.log(`\n${passed} checks passed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanup();
    } catch (cleanupErr) {
      console.error('cleanup failed:', cleanupErr);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    if (process.exitCode) process.exit(process.exitCode);
  });
