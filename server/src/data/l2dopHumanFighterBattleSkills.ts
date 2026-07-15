/**
 * Бойові скіли людини-воїна.
 * Таблиці MP/power для атак — з text-rpg (`src/data/skills/classes/HumanFighter/...`).
 * Power Strike (id 3) — ряди як у l2dop/XML (у text-rpg Skill_0003 помилково підписаний).
 */
import type { InventoryState } from './inventory.js';
import { normalizeEqSlot } from './inventory.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import type { BattleActionId } from '../domain/battle.js';
import type { GmShopGrade } from './l2dopGmShopCatalog.generated.js';
import { gmShopGradeForWeaponItemId } from './l2dopItemGradeRank.js';
import {
  isL2DarkElfRace,
  isL2ElfRace,
  isL2OrcRace,
  isMysticClassBranch,
} from './l2dopHumanMysticBattleSkills.js';
import { mapFighterProfessionToHumanSkillCatalog } from './fighterProfessionHumanCatalogMap.js';

/** Тип зброї в l1 (для Whirlwind — лише `pole`). */
function equippedRightHandSlot(inv: InventoryState) {
  const eq = inv.eq || {};
  return (
    normalizeEqSlot(eq.l1) ||
    normalizeEqSlot(eq.rhand) ||
    normalizeEqSlot(eq.weapon)
  );
}

/** Тип зброї в l1 (для Whirlwind — лише `pole`). */
export function equippedWeaponKind(inv: InventoryState): string | undefined {
  const w = equippedRightHandSlot(inv);
  const id = w?.itemId;
  if (typeof id !== 'number' || id <= 0) return undefined;
  return ITEM_CATALOG[id]?.weaponType;
}

/** Грейд зброї в правій руці — лише якщо предмет у каталозі як зброя (`weaponType`). */
export function equippedWeaponGmGrade(
  inv: InventoryState
): GmShopGrade | undefined {
  const w = equippedRightHandSlot(inv);
  const id = w?.itemId;
  if (typeof id !== 'number' || id <= 0) return undefined;
  if (!ITEM_CATALOG[id]?.weaponType) return undefined;
  return gmShopGradeForWeaponItemId(id);
}

/** Мін. рівень персонажа для Power Strike (перший ряд XML / магістр). */
export const HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL = 5;
/** Mortal Blow / Power Shot — перший ранг у text-rpg (Skill_0016, Skill_0056). */
export const HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL = 3;
/** Сумісність: старі перевірки «базової атаки» = Power Strike. */
export const HUMAN_FIGHTER_BASE_COMBAT_SKILL_MIN_LEVEL =
  HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL;
/** Мін. рівень для Whirlwind (36) — text-rpg skill_0036, ранг 1. */
export const HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL = 40;
/** Stun Attack (100) — text-rpg Warrior/Skill_0100, ранг 1. */
export const HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL = 20;

/** 1-ша профа (Warrior) — рівень отримання класу в L2 / l2dop. */
export const HUMAN_FIGHTER_PRO_WARRIOR_LEVEL = 20;

/**
 * Тимчасово для тестів: не вимагати мін. рівень для воїнських скілів, скилбару та зміни профи Fighter→Warrior.
 * Перед продом — встановити `false`.
 */
/** false на prod (guard у productionGuards.ts). true лише для локального/закритого тесту скілів. */
export const HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ = false;
/** Друга професія (Warlord на гілці алебарди) — мін. рівень як у IL (~40). */
export const HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL = 40;
/** 3-тя профа гілок воїна (Dreadnought, Duelist, Phoenix/Hell, Adventurer, Sagittarius) — мін. 76 р. */
export const HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL = 76;

/**
 * Канон дерева людини-воїна (l2db / Interlude): кожен етап — квест + новий рівень могутності.
 * 1) Спис і дуали: Fighter → Warrior (20) → Warlord | Gladiator (40) → Dreadnought | Duelist (76).
 * 2) Танки: Fighter → Human Knight (20) → Paladin | Dark Avenger (40) → Phoenix Knight | Hell Knight (76).
 * 3) Ножі й лук: Fighter → Rogue (20) → Treasure Hunter | Hawkeye (40) → Adventurer | Sagittarius (76).
 */

export function isHumanFighter(race: string, classBranch: string): boolean {
  return (
    String(race).trim().toLowerCase() === 'human' &&
    String(classBranch).toLowerCase().trim() === 'fighter'
  );
}

/** Будь-який воїн (у т.ч. не-Human): ті самі battle actions / резолвер, що й у людини-fighter. */
export function isFighterClassBranch(classBranch: string): boolean {
  return String(classBranch).toLowerCase().trim() === 'fighter';
}

/** Стартова l2Profession воїна за расою (Interlude). */
export function defaultFighterBaseProfessionForRace(race: string): string {
  const r = String(race ?? '').trim().toLowerCase();
  if (r === 'elf') return 'elf_fighter';
  if (r === 'dark elf') return 'dark_elf_fighter';
  if (r === 'orc') return 'orc_fighter';
  if (r === 'dwarf') return 'dwarf_fighter';
  return 'human_fighter';
}

const HUMAN_MYSTIC_L2_PROFESSIONS = new Set([
  'human_mage',
  'human_wizard',
  'human_cleric',
  'human_sorcerer',
  'human_necromancer',
  'human_warlock',
  'human_bishop',
  'human_prophet',
  'human_archmage',
  'human_soultaker',
  'human_arcana_lord',
  'human_cardinal',
  'human_hierophant',
]);

const ELF_MYSTIC_IDS = new Set([
  'elf_mage',
  'elf_elven_wizard',
  'elf_elven_oracle',
  'elf_elemental_summoner',
  'elf_spellsinger',
  'elf_elven_elder',
  'elf_elemental_master',
  'elf_mystic_muse',
  'elf_evas_saint',
]);

const DARK_MYSTIC_IDS = new Set([
  'dark_elf_mage',
  'dark_elf_dark_wizard',
  'dark_elf_shillien_oracle',
  'dark_elf_phantom_summoner',
  'dark_elf_spellhowler',
  'dark_elf_shillien_elder',
  'dark_elf_spectral_master',
  'dark_elf_storm_screamer',
  'dark_elf_shillien_saint',
]);

const ORC_MYSTIC_IDS = new Set([
  'orc_mage',
  'orc_shaman',
  'orc_overlord',
  'orc_warcryer',
  'orc_dominator',
  'orc_doomcryer',
]);

/** Чи підходить `l2Profession` для бойової гілки цієї раси (не mystic). */
export function fighterProfessionAllowedForRace(
  prof: string,
  raceNorm: string
): boolean {
  const p = String(prof || '').trim();
  if (!p) return false;
  if (raceNorm === 'human') {
    return p.startsWith('human_') && !HUMAN_MYSTIC_L2_PROFESSIONS.has(p);
  }
  if (raceNorm === 'elf') {
    return p.startsWith('elf_') && !ELF_MYSTIC_IDS.has(p);
  }
  if (raceNorm === 'dark elf') {
    return p.startsWith('dark_elf_') && !DARK_MYSTIC_IDS.has(p);
  }
  if (raceNorm === 'orc') {
    return p.startsWith('orc_') && !ORC_MYSTIC_IDS.has(p);
  }
  if (raceNorm === 'dwarf') return p.startsWith('dwarf_');
  return false;
}

/**
 * Професія для каталогу магістра / `skillsLearnedJson`: гілка mystic → `human_mage` / `elf_mage`,
 * якщо в БД ще залишився дефолт `human_fighter`.
 */
export function resolveL2ProfessionForSkillsRow(row: {
  l2Profession?: string | null;
  classBranch?: string | null;
  race?: string | null;
}): string {
  /** Узгоджено з ключами MAP / перевірками гілок (у БД інколи інший регістр). */
  const raw =
    typeof row.l2Profession === 'string' && row.l2Profession.trim()
      ? row.l2Profession.trim().toLowerCase()
      : '';
  if (isMysticClassBranch(String(row.classBranch ?? ''))) {
    const r = String(row.race ?? '').trim();
    if (isL2ElfRace(r)) {
      if (
        !raw ||
        raw === 'human_fighter' ||
        raw === 'human_mage' ||
        raw.startsWith('dark_elf_') ||
        raw.startsWith('orc_')
      ) {
        return 'elf_mage';
      }
      return raw;
    }
    if (isL2DarkElfRace(r)) {
      if (
        !raw ||
        raw === 'human_fighter' ||
        raw === 'human_mage' ||
        raw === 'elf_mage' ||
        raw.startsWith('elf_') ||
        raw.startsWith('orc_')
      ) {
        return 'dark_elf_mage';
      }
      return raw;
    }
    if (isL2OrcRace(r)) {
      if (
        !raw ||
        raw === 'human_fighter' ||
        raw === 'human_mage' ||
        raw === 'elf_mage' ||
        raw.startsWith('elf_') ||
        raw.startsWith('dark_elf_')
      ) {
        return 'orc_mage';
      }
      return raw;
    }
    if (!raw || raw === 'human_fighter') return 'human_mage';
    if (raw.startsWith('elf_') || raw.startsWith('dark_elf_') || raw.startsWith('orc_')) {
      return 'human_mage';
    }
    return raw;
  }
  if (isFighterClassBranch(String(row.classBranch ?? ''))) {
    const r = String(row.race ?? '').trim().toLowerCase();
    const base = defaultFighterBaseProfessionForRace(String(row.race ?? ''));
    if (!raw || raw === 'human_fighter') {
      return base;
    }
    if (fighterProfessionAllowedForRace(raw, r)) return raw;
    return base;
  }
  return raw || 'human_fighter';
}

//==== Power Strike · skill id 3 (0000-0099.xml) ====
const POWER_STRIKE_MAGIC_LVLS = [3, 4, 5, 8, 9, 10, 13, 14, 15] as const;
const POWER_STRIKE_MP = [10, 10, 11, 13, 13, 14, 17, 18, 19] as const;
const POWER_STRIKE_POW = [25, 27, 30, 39, 42, 46, 60, 65, 70] as const;

export function powerStrikeSkillIndex(playerLevel: number): number {
  let idx = -1;
  for (let i = 0; i < POWER_STRIKE_MAGIC_LVLS.length; i++) {
    if (playerLevel >= POWER_STRIKE_MAGIC_LVLS[i]!) idx = i;
  }
  return Math.max(0, idx);
}

export function powerStrikeMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): {
  mp: number;
  power: number;
} | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL)
    : playerLevel;
  const iLv = powerStrikeSkillIndex(lv);
  const i = clampSkillTableIndex(
    iLv,
    skillRank,
    POWER_STRIKE_MP.length
  );
  return { mp: POWER_STRIKE_MP[i]!, power: POWER_STRIKE_POW[i]! };
}

function skillRowIndex(
  playerLevel: number,
  magicLvls: readonly number[]
): number {
  let idx = -1;
  for (let i = 0; i < magicLvls.length; i++) {
    if (playerLevel >= magicLvls[i]!) idx = i;
  }
  return Math.max(0, idx);
}

/** Якщо ранг з БД не передали — ефективно без обмеження зверху (старі виклики). */
const DEFAULT_SKILL_RANK_CAP = 999;

/**
 * Обмежує індекс рядка таблиці MP/power: сила не вища за ранг скіла (ранг 1 → перший ряд).
 * Рівень персонажа задає «доступні» ряди знизу; ранг — верхню межу.
 */
export function clampSkillTableIndex(
  indexFromLevel: number,
  skillRank: number,
  tableLength: number
): number {
  const maxI = Math.max(0, tableLength - 1);
  const r = Math.max(1, Math.floor(skillRank));
  const capFromRank = Math.min(r - 1, maxI);
  const iLv = Math.max(0, Math.min(indexFromLevel, maxI));
  return Math.min(iLv, capFromRank);
}

//==== Whirlwind · id 36 — text-rpg Warlord/skill_0036 (37 рангів) ====
const WARLORD_AREA_MAGIC_LVLS = [
  40, 40, 40, 43, 43, 43, 46, 46, 46, 49, 49, 49, 52, 52, 52, 55, 55, 55, 58,
  58, 58, 60, 60, 62, 62, 64, 64, 66, 66, 68, 68, 70, 70, 72, 72, 74, 74,
] as const;
const WHIRLWIND_MP = [
  40, 41, 43, 43, 44, 45, 47, 48, 49, 51, 52, 54, 55, 55, 56, 58, 59, 61, 62,
  63, 65, 66, 68, 68, 69, 70, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83,
] as const;
const WHIRLWIND_POW = [
  369, 392, 417, 442, 469, 496, 525, 555, 586, 618, 651, 686, 722, 758, 796,
  835, 875, 916, 959, 1002, 1046, 1091, 1136, 1183, 1230, 1278, 1327, 1376,
  1425, 1475, 1525, 1576, 1626, 1677, 1727, 1777, 1827,
] as const;

export function whirlwindMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL)
    : playerLevel;
  const iLv = skillRowIndex(lv, WARLORD_AREA_MAGIC_LVLS);
  const i = clampSkillTableIndex(iLv, skillRank, WHIRLWIND_MP.length);
  return { mp: WHIRLWIND_MP[i]!, power: WHIRLWIND_POW[i]! };
}

/** Множник PDAM за l2Profession (джерело правди — БД), не за «лічильником рівня без профи». */
export function humanFighterProfessionAtkMult(
  _playerLevel: number,
  l2Profession: string
): number {
  const p = mapFighterProfessionToHumanSkillCatalog(String(l2Profession || '').trim());
  if (
    p === 'human_dreadnought' ||
    p === 'human_duelist' ||
    p === 'human_phoenix_knight' ||
    p === 'human_hell_knight' ||
    p === 'human_adventurer'
  )
    return 1.11;
  if (
    p === 'human_warlord' ||
    p === 'human_gladiator' ||
    p === 'human_paladin' ||
    p === 'human_dark_avenger' ||
    p === 'human_treasure_hunter'
  )
    return 1.09;
  if (p === 'human_warrior' || p === 'human_knight' || p === 'human_rogue')
    return 1.05;
  if (p === 'human_hawkeye') return 1.09;
  if (p === 'human_sagittarius') return 1.11;
  return 1;
}

//==== Mortal Blow · id 16 — text-rpg HumanFighter/common/Skill_0016 ====
const MORTAL_MAGIC = [3, 4, 5, 8, 9, 10, 13, 14, 15] as const;
const MORTAL_MP = [9, 9, 10, 11, 12, 13, 16, 16, 17] as const;
const MORTAL_POW = [73, 80, 88, 115, 126, 137, 178, 193, 210] as const;

export function mortalBlowMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL)
    : playerLevel;
  const iLv = skillRowIndex(lv, MORTAL_MAGIC);
  const i = clampSkillTableIndex(iLv, skillRank, MORTAL_MP.length);
  return { mp: MORTAL_MP[i]!, power: MORTAL_POW[i]! };
}

//==== Power Shot · id 56 — text-rpg HumanFighter/common/Skill_0056 ====
const POWER_SHOT_MAGIC = [3, 4, 5, 8, 9, 10, 13, 14, 15] as const;
const POWER_SHOT_MP = [19, 20, 21, 25, 26, 27, 34, 36, 37] as const;
const POWER_SHOT_POW = [65, 71, 78, 102, 112, 122, 158, 172, 187] as const;

export function powerShotMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL)
    : playerLevel;
  const iLv = skillRowIndex(lv, POWER_SHOT_MAGIC);
  const i = clampSkillTableIndex(iLv, skillRank, POWER_SHOT_MP.length);
  return { mp: POWER_SHOT_MP[i]!, power: POWER_SHOT_POW[i]! };
}

/** Double Shot (19) — наближено до Power Shot з text-rpg Hawkeye/Skill_0019. */
export function doubleShotMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  const ps = powerShotMpAndPower(playerLevel, skillRank);
  if (!ps) return null;
  return {
    mp: Math.max(1, Math.ceil(ps.mp * 1.22)),
    power: Math.floor(ps.power * 1.58),
  };
}

/** Burst Shot (24) — AoE у L2; тут один моб, орієнтир Hawkeye/Skill_0024. */
export function burstShotMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  const ps = powerShotMpAndPower(playerLevel, skillRank);
  if (!ps) return null;
  return {
    mp: Math.max(1, Math.ceil(ps.mp * 1.42)),
    power: Math.floor(ps.power * 1.12),
  };
}

//==== Stun Attack · id 100 — text-rpg HumanFighter/Warrior/Skill_0100 ====
const STUN_ATTACK_MAGIC = [
  20, 20, 20, 24, 24, 24, 28, 28, 28, 32, 32, 32, 36, 36, 36,
] as const;
const STUN_ATTACK_MP = [
  19, 19, 20, 21, 21, 22, 24, 25, 26, 27, 28, 29, 31, 32, 33,
] as const;
const STUN_ATTACK_POW = [
  36, 39, 42, 49, 53, 57, 66, 71, 77, 88, 94, 101, 115, 123, 131,
] as const;

export function stunAttackMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL)
    : playerLevel;
  const iLv = skillRowIndex(lv, STUN_ATTACK_MAGIC);
  const i = clampSkillTableIndex(iLv, skillRank, STUN_ATTACK_MP.length);
  return { mp: STUN_ATTACK_MP[i]!, power: STUN_ATTACK_POW[i]! };
}

//==== Aggression · id 28 — text-rpg HumanKnight/skill_0028 (рівень 1) ====
export const AGGR_MP = 20;
export const AGGR_POW = 18;

//==== Shield Stun · id 92 — text-rpg HumanKnight/skill_0092 ====
const BASH_MAGIC = [
  20, 20, 20, 24, 24, 24, 28, 28, 28, 32, 32, 32, 36, 36, 36,
] as const;
const BASH_MP = [
  22, 22, 22, 23, 24, 25, 27, 29, 30, 31, 31, 33, 35, 36, 37,
] as const;
const BASH_POW = [
  80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
] as const;

export function shieldBashMpAndPower(
  playerLevel: number
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_PRO_WARRIOR_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_PRO_WARRIOR_LEVEL)
    : playerLevel;
  const i = skillRowIndex(lv, BASH_MAGIC);
  return { mp: BASH_MP[i]!, power: BASH_POW[i]! };
}

//==== Armor Crush · 362 ====
const CRUSH_MAGIC = [32, 36, 40, 44, 48, 52, 56, 60] as const;
const CRUSH_MP = [24, 26, 28, 30, 32, 34, 36, 38] as const;
const CRUSH_POW = [42, 50, 58, 67, 76, 85, 94, 103] as const;

export function armorCrushMpAndPower(
  playerLevel: number
): { mp: number; power: number } | null {
  if (!HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && playerLevel < 32) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, 32)
    : playerLevel;
  const i = skillRowIndex(lv, CRUSH_MAGIC);
  return { mp: CRUSH_MP[i]!, power: CRUSH_POW[i]! };
}

//==== Warlord · Power Crush · skill id 920 (Interlude, pole) ====
const POWER_CRUSH_MAGIC = [
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
] as const;
const POWER_CRUSH_MP = [
  38, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
] as const;
const POWER_CRUSH_POW = [
  664, 706, 750, 795, 843, 893, 945, 998, 1054, 1112, 1172, 1234, 1298, 1365,
] as const;

export function powerCrushMpAndPower(
  playerLevel: number
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL)
    : playerLevel;
  const i = skillRowIndex(lv, POWER_CRUSH_MAGIC);
  return { mp: POWER_CRUSH_MP[i]!, power: POWER_CRUSH_POW[i]! };
}

//==== Thunder Storm · id 48 — text-rpg Warlord/skill_0048 ====
const THUNDER_STORM_MP = [
  40, 41, 43, 43, 44, 45, 47, 48, 49, 51, 52, 54, 55, 55, 56, 58, 59, 61, 62,
  63, 65, 66, 68, 68, 69, 70, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83,
] as const;
const THUNDER_STORM_POW = [
  123, 131, 139, 148, 157, 166, 175, 185, 196, 206, 217, 229, 241, 253, 266,
  279, 292, 306, 320, 334, 349, 364, 379, 395, 410, 426, 443, 459, 475, 492,
  509, 526, 542, 559, 576, 593, 609,
] as const;

export function thunderStormMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL)
    : playerLevel;
  const iLv = skillRowIndex(lv, WARLORD_AREA_MAGIC_LVLS);
  const i = clampSkillTableIndex(iLv, skillRank, THUNDER_STORM_MP.length);
  return { mp: THUNDER_STORM_MP[i]!, power: THUNDER_STORM_POW[i]! };
}

//==== Provoke · id 286 — text-rpg Warlord/skill_0286 ====
const PROVOKE_MP = [57, 75, 83] as const;
const PROVOKE_MIN_LV = [43, 55, 60] as const;

export function provokeMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (!HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && playerLevel < PROVOKE_MIN_LV[0]!) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, PROVOKE_MIN_LV[0]!)
    : playerLevel;
  let idx = 0;
  if (lv >= PROVOKE_MIN_LV[2]!) idx = 2;
  else if (lv >= PROVOKE_MIN_LV[1]!) idx = 1;
  idx = clampSkillTableIndex(idx, skillRank, PROVOKE_MP.length);
  return { mp: PROVOKE_MP[idx]!, power: 95 + idx * 12 };
}

//==== Wild Sweep · 245 — text-rpg Warrior/Skill_0245 ====
const WARRIOR_SKILL_TIER_MAGIC = [
  20, 20, 20, 24, 24, 24, 28, 28, 28, 32, 32, 32, 36, 36, 36,
] as const;
const WILD_SWEEP_MP = [
  19, 20, 20, 21, 22, 23, 25, 26, 27, 28, 28, 29, 32, 33, 34,
] as const;
const WILD_SWEEP_POW = [
  90, 97, 105, 123, 132, 143, 165, 177, 191, 219, 235, 251, 287, 306, 326,
] as const;

export function wildSweepMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_PRO_WARRIOR_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_PRO_WARRIOR_LEVEL)
    : playerLevel;
  const iLv = skillRowIndex(lv, WARRIOR_SKILL_TIER_MAGIC);
  const i = clampSkillTableIndex(iLv, skillRank, WILD_SWEEP_MP.length);
  return { mp: WILD_SWEEP_MP[i]!, power: WILD_SWEEP_POW[i]! };
}

/** Текст для магістра / UI на конкретному рівні Wild Sweep. */
export function wildSweepStatsNoteUk(rank: number): string {
  const row = wildSweepMpAndPower(HUMAN_FIGHTER_PRO_WARRIOR_LEVEL, rank);
  const lv = Math.max(1, Math.floor(rank));
  if (!row) {
    return 'Актив: урон кільком суперникам попереду. Лише спис або алебарда. Можливий надудар.';
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    ' скіла. Відкат: 17 с. Лише спис/алебарда; можливий надудар.'
  );
}

//==== Power Smash · 255 — text-rpg Warrior/Skill_0255 (ті самі magicLvl, інший power) ====
const POWER_SMASH_MP = WILD_SWEEP_MP;
const POWER_SMASH_POW = [
  90, 97, 105, 123, 132, 143, 165, 177, 191, 219, 235, 251, 287, 306, 326,
] as const;

export function powerSmashMpAndPower(
  playerLevel: number,
  skillRank: number = DEFAULT_SKILL_RANK_CAP
): { mp: number; power: number } | null {
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    playerLevel < HUMAN_FIGHTER_PRO_WARRIOR_LEVEL
  ) {
    return null;
  }
  const lv = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? Math.max(playerLevel, HUMAN_FIGHTER_PRO_WARRIOR_LEVEL)
    : playerLevel;
  const iLv = skillRowIndex(lv, WARRIOR_SKILL_TIER_MAGIC);
  const i = clampSkillTableIndex(iLv, skillRank, POWER_SMASH_MP.length);
  return { mp: POWER_SMASH_MP[i]!, power: POWER_SMASH_POW[i]! };
}

/** Stun Shot · 101 — text-rpg Rogue/Hawkeye Skill_0101 (ранги 1–3 ≈ L2 level 4–6). */
const STUN_SHOT_MP = [56, 58, 60] as const;
const STUN_SHOT_POW = [443, 471, 500] as const;

export function stunShotMpAndPower(skillRank: number): {
  mp: number;
  power: number;
} {
  const r = Math.max(
    1,
    Math.min(Math.floor(skillRank), STUN_SHOT_MP.length)
  );
  const i = r - 1;
  return { mp: STUN_SHOT_MP[i]!, power: STUN_SHOT_POW[i]! };
}

const BASE_FIGHTER_PROFESSION_IDS = new Set([
  'human_fighter',
  'elf_fighter',
  'dark_elf_fighter',
  'orc_fighter',
  'dwarf_fighter',
]);

export function humanFighterBattleSkillBar(
  level: number,
  learned: ReadonlySet<string>,
  weaponKind: string | undefined,
  l2Profession: string
): {
  id: BattleActionId;
  labelUk: string;
}[] {
  const prof = String(l2Profession || '').trim();
  /** Базовий Fighter будь-якої раси — без «дорослої» панелі, окрім тестового режиму. */
  const onWarriorTrack = !BASE_FIGHTER_PROFESSION_IDS.has(prof);
  const test = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ;
  /** У тесті — воїнські кнопки на бійці без профи; на гілці воїна — усі 1–2 профи. */
  const warriorBar = onWarriorTrack || test;
  const bar: { id: BattleActionId; labelUk: string }[] = [
    { id: 'attack', labelUk: 'Атака' },
  ];
  const lvOk = (min: number) => test || level >= min;
  const warSk = test || level >= HUMAN_FIGHTER_PRO_WARRIOR_LEVEL;
  const swordBlunt =
    weaponKind === 'sword' ||
    weaponKind === 'blunt' ||
    weaponKind === 'bigsword' ||
    weaponKind === 'bigblunt';
  const bluntWeapon =
    weaponKind === 'blunt' || weaponKind === 'bigblunt';
  if (
    lvOk(HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL) &&
    learned.has('l2_3')
  ) {
    bar.push({ id: 'power_strike', labelUk: 'Силовий удар · 3' });
  }
  if (
    lvOk(HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL) &&
    learned.has('l2_16')
  ) {
    bar.push({ id: 'mortal_blow', labelUk: 'Смертельний удар · 16' });
  }
  if (
    lvOk(HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL) &&
    learned.has('l2_56') &&
    weaponKind === 'bow'
  ) {
    bar.push({ id: 'power_shot', labelUk: 'Силовий постріл · 56 (лук)' });
  }
  if (
    warriorBar &&
    warSk &&
    lvOk(HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL) &&
    learned.has('l2_19') &&
    weaponKind === 'bow'
  ) {
    bar.push({ id: 'double_shot', labelUk: 'Подвійний постріл · 19 (лук)' });
  }
  if (
    warriorBar &&
    warSk &&
    lvOk(HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL) &&
    learned.has('l2_24') &&
    weaponKind === 'bow'
  ) {
    bar.push({ id: 'burst_shot', labelUk: 'Вибуховий залп · 24 (лук)' });
  }
  if (
    warriorBar &&
    warSk &&
    learned.has('l2_78')
  ) {
    bar.push({ id: 'war_cry', labelUk: 'Бойовий клич · 78' });
  }
  if (
    warriorBar &&
    warSk &&
    lvOk(HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL) &&
    learned.has('l2_100') &&
    bluntWeapon
  ) {
    bar.push({
      id: 'stun_attack',
      labelUk: 'Приголомшувальний удар · 100 (тупа)',
    });
  }
  if (
    warriorBar &&
    warSk &&
    lvOk(HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL) &&
    learned.has('l2_245') &&
    weaponKind === 'pole'
  ) {
    bar.push({ id: 'wild_sweep', labelUk: 'Дикий розмах · 245 (древко)' });
  }
  if (
    warriorBar &&
    warSk &&
    lvOk(HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL) &&
    learned.has('l2_255') &&
    swordBlunt
  ) {
    bar.push({ id: 'power_smash', labelUk: 'Розгром · 255 (меч/тупе)' });
  }
  const wwLvlOk = test || level >= HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL;
  const warlordLine =
    prof === 'human_warlord' ||
    prof === 'human_dreadnought' ||
    prof === 'orc_destroyer' ||
    prof === 'orc_titan' ||
    prof === 'dwarf_warsmith' ||
    prof === 'dwarf_maestro';
  if (
    warlordLine &&
    warriorBar &&
    wwLvlOk &&
    learned.has('l2_36') &&
    weaponKind === 'pole'
  ) {
    bar.push({ id: 'whirlwind', labelUk: 'Вихор · 36 (алебарда/спис)' });
  }
  const warlordSk = test || level >= HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL;
  if (
    warlordLine &&
    warlordSk &&
    learned.has('l2_48') &&
    weaponKind === 'pole'
  ) {
    bar.push({ id: 'thunder_storm', labelUk: 'Грозова буря · 48' });
  }
  if (
    warlordLine &&
    warlordSk &&
    learned.has('l2_286')
  ) {
    bar.push({ id: 'provoke', labelUk: 'Провокація масова · 286' });
  }
  return bar;
}

export function legacyMeleeSkillBar(): { id: BattleActionId; labelUk: string }[] {
  return [
    { id: 'attack', labelUk: 'Удар' },
    { id: 'power', labelUk: 'Сила' },
    { id: 'bolt', labelUk: 'Блискавка' },
    { id: 'stun', labelUk: 'Упр' },
  ];
}
