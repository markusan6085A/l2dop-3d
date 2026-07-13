import type { GmShopGrade } from './l2dopGmShopCatalog.generated.js';

/** Interlude: стріли за грейдом лука (як у крамниці дропів / Wooden … Shining Arrow). */
export const BOW_ARROW_ITEM_ID_BY_GRADE: Readonly<Record<GmShopGrade, number>> = {
  NG: 17,
  D: 1341,
  C: 1342,
  B: 1343,
  A: 1344,
  S: 1345,
};

export const BOW_ARROW_ITEM_IDS = new Set<number>(
  Object.values(BOW_ARROW_ITEM_ID_BY_GRADE),
);

export function bowArrowItemIdForGrade(grade: GmShopGrade): number {
  return BOW_ARROW_ITEM_ID_BY_GRADE[grade];
}
