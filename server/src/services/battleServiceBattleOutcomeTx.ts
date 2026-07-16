import { Prisma } from '@prisma/client';
import {
  L2DOP_MAX_TOTAL_EXP_INCLUSIVE,
  levelFromTotalExp,
} from '../data/l2dopExpgain.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import type { InventoryState } from '../data/inventory.js';
import { parseInventory } from '../data/inventory.js';
import type { BattleJsonState } from '../domain/battle.js';
import { MAX_BATTLE_LOG } from '../domain/battle.js';
import {
  applyBattleLogWriteInPlace,
  bumpBattleVersionInPlace,
} from '../domain/battleVersion.js';
import { worldCombatStateFromBattleJson } from '../domain/worldCombatState.js';
import { rollKillLoot } from '../domain/killLoot.js';
import {
  incrementQuestKillOnVictory,
  parseQuestProgressJson,
  serializeQuestProgressJson,
} from '../domain/humanFighterFirstProfessionQuest.js';
import {
  applyDailyQuestMobKill,
  dailyQuestsJsonChanged,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
} from '../domain/dailyQuests.js';
import { isSharedWorldBossKind } from '../domain/worldBossSession.js';
import { resolveL2dopNpcIdByMobName } from './spawnCatalogService.js';
import {
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { nearestMapTown, resolveNearestTownTeleport } from '../data/mapLocalities.js';
import {
  serializePvePendingDefeat,
} from '../domain/pvePendingDefeat.js';
import type {
  BattleDefeatSummary,
  BattleVictorySummary,
} from './battleServiceTypes.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { buildBattleDeltaPayload } from './battleServiceDelta.js';
import type { BattleActionDeltaResponse } from './battleServiceDeltaTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import {
  clearMobSpawnHpEntry,
  mergeMobSpawnHpEntry,
  parseMobSpawnHpState,
  serializeMobSpawnHpState,
} from '../domain/mobSpawnHpState.js';
import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import {
  isRegularMobRespawnKind,
  mobRespawnMsForKind,
  setMobSpawnRespawnEntry,
} from '../domain/mobSpawnRespawn.js';
import { deleteWorldBossSession } from './worldBossSessionService.js';
import {
  countSameLevelHuntSpawnsNearby,
  findNextSameLevelHuntSpawn,
  HUNT_LEVEL_TOLERANCE,
} from '../domain/battleHuntChain.js';
import { MOB_KILL_KARMA_WASH } from '../domain/pvpKarma.js';
import type { NearbyExtraMobEconomyPatch } from './battleNearbyExtraMobLoot.js';
import { resolvedWorldPositionFromCharacterRow } from './mapAroundService.js';

type Tx = Prisma.TransactionClient;

export async function persistBattleVictoryInTx(
  tx: Tx,
  args: {
    userId: string;
    expectedRevision: number | null;
    char: CharacterRow;
    bj: { spawnId: string };
    spawn: { name: string; level: number; aggressive: boolean; kind: MapSpawnKind };
    inv: InventoryState;
    cr: CharacterRow;
    preLevel: number;
    playerHp: number;
    currentMp: number;
    st: BattleJsonState;
    log: string[];
    /** Якщо останній ход оновив self-buffs — записуємо разом з перемогою. */
    activeBuffsJson?: Prisma.InputJsonValue;
    /** Якщо останній ход пробудив новий кулдаун — персистимо його. */
    skillCooldownsJson?: Prisma.InputJsonValue;
    /** EXP/SP/адена за додаткові AoE-цілі в цьому ж ході (char.exp уже містить їхній EXP). */
    nearbyExtraEconomy?: NearbyExtraMobEconomyPatch;
  }
): Promise<{ character: CharacterSnapshot; victory: BattleVictorySummary }> {
  const {
    userId,
    expectedRevision,
    char,
    bj,
    spawn,
    inv,
    cr,
    preLevel,
    playerHp,
    currentMp,
    st,
    log,
    activeBuffsJson,
    skillCooldownsJson,
    nearbyExtraEconomy,
  } = args;

  const npcId = resolveL2dopNpcIdByMobName(spawn.name) ?? null;
  const loot = rollKillLoot(npcId, spawn.level, inv, {
    race: char.race,
    l2Profession: char.l2Profession,
    skillsLearnedJson: char.skillsLearnedJson,
  }, { spawnKind: spawn.kind, mobName: spawn.name });
  log.push('Перемога!');
  for (const line of loot.logLines) {
    log.push(line);
  }

  let newExp = char.exp + loot.expGain;
  if (newExp > L2DOP_MAX_TOTAL_EXP_INCLUSIVE) {
    newExp = L2DOP_MAX_TOTAL_EXP_INCLUSIVE;
  }
  const spGainTotal = loot.spGain + (nearbyExtraEconomy?.spIncrement ?? 0);
  const adenaGainTotal =
    loot.adena + (nearbyExtraEconomy?.adenaIncrement ?? BigInt(0));
  const mobsKilledTotal = 1 + (nearbyExtraEconomy?.mobsKilledIncrement ?? 0);
  const newLevel = levelFromTotalExp(newExp);
  const combatAfter = computeCombatStats(
    newLevel,
    char.race,
    char.classBranch,
    inv,
    combatOptsFromRow(cr)
  );
  const vitAfter = computeVitals(
    newLevel,
    char.race,
    char.classBranch,
    combatAfter.con,
    combatAfter.men
  );
  const maxHpAfter = effectiveMaxHpWithJewelFlat(
    vitAfter.maxHp,
    combatAfter
  );
  const maxMpAfter = effectiveMaxMpWithJewelFlat(
    vitAfter.maxMp,
    combatAfter
  );
  let nextHp: number;
  if (newLevel > preLevel) {
    nextHp = maxHpAfter;
    log.push('Рівень ' + newLevel + '!');
  } else {
    nextHp = Math.max(1, playerHp);
  }

  const stWorld: BattleJsonState = {
    ...st,
    playerMp: Math.min(maxMpAfter, currentMp),
  };
  const worldVictory = worldCombatStateFromBattleJson(
    stWorld,
    maxMpAfter,
    Date.now()
  );

  void userId;
  const nowVictoryMs = Date.now();
  const karmaBefore = Math.max(0, Math.floor(Number(char.karma) || 0));
  const karmaAfter =
    nearbyExtraEconomy?.karma != null
      ? Math.max(0, nearbyExtraEconomy.karma - MOB_KILL_KARMA_WASH)
      : Math.max(0, karmaBefore - MOB_KILL_KARMA_WASH);
  let mobHpAfterVictory = parseMobSpawnHpState(
    nearbyExtraEconomy?.mobSpawnHpJson ?? char.mobSpawnHpJson,
    nowVictoryMs
  );
  if (isRegularMobRespawnKind(spawn.kind)) {
    mobHpAfterVictory = setMobSpawnRespawnEntry(
      clearMobSpawnHpEntry(mobHpAfterVictory, bj.spawnId),
      bj.spawnId,
      nowVictoryMs + mobRespawnMsForKind(spawn.kind)
    );
  } else if (!isSharedWorldBossKind(spawn.kind)) {
    mobHpAfterVictory = clearMobSpawnHpEntry(mobHpAfterVictory, bj.spawnId);
  }
  if (isSharedWorldBossKind(spawn.kind)) {
    await deleteWorldBossSession(tx, bj.spawnId);
  }
  const questBefore = parseQuestProgressJson(
    nearbyExtraEconomy?.questProgressJson ?? char.questProgressJson
  );
  const questAfter = incrementQuestKillOnVictory(questBefore, npcId);
  const questJsonChanged =
    JSON.stringify(questBefore) !== JSON.stringify(questAfter);
  const dailyBefore = parseDailyQuestsJson(
    nearbyExtraEconomy?.dailyQuestsJson ?? char.dailyQuestsJson,
    nowVictoryMs
  );
  const dailyAfter = applyDailyQuestMobKill(dailyBefore, {
    nowMs: nowVictoryMs,
    playerLevel: preLevel,
    mobLevel: spawn.level,
    isWorldBoss: isSharedWorldBossKind(spawn.kind),
  });
  const dailyJsonChanged = dailyQuestsJsonChanged(char.dailyQuestsJson, dailyAfter);
  const result = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: nextHp,
        maxHp: maxHpAfter,
        level: newLevel,
        adena: { increment: adenaGainTotal },
        exp: newExp,
        sp: { increment: spGainTotal },
        mobsKilled: { increment: mobsKilledTotal },
        karma: karmaAfter,
        inventoryJson: loot.inventory as unknown as Prisma.InputJsonValue,
        battleJson: Prisma.JsonNull,
        mobSpawnHpJson: serializeMobSpawnHpState(mobHpAfterVictory),
        worldCombatStateJson:
          worldVictory != null
            ? (JSON.parse(JSON.stringify(worldVictory)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        ...(activeBuffsJson !== undefined ? { activeBuffsJson } : {}),
        ...(skillCooldownsJson !== undefined ? { skillCooldownsJson } : {}),
        ...(questJsonChanged
          ? {
              questProgressJson: serializeQuestProgressJson(
                questAfter
              ) as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dailyJsonChanged
          ? {
              dailyQuestsJson: serializeDailyQuestsJson(
                dailyAfter
              ) as unknown as Prisma.InputJsonValue,
            }
          : {}),
      },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  const row = result.character as CharacterRow;
  const mobSpawnHpSerialized = serializeMobSpawnHpState(mobHpAfterVictory);
  const huntPos = resolvedWorldPositionFromCharacterRow(char as CharacterRow);
  const huntOpts = {
    worldX: huntPos.worldX,
    worldY: huntPos.worldY,
    targetLevel: spawn.level,
    levelTolerance: HUNT_LEVEL_TOLERANCE,
    excludeSpawnId: bj.spawnId,
    mobSpawnHpJson: mobSpawnHpSerialized,
    nowMs: nowVictoryMs,
  };
  const nextHunt = findNextSameLevelHuntSpawn(huntOpts);
  const huntSameLevelRemaining = countSameLevelHuntSpawnsNearby(huntOpts);
  const victory: BattleVictorySummary = {
    spawnId: bj.spawnId,
    mobName: spawn.name,
    mobLevel: spawn.level,
    aggressive: spawn.aggressive,
    fullLog: log.map((x) => String(x)),
    adenaGain: adenaGainTotal.toString(),
    expGain: (
      loot.expGain + (nearbyExtraEconomy?.expGainFromExtras ?? BigInt(0))
    ).toString(),
    spGain: spGainTotal,
    items: loot.items.map((it) => ({ ...it })),
    levelUp: newLevel > preLevel ? newLevel : null,
    nextHuntSpawnId: nextHunt?.spawnId ?? null,
    huntSameLevelRemaining,
  };
  return {
    character: toSnapshot(row as CharacterRow),
    victory,
  };
}

export async function persistBattleDefeatInTx(
  tx: Tx,
  args: {
    userId: string;
    expectedRevision: number | null;
    char: CharacterRow;
    bj: { spawnId: string };
    spawn: { name: string; level: number; aggressive: boolean; kind: MapSpawnKind };
    maxHpEff: number;
    maxMpEff: number;
    st: BattleJsonState;
    log: string[];
  }
): Promise<{ character: CharacterSnapshot; defeat: BattleDefeatSummary }> {
  const { userId, expectedRevision, char, bj, spawn, maxHpEff, maxMpEff, st, log } =
    args;

  const recoverHp = Math.max(1, Math.floor(maxHpEff * 0.15));
  const near = nearestMapTown(char.worldX, char.worldY);
  const town = resolveNearestTownTeleport(char.worldX, char.worldY);
  if (!town) throw new Error('teleport_unknown');
  log.push('Ти знепритомнів… Бій завершено.');
  log.push('Всі бафи злетіли від смерті.');
  log.push('Тебе віднесли до ' + near.labelUk + '.');
  st.log = log.slice(-MAX_BATTLE_LOG);

  const worldDefeat = worldCombatStateFromBattleJson(
    st,
    maxMpEff,
    Date.now(),
    { stripBattleMods: true }
  );

  void userId;
  const mobHpAfterDefeat = isSharedWorldBossKind(spawn.kind)
    ? parseMobSpawnHpState(char.mobSpawnHpJson)
    : mergeMobSpawnHpEntry(
        parseMobSpawnHpState(char.mobSpawnHpJson),
        bj.spawnId,
        st.mobHp,
        st.mobMaxHp
      );
  const defeatLog = log.map((x) => String(x));
  const pvePending = serializePvePendingDefeat({
    spawnId: bj.spawnId,
    mobName: spawn.name,
    mobLevel: spawn.level,
    aggressive: spawn.aggressive,
    atMs: Date.now(),
    fullLog: defeatLog,
    nearestTownLabelUk: near.labelUk,
    nearestTeleportId: near.teleportId,
  });
  const lost = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: recoverHp,
        battleJson: Prisma.JsonNull,
        pvePendingDefeatJson: pvePending,
        mobSpawnHpJson: serializeMobSpawnHpState(mobHpAfterDefeat),
        worldX: town.worldX,
        worldY: town.worldY,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: town.worldX,
        moveFromY: town.worldY,
        cityId: town.cityId,
        worldCombatStateJson:
          worldDefeat != null
            ? (JSON.parse(JSON.stringify(worldDefeat)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        activeBuffsJson: Prisma.JsonNull,
      },
    })
  );
  if (!lost.ok) throw gameConflictFromMutation(lost);
  const crLost = lost.character as CharacterRow;
  const defeat: BattleDefeatSummary = {
    spawnId: bj.spawnId,
    mobName: spawn.name,
    mobLevel: spawn.level,
    aggressive: spawn.aggressive,
    fullLog: defeatLog,
    nearestTownLabelUk: near.labelUk,
    nearestTeleportId: near.teleportId,
  };
  return {
    character: toSnapshot(crLost),
    defeat,
  };
}

/** Зберегти стан бою після ходу гравця та контратаки моба (без перемоги/поразки). */
export async function persistBattleContinueTurnInTx(
  tx: Tx,
  args: {
    userId: string;
    expectedRevision: number;
    char: CharacterRow;
    bj: { spawnId: string };
    spawn: { name: string; level: number; aggressive: boolean; kind: string };
    preLevel: number;
    learnedBattle: string[];
    profAct: string;
    inv: InventoryState;
    st: BattleJsonState;
    playerHp: number;
    mobHp: number;
    log: string[];
    maxMpEff: number;
    /** Якщо ход додав/зняв self-buff (War Cry / Battle Roar / Thrill Fight) — нова картина `activeBuffsJson`. */
    activeBuffsJson?: Prisma.InputJsonValue;
    /** Якщо ход поклав скіл на КД — оновлений `skillCooldownsJson`. */
    skillCooldownsJson?: Prisma.InputJsonValue;
    /** Якщо ход списав предмети з сумки (заряд душі тощо). */
    inventoryJson?: Prisma.InputJsonValue;
    /** Прогрес щоденних завдань за цей ход. */
    dailyQuestsJson?: Prisma.InputJsonValue;
    /** Скільки рядків додано до логу в цьому ході (для logTail у delta). */
    logLinesAdded: number;
    hotbarStale?: boolean;
    nearbyExtraEconomy?: NearbyExtraMobEconomyPatch;
  }
): Promise<BattleActionDeltaResponse> {
  const {
    userId,
    expectedRevision,
    char,
    bj,
    spawn,
    preLevel,
    learnedBattle,
    profAct,
    inv,
    st,
    playerHp,
    mobHp,
    log,
    maxMpEff,
    activeBuffsJson,
    skillCooldownsJson,
    inventoryJson,
    dailyQuestsJson,
    logLinesAdded,
    hotbarStale,
    nearbyExtraEconomy,
  } = args;

  void userId;
  void bj;
  void spawn;
  void preLevel;
  void learnedBattle;
  void profAct;
  void inv;

  st.mobHp = mobHp;
  applyBattleLogWriteInPlace(st, log, logLinesAdded);
  bumpBattleVersionInPlace(st);

  /** Дзеркалимо battleMods у worldCombatStateJson — інакше після виходу в місто GET /character губить бафи. */
  const worldMirrorMid = worldCombatStateFromBattleJson(
    st,
    maxMpEff,
    Date.now()
  );

  const updated = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: playerHp,
        battleJson: serializeBattleJsonForDb(st),
        worldCombatStateJson:
          worldMirrorMid != null
            ? (JSON.parse(JSON.stringify(worldMirrorMid)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        ...(activeBuffsJson !== undefined ? { activeBuffsJson } : {}),
        ...(skillCooldownsJson !== undefined ? { skillCooldownsJson } : {}),
        ...(inventoryJson !== undefined ? { inventoryJson } : {}),
        ...(dailyQuestsJson !== undefined ? { dailyQuestsJson } : {}),
        ...(nearbyExtraEconomy
          ? {
              exp: nearbyExtraEconomy.exp,
              level: nearbyExtraEconomy.level,
              maxHp: nearbyExtraEconomy.maxHp,
              sp: { increment: nearbyExtraEconomy.spIncrement },
              adena: { increment: nearbyExtraEconomy.adenaIncrement },
              mobsKilled: { increment: nearbyExtraEconomy.mobsKilledIncrement },
              karma: nearbyExtraEconomy.karma,
              mobSpawnHpJson: nearbyExtraEconomy.mobSpawnHpJson,
              ...(nearbyExtraEconomy.questProgressJson !== undefined
                ? { questProgressJson: nearbyExtraEconomy.questProgressJson }
                : {}),
              ...(nearbyExtraEconomy.dailyQuestsJson !== undefined
                ? { dailyQuestsJson: nearbyExtraEconomy.dailyQuestsJson }
                : {}),
            }
          : {}),
      },
    })
  );
  if (!updated.ok) throw gameConflictFromMutation(updated);
  const row = updated.character as CharacterRow;
  const effLv = levelFromTotalExp(row.exp);
  const invRow = parseInventory(row.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    row.race,
    row.classBranch,
    invRow,
    combatOptsFromRow(row)
  );
  const vit = computeVitals(
    effLv,
    row.race,
    row.classBranch,
    combat.con,
    combat.men
  );
  const maxHpEff = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const maxMpRow = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const playerMp =
    typeof st.playerMp === 'number' && Number.isFinite(st.playerMp)
      ? Math.max(0, Math.min(maxMpRow, Math.floor(st.playerMp)))
      : maxMpRow;

  const hotbarStaleFlag =
    hotbarStale === true ||
    activeBuffsJson !== undefined ||
    skillCooldownsJson !== undefined ||
    inventoryJson !== undefined ||
    nearbyExtraEconomy !== undefined;

  const delta = buildBattleDeltaPayload({
    row,
    st,
    maxHpEff,
    maxMpEff: maxMpRow,
    playerMp,
    logLinesAdded,
    hotbarStale: hotbarStaleFlag,
  });

  return {
    kind: 'delta',
    revision: row.revision,
    characterId: row.id,
    delta,
  };
}
