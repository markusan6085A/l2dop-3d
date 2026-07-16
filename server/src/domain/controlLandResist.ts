/**
 * Мітігація ймовірності накладення контролю/дебафу з боку цілі.
 *
 * PvE: у мобів немає CON/MEN у спавні — моделюємо мʼякий резист від рівня цілі.
 * Фаза 4: на `MapWorldSpawn` можна задати `stunResistPct` / `debuffResistPct`;
 * інакше використовуються synthetic-криві за рівнем.
 * Коли зʼявиться удар по гравцю — той самий масштаб застосувати до `combat.stunResistPct` /
 * `combat.debuffResistPct` (і за потреби `/ holdResistMul`).
 */

/** Зріз спавну для резисту контролю (явні % або fallback synthetic за `level`). */
export type MobSpawnControlResistInput = {
  level: number;
  stunResistPct?: number;
  debuffResistPct?: number;
};

export function effectiveMobStunResistPct(spawn: MobSpawnControlResistInput): number {
  const v = spawn.stunResistPct;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return syntheticMobStunResistPct(spawn.level);
}

export function effectiveMobDebuffResistPct(spawn: MobSpawnControlResistInput): number {
  const v = spawn.debuffResistPct;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return syntheticMobDebuffResistPct(spawn.level);
}

/** Кап синтетичного резисту моба до оглушення (щоб високі ранги скіла ще мали шанс). */
const MOB_STUN_RESIST_CAP = 50;
/** Кап резисту моба до маг. дебафів (окремо від INT/matk у формулі land). */
const MOB_DEBUFF_RESIST_CAP = 55;
/** Кап синтетичного резисту моба до дебафів, що залежать від WIT (Shield Slam 353). */
const MOB_WIT_RESIST_CAP = 55;

export function syntheticMobStunResistPct(spawnLevel: number): number {
  const L = Math.max(1, Math.floor(spawnLevel));
  return Math.min(MOB_STUN_RESIST_CAP, Math.floor(L * 0.45));
}

export function syntheticMobDebuffResistPct(spawnLevel: number): number {
  const L = Math.max(1, Math.floor(spawnLevel));
  return Math.min(MOB_DEBUFF_RESIST_CAP, Math.floor(L * 0.5));
}

export function syntheticMobWitResistPct(spawnLevel: number): number {
  const L = Math.max(1, Math.floor(spawnLevel));
  return Math.min(MOB_WIT_RESIST_CAP, Math.floor(L * 0.48));
}

/** PvE: WIT-резист цілі для Shield Slam (явний debuffResist або synthetic за рівнем). */
export function effectiveMobWitResistPct(spawn: MobSpawnControlResistInput): number {
  const v = spawn.debuffResistPct;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return syntheticMobWitResistPct(spawn.level);
}

/** PvP: резист від стату WIT цілі (база ~20 WIT → 0%). */
export function witResistPctFromStat(wit: number): number {
  const W = Math.max(1, Math.floor(wit));
  return Math.min(MOB_WIT_RESIST_CAP, Math.max(0, Math.floor((W - 20) * 0.8)));
}

/** Кап синтетичного резисту моба до дебафів за CON (Touch of Death 342). */
const MOB_CON_RESIST_CAP = 55;

/** PvP: резист від CON цілі (Touch of Death). */
export function conResistPctFromStat(con: number): number {
  const C = Math.max(1, Math.floor(con));
  return Math.min(MOB_CON_RESIST_CAP, Math.max(0, Math.floor((C - 20) * 0.8)));
}

export function syntheticMobConResistPct(spawnLevel: number): number {
  const L = Math.max(1, Math.floor(spawnLevel));
  const estCon = 20 + Math.floor(L * 0.5);
  return conResistPctFromStat(estCon);
}

/** PvE: CON-резист цілі для Touch of Death (342). */
export function effectiveMobConResistPct(spawn: MobSpawnControlResistInput): number {
  const v = spawn.debuffResistPct;
  if (typeof v === 'number' && Number.isFinite(v)) {
    return Math.min(MOB_CON_RESIST_CAP, v);
  }
  return syntheticMobConResistPct(spawn.level);
}

/**
 * `land%` після відсоткового резисту цілі: base × (1 − resist/100).
 * `resistPct` клампиться до [0, 95].
 */
export function scaleLandChancePercentAfterResist(
  chancePct: number,
  resistPct: number
): number {
  const r = Math.max(0, Math.min(95, resistPct));
  return Math.max(0, chancePct * (1 - r / 100));
}

/** Touch of Death (342): −% до debuff/wit/con резисту цілі, поки дебаф активний. */
export function applyTouchOfDeathResistPenalty(
  baseResistPct: number,
  battleMods?: { mobTouchOfDeathUntilMs?: number; mobTouchOfDeathDebuffResistPenaltyPct?: number } | null,
  nowMs: number = Date.now()
): number {
  if (!battleMods) return baseResistPct;
  const until = battleMods.mobTouchOfDeathUntilMs;
  const penalty = battleMods.mobTouchOfDeathDebuffResistPenaltyPct;
  if (
    typeof until === 'number' &&
    Number.isFinite(until) &&
    until > nowMs &&
    typeof penalty === 'number' &&
    Number.isFinite(penalty) &&
    penalty > 0
  ) {
    return Math.max(0, baseResistPct - penalty);
  }
  return baseResistPct;
}
