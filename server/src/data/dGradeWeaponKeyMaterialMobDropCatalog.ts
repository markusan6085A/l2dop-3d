/**
 * Live drop/spoil/raid для D-grade weapon key materials (етап 3D.2).
 * Шанси — ймовірність 0–1 (1% = 0.01, 8% = 0.08, 11% = 0.11, 13% = 0.13).
 */

export type DGradeWeaponKeyMaterialSourceType =
  | 'normal_drop'
  | 'spoil'
  | 'raid_drop';

export interface DGradeWeaponKeyMaterialMobSource {
  sourceType: 'normal_drop' | 'spoil';
  npcId: number;
  mobNameEn: string;
  level: number;
  itemId: number;
  chance: number;
  minCount: 1;
  maxCount: 1;
  locationLabel: string;
}

export interface DGradeWeaponKeyMaterialRaidSource {
  sourceType: 'raid_drop';
  raidBossId: number;
  nameUk: string;
  level: number;
  itemId: number;
  chance: number;
  minCount: 1;
  maxCount: 2;
}

/** Звичайні моби: normal drop 1% + spoil 8%, qty = 1. */
export const D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES: readonly DGradeWeaponKeyMaterialMobSource[] =
  [
    {
      sourceType: 'normal_drop',
      npcId: 20269,
      mobNameEn: 'Breka Orc Shaman',
      level: 34,
      itemId: 4113,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: "Breka's Stronghold",
    },
    {
      sourceType: 'spoil',
      npcId: 20083,
      mobNameEn: 'Granite Golem',
      level: 33,
      itemId: 4113,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Dwarf Village / Mithril Mines',
    },
    {
      sourceType: 'normal_drop',
      npcId: 20271,
      mobNameEn: 'Breka Orc Warrior',
      level: 33,
      itemId: 4114,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: "Breka's Stronghold",
    },
    {
      sourceType: 'spoil',
      npcId: 20232,
      mobNameEn: 'Marsh Stakato Soldier',
      level: 33,
      itemId: 4114,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Cruma Marshlands',
    },
    {
      sourceType: 'normal_drop',
      npcId: 20934,
      mobNameEn: 'Wasp Worker',
      level: 35,
      itemId: 4116,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Bee Hive',
    },
    {
      sourceType: 'spoil',
      npcId: 20088,
      mobNameEn: 'Ant Warrior Captain',
      level: 36,
      itemId: 4116,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Ant Nest',
    },
    {
      sourceType: 'normal_drop',
      npcId: 20176,
      mobNameEn: 'Wyrm',
      level: 35,
      itemId: 4117,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: "Breka's Stronghold / Giran",
    },
    {
      sourceType: 'spoil',
      npcId: 20579,
      mobNameEn: 'Leto Lizardman Soldier',
      level: 37,
      itemId: 4117,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Plains of the Lizardman',
    },
    {
      sourceType: 'normal_drop',
      npcId: 20578,
      mobNameEn: 'Leto Lizardman Archer',
      level: 36,
      itemId: 4118,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Plains of the Lizardman',
    },
    {
      sourceType: 'spoil',
      npcId: 20230,
      mobNameEn: 'Marsh Stakato Worker',
      level: 31,
      itemId: 4118,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Cruma Marshlands',
    },
    {
      sourceType: 'normal_drop',
      npcId: 20600,
      mobNameEn: 'Karul Bugbear',
      level: 40,
      itemId: 4119,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Giran / Breka region',
    },
    {
      sourceType: 'spoil',
      npcId: 20234,
      mobNameEn: 'Marsh Stakato Drone',
      level: 35,
      itemId: 4119,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Cruma Marshlands',
    },
    {
      sourceType: 'normal_drop',
      npcId: 20791,
      mobNameEn: 'Crokian Warrior',
      level: 38,
      itemId: 4120,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Field of Whispers',
    },
    {
      sourceType: 'spoil',
      npcId: 20270,
      mobNameEn: 'Breka Orc Overlord',
      level: 35,
      itemId: 4120,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: "Breka's Stronghold",
    },
    {
      sourceType: 'normal_drop',
      npcId: 20513,
      mobNameEn: 'Skeleton Knight',
      level: 32,
      itemId: 4121,
      chance: 0.01,
      minCount: 1,
      maxCount: 1,
      locationLabel: 'Ruins of Despair',
    },
    {
      sourceType: 'spoil',
      npcId: 20552,
      mobNameEn: 'Fettered Soul',
      level: 38,
      itemId: 4121,
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
      locationLabel: "Breka's Stronghold / Giran",
    },
  ] as const;

/** Raid Boss 20–25: key material drop, qty 1–2. */
export const D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES: readonly DGradeWeaponKeyMaterialRaidSource[] =
  [
    {
      sourceType: 'raid_drop',
      raidBossId: 25372,
      nameUk: 'Відкинутий Страж',
      level: 20,
      itemId: 4113,
      chance: 0.11,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25378,
      nameUk: 'Звір Безумства',
      level: 20,
      itemId: 4113,
      chance: 0.11,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25375,
      nameUk: 'Повелитель Зомбі Фаракелсус',
      level: 20,
      itemId: 4114,
      chance: 0.11,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25357,
      nameUk: 'Ватажок Боягузливих Щуролюдів',
      level: 21,
      itemId: 4114,
      chance: 0.11,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25373,
      nameUk: 'Герольд Дагоніеля Малекс',
      level: 21,
      itemId: 4116,
      chance: 0.11,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25380,
      nameUk: 'Герольд Ікара Кайша',
      level: 21,
      itemId: 4116,
      chance: 0.11,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25146,
      nameUk: 'Змієдемон Біфронс',
      level: 21,
      itemId: 4117,
      chance: 0.11,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25362,
      nameUk: 'Ватажок Слідопитів Шарук',
      level: 23,
      itemId: 4117,
      chance: 0.13,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25366,
      nameUk: 'Жрець Куробороса',
      level: 23,
      itemId: 4118,
      chance: 0.13,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25001,
      nameUk: 'Кутус Сірий Кіготь',
      level: 23,
      itemId: 4118,
      chance: 0.13,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25060,
      nameUk: 'Відкинута Каель',
      level: 24,
      itemId: 4119,
      chance: 0.13,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25127,
      nameUk: 'Матріарх Лангк Рашкос',
      level: 24,
      itemId: 4119,
      chance: 0.13,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25166,
      nameUk: 'Ікунтай',
      level: 25,
      itemId: 4120,
      chance: 0.13,
      minCount: 1,
      maxCount: 2,
    },
    {
      sourceType: 'raid_drop',
      raidBossId: 25429,
      nameUk: 'Колекціонер Маммона Талос',
      level: 25,
      itemId: 4121,
      chance: 0.13,
      minCount: 1,
      maxCount: 2,
    },
  ] as const;

export const D_GRADE_WEAPON_KEY_MATERIAL_MOB_NPC_IDS: readonly number[] = [
  ...new Set(D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES.map((s) => s.npcId)),
].sort((a, b) => a - b);

export const D_GRADE_WEAPON_KEY_MATERIAL_RAID_BOSS_IDS: readonly number[] =
  D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES.map((s) => s.raidBossId);
