/**
 * Clan dragon dungeon battle smoke.
 * npm run test:dragon-dungeon-battle
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
import { unlockDragonForUser } from '../src/services/dragonDungeonService.js';
import {
  attackDragonForUser,
  enterDragonBattleForUser,
  leaveDragonBattleForUser,
  syncDragonBattleForUser,
} from '../src/services/dragonDungeonBattleService.js';
import { pickCancelableBuffSkillId } from '../src/domain/dragonDungeonBattle.js';

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
      login: `drgb_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `DB${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 40,
          exp: BigInt(2_000_000),
          hp: 5000,
          maxHp: 5000,
          cityId: 'l2dop_oren',
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: { name: `KB${suffix}${entityCounter}`.slice(0, 16), leaderId: c.id, diamonds },
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
      login: `drgbm_${suffix}_${entityCounter}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `BM${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 35,
          exp: BigInt(1_200_000),
          hp: 4000,
          maxHp: 4000,
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

async function cleanup(): Promise<void> {
  if (created.clanIds.length) {
    await prisma.clan.deleteMany({ where: { id: { in: [...new Set(created.clanIds)] } } });
  }
  if (created.userIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: [...new Set(created.userIds)] } } });
  }
}

async function main(): Promise<void> {
  console.log('dragon-dungeon-battle smoke\n');

  assert.equal(pickCancelableBuffSkillId(['1234'], 0), '1234');
  assert.equal(pickCancelableBuffSkillId(['clan_hall_passive'], 0), null);
  assert.equal(pickCancelableBuffSkillId(['warrior_mastery'], 0), null);
  ok('cancel buff rules');

  const leader = await createLeaderClan(35);
  await unlockDragonForUser(leader.userId, 'green');
  const dungeon = await prisma.clanDragonDungeon.findFirst({
    where: { clanId: leader.clanId },
  });
  assert.ok(dungeon);
  const dungeonId = dungeon!.id;

  const m1 = await createMember(leader.clanId);
  const m2 = await createMember(leader.clanId);
  const enter1 = await enterDragonBattleForUser(m1.userId, dungeonId);
  assert.ok(enter1.battleActive);
  ok('clan member can enter');

  const otherClan = await createLeaderClan(35);
  await unlockDragonForUser(otherClan.userId, 'green');
  const otherDungeon = await prisma.clanDragonDungeon.findFirst({
    where: { clanId: otherClan.clanId },
  });
  await assert.rejects(
    () => enterDragonBattleForUser(m1.userId, otherDungeon!.id),
    (e: unknown) => e instanceof Error && e.message === 'dragon_dungeon_forbidden'
  );
  ok('other clan cannot enter');

  const beforeHp = dungeon!.currentHp;
  let hit = await attackDragonForUser(m1.userId, dungeonId, 'attack');
  for (let i = 0; i < 8 && Number(hit.currentHp) >= Number(beforeHp); i++) {
    hit = await attackDragonForUser(m1.userId, dungeonId, 'attack');
  }
  assert.ok(Number(hit.currentHp) <= Number(beforeHp));
  ok('attack reduces shared HP');

  const c1 = await prisma.clanDragonContribution.findUnique({
    where: { dungeonId_characterId: { dungeonId, characterId: m1.characterId } },
  });
  assert.ok(c1 && c1.damageDealt > 0n);
  ok('contribution recorded');

  await enterDragonBattleForUser(m2.userId, dungeonId);
  await attackDragonForUser(m2.userId, dungeonId, 'attack');
  const c2 = await prisma.clanDragonContribution.findUnique({
    where: { dungeonId_characterId: { dungeonId, characterId: m2.characterId } },
  });
  assert.ok(c2 && c2.damageDealt > 0n);
  const dMid = await prisma.clanDragonDungeon.findUnique({ where: { id: dungeonId } });
  assert.ok(dMid!.currentHp < beforeHp);
  ok('two players separate contributions + shared HP');

  await leaveDragonBattleForUser(m1.userId, dungeonId);
  const afterLeave = await prisma.clanDragonContribution.findUnique({
    where: { dungeonId_characterId: { dungeonId, characterId: m1.characterId } },
  });
  assert.ok(afterLeave?.nextEntryAt);
  ok('leave sets cooldown');

  await assert.rejects(
    () => enterDragonBattleForUser(m1.userId, dungeonId),
    (e: unknown) => e instanceof Error && e.message === 'dragon_entry_cooldown'
  );
  ok('cooldown blocks re-entry');

  const sync = await syncDragonBattleForUser(m2.userId, dungeonId);
  assert.ok(sync.currentHp);
  ok('sync returns battle state');

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
