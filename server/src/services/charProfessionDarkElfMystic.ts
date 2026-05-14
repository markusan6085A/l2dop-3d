/**
 * Зміна l2Profession для гілки темного ельфа-мага (l2db / Interlude, без квестів).
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
  isL2DarkElfRace,
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import {
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function assertDarkElfMysticRow(row: CharacterRow): void {
  if (!isL2DarkElfRace(row.race) || !isMysticClassBranch(row.classBranch)) {
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

//==== 1-ша профа: dark_elf_mage → Dark Wizard | Shillien Oracle (20+) ====

export async function performFirstProfessionDarkElfDarkWizard(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_dark_wizard'
    );
  });
}

export async function performFirstProfessionDarkElfShillienOracle(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_mage');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_shillien_oracle'
    );
  });
}

//==== 2-га профа: гілка чарівника (40+) ====

export async function performSecondProfessionDarkElfPhantomSummoner(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_dark_wizard');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_phantom_summoner'
    );
  });
}

export async function performSecondProfessionDarkElfSpellhowler(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_dark_wizard');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_spellhowler'
    );
  });
}

//==== 2-га профа: гілка жреця (40+) ====

export async function performSecondProfessionDarkElfShillienElder(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_shillien_oracle');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_shillien_elder'
    );
  });
}

//==== 3-тя профа (76+) ====

export async function performThirdProfessionDarkElfSpectralMaster(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_phantom_summoner');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_spectral_master'
    );
  });
}

export async function performThirdProfessionDarkElfStormScreamer(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_spellhowler');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_storm_screamer'
    );
  });
}

export async function performThirdProfessionDarkElfShillienSaint(
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
    assertDarkElfMysticRow(row);
    requireCurrentProf(row, 'dark_elf_shillien_elder');
    requireLevelAtLeast(
      levelFromTotalExp(char.exp),
      HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL
    );
    return commitL2Profession(
      tx,
      char.id,
      userId,
      expectedRevision,
      'dark_elf_shillien_saint'
    );
  });
}
