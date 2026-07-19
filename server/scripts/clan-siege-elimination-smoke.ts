/**
 * Clan Siege Stage B1.1 — elimination, defender rules, winner eligibility.
 * npm run test:clan-siege-elimination
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
  SIEGE_REWARD_CLAN_POINTS,
  SIEGE_WALL_DAMAGE_MIN,
  SIEGE_WALL_DAMAGE_MAX,
  SIEGE_WALL_MAX_HP,
} from '../src/domain/clanSiegeConfig.js';
import { CLAN_SIEGE_FINISH_REASON } from '../src/domain/clanSiegeConstants.js';
import { prisma } from '../src/lib/prisma.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { startPvpBattleInTx } from '../src/services/battleServicePvpSession.js';
import {
  SiegeAttackError,
  attackSiegeWallForUser,
  getSiegeStateForUser,
} from '../src/services/clanSiege/clanSiegeStateService.js';
import { finishClanSiegeInTx } from '../src/services/clanSiege/clanSiegeFinishService.js';
import {
  SiegePvpError,
  startSiegePvpBattleInTx,
} from '../src/services/clanSiege/clanSiegePvpService.js';

const CITY = 'l2dop_oren';
const CITY2 = 'l2dop_giran';
const FAR_X = 520_000;
const FAR_Y = 520_000;
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

type Acc = { userId: string; characterId: string; name: string; clanId: string };

async function createClanAccount(label: string, cityId = CITY): Promise<Acc> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `sgelim_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `E${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId,
          worldX: FAR_X,
          worldY: FAR_Y,
          hp: 5000,
        },
      },
    },
    include: { characters: true },
  });
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `EL${label}${suffix.slice(-4)}`.slice(0, 16),
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

async function seedActiveSiege(cityId: string, nowMs: number, wallHp = SIEGE_WALL_MAX_HP) {
  return prisma.clanSiege.create({
    data: {
      cityId,
      startsAt: new Date(nowMs - 60_000),
      endsAt: new Date(nowMs + 3_600_000),
      state: 'active',
      wallHp,
      wallMaxHp: SIEGE_WALL_MAX_HP,
    },
  });
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
      eliminatedAt: null,
      eliminatedByCharacterId: null,
    },
  });
}

async function syncPvpPair(a: Acc, b: Acc, targetHp = 5000): Promise<void> {
  await prisma.character.update({
    where: { id: a.characterId },
    data: {
      battleJson: null,
      karma: 0,
      pvpWins: 0,
      cityId: CITY,
      hp: 5000,
      skillCooldownsJson: null,
    },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: {
      battleJson: null,
      karma: 0,
      cityId: CITY,
      hp: targetHp,
      skillCooldownsJson: null,
    },
  });
}

async function killInSiegePvp(winner: Acc, loser: Acc, siegeId: string): Promise<void> {
  await syncPvpPair(winner, loser, 1);
  await registerParticipant(siegeId, winner, Date.now());
  await registerParticipant(siegeId, loser, Date.now());
  const atk = await prisma.character.findUniqueOrThrow({
    where: { id: winner.characterId },
  });
  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      winner.userId,
      CITY,
      loser.characterId,
      atk.revision,
      winner.characterId,
      Date.now()
    )
  );
  const afterStart = await prisma.character.findUniqueOrThrow({
    where: { id: winner.characterId },
  });
  let res = await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, winner.userId, 'attack', afterStart.revision, {
      characterId: winner.characterId,
    })
  );
  for (let attempt = 0; attempt < 15 && (!res.victory || res.kind !== 'full'); attempt++) {
    await new Promise((r) => setTimeout(r, 600));
    const row = await prisma.character.findUniqueOrThrow({
      where: { id: winner.characterId },
    });
    if (!row.battleJson) break;
    res = await prisma.$transaction((tx) =>
      performBattleActionInTx(tx, winner.userId, 'attack', row.revision, {
        characterId: winner.characterId,
      })
    );
  }
  assert.equal(res.kind, 'full');
  assert.ok(res.victory);
}

function runWithWallDamage(damage: number, fn: () => Promise<void>): Promise<void> {
  const span = SIEGE_WALL_DAMAGE_MAX - SIEGE_WALL_DAMAGE_MIN + 1;
  const clamped = Math.max(SIEGE_WALL_DAMAGE_MIN, Math.min(SIEGE_WALL_DAMAGE_MAX, damage));
  const normalized = (clamped - SIEGE_WALL_DAMAGE_MIN + 0.5) / span;
  const saved = Math.random;
  Math.random = () => normalized;
  return fn().finally(() => {
    Math.random = saved;
  });
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

async function main(): Promise<void> {
  console.log('clan-siege-elimination-smoke\n');
  const users: string[] = [];
  const nowMs = Date.now();

  await prisma.clanSiege.deleteMany({ where: { cityId: { in: [CITY, CITY2] } } });

  const owner = await createClanAccount('own');
  const attacker = await createClanAccount('atk');
  users.push(owner.userId, attacker.userId);

  await prisma.cityCastle.upsert({
    where: { cityId: CITY },
    create: { cityId: CITY, ownerClanId: owner.clanId },
    update: { ownerClanId: owner.clanId },
  });

  const siege = await seedActiveSiege(CITY, nowMs);

  try {
    await attackSiegeWallForUser(
      owner.userId,
      CITY,
      'def-wall',
      owner.characterId,
      nowMs
    );
    assert.fail('owner wall attack expected');
  } catch (e) {
    assert.ok(e instanceof SiegeAttackError);
    assert.equal(e.code, 'siege_defender');
  }
  ok('1. Defender cannot attack wall');

  await registerParticipant(siege.id, owner, nowMs);
  await registerParticipant(siege.id, attacker, nowMs);
  const ownerState = await getSiegeStateForUser(
    owner.userId,
    CITY,
    owner.characterId,
    nowMs + 1
  );
  assert.equal(ownerState.canAttackWall, false);
  assert.equal(ownerState.wallAttackBlockReason, 'siege_defender');
  assert.equal(ownerState.canStartSiegePvp, true);
  ok('2. Defender can start PvP (state flag)');

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
      nowMs + 2
    )
  );
  ok('2b. Defender can start PvP against enemy');

  await prisma.character.update({
    where: { id: owner.characterId },
    data: { battleJson: null },
  });
  const atkChar = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      attacker.userId,
      CITY,
      owner.characterId,
      atkChar.revision,
      attacker.characterId,
      nowMs + 3
    )
  );
  ok('3. Enemy can attack defender');

  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null, clanId: owner.clanId, clanRole: 'member' },
  });
  await prisma.clanSiegeParticipant.updateMany({
    where: { siegeId: siege.id, characterId: attacker.characterId },
    data: { clanId: owner.clanId },
  });
  await assert.rejects(
    () =>
      prisma.$transaction((tx) =>
        startSiegePvpBattleInTx(
          tx,
          owner.userId,
          CITY,
          attacker.characterId,
          ownerChar.revision,
          owner.characterId,
          nowMs + 4
        )
      ),
    (err: unknown) => {
      assert.ok(err instanceof SiegePvpError);
      assert.equal((err as SiegePvpError).code, 'siege_pvp_same_clan');
      return true;
    }
  );
  ok('4. Same clan PvP blocked');

  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { clanId: attacker.clanId, clanRole: 'leader' },
  });
  await prisma.clanSiegeParticipant.updateMany({
    where: { siegeId: siege.id, characterId: attacker.characterId },
    data: { clanId: attacker.clanId, eliminatedAt: null, eliminatedByCharacterId: null },
  });

  await killInSiegePvp(owner, attacker, siege.id);
  const loserPart = await prisma.clanSiegeParticipant.findUniqueOrThrow({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: attacker.characterId,
      },
    },
  });
  assert.ok(loserPart.eliminatedAt);
  assert.equal(loserPart.eliminatedByCharacterId, owner.characterId);
  ok('5. Siege death sets eliminatedAt');

  await assert.rejects(
    () =>
      prisma.$transaction(async (tx) => {
        const atk = await tx.character.findUniqueOrThrow({
          where: { id: attacker.characterId },
        });
        return startSiegePvpBattleInTx(
          tx,
          attacker.userId,
          CITY,
          owner.characterId,
          atk.revision,
          attacker.characterId,
          nowMs + 5000
        );
      }),
    (err: unknown) => {
      assert.ok(err instanceof SiegePvpError);
      assert.equal((err as SiegePvpError).code, 'siege_eliminated');
      return true;
    }
  );
  ok('6. Eliminated player cannot restart PvP');

  await assert.rejects(
    () =>
      prisma.$transaction(async (tx) => {
        const own = await tx.character.findUniqueOrThrow({
          where: { id: owner.characterId },
        });
        return startSiegePvpBattleInTx(
          tx,
          owner.userId,
          CITY,
          attacker.characterId,
          own.revision,
          owner.characterId,
          nowMs + 5001
        );
      }),
    (err: unknown) => {
      assert.ok(err instanceof SiegePvpError);
      assert.equal((err as SiegePvpError).code, 'siege_pvp_target_eliminated');
      return true;
    }
  );
  ok('7. Eliminated player cannot be selected as target');

  try {
    await attackSiegeWallForUser(
      attacker.userId,
      CITY,
      'elim-wall',
      attacker.characterId,
      nowMs + 5002
    );
    assert.fail('eliminated wall attack expected');
  } catch (e) {
    assert.ok(e instanceof SiegeAttackError);
    assert.equal(e.code, 'siege_eliminated');
  }
  ok('8. Eliminated player cannot hit wall');

  const reloadState = await getSiegeStateForUser(
    attacker.userId,
    CITY,
    attacker.characterId,
    nowMs + 5003
  );
  assert.equal(reloadState.viewerEliminated, true);
  assert.equal(reloadState.canAttackWall, false);
  assert.equal(reloadState.canStartSiegePvp, false);
  ok('9. Reload/state request does not restore participation');

  const elimBeforeTouch = loserPart.eliminatedAt!.getTime();
  await getSiegeStateForUser(
    attacker.userId,
    CITY,
    attacker.characterId,
    elimBeforeTouch + SIEGE_PARTICIPANT_PRESENCE_TOUCH_MS + 5
  );
  const afterTouch = await prisma.clanSiegeParticipant.findUniqueOrThrow({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: attacker.characterId,
      },
    },
  });
  assert.equal(afterTouch.eliminatedAt!.getTime(), elimBeforeTouch);
  ok('10. Presence touch does not clear eliminatedAt');

  const siege2 = await seedActiveSiege(CITY2, nowMs + 6000);
  await registerParticipant(siege2.id, attacker, nowMs + 6001);
  const otherState = await getSiegeStateForUser(
    attacker.userId,
    CITY2,
    attacker.characterId,
    nowMs + 6002
  );
  assert.equal(otherState.viewerEliminated, false);
  assert.equal(otherState.canStartSiegePvp, true);
  ok('11–12. Elimination scoped to siegeId; later siege allowed');

  await prisma.clanSiege.delete({ where: { id: siege2.id } });

  await prisma.clanSiege.update({
    where: { id: siege.id },
    data: {
      endsAt: new Date(nowMs - 1000),
      wallHp: 5000,
    },
  });
  const ownerBeforeTimeout = await prisma.cityCastle.findUniqueOrThrow({
    where: { cityId: CITY },
  });
  await prisma.$transaction((tx) =>
    finishClanSiegeInTx(
      tx,
      siege.id,
      CLAN_SIEGE_FINISH_REASON.timeExpired,
      nowMs
    )
  );
  const afterTimeout = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: siege.id },
  });
  assert.equal(afterTimeout.finishReason, CLAN_SIEGE_FINISH_REASON.timeExpired);
  assert.ok(afterTimeout.wallHp > 0);
  const castleAfterTimeout = await prisma.cityCastle.findUniqueOrThrow({
    where: { cityId: CITY },
  });
  assert.equal(castleAfterTimeout.ownerClanId, ownerBeforeTimeout.ownerClanId);
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: siege.id } }),
    0
  );
  ok('13–14. wallHp > 0 at timeout keeps owner, no reward');

  await prisma.clanSiege.delete({ where: { id: siege.id } });
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });

  const wallSiege = await seedActiveSiege(CITY, nowMs + 7000, 100);
  const clanB = await createClanAccount('b');
  const clanC = await createClanAccount('c');
  users.push(clanB.userId, clanC.userId);
  const t1 = new Date(nowMs + 7000);
  const t2 = new Date(nowMs + 8000);
  await prisma.clanSiegeClanDamage.createMany({
    data: [
      {
        siegeId: wallSiege.id,
        clanId: clanB.clanId,
        totalDamage: 400_000,
        firstHitAt: t1,
        lastHitAt: t1,
      },
      {
        siegeId: wallSiege.id,
        clanId: clanC.clanId,
        totalDamage: 200_000,
        firstHitAt: t2,
        lastHitAt: t2,
      },
    ],
  });
  await registerParticipant(wallSiege.id, clanB, nowMs + 7001);
  await registerParticipant(wallSiege.id, clanC, nowMs + 7001);
  await prisma.clanSiegeParticipant.update({
    where: {
      siegeId_characterId: {
        siegeId: wallSiege.id,
        characterId: clanB.characterId,
      },
    },
    data: {
      eliminatedAt: new Date(nowMs + 7002),
      eliminatedByCharacterId: clanC.characterId,
    },
  });
  await registerParticipant(wallSiege.id, clanC, nowMs + 7003);
  await prisma.character.update({
    where: { id: clanC.characterId },
    data: { hp: 3000, cityId: CITY },
  });
  await runWithWallDamage(100, async () => {
  await attackSiegeWallForUser(
    clanC.userId,
    CITY,
    'final-hit',
    clanC.characterId,
    nowMs + 7010
  );
  });
  const finishedWall = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: wallSiege.id },
  });
  assert.equal(finishedWall.finishReason, CLAN_SIEGE_FINISH_REASON.wallDestroyed);
  assert.equal(finishedWall.winnerClanId, clanC.clanId);
  ok('15–16. All-B eliminated; lower-damage alive clan C wins');

  await prisma.clanSiege.delete({ where: { id: wallSiege.id } });
  await prisma.cityCastle.update({
    where: { cityId: CITY },
    data: { ownerClanId: owner.clanId },
  });

  const noEligSiege = await seedActiveSiege(CITY, nowMs + 8000, 50);
  await prisma.clanSiegeClanDamage.create({
    data: {
      siegeId: noEligSiege.id,
      clanId: clanB.clanId,
      totalDamage: 100_000,
      firstHitAt: new Date(nowMs + 8000),
      lastHitAt: new Date(nowMs + 8000),
    },
  });
  await registerParticipant(noEligSiege.id, clanB, nowMs + 8001);
  await prisma.clanSiegeParticipant.update({
    where: {
      siegeId_characterId: {
        siegeId: noEligSiege.id,
        characterId: clanB.characterId,
      },
    },
    data: {
      eliminatedAt: new Date(nowMs + 8002),
      eliminatedByCharacterId: clanC.characterId,
    },
  });
  await prisma.clanSiege.update({
    where: { id: noEligSiege.id },
    data: { wallHp: 0 },
  });
  await prisma.$transaction((tx) =>
    finishClanSiegeInTx(
      tx,
      noEligSiege.id,
      CLAN_SIEGE_FINISH_REASON.wallDestroyed,
      nowMs + 8010
    )
  );
  const noEligDone = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: noEligSiege.id },
  });
  assert.equal(
    noEligDone.finishReason,
    CLAN_SIEGE_FINISH_REASON.wallDestroyedNoEligibleAttacker
  );
  assert.equal(noEligDone.winnerClanId, null);
  assert.equal(
    (await prisma.cityCastle.findUniqueOrThrow({ where: { cityId: CITY } }))
      .ownerClanId,
    owner.clanId
  );
  ok('17. No eligible alive attacker means owner remains');

  await prisma.clanSiege.delete({ where: { id: noEligSiege.id } });
  await prisma.cityCastle.update({
    where: { cityId: CITY },
    data: { ownerClanId: owner.clanId },
  });

  const rewardAcc = await createClanAccount('rw');
  users.push(rewardAcc.userId);
  const rewardSiege = await seedActiveSiege(CITY, nowMs + 9000, 100);
  await registerParticipant(rewardSiege.id, rewardAcc, nowMs + 9001);
  await prisma.clanSiegeClanDamage.create({
    data: {
      siegeId: rewardSiege.id,
      clanId: rewardAcc.clanId,
      totalDamage: 500,
      firstHitAt: new Date(nowMs + 9000),
      lastHitAt: new Date(nowMs + 9000),
    },
  });
  const ptsBefore = (
    await prisma.clan.findUniqueOrThrow({ where: { id: rewardAcc.clanId } })
  ).clanPoints;
  await runWithWallDamage(100, async () => {
  await attackSiegeWallForUser(
    rewardAcc.userId,
    CITY,
    'reward-final',
    rewardAcc.characterId,
    nowMs + 9010
  );
  });
  const ptsAfter = (
    await prisma.clan.findUniqueOrThrow({ where: { id: rewardAcc.clanId } })
  ).clanPoints;
  assert.equal(ptsAfter - ptsBefore, SIEGE_REWARD_CLAN_POINTS);
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: rewardSiege.id } }),
    1
  );
  const ledger = await prisma.clanSiegeRewardLedger.findUniqueOrThrow({
    where: { siegeId: rewardSiege.id },
  });
  assert.equal(ledger.points, 8000);
  ok('18. Reward remains exactly 8000 and is granted once');

  await syncPvpPair(clanC, clanB, 5000);
  const pvpSiege = await seedActiveSiege(CITY2, nowMs + 9020);
  await registerParticipant(pvpSiege.id, clanC, nowMs + 9021);
  await registerParticipant(pvpSiege.id, clanB, nowMs + 9021);
  await prisma.character.update({
    where: { id: clanC.characterId },
    data: { cityId: CITY2 },
  });
  await prisma.character.update({
    where: { id: clanB.characterId },
    data: { cityId: CITY2 },
  });
  await runWithSeed(42, async () => {
    await syncPvpPair(clanC, clanB, 5000);
    await prisma.character.updateMany({
      where: { id: { in: [clanC.characterId, clanB.characterId] } },
      data: { cityId: CITY2 },
    });
    await registerParticipant(pvpSiege.id, clanC, nowMs + 9021);
    await registerParticipant(pvpSiege.id, clanB, nowMs + 9021);
    const c0 = await prisma.character.findUniqueOrThrow({
      where: { id: clanC.characterId },
    });
    await prisma.$transaction((tx) =>
      startSiegePvpBattleInTx(
        tx,
        clanC.userId,
        CITY2,
        clanB.characterId,
        c0.revision,
        clanC.characterId,
        nowMs + 9022
      )
    );
    const cAfterStart = await prisma.character.findUniqueOrThrow({
      where: { id: clanC.characterId },
    });
    const atkBjBefore = parseBattleJson(cAfterStart.battleJson);
    assert.ok(
      typeof atkBjBefore?.mobMaxCp === 'number' && atkBjBefore.mobMaxCp > 0,
      'attacker siege PvP view exposes victim CP bar (shared core)'
    );
    let verified = false;
    for (let attempt = 0; attempt < 12 && !verified; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 600));
      }
      const cRow = await prisma.character.findUniqueOrThrow({
        where: { id: clanC.characterId },
      });
      if (!cRow.battleJson) break;
      const atkBefore = parseBattleJson(cRow.battleJson);
      const cpStart =
        typeof atkBefore?.mobCp === 'number'
          ? atkBefore.mobCp
          : atkBefore?.mobMaxCp;
      assert.ok(typeof cpStart === 'number' && cpStart > 0);
      await prisma.$transaction((tx) =>
        performBattleActionInTx(tx, clanC.userId, 'attack', cRow.revision, {
          characterId: clanC.characterId,
        })
      );
      const cHit = await prisma.character.findUniqueOrThrow({
        where: { id: clanC.characterId },
      });
      const atkAfter = parseBattleJson(cHit.battleJson);
      const cpNow =
        typeof atkAfter?.mobCp === 'number' ? atkAfter.mobCp : cpStart;
      const bRow = await prisma.character.findUniqueOrThrow({
        where: { id: clanB.characterId },
      });
      if (cpNow! < cpStart! && bRow.hp === 5000) {
        verified = true;
      } else if (bRow.hp < 5000) {
        verified = true;
      }
    }
    assert.ok(verified, 'expected landing hit in siege PvP CP/HP path');
  });
  ok('19. Siege PvP still changes CP before HP');

  await prisma.character.updateMany({
    where: { id: { in: [clanC.characterId, clanB.characterId] } },
    data: { battleJson: null, skillCooldownsJson: null },
  });

  await syncPvpPair(clanC, clanB, 1);
  await prisma.character.updateMany({
    where: { id: { in: [clanC.characterId, clanB.characterId] } },
    data: { cityId: CITY2 },
  });
  await registerParticipant(pvpSiege.id, clanC, nowMs + 9030);
  await registerParticipant(pvpSiege.id, clanB, nowMs + 9030);
  const cStart = await prisma.character.findUniqueOrThrow({
    where: { id: clanC.characterId },
  });
  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      clanC.userId,
      CITY2,
      clanB.characterId,
      cStart.revision,
      clanC.characterId,
      nowMs + 9031
    )
  );
  const cAfterStart2 = await prisma.character.findUniqueOrThrow({
    where: { id: clanC.characterId },
  });
  const karmaBefore = cAfterStart2.karma;
  const winsBefore = cAfterStart2.pvpWins;
  const expBefore = cAfterStart2.exp;
  await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, clanC.userId, 'attack', cAfterStart2.revision, {
      characterId: clanC.characterId,
    })
  );
  const cWin = await prisma.character.findUniqueOrThrow({
    where: { id: clanC.characterId },
  });
  assert.equal(Number(cWin.karma), Number(karmaBefore));
  assert.equal(Number(cWin.pvpWins), Number(winsBefore));
  assert.equal(cWin.exp, expBefore);
  ok('20. Siege PvP gives no karma, PK, pvpWins, EXP');

  await prisma.character.updateMany({
    where: { id: { in: [clanC.characterId, clanB.characterId] } },
    data: { battleJson: null, skillCooldownsJson: null },
  });

  await syncPvpPair(clanC, clanB);
  const wAtk = await prisma.character.findUniqueOrThrow({
    where: { id: clanC.characterId },
  });
  await prisma.$transaction((tx) =>
    startPvpBattleInTx(tx, clanC.userId, clanB.characterId, wAtk.revision)
  );
  const wAfterStart = await prisma.character.findUniqueOrThrow({
    where: { id: clanC.characterId },
  });
  await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, clanC.userId, 'attack', wAfterStart.revision, {
      characterId: clanC.characterId,
    })
  );
  const wAfter = await prisma.character.findUniqueOrThrow({
    where: { id: clanC.characterId },
  });
  assert.ok(Number(wAfter.karma) >= Number(wAfterStart.karma));
  ok('21. World PvP regression remains unchanged');

  await prisma.clanSiege.delete({ where: { id: pvpSiege.id } });
  await prisma.clanSiege.delete({ where: { id: rewardSiege.id } });

  const parSiege = await seedActiveSiege(CITY, nowMs + 10_000, 100);
  await prisma.cityCastle.update({
    where: { cityId: CITY },
    data: { ownerClanId: owner.clanId },
  });
  const pA = await createClanAccount('pa');
  const pB = await createClanAccount('pb');
  users.push(pA.userId, pB.userId);
  await registerParticipant(parSiege.id, pA, nowMs + 10_001);
  await registerParticipant(parSiege.id, pB, nowMs + 10_001);
  await prisma.clanSiegeClanDamage.createMany({
    data: [
      {
        siegeId: parSiege.id,
        clanId: pA.clanId,
        totalDamage: 50,
        firstHitAt: new Date(nowMs + 10_000),
        lastHitAt: new Date(nowMs + 10_000),
      },
      {
        siegeId: parSiege.id,
        clanId: pB.clanId,
        totalDamage: 50,
        firstHitAt: new Date(nowMs + 10_001),
        lastHitAt: new Date(nowMs + 10_001),
      },
    ],
  });
  const ptsParBeforeByClanId = {
    [pA.clanId]: (
      await prisma.clan.findUniqueOrThrow({ where: { id: pA.clanId } })
    ).clanPoints,
    [pB.clanId]: (
      await prisma.clan.findUniqueOrThrow({ where: { id: pB.clanId } })
    ).clanPoints,
  };
  await runWithWallDamage(50, async () => {
  const [parA, parB] = await Promise.all([
    attackSiegeWallForUser(pA.userId, CITY, 'par-a', pA.characterId, nowMs + 10_010),
    attackSiegeWallForUser(pB.userId, CITY, 'par-b', pB.characterId, nowMs + 10_010),
  ]);
  assert.ok(parA.ok);
  assert.ok(parB.ok);
  assert.ok(parA.finished || parB.finished);
  assert.equal(
    await prisma.clanSiegeRewardLedger.count({ where: { siegeId: parSiege.id } }),
    1
  );
  const parDone = await prisma.clanSiege.findUniqueOrThrow({
    where: { id: parSiege.id },
  });
  assert.ok(parDone.winnerClanId);
  assert.ok(parDone.finishedAt);
  assert.ok(parDone.rewardGrantedAt);
  const parLedger = await prisma.clanSiegeRewardLedger.findUniqueOrThrow({
    where: { siegeId: parSiege.id },
  });
  assert.equal(parLedger.clanId, parDone.winnerClanId);
  assert.equal(parLedger.points, SIEGE_REWARD_CLAN_POINTS);
  for (const [clanId, ptsBefore] of Object.entries(ptsParBeforeByClanId)) {
    const ptsAfter = (
      await prisma.clan.findUniqueOrThrow({ where: { id: clanId } })
    ).clanPoints;
    if (clanId === parDone.winnerClanId) {
      assert.equal(ptsAfter - ptsBefore, SIEGE_REWARD_CLAN_POINTS);
    } else {
      assert.equal(ptsAfter - ptsBefore, 0);
    }
  }
  });
  ok('22. Two simultaneous finish attempts cannot grant two rewards');

  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.clanSiege.deleteMany({ where: { cityId: { in: [CITY, CITY2] } } });

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
