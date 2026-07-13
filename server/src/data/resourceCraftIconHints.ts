import { RESOURCE_CRAFT_ITEM_NAMES_UK } from './resourceCraftItemNamesUk.js';
import { craftResourceIconRelUrl } from './resourceCraftIconFileNames.js';

/**
 * Іконки крафт-матеріалів у сумці/крафті/дропі: статика `icons/drops/resours/`
 * (`{id}.jpg` або іменний файл на кшталт `Varnish_of_Purity.jpg` у `l2dop-by-itemid/`).
 */
export function craftResourceIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const idStr of Object.keys(RESOURCE_CRAFT_ITEM_NAMES_UK)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) continue;
    const url = craftResourceIconRelUrl(id);
    if (url) out[id] = url;
  }
  return out;
}
