/**
 * Проміжні crafted-ресурси (етап 2 крафту) — 20 stackable матеріалів.
 */

export interface CraftedResourceEntry {
  itemId: number;
  code: string;
  nameUk: string;
  nameEn: string;
  iconUrl: string;
  stackable: true;
  inventoryTab: 'resource';
}

const ICON_BASE = '/icons/resources/crafted';

export const CRAFTED_RESOURCE_CATALOG: readonly CraftedResourceEntry[] = [
  {
    itemId: 1878,
    code: 'braided_hemp',
    nameUk: 'Плетений льон',
    nameEn: 'Braided Hemp',
    iconUrl: `${ICON_BASE}/braided_hemp.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1879,
    code: 'cokes',
    nameUk: 'Кокс',
    nameEn: 'Cokes',
    iconUrl: `${ICON_BASE}/cokes.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1880,
    code: 'steel',
    nameUk: 'Сталь',
    nameEn: 'Steel',
    iconUrl: `${ICON_BASE}/steel.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1881,
    code: 'coarse_bone_powder',
    nameUk: 'Грубий кістковий порошок',
    nameEn: 'Coarse Bone Powder',
    iconUrl: `${ICON_BASE}/coarse_bone_powder.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1882,
    code: 'leather',
    nameUk: 'Шкіра',
    nameEn: 'Leather',
    iconUrl: `${ICON_BASE}/leather.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1883,
    code: 'steel_mold',
    nameUk: 'Сталева заготовка',
    nameEn: 'Steel Mold',
    iconUrl: `${ICON_BASE}/steel_mold.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1884,
    code: 'cord',
    nameUk: 'Мотузка',
    nameEn: 'Cord',
    iconUrl: `${ICON_BASE}/cord.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1885,
    code: 'high_grade_suede',
    nameUk: 'Високоякісна замша',
    nameEn: 'High Grade Suede',
    iconUrl: `${ICON_BASE}/high_grade_Suede.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1886,
    code: 'silver_mold',
    nameUk: 'Срібна заготовка',
    nameEn: 'Silver Mold',
    iconUrl: `${ICON_BASE}/silver_mold.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1887,
    code: 'varnish_of_purity',
    nameUk: 'Очищений лак',
    nameEn: 'Varnish of Purity',
    iconUrl: `${ICON_BASE}/varnish_of_purity.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1888,
    code: 'synthetic_cokes',
    nameUk: 'Синтетичний кокс',
    nameEn: 'Synthetic Cokes',
    iconUrl: `${ICON_BASE}/synthetic_cokes.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1889,
    code: 'compound_braid',
    nameUk: 'Міцний шнур',
    nameEn: 'Compound Braid',
    iconUrl: `${ICON_BASE}/compound_braid.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1890,
    code: 'mithril_alloy',
    nameUk: 'Міфриловий сплав',
    nameEn: 'Mithril Alloy',
    iconUrl: `${ICON_BASE}/mithril_alloy.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1891,
    code: 'artisan_frame',
    nameUk: 'Заготовка ремісника',
    nameEn: "Artisan's Frame",
    iconUrl: `${ICON_BASE}/artisans_frame.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1892,
    code: 'blacksmith_frame',
    nameUk: 'Заготовка коваля',
    nameEn: "Blacksmith's Frame",
    iconUrl: `${ICON_BASE}/blacksmiths_frame.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1893,
    code: 'oriharukon',
    nameUk: 'Оріхарукон',
    nameEn: 'Oriharukon',
    iconUrl: `${ICON_BASE}/oriharukon.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1894,
    code: 'crafted_leather',
    nameUk: 'Вичинена шкіра',
    nameEn: 'Crafted Leather',
    iconUrl: `${ICON_BASE}/crafted_leather.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 1895,
    code: 'metallic_fiber',
    nameUk: 'Металеве волокно',
    nameEn: 'Metallic Fiber',
    iconUrl: `${ICON_BASE}/metallic_fiber.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 5549,
    code: 'metallic_thread',
    nameUk: 'Металева нитка',
    nameEn: 'Metallic Thread',
    iconUrl: `${ICON_BASE}/metallic_thread.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
  {
    itemId: 5550,
    code: 'durable_metal_plate',
    nameUk: 'Міцна металева пластина',
    nameEn: 'Durable Metal Plate',
    iconUrl: `${ICON_BASE}/durable_metal_Plate.jpg`,
    stackable: true,
    inventoryTab: 'resource',
  },
] as const;

export const CRAFTED_RESOURCE_BY_ITEM_ID = new Map<number, CraftedResourceEntry>(
  CRAFTED_RESOURCE_CATALOG.map((row) => [row.itemId, row]),
);

export const CRAFTED_RESOURCE_BY_CODE = new Map<string, CraftedResourceEntry>(
  CRAFTED_RESOURCE_CATALOG.map((row) => [row.code, row]),
);

export const CRAFTED_RESOURCE_ITEM_IDS: readonly number[] =
  CRAFTED_RESOURCE_CATALOG.map((row) => row.itemId);

export function isCraftedResourceItemId(itemId: number): boolean {
  return CRAFTED_RESOURCE_BY_ITEM_ID.has(Math.floor(Number(itemId) || 0));
}
