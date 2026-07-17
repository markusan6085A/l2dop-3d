import type { ItemMeta } from './itemsCatalog.js';

/** L2 Interlude — Ancient Adena (aa). */
export const ANCIENT_ADENA_ITEM_ID = 5575;

export const ANCIENT_ADENA_ICON_URL =
  '/icons/drops/resours/etc_ancient_adena_i00.png';

export function ancientAdenaItemMetaForCatalog(): Record<number, ItemMeta> {
  return {
    [ANCIENT_ADENA_ITEM_ID]: {
      nameUk: 'Ancient Adena [Стародавня адена]',
      slot: 'consumable',
    },
  };
}

export function ancientAdenaIconHintsForClient(): Record<number, string> {
  return { [ANCIENT_ADENA_ITEM_ID]: ANCIENT_ADENA_ICON_URL };
}

export function ancientAdenaNamesEnForClient(): Record<number, string> {
  return { [ANCIENT_ADENA_ITEM_ID]: 'Ancient Adena' };
}

export function ancientAdenaNamesUkForClient(): Record<number, string> {
  return {
    [ANCIENT_ADENA_ITEM_ID]: 'Ancient Adena [Стародавня адена]',
  };
}
