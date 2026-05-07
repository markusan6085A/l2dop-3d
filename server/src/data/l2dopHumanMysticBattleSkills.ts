/**
 * Бойові константи гілки mystic (людина-маг / Human Mystic).
 */
import type { BattleActionId } from '../domain/battle.js';
import { learnedMysticHotbarPickSkills } from './humanMysticSkillCatalog.js';

/** 1-ша профа (Wizard / Cleric) — як у HF. */
export const HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL = 20;
export const HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL = 40;
export const HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL = 76;

/** Раса «людина» з форми / БД (без жорсткої прив’язки до регістру). */
export function isL2HumanRace(race: string): boolean {
  return String(race).trim().toLowerCase() === 'human';
}

/** Раса «ельф» (Elf) — для каталогу Elven Mystic. */
export function isL2ElfRace(race: string): boolean {
  return String(race).trim().toLowerCase() === 'elf';
}

/** Раса «темний ельф» (Dark Elf) — каталог Dark Mystic. */
export function isL2DarkElfRace(race: string): boolean {
  return String(race).trim().toLowerCase() === 'dark elf';
}

/** Раса «орк» (Orc) — каталог Orc Mystic. */
export function isL2OrcRace(race: string): boolean {
  return String(race).trim().toLowerCase() === 'orc';
}

/** Раса «гном» (Dwarf) — лише воїн у L2 / l2dop. */
export function isL2DwarfRace(race: string): boolean {
  return String(race).trim().toLowerCase() === 'dwarf';
}

export function defaultMysticL2ProfessionForRace(race: string): string {
  if (isL2ElfRace(race)) return 'elf_mage';
  if (isL2DarkElfRace(race)) return 'dark_elf_mage';
  if (isL2OrcRace(race)) return 'orc_mage';
  return 'human_mage';
}

export function isMysticClassBranch(classBranch: string): boolean {
  return String(classBranch).toLowerCase().trim() === 'mystic';
}

export function isHumanMystic(race: string, classBranch: string): boolean {
  return isL2HumanRace(race) && isMysticClassBranch(classBranch);
}

export function humanMysticBattleSkillBar(
  _level: number,
  learned: ReadonlySet<string>,
  l2Profession: string,
  race: string
): { id: BattleActionId; labelUk: string }[] {
  const prof = String(l2Profession || '').trim();
  const learnedArr = [...learned];
  /** Базова атака; магічні — лише з `skillsLearnedJson` (стартовий l2_1177 тощо). */
  const bar: { id: BattleActionId; labelUk: string }[] = [
    { id: 'attack', labelUk: 'Атака' },
  ];
  const seen = new Set(bar.map((b) => String(b.id)));
  for (const row of learnedMysticHotbarPickSkills(learnedArr, prof, race)) {
    const idStr = String(row.id);
    if (seen.has(idStr)) continue;
    seen.add(idStr);
    bar.push({ id: row.id, labelUk: row.labelUk });
  }
  return bar;
}

export function mysticBattleActionAllowed(
  action: BattleActionId,
  level: number,
  learnedBattle: string[],
  l2Profession: string,
  race: string
): boolean {
  const prof = String(l2Profession || '').trim();
  const learned = new Set(learnedBattle.map((x) => x.trim()));
  if (
    humanMysticBattleSkillBar(level, learned, prof, race).some(
      (s) => s.id === action
    )
  ) {
    return true;
  }
  return learnedMysticHotbarPickSkills(learnedBattle, prof, race).some(
    (s) => s.id === action
  );
}
