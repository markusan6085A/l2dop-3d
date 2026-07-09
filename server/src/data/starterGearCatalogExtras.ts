/**
 * Іконки та підписи стартового набору (NG Club, Rod, Devotion NG-броня) для GET /character gearCatalog.
 */
import type { GearCatalogRow } from './itemsCatalog.js';

export function starterGearCatalogExtras(): GearCatalogRow[] {
  return [
    {
      itemId: 4,
      nameUk: 'Club',
      iconUrl: '/icons/drops/weapon_ng/weapon_club_i00.png',
      slot: 'rhand',
      grade: 'NG',
      weaponType: 'blunt',
      stats: {
        pAtk: 25,
        mAtk: 18,
        atkSpd: 379,
        wpnCrit: 120,
        rCrit: 4,
      },
    },
    {
      itemId: 7,
      nameUk: 'Жезл недосвідченого NG-grade.',
      iconUrl: '/icons/drops/weapon_ng/weapon_apprentices_rod_i00.png',
      slot: 'rhand',
      grade: 'NG',
      weaponType: 'blunt',
      stats: {
        pAtk: 17,
        mAtk: 23,
        atkSpd: 379,
        wpnCrit: 120,
        rCrit: 4,
      },
    },
    {
      itemId: 9002261,
      nameUk: 'Devotion Helmet',
      iconUrl: '/icons/drops/arrom_ng/devotion_halmet.jpg',
      slot: 'head',
      grade: 'NG',
      armorType: 'magic',
      stats: { pDef: 12 },
    },
    {
      itemId: 9002263,
      nameUk: 'Tunic of devotion',
      iconUrl: '/icons/drops/arrom_ng/tunic of devotion.jpg',
      slot: 'chest',
      grade: 'NG',
      armorType: 'magic',
      stats: { pDef: 39 },
    },
    {
      itemId: 9002265,
      nameUk: 'Stockings of devotion',
      iconUrl: '/icons/drops/arrom_ng/stockings of devotion.jpg',
      slot: 'legs',
      grade: 'NG',
      armorType: 'magic',
      stats: { pDef: 23 },
    },
    {
      itemId: 9002267,
      nameUk: 'Devotion gloves',
      iconUrl: '/icons/drops/arrom_ng/devotion gloves.jpg',
      slot: 'gloves',
      grade: 'NG',
      armorType: 'magic',
      stats: { pDef: 4 },
    },
  ];
}
