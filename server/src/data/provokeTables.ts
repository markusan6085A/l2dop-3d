import type { MapWorldSpawn } from './mapWorldSpawns.js';
import { BATTLE_RANGE } from '../domain/battleTypes.js';

/** Interlude Provoke (286): MP за рангом. */
export const PROVOKE_MP = [57, 75, 83] as const;
/** Interlude `skillRadius` (500 / 700 / 900) — масштабується до `BATTLE_RANGE`. */
export const PROVOKE_RADIUS_INTERLUDE = [500, 700, 900] as const;
export const PROVOKE_MAX_INTERLUDE_RADIUS = 900;
/** Тривалість дебафу (с) за рангом. */
export const PROVOKE_DURATION_SEC = [10, 15, 20] as const;
/** Зниження опору до списів (%) — більше урону від pole. */
export const PROVOKE_POLE_RESIST_CUT_PCT = [10, 15, 20] as const;
/** Макс. додаткових цілей у зоні провокації (окрім головної). */
export const PROVOKE_EXTRA_MOB_CAP = 30;

export function provokeRankIndex(skillRank: number): number {
  return Math.max(0, Math.min(PROVOKE_MP.length - 1, Math.floor(skillRank) - 1));
}

export function provokeMpAtRank(skillRank: number): number {
  return PROVOKE_MP[provokeRankIndex(skillRank)]!;
}

export function provokeWorldRadiusAtRank(skillRank: number): number {
  const r = PROVOKE_RADIUS_INTERLUDE[provokeRankIndex(skillRank)]!;
  return Math.floor(BATTLE_RANGE * (r / PROVOKE_MAX_INTERLUDE_RADIUS));
}

export function provokeDurationSecAtRank(skillRank: number): number {
  return PROVOKE_DURATION_SEC[provokeRankIndex(skillRank)]!;
}

export function provokePoleResistCutPctAtRank(skillRank: number): number {
  return PROVOKE_POLE_RESIST_CUT_PCT[provokeRankIndex(skillRank)]!;
}

/** Мобів і РБ можна; епіків та їх охорону — ні. */
export function spawnAllowsProvokeAggro(
  kind: MapWorldSpawn['kind'] | undefined
): boolean {
  return kind !== 'epic' && kind !== 'epic_guard';
}

export function provokeStatsNoteUk(skillRank: number): string {
  const i = provokeRankIndex(skillRank);
  const r = PROVOKE_RADIUS_INTERLUDE[i]!;
  const worldR = provokeWorldRadiusAtRank(skillRank);
  return (
    'Провокація: агро мобів і РБ у радіусі ~' +
    r +
    ' (≈' +
    worldR +
    ' на карті), ' +
    PROVOKE_DURATION_SEC[i] +
    ' с; −' +
    PROVOKE_POLE_RESIST_CUT_PCT[i] +
    '% опору до списів. Епіки — ні. MP ' +
    PROVOKE_MP[i] +
    '.'
  );
}

export function provokeBattleLogLineUk(skillRank: number, mobNames: string[]): string {
  const cut = provokePoleResistCutPctAtRank(skillRank);
  const sec = provokeDurationSecAtRank(skillRank);
  const names =
    mobNames.length > 0 ? mobNames.join(', ') : 'немає цілей у радіусі';
  return (
    'Провокація (Provoke): агро ' +
    names +
    '; −' +
    cut +
    '% опору до списів, ' +
    sec +
    ' с.'
  );
}
