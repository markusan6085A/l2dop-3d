import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_PRO_WARRIOR_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isHumanFighter,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  acceptFirstProfessionQuest,
  HUMAN_FIGHTER_FIRST_PROF_SLUG_TO_TARGET,
  parseQuestProgressJson,
  serializeQuestProgressJson,
} from '../domain/humanFighterFirstProfessionQuest.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function resolveHumanFighterBaseProf(row: CharacterRow): string {
  return typeof row.l2Profession === 'string' && row.l2Profession.trim()
    ? row.l2Profession.trim()
    : 'human_fighter';
}

function assertHumanFighterFirstProfEligible(
  row: CharacterRow,
  exp: bigint
): void {
  if (!isHumanFighter(row.race, row.classBranch)) {
    throw new Error('profession_wrong_branch');
  }
  if (resolveHumanFighterBaseProf(row) !== 'human_fighter') {
    throw new Error('profession_already_advanced');
  }
  const lv = levelFromTotalExp(exp);
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    lv < HUMAN_FIGHTER_PRO_WARRIOR_LEVEL
  ) {
    throw new Error('profession_requires_level');
  }
}

export async function acceptHumanFighterFirstProfessionQuest(
  userId: string,
  slug: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const target = HUMAN_FIGHTER_FIRST_PROF_SLUG_TO_TARGET[String(slug || '').trim()];
  if (!target) throw new Error('profession_quest_unknown_slug');

  const row = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const row = char as CharacterRow;
    assertHumanFighterFirstProfEligible(row, char.exp);

    const questState = parseQuestProgressJson(char.questProgressJson);
    let nextQuest;
    try {
      nextQuest = acceptFirstProfessionQuest(questState, target);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'profession_quest_wrong_target') throw err;
      throw err;
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          questProgressJson: serializeQuestProgressJson(
            nextQuest
          ) as unknown as Prisma.InputJsonValue,
        },
      })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId);
}
