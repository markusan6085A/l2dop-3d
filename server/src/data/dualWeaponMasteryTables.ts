/**
 * Dual Weapon Mastery (skill 144) — flat P. Atk з дуальними мечами.
 * Gladiator / Duelist, Bladedancer / Spectral Dancer.
 * Таблиця з `TEXT_RPG_HF_PASSIVE_EFFECTS` (text-rpg HF).
 */
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';

const DUAL_WEAPON_ROW = TEXT_RPG_HF_PASSIVE_EFFECTS.find((r) => r.l2SkillId === 144);

export const DUAL_WEAPON_MASTERY_MAX_RANK = DUAL_WEAPON_ROW?.maxRank ?? 37;

function formatFlat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function dualWeaponMasteryPatkFlatAtRank(rank: number): number {
  if (!DUAL_WEAPON_ROW) return 0;
  const r = Math.max(1, Math.min(DUAL_WEAPON_ROW.maxRank, Math.floor(rank)));
  const p = DUAL_WEAPON_ROW.powerByRank[r];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}

export const DUAL_WEAPON_MASTERY_HINT_UK =
  'Пасив: +P. Atk (flat) з дуальними мечами (1 р. — +23.7, 37 р. — +129.3). Пакети з 40 лвл; макс. 37 р.';

/** Текст для магістра / профілю на конкретному рівні скіла. */
export function dualWeaponMasteryStatsNoteUk(rank: number): string {
  const flat = dualWeaponMasteryPatkFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) {
    return 'Пасив: підвищує P. Atk з дуальними мечами. Діє лише з дуалами в руці.';
  }
  return (
    'Пасив: +' +
    formatFlat(flat) +
    ' P. Atk (flat) на р. ' +
    lv +
    ' скіла (лише дуальні мечі). MP у бою не витрачається.'
  );
}
