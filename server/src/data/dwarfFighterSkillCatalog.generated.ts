/**
 * Автоген з text-rpg (`npm run gen:race-fighter-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const DWARF_FIGHTER_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
  {
    battleId: "l2_3",
    l2SkillId: 3,
    minLevel: 5,
    spCost: 50,
    nameUk: "Силовий удар (Power Strike)",
    hintUk: "Завдає потужного удару. Лише з булавою або мечем. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fighter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 5,
        spCost: 50,
        mpCost: 8,
        power: 73
      },
      {
        level: 2,
        requiredLevel: 5,
        spCost: 50,
        mpCost: 9,
        power: 88
      },
      {
        level: 3,
        requiredLevel: 5,
        spCost: 50,
        mpCost: 10,
        power: 102
      },
      {
        level: 4,
        requiredLevel: 10,
        spCost: 370,
        mpCost: 10,
        power: 115
      },
      {
        level: 5,
        requiredLevel: 10,
        spCost: 370,
        mpCost: 11,
        power: 126
      },
      {
        level: 6,
        requiredLevel: 10,
        spCost: 370,
        mpCost: 11,
        power: 137
      },
      {
        level: 7,
        requiredLevel: 15,
        spCost: 1300,
        mpCost: 14,
        power: 178
      },
      {
        level: 8,
        requiredLevel: 15,
        spCost: 1300,
        mpCost: 15,
        power: 205
      },
      {
        level: 9,
        requiredLevel: 15,
        spCost: 1300,
        mpCost: 15,
        power: 210
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_4",
    l2SkillId: 4,
    minLevel: 46,
    spCost: 47000,
    nameUk: "Ривок (Dash)",
    hintUk: "Швидкий біг на короткий час.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 47000,
        mpCost: 41,
        power: 66
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "flat",
        value: 66
      }
    ],
    cooldownSec: 1,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_12",
    l2SkillId: 12,
    minLevel: 43,
    spCost: 41000,
    nameUk: "Підміна цілі (Switch)",
    hintUk: "Збиває таргет ворога.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 41000,
        mpCost: 45,
        power: 80
      },
      {
        level: 2,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 49,
        power: 80
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 54,
        power: 80
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 56,
        power: 80
      },
      {
        level: 5,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 61,
        power: 80
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 65,
        power: 80
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 68,
        power: 80
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 69,
        power: 80
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 72,
        power: 80
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 74,
        power: 80
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 77,
        power: 80
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 79,
        power: 80
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 81,
        power: 80
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 83,
        power: 80
      }
    ],
    effects: [],
    cooldownSec: 1.2,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_16",
    l2SkillId: 16,
    minLevel: 24,
    spCost: 0,
    nameUk: "Смертельний удар (Mortal Blow)",
    hintUk: "Потенційно смертельна атака. Використовується лише з кинжалами. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fighter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 24,
        spCost: 0,
        mpCost: 19,
        power: 268
      },
      {
        level: 11,
        requiredLevel: 24,
        spCost: 0,
        mpCost: 20,
        power: 291
      },
      {
        level: 12,
        requiredLevel: 24,
        spCost: 0,
        mpCost: 20,
        power: 314
      },
      {
        level: 13,
        requiredLevel: 28,
        spCost: 0,
        mpCost: 21,
        power: 367
      },
      {
        level: 14,
        requiredLevel: 28,
        spCost: 0,
        mpCost: 22,
        power: 396
      },
      {
        level: 15,
        requiredLevel: 28,
        spCost: 0,
        mpCost: 23,
        power: 427
      },
      {
        level: 16,
        requiredLevel: 32,
        spCost: 0,
        mpCost: 25,
        power: 494
      },
      {
        level: 17,
        requiredLevel: 32,
        spCost: 0,
        mpCost: 26,
        power: 531
      },
      {
        level: 18,
        requiredLevel: 32,
        spCost: 0,
        mpCost: 27,
        power: 571
      },
      {
        level: 19,
        requiredLevel: 36,
        spCost: 0,
        mpCost: 28,
        power: 656
      },
      {
        level: 20,
        requiredLevel: 36,
        spCost: 0,
        mpCost: 28,
        power: 703
      },
      {
        level: 21,
        requiredLevel: 36,
        spCost: 0,
        mpCost: 29,
        power: 752
      },
      {
        level: 22,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 32,
        power: 859
      },
      {
        level: 23,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 33,
        power: 916
      },
      {
        level: 24,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 34,
        power: 977
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_27",
    l2SkillId: 27,
    minLevel: 40,
    spCost: 35000,
    nameUk: "Відмикання (Unlock)",
    hintUk: "Відкриває двері й скрині; успіх і вимоги до ключів залежать від рангу.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 35000,
        mpCost: 35,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 39,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 43,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 47,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 51,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 55,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 59,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 63,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 67,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 2.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_30",
    l2SkillId: 30,
    minLevel: 40,
    spCost: 12000,
    nameUk: "Удар у спину (Backstab)",
    hintUk: "Удар зі спини кинжалом; оверхіт.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 53,
        power: 1107
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 55,
        power: 1176
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 57,
        power: 1249
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 57,
        power: 1325
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 58,
        power: 1405
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 60,
        power: 1488
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 62,
        power: 1574
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 64,
        power: 1664
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 66,
        power: 1757
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 67,
        power: 1853
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 69,
        power: 1953
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 71,
        power: 2057
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 73,
        power: 2164
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 73,
        power: 2274
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 75,
        power: 2388
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 77,
        power: 2505
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 79,
        power: 2625
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 81,
        power: 2748
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 83,
        power: 2875
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 84,
        power: 3004
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 86,
        power: 3136
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 88,
        power: 3271
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 90,
        power: 3408
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 90,
        power: 3548
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 92,
        power: 3690
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 94,
        power: 3834
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 95,
        power: 3980
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 97,
        power: 4127
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 99,
        power: 4275
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 100,
        power: 4425
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 102,
        power: 4575
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 104,
        power: 4726
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 105,
        power: 4878
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 107,
        power: 5029
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 108,
        power: 5180
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 110,
        power: 5330
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 111,
        power: 5479
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_36",
    l2SkillId: 36,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Вихор (Whirlwind)",
    hintUk: "Широкий удар по кількох ворогах навколо. Лише зі списом або алебардами. Блок щита ігнорується. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 40,
        power: 369
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 41,
        power: 392
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 43,
        power: 417
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 43,
        power: 442
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 44,
        power: 469
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 45,
        power: 496
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 47,
        power: 525
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 48,
        power: 555
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 49,
        power: 586
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 51,
        power: 618
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 52,
        power: 651
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 54,
        power: 686
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 55,
        power: 722
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 55,
        power: 758
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 56,
        power: 796
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 58,
        power: 835
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 59,
        power: 875
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 61,
        power: 916
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 62,
        power: 959
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 63,
        power: 1002
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 65,
        power: 1046
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 66,
        power: 1091
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 68,
        power: 1136
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 68,
        power: 1183
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 69,
        power: 1230
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 70,
        power: 1278
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 72,
        power: 1327
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 73,
        power: 1376
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 74,
        power: 1425
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 75,
        power: 1475
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 77,
        power: 1525
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 78,
        power: 1576
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 79,
        power: 1626
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 80,
        power: 1677
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 81,
        power: 1727
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 82,
        power: 1777
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 83,
        power: 1827
      }
    ],
    effects: [],
    cooldownSec: 1.07,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_48",
    l2SkillId: 48,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Грозова буря (Thunder Storm)",
    hintUk: "Потужний круговий удар списом: шкода й оглушення ворогів. Лише зі списом або алебардами. Блок щита ігнорується. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 40,
        power: 123
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 41,
        power: 131
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 43,
        power: 139
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 43,
        power: 148
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 44,
        power: 157
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 45,
        power: 166
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 47,
        power: 175
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 48,
        power: 185
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 49,
        power: 196
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 51,
        power: 206
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 52,
        power: 217
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 54,
        power: 229
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 55,
        power: 241
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 55,
        power: 253
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 56,
        power: 266
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 58,
        power: 279
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 59,
        power: 292
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 61000,
        mpCost: 61,
        power: 306
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 62,
        power: 320
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 63,
        power: 334
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 65,
        power: 349
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 66,
        power: 364
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 68,
        power: 379
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 68,
        power: 395
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 69,
        power: 410
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 70,
        power: 426
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 72,
        power: 443
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 73,
        power: 459
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 74,
        power: 475
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 75,
        power: 492
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 77,
        power: 509
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 78,
        power: 526
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 79,
        power: 542
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 80,
        power: 559
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 81,
        power: 576
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 82,
        power: 593
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 83,
        power: 609
      }
    ],
    effects: [],
    cooldownSec: 1.08,
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
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
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
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_56",
    l2SkillId: 56,
    minLevel: 24,
    spCost: 0,
    nameUk: "Силовий постріл (Power Shot)",
    hintUk: "Завдає великої шкоди при стрільбі з лука. Можливий надудар. Потрібен лук.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fighter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 24,
        spCost: 0,
        mpCost: 43,
        power: 239
      },
      {
        level: 11,
        requiredLevel: 24,
        spCost: 0,
        mpCost: 44,
        power: 258
      },
      {
        level: 12,
        requiredLevel: 24,
        spCost: 0,
        mpCost: 44,
        power: 279
      },
      {
        level: 13,
        requiredLevel: 28,
        spCost: 0,
        mpCost: 46,
        power: 326
      },
      {
        level: 14,
        requiredLevel: 28,
        spCost: 0,
        mpCost: 48,
        power: 352
      },
      {
        level: 15,
        requiredLevel: 28,
        spCost: 0,
        mpCost: 50,
        power: 379
      },
      {
        level: 16,
        requiredLevel: 32,
        spCost: 0,
        mpCost: 54,
        power: 440
      },
      {
        level: 17,
        requiredLevel: 32,
        spCost: 0,
        mpCost: 57,
        power: 472
      },
      {
        level: 18,
        requiredLevel: 32,
        spCost: 0,
        mpCost: 59,
        power: 507
      },
      {
        level: 19,
        requiredLevel: 36,
        spCost: 0,
        mpCost: 62,
        power: 584
      },
      {
        level: 20,
        requiredLevel: 36,
        spCost: 0,
        mpCost: 62,
        power: 625
      },
      {
        level: 21,
        requiredLevel: 36,
        spCost: 0,
        mpCost: 65,
        power: 669
      },
      {
        level: 22,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 69,
        power: 763
      },
      {
        level: 23,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 72,
        power: 814
      },
      {
        level: 24,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 74,
        power: 865
      }
    ],
    effects: [],
    cooldownSec: 3.2,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_60",
    l2SkillId: 60,
    minLevel: 40,
    spCost: 35000,
    nameUk: "Удавана смерть (Fake Death)",
    hintUk: "Toggle: притворитися мертвим; MP у такті.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 35000,
        mpCost: 200,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_75",
    l2SkillId: 75,
    minLevel: 32,
    spCost: 18000,
    nameUk: "Вразливість комах (Detect Insect Weakness)",
    hintUk: "Тимчасово підвищує фізичну атаку проти комах.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 32,
        spCost: 18000,
        mpCost: 14,
        power: 30
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      }
    ],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_78",
    l2SkillId: 78,
    minLevel: 20,
    spCost: 3700,
    nameUk: "Бойовий клич (War Cry)",
    hintUk: "Миттєво підвищує фізичну атаку.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3700,
        mpCost: 10,
        power: 20
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      }
    ],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_80",
    l2SkillId: 80,
    minLevel: 52,
    spCost: 150000,
    nameUk: "Вразливість монстрів (Detect Monster Weakness)",
    hintUk: "Тимчасово підвищує фізичну атаку проти монстрів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 150000,
        mpCost: 24,
        power: 1
      }
    ],
    effects: [],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_87",
    l2SkillId: 87,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Вразливість звірів (Detect Animal Weakness)",
    hintUk: "Тимчасово підвищує фізичну атаку проти звірів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 18,
        power: 1
      }
    ],
    effects: [],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_88",
    l2SkillId: 88,
    minLevel: 58,
    spCost: 210000,
    nameUk: "Вразливість драконів (Detect Dragon Weakness)",
    hintUk: "Тимчасово підвищує фізичну атаку проти драконів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 210000,
        mpCost: 27,
        power: 1
      }
    ],
    effects: [],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_99",
    l2SkillId: 99,
    minLevel: 1,
    spCost: 0,
    nameUk: "Швидкий постріл (Rapid Shot)",
    hintUk: "Підвищує швидкість стрільби з лука.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [],
    effects: [],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_100",
    l2SkillId: 100,
    minLevel: 20,
    spCost: 1200,
    nameUk: "Приголомшувальний удар (Stun Attack)",
    hintUk: "Сильний удар: оглушує ціль і завдає шкоди. Поки діє попередній ефект — повторно не накладається. Тільки з булавами. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 19,
        power: 36
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 19,
        power: 39
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 20,
        power: 42
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 21,
        power: 49
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 21,
        power: 53
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 22,
        power: 57
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 24,
        power: 66
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 25,
        power: 71
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 26,
        power: 77
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 27,
        power: 88
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 28,
        power: 94
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 29,
        power: 101
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 31,
        power: 115
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 32,
        power: 123
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 33,
        power: 131
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_101",
    l2SkillId: 101,
    minLevel: 20,
    spCost: 0,
    nameUk: "Оглушливий постріл (Stun Shot)",
    hintUk: "Оглушує й завдає шкоди з лука. Лише з луками. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 0,
        mpCost: 49,
        power: 344
      },
      {
        level: 2,
        requiredLevel: 24,
        spCost: 0,
        mpCost: 51,
        power: 367
      },
      {
        level: 3,
        requiredLevel: 28,
        spCost: 0,
        mpCost: 53,
        power: 391
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_104",
    l2SkillId: 104,
    minLevel: 46,
    spCost: 55000,
    nameUk: "Вразливість рослин (Detect Plant Weakness)",
    hintUk: "Тимчасово підвищує фізичну атаку проти рослин.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 55000,
        mpCost: 21,
        power: 1
      }
    ],
    effects: [],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_111",
    l2SkillId: 111,
    minLevel: 55,
    spCost: 170000,
    nameUk: "Абсолютне ухилення (Ultimate Evasion)",
    hintUk: "Сильно підвищує ухилення на короткий час.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 55,
        spCost: 170000,
        mpCost: 50,
        power: 25
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat",
        value: 25
      }
    ],
    cooldownSec: 1,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_113",
    l2SkillId: 113,
    minLevel: 1,
    spCost: 0,
    nameUk: "Дальній постріл (Long Shot)",
    hintUk: "Пасив: збільшує дальність стрільби з лука.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_116",
    l2SkillId: 116,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Звіриний рев (Howl)",
    hintUk: "Миттєво знижує фізичну атаку найближчих ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 29,
        power: 23
      },
      {
        level: 2,
        requiredLevel: 46,
        spCost: 55000,
        mpCost: 31,
        power: 23
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 33,
        power: 23
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 150000,
        mpCost: 35,
        power: 23
      },
      {
        level: 5,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 38,
        power: 23
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 210000,
        mpCost: 40,
        power: 23
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 42,
        power: 23
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 400000,
        mpCost: 43,
        power: 23
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 45,
        power: 23
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 46,
        power: 23
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 780000,
        mpCost: 48,
        power: 23
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 53,
        power: 23
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 1700000,
        mpCost: 50,
        power: 23
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 2100000,
        mpCost: 51,
        power: 23
      }
    ],
    effects: [],
    cooldownSec: 1.2,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_121",
    l2SkillId: 121,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Бойовий рик (Battle Roar)",
    hintUk: "Тимчасово збільшує максимальне HP і відновлює здоров’я.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 18,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 22,
        power: 20
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 210000,
        mpCost: 27,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 30,
        power: 30
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 33,
        power: 35
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "percent"
      }
    ],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_130",
    l2SkillId: 130,
    minLevel: 46,
    spCost: 55000,
    nameUk: "Азарт бою (Thrill Fight)",
    hintUk: "Тимчасово знижує швидкість пересування, але підвищує швидкість атаки.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 46,
        spCost: 55000,
        mpCost: 21,
        power: 5
      },
      {
        level: 2,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 25,
        power: 10
      }
    ],
    effects: [
      {
        stat: "atkSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_137",
    l2SkillId: 137,
    minLevel: 40,
    spCost: 35000,
    nameUk: "Шанс криту (Critical Chance)",
    hintUk: "Пасив: підвищує шанс критичного удару.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 35000,
        mpCost: 0,
        power: 30
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 40
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_141",
    l2SkillId: 141,
    minLevel: 5,
    spCost: 160,
    nameUk: "Майстерність обладунку (Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fighter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
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
        spCost: 550,
        mpCost: 0,
        power: 11
      },
      {
        level: 3,
        requiredLevel: 10,
        spCost: 1000,
        mpCost: 0,
        power: 14
      },
      {
        level: 4,
        requiredLevel: 15,
        spCost: 2000,
        mpCost: 0,
        power: 17
      },
      {
        level: 5,
        requiredLevel: 15,
        spCost: 2500,
        mpCost: 0,
        power: 20
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_142",
    l2SkillId: 142,
    minLevel: 5,
    spCost: 160,
    nameUk: "Майстерність зброї (Weapon Mastery)",
    hintUk: "Пасив: підвищує фізичну атаку.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fighter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
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
        spCost: 550,
        mpCost: 0,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 15,
        spCost: 2000,
        mpCost: 0,
        power: 4
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      },
      {
        stat: "mAtk",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_148",
    l2SkillId: 148,
    minLevel: 40,
    spCost: 35000,
    nameUk: "Життєва сила (Vital Force)",
    hintUk: "Пасив: швидше відновлення HP, коли персонаж сидить.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 35000,
        mpCost: 0,
        power: 2
      },
      {
        level: 4,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 0,
        power: 3
      },
      {
        level: 5,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 4
      },
      {
        level: 6,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 4
      },
      {
        level: 7,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 5
      },
      {
        level: 8,
        requiredLevel: 58,
        spCost: 0,
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_168",
    l2SkillId: 168,
    minLevel: 46,
    spCost: 47000,
    nameUk: "Підсилення швидкості атаки (Boost Attack Speed)",
    hintUk: "Пасив: підвищує швидкість атаки.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 47000,
        mpCost: 0,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 10
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_169",
    l2SkillId: 169,
    minLevel: 43,
    spCost: 41000,
    nameUk: "Швидкий крок (Quick Step)",
    hintUk: "Пасив: підвищує швидкість пересування.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 41000,
        mpCost: 0,
        power: 11
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "flat"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_171",
    l2SkillId: 171,
    minLevel: 1,
    spCost: 0,
    nameUk: "Майстерність шолома (Helm Mastery)",
    hintUk: "Пасив: додатковий захист і бонуси, поки на голові відповідний шолом.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_181",
    l2SkillId: 181,
    minLevel: 55,
    spCost: 180000,
    nameUk: "Відродження (Revival)",
    hintUk: "Сильно відновлює HP; зазвичай спрацьовує при дуже низькому рівні здоров’я.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 25,
        power: 1685
      }
    ],
    effects: [],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_193",
    l2SkillId: 193,
    minLevel: 40,
    spCost: 0,
    nameUk: "Critical Power",
    hintUk: "Critical Power",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 0,
        power: 93
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 177
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 0,
        power: 295
      },
      {
        level: 6,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 0,
        power: 384
      }
    ],
    effects: [
      {
        stat: "critDamage",
        mode: "flat"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_198",
    l2SkillId: 198,
    minLevel: 46,
    spCost: 47000,
    nameUk: "Boost Evasion",
    hintUk: "Boost Evasion",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 46,
        spCost: 47000,
        mpCost: 0,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 4
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_208",
    l2SkillId: 208,
    minLevel: 1,
    spCost: 0,
    nameUk: "Майстерність лука (Bow Mastery)",
    hintUk: "Пасив: підвищує P. Atk при стрільбі з лука.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_209",
    l2SkillId: 209,
    minLevel: 40,
    spCost: 12000,
    nameUk: "Майстерність кинжала (Dagger Mastery)",
    hintUk: "Пасив: підвищує P. Atk з кинжалом.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 0,
        power: 20
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 0,
        power: 21
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 0,
        power: 23
      },
      {
        level: 12,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 0,
        power: 25
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 0,
        power: 26
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 0,
        power: 28
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 0,
        power: 30
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 0,
        power: 32
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 0,
        power: 34
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 36
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 38
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 40
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 42
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 45
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 47
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 49
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 52
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 55
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 57
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 60
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 63
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 0,
        power: 66
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 0,
        power: 69
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 0,
        power: 71
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 0,
        power: 74
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 0,
        power: 78
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 0,
        power: 81
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 0,
        power: 84
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 0,
        power: 87
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 0,
        power: 90
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 0,
        power: 93
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 0,
        power: 96
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 0,
        power: 100
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 0,
        power: 103
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 0,
        power: 106
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 0,
        power: 109
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 0,
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_211",
    l2SkillId: 211,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Підсилення HP (Boost HP)",
    hintUk: "Пасив: збільшує максимальне HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 0,
        power: 200
      },
      {
        level: 5,
        requiredLevel: 49,
        spCost: 89000,
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
        spCost: 400000,
        mpCost: 0,
        power: 350
      },
      {
        level: 8,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 0,
        power: 400
      },
      {
        level: 9,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 0,
        power: 440
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 2100000,
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_212",
    l2SkillId: 212,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Швидке відновлення HP (Fast HP Recovery)",
    hintUk: "Пасив: підвищує відновлення HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 46,
        spCost: 55000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 150000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 210000,
        mpCost: 0,
        power: 2
      },
      {
        level: 7,
        requiredLevel: 68,
        spCost: 780000,
        mpCost: 0,
        power: 3
      },
      {
        level: 8,
        requiredLevel: 74,
        spCost: 2100000,
        mpCost: 0,
        power: 4
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_216",
    l2SkillId: 216,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Майстерність древка (Polearm Mastery)",
    hintUk: "Пасив: підвищує P. Atk зі списом і алебардами.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
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
        spCost: 15000,
        mpCost: 0,
        power: 29
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 30
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 32
      },
      {
        level: 15,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 0,
        power: 35
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 0,
        power: 37
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 18000,
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
        spCost: 50000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 50000,
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
        spCost: 73000,
        mpCost: 0,
        power: 66
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 0,
        power: 69
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 0,
        power: 72
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 79
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 0,
        power: 82
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 0,
        power: 86
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 89
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 93
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 96
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 100
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 103
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 107
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 111
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 114
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 118
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 122
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 125
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 1000000,
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_221",
    l2SkillId: 221,
    minLevel: 40,
    spCost: 35000,
    nameUk: "Безшумний рух (Silent Move)",
    hintUk: "Приховане пересування.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 35000,
        mpCost: 7,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_225",
    l2SkillId: 225,
    minLevel: 43,
    spCost: 0,
    nameUk: "Акробатичний рух (Acrobatic Move)",
    hintUk: "Пасив: під час бігу підвищує ухилення.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 0,
        power: 5
      },
      {
        level: 3,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 6
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_227",
    l2SkillId: 227,
    minLevel: 40,
    spCost: 12000,
    nameUk: "Майстерність легкої броні (Light Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def і ухилення в легкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 11,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 0,
        power: 15
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 0,
        power: 16
      },
      {
        level: 13,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 0,
        power: 17
      },
      {
        level: 14,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 0,
        power: 18
      },
      {
        level: 15,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 0,
        power: 19
      },
      {
        level: 16,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 0,
        power: 21
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 0,
        power: 22
      },
      {
        level: 18,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 0,
        power: 23
      },
      {
        level: 19,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 0,
        power: 24
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 25
      },
      {
        level: 21,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 27
      },
      {
        level: 22,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 0,
        power: 28
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 29
      },
      {
        level: 24,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 30
      },
      {
        level: 25,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 0,
        power: 32
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 33
      },
      {
        level: 27,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 34
      },
      {
        level: 28,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 0,
        power: 36
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 37
      },
      {
        level: 30,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 39
      },
      {
        level: 31,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 0,
        power: 40
      },
      {
        level: 32,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 0,
        power: 42
      },
      {
        level: 33,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 0,
        power: 43
      },
      {
        level: 34,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 0,
        power: 44
      },
      {
        level: 35,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 0,
        power: 46
      },
      {
        level: 36,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 0,
        power: 48
      },
      {
        level: 37,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 0,
        power: 49
      },
      {
        level: 38,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 0,
        power: 51
      },
      {
        level: 39,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 0,
        power: 52
      },
      {
        level: 40,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 0,
        power: 54
      },
      {
        level: 41,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 0,
        power: 55
      },
      {
        level: 42,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 0,
        power: 57
      },
      {
        level: 43,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 0,
        power: 59
      },
      {
        level: 44,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 0,
        power: 60
      },
      {
        level: 45,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 0,
        power: 62
      },
      {
        level: 46,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 0,
        power: 63
      },
      {
        level: 47,
        requiredLevel: 74,
        spCost: 0,
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
        mode: "flat",
        value: 7
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_231",
    l2SkillId: 231,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Майстерність важкої броні (Heavy Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def у важкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 14,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 20
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 21
      },
      {
        level: 16,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 22
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 24
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 25
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 26
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 0,
        power: 28
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 0,
        power: 29
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 18000,
        mpCost: 0,
        power: 30
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 32
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 33
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 30000,
        mpCost: 0,
        power: 35
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 0,
        power: 36
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 0,
        power: 38
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 50000,
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
        spCost: 73000,
        mpCost: 0,
        power: 46
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 0,
        power: 48
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 0,
        power: 49
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 51
      },
      {
        level: 36,
        requiredLevel: 60,
        spCost: 160000,
        mpCost: 0,
        power: 53
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 0,
        power: 55
      },
      {
        level: 38,
        requiredLevel: 62,
        spCost: 200000,
        mpCost: 0,
        power: 56
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 58
      },
      {
        level: 40,
        requiredLevel: 64,
        spCost: 270000,
        mpCost: 0,
        power: 60
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 62
      },
      {
        level: 42,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 64
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 66
      },
      {
        level: 44,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 67
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 69
      },
      {
        level: 46,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 0,
        power: 71
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 73
      },
      {
        level: 48,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 75
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 77
      },
      {
        level: 50,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 79
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_245",
    l2SkillId: 245,
    minLevel: 20,
    spCost: 1200,
    nameUk: "Дикий розмах (Wild Sweep)",
    hintUk: "Завдає шкоди кільком суперникам. Лише зі списом або алебардами. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 19,
        power: 108
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 20,
        power: 117
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 20,
        power: 126
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 21,
        power: 147
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 22,
        power: 159
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 23,
        power: 171
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 25,
        power: 198
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 26,
        power: 213
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 27,
        power: 229
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 28,
        power: 263
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 28,
        power: 281
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 29,
        power: 301
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 32,
        power: 344
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 33,
        power: 367
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 34,
        power: 391
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_255",
    l2SkillId: 255,
    minLevel: 20,
    spCost: 1200,
    nameUk: "Розгром (Power Smash)",
    hintUk: "Потужний удар, що влучає в одну ціль. Лише з булавою або мечем. Можливий надудар.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 19,
        power: 90
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 20,
        power: 97
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 20,
        power: 105
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 21,
        power: 123
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 22,
        power: 132
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 2100,
        mpCost: 23,
        power: 143
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 25,
        power: 165
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 26,
        power: 177
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 4000,
        mpCost: 27,
        power: 191
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 28,
        power: 219
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 28,
        power: 235
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 6100,
        mpCost: 29,
        power: 251
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 32,
        power: 287
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 33,
        power: 306
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 10000,
        mpCost: 34,
        power: 326
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_256",
    l2SkillId: 256,
    minLevel: 24,
    spCost: 6400,
    nameUk: "Точність (Accuracy)",
    hintUk: "Підвищує точність. Постійно витрачає MP, поки активна.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 24,
        spCost: 6400,
        mpCost: 5,
        power: 3
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_257",
    l2SkillId: 257,
    minLevel: 20,
    spCost: 3700,
    nameUk: "Майстерність меча й булави (Sword / Blunt Mastery)",
    hintUk: "Пасив: підвищує P. Atk з мечем або булавою.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3700,
        mpCost: 0,
        power: 4
      },
      {
        level: 2,
        requiredLevel: 24,
        spCost: 6400,
        mpCost: 0,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 28,
        spCost: 6000,
        mpCost: 0,
        power: 8
      },
      {
        level: 4,
        requiredLevel: 28,
        spCost: 6000,
        mpCost: 0,
        power: 10
      },
      {
        level: 5,
        requiredLevel: 32,
        spCost: 9100,
        mpCost: 0,
        power: 12
      },
      {
        level: 6,
        requiredLevel: 32,
        spCost: 9100,
        mpCost: 0,
        power: 15
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_263",
    l2SkillId: 263,
    minLevel: 40,
    spCost: 12000,
    nameUk: "Смертельний удар (Deadly Blow)",
    hintUk: "Потужний удар кинжалом.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 12000,
        mpCost: 36,
        power: 1107
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 37,
        power: 1176
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 0,
        mpCost: 38,
        power: 1249
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 38,
        power: 1325
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 40,
        power: 1405
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 41,
        power: 1488
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 42,
        power: 1574
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 43,
        power: 1664
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 44,
        power: 1757
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 46,
        power: 1853
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 47,
        power: 1953
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 48,
        power: 2057
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 50,
        power: 2164
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 50,
        power: 2274
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 51,
        power: 2388
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 52,
        power: 2505
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 53,
        power: 2625
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 55,
        power: 2748
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 56,
        power: 2875
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 57,
        power: 3004
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 58,
        power: 3136
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 60,
        power: 3271
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 61,
        power: 3408
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 61,
        power: 3548
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 62,
        power: 3690
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 63,
        power: 3834
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 65,
        power: 3980
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 66,
        power: 4127
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 67,
        power: 4275
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 68,
        power: 4425
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 69,
        power: 4575
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 70,
        power: 4726
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 71,
        power: 4878
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 72,
        power: 5029
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 73,
        power: 5180
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 74,
        power: 5330
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 75,
        power: 5479
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_286",
    l2SkillId: 286,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Провокація масова (Provoke)",
    hintUk: "Притягує увагу монстрів довкола до тебе.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 57,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 75,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 83,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_287",
    l2SkillId: 287,
    minLevel: 49,
    spCost: 89000,
    nameUk: "Левине серце (Lionheart)",
    hintUk: "Тимчасово сильно підвищує стійкість до сну, паралічу, утримання, оглушення та ослаблювальних атак.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 400000,
        mpCost: 58,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent"
      },
      {
        stat: "stunResist",
        mode: "percent"
      }
    ],
    cooldownSec: 1.5,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_290",
    l2SkillId: 290,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Остання лютість (Final Frenzy)",
    hintUk: "Пасив: автоматично підвищує фізичну атаку, коли здоров’я падає.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 0,
        power: 32
      },
      {
        level: 2,
        requiredLevel: 46,
        spCost: 55000,
        mpCost: 0,
        power: 39
      },
      {
        level: 3,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 0,
        power: 46
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 150000,
        mpCost: 0,
        power: 54
      },
      {
        level: 5,
        requiredLevel: 55,
        spCost: 180000,
        mpCost: 0,
        power: 63
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 210000,
        mpCost: 0,
        power: 72
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 320000,
        mpCost: 0,
        power: 79
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 400000,
        mpCost: 0,
        power: 86
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 530000,
        mpCost: 0,
        power: 93
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 0,
        power: 100
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 780000,
        mpCost: 0,
        power: 107
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 0,
        power: 114
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 1700000,
        mpCost: 0,
        power: 122
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 2100000,
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_312",
    l2SkillId: 312,
    minLevel: 40,
    spCost: 35000,
    nameUk: "Жорстка стійка (Vicious Stance)",
    hintUk: "Підвищує силу критичного удару. Постійно витрачає MP, поки активна.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 35000,
        mpCost: 7,
        power: 139
      },
      {
        level: 7,
        requiredLevel: 43,
        spCost: 0,
        mpCost: 8,
        power: 166
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 0,
        mpCost: 9,
        power: 196
      },
      {
        level: 9,
        requiredLevel: 49,
        spCost: 0,
        mpCost: 9,
        power: 229
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 0,
        mpCost: 10,
        power: 266
      },
      {
        level: 11,
        requiredLevel: 55,
        spCost: 0,
        mpCost: 10,
        power: 306
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 0,
        mpCost: 11,
        power: 349
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 0,
        mpCost: 11,
        power: 379
      },
      {
        level: 14,
        requiredLevel: 62,
        spCost: 0,
        mpCost: 12,
        power: 410
      },
      {
        level: 15,
        requiredLevel: 64,
        spCost: 0,
        mpCost: 12,
        power: 443
      },
      {
        level: 16,
        requiredLevel: 66,
        spCost: 0,
        mpCost: 13,
        power: 475
      },
      {
        level: 17,
        requiredLevel: 68,
        spCost: 0,
        mpCost: 13,
        power: 509
      },
      {
        level: 18,
        requiredLevel: 70,
        spCost: 0,
        mpCost: 13,
        power: 542
      },
      {
        level: 19,
        requiredLevel: 72,
        spCost: 0,
        mpCost: 14,
        power: 576
      },
      {
        level: 20,
        requiredLevel: 74,
        spCost: 0,
        mpCost: 14,
        power: 610
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
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_317",
    l2SkillId: 317,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Зосереджений удар (Focus Attack)",
    hintUk: "Тимчасово підвищує точність і силу криту проти однієї цілі. Лише зі списом або алебардами.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 7,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 7,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 46,
        spCost: 55000,
        mpCost: 7,
        power: 20
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 89000,
        mpCost: 7,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 150000,
        mpCost: 7,
        power: 30
      }
    ],
    effects: [
      {
        stat: "critDamage",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_320",
    l2SkillId: 320,
    minLevel: 66,
    spCost: 350000,
    nameUk: "Гнів (Wrath)",
    hintUk: "Зона як «поруч» на карті (r≈26000): фіз. урон і зняття частки max CP цілей — 7% (1 р.) … 30% (10 р.). Лише спис або алебарда.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 73,
        power: 7
      },
      {
        level: 2,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 74,
        power: 10
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 75,
        power: 12
      },
      {
        level: 4,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 77,
        power: 15
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 78,
        power: 17
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 420000,
        mpCost: 79,
        power: 20
      },
      {
        level: 7,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 80,
        power: 22
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 81,
        power: 25
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 82,
        power: 27
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 83,
        power: 30
      }
    ],
    effects: [],
    cooldownSec: 1.08,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_328",
    l2SkillId: 328,
    minLevel: 76,
    spCost: 12000000,
    nameUk: "Мудрість (Wisdom)",
    hintUk: "Пасив: підвищує стійкість до утримання, сну та ментальних ефектів.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 12000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_329",
    l2SkillId: 329,
    minLevel: 76,
    spCost: 12000000,
    nameUk: "Здоров’я (Health)",
    hintUk: "Пасив: підвищує стійкість до отрути та кровотечі.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 12000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_330",
    l2SkillId: 330,
    minLevel: 77,
    spCost: 15000000,
    nameUk: "Майстерність скілів (Skill Mastery)",
    hintUk: "Пасив: шанс повторно застосувати вміння або подовжити ефект.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 15000000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_339",
    l2SkillId: 339,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Стійка парування (Parry Stance)",
    hintUk: "Стійка: сильно підвищує P. Def і M. Def, знижує швидкість руху, атаки й точність. Постійно витрачає MP.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 36,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent",
        value: 25
      },
      {
        stat: "mDef",
        mode: "percent",
        value: 25
      },
      {
        stat: "atkSpeed",
        mode: "percent"
      },
      {
        stat: "accuracy",
        mode: "flat"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true,
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
      "dwarf_fortune_seeker"
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
    cooldownSec: 1.8,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_347",
    l2SkillId: 347,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Землетрус (Earthquake)",
    hintUk: "Удар списом по ближніх ворогах: велика шкода по площі, знімає ціль. Лише зі списом. Можливий надудар.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 87,
        power: 4040
      }
    ],
    effects: [],
    cooldownSec: 1.8,
    skipMobHp: false,
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
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 71,
        power: 20
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent"
      }
    ],
    cooldownSec: 2,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_357",
    l2SkillId: 357,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Фокус сили (Focus Power)",
    hintUk: "Баф: сила ударів кинжалом.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 71,
        power: 20
      }
    ],
    effects: [
      {
        stat: "critDamage",
        mode: "percent"
      }
    ],
    cooldownSec: 2,
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
      "dwarf_fortune_seeker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 35,
        power: 100
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "flat"
      }
    ],
    cooldownSec: 1,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_359",
    l2SkillId: 359,
    minLevel: 77,
    spCost: 15000000,
    nameUk: "Око мисливця (Eye of the Hunter)",
    hintUk: "Тимчасово підвищує фізичну атаку проти комах, рослин і звірів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 15000000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 2,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_360",
    l2SkillId: 360,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Око вбивці (Eye of the Slayer)",
    hintUk: "Тимчасово підвищує фізичну атаку проти звірів, магічних істот, гігантів і драконів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dwarf_maestro"
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
    effects: [],
    cooldownSec: 2,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_361",
    l2SkillId: 361,
    minLevel: 77,
    spCost: 15000000,
    nameUk: "Ударний імпульс (Shock Blast)",
    hintUk: "Дальня хвиля: шок і зниження захисту цілей. Лише зі списом. Можливий надудар.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 15000000,
        mpCost: 65,
        power: 1973
      }
    ],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  }
];

/** Активні / toggle l2 id (пасивки виключено). */
export const DWARF_FIGHTER_ACTIVE_L2_IDS: readonly number[] = [3, 4, 12, 16, 27, 30, 36, 48, 51, 56, 60, 75, 78, 80, 87, 88, 99, 100, 101, 104, 111, 116, 121, 130, 181, 221, 245, 255, 256, 263, 286, 287, 312, 317, 320, 339, 344, 347, 356, 357, 358, 359, 360, 361];
