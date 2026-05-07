/**
 * S-grade зброя в магазині дропів (`weapon_s/…`).
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';

export type SWeaponDropsPatch = SPhysWeaponPatch | SMagicWeaponPatch;

export interface SPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface SMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function pathKey(segment: string): string {
  return segment.replace(/\\/g, '/').toLowerCase();
}

const RAW: Array<[string, SWeaponDropsPatch]> = [
  [
    'weapon_s/draconic_bow.jpg',
    {
      mode: 'phys',
      nameUk: 'Draconic Bow',
      pAtk: 984,
      speed: 293,
      crit: 120,
    },
  ],
  [
    'weapon_s/shining_bow.jpg',
    {
      mode: 'phys',
      nameUk: 'Shining Bow',
      pAtk: 934,
      speed: 293,
      crit: 120,
    },
  ],
  [
    'weapon_s/angel_slayer.jpg',
    {
      mode: 'phys',
      nameUk: 'Angel Slayer',
      pAtk: 355,
      speed: 433,
      crit: 80,
    },
  ],
  [
    'weapon_s/god_s_blade.jpg',
    {
      mode: 'phys',
      nameUk: "God's Blade",
      pAtk: 519,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_s/baguette_s_dualsword.jpg',
    {
      mode: 'phys',
      nameUk: "Baguette's Dualsword",
      pAtk: 570,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_s/basalt_battlehammer.jpg',
    {
      mode: 'phys',
      nameUk: 'Basalt Battlehammer',
      pAtk: 625,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_s/dragon_hunter_axe.jpg',
    {
      mode: 'phys',
      nameUk: 'Dragon Hunter Axe',
      pAtk: 625,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_s/heaven_s_divider.jpg',
    {
      mode: 'phys',
      nameUk: "Heaven's Divider",
      pAtk: 625,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_s/demon_splinter.jpg',
    {
      mode: 'phys',
      nameUk: 'Demon Splinter',
      pAtk: 355,
      speed: 433,
      crit: 40,
    },
  ],
  [
    'weapon_s/saint_spear.jpg',
    {
      mode: 'phys',
      nameUk: 'Saint Spear',
      pAtk: 625,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_s/apprentices_spellbook.jpg',
    {
      mode: 'magic',
      nameUk: "Apprentice's Spellbook",
      mAtk: 340,
      speed: 379,
    },
  ],
  [
    'weapon_s/arcana_mace.jpg',
    { mode: 'magic', nameUk: 'Arcana Mace', mAtk: 458, speed: 379 },
  ],
  [
    'weapon_s/imperial_staff.jpg',
    { mode: 'magic', nameUk: 'Imperial Staff', mAtk: 458, speed: 325 },
  ],
];

export const L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  SWeaponDropsPatch
> = RAW.reduce((acc, [segment, patch]) => {
  acc[pathKey(segment)] = patch;
  return acc;
}, {} as Record<string, SWeaponDropsPatch>);

export function sGradeWeaponDropsPreviewLines(
  patch: SWeaponDropsPatch,
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
