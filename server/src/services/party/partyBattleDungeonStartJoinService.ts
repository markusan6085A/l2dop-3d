import { Prisma } from '@prisma/client';
import type { SevenSignsDungeonMobSpawn } from '../../data/sevenSignsDungeonMobSpawns.js';
import { mobMaxCpFromMobMaxHp } from '../../data/wrathSkillConstants.js';
import {
  mobCombatFromSpawn,
  type BattleJsonState,
  jsonFiniteNum,
} from '../../domain/battle.js';
import { applyRiposteReflectToBattleMods } from '../../domain/riposteStance.js';
import {
  assertDungeonSessionMatchesMob,
  buildDungeonMovementStopState,
  isWithinDungeonPartyBattleRadius,
  resolveLiveDungeonMapPosition,
} from '../../domain/partyBattlePlayfield.js';
import { assertCharacterCanAttackRaidBoss } from '../../domain/raidBossLevelRestriction.js';
import { dungeonMobSpawnToMapWorldSpawn } from '../../data/sevenSignsDungeonMobSpawns.js';
import { throwIfPartyBattleRouteBlocked } from '../../domain/partyBattleFlags.js';
import {
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from '../charService.js';
import { ensureClanHallOnRow } from '../charClientSnapshot.js';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../../data/l2dopCombatFormulas.js';
import { parseInventory } from '../../data/inventory.js';
import { computeVitals } from '../../data/l2dopVitals.js';
import { levelFromTotalExp } from '../../data/l2dopExpgain.js';
import { parseSkillsLearnedJson } from '../skillLearnService.js';
import { serializeBattleJsonForDb } from '../battleServiceBattleBuffs.js';
import {
  battleViewFromState,
  skillCooldownUiContextFromRow,
} from '../battleServiceBattleUi.js';
import type { BattleView } from '../battleServiceTypes.js';
import { persistableActiveBuffsFromJson } from '../../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../../data/skillCooldowns.js';
import { mutateCharacterWithRevision } from '../characterMutation.js';
import { lockPartyForUpdateInTx } from './partyLock.js';
import {
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../../domain/partyBattleSessionConstants.js';
import {
  createActivePartyBattleSessionInTx,
  endPartyBattleSessionInTx,
  findActivePartyBattleSessionByPartyIdInTx,
  joinPartyBattleParticipantInTx,
} from './partyBattleSessionService.js';
import {
  parseDungeonStateJson,
} from '../../domain/dungeonState.js';
import { dungeonStateToJson } from '../../domain/dungeonMoveLogic.js';
import { resolveDungeonMovementPatch } from '../../domain/dungeonMapMovement.js';
import { resolveDungeonMoveSpeedStatsForRow } from '../../domain/dungeonRunSpeed.js';
import type { Prisma as PrismaTypes, PartyBattleSession } from '@prisma/client';

type Tx = PrismaTypes.TransactionClient;

function randomMobRetaliationWindowHits(): number {
  return 1 + Math.floor(Math.random() * 3);
}

type ResolveDungeonPartyBattleSessionArgs = {
  partyId: string;
  dungeonMob: SevenSignsDungeonMobSpawn;
  spawn: import('../../data/mapWorldSpawns.js').MapWorldSpawn;
  mobMaxHp: number;
  starterCharacterId: string;
  nowMs: number;
};

/**
 * Кожен dungeon start/hunt-continue: актуальна active session для цієї цілі
 * або нова session. Стару active session з іншим spawnId завершуємо (superseded).
 */
async function resolveOrCreateDungeonPartyBattleSessionInTx(
  tx: Tx,
  args: ResolveDungeonPartyBattleSessionArgs
): Promise<PartyBattleSession> {
  let session = await findActivePartyBattleSessionByPartyIdInTx(tx, args.partyId);
  if (session) {
    if (session.spawnId === args.dungeonMob.id) {
      assertDungeonSessionMatchesMob(session, args.dungeonMob);
      await joinPartyBattleParticipantInTx(tx, {
        sessionId: session.id,
        characterId: args.starterCharacterId,
        nowMs: args.nowMs,
      });
      return tx.partyBattleSession.findUniqueOrThrow({ where: { id: session.id } });
    }
    if (
      session.playfield === 'dungeon' &&
      session.dungeonId === args.dungeonMob.dungeonId
    ) {
      await endPartyBattleSessionInTx(tx, {
        sessionId: session.id,
        terminalState: PARTY_BATTLE_SESSION_STATE.ended,
        endReason: PARTY_BATTLE_END_REASON.superseded,
        nowMs: args.nowMs,
      });
      session = null;
    } else {
      throw new Error('party_battle_wrong_spawn');
    }
  }

  if (!session) {
    try {
      session = await createActivePartyBattleSessionInTx(tx, {
        partyId: args.partyId,
        spawnId: args.dungeonMob.id,
        canonicalMobTemplateId: args.spawn.templateId ?? args.dungeonMob.id,
        playfield: 'dungeon',
        dungeonId: args.dungeonMob.dungeonId,
        mobMapX: args.dungeonMob.mapX,
        mobMapY: args.dungeonMob.mapY,
        mobMaxHp: args.mobMaxHp,
        starterCharacterId: args.starterCharacterId,
        nowMs: args.nowMs,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'party_battle_session_already_active'
      ) {
        session = await findActivePartyBattleSessionByPartyIdInTx(tx, args.partyId);
        if (!session || session.spawnId !== args.dungeonMob.id) {
          throw new Error('party_battle_wrong_spawn');
        }
        assertDungeonSessionMatchesMob(session, args.dungeonMob);
        await joinPartyBattleParticipantInTx(tx, {
          sessionId: session.id,
          characterId: args.starterCharacterId,
          nowMs: args.nowMs,
        });
      } else {
        throw err;
      }
    }
  }

  if (!session) throw new Error('party_battle_session_not_found');
  return session;
}

export type DungeonPartyBattleStartJoinArgs = {
  userId: string;
  char: CharacterRow;
  dungeonMob: SevenSignsDungeonMobSpawn;
  expectedRevision: number;
  partyId: string;
  wTick: ReturnType<
    typeof import('../../domain/worldCombatState.js').tickWorldCombatState
  > | null;
  nowStartMs: number;
};

/**
 * Party → Session → Character. Seven Signs dungeon mobs (regular only).
 */
export async function startOrJoinDungeonPartyBattleInTx(
  tx: Tx,
  args: DungeonPartyBattleStartJoinArgs
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  throwIfPartyBattleRouteBlocked();

  if (args.dungeonMob.kind === 'raid') {
    const effLv = levelFromTotalExp(args.char.exp);
    assertCharacterCanAttackRaidBoss(effLv, args.dungeonMob.level);
  }

  const spawn =
    dungeonMobSpawnToMapWorldSpawn(args.dungeonMob) ??
    ({
      id: args.dungeonMob.id,
      worldX: 0,
      worldY: 0,
      templateId: String(args.dungeonMob.npcId),
      name: args.dungeonMob.name,
      level: args.dungeonMob.level,
      kind: args.dungeonMob.kind === 'raid' ? 'raid' : args.dungeonMob.aggressive ? 'aggressive' : 'passive',
      aggressive: args.dungeonMob.kind === 'raid' ? true : args.dungeonMob.aggressive,
    } as import('../../data/mapWorldSpawns.js').MapWorldSpawn);

  const mc = mobCombatFromSpawn(spawn);
  const livePos = resolveLiveDungeonMapPosition(args.char, args.nowStartMs);
  if (!livePos || livePos.dungeonId !== args.dungeonMob.dungeonId) {
    throw new Error('battle_too_far');
  }
  if (
    !isWithinDungeonPartyBattleRadius(
      livePos.mapX,
      livePos.mapY,
      args.dungeonMob.mapX,
      args.dungeonMob.mapY
    )
  ) {
    throw new Error('battle_too_far');
  }

  const lockedParty = await lockPartyForUpdateInTx(tx, args.partyId);
  if (!lockedParty) throw new Error('party_not_found');

  const session = await resolveOrCreateDungeonPartyBattleSessionInTx(tx, {
    partyId: args.partyId,
    dungeonMob: args.dungeonMob,
    spawn,
    mobMaxHp: mc.maxHp,
    starterCharacterId: args.char.id,
    nowMs: args.nowStartMs,
  });

  if (
    !isWithinDungeonPartyBattleRadius(
      livePos.mapX,
      livePos.mapY,
      session.mobMapX ?? args.dungeonMob.mapX,
      session.mobMapY ?? args.dungeonMob.mapY
    )
  ) {
    throw new Error('battle_too_far');
  }

  const mobHpStart = session.mobHp;
  const mobMaxCp0 = mobMaxCpFromMobMaxHp(mc.maxHp);
  const startLog = [
    'Бій розпочато: [' + spawn.name + '] (ур. ' + spawn.level + ').',
    'Паті-бій: спільне HP монстра.',
  ];

  const inv0 = parseInventory(args.char.inventoryJson);
  const effLv0 = levelFromTotalExp(args.char.exp);
  const combat0 = computeCombatStats(
    effLv0,
    args.char.race,
    args.char.classBranch,
    inv0,
    combatOptsFromRow(args.char)
  );
  const vit0 = computeVitals(
    effLv0,
    args.char.race,
    args.char.classBranch,
    combat0.con,
    combat0.men
  );
  const maxMp0 = effectiveMaxMpWithJewelFlat(vit0.maxMp, combat0);

  const mobCpStart =
    mobHpStart >= mc.maxHp
      ? mobMaxCp0
      : Math.max(
          0,
          Math.min(mobMaxCp0, Math.floor((mobMaxCp0 * mobHpStart) / mc.maxHp))
        );

  const st: BattleJsonState = {
    spawnId: args.dungeonMob.id,
    partyBattleId: session.id,
    mobHp: mobHpStart,
    mobMaxHp: mc.maxHp,
    mobCp: mobCpStart,
    mobMaxCp: mobMaxCp0,
    mobPAtk: mc.pAtk,
    mobPDef: mc.pDef,
    mobMAtk: mc.mAtk,
    mobMDef: mc.mDef,
    mobEvasion: mc.evasion,
    log: startLog,
    battleVersion: session.battleVersion,
    lastLogSeq: startLog.length,
    playerMp: args.wTick ? args.wTick.playerMp : maxMp0,
    lastRegenTickMs: args.nowStartMs,
    lastPlayerAttackAtMs: args.nowStartMs,
    mobHitsUntilRetaliation: randomMobRetaliationWindowHits(),
  };

  if (args.wTick?.battleMods) {
    const bm = { ...args.wTick.battleMods };
    applyRiposteReflectToBattleMods(bm);
    st.battleMods = bm;
  }
  if (
    args.wTick?.battleModsExpiresAtMsBySkillId &&
    Object.keys(args.wTick.battleModsExpiresAtMsBySkillId).length > 0
  ) {
    st.battleModsExpiresAtMsBySkillId = {
      ...args.wTick.battleModsExpiresAtMsBySkillId,
    };
  }
  if (typeof args.wTick?.sonicCharges === 'number' && args.wTick.sonicCharges > 0) {
    st.sonicCharges = Math.floor(args.wTick.sonicCharges);
  }
  if (
    typeof args.wTick?.maxSonicCharges === 'number' &&
    args.wTick.maxSonicCharges > 0
  ) {
    st.maxSonicCharges = Math.floor(args.wTick.maxSonicCharges);
  }
  const wcSync = args.wTick?.battleMods
    ? jsonFiniteNum(args.wTick.battleMods.warCryPatkMul)
    : undefined;
  if (wcSync !== undefined && wcSync > 1) {
    st.warCryPatkMul = wcSync;
  }

  const dStateRaw = parseDungeonStateJson(args.char.dungeonStateJson);
  if (!dStateRaw || dStateRaw.dungeonId !== args.dungeonMob.dungeonId) {
    throw new Error('battle_too_far');
  }
  const speed = resolveDungeonMoveSpeedStatsForRow(args.char, args.nowStartMs);
  const liveDungeon = resolveDungeonMovementPatch(
    dStateRaw,
    speed.mapMoveSpeedPx,
    args.nowStartMs
  ).state;
  const stoppedDungeon = buildDungeonMovementStopState(liveDungeon);

  const result = await mutateCharacterWithRevision(
    tx,
    args.char.id,
    args.expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: args.char.hp,
        dungeonStateJson: dungeonStateToJson(stoppedDungeon),
        battleJson: serializeBattleJsonForDb(st),
        worldCombatStateJson: Prisma.JsonNull,
      },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);

  const row = result.character as CharacterRow;
  const rowReady = await ensureClanHallOnRow(row, tx);
  const snap = toSnapshot(rowReady);
  const prof0 =
    typeof args.char.l2Profession === 'string' && args.char.l2Profession.trim()
      ? args.char.l2Profession.trim()
      : 'human_fighter';
  const learned0 = parseSkillsLearnedJson(
    args.char.skillsLearnedJson,
    prof0,
    args.char.race,
    args.char.classBranch
  );
  const view = battleViewFromState(
    args.dungeonMob.id,
    st,
    {
      name: spawn.name,
      level: spawn.level,
      aggressive: spawn.aggressive,
      kind: spawn.kind,
    },
    effLv0,
    args.char.race,
    args.char.classBranch,
    learned0,
    prof0,
    inv0,
    persistableActiveBuffsFromJson(row.activeBuffsJson, Date.now()),
    parseSkillCooldowns(row.skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromRow(args.char, effLv0, snap.learnedBattleSkillsDetail)
  );
  return { character: snap, battle: view };
}
