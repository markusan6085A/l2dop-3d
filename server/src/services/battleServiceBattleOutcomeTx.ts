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
import type { BattleJsonState } from '../domain/battle.js';
import { MAX_BATTLE_LOG } from '../domain/battle.js';
import { worldCombatStateFromBattleJson } from '../domain/worldCombatState.js';
import { rollKillLoot } from '../domain/killLoot.js';
import { resolveL2dopNpcIdByMobName } from './spawnCatalogService.js';
import {
  combatOptsFromRow,
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { nearestMapTown } from '../data/mapLocalities.js';
import type {
  BattleDefeatSummary,
  BattleVictorySummary,
  BattleView,
} from './battleServiceTypes.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { battleViewFromState, skillCooldownUiContextFromParts } from './battleServiceBattleUi.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
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
  REGULAR_MOB_RESPAWN_MS,
  setMobSpawnRespawnEntry,
} from '../domain/mobSpawnRespawn.js';
import {
  countSameLevelHuntSpawnsNearby,
  findNextSameLevelHuntSpawn,
  HUNT_LEVEL_TOLERANCE,
} from '../domain/battleHuntChain.js';
import { resolvedWorldPositionFromCharacterRow } from './mapAroundService.js';

type Tx = Prisma.TransactionClient;

export async function persistBattleVictoryInTx(
  tx: Tx,
  args: {
    userId: string;
    expectedRevision: number;
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
  } = args;

  const npcId = resolveL2dopNpcIdByMobName(spawn.name) ?? null;
  const loot = rollKillLoot(npcId, spawn.level, inv, {
    race: char.race,
    l2Profession: char.l2Profession,
    skillsLearnedJson: char.skillsLearnedJson,
  });
  log.push('Перемога!');
  for (const line of loot.logLines) {
    log.push(line);
  }

  let newExp = char.exp + loot.expGain;
  if (newExp > L2DOP_MAX_TOTAL_EXP_INCLUSIVE) {
    newExp = L2DOP_MAX_TOTAL_EXP_INCLUSIVE;
  }
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
  let mobHpAfterVictory = parseMobSpawnHpState(char.mobSpawnHpJson, nowVictoryMs);
  if (isRegularMobRespawnKind(spawn.kind)) {
    mobHpAfterVictory = setMobSpawnRespawnEntry(
      clearMobSpawnHpEntry(mobHpAfterVictory, bj.spawnId),
      bj.spawnId,
      nowVictoryMs + REGULAR_MOB_RESPAWN_MS
    );
  } else {
    mobHpAfterVictory = clearMobSpawnHpEntry(mobHpAfterVictory, bj.spawnId);
  }
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
        adena: { increment: loot.adena },
        exp: newExp,
        sp: { increment: loot.spGain },
        mobsKilled: { increment: 1 },
        inventoryJson: loot.inventory as unknown as Prisma.InputJsonValue,
        battleJson: Prisma.JsonNull,
        mobSpawnHpJson: serializeMobSpawnHpState(mobHpAfterVictory),
        worldCombatStateJson:
          worldVictory != null
            ? (JSON.parse(JSON.stringify(worldVictory)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        ...(activeBuffsJson !== undefined ? { activeBuffsJson } : {}),
        ...(skillCooldownsJson !== undefined ? { skillCooldownsJson } : {}),
      },
    })
  );
  if (!result.ok) throw new GameConflictError();
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
    adenaGain: loot.adena.toString(),
    expGain: loot.expGain.toString(),
    spGain: loot.spGain,
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
    expectedRevision: number;
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
  log.push('Ти знепритомнів… Бій завершено.');
  log.push('Всі бафи злетіли від смерті.');
  st.log = log.slice(-MAX_BATTLE_LOG);

  /**
   * L2 Interlude: при смерті всі активні бафи злітають (Noblesse / Bless of Soul
   * збережемо пізніше через окрему мітку). Clear `battleMods` (через stripBattleMods),
   * `activeBuffsJson` (ставимо порожній список → Prisma.JsonNull), а також очистимо
   * legacy-експірації через `worldCombatStateFromBattleJson` (stripBattleMods = true).
   *
   * Passive-скіли не в `activeBuffsJson`, тож вони залишаються (правильна L2-поведінка).
   * `skillCooldownsJson` лишаємо — у L2 CD не скидаються при смерті.
   */
  const worldDefeat = worldCombatStateFromBattleJson(
    st,
    maxMpEff,
    Date.now(),
    { stripBattleMods: true }
  );

  void userId;
  const mobHpAfterDefeat = mergeMobSpawnHpEntry(
    parseMobSpawnHpState(char.mobSpawnHpJson),
    bj.spawnId,
    st.mobHp,
    st.mobMaxHp
  );
  const lost = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: recoverHp,
        battleJson: Prisma.JsonNull,
        mobSpawnHpJson: serializeMobSpawnHpState(mobHpAfterDefeat),
        worldCombatStateJson:
          worldDefeat != null
            ? (JSON.parse(JSON.stringify(worldDefeat)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        activeBuffsJson: Prisma.JsonNull,
      },
    })
  );
  if (!lost.ok) throw new GameConflictError();
  const crLost = lost.character as CharacterRow;
  const near = nearestMapTown(crLost.worldX, crLost.worldY);
  const defeat: BattleDefeatSummary = {
    spawnId: bj.spawnId,
    mobName: spawn.name,
    mobLevel: spawn.level,
    aggressive: spawn.aggressive,
    fullLog: log.map((x) => String(x)),
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
  }
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
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
  } = args;

  st.mobHp = mobHp;
  st.log = log.slice(-MAX_BATTLE_LOG);

  /** Дзеркалимо battleMods у worldCombatStateJson — інакше після виходу в місто GET /character губить бафи. */
  const worldMirrorMid = worldCombatStateFromBattleJson(
    st,
    maxMpEff,
    Date.now()
  );

  void userId;
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
      },
    })
  );
  if (!updated.ok) throw new GameConflictError();
  const row = updated.character as CharacterRow;
  const snap = toSnapshot(row);
  const nowForView = Date.now();
  const view = battleViewFromState(
    bj.spawnId,
    st,
    {
      name: spawn.name,
      level: spawn.level,
      aggressive: spawn.aggressive,
      kind: spawn.kind,
    },
    preLevel,
    char.race,
    char.classBranch,
    learnedBattle,
    profAct,
    inv,
    persistableActiveBuffsFromJson(
      row.activeBuffsJson,
      nowForView
    ),
    parseSkillCooldowns(row.skillCooldownsJson, nowForView),
    skillCooldownUiContextFromParts(
      char.classBranch,
      snap.castSpd,
      snap.pAtkSpd,
      snap.learnedBattleSkillsDetail
    )
  );
  return { character: snap, battle: view };
}
