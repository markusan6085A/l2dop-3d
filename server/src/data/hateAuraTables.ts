/**
 * Hate Aura (skill 18) — Human Paladin → Phoenix Knight.
 * AoE-провокація: power = сила агро, без урону. Радіус 200, каст 1,2 с, відкат 3 с.
 */
import { BATTLE_RANGE } from '../domain/battleTypes.js';
import type { MapWorldSpawn } from './mapWorldSpawns.js';
import { spawnAllowsProvokeAggro } from './provokeTables.js';

export const HATE_AURA_L2_SKILL_ID = 18;
export const HATE_AURA_BATTLE_ID = 'l2_18';
export const HATE_AURA_MAX_RANK = 37;
export const HATE_AURA_COOLDOWN_SEC = 3;
export const HATE_AURA_CAST_SEC = 1.2;
/** Радіус скіла в Interlude (skillRadius). */
export const HATE_AURA_INTERLUDE_RADIUS = 200;
export const HATE_AURA_MAX_INTERLUDE_RADIUS_REF = 900;
/** Макс. додаткових цілей у зоні аури (окрім головної). */
export const HATE_AURA_EXTRA_MOB_CAP = 20;

export const HATE_AURA_LEVEL_ROWS = [
  { level: 1, requiredLevel: 40, spCost: 12_000, mpCost: 50, aggroPower: 1078 },
  { level: 2, requiredLevel: 40, spCost: 12_000, mpCost: 51, aggroPower: 1107 },
  { level: 3, requiredLevel: 40, spCost: 12_000, mpCost: 53, aggroPower: 1136 },
  { level: 4, requiredLevel: 43, spCost: 14_000, mpCost: 54, aggroPower: 1166 },
  { level: 5, requiredLevel: 43, spCost: 14_000, mpCost: 55, aggroPower: 1195 },
  { level: 6, requiredLevel: 43, spCost: 14_000, mpCost: 57, aggroPower: 1224 },
  { level: 7, requiredLevel: 46, spCost: 18_000, mpCost: 58, aggroPower: 1254 },
  { level: 8, requiredLevel: 46, spCost: 18_000, mpCost: 60, aggroPower: 1283 },
  { level: 9, requiredLevel: 46, spCost: 18_000, mpCost: 61, aggroPower: 1312 },
  { level: 10, requiredLevel: 49, spCost: 27_000, mpCost: 63, aggroPower: 1342 },
  { level: 11, requiredLevel: 49, spCost: 27_000, mpCost: 64, aggroPower: 1371 },
  { level: 12, requiredLevel: 49, spCost: 27_000, mpCost: 66, aggroPower: 1400 },
  { level: 13, requiredLevel: 52, spCost: 42_000, mpCost: 67, aggroPower: 1429 },
  { level: 14, requiredLevel: 52, spCost: 42_000, mpCost: 69, aggroPower: 1457 },
  { level: 15, requiredLevel: 52, spCost: 42_000, mpCost: 70, aggroPower: 1485 },
  { level: 16, requiredLevel: 55, spCost: 49_000, mpCost: 72, aggroPower: 1513 },
  { level: 17, requiredLevel: 55, spCost: 49_000, mpCost: 74, aggroPower: 1541 },
  { level: 18, requiredLevel: 55, spCost: 49_000, mpCost: 75, aggroPower: 1568 },
  { level: 19, requiredLevel: 58, spCost: 67_000, mpCost: 77, aggroPower: 1595 },
  { level: 20, requiredLevel: 58, spCost: 67_000, mpCost: 78, aggroPower: 1621 },
  { level: 21, requiredLevel: 58, spCost: 67_000, mpCost: 80, aggroPower: 1647 },
  { level: 22, requiredLevel: 60, spCost: 130_000, mpCost: 81, aggroPower: 1672 },
  { level: 23, requiredLevel: 60, spCost: 130_000, mpCost: 83, aggroPower: 1697 },
  { level: 24, requiredLevel: 62, spCost: 170_000, mpCost: 85, aggroPower: 1721 },
  { level: 25, requiredLevel: 62, spCost: 170_000, mpCost: 86, aggroPower: 1745 },
  { level: 26, requiredLevel: 64, spCost: 190_000, mpCost: 87, aggroPower: 1768 },
  { level: 27, requiredLevel: 64, spCost: 190_000, mpCost: 89, aggroPower: 1790 },
  { level: 28, requiredLevel: 66, spCost: 290_000, mpCost: 90, aggroPower: 1811 },
  { level: 29, requiredLevel: 66, spCost: 290_000, mpCost: 92, aggroPower: 1831 },
  { level: 30, requiredLevel: 68, spCost: 330_000, mpCost: 93, aggroPower: 1851 },
  { level: 31, requiredLevel: 68, spCost: 330_000, mpCost: 95, aggroPower: 1870 },
  { level: 32, requiredLevel: 70, spCost: 390_000, mpCost: 96, aggroPower: 1888 },
  { level: 33, requiredLevel: 70, spCost: 390_000, mpCost: 97, aggroPower: 1905 },
  { level: 34, requiredLevel: 72, spCost: 580_000, mpCost: 99, aggroPower: 1921 },
  { level: 35, requiredLevel: 72, spCost: 580_000, mpCost: 100, aggroPower: 1936 },
  { level: 36, requiredLevel: 74, spCost: 960_000, mpCost: 101, aggroPower: 1950 },
  { level: 37, requiredLevel: 74, spCost: 960_000, mpCost: 102, aggroPower: 1963 },
] as const;

export const HATE_AURA_HINT_UK =
  'Провокує всіх ворогів у радіусі 200 навколо вас: power = сила агро, без урону. ' +
  'Моби та РБ переключаються на танка. 37 р. — 40–74 лв (Paladin / Phoenix Knight). ' +
  'Каст ' +
  HATE_AURA_CAST_SEC +
  ' с, відкат ' +
  HATE_AURA_COOLDOWN_SEC +
  ' с.';

export function hateAuraAggroPowerAtRank(rank: number): number {
  const r = Math.max(1, Math.min(HATE_AURA_MAX_RANK, Math.floor(rank)));
  return HATE_AURA_LEVEL_ROWS[r - 1]?.aggroPower ?? 0;
}

export function hateAuraMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(HATE_AURA_MAX_RANK, Math.floor(rank)));
  const mp = HATE_AURA_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function hateAuraRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return HATE_AURA_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function hateAuraSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = HATE_AURA_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function hateAuraWorldRadius(): number {
  return Math.floor(
    BATTLE_RANGE *
      (HATE_AURA_INTERLUDE_RADIUS / HATE_AURA_MAX_INTERLUDE_RADIUS_REF)
  );
}

export function hateAuraStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(HATE_AURA_MAX_RANK, Math.floor(rank)));
  const power = hateAuraAggroPowerAtRank(r);
  const mp = hateAuraMpAtRank(r);
  const reqLv = HATE_AURA_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  const worldR = hateAuraWorldRadius();
  return (
    'Аура ненависті: агро ' +
    power +
    ' (power, не урон) у радіусі ' +
    HATE_AURA_INTERLUDE_RADIUS +
    ' (≈' +
    worldR +
    ' на карті) на р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ', каст ' +
    HATE_AURA_CAST_SEC +
    ' с, відкат ' +
    HATE_AURA_COOLDOWN_SEC +
    ' с.'
  );
}

export function hateAuraSkillLineUk(rank: number): string {
  const power = hateAuraAggroPowerAtRank(rank);
  return (
    'Аура ненависті (18, Hate Aura): загроза ' +
    power +
    ' — вороги в радіусі ' +
    HATE_AURA_INTERLUDE_RADIUS +
    ' переключаються на вас. Урону немає.'
  );
}

export function hateAuraBattleLogLineUk(
  skillRank: number,
  mobNames: string[]
): string {
  const power = hateAuraAggroPowerAtRank(skillRank);
  const names =
    mobNames.length > 0 ? mobNames.join(', ') : 'немає цілей у радіусі';
  return (
    'Аура ненависті (Hate Aura): агро ' +
    power +
    ' — ' +
    names +
    '.'
  );
}

/** Мобів і РБ можна; епіки/epic_guard — ні (як Provoke). */
export function spawnAllowsHateAuraAggro(
  kind: MapWorldSpawn['kind'] | undefined
): boolean {
  return spawnAllowsProvokeAggro(kind);
}
