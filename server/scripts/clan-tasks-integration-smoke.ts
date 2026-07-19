/**
 * Clan tasks integration smoke (progress hooks).
 * npm run test:clan-tasks-integration
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';
import { takeClanTaskForUser } from '../src/services/clanTask/clanTaskService.js';
import {
  addClanTaskProgressForCharacter,
  creditClanTaskRaidBossKillInTx,
} from '../src/services/clanTask/clanTaskProgressService.js';
import { creditClanTaskSiegeWallDamageInTx } from '../src/services/clanTask/clanTaskBattleHooks.js';
import { CLAN_TASK_RAID_BOSS_LEVEL_TOLERANCE } from '../src/domain/clanTasks.js';

const runSuffix = `${Date.now()}_${process.pid}_${randomUUID()}`;
const created = { userIds: [] as string[], clanIds: [] as string[] };

async function createUserInClan(level: number) {
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const leaderUser = await prisma.user.create({
    data: {
      login: `ctiL_${suffix}_${level}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `IL${suffix}${level}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 50,
          exp: BigInt(3_000_000),
          cityId: 'l2dop_oren',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(leaderUser.id);
  const leader = leaderUser.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `CI${suffix}${level}`.slice(0, 16),
      leaderId: leader.id,
      diamonds: 0,
      emblemId: 1,
    },
  });
  created.clanIds.push(clan.id);
  await prisma.character.update({
    where: { id: leader.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return { userId: leaderUser.id, characterId: leader.id, clanId: clan.id };
}

async function cleanup(): Promise<void> {
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
  console.log('clan-tasks-integration smoke\n');
  let passed = 0;
  const ok = (n: string) => {
    passed += 1;
    console.log('  ✓ ' + n);
  };

  const u = await createUserInClan(40);
  await takeClanTaskForUser(u.userId, 'earn_adena');
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < 150; i++) {
      await addClanTaskProgressForCharacter({
        tx,
        characterId: u.characterId,
        eventType: 'ADENA_EARNED_FROM_PVE',
        amount: 1000,
        eventKey: `int:adena:${i}`,
      });
    }
    const wrong = await addClanTaskProgressForCharacter({
      tx,
      characterId: u.characterId,
      eventType: 'MONSTER_KILLS',
      amount: 1,
      eventKey: 'int:wrong-kill',
    });
    assert.equal(wrong, false);
  });
  const adenaTask = await prisma.clanTask.findFirst({
    where: { ownerId: u.characterId, taskType: 'earn_adena' },
  });
  assert.equal(Number(adenaTask!.progress), 150_000);
  assert.equal(adenaTask!.status, 'READY_TO_CLAIM');
  ok('150k PvE adena completes earn_adena; wrong event ignored');

  const u2 = await createUserInClan(41);
  await takeClanTaskForUser(u2.userId, 'earn_sp_from_monsters');
  await prisma.$transaction(async (tx) => {
    await addClanTaskProgressForCharacter({
      tx,
      characterId: u2.characterId,
      eventType: 'SP_EARNED_FROM_MONSTERS',
      amount: 100_000,
      eventKey: 'int:sp:batch',
    });
  });
  const spTask = await prisma.clanTask.findFirst({
    where: { ownerId: u2.characterId, taskType: 'earn_sp_from_monsters' },
  });
  assert.equal(Number(spTask!.progress), 100_000);
  ok('100k SP completes earn_sp');

  const u3 = await createUserInClan(70);
  await takeClanTaskForUser(u3.userId, 'kill_raid_boss');
  await prisma.$transaction(async (tx) => {
    const okRb = await creditClanTaskRaidBossKillInTx(
      tx,
      u3.characterId,
      'rb_spawn_test',
      70,
      75
    );
    assert.equal(okRb, true);
    const badLevel = await creditClanTaskRaidBossKillInTx(
      tx,
      u3.characterId,
      'rb_spawn_test2',
      70,
      70 - CLAN_TASK_RAID_BOSS_LEVEL_TOLERANCE - 1
    );
    assert.equal(badLevel, false);
  });
  const rbTask = await prisma.clanTask.findFirst({
    where: { ownerId: u3.characterId, taskType: 'kill_raid_boss' },
  });
  assert.equal(Number(rbTask!.progress), 1);
  ok('RB level tolerance; progress max 1');

  const u4 = await createUserInClan(42);
  await takeClanTaskForUser(u4.userId, 'damage_siege_wall');
  await prisma.$transaction(async (tx) => {
    await creditClanTaskSiegeWallDamageInTx(tx, {
      characterId: u4.characterId,
      siegeId: 'siege_test',
      actionId: 'act1',
      appliedDamage: 30_000,
    });
    await creditClanTaskSiegeWallDamageInTx(tx, {
      characterId: u4.characterId,
      siegeId: 'siege_test',
      actionId: 'act1',
      appliedDamage: 30_000,
    });
    await creditClanTaskSiegeWallDamageInTx(tx, {
      characterId: u4.characterId,
      siegeId: 'siege_test',
      actionId: 'act2',
      appliedDamage: 25_000,
    });
  });
  const wallTask = await prisma.clanTask.findFirst({
    where: { ownerId: u4.characterId, taskType: 'damage_siege_wall' },
  });
  assert.equal(Number(wallTask!.progress), 50_000);
  ok('siege wall damage idempotent + capped at target');

  console.log('\nclan-tasks-integration smoke: ' + passed + ' passed');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
