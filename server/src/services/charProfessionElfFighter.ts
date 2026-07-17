/**
 * Ельф-воїн (Elven Fighter) — гілки l2db Interlude без GoD.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  HUMAN_FIGHTER_PRO_WARRIOR_LEVEL,
  HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
  HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { isL2ElfRace } from '../data/l2dopHumanMysticBattleSkills.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function assertElfFighter(row: CharacterRow): void {
  if (!isL2ElfRace(row.race) || !isFighterClassBranch(row.classBranch)) {
    throw new Error('profession_wrong_branch');
  }
}

function requireLv(lv: number, need: number): void {
  if (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ) return;
  if (lv < need) throw new Error('profession_requires_level');
}

function requireProf(row: CharacterRow, expected: string): void {
  if (resolveL2ProfessionForSkillsRow(row) !== expected) {
    throw new Error('profession_wrong_branch');
  }
}

async function commitProf(
  tx: Prisma.TransactionClient,
  charId: string,
  userId: string,
  expectedRevision: number,
  next: string
): Promise<CharacterRow> {
  void userId;
  const result = await mutateCharacterWithRevision(
    tx,
    charId,
    expectedRevision,
    () => ({
      changed: true,
      data: { l2Profession: next },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  return result.character as CharacterRow;
}

//==== 1-ша профа (20+) ====

export async function performFirstProfessionElfElvenKnight(
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
    assertElfFighter(row);
    requireProf(row, 'elf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_elven_knight');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performFirstProfessionElfElvenScout(
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
    assertElfFighter(row);
    requireProf(row, 'elf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_elven_scout');
  });
  return buildCharacterClientSnapshot(row, userId);
}

//==== 2-га профа (40+) — лицар / скаут ====

export async function performSecondProfessionElfTempleKnight(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_knight');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_temple_knight');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionElfSwordsinger(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_knight');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_swordsinger');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionElfPlainswalker(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_scout');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_plainswalker');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionElfSilverRanger(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_scout');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_silver_ranger');
  });
  return buildCharacterClientSnapshot(row, userId);
}

//==== 3-тя профа (76+) ====

export async function performThirdProfessionElfEvasTemplar(
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
    assertElfFighter(row);
    requireProf(row, 'elf_temple_knight');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_evas_templar');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionElfSwordMuse(
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
    assertElfFighter(row);
    requireProf(row, 'elf_swordsinger');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_sword_muse');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionElfWindRider(
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
    assertElfFighter(row);
    requireProf(row, 'elf_plainswalker');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_wind_rider');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionElfMoonlightSentinel(
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
    assertElfFighter(row);
    requireProf(row, 'elf_silver_ranger');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(
      tx,
      char.id,
      userId,
      expectedRevision,
      'elf_moonlight_sentinel'
    );
  });
  return buildCharacterClientSnapshot(row, userId);
}
