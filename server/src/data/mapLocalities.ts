/**
 * Околиці карти як у l2dop/map.php + around.php: найближча зона телепорту + типові моби з пулів l2dop.
 * Координати міст — map.php (рядки 948–968) + класичні L2 для Heine/Rune/Goddard/Schuttgart.
 */

import {
  mobPoolForCity,
  mobPoolForTeleport,
  registerMapTownsProvider,
} from './mapTeleportMobPools.js';

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
  /** Вартість телепорту в адені (після 40 рівня); якщо немає — 1. */
  adenaCost?: number;
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
    adenaCost: 10000,
  },
  {
    worldX: 47805,
    worldY: 186628,
    labelUk: 'Гавань Гірана',
    labelEn: 'Giran Harbor',
    cityId: 'l2dop_giran',
    teleportId: 'giran_harbor',
    adenaCost: 2500,
  },
  {
    worldX: 95887,
    worldY: 112199,
    labelUk: 'Долина Драконів',
    labelEn: 'Dragon Valley',
    cityId: 'l2dop_giran',
    teleportId: 'dragon_valley',
    adenaCost: 5000,
  },
  {
    worldX: 132938,
    worldY: 114419,
    labelUk: 'Лігво Антараса',
    labelEn: "Antharas' Lair",
    cityId: 'l2dop_giran',
    teleportId: 'antharas_lair',
    adenaCost: 8000,
  },
  {
    worldX: 43988,
    worldY: 206797,
    labelUk: 'Острів Диявола',
    labelEn: "Devil's Isle",
    cityId: 'l2dop_giran',
    teleportId: 'devils_isle',
    adenaCost: 4500,
  },
  {
    worldX: 85567,
    worldY: 131286,
    labelUk: 'Оплот Бреки',
    labelEn: "Breka's Stronghold",
    cityId: 'l2dop_giran',
    teleportId: 'brekas_stronghold',
    adenaCost: 3500,
  },
  {
    worldX: -12672,
    worldY: 122776,
    labelUk: 'Місто Глудіо',
    labelEn: 'Town of Gludio',
    cityId: 'l2dop_gludio',
    teleportId: 'gludio',
    adenaCost: 3000,
  },
  {
    worldX: -42424,
    worldY: 120391,
    labelUk: 'Руїни Скорботи',
    labelEn: 'Ruins of Agony',
    cityId: 'l2dop_gludio',
    teleportId: 'ruins_of_agony',
    adenaCost: 900,
  },
  {
    worldX: -20342,
    worldY: 137576,
    labelUk: 'Руїни Відчаю',
    labelEn: 'Ruins of Despair',
    cityId: 'l2dop_gludio',
    teleportId: 'ruins_of_despair',
    adenaCost: 1100,
  },
  {
    worldX: -10014,
    worldY: 175759,
    labelUk: 'Муравине гніздо',
    labelEn: 'The Ant Nest',
    cityId: 'l2dop_gludio',
    teleportId: 'ant_nest',
    adenaCost: 1600,
  },
  {
    worldX: -31778,
    worldY: 166512,
    labelUk: 'Особняк Віндавуд',
    labelEn: 'Windawood Manor',
    cityId: 'l2dop_gludio',
    teleportId: 'windawood_manor',
    adenaCost: 1300,
  },
  {
    worldX: 15670,
    worldY: 142983,
    labelUk: 'Місто Діон',
    labelEn: 'Town of Dion',
    cityId: 'l2dop_dion',
    teleportId: 'dion',
    adenaCost: 8000,
  },
  {
    worldX: 6040,
    worldY: 125713,
    labelUk: 'Болота Круми',
    labelEn: 'Cruma Marshlands',
    cityId: 'l2dop_dion',
    teleportId: 'cruma_marshlands',
    adenaCost: 4500,
  },
  {
    worldX: 17192,
    worldY: 114178,
    labelUk: 'Вежа Круми',
    labelEn: 'Cruma Tower',
    cityId: 'l2dop_dion',
    teleportId: 'cruma_tower',
    adenaCost: 6500,
  },
  {
    worldX: 45671,
    worldY: 110013,
    labelUk: 'Фортеця Опору',
    labelEn: 'Fortress of Resistance',
    cityId: 'l2dop_dion',
    teleportId: 'fortress_of_resistance',
    adenaCost: 4800,
  },
  {
    worldX: 6403,
    worldY: 177517,
    labelUk: 'Рівнини Діона',
    labelEn: 'Plains of Dion',
    cityId: 'l2dop_dion',
    teleportId: 'plains_of_dion',
    adenaCost: 5800,
  },
  {
    worldX: 26736,
    worldY: 191970,
    labelUk: 'Бджолине гніздо',
    labelEn: 'Bee Hive',
    cityId: 'l2dop_dion',
    teleportId: 'bee_hive',
    adenaCost: 3200,
  },
  {
    worldX: 62728,
    worldY: 163396,
    labelUk: 'Каньйон Танор',
    labelEn: 'Tanor Canyon',
    cityId: 'l2dop_dion',
    teleportId: 'tanor_canyon',
    adenaCost: 2000,
  },
  {
    worldX: 82956,
    worldY: 53162,
    labelUk: 'Місто Орен',
    labelEn: 'Town of Oren',
    cityId: 'l2dop_oren',
    teleportId: 'oren',
    adenaCost: 12000,
  },
  {
    worldX: 85300,
    worldY: 16202,
    labelUk: 'Вежа Слонової Кістки',
    labelEn: 'Ivory Tower',
    cityId: 'l2dop_oren',
    teleportId: 'ivory_tower',
    adenaCost: 5000,
  },
  {
    worldX: 82781,
    worldY: 63817,
    labelUk: 'Луг Небесної Тіні',
    labelEn: 'Skyshadow Meadow',
    cityId: 'l2dop_oren',
    teleportId: 'skyshadow_meadow',
    adenaCost: 3500,
  },
  {
    worldX: 87314,
    worldY: 85260,
    labelUk: 'Рівнини ящеролюдів',
    labelEn: 'Plains of the Lizardman',
    cityId: 'l2dop_oren',
    teleportId: 'plains_of_the_lizardman',
    adenaCost: 4000,
  },
  {
    worldX: 88060,
    worldY: -9126,
    labelUk: 'Ліс розбійників',
    labelEn: 'Outlaw Forest',
    cityId: 'l2dop_oren',
    teleportId: 'outlaw_forest',
    adenaCost: 4500,
  },
  {
    worldX: 116819,
    worldY: 76994,
    labelUk: 'Селище мисливців',
    labelEn: "Hunter's Village",
    cityId: 'hunters_village',
    teleportId: 'hunters',
    adenaCost: 11000,
  },
  {
    worldX: 123946,
    worldY: 59196,
    labelUk: 'Зачарована долина (південь)',
    labelEn: 'Enchanted Valley - Southern Region',
    cityId: 'hunters_village',
    teleportId: 'enchanted_valley_south',
    adenaCost: 5500,
  },
  {
    worldX: 105675,
    worldY: 36558,
    labelUk: 'Зачарована долина (північ)',
    labelEn: 'Enchanted Valley - Northern Region',
    cityId: 'hunters_village',
    teleportId: 'enchanted_valley_north',
    adenaCost: 7000,
  },
  {
    worldX: 146331,
    worldY: 25762,
    labelUk: 'Місто Аден',
    labelEn: 'Town of Aden',
    cityId: 'l2dop_aden',
    teleportId: 'aden',
    adenaCost: 15000,
  },
  {
    worldX: 147451,
    worldY: 46728,
    labelUk: 'Колізей',
    labelEn: 'Coliseum',
    cityId: 'l2dop_aden',
    teleportId: 'coliseum',
    adenaCost: 4000,
  },
  {
    worldX: 168960,
    worldY: 38555,
    labelUk: 'Запустілі рівнини',
    labelEn: 'Forsaken Plains',
    cityId: 'l2dop_aden',
    teleportId: 'forsaken_plains',
    adenaCost: 5000,
  },
  {
    worldX: 142036,
    worldY: 81131,
    labelUk: 'Ліс Дзеркал',
    labelEn: 'Forest of Mirrors',
    cityId: 'l2dop_aden',
    teleportId: 'forest_of_mirrors',
    adenaCost: 6500,
  },
  {
    worldX: 153804,
    worldY: -15917,
    labelUk: 'Полум\'яні болота',
    labelEn: 'Blazing Swamp',
    cityId: 'l2dop_aden',
    teleportId: 'blazing_swamp',
    adenaCost: 7000,
  },
  {
    worldX: 179586,
    worldY: -7793,
    labelUk: 'Поля різанини',
    labelEn: 'Fields of Massacre',
    cityId: 'l2dop_aden',
    teleportId: 'fields_of_massacre',
    adenaCost: 6500,
  },
  {
    worldX: 114736,
    worldY: -2316,
    labelUk: 'Стародавнє поле бою',
    labelEn: 'Ancient Battleground',
    cityId: 'l2dop_aden',
    teleportId: 'ancient_battleground',
    adenaCost: 8000,
  },
  {
    worldX: 171214,
    worldY: 56026,
    labelUk: 'Тиха долина',
    labelEn: 'Silent Valley',
    cityId: 'l2dop_aden',
    teleportId: 'silent_valley',
    adenaCost: 7500,
  },
  {
    worldX: 115015,
    worldY: 16066,
    labelUk: 'Вежа Зухвалості',
    labelEn: 'Tower of Insolence',
    cityId: 'l2dop_aden',
    teleportId: 'tower_of_insolence',
    adenaCost: 10000,
  },
  {
    worldX: 9745,
    worldY: 15606,
    labelUk: 'Селище темних ельфів',
    labelEn: 'Dark Elf Village',
    cityId: 'floran_village',
    teleportId: 'dark_elf_village',
    adenaCost: 2000,
  },
  {
    worldX: -11514,
    worldY: 15967,
    labelUk: 'Ліс темних ельфів',
    labelEn: 'Dark Elven Forest',
    cityId: 'floran_village',
    teleportId: 'dark_elven_forest',
    adenaCost: 200,
  },
  {
    worldX: -14162,
    worldY: 44879,
    labelUk: 'Болото',
    labelEn: 'Swampland',
    cityId: 'floran_village',
    teleportId: 'swampland',
    adenaCost: 500,
  },
  {
    worldX: -61095,
    worldY: 75104,
    labelUk: 'Гніздо павуків',
    labelEn: 'Spider Nest',
    cityId: 'floran_village',
    teleportId: 'spider_nest',
    adenaCost: 700,
  },
  {
    worldX: -47067,
    worldY: 59531,
    labelUk: 'Школа темних мистецтв',
    labelEn: 'School of Dark Arts',
    cityId: 'floran_village',
    teleportId: 'school_of_dark_arts',
    adenaCost: 900,
  },
  {
    worldX: 115113,
    worldY: -178212,
    labelUk: 'Селище гномів',
    labelEn: 'Dwarven Village',
    cityId: 'l2dop_schuttgart',
    teleportId: 'dwarf_village',
    adenaCost: 2500,
  },
  {
    worldX: 179039,
    worldY: -184080,
    labelUk: 'Мітрілові шахти',
    labelEn: 'Mithril Mines',
    cityId: 'l2dop_schuttgart',
    teleportId: 'mithril_mines',
    adenaCost: 400,
  },
  {
    worldX: 152372,
    worldY: -179864,
    labelUk: 'Покинуті вугільні шахти',
    labelEn: 'Abandoned Coal Mines',
    cityId: 'l2dop_schuttgart',
    teleportId: 'abandoned_coal_mines',
    adenaCost: 700,
  },
  {
    worldX: 169055,
    worldY: -208087,
    labelUk: 'Східна гірнича зона',
    labelEn: 'Eastern Mining Zone',
    cityId: 'l2dop_schuttgart',
    teleportId: 'eastern_mining_zone',
    adenaCost: 300,
  },
  {
    worldX: 46934,
    worldY: 51467,
    labelUk: 'Селище ельфів',
    labelEn: 'Elven Village',
    cityId: 'floran_village',
    teleportId: 'elf_village',
    adenaCost: 2000,
  },
  {
    worldX: 21362,
    worldY: 51122,
    labelUk: 'Ліс ельфів',
    labelEn: 'Elven Forest',
    cityId: 'floran_village',
    teleportId: 'elven_forest',
    adenaCost: 200,
  },
  {
    worldX: -10612,
    worldY: 75881,
    labelUk: 'Нейтральна зона',
    labelEn: 'Neutral Zone',
    cityId: 'floran_village',
    teleportId: 'neutral_zone',
    adenaCost: 500,
  },
  {
    worldX: 29294,
    worldY: 74968,
    labelUk: 'Фортеця ельфів',
    labelEn: 'Elven Fortress',
    cityId: 'floran_village',
    teleportId: 'elven_fortress',
    adenaCost: 800,
  },
  {
    worldX: -84318,
    worldY: 244579,
    labelUk: 'Говорящий Остров (TI)',
    labelEn: 'Talking Island Village',
    cityId: 'gludin_village',
    teleportId: 'talking_island',
    adenaCost: 100,
  },
  {
    worldX: -113329,
    worldY: 235327,
    labelUk: 'Руїни ельфів',
    labelEn: 'Elven Ruins',
    cityId: 'gludin_village',
    teleportId: 'elven_ruins',
    adenaCost: 500,
  },
  {
    worldX: -96811,
    worldY: 259153,
    labelUk: 'Гавань Talking Island',
    labelEn: 'Talking Island Harbor',
    cityId: 'gludin_village',
    teleportId: 'talking_island_harbor',
    adenaCost: 300,
  },
  {
    worldX: -72674,
    worldY: 256819,
    labelUk: 'Зал тренувань Cedric',
    labelEn: "Cedric's Training Hall",
    cityId: 'gludin_village',
    teleportId: 'cedrics_training_hall',
    adenaCost: 200,
  },
  {
    worldX: -80853,
    worldY: 149257,
    labelUk: 'Селище Глудін',
    labelEn: 'Gludin Village',
    cityId: 'gludin_village',
    teleportId: 'gludin',
    adenaCost: 3500,
  },
  {
    worldX: -47610,
    worldY: 208304,
    labelUk: 'Житло ящерів Лангк',
    labelEn: 'Langk Lizardman Dwelling',
    cityId: 'gludin_village',
    teleportId: 'langk_lizardman_dwelling',
    adenaCost: 2280,
  },
  {
    worldX: -65973,
    worldY: 166155,
    labelUk: 'Пагорб Вітряків',
    labelEn: 'Windmill Hill',
    cityId: 'gludin_village',
    teleportId: 'windmill_hill',
    adenaCost: 2300,
  },
  {
    worldX: -69878,
    worldY: 116430,
    labelUk: 'Мисливські угіддя Феллмір',
    labelEn: 'Fellmere Hunting Grounds',
    cityId: 'gludin_village',
    teleportId: 'fellmere_hunting_grounds',
    adenaCost: 5000,
  },
  {
    worldX: -52884,
    worldY: 188208,
    labelUk: 'Забутий храм',
    labelEn: 'Forgotten Temple',
    cityId: 'gludin_village',
    teleportId: 'forgotten_temple',
    adenaCost: 4900,
  },
  {
    worldX: -89998,
    worldY: 105577,
    labelUk: 'Оркський табір',
    labelEn: 'Orc Barracks',
    cityId: 'gludin_village',
    teleportId: 'orc_barracks',
    adenaCost: 2700,
  },
  {
    worldX: -91615,
    worldY: 82774,
    labelUk: 'Вітряний пагорб',
    labelEn: 'Windy Hill',
    cityId: 'gludin_village',
    teleportId: 'windy_hill',
    adenaCost: 4400,
  },
  {
    worldX: -50745,
    worldY: 145509,
    labelUk: 'Покинутий табір',
    labelEn: 'Abandon Camp',
    cityId: 'gludin_village',
    teleportId: 'abandoned_camp',
    adenaCost: 3600,
  },
  {
    worldX: -23403,
    worldY: 186599,
    labelUk: 'Пустелі',
    labelEn: 'Wastelands',
    cityId: 'gludin_village',
    teleportId: 'wastelands',
    adenaCost: 1900,
  },
  {
    worldX: -44836,
    worldY: -112524,
    labelUk: 'Селище орків',
    labelEn: 'Orc Village',
    cityId: 'l2dop_gludio',
    teleportId: 'orc_village',
    adenaCost: 2500,
  },
  {
    worldX: -7653,
    worldY: -78436,
    labelUk: 'Безсмертне плато (південь)',
    labelEn: 'Immortal Plateau, Southern Region',
    cityId: 'l2dop_gludio',
    teleportId: 'immortal_plateau_southern',
    adenaCost: 200,
  },
  {
    worldX: -10983,
    worldY: -117696,
    labelUk: 'Безсмертне плато',
    labelEn: 'The Immortal Plateau',
    cityId: 'l2dop_gludio',
    teleportId: 'immortal_plateau',
    adenaCost: 500,
  },
  {
    worldX: 9954,
    worldY: -112487,
    labelUk: 'Печера випробувань',
    labelEn: 'Cave of Trials',
    cityId: 'l2dop_gludio',
    teleportId: 'cave_of_trials',
    adenaCost: 800,
  },
  {
    worldX: 9621,
    worldY: -139945,
    labelUk: 'Крижаний водоспад',
    labelEn: 'Frozen Waterfall',
    cityId: 'l2dop_gludio',
    teleportId: 'frozen_waterfall',
    adenaCost: 1000,
  },
  {
    worldX: 111409,
    worldY: 219364,
    labelUk: 'Гейне',
    labelEn: 'Heine',
    cityId: 'l2dop_heine',
    teleportId: 'heine',
    adenaCost: 14000,
  },
  {
    worldX: 84904,
    worldY: 182410,
    labelUk: 'Поле безмови',
    labelEn: 'Field of Silence',
    cityId: 'l2dop_heine',
    teleportId: 'field_of_silence',
    adenaCost: 6000,
  },
  {
    worldX: 82013,
    worldY: 226780,
    labelUk: 'Шепотливі поля',
    labelEn: 'Field of Whispers',
    cityId: 'l2dop_heine',
    teleportId: 'field_of_whispers',
    adenaCost: 6500,
  },
  {
    worldX: 113590,
    worldY: 191406,
    labelUk: 'Острів алігаторів',
    labelEn: 'Alligator Island',
    cityId: 'l2dop_heine',
    teleportId: 'alligator_island',
    adenaCost: 8000,
  },
  {
    worldX: 82744,
    worldY: 244346,
    labelUk: 'Сади Єви',
    labelEn: 'Garden of Eva',
    cityId: 'l2dop_heine',
    teleportId: 'garden_of_eva',
    adenaCost: 9500,
  },
  {
    worldX: 44528,
    worldY: -51290,
    labelUk: 'Рун',
    labelEn: 'Rune Township',
    cityId: 'l2dop_rune',
    teleportId: 'rune',
    adenaCost: 20000,
  },
  {
    worldX: 50413,
    worldY: -84527,
    labelUk: 'Пасовища диких звірів',
    labelEn: 'Wild Beast Pastures',
    cityId: 'l2dop_rune',
    teleportId: 'wild_beast_pastures',
    adenaCost: 7000,
  },
  {
    worldX: 65656,
    worldY: -71560,
    labelUk: 'Долина святих',
    labelEn: 'Valley of Saints',
    cityId: 'l2dop_rune',
    teleportId: 'valley_of_saints',
    adenaCost: 10000,
  },
  {
    worldX: 52055,
    worldY: -54485,
    labelUk: 'Ліс мертвих',
    labelEn: 'Forest of the Dead',
    cityId: 'l2dop_rune',
    teleportId: 'forest_of_the_dead',
    adenaCost: 9000,
  },
  {
    worldX: 69665,
    worldY: -50116,
    labelUk: 'Болото криків',
    labelEn: 'Swamp of Screams',
    cityId: 'l2dop_rune',
    teleportId: 'swamp_of_screams',
    adenaCost: 8500,
  },
  {
    worldX: 148024,
    worldY: -55281,
    labelUk: 'Місто Годдарт',
    labelEn: 'Town of Goddard',
    cityId: 'l2dop_goddard',
    teleportId: 'goddard',
    adenaCost: 18000,
  },
  {
    worldX: 125519,
    worldY: -41287,
    labelUk: 'Твердиня варка сіленів',
    labelEn: 'Varka Silenos Stronghold',
    cityId: 'l2dop_goddard',
    teleportId: 'varka_silenos_stronghold',
    adenaCost: 8000,
  },
  {
    worldX: 146433,
    worldY: -68420,
    labelUk: 'Опорний пункт кетра',
    labelEn: 'Ketra Orc Outpost',
    cityId: 'l2dop_goddard',
    teleportId: 'ketra_orc_outpost',
    adenaCost: 8000,
  },
  {
    worldX: 149614,
    worldY: -112546,
    labelUk: 'Гарячі джерела',
    labelEn: 'Hot Springs',
    cityId: 'l2dop_goddard',
    teleportId: 'hot_springs',
    adenaCost: 6000,
  },
  {
    worldX: 164883,
    worldY: -47953,
    labelUk: 'Стіна Аргоса',
    labelEn: 'Wall of Argos',
    cityId: 'l2dop_goddard',
    teleportId: 'wall_of_argos',
    adenaCost: 9000,
  },
  {
    worldX: 108142,
    worldY: -87833,
    labelUk: 'Монастир Тиші',
    labelEn: 'Monastery of Silence',
    cityId: 'l2dop_goddard',
    teleportId: 'monastery_of_silence',
    adenaCost: 10000,
  },
  {
    worldX: 86846,
    worldY: -162538,
    labelUk: 'Місто Штутгарт',
    labelEn: 'Town of Schuttgart',
    cityId: 'l2dop_schuttgart',
    teleportId: 'schuttgart',
    adenaCost: 22000,
  },
  {
    worldX: 71300,
    worldY: -114335,
    labelUk: 'Лігво Зла',
    labelEn: 'Den of Evil',
    cityId: 'l2dop_schuttgart',
    teleportId: 'den_of_evil',
    adenaCost: 9000,
  },
  {
    worldX: 104535,
    worldY: -160114,
    labelUk: 'Розграблені рівнини',
    labelEn: 'Plunderous Plains',
    cityId: 'l2dop_schuttgart',
    teleportId: 'plunderous_plains',
    adenaCost: 8000,
  },
  {
    worldX: 113896,
    worldY: -108752,
    labelUk: 'Крижаний лабіринт',
    labelEn: 'Frozen Labyrinth',
    cityId: 'l2dop_schuttgart',
    teleportId: 'frozen_labyrinth',
    adenaCost: 10000,
  },
  {
    worldX: 47687,
    worldY: -115818,
    labelUk: 'Склеп Ганьби',
    labelEn: 'Crypts of Disgrace',
    cityId: 'l2dop_schuttgart',
    teleportId: 'crypts_of_disgrace',
    adenaCost: 11000,
  },
  {
    worldX: 91300,
    worldY: -117189,
    labelUk: 'Руїни Павла',
    labelEn: 'Pavel Ruins',
    cityId: 'l2dop_schuttgart',
    teleportId: 'pavel_ruins',
    adenaCost: 9500,
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
    worldX: 62581,
    worldY: 30082,
    labelUk: 'Море спор',
    labelEn: 'Sea of Spores',
    cityId: 'l2dop_oren',
    teleportId: 'sea_of_spores',
    adenaCost: 6000,
  },
];

registerMapTownsProvider(() => MAP_TOWNS);

export { mobPoolForCity, mobPoolForTeleport };

export function getTeleportDestination(
  teleportId: string
): MapTownRef | undefined {
  const id = String(teleportId || '').trim();
  if (!id) return undefined;
  return MAP_TOWNS.find((t) => t.teleportId === id);
}

export const TELEPORT_DEFAULT_ADENA_COST = 1;

/** Вартість телепорту в адені для пункту (після 40 рівня). */
export function getTeleportAdenaCost(teleportId: string): number {
  const dest = getTeleportDestination(teleportId);
  if (!dest) return TELEPORT_DEFAULT_ADENA_COST;
  const n = dest.adenaCost;
  if (n == null || !Number.isFinite(n) || n < 0) {
    return TELEPORT_DEFAULT_ADENA_COST;
  }
  return Math.floor(n);
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

/** Телепорт у найближче місто/селище від координат смерті або «В місто». */
export function resolveNearestTownTeleport(
  worldX: number,
  worldY: number
): {
  labelUk: string;
  teleportId: string;
  worldX: number;
  worldY: number;
  cityId: string;
} | null {
  const near = nearestMapTown(worldX, worldY);
  const dest = getTeleportDestination(near.teleportId);
  if (!dest) return null;
  return {
    labelUk: near.labelUk,
    teleportId: near.teleportId,
    worldX: Math.floor(dest.worldX),
    worldY: Math.floor(dest.worldY),
    cityId: dest.cityId,
  };
}

export function resolveMapLocality(worldX: number, worldY: number): {
  nearestLabelUk: string;
  teleportId: string;
  cityId: string;
  distance: number;
  mobs: MapLocalityMob[];
} {
  const best = nearestMapTown(worldX, worldY);
  const bestD = Math.hypot(best.worldX - worldX, best.worldY - worldY);
  const mobs = mobPoolForTeleport(best.teleportId, best.cityId);
  return {
    nearestLabelUk: best.labelUk,
    teleportId: best.teleportId,
    cityId: best.cityId,
    distance: Math.round(bestD),
    mobs,
  };
}
