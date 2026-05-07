import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
  HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isHumanFighter,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';

//==== Warrior → Warlord / Dreadnought · Gladiator / Duelist ====

/**
 * Друга профа гілки алебарди: Warrior → Warlord (Interlude, мін. 40 р.).
 */
export async function performSecondProfessionHumanWarlord(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const row = char as CharacterRow;
    if (!isHumanFighter(row.race, row.classBranch)) {
      throw new Error('profession_wrong_branch');
    }
    const prof =
      typeof row.l2Profession === 'string' && row.l2Profession.trim()
        ? row.l2Profession.trim()
        : 'human_fighter';
    if (prof === 'human_warlord') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_warrior') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        l2Profession: 'human_warlord',
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();

    const next = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(next as CharacterRow);
  });
}

/**
 * Третя профа гілки алебарди: Warlord → Dreadnought (Interlude, мін. 76 р.).
 */
export async function performThirdProfessionHumanDreadnought(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const row = char as CharacterRow;
    if (!isHumanFighter(row.race, row.classBranch)) {
      throw new Error('profession_wrong_branch');
    }
    const prof =
      typeof row.l2Profession === 'string' && row.l2Profession.trim()
        ? row.l2Profession.trim()
        : 'human_fighter';
    if (prof === 'human_dreadnought') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_warlord') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        l2Profession: 'human_dreadnought',
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();

    const next = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(next as CharacterRow);
  });
}

/**
 * Друга профа гілки гладіатора: Warrior → Gladiator (ланцюжок як у text-rpg).
 * Без квесту — лише рівень; на одному рівні з Warlord (альтернативна гілка).
 */
export async function performSecondProfessionHumanGladiator(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const row = char as CharacterRow;
    if (!isHumanFighter(row.race, row.classBranch)) {
      throw new Error('profession_wrong_branch');
    }
    const prof =
      typeof row.l2Profession === 'string' && row.l2Profession.trim()
        ? row.l2Profession.trim()
        : 'human_fighter';
    if (prof === 'human_gladiator' || prof === 'human_duelist') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_warrior') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        l2Profession: 'human_gladiator',
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();

    const next = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(next as CharacterRow);
  });
}

/**
 * Третя профа гілки гладіатора: Gladiator → Duelist.
 */
export async function performThirdProfessionHumanDuelist(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const row = char as CharacterRow;
    if (!isHumanFighter(row.race, row.classBranch)) {
      throw new Error('profession_wrong_branch');
    }
    const prof =
      typeof row.l2Profession === 'string' && row.l2Profession.trim()
        ? row.l2Profession.trim()
        : 'human_fighter';
    if (prof === 'human_duelist') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_gladiator') {
      throw new Error('profession_wrong_branch');
    }
    const lv = levelFromTotalExp(char.exp);
    if (
      !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
      lv < HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL
    ) {
      throw new Error('profession_requires_level');
    }

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        l2Profession: 'human_duelist',
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();

    const next = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(next as CharacterRow);
  });
}
