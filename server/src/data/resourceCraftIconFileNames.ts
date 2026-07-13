import { RESOURCE_CRAFT_ITEM_NAMES_UK } from './resourceCraftItemNamesUk.js';

const CRAFT_RESOURCE_ICON_DIR = '/icons/drops/resours/l2dop-by-itemid';

/**
 * Проміжні крафт-ресурси без `{id}.jpg` — іменні файли в `l2dop-by-itemid/`.
 * Базові матеріали: `{id}.jpg` у тій самій теці.
 */
const CRAFT_RESOURCE_NAMED_ICON_FILE: Record<number, string> = {
  1883: 'Varnish_of_Purity.jpg',
  1886: 'Synthetic_Cokes.jpg',
  1887: 'Silver_Mold.jpg',
  1888: 'Steel_Mold.jpg',
  1890: 'Mithril_Alloy.jpg',
  1891: 'Blacksmith_Frame.jpg',
  1892: 'Artisans_Frame.jpg',
  1893: 'Oriharukon.jpg',
  1896: 'Maestro_Mold.jpg',
  1897: 'Craftsman_Mold.jpg',
  1898: 'Maestro_Holder.jpg',
  1899: 'Maestro_Anvil_Lock.jpg',
  5220: 'Metal_Hardener.jpg',
  5549: 'Metallic_Thread.jpg',
  5550: 'Durable_Metal_Plate.jpg',
};

/** Ім'я файлу іконки крафт-ресурсу або null, якщо не з каталогу ресурсів. */
export function craftResourceIconFileName(itemId: number): string | null {
  if (!Number.isFinite(itemId) || itemId < 1) return null;
  const named = CRAFT_RESOURCE_NAMED_ICON_FILE[itemId];
  if (named) return named;
  if (RESOURCE_CRAFT_ITEM_NAMES_UK[itemId]) return `${itemId}.jpg`;
  return null;
}

/** Публічний URL для `<img src>` / snapshot hints. */
export function craftResourceIconRelUrl(itemId: number): string | null {
  const file = craftResourceIconFileName(itemId);
  if (!file) return null;
  return `${CRAFT_RESOURCE_ICON_DIR}/${file}`;
}
