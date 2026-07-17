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
  gameConflictFromCharacter,
  gameConflictFromMutation,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

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

//==== 1-ша профа: orc_mage → Orc Shaman (20+) ====

export async function performFirstProfessionOrcShaman(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_shaman');
  });
  return buildCharacterClientSnapshot(row, userId);
}

//==== 2-га профа: Orc Shaman → Overlord | Warcryer (40+) ====

export async function performSecondProfessionOrcOverlord(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_shaman');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_overlord');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionOrcWarcryer(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_shaman');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_warcryer');
  });
  return buildCharacterClientSnapshot(row, userId);
}

//==== 3-тя профа (76+) ====

export async function performThirdProfessionOrcDominator(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_overlord');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_dominator');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionOrcDoomcryer(
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
    assertOrcMysticRow(row);
    requireCurrentProf(row, 'orc_warcryer');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(tx, char.id, userId, expectedRevision, 'orc_doomcryer');
  });
  return buildCharacterClientSnapshot(row, userId);
}
