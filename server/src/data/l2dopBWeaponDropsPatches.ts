/**
 * B-grade зброя в магазині дропів (`weapon_b/…`; у нашому каталозі — вкладка B).
 * Стати як у авторській таблиці «A-grade» (хроніка L2 / назви предметів).
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';

/** Узгоджено з l2dopCWeaponDropsPatches.ts */
export type BWeaponDropsPatch = BPhysWeaponPatch | BMagicWeaponPatch;

export interface BPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface BMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function pathKey(segment: string): string {
  return segment.replace(/\\/g, '/').toLowerCase();
}

const RAW: Array<[string, BWeaponDropsPatch]> = [
  [
    'weapon_b/bow_of_peril.jpg',
    { mode: 'phys', nameUk: 'Bow of Peril', pAtk: 529, speed: 293, crit: 120 },
  ],
  [
    'weapon_b/dark_elven_long_bow.jpg',
    {
      mode: 'phys',
      nameUk: 'Dark Elven Long Bow',
      pAtk: 553,
      speed: 293,
      crit: 120,
    },
  ],
  [
    'weapon_b/hell_knife.jpg',
    { mode: 'phys', nameUk: 'Hell Knife', pAtk: 213, speed: 433, crit: 80 },
  ],
  ['weapon_b/kris.jpg', { mode: 'phys', nameUk: 'Kris', pAtk: 205, speed: 433, crit: 80 }],
  [
    'weapon_b/guardian_sword.jpg',
    {
      mode: 'phys',
      nameUk: 'Guardian Sword',
      pAtk: 266,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_b/sword_of_damascus.jpg',
    {
      mode: 'phys',
      nameUk: 'Sword of Damascus',
      pAtk: 306,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_b/baguette_s_dualsword.jpg',
    {
      mode: 'phys',
      nameUk: "Baguette's Dualsword",
      pAtk: 312,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_b/art_of_battle_axe.jpg',
    {
      mode: 'phys',
      nameUk: 'Art of Battle Axe',
      pAtk: 342,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_b/deadman_s_glory.jpg',
    {
      mode: 'phys',
      nameUk: "Deadman's Glory",
      pAtk: 306,
      speed: 325,
      crit: 40,
    },
  ],
  ['weapon_b/great_axe.jpg', { mode: 'phys', nameUk: 'Great Axe', pAtk: 342, speed: 325, crit: 40 }],
  [
    'weapon_b/ice_storm_hammer.jpg',
    {
      mode: 'phys',
      nameUk: 'Ice Storm Hammer',
      pAtk: 306,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_b/star_buster.jpg',
    { mode: 'phys', nameUk: 'Star Buster', pAtk: 266, speed: 379, crit: 40 },
  ],
  [
    'weapon_b/great_sword.jpg',
    { mode: 'phys', nameUk: 'Great Sword', pAtk: 342, speed: 325, crit: 40 },
  ],
  [
    'weapon_b/arthro_nail.jpg',
    { mode: 'phys', nameUk: 'Arthro Nail', pAtk: 213, speed: 433, crit: 40 },
  ],
  [
    'weapon_b/bellion_cestus.jpg',
    {
      mode: 'phys',
      nameUk: 'Bellion Cestus',
      pAtk: 221,
      speed: 433,
      crit: 40,
    },
  ],
  ['weapon_b/lance.jpg', { mode: 'phys', nameUk: 'Lance', pAtk: 342, speed: 325, crit: 40 }],
  [
    'weapon_b/apprentices_spellbook.jpg',
    {
      mode: 'magic',
      nameUk: "Apprentice's Spellbook",
      mAtk: 160,
      speed: 379,
    },
  ],
  [
    'weapon_b/kaim_vanul_s_bones.jpg',
    {
      mode: 'magic',
      nameUk: "Kaim Vanul's Bones",
      mAtk: 176,
      speed: 379,
    },
  ],
  [
    'weapon_b/spell_breaker.jpg',
    { mode: 'magic', nameUk: 'Spell Breaker', mAtk: 203, speed: 379 },
  ],
  [
    'weapon_b/spirit_s_staff.jpg',
    { mode: 'magic', nameUk: "Spirit's Staff", mAtk: 236, speed: 325 },
  ],
  [
    'weapon_b/staff_of_evil_spirits.jpg',
    {
      mode: 'magic',
      nameUk: 'Staff of Evil Spirits',
      mAtk: 203,
      speed: 325,
    },
  ],
  [
    'weapon_b/sword_of_valhalla.jpg',
    {
      mode: 'magic',
      nameUk: 'Sword of Valhalla',
      mAtk: 220,
      speed: 379,
    },
  ],
  [
    'weapon_b/wizard_s_tear.jpg',
    { mode: 'magic', nameUk: "Wizard's Tear", mAtk: 236, speed: 379 },
  ],
];

export const L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  BWeaponDropsPatch
> = RAW.reduce((acc, [segment, patch]) => {
  acc[pathKey(segment)] = patch;
  return acc;
}, {} as Record<string, BWeaponDropsPatch>);

export function bGradeWeaponDropsPreviewLines(
  patch: BWeaponDropsPatch,
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
