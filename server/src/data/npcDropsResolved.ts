import type { DropEntry } from '../types/combatDrop.js';
import {
  customNpcDropBagForMob,
  hasCustomNpcDropBag,
} from './l2dopRaidBossDropPatches.js';

/** Сумка дропу NPC (кастомні РБ або синтетичний fallback). */
export interface NpcDropBag {
  drops: DropEntry[];
  spoil: DropEntry[];
  fallbackFromNpcId?: number;
}

export { hasCustomNpcDropBag };

export function resolveNpcDropBag(
  npcId: number | null,
  _spawnLevel: number,
  fallback: () => NpcDropBag
): NpcDropBag {
  if (npcId != null) {
    const custom = customNpcDropBagForMob(npcId);
    if (custom) return custom;
  }
  return fallback();
}
