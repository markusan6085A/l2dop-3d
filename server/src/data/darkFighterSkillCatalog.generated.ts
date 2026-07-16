/**
 * Автоген з text-rpg (`npm run gen:race-fighter-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const DARK_FIGHTER_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
  {
    battleId: "l2_2",
    l2SkillId: 2,
    minLevel: 40,
    spCost: 43000,
    nameUk: "Confusion",
    hintUk: "Confusion",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 5,
        requiredLevel: 40,
        spCost: 43000,
        mpCost: 35,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 38,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 66000,
        mpCost: 42,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 44,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 52,
        spCost: 170000,
        mpCost: 48,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 55,
        spCost: 200000,
        mpCost: 50,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 240000,
        mpCost: 54,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 55,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 62,
        spCost: 440000,
        mpCost: 58,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 60,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 62,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 970000,
        mpCost: 64,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 65,
        power: 0
      },
      {
        level: 18,
        requiredLevel: 72,
        spCost: 1500000,
        mpCost: 67,
        power: 0
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mentalResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
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
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
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
        spCost: 950,
        mpCost: 17,
        power: 60
      },
      {
        level: 8,
        requiredLevel: 15,
        spCost: 950,
        mpCost: 18,
        power: 65
      },
      {
        level: 9,
        requiredLevel: 15,
        spCost: 950,
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
    battleId: "l2_16",
    l2SkillId: 16,
    minLevel: 20,
    spCost: 1000,
    nameUk: "Смертельний удар (Mortal Blow)",
    hintUk: "Потенційно смертельна атака. Використовується лише з кинжалами. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 20,
        spCost: 1000,
        mpCost: 19,
        power: 268
      },
      {
        level: 11,
        requiredLevel: 20,
        spCost: 1000,
        mpCost: 20,
        power: 291
      },
      {
        level: 12,
        requiredLevel: 20,
        spCost: 1000,
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
        spCost: 2900,
        mpCost: 25,
        power: 494
      },
      {
        level: 17,
        requiredLevel: 28,
        spCost: 2900,
        mpCost: 26,
        power: 531
      },
      {
        level: 18,
        requiredLevel: 28,
        spCost: 2900,
        mpCost: 27,
        power: 571
      },
      {
        level: 19,
        requiredLevel: 32,
        spCost: 4800,
        mpCost: 28,
        power: 656
      },
      {
        level: 20,
        requiredLevel: 32,
        spCost: 4800,
        mpCost: 28,
        power: 703
      },
      {
        level: 21,
        requiredLevel: 32,
        spCost: 4800,
        mpCost: 29,
        power: 752
      },
      {
        level: 22,
        requiredLevel: 36,
        spCost: 7400,
        mpCost: 32,
        power: 859
      },
      {
        level: 23,
        requiredLevel: 36,
        spCost: 7400,
        mpCost: 33,
        power: 916
      },
      {
        level: 24,
        requiredLevel: 36,
        spCost: 7400,
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
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
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
        spCost: 11000,
        mpCost: 54,
        power: 1166
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 55,
        power: 1195
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 57,
        power: 1224
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 58,
        power: 1254
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 60,
        power: 1283
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 61,
        power: 1312
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 63,
        power: 1342
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 64,
        power: 1371
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 66,
        power: 1400
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 68,
        power: 1430
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 69,
        power: 1459
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 70,
        power: 1488
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 43000,
        mpCost: 72,
        power: 1513
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 43000,
        mpCost: 74,
        power: 1541
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 43000,
        mpCost: 75,
        power: 1568
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 77,
        power: 1597
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 78,
        power: 1625
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 80,
        power: 1653
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 90000,
        mpCost: 81,
        power: 1672
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 90000,
        mpCost: 83,
        power: 1697
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 85,
        power: 1721
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 86,
        power: 1745
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 210000,
        mpCost: 88,
        power: 1769
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 210000,
        mpCost: 89,
        power: 1793
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 90,
        power: 1811
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 92,
        power: 1831
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 260000,
        mpCost: 94,
        power: 1850
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 260000,
        mpCost: 95,
        power: 1869
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 96,
        power: 1888
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 97,
        power: 1905
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 99,
        power: 1921
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 100,
        power: 1936
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 101,
        power: 1950
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 680000,
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
    spCost: 11000,
    nameUk: "Подвійний постріл (Double Shot)",
    hintUk: "Дві стріли підряд по одній цілі. Лише з луком. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 80,
        power: 984
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 82,
        power: 1046
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 85,
        power: 1110
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 85,
        power: 1178
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 87,
        power: 1249
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 90,
        power: 1322
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 93,
        power: 1399
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 95,
        power: 1479
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 98,
        power: 1562
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 101,
        power: 1647
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 104,
        power: 1736
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 107,
        power: 1828
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 109,
        power: 1923
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 110,
        power: 2021
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 112,
        power: 2123
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 115,
        power: 2227
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 118,
        power: 2333
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 121,
        power: 2443
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 124,
        power: 2555
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 126,
        power: 2670
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 129,
        power: 2788
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 132,
        power: 2908
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 135,
        power: 3030
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 135,
        power: 3154
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 138,
        power: 3280
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 140,
        power: 3408
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 143,
        power: 3537
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 145,
        power: 3668
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 148,
        power: 3800
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 150,
        power: 3933
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 153,
        power: 4067
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 155,
        power: 4201
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 157,
        power: 4336
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 160,
        power: 4470
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 162,
        power: 4604
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 164,
        power: 4738
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 820000,
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
    battleId: "l2_22",
    l2SkillId: 22,
    minLevel: 46,
    spCost: 32000,
    nameUk: "Summon Vampiric Cubic",
    hintUk: "Summon Vampiric Cubic",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 32000,
        mpCost: 38,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 55,
        spCost: 130000,
        mpCost: 50,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 130000,
        mpCost: 50,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 55,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 240000,
        mpCost: 58,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 62,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 74,
        spCost: 880000,
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
    battleId: "l2_27",
    l2SkillId: 27,
    minLevel: 20,
    spCost: 2800,
    nameUk: "Відмикання (Unlock)",
    hintUk: "Відкриває двері й скрині; успіх і вимоги до ключів залежать від рангу.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2800,
        mpCost: 19,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 24,
        spCost: 5000,
        mpCost: 22,
        power: 50
      },
      {
        level: 3,
        requiredLevel: 28,
        spCost: 8500,
        mpCost: 25,
        power: 75
      },
      {
        level: 4,
        requiredLevel: 32,
        spCost: 14000,
        mpCost: 28,
        power: 100
      },
      {
        level: 5,
        requiredLevel: 36,
        spCost: 22000,
        mpCost: 31,
        power: 100
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
    spCost: 10000,
    nameUk: "Aggression",
    hintUk: "Aggression",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 13,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 33,
        power: 1078
      },
      {
        level: 14,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 34,
        power: 1107
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 35,
        power: 1136
      },
      {
        level: 16,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 36,
        power: 1165
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 37,
        power: 1194
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 38,
        power: 1223
      },
      {
        level: 19,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 39,
        power: 1254
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 40,
        power: 1283
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 41,
        power: 1312
      },
      {
        level: 22,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 42,
        power: 1342
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 43,
        power: 1371
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 44,
        power: 1400
      },
      {
        level: 25,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 45,
        power: 1430
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 46,
        power: 1460
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 47,
        power: 1490
      },
      {
        level: 28,
        requiredLevel: 55,
        spCost: 43000,
        mpCost: 48,
        power: 1513
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 43000,
        mpCost: 49,
        power: 1541
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 43000,
        mpCost: 50,
        power: 1569
      },
      {
        level: 31,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 51,
        power: 1595
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 52,
        power: 1621
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 53,
        power: 1647
      },
      {
        level: 34,
        requiredLevel: 60,
        spCost: 90000,
        mpCost: 54,
        power: 1674
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 90000,
        mpCost: 55,
        power: 1701
      },
      {
        level: 36,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 56,
        power: 1728
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 57,
        power: 1755
      },
      {
        level: 38,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 58,
        power: 1782
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 59,
        power: 1809
      },
      {
        level: 40,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 60,
        power: 1836
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 61,
        power: 1863
      },
      {
        level: 42,
        requiredLevel: 68,
        spCost: 240000,
        mpCost: 62,
        power: 1890
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 240000,
        mpCost: 63,
        power: 1917
      },
      {
        level: 44,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 64,
        power: 1888
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 65,
        power: 1905
      },
      {
        level: 46,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 66,
        power: 1922
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 67,
        power: 1939
      },
      {
        level: 48,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 68,
        power: 1956
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 69,
        power: 1973
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_33",
    l2SkillId: 33,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Summon Phantom Cubic",
    hintUk: "Summon Phantom Cubic",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 35,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 49,
        spCost: 40000,
        mpCost: 42,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 55,
        spCost: 94000,
        mpCost: 48,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 54,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 58,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 510000,
        mpCost: 65,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 74,
        spCost: 1400000,
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
    battleId: "l2_56",
    l2SkillId: 56,
    minLevel: 20,
    spCost: 1000,
    nameUk: "Силовий постріл (Power Shot)",
    hintUk: "Смертельний постріл з лука. Можливий надудар. Лише з луком.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 20,
        spCost: 1000,
        mpCost: 43,
        power: 239
      },
      {
        level: 11,
        requiredLevel: 20,
        spCost: 1000,
        mpCost: 44,
        power: 258
      },
      {
        level: 12,
        requiredLevel: 20,
        spCost: 1000,
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
        spCost: 2900,
        mpCost: 54,
        power: 440
      },
      {
        level: 17,
        requiredLevel: 28,
        spCost: 2900,
        mpCost: 57,
        power: 472
      },
      {
        level: 18,
        requiredLevel: 28,
        spCost: 2900,
        mpCost: 59,
        power: 507
      },
      {
        level: 19,
        requiredLevel: 32,
        spCost: 4800,
        mpCost: 62,
        power: 584
      },
      {
        level: 20,
        requiredLevel: 32,
        spCost: 4800,
        mpCost: 62,
        power: 625
      },
      {
        level: 21,
        requiredLevel: 32,
        spCost: 4800,
        mpCost: 65,
        power: 669
      },
      {
        level: 22,
        requiredLevel: 36,
        spCost: 7400,
        mpCost: 69,
        power: 763
      },
      {
        level: 23,
        requiredLevel: 36,
        spCost: 7400,
        mpCost: 72,
        power: 814
      },
      {
        level: 24,
        requiredLevel: 36,
        spCost: 7400,
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
    battleId: "l2_70",
    l2SkillId: 70,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Drain Health",
    hintUk: "Drain Health",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 17,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 25,
        power: 49
      },
      {
        level: 18,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 27,
        power: 50
      },
      {
        level: 19,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 27,
        power: 52
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 28,
        power: 53
      },
      {
        level: 21,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 28,
        power: 55
      },
      {
        level: 22,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 29,
        power: 57
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 30,
        power: 58
      },
      {
        level: 24,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 30,
        power: 60
      },
      {
        level: 25,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 32,
        power: 61
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 32,
        power: 63
      },
      {
        level: 27,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 33,
        power: 65
      },
      {
        level: 28,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 34,
        power: 66
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 34,
        power: 68
      },
      {
        level: 30,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 35,
        power: 70
      },
      {
        level: 31,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 35,
        power: 72
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 37,
        power: 73
      },
      {
        level: 33,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 38,
        power: 75
      },
      {
        level: 34,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 38,
        power: 77
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 39,
        power: 78
      },
      {
        level: 36,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 40,
        power: 80
      },
      {
        level: 37,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 40,
        power: 82
      },
      {
        level: 38,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 42,
        power: 84
      },
      {
        level: 39,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 42,
        power: 85
      },
      {
        level: 40,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 43,
        power: 87
      },
      {
        level: 41,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 44,
        power: 89
      },
      {
        level: 42,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 44,
        power: 90
      },
      {
        level: 43,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 45,
        power: 92
      },
      {
        level: 44,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 45,
        power: 94
      },
      {
        level: 45,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 47,
        power: 96
      },
      {
        level: 46,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 48,
        power: 97
      },
      {
        level: 47,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 48,
        power: 99
      },
      {
        level: 48,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 49,
        power: 100
      },
      {
        level: 49,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 49,
        power: 102
      },
      {
        level: 50,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 50,
        power: 104
      },
      {
        level: 51,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 50,
        power: 105
      },
      {
        level: 52,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 52,
        power: 107
      },
      {
        level: 53,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 52,
        power: 108
      }
    ],
    effects: [
      {
        stat: "vampirism",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: 15,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_77",
    l2SkillId: 77,
    minLevel: 28,
    spCost: 8500,
    nameUk: "Attack Aura",
    hintUk: "Attack Aura",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 28,
        spCost: 8500,
        mpCost: 25,
        power: 12
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
    battleId: "l2_84",
    l2SkillId: 84,
    minLevel: 55,
    spCost: 200000,
    nameUk: "Poison Blade Dance",
    hintUk: "Poison Blade Dance",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 55,
        spCost: 200000,
        mpCost: 100,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 110,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 72,
        spCost: 1500000,
        mpCost: 133,
        power: 1
      }
    ],
    effects: [],
    cooldownSec: 60,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_91",
    l2SkillId: 91,
    minLevel: 20,
    spCost: 2800,
    nameUk: "Defense Aura",
    hintUk: "Defense Aura",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 20,
        spCost: 2800,
        mpCost: 20,
        power: 12
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
    minLevel: 24,
    spCost: 5000,
    nameUk: "Bleed",
    hintUk: "Bleed",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 24,
        spCost: 5000,
        mpCost: 32,
        power: 65
      },
      {
        level: 2,
        requiredLevel: 32,
        spCost: 14000,
        mpCost: 41,
        power: 85
      }
    ],
    effects: [],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_99",
    l2SkillId: 99,
    minLevel: 32,
    spCost: 14000,
    nameUk: "Швидкий постріл (Rapid Shot)",
    hintUk: "Підвищує швидкість стрільби з лука.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 32,
        spCost: 14000,
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
    spCost: 11000,
    nameUk: "Оглушливий постріл (Stun Shot)",
    hintUk: "Оглушує й завдає шкоди з лука. Лише з луками. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 80,
        power: 369
      },
      {
        level: 5,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 82,
        power: 392
      },
      {
        level: 6,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 85,
        power: 417
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 85,
        power: 442
      },
      {
        level: 8,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 87,
        power: 469
      },
      {
        level: 9,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 90,
        power: 496
      },
      {
        level: 10,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 93,
        power: 525
      },
      {
        level: 11,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 95,
        power: 555
      },
      {
        level: 12,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 98,
        power: 586
      },
      {
        level: 13,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 101,
        power: 618
      },
      {
        level: 14,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 104,
        power: 651
      },
      {
        level: 15,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 107,
        power: 686
      },
      {
        level: 16,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 109,
        power: 722
      },
      {
        level: 17,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 110,
        power: 758
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 112,
        power: 796
      },
      {
        level: 19,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 115,
        power: 835
      },
      {
        level: 20,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 118,
        power: 875
      },
      {
        level: 21,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 121,
        power: 916
      },
      {
        level: 22,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 124,
        power: 959
      },
      {
        level: 23,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 126,
        power: 1002
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 129,
        power: 1046
      },
      {
        level: 25,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 132,
        power: 1091
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 135,
        power: 1136
      },
      {
        level: 27,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 135,
        power: 1183
      },
      {
        level: 28,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 138,
        power: 1230
      },
      {
        level: 29,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 140,
        power: 1278
      },
      {
        level: 30,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 143,
        power: 1327
      },
      {
        level: 31,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 145,
        power: 1376
      },
      {
        level: 32,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 148,
        power: 1425
      },
      {
        level: 33,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 150,
        power: 1475
      },
      {
        level: 34,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 153,
        power: 1525
      },
      {
        level: 35,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 155,
        power: 1576
      },
      {
        level: 36,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 157,
        power: 1626
      },
      {
        level: 37,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 160,
        power: 1677
      },
      {
        level: 38,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 162,
        power: 1727
      },
      {
        level: 39,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 164,
        power: 1777
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 820000,
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
    battleId: "l2_103",
    l2SkillId: 103,
    minLevel: 46,
    spCost: 40000,
    nameUk: "Чума трупа (Corpse Plague)",
    hintUk: "Отрута по площі навколо трупа.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 40000,
        mpCost: 42,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 58,
        spCost: 140000,
        mpCost: 54,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 58,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 510000,
        mpCost: 65,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_105",
    l2SkillId: 105,
    minLevel: 40,
    spCost: 22000,
    nameUk: "Freezing Strike",
    hintUk: "Freezing Strike",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 18,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 18,
        power: 31
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 23000,
        mpCost: 19,
        power: 33
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 23000,
        mpCost: 19,
        power: 34
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 33000,
        mpCost: 20,
        power: 36
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 33000,
        mpCost: 22,
        power: 37
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 45000,
        mpCost: 23,
        power: 39
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 45000,
        mpCost: 23,
        power: 40
      },
      {
        level: 11,
        requiredLevel: 52,
        spCost: 83000,
        mpCost: 24,
        power: 42
      },
      {
        level: 12,
        requiredLevel: 52,
        spCost: 83000,
        mpCost: 24,
        power: 43
      },
      {
        level: 13,
        requiredLevel: 55,
        spCost: 100000,
        mpCost: 25,
        power: 45
      },
      {
        level: 14,
        requiredLevel: 55,
        spCost: 100000,
        mpCost: 25,
        power: 46
      },
      {
        level: 15,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 27,
        power: 48
      },
      {
        level: 16,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 28,
        power: 49
      },
      {
        level: 17,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 28,
        power: 51
      },
      {
        level: 18,
        requiredLevel: 62,
        spCost: 440000,
        mpCost: 29,
        power: 53
      },
      {
        level: 19,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 30,
        power: 56
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 32,
        power: 58
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 970000,
        mpCost: 33,
        power: 59
      },
      {
        level: 22,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 33,
        power: 61
      },
      {
        level: 23,
        requiredLevel: 72,
        spCost: 1500000,
        mpCost: 34,
        power: 63
      },
      {
        level: 24,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 35,
        power: 65
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 8,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_110",
    l2SkillId: 110,
    minLevel: 20,
    spCost: 4700,
    nameUk: "Ultimate Defense",
    hintUk: "Ultimate Defense",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 4700,
        mpCost: 19,
        power: 1
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat",
        value: 1800
      },
      {
        stat: "mDef",
        mode: "flat",
        value: 1350
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
    spCost: 8500,
    nameUk: "Абсолютне ухилення (Ultimate Evasion)",
    hintUk: "Сильно підвищує ухилення на короткий час.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 28,
        spCost: 8500,
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
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
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
        spCost: 22000,
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
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
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
    battleId: "l2_115",
    l2SkillId: 115,
    minLevel: 40,
    spCost: 43000,
    nameUk: "Power Break",
    hintUk: "Power Break",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 43000,
        mpCost: 18,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 19,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 46,
        spCost: 66000,
        mpCost: 22,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 23,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 170000,
        mpCost: 24,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 55,
        spCost: 200000,
        mpCost: 25,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 58,
        spCost: 240000,
        mpCost: 28,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 28,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 62,
        spCost: 440000,
        mpCost: 29,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 30,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 32,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 68,
        spCost: 970000,
        mpCost: 33,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 33,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 72,
        spCost: 1500000,
        mpCost: 34,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 35,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_122",
    l2SkillId: 122,
    minLevel: 40,
    spCost: 43000,
    nameUk: "Hex",
    hintUk: "Hex",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 43000,
        mpCost: 18,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 19,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 46,
        spCost: 66000,
        mpCost: 22,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 23,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 170000,
        mpCost: 24,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 55,
        spCost: 200000,
        mpCost: 25,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 58,
        spCost: 240000,
        mpCost: 28,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 28,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 62,
        spCost: 440000,
        mpCost: 29,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 30,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 32,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 68,
        spCost: 970000,
        mpCost: 33,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 33,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 72,
        spCost: 1500000,
        mpCost: 34,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 35,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_129",
    l2SkillId: 129,
    minLevel: 49,
    spCost: 89000,
    nameUk: "Poison",
    hintUk: "Poison",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 23,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 240000,
        mpCost: 28,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 32,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 35,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 9,
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
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
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
        spCost: 2900,
        mpCost: 0,
        power: 4
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
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
    battleId: "l2_142",
    l2SkillId: 142,
    minLevel: 5,
    spCost: 160,
    nameUk: "Майстерність зброї (Weapon Mastery)",
    hintUk: "Пасив: +P. Atk (flat) за рівнем скіла (1 р. — +1.5, 40 р. — +79.4).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
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
        spCost: 1400,
        mpCost: 0,
        power: 13
      },
      {
        level: 5,
        requiredLevel: 15,
        spCost: 1400,
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
    battleId: "l2_143",
    l2SkillId: 143,
    minLevel: 43,
    spCost: 32000,
    nameUk: "Cubic Mastery",
    hintUk: "Cubic Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 32000,
        mpCost: 0,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 55,
        spCost: 130000,
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
    battleId: "l2_144",
    l2SkillId: 144,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Майстерність дуального меча (Dual Weapon Mastery)",
    hintUk: "Пасив: підвищує ефективність ударів дуальним мечем.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 23
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 25
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 27
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 29
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 30
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 32
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 35
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 37
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 39
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 41
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 44
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 46
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 0,
        power: 49
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 0,
        power: 51
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 0,
        power: 54
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 57
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 60
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 63
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 0,
        power: 66
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 0,
        power: 69
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 0,
        power: 72
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 76
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 79
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 82
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 86
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 89
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 93
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 96
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 100
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 0,
        power: 103
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 0,
        power: 107
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 111
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 114
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 0,
        power: 118
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 0,
        power: 122
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 0,
        power: 125
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 0,
        power: 129
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_147",
    l2SkillId: 147,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Magic Resistance",
    hintUk: "Magic Resistance",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 15,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 40
      },
      {
        level: 16,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 42
      },
      {
        level: 17,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 43
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 44
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 46
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 47
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 52
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 54
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 56
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 57
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 0,
        power: 59
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 0,
        power: 61
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 0,
        power: 63
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 64
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 66
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 0,
        power: 68
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 0,
        power: 70
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 0,
        power: 72
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 0,
        power: 74
      },
      {
        level: 36,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 76
      },
      {
        level: 37,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 78
      },
      {
        level: 38,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 80
      },
      {
        level: 39,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 82
      },
      {
        level: 40,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 84
      },
      {
        level: 41,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 86
      },
      {
        level: 42,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 88
      },
      {
        level: 43,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 91
      },
      {
        level: 44,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 0,
        power: 93
      },
      {
        level: 45,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 0,
        power: 95
      },
      {
        level: 46,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 97
      },
      {
        level: 47,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 99
      },
      {
        level: 48,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 0,
        power: 102
      },
      {
        level: 49,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 0,
        power: 104
      },
      {
        level: 50,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 0,
        power: 106
      },
      {
        level: 51,
        requiredLevel: 74,
        spCost: 1200000,
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
    spCost: 4700,
    nameUk: "Shield Mastery",
    hintUk: "Shield Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 4700,
        mpCost: 0,
        power: 60
      },
      {
        level: 2,
        requiredLevel: 28,
        spCost: 13000,
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
    spCost: 8500,
    nameUk: "Швидкий крок (Quick Step)",
    hintUk: "Пасив: підвищує швидкість пересування.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 28,
        spCost: 8500,
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
    spCost: 33000,
    nameUk: "Майстерність шолома (Helm Mastery)",
    hintUk: "Пасив: додатковий захист і бонуси, поки на голові відповідний шолом.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 33000,
        mpCost: 0,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 46,
        spCost: 47000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 75000,
        mpCost: 0,
        power: 1
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 0,
        power: 1
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 0,
        power: 1
      },
      {
        level: 7,
        requiredLevel: 68,
        spCost: 600000,
        mpCost: 0,
        power: 1
      },
      {
        level: 8,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 0,
        power: 1
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
    spCost: 46000,
    nameUk: "Focus Mind",
    hintUk: "Focus Mind",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 0,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 55,
        spCost: 200000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 72,
        spCost: 1500000,
        mpCost: 0,
        power: 3
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_193",
    l2SkillId: 193,
    minLevel: 24,
    spCost: 5000,
    nameUk: "Critical Power",
    hintUk: "Critical Power",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 24,
        spCost: 5000,
        mpCost: 0,
        power: 32
      },
      {
        level: 2,
        requiredLevel: 32,
        spCost: 14000,
        mpCost: 0,
        power: 56
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
    battleId: "l2_194",
    l2SkillId: 194,
    minLevel: 1,
    spCost: 0,
    nameUk: "Lucky",
    hintUk: "Lucky",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
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
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
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
    battleId: "l2_198",
    l2SkillId: 198,
    minLevel: 24,
    spCost: 5000,
    nameUk: "Boost Evasion",
    hintUk: "Boost Evasion",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 24,
        spCost: 5000,
        mpCost: 0,
        power: 2
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
    spCost: 11000,
    nameUk: "Майстерність лука (Bow Mastery)",
    hintUk: "Пасив: підвищує P. Atk при стрільбі з лука.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 16,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 105
      },
      {
        level: 17,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 111
      },
      {
        level: 18,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 178
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 189
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 201
      },
      {
        level: 21,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 213
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 0,
        power: 226
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 0,
        power: 239
      },
      {
        level: 24,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 0,
        power: 252
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 266
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 281
      },
      {
        level: 27,
        requiredLevel: 49,
        spCost: 25000,
        mpCost: 0,
        power: 296
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 311
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 328
      },
      {
        level: 30,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 344
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 0,
        power: 361
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 0,
        power: 379
      },
      {
        level: 33,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 0,
        power: 397
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 0,
        power: 415
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 0,
        power: 434
      },
      {
        level: 36,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 0,
        power: 453
      },
      {
        level: 37,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 473
      },
      {
        level: 38,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 493
      },
      {
        level: 39,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 513
      },
      {
        level: 40,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 534
      },
      {
        level: 41,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 0,
        power: 555
      },
      {
        level: 42,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 0,
        power: 576
      },
      {
        level: 43,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 597
      },
      {
        level: 44,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 619
      },
      {
        level: 45,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 0,
        power: 641
      },
      {
        level: 46,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 0,
        power: 663
      },
      {
        level: 47,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 685
      },
      {
        level: 48,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 707
      },
      {
        level: 49,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 0,
        power: 729
      },
      {
        level: 50,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 0,
        power: 751
      },
      {
        level: 51,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 772
      },
      {
        level: 52,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 794
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_209",
    l2SkillId: 209,
    minLevel: 20,
    spCost: 2800,
    nameUk: "Майстерність кинжала (Dagger Mastery)",
    hintUk: "Пасив: підвищує P. Atk з кинжалом.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2800,
        mpCost: 0,
        power: 3
      },
      {
        level: 2,
        requiredLevel: 24,
        spCost: 5000,
        mpCost: 0,
        power: 6
      },
      {
        level: 3,
        requiredLevel: 28,
        spCost: 4300,
        mpCost: 0,
        power: 7
      },
      {
        level: 4,
        requiredLevel: 28,
        spCost: 4300,
        mpCost: 0,
        power: 9
      },
      {
        level: 5,
        requiredLevel: 32,
        spCost: 7100,
        mpCost: 0,
        power: 10
      },
      {
        level: 6,
        requiredLevel: 32,
        spCost: 7100,
        mpCost: 0,
        power: 12
      },
      {
        level: 7,
        requiredLevel: 36,
        spCost: 11000,
        mpCost: 0,
        power: 15
      },
      {
        level: 8,
        requiredLevel: 36,
        spCost: 11000,
        mpCost: 0,
        power: 17
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
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
    spCost: 10000,
    nameUk: "Sword Blunt Mastery",
    hintUk: "Sword Blunt Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 13
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 14
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 15
      },
      {
        level: 12,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 16
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 17
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 18
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 0,
        power: 19
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 0,
        power: 21
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 0,
        power: 22
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 0,
        power: 23
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 0,
        power: 25
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 0,
        power: 26
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 0,
        power: 28
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 0,
        power: 29
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 0,
        power: 31
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 47000,
        mpCost: 0,
        power: 33
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 47000,
        mpCost: 0,
        power: 35
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 47000,
        mpCost: 0,
        power: 37
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 0,
        power: 38
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 0,
        power: 40
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 0,
        power: 42
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 44
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 46
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 0,
        power: 48
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 0,
        power: 50
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 210000,
        mpCost: 0,
        power: 52
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 210000,
        mpCost: 0,
        power: 54
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 0,
        power: 56
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 0,
        power: 58
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 240000,
        mpCost: 0,
        power: 61
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 240000,
        mpCost: 0,
        power: 63
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 440000,
        mpCost: 0,
        power: 65
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 440000,
        mpCost: 0,
        power: 67
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 0,
        power: 69
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 0,
        power: 72
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 0,
        power: 74
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 680000,
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
    battleId: "l2_223",
    l2SkillId: 223,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Sting",
    hintUk: "Sting",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 13,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 40,
        power: 123
      },
      {
        level: 14,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 41,
        power: 131
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 43,
        power: 139
      },
      {
        level: 16,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 43,
        power: 148
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 44,
        power: 157
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 45,
        power: 166
      },
      {
        level: 19,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 47,
        power: 175
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 48,
        power: 185
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 49,
        power: 196
      },
      {
        level: 22,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 51,
        power: 206
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 52,
        power: 217
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 54,
        power: 229
      },
      {
        level: 25,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 55,
        power: 241
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 55,
        power: 253
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 56000,
        mpCost: 56,
        power: 266
      },
      {
        level: 28,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 58,
        power: 279
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 59,
        power: 292
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 67000,
        mpCost: 61,
        power: 306
      },
      {
        level: 31,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 62,
        power: 320
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 63,
        power: 334
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 65,
        power: 349
      },
      {
        level: 34,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 66,
        power: 364
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 68,
        power: 379
      },
      {
        level: 36,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 68,
        power: 395
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 69,
        power: 410
      },
      {
        level: 38,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 70,
        power: 426
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 72,
        power: 443
      },
      {
        level: 40,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 73,
        power: 459
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 74,
        power: 475
      },
      {
        level: 42,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 75,
        power: 492
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 490000,
        mpCost: 77,
        power: 509
      },
      {
        level: 44,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 78,
        power: 526
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 79,
        power: 542
      },
      {
        level: 46,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 80,
        power: 559
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 750000,
        mpCost: 81,
        power: 576
      },
      {
        level: 48,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 82,
        power: 593
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 83,
        power: 609
      }
    ],
    effects: [],
    cooldownSec: 11,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_225",
    l2SkillId: 225,
    minLevel: 43,
    spCost: 33000,
    nameUk: "Акробатичний рух (Acrobatic Move)",
    hintUk: "Пасив: під час бігу підвищує ухилення.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 33000,
        mpCost: 0,
        power: 5
      },
      {
        level: 3,
        requiredLevel: 55,
        spCost: 170000,
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
    spCost: 11000,
    nameUk: "Майстерність легкої броні (Light Armor Mastery)",
    hintUk: "Пасив: +P. Def (%) і ухилення в легкій броні (1 р. — +4.2% / +3 ухил., 50 р. — +81.3% / +6).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 15
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 16
      },
      {
        level: 13,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 17
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 18
      },
      {
        level: 15,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 19
      },
      {
        level: 16,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 21
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 0,
        power: 22
      },
      {
        level: 18,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 0,
        power: 23
      },
      {
        level: 19,
        requiredLevel: 46,
        spCost: 15000,
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
        spCost: 42000,
        mpCost: 0,
        power: 29
      },
      {
        level: 24,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 30
      },
      {
        level: 25,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 32
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 0,
        power: 33
      },
      {
        level: 27,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 0,
        power: 34
      },
      {
        level: 28,
        requiredLevel: 55,
        spCost: 56000,
        mpCost: 0,
        power: 36
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 0,
        power: 37
      },
      {
        level: 30,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 0,
        power: 39
      },
      {
        level: 31,
        requiredLevel: 58,
        spCost: 62000,
        mpCost: 0,
        power: 40
      },
      {
        level: 32,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 42
      },
      {
        level: 33,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 43
      },
      {
        level: 34,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 44
      },
      {
        level: 35,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 46
      },
      {
        level: 36,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 0,
        power: 48
      },
      {
        level: 37,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 0,
        power: 49
      },
      {
        level: 38,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 51
      },
      {
        level: 39,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 52
      },
      {
        level: 40,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 0,
        power: 54
      },
      {
        level: 41,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 0,
        power: 55
      },
      {
        level: 42,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 57
      },
      {
        level: 43,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 59
      },
      {
        level: 44,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 0,
        power: 60
      },
      {
        level: 45,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 0,
        power: 62
      },
      {
        level: 46,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 63
      },
      {
        level: 47,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 65
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent"
      },
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
    battleId: "l2_231",
    l2SkillId: 231,
    minLevel: 40,
    spCost: 10000,
    nameUk: "Майстерність важкої броні (Heavy Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def (%) у важкій броні (1 р. — +1.9%, 50 р. — +79.3%).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_palus_knight",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 16,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 54
      },
      {
        level: 17,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 57
      },
      {
        level: 18,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 59
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 62
      },
      {
        level: 20,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 64
      },
      {
        level: 21,
        requiredLevel: 43,
        spCost: 11000,
        mpCost: 0,
        power: 67
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 0,
        power: 70
      },
      {
        level: 23,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 0,
        power: 72
      },
      {
        level: 24,
        requiredLevel: 46,
        spCost: 13000,
        mpCost: 0,
        power: 75
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 0,
        power: 78
      },
      {
        level: 26,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 0,
        power: 81
      },
      {
        level: 27,
        requiredLevel: 49,
        spCost: 19000,
        mpCost: 0,
        power: 84
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 0,
        power: 87
      },
      {
        level: 29,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 0,
        power: 90
      },
      {
        level: 30,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 0,
        power: 93
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 47000,
        mpCost: 0,
        power: 96
      },
      {
        level: 32,
        requiredLevel: 55,
        spCost: 47000,
        mpCost: 0,
        power: 100
      },
      {
        level: 33,
        requiredLevel: 55,
        spCost: 47000,
        mpCost: 0,
        power: 103
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 0,
        power: 106
      },
      {
        level: 35,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 0,
        power: 109
      },
      {
        level: 36,
        requiredLevel: 58,
        spCost: 47000,
        mpCost: 0,
        power: 113
      },
      {
        level: 37,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 116
      },
      {
        level: 38,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 120
      },
      {
        level: 39,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 0,
        power: 123
      },
      {
        level: 40,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 0,
        power: 127
      },
      {
        level: 41,
        requiredLevel: 64,
        spCost: 210000,
        mpCost: 0,
        power: 131
      },
      {
        level: 42,
        requiredLevel: 64,
        spCost: 210000,
        mpCost: 0,
        power: 134
      },
      {
        level: 43,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 0,
        power: 138
      },
      {
        level: 44,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 0,
        power: 142
      },
      {
        level: 45,
        requiredLevel: 68,
        spCost: 240000,
        mpCost: 0,
        power: 145
      },
      {
        level: 46,
        requiredLevel: 68,
        spCost: 240000,
        mpCost: 0,
        power: 149
      },
      {
        level: 47,
        requiredLevel: 70,
        spCost: 440000,
        mpCost: 0,
        power: 153
      },
      {
        level: 48,
        requiredLevel: 70,
        spCost: 440000,
        mpCost: 0,
        power: 157
      },
      {
        level: 49,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 0,
        power: 161
      },
      {
        level: 50,
        requiredLevel: 72,
        spCost: 440000,
        mpCost: 0,
        power: 164
      },
      {
        level: 51,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 0,
        power: 168
      },
      {
        level: 52,
        requiredLevel: 74,
        spCost: 680000,
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
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
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
    battleId: "l2_271",
    l2SkillId: 271,
    minLevel: 55,
    spCost: 200000,
    nameUk: "Dance of Warrior",
    hintUk: "Dance of Warrior",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 55,
        spCost: 200000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_272",
    l2SkillId: 272,
    minLevel: 46,
    spCost: 66000,
    nameUk: "Dance of Inspiration",
    hintUk: "Dance of Inspiration",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 66000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat",
        value: 4
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_273",
    l2SkillId: 273,
    minLevel: 49,
    spCost: 89000,
    nameUk: "Dance of Mystic",
    hintUk: "Dance of Mystic",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "mAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_274",
    l2SkillId: 274,
    minLevel: 40,
    spCost: 43000,
    nameUk: "Dance of Fire",
    hintUk: "Dance of Fire",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 43000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "critDamage",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_275",
    l2SkillId: 275,
    minLevel: 58,
    spCost: 240000,
    nameUk: "Dance of Fury",
    hintUk: "Dance of Fury",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 240000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_276",
    l2SkillId: 276,
    minLevel: 52,
    spCost: 170000,
    nameUk: "Dance of Concentration",
    hintUk: "Dance of Concentration",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 170000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "cancel",
        mode: "flat"
      },
      {
        stat: "castSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_277",
    l2SkillId: 277,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Dance of Light",
    hintUk: "Dance of Light",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "holyAttack",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_278",
    l2SkillId: 278,
    minLevel: 58,
    spCost: 140000,
    nameUk: "Summon Viper Cubic",
    hintUk: "Summon Viper Cubic",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 140000,
        mpCost: 54,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 58,
        spCost: 130000,
        mpCost: 50,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 55,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 66,
        spCost: 240000,
        mpCost: 58,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 62,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 74,
        spCost: 880000,
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
    battleId: "l2_279",
    l2SkillId: 279,
    minLevel: 60,
    spCost: 140000,
    nameUk: "Lightning Strike",
    hintUk: "Lightning Strike",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 54,
        power: 82
      },
      {
        level: 2,
        requiredLevel: 62,
        spCost: 240000,
        mpCost: 58,
        power: 89
      },
      {
        level: 3,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 62,
        power: 96
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 510000,
        mpCost: 65,
        power: 102
      },
      {
        level: 5,
        requiredLevel: 74,
        spCost: 1400000,
        mpCost: 69,
        power: 108
      }
    ],
    effects: [
      {
        stat: "paralyzeResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 120,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_288",
    l2SkillId: 288,
    minLevel: 43,
    spCost: 32000,
    nameUk: "Guard Stance",
    hintUk: "Guard Stance",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 32000,
        mpCost: 8,
        power: 121
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 31000,
        mpCost: 10,
        power: 189
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 12,
        power: 256
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 510000,
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_289",
    l2SkillId: 289,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Life Leech",
    hintUk: "Life Leech",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 27,
        power: 26
      },
      {
        level: 2,
        requiredLevel: 43,
        spCost: 32000,
        mpCost: 29,
        power: 29
      },
      {
        level: 3,
        requiredLevel: 46,
        spCost: 40000,
        mpCost: 32,
        power: 32
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 58000,
        mpCost: 34,
        power: 33
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 94000,
        mpCost: 36,
        power: 36
      },
      {
        level: 6,
        requiredLevel: 55,
        spCost: 130000,
        mpCost: 38,
        power: 39
      },
      {
        level: 7,
        requiredLevel: 58,
        spCost: 140000,
        mpCost: 40,
        power: 41
      },
      {
        level: 8,
        requiredLevel: 60,
        spCost: 180000,
        mpCost: 42,
        power: 43
      },
      {
        level: 9,
        requiredLevel: 62,
        spCost: 240000,
        mpCost: 44,
        power: 45
      },
      {
        level: 10,
        requiredLevel: 64,
        spCost: 410000,
        mpCost: 45,
        power: 47
      },
      {
        level: 11,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 47,
        power: 48
      },
      {
        level: 12,
        requiredLevel: 68,
        spCost: 510000,
        mpCost: 48,
        power: 50
      },
      {
        level: 13,
        requiredLevel: 70,
        spCost: 510000,
        mpCost: 49,
        power: 51
      },
      {
        level: 14,
        requiredLevel: 72,
        spCost: 880000,
        mpCost: 50,
        power: 53
      },
      {
        level: 15,
        requiredLevel: 74,
        spCost: 1400000,
        mpCost: 52,
        power: 54
      }
    ],
    effects: [
      {
        stat: "vampirism",
        mode: "percent",
        value: 80
      }
    ],
    cooldownSec: 15,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_291",
    l2SkillId: 291,
    minLevel: 52,
    spCost: 94000,
    nameUk: "Остання фортеця (Final Fortress)",
    hintUk: "Пасив: більший P. Def при низькому HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 94000,
        mpCost: 0,
        power: 116
      },
      {
        level: 2,
        requiredLevel: 55,
        spCost: 130000,
        mpCost: 0,
        power: 129
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 140000,
        mpCost: 0,
        power: 141
      },
      {
        level: 4,
        requiredLevel: 60,
        spCost: 180000,
        mpCost: 0,
        power: 150
      },
      {
        level: 5,
        requiredLevel: 62,
        spCost: 240000,
        mpCost: 0,
        power: 159
      },
      {
        level: 6,
        requiredLevel: 64,
        spCost: 280000,
        mpCost: 0,
        power: 168
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 0,
        power: 177
      },
      {
        level: 8,
        requiredLevel: 68,
        spCost: 480000,
        mpCost: 0,
        power: 185
      },
      {
        level: 9,
        requiredLevel: 70,
        spCost: 510000,
        mpCost: 0,
        power: 194
      },
      {
        level: 10,
        requiredLevel: 72,
        spCost: 880000,
        mpCost: 0,
        power: 206
      },
      {
        level: 11,
        requiredLevel: 74,
        spCost: 1400000,
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
    battleId: "l2_294",
    l2SkillId: 294,
    minLevel: 15,
    spCost: 2900,
    nameUk: "Shadow Sense",
    hintUk: "Shadow Sense",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_bladedancer",
      "dark_elf_fighter",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_palus_knight",
      "dark_elf_phantom_ranger",
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 15,
        spCost: 2900,
        mpCost: 0,
        power: 0
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
    battleId: "l2_303",
    l2SkillId: 303,
    minLevel: 46,
    spCost: 47000,
    nameUk: "Soul of Sagittarius",
    hintUk: "Soul of Sagittarius",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 47000,
        mpCost: 0,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 0,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 370000,
        mpCost: 0,
        power: 20
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 0,
        power: 25
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
    battleId: "l2_307",
    l2SkillId: 307,
    minLevel: 70,
    spCost: 1000000,
    nameUk: "Dance of Aqua Guard",
    hintUk: "Dance of Aqua Guard",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "waterResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_309",
    l2SkillId: 309,
    minLevel: 62,
    spCost: 440000,
    nameUk: "Dance of Earth Guard",
    hintUk: "Dance of Earth Guard",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 62,
        spCost: 440000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "earthResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_310",
    l2SkillId: 310,
    minLevel: 74,
    spCost: 2300000,
    nameUk: "Dance of Vampire",
    hintUk: "Dance of Vampire",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "vampirism",
        mode: "percent",
        value: 8
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_311",
    l2SkillId: 311,
    minLevel: 66,
    spCost: 700000,
    nameUk: "Dance of Protection",
    hintUk: "Dance of Protection",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_bladedancer",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "fallResist",
        mode: "flat",
        value: 30
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
    spCost: 33000,
    nameUk: "Жорстка стійка (Vicious Stance)",
    hintUk: "Підвищує силу критичного удару. Постійно витрачає MP, поки активна.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dark_elf_abyss_walker",
      "dark_elf_assassin",
      "dark_elf_ghost_hunter",
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 33000,
        mpCost: 7,
        power: 139
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 33000,
        mpCost: 8,
        power: 166
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 47000,
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
        spCost: 170000,
        mpCost: 10,
        power: 306
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 11,
        power: 349
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 240000,
        mpCost: 11,
        power: 379
      },
      {
        level: 14,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 12,
        power: 410
      },
      {
        level: 15,
        requiredLevel: 64,
        spCost: 370000,
        mpCost: 12,
        power: 443
      },
      {
        level: 16,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 13,
        power: 475
      },
      {
        level: 17,
        requiredLevel: 68,
        spCost: 600000,
        mpCost: 13,
        power: 509
      },
      {
        level: 18,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 13,
        power: 542
      },
      {
        level: 19,
        requiredLevel: 72,
        spCost: 1200000,
        mpCost: 14,
        power: 576
      },
      {
        level: 20,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 14,
        power: 610
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
    battleId: "l2_314",
    l2SkillId: 314,
    minLevel: 60,
    spCost: 120000,
    nameUk: "Fatal Counter",
    hintUk: "Fatal Counter",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dark_elf_ghost_sentinel",
      "dark_elf_phantom_ranger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 129,
        power: 2908
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 132,
        power: 3030
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 135,
        power: 3154
      },
      {
        level: 4,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 135,
        power: 3280
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 138,
        power: 3408
      },
      {
        level: 6,
        requiredLevel: 64,
        spCost: 180000,
        mpCost: 140,
        power: 3537
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 143,
        power: 3668
      },
      {
        level: 8,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 145,
        power: 3800
      },
      {
        level: 9,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 148,
        power: 3933
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 150,
        power: 4067
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 153,
        power: 4201
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 155,
        power: 4336
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 157,
        power: 4470
      },
      {
        level: 14,
        requiredLevel: 72,
        spCost: 580000,
        mpCost: 160,
        power: 4604
      },
      {
        level: 15,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 162,
        power: 4738
      },
      {
        level: 16,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 164,
        power: 4870
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_316",
    l2SkillId: 316,
    minLevel: 60,
    spCost: 180000,
    nameUk: "Aegis",
    hintUk: "Aegis",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 60,
        spCost: 180000,
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
    battleId: "l2_322",
    l2SkillId: 322,
    minLevel: 66,
    spCost: 240000,
    nameUk: "Фортеця щита (Shield Fortress)",
    hintUk: "Тимчасово різко підвищує захист, поки персонаж з щитом.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dark_elf_shillien_knight",
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 66,
        spCost: 240000,
        mpCost: 11,
        power: 469
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 12,
        power: 491
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 510000,
        mpCost: 13,
        power: 514
      },
      {
        level: 5,
        requiredLevel: 72,
        spCost: 880000,
        mpCost: 14,
        power: 537
      },
      {
        level: 6,
        requiredLevel: 74,
        spCost: 1400000,
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_328",
    l2SkillId: 328,
    minLevel: 76,
    spCost: 15000000,
    nameUk: "Мудрість (Wisdom)",
    hintUk: "Пасивний скіл. Збільшує опір до Hold, Sleep та Mental ефектів. 76 лв, 1 р.: Hold +20, Sleep +20, Mental +20. Макс. рівень скіла — 1.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_ghost_sentinel",
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 15000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "multiplier"
      },
      {
        stat: "sleepResist",
        mode: "multiplier"
      },
      {
        stat: "mentalResist",
        mode: "multiplier"
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
    hintUk: "Пасивний скіл. Збільшує опір до Poison, Bleed, Hold, Sleep та Mental ефектів. 76 лв, 1 р.: Poison +20, Bleed +20, Hold +20, Sleep +20, Mental +20. Макс. рівень скіла — 1.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_templar",
      "dark_elf_spectral_dancer"
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
        mode: "multiplier"
      },
      {
        stat: "bleedResist",
        mode: "multiplier"
      },
      {
        stat: "holdResist",
        mode: "multiplier"
      },
      {
        stat: "sleepResist",
        mode: "multiplier"
      },
      {
        stat: "mentalResist",
        mode: "multiplier"
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
    hintUk: "Пасивний скіл. Шанс без витрати MP і без перезарядки (reuse) при активному скілі; при спрацюванні — повтор одразу. 77 лв, 1 р. Макс. рівень скіла — 1.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_ghost_sentinel"
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
      "dark_elf_ghost_sentinel"
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
    effects: [],
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
      "dark_elf_shillien_templar"
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
        mode: "multiplier"
      },
      {
        stat: "paralyzeResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_342",
    l2SkillId: 342,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Дотик смерті (Touch of Death)",
    hintUk: "Темна магія по одній цілі: шкода залежить від стану ворога, можливі додаткові негативні ефекти.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 0,
        power: 90
      }
    ],
    effects: [
      {
        stat: "maxCp",
        mode: "multiplier"
      },
      {
        stat: "debuffResist",
        mode: "multiplier"
      },
      {
        stat: "hpRegen",
        mode: "multiplier"
      }
    ],
    cooldownSec: 600,
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
      "dark_elf_ghost_sentinel"
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
    battleId: "l2_351",
    l2SkillId: 351,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Magical Mirror",
    hintUk: "Magical Mirror",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_shillien_templar"
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
      "dark_elf_shillien_templar"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 35,
        power: 80
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
      "dark_elf_ghost_sentinel"
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
    battleId: "l2_365",
    l2SkillId: 365,
    minLevel: 78,
    spCost: 64000000,
    nameUk: "Dance of Siren",
    hintUk: "Dance of Siren",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 64000000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "skillCritRate",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_366",
    l2SkillId: 366,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Dance of Shadow",
    hintUk: "Dance of Shadow",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 60,
        power: 1
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "multiplier"
      },
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_367",
    l2SkillId: 367,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Dance of Medusa",
    hintUk: "Dance of Medusa",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_spectral_dancer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 105,
        power: 40
      }
    ],
    effects: [
      {
        stat: "paralyzeResist",
        mode: "multiplier"
      },
      {
        stat: "pAtk",
        mode: "multiplier"
      },
      {
        stat: "mAtk",
        mode: "multiplier"
      },
      {
        stat: "mpRegen",
        mode: "multiplier"
      },
      {
        stat: "hpRegen",
        mode: "multiplier"
      },
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 120,
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
      "dark_elf_shillien_templar"
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
        stat: "cancelResist",
        mode: "multiplier"
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
      "dark_elf_ghost_sentinel"
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
  }
];

/** Активні / toggle l2 id (пасивки виключено). */
export const DARK_FIGHTER_ACTIVE_L2_IDS: readonly number[] = [2, 3, 16, 18, 19, 22, 27, 28, 33, 56, 70, 77, 84, 91, 96, 99, 101, 103, 105, 110, 111, 112, 115, 122, 129, 223, 256, 271, 272, 273, 274, 275, 276, 277, 278, 279, 288, 289, 303, 307, 309, 310, 311, 312, 314, 322, 334, 335, 342, 343, 351, 352, 354, 365, 366, 367, 368, 369];
