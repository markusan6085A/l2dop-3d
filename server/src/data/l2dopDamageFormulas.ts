/**
 * Наближення до l2dop (PHP): `function.php` (фізика), `skills.php` / `123.php` (магія).
 * Порядок множників у криті спрощено до одного рядка, як у коментарях до `resolvePhysicalHit`.
 */

import { clampMagicCritDmgMulForDamage } from './l2dopPrimaryStatPipeline.js';

export function l2dopUniformRandom(low: number, high: number): number {
  const a = Math.min(low, high);
  const b = Math.max(low, high);
  return a + Math.random() * (b - a);
}

/** Розкид фіз. урону після формули l2dop (~±10%, як просили для бою з мобами). */
export const L2DOP_PHYSICAL_DAMAGE_VARIANCE = 0.1;

/** Розкид урону РБ/епіка: P.Atk мінус P.Def гравця, ±2%. */
export const L2DOP_WORLD_BOSS_DAMAGE_VARIANCE = 0.02;

function physicalDamageAfterVariance(rawBeforeFloor: number): number {
  const raw = Number.isFinite(rawBeforeFloor) ? rawBeforeFloor : 1;
  const low = raw * (1 - L2DOP_PHYSICAL_DAMAGE_VARIANCE);
  const high = raw * (1 + L2DOP_PHYSICAL_DAMAGE_VARIANCE);
  return Math.max(1, Math.floor(l2dopUniformRandom(low, high)));
}

/**
 * Базовий фіз. урон як у `function.php`: спочатку (70×P.Atk)/P.Def, потім випадковий
 * множник у діапазоні [1−{@link L2DOP_PHYSICAL_DAMAGE_VARIANCE},
 * 1+{@link L2DOP_PHYSICAL_DAMAGE_VARIANCE}].
 */
export function l2dopPhysicalBaseDamage(
  attackerAtk: number,
  targetPDef: number
): number {
  const def = Math.max(1, Math.floor(targetPDef));
  const atk = Math.max(1, Math.floor(attackerAtk));
  const raw = (70 * atk) / def;
  return physicalDamageAfterVariance(raw);
}

function worldBossDamageAfterVariance(rawBeforeFloor: number): number {
  const raw = Number.isFinite(rawBeforeFloor) ? rawBeforeFloor : 1;
  const v = L2DOP_WORLD_BOSS_DAMAGE_VARIANCE;
  const low = raw * (1 - v);
  const high = raw * (1 + v);
  return Math.max(1, Math.floor(l2dopUniformRandom(low, high)));
}

/**
 * Урон РБ по гравцю: показаний P.Atk мінус ефективний P.Def (без коеф. 70/def).
 * Приклад: 1500 atk − 500 def ≈ 1000 HP (±2%).
 */
export function l2dopWorldBossPhysicalDamage(
  mobPAtk: number,
  targetPDef: number
): number {
  const atk = Math.max(1, Math.floor(mobPAtk));
  const def = Math.max(0, Math.floor(targetPDef));
  const base = Math.max(1, atk - def);
  return worldBossDamageAfterVariance(base);
}

/** Крит РБ: той самий atk−def, потім ×critDmgMul і ±2%. */
export function l2dopWorldBossPhysicalCritDamage(
  mobPAtk: number,
  targetPDef: number,
  critDmgMul: number
): number {
  const atk = Math.max(1, Math.floor(mobPAtk));
  const def = Math.max(0, Math.floor(targetPDef));
  const base = Math.max(1, atk - def);
  const raw = base * Math.max(1, critDmgMul);
  return worldBossDamageAfterVariance(raw);
}

/**
 * Крит з `function.php`: ((2×70×P.Atk)/P.Def)×critdmg + AddCritDmg; на суму накладається
 * той самий ±розкид, що й на звичайний удар.
 */
export function l2dopPhysicalCritDamage(
  attackerAtk: number,
  targetPDef: number,
  critDmgMul: number,
  addCritDmg: number
): number {
  const def = Math.max(1, Math.floor(targetPDef));
  const atk = Math.max(1, Math.floor(attackerAtk));
  const core = (2 * 70 * atk) / def;
  const raw =
    core * Math.max(1, critDmgMul) + Math.max(0, addCritDmg);
  return physicalDamageAfterVariance(raw);
}

/**
 * Магічний удар: `sqrt(mAtk * bonusSPS) * powersk * 91 / eMdef`, розкид 0.95–1.05 (`COREAN_RANDOM`).
 * Маг. крит: той самий вираз ×4 перед розкидом (`123.php`).
 * `bonusSPS` у l2dop — Spiritshot тощо; поки немає предметів — 1.
 */
export function l2dopMagicSkillDamage(params: {
  mAtk: number;
  mDef: number;
  powersk: number;
  bonusSps?: number;
  magicCrit: boolean;
  /** Множник до ×4 при маг. криті (INT-пайплайн). */
  magicCritDmgMul?: number;
}): number {
  const mDef = Math.max(1, Math.floor(params.mDef));
  const mAtk = Math.max(1, Math.floor(params.mAtk));
  const bps = Math.max(1, params.bonusSps ?? 1);
  const pw = Math.max(1, Math.floor(params.powersk));
  let core = (Math.sqrt(mAtk * bps) * pw * 91) / mDef;
  if (params.magicCrit) {
    const m = params.magicCritDmgMul;
    const mul =
      m != null && Number.isFinite(m) && m > 0
        ? clampMagicCritDmgMulForDamage(m)
        : 1;
    core *= 4 * mul;
  }
  const low = 0.95 * core;
  const high = 1.05 * core;
  return Math.max(1, Math.floor(l2dopUniformRandom(low, high)));
}
