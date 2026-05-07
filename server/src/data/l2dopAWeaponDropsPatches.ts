/**
 * A-grade зброя в магазині дропів (`weapon_a/…`).
 * Назви та базові стати як у таблиці автора (база Lineage 2).
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';

export type AWeaponDropsPatch = APhysWeaponPatch | AMagicWeaponPatch;

export interface APhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface AMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function pathKey(segment: string): string {
  return segment.replace(/\\/g, '/').toLowerCase();
}

const RAW: Array<[string, AWeaponDropsPatch]> = [
  [
    'weapon_a/carnage_bow.jpg',
    { mode: 'phys', nameUk: 'Carnage Bow', pAtk: 699, speed: 293, crit: 120 },
  ],
  [
    'weapon_a/shyeed_s_bow.jpg',
    { mode: 'phys', nameUk: "Shyeed's Bow", pAtk: 699, speed: 293, crit: 120 },
  ],
  [
    'weapon_a/soul_bow.jpg',
    { mode: 'phys', nameUk: 'Soul Bow', pAtk: 770, speed: 293, crit: 120 },
  ],
  [
    'weapon_a/blood_tornado.jpg',
    { mode: 'phys', nameUk: 'Blood Tornado', pAtk: 284, speed: 433, crit: 80 },
  ],
  [
    'weapon_a/bloody_orchid.jpg',
    {
      mode: 'phys',
      nameUk: 'Bloody Orchid',
      pAtk: 293,
      speed: 433,
      crit: 80,
    },
  ],
  [
    'weapon_a/naga_storm.jpg',
    { mode: 'phys', nameUk: 'Naga Storm', pAtk: 306, speed: 433, crit: 80 },
  ],
  [
    'weapon_a/dark_legion_s_edge.jpg',
    {
      mode: 'phys',
      nameUk: "Dark Legion's Edge",
      pAtk: 385,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_a/tallum_blade.jpg',
    { mode: 'phys', nameUk: 'Tallum Blade', pAtk: 370, speed: 379, crit: 40 },
  ],
  [
    'weapon_a/sword_of_ipos.jpg',
    { mode: 'phys', nameUk: 'Sword of Ipos', pAtk: 370, speed: 379, crit: 40 },
  ],
  [
    'weapon_a/baguette_s_dualsword.jpg',
    {
      mode: 'phys',
      nameUk: "Baguette's Dualsword",
      pAtk: 402,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_a/barakiel_s_axe.jpg',
    {
      mode: 'phys',
      nameUk: "Barakiel's Axe",
      pAtk: 460,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_a/elysian.jpg',
    { mode: 'phys', nameUk: 'Elysian', pAtk: 460, speed: 325, crit: 40 },
  ],
  [
    'weapon_a/infernal_master.jpg',
    {
      mode: 'phys',
      nameUk: 'Infernal Master',
      pAtk: 420,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_a/meteor_shower.jpg',
    {
      mode: 'phys',
      nameUk: 'Meteor Shower',
      pAtk: 385,
      speed: 379,
      crit: 40,
    },
  ],
  [
    'weapon_a/sobekk_s_hurricane.jpg',
    {
      mode: 'phys',
      nameUk: "Sobekk's Hurricane",
      pAtk: 420,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_a/dragon_slayer.jpg',
    {
      mode: 'phys',
      nameUk: 'Dragon Slayer',
      pAtk: 460,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_a/dragon_grinder.jpg',
    {
      mode: 'phys',
      nameUk: 'Dragon Grinder',
      pAtk: 306,
      speed: 433,
      crit: 40,
    },
  ],
  [
    'weapon_a/halberd.jpg',
    { mode: 'phys', nameUk: 'Halberd', pAtk: 460, speed: 325, crit: 40 },
  ],
  [
    'weapon_a/tallum_glaive.jpg',
    {
      mode: 'phys',
      nameUk: 'Tallum Glaive',
      pAtk: 420,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_a/tiphon_s_spear.jpg',
    {
      mode: 'phys',
      nameUk: "Tiphon's Spear",
      pAtk: 460,
      speed: 325,
      crit: 40,
    },
  ],
  [
    'weapon_a/apprentices_spellbook.jpg',
    {
      mode: 'magic',
      nameUk: "Apprentice's Spellbook",
      mAtk: 260,
      speed: 379,
    },
  ],
  [
    'weapon_a/behemoth_s_tuning_fork.jpg',
    {
      mode: 'magic',
      nameUk: "Behemoth's Tuning Fork",
      mAtk: 280,
      speed: 379,
    },
  ],
  [
    'weapon_a/branch_of_the_mother_tree.jpg',
    {
      mode: 'magic',
      nameUk: 'Branch of the Mother Tree',
      mAtk: 260,
      speed: 379,
    },
  ],
  [
    'weapon_a/daimon_crystal.jpg',
    { mode: 'magic', nameUk: 'Daimon Crystal', mAtk: 310, speed: 379 },
  ],
  [
    'weapon_a/dasparion_s_staff.jpg',
    {
      mode: 'magic',
      nameUk: "Dasparion's Staff",
      mAtk: 340,
      speed: 325,
    },
  ],
  [
    'weapon_a/spiritual_eye.jpg',
    { mode: 'magic', nameUk: 'Spiritual Eye', mAtk: 300, speed: 379 },
  ],
  [
    'weapon_a/sword_of_miracles.jpg',
    {
      mode: 'magic',
      nameUk: 'Sword of Miracles',
      mAtk: 340,
      speed: 379,
    },
  ],
  [
    'weapon_a/themis_tongue.jpg',
    { mode: 'magic', nameUk: "Themis' Tongue", mAtk: 310, speed: 379 },
  ],
  [
    'weapon_a/soul_separator.jpg',
    {
      mode: 'phys',
      nameUk: 'Soul Separator',
      pAtk: 306,
      speed: 433,
      crit: 80,
    },
  ],
  [
    'weapon_a/sirra_s_blade.jpg',
    {
      mode: 'phys',
      nameUk: "Sirra's Blade",
      pAtk: 370,
      speed: 379,
      crit: 40,
    },
  ],
];

export const L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  AWeaponDropsPatch
> = RAW.reduce((acc, [segment, patch]) => {
  acc[pathKey(segment)] = patch;
  return acc;
}, {} as Record<string, AWeaponDropsPatch>);

export function aGradeWeaponDropsPreviewLines(
  patch: AWeaponDropsPatch,
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
