/**
 * D-grade зброя в магазині дропів: назви + рядок статів як у затвердженій таблиці.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';

export type DWeaponDropsPatch =
  | DWeaponPhysPatch
  | DWeaponMagicBookPatch;

export interface DWeaponPhysPatch {
  nameUk: string;
  mode: 'phys';
  pAtk: number;
  speed: number;
  crit: number;
}

export interface DWeaponMagicBookPatch {
  nameUk: string;
  mode: 'magic_book';
  mAtk: number;
  speed: number;
}

function pathKey(segment: string): string {
  return segment.replace(/\\/g, '/').toLowerCase();
}

/** Підпис англійською в рядку — як у дизайнерському тексті автора. */
const RAW: Array<[string, DWeaponDropsPatch]> = [
  [
    'weapon_d/atuba_hammer.jpg',
    {
      nameUk: 'Atuba Hammer — булава',
      mode: 'phys',
      pAtk: 111,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_d/baguette_s_dualsword.jpg',
    {
      nameUk: "Baguette's Dualsword — dual sword",
      mode: 'phys',
      pAtk: 122,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_d/dark_elven_bow.jpg',
    {
      nameUk: 'Dark Elven Bow — лук',
      mode: 'phys',
      pAtk: 216,
      speed: 293,
      crit: 120,
    },
  ],
  [
    'weapon_d/knight_s_sword.jpg',
    {
      nameUk: "Knight's Sword — меч",
      mode: 'phys',
      pAtk: 103,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_d/shilen_knife.jpg',
    {
      nameUk: 'Shilen Knife — кинжал',
      mode: 'phys',
      pAtk: 91,
      speed: 433,
      crit: 80,
    },
  ],
  [
    'weapon_d/tomahawk.jpg',
    {
      nameUk: 'Tomahawk — булава',
      mode: 'phys',
      pAtk: 103,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_d/tome_of_blood.jpg',
    {
      nameUk: 'Tome of Blood — книга',
      mode: 'magic_book',
      mAtk: 80,
      speed: 379,
    },
  ],
  [
    'weapon_d/triple-edged_jamadhr.jpg',
    {
      nameUk: 'Triple-Edged Jamadhr — кастети',
      mode: 'phys',
      pAtk: 91,
      speed: 433,
      crit: 40,
    },
  ],
  [
    'weapon_d/two_handed_sword.jpg',
    {
      nameUk: 'Two-Handed Sword — двуручний меч',
      mode: 'phys',
      pAtk: 132,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_d/war_hammer.jpg',
    {
      nameUk: 'War Hammer',
      mode: 'phys',
      pAtk: 132,
      speed: 325,
      crit: 40,
    },
  ],
];

export const L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  DWeaponDropsPatch
> = RAW.reduce(
  (acc, [segment, patch]) => {
    acc[pathKey(segment)] = patch;
    return acc;
  },
  {} as Record<string, DWeaponDropsPatch>,
);

export function dGradeWeaponDropsPreviewLines(
  patch: DWeaponDropsPatch,
): DropsShopStatLineUk[] {
  if (patch.mode === 'magic_book') {
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
