/**
 * Канонічна таблиця A-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 * Характеристики: Lineage 2 Interlude (+ 2 custom shop items).
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';
import { requiresArrowsForWeaponType } from './weaponTypeContract.js';

export type AWeaponMode = 'phys' | 'magic';
export type AWeaponCanonSource = 'interlude' | 'custom';

export interface AWeaponCanonEntry {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  mode: AWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
  masteryFamily: WeaponKindForEnchant | null;
  canonSource: AWeaponCanonSource;
}

function a(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  mode: AWeaponMode,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  mAtk: number,
  wpnCrit: number,
  masteryFamily: WeaponKindForEnchant | null,
  canonSource: AWeaponCanonSource,
): AWeaponCanonEntry {
  return {
    itemId,
    shopKey: `weapon_a/${shopFile}`,
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

/** Усі 30 A-grade предметів з магазину дропів (28 Interlude + 2 custom). */
export const A_WEAPON_CATALOG: readonly AWeaponCanonEntry[] = [
  a(900201, 'apprentices_spellbook.jpg', 'Книга заклинань учня A-grade. Магічна зброя.', "Apprentice's Spellbook", 'magic', 'sword', false, 379, 9, 260, 80, null, 'custom'),
  a(900202, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет A-grade. Дворучна зброя.', "Baguette's Dualsword", 'phys', 'dual', true, 325, 402, 31, 80, 'dual', 'custom'),
  a(8680, 'barakiel_s_axe.jpg', 'Сокира Баракіеля A-grade.', "Barakiel's Axe", 'phys', 'blunt', false, 379, 251, 121, 40, 'blunt', 'interlude'),
  a(8681, 'behemoth_s_tuning_fork.jpg', 'Камертон Бегемота A-grade. Дворучна зброя.', "Behemoth's Tuning Fork", 'phys', 'bigblunt', true, 325, 305, 121, 40, 'bigblunt', 'interlude'),
  a(269, 'blood_tornado.jpg', 'Кривавий торнадо A-grade. Дворучна зброя.', 'Blood Tornado', 'phys', 'fist', true, 325, 259, 107, 40, 'fist', 'interlude'),
  a(235, 'bloody_orchid.jpg', 'Кривава орхідея A-grade.', 'Bloody Orchid', 'phys', 'dagger', false, 433, 186, 107, 120, 'dagger', 'interlude'),
  a(213, 'branch_of_the_mother_tree.jpg', 'Гілка материнського дерева A-grade. Дворучна магічна зброя.', 'Branch of the Mother Tree', 'magic', 'bigblunt', true, 325, 226, 152, 40, 'bigblunt', 'interlude'),
  a(288, 'carnage_bow.jpg', 'Лук різанини A-grade. Дальня атака.', 'Carnage Bow', 'phys', 'bow', true, 293, 440, 107, 120, 'bow', 'interlude'),
  a(8688, 'daimon_crystal.jpg', 'Кристал Даймона A-grade. Дворучна магічна зброя.', 'Daimon Crystal', 'magic', 'bigblunt', true, 325, 245, 161, 40, 'bigblunt', 'interlude'),
  a(2500, 'dark_legion_s_edge.jpg', 'Клинок темного легіону A-grade.', "Dark Legion's Edge", 'phys', 'sword', false, 379, 232, 114, 80, 'sword', 'interlude'),
  a(212, 'dasparion_s_staff.jpg', 'Посох Даспаріона A-grade. Дворучна магічна зброя.', "Dasparion's Staff", 'magic', 'bigblunt', true, 325, 207, 143, 40, 'bigblunt', 'interlude'),
  a(270, 'dragon_grinder.jpg', 'Подрібнювач дракона A-grade. Дворучна зброя.', 'Dragon Grinder', 'phys', 'fist', true, 325, 282, 114, 40, 'fist', 'interlude'),
  a(81, 'dragon_slayer.jpg', 'Вбивця драконів A-grade. Дворучна зброя.', 'Dragon Slayer', 'phys', 'bigsword', true, 325, 282, 114, 80, 'bigsword', 'interlude'),
  a(164, 'elysian.jpg', 'Елізій A-grade.', 'Elysian', 'phys', 'blunt', false, 379, 232, 114, 40, 'blunt', 'interlude'),
  a(98, 'halberd.jpg', 'Алебарда A-grade. Дворучна зброя.', 'Halberd', 'phys', 'pole', true, 325, 213, 107, 80, 'pole', 'interlude'),
  a(7884, 'infernal_master.jpg', 'Інфернальний майстер A-grade. Дворучна зброя.', 'Infernal Master', 'phys', 'bigsword', true, 325, 259, 107, 80, 'bigsword', 'interlude'),
  a(2504, 'meteor_shower.jpg', 'Метеорний дощ A-grade.', 'Meteor Shower', 'phys', 'blunt', false, 379, 213, 107, 40, 'blunt', 'interlude'),
  a(8682, 'naga_storm.jpg', 'Буря наги A-grade.', 'Naga Storm', 'phys', 'dagger', false, 433, 220, 121, 120, 'dagger', 'interlude'),
  a(8684, 'shyeed_s_bow.jpg', 'Лук Шіда A-grade. Дальня атака.', "Shyeed's Bow", 'phys', 'bow', true, 227, 570, 133, 120, 'bow', 'interlude'),
  a(8678, 'sirra_s_blade.jpg', 'Клинок Сірри A-grade.', "Sirra's Blade", 'phys', 'sword', false, 379, 251, 121, 80, 'sword', 'interlude'),
  a(8685, 'sobekk_s_hurricane.jpg', 'Ураган Собекка A-grade. Дворучна зброя.', "Sobekk's Hurricane", 'phys', 'fist', true, 325, 305, 121, 40, 'fist', 'interlude'),
  a(289, 'soul_bow.jpg', 'Лук душі A-grade. Дальня атака.', 'Soul Bow', 'phys', 'bow', true, 227, 528, 125, 120, 'bow', 'interlude'),
  a(236, 'soul_separator.jpg', 'Роздільник душ A-grade.', 'Soul Separator', 'phys', 'dagger', false, 433, 203, 114, 120, 'dagger', 'interlude'),
  a(7894, 'spiritual_eye.jpg', 'Духовне око A-grade. Магічна зброя.', 'Spiritual Eye', 'magic', 'blunt', false, 379, 170, 143, 40, 'blunt', 'interlude'),
  a(8679, 'sword_of_ipos.jpg', 'Меч Іпоса A-grade. Дворучна зброя.', 'Sword of Ipos', 'phys', 'bigsword', true, 325, 305, 121, 80, 'bigsword', 'interlude'),
  a(151, 'sword_of_miracles.jpg', 'Меч див A-grade. Магічна зброя.', 'Sword of Miracles', 'magic', 'sword', false, 379, 186, 152, 80, 'sword', 'interlude'),
  a(80, 'tallum_blade.jpg', 'Клинок Таллума A-grade.', 'Tallum Blade', 'phys', 'sword', false, 379, 213, 107, 80, 'sword', 'interlude'),
  a(305, 'tallum_glaive.jpg', 'Глефа Таллума A-grade. Дворучна зброя.', 'Tallum Glaive', 'phys', 'pole', true, 325, 232, 114, 80, 'pole', 'interlude'),
  a(8686, 'themis_tongue.jpg', 'Язик Теміди A-grade. Магічна зброя.', "Themis' Tongue", 'magic', 'sword', false, 379, 202, 161, 80, 'sword', 'interlude'),
  a(8683, 'tiphon_s_spear.jpg', 'Спіс Тіфона A-grade. Дворучна зброя.', "Tiphon's Spear", 'phys', 'pole', true, 325, 251, 121, 80, 'pole', 'interlude'),
] as const;

export const A_WEAPON_SHOP_TOTAL = A_WEAPON_CATALOG.length;
export const A_WEAPON_CANONICAL_COUNT = A_WEAPON_CATALOG.filter((e) => e.canonSource === 'interlude').length;
export const A_WEAPON_CUSTOM_COUNT = A_WEAPON_CATALOG.filter((e) => e.canonSource === 'custom').length;

export const A_WEAPON_ITEM_IDS = new Set<number>(
  A_WEAPON_CATALOG.map((e) => e.itemId),
);

export function isAWeaponItemId(itemId: number): boolean {
  return A_WEAPON_ITEM_IDS.has(itemId);
}

function shopKeyLower(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

export const A_WEAPON_BY_ITEM_ID: ReadonlyMap<number, AWeaponCanonEntry> =
  new Map(A_WEAPON_CATALOG.map((e) => [e.itemId, e]));

export const A_WEAPON_BY_SHOP_KEY_LOWER: ReadonlyMap<string, AWeaponCanonEntry> =
  new Map(A_WEAPON_CATALOG.map((e) => [shopKeyLower(e.shopKey), e]));

/** Запис для ITEM_CATALOG / інвентаря / бою. */
export function aWeaponToItemMeta(entry: AWeaponCanonEntry): ItemMeta {
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
