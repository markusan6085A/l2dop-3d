/**
 * Clan Hall passive × clan level integration (0–8, snapshot, battle, HP).
 * npm run test:clan-hall-level-integration
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';
import { CLAN_HALL_MAX_LEVEL } from '../src/domain/clanHall.js';
import {
  clanHallBuffForLevel,
  resolveClanHallPassiveBonus,
} from '../src/domain/clanHall.js';
import { resolveHpWithClanHallPassive } from '../src/domain/characterClanHallVitals.js';
import { prisma } from '../src/lib/prisma.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { startPvpBattleInTx } from '../src/services/battleServicePvpSession.js';
import {
  ensureClanHallOnRow,
  toSnapshotWithClanHall,
} from '../src/services/charClientSnapshot.js';
import type { CharacterRow } from '../src/services/charTypes.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusInTx,
} from '../src/services/characterClanHallVitals.js';
import { fetchClanHallPassiveBonusByClanId } from '../src/services/clanHallService.js';
import { levelUpClanForUser } from '../src/services/clanLevelService.js';

const CITY = 'l2dop_oren';
const SPAWN_ID = MAP_WORLD_SPAWNS[0]!.id;
const runSuffix = `${Date.now()}_${process.pid}_${randomUUID()}`;
let passed = 0;
const created = { userIds: [] as string[], clanIds: [] as string[] };

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function expectedBonus(level: number) {
  return {
    pAtk: level * 75,
    mAtk: level * 75,
    pDef: level * 75,
    mDef: level * 75,
    maxHp: level * 300,
  };
}

async function createAccount(label: string) {
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const user = await prisma.user.create({
    data: {
      login: `chli_${label}_${runSuffix}`.slice(0, 120),
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `HI${label}${suffix}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId: CITY,
          worldX: 520_000,
          worldY: 520_000,
        },
      },
    },
    include: { characters: true },
  });
  created.userIds.push(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function createClanLeader(label: string, opts?: {
  level?: number;
  hallBlessingAt?: Date | null;
  clanPoints?: number;
}) {
  const acc = await createAccount(label);
  const suffix = runSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const clan = await prisma.clan.create({
    data: {
      name: `HKI${label}${suffix}`.slice(0, 16),
      leaderId: acc.characterId,
      level: opts?.level ?? 0,
      clanPoints: opts?.clanPoints ?? 0,
      hallBlessingAt: opts?.hallBlessingAt ?? null,
    },
  });
  created.clanIds.push(clan.id);
  await prisma.character.update({
    where: { id: acc.characterId },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return { ...acc, clanId: clan.id };
}

async function loadRow(characterId: string): Promise<CharacterRow> {
  const row = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      clan: { select: { name: true, hallBlessingAt: true, level: true, emblemId: true } },
    },
  });
  assert.ok(row);
  return row as CharacterRow;
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
  console.log('clan-hall-level-integration smoke\n');

  const blessing = new Date();

  for (let lv = 1; lv <= CLAN_HALL_MAX_LEVEL; lv += 1) {
    const row = clanHallBuffForLevel(lv);
    const exp = expectedBonus(lv);
    assert.equal(row.pAtk, exp.pAtk);
    assert.equal(row.mAtk, exp.mAtk);
    assert.equal(row.pDef, exp.pDef);
    assert.equal(row.mDef, exp.mDef);
    assert.equal(row.maxHp, exp.maxHp);
  }
  ok('levels 1–8: pAtk/mAtk/pDef/mDef = level×75, maxHp = level×300');

  assert.equal(resolveClanHallPassiveBonus({ hallBlessingAt: blessing, level: 0 }), null);
  ok('level 0 + hallBlessingAt → null');

  assert.equal(resolveClanHallPassiveBonus({ hallBlessingAt: null, level: 5 }), null);
  ok('level 5 without blessing → null');

  for (let lv = 1; lv <= 8; lv += 1) {
    const bonus = resolveClanHallPassiveBonus({ hallBlessingAt: blessing, level: lv });
    assert.ok(bonus);
    const exp = expectedBonus(lv);
    assert.equal(bonus!.pAtk, exp.pAtk);
    assert.equal(bonus!.maxHp, exp.maxHp);
  }
  ok('levels 1–8 with blessing resolve correct totals (not stacked)');

  const leader = await createClanLeader('MAIN', {
    level: 0,
    hallBlessingAt: blessing,
    clanPoints: 8000,
  });

  let bonus0 = await fetchClanHallPassiveBonusByClanId(leader.clanId);
  assert.equal(bonus0, null);
  ok('clan level 0 in DB → no passive bonus');

  await prisma.clan.update({ where: { id: leader.clanId }, data: { level: 1 } });
  bonus0 = await fetchClanHallPassiveBonusByClanId(leader.clanId);
  assert.ok(bonus0);
  assert.equal(bonus0!.pAtk, 75);
  ok('0 → 1: bonus starts at +75');

  await prisma.clan.update({ where: { id: leader.clanId }, data: { level: 2 } });
  const bonus2 = await fetchClanHallPassiveBonusByClanId(leader.clanId);
  assert.equal(bonus2!.pAtk, 150);
  assert.notEqual(bonus2!.pAtk, 75 + 150);
  ok('1 → 2: +75 replaced by +150 (not cumulative)');

  const rowBeforeLevelUp = await loadRow(leader.characterId);
  const revBefore = rowBeforeLevelUp.revision;
  const hpBefore = rowBeforeLevelUp.hp;

  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { level: 1, clanPoints: 20_000 },
  });
  await levelUpClanForUser(leader.userId, 1);

  const rowAfterLevelUp = await loadRow(leader.characterId);
  assert.equal(rowAfterLevelUp.hp, hpBefore);
  assert.equal(rowAfterLevelUp.revision, revBefore);
  ok('level-up does not mutate character HP/revision in DB');

  const enriched = await ensureClanHallOnRow(rowAfterLevelUp);
  const snap1 = await toSnapshotWithClanHall(enriched);
  const snap2 = await toSnapshotWithClanHall(enriched);
  assert.equal(snap1.pAtk, snap2.pAtk);
  assert.equal(snap1.maxHp, snap2.maxHp);
  assert.equal(snap1.clanHallBonus?.pAtk, 150);
  ok('snapshot shows +150 stats; double snapshot does not stack');

  const vitals = computeCharacterVitalsBundle({
    row: enriched,
    clanHallBonus: bonus2,
  });
  assert.equal(
    vitals.combatWithClan.pAtk - vitals.combatBase.pAtk,
    150
  );
  assert.equal(vitals.maxHpChain.maxHpWithClanHall - vitals.maxHpChain.maxHpWithoutClanHall, 600);
  ok('vitals bundle applies flat +150/+600 HP delta');

  const maxWithout = vitals.maxHpChain.maxHpWithoutClanHall;
  const maxWith = vitals.maxHpChain.maxHpWithClanHall;

  const fullHp = resolveHpWithClanHallPassive({
    storedHp: maxWithout,
    maxHpWithoutClanHall: maxWithout,
    maxHpWithClanHall: maxWith,
    clanHallBonus: bonus2,
  });
  assert.equal(fullHp, maxWith);
  ok('full HP before cap increase → new full cap after bonus');

  const injuredHp = resolveHpWithClanHallPassive({
    storedHp: maxWithout - 200,
    maxHpWithoutClanHall: maxWithout,
    maxHpWithClanHall: maxWith,
    clanHallBonus: bonus2,
  });
  assert.equal(injuredHp, maxWithout - 200);
  ok('injured character does not get free full heal on cap increase');

  await prisma.character.update({
    where: { id: leader.characterId },
    data: { hp: 0, battleJson: null },
  });
  const deadRow = await loadRow(leader.characterId);
  const deadVitals = computeCharacterVitalsBundle({
    row: deadRow,
    clanHallBonus: bonus2,
  });
  assert.equal(deadVitals.displayHp, 0);
  ok('dead character (hp=0) is not resurrected by clan hall read');

  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { level: CLAN_HALL_MAX_LEVEL },
  });
  const bonus8 = await fetchClanHallPassiveBonusByClanId(leader.clanId);
  assert.equal(bonus8!.pAtk, 600);
  assert.equal(bonus8!.maxHp, 2400);
  ok('level 8 caps at +600/+2400');

  await prisma.character.update({
    where: { id: leader.characterId },
    data: {
      hp: 5000,
      battleJson: null,
      worldX: MAP_WORLD_SPAWNS[0]!.worldX,
      worldY: MAP_WORLD_SPAWNS[0]!.worldY,
      cityId: MAP_WORLD_SPAWNS[0]!.cityId ?? CITY,
    },
  });
  const pveRow = await loadRow(leader.characterId);
  const pveRev = pveRow.revision;
  const pveResult = await prisma.$transaction((tx) =>
    startBattleInTx(tx, leader.userId, SPAWN_ID, pveRev, {
      characterId: leader.characterId,
    })
  );
  assert.equal(pveResult.character.clanHallBonus?.pAtk, 600);
  ok('PvE start uses current clan hall level in snapshot');

  const target = await createAccount('TGT');
  const pvpX = 520_000;
  const pvpY = 520_000;
  await prisma.character.update({
    where: { id: target.characterId },
    data: {
      cityId: CITY,
      worldX: pvpX + 500,
      worldY: pvpY,
      targetX: 0,
      targetY: 0,
      hp: 4000,
      battleJson: null,
    },
  });
  await prisma.character.update({
    where: { id: leader.characterId },
    data: {
      battleJson: null,
      hp: 5000,
      worldX: pvpX,
      worldY: pvpY,
      targetX: 0,
      targetY: 0,
      cityId: CITY,
    },
  });
  const pvpRow = await loadRow(leader.characterId);
  const pvpResult = await prisma.$transaction((tx) =>
    startPvpBattleInTx(tx, leader.userId, target.characterId, pvpRow.revision)
  );
  assert.ok(pvpResult.battle);
  const pvpBonus = resolveClanHallPassiveBonus(pvpRow.clan ?? null);
  const pvpVitals = computeCharacterVitalsBundle({
    row: pvpRow,
    clanHallBonus: pvpBonus,
  });
  assert.equal(pvpBonus?.maxHp, 2400);
  assert.equal(pvpVitals.combatWithClan.pAtk - pvpVitals.combatBase.pAtk, 600);
  ok('PvP start uses current clan hall combat bonus (+600 stats)');

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findUnique({
      where: { id: leader.characterId },
      include: {
        clan: { select: { name: true, hallBlessingAt: true, level: true, emblemId: true } },
      },
    });
    assert.ok(char);
    const partyBonus = await resolveClanHallBonusInTx(tx, char as CharacterRow);
    assert.equal(partyBonus?.pDef, 600);
    ok('Party Battle economy path reads +600 pDef from clan level 8');
  });

  const siegeBonus = resolveClanHallPassiveBonus({
    hallBlessingAt: blessing,
    level: CLAN_HALL_MAX_LEVEL,
  });
  assert.equal(siegeBonus?.mDef, 600);
  ok('Siege PvP resolveClanHallPassiveBonus uses level 8 totals');

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
      console.error('clan-hall-level-integration cleanup failed:', cleanupErr);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    if (process.exitCode) process.exit(process.exitCode);
  });
