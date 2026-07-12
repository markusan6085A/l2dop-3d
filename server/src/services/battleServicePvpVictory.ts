import { Prisma } from '@prisma/client';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { parseInventory } from '../data/inventory.js';
import type { BattleJsonState } from '../domain/battle.js';
import { MAX_BATTLE_LOG } from '../domain/battle.js';
import { worldCombatStateFromBattleJson } from '../domain/worldCombatState.js';
import { PVP_KILL_KARMA_GAIN } from '../domain/pvpKarma.js';
import { serializePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';
import { buildPvpVictimDefeatLog } from '../domain/pvpVictimBattleLog.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { gameConflictFromMutation } from './charConflict.js';
import type { BattleVictorySummary } from './battleServiceTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import {
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import type { BattleSpawnMeta } from '../domain/battlePvpContext.js';

type Tx = Prisma.TransactionClient;

/** PvP-перемога: без луту/EXP; карма за PK без відсічі. */
export async function persistPvpVictoryInTx(
  tx: Tx,
  args: {
    userId: string;
    expectedRevision: number;
    char: CharacterRow;
    spawn: BattleSpawnMeta;
    preLevel: number;
    playerHp: number;
    currentMp: number;
    st: BattleJsonState;
    log: string[];
    activeBuffsJson?: Prisma.InputJsonValue;
    skillCooldownsJson?: Prisma.InputJsonValue;
  }
): Promise<{ character: CharacterSnapshot; victory: BattleVictorySummary }> {
  const {
    expectedRevision,
    char,
    spawn,
    preLevel,
    playerHp,
    currentMp,
    st,
    log,
    activeBuffsJson,
    skillCooldownsJson,
  } = args;

  const fightLog = log.slice(-MAX_BATTLE_LOG);
  const trimmedLog = fightLog.slice();
  trimmedLog.push('Ви перемогли гравця [' + spawn.name + ']!');

  const victimId = st.pvpTargetCharacterId
    ? String(st.pvpTargetCharacterId).trim()
    : '';
  const unfairKill =
    st.pvpIsAggressor !== false && st.pvpVictimFoughtBack !== true;
  const karmaGain = unfairKill ? PVP_KILL_KARMA_GAIN : 0;
  if (karmaGain > 0) {
    trimmedLog.push('Карма +' + karmaGain + '.');
  }

  if (victimId) {
    const victimRow = await tx.character.findFirst({
      where: { id: victimId },
      select: { battleJson: true },
    });
    const victimBj = victimRow
      ? parseBattleJson(victimRow.battleJson)
      : null;
    const victimLog =
      victimBj && Array.isArray(victimBj.log)
        ? victimBj.log.map((x) => String(x))
        : [];
    const defeatLog = buildPvpVictimDefeatLog({
      attackerName: char.name,
      attackerLog: fightLog,
      victimLog,
    });
    const victimResult = await mutateCharacterWithRevision(
      tx,
      victimId,
      null,
      () => ({
        changed: true,
        data: {
          hp: 0,
          battleJson: Prisma.JsonNull,
          pvpPendingDefeatJson: serializePvpPendingDefeat({
            killerName: char.name,
            killerCharacterId: char.id,
            atMs: Date.now(),
            fullLog: defeatLog,
          }),
        },
      })
    );
    if (!victimResult.ok) throw gameConflictFromMutation(victimResult);
  }

  const cr = char;
  const inv = parseInventory(cr.inventoryJson);
  const combat = computeCombatStats(
    preLevel,
    char.race,
    char.classBranch,
    inv,
    combatOptsFromRow(cr)
  );
  const vit = computeVitals(
    preLevel,
    char.race,
    char.classBranch,
    combat.con,
    combat.men
  );
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const worldLeave = worldCombatStateFromBattleJson(
    { ...st, playerMp: currentMp },
    maxMp,
    Date.now()
  );

  const nextKarma = Math.max(
    0,
    Math.floor(Number(char.karma) || 0) + karmaGain
  );

  const result = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: Math.max(0, Math.floor(playerHp)),
        karma: nextKarma,
        battleJson: Prisma.JsonNull,
        worldCombatStateJson: worldLeave
          ? (JSON.parse(JSON.stringify(worldLeave)) as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ...(activeBuffsJson !== undefined
          ? { activeBuffsJson }
          : {}),
        ...(skillCooldownsJson !== undefined
          ? { skillCooldownsJson }
          : {}),
      },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);

  const snap = toSnapshot(result.character as CharacterRow);
  const victory: BattleVictorySummary = {
    spawnId: st.spawnId,
    mobName: spawn.name,
    mobLevel: spawn.level,
    aggressive: spawn.aggressive,
    isPvp: true,
    fullLog: trimmedLog,
    adenaGain: '0',
    expGain: '0',
    spGain: 0,
    items: [],
    levelUp: null,
    nextHuntSpawnId: null,
    huntSameLevelRemaining: 0,
  };
  return { character: snap, victory };
}
