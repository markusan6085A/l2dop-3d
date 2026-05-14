/**
 * Автоген з text-rpg ElvenMystic (`npm run gen:em-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const ELVEN_MYSTIC_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
  {
    battleId: "l2_67",
    l2SkillId: 67,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Скіл №67",
    hintUk: "Скіл №67",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 38,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 50,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 55,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 60,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 640000,
        mpCost: 64,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 72,
        spCost: 1300000,
        mpCost: 67,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_118",
    l2SkillId: 118,
    minLevel: 1,
    spCost: 0,
    nameUk: "Рух мага",
    hintUk: "Пасив: дозволяє рухатися в мантії та легкій броні без затримки, як у мага.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 0,
        power: 5
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent",
        value: 5
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: 5
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_141",
    l2SkillId: 141,
    minLevel: 7,
    spCost: 520,
    nameUk: "Скіл №141",
    hintUk: "Пасив: підвищує захист і швидкість читання заклинань у відповідній броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 520,
        mpCost: 0,
        power: 6
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 0,
        power: 8
      },
      {
        level: 3,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 0,
        power: 9
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_142",
    l2SkillId: 142,
    minLevel: 40,
    spCost: 10000,
    nameUk: "Скіл №142",
    hintUk: "Скіл №142",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 16
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 17
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 18
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 20
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 21
      },
      {
        level: 15,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 22
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 0,
        power: 25
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 0,
        power: 26
      },
      {
        level: 18,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 0,
        power: 28
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 0,
        power: 31
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 0,
        power: 33
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 0,
        power: 34
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 37000,
        mpCost: 0,
        power: 38
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 37000,
        mpCost: 0,
        power: 39
      },
      {
        level: 24,
        requiredLevel: 56,
        spCost: 37000,
        mpCost: 0,
        power: 41
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 0,
        power: 43
      },
      {
        level: 26,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 0,
        power: 45
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 0,
        power: 47
      },
      {
        level: 28,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 0,
        power: 49
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 51
      },
      {
        level: 30,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 53
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 55
      },
      {
        level: 32,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 57
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 0,
        power: 59
      },
      {
        level: 34,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 0,
        power: 62
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 0,
        power: 64
      },
      {
        level: 36,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 0,
        power: 66
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 0,
        power: 68
      },
      {
        level: 38,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 0,
        power: 70
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 72
      },
      {
        level: 40,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 75
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 77
      },
      {
        level: 42,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 79
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "flat"
      },
      {
        stat: "mAtk",
        mode: "flat"
      },
      {
        stat: "pAtk",
        mode: "percent",
        value: 45
      },
      {
        stat: "mAtk",
        mode: "percent",
        value: 17
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_143",
    l2SkillId: 143,
    minLevel: 44,
    spCost: 44000,
    nameUk: "Скіл №143",
    hintUk: "Скіл №143",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 44000,
        mpCost: 0,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_146",
    l2SkillId: 146,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Антимагія",
    hintUk: "Пасив: підвищує опір магічній шкоді (M. Def).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 13,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 40
      },
      {
        level: 14,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 42
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 43
      },
      {
        level: 16,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 0,
        power: 46
      },
      {
        level: 17,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 0,
        power: 47
      },
      {
        level: 18,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 0,
        power: 49
      },
      {
        level: 19,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 0,
        power: 52
      },
      {
        level: 20,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 0,
        power: 54
      },
      {
        level: 21,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 0,
        power: 56
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 30000,
        mpCost: 0,
        power: 59
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 30000,
        mpCost: 0,
        power: 61
      },
      {
        level: 24,
        requiredLevel: 52,
        spCost: 30000,
        mpCost: 0,
        power: 63
      },
      {
        level: 25,
        requiredLevel: 56,
        spCost: 31000,
        mpCost: 0,
        power: 66
      },
      {
        level: 26,
        requiredLevel: 56,
        spCost: 31000,
        mpCost: 0,
        power: 68
      },
      {
        level: 27,
        requiredLevel: 56,
        spCost: 31000,
        mpCost: 0,
        power: 70
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 0,
        power: 72
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 0,
        power: 74
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 79000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 79000,
        mpCost: 0,
        power: 78
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 110000,
        mpCost: 0,
        power: 80
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 110000,
        mpCost: 0,
        power: 82
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 130000,
        mpCost: 0,
        power: 84
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 130000,
        mpCost: 0,
        power: 86
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 170000,
        mpCost: 0,
        power: 88
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 170000,
        mpCost: 0,
        power: 91
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 210000,
        mpCost: 0,
        power: 93
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 210000,
        mpCost: 0,
        power: 95
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 0,
        power: 97
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 0,
        power: 99
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 0,
        power: 102
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 0,
        power: 104
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 550000,
        mpCost: 0,
        power: 106
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 550000,
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
    skipMobHp: true
  },
  {
    battleId: "l2_163",
    l2SkillId: 163,
    minLevel: 1,
    spCost: 0,
    nameUk: "Майстерність чар",
    hintUk: "Пасив: підсилює магічну атаку.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 0,
        power: 50
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent",
        value: 50
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_164",
    l2SkillId: 164,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Швидке відновлення",
    hintUk: "Пасив: швидше відновлення після використання активних умінь.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 0,
        power: 20
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 0,
        power: 25
      }
    ],
    effects: [
      {
        stat: "cooldownReduction",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_194",
    l2SkillId: 194,
    minLevel: 1,
    spCost: 0,
    nameUk: "Удача",
    hintUk: "Пасив: впливає на якість випадіння луту з ворогів.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
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
    skipMobHp: true
  },
  {
    battleId: "l2_212",
    l2SkillId: 212,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Швидке відновлення HP",
    hintUk: "Пасив: прискорює відновлення HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 0,
        power: 70
      },
      {
        level: 4,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 0,
        power: 100
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 0,
        power: 140
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 152
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 0,
        power: 180
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 0,
        power: 200
      }
    ],
    effects: [
      {
        stat: "maxMp",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_213",
    l2SkillId: 213,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Підсилення мани",
    hintUk: "Пасив: збільшує максимум MP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 41
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 42
      },
      {
        level: 11,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 0,
        power: 48
      },
      {
        level: 12,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 0,
        power: 49
      },
      {
        level: 13,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 0,
        power: 50
      },
      {
        level: 14,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 0,
        power: 52
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 0,
        power: 53
      },
      {
        level: 16,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 0,
        power: 59
      },
      {
        level: 17,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 61
      },
      {
        level: 18,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 62
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 0,
        power: 64
      },
      {
        level: 20,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 0,
        power: 66
      },
      {
        level: 21,
        requiredLevel: 62,
        spCost: 210000,
        mpCost: 0,
        power: 72
      },
      {
        level: 22,
        requiredLevel: 64,
        spCost: 250000,
        mpCost: 0,
        power: 73
      },
      {
        level: 23,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 75
      },
      {
        level: 24,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 76
      },
      {
        level: 25,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 78
      },
      {
        level: 26,
        requiredLevel: 72,
        spCost: 790000,
        mpCost: 0,
        power: 79
      },
      {
        level: 27,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 0,
        power: 81
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_214",
    l2SkillId: 214,
    minLevel: 1,
    spCost: 0,
    nameUk: "Відновлення мани",
    hintUk: "Пасив: прискорює відновлення MP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 0,
        power: 20
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_217",
    l2SkillId: 217,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Скіл №217",
    hintUk: "Скіл №217",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 0,
        power: 3
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 0,
        power: 4
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 0,
        power: 4
      },
      {
        level: 4,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 5
      },
      {
        level: 5,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 5
      },
      {
        level: 6,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 0,
        power: 6
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_227",
    l2SkillId: 227,
    minLevel: 20,
    spCost: 1600,
    nameUk: "Скіл №227",
    hintUk: "Скіл №227",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1600,
        mpCost: 0,
        power: 4
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1600,
        mpCost: 0,
        power: 5
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 3200,
        mpCost: 0,
        power: 6
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 3200,
        mpCost: 0,
        power: 7
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 6200,
        mpCost: 0,
        power: 9
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 6200,
        mpCost: 0,
        power: 9
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 10000,
        mpCost: 0,
        power: 10
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 10000,
        mpCost: 0,
        power: 12
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: 91
      },
      {
        stat: "attackSpeed",
        mode: "percent",
        value: 25
      },
      {
        stat: "mpRegen",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_228",
    l2SkillId: 228,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Швидке зачарування",
    hintUk: "Пасив: скорочує час читання заклинань.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 0,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 0,
        power: 10
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_229",
    l2SkillId: 229,
    minLevel: 44,
    spCost: 41000,
    nameUk: "Швидке відновлення MP",
    hintUk: "Пасив: швидше відновлення MP у бою.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 590000,
        mpCost: 0,
        power: 3
      },
      {
        level: 7,
        requiredLevel: 74,
        spCost: 1600000,
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
    skipMobHp: true
  },
  {
    battleId: "l2_234",
    l2SkillId: 234,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Майстерність мантії",
    hintUk: "Пасив: кращі бонуси в мантії.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 14
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 15
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 16
      },
      {
        level: 12,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 17
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 18
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 19
      },
      {
        level: 15,
        requiredLevel: 48,
        spCost: 20000,
        mpCost: 0,
        power: 21
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 20000,
        mpCost: 0,
        power: 22
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 20000,
        mpCost: 0,
        power: 23
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 0,
        power: 25
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 0,
        power: 26
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 0,
        power: 27
      },
      {
        level: 21,
        requiredLevel: 56,
        spCost: 32000,
        mpCost: 0,
        power: 30
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 32000,
        mpCost: 0,
        power: 31
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 32000,
        mpCost: 0,
        power: 32
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 0,
        power: 33
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 0,
        power: 34
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 0,
        power: 35
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 0,
        power: 37
      },
      {
        level: 28,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 0,
        power: 38
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 0,
        power: 39
      },
      {
        level: 30,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 0,
        power: 40
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 0,
        power: 41
      },
      {
        level: 32,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 0,
        power: 43
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 0,
        power: 44
      },
      {
        level: 34,
        requiredLevel: 68,
        spCost: 190000,
        mpCost: 0,
        power: 45
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 190000,
        mpCost: 0,
        power: 47
      },
      {
        level: 36,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 0,
        power: 48
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 260000,
        mpCost: 0,
        power: 50
      },
      {
        level: 38,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 0,
        power: 51
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 0,
        power: 53
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 550000,
        mpCost: 0,
        power: 53
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 550000,
        mpCost: 0,
        power: 55
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_249",
    l2SkillId: 249,
    minLevel: 44,
    spCost: 37000,
    nameUk: "Майстерність зброї",
    hintUk: "Пасив: кращі бонуси від зброї.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 0,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 250000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 0,
        power: 2
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat",
        value: 1
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_328",
    l2SkillId: 328,
    minLevel: 76,
    spCost: 15000000,
    nameUk: "Мудрість",
    hintUk: "Пасив: підвищує WIT.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_evas_saint",
      "elf_mystic_muse"
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
    skipMobHp: true
  },
  {
    battleId: "l2_329",
    l2SkillId: 329,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Здоров’я",
    hintUk: "Пасив: підвищує CON.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_evas_saint"
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
    skipMobHp: true
  },
  {
    battleId: "l2_330",
    l2SkillId: 330,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Майстерність умінь",
    hintUk: "Пасив: підсилює ефективність пасивних умінь.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_mystic_muse"
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
    skipMobHp: true
  },
  {
    battleId: "l2_331",
    l2SkillId: 331,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Скіл №331",
    hintUk: "Пасив: підвищує майстерність умінь (Skill Mastery).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_evas_saint"
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
    skipMobHp: true
  },
  {
    battleId: "l2_337",
    l2SkillId: 337,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Таємна сила",
    hintUk: "Пасив: прихований бонус до STR.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_evas_saint",
      "elf_mystic_muse"
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
        stat: "mAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true
  },
  {
    battleId: "l2_338",
    l2SkillId: 338,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Таємна спритність",
    hintUk: "Пасив: прихований бонус до DEX.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_elemental_master"
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
        stat: "castSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "cooldownReduction",
        mode: "percent",
        value: 10
      },
      {
        stat: "mpRegen",
        mode: "percent"
      }
    ],
    cooldownSec: 1,
    skipMobHp: true
  },
  {
    battleId: "l2_1011",
    l2SkillId: 1011,
    minLevel: 20,
    spCost: 1100,
    nameUk: "Зцілення",
    hintUk: "Відновлює частину HP одній цілі.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 7,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 21,
        power: 121
      },
      {
        level: 8,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 24,
        power: 135
      },
      {
        level: 9,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 26,
        power: 151
      },
      {
        level: 10,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 28,
        power: 176
      },
      {
        level: 11,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 29,
        power: 185
      },
      {
        level: 12,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 33,
        power: 195
      },
      {
        level: 13,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 35,
        power: 224
      },
      {
        level: 14,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 35,
        power: 234
      },
      {
        level: 15,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 38,
        power: 245
      },
      {
        level: 16,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 40,
        power: 278
      },
      {
        level: 17,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 40,
        power: 289
      },
      {
        level: 18,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 41,
        power: 301
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1012",
    l2SkillId: 1012,
    minLevel: 7,
    spCost: 520,
    nameUk: "Лікування отрути",
    hintUk: "Знімає отруту з цілі.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 520,
        mpCost: 10,
        power: 3
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1013",
    l2SkillId: 1013,
    minLevel: 40,
    spCost: 17000,
    nameUk: "Скіл №1013",
    hintUk: "Скіл №1013",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 5,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 67,
        power: 66
      },
      {
        level: 6,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 70,
        power: 70
      },
      {
        level: 7,
        requiredLevel: 44,
        spCost: 21000,
        mpCost: 74,
        power: 73
      },
      {
        level: 8,
        requiredLevel: 44,
        spCost: 21000,
        mpCost: 78,
        power: 77
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 82,
        power: 81
      },
      {
        level: 10,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 87,
        power: 86
      },
      {
        level: 11,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 90,
        power: 90
      },
      {
        level: 12,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 94,
        power: 94
      },
      {
        level: 13,
        requiredLevel: 56,
        spCost: 53000,
        mpCost: 98,
        power: 98
      },
      {
        level: 14,
        requiredLevel: 56,
        spCost: 53000,
        mpCost: 103,
        power: 102
      },
      {
        level: 15,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 104,
        power: 104
      },
      {
        level: 16,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 107,
        power: 106
      },
      {
        level: 17,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 109,
        power: 108
      },
      {
        level: 18,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 110,
        power: 110
      },
      {
        level: 19,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 113,
        power: 113
      },
      {
        level: 20,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 115,
        power: 115
      },
      {
        level: 21,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 117,
        power: 116
      },
      {
        level: 22,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 119,
        power: 118
      },
      {
        level: 23,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 120,
        power: 120
      },
      {
        level: 24,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 123,
        power: 122
      },
      {
        level: 25,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 124,
        power: 124
      },
      {
        level: 26,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 127,
        power: 126
      },
      {
        level: 27,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 128,
        power: 128
      },
      {
        level: 28,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 130,
        power: 129
      },
      {
        level: 29,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 132,
        power: 131
      },
      {
        level: 30,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 133,
        power: 133
      },
      {
        level: 31,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 135,
        power: 134
      },
      {
        level: 32,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 137,
        power: 136
      }
    ],
    effects: [],
    cooldownSec: 12,
    skipMobHp: true
  },
  {
    battleId: "l2_1015",
    l2SkillId: 1015,
    minLevel: 20,
    spCost: 1100,
    nameUk: "Бойове зцілення",
    hintUk: "Швидке зцілення однієї цілі в бою.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 28,
        power: 121
      },
      {
        level: 5,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 32,
        power: 135
      },
      {
        level: 6,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 35,
        power: 151
      },
      {
        level: 7,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 39,
        power: 176
      },
      {
        level: 8,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 41,
        power: 185
      },
      {
        level: 9,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 43,
        power: 195
      },
      {
        level: 10,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 49,
        power: 224
      },
      {
        level: 11,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 52,
        power: 234
      },
      {
        level: 12,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 53,
        power: 245
      },
      {
        level: 13,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 57,
        power: 278
      },
      {
        level: 14,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 59,
        power: 289
      },
      {
        level: 15,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 62,
        power: 301
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: true
  },
  {
    battleId: "l2_1016",
    l2SkillId: 1016,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Воскресіння",
    hintUk: "Повертає до життя поваленого союзника.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 122,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 152,
        power: 40
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 180,
        power: 50
      },
      {
        level: 6,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 195,
        power: 55
      },
      {
        level: 7,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 207,
        power: 60
      }
    ],
    effects: [],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1020",
    l2SkillId: 1020,
    minLevel: 48,
    spCost: 22000,
    nameUk: "Життєва сила",
    hintUk: "Підсилює життєву стійкість (CON).",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 87,
        power: 440
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 89,
        power: 454
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 92,
        power: 467
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 97,
        power: 494
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 97,
        power: 508
      },
      {
        level: 6,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 99,
        power: 521
      },
      {
        level: 7,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 104,
        power: 548
      },
      {
        level: 8,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 107,
        power: 562
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 109,
        power: 575
      },
      {
        level: 10,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 112,
        power: 588
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 114,
        power: 602
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 117,
        power: 615
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 118,
        power: 627
      },
      {
        level: 14,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 118,
        power: 640
      },
      {
        level: 15,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 120,
        power: 653
      },
      {
        level: 16,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 123,
        power: 665
      },
      {
        level: 17,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 124,
        power: 677
      },
      {
        level: 18,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 127,
        power: 689
      },
      {
        level: 19,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 129,
        power: 700
      },
      {
        level: 20,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 132,
        power: 711
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 133,
        power: 722
      },
      {
        level: 22,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 135,
        power: 733
      },
      {
        level: 23,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 137,
        power: 743
      },
      {
        level: 24,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 139,
        power: 753
      },
      {
        level: 25,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 140,
        power: 763
      },
      {
        level: 26,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 142,
        power: 772
      },
      {
        level: 27,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 144,
        power: 780
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1027",
    l2SkillId: 1027,
    minLevel: 20,
    spCost: 1100,
    nameUk: "Групове зцілення",
    hintUk: "Зцілює групу союзників у зоні дії.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 38,
        power: 97
      },
      {
        level: 5,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 42,
        power: 108
      },
      {
        level: 6,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 47,
        power: 121
      },
      {
        level: 7,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 52,
        power: 141
      },
      {
        level: 8,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 55,
        power: 148
      },
      {
        level: 9,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 57,
        power: 156
      },
      {
        level: 10,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 66,
        power: 179
      },
      {
        level: 11,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 69,
        power: 188
      },
      {
        level: 12,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 70,
        power: 196
      },
      {
        level: 13,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 76,
        power: 222
      },
      {
        level: 14,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 79,
        power: 231
      },
      {
        level: 15,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 82,
        power: 241
      }
    ],
    effects: [],
    cooldownSec: 25,
    skipMobHp: true
  },
  {
    battleId: "l2_1028",
    l2SkillId: 1028,
    minLevel: 40,
    spCost: 17000,
    nameUk: "Міць небес",
    hintUk: "Підсилює бойові параметри союзників.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 34,
        power: 39
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 35,
        power: 42
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 21000,
        mpCost: 38,
        power: 44
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 21000,
        mpCost: 39,
        power: 47
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 42,
        power: 49
      },
      {
        level: 6,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 44,
        power: 52
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 45,
        power: 55
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 50000,
        mpCost: 48,
        power: 57
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 53000,
        mpCost: 49,
        power: 60
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 53000,
        mpCost: 52,
        power: 63
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 54,
        power: 66
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 55,
        power: 68
      },
      {
        level: 13,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
        power: 71
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 60,
        power: 74
      },
      {
        level: 15,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 62,
        power: 77
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 590000,
        mpCost: 64,
        power: 79
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 65,
        power: 82
      },
      {
        level: 18,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 67,
        power: 84
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 69,
        power: 87
      }
    ],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false
  },
  {
    battleId: "l2_1031",
    l2SkillId: 1031,
    minLevel: 20,
    spCost: 1600,
    nameUk: "Розсіювання мерців",
    hintUk: "Розганяє нежить у зоні.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1600,
        mpCost: 14,
        power: 19
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1600,
        mpCost: 16,
        power: 21
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 3200,
        mpCost: 17,
        power: 24
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 3200,
        mpCost: 18,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 6200,
        mpCost: 20,
        power: 28
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 6200,
        mpCost: 21,
        power: 30
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 10000,
        mpCost: 23,
        power: 33
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 10000,
        mpCost: 24,
        power: 36
      }
    ],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false
  },
  {
    battleId: "l2_1033",
    l2SkillId: 1033,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Стійкість до отрути",
    hintUk: "Підвищує стійкість до отрути.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 35,
        power: 40
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 39,
        power: 50
      }
    ],
    effects: [
      {
        stat: "poisonResist",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1035",
    l2SkillId: 1035,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Ментальний щит",
    hintUk: "Захищає від ментальних ефектів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 35,
        power: 60
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 70
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 80
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "percent"
      },
      {
        stat: "sleepResist",
        mode: "percent"
      },
      {
        stat: "fearResist",
        mode: "percent"
      },
      {
        stat: "mentalResist",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1040",
    l2SkillId: 1040,
    minLevel: 7,
    spCost: 520,
    nameUk: "Щит",
    hintUk: "Підвищує фізичний захист.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 520,
        mpCost: 10,
        power: 8
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent",
        value: 8
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1043",
    l2SkillId: 1043,
    minLevel: 25,
    spCost: 6500,
    nameUk: "Свята зброя",
    hintUk: "Накладає святу зброю на союзника.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 6500,
        mpCost: 23,
        power: 0
      }
    ],
    effects: [
      {
        stat: "holyAttack",
        mode: "percent",
        value: 10
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1044",
    l2SkillId: 1044,
    minLevel: 48,
    spCost: 67000,
    nameUk: "Регенерація",
    hintUk: "Регенерація HP з часом.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 20
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1047",
    l2SkillId: 1047,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Скіл №1047",
    hintUk: "Скіл №1047",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 35,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 44,
        power: 2
      },
      {
        level: 3,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 55,
        power: 2
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 65,
        power: 3
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "flat"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1050",
    l2SkillId: 1050,
    minLevel: 44,
    spCost: 41000,
    nameUk: "Скіл №1050",
    hintUk: "Скіл №1050",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 105,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 153,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 300,
    skipMobHp: true
  },
  {
    battleId: "l2_1056",
    l2SkillId: 1056,
    minLevel: 48,
    spCost: 60000,
    nameUk: "Скасування",
    hintUk: "Перериває підготовку ворожої навички.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 44,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 48,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 52,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 54,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 55,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 60,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 62,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1068",
    l2SkillId: 1068,
    minLevel: 7,
    spCost: 520,
    nameUk: "Сила",
    hintUk: "Підсилює силу (STR).",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 520,
        mpCost: 10,
        power: 8
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent",
        value: 8
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1069",
    l2SkillId: 1069,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Сон",
    hintUk: "Накладає сон на ціль.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 34,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 34,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 35,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 38,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 38,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 39,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 42,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 43,
        power: 0
      },
      {
        level: 18,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 44,
        power: 0
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 45,
        power: 0
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 47,
        power: 0
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 48,
        power: 0
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 49,
        power: 0
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 50,
        power: 0
      },
      {
        level: 24,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 52,
        power: 0
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 53,
        power: 0
      },
      {
        level: 26,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 54,
        power: 0
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 55,
        power: 0
      },
      {
        level: 28,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 55,
        power: 0
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 57,
        power: 0
      },
      {
        level: 30,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 58,
        power: 0
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 59,
        power: 0
      },
      {
        level: 32,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 60,
        power: 0
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 60,
        power: 0
      },
      {
        level: 34,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 62,
        power: 0
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 63,
        power: 0
      },
      {
        level: 36,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 64,
        power: 0
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 64,
        power: 0
      },
      {
        level: 38,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 65,
        power: 0
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 67,
        power: 0
      },
      {
        level: 40,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 67,
        power: 0
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 68,
        power: 0
      },
      {
        level: 42,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "sleepResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1072",
    l2SkillId: 1072,
    minLevel: 44,
    spCost: 37000,
    nameUk: "Хмара сну",
    hintUk: "Хмара сну на площі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 59,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 77,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 87,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 93,
        power: 0
      }
    ],
    effects: [
      {
        stat: "sleepResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1073",
    l2SkillId: 1073,
    minLevel: 52,
    spCost: 100000,
    nameUk: "Поцілунок Еви",
    hintUk: "Потужне зцілення в стилі Еви.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 600
      }
    ],
    effects: [
      {
        stat: "breathGauge",
        mode: "multiplier",
        value: 600
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1078",
    l2SkillId: 1078,
    minLevel: 44,
    spCost: 41000,
    nameUk: "Концентрація",
    hintUk: "Підвищує швидкість читання заклинань.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 39,
        power: 36
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 42
      },
      {
        level: 5,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 55,
        power: 48
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 590000,
        mpCost: 64,
        power: 53
      }
    ],
    effects: [
      {
        stat: "cancelResist",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1087",
    l2SkillId: 1087,
    minLevel: 44,
    spCost: 41000,
    nameUk: "Скіл №1087",
    hintUk: "Скіл №1087",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 39,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 4
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1126",
    l2SkillId: 1126,
    minLevel: 40,
    spCost: 16000,
    nameUk: "Перезарядка слуги",
    hintUk: "Скидає перезарядку вмінь слуги.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 7,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 67,
        power: 66
      },
      {
        level: 8,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 70,
        power: 70
      },
      {
        level: 9,
        requiredLevel: 44,
        spCost: 22000,
        mpCost: 74,
        power: 73
      },
      {
        level: 10,
        requiredLevel: 44,
        spCost: 22000,
        mpCost: 78,
        power: 77
      },
      {
        level: 11,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 82,
        power: 81
      },
      {
        level: 12,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 87,
        power: 86
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 53000,
        mpCost: 90,
        power: 90
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 53000,
        mpCost: 94,
        power: 94
      },
      {
        level: 15,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 98,
        power: 98
      },
      {
        level: 16,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 103,
        power: 102
      },
      {
        level: 17,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 104,
        power: 104
      },
      {
        level: 18,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 107,
        power: 106
      },
      {
        level: 19,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 109,
        power: 108
      },
      {
        level: 20,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 110,
        power: 110
      },
      {
        level: 21,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 113,
        power: 113
      },
      {
        level: 22,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 115,
        power: 115
      },
      {
        level: 23,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 117,
        power: 116
      },
      {
        level: 24,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 119,
        power: 118
      },
      {
        level: 25,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 120,
        power: 120
      },
      {
        level: 26,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 123,
        power: 122
      },
      {
        level: 27,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 124,
        power: 124
      },
      {
        level: 28,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 127,
        power: 126
      },
      {
        level: 29,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 128,
        power: 128
      },
      {
        level: 30,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 130,
        power: 129
      },
      {
        level: 31,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 132,
        power: 131
      },
      {
        level: 32,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 133,
        power: 133
      },
      {
        level: 33,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 135,
        power: 134
      },
      {
        level: 34,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 137,
        power: 136
      }
    ],
    effects: [],
    cooldownSec: 12,
    skipMobHp: true
  },
  {
    battleId: "l2_1127",
    l2SkillId: 1127,
    minLevel: 40,
    spCost: 10000,
    nameUk: "Зцілення слуги",
    hintUk: "Зцілює призваного слугу.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 13,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 58,
        power: 404
      },
      {
        level: 14,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 60,
        power: 419
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 62,
        power: 434
      },
      {
        level: 16,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 64,
        power: 465
      },
      {
        level: 17,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 65,
        power: 481
      },
      {
        level: 18,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 68,
        power: 496
      },
      {
        level: 19,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 72,
        power: 528
      },
      {
        level: 20,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 74,
        power: 544
      },
      {
        level: 21,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 77,
        power: 561
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 80,
        power: 593
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 80,
        power: 609
      },
      {
        level: 24,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 83,
        power: 626
      },
      {
        level: 25,
        requiredLevel: 56,
        spCost: 37000,
        mpCost: 87,
        power: 658
      },
      {
        level: 26,
        requiredLevel: 56,
        spCost: 37000,
        mpCost: 89,
        power: 674
      },
      {
        level: 27,
        requiredLevel: 56,
        spCost: 37000,
        mpCost: 90,
        power: 690
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 93,
        power: 706
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 95,
        power: 722
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 97,
        power: 737
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 98,
        power: 753
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 98,
        power: 768
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 100,
        power: 783
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 102,
        power: 798
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 104,
        power: 812
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 105,
        power: 826
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 108,
        power: 840
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 109,
        power: 854
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 112,
        power: 867
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 113,
        power: 879
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 114,
        power: 892
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 115,
        power: 904
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 117,
        power: 915
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 119,
        power: 926
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 120,
        power: 936
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1139",
    l2SkillId: 1139,
    minLevel: 44,
    spCost: 44000,
    nameUk: "Скіл №1139",
    hintUk: "Скіл №1139",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 44000,
        mpCost: 39,
        power: 23
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 30
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent",
        value: 23
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1140",
    l2SkillId: 1140,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Скіл №1140",
    hintUk: "Скіл №1140",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 35,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 12
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 15
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent",
        value: 8
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1141",
    l2SkillId: 1141,
    minLevel: 44,
    spCost: 44000,
    nameUk: "Скіл №1141",
    hintUk: "Скіл №1141",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 44000,
        mpCost: 39,
        power: 15
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 33
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "percent",
        value: 15
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1157",
    l2SkillId: 1157,
    minLevel: 1,
    spCost: 0,
    nameUk: "Тіло в розум",
    hintUk: "Обмінює тіло й розум між цілями.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1164",
    l2SkillId: 1164,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Прокляття: слабкість",
    hintUk: "Прокляття слабкості: знижує фізичну атаку.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
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
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 39,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 44,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 48,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 52,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 54,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 55,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 62,
        spCost: 210000,
        mpCost: 58,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 250000,
        mpCost: 60,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 62,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 64,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 65,
        power: 0
      },
      {
        level: 18,
        requiredLevel: 72,
        spCost: 790000,
        mpCost: 67,
        power: 0
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1172",
    l2SkillId: 1172,
    minLevel: 20,
    spCost: 1600,
    nameUk: "Аура полум’я",
    hintUk: "Аура вогню навколо персонажа.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1600,
        mpCost: 18,
        power: 19
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1600,
        mpCost: 20,
        power: 21
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 3100,
        mpCost: 22,
        power: 24
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 3100,
        mpCost: 23,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 5800,
        mpCost: 25,
        power: 28
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 5800,
        mpCost: 27,
        power: 30
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 10000,
        mpCost: 29,
        power: 33
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 10000,
        mpCost: 30,
        power: 36
      }
    ],
    effects: [],
    cooldownSec: 2,
    skipMobHp: false
  },
  {
    battleId: "l2_1177",
    l2SkillId: 1177,
    minLevel: 1,
    spCost: 0,
    nameUk: "Удар вітру",
    hintUk: "Магічний удар вітром.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 9,
        power: 12
      },
      {
        level: 2,
        requiredLevel: 7,
        spCost: 260,
        mpCost: 9,
        power: 13
      },
      {
        level: 3,
        requiredLevel: 7,
        spCost: 260,
        mpCost: 10,
        power: 15
      },
      {
        level: 4,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 14,
        power: 18
      },
      {
        level: 5,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 15,
        power: 21
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1178",
    l2SkillId: 1178,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Скіл №1178",
    hintUk: "Скіл №1178",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 34,
        power: 49
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 35,
        power: 52
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 38,
        power: 55
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 39,
        power: 58
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 42,
        power: 61
      },
      {
        level: 6,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 44,
        power: 65
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 45,
        power: 68
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 48,
        power: 72
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 49,
        power: 75
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 52,
        power: 78
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 53,
        power: 80
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 54,
        power: 82
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 55,
        power: 84
      },
      {
        level: 14,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 56,
        power: 86
      },
      {
        level: 15,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 57,
        power: 88
      },
      {
        level: 16,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 58,
        power: 89
      },
      {
        level: 17,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 59,
        power: 91
      },
      {
        level: 18,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 60,
        power: 92
      },
      {
        level: 19,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 61,
        power: 93
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 62,
        power: 94
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 64,
        power: 95
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1179",
    l2SkillId: 1179,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Скіл №1179",
    hintUk: "Скіл №1179",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 34,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 35,
        power: 31
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 38,
        power: 33
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 39,
        power: 35
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 42,
        power: 37
      },
      {
        level: 6,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 44,
        power: 39
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 45,
        power: 41
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 48,
        power: 43
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 49,
        power: 45
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 52,
        power: 47
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 54,
        power: 49
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 55,
        power: 51
      },
      {
        level: 13,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 57,
        power: 53
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 59,
        power: 54
      },
      {
        level: 15,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 61,
        power: 56
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 63,
        power: 57
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 8,
    skipMobHp: false
  },
  {
    battleId: "l2_1181",
    l2SkillId: 1181,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Удар полум’я",
    hintUk: "Магічний удар вогнем.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 29,
        power: 13
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 6100,
        mpCost: 34,
        power: 16
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 40,
        power: 19
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false
  },
  {
    battleId: "l2_1183",
    l2SkillId: 1183,
    minLevel: 44,
    spCost: 18000,
    nameUk: "Скіл №1183",
    hintUk: "Скіл №1183",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 38,
        power: 28
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 40,
        power: 29
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 43,
        power: 31
      },
      {
        level: 4,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 45,
        power: 33
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 48,
        power: 34
      },
      {
        level: 6,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 49,
        power: 36
      },
      {
        level: 7,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 52,
        power: 38
      },
      {
        level: 8,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 54,
        power: 39
      },
      {
        level: 9,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 57,
        power: 41
      },
      {
        level: 10,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 59,
        power: 43
      },
      {
        level: 11,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 62,
        power: 44
      },
      {
        level: 12,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 64,
        power: 46
      },
      {
        level: 13,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 67,
        power: 48
      }
    ],
    effects: [
      {
        stat: "bleed",
        mode: "flat",
        value: 110
      }
    ],
    cooldownSec: 8,
    skipMobHp: false
  },
  {
    battleId: "l2_1184",
    l2SkillId: 1184,
    minLevel: 7,
    spCost: 260,
    nameUk: "Крижана блискавка",
    hintUk: "Крижана блискавка по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 260,
        mpCost: 9,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 7,
        spCost: 260,
        mpCost: 10,
        power: 9
      },
      {
        level: 3,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 14,
        power: 11
      },
      {
        level: 4,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 15,
        power: 13
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 8,
    skipMobHp: false
  },
  {
    battleId: "l2_1189",
    l2SkillId: 1189,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Стійкість до вітру",
    hintUk: "Підвищує стійкість до вітру.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 35,
        power: 23
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 39,
        power: 30
      }
    ],
    effects: [
      {
        stat: "waterResist",
        mode: "percent",
        value: 15
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1201",
    l2SkillId: 1201,
    minLevel: 25,
    spCost: 2200,
    nameUk: "Коріння дріади",
    hintUk: "Приковує ворогів корінням.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 17,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 17,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 2200,
        mpCost: 18,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 20,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 21,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 4100,
        mpCost: 21,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 23,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 24,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 35,
        spCost: 6900,
        mpCost: 24,
        power: 0
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1204",
    l2SkillId: 1204,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Крок вітру",
    hintUk: "Підвищує швидкість пересування.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 16,
        power: 20
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 21,
        power: 33
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "flat"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1206",
    l2SkillId: 1206,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Повільність",
    hintUk: "Сповільнює ціль: важче пересуватися, удари слабші.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 6,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 35,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 39,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 54,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 55,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 60,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 62,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 590000,
        mpCost: 64,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 65,
        power: 0
      },
      {
        level: 18,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 67,
        power: 0
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1216",
    l2SkillId: 1216,
    minLevel: 1,
    spCost: 0,
    nameUk: "Самозцілення",
    hintUk: "Миттєве зцілення себе.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_elven_wizard",
      "elf_evas_saint",
      "elf_mage",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 9,
        power: 42
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1217",
    l2SkillId: 1217,
    minLevel: 48,
    spCost: 22000,
    nameUk: "Велике зцілення",
    hintUk: "Сильне зцілення однієї цілі.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 58,
        power: 371
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 60,
        power: 384
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 22000,
        mpCost: 62,
        power: 398
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 64,
        power: 426
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 65,
        power: 441
      },
      {
        level: 6,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 68,
        power: 455
      },
      {
        level: 7,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 72,
        power: 484
      },
      {
        level: 8,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 74,
        power: 499
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 77,
        power: 514
      },
      {
        level: 10,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 80,
        power: 544
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 80,
        power: 559
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 83,
        power: 574
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 71000,
        mpCost: 87,
        power: 603
      },
      {
        level: 14,
        requiredLevel: 60,
        spCost: 71000,
        mpCost: 89,
        power: 618
      },
      {
        level: 15,
        requiredLevel: 60,
        spCost: 71000,
        mpCost: 90,
        power: 633
      },
      {
        level: 16,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 93,
        power: 647
      },
      {
        level: 17,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 95,
        power: 662
      },
      {
        level: 18,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 97,
        power: 676
      },
      {
        level: 19,
        requiredLevel: 64,
        spCost: 170000,
        mpCost: 98,
        power: 690
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 98,
        power: 704
      },
      {
        level: 21,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 100,
        power: 718
      },
      {
        level: 22,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 102,
        power: 731
      },
      {
        level: 23,
        requiredLevel: 68,
        spCost: 300000,
        mpCost: 104,
        power: 745
      },
      {
        level: 24,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 105,
        power: 758
      },
      {
        level: 25,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 108,
        power: 770
      },
      {
        level: 26,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 109,
        power: 783
      },
      {
        level: 27,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 112,
        power: 795
      },
      {
        level: 28,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 113,
        power: 806
      },
      {
        level: 29,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 114,
        power: 817
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1220",
    l2SkillId: 1220,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Полум’я",
    hintUk: "Вогняний магічний удар.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 44,
        power: 65
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 49,
        power: 73
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 54,
        power: 81
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 59,
        power: 89
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 64,
        power: 98
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 67,
        power: 102
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 69,
        power: 107
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 72,
        power: 111
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 250000,
        mpCost: 74,
        power: 115
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 77,
        power: 119
      }
    ],
    effects: [],
    cooldownSec: 30,
    skipMobHp: false
  },
  {
    battleId: "l2_1226",
    l2SkillId: 1226,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Скіл №1226",
    hintUk: "Скіл №1226",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 39,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 6100,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 53,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 35,
        spCost: 21000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 21600,
    skipMobHp: true
  },
  {
    battleId: "l2_1227",
    l2SkillId: 1227,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Скіл №1227",
    hintUk: "Скіл №1227",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 39,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 6100,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 53,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 35,
        spCost: 21000,
        mpCost: 60,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 21600,
    skipMobHp: true
  },
  {
    battleId: "l2_1230",
    l2SkillId: 1230,
    minLevel: 35,
    spCost: 21000,
    nameUk: "Промінь",
    hintUk: "Магічний промінь по цілі.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 21000,
        mpCost: 30,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mAtk",
        mode: "percent",
        value: 55
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1231",
    l2SkillId: 1231,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Спалах аури",
    hintUk: "Спалах аури: шкода навколо.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 34,
        power: 39
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 35,
        power: 42
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 38,
        power: 44
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 39,
        power: 47
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 42,
        power: 49
      },
      {
        level: 6,
        requiredLevel: 48,
        spCost: 30000,
        mpCost: 44,
        power: 52
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 45,
        power: 55
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 48,
        power: 57
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 49,
        power: 60
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 52,
        power: 63
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 53,
        power: 64
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 54,
        power: 66
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 55,
        power: 67
      },
      {
        level: 14,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 56,
        power: 69
      },
      {
        level: 15,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 57,
        power: 70
      },
      {
        level: 16,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 58,
        power: 72
      },
      {
        level: 17,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 59,
        power: 73
      },
      {
        level: 18,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 60,
        power: 75
      },
      {
        level: 19,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 61,
        power: 76
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 62,
        power: 77
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 64,
        power: 79
      }
    ],
    effects: [
      {
        stat: "earthResist",
        mode: "percent"
      }
    ],
    cooldownSec: 2,
    skipMobHp: true
  },
  {
    battleId: "l2_1232",
    l2SkillId: 1232,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Палюча шкіра",
    hintUk: "Підпалює шкіру ворогів дотиком.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 35,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 44,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 52,
        power: 20
      }
    ],
    effects: [
      {
        stat: "reflect",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1233",
    l2SkillId: 1233,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Занепад",
    hintUk: "Знижує параметри цілі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 35,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 39,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 44,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 48,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 52,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 54,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 55,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 210000,
        mpCost: 58,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 250000,
        mpCost: 60,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 62,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 64,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 65,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 790000,
        mpCost: 67,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "waterResist",
        mode: "percent"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1243",
    l2SkillId: 1243,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Благословення щита",
    hintUk: "Підсилює захист щита.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 35,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 40
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 50
      },
      {
        level: 4,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
        power: 60
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 62,
        power: 70
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 65,
        power: 80
      }
    ],
    effects: [
      {
        stat: "rShld",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1255",
    l2SkillId: 1255,
    minLevel: 48,
    spCost: 67000,
    nameUk: "Скіл №1255",
    hintUk: "Скіл №1255",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 257,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 305,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 600,
    skipMobHp: true
  },
  {
    battleId: "l2_1257",
    l2SkillId: 1257,
    minLevel: 44,
    spCost: 41000,
    nameUk: "Скіл №1257",
    hintUk: "Скіл №1257",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_elven_oracle",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 20,
        power: 6000
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 24,
        power: 9000
      }
    ],
    effects: [
      {
        stat: "maxLoad",
        mode: "flat"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1259",
    l2SkillId: 1259,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Скіл №1259",
    hintUk: "Скіл №1259",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 35,
        power: 15
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 58,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 65,
        power: 40
      }
    ],
    effects: [
      {
        stat: "stunVuln",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1262",
    l2SkillId: 1262,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Покликання слуги",
    hintUk: "Викликає бойового слугу.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 7,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 9,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 11,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 11,
        power: 40
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 670000,
        mpCost: 13,
        power: 50
      }
    ],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true
  },
  {
    battleId: "l2_1273",
    l2SkillId: 1273,
    minLevel: 44,
    spCost: 41000,
    nameUk: "Скіл №1273",
    hintUk: "Скіл №1273",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 117,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 129,
        power: 50
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 140,
        power: 70
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 153,
        power: 90
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 159,
        power: 110
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 165,
        power: 130
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 172,
        power: 150
      },
      {
        level: 8,
        requiredLevel: 64,
        spCost: 340000,
        mpCost: 178,
        power: 170
      },
      {
        level: 9,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 184,
        power: 190
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 590000,
        mpCost: 189,
        power: 210
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 194,
        power: 230
      },
      {
        level: 12,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 199,
        power: 250
      },
      {
        level: 13,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 204,
        power: 300
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1274",
    l2SkillId: 1274,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Енергетична блискавка",
    hintUk: "Енергетичний залп по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_wizard",
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 10,
        power: 13
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 6100,
        mpCost: 12,
        power: 16
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 14,
        power: 19
      },
      {
        level: 4,
        requiredLevel: 35,
        spCost: 21000,
        mpCost: 15,
        power: 22
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: false
  },
  {
    battleId: "l2_1275",
    l2SkillId: 1275,
    minLevel: 40,
    spCost: 28000,
    nameUk: "Блискавка аури",
    hintUk: "Блискавка аури по площі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 28000,
        mpCost: 18,
        power: 26
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 20,
        power: 29
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 60000,
        mpCost: 23,
        power: 33
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 24,
        power: 36
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 95000,
        mpCost: 27,
        power: 39
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 28,
        power: 41
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 28,
        power: 43
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 210000,
        mpCost: 29,
        power: 45
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 250000,
        mpCost: 30,
        power: 46
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 32,
        power: 48
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: false
  },
  {
    battleId: "l2_1277",
    l2SkillId: 1277,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Скіл №1277",
    hintUk: "Скіл №1277",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 70,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 44000,
        mpCost: 78,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 87,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 94,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 103,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 107,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 110,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 115,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 119,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 540000,
        mpCost: 123,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 640000,
        mpCost: 127,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 670000,
        mpCost: 130,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 1300000,
        mpCost: 133,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 137,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1280",
    l2SkillId: 1280,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Скіл №1280",
    hintUk: "Скіл №1280",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 35,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 44000,
        mpCost: 39,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 540000,
        mpCost: 62,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 70,
        spCost: 670000,
        mpCost: 65,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1286",
    l2SkillId: 1286,
    minLevel: 52,
    spCost: 47000,
    nameUk: "Скіл №1286",
    hintUk: "Скіл №1286",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 68,
        power: 48
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 47000,
        mpCost: 70,
        power: 50
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 74,
        power: 53
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 77,
        power: 55
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 79,
        power: 56
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 61000,
        mpCost: 80,
        power: 57
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 82,
        power: 59
      },
      {
        level: 8,
        requiredLevel: 60,
        spCost: 75000,
        mpCost: 84,
        power: 60
      },
      {
        level: 9,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 85,
        power: 61
      },
      {
        level: 10,
        requiredLevel: 62,
        spCost: 120000,
        mpCost: 87,
        power: 62
      },
      {
        level: 11,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 88,
        power: 63
      },
      {
        level: 12,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 89,
        power: 65
      },
      {
        level: 13,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 90,
        power: 66
      },
      {
        level: 14,
        requiredLevel: 66,
        spCost: 190000,
        mpCost: 93,
        power: 67
      },
      {
        level: 15,
        requiredLevel: 68,
        spCost: 190000,
        mpCost: 94,
        power: 68
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 190000,
        mpCost: 95,
        power: 69
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 230000,
        mpCost: 97,
        power: 70
      },
      {
        level: 18,
        requiredLevel: 70,
        spCost: 230000,
        mpCost: 98,
        power: 72
      },
      {
        level: 19,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 99,
        power: 73
      },
      {
        level: 20,
        requiredLevel: 72,
        spCost: 390000,
        mpCost: 100,
        power: 74
      },
      {
        level: 21,
        requiredLevel: 74,
        spCost: 550000,
        mpCost: 102,
        power: 75
      },
      {
        level: 22,
        requiredLevel: 74,
        spCost: 550000,
        mpCost: 103,
        power: 76
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false
  },
  {
    battleId: "l2_1287",
    l2SkillId: 1287,
    minLevel: 58,
    spCost: 120000,
    nameUk: "Скіл №1287",
    hintUk: "Скіл №1287",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 120000,
        mpCost: 80,
        power: 41
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 150000,
        mpCost: 83,
        power: 43
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 85,
        power: 45
      },
      {
        level: 4,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 88,
        power: 47
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 290000,
        mpCost: 91,
        power: 49
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 95,
        power: 50
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 98,
        power: 51
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 790000,
        mpCost: 100,
        power: 53
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 103,
        power: 54
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: false
  },
  {
    battleId: "l2_1297",
    l2SkillId: 1297,
    minLevel: 66,
    spCost: 350000,
    nameUk: "Скіл №1297",
    hintUk: "Скіл №1297",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_mystic_muse",
      "elf_spellsinger"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 250,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: true
  },
  {
    battleId: "l2_1299",
    l2SkillId: 1299,
    minLevel: 52,
    spCost: 100000,
    nameUk: "Остання оборона слуги",
    hintUk: "Остання лінія захисту слуги.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 70,
        spCost: 670000,
        mpCost: 65,
        power: 0
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
      },
      {
        stat: "immobile",
        mode: "flat",
        value: 1
      }
    ],
    cooldownSec: 1800,
    skipMobHp: true
  },
  {
    battleId: "l2_1300",
    l2SkillId: 1300,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Скіл №1300",
    hintUk: "Скіл №1300",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 35,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 55,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1301",
    l2SkillId: 1301,
    minLevel: 62,
    spCost: 310000,
    nameUk: "Скіл №1301",
    hintUk: "Скіл №1301",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1304",
    l2SkillId: 1304,
    minLevel: 58,
    spCost: 160000,
    nameUk: "Скіл №1304",
    hintUk: "Скіл №1304",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 54,
        power: 60
      },
      {
        level: 2,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 62,
        power: 80
      },
      {
        level: 3,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 67,
        power: 100
      }
    ],
    effects: [
      {
        stat: "sDef",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1329",
    l2SkillId: 1329,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Скіл №1329",
    hintUk: "Скіл №1329",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 139,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 44000,
        mpCost: 154,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 172,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 188,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 204,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 229,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 540000,
        mpCost: 244,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 70,
        spCost: 670000,
        mpCost: 259,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 272,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1332",
    l2SkillId: 1332,
    minLevel: 56,
    spCost: 110000,
    nameUk: "Скіл №1332",
    hintUk: "Скіл №1332",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 70,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 78,
        power: 2
      },
      {
        level: 3,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 87,
        power: 3
      },
      {
        level: 4,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 94,
        power: 4
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 400000,
        mpCost: 103,
        power: 5
      },
      {
        level: 6,
        requiredLevel: 66,
        spCost: 540000,
        mpCost: 107,
        power: 6
      },
      {
        level: 7,
        requiredLevel: 68,
        spCost: 640000,
        mpCost: 110,
        power: 7
      },
      {
        level: 8,
        requiredLevel: 70,
        spCost: 670000,
        mpCost: 115,
        power: 8
      },
      {
        level: 9,
        requiredLevel: 72,
        spCost: 1300000,
        mpCost: 119,
        power: 9
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 1600000,
        mpCost: 123,
        power: 10
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "percent"
      },
      {
        stat: "pAtk",
        mode: "percent"
      },
      {
        stat: "mAtk",
        mode: "percent"
      },
      {
        stat: "cooldownReduction",
        mode: "percent"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1338",
    l2SkillId: 1338,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Таємний хаос",
    hintUk: "Таємний хаос: дезорієнтація ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_mystic_muse"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 72,
        power: 0
      }
    ],
    effects: [
      {
        stat: "cancelResist",
        mode: "percent"
      },
      {
        stat: "debuffResist",
        mode: "percent"
      }
    ],
    cooldownSec: 60,
    skipMobHp: true
  },
  {
    battleId: "l2_1340",
    l2SkillId: 1340,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Скіл №1340",
    hintUk: "Скіл №1340",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 105,
        power: 140
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      },
      {
        stat: "atkSpeed",
        mode: "multiplier"
      },
      {
        stat: "castSpeed",
        mode: "multiplier"
      },
      {
        stat: "waterResist",
        mode: "percent"
      }
    ],
    cooldownSec: 60,
    skipMobHp: false
  },
  {
    battleId: "l2_1342",
    l2SkillId: 1342,
    minLevel: 76,
    spCost: 15000000,
    nameUk: "Скіл №1342",
    hintUk: "Скіл №1342",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_mystic_muse"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 15000000,
        mpCost: 105,
        power: 139
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat"
      },
      {
        stat: "holyResist",
        mode: "percent"
      }
    ],
    cooldownSec: 60,
    skipMobHp: false
  },
  {
    battleId: "l2_1347",
    l2SkillId: 1347,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Скіл №1347",
    hintUk: "Скіл №1347",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "percent",
        value: 20
      },
      {
        stat: "mDef",
        mode: "percent",
        value: 20
      },
      {
        stat: "skillCritRate",
        mode: "percent",
        value: 100
      },
      {
        stat: "mAtk",
        mode: "percent",
        value: 20
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "runSpeed",
        mode: "percent"
      },
      {
        stat: "debuffResist",
        mode: "percent",
        value: 10
      }
    ],
    cooldownSec: 300,
    skipMobHp: true
  },
  {
    battleId: "l2_1349",
    l2SkillId: 1349,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Останній слуга",
    hintUk: "Викликає останнього слугу.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elemental_master"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 72,
        power: 0
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "percent",
        value: 20
      },
      {
        stat: "hpRegen",
        mode: "percent",
        value: 20
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 4
      },
      {
        stat: "pDef",
        mode: "percent",
        value: 20
      },
      {
        stat: "pAtk",
        mode: "percent",
        value: 10
      },
      {
        stat: "critDamage",
        mode: "percent",
        value: 20
      },
      {
        stat: "attackSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "critRate",
        mode: "multiplier"
      },
      {
        stat: "mDef",
        mode: "percent",
        value: 20
      },
      {
        stat: "mAtk",
        mode: "percent",
        value: 20
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "debuffResist",
        mode: "percent",
        value: 20
      },
      {
        stat: "runSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 600,
    skipMobHp: true
  },
  {
    battleId: "l2_1350",
    l2SkillId: 1350,
    minLevel: 76,
    spCost: 15000000,
    nameUk: "Прокляття воїна",
    hintUk: "Знижує бойову силу воїнів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_elemental_master"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 15000000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1353",
    l2SkillId: 1353,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Божественний захист",
    hintUk: "Божественний захист від шкоди.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 70,
        power: 30
      }
    ],
    effects: [
      {
        stat: "darkResist",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1354",
    l2SkillId: 1354,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Скіл №1354",
    hintUk: "Скіл №1354",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [
      {
        stat: "cancelResist",
        mode: "percent",
        value: 30
      },
      {
        stat: "debuffResist",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1357",
    l2SkillId: 1357,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Скіл №1357",
    hintUk: "Скіл №1357",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 72,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "percent",
        value: 20
      },
      {
        stat: "regMp",
        mode: "percent",
        value: 20
      },
      {
        stat: "maxMp",
        mode: "percent",
        value: 20
      },
      {
        stat: "maxHp",
        mode: "percent",
        value: 20
      },
      {
        stat: "mDef",
        mode: "percent",
        value: 20
      },
      {
        stat: "debuffResist",
        mode: "percent",
        value: 10
      }
    ],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1359",
    l2SkillId: 1359,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Блок кроку вітру",
    hintUk: "Блокує прискорення пересування ворога.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 70,
        power: 80
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 30,
    skipMobHp: true
  },
  {
    battleId: "l2_1453",
    l2SkillId: 1453,
    minLevel: 1,
    spCost: 0,
    nameUk: "Морозний вітер",
    hintUk: "Морозний вітер: шкода і сповільнення.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "elf_elemental_master",
      "elf_elemental_summoner",
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false
  },
  {
    battleId: "l2_5164",
    l2SkillId: 5164,
    minLevel: 62,
    spCost: 310000,
    nameUk: "Скіл №5164",
    hintUk: "Скіл №5164",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "elf_elven_elder",
      "elf_evas_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 58,
        power: 200
      },
      {
        level: 2,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 65,
        power: 300
      }
    ],
    effects: [
      {
        stat: "skillCritRate",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  }
];

/** Усі l2 id скілів ельфа-мага, що можуть бути «дією» в бою (не пасивки). */
export const ELVEN_MYSTIC_ACTIVE_L2_IDS: readonly number[] = [67, 337, 338, 1011, 1012, 1013, 1015, 1016, 1020, 1027, 1028, 1031, 1033, 1035, 1040, 1043, 1044, 1047, 1050, 1056, 1068, 1069, 1072, 1073, 1078, 1087, 1126, 1127, 1139, 1140, 1141, 1157, 1164, 1172, 1177, 1178, 1179, 1181, 1183, 1184, 1189, 1201, 1204, 1206, 1216, 1217, 1220, 1226, 1227, 1230, 1231, 1232, 1233, 1243, 1255, 1257, 1259, 1262, 1273, 1274, 1275, 1277, 1280, 1286, 1287, 1297, 1299, 1300, 1301, 1304, 1329, 1332, 1338, 1340, 1342, 1347, 1349, 1350, 1353, 1354, 1357, 1359, 1453, 5164];
