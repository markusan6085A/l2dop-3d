/**
 * Clan Hall blessing smoke (view, purchase guard, level 0).
 * npm run test:clan-hall
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
  buildClanHallView,
  clanHallBonusTable,
  clanHallBuffForLevel,
  resolveClanHallPassiveBonus,
} from '../src/domain/clanHall.js';
import { prisma } from '../src/lib/prisma.js';
import {
  getClanHallForUser,
  fetchClanHallPassiveBonusByClanId,
} from '../src/services/clanHallService.js';

const runSuffix = `${Date.now()}_${process.pid}_${randomUUID()}`;
let passed = 0;
const created = { userIds: [] as string[], clanIds: [] as string[] };

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

async function createLeader(label: string, clanOpts?: { level?: number; hallBlessingAt?: Date | null }) {
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-10);
  const user = await prisma.user.create({
    data: {
      login: `chall_${label}_${runSuffix}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `CH${label}${suffix}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId: 'l2dop_oren',
          adena: BigInt(10),
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `HK${label}${suffix}`.slice(0, 16),
      leaderId: c.id,
      level: clanOpts?.level ?? 0,
      hallBlessingAt: clanOpts?.hallBlessingAt ?? null,
    },
  });
  created.clanIds.push(clan.id);
  await prisma.character.update({
    where: { id: c.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return { userId: user.id, clanId: clan.id };
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
  console.log('clan-hall smoke\n');

  const view0 = buildClanHallView(false, true, 0);
  assert.equal(view0.clanLevel, 0);
  assert.equal(view0.activeBonus, null);
  ok('buildClanHallView level 0 has no activeBonus');

  const table = clanHallBonusTable();
  assert.equal(table.length, 8);
  assert.equal(table[0]!.pAtk, 75);
  assert.equal(table[7]!.pAtk, 600);
  assert.equal(table[7]!.maxHp, 2400);
  ok('bonus table 1–8 uses level × 75 / × 300');

  assert.equal(clanHallBuffForLevel(0).pAtk, 0);
  assert.equal(clanHallBuffForLevel(0).maxHp, 0);
  ok('clanHallBuffForLevel(0) returns zeros');

  assert.equal(resolveClanHallPassiveBonus({ hallBlessingAt: new Date(), level: 0 }), null);
  ok('level 0 + blessing resolves null bonus');

  const leader = await createLeader('V');
  const hall = await getClanHallForUser(leader.userId);
  assert.ok(hall);
  assert.equal(hall!.clanLevel, 0);
  assert.equal(hall!.activeBonus, null);
  assert.equal(hall!.canBuy, true);
  ok('GET hall for level-0 leader shows buy + no bonus');

  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { hallBlessingAt: new Date(), level: 2 },
  });
  const hall2 = await getClanHallForUser(leader.userId);
  assert.ok(hall2?.activeBonus);
  assert.equal(hall2!.activeBonus!.pAtk, 150);
  assert.equal(hall2!.activeBonus!.maxHp, 600);
  ok('GET hall level 2 shows activeBonus +150/+600');

  const bonusDb = await fetchClanHallPassiveBonusByClanId(leader.clanId);
  assert.equal(bonusDb?.pAtk, 150);
  ok('fetchClanHallPassiveBonusByClanId uses current clan level');

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
      console.error('clan-hall cleanup failed:', cleanupErr);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    if (process.exitCode) process.exit(process.exitCode);
  });
