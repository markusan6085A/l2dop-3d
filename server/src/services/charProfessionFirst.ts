import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { parseInventory } from '../data/inventory.js';
import {
  HUMAN_FIGHTER_PRO_WARRIOR_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isHumanFighter,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  assertFirstProfessionQuestForChange,
  HUMAN_FIGHTER_FIRST_PROF_QUEST_REWARD_ADENA,
  HUMAN_FIGHTER_FIRST_PROF_QUEST_REWARD_SP,
  parseQuestProgressJson,
  serializeQuestProgressJson,
  type HumanFighterFirstProfTarget,
} from '../domain/humanFighterFirstProfessionQuest.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

async function performFirstProfessionHumanFighterWithQuest(
  userId: string,
  expectedRevision: number,
  targetProfession: HumanFighterFirstProfTarget
): Promise<CharacterSnapshot> {
  const txRow = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const row = char as CharacterRow;
    if (!isHumanFighter(row.race, row.classBranch)) {
      throw new Error('profession_wrong_branch');
    }
    const prof =
      typeof row.l2Profession === 'string' && row.l2Profession.trim()
        ? row.l2Profession.trim()
        : 'human_fighter';
    if (prof !== 'human_fighter') {
      throw new Error('profession_already_advanced');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_PRO_WARRIOR_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const inv = parseInventory(char.inventoryJson);
    const questState = parseQuestProgressJson(char.questProgressJson);
    const { nextInv, cleared } = assertFirstProfessionQuestForChange(
      questState,
      targetProfession,
      inv
    );

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          l2Profession: targetProfession,
          adena: { increment: HUMAN_FIGHTER_FIRST_PROF_QUEST_REWARD_ADENA },
          sp: { increment: HUMAN_FIGHTER_FIRST_PROF_QUEST_REWARD_SP },
          inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          questProgressJson: serializeQuestProgressJson(
            cleared
          ) as unknown as Prisma.InputJsonValue,
        },
      })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(txRow, userId);
}

export async function performFirstProfessionHumanWarrior(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return performFirstProfessionHumanFighterWithQuest(
    userId,
    expectedRevision,
    'human_warrior'
  );
}

export async function performFirstProfessionHumanKnight(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return performFirstProfessionHumanFighterWithQuest(
    userId,
    expectedRevision,
    'human_knight'
  );
}

export async function performFirstProfessionHumanRogue(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return performFirstProfessionHumanFighterWithQuest(
    userId,
    expectedRevision,
    'human_rogue'
  );
}
