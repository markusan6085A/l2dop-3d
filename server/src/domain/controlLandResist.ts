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

export function syntheticMobStunResistPct(spawnLevel: number): number {
  const L = Math.max(1, Math.floor(spawnLevel));
  return Math.min(MOB_STUN_RESIST_CAP, Math.floor(L * 0.45));
}

export function syntheticMobDebuffResistPct(spawnLevel: number): number {
  const L = Math.max(1, Math.floor(spawnLevel));
  return Math.min(MOB_DEBUFF_RESIST_CAP, Math.floor(L * 0.5));
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
