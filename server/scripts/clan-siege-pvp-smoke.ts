/**
 * Clan Siege Stage B1 — shared PvP combat core smoke.
 * npm run test:clan-siege-pvp
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { SIEGE_WALL_MAX_HP } from '../src/domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../src/domain/clanSiegeConstants.js';
import { BATTLE_RANGE } from '../src/domain/battle.js';
import { isInPvpSafeZone } from '../src/domain/pvpSafeZones.js';
import { prisma } from '../src/lib/prisma.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { getBattleSyncForUser } from '../src/services/battleServiceSync.js';
import { startPvpBattleInTx } from '../src/services/battleServicePvpSession.js';
import { touchOnlinePresence } from '../src/services/onlinePresenceService.js';
import { parsePvpPendingDefeat } from '../src/domain/pvpPendingDefeat.js';
import { ackPvpPendingDefeatForUser } from '../src/services/pvpPendingDefeatAckService.js';
import {
  SiegePvpError,
  startSiegePvpBattleInTx,
} from '../src/services/clanSiege/clanSiegePvpService.js';
import type { BattleJsonState } from '../src/domain/battleTypes.js';

const CITY = 'l2dop_oren';
const FAR_X = 520_000;
const FAR_Y = 520_000;
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function runWithSeed(seed: number, fn: () => Promise<void>): Promise<void> {
  const saved = Math.random;
  let s = seed >>> 0;
  Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return fn().finally(() => {
    Math.random = saved;
  });
}

type Acc = { userId: string; characterId: string; name: string; clanId: string };

async function createClanAccount(label: string): Promise<Acc> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `sgpvp_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `P${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId: CITY,
          worldX: FAR_X,
          worldY: FAR_Y,
        },
      },
    },
    include: { characters: true },
  });
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `PG${label}${suffix.slice(-4)}`.slice(0, 16),
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

async function syncPvpPair(args: {
  a: Acc;
  b: Acc;
  targetHp?: number;
}): Promise<void> {
  const targetHp = args.targetHp ?? 5000;
  await prisma.character.update({
    where: { id: args.a.characterId },
    data: {
      battleJson: null,
      karma: 0,
      pvpWins: 0,
      pvpAggressorUntilMs: BigInt(0),
      cityId: CITY,
      worldX: FAR_X,
      worldY: FAR_Y,
      hp: 5000,
      skillCooldownsJson: null,
    },
  });
  await prisma.character.update({
    where: { id: args.b.characterId },
    data: {
      battleJson: null,
      karma: 0,
      cityId: CITY,
      worldX: FAR_X + 1000,
      worldY: FAR_Y,
      hp: targetHp,
      skillCooldownsJson: null,
    },
  });
  await touchOnlinePresence(args.a.userId);
  await touchOnlinePresence(args.b.userId);
}

async function registerParticipants(
  siegeId: string,
  a: Acc,
  b: Acc,
  nowMs: number
): Promise<void> {
  const seen = new Date(nowMs);
  for (const row of [a, b]) {
    await prisma.clanSiegeParticipant.upsert({
      where: {
        siegeId_characterId: { siegeId, characterId: row.characterId },
      },
      create: {
        siegeId,
        characterId: row.characterId,
        clanId: row.clanId,
        lastSeenAt: seen,
      },
      update: { lastSeenAt: seen, clanId: row.clanId },
    });
  }
}

async function registerParticipant(
  siegeId: string,
  acc: Acc,
  nowMs: number
): Promise<void> {
  await prisma.clanSiegeParticipant.upsert({
    where: {
      siegeId_characterId: { siegeId, characterId: acc.characterId },
    },
    create: {
      siegeId,
      characterId: acc.characterId,
      clanId: acc.clanId,
      lastSeenAt: new Date(nowMs),
    },
    update: {
      lastSeenAt: new Date(nowMs),
      clanId: acc.clanId,
    },
  });
}

async function firstAttackMobHpDelta(
  userId: string,
  characterId: string
): Promise<number> {
  const char0 = await prisma.character.findUniqueOrThrow({
    where: { id: characterId },
  });
  const bj0 = parseBattleJson(char0.battleJson);
  assert.ok(bj0, 'battleJson after start');
  const hpBefore = Math.floor(bj0!.mobHp);

  const res = await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, userId, 'attack', char0.revision, {
      characterId,
    })
  );
  assert.ok(res.kind === 'delta' || res.kind === 'full', 'attack response');
  const bj1 = parseBattleJson(
    (await prisma.character.findUniqueOrThrow({ where: { id: characterId } }))
      .battleJson
  );
  assert.ok(bj1, 'battleJson after attack');
  return hpBefore - Math.floor(bj1!.mobHp);
}

async function testWorldVsSiegeSameDamage(): Promise<void> {
  const nowMs = Date.now();
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });
  const siege = await seedActiveSiege(nowMs);
  const a = await createClanAccount('w');
  const b = await createClanAccount('e');
  await registerParticipants(siege.id, a, b, nowMs);
  await syncPvpPair({ a, b });

  assert.equal(isInPvpSafeZone(FAR_X, FAR_Y), false, 'test coords outside safe zone');

  let worldDmg = 0;
  await runWithSeed(77, async () => {
    await syncPvpPair({ a, b });
    const atk = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    await prisma.$transaction((tx) =>
      startPvpBattleInTx(tx, a.userId, b.characterId, atk.revision)
    );
    worldDmg = await firstAttackMobHpDelta(a.userId, a.characterId);
  });

  let siegeDmg = 0;
  await runWithSeed(77, async () => {
    await syncPvpPair({ a, b });
    await registerParticipants(siege.id, a, b, Date.now());
    const atk = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    await prisma.$transaction((tx) =>
      startSiegePvpBattleInTx(
        tx,
        a.userId,
        CITY,
        b.characterId,
        atk.revision,
        a.characterId,
        Date.now()
      )
    );
    siegeDmg = await firstAttackMobHpDelta(a.userId, a.characterId);
  });

  assert.equal(
    worldDmg,
    siegeDmg,
    `world=${worldDmg} siege=${siegeDmg} must match with same RNG`
  );
  assert.ok(worldDmg > 0, 'expected damage > 0');
  ok('same stats + same RNG → world and siege damage match');

  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
  await prisma.clanSiege.delete({ where: { id: siege.id } });
}

async function testSiegeRules(): Promise<void> {
  const nowMs = Date.now();
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });
  const siege = await seedActiveSiege(nowMs);
  const a = await createClanAccount('a');
  const b = await createClanAccount('b');
  const c = await createClanAccount('c');
  await registerParticipants(siege.id, a, b, nowMs);
  await syncPvpPair({ a, b });
  await prisma.character.update({
    where: { id: b.characterId },
    data: { clanId: a.clanId, clanRole: 'member' },
  });
  await prisma.clanSiegeParticipant.updateMany({
    where: { siegeId: siege.id, characterId: b.characterId },
    data: { clanId: a.clanId },
  });

  await assert.rejects(
    () =>
      prisma.$transaction((tx) =>
        startSiegePvpBattleInTx(
          tx,
          a.userId,
          CITY,
          b.characterId,
          0,
          a.characterId,
          nowMs
        )
      ),
    (err: unknown) => {
      assert.ok(err instanceof SiegePvpError);
      assert.equal((err as SiegePvpError).code, 'siege_pvp_same_clan');
      return true;
    }
  );
  ok('cannot attack same-clan ally');

  const ally = await createClanAccount('ally');
  await prisma.character.update({
    where: { id: ally.characterId },
    data: { clanId: a.clanId, clanRole: 'member', cityId: CITY },
  });
  ally.clanId = a.clanId;
  await registerParticipant(siege.id, ally, nowMs);
  await assert.rejects(
    () =>
      prisma.$transaction(async (tx) => {
        const atk = await tx.character.findUniqueOrThrow({
          where: { id: a.characterId },
        });
        return startSiegePvpBattleInTx(
          tx,
          a.userId,
          CITY,
          ally.characterId,
          atk.revision,
          a.characterId,
          nowMs
        );
      }),
    (err: unknown) => {
      assert.ok(err instanceof SiegePvpError);
      assert.equal((err as SiegePvpError).code, 'siege_pvp_same_clan');
      return true;
    }
  );
  ok('cannot attack own clan member');

  await assert.rejects(
    () =>
      prisma.$transaction(async (tx) => {
        const atk = await tx.character.findUniqueOrThrow({
          where: { id: a.characterId },
        });
        return startSiegePvpBattleInTx(
          tx,
          a.userId,
          CITY,
          c.characterId,
          atk.revision,
          a.characterId,
          nowMs
        );
      }),
    (err: unknown) => {
      assert.ok(err instanceof SiegePvpError);
      assert.equal(
        (err as SiegePvpError).code,
        'siege_pvp_target_not_participant'
      );
      return true;
    }
  );
  ok('cannot attack non-participant');

  await prisma.character.update({
    where: { id: b.characterId },
    data: { clanId: b.clanId, clanRole: 'leader' },
  });
  await prisma.clanSiegeParticipant.updateMany({
    where: { siegeId: siege.id, characterId: b.characterId },
    data: { clanId: b.clanId },
  });
  await registerParticipants(siege.id, a, b, nowMs);

  await prisma.clanSiege.update({
    where: { id: siege.id },
    data: {
      endsAt: new Date(Date.now() - 1000),
      state: CLAN_SIEGE_STATE.finished,
    },
  });
  await registerParticipants(siege.id, a, b, Date.now());
  await assert.rejects(
    () =>
      prisma.$transaction(async (tx) => {
        const atk = await tx.character.findUniqueOrThrow({
          where: { id: a.characterId },
        });
        return startSiegePvpBattleInTx(
          tx,
          a.userId,
          CITY,
          b.characterId,
          atk.revision,
          a.characterId,
          Date.now()
        );
      }),
    (err: unknown) => {
      assert.ok(err instanceof SiegePvpError);
      assert.equal((err as SiegePvpError).code, 'siege_finished');
      return true;
    }
  );
  ok('cannot attack after siege ends');

  await prisma.user.deleteMany({
    where: { id: { in: [a.userId, b.userId, c.userId, ally.userId] } },
  });
  await prisma.clanSiege.delete({ where: { id: siege.id } });
}

async function testSiegeVictoryNoKarmaAndReturnUrl(): Promise<void> {
  const nowMs = Date.now();
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });
  const siege = await seedActiveSiege(nowMs);
  const a = await createClanAccount('k');
  const b = await createClanAccount('v');
  await registerParticipants(siege.id, a, b, nowMs);
  await syncPvpPair({ a, b, targetHp: 1 });

  const atk0 = await prisma.character.findUniqueOrThrow({
    where: { id: a.characterId },
  });
  assert.equal(Number(atk0.karma), 0);

  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      a.userId,
      CITY,
      b.characterId,
      atk0.revision,
      a.characterId,
      nowMs
    )
  );

  const atk1 = await prisma.character.findUniqueOrThrow({
    where: { id: a.characterId },
  });
  const bj = parseBattleJson(atk1.battleJson) as BattleJsonState;
  assert.equal(bj.playerCombatMode, 'siege');
  assert.equal(bj.siegeCityId, CITY);

  let res = await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, a.userId, 'attack', atk1.revision, {
      characterId: a.characterId,
    })
  );
  for (let attempt = 0; attempt < 12 && (!res.victory || res.kind !== 'full'); attempt++) {
    await new Promise((r) => setTimeout(r, 600));
    const row = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    if (!row.battleJson) break;
    res = await prisma.$transaction((tx) =>
      performBattleActionInTx(tx, a.userId, 'attack', row.revision, {
        characterId: a.characterId,
      })
    );
  }
  assert.equal(res.kind, 'full');
  assert.ok(res.victory, 'siege pvp victory');
  assert.equal(res.victory!.expGain, '0');
  assert.equal(res.victory!.adenaGain, '0');
  assert.equal(res.victory!.items.length, 0);
  assert.equal(res.victory!.playerCombatMode, 'siege');
  assert.equal(res.victory!.siegeCityId, CITY);
  assert.equal(
    res.victory!.returnUrl,
    '/siege.html?cityId=' + encodeURIComponent(CITY)
  );

  const atkAfter = await prisma.character.findUniqueOrThrow({
    where: { id: a.characterId },
  });
  assert.equal(Number(atkAfter.karma), 0);
  assert.equal(Number(atkAfter.pvpWins), 0);
  ok('siege kill: no karma/PK stats, returnUrl → siege.html');

  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
  await prisma.clanSiege.delete({ where: { id: siege.id } });
}

async function testSiegePvpDefeatEventSyncAndAck(): Promise<void> {
  const nowMs = Date.now();
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });
  const siege = await seedActiveSiege(nowMs);
  const a = await createClanAccount('sd');
  const b = await createClanAccount('sv');
  await registerParticipants(siege.id, a, b, nowMs);
  await syncPvpPair({ a, b, targetHp: 1 });

  const atk0 = await prisma.character.findUniqueOrThrow({
    where: { id: a.characterId },
  });
  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      a.userId,
      CITY,
      b.characterId,
      atk0.revision,
      a.characterId,
      nowMs
    )
  );

  const atk1 = await prisma.character.findUniqueOrThrow({
    where: { id: a.characterId },
  });

  let res = await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, a.userId, 'attack', atk1.revision, {
      characterId: a.characterId,
    })
  );
  for (let attempt = 0; attempt < 12 && (!res.victory || res.kind !== 'full'); attempt++) {
    await new Promise((r) => setTimeout(r, 600));
    const row = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    if (!row.battleJson) break;
    res = await prisma.$transaction((tx) =>
      performBattleActionInTx(tx, a.userId, 'attack', row.revision, {
        characterId: a.characterId,
      })
    );
  }
  assert.equal(res.kind, 'full');
  assert.ok(res.victory, 'attacker wins siege pvp');

  const victim = await prisma.character.findUniqueOrThrow({
    where: { id: b.characterId },
  });
  assert.equal(victim.battleJson, null);
  const pending = parsePvpPendingDefeat(victim.pvpPendingDefeatJson);
  assert.ok(pending);
  assert.equal(pending!.scope, 'clan_siege');
  assert.equal(pending!.eliminatedFromSiege, true);
  assert.equal(pending!.siegeCityId, CITY);
  assert.ok(pending!.deathEventId);
  assert.match(pending!.killerName, /.+/);
  ok('victim pending defeat: clan_siege + deathEventId');

  const sync = await getBattleSyncForUser(b.userId, {
    characterId: b.characterId,
    battleVersion: 999,
  });
  assert.ok(sync);
  assert.equal(sync!.outcome, 'DEFEAT');
  assert.equal(sync!.battleEnded, true);
  assert.ok(sync!.pvpDefeat);
  assert.equal(sync!.pvpDefeat!.deathEventId, pending!.deathEventId);
  assert.equal(sync!.pvpDefeat!.scope, 'clan_siege');
  assert.match(String(sync!.pvpDefeat!.messageUk), /вибули з облоги/i);
  ok('victim battle sync: DEFEAT + pvpDefeat');

  const ack1 = await ackPvpPendingDefeatForUser(
    b.userId,
    pending!.deathEventId,
    b.characterId
  );
  assert.equal(ack1.ok, true);
  const ack2 = await ackPvpPendingDefeatForUser(
    b.userId,
    pending!.deathEventId,
    b.characterId
  );
  assert.equal(ack2.ok, true);
  ok('pvp defeat ack idempotent');

  const victimAfter = await prisma.character.findUniqueOrThrow({
    where: { id: b.characterId },
  });
  assert.ok(
    parsePvpPendingDefeat(victimAfter.pvpPendingDefeatJson),
    'ack must not clear pending before respawn'
  );
  ok('pvp defeat ack idempotent without clearing pending');

  const part = await prisma.clanSiegeParticipant.findFirst({
    where: { siegeId: siege.id, characterId: b.characterId },
  });
  assert.ok(part?.eliminatedAt);
  ok('victim eliminated from siege');

  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
  await prisma.clanSiege.delete({ where: { id: siege.id } });
}

async function main(): Promise<void> {
  console.log('clan-siege-pvp-smoke\n');
  assert.ok(FAR_X - (FAR_X + 1000) < BATTLE_RANGE, 'pair within battle range');
  await testWorldVsSiegeSameDamage();
  await testSiegeRules();
  await testSiegeVictoryNoKarmaAndReturnUrl();
  await testSiegePvpDefeatEventSyncAndAck();
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
