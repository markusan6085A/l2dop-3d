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

//==== Knight (Paladin / Phoenix · Dark Avenger / Hell) ====

/**
 * Друга профа гілки лицаря: Human Knight → Paladin (Interlude, мін. 40 р.).
 */
export async function performSecondProfessionHumanPaladin(
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
    if (prof === 'human_paladin' || prof === 'human_phoenix_knight') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_knight') {
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
        l2Profession: 'human_paladin',
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
 * Третя профа гілки лицаря: Paladin → Phoenix Knight (Interlude, мін. 76 р.).
 */
export async function performThirdProfessionHumanPhoenixKnight(
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
    if (prof === 'human_phoenix_knight') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_paladin') {
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
        l2Profession: 'human_phoenix_knight',
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
 * Друга профа темної гілки лицаря: Human Knight → Dark Avenger (мін. 40 р., альтернатива Paladin).
 */
export async function performSecondProfessionHumanDarkAvenger(
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
    if (prof === 'human_dark_avenger' || prof === 'human_hell_knight') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_knight') {
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
        l2Profession: 'human_dark_avenger',
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
 * Третя профа темної гілки лицаря: Dark Avenger → Hell Knight (мін. 76 р.).
 */
export async function performThirdProfessionHumanHellKnight(
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
    if (prof === 'human_hell_knight') {
      throw new Error('profession_already_advanced');
    }
    if (prof !== 'human_dark_avenger') {
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
        l2Profession: 'human_hell_knight',
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
