/**
 * Канонічна таблиця B-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 * Характеристики: Lineage 2 Interlude (+ 2 custom shop items).
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';
import { requiresArrowsForWeaponType } from './weaponTypeContract.js';

export type BWeaponMode = 'phys' | 'magic';
export type BWeaponCanonSource = 'interlude' | 'custom';

/** Synthetic id — B-grade custom Apprentice's Spellbook (не lineage 78). */
export const B_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID = 910101;
/** Synthetic id — B-grade custom Baguette's Dualsword (не lineage 7792). */
export const B_GRADE_BAGUETTE_DUALSWORD_ITEM_ID = 910102;

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
  mAtk: number;
  wpnCrit: number;
  masteryFamily: WeaponKindForEnchant | null;
  canonSource: BWeaponCanonSource;
}

function b(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  mode: BWeaponMode,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  mAtk: number,
  wpnCrit: number,
  masteryFamily: WeaponKindForEnchant | null,
  canonSource: BWeaponCanonSource,
): BWeaponCanonEntry {
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
    mAtk,
    wpnCrit,
    masteryFamily,
    canonSource,
  };
}

/** Усі 23 B-grade предмети з магазину дропів (21 Interlude + 2 custom). */
export const B_WEAPON_CATALOG: readonly BWeaponCanonEntry[] = [
  b(78, 'great_sword.jpg', 'Великий меч B-grade. Дворучна зброя.', 'Great Sword', 'phys', 'bigsword', true, 325, 213, 91, 80, 'bigsword', 'interlude'),
  b(79, 'sword_of_damascus.jpg', 'Меч Дамаску B-grade.', 'Sword of Damascus', 'phys', 'sword', false, 379, 194, 99, 80, 'sword', 'interlude'),
  b(92, 'spirit_s_staff.jpg', 'Посох спрайта B-grade. Дворучна магічна зброя.', "Sprite's Staff", 'magic', 'bigblunt', true, 325, 170, 122, 40, 'bigblunt', 'interlude'),
  b(97, 'lance.jpg', 'Спіс B-grade. Дворучна зброя.', 'Lance', 'phys', 'pole', true, 325, 194, 99, 80, 'pole', 'interlude'),
  b(148, 'sword_of_valhalla.jpg', 'Меч Вальгалли B-grade. Магічна зброя.', 'Sword of Valhalla', 'magic', 'sword', false, 379, 140, 122, 80, 'sword', 'interlude'),
  b(171, 'deadman_s_glory.jpg', 'Слава мертвого B-grade.', "Deadman's Glory", 'phys', 'blunt', false, 379, 194, 99, 40, 'blunt', 'interlude'),
  b(175, 'art_of_battle_axe.jpg', 'Бойова сокира мистецтва B-grade.', 'Art of Battle Axe', 'phys', 'blunt', false, 379, 194, 99, 40, 'blunt', 'interlude'),
  b(210, 'staff_of_evil_spirits.jpg', 'Посох злих духів B-grade. Дворучна магічна зброя.', 'Staff of Evil Spirits', 'magic', 'bigblunt', true, 325, 189, 132, 40, 'bigblunt', 'interlude'),
  b(229, 'kris.jpg', 'Крис B-grade.', 'Kris', 'phys', 'dagger', false, 433, 153, 91, 120, 'dagger', 'interlude'),
  b(243, 'hell_knife.jpg', 'Кинджал пекла B-grade. Магічна зброя.', 'Hell Knife', 'magic', 'dagger', false, 433, 122, 122, 120, 'dagger', 'interlude'),
  b(267, 'arthro_nail.jpg', 'Кіготь Артро B-grade. Дворучна зброя.', 'Arthro Nail', 'phys', 'fist', true, 325, 213, 91, 40, 'fist', 'interlude'),
  b(268, 'bellion_cestus.jpg', 'Цестус Белліона B-grade. Дворучна зброя.', 'Bellion Cestus', 'phys', 'fist', true, 325, 236, 99, 40, 'fist', 'interlude'),
  b(284, 'dark_elven_long_bow.jpg', 'Довгий лук темних ельфів B-grade. Дальня атака.', 'Dark Elven Long Bow', 'phys', 'bow', true, 227, 397, 100, 120, 'bow', 'interlude'),
  b(287, 'bow_of_peril.jpg', 'Лук небезпеки B-grade. Дальня атака.', 'Bow of Peril', 'phys', 'bow', true, 293, 400, 99, 120, 'bow', 'interlude'),
  b(300, 'great_axe.jpg', 'Велика сокира B-grade. Дворучна зброя.', 'Great Axe', 'phys', 'pole', true, 325, 175, 91, 80, 'pole', 'interlude'),
  b(7883, 'guardian_sword.jpg', 'Меч вартового B-grade.', 'Guardian Sword', 'phys', 'bigsword', true, 325, 236, 99, 80, 'bigsword', 'interlude'),
  b(7889, 'wizard_s_tear.jpg', 'Сльоза чарівника B-grade. Магічна зброя.', "Wizard's Tear", 'magic', 'sword', false, 379, 155, 132, 80, 'sword', 'interlude'),
  b(7892, 'spell_breaker.jpg', 'Руйнівник заклинань B-grade. Магічна зброя.', 'Spell Breaker', 'magic', 'blunt', false, 379, 140, 122, 40, 'blunt', 'interlude'),
  b(7893, 'kaim_vanul_s_bones.jpg', 'Кістки Каїма Ванула B-grade. Магічна зброя.', "Kaim Vanul's Bones", 'magic', 'blunt', false, 379, 155, 132, 40, 'blunt', 'interlude'),
  b(7900, 'ice_storm_hammer.jpg', 'Молот крижаної бурі B-grade. Дворучна зброя.', 'Ice Storm Hammer', 'phys', 'bigblunt', true, 325, 213, 91, 40, 'bigblunt', 'interlude'),
  b(7901, 'star_buster.jpg', 'Руйнівник зірок B-grade. Дворучна зброя.', 'Star Buster', 'phys', 'bigblunt', true, 325, 236, 99, 40, 'bigblunt', 'interlude'),
  b(910101, 'apprentices_spellbook.jpg', 'Книга заклинань учня B-grade. Магічна зброя.', "Apprentice's Spellbook", 'magic', 'sword', false, 379, 9, 160, 80, null, 'custom'),
  b(910102, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет B-grade. Дворучна зброя.', "Baguette's Dualsword", 'phys', 'dual', true, 325, 312, 23, 80, 'dual', 'custom'),
] as const;

export const B_WEAPON_SHOP_TOTAL = B_WEAPON_CATALOG.length;
export const B_WEAPON_CANONICAL_COUNT = B_WEAPON_CATALOG.filter((e) => e.canonSource === 'interlude').length;
export const B_WEAPON_CUSTOM_COUNT = B_WEAPON_CATALOG.filter((e) => e.canonSource === 'custom').length;

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
export function bWeaponToItemMeta(entry: BWeaponCanonEntry): ItemMeta {
  const meta: ItemMeta = {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
    blocksShield: entry.blocksShield,
    atkSpd: entry.atkSpd,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    wpnCrit: entry.wpnCrit,
    masteryFamily: entry.masteryFamily,
  };
  if (requiresArrowsForWeaponType(entry.weaponType)) {
    meta.requiresArrows = true;
  }
  return meta;
}
