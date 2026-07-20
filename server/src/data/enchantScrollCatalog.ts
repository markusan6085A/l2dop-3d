export type EnchantScrollGrade = 'D' | 'C' | 'B' | 'A' | 'S';
export type EnchantScrollTarget = 'weapon' | 'armor';

export interface EnchantScrollDefinition {
  itemId: number;
  shopKey: string;
  nameUk: string;
  iconUrl: string;
  grade: EnchantScrollGrade;
  target: EnchantScrollTarget;
}

const RES = '/icons/drops/resours';

export const ENCHANT_SCROLL_DEFINITIONS: readonly EnchantScrollDefinition[] = [
  {
    itemId: 910510,
    shopKey: 'consumable/enchant_scroll_armor_d',
    nameUk: 'Сувій заточки броні D-grade',
    iconUrl: `${RES}/scroll_enchant_armor_d.png`,
    grade: 'D',
    target: 'armor',
  },
  {
    itemId: 910511,
    shopKey: 'consumable/enchant_scroll_weapon_d',
    nameUk: 'Сувій заточки зброї D-grade',
    iconUrl: `${RES}/scroll_enchant_weapon_d.png`,
    grade: 'D',
    target: 'weapon',
  },
  {
    itemId: 910512,
    shopKey: 'consumable/enchant_scroll_armor_c',
    nameUk: 'Сувій заточки броні C-grade',
    iconUrl: `${RES}/scroll_enchant_armor_c.png`,
    grade: 'C',
    target: 'armor',
  },
  {
    itemId: 910513,
    shopKey: 'consumable/enchant_scroll_weapon_c',
    nameUk: 'Сувій заточки зброї C-grade',
    iconUrl: `${RES}/scroll_enchant_weapon_c.png`,
    grade: 'C',
    target: 'weapon',
  },
  {
    itemId: 910514,
    shopKey: 'consumable/enchant_scroll_armor_b',
    nameUk: 'Сувій заточки броні B-grade',
    iconUrl: `${RES}/scroll_enchant_armor_b.png`,
    grade: 'B',
    target: 'armor',
  },
  {
    itemId: 910515,
    shopKey: 'consumable/enchant_scroll_weapon_b',
    nameUk: 'Сувій заточки зброї B-grade',
    iconUrl: `${RES}/scroll_enchant_weapon_b.png`,
    grade: 'B',
    target: 'weapon',
  },
  {
    itemId: 910516,
    shopKey: 'consumable/enchant_scroll_armor_a',
    nameUk: 'Сувій заточки броні A-grade',
    iconUrl: `${RES}/scroll_enchant_armor_a.png`,
    grade: 'A',
    target: 'armor',
  },
  {
    itemId: 910517,
    shopKey: 'consumable/enchant_scroll_weapon_a',
    nameUk: 'Сувій заточки зброї A-grade',
    iconUrl: `${RES}/scroll_enchant_weapon_a.png`,
    grade: 'A',
    target: 'weapon',
  },
  {
    itemId: 910518,
    shopKey: 'consumable/enchant_scroll_armor_s',
    nameUk: 'Сувій заточки броні S-grade',
    iconUrl: `${RES}/scroll_enchant_armor_s.png`,
    grade: 'S',
    target: 'armor',
  },
  {
    itemId: 910519,
    shopKey: 'consumable/enchant_scroll_weapon_s',
    nameUk: 'Сувій заточки зброї S-grade',
    iconUrl: `${RES}/scroll_enchant_weapon_s.png`,
    grade: 'S',
    target: 'weapon',
  },
] as const;

const SCROLL_BY_ITEM_ID = new Map<number, EnchantScrollDefinition>(
  ENCHANT_SCROLL_DEFINITIONS.map((row) => [row.itemId, row])
);

export function enchantScrollByItemId(
  itemId: number
): EnchantScrollDefinition | null {
  return SCROLL_BY_ITEM_ID.get(itemId) ?? null;
}

export function enchantScrollShopDescriptionUk(
  target: EnchantScrollTarget,
  grade: EnchantScrollGrade
): string {
  if (target === 'weapon') return `Для зброї ${grade}-grade`;
  return `Для броні, щита та біжутерії ${grade}-grade`;
}
