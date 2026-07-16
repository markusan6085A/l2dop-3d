import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  L2DOP_MAX_TOTAL_EXP_INCLUSIVE,
  levelFromTotalExp,
} from '../data/l2dopExpgain.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { parseInventory } from '../data/inventory.js';
import {
  claimDailyQuestTask,
  isDailyQuestId,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
  type DailyQuestId,
} from '../domain/dailyQuests.js';
import {
  applyDailyQuestRewardToInventory,
  DAILY_QUEST_REWARDS,
} from '../domain/dailyQuestRewards.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

export async function claimDailyQuestReward(
  userId: string,
  taskIdRaw: unknown,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  if (!isDailyQuestId(taskIdRaw)) {
    throw new Error('daily_quest_invalid_id');
  }
  const taskId = taskIdRaw as DailyQuestId;
  const grant = DAILY_QUEST_REWARDS[taskId];
  if (!grant) throw new Error('daily_quest_invalid_id');

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const nowMs = Date.now();
    const row = char as CharacterRow;
    let inv = parseInventory(row.inventoryJson);
    let nextDaily: ReturnType<typeof parseDailyQuestsJson>;
    try {
      nextDaily = claimDailyQuestTask(
        parseDailyQuestsJson(row.dailyQuestsJson, nowMs),
        taskId,
        nowMs
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (
        msg === 'daily_quest_already_claimed' ||
        msg === 'daily_quest_not_done'
      ) {
        throw err;
      }
      throw err;
    }

    inv = applyDailyQuestRewardToInventory(inv, grant);

    let nextExp = row.exp;
    if (grant.exp != null && grant.exp > 0n) {
      nextExp = row.exp + grant.exp;
      if (nextExp > L2DOP_MAX_TOTAL_EXP_INCLUSIVE) {
        nextExp = L2DOP_MAX_TOTAL_EXP_INCLUSIVE;
      }
    }
    const preLevel = levelFromTotalExp(row.exp);
    const newLevel = levelFromTotalExp(nextExp);
    const nextSp = row.sp + Math.max(0, Math.floor(Number(grant.sp) || 0));

    const combatAfter = computeCombatStats(
      newLevel,
      row.race,
      row.classBranch,
      inv,
      combatOptsFromRow(row)
    );
    const vitAfter = computeVitals(
      newLevel,
      row.race,
      row.classBranch,
      combatAfter.con,
      combatAfter.men
    );
    const maxHpAfter = effectiveMaxHpWithJewelFlat(vitAfter.maxHp, combatAfter);
    let nextHp = row.hp;
    if (newLevel > preLevel) {
      nextHp = maxHpAfter;
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          dailyQuestsJson: serializeDailyQuestsJson(
            nextDaily
          ) as unknown as Prisma.InputJsonValue,
          inventoryJson: inv as unknown as Prisma.InputJsonValue,
          exp: nextExp,
          level: newLevel,
          sp: nextSp,
          maxHp: maxHpAfter,
          hp: nextHp,
          ...(grant.adena != null && grant.adena > 0n
            ? { adena: { increment: grant.adena } }
            : {}),
        },
      })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
