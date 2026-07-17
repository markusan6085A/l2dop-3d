/**
 * Некрополі, де кочується Торговець Маммона (Seven Signs, Interlude).
 * Координати входів — l2tools Interlude (world X/Y).
 */

export interface MammonMerchantNecropolis {
  id: string;
  labelEn: string;
  labelUk: string;
  worldX: number;
  worldY: number;
}

/** Порядок ротації: кожні 4 год — наступний некрополь. */
export const MAMMON_MERCHANT_NECROPOLISES: MammonMerchantNecropolis[] = [
  {
    id: 'necropolis_of_sacrifice',
    labelEn: 'Necropolis of Sacrifice',
    labelUk: 'Некрополь жертвопринесень',
    worldX: -41184,
    worldY: 206752,
  },
  {
    id: 'pilgrims_necropolis',
    labelEn: "The Pilgrim's Necropolis",
    labelUk: 'Некрополь паломників',
    worldX: 45600,
    worldY: 126944,
  },
  {
    id: 'necropolis_of_worship',
    labelEn: 'Necropolis of Worship',
    labelUk: 'Некрополь поклоніння',
    worldX: 107514,
    worldY: 174329,
  },
  {
    id: 'patriots_necropolis',
    labelEn: "The Patriot's Necropolis",
    labelUk: 'Некрополь патріотів',
    worldX: -25472,
    worldY: 77728,
  },
  {
    id: 'necropolis_of_devotion',
    labelEn: 'Necropolis of Devotion',
    labelUk: 'Некрополь відданості',
    worldX: -56064,
    worldY: 78720,
  },
  {
    id: 'necropolis_of_martyrdom',
    labelEn: 'Necropolis of Martyrdom',
    labelUk: 'Некрополь мучеників',
    worldX: 114496,
    worldY: 132416,
  },
  {
    id: 'saints_necropolis',
    labelEn: "The Saint's Necropolis",
    labelUk: 'Некрополь святих',
    worldX: 79296,
    worldY: 209584,
  },
  {
    id: 'disciples_necropolis',
    labelEn: "The Disciple's Necropolis",
    labelUk: 'Некрополь учнів',
    worldX: 168560,
    worldY: -17968,
  },
];

export const MAMMON_MERCHANT_L2_NPC_ID = 31113;
