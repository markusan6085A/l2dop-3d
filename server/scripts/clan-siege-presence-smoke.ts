/**
 * Clan Siege — participant presence via GET state (defender + attacker, no wall hit).
 * npm run test:clan-siege-presence
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import {
  SIEGE_PARTICIPANT_PRESENCE_TOUCH_MS,
  SIEGE_WALL_MAX_HP,
} from '../src/domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../src/domain/clanSiegeConstants.js';
import { prisma } from '../src/lib/prisma.js';
import { getSiegeStateForUser } from '../src/services/clanSiege/clanSiegeStateService.js';
import { startSiegePvpBattleInTx } from '../src/services/clanSiege/clanSiegePvpService.js';

const CITY = 'l2dop_oren';
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

type Acc = { userId: string; characterId: string; name: string; clanId: string };

async function createClanAccount(label: string): Promise<Acc> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `sgpres_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `R${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 25,
          cityId: CITY,
        },
      },
    },
    include: { characters: true },
  });
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `PR${label}${suffix.slice(-4)}`.slice(0, 16),
      leaderId: c.id,
    },
  });
  await prisma.character.update({
    where: { id: c.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return {
    userId: user.id,
    characterId: c.id,
    name: c.name,
    clanId: clan.id,
  };
}

async function seedActiveSiege(nowMs: number) {
  return prisma.clanSiege.create({
    data: {
      cityId: CITY,
      startsAt: new Date(nowMs - 60_000),
      endsAt: new Date(nowMs + 3_600_000),
      state: CLAN_SIEGE_STATE.active,
      wallHp: SIEGE_WALL_MAX_HP,
      wallMaxHp: SIEGE_WALL_MAX_HP,
    },
  });
}

function findEnemy(
  participants: { enemies: { characterId: string }[] } | undefined,
  targetId: string
): boolean {
  return (
    !!participants &&
    participants.enemies.some((e) => e.characterId === targetId)
  );
}

async function main(): Promise<void> {
  console.log('clan-siege-presence-smoke\n');
  const nowMs = Date.now();
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });

  const owner = await createClanAccount('own');
  const attacker = await createClanAccount('atk');

  await prisma.cityCastle.upsert({
    where: { cityId: CITY },
    create: { cityId: CITY, ownerClanId: owner.clanId },
    update: { ownerClanId: owner.clanId },
  });

  const siege = await seedActiveSiege(nowMs);

  const ownerState = await getSiegeStateForUser(
    owner.userId,
    CITY,
    owner.characterId,
    nowMs
  );
  assert.equal(ownerState.state, 'active');
  assert.equal(ownerState.canAttackWall, false);
  assert.equal(ownerState.wallAttackBlockReason, 'siege_defender');
  assert.equal(ownerState.canStartSiegePvp, true);
  ok('owner GET state: wall attack forbidden');

  const ownerPart = await prisma.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: owner.characterId,
      },
    },
  });
  assert.ok(ownerPart, 'owner participant row after GET (no wall hit)');
  assert.ok(ownerPart!.lastSeenAt, 'owner lastSeenAt set');
  ok('owner joins siege via GET without attack-wall');

  const atkState = await getSiegeStateForUser(
    attacker.userId,
    CITY,
    attacker.characterId,
    nowMs + 1
  );
  assert.equal(atkState.canAttackWall, true);
  assert.equal(atkState.canStartSiegePvp, true);
  assert.ok(
    findEnemy(ownerState.participants, attacker.characterId) === false,
    'owner opened first — no attacker yet'
  );
  assert.ok(
    findEnemy(atkState.participants, owner.characterId),
    'attacker sees owner clan enemy'
  );
  ok('attacker sees owner as enemy after GET');

  const ownerState2 = await getSiegeStateForUser(
    owner.userId,
    CITY,
    owner.characterId,
    nowMs + 2
  );
  assert.ok(
    findEnemy(ownerState2.participants, attacker.characterId),
    'owner sees attacker as enemy'
  );
  ok('owner sees attacker as enemy (bidirectional list)');

  const ownerBeforeThrottle = await prisma.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: owner.characterId,
      },
    },
  });
  const seenBefore = ownerBeforeThrottle!.lastSeenAt!.getTime();

  await getSiegeStateForUser(
    owner.userId,
    CITY,
    owner.characterId,
    seenBefore + 1000
  );
  const ownerAfterQuickPoll = await prisma.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: owner.characterId,
      },
    },
  });
  assert.equal(
    ownerAfterQuickPoll!.lastSeenAt!.getTime(),
    seenBefore,
    'GET within touch throttle must not rewrite lastSeenAt'
  );
  ok(`presence touch throttled (< ${SIEGE_PARTICIPANT_PRESENCE_TOUCH_MS}ms)`);

  await getSiegeStateForUser(
    owner.userId,
    CITY,
    owner.characterId,
    seenBefore + SIEGE_PARTICIPANT_PRESENCE_TOUCH_MS + 1
  );
  const ownerAfterThrottle = await prisma.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: owner.characterId,
      },
    },
  });
  assert.ok(
    ownerAfterThrottle!.lastSeenAt!.getTime() > seenBefore,
    'lastSeenAt updates after throttle window'
  );
  ok('presence touch updates after throttle window');

  const ownerChar = await prisma.character.findUniqueOrThrow({
    where: { id: owner.characterId },
  });
  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      owner.userId,
      CITY,
      attacker.characterId,
      ownerChar.revision,
      owner.characterId,
      nowMs + 5000
    )
  );
  ok('owner clan can start siege PvP vs attacker');

  const atkChar = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await prisma.character.update({
    where: { id: owner.characterId },
    data: { battleJson: null },
  });
  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      attacker.userId,
      CITY,
      owner.characterId,
      atkChar.revision,
      attacker.characterId,
      nowMs + 5001
    )
  );
  ok('attacker clan can start siege PvP vs owner');

  await prisma.user.deleteMany({
    where: { id: { in: [owner.userId, attacker.userId] } },
  });
  await prisma.clanSiege.delete({ where: { id: siege.id } });

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
