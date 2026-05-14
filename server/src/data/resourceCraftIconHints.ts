/**
 * Іконки крафт-матеріалів у сумці/крафті: статика `/icons/drops/resours/l2dop-by-itemid/`,
 * коли canonical `img/items/{id}.jpg` виглядає інакше (авторські текстури).
 */
export function craftResourceIconHintsForClient(): Record<number, string> {
  return {
    1894: '/icons/drops/resours/l2dop-by-itemid/1894.jpg',
  };
}
