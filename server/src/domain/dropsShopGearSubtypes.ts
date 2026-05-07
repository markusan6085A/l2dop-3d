import type { ItemSlotKind } from '../data/itemsCatalog.js';

/** Підрозділи броні у вкладці «Броня» магазину (за слотом preview-предмета). */
export type DropsShopArmorPiece =
  | 'head'
  | 'torso'
  | 'legs'
  | 'gloves'
  | 'feet';

export function resolveDropsShopArmorPiece(
  slot: ItemSlotKind | undefined,
): DropsShopArmorPiece | undefined {
  if (!slot) return undefined;
  if (slot === 'head') return 'head';
  if (slot === 'chest' || slot === 'fullarmor') return 'torso';
  if (slot === 'legs') return 'legs';
  if (slot === 'gloves') return 'gloves';
  if (slot === 'feet') return 'feet';
  return undefined;
}

/** Підрозділи у вкладці «Аксесуари» (ключ API категорії лишається `earring`). */
export type DropsShopJewelrySubtype = 'neck' | 'earring' | 'ring';

export function resolveDropsShopJewelrySubtype(
  slot: ItemSlotKind | undefined,
): DropsShopJewelrySubtype | undefined {
  if (!slot) return undefined;
  if (slot === 'neck') return 'neck';
  if (slot === 'earring') return 'earring';
  if (slot === 'ring') return 'ring';
  return undefined;
}

/** Підрозділ за «листком» shopKey каталогу (ім’я файлу іконки). Важливо для UI, коли preview itemId≠файл або слот помилковий. */
export function resolveDropsShopJewelrySubtypeFromShopKey(
  shopKey: string,
): DropsShopJewelrySubtype | undefined {
  const leaf =
    shopKey
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      ?.toLowerCase() ?? '';
  if (!leaf) return undefined;
  if (leaf.includes('neck')) return 'neck';
  if (leaf.includes('earring') || leaf.includes('earing')) return 'earring';
  if (leaf.includes('ring')) return 'ring';
  return undefined;
}
