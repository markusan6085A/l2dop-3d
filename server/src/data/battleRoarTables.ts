/**
 * Battle Roar (skill 121) — миттєвий хіл % HP + Max HP % на 10 хв.
 * Канон: Warrior / Orc Raider (та суміжні воїнські гілки з allowlist).
 */
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

const BATTLE_ROAR_LEVELS = L2DB_SKILL_LEVELS_BY_ID[121] ?? [];

/** % відновлення HP і бонус Max HP за рангом скіла (1 → 10% … 6 → 35%). */
export const BATTLE_ROAR_HP_PCT_BY_RANK = [10, 15, 20, 25, 30, 35] as const;

export const BATTLE_ROAR_MAX_RANK = BATTLE_ROAR_HP_PCT_BY_RANK.length;

/** Тривалість бафа (сек) — 10 хв. */
export const BATTLE_ROAR_BUFF_DURATION_SEC = 600;

export function battleRoarHpPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(BATTLE_ROAR_MAX_RANK, Math.floor(rank)));
  return BATTLE_ROAR_HP_PCT_BY_RANK[r - 1] ?? 10;
}

export function battleRoarMaxHpMulAtRank(rank: number): number {
  return 1 + battleRoarHpPctAtRank(rank) / 100;
}

export function battleRoarMpAtRank(rank: number): number | null {
  if (BATTLE_ROAR_LEVELS.length === 0) return null;
  const r = Math.max(1, Math.min(BATTLE_ROAR_LEVELS.length, Math.floor(rank)));
  const row = BATTLE_ROAR_LEVELS[r - 1];
  return row?.mpCost ?? null;
}

/** Текст для магістра / UI на конкретному рівні скіла. */
export function battleRoarStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.floor(rank));
  const pct = battleRoarHpPctAtRank(lv);
  const mp = battleRoarMpAtRank(lv);
  const mpPart = mp != null ? ', MP ' + mp : '';
  return (
    'Миттєво відновлює ' +
    pct +
    '% HP і Max HP +' +
    pct +
    '% на 10 хв (р. ' +
    lv +
    ' скіла' +
    mpPart +
    ').'
  );
}

export function battleRoarSkillLineUk(rank: number): string {
  const pct = battleRoarHpPctAtRank(rank);
  return (
    'Бойовий рик (Battle Roar): +' +
    pct +
    '% HP і Max HP на 10 хв.'
  );
}
