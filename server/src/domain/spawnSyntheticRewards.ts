import type { NpcDropBag } from '../data/npcDropsResolved.js';
import { L2DOP_NPC_EXP_SP } from '../data/l2dopNpcExpSp.generated.js';
import type { DropEntry } from '../types/combatDrop.js';
import { mobAdenaDropRange } from './mobAdenaDropScale.js';

/** Множник SP за вбивство моба: база з npc/формули ×2 (EXP — без множника, таблиця рівнів ÷3). */
export const MOB_KILL_SP_MULTIPLIER = 2;

function scaleMobKillSp(sp: number): number {
  if (!Number.isFinite(sp) || sp <= 0) return 0;
  return Math.max(1, Math.floor(sp * MOB_KILL_SP_MULTIPLIER));
}

/** Базова адена за рівнем моба (шкала mobAdenaDropScale). */
export function syntheticAdenaDropEntry(level: number): DropEntry {
  const { min, max } = mobAdenaDropRange(level);
  return {
    id: 'synthetic_adena',
    kind: 'adena',
    chance: 1,
    min,
    max,
    chancePerMillion: 1_000_000,
    l2ItemId: 57,
    displayName: 'Adena',
  };
}

/** Як у rollKillLoot, коли немає рядка npc у дампі. */
export function defaultExpSpFromLevel(level: number): { exp: number; sp: number } {
  return {
    exp: Math.max(1, level * 50),
    sp: Math.max(1, Math.floor(level * 15)),
  };
}

/**
 * EXP/SP з npc у дампі; якщо 0/0 або немає npc — формула за рівнем спавну.
 */
export function rewardExpSpForSpawn(
  npcId: number | null,
  spawnLevel: number
): { exp: number; sp: number; synthetic: boolean } {
  if (npcId != null) {
    const rw = L2DOP_NPC_EXP_SP[npcId];
    if (rw !== undefined && (rw.exp > 0 || rw.sp > 0)) {
      return { exp: rw.exp, sp: scaleMobKillSp(rw.sp), synthetic: false };
    }
  }
  const d = defaultExpSpFromLevel(spawnLevel);
  return { exp: d.exp, sp: scaleMobKillSp(d.sp), synthetic: true };
}

/**
 * Предметів/спойлу з таблиць немає — базова адена за рівнем спавну (як раніше fallback).
 */
export function ensureMobDropBag(
  _npcId: number | null,
  spawnLevel: number
): NpcDropBag {
  return {
    drops: [syntheticAdenaDropEntry(spawnLevel)],
    spoil: [],
  };
}
