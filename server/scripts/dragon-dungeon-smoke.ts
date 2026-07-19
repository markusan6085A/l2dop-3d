/**
 * Dragon dungeon unlock smoke.
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
const created = { userIds: [] as string[] };

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

async function createUser(diamonds: number) {
  entityCounter += 1;
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const user = await prisma.user.create({
    data: {
      login: `drgd_${suffix}_${entityCounter}_${runSuffix}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `DD${suffix}${entityCounter}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 20,
          exp: BigInt(500_000),
          cityId: 'l2dop_oren',
          diamonds,
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  return {
    userId: user.id,
    characterId: user.characters[0]!.id,
  };
}

async function cleanup(): Promise<void> {
  if (created.userIds.length) {
    await prisma.user.deleteMany({
      where: { id: { in: [...new Set(created.userIds)] } },
    });
  }
}

async function main(): Promise<void> {
  console.log('dragon-dungeon smoke\n');

  assert.deepEqual(DRAGON_DUNGEON_BOSS_ORDER, ['green', 'blue', 'red']);
  assert.equal(DRAGON_DUNGEON_BOSSES.green.unlockCostDiamonds, 35);
  assert.equal(DRAGON_DUNGEON_BOSSES.blue.unlockCostDiamonds, 75);
  assert.equal(DRAGON_DUNGEON_BOSSES.red.unlockCostDiamonds, 120);
  assert.equal(DRAGON_DUNGEON_BOSSES.green.imageUrl, '/assets/Green_Dragon.jpg');
  assert.equal(DRAGON_DUNGEON_BOSSES.blue.imageUrl, '/assets/Blue_Dragon.jpg');
  assert.equal(DRAGON_DUNGEON_BOSSES.red.imageUrl, '/assets/Red_Dragon.jpg');
  ok('config costs and imageUrl');

  assert.equal(parseDragonBossId('purple'), null);
  await assert.rejects(
    () => unlockDragonForUser('missing-user', 'green'),
    (err: unknown) =>
      err instanceof Error && err.message === 'character_not_found'
  );
  ok('unknown dragonId and missing character rejected');

  const poor = await createUser(10);
  const poorView = await getDragonDungeonForUser(poor.userId);
  assert.ok(poorView);
  assert.equal(poorView!.bosses.length, 3);
  assert.equal(poorView!.bosses[0]!.id, 'green');
  assert.equal(poorView!.bosses[1]!.id, 'blue');
  assert.equal(poorView!.bosses[2]!.id, 'red');
  assert.equal(poorView!.bosses[0]!.canUnlock, false);
  assert.equal(poorView!.bosses[0]!.missingDiamonds, 25);
  ok('GET order + missingDiamonds/canUnlock');

  await assert.rejects(
    () => unlockDragonForUser(poor.userId, 'green'),
    (err: unknown) =>
      err instanceof Error && err.message === 'diamonds_insufficient'
  );
  const poorAfter = await prisma.character.findUnique({
    where: { id: poor.characterId },
    select: { diamonds: true },
  });
  assert.equal(poorAfter!.diamonds, 10);
  ok('insufficient diamonds — no debit');

  const rich = await createUser(230);
  const greenView = await unlockDragonForUser(rich.userId, 'green');
  assert.equal(greenView.diamonds, 195);
  assert.equal(greenView.bosses[0]!.unlocked, true);
  assert.equal(greenView.bosses[0]!.canUnlock, false);
  ok('green unlock costs 35');

  const blueView = await unlockDragonForUser(rich.userId, 'blue');
  assert.equal(blueView.diamonds, 120);
  assert.equal(blueView.bosses[1]!.unlocked, true);
  ok('blue unlock costs 75');

  const redView = await unlockDragonForUser(rich.userId, 'red');
  assert.equal(redView.diamonds, 0);
  assert.equal(redView.bosses[2]!.unlocked, true);
  ok('red unlock costs 120');

  await assert.rejects(
    () => unlockDragonForUser(rich.userId, 'green'),
    (err: unknown) =>
      err instanceof Error && err.message === 'dragon_already_unlocked'
  );
  const richRow = await prisma.character.findUnique({
    where: { id: rich.characterId },
    select: { diamonds: true },
  });
  assert.equal(richRow!.diamonds, 0);
  ok('repeat unlock does not debit');

  const race = await createUser(35);
  const results = await Promise.allSettled([
    unlockDragonForUser(race.userId, 'green'),
    unlockDragonForUser(race.userId, 'green'),
  ]);
  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  const raceRow = await prisma.character.findUnique({
    where: { id: race.characterId },
    select: { diamonds: true },
  });
  assert.equal(raceRow!.diamonds, 0);
  const unlockCount = await prisma.characterDragonDungeonUnlock.count({
    where: { characterId: race.characterId },
  });
  assert.equal(unlockCount, 1);
  ok('concurrent POST debits once');

  const other = await createUser(500);
  const otherGreen = await unlockDragonForUser(other.userId, 'green');
  assert.equal(otherGreen.diamonds, 465);
  assert.equal(otherGreen.bosses[0]!.unlocked, true);
  ok('each character unlocks independently');

  await prisma.character.delete({ where: { id: race.characterId } });
  const orphanUnlocks = await prisma.characterDragonDungeonUnlock.count({
    where: { characterId: race.characterId },
  });
  assert.equal(orphanUnlocks, 0);
  ok('cascade delete removes unlock rows');

  const mid = await createUser(50);
  const midView = await getDragonDungeonForUser(mid.userId);
  assert.equal(midView!.bosses[1]!.missingDiamonds, 25);
  assert.equal(midView!.bosses[1]!.canUnlock, false);
  assert.equal(midView!.bosses[0]!.canUnlock, true);
  ok('GET canUnlock/missingDiamonds for partial balance');

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
      console.error('dragon-dungeon cleanup failed:', cleanupErr);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    if (process.exitCode) process.exit(process.exitCode);
  });
