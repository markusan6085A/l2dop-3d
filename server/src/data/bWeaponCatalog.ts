/**
 * Канонічна таблиця B-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

export type BWeaponMode = 'phys' | 'magic';

export interface BWeaponCanonEntry {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  mode: BWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk?: number;
  wpnCrit: number;
  displayCrit?: number;
}

function b(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  wpnCrit: number,
  extra?: { mode?: BWeaponMode; mAtk?: number; displayCrit?: number },
): BWeaponCanonEntry {
  const mode = extra?.mode ?? 'phys';
  return {
    itemId,
    shopKey: `weapon_b/${shopFile}`,
    nameUk,
    shopNameUk,
    mode,
    weaponType,
    blocksShield,
    atkSpd,
    pAtk,
    wpnCrit,
    ...(extra?.mAtk != null ? { mAtk: extra.mAtk } : {}),
    ...(mode === 'phys' ? { displayCrit: extra?.displayCrit ?? wpnCrit } : {}),
  };
}

/** Усі 23 B-grade предмети з магазину дропів. */
export const B_WEAPON_CATALOG: readonly BWeaponCanonEntry[] = [
  b(78, 'apprentices_spellbook.jpg', 'Книга заклинань учня B-grade. Магічна зброя.', "Apprentice's Spellbook", 'sword', false, 379, 9, 40, { mode: 'magic', mAtk: 160 }),
  b(7834, 'art_of_battle_axe.jpg', 'Бойова сокира мистецтва B-grade.', 'Art of Battle Axe', 'blunt', false, 379, 342, 40, { mAtk: 99 }),
  b(7788, 'arthro_nail.jpg', 'Кіготь Артро B-grade. Дворучна зброя.', 'Arthro Nail', 'fist', true, 433, 213, 40, { mAtk: 23 }),
  b(7792, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет B-grade. Дворучна зброя.', "Baguette's Dualsword", 'dual', true, 325, 312, 40, { mAtk: 23 }),
  b(7893, 'bellion_cestus.jpg', 'Цестус Белліона B-grade. Дворучна зброя.', 'Bellion Cestus', 'fist', true, 433, 221, 40, { mAtk: 132 }),
  b(7891, 'bow_of_peril.jpg', 'Лук небезпеки B-grade. Дальня атака.', 'Bow of Peril', 'bow', true, 293, 529, 120, { mAtk: 111 }),
  b(7890, 'dark_elven_long_bow.jpg', 'Довгий лук темних ельфів B-grade. Дальня атака.', 'Dark Elven Long Bow', 'bow', true, 293, 553, 120, { mAtk: 63 }),
  b(7791, 'deadman_s_glory.jpg', 'Слава мертвого B-grade. Дворучна зброя.', "Deadman's Glory", 'bigsword', true, 325, 306, 40, { mAtk: 23 }),
  b(7894, 'great_axe.jpg', 'Велика сокира B-grade. Дворучна зброя.', 'Great Axe', 'bigblunt', true, 325, 342, 40, { mAtk: 143 }),
  b(7895, 'great_sword.jpg', 'Великий меч B-grade. Дворучна зброя.', 'Great Sword', 'bigsword', true, 325, 342, 40, { mAtk: 152 }),
  b(7883, 'guardian_sword.jpg', 'Меч вартового B-grade.', 'Guardian Sword', 'bigsword', true, 325, 266, 40, { mAtk: 99 }),
  b(7813, 'hell_knife.jpg', 'Кинджал пекла B-grade.', 'Hell Knife', 'dagger', false, 433, 213, 80, { mAtk: 128 }),
  b(7900, 'ice_storm_hammer.jpg', 'Молот крижаної бурі B-grade. Дворучна зброя.', 'Ice Storm Hammer', 'bigblunt', true, 325, 306, 40, { mAtk: 91 }),
  b(8340, 'kaim_vanul_s_bones.jpg', 'Кістки Каїма Ванула B-grade. Магічна зброя.', "Kaim Vanul's Bones", 'blunt', false, 379, 155, 40, { mode: 'magic', mAtk: 176 }),
  b(7783, 'kris.jpg', 'Крис B-grade.', 'Kris', 'dagger', false, 433, 205, 80, { mAtk: 63 }),
  b(7784, 'lance.jpg', 'Спіс B-grade. Дворучна зброя.', 'Lance', 'pole', true, 325, 342, 40, { mAtk: 23 }),
  b(7892, 'spell_breaker.jpg', 'Руйнівник заклинань B-grade. Магічна зброя.', 'Spell Breaker', 'blunt', false, 379, 140, 40, { mode: 'magic', mAtk: 203 }),
  b(7889, 'spirit_s_staff.jpg', 'Посох духа B-grade. Дворучна магічна зброя.', "Spirit's Staff", 'bigblunt', true, 325, 155, 40, { mode: 'magic', mAtk: 236 }),
  b(7896, 'staff_of_evil_spirits.jpg', 'Посох злих духів B-grade. Дворучна магічна зброя.', 'Staff of Evil Spirits', 'bigblunt', true, 325, 88, 40, { mode: 'magic', mAtk: 203 }),
  b(7901, 'star_buster.jpg', 'Руйнівник зірок B-grade. Дворучна зброя.', 'Star Buster', 'bigblunt', true, 325, 266, 40, { mAtk: 99 }),
  b(79, 'sword_of_damascus.jpg', 'Меч Дамаску B-grade.', 'Sword of Damascus', 'sword', false, 379, 306, 40, { mAtk: 99 }),
  b(7722, 'sword_of_valhalla.jpg', 'Меч Вальгалли B-grade. Магічна зброя.', 'Sword of Valhalla', 'sword', false, 379, 98, 40, { mode: 'magic', mAtk: 220 }),
  b(8336, 'wizard_s_tear.jpg', 'Сльоза чарівника B-grade. Магічна зброя.', "Wizard's Tear", 'sword', false, 379, 155, 40, { mode: 'magic', mAtk: 236 }),
] as const;

export const B_WEAPON_ITEM_IDS = new Set<number>(
  B_WEAPON_CATALOG.map((e) => e.itemId),
);

export function isBWeaponItemId(itemId: number): boolean {
  return B_WEAPON_ITEM_IDS.has(itemId);
}

function shopKeyLower(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

export const B_WEAPON_BY_ITEM_ID: ReadonlyMap<number, BWeaponCanonEntry> =
  new Map(B_WEAPON_CATALOG.map((e) => [e.itemId, e]));

export const B_WEAPON_BY_SHOP_KEY_LOWER: ReadonlyMap<string, BWeaponCanonEntry> =
  new Map(B_WEAPON_CATALOG.map((e) => [shopKeyLower(e.shopKey), e]));

/** Запис для ITEM_CATALOG / інвентаря / бою. */
export function bWeaponToItemMeta(
  entry: BWeaponCanonEntry,
  existing?: ItemMeta,
): ItemMeta {
  const meta: ItemMeta = {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
    blocksShield: entry.blocksShield,
    atkSpd: entry.atkSpd,
    pAtk: entry.pAtk,
    wpnCrit: entry.wpnCrit,
  };
  if (entry.mAtk != null) {
    meta.mAtk = entry.mAtk;
  } else if (existing?.mAtk != null) {
    meta.mAtk = existing.mAtk;
  }
  return meta;
}
