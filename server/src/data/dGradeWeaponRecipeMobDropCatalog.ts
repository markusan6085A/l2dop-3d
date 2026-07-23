/**
 * Retail Interlude drop/spoil для D-grade weapon recipe scrolls (921001–921008).
 * Шанси — у відсотках (0.04997 = 0.04997%).
 */
export type DGradeWeaponRecipeDropChannel = 'drop' | 'spoil';

export interface DGradeWeaponRecipeMobSource {
  npcId: number;
  /** Довідкове EN-ім'я з Interlude retail. */
  mobNameEn: string;
  level: number;
  itemId: number;
  channel: DGradeWeaponRecipeDropChannel;
  /** Шанс у відсотках (Interlude retail x1). */
  chancePercent: number;
}

/** Усі джерела рецептів D-grade зброї (етап 3C). */
export const D_GRADE_WEAPON_RECIPE_MOB_SOURCES: readonly DGradeWeaponRecipeMobSource[] = [
  // —— 921001 Bonebreaker ——
  { npcId: 20779, mobNameEn: 'Ragna Orc Seer', level: 39, itemId: 921001, channel: 'drop', chancePercent: 0.04997 },
  { npcId: 20135, mobNameEn: 'Alligator', level: 40, itemId: 921001, channel: 'drop', chancePercent: 0.03835 },
  { npcId: 20193, mobNameEn: 'Tyrant Kingpin', level: 36, itemId: 921001, channel: 'drop', chancePercent: 0.03208 },
  { npcId: 20931, mobNameEn: 'Hatu Onyx Beast', level: 36, itemId: 921001, channel: 'drop', chancePercent: 0.02044 },
  { npcId: 21014, mobNameEn: 'Lesser Warlike Tyrant', level: 33, itemId: 921001, channel: 'drop', chancePercent: 0.03914 },
  { npcId: 20269, mobNameEn: 'Breka Orc Shaman', level: 34, itemId: 921001, channel: 'drop', chancePercent: 0.02466 },
  { npcId: 20786, mobNameEn: 'Lienrik', level: 39, itemId: 921001, channel: 'drop', chancePercent: 0.01405 },
  { npcId: 21644, mobNameEn: 'Lienrik', level: 39, itemId: 921001, channel: 'drop', chancePercent: 0.01405 },
  { npcId: 20176, mobNameEn: 'Wyrm', level: 35, itemId: 921001, channel: 'drop', chancePercent: 0.03038 },
  { npcId: 20213, mobNameEn: 'Porta', level: 40, itemId: 921001, channel: 'drop', chancePercent: 0.1205 },
  { npcId: 20600, mobNameEn: 'Karul Bugbear', level: 40, itemId: 921001, channel: 'drop', chancePercent: 0.05167 },
  { npcId: 20630, mobNameEn: 'Taik Orc', level: 40, itemId: 921001, channel: 'drop', chancePercent: 0.0376 },
  { npcId: 20083, mobNameEn: 'Granite Golem', level: 33, itemId: 921001, channel: 'drop', chancePercent: 0.02629 },
  { npcId: 20579, mobNameEn: 'Leto Lizardman Soldier', level: 37, itemId: 921001, channel: 'drop', chancePercent: 0.03283 },

  // —— 921002 Claymore ——
  { npcId: 20552, mobNameEn: 'Fettered Soul', level: 38, itemId: 921002, channel: 'drop', chancePercent: 0.08079 },
  { npcId: 20553, mobNameEn: 'Windsus', level: 39, itemId: 921002, channel: 'drop', chancePercent: 0.04163 },
  { npcId: 21642, mobNameEn: 'Tasaba Lizardman Sniper', level: 39, itemId: 921002, channel: 'drop', chancePercent: 0.03072 },
  { npcId: 21643, mobNameEn: 'Tasaba Lizardman Sniper', level: 39, itemId: 921002, channel: 'drop', chancePercent: 0.03903 },

  // —— 921003 Elven Long Sword ——
  { npcId: 20934, mobNameEn: 'Wasp Worker', level: 35, itemId: 921003, channel: 'drop', chancePercent: 0.01934 },
  { npcId: 20087, mobNameEn: 'Ant Soldier', level: 35, itemId: 921003, channel: 'drop', chancePercent: 0.05209 },
  { npcId: 20582, mobNameEn: 'Leto Lizardman Overlord', level: 40, itemId: 921003, channel: 'drop', chancePercent: 0.07132 },
  { npcId: 20791, mobNameEn: 'Crokian Warrior', level: 38, itemId: 921003, channel: 'drop', chancePercent: 0.07133 },

  // —— 921004 Glaive ——
  { npcId: 20788, mobNameEn: 'Rakul', level: 35, itemId: 921004, channel: 'drop', chancePercent: 0.03102 },
  { npcId: 20581, mobNameEn: 'Leto Lizardman Shaman', level: 39, itemId: 921004, channel: 'drop', chancePercent: 0.02776 },
  { npcId: 20271, mobNameEn: 'Breka Orc Warrior', level: 33, itemId: 921004, channel: 'drop', chancePercent: 0.02839 },
  { npcId: 20085, mobNameEn: 'Puncher', level: 34, itemId: 921004, channel: 'drop', chancePercent: 0.03772 },
  { npcId: 21016, mobNameEn: 'Warlike Tyrant', level: 35, itemId: 921004, channel: 'drop', chancePercent: 0.03664 },

  // —— 921005 Light Crossbow — spoil only ——
  { npcId: 20213, mobNameEn: 'Porta', level: 40, itemId: 921005, channel: 'spoil', chancePercent: 1.864 },

  // —— 921006 Mithril Dagger ——
  { npcId: 20779, mobNameEn: 'Ragna Orc Seer', level: 39, itemId: 921006, channel: 'drop', chancePercent: 0.04995 },
  { npcId: 20213, mobNameEn: 'Porta', level: 40, itemId: 921006, channel: 'drop', chancePercent: 0.1205 },
  { npcId: 20778, mobNameEn: 'Ragna Orc Overlord', level: 39, itemId: 921006, channel: 'spoil', chancePercent: 0.5412 },

  // —— 921007 Scallop Jamadhr — spoil only ——
  { npcId: 20630, mobNameEn: 'Taik Orc', level: 40, itemId: 921007, channel: 'spoil', chancePercent: 0.5091 },

  // —— 921008 Staff of Life ——
  { npcId: 20778, mobNameEn: 'Ragna Orc Overlord', level: 39, itemId: 921008, channel: 'drop', chancePercent: 0.04662 },
  { npcId: 20790, mobNameEn: 'Dailaon', level: 37, itemId: 921008, channel: 'drop', chancePercent: 0.02906 },
] as const;

export const D_GRADE_WEAPON_RECIPE_MOB_NPC_IDS: readonly number[] = [
  ...new Set(D_GRADE_WEAPON_RECIPE_MOB_SOURCES.map((s) => s.npcId)),
].sort((a, b) => a - b);
