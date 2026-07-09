/**
 * Околиці карти як у l2dop/map.php + around.php: найближче місто + типові моби з пулів l2dop (text-rpg).
 * Координати міст — map.php (рядки 948–968) + класичні L2 для Heine/Rune/Goddard/Schuttgart.
 */

export interface MapLocalityMob {
  name: string;
  level: number;
}

export interface MapTownRef {
  worldX: number;
  worldY: number;
  /** Підпис українською для гравця */
  labelUk: string;
  /** Назва англійською (телепорт, підписи як у L2). */
  labelEn: string;
  /** Пул мобів з L2DOP (cities.ts / зони) */
  cityId: string;
  /** Унікальний id для телепорту (POST /game/teleport). */
  teleportId: string;
}

/** Координати міст і прив’язка до пулу мобів l2dop. */
export const MAP_TOWNS: MapTownRef[] = [
  {
    worldX: 83400,
    worldY: 147943,
    labelUk: 'Місто Гіран',
    labelEn: 'Town of Giran',
    cityId: 'l2dop_giran',
    teleportId: 'giran',
  },
  {
    worldX: -12672,
    worldY: 122776,
    labelUk: 'Місто Глудіо',
    labelEn: 'Town of Gludio',
    cityId: 'l2dop_gludio',
    teleportId: 'gludio',
  },
  {
    worldX: 15670,
    worldY: 142983,
    labelUk: 'Місто Діон',
    labelEn: 'Town of Dion',
    cityId: 'l2dop_dion',
    teleportId: 'dion',
  },
  {
    worldX: 82956,
    worldY: 53162,
    labelUk: 'Місто Орен',
    labelEn: 'Town of Oren',
    cityId: 'l2dop_oren',
    teleportId: 'oren',
  },
  {
    worldX: 116819,
    worldY: 76994,
    labelUk: 'Селище мисливців',
    labelEn: "Hunter's Village",
    cityId: 'hunters_village',
    teleportId: 'hunters',
  },
  {
    worldX: 146331,
    worldY: 25762,
    labelUk: 'Місто Аден',
    labelEn: 'Town of Aden',
    cityId: 'l2dop_aden',
    teleportId: 'aden',
  },
  {
    worldX: 9745,
    worldY: 15606,
    labelUk: 'Селище темних ельфів',
    labelEn: 'Dark Elf Village',
    cityId: 'floran_village',
    teleportId: 'dark_elf_village',
  },
  {
    worldX: 115113,
    worldY: -178212,
    labelUk: 'Селище гномів',
    labelEn: 'Dwarven Village',
    cityId: 'l2dop_schuttgart',
    teleportId: 'dwarf_village',
  },
  {
    worldX: 46934,
    worldY: 51467,
    labelUk: 'Селище ельфів',
    labelEn: 'Elven Village',
    cityId: 'floran_village',
    teleportId: 'elf_village',
  },
  {
    worldX: -84318,
    worldY: 244579,
    labelUk: 'Говорящий Остров (TI)',
    labelEn: 'Talking Island Village',
    cityId: 'gludin_village',
    teleportId: 'talking_island',
  },
  {
    worldX: -80853,
    worldY: 149257,
    labelUk: 'Селище Глудін',
    labelEn: 'Gludin Village',
    cityId: 'gludin_village',
    teleportId: 'gludin',
  },
  {
    worldX: -44836,
    worldY: -112524,
    labelUk: 'Селище орків',
    labelEn: 'Orc Village',
    cityId: 'l2dop_gludio',
    teleportId: 'orc_village',
  },
  {
    worldX: 111409,
    worldY: 219364,
    labelUk: 'Гейне',
    labelEn: 'Heine',
    cityId: 'l2dop_heine',
    teleportId: 'heine',
  },
  {
    worldX: 44528,
    worldY: -51290,
    labelUk: 'Рун',
    labelEn: 'Rune Township',
    cityId: 'l2dop_rune',
    teleportId: 'rune',
  },
  {
    worldX: 148024,
    worldY: -55281,
    labelUk: 'Місто Годдарт',
    labelEn: 'Town of Goddard',
    cityId: 'l2dop_goddard',
    teleportId: 'goddard',
  },
  {
    worldX: 86846,
    worldY: -162538,
    labelUk: 'Місто Штутгарт',
    labelEn: 'Town of Schuttgart',
    cityId: 'l2dop_schuttgart',
    teleportId: 'schuttgart',
  },
  {
    worldX: 121896,
    worldY: 109736,
    labelUk: 'Поля стародавніх могил',
    labelEn: 'Ancient Tomb Fields',
    cityId: 'ancient_tomb_fields',
    teleportId: 'ancient_tomb_fields',
  },
  {
    worldX: 91628,
    worldY: -44879,
    labelUk: 'Академія Hardin',
    labelEn: "Hardin's Academy",
    cityId: 'l2dop_aden',
    teleportId: 'hardins_academy',
  },
  {
    worldX: 118518,
    worldY: 132829,
    labelUk: 'Некрополь Мучеників',
    labelEn: 'Necropolis of Martyrdom',
    cityId: 'l2dop_aden',
    teleportId: 'necropolis_of_martyrdom',
  },
  {
    worldX: 139976,
    worldY: 79704,
    labelUk: 'Катакомби Відьми',
    labelEn: 'Catacomb of the Witch',
    cityId: 'l2dop_giran',
    teleportId: 'catacomb_of_the_witch',
  },
  {
    worldX: 6432,
    worldY: 35745,
    labelUk: 'Море спор',
    labelEn: 'Sea of Spores',
    cityId: 'l2dop_oren',
    teleportId: 'sea_of_spores',
  },
];

export function getTeleportDestination(
  teleportId: string
): MapTownRef | undefined {
  const id = String(teleportId || '').trim();
  if (!id) return undefined;
  return MAP_TOWNS.find((t) => t.teleportId === id);
}

/** Найближча точка з `MAP_TOWNS` до координат світу (евклідова відстань). */
export function nearestMapTown(worldX: number, worldY: number): MapTownRef {
  let best = MAP_TOWNS[0];
  let bestD = Infinity;
  for (const t of MAP_TOWNS) {
    const dx = t.worldX - worldX;
    const dy = t.worldY - worldY;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

/**
 * Представники пулів XML/text-rpg (імена як у грі; рівні орієнтовні).
 * Не дублюємо сотні спавнів — лише «хто водиться в околицях» для списку як у around.php.
 */
const MOBS_BY_CITY: Record<string, MapLocalityMob[]> = {
  l2dop_giran: [
    { name: 'Monster Eye Destroyer', level: 26 },
    { name: 'Selu Lizardman Scout', level: 26 },
    { name: 'Skeleton Royal Guard', level: 26 },
    { name: 'Ol Mahum Guerilla', level: 30 },
    { name: 'Gray Ant', level: 28 },
    { name: 'Dead Pit Spartoi', level: 32 },
    { name: 'Grim Grizzly', level: 35 },
    { name: 'Lesser Basilisk', level: 34 },
    { name: 'Turek Orc Footman', level: 30 },
    { name: 'Gargoyle', level: 36 },
    { name: 'Ol Mahum Raider', level: 32 },
    { name: 'Glass Jaguar', level: 38 },
    { name: 'Kuran Kobold', level: 27 },
    { name: 'Lafi Lizardman', level: 29 },
  ],
  /** Імена як у l2dop/lineage.sql (npc.name), щоб збігався npcid з дропом/EXP */
  l2dop_gludio: [
    { name: 'Молодой Шакал', level: 1 },
    { name: 'Бородатый Шакал', level: 1 },
    { name: 'Волк', level: 4 },
    { name: 'Молодой Лис', level: 1 },
    { name: 'Матерый Бурый Шакал', level: 3 },
    { name: 'Орк Стрелок', level: 8 },
    { name: 'Гоблин', level: 5 },
    { name: 'Гризли', level: 17 },
    { name: 'Орк Воитель', level: 7 },
    { name: 'Змей', level: 35 },
    { name: 'Жалящая Оса', level: 30 },
    { name: 'Когтистый Паук', level: 16 },
  ],
  l2dop_dion: [
    { name: 'Basilisk', level: 25 },
    { name: 'Ol Mahum Legionnaire', level: 28 },
    { name: 'Neer Crawler', level: 26 },
    { name: 'Giant Crimson Ant', level: 30 },
    { name: 'Skeleton Axeman', level: 29 },
    { name: 'Turek Orc Skirmisher', level: 31 },
    { name: 'Kuran Kobold Warrior', level: 28 },
    { name: 'Lafi Lizardman Scout', level: 26 },
    { name: 'Talakin Archer', level: 32 },
    { name: 'Maille Lizardman Shaman', level: 30 },
    { name: 'Ol Mahum Marksman', level: 29 },
  ],
  l2dop_oren: [
    { name: 'Turek Orc Warlord', level: 18 },
    { name: 'Ant Larva', level: 16 },
    { name: 'Ant Captain', level: 20 },
    { name: 'Ant Warrior', level: 19 },
    { name: 'Marsh Stakato Drone', level: 22 },
    { name: 'Marsh Stakato Soldier', level: 24 },
    { name: 'Crimson Spider', level: 21 },
    { name: 'Pincer Spider', level: 23 },
    { name: 'Ol Mahum Support', level: 20 },
    { name: 'Ol Mahum Raider', level: 22 },
    { name: 'Lesser Dark Horror', level: 25 },
    { name: 'Dark Horror', level: 27 },
  ],
  hunters_village: [
    { name: 'Crimson Spider', level: 40 },
    { name: 'Plunder Tarantula', level: 42 },
    { name: 'Hunter Gargoyle', level: 44 },
    { name: 'Breka Orc Overlord', level: 43 },
    { name: 'Breka Orc Shaman', level: 41 },
    { name: 'Fettered Soul', level: 45 },
    { name: 'Windsus', level: 40 },
    { name: 'Taik Orc Supply', level: 42 },
    { name: 'Taik Orc Captain', level: 44 },
    { name: 'Marsh Predator', level: 43 },
    { name: 'Hunter Bear', level: 41 },
    { name: 'Kronbe Spider', level: 46 },
  ],
  l2dop_aden: [
    { name: 'Cave Servant Archer', level: 40 },
    { name: 'Cave Servant Warrior', level: 42 },
    { name: 'Cave Servant Captain', level: 44 },
    { name: 'Cave Keeper', level: 46 },
    { name: 'Royal Cave Servant', level: 48 },
    { name: 'Cave Maiden', level: 50 },
    { name: 'Headless Knight', level: 52 },
    { name: 'Dustwind Gargoyle', level: 54 },
    { name: 'Blazing Ifrit', level: 56 },
    { name: 'Bloody Priest', level: 58 },
    { name: 'Taik Orc Supply', level: 44 },
    { name: 'Taik Orc Captain', level: 46 },
    { name: 'Crimson Drake', level: 50 },
    { name: 'Drake', level: 48 },
  ],
  floran_village: [
    { name: 'Young Red Keltir', level: 5 },
    { name: 'Red Keltir', level: 7 },
    { name: 'Elder Red Keltir', level: 9 },
    { name: 'Goblin Raider', level: 8 },
    { name: 'Goblin Scout', level: 6 },
    { name: 'Goblin Fighter', level: 7 },
    { name: 'Dryad', level: 10 },
    { name: 'Green Dryad', level: 11 },
    { name: 'Arachnid Predator', level: 12 },
    { name: 'Hook Spider', level: 10 },
    { name: 'Lesser Dark Horror', level: 14 },
    { name: 'Skeleton Marksman', level: 13 },
  ],
  l2dop_schuttgart: [
    { name: 'Snow Lynx', level: 55 },
    { name: 'Lost Buffalo', level: 56 },
    { name: 'Ursus Cub', level: 54 },
    { name: 'Ursus', level: 58 },
    { name: 'Frost Yeti', level: 57 },
    { name: 'Alpen Kookaburra', level: 59 },
    { name: 'Alpen Cougar', level: 60 },
    { name: 'Frost Buffalo', level: 58 },
    { name: 'Lost Yeti', level: 59 },
    { name: 'Hoarfrost Yeti', level: 61 },
    { name: 'Frost Iron Golem', level: 62 },
    { name: 'Ice Giant', level: 63 },
  ],
  gludin_village: [
    { name: 'Goblin Raider', level: 4 },
    { name: 'Goblin Scout', level: 3 },
    { name: 'Goblin Fighter', level: 5 },
    { name: 'Vuku Orc', level: 6 },
    { name: 'Vuku Orc Archer', level: 7 },
    { name: 'Rakeclaw Imp', level: 8 },
    { name: 'Imp Elder', level: 9 },
    { name: 'Ol Mahum Raider', level: 10 },
    { name: 'Ol Mahum Sniper', level: 11 },
    { name: 'Ol Mahum Lookout', level: 10 },
    { name: 'Lesser Basilisk', level: 12 },
    { name: 'Basilisk', level: 13 },
  ],
  l2dop_heine: [
    { name: 'Coral Golem', level: 44 },
    { name: 'Shark', level: 42 },
    { name: 'Doll Blader', level: 46 },
    { name: 'Crokian Lad', level: 45 },
    { name: 'Crokian Warrior', level: 47 },
    { name: 'Farhite', level: 43 },
    { name: 'Crokian Lad Warrior', level: 48 },
    { name: 'Trives', level: 46 },
    { name: 'Crokian', level: 49 },
    { name: 'Crokian Warrior Captain', level: 50 },
    { name: 'Trives Chief', level: 51 },
    { name: 'Crokian Chief', level: 52 },
  ],
  l2dop_rune: [
    { name: 'Ice Tarantula', level: 58 },
    { name: 'Frost Tarantula', level: 59 },
    { name: 'Frost Tarantula Soldier', level: 60 },
    { name: 'Frost Buffalo', level: 57 },
    { name: 'Lost Buffalo', level: 56 },
    { name: 'Alpen Cougar', level: 61 },
    { name: 'Alpen Kookaburra', level: 60 },
    { name: 'Hoarfrost Yeti', level: 62 },
    { name: 'Frost Yeti', level: 58 },
    { name: 'Ice Giant', level: 63 },
    { name: 'Frost Iron Golem', level: 62 },
    { name: 'Ursus', level: 58 },
  ],
  /** Околиці Годдарта: поля + гарячі джерела / Кетра (як у text-rpg goddardMobs.generated.ts). */
  l2dop_goddard: [
    { name: 'Buffalo Slave', level: 52 },
    { name: 'Buffalo Slave Leader', level: 54 },
    { name: 'Grazing Antelope', level: 50 },
    { name: 'Antelope', level: 51 },
    { name: 'Antelope Slayer', level: 53 },
    { name: 'Kookaburra', level: 55 },
    { name: 'Cougar', level: 56 },
    { name: 'Grendel', level: 57 },
    { name: 'Yeti', level: 58 },
    { name: 'Yeti Shaman', level: 59 },
    { name: 'Frost Yeti', level: 60 },
    { name: 'Iron Golem', level: 61 },
    { name: 'Hot Springs Bandersnatchling', level: 73 },
    { name: 'Hot Springs Buffalo', level: 73 },
    { name: 'Hot Springs Flava', level: 74 },
    { name: 'Hot Springs Atroxspawn', level: 74 },
    { name: 'Hot Springs Antelope', level: 74 },
    { name: 'Hot Springs Nepenthes', level: 75 },
    { name: 'Hot Springs Yeti', level: 75 },
    { name: 'Hot Springs Atrox', level: 76 },
    { name: 'Hot Springs Bandersnatch', level: 76 },
    { name: 'Hot Springs Grendel', level: 76 },
    { name: 'Ketra Orc Footman', level: 77 },
    { name: "Ketra's War Hound", level: 77 },
    { name: 'Grazing Kookaburra', level: 77 },
    { name: 'Ketra Orc Raider', level: 78 },
    { name: 'Ketra Orc Scout', level: 78 },
    { name: 'Ketra Orc Shaman', level: 79 },
    { name: 'Grazing Buffalo', level: 79 },
    { name: 'Ketra Orc Warrior', level: 80 },
    { name: 'Ketra Orc Lieutenant', level: 80 },
    { name: 'Grazing Windsus', level: 80 },
    { name: 'Ketra Orc Medium', level: 80 },
    { name: 'Ketra Orc Elite Soldier', level: 80 },
  ],
  ancient_tomb_fields: [
    { name: 'Tomb Raider', level: 48 },
    { name: 'Tomb Guardian', level: 50 },
    { name: 'Tomb Sage', level: 52 },
    { name: 'Grave Scarab', level: 49 },
    { name: 'Grave Ant', level: 51 },
    { name: 'Bone Snatcher', level: 47 },
    { name: 'Bone Scavenger', level: 50 },
    { name: 'Bone Scorpion', level: 53 },
    { name: 'Bone Soldier', level: 52 },
    { name: 'Bone Knight', level: 54 },
    { name: 'Bone Warlord', level: 55 },
    { name: 'Bone Archer', level: 51 },
  ],
};

/** Пул імен для генерації світових спавнів на карті (mapWorldSpawns). */
export function mobPoolForCity(cityId: string): MapLocalityMob[] {
  return MOBS_BY_CITY[cityId] ?? MOBS_BY_CITY.l2dop_gludio!;
}

export function resolveMapLocality(worldX: number, worldY: number): {
  nearestLabelUk: string;
  cityId: string;
  distance: number;
  mobs: MapLocalityMob[];
} {
  let best = MAP_TOWNS[0]!;
  let bestD = Infinity;
  for (const t of MAP_TOWNS) {
    const dx = worldX - t.worldX;
    const dy = worldY - t.worldY;
    const d = Math.hypot(dx, dy);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  const mobs = MOBS_BY_CITY[best.cityId] ?? MOBS_BY_CITY.l2dop_gludio!;
  return {
    nearestLabelUk: best.labelUk,
    cityId: best.cityId,
    distance: Math.round(bestD),
    mobs,
  };
}
