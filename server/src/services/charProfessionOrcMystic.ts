/**
 * Зміна l2Profession для гілки орка-шамана (l2db / Interlude, без квестів).
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL,
  HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL,
  HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL,
  isL2OrcRace,
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import {
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';

function assertOrcMysticRow(row: CharacterRow): void {
  if (!isL2OrcRace(row.race) || !isMysticClassBranch(row.classBranch)) {
    throw new Error('profession_wrong_branch');
  }
}

function requireLevelAtLeast(lv: number, need: number): void {
  if (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ) return;
  if (lv < need) throw new Error('profession_requires_level');
}

function requireCurrentProf(row: CharacterRow, expected: string): void {
  const prof = resolveL2ProfessionForSkillsRow(row);
  if (prof !== expected) throw new Error('profession_wrong_branch');
}

async function commitL2Profession(
  tx: Prisma.TransactionClient,
  charId: string,
  userId: string,
  expectedRevision: number,
  nextProf: string
): Promise<CharacterSnapshot> {
  const updated = await tx.character.updateMany({
    where: {
      id: charId,
      userId,
      revision: expectedRevision,
    },
    data: {
      l2Profession: nextProf,
      revision: { increment: 1 },
    },
  });
  if (updated.count === 0) throw new GameConflictError();
  const next = await tx.character.findUniqueOrThrow({ where: { id: charId } });
  return toSnapshot(next as CharacterRow);
}

//==== 1-ша профа: orc_mage → Orc Shaman (20+) ====

export async function performFirstProfessionOrcShaman(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_shaman');
  });
}

//==== 2-га профа: Orc Shaman → Overlord | Warcryer (40+) ====

export async function performSecondProfessionOrcOverlord(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_shaman');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_overlord');
  });
}

export async function performSecondProfessionOrcWarcryer(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_shaman');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_warcryer');
  });
}

//==== 3-тя профа (76+) ====

export async function performThirdProfessionOrcDominator(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_overlord');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_dominator');
  });
}

export async function performThirdProfessionOrcDoomcryer(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_warcryer');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_doomcryer');
  });
}
