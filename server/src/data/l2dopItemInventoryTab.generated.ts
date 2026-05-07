/**
 * Підказки вкладки інвентаря за item id (resource / quest / …).
 * Можна наповнити окремим скриптом із items3, якщо знадобиться.
 */
export type L2ItemInventoryTabHint =
  | 'enchantment'
  | 'consumable'
  | 'resource'
  | 'recipe'
  | 'quest'
  | 'book';

export const L2DOP_ITEM_INVENTORY_TAB: Partial<
  Record<number, L2ItemInventoryTabHint>
> = {};
