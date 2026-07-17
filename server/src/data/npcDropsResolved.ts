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

function customDropBagForNpc(npcId: number): NpcDropBag | undefined {
  return (
    customNpcDropBagForMob(npcId) ??
    customSevenSignsDungeonDropBagForMob(npcId)
  );
}

export function hasCustomNpcDropBag(npcId: number | null | undefined): boolean {
  if (npcId == null) return false;
  return hasRaidBossDropBag(npcId) || hasSevenSignsDungeonDropBag(npcId);
}

export function resolveNpcDropBag(
  npcId: number | null,
  _spawnLevel: number,
  fallback: () => NpcDropBag
): NpcDropBag {
  if (npcId != null) {
    const custom = customDropBagForNpc(npcId);
    if (custom) return custom;
  }
  return fallback();
}
