/**
 * Катакомби, де кочується Коваль Маммона (Seven Signs, Interlude).
 * Координати входів — l2tools Interlude (world X/Y).
 */

export interface MammonBlacksmithCatacomb {
  id: string;
  labelEn: string;
  labelUk: string;
  worldX: number;
  worldY: number;
}

/** Порядок ротації: кожні 4 год — наступні катакомби. */
export const MAMMON_BLACKSMITH_CATACOMBS: MammonBlacksmithCatacomb[] = [
  {
    id: 'catacomb_of_the_heretic',
    labelEn: 'Catacomb of the Heretic',
    labelUk: 'Катакомби єретиків',
    worldX: 39232,
    worldY: 143568,
  },
  {
    id: 'catacomb_of_the_branded',
    labelEn: 'Catacomb of the Branded',
    labelUk: 'Катакомби клеймених',
    worldX: 43200,
    worldY: 170688,
  },
  {
    id: 'catacomb_of_the_apostate',
    labelEn: 'Catacomb of the Apostate',
    labelUk: 'Катакомби відступників',
    worldX: 74672,
    worldY: 78032,
  },
  {
    id: 'catacomb_of_the_witch',
    labelEn: 'Catacomb of the Witch',
    labelUk: 'Катакомби відьми',
    worldX: 136672,
    worldY: 79328,
  },
  {
    id: 'catacomb_of_dark_omens',
    labelEn: 'Catacomb of Dark Omens',
    labelUk: 'Катакомби темних знамен',
    worldX: -22480,
    worldY: 13872,
  },
  {
    id: 'catacomb_of_the_forbidden_path',
    labelEn: 'Catacomb of the Forbidden Path',
    labelUk: 'Катакомби забороненого шляху',
    worldX: 110912,
    worldY: 84912,
  },
];

export const MAMMON_BLACKSMITH_L2_NPC_ID = 31126;
