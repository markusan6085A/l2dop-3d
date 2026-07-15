/**
 * Автоген з text-rpg (`npm run gen:race-fighter-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const ORC_FIGHTER_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
  {
    battleId: "l2_3",
    l2SkillId: 3,
    minLevel: 5,
    spCost: 60,
    nameUk: "Силовий удар (Power Strike)",
    hintUk: "Накопичує силу для різкого удару. Лише з мечем або булавою. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 60,
        mpCost: 10,
        power: 25
      },
      {
        level: 2,
        requiredLevel: 5,
        spCost: 60,
        mpCost: 10,
        power: 27
      },
      {
        level: 3,
        requiredLevel: 5,
        spCost: 60,
        mpCost: 11,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 10,
        spCost: 460,
        mpCost: 13,
        power: 39
      },
      {
        level: 5,
        requiredLevel: 10,
        spCost: 460,
        mpCost: 13,
        power: 42
      },
      {
        level: 6,
        requiredLevel: 10,
        spCost: 460,
        mpCost: 14,
        power: 46
      },
      {
        level: 7,
        requiredLevel: 15,
        spCost: 1300,
        mpCost: 17,
        power: 60
      },
      {
        level: 8,
        requiredLevel: 15,
        spCost: 1300,
        mpCost: 18,
        power: 65
      },
      {
        level: 9,
        requiredLevel: 15,
        spCost: 1300,
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
    battleId: "l2_17",
    l2SkillId: 17,
    minLevel: 43,
    spCost: 17000,
    nameUk: "Force Buster",
    hintUk: "Force Buster",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 59,
        power: 129
      },
      {
        level: 2,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 61,
        power: 137
      },
      {
        level: 3,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 63,
        power: 145
      },
      {
        level: 4,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 65,
        power: 153
      },
      {
        level: 5,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 67,
        power: 162
      },
      {
        level: 6,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 69,
        power: 171
      },
      {
        level: 7,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 71,
        power: 181
      },
      {
        level: 8,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 73,
        power: 190
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 75,
        power: 200
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 77,
        power: 211
      },
      {
        level: 11,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 77,
        power: 222
      },
      {
        level: 12,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 79,
        power: 233
      },
      {
        level: 13,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 81,
        power: 244
      },
      {
        level: 14,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 83,
        power: 256
      },
      {
        level: 15,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 85,
        power: 268
      },
      {
        level: 16,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 87,
        power: 280
      },
      {
        level: 17,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 89,
        power: 293
      },
      {
        level: 18,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 91,
        power: 305
      },
      {
        level: 19,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 93,
        power: 318
      },
      {
        level: 20,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 94,
        power: 332
      },
      {
        level: 21,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 95,
        power: 345
      },
      {
        level: 22,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 97,
        power: 359
      },
      {
        level: 23,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 98,
        power: 373
      },
      {
        level: 24,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 100,
        power: 387
      },
      {
        level: 25,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 102,
        power: 402
      },
      {
        level: 26,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 104,
        power: 416
      },
      {
        level: 27,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 105,
        power: 431
      },
      {
        level: 28,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 107,
        power: 445
      },
      {
        level: 29,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 109,
        power: 460
      },
      {
        level: 30,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 110,
        power: 475
      },
      {
        level: 31,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 112,
        power: 489
      },
      {
        level: 32,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 113,
        power: 504
      },
      {
        level: 33,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 115,
        power: 519
      },
      {
        level: 34,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 116,
        power: 533
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_29",
    l2SkillId: 29,
    minLevel: 20,
    spCost: 2600,
    nameUk: "Iron Punch",
    hintUk: "Iron Punch",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 20,
        spCost: 2600,
        mpCost: 25,
        power: 105
      },
      {
        level: 11,
        requiredLevel: 20,
        spCost: 2600,
        mpCost: 26,
        power: 113
      },
      {
        level: 12,
        requiredLevel: 20,
        spCost: 2600,
        mpCost: 26,
        power: 123
      },
      {
        level: 13,
        requiredLevel: 24,
        spCost: 3300,
        mpCost: 27,
        power: 143
      },
      {
        level: 14,
        requiredLevel: 24,
        spCost: 3300,
        mpCost: 28,
        power: 154
      },
      {
        level: 15,
        requiredLevel: 24,
        spCost: 3300,
        mpCost: 29,
        power: 166
      },
      {
        level: 16,
        requiredLevel: 28,
        spCost: 5700,
        mpCost: 32,
        power: 193
      },
      {
        level: 17,
        requiredLevel: 28,
        spCost: 5700,
        mpCost: 33,
        power: 207
      },
      {
        level: 18,
        requiredLevel: 28,
        spCost: 5700,
        mpCost: 34,
        power: 222
      },
      {
        level: 19,
        requiredLevel: 32,
        spCost: 9500,
        mpCost: 37,
        power: 256
      },
      {
        level: 20,
        requiredLevel: 32,
        spCost: 9500,
        mpCost: 37,
        power: 274
      },
      {
        level: 21,
        requiredLevel: 32,
        spCost: 9500,
        mpCost: 38,
        power: 293
      },
      {
        level: 22,
        requiredLevel: 36,
        spCost: 13000,
        mpCost: 41,
        power: 334
      },
      {
        level: 23,
        requiredLevel: 36,
        spCost: 13000,
        mpCost: 42,
        power: 357
      },
      {
        level: 24,
        requiredLevel: 36,
        spCost: 13000,
        mpCost: 44,
        power: 380
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_34",
    l2SkillId: 34,
    minLevel: 46,
    spCost: 50000,
    nameUk: "Bandage",
    hintUk: "Bandage",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 41,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 55,
        power: 9
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_35",
    l2SkillId: 35,
    minLevel: 49,
    spCost: 36000,
    nameUk: "Force Storm",
    hintUk: "Force Storm",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 71,
        power: 181
      },
      {
        level: 2,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 73,
        power: 190
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 75,
        power: 200
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 77,
        power: 211
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 77,
        power: 222
      },
      {
        level: 6,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 79,
        power: 233
      },
      {
        level: 7,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 81,
        power: 244
      },
      {
        level: 8,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 83,
        power: 256
      },
      {
        level: 9,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 85,
        power: 268
      },
      {
        level: 10,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 87,
        power: 280
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 89,
        power: 293
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 91,
        power: 305
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 93,
        power: 318
      },
      {
        level: 14,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 94,
        power: 332
      },
      {
        level: 15,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 95,
        power: 345
      },
      {
        level: 16,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 97,
        power: 359
      },
      {
        level: 17,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 98,
        power: 373
      },
      {
        level: 18,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 100,
        power: 387
      },
      {
        level: 19,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 102,
        power: 402
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 104,
        power: 416
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 105,
        power: 431
      },
      {
        level: 22,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 107,
        power: 445
      },
      {
        level: 23,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 109,
        power: 460
      },
      {
        level: 24,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 110,
        power: 475
      },
      {
        level: 25,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 112,
        power: 489
      },
      {
        level: 26,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 113,
        power: 504
      },
      {
        level: 27,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 115,
        power: 519
      },
      {
        level: 28,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 116,
        power: 533
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_36",
    l2SkillId: 36,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Вихор (Whirlwind)",
    hintUk: "Стабільний AoE-спам: б’є головну ціль і ще до 2 поруч. Лише зі списом/алебардою. Кулдаун 6 с.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 40,
        power: 461
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 41,
        power: 490
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 43,
        power: 521
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 43,
        power: 553
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 44,
        power: 586
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 45,
        power: 620
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 47,
        power: 656
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 48,
        power: 693
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 49,
        power: 732
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 51,
        power: 773
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 52,
        power: 814
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 54,
        power: 857
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 55,
        power: 902
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 55,
        power: 948
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 56,
        power: 995
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 58,
        power: 1044
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 59,
        power: 1094
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 61,
        power: 1145
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 62,
        power: 1198
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 63,
        power: 1252
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 65,
        power: 1307
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 66,
        power: 1363
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 68,
        power: 1420
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 68,
        power: 1479
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 69,
        power: 1538
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 70,
        power: 1598
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 72,
        power: 1658
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 73,
        power: 1720
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 74,
        power: 1782
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 75,
        power: 1844
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 77,
        power: 1907
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 78,
        power: 1970
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 79,
        power: 2033
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 80,
        power: 2096
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 81,
        power: 2158
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 82,
        power: 2221
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 83,
        power: 2283
      }
    ],
    effects: [],
    cooldownSec: 17,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_50",
    l2SkillId: 50,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Focused Force",
    hintUk: "Focused Force",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 7,
        power: 3
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 150000,
        mpCost: 7,
        power: 4
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 290000,
        mpCost: 7,
        power: 5
      },
      {
        level: 6,
        requiredLevel: 64,
        spCost: 700000,
        mpCost: 7,
        power: 6
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 1400000,
        mpCost: 7,
        power: 7
      }
    ],
    effects: [],
    cooldownSec: 1,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_54",
    l2SkillId: 54,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Force Blaster",
    hintUk: "Force Blaster",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 13,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 33,
        power: 431
      },
      {
        level: 14,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 34,
        power: 458
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 35,
        power: 486
      },
      {
        level: 16,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 35,
        power: 516
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 36,
        power: 547
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 37,
        power: 579
      },
      {
        level: 19,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 38,
        power: 612
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 39,
        power: 647
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 40,
        power: 683
      },
      {
        level: 22,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 42,
        power: 721
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 43,
        power: 760
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 44,
        power: 800
      },
      {
        level: 25,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 45,
        power: 842
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 45,
        power: 885
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 46,
        power: 929
      },
      {
        level: 28,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 47,
        power: 974
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 48,
        power: 1021
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 50,
        power: 1069
      },
      {
        level: 31,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 51,
        power: 1118
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 52,
        power: 1169
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 53,
        power: 1220
      },
      {
        level: 34,
        requiredLevel: 61,
        spCost: 150000,
        mpCost: 54,
        power: 1272
      },
      {
        level: 35,
        requiredLevel: 61,
        spCost: 150000,
        mpCost: 55,
        power: 1326
      },
      {
        level: 36,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 55,
        power: 1380
      },
      {
        level: 37,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 57,
        power: 1435
      },
      {
        level: 38,
        requiredLevel: 67,
        spCost: 240000,
        mpCost: 58,
        power: 1491
      },
      {
        level: 39,
        requiredLevel: 67,
        spCost: 240000,
        mpCost: 59,
        power: 1548
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 350000,
        mpCost: 60,
        power: 1605
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 350000,
        mpCost: 61,
        power: 1663
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 62,
        power: 1721
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 63,
        power: 1780
      },
      {
        level: 44,
        requiredLevel: 72,
        spCost: 520000,
        mpCost: 64,
        power: 1838
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 65,
        power: 1897
      },
      {
        level: 46,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 66,
        power: 1956
      },
      {
        level: 47,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 66,
        power: 2015
      },
      {
        level: 48,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 67,
        power: 2073
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 68,
        power: 2131
      }
    ],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_76",
    l2SkillId: 76,
    minLevel: 28,
    spCost: 17000,
    nameUk: "Totem Spirit Bear",
    hintUk: "Totem Spirit Bear",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 28,
        spCost: 17000,
        mpCost: 2,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      },
      {
        stat: "pAtk",
        mode: "multiplier"
      },
      {
        stat: "critDamage",
        mode: "multiplier"
      }
    ],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_81",
    l2SkillId: 81,
    minLevel: 58,
    spCost: 220000,
    nameUk: "Punch of Doom",
    hintUk: "Punch of Doom",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 220000,
        mpCost: 0,
        power: 4580
      },
      {
        level: 2,
        requiredLevel: 70,
        spCost: 480000,
        mpCost: 0,
        power: 6332
      },
      {
        level: 3,
        requiredLevel: 72,
        spCost: 1400000,
        mpCost: 0,
        power: 9132
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "flat"
      }
    ],
    cooldownSec: 120,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_83",
    l2SkillId: 83,
    minLevel: 20,
    spCost: 5300,
    nameUk: "Totem Spirit Wolf",
    hintUk: "Totem Spirit Wolf",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 5300,
        mpCost: 2,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 3
      }
    ],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_94",
    l2SkillId: 94,
    minLevel: 55,
    spCost: 180000,
    nameUk: "Rage",
    hintUk: "Rage",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 25,
        power: 55
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat"
      },
      {
        stat: "pDef",
        mode: "percent"
      },
      {
        stat: "pAtk",
        mode: "percent",
        value: 55
      }
    ],
    cooldownSec: 300,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_95",
    l2SkillId: 95,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Cripple",
    hintUk: "Cripple",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 35,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 51000,
        mpCost: 38,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 60000,
        mpCost: 41,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 110000,
        mpCost: 44,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 150000,
        mpCost: 47,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 55,
        spCost: 220000,
        mpCost: 50,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 240000,
        mpCost: 53,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 61,
        spCost: 290000,
        mpCost: 55,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 58,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 67,
        spCost: 480000,
        mpCost: 59,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 70,
        spCost: 700000,
        mpCost: 61,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 72,
        spCost: 780000,
        mpCost: 63,
        power: 0
      },
      {
        level: 18,
        requiredLevel: 72,
        spCost: 1000000,
        mpCost: 65,
        power: 0
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 1400000,
        mpCost: 67,
        power: 0
      },
      {
        level: 20,
        requiredLevel: 74,
        spCost: 2600000,
        mpCost: 68,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 7,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_100",
    l2SkillId: 100,
    minLevel: 20,
    spCost: 1100,
    nameUk: "Приголомшувальний удар (Stun Attack)",
    hintUk: "Сильний удар: оглушує ціль і завдає шкоди. Поки діє попередній ефект — повторно не накладається. Тільки з булавами. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 20,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 21,
        power: 33
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 21,
        power: 35
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 22,
        power: 41
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 23,
        power: 44
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 23,
        power: 48
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 25,
        power: 55
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 26,
        power: 59
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 27,
        power: 64
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 29,
        power: 73
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 29,
        power: 79
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 30,
        power: 84
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 32,
        power: 96
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 33,
        power: 102
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 34,
        power: 109
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "flat"
      }
    ],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_109",
    l2SkillId: 109,
    minLevel: 46,
    spCost: 60000,
    nameUk: "Spirit of Ogre",
    hintUk: "Spirit of Ogre",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 60000,
        mpCost: 5,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "multiplier"
      },
      {
        stat: "mDef",
        mode: "multiplier"
      },
      {
        stat: "runSpeed",
        mode: "multiplier"
      },
      {
        stat: "evasion",
        mode: "flat"
      }
    ],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_120",
    l2SkillId: 120,
    minLevel: 20,
    spCost: 2600,
    nameUk: "Stunning Fist",
    hintUk: "Stunning Fist",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2600,
        mpCost: 22,
        power: 38
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 2600,
        mpCost: 22,
        power: 41
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 2600,
        mpCost: 22,
        power: 44
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 3300,
        mpCost: 23,
        power: 51
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 3300,
        mpCost: 24,
        power: 55
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 3300,
        mpCost: 25,
        power: 60
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 5700,
        mpCost: 27,
        power: 69
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 5700,
        mpCost: 29,
        power: 74
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 5700,
        mpCost: 30,
        power: 80
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 9500,
        mpCost: 31,
        power: 92
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 9500,
        mpCost: 31,
        power: 98
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 9500,
        mpCost: 33,
        power: 105
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 13000,
        mpCost: 35,
        power: 120
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 13000,
        mpCost: 36,
        power: 128
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 13000,
        mpCost: 37,
        power: 136
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "flat"
      }
    ],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_121",
    l2SkillId: 121,
    minLevel: 40,
    spCost: 33000,
    nameUk: "Бойовий рик (Battle Roar)",
    hintUk: "Миттєво відновлює HP і збільшує максимальний запас HP на 10 хвилин.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 28,
        spCost: 11000,
        mpCost: 13,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 33000,
        mpCost: 18,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 82000,
        mpCost: 22,
        power: 20
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 27,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 30,
        power: 30
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 33,
        power: 35
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "multiplier"
      }
    ],
    cooldownSec: 600,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_134",
    l2SkillId: 134,
    minLevel: 1,
    spCost: 0,
    nameUk: "Toughness",
    hintUk: "Toughness",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
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
    effects: [
      {
        stat: "stunResist",
        mode: "multiplier"
      },
      {
        stat: "holdResist",
        mode: "multiplier"
      },
      {
        stat: "poisonResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_139",
    l2SkillId: 139,
    minLevel: 43,
    spCost: 38000,
    nameUk: "Guts",
    hintUk: "Guts",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 38000,
        mpCost: 19,
        power: 2
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 24,
        power: 3
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "multiplier"
      }
    ],
    cooldownSec: 600,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_141",
    l2SkillId: 141,
    minLevel: 5,
    spCost: 190,
    nameUk: "Майстерність обладунку (Armor Mastery)",
    hintUk: "Пасив: +9 P. Def. за кожен вивчений рівень скіла.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 190,
        mpCost: 0,
        power: 2
      },
      {
        level: 2,
        requiredLevel: 10,
        spCost: 1300,
        mpCost: 0,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 15,
        spCost: 4000,
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
    spCost: 190,
    nameUk: "Майстерність зброї (Weapon Mastery)",
    hintUk: "Пасив: +P. Atk (flat) за рівнем скіла (1 р. — +1.5, 40 р. — +79.4).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 190,
        mpCost: 0,
        power: 9
      },
      {
        level: 2,
        requiredLevel: 10,
        spCost: 690,
        mpCost: 0,
        power: 11
      },
      {
        level: 3,
        requiredLevel: 10,
        spCost: 690,
        mpCost: 0,
        power: 12
      },
      {
        level: 4,
        requiredLevel: 15,
        spCost: 2000,
        mpCost: 0,
        power: 13
      },
      {
        level: 5,
        requiredLevel: 15,
        spCost: 2000,
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
        value: 0
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_148",
    l2SkillId: 148,
    minLevel: 40,
    spCost: 33000,
    nameUk: "Життєва сила (Vital Force)",
    hintUk: "Пасив: швидше відновлення HP, коли персонаж сидить.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 33000,
        mpCost: 0,
        power: 2
      },
      {
        level: 4,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 0,
        power: 3
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
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 0,
        power: 4
      },
      {
        level: 7,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 0,
        power: 5
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 1300000,
        mpCost: 0,
        power: 6
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat"
      },
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
    battleId: "l2_168",
    l2SkillId: 168,
    minLevel: 46,
    spCost: 60000,
    nameUk: "Підсилення швидкості атаки (Boost Attack Speed)",
    hintUk: "Пасив: підвищує швидкість атаки.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 60000,
        mpCost: 0,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 61,
        spCost: 240000,
        mpCost: 0,
        power: 10
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_176",
    l2SkillId: 176,
    minLevel: 46,
    spCost: 50000,
    nameUk: "Frenzy",
    hintUk: "Frenzy",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 21,
        power: 2
      },
      {
        level: 3,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 25,
        power: 3
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 600,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_190",
    l2SkillId: 190,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Фатальний удар (Fatal Strike)",
    hintUk: "Швидкий нищівний удар. Меч або булава. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 40,
        power: 615
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 41,
        power: 654
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 43,
        power: 694
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 43,
        power: 737
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 44,
        power: 781
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 45,
        power: 827
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 47,
        power: 875
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 48,
        power: 924
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 49,
        power: 976
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 18000,
        mpCost: 51,
        power: 1030
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 18000,
        mpCost: 52,
        power: 1085
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 18000,
        mpCost: 54,
        power: 1143
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 55,
        power: 1202
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 55,
        power: 1264
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 56,
        power: 1327
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 58,
        power: 1392
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 59,
        power: 1459
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 61,
        power: 1527
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 62,
        power: 1597
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 63,
        power: 1669
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 65,
        power: 1743
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 66,
        power: 1817
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 68,
        power: 1894
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 68,
        power: 1971
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 69,
        power: 2050
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 70,
        power: 2130
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 72,
        power: 2211
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 73,
        power: 2293
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 74,
        power: 2375
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 75,
        power: 2459
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 77,
        power: 2542
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 78,
        power: 2626
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 79,
        power: 2710
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 80,
        power: 2794
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 81,
        power: 2878
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 82,
        power: 2961
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 83,
        power: 3044
      }
    ],
    effects: [],
    cooldownSec: 13,
    skipMobHp: false,
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
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
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
    battleId: "l2_210",
    l2SkillId: 210,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Fist Mastery",
    hintUk: "Fist Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 23
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 25
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 27
      },
      {
        level: 12,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 0,
        power: 29
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 0,
        power: 30
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 0,
        power: 32
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 23000,
        mpCost: 0,
        power: 35
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 23000,
        mpCost: 0,
        power: 37
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 23000,
        mpCost: 0,
        power: 39
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 41
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 44
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 46
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 40000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 40000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 40000,
        mpCost: 0,
        power: 54
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 0,
        power: 57
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 0,
        power: 60
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 0,
        power: 63
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 65000,
        mpCost: 0,
        power: 66
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 65000,
        mpCost: 0,
        power: 69
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 65000,
        mpCost: 0,
        power: 72
      },
      {
        level: 30,
        requiredLevel: 61,
        spCost: 80000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 61,
        spCost: 80000,
        mpCost: 0,
        power: 79
      },
      {
        level: 32,
        requiredLevel: 61,
        spCost: 80000,
        mpCost: 0,
        power: 82
      },
      {
        level: 33,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 0,
        power: 86
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 0,
        power: 89
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 0,
        power: 93
      },
      {
        level: 36,
        requiredLevel: 67,
        spCost: 120000,
        mpCost: 0,
        power: 96
      },
      {
        level: 37,
        requiredLevel: 67,
        spCost: 120000,
        mpCost: 0,
        power: 100
      },
      {
        level: 38,
        requiredLevel: 67,
        spCost: 120000,
        mpCost: 0,
        power: 103
      },
      {
        level: 39,
        requiredLevel: 70,
        spCost: 150000,
        mpCost: 0,
        power: 107
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 150000,
        mpCost: 0,
        power: 111
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 150000,
        mpCost: 0,
        power: 114
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 180000,
        mpCost: 0,
        power: 118
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 180000,
        mpCost: 0,
        power: 122
      },
      {
        level: 44,
        requiredLevel: 72,
        spCost: 180000,
        mpCost: 0,
        power: 125
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 200000,
        mpCost: 0,
        power: 129
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
    battleId: "l2_211",
    l2SkillId: 211,
    minLevel: 43,
    spCost: 38000,
    nameUk: "Підсилення HP (Boost HP)",
    hintUk: "Пасив: збільшує максимальне HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 43,
        spCost: 38000,
        mpCost: 0,
        power: 200
      },
      {
        level: 5,
        requiredLevel: 49,
        spCost: 82000,
        mpCost: 0,
        power: 250
      },
      {
        level: 6,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 0,
        power: 300
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 0,
        power: 350
      },
      {
        level: 8,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 0,
        power: 400
      },
      {
        level: 9,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 0,
        power: 440
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 1800000,
        mpCost: 0,
        power: 480
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_212",
    l2SkillId: 212,
    minLevel: 40,
    spCost: 33000,
    nameUk: "Швидке відновлення HP (Fast HP Recovery)",
    hintUk: "Пасив: підвищує відновлення HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 33000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 38000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 0,
        power: 2
      },
      {
        level: 7,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 3
      },
      {
        level: 8,
        requiredLevel: 74,
        spCost: 1800000,
        mpCost: 0,
        power: 4
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_216",
    l2SkillId: 216,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Майстерність древка (Polearm Mastery)",
    hintUk: "Пасив: +P. Atk (flat) зі списом або алебардою (1 р. — +4.5, 43 р. — +122.1).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 23
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 25
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 27
      },
      {
        level: 12,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 29
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 30
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 32
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 35
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 37
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 39
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 41
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 44
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 46
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 54
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 57
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 60
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 63
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 66
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 69
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 72
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 79
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 82
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 86
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 89
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 93
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 96
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 100
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 103
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 107
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 111
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 114
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 118
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 122
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 125
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 129
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "flat"
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 10
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
    spCost: 11000,
    nameUk: "Sword Blunt Mastery",
    hintUk: "Sword Blunt Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 13
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 14
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 15
      },
      {
        level: 12,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 16
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 17
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 18
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 19
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 21
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 22
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 23
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 25
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 26
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 28
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 29
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 31
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 33
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 35
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 36
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 38
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 40
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 67000,
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
        spCost: 150000,
        mpCost: 0,
        power: 48
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 50
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 52
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 54
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 56
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 58
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 61
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 63
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 65
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 67
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 69
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 72
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 74
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 880000,
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
    battleId: "l2_222",
    l2SkillId: 222,
    minLevel: 43,
    spCost: 51000,
    nameUk: "Fist Fury",
    hintUk: "Fist Fury",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 51000,
        mpCost: 8,
        power: 25
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_226",
    l2SkillId: 226,
    minLevel: 5,
    spCost: 190,
    nameUk: "Relax",
    hintUk: "Relax",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 190,
        mpCost: 2,
        power: 0
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat",
        value: 5
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
      "orc_destroyer",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 14,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 21
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 22
      },
      {
        level: 16,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 24
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 25
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 26
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 27
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 29
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 30
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 32
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 33
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 35
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 36
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 38
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 39
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 41
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 42
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 44
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 46
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 47
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 49
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 51
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 53
      },
      {
        level: 36,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 54
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 56
      },
      {
        level: 38,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 58
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 60
      },
      {
        level: 40,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 62
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 64
      },
      {
        level: 42,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 65
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 67
      },
      {
        level: 44,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 69
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 71
      },
      {
        level: 46,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 73
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 75
      },
      {
        level: 48,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 77
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 79
      },
      {
        level: 50,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 81
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
        value: 6
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
    spCost: 11000,
    nameUk: "Майстерність важкої броні (Heavy Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def (%) у важкій броні (1 р. — +1.9%, 50 р. — +79.3%).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 14,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 20
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 21
      },
      {
        level: 16,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 22
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 24
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 25
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 0,
        power: 26
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 28
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 29
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 17000,
        mpCost: 0,
        power: 30
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 32
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 33
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 0,
        power: 35
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 36
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 38
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 0,
        power: 39
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 41
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 43
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 0,
        power: 44
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 46
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 48
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 67000,
        mpCost: 0,
        power: 49
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 51
      },
      {
        level: 36,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 53
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 55
      },
      {
        level: 38,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 56
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 58
      },
      {
        level: 40,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 60
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 62
      },
      {
        level: 42,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 0,
        power: 64
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 66
      },
      {
        level: 44,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 67
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 69
      },
      {
        level: 46,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 71
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 73
      },
      {
        level: 48,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 75
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 77
      },
      {
        level: 50,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 79
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
    battleId: "l2_245",
    l2SkillId: 245,
    minLevel: 20,
    spCost: 1100,
    nameUk: "Дикий розмах (Wild Sweep)",
    hintUk: "Завдає шкоди кільком суперникам. Лише зі списом або алебардами. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 22,
        power: 90
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 22,
        power: 97
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 22,
        power: 105
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 23,
        power: 123
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 24,
        power: 132
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 25,
        power: 143
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 27,
        power: 165
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 29,
        power: 177
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 30,
        power: 191
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 31,
        power: 219
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 31,
        power: 235
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 33,
        power: 251
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 35,
        power: 287
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 36,
        power: 306
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 37,
        power: 326
      }
    ],
    effects: [],
    cooldownSec: 17,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_255",
    l2SkillId: 255,
    minLevel: 20,
    spCost: 1100,
    nameUk: "Розгром (Power Smash)",
    hintUk: "Потужний удар, що влучає в одну ціль. Лише з булавою або мечем. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 22,
        power: 90
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 22,
        power: 97
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 22,
        power: 105
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 23,
        power: 123
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 24,
        power: 132
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 1800,
        mpCost: 25,
        power: 143
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 27,
        power: 165
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 29,
        power: 177
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 3600,
        mpCost: 30,
        power: 191
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 31,
        power: 219
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 31,
        power: 235
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 5600,
        mpCost: 33,
        power: 251
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 35,
        power: 287
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 36,
        power: 306
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 8600,
        mpCost: 37,
        power: 326
      }
    ],
    effects: [],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_256",
    l2SkillId: 256,
    minLevel: 24,
    spCost: 5300,
    nameUk: "Точність (Accuracy)",
    hintUk: "Підвищує точність. Постійно витрачає MP, поки активна.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 24,
        spCost: 5300,
        mpCost: 1,
        power: 3
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_260",
    l2SkillId: 260,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Скрушний молот (Hammer Crush)",
    hintUk: "Актив: потужний удар булавою (ігнорує щит), Shock/Stun ~4–9 с, over-hit/крит. 19 р., відкат 13 с. Не діє на РБ/епіків.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 37,
        power: 406
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 38,
        power: 432
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 39,
        power: 458
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 39,
        power: 486
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 40,
        power: 515
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 13000,
        mpCost: 42,
        power: 546
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 43,
        power: 577
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 44,
        power: 610
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 15000,
        mpCost: 45,
        power: 644
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 46,
        power: 680
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 48,
        power: 717
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 27000,
        mpCost: 49,
        power: 754
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 50,
        power: 794
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 51,
        power: 834
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 42000,
        mpCost: 52,
        power: 876
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 53,
        power: 919
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 54,
        power: 963
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 50000,
        mpCost: 55,
        power: 1008
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 57,
        power: 1054
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 58,
        power: 1102
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 58000,
        mpCost: 59,
        power: 1150
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 60,
        power: 1200
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 62,
        power: 1250
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 62,
        power: 1301
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 63,
        power: 1353
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 64,
        power: 1406
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 66,
        power: 1460
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 67,
        power: 1513
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 68,
        power: 1568
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 69,
        power: 1623
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 70,
        power: 1678
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 71,
        power: 1733
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 72,
        power: 1789
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 73,
        power: 1844
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 74,
        power: 1900
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 75,
        power: 1955
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 76,
        power: 2009
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_280",
    l2SkillId: 280,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Burning Fist",
    hintUk: "Burning Fist",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 47,
        power: 431
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 48,
        power: 458
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 50,
        power: 486
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 50,
        power: 516
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 51,
        power: 547
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 53,
        power: 579
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 54,
        power: 612
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 56,
        power: 647
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 57,
        power: 683
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 59,
        power: 721
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 61,
        power: 760
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 62,
        power: 800
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 64,
        power: 842
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 64,
        power: 885
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 66,
        power: 929
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 68000,
        mpCost: 67,
        power: 974
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 68000,
        mpCost: 69,
        power: 1021
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 68000,
        mpCost: 71,
        power: 1069
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 130000,
        mpCost: 72,
        power: 1118
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 130000,
        mpCost: 74,
        power: 1169
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 130000,
        mpCost: 76,
        power: 1220
      },
      {
        level: 22,
        requiredLevel: 61,
        spCost: 180000,
        mpCost: 77,
        power: 1272
      },
      {
        level: 23,
        requiredLevel: 61,
        spCost: 180000,
        mpCost: 79,
        power: 1326
      },
      {
        level: 24,
        requiredLevel: 61,
        spCost: 180000,
        mpCost: 79,
        power: 1380
      },
      {
        level: 25,
        requiredLevel: 64,
        spCost: 260000,
        mpCost: 81,
        power: 1435
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 260000,
        mpCost: 82,
        power: 1491
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 260000,
        mpCost: 84,
        power: 1548
      },
      {
        level: 28,
        requiredLevel: 67,
        spCost: 360000,
        mpCost: 85,
        power: 1605
      },
      {
        level: 29,
        requiredLevel: 67,
        spCost: 360000,
        mpCost: 86,
        power: 1663
      },
      {
        level: 30,
        requiredLevel: 67,
        spCost: 360000,
        mpCost: 88,
        power: 1721
      },
      {
        level: 31,
        requiredLevel: 70,
        spCost: 480000,
        mpCost: 89,
        power: 1780
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 480000,
        mpCost: 91,
        power: 1838
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 480000,
        mpCost: 92,
        power: 1897
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 93,
        power: 1956
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 95,
        power: 2015
      },
      {
        level: 36,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 96,
        power: 2073
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 97,
        power: 2131
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_281",
    l2SkillId: 281,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Soul Breaker",
    hintUk: "Soul Breaker",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 37,
        power: 406
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 38,
        power: 432
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 39,
        power: 458
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 39,
        power: 486
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 40,
        power: 515
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 42,
        power: 546
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 43,
        power: 577
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 44,
        power: 610
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 45,
        power: 644
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 46,
        power: 680
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 48,
        power: 717
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 49,
        power: 754
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 50,
        power: 794
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 51,
        power: 834
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 52,
        power: 876
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 53,
        power: 919
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 54,
        power: 963
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 55,
        power: 1008
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 57,
        power: 1054
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 58,
        power: 1102
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 59,
        power: 1150
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 60,
        power: 1200
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 62,
        power: 1250
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 62,
        power: 1301
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 63,
        power: 1353
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 64,
        power: 1406
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 66,
        power: 1460
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 67,
        power: 1513
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 68,
        power: 1568
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 69,
        power: 1623
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 70,
        power: 1678
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 71,
        power: 1733
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 72,
        power: 1789
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 73,
        power: 1844
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 74,
        power: 1900
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 75,
        power: 1955
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 76,
        power: 2009
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "flat"
      }
    ],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_282",
    l2SkillId: 282,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Totem Spirit Puma",
    hintUk: "Totem Spirit Puma",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 4,
        power: 0
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "multiplier"
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 6
      }
    ],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_284",
    l2SkillId: 284,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Hurricane Assault",
    hintUk: "Hurricane Assault",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 56,
        power: 607
      },
      {
        level: 5,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 58,
        power: 646
      },
      {
        level: 6,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 59,
        power: 729
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 59,
        power: 773
      },
      {
        level: 8,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 61,
        power: 820
      },
      {
        level: 9,
        requiredLevel: 43,
        spCost: 17000,
        mpCost: 63,
        power: 868
      },
      {
        level: 10,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 65,
        power: 918
      },
      {
        level: 11,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 67,
        power: 971
      },
      {
        level: 12,
        requiredLevel: 46,
        spCost: 20000,
        mpCost: 69,
        power: 1025
      },
      {
        level: 13,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 71,
        power: 1081
      },
      {
        level: 14,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 73,
        power: 1140
      },
      {
        level: 15,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 75,
        power: 1200
      },
      {
        level: 16,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 77,
        power: 1262
      },
      {
        level: 17,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 77,
        power: 1327
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 79,
        power: 1393
      },
      {
        level: 19,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 81,
        power: 1461
      },
      {
        level: 20,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 83,
        power: 1531
      },
      {
        level: 21,
        requiredLevel: 55,
        spCost: 73000,
        mpCost: 85,
        power: 1603
      },
      {
        level: 22,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 87,
        power: 1677
      },
      {
        level: 23,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 89,
        power: 1753
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 80000,
        mpCost: 91,
        power: 1830
      },
      {
        level: 25,
        requiredLevel: 61,
        spCost: 150000,
        mpCost: 93,
        power: 1908
      },
      {
        level: 26,
        requiredLevel: 61,
        spCost: 150000,
        mpCost: 94,
        power: 1988
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 95,
        power: 2070
      },
      {
        level: 28,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 97,
        power: 2153
      },
      {
        level: 29,
        requiredLevel: 67,
        spCost: 240000,
        mpCost: 98,
        power: 2237
      },
      {
        level: 30,
        requiredLevel: 67,
        spCost: 240000,
        mpCost: 100,
        power: 2322
      },
      {
        level: 31,
        requiredLevel: 70,
        spCost: 350000,
        mpCost: 102,
        power: 2408
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 350000,
        mpCost: 104,
        power: 2494
      },
      {
        level: 33,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 105,
        power: 2581
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 520000,
        mpCost: 107,
        power: 2669
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 520000,
        mpCost: 109,
        power: 2757
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 110,
        power: 2846
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 680000,
        mpCost: 112,
        power: 2934
      },
      {
        level: 38,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 113,
        power: 3022
      },
      {
        level: 39,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 115,
        power: 3109
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 116,
        power: 3196
      }
    ],
    effects: [],
    cooldownSec: 17,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_287",
    l2SkillId: 287,
    minLevel: 49,
    spCost: 82000,
    nameUk: "Левине серце (Lionheart)",
    hintUk: "Тимчасово сильно підвищує стійкість до сну, паралічу, утримання, оглушення та ослаблювальних атак.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 49,
        spCost: 82000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
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
        stat: "stunResist",
        mode: "multiplier"
      },
      {
        stat: "shockResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 900,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_292",
    l2SkillId: 292,
    minLevel: 68,
    spCost: 780000,
    nameUk: "Totem Spirit Bison",
    hintUk: "Totem Spirit Bison",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 68,
        spCost: 780000,
        mpCost: 7,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      },
      {
        stat: "critRate",
        mode: "multiplier"
      }
    ],
    cooldownSec: 120,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_293",
    l2SkillId: 293,
    minLevel: 40,
    spCost: 33000,
    nameUk: "Two-handed Weapon Mastery",
    hintUk: "Two-handed Weapon Mastery",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 33000,
        mpCost: 0,
        power: 27
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 38000,
        mpCost: 0,
        power: 32
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 0,
        power: 39
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 82000,
        mpCost: 0,
        power: 46
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 120000,
        mpCost: 0,
        power: 54
      },
      {
        level: 11,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 0,
        power: 63
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 0,
        power: 72
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 240000,
        mpCost: 0,
        power: 79
      },
      {
        level: 14,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 0,
        power: 86
      },
      {
        level: 15,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 0,
        power: 93
      },
      {
        level: 16,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 0,
        power: 100
      },
      {
        level: 17,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 0,
        power: 107
      },
      {
        level: 18,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 0,
        power: 114
      },
      {
        level: 19,
        requiredLevel: 72,
        spCost: 1300000,
        mpCost: 0,
        power: 122
      },
      {
        level: 20,
        requiredLevel: 74,
        spCost: 1800000,
        mpCost: 0,
        power: 129
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "flat"
      },
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
    battleId: "l2_295",
    l2SkillId: 295,
    minLevel: 15,
    spCost: 4000,
    nameUk: "Iron Body",
    hintUk: "Iron Body",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_fighter",
      "orc_grand_khavatari",
      "orc_monk",
      "orc_raider",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 15,
        spCost: 4000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "fallResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
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
      "orc_destroyer",
      "orc_raider",
      "orc_titan"
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
        spCost: 38000,
        mpCost: 8,
        power: 166
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 50000,
        mpCost: 9,
        power: 196
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 82000,
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
        spCost: 180000,
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
        spCost: 240000,
        mpCost: 11,
        power: 379
      },
      {
        level: 14,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 11,
        power: 410
      },
      {
        level: 15,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 12,
        power: 443
      },
      {
        level: 16,
        requiredLevel: 66,
        spCost: 580000,
        mpCost: 12,
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
        spCost: 720000,
        mpCost: 13,
        power: 542
      },
      {
        level: 19,
        requiredLevel: 72,
        spCost: 1300000,
        mpCost: 13,
        power: 576
      },
      {
        level: 20,
        requiredLevel: 74,
        spCost: 1800000,
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
    battleId: "l2_315",
    l2SkillId: 315,
    minLevel: 60,
    spCost: 120000,
    nameUk: "Crush of Doom",
    hintUk: "Crush of Doom",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 4558
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 120000,
        mpCost: 0,
        power: 4750
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 4944
      },
      {
        level: 4,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 5142
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 5342
      },
      {
        level: 6,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 5545
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 5751
      },
      {
        level: 8,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 5958
      },
      {
        level: 9,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 6166
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 0,
        power: 6376
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 6586
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 6797
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 7006
      },
      {
        level: 14,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 7218
      },
      {
        level: 15,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 7427
      },
      {
        level: 16,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 0,
        power: 7635
      }
    ],
    effects: [],
    cooldownSec: 26,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_319",
    l2SkillId: 319,
    minLevel: 20,
    spCost: 5300,
    nameUk: "Agile Movement",
    hintUk: "Agile Movement",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_monk",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 5300,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "flat",
        value: 5
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 2
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_320",
    l2SkillId: 320,
    minLevel: 66,
    spCost: 290000,
    nameUk: "Гнів (Wrath)",
    hintUk: "Зона як «поруч» на карті (r≈26000): фіз. урон і зняття частки max CP цілей — 7% (1 р.) … 30% (10 р.). Лише спис або алебарда.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 73,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 74,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 75,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 77,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 78,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 79,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 80,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 81,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 82,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 880000,
        mpCost: 83,
        power: 0
      }
    ],
    effects: [
      {
        stat: "maxCp",
        mode: "multiplier"
      }
    ],
    cooldownSec: 120,
    skipMobHp: false,
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
      "orc_grand_khavatari",
      "orc_titan"
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
        stat: "rootResist",
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
    hintUk: "Пасив: підвищує стійкість до отрути та кровотечі.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_titan"
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
      "orc_grand_khavatari",
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 0,
        power: 2
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
    battleId: "l2_335",
    l2SkillId: 335,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Стійкість (Fortitude)",
    hintUk: "Пасив: підвищення стійкості до станів.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_grand_khavatari",
      "orc_titan"
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
        stat: "stunResist",
        mode: "multiplier"
      },
      {
        stat: "paralyzeResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_339",
    l2SkillId: 339,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Стійка парування (Parry Stance)",
    hintUk: "Стійка: сильно підвищує P. Def і M. Def, знижує швидкість руху, атаки й точність. Постійно витрачає MP.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_titan"
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
        stat: "pDef",
        mode: "multiplier"
      },
      {
        stat: "mDef",
        mode: "multiplier"
      },
      {
        stat: "runSpeed",
        mode: "multiplier"
      },
      {
        stat: "attackSpeed",
        mode: "multiplier"
      },
      {
        stat: "accuracy",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_340",
    l2SkillId: 340,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Riposte Stance",
    hintUk: "Riposte Stance",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_grand_khavatari"
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
        stat: "reflect",
        mode: "flat",
        value: 30
      },
      {
        stat: "reflectSkillPhysic",
        mode: "flat",
        value: 30
      },
      {
        stat: "reflectSkillMagic",
        mode: "flat",
        value: 30
      },
      {
        stat: "attackSpeed",
        mode: "multiplier"
      },
      {
        stat: "runSpeed",
        mode: "multiplier"
      },
      {
        stat: "accuracy",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_346",
    l2SkillId: 346,
    minLevel: 78,
    spCost: 64000000,
    nameUk: "Force Rage",
    hintUk: "Force Rage",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_grand_khavatari"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 64000000,
        mpCost: 5,
        power: 7
      }
    ],
    effects: [],
    cooldownSec: 1,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_347",
    l2SkillId: 347,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Землетрус (Earthquake)",
    hintUk: "Масовий удар по землі з шансом шоку/оглушення. Добрий opener проти пачки мобів. Лише зі списом/алебардою.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 87,
        power: 4040
      }
    ],
    effects: [],
    cooldownSec: 30,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_362",
    l2SkillId: 362,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Armor Crush",
    hintUk: "Armor Crush",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_titan"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 65,
        power: 1973
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "flat"
      },
      {
        stat: "pDef",
        mode: "multiplier"
      },
      {
        stat: "mDef",
        mode: "multiplier"
      }
    ],
    cooldownSec: 15,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_420",
    l2SkillId: 420,
    minLevel: 58,
    spCost: 200000,
    nameUk: "Zealot",
    hintUk: "Zealot",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_destroyer",
      "orc_grand_khavatari",
      "orc_titan",
      "orc_tyrant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 200000,
        mpCost: 106,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 68,
        spCost: 650000,
        mpCost: 122,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 74,
        spCost: 1200000,
        mpCost: 136,
        power: 30
      }
    ],
    effects: [
      {
        stat: "atkSpeed",
        mode: "percent"
      },
      {
        stat: "runSpeed",
        mode: "flat"
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 6
      },
      {
        stat: "hpRegen",
        mode: "multiplier"
      },
      {
        stat: "debuffResist",
        mode: "flat"
      },
      {
        stat: "cancelResist",
        mode: "flat"
      },
      {
        stat: "critRate",
        mode: "flat",
        value: 66
      },
      {
        stat: "critDamage",
        mode: "percent",
        value: 66
      }
    ],
    cooldownSec: 900,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_443",
    l2SkillId: 443,
    minLevel: 79,
    spCost: 60000000,
    nameUk: "Force Barrier",
    hintUk: "Force Barrier",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "orc_grand_khavatari"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 79,
        spCost: 60000000,
        mpCost: 72,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "multiplier"
      },
      {
        stat: "mDef",
        mode: "multiplier"
      },
      {
        stat: "invulnerable",
        mode: "flat",
        value: 1
      }
    ],
    cooldownSec: 180,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  }
];

/** Активні / toggle l2 id (пасивки виключено). */
export const ORC_FIGHTER_ACTIVE_L2_IDS: readonly number[] = [3, 17, 29, 34, 35, 36, 50, 54, 76, 81, 83, 94, 95, 100, 109, 120, 121, 139, 176, 190, 222, 226, 245, 255, 256, 260, 280, 281, 282, 284, 287, 292, 312, 315, 320, 335, 339, 340, 346, 347, 362, 420, 443];
