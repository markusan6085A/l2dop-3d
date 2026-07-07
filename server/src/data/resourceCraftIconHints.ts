import { RESOURCE_CRAFT_ITEM_NAMES_UK } from './resourceCraftItemNamesUk.js';

/**
 * Іконки крафт-матеріалів у сумці/крафті: статика `/icons/drops/resours/l2dop-by-itemid/`,
 * коли canonical `img/items/{id}.jpg` виглядає інакше (авторські текстури).
 */
export function craftResourceIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const idStr of Object.keys(RESOURCE_CRAFT_ITEM_NAMES_UK)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) continue;
    out[id] = `/icons/drops/resours/l2dop-by-itemid/${id}.jpg`;
  }
  return out;
}
