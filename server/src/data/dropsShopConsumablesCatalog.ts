/** Категорія «Розхідники» в крамниці дропів — поза сканом icons/drops (синтетичний shopKey). */
import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';

/** Статика: `server/public/icons/drops/resours/` (регістр імен — як у тебе в файлах). */
const RES = '/icons/drops/resours';

/** Благословенний заряд духу: NG і A — одна й та сама срібна іконка (як ти задав). */
const SPELL_SHOT_ICON_NG = `${RES}/Etc_spell_shot_silver_i01_0.jpg`;
const SPELL_SHOT_ICON_D = `${RES}/Etc_spell_shot_blue_i01_0.jpg`;
const SPELL_SHOT_ICON_C = `${RES}/Etc_spell_shot_green_i01_0.jpg`;
const SPELL_SHOT_ICON_B = `${RES}/Etc_spell_shot_red_i01_0.jpg`;
const SPELL_SHOT_ICON_A = `${RES}/Etc_spell_shot_silver_i01_0.jpg`;
const SPELL_SHOT_ICON_S = `${RES}/Etc_spell_shot_gold_i01_0.jpg`;

const POTION_ICON_HP_SMALL = `${RES}/etc_lesser_potion_red_i00.png`;
const POTION_ICON_HP_LARGE = `${RES}/Etc_potion_scarlet_i00_0.jpg`;
const POTION_ICON_MP_SMALL = `${RES}/etc_reagent_blue_i00.png`;
const POTION_ICON_MP_LARGE = `${RES}/Etc_potion_blue_i00_0.jpg`;

/**
 * Зілля — лише NG-вкладка; благословенні заряди духу — по грейдах.
 * Соски воїна — `dropsShopFighterSoulshotsCatalog.ts`.
 */
export const DROPS_SHOP_CONSUMABLE_ROWS: DropsShopCatalogRow[] = [
  {
    shopKey: 'consumable/potion_lesser_healing',
    category: 'consumable',
    grade: 'NG',
    iconUrl: POTION_ICON_HP_SMALL,
    nameUk: 'Зілля слабкого зцілення',
  },
  {
    shopKey: 'consumable/potion_healing',
    category: 'consumable',
    grade: 'NG',
    iconUrl: POTION_ICON_HP_LARGE,
    nameUk: 'Зілля зцілення',
  },
  {
    shopKey: 'consumable/potion_mana_small',
    category: 'consumable',
    grade: 'NG',
    iconUrl: POTION_ICON_MP_SMALL,
    nameUk: 'Зілля мани (мала банка)',
  },
  {
    shopKey: 'consumable/potion_mana_large',
    category: 'consumable',
    grade: 'NG',
    iconUrl: POTION_ICON_MP_LARGE,
    nameUk: 'Зілля мани (велика банка)',
  },
  {
    shopKey: 'consumable/blessed_spiritshot_ng',
    category: 'consumable',
    grade: 'NG',
    iconUrl: SPELL_SHOT_ICON_NG,
    nameUk: 'Благословенний заряд духу',
  },
  {
    shopKey: 'consumable/blessed_spiritshot_d',
    category: 'consumable',
    grade: 'D',
    iconUrl: SPELL_SHOT_ICON_D,
    nameUk: 'Благословенний заряд духу',
  },
  {
    shopKey: 'consumable/blessed_spiritshot_c',
    category: 'consumable',
    grade: 'C',
    iconUrl: SPELL_SHOT_ICON_C,
    nameUk: 'Благословенний заряд духу',
  },
  {
    shopKey: 'consumable/blessed_spiritshot_b',
    category: 'consumable',
    grade: 'B',
    iconUrl: SPELL_SHOT_ICON_B,
    nameUk: 'Благословенний заряд духу',
  },
  {
    shopKey: 'consumable/blessed_spiritshot_a',
    category: 'consumable',
    grade: 'A',
    iconUrl: SPELL_SHOT_ICON_A,
    nameUk: 'Благословенний заряд духу',
  },
  {
    shopKey: 'consumable/blessed_spiritshot_s',
    category: 'consumable',
    grade: 'S',
    iconUrl: SPELL_SHOT_ICON_S,
    nameUk: 'Благословенний заряд духу',
  },
];
