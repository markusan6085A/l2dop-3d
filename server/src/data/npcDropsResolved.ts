import type { DropEntry } from '../types/combatDrop.js';
import {
  customNpcDropBagForMob,
  hasCustomNpcDropBag as hasRaidBossDropBag,
} from './l2dopRaidBossDropPatches.js';
import {
  customSevenSignsDungeonDropBagForMob,
  hasSevenSignsDungeonDropBag,
} from './l2dopSevenSignsDungeonMobRewards.js';

/** Сумка дропу NPC (кастомні РБ / подземелля або синтетичний fallback). */
export interface NpcDropBag {
  drops: DropEntry[];
  spoil: DropEntry[];
  fallbackFromNpcId?: number;
}


export function hasCustomNpcDropBag(
  npcId: number | null | undefined,
  spawnId?: string | null
): boolean {
  if (npcId == null) return false;
  return (
    hasRaidBossDropBag(npcId) || hasSevenSignsDungeonDropBag(npcId, spawnId)
  );
}

export function resolveNpcDropBag(
  npcId: number | null,
  _spawnLevel: number,
  fallback: () => NpcDropBag,
  spawnId?: string | null
): NpcDropBag {
  if (npcId != null) {
    const custom =
      customNpcDropBagForMob(npcId) ??
      customSevenSignsDungeonDropBagForMob(npcId, spawnId);
    if (custom) return custom;
  }
  return fallback();
}
