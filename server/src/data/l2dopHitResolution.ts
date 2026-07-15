/**
 * Розв’язання удару: точність vs ухилення, крит (як finalcritical2), урон як у l2dop (`function.php`).
 */
import {
  l2dopMagicSkillDamage,
  l2dopPhysicalBaseDamage,
  l2dopPhysicalCritDamage,
  l2dopWorldBossPhysicalCritDamage,
  l2dopWorldBossPhysicalDamage,
} from './l2dopDamageFormulas.js';
import { clampMagicCritDmgMulForDamage } from './l2dopPrimaryStatPipeline.js';

/** Ймовірність попадання 0–1. Balance pass 2b: та сама лінія, верхній cap 82% (miss ~18% у сильних матчапах). */
export function physicalHitChance(
  attackerAccuracy: number,
  defenderEvasion: number
): number {
  const acc = Number.isFinite(attackerAccuracy) ? attackerAccuracy : 0;
  const eva = Number.isFinite(defenderEvasion) ? defenderEvasion : 0;
  const hitPct = 78 + (acc - eva) * 1.5;
  const clamped = Math.max(55, Math.min(82, hitPct));
  return clamped / 100;
}

/**
 * Крит-шанс зі стату finalcritical2 (кеп 500 у calc_stats.php).
 * Мапимо stat/1000 у ймовірність з мінімумом, щоб крит не зникав повністю.
 */
export function physicalCritChance(critRateStat: number): number {
  const capped = Math.max(0, Math.min(500, Math.floor(critRateStat)));
  return Math.min(0.72, Math.max(0.05, capped / 1000));
}

export type PhysicalDamageMode = 'standard' | 'worldBoss';

export interface ResolvePhysicalHitParams {
  attackerAtk: number;
  targetPDef: number;
  attackerAccuracy: number;
  targetEvasion: number;
  critRateStat: number;
  critDmgMul: number;
  addCritDmg: number;
  /** Для ударів моба без крита — false. За замовчуванням true. */
  allowCrit?: boolean;
  /** Для CC-скілів: якщо false, стадія промаху вимикається (урон гарантовано проходить). */
  allowMiss?: boolean;
  /** РБ/епік: atk−def ±2% замість (70×atk)/def. */
  damageMode?: PhysicalDamageMode;
}

export type PhysicalHitOutcome = 'miss' | 'hit' | 'crit';

export interface ResolvePhysicalHitResult {
  outcome: PhysicalHitOutcome;
  damage: number;
}

export function resolvePhysicalHit(
  p: ResolvePhysicalHitParams
): ResolvePhysicalHitResult {
  if (
    p.allowMiss !== false &&
    Math.random() >= physicalHitChance(p.attackerAccuracy, p.targetEvasion)
  ) {
    return { outcome: 'miss', damage: 0 };
  }
  const worldBoss = p.damageMode === 'worldBoss';
  const base = worldBoss
    ? l2dopWorldBossPhysicalDamage(p.attackerAtk, p.targetPDef)
    : l2dopPhysicalBaseDamage(p.attackerAtk, p.targetPDef);
  const allowCrit = p.allowCrit !== false;
  if (
    allowCrit &&
    Math.random() < physicalCritChance(p.critRateStat)
  ) {
    const dmg = worldBoss
      ? l2dopWorldBossPhysicalCritDamage(
          p.attackerAtk,
          p.targetPDef,
          p.critDmgMul
        )
      : l2dopPhysicalCritDamage(
          p.attackerAtk,
          p.targetPDef,
          p.critDmgMul,
          p.addCritDmg
        );
    return { outcome: 'crit', damage: dmg };
  }
  return { outcome: 'hit', damage: base };
}

/** Ухилення моба: той самий шаблон, що sqrt(DEX)*6+LVL (DEX з оцінки за рівнем). */
export function mobEvasionFromSpawnLevel(level: number): number {
  const LVL = Math.max(1, Math.floor(level));
  const dex = 28 + Math.floor(LVL * 0.35);
  return Math.floor(Math.sqrt(dex) * 6 + LVL);
}

/** Точність моба для розв’язання попадання по гравцю (той самий каркас, що й eva). */
export function mobAccuracyFromSpawnLevel(level: number): number {
  return mobEvasionFromSpawnLevel(level);
}

export type MagicBoltOutcome = 'miss' | 'hit' | 'crit';

export interface ResolveMagicBoltResult {
  outcome: MagicBoltOutcome;
  damage: number;
}

/**
 * Магічний «болт»: після перевірки попадання — формула l2dop (`skills.php` / `123.php`).
 * Якщо не передано `skillPower` / `powersk`, лишається спрощений режим через `matkFlatAdd` (як раніше).
 */
export function resolveMagicBoltHit(p: {
  mAtk: number;
  mobMDef: number;
  playerInt: number;
  playerWit: number;
  playerMen: number;
  playerLevel: number;
  mobEvasion: number;
  /** Плоский додаток до M.Atk (лише якщо немає `skillPower`). */
  matkFlatAdd?: number;
  /** Сила скіла з датапаку / каталогу (`powersk` у PHP). */
  skillPower?: number;
  /** Як `bonusSPS` (Spiritshot); без предметів — 1. */
  bonusSps?: number;
  /** Шанс маг. крита, % (з `mCritPct` у snapshot). */
  mCritPct?: number;
  /** Множник ×4 маг. крита від INT (фаза 1), типово 1. */
  magicCritDmgMul?: number;
  /** Для скіл-кастів: гарантоване влучання без roll miss. */
  allowMiss?: boolean;
  /** Для скіл-кастів: вимкнути маг-крит, щоб урон ішов з однієї формули. */
  allowMagicCrit?: boolean;
}): ResolveMagicBoltResult {
  const L = Math.max(1, Math.floor(p.playerLevel));
  const mAtkBase = Math.max(1, Math.floor(p.mAtk));
  const magicAcc = Math.floor(
    p.playerInt * 1.4 +
      p.playerWit * 2 +
      p.playerMen * 0.65 +
      L * 2.5 +
      Math.sqrt(mAtkBase) * 1.5
  );
  if (
    p.allowMiss !== false &&
    Math.random() >= physicalHitChance(magicAcc, p.mobEvasion)
  ) {
    return { outcome: 'miss', damage: 0 };
  }

  const powersk =
    p.skillPower != null && Number.isFinite(p.skillPower)
      ? Math.max(1, Math.floor(p.skillPower))
      : undefined;
  if (powersk != null) {
    const mcMulRaw = p.magicCritDmgMul;
    const mcMul =
      mcMulRaw != null && Number.isFinite(mcMulRaw) && mcMulRaw > 0
        ? clampMagicCritDmgMulForDamage(mcMulRaw)
        : 1;
    const mc =
      p.allowMagicCrit !== false &&
      typeof p.mCritPct === 'number' &&
      Number.isFinite(p.mCritPct) &&
      p.mCritPct > 0
        ? Math.random() < Math.min(1, Math.max(0, p.mCritPct / 100))
        : false;
    const dmg = l2dopMagicSkillDamage({
      mAtk: mAtkBase,
      mDef: p.mobMDef,
      powersk,
      bonusSps: p.bonusSps,
      magicCrit: mc,
      magicCritDmgMul: mc ? mcMul : 1,
    });
    return { outcome: mc ? 'crit' : 'hit', damage: dmg };
  }

  const mAtkEff = Math.max(1, Math.floor(mAtkBase + (p.matkFlatAdd ?? 0)));
  return {
    outcome: 'hit',
    damage: l2dopPhysicalBaseDamage(mAtkEff, p.mobMDef),
  };
}
