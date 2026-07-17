import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
  HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isHumanFighter,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

//==== Rogue / Archer (2–3 профи) ====

/**
 * Друга профа гілки розбійника: Rogue → Treasure Hunter (мін. 40 р.).
 */
export async function performSecondProfessionHumanTreasureHunter(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const row = await prisma.$transaction(async (tx) => {
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
    if (prof === 'human_treasure_hunter' || prof === 'human_adventurer') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_rogue') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({ changed: true, data: { l2Profession: 'human_treasure_hunter' } })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId);
}

/**
 * Друга профа лучника: Rogue → Hawkeye (мін. 40 р.), як l2db (Rogue → Hawkeye → Sagittarius).
 */
export async function performSecondProfessionHumanHawkeye(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const row = await prisma.$transaction(async (tx) => {
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
    if (prof === 'human_hawkeye' || prof === 'human_sagittarius') {
      throw new Error('profession_already_advanced');
    }
    if (prof === 'human_treasure_hunter' || prof === 'human_adventurer') {
      throw new Error('profession_wrong_branch');
    }
    if (prof !== 'human_rogue') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({ changed: true, data: { l2Profession: 'human_hawkeye' } })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId);
}

/**
 * Третя профа гілки розбійника: Treasure Hunter → Adventurer (мін. 76 р.).
 */
export async function performThirdProfessionHumanAdventurer(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const row = await prisma.$transaction(async (tx) => {
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
    if (prof === 'human_adventurer') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_treasure_hunter') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({ changed: true, data: { l2Profession: 'human_adventurer' } })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId);
}

/**
 * Третя профа гілки лучника: Hawkeye → Sagittarius (мін. 76 р.).
 */
export async function performThirdProfessionHumanSagittarius(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const row = await prisma.$transaction(async (tx) => {
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
    if (prof === 'human_sagittarius') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_hawkeye') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({ changed: true, data: { l2Profession: 'human_sagittarius' } })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId);
}
