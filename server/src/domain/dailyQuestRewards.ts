import { addItemToBag, type InventoryState } from '../data/inventory.js';
import type { DailyQuestId } from './dailyQuests.js';

/** Coin of Luck (L2 item). */
export const COIN_OF_LUCK_ITEM_ID = 4037;
/** Велике MP-зілля (728). */
export const DAILY_QUEST_MP_POTION_ITEM_ID = 728;

export type DailyQuestRewardGrant = {
  adena?: bigint;
  exp?: bigint;
  sp?: number;
  items?: { itemId: number; qty: number }[];
};

export const DAILY_QUEST_REWARDS: Record<DailyQuestId, DailyQuestRewardGrant> = {
  hunt_start_500: { adena: 100_000n, exp: 60_000n },
  strong_enemy_20: { exp: 30_000n, sp: 50_000 },
  raid_boss_participate: { adena: 50_000n },
  skill_master_50: {
    sp: 20_000,
    items: [{ itemId: DAILY_QUEST_MP_POTION_ITEM_ID, qty: 50 }],
  },
  daily_playtime_2h: {
    items: [{ itemId: COIN_OF_LUCK_ITEM_ID, qty: 1 }],
  },
  chat_social_10: { adena: 15_000n },
  damage_dealer_500k: {
    items: [{ itemId: COIN_OF_LUCK_ITEM_ID, qty: 1 }],
  },
};

export function applyDailyQuestRewardToInventory(
  inv: InventoryState,
  grant: DailyQuestRewardGrant
): InventoryState {
  let next = inv;
  for (const row of grant.items ?? []) {
    if (row.qty <= 0) continue;
    next = addItemToBag(next, row.itemId, row.qty);
  }
  return next;
}
