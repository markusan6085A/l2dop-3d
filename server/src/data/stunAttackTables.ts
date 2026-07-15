/**
 * Stun Attack (skill 100) — удар булавою з оглушенням.
 * MP / power — l2db Interlude (`L2DB_SKILL_LEVELS_BY_ID`).
 */
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

const STUN_ATTACK_LEVELS = L2DB_SKILL_LEVELS_BY_ID[100] ?? [];

export const STUN_ATTACK_MAX_RANK = STUN_ATTACK_LEVELS.length || 15;

export function isBluntWeaponKind(weaponKind: string | undefined): boolean {
  const wk = weaponKind ?? '';
  return wk === 'blunt' || wk === 'bigblunt';
}

export function stunAttackMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  if (STUN_ATTACK_LEVELS.length === 0) return null;
  const r = Math.max(1, Math.min(STUN_ATTACK_LEVELS.length, Math.floor(rank)));
  const row = STUN_ATTACK_LEVELS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

export const STUN_ATTACK_HINT_UK =
  'Актив: урон + оглушення по одній цілі. Лише булава (1 р. — MP 20 / power 36, 15 р. — MP 34 / power 131). Повторне оглушення не накладається, поки діє ефект. Можливий надудар.';

/** Текст для магістра / UI на конкретному рівні скіла. */
export function stunAttackStatsNoteUk(rank: number): string {
  const row = stunAttackMpPowerAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (!row) {
    return 'Актив: урон і оглушення по одній цілі. Лише булава в руці. Можливий надудар.';
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    ' скіла. Лише булава; оглушення не стакається. Можливий надудар.'
  );
}
