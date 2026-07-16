/**
 * Shield Stun (skill 92) — Interlude, Knight → Paladin → Phoenix Knight.
 * Удар щитом: лише оглушення (без урону). MP — з таблиці автора; SP/рівні — l2db.
 */
import type { MapWorldSpawn } from './mapWorldSpawns.js';
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

export const SHIELD_STUN_L2_SKILL_ID = 92;
export const SHIELD_STUN_BATTLE_ID = 'l2_92';
export const SHIELD_STUN_MAX_RANK = 52;
export const SHIELD_STUN_BASE_STUN_CHANCE_PCT = 80;
export const SHIELD_STUN_COOLDOWN_SEC = 12;
export const SHIELD_STUN_CAST_SEC = 1.2;
export const SHIELD_STUN_DURATION_PVE_SEC = 9;
export const SHIELD_STUN_DURATION_PVP_SEC = 4;

/** MP за ранг (авторська таблиця; l2db MP не збігається). */
const MP_BY_RANK: readonly number[] = [
  22, 22, 22, 23, 24, 25, 27, 29, 30, 31, 31, 33, 35, 36, 37, 40, 41, 43, 43,
  44, 45, 47, 48, 49, 51, 52, 54, 55, 55, 56, 58, 59, 61, 62, 63, 65, 66, 68,
  68, 69, 70, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83,
];

const L2DB_ROWS = L2DB_SKILL_LEVELS_BY_ID[SHIELD_STUN_L2_SKILL_ID] ?? [];

export const SHIELD_STUN_LEVEL_ROWS = L2DB_ROWS.map((row, i) => ({
  level: row.level,
  requiredLevel: row.requiredLevel,
  spCost: row.spCost,
  mpCost: MP_BY_RANK[i] ?? row.mpCost,
}));

export const SHIELD_STUN_HINT_UK =
  'Удар щитом: оглушує ціль (базовий шанс 80%, залежить від CON цілі). ' +
  'Потрібен екіпований щит; повторне оглушення не накладається, поки діє ефект. ' +
  'Каст 1,2 с, відкат 12 с, ближній бій. PvE — 9 с стану; PvP — 4 с. ' +
  'Не діє на епіків та їх охорону; на РБ — з урахуванням стійкості. ' +
  'Knight → Paladin; макс. 52 р. на 74 лв персонажа.';

/** РБ — можна (як Provoke); епіки та epic_guard — імунітет. */
export function spawnBlocksShieldStun(
  kind: MapWorldSpawn['kind'] | undefined
): boolean {
  return kind === 'epic' || kind === 'epic_guard';
}

export function shieldStunRowAtRank(rank: number) {
  const r = Math.max(1, Math.min(SHIELD_STUN_MAX_RANK, Math.floor(rank)));
  return SHIELD_STUN_LEVEL_ROWS[r - 1];
}

export function shieldStunMpAtRank(rank: number): number | undefined {
  const row = shieldStunRowAtRank(rank);
  if (!row) return undefined;
  const mp = row.mpCost;
  return Number.isFinite(mp) && mp >= 0 ? Math.floor(mp) : undefined;
}

export function shieldStunRequiredLevelAtRank(rank: number): number | undefined {
  const row = shieldStunRowAtRank(rank);
  if (!row) return undefined;
  const lv = row.requiredLevel;
  return Number.isFinite(lv) && lv >= 1 ? Math.floor(lv) : undefined;
}

export function shieldStunSpCostAtRank(rank: number): number | undefined {
  const row = shieldStunRowAtRank(rank);
  if (!row) return undefined;
  const sp = row.spCost;
  return Number.isFinite(sp) && sp >= 0 ? Math.floor(sp) : undefined;
}

export function shieldStunDurationMs(isPvp: boolean): number {
  const sec = isPvp ? SHIELD_STUN_DURATION_PVP_SEC : SHIELD_STUN_DURATION_PVE_SEC;
  return Math.max(1, sec) * 1000;
}

export function shieldStunStatsNoteUk(rank: number, charLevel?: number): string {
  const row = shieldStunRowAtRank(rank);
  const r = Math.max(1, Math.floor(rank));
  const mp = row?.mpCost ?? '?';
  const lvNote =
    typeof charLevel === 'number' && Number.isFinite(charLevel)
      ? ` Макс. ранг на ${Math.floor(charLevel)} лв — ${shieldStunMaxRankAtCharLevel(charLevel)}.`
      : '';
  return (
    `Оглушення щитом: шанс ${SHIELD_STUN_BASE_STUN_CHANCE_PCT}% (мінус CON цілі), без урону. ` +
    `Ранг ${r}: MP ${mp}, відкат ${SHIELD_STUN_COOLDOWN_SEC} с. ` +
    `PvE ${SHIELD_STUN_DURATION_PVE_SEC} с / PvP ${SHIELD_STUN_DURATION_PVP_SEC} с стану. ` +
    `Не діє на епіків.${lvNote}`
  );
}

export function shieldStunMaxRankAtCharLevel(charLevel: number): number {
  const lv = Math.max(1, Math.floor(charLevel));
  let max = 0;
  for (const row of SHIELD_STUN_LEVEL_ROWS) {
    if (row.requiredLevel <= lv) max = row.level;
    else break;
  }
  return Math.max(1, max || 1);
}

export function shieldStunSkillLineUk(
  applied: boolean,
  alreadyStunned: boolean,
  stunBlocked: boolean,
  durationSec: number
): string {
  const base = 'Удар щитом (92, Shield Stun)';
  if (stunBlocked) {
    return base + ': оглушення не діє на епіків.';
  }
  if (alreadyStunned) {
    return base + ': ціль уже оглушена — ефект не оновлено.';
  }
  if (applied) {
    return base + ': ціль оглушена (Shock) ~' + durationSec + ' с.';
  }
  return base + ': оглушення не спрацювало.';
}
