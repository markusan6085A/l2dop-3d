/**
 * Лут / EXP / SP за додаткові цілі AoE (whirlwindExtras: Вихор, Sonic Storm тощо)
 * без завершення бою з головною ціллю.
 */
import type { Prisma } from '@prisma/client';
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
import {
  clearMobSpawnHpEntry,
  parseMobSpawnHpState,
  serializeMobSpawnHpState,
} from '../domain/mobSpawnHpState.js';
import {
  isRegularMobRespawnKind,
  mobRespawnMsForKind,
  setMobSpawnRespawnEntry,
} from '../domain/mobSpawnRespawn.js';
import { isSharedWorldBossKind } from '../domain/worldBossSession.js';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';
import { resolveL2dopNpcIdByMobName } from './spawnCatalogService.js';
import { MOB_KILL_KARMA_WASH } from '../domain/pvpKarma.js';
import { combatOptsFromRow, type CharacterRow } from './charService.js';

export type NearbyExtraMobEconomyPatch = {
  exp: bigint;
  /** Сума EXP лише з додаткових цілей (для UI перемоги). */
  expGainFromExtras: bigint;
  spIncrement: number;
  adenaIncrement: bigint;
  mobsKilledIncrement: number;
  karma: number;
  level: number;
  maxHp: number;
  mobSpawnHpJson: Prisma.InputJsonValue;
  questProgressJson?: Prisma.InputJsonValue;
  dailyQuestsJson?: Prisma.InputJsonValue;
};

export type NearbyExtraMobLootApplyResult = {
  changed: boolean;
  inv: InventoryState;
  inventoryDirty: boolean;
  economyPatch?: NearbyExtraMobEconomyPatch;
  levelUp: number | null;
};

function extraKillLootEligible(spawnKind: string): boolean {
  if (isSharedWorldBossKind(spawnKind as never)) return false;
  return isRegularMobRespawnKind(spawnKind as never);
}

/**
 * Обробляє вбитих «поруч» мобів: один раз на ціль (`lootGranted`), нагорода як при звичайному кіллі.
 */
export function applyNearbyExtraMobKillLoot(args: {
  st: BattleJsonState;
  char: CharacterRow;
  inv: InventoryState;
  preLevel: number;
  log: string[];
  nowMs: number;
}): NearbyExtraMobLootApplyResult {
  const { st, char, preLevel, log, nowMs } = args;
  let inv = args.inv;

  if (!st.whirlwindExtras || st.whirlwindExtras.length === 0) {
    return { changed: false, inv, inventoryDirty: false, levelUp: null };
  }

  let expAcc = char.exp;
  let expGainFromExtras = BigInt(0);
  let spAcc = 0;
  let adenaAcc = BigInt(0);
  let mobsKilledDelta = 0;
  let karma = Math.max(0, Math.floor(Number(char.karma) || 0));
  let mobHpState = parseMobSpawnHpState(char.mobSpawnHpJson, nowMs);
  let quest = parseQuestProgressJson(char.questProgressJson);
  let questChanged = false;
  let daily = parseDailyQuestsJson(char.dailyQuestsJson, nowMs);
  let dailyChanged = false;
  let anyKill = false;

  for (const ex of st.whirlwindExtras) {
    if (ex.mobHp > 0 || ex.lootGranted) continue;

    const spMeta = getWorldSpawnById(ex.spawnId);
    if (!spMeta || !extraKillLootEligible(spMeta.kind)) {
      ex.lootGranted = true;
      continue;
    }

    const npcId = resolveL2dopNpcIdByMobName(ex.name) ?? null;
    const loot = rollKillLoot(npcId, spMeta.level, inv, {
      race: char.race,
      l2Profession: char.l2Profession,
      skillsLearnedJson: char.skillsLearnedJson,
    }, { spawnKind: spMeta.kind, mobName: ex.name });

    inv = loot.inventory;
    expGainFromExtras += loot.expGain;
    expAcc =
      expAcc + loot.expGain > L2DOP_MAX_TOTAL_EXP_INCLUSIVE
        ? L2DOP_MAX_TOTAL_EXP_INCLUSIVE
        : expAcc + loot.expGain;
    spAcc += loot.spGain;
    adenaAcc += loot.adena;
    mobsKilledDelta += 1;
    karma = Math.max(0, karma - MOB_KILL_KARMA_WASH);

    const questNext = incrementQuestKillOnVictory(quest, npcId);
    if (JSON.stringify(questNext) !== JSON.stringify(quest)) {
      quest = questNext;
      questChanged = true;
    }

    const dailyNext = applyDailyQuestMobKill(daily, {
      nowMs,
      playerLevel: preLevel,
      mobLevel: spMeta.level,
      isWorldBoss: isSharedWorldBossKind(spMeta.kind),
    });
    if (dailyQuestsJsonChanged(daily, dailyNext)) {
      daily = dailyNext;
      dailyChanged = true;
    }

    mobHpState = setMobSpawnRespawnEntry(
      clearMobSpawnHpEntry(mobHpState, ex.spawnId),
      ex.spawnId,
      nowMs + mobRespawnMsForKind(spMeta.kind)
    );

    ex.lootGranted = true;
    anyKill = true;
    log.push('Додаткова ціль повалена: ' + ex.name + '.');
    for (const line of loot.logLines) {
      log.push(line);
    }
  }

  if (!anyKill) {
    return { changed: false, inv, inventoryDirty: false, levelUp: null };
  }

  const newLevel = levelFromTotalExp(expAcc);
  const combatAfter = computeCombatStats(
    newLevel,
    char.race,
    char.classBranch,
    inv,
    combatOptsFromRow(char)
  );
  const vitAfter = computeVitals(
    newLevel,
    char.race,
    char.classBranch,
    combatAfter.con,
    combatAfter.men
  );
  const maxHpAfter = effectiveMaxHpWithJewelFlat(vitAfter.maxHp, combatAfter);
  void effectiveMaxMpWithJewelFlat(vitAfter.maxMp, combatAfter);

  if (newLevel > preLevel) {
    log.push('Рівень ' + newLevel + '!');
  }

  return {
    changed: true,
    inv,
    inventoryDirty: true,
    levelUp: newLevel > preLevel ? newLevel : null,
    economyPatch: {
      exp: expAcc,
      expGainFromExtras,
      spIncrement: spAcc,
      adenaIncrement: adenaAcc,
      mobsKilledIncrement: mobsKilledDelta,
      karma,
      level: newLevel,
      maxHp: maxHpAfter,
      mobSpawnHpJson: serializeMobSpawnHpState(mobHpState) as Prisma.InputJsonValue,
      ...(questChanged
        ? {
            questProgressJson: serializeQuestProgressJson(
              quest
            ) as Prisma.InputJsonValue,
          }
        : {}),
      ...(dailyChanged
        ? {
            dailyQuestsJson: serializeDailyQuestsJson(
              daily
            ) as Prisma.InputJsonValue,
          }
        : {}),
    },
  };
}
