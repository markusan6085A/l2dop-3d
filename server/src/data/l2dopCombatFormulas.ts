/**
 * Формули з l2dop/calc_stats.php + таблиці модифікаторів з l2dop/rawdata.php.
 * Екіп: сумуємо pDef з броні (l3, l4, lh, lg, lf), pAtk/mAtk зброї (l1) — наближення до $apdef у PHP.
 *
 * У PHP BaseSTR… фіксовані по расі; додаткові очки з БД (хенна тощо). У нас без розподілу поінтів
 * застосовується baseSixForLevel — автоматичний ріст шести статів з рівнем, інакше лише LVLMOD
 * дає ~1% P.Atk на рівень і стати в UI «мертві».
 */
import type { InventoryState } from './inventory.js';
import {
  ARMOR_PDEF_EQ_KEYS,
  normalizeEqSlot,
  parseInventory,
} from './inventory.js';
import {
  armorPiecePDefEnchantBonus,
  weaponMatkEnchantBonus,
  weaponPatkEnchantBonus,
  type WeaponKindForEnchant,
} from './l2dopEnchant.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import { dropsShieldPatchForEquipped } from './l2dopDropsShieldPatches.js';
import { itemBlocksShieldSlot } from './l2dopTwoHandedWeapon.js';
import { combatSpeedFromWeaponAtkSpd } from '../domain/weaponCombatSpeed.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
  partialCombatBuffDeltaFromNeutral,
  type L2dopCombatBuffModifiers,
} from './l2dopCombatBuffModifiers.js';
import {
  armorSetTotalsToCombatDelta,
  legacyFullArmorSetBonusDelta,
  resolveEquippedArmorSetBonuses,
} from './armorSetResolver.js';
import { inferWeaponGradeMatchesArmor } from './l2dopItemGradeRank.js';
import {
  buffWeaponContextFromInv,
  combatBuffsFromActiveJson,
  type BuffExtraContext,
} from './l2dopActiveBuffs.js';
import { learnedPassivesBuffDelta } from './l2dopLearnedPassivesBuffs.js';
import { learnedMysticPassivesBuffDelta } from './l2dopLearnedMysticPassives.js';
import { learnedRaceFighterPassivesBuffDelta } from './l2dopLearnedRaceFighterPassives.js';
import { raceFighterToggleStanceCombatDelta } from './l2dopRaceToggleStanceDelta.js';
import { parseWorldCombatState } from '../domain/worldCombatState.js';
import { normalizeLearnedSkillsJson } from './humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from './charLearnedSkillsFilter.js';
import { resolveL2ProfessionForSkillsRow } from './l2dopHumanFighterBattleSkills.js';
import {
  clampMagicCritDmgMulForDamage,
  computePrimaryStatMultipliers,
  conHpMultiplier,
  critRateStatFromPhysicalCritPct,
  debuffResistPctFromMen,
  magicCritChancePct,
  menMpMultiplier,
  physicalCritChancePct,
  stunResistPctFromCon,
} from './l2dopPrimaryStatPipeline.js';

// rawdata.php — $MENMODIFIER (реген MP у calc_stats; класичний M.Def кілець лишається окремо)
export const MENMODIFIER: number[] = [
  0, 1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.11, 1.12, 1.13,
  1.14, 1.15, 1.16, 1.17, 1.19, 1.2, 1.21, 1.22, 1.23, 1.25, 1.26, 1.27, 1.28,
  1.3, 1.31, 1.32, 1.34, 1.35, 1.36, 1.38, 1.39, 1.4, 1.42, 1.43, 1.45, 1.46,
  1.48, 1.49, 1.5, 1.52, 1.53, 1.55, 1.57, 1.58, 1.6, 1.61, 1.63, 1.65,
];

// rawdata.php — $CONMODIFIER
export const CONMODIFIER: number[] = [
  0, 0.46, 0.47, 0.48, 0.5, 0.51, 0.53, 0.54, 0.56, 0.58, 0.59, 0.61, 0.63,
  0.65, 0.67, 0.69, 0.71, 0.73, 0.75, 0.77, 0.8, 0.82, 0.85, 0.87, 0.9, 0.93,
  0.95, 0.98, 1.01, 1.04, 1.07, 1.1, 1.14, 1.17, 1.21, 1.24, 1.28, 1.32, 1.36,
  1.4, 1.44, 1.48, 1.53, 1.58, 1.62, 1.67, 1.72, 1.77, 1.83, 1.88, 1.94, 2.0,
  2.06, 2.12, 2.18, 2.25, 2.31, 2.38, 2.45, 2.53, 2.6,
];

/** Коди рас як у calc_stats.php ($race) */
export type L2dopRaceCode =
  | 'HF'
  | 'HM'
  | 'EF'
  | 'EM'
  | 'DF'
  | 'DM'
  | 'OF'
  | 'OM'
  | 'DW';

export interface BaseSix {
  str: number;
  int: number;
  dex: number;
  wit: number;
  con: number;
  men: number;
}

/** calc_stats.php: базові STR/INT/… по расах (рівень 1, без бонусів рівня). */
function baseSixForRace(code: L2dopRaceCode): BaseSix {
  switch (code) {
    case 'HF':
      return { str: 40, con: 43, dex: 30, int: 21, wit: 11, men: 25 };
    case 'HM':
      return { str: 22, con: 27, dex: 21, int: 41, wit: 20, men: 39 };
    case 'EF':
      return { str: 36, con: 36, dex: 35, int: 23, wit: 14, men: 26 };
    case 'EM':
      return { str: 21, con: 25, dex: 24, int: 37, wit: 23, men: 40 };
    case 'DF':
      return { str: 41, con: 32, dex: 34, int: 25, wit: 12, men: 26 };
    case 'DM':
      return { str: 23, con: 24, dex: 23, int: 44, wit: 19, men: 37 };
    case 'OF':
      return { str: 40, con: 47, dex: 26, int: 18, wit: 12, men: 27 };
    case 'OM':
      return { str: 27, con: 31, dex: 24, int: 31, wit: 15, men: 42 };
    case 'DW':
      return { str: 39, con: 45, dex: 29, int: 20, wit: 10, men: 27 };
    default:
      return { str: 40, con: 43, dex: 30, int: 21, wit: 11, men: 25 };
  }
}

export function raceAndBranchToL2Code(
  race: string,
  classBranch: string
): L2dopRaceCode {
  const r = String(race || '').trim();
  const mystic = String(classBranch || '').toLowerCase() === 'mystic';
  if (/^human$/i.test(r)) return mystic ? 'HM' : 'HF';
  if (/^elf$/i.test(r) && !/^dark/i.test(r)) return mystic ? 'EM' : 'EF';
  if (/dark\s*elf/i.test(r)) return mystic ? 'DM' : 'DF';
  if (/^orc$/i.test(r)) return mystic ? 'OM' : 'OF';
  if (/^dwarf$/i.test(r)) return mystic ? 'HM' : 'DW';
  return mystic ? 'HM' : 'HF';
}

export function modAt(arr: number[], stat: number): number {
  const i = Math.max(0, Math.min(Math.floor(stat), arr.length - 1));
  return arr[i] ?? 1;
}

/** calc_stats.php: $LVLMOD=($LVL+89)/100 */
export function lvlMod(level: number): number {
  const LVL = Math.max(1, Math.floor(level));
  return (LVL + 89) / 100;
}

/**
 * calc_stats.php 4635–4673: коефіцієнти basehpregen2 / basempregen2 / basecpregen2 по рівню.
 * Далі 4683–4687: hpregen/cpregen/mpregen з CONMOD/MENMOD і LVLMOD (без бафів прикрас).
 */
function regenTier(level: number): { h2: number; mp2: number; cp2: number } {
  const LVL = Math.max(1, Math.floor(level));
  let basehpregen2 = 1;
  let basempregen2 = 1;
  let basecpregen2 = 1;

  if (LVL > 0 && LVL < 11) {
    basehpregen2 = 1.95 + LVL / 20;
    basempregen2 = 0.9;
    basecpregen2 = 2;
  }
  if (LVL > 10) {
    basehpregen2 = 1.4 + LVL / 10;
  }
  if (LVL > 10 && LVL < 21) {
    basempregen2 = 1.2;
    basecpregen2 = 2.5;
  }
  if (LVL > 20 && LVL < 31) {
    basempregen2 = 1.5;
    basecpregen2 = 3.5;
  }
  if (LVL > 30 && LVL < 41) {
    basempregen2 = 1.8;
    basecpregen2 = 4.5;
  }
  if (LVL > 40 && LVL < 51) {
    basempregen2 = 2.1;
    basecpregen2 = 5.5;
  }
  if (LVL > 50 && LVL < 61) {
    basempregen2 = 2.4;
    basecpregen2 = 6.5;
  }
  if (LVL > 60 && LVL < 71) {
    basempregen2 = 2.7;
    basecpregen2 = 7.5;
  }
  if (LVL > 70 && LVL < 86) {
    basempregen2 = 3;
    basecpregen2 = 8.5;
  }
  if (LVL >= 86) {
    basempregen2 = 3;
    basecpregen2 = 8.5;
  }

  return { h2: basehpregen2, mp2: basempregen2, cp2: basecpregen2 };
}

/**
 * calc_stats.php 4683–4693: hpregen2 / cpregen2 / mpregen2 (floor) — один «тик» як у PHP.
 * Множники CON/MEN — `conHpMultiplier` / `menMpMultiplier` (узгоджено з max HP/MP), а не таблиці CONMODIFIER/MENMODIFIER.
 * Для пасивного відновлення на сервері трактуємо як HP/сек (типовий tick 1 с).
 */
export function computeRegenPerTick(
  level: number,
  con: number,
  men: number
): { regenHp: number; regenCp: number; regenMp: number } {
  const LVL = Math.max(1, Math.floor(level));
  const LVLMOD = lvlMod(LVL);
  /** Той самий пайплайн, що max HP/max MP від CON/MEN (без таблиць CONMODIFIER/MENMODIFIER). */
  const conMul = conHpMultiplier(con);
  const menMul = menMpMultiplier(men);
  const tier = regenTier(LVL);

  const basehpregen = 1;
  const basempregen = 1;
  const basecpregen = 1;
  const HPregen = 1;
  const CPregen = 1;
  const MPregen = 1;
  const bonHPreg = 1;
  const bonMPreg = 1;
  const bonCPreg = 1;
  const AddHPREGEN = 0;
  const AddCPREGEN = 0;
  const AddMPREGEN = 0;

  const hpregen =
    basehpregen * tier.h2 * conMul * LVLMOD * HPregen * bonHPreg + AddHPREGEN;
  const cpregen =
    basecpregen * tier.cp2 * conMul * LVLMOD * CPregen * bonMPreg + AddCPREGEN;
  const mpregen =
    basempregen * tier.mp2 * menMul * LVLMOD * MPregen * bonCPreg + AddMPREGEN;

  return {
    regenHp: Math.floor(hpregen),
    regenCp: Math.floor(cpregen),
    regenMp: Math.floor(mpregen),
  };
}

function isMageRaceCode(code: L2dopRaceCode): boolean {
  return code === 'HM' || code === 'EM' || code === 'DM' || code === 'OM';
}

/**
 * База з rawdata + бонус за кожен рівень після 1 (воїн / маг — різний акцент).
 */
function baseSixForLevel(
  code: L2dopRaceCode,
  classBranch: string,
  level: number
): BaseSix {
  const b = baseSixForRace(code);
  const L = Math.max(1, Math.floor(level));
  const n = L - 1;
  const mystic = String(classBranch || '').toLowerCase() === 'mystic';
  if (mystic) {
    return {
      str: b.str + Math.floor(n * 0.2),
      int: b.int + Math.floor(n * 0.55),
      dex: b.dex + Math.floor(n * 0.25),
      wit: b.wit + Math.floor(n * 0.3),
      con: b.con + Math.floor(n * 0.2),
      men: b.men + Math.floor(n * 0.45),
    };
  }
  return {
    str: b.str + Math.floor(n * 0.5),
    int: b.int + Math.floor(n * 0.2),
    dex: b.dex + Math.floor(n * 0.35),
    wit: b.wit + Math.floor(n * 0.15),
    con: b.con + Math.floor(n * 0.4),
    men: b.men + Math.floor(n * 0.2),
  };
}

export interface CombatStatsSnapshot {
  pAtk: number;
  pDef: number;
  mAtk: number;
  mDef: number;
  str: number;
  int: number;
  dex: number;
  wit: number;
  con: number;
  men: number;
  /** Accuracy2 — calc_stats.php 4506 */
  accuracy: number;
  /** Evasion2 — 4516 */
  evasion: number;
  /**
   * finalcritical2 (4528–4534): у сумі вже є `+ motion.wpnRCrit` (rCrit предмета).
   * Окремо дублювати rCrit у UI не потрібно — це той самий доданок, не друга статистика.
   */
  critRate: number;
  /** atkspd2 — 4594–4596 */
  pAtkSpd: number;
  /** Speed2 — 4564–4568 (×2 після floor) */
  runSpeed: number;
  /** castingspd2 — 4602–4606 */
  castSpd: number;
  /** Захист щита (немає слота) */
  shieldPDef: number;
  /** $mcrit = 5*$WITMOD*$mCritRate (mCritRate=1) 4540 */
  mCritPct: number;
  /** Добуток $critdmg після бафів cAtk (1 у PHP без бафів). */
  critDmgMul: number;
  /** $AddCritDmg (+ cAtkStatic) для крит-урону в бою. */
  addCritDmg: number;
  /**
   * Дод. крит — як `player.php` / calc_stats: `(critdmg-1)*100` + `+` + `AddCritDmg`
   * (не плутати з `finalcritical` / rCrit зброї).
   */
  addCritDisplay: string;
  /** $WpnCRIT / rCrit з предмета зброї — додається до шансу криту (finalcritical), окремо від «Дод. крит». */
  weaponRCrit: number;
  /** Узгодженість зброї з бронею l3/l4 за грейдом → ×1.1 vs штраф ×0.75. */
  weaponGradeMatchesArmor: boolean;
  vampiricPct: number;
  reflectPct: number;
  regenCp: number;
  regenHp: number;
  regenMp: number;
  /**
   * Множники пулу HP/MP/CP від бафів ($BuffHP / $BuffMP / $BuffCP у cs1.php).
   * У snapshot персонажа maxHp/maxMp/maxCp множаться окремо (computeVitals * ці коефіцієнти).
   */
  buffMaxHpMul: number;
  buffMaxMpMul: number;
  buffMaxCpMul: number;
  jewelFlatMaxHp: number;
  jewelFlatMaxMp: number;
  jewelFlatMaxCp: number;
  /** Ефективний block rate екіпованого щита після armor-set mul (20% × 1.24 = 24.8). */
  shieldBlockRatePct: number;
  shieldBlockRateMul: number;
  cooldownReductionMul: number;
  holdResistMul: number;
  sleepResistMul: number;
  mentalResistMul: number;
  poisonResistMul: number;
  bleedResistMul: number;
  /** Фаза 1: стійкість до станів (CON) + плоскі бонуси; верхня межа 95. */
  stunResistPct: number;
  /** Fortitude (335) та інші: стійкість до паралічу, 0–95. */
  paralyzeResistPct: number;
  /** Стійкість до дебафів (MEN) + плоскі бонуси; верхня межа 95. */
  debuffResistPct: number;
  /** Touch of Life: ефективність отриманого лікування, 0–95. */
  healReceivedPct: number;
  /** Touch of Life: стійкість до Cancel, 0–95. */
  cancelResistPct: number;
  /** Плоский бонус до ліміту ваги від armor set. */
  weightLimitBonusFlat: number;
  /** Множник витрат MP у бою за скіл (1 = база). */
  skillMpCostMul: number;
  /** Плоский бонус до шансу накладання дебафу/контролю (додається після резисту моба, у % до шансу). */
  addDebuffLandChancePct: number;
  /** Множник маг. крит-урону від INT (до окремих бафів маг. криту). */
  magicCritDmgMul: number;
}

/** calc_stats.php: $WpnAcc залежно від типу зброї */
function wpnAccForWeaponType(wt: WeaponKindForEnchant | undefined): number {
  if (wt === 'blunt' || wt === 'bigblunt') return 4.75;
  if (wt === 'dagger' || wt === 'pole') return -3.75;
  if (wt === 'bow') return 0;
  return 0;
}

/**
 * $WpnSpd / $WpnCrt / $WpnAcc — 2294+ для unequipped, інакше з items3 + каталогу.
 */
function weaponMotionParams(itemId: number | undefined): {
  wpnSpd: number;
  wpnCrt: number;
  wpnAcc: number;
  wpnRCrit: number;
} {
  if (typeof itemId !== 'number' || itemId <= 0) {
    return { wpnSpd: 300, wpnCrt: 40, wpnAcc: 0, wpnRCrit: 0 };
  }
  const m = ITEM_CATALOG[itemId];
  if (!m || m.slot !== 'rhand') {
    return { wpnSpd: 300, wpnCrt: 40, wpnAcc: 0, wpnRCrit: 0 };
  }
  const wt = m.weaponType ?? 'sword';
  return {
    wpnSpd: typeof m.atkSpd === 'number' ? m.atkSpd : 379,
    wpnCrt: typeof m.wpnCrit === 'number' ? m.wpnCrit : 80,
    wpnAcc: wpnAccForWeaponType(wt),
    wpnRCrit: typeof m.rCrit === 'number' && Number.isFinite(m.rCrit) ? m.rCrit : 0,
  };
}

/**
 * Сума P.Def з одягнутих частин (як $Upper+$Lower+… у calc_stats + бонус заточки з sums.php).
 */
export function sumEquippedArmorPDef(
  eq: InventoryState['eq']
): number {
  let sum = 0;
  for (const key of ARMOR_PDEF_EQ_KEYS) {
    const slot = normalizeEqSlot(eq[key]);
    if (!slot) continue;
    const meta = ITEM_CATALOG[slot.itemId];
    /** Щити (lhand) — лише shieldPDef при блоці, не в сумі P.Def броні. */
    if (meta?.slot === 'lhand') continue;
    const base = meta?.pDef;
    if (typeof base !== 'number' || !Number.isFinite(base)) continue;
    sum += base + armorPiecePDefEnchantBonus(slot.enchant);
  }
  return sum;
}

/** Базовий block rate екіпованого щита × armor-set mul. */
export function equippedShieldBlockRatePct(
  eq: InventoryState['eq'],
  blockRateMul: number = 1
): number {
  const shSlot = normalizeEqSlot(eq?.l2);
  if (!shSlot) return 0;
  const wSlot = normalizeEqSlot(eq?.l1);
  const wM = wSlot?.itemId ? ITEM_CATALOG[wSlot.itemId] : undefined;
  if (wM && itemBlocksShieldSlot(wSlot!.itemId, wM.weaponType)) return 0;
  const shM = ITEM_CATALOG[shSlot.itemId];
  if (!shM || shM.slot !== 'lhand') return 0;
  const patch = dropsShieldPatchForEquipped(shSlot.itemId, shM.nameUk);
  const base = shM.shieldBlockRatePct ?? patch?.shieldRatePercent;
  if (typeof base !== 'number' || !Number.isFinite(base) || base <= 0) return 0;
  const mul = Math.max(0, blockRateMul);
  return Math.min(100, Math.round(base * mul * 10) / 10);
}

/** Shield P.Def у snapshot: база предмета × Shield Mastery rate + flat (Shield Fortress). */
export function equippedShieldPDef(
  eq: InventoryState['eq'],
  shieldDefenceRatePct: number,
  flatBonus: number = 0
): number {
  const shSlot = normalizeEqSlot(eq?.l2);
  if (!shSlot) return 0;
  const wSlot = normalizeEqSlot(eq?.l1);
  const wM = wSlot?.itemId ? ITEM_CATALOG[wSlot.itemId] : undefined;
  if (wM && itemBlocksShieldSlot(wSlot!.itemId, wM.weaponType)) return 0;
  const shM = ITEM_CATALOG[shSlot.itemId];
  if (!shM || shM.slot !== 'lhand') return 0;
  const patch = dropsShieldPatchForEquipped(shSlot.itemId, shM.nameUk);
  const base = shM.shieldDefense ?? patch?.shieldDef;
  if (typeof base !== 'number' || !Number.isFinite(base) || base <= 0) return 0;
  const rate = Math.max(0, Math.min(100, Math.floor(shieldDefenceRatePct)));
  if (rate <= 0) return 0;
  const baseDef = Math.floor((base * rate) / 100);
  const flat = Math.max(0, Math.floor(flatBonus));
  return Math.max(0, baseDef + flat);
}

/** Чи екіпований щит у слоті l2 (без урахування Shield Mastery rate). */
export function playerHasEquippedShield(eq: InventoryState['eq']): boolean {
  const shSlot = normalizeEqSlot(eq?.l2);
  if (!shSlot?.itemId) return false;
  const wSlot = normalizeEqSlot(eq?.l1);
  const wM = wSlot?.itemId ? ITEM_CATALOG[wSlot.itemId] : undefined;
  if (wM && itemBlocksShieldSlot(wSlot!.itemId, wM.weaponType)) return false;
  const shM = ITEM_CATALOG[shSlot.itemId];
  return !!shM && shM.slot === 'lhand';
}

const JEWEL_EQ_KEYS = ['lr1', 'lr2', 'neck', 'le1', 'le2'] as const;

function sumEquippedJewelryMdefParts(eq: InventoryState['eq']): {
  classic: number;
  author: number;
} {
  let classic = 0;
  let author = 0;
  for (const key of JEWEL_EQ_KEYS) {
    const slot = normalizeEqSlot(eq[key]);
    if (!slot) continue;
    const m = ITEM_CATALOG[slot.itemId];
    if (!m) continue;
    if (
      typeof m.jewelMdefFlat === 'number' &&
      Number.isFinite(m.jewelMdefFlat)
    ) {
      author += m.jewelMdefFlat;
    } else if (typeof m.mAtk === 'number' && Number.isFinite(m.mAtk)) {
      classic += m.mAtk;
    }
  }
  return { classic, author };
}

function jewelryEquipBuffDelta(eq: InventoryState['eq']): {
  flatHp: number;
  flatMp: number;
  delta: Partial<L2dopCombatBuffModifiers>;
} {
  let flatHp = 0;
  let flatMp = 0;
  let acc = 0;
  let eva = 0;
  let regenMpMul = 1;
  let holdResistMul = 1;
  for (const key of JEWEL_EQ_KEYS) {
    const slot = normalizeEqSlot(eq[key]);
    if (!slot) continue;
    const m = ITEM_CATALOG[slot.itemId];
    if (!m) continue;
    if (typeof m.jewelMaxHp === 'number' && Number.isFinite(m.jewelMaxHp)) {
      flatHp += m.jewelMaxHp;
    }
    if (typeof m.jewelMaxMp === 'number' && Number.isFinite(m.jewelMaxMp)) {
      flatMp += m.jewelMaxMp;
    }
    if (typeof m.jewelAcc === 'number' && Number.isFinite(m.jewelAcc)) {
      acc += m.jewelAcc;
    }
    if (typeof m.jewelEva === 'number' && Number.isFinite(m.jewelEva)) {
      eva += m.jewelEva;
    }
    if (
      typeof m.jewelMpRegenMul === 'number' &&
      Number.isFinite(m.jewelMpRegenMul) &&
      m.jewelMpRegenMul > 0
    ) {
      regenMpMul *= m.jewelMpRegenMul;
    }
    if (
      typeof m.jewelHoldResistMul === 'number' &&
      Number.isFinite(m.jewelHoldResistMul) &&
      m.jewelHoldResistMul > 0
    ) {
      holdResistMul *= m.jewelHoldResistMul;
    }
  }
  const delta: Partial<L2dopCombatBuffModifiers> = {
    buffAcc: acc,
    buffEva: eva,
  };
  if (regenMpMul !== 1) delta.regenMpMul = regenMpMul;
  if (holdResistMul !== 1) delta.holdResistMul = holdResistMul;
  return { flatHp, flatMp, delta };
}

function sumEquippedJewelryPDef(eq: InventoryState['eq']): number {
  let sum = 0;
  for (const key of JEWEL_EQ_KEYS) {
    const slot = normalizeEqSlot(eq[key]);
    if (!slot) continue;
    const base = ITEM_CATALOG[slot.itemId]?.pDef;
    if (typeof base !== 'number' || !Number.isFinite(base)) continue;
    sum += base;
  }
  return sum;
}

function weaponEquipCombatBonus(eq: InventoryState['eq']): {
  castSpd?: number;
  mCritPct?: number;
} {
  const slot = normalizeEqSlot(eq.l1);
  if (!slot) return {};
  const m = ITEM_CATALOG[slot.itemId];
  if (!m) return {};
  const out: { castSpd?: number; mCritPct?: number } = {};
  if (typeof m.equipCastSpd === 'number' && Number.isFinite(m.equipCastSpd)) {
    out.castSpd = Math.max(100, Math.min(2000, Math.floor(m.equipCastSpd)));
  }
  if (typeof m.equipMCritPct === 'number' && Number.isFinite(m.equipMCritPct)) {
    out.mCritPct = Math.max(1, Math.min(100, m.equipMCritPct));
  }
  return out;
}

function weaponStats(
  itemId: number | undefined,
  enchant: number
): { pAtk: number; mAtk: number } {
  if (typeof itemId !== 'number' || itemId <= 0) return { pAtk: 0, mAtk: 0 };
  const m = ITEM_CATALOG[itemId];
  if (!m) return { pAtk: 0, mAtk: 0 };
  const wt: WeaponKindForEnchant = m.weaponType ?? 'sword';
  const pAtkBase = typeof m.pAtk === 'number' ? m.pAtk : 0;
  const mAtkBase = typeof m.mAtk === 'number' ? m.mAtk : 0;
  return {
    pAtk: pAtkBase + weaponPatkEnchantBonus(wt, enchant),
    mAtk: mAtkBase + weaponMatkEnchantBonus(enchant),
  };
}

export interface ComputeCombatStatsOptions {
  buffs?: Partial<L2dopCombatBuffModifiers>;
  /** Масив id бафів з БД (див. l2dopActiveBuffs). */
  activeBuffsJson?: unknown;
  /**
   * Як $weapon_noshtraf у calc_stats.php: `true` — ×1.1 на patk2/matk2; `false` — ×0.75.
   * Якщо не передано — береться `inferWeaponGradeMatchesArmor(inv)` (ранг зброї vs max грейд броні).
   */
  weaponGradeMatchesArmor?: boolean;
  /**
   * Геройські навички cs1.php ($heroic 1/2/3) — лише якщо на персонажі ввімкнено відповідний режим.
   * Інакше бафи 395/396/1374… не застосовуються з JSON.
   */
  heroicTier?: 1 | 2 | 3;
  /** Для Zealot (420): кількість «верств» $zealot у cs1 (типово 1–3). */
  zealotStacks?: number;
}

/**
 * З полів персонажа в БД (activeBuffsJson + cs1 heroic / zealot) — без циклів import із charService.
 */
export function combatStatsOptionsFromPersistedBuffs(row: {
  activeBuffsJson: unknown;
  buffHeroicTier: number | null | undefined;
  buffZealotStacks: number | null | undefined;
}): ComputeCombatStatsOptions {
  const h = row.buffHeroicTier;
  const heroicTier =
    h === 1 || h === 2 || h === 3 ? (h as 1 | 2 | 3) : undefined;
  const z = row.buffZealotStacks;
  const zealotStacks =
    typeof z === 'number' && z > 0
      ? Math.max(1, Math.min(3, Math.floor(z)))
      : undefined;
  return {
    activeBuffsJson: row.activeBuffsJson,
    ...(heroicTier != null ? { heroicTier } : {}),
    ...(zealotStacks != null ? { zealotStacks } : {}),
  };
}

/**
 * Як у text-rpg `recalculateAllStats` з пасивами: `activeBuffsJson` (світ) + пасивні скіли з `skillsLearnedJson`.
 * Тогли в бою — `battleJson.battleMods` + формули text-rpg (`textRpgHfToggleBattleApply`), не з цього виклику.
 */
export function computeCombatStatsOptionsForCharacter(row: {
  activeBuffsJson: unknown;
  buffHeroicTier: number | null | undefined;
  buffZealotStacks: number | null | undefined;
  hp?: number;
  maxHp?: number;
  skillsLearnedJson?: unknown;
  l2Profession?: string;
  inventoryJson?: unknown;
  race?: string;
  classBranch?: string;
  /**
   * Поза боєм toggle-стійки расових Fighter / Mystic зберігаються в
   * `worldCombatStateJson.battleMods.raceToggleRanks`. Якщо поле передане —
   * їхня дельта додається до постійних бафів.
   */
  worldCombatStateJson?: unknown;
}): ComputeCombatStatsOptions {
  const base = combatStatsOptionsFromPersistedBuffs({
    activeBuffsJson: row.activeBuffsJson,
    buffHeroicTier: row.buffHeroicTier,
    buffZealotStacks: row.buffZealotStacks,
  });
  if (row.skillsLearnedJson == null) {
    return base;
  }
  const prof = resolveL2ProfessionForSkillsRow(row);
  const inv = parseInventory(row.inventoryJson ?? null);
  const rawEntries = normalizeLearnedSkillsJson(row.skillsLearnedJson);
  const entries = filterLearnedSkillEntriesForCharacter(
    rawEntries,
    String(row.race ?? 'Human'),
    String(row.classBranch ?? 'fighter'),
    prof
  );
  let acc = neutralCombatBuffs();
  acc = applyBuffDelta(
    acc,
    learnedPassivesBuffDelta(entries, inv, prof, row.hp, row.maxHp)
  );
  acc = applyBuffDelta(
    acc,
    learnedMysticPassivesBuffDelta(
      entries,
      inv,
      prof,
      String(row.race ?? 'Human')
    )
  );
  acc = applyBuffDelta(
    acc,
    learnedRaceFighterPassivesBuffDelta(
      entries,
      inv,
      prof,
      String(row.race ?? 'Human'),
      String(row.classBranch ?? 'fighter')
    )
  );
  if (row.worldCombatStateJson != null) {
    const world = parseWorldCombatState(row.worldCombatStateJson);
    if (world?.battleMods?.raceToggleRanks) {
      acc = applyBuffDelta(
        acc,
        raceFighterToggleStanceCombatDelta(
          world.battleMods,
          prof,
          String(row.race ?? 'Human'),
          String(row.classBranch ?? 'fighter')
        )
      );
    }
  }
  const passive = partialCombatBuffDeltaFromNeutral(acc);
  if (!passive || Object.keys(passive).length === 0) return base;
  return { ...base, buffs: passive };
}

/**
 * Повний розрахунок для snapshot: база з rawdata + екіп з ITEM_CATALOG.
 * P.Atk / M.Atk / P.Def як у calc_stats.php; заточка зброї/броні — l2dopEnchant.ts (sums.php).
 */
export function computeCombatStats(
  level: number,
  race: string,
  classBranch: string,
  inv: InventoryState,
  options?: ComputeCombatStatsOptions
): CombatStatsSnapshot {
  const r = String(race ?? '').trim().toLowerCase();
  const zealotDarkElf = r === 'dark elf' || r === 'darkelf' || /^dark\s*elf$/.test(r);
  const buffExtra: BuffExtraContext = {
    heroicTier: options?.heroicTier,
    zealotStacks: options?.zealotStacks,
    ...(zealotDarkElf ? { zealotDarkElf: true } : {}),
  };
  let B = combatBuffsFromActiveJson(
    options?.activeBuffsJson,
    buffWeaponContextFromInv(inv),
    buffExtra
  );
  B = applyBuffDelta(B, options?.buffs ?? {});
  const eq = inv.eq || {};
  const jEq = jewelryEquipBuffDelta(eq);
  B = applyBuffDelta(B, jEq.delta);
  const armorSetResolved = resolveEquippedArmorSetBonuses(inv);
  const armorSetCombat = armorSetTotalsToCombatDelta(armorSetResolved.totals);
  B = applyBuffDelta(B, armorSetCombat.buffDelta);
  B = applyBuffDelta(B, legacyFullArmorSetBonusDelta(inv));
  const jewelFlatMaxHp = jEq.flatHp + armorSetCombat.flatMaxHp;
  const jewelFlatMaxMp = jEq.flatMp + armorSetCombat.flatMaxMp;
  const jewelFlatMaxCp = armorSetCombat.flatMaxCp;
  const gradeOk =
    options?.weaponGradeMatchesArmor !== undefined
      ? options.weaponGradeMatchesArmor
      : inferWeaponGradeMatchesArmor(inv);

  const code = raceAndBranchToL2Code(race, classBranch);
  const LVL = Math.max(1, Math.floor(level));
  const base = baseSixForLevel(code, classBranch, LVL);
  const STR = base.str + armorSetCombat.flatStats.strFlat;
  const INT = base.int + armorSetCombat.flatStats.intFlat;
  const DEX = base.dex + armorSetCombat.flatStats.dexFlat;
  const CON = base.con + armorSetCombat.flatStats.conFlat;
  const MEN = base.men + armorSetCombat.flatStats.menFlat;
  const WIT = base.wit + armorSetCombat.flatStats.witFlat;
  const LVLMOD = lvlMod(LVL);
  const M = computePrimaryStatMultipliers({
    str: STR,
    int: INT,
    dex: DEX,
    con: CON,
    men: MEN,
    wit: WIT,
  });

  const wSlot = normalizeEqSlot(eq.l1);
  const wId = wSlot?.itemId;
  const wEn = wSlot?.enchant ?? 0;
  let { pAtk: wpnPAtk, mAtk: wpnMATK } = weaponStats(wId, wEn);

  const fighterBranch = String(classBranch || '').toLowerCase() === 'fighter';

  // calc_stats.php ~2261: без зброї маги отримують +3 до «кулаків»
  if (!wId && isMageRaceCode(code)) {
    wpnPAtk += 3;
  } else if (!wId && fighterBranch) {
    // Без зброї воїнська гілка інакше має wpnPAtk=0 → увесь P.Atk=0; бафи/пасивки множать нуль (у профілі «нічого не змінилося»).
    wpnPAtk += 4;
  }

  /**
   * MasteryPATK (PHP ~4320–4326): лише константа раси/класу (маг/незмаг),
   * без додаткового множника STR/LVL — ті вже у `LVLMOD` і `M.strPAtkMul`.
   */
  const masteryPatk = isMageRaceCode(code) ? 1.45 : 1.085;

  let patk =
    wpnPAtk *
      LVLMOD *
      B.necklacePatk *
      masteryPatk *
      M.strPAtkMul *
      B.buffPatk +
    B.addPatk;
  let patk2 = Math.floor(patk);

  const gradeMul = gradeOk ? 1.1 : 0.75;
  patk2 = Math.floor(patk2 * gradeMul);

  let apdef = sumEquippedArmorPDef(eq) + sumEquippedJewelryPDef(eq);
  if (apdef === 0 && fighterBranch) {
    apdef = 6;
  }
  const pdef = apdef * LVLMOD * M.conPDefMul * B.buffPdef + B.addPdef;
  let pdef2 = Math.floor(pdef);

  const L2 = LVLMOD * LVLMOD;
  const matkCoeff = B.necklaceMatk + (isMageRaceCode(code) ? 0.17 : 0);
  let matk = wpnMATK * L2 * M.intMAtkMul * matkCoeff * B.buffMatk + B.addMatk;
  let matk2 = Math.floor(matk);
  matk2 = Math.floor(matk2 * gradeMul);

  const mysticBranch = String(classBranch || '').toLowerCase() === 'mystic';
  if (mysticBranch) {
    matk2 = Math.floor(matk2 * 1.5);
  }

  const { classic: jmdefClassic, author: jmdefAuthor } =
    sumEquippedJewelryMdefParts(eq);
  const mdef =
    (jmdefClassic * LVLMOD + jmdefAuthor) * M.menMDefMul * B.buffMdef +
    B.addMdef;
  let mdef2 = Math.floor(mdef);

  const motion = weaponMotionParams(wId);
  const weaponCombatSpd = combatSpeedFromWeaponAtkSpd(motion.wpnSpd);
  const ShieldEvasion = 0;

  /** Balance pass 1: краща прив’язка попадання до DEX (sim miss ~35% → ціль 20–25%). */
  const dexFlatAccEva = (DEX - 20) * 0.8;
  // 4506–4508 Accuracy2 + пайплайн DEX
  const Accuracy =
    Math.sqrt(DEX) * 6 +
    LVL +
    motion.wpnAcc +
    B.ringAccBonus +
    dexFlatAccEva +
    B.buffAcc;
  const accuracy = Math.floor(Accuracy);

  // 4516–4518 Evasion2 + пайплайн DEX
  const Evasion =
    Math.sqrt(DEX) * 6 + LVL + ShieldEvasion + dexFlatAccEva + B.buffEva;
  const evasion = Math.floor(Evasion);

  const physCritPctBase = physicalCritChancePct(DEX);
  const physCritPct = Math.max(
    5,
    Math.min(60, physCritPctBase + B.addPhysicalCritChancePct)
  );
  const intrinsicCritStat = critRateStatFromPhysicalCritPct(physCritPct);
  const finalcritical =
    intrinsicCritStat +
    B.addCrit +
    B.subcritical +
    intrinsicCritStat * B.subcriticalMulOfBase +
    motion.wpnRCrit;
  let finalcritical2 = Math.floor(finalcritical);
  if (finalcritical2 > 500) finalcritical2 = 500;
  if (finalcritical2 < 0) finalcritical2 = 0;

  const atkspd =
    weaponCombatSpd * M.dexAtkSpeedMul * B.buffAspd + B.addAspd;
  const pAtkSpd = Math.max(100, Math.min(1500, Math.floor(atkspd)));

  const baseRun: Record<L2dopRaceCode, number> = {
    HF: 115,
    HM: 120,
    EF: 125,
    EM: 122,
    DF: 122,
    DM: 122,
    OF: 117,
    OM: 121,
    DW: 115,
  };
  const br = baseRun[code] ?? 115;
  const speed = br * M.dexAtkSpeedMul * B.buffSpeed + B.addSpeed;
  const runSpeed = Math.floor(Math.floor(speed) * 2);

  const castingspd = 333 * M.witCastSpeedMul * B.buffCast + B.addCast;
  let castSpd = Math.max(
    100,
    Math.min(2000, Math.floor(castingspd * 1.25))
  );
  if (mysticBranch) {
    castSpd = Math.max(
      100,
      Math.min(
        2000,
        Math.floor(castSpd * (weaponCombatSpd / 600))
      )
    );
  }

  let mCritPct = magicCritChancePct(WIT);
  mCritPct = Math.min(
    30,
    Math.max(1, Math.round(mCritPct * B.mCritRate * 100) / 100)
  );
  mCritPct = Math.min(
    30,
    Math.max(1, Math.round((mCritPct + B.addMCritPct) * 100) / 100)
  );

  const weaponBonus = weaponEquipCombatBonus(eq);
  if (weaponBonus.castSpd != null) castSpd = weaponBonus.castSpd;
  if (weaponBonus.mCritPct != null) mCritPct = weaponBonus.mCritPct;

  const magicCritDmgMul = clampMagicCritDmgMulForDamage(M.intMagicCritDmgMul);
  /** Спочатку множник від STR, потім бафи (Death Whisper / тощо з `B.critDmgMul`). */
  const critDmgMulCombined = M.strCritDmgMul * B.critDmgMul;

  const regen = computeRegenPerTick(LVL, CON, MEN);
  /** Після множників float може дати «50.452000000000005» — у snapshot/ UI лишаємо цілі. */
  const regenHp = Math.max(
    0,
    Math.round(regen.regenHp * B.regenHpMul + B.addRegenHp)
  );
  let regenMp = regen.regenMp * B.regenMpMul + B.addRegenMp;
  /** Balance pass 3: більший відтік MP у магів у довгих боях — трохи сильніший regenMp (без INT/MEN у формулі атаки). */
  if (String(classBranch).toLowerCase() === 'mystic') {
    regenMp = Math.max(regenMp, Math.ceil(regenMp * 1.15));
  }
  regenMp = Math.max(0, Math.round(regenMp));
  const regenCp = Math.max(
    0,
    Math.round(regen.regenCp * B.regenCpMul + B.addRegenCp)
  );

  const addCritDisplay =
    Math.floor((critDmgMulCombined - 1) * 100) +
    '%+' +
    String(Math.floor(B.addCritDmg));

  const stunResistPct = Math.max(
    0,
    Math.min(95, stunResistPctFromCon(CON) + B.addStunResistPct)
  );
  const paralyzeResistPct = Math.max(
    0,
    Math.min(95, B.addParalyzeResistPct)
  );
  const debuffResistPct = Math.max(
    0,
    Math.min(95, debuffResistPctFromMen(MEN) + B.addDebuffResistPct)
  );

  return {
    pAtk: patk2,
    pDef: pdef2,
    mAtk: matk2,
    mDef: mdef2,
    str: STR,
    int: INT,
    dex: DEX,
    wit: WIT,
    con: CON,
    men: MEN,
    accuracy,
    evasion,
    critRate: finalcritical2,
    pAtkSpd,
    runSpeed,
    castSpd,
    shieldPDef: equippedShieldPDef(eq, B.shieldDefenceRatePct, B.addShieldPDef),
    mCritPct,
    critDmgMul: critDmgMulCombined,
    addCritDmg: B.addCritDmg,
    addCritDisplay,
    weaponRCrit: motion.wpnRCrit,
    weaponGradeMatchesArmor: gradeOk,
    vampiricPct: 0,
    reflectPct: 0,
    regenCp,
    regenHp,
    regenMp,
    buffMaxHpMul: B.buffMaxHp,
    buffMaxMpMul: B.buffMaxMp,
    buffMaxCpMul: B.buffMaxCp,
    jewelFlatMaxHp,
    jewelFlatMaxMp,
    jewelFlatMaxCp,
    shieldBlockRatePct: equippedShieldBlockRatePct(eq, B.shieldBlockRateMul),
    shieldBlockRateMul: B.shieldBlockRateMul,
    cooldownReductionMul: B.cooldownReductionMul,
    holdResistMul: B.holdResistMul,
    sleepResistMul: B.sleepResistMul,
    mentalResistMul: B.mentalResistMul,
    poisonResistMul: B.poisonResistMul,
    bleedResistMul: B.bleedResistMul,
    stunResistPct,
    paralyzeResistPct,
    debuffResistPct,
    healReceivedPct: Math.max(0, Math.min(95, B.addHealReceivedPct)),
    cancelResistPct: Math.max(0, Math.min(95, B.addCancelResistPct)),
    weightLimitBonusFlat: B.addWeightLimitFlat,
    skillMpCostMul: Math.max(0.5, Math.min(1.25, B.skillMpCostMul)),
    addDebuffLandChancePct: B.addDebuffLandChancePct,
    magicCritDmgMul,
  };
}

/** Базов max HP/MP від VIT після buffMul + плоский бонус від біжутерії (екіп). */
export function effectiveMaxHpWithJewelFlat(
  vitMaxHp: number,
  combat: Pick<CombatStatsSnapshot, 'buffMaxHpMul' | 'jewelFlatMaxHp'>
): number {
  return Math.max(
    1,
    Math.floor(vitMaxHp * combat.buffMaxHpMul) + combat.jewelFlatMaxHp
  );
}

export function effectiveMaxMpWithJewelFlat(
  vitMaxMp: number,
  combat: Pick<CombatStatsSnapshot, 'buffMaxMpMul' | 'jewelFlatMaxMp'>
): number {
  return Math.max(
    1,
    Math.floor(vitMaxMp * combat.buffMaxMpMul) + combat.jewelFlatMaxMp
  );
}

export function effectiveMaxCpWithFlat(
  vitMaxCp: number,
  combat: Pick<CombatStatsSnapshot, 'buffMaxCpMul' | 'jewelFlatMaxCp'>
): number {
  return Math.max(
    0,
    Math.floor(vitMaxCp * combat.buffMaxCpMul) + combat.jewelFlatMaxCp
  );
}
