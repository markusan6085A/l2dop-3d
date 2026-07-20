import { Prisma } from '@prisma/client';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';
import { getDungeonMobSpawnById } from '../data/sevenSignsDungeonMobSpawns.js';
import { findSevenSignsDungeonById } from '../data/sevenSignsDungeons.js';
import { resolveBattleSpawnMeta, isPvpBattleJson } from '../domain/battlePvpContext.js';
import {
  dungeonMobBattleDistancePx,
  DUNGEON_BATTLE_RANGE_PX,
} from '../domain/dungeonNearbyMobsQuery.js';
import { resolveDungeonMovementPatch } from '../domain/dungeonMapMovement.js';
import { parseDungeonStateJson } from '../domain/dungeonState.js';
import { resolveDungeonMoveSpeedStatsForRow } from '../domain/dungeonRunSpeed.js';
import { isWithinMapNearbyHeroRadius } from '../domain/mapNearbyRadius.js';
import { findPvpIncomingForCharacter } from './pvpIncomingService.js';
import type { PvpIncomingAttack } from './pvpIncomingService.js';
import { mobMaxCpFromMobMaxHp } from '../data/wrathSkillConstants.js';
import {
  BATTLE_RANGE,
  jsonFiniteNum,
  type BattleJsonState,
  mobCombatFromSpawn,
} from '../domain/battle.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
  worldCombatStateFromBattleJson,
} from '../domain/worldCombatState.js';
import { applyRiposteReflectToBattleMods } from '../domain/riposteStance.js';
import { assertCharacterCanAttackRaidBoss } from '../domain/raidBossLevelRestriction.js';
import { prisma } from '../lib/prisma.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot, ensureClanHallOnRow } from './charClientSnapshot.js';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { parseInventory } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { parseSkillsLearnedJson } from './skillLearnService.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { battleViewFromState, resolvePvpTargetClanEmblemId, skillCooldownUiContextFromRow } from './battleServiceBattleUi.js';
import type { BattleView } from './battleServiceTypes.js';
import { applyCharacterReadView } from './charReadView.js';
import { findCharacterForUser, findCharacterForUserInTx } from './charResolveForUser.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import {
  mergeMobSpawnHpEntry,
  mobSpawnHpFromBattleJson,
  parseMobSpawnHpState,
  resolveMobHpAtSpawnStart,
  serializeMobSpawnHpState,
} from '../domain/mobSpawnHpState.js';
import {
  isMobSpawnOnRespawn,
  isRegularMobRespawnKind,
} from '../domain/mobSpawnRespawn.js';
import {
  ensureWorldBossSessionInTx,
  isSharedWorldBossKind,
  loadWorldBossSessionMobHp,
  clampSharedWorldBossMobHp,
  readWorldBossSessionState,
  recordWorldBossBattlePresenceInTx,
} from './worldBossSessionService.js';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import {
  shouldStartPartyBattleInTx,
  startOrJoinPartyBattleInTx,
} from './party/partyBattleStartJoinService.js';
import { startOrJoinDungeonPartyBattleInTx } from './party/partyBattleDungeonStartJoinService.js';

function randomMobRetaliationWindowHits(): number {
  return 1 + Math.floor(Math.random() * 3);
}


export async function startBattleInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  spawnId: string,
  expectedRevision: number,
  opts?: { characterId?: string | null }
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  const spawn = getWorldSpawnById(spawnId);
  if (!spawn) {
    throw new Error('battle_spawn_unknown');
  }

  const mc = mobCombatFromSpawn(spawn);
  const startLog = [
    'Бій розпочато: [' + spawn.name + '] (ур. ' + spawn.level + ').',
  ];

  const char = await findCharacterForUserInTx(tx, userId, {
    characterId: opts?.characterId,
    battleSpawnId: spawnId,
    include: { clan: { select: { name: true, hallBlessingAt: true, level: true } } },
  });
  if (!char) throw new Error('no_character');
  if (parsePvePendingDefeat((char as CharacterRow).pvePendingDefeatJson)) {
    throw new Error('pve_defeat_pending');
  }
  const cr0 = await ensureClanHallOnRow(char as CharacterRow, tx);
  const base = resolveMapMovement(applyPassiveHpRegen(cr0));

  const dungeonMob = getDungeonMobSpawnById(spawnId);
  if (dungeonMob) {
    const dungeon = findSevenSignsDungeonById(dungeonMob.dungeonId);
    if (
      !dungeon ||
      !isWithinMapNearbyHeroRadius(
        base.worldX,
        base.worldY,
        dungeon.worldX,
        dungeon.worldY
      )
    ) {
      throw new Error('battle_too_far');
    }
    const dState = parseDungeonStateJson(base.dungeonStateJson);
    if (!dState || dState.dungeonId !== dungeonMob.dungeonId) {
      throw new Error('battle_too_far');
    }
    const speed = resolveDungeonMoveSpeedStatsForRow(base, Date.now());
    const live = resolveDungeonMovementPatch(
      dState,
      speed.mapMoveSpeedPx,
      Date.now()
    ).state;
    const distPx = dungeonMobBattleDistancePx(
      dungeonMob,
      live.mapX,
      live.mapY
    );
    if (distPx > DUNGEON_BATTLE_RANGE_PX) {
      throw new Error('battle_too_far');
    }
  } else {
    const distAtCommit = Math.hypot(
      base.worldX - spawn.worldX,
      base.worldY - spawn.worldY
    );
    if (distAtCommit > BATTLE_RANGE) {
      throw new Error('battle_too_far');
    }
  }
  const inv0 = parseInventory(base.inventoryJson);
  const effLv0 = levelFromTotalExp(base.exp);
  const raidBossLevel =
    spawn.kind === 'raid'
      ? spawn.level
      : dungeonMob?.kind === 'raid'
        ? dungeonMob.level
        : null;
  if (raidBossLevel != null) {
    const existingBj = parseBattleJson(base.battleJson);
    const rejoinSameRaid = existingBj?.spawnId === spawnId;
    if (!rejoinSameRaid) {
      assertCharacterCanAttackRaidBoss(effLv0, raidBossLevel);
    }
  }
  const combat0 = computeCombatStats(
    effLv0,
    base.race,
    base.classBranch,
    inv0,
    combatOptsFromRow(base)
  );
  const vit0 = computeVitals(
    effLv0,
    base.race,
    base.classBranch,
    combat0.con,
    combat0.men
  );
  const maxMp0 = effectiveMaxMpWithJewelFlat(vit0.maxMp, combat0);

  const wTick = tickWorldCombatState(
    parseWorldCombatState(base.worldCombatStateJson),
    maxMp0,
    Date.now(),
    combat0.regenMp
  );

  const nowStartMs = Date.now();
  const partyStart = await shouldStartPartyBattleInTx(
    tx,
    base.id,
    spawn.kind,
    dungeonMob != null,
    dungeonMob?.kind === 'raid'
  );
  if (partyStart?.dungeon && dungeonMob) {
    return startOrJoinDungeonPartyBattleInTx(tx, {
      userId,
      char: base,
      dungeonMob,
      expectedRevision,
      partyId: partyStart.partyId,
      wTick,
      nowStartMs,
    });
  }
  if (partyStart) {
    return startOrJoinPartyBattleInTx(tx, {
      userId,
      char: base,
      spawn,
      expectedRevision,
      partyId: partyStart.partyId,
      wTick,
      nowStartMs,
    });
  }

  const mobMaxCp0 = mobMaxCpFromMobMaxHp(mc.maxHp);
  const spawnHpState = parseMobSpawnHpState(base.mobSpawnHpJson, nowStartMs);
  if (
    isRegularMobRespawnKind(spawn.kind) &&
    isMobSpawnOnRespawn(spawnHpState, spawnId, nowStartMs)
  ) {
    throw new Error('mob_on_respawn');
  }
  const mobHpStartRaw = resolveMobHpAtSpawnStart(
    spawnHpState,
    spawnId,
    mc.maxHp
  );
  let mobHpStart = mobHpStartRaw;
  let worldBossSpawnGeneration: number | undefined;
  if (isSharedWorldBossKind(spawn.kind)) {
    const session = await ensureWorldBossSessionInTx(
      tx,
      spawn,
      mobHpStartRaw,
      nowStartMs
    );
    mobHpStart = session.mobHp;
    worldBossSpawnGeneration = Math.max(
      1,
      Math.floor(Number(session.spawnGeneration) || 1)
    );
    await recordWorldBossBattlePresenceInTx(
      tx,
      spawn.id,
      base.id,
      nowStartMs
    );
  }
  if (mobHpStart < mc.maxHp) {
    startLog.push(
      'Моб ще поранений: HP ' + mobHpStart + ' / ' + mc.maxHp + '.'
    );
  }
  const mobCpStart =
    mobHpStart >= mc.maxHp
      ? mobMaxCp0
      : Math.max(
          0,
          Math.min(
            mobMaxCp0,
            Math.floor((mobMaxCp0 * mobHpStart) / mc.maxHp)
          )
        );
  const st: BattleJsonState = {
    spawnId,
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
    battleVersion: 1,
    lastLogSeq: startLog.length,
    playerMp: wTick ? wTick.playerMp : maxMp0,
    lastRegenTickMs: nowStartMs,
    lastPlayerAttackAtMs: nowStartMs,
    mobHitsUntilRetaliation: randomMobRetaliationWindowHits(),
    ...(worldBossSpawnGeneration != null
      ? { worldBossSpawnGeneration }
      : {}),
  };
  if (wTick?.battleMods) {
    const bm = { ...wTick.battleMods };
    applyRiposteReflectToBattleMods(bm);
    st.battleMods = bm;
  }
  if (
    wTick?.battleModsExpiresAtMsBySkillId &&
    Object.keys(wTick.battleModsExpiresAtMsBySkillId).length > 0
  ) {
    st.battleModsExpiresAtMsBySkillId = {
      ...wTick.battleModsExpiresAtMsBySkillId,
    };
  }
  if (
    typeof wTick?.sonicCharges === 'number' &&
    wTick.sonicCharges > 0
  ) {
    st.sonicCharges = Math.floor(wTick.sonicCharges);
  }
  if (
    typeof wTick?.maxSonicCharges === 'number' &&
    wTick.maxSonicCharges > 0
  ) {
    st.maxSonicCharges = Math.floor(wTick.maxSonicCharges);
  }
  const wcSync = wTick?.battleMods
    ? jsonFiniteNum(wTick.battleMods.warCryPatkMul)
    : undefined;
  if (wcSync !== undefined && wcSync > 1) {
    st.warCryPatkMul = wcSync;
  }

  const freezeX = base.worldX;
  const freezeY = base.worldY;
  const result = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: base.hp,
        worldX: freezeX,
        worldY: freezeY,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: freezeX,
        moveFromY: freezeY,
        battleJson: serializeBattleJsonForDb(st),
        worldCombatStateJson: Prisma.JsonNull,
      },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  const row = result.character as CharacterRow;
  const rowReady = await ensureClanHallOnRow(row, tx);
  const snap = toSnapshot(rowReady);
  const crSt = base;
  const prof0 =
    typeof crSt.l2Profession === 'string' && crSt.l2Profession.trim()
      ? crSt.l2Profession.trim()
      : 'human_fighter';
  const learned0 = parseSkillsLearnedJson(
    base.skillsLearnedJson,
    prof0,
    base.race,
    base.classBranch
  );
  const view = battleViewFromState(
    spawnId,
    st,
    {
      name: spawn.name,
      level: spawn.level,
      aggressive: spawn.aggressive,
      kind: spawn.kind,
    },
    effLv0,
    base.race,
    base.classBranch,
    learned0,
    prof0,
    parseInventory(base.inventoryJson),
    persistableActiveBuffsFromJson(row.activeBuffsJson, Date.now()),
    parseSkillCooldowns(row.skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromRow(
      base,
      effLv0,
      snap.learnedBattleSkillsDetail
    )
  );
  return { character: snap, battle: view };
}

export async function startBattle(
  userId: string,
  spawnId: string,
  expectedRevision: number,
  opts?: { characterId?: string | null }
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  return prisma.$transaction(async (tx) =>
    startBattleInTx(tx, userId, spawnId, expectedRevision, opts)
  );
}

export type BattleStateQuery = {
  characterId?: string | null;
  battleSpawnId?: string | null;
};

export async function getBattleState(
  userId: string,
  query?: BattleStateQuery
): Promise<{
  character: CharacterSnapshot;
  battle: BattleView | null;
  pvpIncoming: PvpIncomingAttack | null;
} | null> {
  /**
   * Read-only resync (F5 / 409): без flush RB, PvP refresh, без write у БД.
   */
  let row = (await findCharacterForUser(userId, {
    characterId: query?.characterId,
    battleSpawnId: query?.battleSpawnId,
    include: { clan: { select: { name: true, hallBlessingAt: true, level: true } } },
  })) as CharacterRow | null;
  if (!row) return null;
  row = applyCharacterReadView(row);
  const snap = await buildCharacterClientSnapshot(row as CharacterRow, userId);
  const pvpIncoming = await findPvpIncomingForCharacter(snap.id);
  if (snap.pveDefeat || snap.pvpDefeat) {
    return { character: snap, battle: null, pvpIncoming };
  }
  const bjRaw = parseBattleJson((row as CharacterRow).battleJson);
  if (!bjRaw) return { character: snap, battle: null, pvpIncoming };
  const spawnMeta = resolveBattleSpawnMeta(bjRaw);
  if (!spawnMeta) return { character: snap, battle: null, pvpIncoming };
  let bj = bjRaw;
  if (isSharedWorldBossKind(spawnMeta.kind)) {
    const session = await readWorldBossSessionState(bjRaw.spawnId);
    if (session) {
      bj = {
        ...bjRaw,
        mobHp: clampSharedWorldBossMobHp(bjRaw.mobMaxHp, session.mobHp),
        worldBossSpawnGeneration: Math.max(
          1,
          Math.floor(Number(session.spawnGeneration) || 1)
        ),
      };
    } else {
      bj = {
        ...bjRaw,
        mobHp: 0,
      };
    }
  }
  const cr = row as CharacterRow;
  const prof =
    typeof cr.l2Profession === 'string' && cr.l2Profession.trim()
      ? cr.l2Profession.trim()
      : 'human_fighter';
  const learned = parseSkillsLearnedJson(
    (row as CharacterRow).skillsLearnedJson,
    prof,
    row.race,
    row.classBranch
  );
  const pvpEmblemId = isPvpBattleJson(bj)
    ? await resolvePvpTargetClanEmblemId(bj)
    : null;
  const view = battleViewFromState(
    bj.spawnId,
    bj,
    {
      name: spawnMeta.name,
      level: spawnMeta.level,
      aggressive: spawnMeta.aggressive,
      kind: spawnMeta.kind,
      clanEmblemId: pvpEmblemId,
    },
    snap.level,
    row.race,
    row.classBranch,
    learned,
    prof,
    snap.inventory,
    persistableActiveBuffsFromJson(
      (row as CharacterRow).activeBuffsJson,
      Date.now()
    ),
    parseSkillCooldowns((row as CharacterRow).skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromRow(
      cr,
      snap.level,
      snap.learnedBattleSkillsDetail
    )
  );
  return { character: snap, battle: view, pvpIncoming };
}

export async function leaveBattle(
  userId: string,
  expectedRevision: number,
  opts?: { characterId?: string | null; battleSpawnId?: string | null }
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await findCharacterForUserInTx(tx, userId, {
      characterId: opts?.characterId,
      battleSpawnId: opts?.battleSpawnId,
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const cr = char as CharacterRow;
    const bj = parseBattleJson(cr.battleJson);
    const invL = parseInventory(cr.inventoryJson);
    const effLvL = levelFromTotalExp(char.exp);
    const combatL = computeCombatStats(
      effLvL,
      char.race,
      char.classBranch,
      invL,
      combatOptsFromRow(cr)
    );
    const vitL = computeVitals(
      effLvL,
      char.race,
      char.classBranch,
      combatL.con,
      combatL.men
    );
    const maxMpL = effectiveMaxMpWithJewelFlat(vitL.maxMp, combatL);
    const worldLeave =
      bj != null ? worldCombatStateFromBattleJson(bj, maxMpL, Date.now()) : null;

    /** Якщо бою вже немає (перемога очистила battleJson), не затирати світовий стан — там лишаються соски/заряди між боями. */
    let nextWorldJson: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      Prisma.JsonNull;
    if (worldLeave != null) {
      nextWorldJson = JSON.parse(JSON.stringify(worldLeave)) as Prisma.InputJsonValue;
    } else if (
      cr.worldCombatStateJson != null &&
      typeof cr.worldCombatStateJson === 'object'
    ) {
      nextWorldJson = cr.worldCombatStateJson as Prisma.InputJsonValue;
    }

    let nextMobSpawnHpJson: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      serializeMobSpawnHpState(parseMobSpawnHpState(cr.mobSpawnHpJson));
    const hpSnap = bj ? mobSpawnHpFromBattleJson(bj) : null;
    if (hpSnap && bj) {
      let persistMobHp = hpSnap.mobHp;
      const spawnMetaLeave = resolveBattleSpawnMeta(bj);
      if (spawnMetaLeave && isSharedWorldBossKind(spawnMetaLeave.kind)) {
        const sharedHp = await loadWorldBossSessionMobHp(tx, hpSnap.spawnId);
        if (sharedHp != null) {
          persistMobHp = clampSharedWorldBossMobHp(hpSnap.mobMaxHp, sharedHp);
        }
      }
      const merged = mergeMobSpawnHpEntry(
        parseMobSpawnHpState(cr.mobSpawnHpJson),
        hpSnap.spawnId,
        persistMobHp,
        hpSnap.mobMaxHp
      );
      nextMobSpawnHpJson = serializeMobSpawnHpState(merged);
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          battleJson: Prisma.JsonNull,
          worldCombatStateJson: nextWorldJson,
          mobSpawnHpJson: nextMobSpawnHpJson,
        },
      })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
