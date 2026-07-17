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
  gameConflictFromCharacter,
  gameConflictFromMutation,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
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
): Promise<CharacterRow> {
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
  if (!result.ok) throw gameConflictFromMutation(result);
  return result.character as CharacterRow;
}

//==== 1-ша профа: human_mage → Wizard | Cleric (20+) ====

export async function performFirstProfessionHumanWizard(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_wizard');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performFirstProfessionHumanCleric(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_cleric');
  });
  return buildCharacterClientSnapshot(row, userId);
}

//==== 2-га профа: Wizard → Sorcerer | Necromancer | Warlock (40+) ====

export async function performSecondProfessionHumanSorcerer(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_wizard');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_sorcerer');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionHumanNecromancer(
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
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionHumanWarlock(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_wizard');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_warlock');
  });
  return buildCharacterClientSnapshot(row, userId);
}

//==== 2-га профа: Cleric → Bishop | Prophet (40+) ====

export async function performSecondProfessionHumanBishop(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_cleric');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_bishop');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionHumanProphet(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_cleric');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_prophet');
  });
  return buildCharacterClientSnapshot(row, userId);
}

//==== 3-тя профа (76+) ====

export async function performThirdProfessionHumanArchmage(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_sorcerer');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_archmage');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionHumanSoultaker(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_necromancer');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_soultaker');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionHumanArcanaLord(
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
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionHumanCardinal(
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
    assertHumanMysticRow(row);
    requireCurrentProf(row, 'human_bishop');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'human_cardinal');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionHumanHierophant(
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
  return buildCharacterClientSnapshot(row, userId);
}
