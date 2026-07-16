import { BATTLE_RANGE } from '../domain/battleTypes.js';
import { PROVOKE_MAX_INTERLUDE_RADIUS } from './provokeTables.js';

/** Interlude Shock Blast (361): сила фіз. удару (1 р.). */
export const SHOCK_BLAST_SKILL_POWER = 1973;
/** Interlude `skillRadius` навколо обраної цілі. */
export const SHOCK_BLAST_INTERLUDE_RADIUS = 150;
/** Дальність касту (Interlude castRange). */
export const SHOCK_BLAST_CAST_RANGE = 500;
/** Додаткових цілей поруч (головна + ці). */
export const SHOCK_BLAST_EXTRA_MOB_CAP = 3;
/** Базовий шанс стану (Shock/Stun), %; залежить від CON/резисту цілі. */
export const SHOCK_BLAST_BASE_STUN_CHANCE_PCT = 40;
/** Тривалість стану та дебафів P.Def/M.Def, мс. */
export const SHOCK_BLAST_STUN_DURATION_MS = 9000;
/** −30% P.Def і M.Def цілі. */
export const SHOCK_BLAST_DEF_DEBUFF_MUL = 0.7;

export function shockBlastWorldRadius(): number {
  return Math.floor(
    BATTLE_RANGE *
      (SHOCK_BLAST_INTERLUDE_RADIUS / PROVOKE_MAX_INTERLUDE_RADIUS)
  );
}
