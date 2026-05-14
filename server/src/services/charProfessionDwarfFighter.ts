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
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
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
): Promise<CharacterSnapshot> {
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
  if (!result.ok) throw new GameConflictError();
  return toSnapshot(result.character as CharacterRow);
}

export async function performFirstProfessionDwarfScavenger(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_scavenger');
  });
}

export async function performFirstProfessionDwarfArtisan(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_fighter');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_WARRIOR_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_artisan');
  });
}

export async function performSecondProfessionDwarfBountyHunter(
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
}

export async function performSecondProfessionDwarfWarsmith(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_artisan');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_warsmith');
  });
}

export async function performThirdProfessionDwarfFortuneSeeker(
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
}

export async function performThirdProfessionDwarfMaestro(
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
    assertDwarfFighter(row);
    requireProf(row, 'dwarf_warsmith');
    requireLv(levelFromTotalExp(char.exp), HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL);
    return commitProf(tx, char.id, userId, expectedRevision, 'dwarf_maestro');
  });
}
