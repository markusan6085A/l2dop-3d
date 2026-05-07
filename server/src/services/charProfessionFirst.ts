import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_PRO_WARRIOR_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isHumanFighter,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';

//==== 1-ша профа (Fighter → Warrior | Knight | Rogue) ====

/**
 * Перша зміна профи: Людина-воїн (Fighter) → Warrior (l2dop / Interlude).
 * Потрібен мінімальний рівень як у офіційного клієнта (20).
 */
export async function performFirstProfessionHumanWarrior(
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

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        l2Profession: 'human_warrior',
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
 * Перша профа гілки лицаря: Fighter → Human Knight (паралельно Warrior / згодом Rogue).
 */
export async function performFirstProfessionHumanKnight(
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

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        l2Profession: 'human_knight',
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
 * Перша профа гілки розбійника: Fighter → Rogue (паралельно Warrior / Knight).
 */
export async function performFirstProfessionHumanRogue(
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

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        l2Profession: 'human_rogue',
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
