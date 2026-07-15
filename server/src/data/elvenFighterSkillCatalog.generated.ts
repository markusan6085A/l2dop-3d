/**
 * Автоген з text-rpg (`npm run gen:race-fighter-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const ELVEN_FIGHTER_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
  {
    battleId: "l2_3",
    l2SkillId: 3,
    minLevel: 5,
    spCost: 50,
    nameUk: "Силовий удар (Power Strike)",
    hintUk: "Накопичує силу для різкого удару. Лише з мечем або булавою. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 50,
        mpCost: 10,
        power: 25
      },
      {
        level: 2,
        requiredLevel: 5,
        spCost: 50,
        mpCost: 10,
        power: 27
      },
      {
        level: 3,
        requiredLevel: 5,
        spCost: 50,
        mpCost: 11,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 10,
        spCost: 310,
        mpCost: 13,
        power: 39
      },
      {
        level: 5,
        requiredLevel: 10,
        spCost: 310,
        mpCost: 13,
        power: 42
      },
      {
        level: 6,
        requiredLevel: 10,
        spCost: 310,
        mpCost: 14,
        power: 46
      },
      {
        level: 7,
        requiredLevel: 15,
        spCost: 1100,
        mpCost: 17,
        power: 60
      },
      {
        level: 8,
        requiredLevel: 15,
        spCost: 1100,
        mpCost: 18,
        power: 65
      },
      {
        level: 9,
        requiredLevel: 15,
        spCost: 1100,
        mpCost: 19,
        power: 70
      }
    ],
    effects: [],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_10",
    l2SkillId: 10,
    minLevel: 40,
    spCost: 30000,
    nameUk: "Summon Storm Cubic",
    hintUk: "Summon Storm Cubic",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 30000,
        mpCost: 35,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 42,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 48,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 54,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 62,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 65,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_12",
    l2SkillId: 12,
    minLevel: 43,
    spCost: 35000,
    nameUk: "Підміна цілі (Switch)",
    hintUk: "Збиває таргет ворога.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 45,
        power: 80
      },
      {
        level: 2,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 49,
        power: 80
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 54,
        power: 80
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 56,
        power: 80
      },
      {
        level: 5,
        requiredLevel: 55,
        spCost: 160000,
        mpCost: 61,
        power: 80
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 65,
        power: 80
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 260000,
        mpCost: 68,
        power: 80
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 370000,
        mpCost: 69,
        power: 80
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 72,
        power: 80
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 640000,
        mpCost: 74,
        power: 80
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 77,
        power: 80
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 79,
        power: 80
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 1400000,
        mpCost: 81,
        power: 80
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 2100000,
        mpCost: 83,
        power: 80
      }
    ],
    effects: [],
    cooldownSec: 12,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_15",
    l2SkillId: 15,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Charm",
    hintUk: "Charm",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 16,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 67,
        power: 252
      },
      {
        level: 17,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 68,
        power: 259
      },
      {
        level: 18,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 70,
        power: 266
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 72,
        power: 272
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 74,
        power: 279
      },
      {
        level: 21,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 75,
        power: 286
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 78,
        power: 293
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 80,
        power: 300
      },
      {
        level: 24,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 82,
        power: 307
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 84,
        power: 313
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 87,
        power: 320
      },
      {
        level: 27,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 88,
        power: 327
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 90,
        power: 334
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 92,
        power: 340
      },
      {
        level: 30,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 94,
        power: 347
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 97,
        power: 353
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 98,
        power: 360
      },
      {
        level: 33,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 100,
        power: 366
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 103,
        power: 373
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 104,
        power: 379
      },
      {
        level: 36,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 107,
        power: 385
      },
      {
        level: 37,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 109,
        power: 391
      },
      {
        level: 38,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 110,
        power: 396
      },
      {
        level: 39,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 113,
        power: 402
      },
      {
        level: 40,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 115,
        power: 407
      },
      {
        level: 41,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 117,
        power: 413
      },
      {
        level: 42,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 119,
        power: 418
      },
      {
        level: 43,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 120,
        power: 423
      },
      {
        level: 44,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 123,
        power: 428
      },
      {
        level: 45,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 124,
        power: 432
      },
      {
        level: 46,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 127,
        power: 437
      },
      {
        level: 47,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 128,
        power: 441
      },
      {
        level: 48,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 130,
        power: 445
      },
      {
        level: 49,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 132,
        power: 449
      },
      {
        level: 50,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 133,
        power: 452
      },
      {
        level: 51,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 135,
        power: 455
      },
      {
        level: 52,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 137,
        power: 458
      }
    ],
    effects: [],
    cooldownSec: 60,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_16",
    l2SkillId: 16,
    minLevel: 20,
    spCost: 1200,
    nameUk: "Смертельний удар (Mortal Blow)",
    hintUk: "Потенційно смертельна атака. Використовується лише з кинжалами. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 19,
        power: 268
      },
      {
        level: 11,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 20,
        power: 291
      },
      {
        level: 12,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 20,
        power: 314
      },
      {
        level: 13,
        requiredLevel: 24,
        spCost: 1700,
        mpCost: 21,
        power: 367
      },
      {
        level: 14,
        requiredLevel: 24,
        spCost: 1700,
        mpCost: 22,
        power: 396
      },
      {
        level: 15,
        requiredLevel: 24,
        spCost: 1700,
        mpCost: 23,
        power: 427
      },
      {
        level: 16,
        requiredLevel: 28,
        spCost: 3100,
        mpCost: 25,
        power: 494
      },
      {
        level: 17,
        requiredLevel: 28,
        spCost: 3100,
        mpCost: 26,
        power: 531
      },
      {
        level: 18,
        requiredLevel: 28,
        spCost: 3100,
        mpCost: 27,
        power: 571
      },
      {
        level: 19,
        requiredLevel: 32,
        spCost: 5100,
        mpCost: 28,
        power: 656
      },
      {
        level: 20,
        requiredLevel: 32,
        spCost: 5100,
        mpCost: 28,
        power: 703
      },
      {
        level: 21,
        requiredLevel: 32,
        spCost: 5100,
        mpCost: 29,
        power: 752
      },
      {
        level: 22,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 32,
        power: 859
      },
      {
        level: 23,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 33,
        power: 916
      },
      {
        level: 24,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 34,
        power: 977
      }
    ],
    effects: [],
    cooldownSec: 11,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_18",
    l2SkillId: 18,
    minLevel: 40,
    spCost: 10000,
    nameUk: "Аура ненависті (Aggression)",
    hintUk: "Тимчасово підвищує загрозу для ворогів навколо, щоб тримати їхню увагу на собі.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 50,
        power: 1078
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 51,
        power: 1107
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 53,
        power: 1136
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 54,
        power: 1166
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 55,
        power: 1195
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 57,
        power: 1224
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 58,
        power: 1254
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 60,
        power: 1283
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 61,
        power: 1312
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 63,
        power: 1342
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 64,
        power: 1371
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 66,
        power: 1400
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 67,
        power: 1429
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 69,
        power: 1457
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 70,
        power: 1485
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 72,
        power: 1513
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 74,
        power: 1541
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 75,
        power: 1568
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 77,
        power: 1595
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 78,
        power: 1621
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 80,
        power: 1647
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 81,
        power: 1672
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 83,
        power: 1697
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 85,
        power: 1721
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 86,
        power: 1745
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 87,
        power: 1768
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 89,
        power: 1790
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 90,
        power: 1811
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 92,
        power: 1831
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 93,
        power: 1851
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 95,
        power: 1870
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 96,
        power: 1888
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 97,
        power: 1905
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 99,
        power: 1921
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 100,
        power: 1936
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 960000,
        mpCost: 101,
        power: 1950
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 960000,
        mpCost: 102,
        power: 1963
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_19",
    l2SkillId: 19,
    minLevel: 40,
    spCost: 12000,
    nameUk: "Подвійний постріл (Double Shot)",
    hintUk: "Дві стріли підряд по одній цілі. Лише з луком. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_moonlight_sentinel",
      "elf_silver_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 80,
        power: 984
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 82,
        power: 1046
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 85,
        power: 1110
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 85,
        power: 1178
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 87,
        power: 1249
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 90,
        power: 1322
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 93,
        power: 1399
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 95,
        power: 1479
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 98,
        power: 1562
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 101,
        power: 1647
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 104,
        power: 1736
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 107,
        power: 1828
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 109,
        power: 1923
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 110,
        power: 2021
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 112,
        power: 2123
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 115,
        power: 2227
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 118,
        power: 2333
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 121,
        power: 2443
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 124,
        power: 2555
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 126,
        power: 2670
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 129,
        power: 2788
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 132,
        power: 2908
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 135,
        power: 3030
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 135,
        power: 3154
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 138,
        power: 3280
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 140,
        power: 3408
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 143,
        power: 3537
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 145,
        power: 3668
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 148,
        power: 3800
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 150,
        power: 3933
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 153,
        power: 4067
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 155,
        power: 4201
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 157,
        power: 4336
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 160,
        power: 4470
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 162,
        power: 4604
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 164,
        power: 4738
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 166,
        power: 4870
      }
    ],
    effects: [],
    cooldownSec: 25,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_21",
    l2SkillId: 21,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Poison Recovery",
    hintUk: "Poison Recovery",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 35,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 60,
        spCost: 260000,
        mpCost: 55,
        power: 9
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_24",
    l2SkillId: 24,
    minLevel: 46,
    spCost: 17000,
    nameUk: "Вибуховий залп (Burst Shot)",
    hintUk: "Постріл з вибухом стріл по площі. Потрібен лук. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_moonlight_sentinel",
      "elf_silver_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 139,
        power: 350
      },
      {
        level: 2,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 143,
        power: 370
      },
      {
        level: 3,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 147,
        power: 391
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 151,
        power: 412
      },
      {
        level: 5,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 155,
        power: 434
      },
      {
        level: 6,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 160,
        power: 457
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 164,
        power: 481
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 164,
        power: 506
      },
      {
        level: 9,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 168,
        power: 531
      },
      {
        level: 10,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 173,
        power: 557
      },
      {
        level: 11,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 177,
        power: 584
      },
      {
        level: 12,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 181,
        power: 611
      },
      {
        level: 13,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 185,
        power: 639
      },
      {
        level: 14,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 189,
        power: 668
      },
      {
        level: 15,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 194,
        power: 697
      },
      {
        level: 16,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 198,
        power: 727
      },
      {
        level: 17,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 202,
        power: 758
      },
      {
        level: 18,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 202,
        power: 789
      },
      {
        level: 19,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 206,
        power: 820
      },
      {
        level: 20,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 210,
        power: 852
      },
      {
        level: 21,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 214,
        power: 885
      },
      {
        level: 22,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 218,
        power: 917
      },
      {
        level: 23,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 222,
        power: 950
      },
      {
        level: 24,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 225,
        power: 984
      },
      {
        level: 25,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 229,
        power: 1017
      },
      {
        level: 26,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 232,
        power: 1051
      },
      {
        level: 27,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 236,
        power: 1084
      },
      {
        level: 28,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 239,
        power: 1118
      },
      {
        level: 29,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 243,
        power: 1151
      },
      {
        level: 30,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 246,
        power: 1185
      },
      {
        level: 31,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 249,
        power: 1218
      }
    ],
    effects: [],
    cooldownSec: 25,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_27",
    l2SkillId: 27,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Відмикання (Unlock)",
    hintUk: "Відкриває двері й скрині; успіх і вимоги до ключів залежать від рангу.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 35,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 39,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 43,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 47,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 55,
        spCost: 160000,
        mpCost: 51,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 60,
        spCost: 260000,
        mpCost: 55,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 59,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 63,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 72,
        spCost: 1400000,
        mpCost: 67,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_28",
    l2SkillId: 28,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Aggression",
    hintUk: "Aggression",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 13,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 33,
        power: 1078
      },
      {
        level: 14,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 34,
        power: 1107
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 35,
        power: 1136
      },
      {
        level: 16,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 36,
        power: 1166
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 37,
        power: 1195
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 38,
        power: 1224
      },
      {
        level: 19,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 39,
        power: 1254
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 40,
        power: 1283
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 41,
        power: 1312
      },
      {
        level: 22,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 42,
        power: 1342
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 43,
        power: 1371
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 44,
        power: 1400
      },
      {
        level: 25,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 45,
        power: 1429
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 46,
        power: 1457
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 47,
        power: 1485
      },
      {
        level: 28,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 48,
        power: 1513
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 49,
        power: 1541
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 50,
        power: 1568
      },
      {
        level: 31,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 51,
        power: 1595
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 52,
        power: 1621
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 53,
        power: 1647
      },
      {
        level: 34,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 54,
        power: 1672
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 55,
        power: 1697
      },
      {
        level: 36,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 57,
        power: 1721
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 58,
        power: 1745
      },
      {
        level: 38,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 58,
        power: 1768
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 59,
        power: 1790
      },
      {
        level: 40,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 60,
        power: 1811
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 61,
        power: 1831
      },
      {
        level: 42,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 62,
        power: 1851
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 63,
        power: 1870
      },
      {
        level: 44,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 64,
        power: 1888
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 65,
        power: 1905
      },
      {
        level: 46,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 66,
        power: 1921
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 67,
        power: 1936
      },
      {
        level: 48,
        requiredLevel: 74,
        spCost: 960000,
        mpCost: 67,
        power: 1950
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 960000,
        mpCost: 68,
        power: 1963
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_30",
    l2SkillId: 30,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Удар у спину (Backstab)",
    hintUk: "Удар зі спини кинжалом; оверхіт.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 53,
        power: 1107
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 55,
        power: 1176
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 57,
        power: 1249
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 57,
        power: 1325
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 58,
        power: 1405
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 60,
        power: 1488
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 62,
        power: 1574
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 64,
        power: 1664
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 66,
        power: 1757
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 67,
        power: 1853
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 69,
        power: 1953
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 71,
        power: 2057
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 73,
        power: 2164
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 73,
        power: 2274
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 75,
        power: 2388
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 77,
        power: 2505
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 79,
        power: 2625
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 81,
        power: 2748
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 83,
        power: 2875
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 84,
        power: 3004
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 86,
        power: 3136
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 88,
        power: 3271
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 90,
        power: 3408
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 90,
        power: 3548
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 92,
        power: 3690
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 94,
        power: 3834
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 95,
        power: 3980
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 97,
        power: 4127
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 99,
        power: 4275
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 100,
        power: 4425
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 102,
        power: 4575
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 104,
        power: 4726
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 105,
        power: 4878
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 107,
        power: 5029
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 108,
        power: 5180
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 110,
        power: 5330
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 111,
        power: 5479
      }
    ],
    effects: [],
    cooldownSec: 11,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_51",
    l2SkillId: 51,
    minLevel: 52,
    spCost: 120000,
    nameUk: "Приманка (Lure)",
    hintUk: "Тихо підманює ворога.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 44,
        power: 500
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_56",
    l2SkillId: 56,
    minLevel: 20,
    spCost: 1200,
    nameUk: "Силовий постріл (Power Shot)",
    hintUk: "Смертельний постріл з лука. Можливий надудар. Лише з луком.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 43,
        power: 239
      },
      {
        level: 11,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 44,
        power: 258
      },
      {
        level: 12,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 44,
        power: 279
      },
      {
        level: 13,
        requiredLevel: 24,
        spCost: 1700,
        mpCost: 46,
        power: 326
      },
      {
        level: 14,
        requiredLevel: 24,
        spCost: 1700,
        mpCost: 48,
        power: 352
      },
      {
        level: 15,
        requiredLevel: 24,
        spCost: 1700,
        mpCost: 50,
        power: 379
      },
      {
        level: 16,
        requiredLevel: 28,
        spCost: 3100,
        mpCost: 54,
        power: 440
      },
      {
        level: 17,
        requiredLevel: 28,
        spCost: 3100,
        mpCost: 57,
        power: 472
      },
      {
        level: 18,
        requiredLevel: 28,
        spCost: 3100,
        mpCost: 59,
        power: 507
      },
      {
        level: 19,
        requiredLevel: 32,
        spCost: 5100,
        mpCost: 62,
        power: 584
      },
      {
        level: 20,
        requiredLevel: 32,
        spCost: 5100,
        mpCost: 62,
        power: 625
      },
      {
        level: 21,
        requiredLevel: 32,
        spCost: 5100,
        mpCost: 65,
        power: 669
      },
      {
        level: 22,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 69,
        power: 763
      },
      {
        level: 23,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 72,
        power: 814
      },
      {
        level: 24,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 74,
        power: 865
      }
    ],
    effects: [],
    cooldownSec: 25,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_58",
    l2SkillId: 58,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Elemental Heal",
    hintUk: "Elemental Heal",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 19,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 115,
        power: 236
      },
      {
        level: 20,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 119,
        power: 245
      },
      {
        level: 21,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 122,
        power: 254
      },
      {
        level: 22,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 122,
        power: 262
      },
      {
        level: 23,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 127,
        power: 271
      },
      {
        level: 24,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 130,
        power: 281
      },
      {
        level: 25,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 134,
        power: 290
      },
      {
        level: 26,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 139,
        power: 299
      },
      {
        level: 27,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 143,
        power: 308
      },
      {
        level: 28,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 148,
        power: 318
      },
      {
        level: 29,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 152,
        power: 327
      },
      {
        level: 30,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 157,
        power: 337
      },
      {
        level: 31,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 159,
        power: 346
      },
      {
        level: 32,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 159,
        power: 356
      },
      {
        level: 33,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 164,
        power: 365
      },
      {
        level: 34,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 168,
        power: 375
      },
      {
        level: 35,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 173,
        power: 384
      },
      {
        level: 36,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 177,
        power: 393
      },
      {
        level: 37,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 180,
        power: 403
      },
      {
        level: 38,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 185,
        power: 412
      },
      {
        level: 39,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 189,
        power: 421
      },
      {
        level: 40,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 193,
        power: 430
      },
      {
        level: 41,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 195,
        power: 439
      },
      {
        level: 42,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 195,
        power: 448
      },
      {
        level: 43,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 199,
        power: 457
      },
      {
        level: 44,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 203,
        power: 466
      },
      {
        level: 45,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 207,
        power: 474
      },
      {
        level: 46,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 210,
        power: 482
      },
      {
        level: 47,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 214,
        power: 490
      },
      {
        level: 48,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 218,
        power: 498
      },
      {
        level: 49,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 222,
        power: 506
      },
      {
        level: 50,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 224,
        power: 513
      },
      {
        level: 51,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 228,
        power: 520
      },
      {
        level: 52,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 230,
        power: 527
      },
      {
        level: 53,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 233,
        power: 534
      },
      {
        level: 54,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 237,
        power: 540
      },
      {
        level: 55,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 239,
        power: 546
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_60",
    l2SkillId: 60,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Удавана смерть (Fake Death)",
    hintUk: "Toggle: притворитися мертвим; MP у такті.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 200,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_61",
    l2SkillId: 61,
    minLevel: 46,
    spCost: 43000,
    nameUk: "Cure Bleeding",
    hintUk: "Cure Bleeding",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 42,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 370000,
        mpCost: 55,
        power: 9
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_67",
    l2SkillId: 67,
    minLevel: 43,
    spCost: 35000,
    nameUk: "Summon Life Cubic",
    hintUk: "Summon Life Cubic",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 38,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 49,
        spCost: 82000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 50,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 60,
        spCost: 220000,
        mpCost: 55,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 370000,
        mpCost: 60,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 64,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 72,
        spCost: 1200000,
        mpCost: 67,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_77",
    l2SkillId: 77,
    minLevel: 10,
    spCost: 910,
    nameUk: "Attack Aura",
    hintUk: "Attack Aura",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 10,
        spCost: 910,
        mpCost: 13,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_91",
    l2SkillId: 91,
    minLevel: 5,
    spCost: 160,
    nameUk: "Defense Aura",
    hintUk: "Defense Aura",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 160,
        mpCost: 10,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_96",
    l2SkillId: 96,
    minLevel: 49,
    spCost: 75000,
    nameUk: "Bleed",
    hintUk: "Bleed",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 67,
        power: 110
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 81,
        power: 135
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 640000,
        mpCost: 93,
        power: 155
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 99,
        power: 170
      }
    ],
    effects: [],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_98",
    l2SkillId: 98,
    minLevel: 55,
    spCost: 270000,
    nameUk: "Sword Symphony",
    hintUk: "Sword Symphony",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 55,
        spCost: 270000,
        mpCost: 120,
        power: 229
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 410000,
        mpCost: 133,
        power: 284
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 690000,
        mpCost: 142,
        power: 321
      },
      {
        level: 4,
        requiredLevel: 68,
        spCost: 1300000,
        mpCost: 152,
        power: 382
      },
      {
        level: 5,
        requiredLevel: 72,
        spCost: 2200000,
        mpCost: 160,
        power: 432
      }
    ],
    effects: [],
    cooldownSec: 60,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_99",
    l2SkillId: 99,
    minLevel: 32,
    spCost: 15000,
    nameUk: "Швидкий постріл (Rapid Shot)",
    hintUk: "Підвищує швидкість стрільби з лука.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 32,
        spCost: 15000,
        mpCost: 28,
        power: 1
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_101",
    l2SkillId: 101,
    minLevel: 40,
    spCost: 12000,
    nameUk: "Оглушливий постріл (Stun Shot)",
    hintUk: "Оглушує й завдає шкоди з лука. Лише з луками. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 80,
        power: 369
      },
      {
        level: 5,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 82,
        power: 392
      },
      {
        level: 6,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 85,
        power: 417
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 85,
        power: 442
      },
      {
        level: 8,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 87,
        power: 469
      },
      {
        level: 9,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 90,
        power: 496
      },
      {
        level: 10,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 93,
        power: 525
      },
      {
        level: 11,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 95,
        power: 555
      },
      {
        level: 12,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 98,
        power: 586
      },
      {
        level: 13,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 101,
        power: 618
      },
      {
        level: 14,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 104,
        power: 651
      },
      {
        level: 15,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 107,
        power: 686
      },
      {
        level: 16,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 109,
        power: 722
      },
      {
        level: 17,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 110,
        power: 758
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 112,
        power: 796
      },
      {
        level: 19,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 115,
        power: 835
      },
      {
        level: 20,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 118,
        power: 875
      },
      {
        level: 21,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 121,
        power: 916
      },
      {
        level: 22,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 124,
        power: 959
      },
      {
        level: 23,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 126,
        power: 1002
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 129,
        power: 1046
      },
      {
        level: 25,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 132,
        power: 1091
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 135,
        power: 1136
      },
      {
        level: 27,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 135,
        power: 1183
      },
      {
        level: 28,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 138,
        power: 1230
      },
      {
        level: 29,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 140,
        power: 1278
      },
      {
        level: 30,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 143,
        power: 1327
      },
      {
        level: 31,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 145,
        power: 1376
      },
      {
        level: 32,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 148,
        power: 1425
      },
      {
        level: 33,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 150,
        power: 1475
      },
      {
        level: 34,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 153,
        power: 1525
      },
      {
        level: 35,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 155,
        power: 1576
      },
      {
        level: 36,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 157,
        power: 1626
      },
      {
        level: 37,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 160,
        power: 1677
      },
      {
        level: 38,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 162,
        power: 1727
      },
      {
        level: 39,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 164,
        power: 1777
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 166,
        power: 1827
      }
    ],
    effects: [
      {
        stat: "shockResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_102",
    l2SkillId: 102,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Entangle",
    hintUk: "Entangle",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 18,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 19,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 22,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 23,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 24,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 55,
        spCost: 160000,
        mpCost: 25,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 28,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 60,
        spCost: 260000,
        mpCost: 28,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 62,
        spCost: 370000,
        mpCost: 29,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 30,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 66,
        spCost: 640000,
        mpCost: 32,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 33,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 33,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 72,
        spCost: 1400000,
        mpCost: 34,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 74,
        spCost: 2100000,
        mpCost: 35,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 7,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_107",
    l2SkillId: 107,
    minLevel: 58,
    spCost: 200000,
    nameUk: "Holy Aura",
    hintUk: "Holy Aura",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 80,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 220000,
        mpCost: 83,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 86,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 64,
        spCost: 370000,
        mpCost: 89,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 92,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 95,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 97,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 1200000,
        mpCost: 100,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 102,
        power: 0
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "flat"
      }
    ],
    cooldownSec: 40,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_110",
    l2SkillId: 110,
    minLevel: 20,
    spCost: 4100,
    nameUk: "Ultimate Defense",
    hintUk: "Ultimate Defense",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 4100,
        mpCost: 19,
        power: 1
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat",
        value: 3600
      },
      {
        stat: "mDef",
        mode: "flat",
        value: 2700
      },
      {
        stat: "immobile",
        mode: "flat",
        value: 1
      }
    ],
    cooldownSec: 1800,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_111",
    l2SkillId: 111,
    minLevel: 28,
    spCost: 9200,
    nameUk: "Абсолютне ухилення (Ultimate Evasion)",
    hintUk: "Сильно підвищує ухилення на короткий час.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 28,
        spCost: 9200,
        mpCost: 25,
        power: 20
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat",
        value: 20
      }
    ],
    cooldownSec: 1800,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_112",
    l2SkillId: 112,
    minLevel: 24,
    spCost: 8800,
    nameUk: "Deflect Arrow",
    hintUk: "Deflect Arrow",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 24,
        spCost: 8800,
        mpCost: 22,
        power: 16
      },
      {
        level: 2,
        requiredLevel: 32,
        spCost: 25000,
        mpCost: 28,
        power: 19
      }
    ],
    effects: [
      {
        stat: "arrowDef",
        mode: "percent"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_113",
    l2SkillId: 113,
    minLevel: 20,
    spCost: 2800,
    nameUk: "Дальній постріл (Long Shot)",
    hintUk: "Пасив: збільшує дальність стрільби з лука.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2800,
        mpCost: 0,
        power: 200
      }
    ],
    effects: [
      {
        stat: "attackRange",
        mode: "flat",
        value: 200
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_123",
    l2SkillId: 123,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Spirit Barrier",
    hintUk: "Spirit Barrier",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 35,
        power: 15
      },
      {
        level: 2,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 44,
        power: 23
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 54,
        power: 30
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_137",
    l2SkillId: 137,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Шанс криту (Critical Chance)",
    hintUk: "Пасив: підвищує шанс критичного удару.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 0,
        power: 30
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 0,
        power: 40
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_141",
    l2SkillId: 141,
    minLevel: 5,
    spCost: 160,
    nameUk: "Майстерність обладунку (Armor Mastery)",
    hintUk: "Пасив: +9 P. Def. за кожен вивчений рівень скіла.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 160,
        mpCost: 0,
        power: 9
      },
      {
        level: 2,
        requiredLevel: 10,
        spCost: 460,
        mpCost: 0,
        power: 11
      },
      {
        level: 3,
        requiredLevel: 10,
        spCost: 460,
        mpCost: 0,
        power: 12
      },
      {
        level: 4,
        requiredLevel: 15,
        spCost: 1700,
        mpCost: 0,
        power: 13
      },
      {
        level: 5,
        requiredLevel: 15,
        spCost: 1700,
        mpCost: 0,
        power: 14
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      },
      {
        stat: "evasion",
        mode: "flat",
        value: 3
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_142",
    l2SkillId: 142,
    minLevel: 5,
    spCost: 160,
    nameUk: "Майстерність зброї (Weapon Mastery)",
    hintUk: "Пасив: +P. Atk (flat) за рівнем скіла (1 р. — +1.5, 40 р. — +79.4).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 160,
        mpCost: 0,
        power: 2
      },
      {
        level: 2,
        requiredLevel: 10,
        spCost: 910,
        mpCost: 0,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 15,
        spCost: 3300,
        mpCost: 0,
        power: 4
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent",
        value: 8
      },
      {
        stat: "pAtk",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_143",
    l2SkillId: 143,
    minLevel: 43,
    spCost: 35000,
    nameUk: "Cubic Mastery",
    hintUk: "Cubic Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 0,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_147",
    l2SkillId: 147,
    minLevel: 40,
    spCost: 16000,
    nameUk: "Magic Resistance",
    hintUk: "Magic Resistance",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 15,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 0,
        power: 40
      },
      {
        level: 16,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 0,
        power: 42
      },
      {
        level: 17,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 0,
        power: 43
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 19000,
        mpCost: 0,
        power: 44
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 19000,
        mpCost: 0,
        power: 46
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 19000,
        mpCost: 0,
        power: 47
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 29000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 29000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 29000,
        mpCost: 0,
        power: 52
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 41000,
        mpCost: 0,
        power: 54
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 41000,
        mpCost: 0,
        power: 56
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 41000,
        mpCost: 0,
        power: 57
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 71000,
        mpCost: 0,
        power: 59
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 71000,
        mpCost: 0,
        power: 61
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 71000,
        mpCost: 0,
        power: 63
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 92000,
        mpCost: 0,
        power: 64
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 92000,
        mpCost: 0,
        power: 66
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 92000,
        mpCost: 0,
        power: 68
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 70
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 72
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 74
      },
      {
        level: 36,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 76
      },
      {
        level: 37,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 78
      },
      {
        level: 38,
        requiredLevel: 62,
        spCost: 290000,
        mpCost: 0,
        power: 80
      },
      {
        level: 39,
        requiredLevel: 62,
        spCost: 290000,
        mpCost: 0,
        power: 82
      },
      {
        level: 40,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 0,
        power: 84
      },
      {
        level: 41,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 0,
        power: 86
      },
      {
        level: 42,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 0,
        power: 88
      },
      {
        level: 43,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 0,
        power: 91
      },
      {
        level: 44,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 93
      },
      {
        level: 45,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 95
      },
      {
        level: 46,
        requiredLevel: 70,
        spCost: 780000,
        mpCost: 0,
        power: 97
      },
      {
        level: 47,
        requiredLevel: 70,
        spCost: 780000,
        mpCost: 0,
        power: 99
      },
      {
        level: 48,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 0,
        power: 102
      },
      {
        level: 49,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 0,
        power: 104
      },
      {
        level: 50,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 0,
        power: 106
      },
      {
        level: 51,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 0,
        power: 108
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_153",
    l2SkillId: 153,
    minLevel: 20,
    spCost: 4100,
    nameUk: "Shield Mastery",
    hintUk: "Shield Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 4100,
        mpCost: 0,
        power: 50
      },
      {
        level: 2,
        requiredLevel: 28,
        spCost: 15000,
        mpCost: 0,
        power: 70
      }
    ],
    effects: [
      {
        stat: "shieldBlockRate",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_169",
    l2SkillId: 169,
    minLevel: 28,
    spCost: 9200,
    nameUk: "Швидкий крок (Quick Step)",
    hintUk: "Пасив: підвищує швидкість пересування.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 28,
        spCost: 9200,
        mpCost: 0,
        power: 7
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "flat",
        value: 7
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_171",
    l2SkillId: 171,
    minLevel: 43,
    spCost: 35000,
    nameUk: "Майстерність шолома (Helm Mastery)",
    hintUk: "Пасив: додатковий захист і бонуси, поки на голові відповідний шолом.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 0,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 0,
        power: 3
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 0,
        power: 4
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 0,
        power: 4
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 370000,
        mpCost: 0,
        power: 5
      },
      {
        level: 7,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 5
      },
      {
        level: 8,
        requiredLevel: 74,
        spCost: 2100000,
        mpCost: 0,
        power: 6
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat",
        value: 2
      },
      {
        stat: "mpRegen",
        mode: "flat",
        value: 0
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_191",
    l2SkillId: 191,
    minLevel: 43,
    spCost: 53000,
    nameUk: "Focus Mind",
    hintUk: "Focus Mind",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 53000,
        mpCost: 0,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 120000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 55,
        spCost: 270000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 690000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 72,
        spCost: 2200000,
        mpCost: 0,
        power: 3
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "flat",
        value: 1
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_194",
    l2SkillId: 194,
    minLevel: 1,
    spCost: 0,
    nameUk: "Lucky",
    hintUk: "Lucky",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_fighter",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_195",
    l2SkillId: 195,
    minLevel: 20,
    spCost: 2800,
    nameUk: "Breath Boost",
    hintUk: "Breath Boost",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2800,
        mpCost: 0,
        power: 60
      }
    ],
    effects: [
      {
        stat: "fallResist",
        mode: "flat",
        value: 60
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_196",
    l2SkillId: 196,
    minLevel: 43,
    spCost: 53000,
    nameUk: "Holy Blade",
    hintUk: "Holy Blade",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 53000,
        mpCost: 8,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_197",
    l2SkillId: 197,
    minLevel: 40,
    spCost: 30000,
    nameUk: "Святий обладунок (Holy Armor)",
    hintUk: "Пасив: підсилення захисту в обладунках.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 30000,
        mpCost: 0,
        power: 7
      },
      {
        level: 2,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 0,
        power: 10
      }
    ],
    effects: [
      {
        stat: "darkResist",
        mode: "percent",
        value: 7
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_198",
    l2SkillId: 198,
    minLevel: 46,
    spCost: 43000,
    nameUk: "Boost Evasion",
    hintUk: "Boost Evasion",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 0,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 0,
        power: 4
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat",
        value: 2
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_208",
    l2SkillId: 208,
    minLevel: 40,
    spCost: 12000,
    nameUk: "Майстерність лука (Bow Mastery)",
    hintUk: "Пасив: підвищує P. Atk при стрільбі з лука.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 16,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 0,
        power: 105
      },
      {
        level: 17,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 0,
        power: 111
      },
      {
        level: 18,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 0,
        power: 178
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 0,
        power: 189
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 0,
        power: 201
      },
      {
        level: 21,
        requiredLevel: 43,
        spCost: 14000,
        mpCost: 0,
        power: 213
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 226
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 239
      },
      {
        level: 24,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 252
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 266
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 281
      },
      {
        level: 27,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 296
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 0,
        power: 311
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 0,
        power: 328
      },
      {
        level: 30,
        requiredLevel: 52,
        spCost: 45000,
        mpCost: 0,
        power: 344
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 361
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 379
      },
      {
        level: 33,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 397
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 0,
        power: 415
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 0,
        power: 434
      },
      {
        level: 36,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 0,
        power: 453
      },
      {
        level: 37,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 0,
        power: 473
      },
      {
        level: 38,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 0,
        power: 493
      },
      {
        level: 39,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 513
      },
      {
        level: 40,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 534
      },
      {
        level: 41,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 555
      },
      {
        level: 42,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 576
      },
      {
        level: 43,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 597
      },
      {
        level: 44,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 619
      },
      {
        level: 45,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 641
      },
      {
        level: 46,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 663
      },
      {
        level: 47,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 685
      },
      {
        level: 48,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 707
      },
      {
        level: 49,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 0,
        power: 729
      },
      {
        level: 50,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 0,
        power: 751
      },
      {
        level: 51,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 0,
        power: 772
      },
      {
        level: 52,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 0,
        power: 794
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_209",
    l2SkillId: 209,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Майстерність кинжала (Dagger Mastery)",
    hintUk: "Пасив: підвищує P. Atk з кинжалом.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 20
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 21
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 23
      },
      {
        level: 12,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 0,
        power: 25
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 0,
        power: 26
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 0,
        power: 28
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 0,
        power: 30
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 0,
        power: 32
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 0,
        power: 34
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 36
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 38
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 40
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 42
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 45
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 47
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 0,
        power: 49
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 0,
        power: 52
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 0,
        power: 55
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 57
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 60
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 63
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 66
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 69
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 71
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 74
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 78
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 81
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 0,
        power: 84
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 0,
        power: 87
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 90
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 93
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 96
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 100
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 103
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 106
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 109
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 112
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_217",
    l2SkillId: 217,
    minLevel: 40,
    spCost: 16000,
    nameUk: "Sword Blunt Mastery",
    hintUk: "Sword Blunt Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 0,
        power: 13
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 0,
        power: 14
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 0,
        power: 15
      },
      {
        level: 12,
        requiredLevel: 43,
        spCost: 19000,
        mpCost: 0,
        power: 16
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 19000,
        mpCost: 0,
        power: 17
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 19000,
        mpCost: 0,
        power: 18
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 29000,
        mpCost: 0,
        power: 19
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 29000,
        mpCost: 0,
        power: 21
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 29000,
        mpCost: 0,
        power: 22
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 41000,
        mpCost: 0,
        power: 23
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 41000,
        mpCost: 0,
        power: 25
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 41000,
        mpCost: 0,
        power: 26
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 71000,
        mpCost: 0,
        power: 28
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 71000,
        mpCost: 0,
        power: 29
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 71000,
        mpCost: 0,
        power: 31
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 92000,
        mpCost: 0,
        power: 33
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 92000,
        mpCost: 0,
        power: 35
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 92000,
        mpCost: 0,
        power: 36
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 38
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 40
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 42
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 44
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 46
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 290000,
        mpCost: 0,
        power: 48
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 290000,
        mpCost: 0,
        power: 50
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 0,
        power: 52
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 0,
        power: 54
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 0,
        power: 56
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 0,
        power: 58
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 61
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 63
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 780000,
        mpCost: 0,
        power: 65
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 780000,
        mpCost: 0,
        power: 67
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 0,
        power: 69
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 0,
        power: 72
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 0,
        power: 74
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 0,
        power: 76
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_221",
    l2SkillId: 221,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Безшумний рух (Silent Move)",
    hintUk: "Приховане пересування.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 7,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_225",
    l2SkillId: 225,
    minLevel: 43,
    spCost: 35000,
    nameUk: "Акробатичний рух (Acrobatic Move)",
    hintUk: "Пасив: під час бігу підвищує ухилення.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 0,
        power: 5
      },
      {
        level: 3,
        requiredLevel: 55,
        spCost: 160000,
        mpCost: 0,
        power: 6
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat",
        value: 4
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_227",
    l2SkillId: 227,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Майстерність легкої броні (Light Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def і ухилення в легкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 11,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 15
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 16
      },
      {
        level: 13,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 17
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 0,
        power: 18
      },
      {
        level: 15,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 0,
        power: 19
      },
      {
        level: 16,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 0,
        power: 21
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 0,
        power: 22
      },
      {
        level: 18,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 0,
        power: 23
      },
      {
        level: 19,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 0,
        power: 24
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 25
      },
      {
        level: 21,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 27
      },
      {
        level: 22,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 28
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 29
      },
      {
        level: 24,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 30
      },
      {
        level: 25,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 32
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 0,
        power: 33
      },
      {
        level: 27,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 0,
        power: 34
      },
      {
        level: 28,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 0,
        power: 36
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 37
      },
      {
        level: 30,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 39
      },
      {
        level: 31,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 40
      },
      {
        level: 32,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 42
      },
      {
        level: 33,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 43
      },
      {
        level: 34,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 44
      },
      {
        level: 35,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 46
      },
      {
        level: 36,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 48
      },
      {
        level: 37,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 49
      },
      {
        level: 38,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 0,
        power: 51
      },
      {
        level: 39,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 0,
        power: 52
      },
      {
        level: 40,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 54
      },
      {
        level: 41,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 55
      },
      {
        level: 42,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 57
      },
      {
        level: 43,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 59
      },
      {
        level: 44,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 60
      },
      {
        level: 45,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 62
      },
      {
        level: 46,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 63
      },
      {
        level: 47,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 65
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      },
      {
        stat: "evasion",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_230",
    l2SkillId: 230,
    minLevel: 32,
    spCost: 25000,
    nameUk: "Sprint",
    hintUk: "Sprint",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_elven_scout",
      "elf_evas_templar",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_sword_muse",
      "elf_swordsinger",
      "elf_temple_knight",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 32,
        spCost: 25000,
        mpCost: 28,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "flat",
        value: 20
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_231",
    l2SkillId: 231,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Майстерність важкої броні (Heavy Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def (%) у важкій броні (1 р. — +1.9%, 50 р. — +79.3%).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_knight",
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 16,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 54
      },
      {
        level: 17,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 57
      },
      {
        level: 18,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 59
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 62
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 64
      },
      {
        level: 21,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 67
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 70
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 72
      },
      {
        level: 24,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 75
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 78
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 81
      },
      {
        level: 27,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 84
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 87
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 90
      },
      {
        level: 30,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 93
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 96
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 99
      },
      {
        level: 33,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 103
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 106
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 109
      },
      {
        level: 36,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 113
      },
      {
        level: 37,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 0,
        power: 116
      },
      {
        level: 38,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 0,
        power: 120
      },
      {
        level: 39,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 123
      },
      {
        level: 40,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 127
      },
      {
        level: 41,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 0,
        power: 131
      },
      {
        level: 42,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 0,
        power: 134
      },
      {
        level: 43,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 138
      },
      {
        level: 44,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 142
      },
      {
        level: 45,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 0,
        power: 145
      },
      {
        level: 46,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 0,
        power: 149
      },
      {
        level: 47,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 153
      },
      {
        level: 48,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 157
      },
      {
        level: 49,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 0,
        power: 161
      },
      {
        level: 50,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 0,
        power: 164
      },
      {
        level: 51,
        requiredLevel: 74,
        spCost: 960000,
        mpCost: 0,
        power: 168
      },
      {
        level: 52,
        requiredLevel: 74,
        spCost: 960000,
        mpCost: 0,
        power: 172
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_256",
    l2SkillId: 256,
    minLevel: 24,
    spCost: 5000,
    nameUk: "Точність (Accuracy)",
    hintUk: "Підвищує точність. Постійно витрачає MP, поки активна.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 24,
        spCost: 5000,
        mpCost: 1,
        power: 3
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat",
        value: 3
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_263",
    l2SkillId: 263,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Смертельний удар (Deadly Blow)",
    hintUk: "Потужний удар кинжалом.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 36,
        power: 1107
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 37,
        power: 1176
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 38,
        power: 1249
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 38,
        power: 1325
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 40,
        power: 1405
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 12000,
        mpCost: 41,
        power: 1488
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 42,
        power: 1574
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 43,
        power: 1664
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 14000,
        mpCost: 44,
        power: 1757
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 46,
        power: 1853
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 47,
        power: 1953
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 48,
        power: 2057
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 50,
        power: 2164
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 50,
        power: 2274
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 51,
        power: 2388
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 52,
        power: 2505
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 53,
        power: 2625
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 52000,
        mpCost: 55,
        power: 2748
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 56,
        power: 2875
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 57,
        power: 3004
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 58,
        power: 3136
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 60,
        power: 3271
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 61,
        power: 3408
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 61,
        power: 3548
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 62,
        power: 3690
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 63,
        power: 3834
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 65,
        power: 3980
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 66,
        power: 4127
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 67,
        power: 4275
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 68,
        power: 4425
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 69,
        power: 4575
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 70,
        power: 4726
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 71,
        power: 4878
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 72,
        power: 5029
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 73,
        power: 5180
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 74,
        power: 5330
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 75,
        power: 5479
      }
    ],
    effects: [],
    cooldownSec: 11,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_264",
    l2SkillId: 264,
    minLevel: 55,
    spCost: 270000,
    nameUk: "Song of Earth",
    hintUk: "Song of Earth",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 55,
        spCost: 270000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_265",
    l2SkillId: 265,
    minLevel: 52,
    spCost: 210000,
    nameUk: "Song of Life",
    hintUk: "Song of Life",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 210000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_266",
    l2SkillId: 266,
    minLevel: 58,
    spCost: 350000,
    nameUk: "Song of Water",
    hintUk: "Song of Water",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 350000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat",
        value: 3
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_267",
    l2SkillId: 267,
    minLevel: 40,
    spCost: 49000,
    nameUk: "Song of Warding",
    hintUk: "Song of Warding",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 49000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_268",
    l2SkillId: 268,
    minLevel: 46,
    spCost: 85000,
    nameUk: "Song of Wind",
    hintUk: "Song of Wind",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 85000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "flat",
        value: 20
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_269",
    l2SkillId: 269,
    minLevel: 49,
    spCost: 120000,
    nameUk: "Song of Hunter",
    hintUk: "Song of Hunter",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 49,
        spCost: 120000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_270",
    l2SkillId: 270,
    minLevel: 43,
    spCost: 53000,
    nameUk: "Song of Invocation",
    hintUk: "Song of Invocation",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 53000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "darkResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_288",
    l2SkillId: 288,
    minLevel: 43,
    spCost: 35000,
    nameUk: "Guard Stance",
    hintUk: "Guard Stance",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 8,
        power: 121
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 10,
        power: 161
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 12,
        power: 212
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 13,
        power: 256
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      },
      {
        stat: "shieldBlockRate",
        mode: "flat",
        value: 50
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_291",
    l2SkillId: 291,
    minLevel: 52,
    spCost: 120000,
    nameUk: "Остання фортеця (Final Fortress)",
    hintUk: "Пасив: більший P. Def при низькому HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 0,
        power: 116
      },
      {
        level: 2,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 0,
        power: 129
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 0,
        power: 141
      },
      {
        level: 4,
        requiredLevel: 60,
        spCost: 220000,
        mpCost: 0,
        power: 150
      },
      {
        level: 5,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 0,
        power: 159
      },
      {
        level: 6,
        requiredLevel: 64,
        spCost: 370000,
        mpCost: 0,
        power: 168
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 0,
        power: 177
      },
      {
        level: 8,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 187
      },
      {
        level: 9,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 0,
        power: 196
      },
      {
        level: 10,
        requiredLevel: 72,
        spCost: 1200000,
        mpCost: 0,
        power: 206
      },
      {
        level: 11,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 0,
        power: 215
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_296",
    l2SkillId: 296,
    minLevel: 46,
    spCost: 43000,
    nameUk: "Rest of Chameleon",
    hintUk: "Rest of Chameleon",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 9,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_303",
    l2SkillId: 303,
    minLevel: 46,
    spCost: 50000,
    nameUk: "Soul of Sagittarius",
    hintUk: "Soul of Sagittarius",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_moonlight_sentinel",
      "elf_silver_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 0,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 58,
        spCost: 210000,
        mpCost: 0,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 930000,
        mpCost: 0,
        power: 1
      }
    ],
    effects: [
      {
        stat: "maxMp",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_304",
    l2SkillId: 304,
    minLevel: 66,
    spCost: 1200000,
    nameUk: "Song of Vitality",
    hintUk: "Song of Vitality",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 1200000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_305",
    l2SkillId: 305,
    minLevel: 74,
    spCost: 3900000,
    nameUk: "Song of Vengeance",
    hintUk: "Song of Vengeance",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 74,
        spCost: 3900000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "reflect",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_306",
    l2SkillId: 306,
    minLevel: 62,
    spCost: 570000,
    nameUk: "Song of Flame Guard",
    hintUk: "Song of Flame Guard",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 62,
        spCost: 570000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "fireResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_308",
    l2SkillId: 308,
    minLevel: 70,
    spCost: 1500000,
    nameUk: "Song of Storm Guard",
    hintUk: "Song of Storm Guard",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse",
      "elf_swordsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 70,
        spCost: 1500000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "windResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_312",
    l2SkillId: 312,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Жорстка стійка (Vicious Stance)",
    hintUk: "Підвищує силу критичного удару. Постійно витрачає MP, поки активна.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_elven_scout",
      "elf_moonlight_sentinel",
      "elf_plainswalker",
      "elf_silver_ranger",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 7,
        power: 139
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 35000,
        mpCost: 8,
        power: 166
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 43000,
        mpCost: 9,
        power: 196
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 9,
        power: 229
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 10,
        power: 266
      },
      {
        level: 11,
        requiredLevel: 55,
        spCost: 160000,
        mpCost: 10,
        power: 306
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 11,
        power: 349
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 260000,
        mpCost: 11,
        power: 379
      },
      {
        level: 14,
        requiredLevel: 62,
        spCost: 370000,
        mpCost: 12,
        power: 410
      },
      {
        level: 15,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 12,
        power: 443
      },
      {
        level: 16,
        requiredLevel: 66,
        spCost: 640000,
        mpCost: 13,
        power: 475
      },
      {
        level: 17,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 13,
        power: 509
      },
      {
        level: 18,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 13,
        power: 542
      },
      {
        level: 19,
        requiredLevel: 72,
        spCost: 1400000,
        mpCost: 14,
        power: 576
      },
      {
        level: 20,
        requiredLevel: 74,
        spCost: 2100000,
        mpCost: 14,
        power: 609
      }
    ],
    effects: [
      {
        stat: "critDamage",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_316",
    l2SkillId: 316,
    minLevel: 60,
    spCost: 220000,
    nameUk: "Aegis",
    hintUk: "Aegis",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 60,
        spCost: 220000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "shieldDef",
        mode: "percent",
        value: 100
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_321",
    l2SkillId: 321,
    minLevel: 66,
    spCost: 320000,
    nameUk: "Blinding Blow",
    hintUk: "Blinding Blow",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_plainswalker",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 133,
        power: 2751
      },
      {
        level: 2,
        requiredLevel: 66,
        spCost: 320000,
        mpCost: 135,
        power: 2850
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 137,
        power: 2950
      },
      {
        level: 4,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 139,
        power: 3050
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 141,
        power: 3151
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 143,
        power: 3252
      },
      {
        level: 7,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 145,
        power: 3353
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 147,
        power: 3453
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 149,
        power: 3553
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 151,
        power: 3653
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "flat",
        value: 40
      }
    ],
    cooldownSec: 180,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_322",
    l2SkillId: 322,
    minLevel: 64,
    spCost: 370000,
    nameUk: "Фортеця щита (Shield Fortress)",
    hintUk: "Тимчасово різко підвищує захист, поки персонаж з щитом.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_temple_knight"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 64,
        spCost: 370000,
        mpCost: 12,
        power: 446
      },
      {
        level: 2,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 13,
        power: 469
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 13,
        power: 491
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 13,
        power: 514
      },
      {
        level: 5,
        requiredLevel: 72,
        spCost: 1200000,
        mpCost: 14,
        power: 537
      },
      {
        level: 6,
        requiredLevel: 74,
        spCost: 1900000,
        mpCost: 14,
        power: 560
      }
    ],
    effects: [
      {
        stat: "shieldFortressDefense",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_323",
    l2SkillId: 323,
    minLevel: 66,
    spCost: 700000,
    nameUk: "Дух Яструба (Soul of Hawkeye)",
    hintUk: "Пасив: додаткові бонуси до атаки, криту та дальності для Сокола.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_moonlight_sentinel",
      "elf_silver_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 130,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 1800,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_324",
    l2SkillId: 324,
    minLevel: 72,
    spCost: 1500000,
    nameUk: "Збільшення дальності (Increase Range)",
    hintUk: "Пасив: збільшує дальність атаки з луком.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_moonlight_sentinel",
      "elf_silver_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 72,
        spCost: 1500000,
        mpCost: 200,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 1800,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_328",
    l2SkillId: 328,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Мудрість (Wisdom)",
    hintUk: "Пасив: підвищує стійкість до утримання, сну та ментальних ефектів.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_moonlight_sentinel",
      "elf_sword_muse",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "percent",
        value: 20
      },
      {
        stat: "sleepResist",
        mode: "percent",
        value: 20
      },
      {
        stat: "mentalResist",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_329",
    l2SkillId: 329,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Здоров’я (Health)",
    hintUk: "Пасив: підвищує стійкість до отрути та кровотечі.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_evas_templar",
      "elf_sword_muse"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "poisonResist",
        mode: "percent",
        value: 20
      },
      {
        stat: "bleedResist",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_330",
    l2SkillId: 330,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Майстерність скілів (Skill Mastery)",
    hintUk: "Пасив: шанс повторно застосувати вміння або подовжити ефект.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_moonlight_sentinel",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "skillMastery",
        mode: "flat",
        value: 2
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_334",
    l2SkillId: 334,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Швидкість атаки (Attack Speed)",
    hintUk: "Пасив: підвищує швидкість атаки з луком.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_moonlight_sentinel",
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 36,
        power: 0
      }
    ],
    effects: [
      {
        stat: "skillMastery",
        mode: "multiplier",
        value: 10
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_335",
    l2SkillId: 335,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Стійкість (Fortitude)",
    hintUk: "Пасив: підвищення стійкості до станів.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_evas_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 35,
        power: 0
      }
    ],
    effects: [
      {
        stat: "shockResist",
        mode: "percent",
        value: 30
      },
      {
        stat: "paralyzeResist",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_341",
    l2SkillId: 341,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Дотик життя (Touch of Life)",
    hintUk: "Миттєве зцілення цілі.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_evas_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "cancelResist",
        mode: "percent",
        value: 60
      },
      {
        stat: "debuffResist",
        mode: "percent",
        value: 30
      },
      {
        stat: "healPower",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 1200,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_343",
    l2SkillId: 343,
    minLevel: 76,
    spCost: 15000000,
    nameUk: "Смертельний постріл (Lethal Shot)",
    hintUk: "Потужний постріл з лука. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_moonlight_sentinel"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 15000000,
        mpCost: 170,
        power: 5132
      }
    ],
    effects: [],
    cooldownSec: 30,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_344",
    l2SkillId: 344,
    minLevel: 76,
    spCost: 15000000,
    nameUk: "Смертельний удар (Lethal Blow)",
    hintUk: "Потенційно смертельний удар кинжалом.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 15000000,
        mpCost: 85,
        power: 5773
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_351",
    l2SkillId: 351,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Magical Mirror",
    hintUk: "Magical Mirror",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_evas_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 71,
        power: 0
      }
    ],
    effects: [
      {
        stat: "reflectSkillMagic",
        mode: "percent",
        value: 30
      },
      {
        stat: "reflectSkillPhysic",
        mode: "percent",
        value: 10
      }
    ],
    cooldownSec: 600,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_352",
    l2SkillId: 352,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Shield Bash",
    hintUk: "Shield Bash",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_evas_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 35,
        power: 0
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_354",
    l2SkillId: 354,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Постріл у сухожилля (Hamstring Shot)",
    hintUk: "Завдає шкоди й сповільнює ціль. Потрібен лук.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_moonlight_sentinel"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 129,
        power: 1973
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 60,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_355",
    l2SkillId: 355,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Focus Death",
    hintUk: "Focus Death",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 71,
        power: 0
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent"
      },
      {
        stat: "critDamage",
        mode: "percent"
      }
    ],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_356",
    l2SkillId: 356,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Фокус шансу (Focus Chance)",
    hintUk: "Баф: підвищує шанс криту й успіх смертельних ударів кинжалом.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 71,
        power: 0
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent"
      }
    ],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_358",
    l2SkillId: 358,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Блеф (Bluff)",
    hintUk: "Обман: ворог оголяє спину; шок.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_wind_rider"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 35,
        power: 0
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "flat"
      }
    ],
    cooldownSec: 30,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_368",
    l2SkillId: 368,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Відплата (Vengeance)",
    hintUk: "Потужний контрудар після захисту.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_evas_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 105,
        power: 3994
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat",
        value: 5400
      },
      {
        stat: "mDef",
        mode: "flat",
        value: 4050
      },
      {
        stat: "immobile",
        mode: "flat",
        value: 1
      },
      {
        stat: "taunt",
        mode: "flat",
        value: 1
      }
    ],
    cooldownSec: 1800,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_369",
    l2SkillId: 369,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Evade Shot",
    hintUk: "Evade Shot",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "elf_moonlight_sentinel"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 130,
        power: 2020
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat",
        value: 6
      }
    ],
    cooldownSec: 300,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_370",
    l2SkillId: 370,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Song of Meditation",
    hintUk: "Song of Meditation",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_371",
    l2SkillId: 371,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Song of Renewal",
    hintUk: "Song of Renewal",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "cooldownReduction",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_372",
    l2SkillId: 372,
    minLevel: 78,
    spCost: 64000000,
    nameUk: "Song of Champion",
    hintUk: "Song of Champion",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_sword_muse"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 64000000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [
      {
        stat: "cooldownReduction",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  }
];

/** Активні / toggle l2 id (пасивки виключено). */
export const ELVEN_FIGHTER_ACTIVE_L2_IDS: readonly number[] = [3, 10, 12, 15, 16, 18, 19, 21, 24, 27, 28, 30, 51, 56, 58, 60, 61, 67, 77, 91, 96, 98, 99, 101, 102, 107, 110, 111, 112, 123, 196, 221, 230, 256, 263, 264, 265, 266, 267, 268, 269, 270, 288, 296, 303, 304, 305, 306, 308, 312, 321, 322, 323, 324, 334, 335, 341, 343, 344, 351, 352, 354, 355, 356, 358, 368, 369, 370, 371, 372];
