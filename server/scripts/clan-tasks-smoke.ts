/**
 * Clan tasks core smoke.
 * npm run test:clan-tasks
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
  CLAN_TASK_DEFINITIONS,
  CLAN_TASK_ORDER,
} from '../src/domain/clanTasks.js';
import { prisma } from '../src/lib/prisma.js';
import {
  takeClanTaskForUser,
  helpClanTaskForUser,
  claimClanTaskForUser,
  cancelClanTaskForUser,
  getClanTasksForUser,
} from '../src/services/clanTask/clanTaskService.js';
import { addClanTaskProgressForCharacter } from '../src/services/clanTask/clanTaskProgressService.js';
import { handleClanTaskParticipantClanLeaveInTx } from '../src/services/clanTask/clanTaskLeaveHooks.js';

const runSuffix = `${Date.now()}_${process.pid}_${randomUUID()}`;
let passed = 0;
let entityCounter = 0;
const created = { userIds: [] as string[], clanIds: [] as string[] };

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

async function createClanPair() {
  entityCounter += 1;
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const leaderUser = await prisma.user.create({
    data: {
      login: `ctL_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `CL${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 40,
          exp: BigInt(2_000_000),
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
      name: `CT${suffix}${entityCounter}`.slice(0, 16),
      leaderId: leader.id,
      diamonds: 0,
      emblemId: 2,
    },
  });
  created.clanIds.push(clan.id);
  await prisma.character.update({
    where: { id: leader.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });

  entityCounter += 1;
  const memberUser = await prisma.user.create({
    data: {
      login: `ctM_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `CM${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 35,
          exp: BigInt(1_000_000),
          cityId: 'l2dop_oren',
          clanId: clan.id,
          clanRole: 'member',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(memberUser.id);
  return {
    clanId: clan.id,
    leaderUserId: leaderUser.id,
    leaderId: leader.id,
    memberUserId: memberUser.id,
    memberId: memberUser.characters[0]!.id,
  };
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
  console.log('clan-tasks smoke\n');

  assert.equal(CLAN_TASK_ORDER.length, 5);
  assert.equal(CLAN_TASK_DEFINITIONS.earn_adena.target, 150_000);
  assert.equal(CLAN_TASK_DEFINITIONS.earn_adena.clanRewardDiamonds, 3);
  assert.equal(CLAN_TASK_DEFINITIONS.kill_monsters.personalReward.coinOfLuck, 1);
  assert.equal(CLAN_TASK_DEFINITIONS.kill_monsters.clanRewardDiamonds, 4);
  assert.equal(CLAN_TASK_DEFINITIONS.earn_sp_from_monsters.clanRewardDiamonds, 5);
  assert.equal(CLAN_TASK_DEFINITIONS.kill_raid_boss.clanRewardDiamonds, 7);
  assert.equal(CLAN_TASK_DEFINITIONS.damage_siege_wall.clanRewardDiamonds, 10);
  assert.equal(
    CLAN_TASK_DEFINITIONS.earn_adena.clanRewardDiamonds +
      CLAN_TASK_DEFINITIONS.kill_monsters.clanRewardDiamonds +
      CLAN_TASK_DEFINITIONS.earn_sp_from_monsters.clanRewardDiamonds +
      CLAN_TASK_DEFINITIONS.kill_raid_boss.clanRewardDiamonds +
      CLAN_TASK_DEFINITIONS.damage_siege_wall.clanRewardDiamonds,
    29
  );
  ok('config targets and diamond rewards');

  const soloUser = await prisma.user.create({
    data: {
      login: `ctS_${runSuffix}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `CS${runSuffix}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 20,
          cityId: 'l2dop_oren',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(soloUser.id);
  await assert.rejects(
    () => takeClanTaskForUser(soloUser.id, 'earn_adena'),
    (e: unknown) => e instanceof Error && e.message === 'clan_required'
  );
  ok('no clan cannot take');

  const pair = await createClanPair();
  const view1 = await takeClanTaskForUser(pair.leaderUserId, 'kill_monsters');
  assert.equal(view1.me?.role, 'OWNER');
  assert.equal(view1.activeClanTasks.length, 1);
  ok('owner can take task');

  const lock = await prisma.clanTaskParticipantLock.findUnique({
    where: { characterId: pair.leaderId },
  });
  assert.ok(lock);
  assert.equal(lock.role, 'OWNER');
  ok('owner participant lock created');

  await assert.rejects(
    () => takeClanTaskForUser(pair.leaderUserId, 'earn_adena'),
    (e: unknown) =>
      e instanceof Error && e.message === 'clan_task_participant_busy'
  );
  ok('one character cannot take two tasks');

  const taskId = view1.activeClanTasks[0]!.id;
  await assert.rejects(
    () => helpClanTaskForUser(pair.leaderUserId, taskId),
    (e: unknown) =>
      e instanceof Error && e.message === 'clan_task_cannot_help_self'
  );
  ok('owner cannot help self');

  const view2 = await helpClanTaskForUser(pair.memberUserId, taskId);
  assert.equal(view2.activeClanTasks[0]?.helper?.id, pair.memberId);
  ok('member can help');

  entityCounter += 1;
  const suffix2 = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const thirdUser = await prisma.user.create({
    data: {
      login: `ct3_${suffix2}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `C3${suffix2}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          cityId: 'l2dop_oren',
          clanId: pair.clanId,
          clanRole: 'member',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(thirdUser.id);

  await assert.rejects(
    () => helpClanTaskForUser(thirdUser.id, taskId),
    (e: unknown) =>
      e instanceof Error && e.message === 'clan_task_helper_exists'
  );
  ok('max one helper');

  await assert.rejects(
    () => takeClanTaskForUser(pair.memberUserId, 'earn_adena'),
    (e: unknown) =>
      e instanceof Error && e.message === 'clan_task_participant_busy'
  );
  ok('helper cannot take another task');

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < 300; i++) {
      await addClanTaskProgressForCharacter({
        tx,
        characterId: pair.leaderId,
        eventType: 'MONSTER_KILLS',
        amount: 1,
        eventKey: `test:kill:owner:${i}`,
      });
    }
    for (let i = 0; i < 200; i++) {
      await addClanTaskProgressForCharacter({
        tx,
        characterId: pair.memberId,
        eventType: 'MONSTER_KILLS',
        amount: 1,
        eventKey: `test:kill:helper:${i}`,
      });
    }
  });

  const mid = await prisma.clanTask.findUnique({ where: { id: taskId } });
  assert.ok(mid);
  assert.equal(Number(mid!.progress), 500);
  assert.equal(mid!.status, 'READY_TO_CLAIM');
  ok('progress sums to target');

  const dup = await prisma.$transaction(async (tx) =>
    addClanTaskProgressForCharacter({
      tx,
      characterId: pair.leaderId,
      eventType: 'MONSTER_KILLS',
      amount: 1,
      eventKey: 'test:kill:owner:0',
    })
  );
  assert.equal(dup, false);
  ok('duplicate eventKey no-op');

  await assert.rejects(
    () => claimClanTaskForUser(soloUser.id, taskId),
    (e: unknown) => e instanceof Error && e.message === 'clan_required'
  );

  const beforeClan = await prisma.clan.findUnique({
    where: { id: pair.clanId },
    select: { diamonds: true },
  });

  const claimed = await claimClanTaskForUser(pair.memberUserId, taskId);
  assert.equal(claimed.clan?.diamonds, (beforeClan?.diamonds ?? 0) + 4);
  ok('helper can claim; clan diamonds +4');

  const afterOwner = await prisma.character.findUnique({
    where: { id: pair.leaderId },
  });
  assert.ok(afterOwner);
  const locksAfter = await prisma.clanTaskParticipantLock.count({
    where: { taskId },
  });
  assert.equal(locksAfter, 0);
  ok('locks removed after claim');

  const invJson = JSON.stringify(afterOwner!.inventoryJson ?? {});
  assert.match(invJson, /4037|"itemId":4037/);
  ok('owner received Coin of Luck item 4037');

  const pair2 = await createClanPair();
  const vTake = await takeClanTaskForUser(pair2.leaderUserId, 'earn_adena');
  const t2 = vTake.activeClanTasks[0]!.id;
  await cancelClanTaskForUser(pair2.leaderUserId, t2);
  const cancelled = await prisma.clanTask.findUnique({ where: { id: t2 } });
  assert.equal(cancelled?.status, 'CANCELLED');
  assert.ok(cancelled?.cancelledAt);
  ok('owner can cancel');

  await assert.rejects(
    () => cancelClanTaskForUser(pair2.memberUserId, t2),
    (e: unknown) =>
      e instanceof Error && e.message === 'clan_task_cancel_forbidden'
  );
  ok('helper cannot cancel');

  const pair3 = await createClanPair();
  const v3 = await takeClanTaskForUser(pair3.leaderUserId, 'kill_monsters');
  const t3 = v3.activeClanTasks[0]!.id;
  await helpClanTaskForUser(pair3.memberUserId, t3);
  await prisma.$transaction(async (tx) => {
    await handleClanTaskParticipantClanLeaveInTx(tx, pair3.memberId);
  });
  const afterHelperLeave = await prisma.clanTask.findUnique({
    where: { id: t3 },
  });
  assert.equal(afterHelperLeave?.helperId, null);
  ok('helper leave clears helper slot');

  const pair4 = await createClanPair();
  const v4 = await takeClanTaskForUser(pair4.leaderUserId, 'earn_adena');
  const t4 = v4.activeClanTasks[0]!.id;
  await prisma.$transaction(async (tx) => {
    await handleClanTaskParticipantClanLeaveInTx(tx, pair4.leaderId);
  });
  const afterOwnerLeave = await prisma.clanTask.findUnique({
    where: { id: t4 },
  });
  assert.equal(afterOwnerLeave?.status, 'CANCELLED');
  ok('owner leave cancels task');

  const viewFinal = await getClanTasksForUser(pair.leaderUserId);
  assert.ok(viewFinal);
  ok('GET view works');

  console.log('\nclan-tasks smoke: ' + passed + ' passed');
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
