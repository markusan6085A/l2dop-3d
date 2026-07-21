/**
 * Канонічна таблиця NG-зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

export type NgWeaponMode = 'magic' | 'phys';

export interface NgWeaponCanonEntry {
  itemId: number;
  shopKey: string;
  /** Українська назва для ITEM_CATALOG / інвентаря. */
  nameUk: string;
  /** Назва в списку магазину дропів (може бути латиницею). */
  shopNameUk: string;
  mode: NgWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk?: number;
  mAtk?: number;
  /** Базовий крит ($WpnCrt) для фізичної NG-зброї; для магії — не показується. */
  displayCrit?: number;
}

function ng(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  stat:
    | { mode: 'phys'; pAtk: number; displayCrit: number; mAtk?: number }
    | { mode: 'magic'; pAtk: number; mAtk: number },
): NgWeaponCanonEntry {
  return {
    itemId,
    shopKey: `weapon_ng/${shopFile}`,
    nameUk,
    shopNameUk,
    weaponType,
    blocksShield,
    atkSpd,
    mode: stat.mode,
    ...(stat.mode === 'phys'
      ? {
          pAtk: stat.pAtk,
          displayCrit: stat.displayCrit,
          ...(stat.mAtk != null ? { mAtk: stat.mAtk } : {}),
        }
      : { pAtk: stat.pAtk, mAtk: stat.mAtk }),
  };
}

/** Усі 42 NG-предмети з магазину дропів (включно з Buffalo's Horn). */
export const NG_WEAPON_CATALOG: readonly NgWeaponCanonEntry[] = [
  ng(7, 'weapon_apprentices_rod_i00.png', 'Жезло недосвідченого NG-grade.', "Apprentice's Rod — rod", 'blunt', false, 379, { mode: 'magic', pAtk: 17, mAtk: 23 }),
  ng(99, 'weapon_apprentices_spellbook_i00.png', 'Посібник недосвідченого NG-grade.', "Apprentice's Spellbook — книга", 'sword', false, 379, { mode: 'magic', pAtk: 15, mAtk: 20 }),
  ng(176, 'weapon_apprentices_staff_i00.png', 'Посох недосвідченого NG-grade.', "Apprentice's Staff — посох", 'bigblunt', true, 325, { mode: 'magic', pAtk: 32, mAtk: 33 }),
  ng(6, 'weapon_apprentices_wand_i00.png', 'Палиця недосвідченого NG-grade.', "Apprentice's Wand — wand", 'blunt', false, 379, { mode: 'magic', pAtk: 19, mAtk: 26 }),

  ng(11, 'weapon_bone_dagger_i00.png', 'Кістковий кинжал NG-grade.', 'Bone Dagger', 'dagger', false, 433, { mode: 'phys', pAtk: 25, displayCrit: 80 }),
  ng(14, 'weapon_bow_i00.png', 'Лук NG-grade.', 'Bow', 'bow', true, 293, { mode: 'phys', pAtk: 54, displayCrit: 120 }),
  ng(3, 'weapon_broad_sword_i00.png', 'Широкий меч NG-grade.', 'Broad Sword', 'sword', false, 379, { mode: 'phys', pAtk: 36, displayCrit: 40 }),
  ng(308, 'weapon_buffalo_horn_i00.png', "Ріг буйвола Buffalo's Horn NG-grade.", "Buffalo's Horn", 'blunt', false, 379, { mode: 'phys', pAtk: 25, displayCrit: 40, mAtk: 8 }),
  ng(155, 'weapon_buzdygan_i00.png', 'Буздиган NG-grade.', 'Buzdygan', 'blunt', false, 379, { mode: 'phys', pAtk: 41, displayCrit: 40 }),
  ng(9, 'weapon_cedar_staff_i00.png', 'Кедровий посох NG-grade.', 'Cedar Staff — посох', 'bigblunt', true, 325, { mode: 'magic', pAtk: 36, mAtk: 40 }),

  ng(4, 'weapon_club_i00.png', 'Бита NG-grade.', 'Club', 'blunt', false, 379, { mode: 'phys', pAtk: 25, displayCrit: 40 }),
  ng(273, 'weapon_composition_bow_i00.png', 'Композитний лук NG-grade.', 'Composition Bow', 'bow', true, 293, { mode: 'phys', pAtk: 70, displayCrit: 120 }),
  ng(311, 'weapon_crucifix_of_blessing_i00.png', 'Розп’яття благословення NG-grade.', 'Crucifix of Blessing — маг. булава', 'blunt', false, 379, { mode: 'magic', pAtk: 31, mAtk: 35 }),
  ng(216, 'weapon_dirk_i00.png', 'Стилет NG-grade.', 'Dirk', 'dagger', false, 433, { mode: 'phys', pAtk: 29, displayCrit: 80 }),
  ng(215, 'weapon_doomed_dagger_i00.png', 'Приречений кинжал NG-grade.', 'Doomed Dagger', 'dagger', false, 433, { mode: 'phys', pAtk: 33, displayCrit: 80 }),

  ng(154, 'weapon_dwarven_mace_i00.png', 'Гномяча булава NG-grade.', 'Dwarven Mace', 'blunt', false, 379, { mode: 'phys', pAtk: 48, displayCrit: 40 }),
  ng(68, 'weapon_falchion_i00.png', 'Фалькіон NG-grade.', 'Falchion', 'sword', false, 379, { mode: 'phys', pAtk: 41, displayCrit: 40 }),
  ng(255, 'weapon_foxs_nail_i00.png', 'Цвях лисячих лап NG-grade.', "Fox's Nail", 'fist', true, 433, { mode: 'phys', pAtk: 29, displayCrit: 40 }),
  ng(66, 'weapon_gladius_i00.png', 'Гладіус NG-grade.', 'Gladius', 'sword', false, 379, { mode: 'phys', pAtk: 33, displayCrit: 40 }),
  ng(122, 'weapon_handmade_sword_i00.png', 'Меч ручної кування NG-grade.', 'Handmade Sword', 'sword', false, 379, { mode: 'phys', pAtk: 29, displayCrit: 40 }),

  ng(152, 'weapon_heavy_chisel_i00.png', 'Велике зубило NG-grade.', 'Heavy Chisel', 'blunt', false, 379, { mode: 'phys', pAtk: 45, displayCrit: 40 }),
  ng(271, 'weapon_hunting_bow_i00.png', 'Мисливський лук NG-grade.', 'Hunting Bow', 'bow', true, 293, { mode: 'phys', pAtk: 62, displayCrit: 120 }),
  ng(254, 'weapon_iron_glove_i00.png', 'Залізні рукавички NG-grade.', 'Iron Glove', 'fist', true, 433, { mode: 'phys', pAtk: 33, displayCrit: 40 }),
  ng(87, 'weapon_iron_hammer_i00.png', 'Залізний молот NG-grade.', 'Iron Hammer', 'blunt', false, 379, { mode: 'phys', pAtk: 37, displayCrit: 40 }),
  ng(12, 'weapon_knife_i00.png', 'Ніж NG-grade.', 'Knife', 'dagger', false, 433, { mode: 'phys', pAtk: 21, displayCrit: 80 }),

  ng(16, 'weapon_long_spear_i00.png', 'Довгий спис NG-grade.', 'Long Spear', 'pole', true, 325, { mode: 'phys', pAtk: 48, displayCrit: 40 }),
  ng(2, 'weapon_long_sword_i00.png', 'Довгий меч NG-grade.', 'Long Sword', 'sword', false, 379, { mode: 'phys', pAtk: 45, displayCrit: 40 }),
  ng(5, 'weapon_mace_i00.png', 'Булава NG-grade.', 'Mace', 'blunt', false, 379, { mode: 'phys', pAtk: 33, displayCrit: 40 }),
  ng(67, 'weapon_orcish_sword_i00.png', 'Меч орків NG-grade.', 'Orcish Sword', 'sword', false, 379, { mode: 'phys', pAtk: 48, displayCrit: 40 }),
  ng(217, 'weapon_shining_knife_i00.png', 'Блискучий ніж NG-grade.', 'Shining Knife', 'dagger', false, 433, { mode: 'phys', pAtk: 37, displayCrit: 80 }),

  ng(13, 'weapon_short_bow_i00.png', 'Короткий лук NG-grade.', 'Short Bow', 'bow', true, 293, { mode: 'phys', pAtk: 46, displayCrit: 120 }),
  ng(15, 'weapon_short_spear_i00.png', 'Короткий спис NG-grade.', 'Short Spear', 'pole', true, 325, { mode: 'phys', pAtk: 33, displayCrit: 40 }),
  ng(153, 'weapon_sickle_i00.png', 'Серп NG-grade.', 'Sickle', 'sword', false, 379, { mode: 'phys', pAtk: 25, displayCrit: 40 }),
  ng(1, 'weapon_small_sword_i00.png', 'Малий меч NG-grade.', 'Small Sword', 'sword', false, 379, { mode: 'phys', pAtk: 21, displayCrit: 40 }),
  ng(253, 'weapon_spike_glove_i00.png', 'Рукавички з шипами NG-grade.', 'Spike Glove', 'fist', true, 433, { mode: 'phys', pAtk: 37, displayCrit: 40 }),

  ng(219, 'weapon_sword_breaker_i00.png', 'Зламвач мечів NG-grade.', 'Sword Breaker', 'dagger', false, 433, { mode: 'phys', pAtk: 41, displayCrit: 80 }),
  ng(121, 'weapon_sword_of_watershadow_i00.png', 'Меч водяної тіні NG-grade.', 'Sword of Watershadow — маг. меч', 'sword', false, 379, { mode: 'magic', pAtk: 24, mAtk: 42 }),
  ng(309, 'weapon_tears_of_eva_i00.png', 'Сльози Еви NG-grade.', 'Tears of Eva — маг. булава', 'blunt', false, 379, { mode: 'magic', pAtk: 41, mAtk: 48 }),
  ng(218, 'weapon_throw_knife_i00.png', 'Метальний ніж NG-grade.', 'Throw Knife', 'dagger', false, 433, { mode: 'phys', pAtk: 19, displayCrit: 80 }),
  ng(257, 'weapon_vipers_canine_i00.png', 'Ікло гадюки NG-grade.', "Viper's Canine", 'dagger', false, 433, { mode: 'phys', pAtk: 45, displayCrit: 80 }),

  ng(100, 'weapon_voodoo_doll_i00.png', 'Лялька вуду NG-grade.', 'Voodoo Doll — маг. лялька', 'blunt', false, 379, { mode: 'magic', pAtk: 40, mAtk: 45 }),
  ng(8, 'weapon_willow_staff_i00.png', 'Вербовий посох NG-grade.', 'Willow Staff — посох', 'bigblunt', true, 325, { mode: 'magic', pAtk: 42, mAtk: 50 }),
] as const;

export const NG_WEAPON_ITEM_IDS = new Set<number>(
  NG_WEAPON_CATALOG.map((e) => e.itemId),
);

export function isNgWeaponItemId(itemId: number): boolean {
  return NG_WEAPON_ITEM_IDS.has(itemId);
}

function shopKeyLower(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

export const NG_WEAPON_BY_ITEM_ID: ReadonlyMap<number, NgWeaponCanonEntry> =
  new Map(NG_WEAPON_CATALOG.map((e) => [e.itemId, e]));

export const NG_WEAPON_BY_SHOP_KEY_LOWER: ReadonlyMap<string, NgWeaponCanonEntry> =
  new Map(NG_WEAPON_CATALOG.map((e) => [shopKeyLower(e.shopKey), e]));

/** Запис для ITEM_CATALOG / інвентаря / бою. */
export function ngWeaponToItemMeta(
  entry: NgWeaponCanonEntry,
  existing?: ItemMeta,
): ItemMeta {
  const meta: ItemMeta = {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
    blocksShield: entry.blocksShield,
    atkSpd: entry.atkSpd,
  };
  if (entry.pAtk != null) meta.pAtk = entry.pAtk;
  if (entry.mAtk != null) {
    meta.mAtk = entry.mAtk;
  } else if (existing?.mAtk != null) {
    meta.mAtk = existing.mAtk;
  }
  if (entry.mode === 'phys' && entry.displayCrit != null) {
    meta.wpnCrit = entry.displayCrit;
  }
  return meta;
}
