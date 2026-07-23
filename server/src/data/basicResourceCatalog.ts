/**
 * Базові ресурси для майбутнього крафту (етап 1).
 * Єдине джерело правди для 17 stackable матеріалів.
 */

export interface BasicResourceEntry {
  itemId: number;
  code: string;
  nameUk: string;
  nameEn: string;
  iconUrl: string;
  stackable: true;
  sourceType: 'drop_spoil' | 'drop';
  tier: 1 | 2 | 3 | 4 | 5 | 6;
}

const ICON_BASE = '/icons/resources/basic';

/** Interlude itemId (1864–1877) + custom piece range 920001–920003. */
export const BASIC_RESOURCE_WEAPON_PIECE_ITEM_ID = 920001;
export const BASIC_RESOURCE_ARMOR_PIECE_ITEM_ID = 920002;
export const BASIC_RESOURCE_ACCESSORY_GEMSTONE_ITEM_ID = 920003;

export const BASIC_RESOURCE_CATALOG: readonly BasicResourceEntry[] = [
  {
    itemId: 1864,
    code: 'stem',
    nameUk: 'Стебло',
    nameEn: 'Stem',
    iconUrl: `${ICON_BASE}/stem.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1865,
    code: 'varnish',
    nameUk: 'Лак',
    nameEn: 'Varnish',
    iconUrl: `${ICON_BASE}/varnish.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1866,
    code: 'suede',
    nameUk: 'Замша',
    nameEn: 'Suede',
    iconUrl: `${ICON_BASE}/suede.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 2,
  },
  {
    itemId: 1867,
    code: 'animal_skin',
    nameUk: 'Шкура тварини',
    nameEn: 'Animal Skin',
    iconUrl: `${ICON_BASE}/animal_skin.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1868,
    code: 'thread',
    nameUk: 'Нитка',
    nameEn: 'Thread',
    iconUrl: `${ICON_BASE}/thread.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1869,
    code: 'iron_ore',
    nameUk: 'Залізна руда',
    nameEn: 'Iron Ore',
    iconUrl: `${ICON_BASE}/iron_ore.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1870,
    code: 'coal',
    nameUk: 'Вугілля',
    nameEn: 'Coal',
    iconUrl: `${ICON_BASE}/coal.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1871,
    code: 'charcoal',
    nameUk: 'Деревне вугілля',
    nameEn: 'Charcoal',
    iconUrl: `${ICON_BASE}/charcoal.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1872,
    code: 'animal_bone',
    nameUk: 'Кістка тварини',
    nameEn: 'Animal Bone',
    iconUrl: `${ICON_BASE}/animal_bone.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 1,
  },
  {
    itemId: 1873,
    code: 'silver_nugget',
    nameUk: 'Срібний самородок',
    nameEn: 'Silver Nugget',
    iconUrl: `${ICON_BASE}/silver_nugget.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 2,
  },
  {
    itemId: 1874,
    code: 'stone_of_purity',
    nameUk: 'Камінь чистоти',
    nameEn: 'Stone of Purity',
    iconUrl: `${ICON_BASE}/stone_of_purity.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 3,
  },
  {
    itemId: 1875,
    code: 'mithril_ore',
    nameUk: 'Міфрилова руда',
    nameEn: 'Mithril Ore',
    iconUrl: `${ICON_BASE}/mithril_ore.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 3,
  },
  {
    itemId: 1876,
    code: 'oriharukon_ore',
    nameUk: 'Руда оріхарукону',
    nameEn: 'Oriharukon Ore',
    iconUrl: `${ICON_BASE}/oriharukon_ore.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 4,
  },
  {
    itemId: 1877,
    code: 'adamantite_nugget',
    nameUk: 'Адамантитовий самородок',
    nameEn: 'Adamantite Nugget',
    iconUrl: `${ICON_BASE}/adamantite_nugget.jpg`,
    stackable: true,
    sourceType: 'drop_spoil',
    tier: 5,
  },
  {
    itemId: BASIC_RESOURCE_WEAPON_PIECE_ITEM_ID,
    code: 'weapon_piece',
    nameUk: 'Уламок зброї',
    nameEn: 'Weapon Piece',
    iconUrl: `${ICON_BASE}/weapon_piece.jpg`,
    stackable: true,
    sourceType: 'drop',
    tier: 3,
  },
  {
    itemId: BASIC_RESOURCE_ARMOR_PIECE_ITEM_ID,
    code: 'armor_piece',
    nameUk: 'Уламок обладунку',
    nameEn: 'Armor Piece',
    iconUrl: `${ICON_BASE}/armor_piece.jpg`,
    stackable: true,
    sourceType: 'drop',
    tier: 3,
  },
  {
    itemId: BASIC_RESOURCE_ACCESSORY_GEMSTONE_ITEM_ID,
    code: 'accessory_gemstone',
    nameUk: 'Самоцвіт для аксесуара',
    nameEn: 'Accessory Gemstone',
    iconUrl: `${ICON_BASE}/accessory_gemstone.jpg`,
    stackable: true,
    sourceType: 'drop',
    tier: 3,
  },
] as const;

export const BASIC_RESOURCE_BY_ITEM_ID = new Map<number, BasicResourceEntry>(
  BASIC_RESOURCE_CATALOG.map((row) => [row.itemId, row]),
);

export const BASIC_RESOURCE_BY_CODE = new Map<string, BasicResourceEntry>(
  BASIC_RESOURCE_CATALOG.map((row) => [row.code, row]),
);

export const BASIC_RESOURCE_ITEM_IDS: readonly number[] =
  BASIC_RESOURCE_CATALOG.map((row) => row.itemId);

export function isBasicResourceItemId(itemId: number): boolean {
  return BASIC_RESOURCE_BY_ITEM_ID.has(Math.floor(Number(itemId) || 0));
}

export function isBasicResourcePieceItemId(itemId: number): boolean {
  const id = Math.floor(Number(itemId) || 0);
  return (
    id === BASIC_RESOURCE_WEAPON_PIECE_ITEM_ID ||
    id === BASIC_RESOURCE_ARMOR_PIECE_ITEM_ID ||
    id === BASIC_RESOURCE_ACCESSORY_GEMSTONE_ITEM_ID
  );
}
