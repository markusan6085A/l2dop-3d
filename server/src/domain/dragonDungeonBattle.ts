import type { DragonBossCombatConfig } from './dragonDungeon.js';

/** Урон звичайної атаки дракона (% max HP гравця з min/max і частковим захистом). */
export function rollDragonNormalAttackDamage(
  combat: DragonBossCombatConfig,
  playerMaxHp: number,
  playerPDef: number,
  playerMDef: number
): number {
  const base = Math.max(1, Math.floor(playerMaxHp * combat.normalAttackPctMaxHp));
  const defFactor = 1 - Math.min(0.65, (playerPDef + playerMDef) / 4000);
  const raw = Math.floor(base * Math.max(0.35, defFactor));
  return Math.max(combat.normalAttackMin, Math.min(combat.normalAttackMax, raw));
}

export function rollDragonSpecialOutcome(
  combat: DragonBossCombatConfig,
  rng = Math.random()
): 'stun' | 'cancel' | 'none' {
  if (rng < combat.stunChance) return 'stun';
  if (rng < combat.stunChance + combat.cancelChance) return 'cancel';
  return 'none';
}

/** Скіли, які Cancel не знімає (пасивки, clan hall, premium). */
const CANCEL_IMMUNE_SKILL_PREFIXES = ['clan_hall_', 'premium_', 'vip_'];
const CANCEL_IMMUNE_SKILL_IDS = new Set([
  'warrior_mastery',
  'weapon_mastery',
  'armor_mastery',
  'heavy_armor_mastery',
  'light_armor_mastery',
  'magic_resistance',
]);

export function pickCancelableBuffSkillId(
  activeSkillIds: string[],
  rng = Math.random()
): string | null {
  const candidates = activeSkillIds.filter((id) => {
    if (CANCEL_IMMUNE_SKILL_IDS.has(id)) return false;
    if (CANCEL_IMMUNE_SKILL_PREFIXES.some((p) => id.startsWith(p))) return false;
    return true;
  });
  if (!candidates.length) return null;
  const idx = Math.floor(rng * candidates.length);
  return candidates[idx] ?? null;
}
