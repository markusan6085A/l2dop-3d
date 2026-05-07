/**
 * C-grade зброя в магазині дропів (shopKey weapon_c/…).
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';

export type CWeaponDropsPatch = CPhysWeaponPatch | CMagicWeaponPatch;

export interface CPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface CMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function pathKey(segment: string): string {
  return segment.replace(/\\/g, '/').toLowerCase();
}

const RAW: Array<[string, CWeaponDropsPatch]> = [
  ['weapon_c/akat_long_bow.jpg', { mode: 'phys', nameUk: 'Akat Long Bow', pAtk: 413, speed: 293, crit: 120 }],
  ['weapon_c/eminence_bow.jpg', { mode: 'phys', nameUk: 'Eminence Bow', pAtk: 389, speed: 293, crit: 120 }],
  [
    'weapon_c/crystal_dagger.jpg',
    { mode: 'phys', nameUk: 'Crystal Dagger', pAtk: 161, speed: 433, crit: 80 },
  ],
  [
    'weapon_c/dark_screamer.jpg',
    { mode: 'phys', nameUk: 'Dark Screamer', pAtk: 170, speed: 433, crit: 80 },
  ],
  ['weapon_c/scorpion.jpg', { mode: 'phys', nameUk: 'Scorpion', pAtk: 153, speed: 433, crit: 80 }],
  [
    'weapon_c/berserker_blade.jpg',
    { mode: 'phys', nameUk: 'Berserker Blade', pAtk: 236, speed: 325, crit: 40 },
  ],
  [
    'weapon_c/ecliptic_sword.jpg',
    { mode: 'phys', nameUk: 'Ecliptic Sword', pAtk: 190, speed: 379, crit: 40 },
  ],
  [
    'weapon_c/pa_agrian_sword.jpg',
    {
      mode: 'phys',
      nameUk: "Pa'agrio Sword",
      pAtk: 200,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_c/samurai_longsword.jpg',
    {
      mode: 'phys',
      nameUk: 'Samurai Longsword',
      pAtk: 205,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_c/baguette_s_dualsword.jpg',
    {
      mode: 'phys',
      nameUk: "Baguette's Dualsword",
      pAtk: 222,
      speed: 325,
      crit: 40,
    },
  ],
  ['weapon_c/battle_axe.jpg', { mode: 'phys', nameUk: 'Battle Axe', pAtk: 236, speed: 325, crit: 40 }],
  ['weapon_c/big_hammer.jpg', { mode: 'phys', nameUk: 'Big Hammer', pAtk: 190, speed: 379, crit: 40 }],
  [
    'weapon_c/dwarven_hammer.jpg',
    { mode: 'phys', nameUk: 'Dwarven Hammer', pAtk: 200, speed: 379, crit: 40 },
  ],
  [
    'weapon_c/heavy_doom_axe.jpg',
    { mode: 'phys', nameUk: 'Heavy Doom Axe', pAtk: 250, speed: 325, crit: 40 },
  ],
  [
    'weapon_c/heavy_doom_hammer.jpg',
    { mode: 'phys', nameUk: 'Heavy Doom Hammer', pAtk: 210, speed: 379, crit: 40 },
  ],
  ['weapon_c/war_axe.jpg', { mode: 'phys', nameUk: 'War Axe', pAtk: 236, speed: 325, crit: 40 }],
  ['weapon_c/yaksa_mace.jpg', { mode: 'phys', nameUk: 'Yaksa Mace', pAtk: 205, speed: 379, crit: 40 }],
  [
    'weapon_c/fisted_blade.jpg',
    { mode: 'phys', nameUk: 'Fisted Blade', pAtk: 161, speed: 433, crit: 40 },
  ],
  ['weapon_c/great_pata.jpg', { mode: 'phys', nameUk: 'Great Pata', pAtk: 170, speed: 433, crit: 40 }],
  [
    'weapon_c/knuckle_duster.jpg',
    { mode: 'phys', nameUk: 'Knuckle Duster', pAtk: 153, speed: 433, crit: 40 },
  ],
  [
    'weapon_c/orcish_poleaxe.jpg',
    { mode: 'phys', nameUk: 'Orcish Poleaxe', pAtk: 236, speed: 325, crit: 40 },
  ],
  [
    'weapon_c/widow_maker.jpg',
    { mode: 'phys', nameUk: 'Widow Maker', pAtk: 250, speed: 325, crit: 40 },
  ],
  [
    'weapon_c/apprentices_spellbook.jpg',
    {
      mode: 'magic',
      nameUk: "Apprentice's Spellbook",
      mAtk: 95,
      speed: 379,
    },
  ],
  [
    'weapon_c/demon_s_staff.jpg',
    { mode: 'magic', nameUk: "Demon's Staff", mAtk: 154, speed: 325 },
  ],
  [
    'weapon_c/heathens_book.jpg',
    {
      mode: 'magic',
      nameUk: "Heathen's Book",
      mAtk: 120,
      speed: 379,
    },
  ],
  [
    'weapon_c/homunkulus_s_sword.jpg',
    {
      mode: 'magic',
      nameUk: "Homunkulus's Sword",
      mAtk: 140,
      speed: 379,
    },
  ],
];

export const L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  CWeaponDropsPatch
> = RAW.reduce((acc, [segment, patch]) => {
  acc[pathKey(segment)] = patch;
  return acc;
}, {} as Record<string, CWeaponDropsPatch>);

export function cGradeWeaponDropsPreviewLines(
  patch: CWeaponDropsPatch,
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
