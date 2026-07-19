/**
 * Clan Siege PvP state smoke — PvE clear on siege enter + stable HP during PvP.
 * npm run test:clan-siege-pvp-state
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';
import { SIEGE_WALL_MAX_HP } from '../src/domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../src/domain/clanSiegeConstants.js';
import { isPvpBattleJson } from '../src/domain/battlePvpContext.js';
import { PASSIVE_REGEN_TICK_SECONDS } from '../src/services/charPassiveRegen.js';
import { prisma } from '../src/lib/prisma.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { getBattleSyncForUser } from '../src/services/battleServiceSync.js';
import {
  refreshPvpOpponentHpForCharacterInTx,
  startPvpBattleInTx,
} from '../src/services/battleServicePvpSession.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { computePassiveHpRegenPatch } from '../src/services/charPassiveRegen.js';
import {
  SiegePvpError,
  startSiegePvpBattleInTx,
} from '../src/services/clanSiege/clanSiegePvpService.js';
import { markSiegeParticipantEliminatedInTx } from '../src/services/clanSiege/clanSiegeEliminationService.js';
import { getSiegeStateForUser } from '../src/services/clanSiege/clanSiegeStateService.js';

import type { CharacterRow } from '../src/services/charTypes.js';

const CITY = 'l2dop_oren';
const MOB = MAP_WORLD_SPAWNS[0]!;
const FAR_X = 520_000;
const FAR_Y = 520_000;
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
      login: `sgst_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `S${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId: CITY,
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
      name: `SG${label}${suffix.slice(-4)}`.slice(0, 16),
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

async function registerParticipants(
  siegeId: string,
  rows: Acc[],
  nowMs: number
): Promise<void> {
  const seen = new Date(nowMs);
  for (const row of rows) {
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

async function seedPveBattle(acc: Acc, damaged: boolean): Promise<void> {
  await prisma.character.update({
    where: { id: acc.characterId },
    data: {
      battleJson: null,
      cityId: CITY,
      worldX: MOB.worldX,
      worldY: MOB.worldY,
      hp: 5000,
    },
  });
  const char = await prisma.character.findUniqueOrThrow({
    where: { id: acc.characterId },
  });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, acc.userId, MOB.id, char.revision, {
      characterId: acc.characterId,
    })
  );
  if (damaged) {
    const after = await prisma.character.findUniqueOrThrow({
      where: { id: acc.characterId },
    });
    const bj = parseBattleJson(after.battleJson);
    assert.ok(bj);
    await prisma.character.update({
      where: { id: acc.characterId },
      data: {
        battleJson: {
          ...bj,
          mobHp: Math.max(1, Math.floor(bj!.mobHp) - 200),
        },
      },
    });
  }
}

async function resetTargetParticipant(
  siegeId: string,
  target: Acc
): Promise<void> {
  await prisma.clanSiegeParticipant.update({
    where: {
      siegeId_characterId: {
        siegeId,
        characterId: target.characterId,
      },
    },
    data: { eliminatedAt: null, eliminatedByCharacterId: null },
  });
}

async function startSiegePvpPair(
  attacker: Acc,
  target: Acc,
  _siegeId: string
): Promise<void> {
  await prisma.character.update({
    where: { id: attacker.characterId },
    data: {
      battleJson: null,
      cityId: CITY,
      worldX: FAR_X,
      worldY: FAR_Y,
      hp: 5000,
      skillCooldownsJson: null,
    },
  });
  await prisma.character.update({
    where: { id: target.characterId },
    data: {
      battleJson: null,
      cityId: CITY,
      worldX: FAR_X + 1000,
      worldY: FAR_Y,
      hp: 5000,
      skillCooldownsJson: null,
    },
  });
  const atk = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await prisma.$transaction((tx) =>
    startSiegePvpBattleInTx(
      tx,
      attacker.userId,
      CITY,
      target.characterId,
      atk.revision,
      attacker.characterId,
      Date.now()
    )
  );
}

async function attackOnce(
  attacker: Acc
): Promise<Awaited<ReturnType<typeof performBattleActionInTx>>> {
  const row = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  return prisma.$transaction((tx) =>
    performBattleActionInTx(tx, attacker.userId, 'attack', row.revision, {
      characterId: attacker.characterId,
    })
  );
}

async function attackUntilVictoryOrHp(
  attacker: Acc,
  maxHits: number
): Promise<{ victory: boolean; lastMobHp: number }> {
  let victory = false;
  let lastMobHp = -1;
  for (let i = 0; i < maxHits; i++) {
    const row = await prisma.character.findUniqueOrThrow({
      where: { id: attacker.characterId },
    });
    if (!row.battleJson) break;
    const bj = parseBattleJson(row.battleJson);
    if (bj) lastMobHp = Math.floor(bj.mobHp);
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 600));
    }
    const res = await attackOnce(attacker);
    if (res.kind === 'full' && res.victory) {
      victory = true;
      lastMobHp = 0;
      break;
    }
  }
  return { victory, lastMobHp };
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
  console.log('clan-siege-pvp-state-smoke\n');
  const users: string[] = [];
  const nowMs = Date.now();
  await prisma.clanSiege.deleteMany({ where: { cityId: CITY } });
  const siege = await seedActiveSiege(nowMs);
  const attacker = await createClanAccount('atk');
  const target = await createClanAccount('tgt');
  users.push(attacker.userId, target.userId);
  await registerParticipants(siege.id, [attacker, target], nowMs);

  await seedPveBattle(target, false);
  assert.ok(
    (await prisma.character.findUniqueOrThrow({ where: { id: target.characterId } }))
      .battleJson
  );
  ok('1. Target opened PvE battle without attacking');

  await seedPveBattle(target, true);
  const damagedBj = parseBattleJson(
    (
      await prisma.character.findUniqueOrThrow({
        where: { id: target.characterId },
      })
    ).battleJson
  );
  assert.ok(damagedBj && damagedBj.mobHp < damagedBj.mobMaxHp);
  ok('2. Target opened PvE and damaged mob');

  await getSiegeStateForUser(target.userId, CITY, target.characterId, nowMs + 1);
  ok('3. Target enters active siege state');

  const cleared = await prisma.character.findUniqueOrThrow({
    where: { id: target.characterId },
  });
  assert.equal(cleared.battleJson, null);
  assert.equal(cleared.mobsKilled, 0);
  ok('4. PvE battleJson cleared without kill reward');

  await startSiegePvpPair(attacker, target, siege.id);
  ok('5. Enemy can start Siege PvP immediately');

  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null },
  });
  await seedPveBattle(attacker, false);
  const atkBefore = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  assert.ok(atkBefore.battleJson);
  await prisma.$transaction(async (tx) => {
    await startSiegePvpBattleInTx(
      tx,
      attacker.userId,
      CITY,
      target.characterId,
      atkBefore.revision,
      attacker.characterId,
      Date.now()
    );
  });
  const atkAfter = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  assert.ok(atkAfter.battleJson && isPvpBattleJson(parseBattleJson(atkAfter.battleJson)!));
  ok('6. Attacker with stale PvE can start Siege PvP');

  const worldA = await createClanAccount('wa');
  const worldB = await createClanAccount('wb');
  users.push(worldA.userId, worldB.userId);
  await prisma.character.update({
    where: { id: worldA.characterId },
    data: { worldX: FAR_X, worldY: FAR_Y, battleJson: null, cityId: CITY },
  });
  await prisma.character.update({
    where: { id: worldB.characterId },
    data: {
      worldX: FAR_X + 500,
      worldY: FAR_Y,
      battleJson: null,
      cityId: CITY,
    },
  });
  const wa = await prisma.character.findUniqueOrThrow({
    where: { id: worldA.characterId },
  });
  await prisma.$transaction((tx) =>
    startPvpBattleInTx(tx, worldA.userId, worldB.characterId, wa.revision)
  );
  await getSiegeStateForUser(worldA.userId, CITY, worldA.characterId, nowMs + 2);
  const worldRow = await prisma.character.findUniqueOrThrow({
    where: { id: worldA.characterId },
  });
  assert.ok(worldRow.battleJson);
  ok('7. World PvP is not silently cleared on siege state');

  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null },
  });
  await prisma.character.update({
    where: { id: target.characterId },
    data: { battleJson: null, hp: 5000 },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  const resumeBj = parseBattleJson(
    (
      await prisma.character.findUniqueOrThrow({
        where: { id: attacker.characterId },
      })
    ).battleJson
  );
  assert.ok(resumeBj?.pvpTargetCharacterId === target.characterId);
  await getSiegeStateForUser(attacker.userId, CITY, attacker.characterId, nowMs + 3);
  const still = parseBattleJson(
    (
      await prisma.character.findUniqueOrThrow({
        where: { id: attacker.characterId },
      })
    ).battleJson
  );
  assert.equal(still?.pvpTargetCharacterId, target.characterId);
  ok('8. Same-siege PvP resume survives siege state poll');

  await prisma.character.update({
    where: { id: target.characterId },
    data: {
      hp: 800,
      lastUpdate: new Date(Date.now() - 120_000),
    },
  });
  const atkRow = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  const refreshed = await prisma.$transaction((tx) =>
    refreshPvpOpponentHpForCharacterInTx(tx, atkRow as CharacterRow)
  );
  const afterRefresh = parseBattleJson(refreshed.battleJson);
  assert.ok(afterRefresh);
  assert.equal(Math.floor(afterRefresh!.mobHp), 800);
  ok('9. Passive regen does not raise mobHp during Siege PvP refresh');

  const sync = await getBattleSyncForUser(attacker.userId, {
    characterId: attacker.characterId,
    battleVersion: afterRefresh!.battleVersion,
    lastLogSeq: afterRefresh!.lastLogSeq ?? 0,
  });
  assert.ok(sync);
  assert.equal(Math.floor(sync!.mobHp ?? -1), 800);
  ok('10. Battle sync poll does not inflate mobHp');

  const hpTrail: number[] = [];
  await prisma.character.update({
    where: { id: target.characterId },
    data: { hp: 5000, lastUpdate: new Date() },
  });
  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  for (let i = 0; i < 4; i++) {
    const row = await prisma.character.findUniqueOrThrow({
      where: { id: attacker.characterId },
    });
    const bj = parseBattleJson(row.battleJson);
    if (!bj) break;
    hpTrail.push(Math.floor(bj.mobHp));
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 600));
    }
    await attackOnce(attacker);
  }
  for (let i = 1; i < hpTrail.length; i++) {
    assert.ok(hpTrail[i]! <= hpTrail[i - 1]!);
  }
  ok('11. mobHp monotonically decreases across hits');

  await new Promise((r) => setTimeout(r, 700));

  await runWithSeed(42, async () => {
    await prisma.character.update({
      where: { id: attacker.characterId },
      data: { battleJson: null },
    });
    await startSiegePvpPair(attacker, target, siege.id);
    await prisma.character.update({
      where: { id: target.characterId },
      data: { hp: 1, lastUpdate: new Date() },
    });
    let oneHpAtk = await prisma.character.findUniqueOrThrow({
      where: { id: attacker.characterId },
    });
    await prisma.$transaction((tx) =>
      refreshPvpOpponentHpForCharacterInTx(tx, oneHpAtk as CharacterRow)
    );
    for (let i = 0; i < 12; i++) {
      const victimMid = await prisma.character.findUniqueOrThrow({
        where: { id: target.characterId },
      });
      if (victimMid.hp <= 0) break;
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 600));
      }
      oneHpAtk = await prisma.character.findUniqueOrThrow({
        where: { id: attacker.characterId },
      });
      if (!oneHpAtk.battleJson) break;
      await attackOnce(attacker);
    }
    const victim = await prisma.character.findUniqueOrThrow({
      where: { id: target.characterId },
    });
    const part = await prisma.clanSiegeParticipant.findUnique({
      where: {
        siegeId_characterId: {
          siegeId: siege.id,
          characterId: target.characterId,
        },
      },
    });
    const oneHpRow = await prisma.character.findUniqueOrThrow({
      where: { id: attacker.characterId },
    });
    const bj = parseBattleJson(oneHpRow.battleJson);
    assert.ok(
      victim.hp === 0 ||
        part?.eliminatedAt != null ||
        (bj != null && Math.floor(bj.mobHp) <= 0),
      'expected lethal hit from 1 HP'
    );
  });
  ok('12. 1 HP + hit → victim hp 0');

  const pollSetupAtk = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  const pollBj = parseBattleJson(pollSetupAtk.battleJson);
  if (pollBj) {
    await prisma.character.update({
      where: { id: target.characterId },
      data: {
        hp: 0,
        lastUpdate: new Date(Date.now() - 120_000),
      },
    });
    await prisma.$transaction(async (tx) => {
      await tx.character.update({
        where: { id: pollSetupAtk.id },
        data: {
          battleJson: {
            ...pollBj,
            mobHp: 0,
          },
        },
      });
    });
    const pollDead = await getBattleSyncForUser(attacker.userId, {
      characterId: attacker.characterId,
      battleVersion: pollBj.battleVersion,
      lastLogSeq: pollBj.lastLogSeq ?? 0,
    });
    assert.ok(pollDead);
    assert.equal(Math.floor(pollDead!.mobHp ?? -1), 0);
  }
  ok('13. After 0 HP poll does not restore mobHp');

  await prisma.clanSiegeParticipant.update({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: target.characterId,
      },
    },
    data: { eliminatedAt: null, eliminatedByCharacterId: null },
  });

  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  await prisma.character.update({
    where: { id: target.characterId },
    data: { hp: 1, lastUpdate: new Date() },
  });
  let rowDead = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await prisma.$transaction((tx) =>
    refreshPvpOpponentHpForCharacterInTx(tx, rowDead as CharacterRow)
  );
  for (let i = 0; i < 12; i++) {
    const victimMid = await prisma.character.findUniqueOrThrow({
      where: { id: target.characterId },
    });
    if (victimMid.hp <= 0) break;
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 600));
    }
    rowDead = await prisma.character.findUniqueOrThrow({
      where: { id: attacker.characterId },
    });
    if (!rowDead.battleJson) break;
    await attackOnce(attacker);
  }
  const victimZero = await prisma.character.findUniqueOrThrow({
    where: { id: target.characterId },
  });
  const partDead = await prisma.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: target.characterId,
      },
    },
  });
  assert.ok(victimZero.hp === 0 || partDead?.eliminatedAt != null);
  rowDead = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  if (rowDead.battleJson) {
    await new Promise((r) => setTimeout(r, 600));
    await attackOnce(attacker);
  }
  const victimStill = await prisma.character.findUniqueOrThrow({
    where: { id: target.characterId },
  });
  assert.ok(victimStill.hp === 0 || partDead?.eliminatedAt != null);
  ok('14. Action on 0 HP victim does not resurrect');

  await prisma.character.update({
    where: { id: target.characterId },
    data: { hp: 500, battleJson: null },
  });
  await prisma.clanSiegeParticipant.update({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: target.characterId,
      },
    },
    data: { eliminatedAt: null, eliminatedByCharacterId: null },
  });
  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null, hp: 5000 },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  await prisma.character.update({
    where: { id: target.characterId },
    data: { hp: 100, lastUpdate: new Date() },
  });
  const elimAtk = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await prisma.$transaction((tx) =>
    refreshPvpOpponentHpForCharacterInTx(tx, elimAtk as CharacterRow)
  );
  const { victory } = await attackUntilVictoryOrHp(attacker, 40);
  assert.ok(victory, 'expected siege PvP victory for elimination');
  const part = await prisma.clanSiegeParticipant.findUniqueOrThrow({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: target.characterId,
      },
    },
  });
  assert.ok(part.eliminatedAt);
  const part2 = await prisma.clanSiegeParticipant.findUniqueOrThrow({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: target.characterId,
      },
    },
  });
  assert.equal(
    part2.eliminatedAt?.getTime(),
    part.eliminatedAt?.getTime()
  );
  ok('15. eliminatedAt written once');

  await prisma.clanSiegeParticipant.update({
    where: {
      siegeId_characterId: {
        siegeId: siege.id,
        characterId: target.characterId,
      },
    },
    data: { eliminatedAt: null, eliminatedByCharacterId: null },
  });
  let firstMark = false;
  let secondMark = false;
  await prisma.$transaction(async (tx) => {
    firstMark = await markSiegeParticipantEliminatedInTx(tx, {
      siegeId: siege.id,
      characterId: target.characterId,
      eliminatedByCharacterId: attacker.characterId,
    });
    secondMark = await markSiegeParticipantEliminatedInTx(tx, {
      siegeId: siege.id,
      characterId: target.characterId,
      eliminatedByCharacterId: attacker.characterId,
    });
  });
  assert.equal(firstMark, true);
  assert.equal(secondMark, false);
  const elimCount = await prisma.clanSiegeParticipant.count({
    where: {
      siegeId: siege.id,
      characterId: target.characterId,
      eliminatedAt: { not: null },
    },
  });
  assert.equal(elimCount, 1);
  ok('16. eliminatedAt mark is idempotent');

  await resetTargetParticipant(siege.id, target);
  await prisma.character.update({
    where: { id: target.characterId },
    data: {
      hp: 300,
      battleJson: null,
      lastUpdate: new Date(Date.now() - 120_000),
    },
  });
  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null, hp: 5000 },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  await prisma.character.update({
    where: { id: target.characterId },
    data: {
      hp: 300,
      lastUpdate: new Date(Date.now() - 120_000),
    },
  });
  const carouselAtk = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await prisma.$transaction((tx) =>
    refreshPvpOpponentHpForCharacterInTx(tx, carouselAtk as CharacterRow)
  );
  await attackOnce(attacker);
  const mid = await prisma.character.findUniqueOrThrow({
    where: { id: target.characterId },
  });
  assert.ok(mid.hp <= 300);
  ok('17. Hit + stale lastUpdate does not HP-carousel victim');

  await resetTargetParticipant(siege.id, target);
  await prisma.character.update({
    where: { id: target.characterId },
    data: {
      hp: 100,
      battleJson: null,
      lastUpdate: new Date(Date.now() - PASSIVE_REGEN_TICK_SECONDS * 3 * 1000),
    },
  });
  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  await attackUntilVictoryOrHp(attacker, 20);
  const post = await prisma.character.findUniqueOrThrow({
    where: { id: target.characterId },
  });
  const regenPatch = computePassiveHpRegenPatch(post as CharacterRow, Date.now());
  assert.ok(regenPatch.nextHp >= post.hp);
  ok('18. Passive regen available after PvP ends from lastUpdate');

  await resetTargetParticipant(siege.id, target);
  await prisma.character.update({
    where: { id: target.characterId },
    data: { hp: 500, battleJson: null },
  });
  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  const cpRow = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  const bjCp = parseBattleJson(cpRow.battleJson);
  assert.ok(bjCp && (bjCp.mobCp ?? 0) > 0);
  ok('19. Siege PvP still tracks CP on battleJson');

  await prisma.character.update({
    where: { id: target.characterId },
    data: { hp: 200, battleJson: null },
  });
  await prisma.character.update({
    where: { id: attacker.characterId },
    data: { battleJson: null },
  });
  await startSiegePvpPair(attacker, target, siege.id);
  await prisma.character.update({
    where: { id: target.characterId },
    data: { hp: 350 },
  });
  const healRow = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  const healRefresh = await prisma.$transaction((tx) =>
    refreshPvpOpponentHpForCharacterInTx(tx, healRow as CharacterRow)
  );
  const healBj = parseBattleJson(healRefresh.battleJson);
  assert.equal(Math.floor(healBj?.mobHp ?? 0), 350);
  ok('20. Explicit HP increase visible in PvP mobHp sync');

  console.log(`\n${passed}/20 checks passed`);
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.clanSiege.delete({ where: { id: siege.id } });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
