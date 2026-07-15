import type { MapWorldSpawn } from './mapWorldSpawns.js';

/** L2 Interlude: відкат Hammer Crush (skill 260). */
export const HAMMER_CRUSH_COOLDOWN_SEC = 13;

/** Макс. ранг скіла у грі (Gladiator / Destroyer / BH / Warsmith / Overlord / Warcryer). */
export const HAMMER_CRUSH_MAX_SKILL_RANK = 19;

/** Тривалість Shock/Stun на цілі (мс) за рангом скіла. */
export function hammerCrushStunDurationMs(skillRank: number): number {
  const r = Math.max(1, Math.min(HAMMER_CRUSH_MAX_SKILL_RANK, Math.floor(skillRank)));
  if (r <= 2) return 9000;
  if (r >= 19) return 4000;
  return Math.round(8500 - ((r - 3) / 16) * 4500);
}

/** Оглушення Hammer Crush не діє на РБ та епіків. */
export function spawnBlocksHammerCrushStun(
  kind: MapWorldSpawn['kind'] | undefined
): boolean {
  return kind === 'raid' || kind === 'epic' || kind === 'epic_guard';
}

/** Підказка для картки скіла у магістра. */
export function hammerCrushStatsNoteUk(skillRank: number): string {
  const r = Math.max(1, Math.min(HAMMER_CRUSH_MAX_SKILL_RANK, Math.floor(skillRank)));
  const stunPct = Math.min(75, 45 + r * 2);
  const stunSec = Math.round(hammerCrushStunDurationMs(r) / 1000);
  return (
    'Потрібна булава. Shock/Stun ~' +
    stunSec +
    ' с (~' +
    stunPct +
    '%); відкат ' +
    HAMMER_CRUSH_COOLDOWN_SEC +
    ' с. Не діє на РБ/епіків.'
  );
}
