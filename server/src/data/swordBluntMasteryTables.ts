/**
 * Sword / Blunt Mastery (skill 257) — flat P. Atk з мечем або булавою.
 * Канон Interlude / la2era; таблиця з `TEXT_RPG_HF_PASSIVE_EFFECTS`.
 */
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';

const SWORD_BLUNT_ROW = TEXT_RPG_HF_PASSIVE_EFFECTS.find((r) => r.l2SkillId === 257);

export const SWORD_BLUNT_MASTERY_MAX_RANK = SWORD_BLUNT_ROW?.maxRank ?? 43;

function formatFlat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function isSwordOrBluntWeaponKind(weaponKind: string | undefined): boolean {
  const wk = weaponKind ?? '';
  return (
    wk === 'sword' ||
    wk === 'blunt' ||
    wk === 'bigsword' ||
    wk === 'bigblunt'
  );
}

export function swordBluntMasteryPatkFlatAtRank(rank: number): number {
  if (!SWORD_BLUNT_ROW) return 0;
  const r = Math.max(1, Math.min(SWORD_BLUNT_ROW.maxRank, Math.floor(rank)));
  const p = SWORD_BLUNT_ROW.powerByRank[r];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}

export const SWORD_BLUNT_MASTERY_HINT_UK =
  'Пасив: +P. Atk (flat) з мечем або булавою (1 р. — +4.5, 43 р. — +122.1).';

/** Текст для магістра / UI на конкретному рівні скіла (лише воїни-файтери). */
export function swordBluntMasteryStatsNoteUk(rank: number): string {
  const flat = swordBluntMasteryPatkFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) {
    return 'Пасив: підвищує P. Atk з мечем або булавою. Діє лише з відповідною зброєю в руці.';
  }
  return (
    'Пасив: +' +
    formatFlat(flat) +
    ' P. Atk (flat) на рівні ' +
    lv +
    ' скіла (лише меч/булавою). MP у бою не витрачається.'
  );
}
