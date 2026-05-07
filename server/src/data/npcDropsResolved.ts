import type { DropEntry } from '../types/combatDrop.js';

/** Сумка дропу NPC (зараз лишається порожньою — моб-лут вимкнено). */
export interface NpcDropBag {
  drops: DropEntry[];
  spoil: DropEntry[];
  fallbackFromNpcId?: number;
}
