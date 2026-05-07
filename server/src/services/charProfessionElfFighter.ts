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
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';

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
): Promise<CharacterSnapshot> {
  const updated = await tx.character.updateMany({
    where: { id: charId, userId, revision: expectedRevision },
    data: { l2Profession: next, revision: { increment: 1 } },
  });
  if (updated.count === 0) throw new GameConflictError();
  const n = await tx.character.findUniqueOrThrow({ where: { id: charId } });
  return toSnapshot(n as CharacterRow);
}

//==== 1-ша профа (20+) ====

export async function performFirstProfessionElfElvenKnight(
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
    assertElfFighter(row);
    requireProf(row, 'elf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_elven_knight');
  });
}

export async function performFirstProfessionElfElvenScout(
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
    assertElfFighter(row);
    requireProf(row, 'elf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_elven_scout');
  });
}

//==== 2-га профа (40+) — лицар / скаут ====

export async function performSecondProfessionElfTempleKnight(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_knight');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_temple_knight');
  });
}

export async function performSecondProfessionElfSwordsinger(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_knight');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_swordsinger');
  });
}

export async function performSecondProfessionElfPlainswalker(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_scout');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_plainswalker');
  });
}

export async function performSecondProfessionElfSilverRanger(
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
    assertElfFighter(row);
    requireProf(row, 'elf_elven_scout');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_silver_ranger');
  });
}

//==== 3-тя профа (76+) ====

export async function performThirdProfessionElfEvasTemplar(
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
    assertElfFighter(row);
    requireProf(row, 'elf_temple_knight');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_evas_templar');
  });
}

export async function performThirdProfessionElfSwordMuse(
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
    assertElfFighter(row);
    requireProf(row, 'elf_swordsinger');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_sword_muse');
  });
}

export async function performThirdProfessionElfWindRider(
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
    assertElfFighter(row);
    requireProf(row, 'elf_plainswalker');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'elf_wind_rider');
  });
}

export async function performThirdProfessionElfMoonlightSentinel(
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
}
