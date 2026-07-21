/**
 * Канонічна таблиця A-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

export type AWeaponMode = 'phys' | 'magic';

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
  mAtk?: number;
  wpnCrit: number;
  displayCrit?: number;
}

function a(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  wpnCrit: number,
  extra?: { mode?: AWeaponMode; mAtk?: number; displayCrit?: number },
): AWeaponCanonEntry {
  const mode = extra?.mode ?? 'phys';
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
    wpnCrit,
    ...(extra?.mAtk != null ? { mAtk: extra.mAtk } : {}),
    ...(mode === 'phys' ? { displayCrit: extra?.displayCrit ?? wpnCrit } : {}),
  };
}

/** Усі 30 A-grade предметів з магазину дропів. */
export const A_WEAPON_CATALOG: readonly AWeaponCanonEntry[] = [
  a(900201, 'apprentices_spellbook.jpg', 'Книга заклинань учня A-grade.', "Apprentice's Spellbook", 'sword', false, 379, 9, 40, { mode: 'magic', mAtk: 260 }),
  a(900202, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет A-grade.', "Baguette's Dualsword", 'dual', true, 325, 402, 40, { mAtk: 31 }),
  a(900203, 'barakiel_s_axe.jpg', 'Сокира Баракіеля A-grade.', "Barakiel's Axe", 'blunt', false, 379, 460, 40, { mAtk: 218 }),
  a(900204, 'behemoth_s_tuning_fork.jpg', 'Камертон Бегемота A-grade.', "Behemoth's Tuning Fork", 'bigblunt', true, 325, 213, 40, { mode: 'magic', mAtk: 280 }),
  a(900205, 'blood_tornado.jpg', 'Кривавий торнадо A-grade.', 'Blood Tornado', 'fist', true, 433, 284, 40, { mAtk: 114 }),
  a(900206, 'bloody_orchid.jpg', 'Кривава орхідея A-grade.', 'Bloody Orchid', 'dagger', false, 433, 293, 80, { mAtk: 114 }),
  a(900207, 'branch_of_the_mother_tree.jpg', 'Гілка материнського дерева A-grade.', 'Branch of the Mother Tree', 'bigblunt', true, 325, 155, 40, { mode: 'magic', mAtk: 260 }),
  a(900209, 'carnage_bow.jpg', 'Лук різанини A-grade.', 'Carnage Bow', 'bow', true, 293, 699, 120, { mAtk: 114 }),
  a(900210, 'daimon_crystal.jpg', 'Кристал Даймона A-grade.', 'Daimon Crystal', 'bigblunt', true, 325, 152, 40, { mode: 'magic', mAtk: 310 }),
  a(2500, 'dark_legion_s_edge.jpg', 'Клинок темного легіону A-grade.', "Dark Legion's Edge", 'sword', false, 379, 385, 40, { mAtk: 114 }),
  a(212, 'dasparion_s_staff.jpg', 'Посох Даспаріона A-grade.', "Dasparion's Staff", 'bigblunt', true, 325, 189, 40, { mode: 'magic', mAtk: 340 }),
  a(231, 'dragon_grinder.jpg', 'Подрібнювач дракона A-grade.', 'Dragon Grinder', 'fist', true, 433, 306, 40, { mAtk: 76 }),
  a(900211, 'dragon_slayer.jpg', 'Вбивця драконів A-grade.', 'Dragon Slayer', 'bigsword', true, 325, 460, 40, { mAtk: 114 }),
  a(164, 'elysian.jpg', 'Елізій A-grade.', 'Elysian', 'blunt', false, 379, 460, 40, { mAtk: 99 }),
  a(304, 'halberd.jpg', 'Алебарда A-grade.', 'Halberd', 'pole', true, 325, 460, 40, { mAtk: 109 }),
  a(900212, 'infernal_master.jpg', 'Інфернальний майстер A-grade.', 'Infernal Master', 'bigsword', true, 325, 420, 40, { mAtk: 114 }),
  a(2504, 'meteor_shower.jpg', 'Метеорний дощ A-grade.', 'Meteor Shower', 'blunt', false, 379, 385, 40, { mAtk: 220 }),
  a(900213, 'naga_storm.jpg', 'Буря наги A-grade.', 'Naga Storm', 'dagger', false, 433, 306, 80, { mAtk: 114 }),
  a(900214, 'shyeed_s_bow.jpg', 'Лук Шіда A-grade.', "Shyeed's Bow", 'bow', true, 293, 699, 120, { mAtk: 114 }),
  a(900215, 'sirra_s_blade.jpg', 'Клинок Сірри A-grade.', "Sirra's Blade", 'sword', false, 379, 370, 40, { mAtk: 114 }),
  a(900216, 'sobekk_s_hurricane.jpg', 'Ураган Собекка A-grade.', "Sobekk's Hurricane", 'fist', true, 433, 420, 40, { mAtk: 114 }),
  a(289, 'soul_bow.jpg', 'Лук душі A-grade.', 'Soul Bow', 'bow', true, 293, 770, 120, { mAtk: 114 }),
  a(900217, 'soul_separator.jpg', 'Роздільник душ A-grade.', 'Soul Separator', 'dagger', false, 433, 306, 80, { mAtk: 114 }),
  a(900218, 'spiritual_eye.jpg', 'Духовне око A-grade.', 'Spiritual Eye', 'blunt', false, 379, 98, 40, { mode: 'magic', mAtk: 300 }),
  a(900219, 'sword_of_ipos.jpg', 'Меч Іпоса A-grade.', 'Sword of Ipos', 'bigsword', true, 325, 370, 40, { mAtk: 114 }),
  a(151, 'sword_of_miracles.jpg', 'Меч див A-grade.', 'Sword of Miracles', 'sword', false, 379, 237, 40, { mode: 'magic', mAtk: 340 }),
  a(900220, 'tallum_blade.jpg', 'Клинок Таллума A-grade.', 'Tallum Blade', 'sword', false, 379, 370, 40, { mAtk: 114 }),
  a(900221, 'tallum_glaive.jpg', 'Глефа Таллума A-grade.', 'Tallum Glaive', 'pole', true, 325, 420, 40, { mAtk: 114 }),
  a(900222, 'themis_tongue.jpg', 'Язик Теміди A-grade.', "Themis' Tongue", 'sword', false, 379, 98, 40, { mode: 'magic', mAtk: 310 }),
  a(900223, 'tiphon_s_spear.jpg', 'Спіс Тіфона A-grade.', "Tiphon's Spear", 'pole', true, 325, 460, 40, { mAtk: 114 }),
] as const;

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
export function aWeaponToItemMeta(
  entry: AWeaponCanonEntry,
  existing?: ItemMeta,
): ItemMeta {
  const meta: ItemMeta = {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
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
