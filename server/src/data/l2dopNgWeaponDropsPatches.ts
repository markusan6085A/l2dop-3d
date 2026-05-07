/**
 * NG-grade зброя в магазині дропів: підпис предмета + рядок M.Atk або P.Atk.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';

export type NgWeaponDropsPatch = NgMagicWeaponPatch | NgPhysWeaponPatch;

export interface NgMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

export interface NgPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

function key(k: string): string {
  return k.replace(/\\/g, '/').toLowerCase();
}

/** shopKey із dropsShopCatalog нижнім регістром. */
const RAW: Array<[path: string, NgWeaponDropsPatch]> = [
  // посохі / книга / палички / род (магія)
  [
    'weapon_ng/weapon_apprentices_rod_i00.png',
    {
      mode: 'magic',
      nameUk: "Apprentice's Rod — rod",
      mAtk: 23,
      speed: 379,
    },
  ],
  [
    'weapon_ng/weapon_apprentices_spellbook_i00.png',
    {
      mode: 'magic',
      nameUk: "Apprentice's Spellbook — книга",
      mAtk: 20,
      speed: 379,
    },
  ],
  [
    'weapon_ng/weapon_apprentices_staff_i00.png',
    {
      mode: 'magic',
      nameUk: "Apprentice's Staff — посох",
      mAtk: 33,
      speed: 325,
    },
  ],
  [
    'weapon_ng/weapon_apprentices_wand_i00.png',
    {
      mode: 'magic',
      nameUk: "Apprentice's Wand — wand",
      mAtk: 26,
      speed: 379,
    },
  ],
  [
    'weapon_ng/weapon_cedar_staff_i00.png',
    {
      mode: 'magic',
      nameUk: 'Cedar Staff — посох',
      mAtk: 40,
      speed: 325,
    },
  ],
  [
    'weapon_ng/weapon_crucifix_of_blessing_i00.png',
    {
      mode: 'magic',
      nameUk: 'Crucifix of Blessing — маг. булава',
      mAtk: 35,
      speed: 379,
    },
  ],
  [
    'weapon_ng/weapon_sword_of_watershadow_i00.png',
    {
      mode: 'magic',
      nameUk: 'Sword of Watershadow — маг. меч',
      mAtk: 42,
      speed: 379,
    },
  ],
  [
    'weapon_ng/weapon_tears_of_eva_i00.png',
    {
      mode: 'magic',
      nameUk: 'Tears of Eva — маг. булава',
      mAtk: 48,
      speed: 379,
    },
  ],
  [
    'weapon_ng/weapon_voodoo_doll_i00.png',
    {
      mode: 'magic',
      nameUk: 'Voodoo Doll — маг. лялька',
      mAtk: 45,
      speed: 379,
    },
  ],
  [
    'weapon_ng/weapon_willow_staff_i00.png',
    {
      mode: 'magic',
      nameUk: 'Willow Staff — посох',
      mAtk: 50,
      speed: 325,
    },
  ],
  // кинжали
  [
    'weapon_ng/weapon_bone_dagger_i00.png',
    { mode: 'phys', nameUk: 'Bone Dagger', pAtk: 25, speed: 433, crit: 80 },
  ],
  [
    'weapon_ng/weapon_dirk_i00.png',
    { mode: 'phys', nameUk: 'Dirk', pAtk: 29, speed: 433, crit: 80 },
  ],
  [
    'weapon_ng/weapon_doomed_dagger_i00.png',
    { mode: 'phys', nameUk: 'Doomed Dagger', pAtk: 33, speed: 433, crit: 80 },
  ],
  [
    'weapon_ng/weapon_knife_i00.png',
    { mode: 'phys', nameUk: 'Knife', pAtk: 21, speed: 433, crit: 80 },
  ],
  [
    'weapon_ng/weapon_shining_knife_i00.png',
    { mode: 'phys', nameUk: 'Shining Knife', pAtk: 37, speed: 433, crit: 80 },
  ],
  [
    'weapon_ng/weapon_sword_breaker_i00.png',
    { mode: 'phys', nameUk: 'Sword Breaker', pAtk: 41, speed: 433, crit: 80 },
  ],
  [
    'weapon_ng/weapon_throw_knife_i00.png',
    { mode: 'phys', nameUk: 'Throw Knife', pAtk: 19, speed: 433, crit: 80 },
  ],
  [
    'weapon_ng/weapon_vipers_canine_i00.png',
    {
      mode: 'phys',
      nameUk: "Viper's Canine",
      pAtk: 45,
      speed: 433,
      crit: 80,
    },
  ],
  // луки
  ['weapon_ng/weapon_bow_i00.png', { mode: 'phys', nameUk: 'Bow', pAtk: 54, speed: 293, crit: 120 }],
  [
    'weapon_ng/weapon_composition_bow_i00.png',
    { mode: 'phys', nameUk: 'Composition Bow', pAtk: 70, speed: 293, crit: 120 },
  ],
  [
    'weapon_ng/weapon_hunting_bow_i00.png',
    { mode: 'phys', nameUk: 'Hunting Bow', pAtk: 62, speed: 293, crit: 120 },
  ],
  [
    'weapon_ng/weapon_short_bow_i00.png',
    { mode: 'phys', nameUk: 'Short Bow', pAtk: 46, speed: 293, crit: 120 },
  ],
  // мечі
  [
    'weapon_ng/weapon_broad_sword_i00.png',
    { mode: 'phys', nameUk: 'Broad Sword', pAtk: 36, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_falchion_i00.png',
    { mode: 'phys', nameUk: 'Falchion', pAtk: 41, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_gladius_i00.png',
    { mode: 'phys', nameUk: 'Gladius', pAtk: 33, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_handmade_sword_i00.png',
    { mode: 'phys', nameUk: 'Handmade Sword', pAtk: 29, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_long_sword_i00.png',
    { mode: 'phys', nameUk: 'Long Sword', pAtk: 45, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_orcish_sword_i00.png',
    { mode: 'phys', nameUk: 'Orcish Sword', pAtk: 48, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_sickle_i00.png',
    { mode: 'phys', nameUk: 'Sickle', pAtk: 25, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_small_sword_i00.png',
    { mode: 'phys', nameUk: 'Small Sword', pAtk: 21, speed: 379, crit: 40 },
  ],
  // булави
  [
    'weapon_ng/weapon_buzdygan_i00.png',
    { mode: 'phys', nameUk: 'Buzdygan', pAtk: 41, speed: 379, crit: 40 },
  ],
  ['weapon_ng/weapon_club_i00.png', { mode: 'phys', nameUk: 'Club', pAtk: 25, speed: 379, crit: 40 }],
  [
    'weapon_ng/weapon_dwarven_mace_i00.png',
    { mode: 'phys', nameUk: 'Dwarven Mace', pAtk: 48, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_heavy_chisel_i00.png',
    { mode: 'phys', nameUk: 'Heavy Chisel', pAtk: 45, speed: 379, crit: 40 },
  ],
  [
    'weapon_ng/weapon_iron_hammer_i00.png',
    { mode: 'phys', nameUk: 'Iron Hammer', pAtk: 37, speed: 379, crit: 40 },
  ],
  ['weapon_ng/weapon_mace_i00.png', { mode: 'phys', nameUk: 'Mace', pAtk: 33, speed: 379, crit: 40 }],
  // кастети
  [
    'weapon_ng/weapon_buffalo_horn_i00.png',
    { mode: 'phys', nameUk: 'Buffalo Horn', pAtk: 25, speed: 433, crit: 40 },
  ],
  [
    'weapon_ng/weapon_foxs_nail_i00.png',
    {
      mode: 'phys',
      nameUk: "Fox's Nail",
      pAtk: 29,
      speed: 433,
      crit: 40,
    },
  ],
  [
    'weapon_ng/weapon_iron_glove_i00.png',
    { mode: 'phys', nameUk: 'Iron Glove', pAtk: 33, speed: 433, crit: 40 },
  ],
  [
    'weapon_ng/weapon_spike_glove_i00.png',
    { mode: 'phys', nameUk: 'Spike Glove', pAtk: 37, speed: 433, crit: 40 },
  ],
  // списи
  [
    'weapon_ng/weapon_long_spear_i00.png',
    { mode: 'phys', nameUk: 'Long Spear', pAtk: 48, speed: 325, crit: 40 },
  ],
  [
    'weapon_ng/weapon_short_spear_i00.png',
    { mode: 'phys', nameUk: 'Short Spear', pAtk: 33, speed: 325, crit: 40 },
  ],
];

export const L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  NgWeaponDropsPatch
> = RAW.reduce(
  (acc, [pathPart, patch]) => {
    acc[key(pathPart)] = patch;
    return acc;
  },
  {} as Record<string, NgWeaponDropsPatch>,
);

export function ngWeaponDropsPreviewLines(
  patch: NgWeaponDropsPatch,
): DropsShopStatLineUk[] {
  if (patch.mode === 'magic') {
    return [
      {
        labelUk: '',
        valueUk: `M.Atk: ${patch.mAtk} | Speed: ${patch.speed} | Crit: —`,
      },
    ];
  }
  return [
    {
      labelUk: '',
      valueUk: `P.Atk: ${patch.pAtk} | Speed: ${patch.speed} | Crit: ${patch.crit}`,
    },
  ];
}
