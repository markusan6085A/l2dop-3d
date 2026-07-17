/**
 * Гном-воїн (Dwarven Fighter) — Scavenger / Artisan, l2db Interlude без GoD.
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
import { isL2DwarfRace } from '../data/l2dopHumanMysticBattleSkills.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function assertDwarfFighter(row: CharacterRow): void {
  if (!isL2DwarfRace(row.race) || !isFighterClassBranch(row.classBranch)) {
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

export async function performFirstProfessionDwarfScavenger(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_scavenger');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performFirstProfessionDwarfArtisan(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_artisan');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionDwarfBountyHunter(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_scavenger');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dwarf_bounty_hunter'
    );
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performSecondProfessionDwarfWarsmith(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_artisan');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_warsmith');
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionDwarfFortuneSeeker(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_bounty_hunter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dwarf_fortune_seeker'
    );
  });
  return buildCharacterClientSnapshot(row, userId);
}

export async function performThirdProfessionDwarfMaestro(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_warsmith');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_maestro');
  });
  return buildCharacterClientSnapshot(row, userId);
}
