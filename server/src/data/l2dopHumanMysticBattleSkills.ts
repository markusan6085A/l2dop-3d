/**
 * Бойові константи гілки mystic (людина-маг / Human Mystic).
 */
import type { BattleActionId } from '../domain/battle.js';
import { learnedMysticHotbarPickSkills } from './humanMysticSkillCatalog.js';

/** Spellcraft (l2_163): у повній мантії — нормальна швидкість касту; без броні / light / heavy — −50%. */
export const MYSTIC_SPELLCRAFT_L2_SKILL_ID = 163;
export const MYSTIC_SPELLCRAFT_NON_ROBE_CAST_MUL = 0.5;

/** Mana Recovery (l2_214): +20% регенерації MP у повній мантії (верх + низ). */
export const MYSTIC_MANA_RECOVERY_L2_SKILL_ID = 214;
export const MYSTIC_MANA_RECOVERY_ROBE_MP_REGEN_MUL = 1.2;

/** Self Heal (l2_1216): flat +42 HP собі, каст 5 с, відкат 10 с, MP 9. */
export const MYSTIC_SELF_HEAL_L2_SKILL_ID = 1216;
export const MYSTIC_SELF_HEAL_POWER = 42;
export const MYSTIC_SELF_HEAL_MP_COST = 9;
export const MYSTIC_SELF_HEAL_CAST_SEC = 5;
export const MYSTIC_SELF_HEAL_REUSE_SEC = 10;

/** Wind Strike (l2_1177): магічний bolt вітром, дальність 600, каст 4 с, відкат 6 с. */
export const MYSTIC_WIND_STRIKE_L2_SKILL_ID = 1177;
export const MYSTIC_WIND_STRIKE_RANGE = 600;
export const MYSTIC_WIND_STRIKE_CAST_SEC = 4;
export const MYSTIC_WIND_STRIKE_REUSE_SEC = 6;

/** Battle Heal (l2_1015): зцілення цілі, дальність 600, каст 2 с, відкат 3 с (ранги 1–3). */
export const MYSTIC_BATTLE_HEAL_L2_SKILL_ID = 1015;
export const MYSTIC_BATTLE_HEAL_RANGE = 600;
export const MYSTIC_BATTLE_HEAL_CAST_SEC = 2;
export const MYSTIC_BATTLE_HEAL_REUSE_SEC = 3;

/** Group Heal (l2_1027): зцілення групи, радіус 1000, каст 7 с, відкат 25 с. */
export const MYSTIC_GROUP_HEAL_L2_SKILL_ID = 1027;
export const MYSTIC_GROUP_HEAL_RADIUS = 1000;
export const MYSTIC_GROUP_HEAL_CAST_SEC = 7;
export const MYSTIC_GROUP_HEAL_REUSE_SEC = 25;

/** Ice Bolt (l2_1184): магічний bolt водою, дальність 600, каст 3,1 с, відкат 8 с. */
export const MYSTIC_ICE_BOLT_L2_SKILL_ID = 1184;
export const MYSTIC_ICE_BOLT_RANGE = 600;
export const MYSTIC_ICE_BOLT_CAST_SEC = 3.1;
export const MYSTIC_ICE_BOLT_REUSE_SEC = 8;

/** Curse: Weakness (l2_1164): дебаф P.Atk, дальність 600, каст 1,5 с, відкат 8 с. */
export const MYSTIC_CURSE_WEAKNESS_L2_SKILL_ID = 1164;
export const MYSTIC_CURSE_WEAKNESS_RANGE = 600;
export const MYSTIC_CURSE_WEAKNESS_CAST_SEC = 1.5;
export const MYSTIC_CURSE_WEAKNESS_REUSE_SEC = 8;

/** Стартові вивчені скіли мага (Human — для сумісності; нові персонажі — `mysticStarterLearnedSkillsForRace`). */
export const MYSTIC_STARTER_LEARNED_SKILLS = [
  { battleId: 'l2_1177', level: 1 },
  { battleId: 'l2_163', level: 1 },
] as const;

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
