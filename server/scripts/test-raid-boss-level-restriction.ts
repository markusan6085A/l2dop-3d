/**
 * Raid Boss level restriction (overlevel block).
 * npm run test:raid-boss-level-restriction
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
import {
  MAX_RAID_BOSS_OVERLEVEL,
  canCharacterAttackRaidBoss,
  minRaidBossLevelForCharacter,
  getRaidBossLevelRestrictionMessageUk,
} from '../src/domain/raidBossLevelRestriction.js';
import { L2DOP_LEVEL_MIN_EXP, levelFromTotalExp } from '../src/data/l2dopExpgain.js';
import { getWorldSpawnById } from '../src/data/mapWorldSpawns.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { creditClanTaskRaidBossKillInTx } from '../src/services/clanTask/clanTaskProgressService.js';
import { takeClanTaskForUser } from '../src/services/clanTask/clanTaskService.js';
import { serializeBattleJsonForDb } from '../src/services/battleServiceBattleBuffs.js';

const RB_LV20 = 'l2dop_rb_25372';
const RB_LV21 = 'l2dop_rb_25373';
const RB_LV42 = 'l2dop_rb_25007';
const RB_LV43 = 'l2dop_rb_25088';
const RB_LV80 = 'l2dop_rb_25283';

const runSuffix = `${Date.now()}_${process.pid}_${randomUUID()}`;
const created = { userIds: [] as string[] };

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

function expForLevel(level: number): bigint {
  return L2DOP_LEVEL_MIN_EXP[Math.max(1, Math.min(80, level)) - 1]!;
}

let userSeq = 0;

async function createUserNearSpawn(
  level: number,
  spawnId: string
): Promise<{ userId: string; characterId: string }> {
  const spawn = getWorldSpawnById(spawnId);
  assert.ok(spawn, `spawn ${spawnId}`);
  userSeq += 1;
  const tag = randomUUID().replace(/-/g, '').slice(0, 10);
  const user = await prisma.user.create({
    data: {
      login: `rblr${tag}${userSeq}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `R${tag}${userSeq}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level,
          exp: expForLevel(level),
          cityId: 'l2dop_oren',
          worldX: spawn.worldX,
          worldY: spawn.worldY,
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function cleanup(): Promise<void> {
  if (created.userIds.length) {
    await prisma.user.deleteMany({
      where: { id: { in: [...new Set(created.userIds)] } },
    });
  }
}

function testPureHelperRules(): void {
  console.log('\n[pure] canCharacterAttackRaidBoss');
  assert.equal(MAX_RAID_BOSS_OVERLEVEL, 9);
  assert.equal(canCharacterAttackRaidBoss(29, 20), true);
  assert.equal(canCharacterAttackRaidBoss(29, 19), false);
  assert.equal(canCharacterAttackRaidBoss(30, 21), true);
  assert.equal(canCharacterAttackRaidBoss(30, 20), false);
  assert.equal(canCharacterAttackRaidBoss(52, 43), true);
  assert.equal(canCharacterAttackRaidBoss(52, 42), false);
  assert.equal(canCharacterAttackRaidBoss(29, 80), true);
  assert.equal(canCharacterAttackRaidBoss(80, 71), true);
  assert.equal(canCharacterAttackRaidBoss(80, 70), false);
  ok('canonical level pairs');

  assert.equal(minRaidBossLevelForCharacter(29), 20);
  assert.equal(minRaidBossLevelForCharacter(30), 21);
  assert.match(
    getRaidBossLevelRestrictionMessageUk(29),
    /не нижче 20 рівня/
  );
  ok('min level + message');

  assert.equal(canCharacterAttackRaidBoss(58, 52), true);
  assert.equal(canCharacterAttackRaidBoss(61, 52), true);
  assert.equal(canCharacterAttackRaidBoss(62, 52), false);
  ok('party member level diff 9 vs 10');
}

async function testBlockedStartNoMutation(): Promise<void> {
  console.log('\n[db] blocked start preserves revision/hp/mp');
  const u = await createUserNearSpawn(30, RB_LV20);
  const before = await prisma.character.findUniqueOrThrow({
    where: { id: u.characterId },
    select: { revision: true, hp: true, battleJson: true, worldCombatStateJson: true },
  });
  await assert.rejects(
    () =>
      prisma.$transaction((tx) =>
        startBattleInTx(tx, u.userId, RB_LV20, before.revision, {
          characterId: u.characterId,
        })
      ),
    (err: unknown) =>
      err instanceof Error && err.message === 'raid_boss_level_too_high'
  );
  const after = await prisma.character.findUniqueOrThrow({
    where: { id: u.characterId },
    select: { revision: true, hp: true, battleJson: true, worldCombatStateJson: true },
  });
  assert.equal(after.revision, before.revision);
  assert.equal(after.hp, before.hp);
  assert.equal(after.battleJson, before.battleJson);
  assert.equal(after.worldCombatStateJson, before.worldCombatStateJson);
  ok('blocked start: no revision/hp/battle/worldCombat change');
}

async function testAllowedStarts(): Promise<void> {
  console.log('\n[db] allowed raid boss starts');
  const u29 = await createUserNearSpawn(29, RB_LV20);
  const c29 = await prisma.character.findUniqueOrThrow({
    where: { id: u29.characterId },
  });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, u29.userId, RB_LV20, c29.revision, {
      characterId: u29.characterId,
    })
  );
  ok('char 29 vs RB 20 allowed');

  const u30 = await createUserNearSpawn(30, RB_LV21);
  const c30 = await prisma.character.findUniqueOrThrow({
    where: { id: u30.characterId },
  });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, u30.userId, RB_LV21, c30.revision, {
      characterId: u30.characterId,
    })
  );
  ok('char 30 vs RB 21 allowed');

  const u52ok = await createUserNearSpawn(52, RB_LV43);
  const c52ok = await prisma.character.findUniqueOrThrow({
    where: { id: u52ok.characterId },
  });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, u52ok.userId, RB_LV43, c52ok.revision, {
      characterId: u52ok.characterId,
    })
  );
  ok('char 52 vs RB 43 allowed');

  const u29hi = await createUserNearSpawn(29, RB_LV80);
  const c29hi = await prisma.character.findUniqueOrThrow({
    where: { id: u29hi.characterId },
  });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, u29hi.userId, RB_LV80, c29hi.revision, {
      characterId: u29hi.characterId,
    })
  );
  ok('char 29 vs RB 80 allowed (higher boss)');
}

async function testBlockedStarts(): Promise<void> {
  console.log('\n[db] blocked raid boss starts');
  const u30 = await createUserNearSpawn(30, RB_LV20);
  const c30 = await prisma.character.findUniqueOrThrow({
    where: { id: u30.characterId },
  });
  await assert.rejects(
    () =>
      prisma.$transaction((tx) =>
        startBattleInTx(tx, u30.userId, RB_LV20, c30.revision, {
          characterId: u30.characterId,
        })
      ),
    /raid_boss_level_too_high/
  );
  ok('char 30 vs RB 20 blocked');

  const u52 = await createUserNearSpawn(52, RB_LV42);
  const c52 = await prisma.character.findUniqueOrThrow({
    where: { id: u52.characterId },
  });
  await assert.rejects(
    () =>
      prisma.$transaction((tx) =>
        startBattleInTx(tx, u52.userId, RB_LV42, c52.revision, {
          characterId: u52.characterId,
        })
      ),
    /raid_boss_level_too_high/
  );
  ok('char 52 vs RB 42 blocked');
}

async function testRejoinSkipsLevelCheck(): Promise<void> {
  console.log('\n[db] rejoin same raid skips level check');
  const u = await createUserNearSpawn(30, RB_LV20);
  const battleJson = serializeBattleJsonForDb({
    spawnId: RB_LV20,
    mobHp: 1000,
    mobMaxHp: 1000,
    mobCp: 0,
    mobMaxCp: 0,
    mobPAtk: 1,
    mobPDef: 1,
    mobMAtk: 1,
    mobMDef: 1,
    mobEvasion: 0,
    log: ['test'],
    battleVersion: 1,
    lastLogSeq: 1,
    playerMp: 100,
    lastRegenTickMs: Date.now(),
    lastPlayerAttackAtMs: Date.now(),
    mobHitsUntilRetaliation: 1,
  });
  const row = await prisma.character.update({
    where: { id: u.characterId },
    data: { battleJson, revision: { increment: 1 } },
  });
  assert.equal(levelFromTotalExp(row.exp), 30);
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, u.userId, RB_LV20, row.revision, {
      characterId: u.characterId,
    })
  );
  ok('rejoin same RB spawn allowed despite overlevel');
}

async function testClanTaskSameRule(): Promise<void> {
  console.log('\n[db] clan task kill_raid_boss uses same rule');
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const user = await prisma.user.create({
    data: {
      login: `rblrcl_${suffix}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `CL${suffix}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 70,
          exp: expForLevel(70),
          cityId: 'l2dop_oren',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  const char = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `RBCL${suffix}`.slice(0, 16),
      leaderId: char.id,
      diamonds: 0,
      emblemId: 1,
    },
  });
  await prisma.character.update({
    where: { id: char.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  await takeClanTaskForUser(user.id, 'kill_raid_boss');

  await prisma.$transaction(async (tx) => {
    const badLow = await creditClanTaskRaidBossKillInTx(
      tx,
      char.id,
      'rb_test_low',
      70,
      70 - MAX_RAID_BOSS_OVERLEVEL - 1
    );
    assert.equal(badLow, false);

    const okNear = await creditClanTaskRaidBossKillInTx(
      tx,
      char.id,
      'rb_test_near',
      70,
      70 - MAX_RAID_BOSS_OVERLEVEL
    );
    assert.equal(okNear, true);
  });

  const user2 = await prisma.user.create({
    data: {
      login: `rblrcl2_${suffix}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `C2${suffix}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 29,
          exp: expForLevel(29),
          cityId: 'l2dop_oren',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user2.id);
  const char2 = user2.characters[0]!;
  const clan2 = await prisma.clan.create({
    data: {
      name: `RC2${suffix}`.slice(0, 16),
      leaderId: char2.id,
      diamonds: 0,
      emblemId: 1,
    },
  });
  await prisma.character.update({
    where: { id: char2.id },
    data: { clanId: clan2.id, clanRole: 'leader' },
  });
  await takeClanTaskForUser(user2.id, 'kill_raid_boss');
  await prisma.$transaction(async (tx) => {
    const okHigherBoss = await creditClanTaskRaidBossKillInTx(
      tx,
      char2.id,
      'rb_test_high',
      29,
      80
    );
    assert.equal(okHigherBoss, true);
  });
  ok('clan RB task: same MAX 9 overlevel rule + higher boss OK');
}

async function main(): Promise<void> {
  console.log('raid-boss-level-restriction smoke\n');
  testPureHelperRules();
  await testBlockedStartNoMutation();
  await testAllowedStarts();
  await testBlockedStarts();
  await testRejoinSkipsLevelCheck();
  await testClanTaskSameRule();
  console.log('\nAll raid boss level restriction checks passed.');
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
