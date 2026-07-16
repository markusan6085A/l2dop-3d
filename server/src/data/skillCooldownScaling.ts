/**
 * Масштабування перезарядки скілів від cast speed (маги) та attack speed (воїни).
 *
 * Базові припущення (узгоджено з `computeCombatStats`):
 * - castSpd: 100..2000, baseline 600
 * - pAtkSpd: 100..1500, baseline 600
 */
import { isMysticClassBranch } from './l2dopHumanMysticBattleSkills.js';
import { L2DOP_SKILL_REUSE_DELAY_SEC } from './l2dopSkillReuseDelaySec.js';
import { mysticStarterCastBaseSec } from './mysticStarterCastBaseSec.js';

export const CAST_SPD_BASELINE = 600;
export const CAST_SPD_MIN = 100;
export const CAST_SPD_MAX = 2000;
export const MYSTIC_CD_FLOOR_SEC = 0.3;

export const PATK_SPD_BASELINE = 600;
export const PATK_SPD_MIN = 100;
export const PATK_SPD_MAX = 1500;
export const FIGHTER_CD_MAX_REDUCTION = 0.6;
export const FIGHTER_CD_FLOOR_SEC = 0.5;

function clampSpeed(
  value: number,
  min: number,
  max: number,
  fallback: number
): number {
  const n = Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

export function roundSkillCdSec(cdSec: number, floorSec: number): number {
  return Math.max(floorSec, Math.round(cdSec * 100) / 100);
}

/**
 * Базовий CD маг. атакуючого скіла при castSpd = 600:
 * ранг 1 → 7 с, ранг 10+ → 4 с.
 */
export function mysticMagicAttackBaseCdSec(skillRank: number): number {
  const rank = Math.max(1, Math.floor(skillRank));
  const steps = Math.min(9, rank - 1);
  return roundSkillCdSec(7 - (steps * 3) / 9, MYSTIC_CD_FLOOR_SEC);
}

/**
 * castSpd 600 → baseCd; вище → менше (мін. {@link MYSTIC_CD_FLOOR_SEC}).
 * Приклад: base 6 с, cast 1800 → 2 с; cast 2000 → 1.8 с.
 */
export function scaleMysticCooldownByCastSpeed(
  baseCdSec: number,
  castSpd: number
): number {
  const base =
    typeof baseCdSec === 'number' && Number.isFinite(baseCdSec) && baseCdSec > 0
      ? baseCdSec
      : mysticMagicAttackBaseCdSec(1);
  const cspd = clampSpeed(
    castSpd,
    CAST_SPD_MIN,
    CAST_SPD_MAX,
    CAST_SPD_BASELINE
  );
  const scaled = base * (CAST_SPD_BASELINE / cspd);
  return roundSkillCdSec(scaled, MYSTIC_CD_FLOOR_SEC);
}

/** Лінійно 0% при baseline pAtkSpd → 60% при max pAtkSpd. */
export function fighterAttackSpeedCooldownReduction(pAtkSpd: number): number {
  const spd = clampSpeed(
    pAtkSpd,
    PATK_SPD_MIN,
    PATK_SPD_MAX,
    PATK_SPD_BASELINE
  );
  if (spd <= PATK_SPD_BASELINE) return 0;
  const span = PATK_SPD_MAX - PATK_SPD_BASELINE;
  if (span <= 0) return 0;
  const t = (spd - PATK_SPD_BASELINE) / span;
  return FIGHTER_CD_MAX_REDUCTION * Math.min(1, Math.max(0, t));
}

/** Базовий CD воїна зменшується до −60% при max pAtkSpd. */
export function scaleFighterCooldownByAttackSpeed(
  baseCdSec: number,
  pAtkSpd: number
): number {
  const base =
    typeof baseCdSec === 'number' && Number.isFinite(baseCdSec) && baseCdSec > 0
      ? baseCdSec
      : 3;
  const reduction = fighterAttackSpeedCooldownReduction(pAtkSpd);
  const scaled = base * (1 - reduction);
  return roundSkillCdSec(scaled, FIGHTER_CD_FLOOR_SEC);
}

/**
 * Пасивки cooldown reduction: 1.10 = на 10% швидше (CD ділиться на 1.10).
 */
export function applyCooldownReductionMul(
  cdSec: number,
  cooldownReductionMul: number | undefined,
  minSec: number
): number {
  const mul =
    typeof cooldownReductionMul === 'number' &&
    Number.isFinite(cooldownReductionMul) &&
    cooldownReductionMul > 0
      ? cooldownReductionMul
      : 1;
  const reduced = cdSec / mul;
  return roundSkillCdSec(reduced, minSec);
}

/** Глобальний CD маг. bolt без fixed CD у каталозі. */
export function mysticGlobalSkillCooldownSec(
  castSpd: number,
  skillRank = 1
): number {
  return scaleMysticCooldownByCastSpeed(
    mysticMagicAttackBaseCdSec(skillRank),
    castSpd
  );
}

export type BattleSkillCooldownResolveInput = {
  classBranch: string;
  category?: string | null;
  kind?: string | null;
  skillRank: number;
  baseCdSec?: number | null;
  /** L2 skill id — для override базового касту стартових mystic bolt-скілів. */
  l2SkillId?: number | null;
  castSpd: number;
  pAtkSpd: number;
  cooldownReductionMul?: number;
};

/**
 * Єдина точка розрахунку CD у бою / UI.
 * - явний reuse (`cooldownSec` / `L2DOP_SKILL_REUSE_DELAY_SEC`) — фіксований відкат Interlude
 * - інакше mystic bolt з `mysticStarterCastBaseSec` — fallback (cast-база × castSpd)
 * - magic_attack без fixed: 4–7 с @ cast 600
 * - fighter: фіксований reboot з l2db/XML (без aspd)
 */
export function resolveBattleSkillCooldownSec(
  input: BattleSkillCooldownResolveInput
): number {
  const kind = String(input.kind ?? '').trim();
  /** Toggle: лише фіксований CD з XML/каталогу (0 = миттєве перемикання), без cast/aspd. */
  if (kind === 'toggle') {
    const rawBase = input.baseCdSec;
    if (
      typeof rawBase === 'number' &&
      Number.isFinite(rawBase) &&
      rawBase > 0
    ) {
      return rawBase;
    }
    return 0;
  }

  const category = String(input.category ?? '').trim();
  const isMystic = isMysticClassBranch(input.classBranch);
  const rank = Math.max(1, Math.floor(input.skillRank));
  const rawBase = input.baseCdSec;
  const hasFixedBase =
    typeof rawBase === 'number' && Number.isFinite(rawBase) && rawBase > 0;

  /**
   * Перевірені Interlude reuse для mystic — фіксовані секунди, без cast/aspd
   * і без пасивок cooldown reduction (UI і сервер мають збігатися).
   */
  if (isMystic && typeof input.l2SkillId === 'number' && input.l2SkillId > 0) {
    const interludeReuse = L2DOP_SKILL_REUSE_DELAY_SEC[input.l2SkillId];
    if (typeof interludeReuse === 'number' && interludeReuse > 0) {
      return roundSkillCdSec(interludeReuse, MYSTIC_CD_FLOOR_SEC);
    }
  }

  let cd: number;
  let minFloor = MYSTIC_CD_FLOOR_SEC;

  const starterCastBase =
    isMystic &&
    typeof input.l2SkillId === 'number' &&
    Number.isFinite(input.l2SkillId) &&
    input.l2SkillId > 0
      ? mysticStarterCastBaseSec(input.l2SkillId, input.classBranch)
      : null;

  /**
   * Явний reuse delay (каталог `cooldownSec` або `L2DOP_SKILL_REUSE_DELAY_SEC`) —
   * Interlude «відкат», НЕ час касту. `mysticStarterCastBaseSec` лише для cast UI.
   */
  if (hasFixedBase && !isMystic) {
    return applyCooldownReductionMul(
      roundSkillCdSec(rawBase!, 0),
      input.cooldownReductionMul,
      0
    );
  }
  if (hasFixedBase) {
    cd = rawBase!;
  } else if (starterCastBase != null) {
    cd = scaleMysticCooldownByCastSpeed(starterCastBase, input.castSpd);
  } else if (category === 'magic_attack') {
    cd = scaleMysticCooldownByCastSpeed(
      mysticMagicAttackBaseCdSec(rank),
      input.castSpd
    );
  } else if (isMystic) {
    cd = scaleMysticCooldownByCastSpeed(
      mysticMagicAttackBaseCdSec(rank),
      input.castSpd
    );
  } else {
    return 0;
  }

  return applyCooldownReductionMul(
    cd,
    input.cooldownReductionMul,
    minFloor
  );
}
