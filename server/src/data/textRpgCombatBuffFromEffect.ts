/**
 * Єдине місце перетворення «text-rpg ефект» → `Partial<L2dopCombatBuffModifiers>`.
 * Пасиви, згенеровані з text-rpg, бафи з майбутніх таблиць і ручні скіли з тим самим `stat`/`mode`/`power`
 * мають проходити через цю функцію, щоб формули не дублювати в switch’ах по `l2SkillId`.
 *
 * Подальші шари (поки поза цим модулем):
 * - `activeBuffsJson` / cs1 — поступово замінювати на рядки ефектів + power з рівня.
 * - Тоглі / бойові скіли з уроном — окремі use-case, але `power` і `mode` брати з тих самих визначень text-rpg.
 */
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';
import type { TextRpgEffectMode, TextRpgMappedCombatStat } from './textRpgSkillEffectTypes.js';

const DEFAULT_FLAT_MAX_HP_DIVISOR = 5000;

function mulPercent(pow: number): number {
  return 1 + pow / 100;
}

/** Flat maxHp у text-rpg → наближений множник buffMaxHp (немає addMaxHp у l2dop). */
export function flatMaxHpPowerToBuffMaxHpMul(
  power: number,
  divisor = DEFAULT_FLAT_MAX_HP_DIVISOR
): number {
  return 1 + Math.max(0, power) / divisor;
}

export type TextRpgBuffMappingOptions = {
  /** Інший коефіцієнт для flat maxHp → buffMaxHp (тюнінг балансу). */
  flatMaxHpDivisor?: number;
};

/**
 * Один модифікатор `{ stat, mode }` + числове значення `power` (з рівня скіла, як `level.power` у text-rpg).
 * Повертає `null`, якщо стат поки не мапиться на `L2dopCombatBuffModifiers` — тоді окремий хук по `skillId`.
 */
export function l2dopBuffDeltaFromTextRpgEffect(
  stat: string,
  mode: TextRpgEffectMode,
  power: number,
  options?: TextRpgBuffMappingOptions
): Partial<L2dopCombatBuffModifiers> | null {
  if (!Number.isFinite(power)) return null;

  const st = stat as TextRpgMappedCombatStat;
  const div = options?.flatMaxHpDivisor ?? DEFAULT_FLAT_MAX_HP_DIVISOR;

  if (mode === 'percent') {
    const m = mulPercent(power);
    switch (st) {
      case 'pAtk':
        return { buffPatk: m };
      case 'mAtk':
        return { buffMatk: m };
      case 'pDef':
        return { buffPdef: m };
      case 'mDef':
        return { buffMdef: m };
      case 'maxHp':
        return { buffMaxHp: m };
      case 'maxMp':
        return { buffMaxMp: m };
      case 'maxCp':
        return { buffMaxCp: m };
      case 'hpRegen':
        return { regenHpMul: m };
      case 'mpRegen':
        return { regenMpMul: m };
      case 'attackSpeed':
      case 'atkSpeed':
        return { buffAspd: m };
      case 'castSpeed':
        return { buffCast: m };
      case 'runSpeed':
        return { buffSpeed: m };
      /** % до сили крит. удару → множник у `resolvePhysicalHit` / calc_stats. */
      case 'critDamage':
        return { critDmgMul: m };
      /**
       * % до шансу криту — наближено як доданок до крит-стату (база залежить від DEX/зброї).
       */
      case 'critRate':
        return { addCrit: Math.round(power * 0.35) };
      case 'stunResist':
        return { addStunResistPct: power };
      case 'shockResist':
        return { addStunResistPct: power };
      case 'paralyzeResist':
        return { addParalyzeResistPct: power };
      case 'holdResist':
        return { holdResistMul: m };
      case 'sleepResist':
        return { sleepResistMul: m };
      case 'mentalResist':
        return { mentalResistMul: m };
      case 'arrowDef':
        return { addBowDefPct: power };
      case 'shieldFortressDefense':
        return { addShieldPDef: power };
      default:
        return null;
    }
  }

  if (mode === 'flat') {
    switch (st) {
      case 'pAtk':
        return { addPatk: power };
      case 'mAtk':
        return { addMatk: power };
      case 'pDef':
        return { addPdef: power };
      case 'mDef':
        return { addMdef: power };
      case 'maxHp':
        return { buffMaxHp: flatMaxHpPowerToBuffMaxHpMul(power, div) };
      case 'maxMp':
        return { buffMaxMp: flatMaxHpPowerToBuffMaxHpMul(power, div) };
      case 'maxCp':
        return { buffMaxCp: flatMaxHpPowerToBuffMaxHpMul(power, div) };
      case 'accuracy':
        return { buffAcc: power };
      case 'evasion':
        return { buffEva: power };
      case 'critRate':
        return { addCrit: power };
      case 'critDamage':
        return { addCritDmg: power };
      /** Quick Step (169) у text-rpg: flat runSpeed → доданок до Speed2 (calc_stats). */
      case 'runSpeed':
        return { addSpeed: power };
      /** Fast HP/MP Recovery, Esprit, Focus Mind (flat power у text-rpg) → доданок HP/сек, MP/сек як у `computeCombatStats`. */
      case 'hpRegen':
        return { addRegenHp: power };
      case 'mpRegen':
        return { addRegenMp: power };
      default:
        return null;
    }
  }

  if (mode === 'multiplier') {
    if (power <= 0 || !Number.isFinite(power)) return null;
    switch (st) {
      case 'pAtk':
        return { buffPatk: power };
      case 'mAtk':
        return { buffMatk: power };
      case 'pDef':
        return { buffPdef: power };
      case 'mDef':
        return { buffMdef: power };
      case 'maxHp':
        return { buffMaxHp: power };
      case 'maxMp':
        return { buffMaxMp: power };
      case 'maxCp':
        return { buffMaxCp: power };
      case 'hpRegen':
        return { regenHpMul: power };
      case 'mpRegen':
        return { regenMpMul: power };
      case 'attackSpeed':
      case 'atkSpeed':
        return { buffAspd: power };
      case 'castSpeed':
        return { buffCast: power };
      case 'runSpeed':
        return { buffSpeed: power };
      default:
        return null;
    }
  }

  return null;
}

/** Два ефекти з одним % до P.Atk і M.Atk (як Weapon Mastery 142 у Human Fighter). */
export function l2dopBuffDeltaPatkMatkSamePercent(
  power: number
): Partial<L2dopCombatBuffModifiers> | null {
  if (!Number.isFinite(power) || power <= 0) return null;
  const m = mulPercent(power);
  return { buffPatk: m, buffMatk: m };
}
