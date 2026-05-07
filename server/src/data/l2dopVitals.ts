/**
 * HP / CP / MP як у l2dop/calc_stats.php + rawdata.php (BaseMP).
 * Криві BaseHP/BaseCP — поліноми по рівню для кожної раси/гілки (HF, HM, EF, …) з calc_stats.php.
 * BaseMP — індекс рівня у таблицях FIGHTER1MP…MYSTIC3MP (l2dopMpTables).
 * Підсумок: maxHp/maxCp з baseHpCpClassType × CONMODIFIER[CON]; maxMp з таблиці MP × MENMODIFIER[MEN].
 * Рівень у грі береться з накопиченого EXP (l2dopExpgain.ts), не лише з поля level у БД.
 */
import { type L2dopRaceCode, raceAndBranchToL2Code } from './l2dopCombatFormulas.js';
import {
  conHpMultiplier,
  menMpMultiplier,
} from './l2dopPrimaryStatPipeline.js';
import {
  FIGHTER1MP,
  FIGHTER2MP,
  FIGHTER3MP,
  MYSTIC1MP,
  MYSTIC2MP,
  MYSTIC3MP,
} from './l2dopMpTables.js';

type ClassType = 'F1' | 'F2' | 'F3' | 'M1' | 'M2' | 'M3';

function L(level: number): number {
  return Math.max(1, Math.floor(level));
}

function poly(a: number, b: number, c: number, level: number): number {
  const lv = L(level);
  return a + b * lv + c * lv * lv;
}

function baseHpCpClassType(
  level: number,
  code: L2dopRaceCode
): { baseHp: number; baseCp: number; classType: ClassType } {
  const lv = L(level);
  switch (code) {
    case 'HF': {
      if (lv <= 20) {
        const baseHp = poly(68.3, 11.635, 0.065, level);
        return { baseHp, baseCp: baseHp * 0.4, classType: 'F1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-270, 26.85, 0.15, level);
        return { baseHp, baseCp: baseHp * 0.8, classType: 'F2' };
      }
      const baseHp = poly(-620.4, 34.01, 0.19, level);
      return { baseHp, baseCp: baseHp * 0.9, classType: 'F3' };
    }
    case 'HM': {
      if (lv <= 20) {
        const baseHp = poly(85.7, 15.215, 0.085, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-73.5, 22.375, 0.125, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M2' };
      }
      const baseHp = poly(-511.5, 31.325, 0.175, level);
      return { baseHp, baseCp: baseHp * 0.5, classType: 'M3' };
    }
    case 'EF': {
      if (lv <= 20) {
        const baseHp = poly(76.4, 12.53, 0.07, level);
        return { baseHp, baseCp: baseHp * 0.4, classType: 'F1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-242, 26.85, 0.15, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'F2' };
      }
      const baseHp = poly(-680, 35.8, 0.2, level);
      return { baseHp, baseCp: baseHp * 0.6, classType: 'F3' };
    }
    case 'EM': {
      if (lv <= 20) {
        const baseHp = poly(88.7, 15.215, 0.085, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-90.4, 23.27, 0.13, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M2' };
      }
      const baseHp = poly(-572.2, 33.115, 0.185, level);
      return { baseHp, baseCp: baseHp * 0.5, classType: 'M3' };
    }
    case 'DF': {
      if (lv <= 20) {
        const baseHp = poly(80.5, 13.425, 0.075, level);
        return { baseHp, baseCp: baseHp * 0.4, classType: 'F1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-257.8, 28.64, 0.16, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'F2' };
      }
      const baseHp = poly(-695.8, 37.59, 0.21, level);
      return { baseHp, baseCp: baseHp * 0.6, classType: 'F3' };
    }
    case 'DM': {
      if (lv <= 20) {
        const baseHp = poly(90.7, 15.215, 0.085, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-108.3, 24.165, 0.135, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M2' };
      }
      const baseHp = poly(-546.3, 33.115, 0.185, level);
      return { baseHp, baseCp: baseHp * 0.5, classType: 'M3' };
    }
    case 'OF': {
      if (lv <= 20) {
        const baseHp = poly(67.4, 12.53, 0.07, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'F1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-251, 26.85, 0.15, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'F2' };
      }
      const baseHp = poly(-776.6, 37.59, 0.21, level);
      return { baseHp, baseCp: baseHp * 0.5, classType: 'F3' };
    }
    case 'OM': {
      if (lv <= 20) {
        const baseHp = poly(79.7, 15.215, 0.085, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-218.8, 28.64, 0.16, level);
        return { baseHp, baseCp: baseHp * 0.5, classType: 'M2' };
      }
      const baseHp = poly(-613, 36.695, 0.205, level);
      return { baseHp, baseCp: baseHp * 0.5, classType: 'M3' };
    }
    case 'DW': {
      if (lv <= 20) {
        const baseHp = poly(67.4, 12.53, 0.07, level);
        return { baseHp, baseCp: baseHp * 0.7, classType: 'F1' };
      }
      if (lv <= 40) {
        const baseHp = poly(-290.8, 28.64, 0.16, level);
        return { baseHp, baseCp: baseHp * 0.7, classType: 'F2' };
      }
      const baseHp = poly(-816.4, 39.38, 0.22, level);
      return { baseHp, baseCp: baseHp * 0.7, classType: 'F3' };
    }
    default: {
      const baseHp = poly(68.3, 11.635, 0.065, level);
      return { baseHp, baseCp: baseHp * 0.4, classType: 'F1' };
    }
  }
}

function mpTableForClassType(t: ClassType): number[] {
  switch (t) {
    case 'F1':
      return FIGHTER1MP;
    case 'F2':
      return FIGHTER2MP;
    case 'F3':
      return FIGHTER3MP;
    case 'M1':
      return MYSTIC1MP;
    case 'M2':
      return MYSTIC2MP;
    case 'M3':
      return MYSTIC3MP;
  }
}

function baseMpAtLevel(classType: ClassType, level: number): number {
  const arr = mpTableForClassType(classType);
  const lv = L(level);
  const i = Math.min(lv, arr.length - 1);
  return arr[i] ?? 0;
}

/**
 * Базові max HP/CP/MP з кривих раси/рівня; множники CON/MEN — пайплайн первинних статів
 * (`conHpMultiplier` / `menMpMultiplier`), без бафів/прикрас.
 */
export function computeVitals(
  level: number,
  race: string,
  classBranch: string,
  con: number,
  men: number
): { maxHp: number; maxCp: number; maxMp: number } {
  const code = raceAndBranchToL2Code(race, classBranch);
  const { baseHp, baseCp, classType } = baseHpCpClassType(level, code);
  const chp = conHpMultiplier(con);
  const mmp = menMpMultiplier(men);
  const baseMp = baseMpAtLevel(classType, level);
  const maxHp = Math.max(1, Math.floor(baseHp * chp));
  const maxCp = Math.max(0, Math.floor(baseCp * chp));
  const maxMp = Math.max(0, Math.floor(baseMp * mmp));
  return { maxHp, maxCp, maxMp };
}
