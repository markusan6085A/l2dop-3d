/**
 * Зміна l2Profession для гілки людини-мага (l2db / Interlude, без квестів).
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
  isL2HumanRace,
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import {
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function assertHumanMysticRow(row: CharacterRow): void {
  if (!isL2HumanRace(row.race) || !isMysticClassBranch(row.classBranch)) {
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
  void userId;
  const result = await mutateCharacterWithRevision(
    tx,
    charId,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        l2Profession: nextProf,
      },
    })
  );
  if (!result.ok) throw new GameConflictError();
  return toSnapshot(result.character as CharacterRow);
}

//==== 1-ша профа: human_mage → Wizard | Cleric (20+) ====

export async function performFirstProfessionHumanWizard(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_wizard');
  });
}

export async function performFirstProfessionHumanCleric(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_cleric');
  });
}

//==== 2-га профа: Wizard → Sorcerer | Necromancer | Warlock (40+) ====

export async function performSecondProfessionHumanSorcerer(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_wizard');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_sorcerer');
  });
}

export async function performSecondProfessionHumanNecromancer(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_wizard');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'human_necromancer'
    );
  });
}

export async function performSecondProfessionHumanWarlock(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_wizard');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_warlock');
  });
}

//==== 2-га профа: Cleric → Bishop | Prophet (40+) ====

export async function performSecondProfessionHumanBishop(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_cleric');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_bishop');
  });
}

export async function performSecondProfessionHumanProphet(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_cleric');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_prophet');
  });
}

//==== 3-тя профа (76+) ====

export async function performThirdProfessionHumanArchmage(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_sorcerer');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_archmage');
  });
}

export async function performThirdProfessionHumanSoultaker(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_necromancer');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_soultaker');
  });
}

export async function performThirdProfessionHumanArcanaLord(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_warlock');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'human_arcana_lord'
    );
  });
}

export async function performThirdProfessionHumanCardinal(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_bishop');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_cardinal');
  });
}

export async function performThirdProfessionHumanHierophant(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_prophet');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'human_hierophant'
    );
  });
}
