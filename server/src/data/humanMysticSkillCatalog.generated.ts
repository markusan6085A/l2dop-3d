/**
 * Автоген з text-rpg HumanMystic (`npm run gen:hm-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const HUMAN_MYSTIC_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
        mode: "percent"
      },
      {
        stat: "atkSpeed",
        mode: "percent"
      }
    ],
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
        spCost: 13000,
        mpCost: 0,
        power: 46
      },
      {
        level: 17,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 47
      },
      {
        level: 18,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 49
      },
      {
        level: 19,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 52
      },
      {
        level: 20,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 54
      },
      {
        level: 21,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 56
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 59
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 61
      },
      {
        level: 24,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 63
      },
      {
        level: 25,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 66
      },
      {
        level: 26,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 68
      },
      {
        level: 27,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 70
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 72
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 74
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 78
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 80
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 82
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 84
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 86
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 88
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 91
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 93
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 95
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 97
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 99
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 102
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 104
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 106
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 108
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent"
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
        mode: "percent"
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 0,
        power: 0.9
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 0,
        power: 0.8
      }
    ],
    effects: [
      {
        stat: "cooldownReduction",
        mode: "multiplier"
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
    battleId: "l2_211",
    l2SkillId: 211,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Підсилення HP",
    hintUk: "Пасив: збільшує максимум HP.",
    kind: "passive",
    category: "none",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 0,
        power: 60
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 0,
        power: 100
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 0,
        power: 150
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 0,
        power: 200
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 0,
        power: 250
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 0,
        power: 300
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 0,
        power: 350
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_212",
    l2SkillId: 212,
    minLevel: 35,
    spCost: 18000,
    nameUk: "Швидке відновлення HP",
    hintUk: "Пасив: прискорює відновлення HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 0,
        power: 1.1
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 0,
        power: 1.6
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 110000,
        mpCost: 0,
        power: 1.7
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 0,
        power: 2.1
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 0,
        power: 2.6
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 630000,
        mpCost: 0,
        power: 2.7
      },
      {
        level: 7,
        requiredLevel: 72,
        spCost: 1630000,
        mpCost: 0,
        power: 3.4
      },
      {
        level: 8,
        requiredLevel: 76,
        spCost: 2100000,
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
    skipMobHp: true
  },
  {
    battleId: "l2_213",
    l2SkillId: 213,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Підсилення мани",
    hintUk: "Пасив: збільшує максимум MP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 0,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 13000,
        mpCost: 0,
        power: 50
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 0,
        power: 70
      },
      {
        level: 4,
        requiredLevel: 48,
        spCost: 63000,
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
        spCost: 270000,
        mpCost: 0,
        power: 152
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 0,
        power: 180
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 1700000,
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
    battleId: "l2_214",
    l2SkillId: 214,
    minLevel: 1,
    spCost: 0,
    nameUk: "Відновлення мани",
    hintUk: "Пасив: прискорює відновлення MP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 0,
        power: 8
      }
    ],
    effects: [
      {
        stat: "mpRegen",
        mode: "percent"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_228",
    l2SkillId: 228,
    minLevel: 25,
    spCost: 5500,
    nameUk: "Швидке зачарування",
    hintUk: "Пасив: скорочує час читання заклинань.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 0,
        power: 1.05
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 0,
        power: 1.07
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 0,
        power: 1.1
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
    minLevel: 25,
    spCost: 5500,
    nameUk: "Швидке відновлення MP",
    hintUk: "Пасив: швидше відновлення MP у бою.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 0,
        power: 1.1
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 0,
        power: 1.5
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 41000,
        mpCost: 0,
        power: 1.9
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 110000,
        mpCost: 0,
        power: 2.3
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 0,
        power: 2.7
      },
      {
        level: 6,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 0,
        power: 3.1
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 1630000,
        mpCost: 0,
        power: 3.4
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
    minLevel: 20,
    spCost: 1400,
    nameUk: "Майстерність мантії",
    hintUk: "Пасив: кращі бонуси в мантії.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 1.7
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 2.7
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 0,
        power: 4.3
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 7.2
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 8.5
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 10.6
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 12.1
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
    battleId: "l2_235",
    l2SkillId: 235,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Майстерність мантії",
    hintUk: "Пасив: кращі бонуси в мантії.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 26.3
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 27.6
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 28.8
      },
      {
        level: 12,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 31.5
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 32.9
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 34.2
      },
      {
        level: 15,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 37.1
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 38.6
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 40.1
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 43.2
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 44.8
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 46.4
      },
      {
        level: 21,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 49.8
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 51.5
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 53.2
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 54.9
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 56.7
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 58.5
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 60.3
      },
      {
        level: 28,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 62.1
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 64
      },
      {
        level: 30,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 65.9
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 67.7
      },
      {
        level: 32,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 69.7
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 71.6
      },
      {
        level: 34,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 73.5
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 75.5
      },
      {
        level: 36,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 77.4
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 79.4
      },
      {
        level: 38,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 81.4
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 83.4
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 85.4
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 87.4
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "flat"
      },
      {
        stat: "mAtk",
        mode: "flat"
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: 1
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_236",
    l2SkillId: 236,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Майстерність легкої броні",
    hintUk: "Пасив: кращі бонуси в легкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 12,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 15,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 21,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 28,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 30,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 32,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 34,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 36,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 38,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 5.4
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 5.4
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
        value: 1
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: 1
      },
      {
        stat: "mpRegen",
        mode: "flat",
        value: 0.5
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_244",
    l2SkillId: 244,
    minLevel: 7,
    spCost: 470,
    nameUk: "Майстерність обладунків",
    hintUk: "Пасив: кращі бонуси в обладунках.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 0,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 0,
        power: 10
      },
      {
        level: 3,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 0,
        power: 12
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_249",
    l2SkillId: 249,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Майстерність зброї",
    hintUk: "Пасив: +M. Atk (flat) за рівнем скіла (1 р. — +1.9, 40 р. — +99.3).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 16
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 17
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 18.1
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 20.4
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 21.6
      },
      {
        level: 15,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 22.8
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 25.5
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 26.9
      },
      {
        level: 18,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 28.3
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 31.4
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 33
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 34.6
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 38
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 39.8
      },
      {
        level: 24,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 41.7
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 43.5
      },
      {
        level: 26,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 45.4
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 47.4
      },
      {
        level: 28,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 49.4
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 51.4
      },
      {
        level: 30,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 53.5
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 55.6
      },
      {
        level: 32,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 57.7
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 59.8
      },
      {
        level: 34,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 62
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 64.1
      },
      {
        level: 36,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 66.3
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 68.5
      },
      {
        level: 38,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 70.7
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 72.9
      },
      {
        level: 40,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 75.1
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 77.2
      },
      {
        level: 42,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 79.4
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
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_258",
    l2SkillId: 258,
    minLevel: 40,
    spCost: 10000,
    nameUk: "Майстерність легкої броні",
    hintUk: "Пасив: кращі бонуси в легкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_warlock"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 11.1
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 11.8
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 10000,
        mpCost: 0,
        power: 12.5
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 0,
        power: 14
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 0,
        power: 14.8
      },
      {
        level: 6,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 0,
        power: 15.6
      },
      {
        level: 7,
        requiredLevel: 48,
        spCost: 25000,
        mpCost: 0,
        power: 17.3
      },
      {
        level: 8,
        requiredLevel: 48,
        spCost: 25000,
        mpCost: 0,
        power: 18.1
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 25000,
        mpCost: 0,
        power: 19
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 0,
        power: 20.8
      },
      {
        level: 11,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 0,
        power: 21.7
      },
      {
        level: 12,
        requiredLevel: 52,
        spCost: 35000,
        mpCost: 0,
        power: 22.6
      },
      {
        level: 13,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 0,
        power: 24.5
      },
      {
        level: 14,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 0,
        power: 25.5
      },
      {
        level: 15,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 0,
        power: 26.4
      },
      {
        level: 16,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 0,
        power: 27.4
      },
      {
        level: 17,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 0,
        power: 28.4
      },
      {
        level: 18,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 0,
        power: 29.5
      },
      {
        level: 19,
        requiredLevel: 60,
        spCost: 110000,
        mpCost: 0,
        power: 30.5
      },
      {
        level: 20,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 31.6
      },
      {
        level: 21,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 32.6
      },
      {
        level: 22,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 33.7
      },
      {
        level: 23,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 0,
        power: 34.8
      },
      {
        level: 24,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 0,
        power: 35.9
      },
      {
        level: 25,
        requiredLevel: 66,
        spCost: 270000,
        mpCost: 0,
        power: 37
      },
      {
        level: 26,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 0,
        power: 38.1
      },
      {
        level: 27,
        requiredLevel: 68,
        spCost: 320000,
        mpCost: 0,
        power: 39.2
      },
      {
        level: 28,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 0,
        power: 40.3
      },
      {
        level: 29,
        requiredLevel: 70,
        spCost: 340000,
        mpCost: 0,
        power: 41.4
      },
      {
        level: 30,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 42.6
      },
      {
        level: 31,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 0,
        power: 43.7
      },
      {
        level: 32,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 44.8
      },
      {
        level: 33,
        requiredLevel: 74,
        spCost: 820000,
        mpCost: 0,
        power: 46
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      },
      {
        stat: "castSpeed",
        mode: "multiplier"
      },
      {
        stat: "attackSpeed",
        mode: "multiplier"
      },
      {
        stat: "mpRegen",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_259",
    l2SkillId: 259,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Майстерність важкої броні",
    hintUk: "Пасив: кращі бонуси в важкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 14.8
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 15.6
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 0,
        power: 16.5
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 18.3
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 19.2
      },
      {
        level: 6,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 0,
        power: 20.2
      },
      {
        level: 7,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 22.1
      },
      {
        level: 8,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 23.1
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 24.1
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 26.2
      },
      {
        level: 11,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 27.3
      },
      {
        level: 12,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 0,
        power: 28.4
      },
      {
        level: 13,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 30.6
      },
      {
        level: 14,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 31.8
      },
      {
        level: 15,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 33
      },
      {
        level: 16,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 34.1
      },
      {
        level: 17,
        requiredLevel: 58,
        spCost: 110000,
        mpCost: 0,
        power: 35.3
      },
      {
        level: 18,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 36.5
      },
      {
        level: 19,
        requiredLevel: 60,
        spCost: 140000,
        mpCost: 0,
        power: 37.8
      },
      {
        level: 20,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 39
      },
      {
        level: 21,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 40.3
      },
      {
        level: 22,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 41.5
      },
      {
        level: 23,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 42.8
      },
      {
        level: 24,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 44.1
      },
      {
        level: 25,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 45.4
      },
      {
        level: 26,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 46.7
      },
      {
        level: 27,
        requiredLevel: 68,
        spCost: 390000,
        mpCost: 0,
        power: 48
      },
      {
        level: 28,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 49.4
      },
      {
        level: 29,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 50.7
      },
      {
        level: 30,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 52
      },
      {
        level: 31,
        requiredLevel: 72,
        spCost: 830000,
        mpCost: 0,
        power: 53.4
      },
      {
        level: 32,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 54.7
      },
      {
        level: 33,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 0,
        power: 56.1
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
        value: 1
      },
      {
        stat: "attackSpeed",
        mode: "percent",
        value: 1
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_285",
    l2SkillId: 285,
    minLevel: 20,
    spCost: 1400,
    nameUk: "Більший приріст мани",
    hintUk: "Пасив: більший приріст MP з рівнем.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 0.6
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 0.8
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 0,
        power: 1.2
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 1.4
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 1.6
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 1.8
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 2
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
    battleId: "l2_328",
    l2SkillId: 328,
    minLevel: 76,
    spCost: 12000000,
    nameUk: "Мудрість (Wisdom)",
    hintUk: "Пасивний скіл. Збільшує опір до Hold, Sleep та Mental ефектів. 76 лв, 1 р.: Hold +20, Sleep +20, Mental +20. Макс. рівень скіла — 1.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_cardinal",
      "human_hierophant",
      "human_soultaker"
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
    nameUk: "Здоров’я (Health)",
    hintUk: "Пасивний скіл. Збільшує опір до Poison, Bleed, Hold, Sleep та Mental ефектів. 76 лв, 1 р.: Poison +20, Bleed +20, Hold +20, Sleep +20, Mental +20. Макс. рівень скіла — 1.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_cardinal",
      "human_hierophant",
      "human_soultaker"
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
      },
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
    battleId: "l2_330",
    l2SkillId: 330,
    minLevel: 77,
    spCost: 15000000,
    nameUk: "Майстерність скілів (Skill Mastery)",
    hintUk: "Пасивний скіл. Шанс без витрати MP і без перезарядки (reuse) при активному скілі; при спрацюванні — повтор одразу. 77 лв, 1 р. Макс. рівень скіла — 1.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_cardinal",
      "human_hierophant",
      "human_soultaker"
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
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_336",
    l2SkillId: 336,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Таємна мудрість",
    hintUk: "Пасив: прихований бонус до WIT.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "human_cardinal",
      "human_hierophant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 36,
        power: 10
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 0,
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
      "human_archmage",
      "human_soultaker"
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
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: null,
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
      "human_arcana_lord"
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
        mode: "percent",
        value: -10
      }
    ],
    cooldownSec: null,
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 7,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 24,
        power: 121
      },
      {
        level: 8,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 27,
        power: 135
      },
      {
        level: 9,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 30,
        power: 151
      },
      {
        level: 10,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 33,
        power: 176
      },
      {
        level: 11,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 35,
        power: 185
      },
      {
        level: 12,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 37,
        power: 195
      },
      {
        level: 13,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 42,
        power: 224
      },
      {
        level: 14,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 44,
        power: 234
      },
      {
        level: 15,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 44,
        power: 245
      },
      {
        level: 16,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 48,
        power: 278
      },
      {
        level: 17,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 50,
        power: 289
      },
      {
        level: 18,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 52,
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
    spCost: 470,
    nameUk: "Лікування отрути",
    hintUk: "Знімає отруту з цілі.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 10,
        power: 3
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 2100,
        mpCost: 24,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 6900,
        mpCost: 44,
        power: 9
      }
    ],
    effects: [],
    cooldownSec: 15,
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 35,
        power: 121
      },
      {
        level: 5,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 40,
        power: 135
      },
      {
        level: 6,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 44,
        power: 151
      },
      {
        level: 7,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 49,
        power: 176
      },
      {
        level: 8,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 52,
        power: 185
      },
      {
        level: 9,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 54,
        power: 195
      },
      {
        level: 10,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 62,
        power: 224
      },
      {
        level: 11,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 65,
        power: 234
      },
      {
        level: 12,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 67,
        power: 245
      },
      {
        level: 13,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 72,
        power: 278
      },
      {
        level: 14,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 74,
        power: 289
      },
      {
        level: 15,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 78,
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
    spCost: 336000,
    nameUk: "Воскресіння",
    hintUk: "Повертає до життя поваленого союзника.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 336000,
        mpCost: 122,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 41,
        spCost: 463000,
        mpCost: 152,
        power: 40
      },
      {
        level: 5,
        requiredLevel: 42,
        spCost: 5100000,
        mpCost: 180,
        power: 50
      },
      {
        level: 6,
        requiredLevel: 43,
        spCost: 6170000,
        mpCost: 195,
        power: 60
      },
      {
        level: 7,
        requiredLevel: 44,
        spCost: 7280000,
        mpCost: 207,
        power: 70
      },
      {
        level: 8,
        requiredLevel: 45,
        spCost: 8590000,
        mpCost: 228,
        power: 80
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 91300000,
        mpCost: 239,
        power: 90
      }
    ],
    effects: [],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1018",
    l2SkillId: 1018,
    minLevel: 40,
    spCost: 141000,
    nameUk: "Очищення",
    hintUk: "Знімає негативні ефекти з цілі.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 141000,
        mpCost: 39,
        power: 3
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 295000,
        mpCost: 48,
        power: 6
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 3270000,
        mpCost: 55,
        power: 9
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1020",
    l2SkillId: 1020,
    minLevel: 40,
    spCost: 121000,
    nameUk: "Життєва сила",
    hintUk: "Підсилює життєву стійкість (CON).",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 121000,
        mpCost: 87,
        power: 440
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 221000,
        mpCost: 89,
        power: 454
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 321000,
        mpCost: 92,
        power: 467
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 432000,
        mpCost: 97,
        power: 494
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 532000,
        mpCost: 97,
        power: 508
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 632000,
        mpCost: 99,
        power: 521
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 733000,
        mpCost: 104,
        power: 548
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 833000,
        mpCost: 107,
        power: 562
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 933000,
        mpCost: 109,
        power: 575
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 1065000,
        mpCost: 112,
        power: 588
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 1165000,
        mpCost: 114,
        power: 602
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 1283000,
        mpCost: 117,
        power: 615
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 1383000,
        mpCost: 118,
        power: 627
      },
      {
        level: 14,
        requiredLevel: 53,
        spCost: 14130000,
        mpCost: 118,
        power: 640
      },
      {
        level: 15,
        requiredLevel: 54,
        spCost: 15130000,
        mpCost: 120,
        power: 653
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 16140000,
        mpCost: 123,
        power: 665
      },
      {
        level: 17,
        requiredLevel: 56,
        spCost: 17140000,
        mpCost: 124,
        power: 677
      },
      {
        level: 18,
        requiredLevel: 57,
        spCost: 18210000,
        mpCost: 127,
        power: 689
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 19210000,
        mpCost: 129,
        power: 700
      },
      {
        level: 20,
        requiredLevel: 59,
        spCost: 20230000,
        mpCost: 132,
        power: 711
      },
      {
        level: 21,
        requiredLevel: 60,
        spCost: 21230000,
        mpCost: 133,
        power: 722
      },
      {
        level: 22,
        requiredLevel: 61,
        spCost: 22290000,
        mpCost: 135,
        power: 733
      },
      {
        level: 23,
        requiredLevel: 62,
        spCost: 23290000,
        mpCost: 137,
        power: 743
      },
      {
        level: 24,
        requiredLevel: 63,
        spCost: 24470000,
        mpCost: 139,
        power: 753
      },
      {
        level: 25,
        requiredLevel: 64,
        spCost: 25470000,
        mpCost: 140,
        power: 763
      },
      {
        level: 26,
        requiredLevel: 65,
        spCost: 26640000,
        mpCost: 142,
        power: 772
      },
      {
        level: 27,
        requiredLevel: 66,
        spCost: 27640000,
        mpCost: 144,
        power: 780
      }
    ],
    effects: [],
    cooldownSec: null,
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 4,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 48,
        power: 97
      },
      {
        level: 5,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 53,
        power: 108
      },
      {
        level: 6,
        requiredLevel: 20,
        spCost: 1100,
        mpCost: 59,
        power: 121
      },
      {
        level: 7,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 65,
        power: 141
      },
      {
        level: 8,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 69,
        power: 148
      },
      {
        level: 9,
        requiredLevel: 25,
        spCost: 2300,
        mpCost: 72,
        power: 156
      },
      {
        level: 10,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 83,
        power: 179
      },
      {
        level: 11,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 87,
        power: 188
      },
      {
        level: 12,
        requiredLevel: 30,
        spCost: 4400,
        mpCost: 88,
        power: 196
      },
      {
        level: 13,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 95,
        power: 222
      },
      {
        level: 14,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 99,
        power: 231
      },
      {
        level: 15,
        requiredLevel: 35,
        spCost: 7300,
        mpCost: 103,
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
    spCost: 118000,
    nameUk: "Міць небес",
    hintUk: "Підсилює бойові параметри союзників.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 118000,
        mpCost: 34,
        power: 39
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 218000,
        mpCost: 35,
        power: 42
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 321000,
        mpCost: 38,
        power: 44
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 421000,
        mpCost: 39,
        power: 47
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 532000,
        mpCost: 42,
        power: 49
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 632000,
        mpCost: 44,
        power: 52
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 747000,
        mpCost: 45,
        power: 55
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 847000,
        mpCost: 48,
        power: 57
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 950000,
        mpCost: 49,
        power: 60
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 1050000,
        mpCost: 52,
        power: 63
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 11130000,
        mpCost: 54,
        power: 66
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 12170000,
        mpCost: 55,
        power: 68
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 13270000,
        mpCost: 58,
        power: 71
      },
      {
        level: 14,
        requiredLevel: 53,
        spCost: 14280000,
        mpCost: 60,
        power: 74
      },
      {
        level: 15,
        requiredLevel: 54,
        spCost: 15410000,
        mpCost: 62,
        power: 77
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 16450000,
        mpCost: 64,
        power: 79
      },
      {
        level: 17,
        requiredLevel: 56,
        spCost: 17590000,
        mpCost: 65,
        power: 82
      },
      {
        level: 18,
        requiredLevel: 57,
        spCost: 18940000,
        mpCost: 67,
        power: 84
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 191300000,
        mpCost: 69,
        power: 87
      }
    ],
    effects: [],
    cooldownSec: null,
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
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
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
        spCost: 3400,
        mpCost: 22,
        power: 24
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 3400,
        mpCost: 23,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 6600,
        mpCost: 25,
        power: 28
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 6600,
        mpCost: 27,
        power: 30
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 11000,
        mpCost: 29,
        power: 33
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 11000,
        mpCost: 30,
        power: 36
      }
    ],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false
  },
  {
    battleId: "l2_1032",
    l2SkillId: 1032,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Бадьорість",
    hintUk: "Знімає сон і підбадьорює ціль.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 35,
        power: 0.7
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 0.6
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 0.5
      }
    ],
    effects: [
      {
        stat: "bleedResist",
        mode: "percent",
        value: 20
      },
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
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1033",
    l2SkillId: 1033,
    minLevel: 60,
    spCost: 270000,
    nameUk: "Стійкість до отрути",
    hintUk: "Підвищує стійкість до отрути.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 60,
        spCost: 270000,
        mpCost: 30,
        power: 0.7
      },
      {
        level: 2,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 35,
        power: 0.6
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 770000,
        mpCost: 39,
        power: 0.5
      }
    ],
    effects: [
      {
        stat: "poisonResist",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1034",
    l2SkillId: 1034,
    minLevel: 40,
    spCost: 141000,
    nameUk: "Спокій",
    hintUk: "Заспокоює ціль, знижуючи агресію.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 141000,
        mpCost: 59,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 263000,
        mpCost: 65,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 395000,
        mpCost: 70,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 4100000,
        mpCost: 77,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 5130000,
        mpCost: 80,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 6170000,
        mpCost: 83,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 7270000,
        mpCost: 87,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 8280000,
        mpCost: 89,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 9410000,
        mpCost: 93,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 10450000,
        mpCost: 95,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 11590000,
        mpCost: 98,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 12940000,
        mpCost: 100,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 131300000,
        mpCost: 103,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1035",
    l2SkillId: 1035,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Ментальний щит",
    hintUk: "Захищає від ментальних ефектів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 35,
        power: 0.8
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 0.6
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 0.4
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "multiplier",
        value: 0.8
      },
      {
        stat: "sleepResist",
        mode: "multiplier",
        value: 0.8
      },
      {
        stat: "fearResist",
        mode: "multiplier",
        value: 0.8
      },
      {
        stat: "mentalResist",
        mode: "multiplier",
        value: 0.8
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1036",
    l2SkillId: 1036,
    minLevel: 44,
    spCost: 39000,
    nameUk: "Магічний бар’єр",
    hintUk: "Зменшує отриману магічну шкоду.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 39,
        power: 1.23
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 1.3
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1040",
    l2SkillId: 1040,
    minLevel: 7,
    spCost: 470,
    nameUk: "Щит",
    hintUk: "Підвищує фізичний захист.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 10,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 2100,
        mpCost: 18,
        power: 12
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 6900,
        mpCost: 31,
        power: 15
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "multiplier",
        value: 1.12
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1042",
    l2SkillId: 1042,
    minLevel: 40,
    spCost: 163000,
    nameUk: "Утримання мерців",
    hintUk: "Утримує нежить у зоні.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 163000,
        mpCost: 129,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 295000,
        mpCost: 140,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 3100000,
        mpCost: 153,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 4130000,
        mpCost: 159,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 5170000,
        mpCost: 165,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 6270000,
        mpCost: 172,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 7280000,
        mpCost: 178,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 8410000,
        mpCost: 184,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 9450000,
        mpCost: 189,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 10590000,
        mpCost: 194,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 11940000,
        mpCost: 199,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 121300000,
        mpCost: 204,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1043",
    l2SkillId: 1043,
    minLevel: 25,
    spCost: 6900,
    nameUk: "Свята зброя",
    hintUk: "Накладає святу зброю на союзника.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 6900,
        mpCost: 23,
        power: 1.3
      }
    ],
    effects: [
      {
        stat: "holyAttack",
        mode: "multiplier",
        value: 1.3
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1044",
    l2SkillId: 1044,
    minLevel: 20,
    spCost: 6900,
    nameUk: "Регенерація",
    hintUk: "Регенерація HP з часом.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 6900,
        mpCost: 0,
        power: 1.1
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 13700,
        mpCost: 0,
        power: 1.15
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "multiplier",
        value: 1.1
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1045",
    l2SkillId: 1045,
    minLevel: 44,
    spCost: 39000,
    nameUk: "Благословення тіла",
    hintUk: "Благословляє тіло: бонуси до стійкості.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 39,
        power: 1.35
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 1.35
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 1.35
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 1.35
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 60,
        power: 1.35
      },
      {
        level: 6,
        requiredLevel: 72,
        spCost: 1700000,
        mpCost: 67,
        power: 1.35
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "percent",
        value: 35
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1048",
    l2SkillId: 1048,
    minLevel: 44,
    spCost: 39000,
    nameUk: "Благословення душі",
    hintUk: "Благословляє душу: бонуси до інтелекту та магії.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 39,
        power: 1.3
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 1.3
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 1.3
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 1.3
      },
      {
        level: 5,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 58,
        power: 1.3
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 65,
        power: 1.3
      }
    ],
    effects: [
      {
        stat: "maxMp",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1049",
    l2SkillId: 1049,
    minLevel: 40,
    spCost: 136000,
    nameUk: "Реквієм",
    hintUk: "Ритуал спокою для союзників.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 136000,
        mpCost: 53,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 241000,
        mpCost: 59,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 363000,
        mpCost: 65,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 495000,
        mpCost: 70,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 5100000,
        mpCost: 77,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 6130000,
        mpCost: 80,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 7170000,
        mpCost: 83,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 8270000,
        mpCost: 87,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 9280000,
        mpCost: 89,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 10410000,
        mpCost: 93,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 11450000,
        mpCost: 95,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 12590000,
        mpCost: 98,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 13940000,
        mpCost: 100,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 53,
        spCost: 141300000,
        mpCost: 103,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1056",
    l2SkillId: 1056,
    minLevel: 48,
    spCost: 67000,
    nameUk: "Скасування",
    hintUk: "Перериває підготовку ворожої навички.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 44,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 150000,
        mpCost: 54,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 60,
        spCost: 180000,
        mpCost: 55,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 250000,
        mpCost: 58,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 60,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 62,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 64,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 70,
        spCost: 590000,
        mpCost: 65,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 72,
        spCost: 940000,
        mpCost: 67,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1062",
    l2SkillId: 1062,
    minLevel: 35,
    spCost: 21000,
    nameUk: "Дух берсерка",
    hintUk: "Накладає берсерк: більше шкоди, менше захисту.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 21000,
        mpCost: 30,
        power: 1.05
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier",
        value: 1.05
      },
      {
        stat: "attackSpeed",
        mode: "multiplier",
        value: 1.05
      },
      {
        stat: "mAtk",
        mode: "multiplier",
        value: 1.1
      },
      {
        stat: "castSpeed",
        mode: "multiplier",
        value: 1.05
      },
      {
        stat: "runSpeed",
        mode: "flat",
        value: 5
      },
      {
        stat: "pDef",
        mode: "multiplier",
        value: 0.95
      },
      {
        stat: "mDef",
        mode: "multiplier",
        value: 0.9
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1064",
    l2SkillId: 1064,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Мовчання",
    hintUk: "Накладає німоту на ціль або зону.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
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
        spCost: 35000,
        mpCost: 39,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 44,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 48,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 52,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 67,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent",
        value: -50
      }
    ],
    cooldownSec: 60,
    skipMobHp: true
  },
  {
    battleId: "l2_1068",
    l2SkillId: 1068,
    minLevel: 7,
    spCost: 470,
    nameUk: "Сила",
    hintUk: "Підсилює силу (STR).",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 10,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 2100,
        mpCost: 16,
        power: 12
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 6900,
        mpCost: 28,
        power: 15
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier",
        value: 1.12
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1069",
    l2SkillId: 1069,
    minLevel: 40,
    spCost: 1012000,
    nameUk: "Сон",
    hintUk: "Накладає сон на ціль.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 40,
        spCost: 1012000,
        mpCost: 34,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 41,
        spCost: 1112000,
        mpCost: 34,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 42,
        spCost: 1212000,
        mpCost: 35,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 43,
        spCost: 1314000,
        mpCost: 38,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 1414000,
        mpCost: 38,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 45,
        spCost: 1514000,
        mpCost: 39,
        power: 0
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 1621000,
        mpCost: 42,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 47,
        spCost: 1721000,
        mpCost: 43,
        power: 0
      },
      {
        level: 18,
        requiredLevel: 48,
        spCost: 1821000,
        mpCost: 44,
        power: 0
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 1932000,
        mpCost: 45,
        power: 0
      },
      {
        level: 20,
        requiredLevel: 50,
        spCost: 2032000,
        mpCost: 47,
        power: 0
      },
      {
        level: 21,
        requiredLevel: 51,
        spCost: 2132000,
        mpCost: 48,
        power: 0
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 2233000,
        mpCost: 49,
        power: 0
      },
      {
        level: 23,
        requiredLevel: 53,
        spCost: 2333000,
        mpCost: 50,
        power: 0
      },
      {
        level: 24,
        requiredLevel: 54,
        spCost: 2433000,
        mpCost: 52,
        power: 0
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 2565000,
        mpCost: 53,
        power: 0
      },
      {
        level: 26,
        requiredLevel: 56,
        spCost: 2665000,
        mpCost: 54,
        power: 0
      },
      {
        level: 27,
        requiredLevel: 57,
        spCost: 2783000,
        mpCost: 55,
        power: 0
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 2883000,
        mpCost: 55,
        power: 0
      },
      {
        level: 29,
        requiredLevel: 59,
        spCost: 29130000,
        mpCost: 57,
        power: 0
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 30130000,
        mpCost: 58,
        power: 0
      },
      {
        level: 31,
        requiredLevel: 61,
        spCost: 31140000,
        mpCost: 59,
        power: 0
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 32140000,
        mpCost: 60,
        power: 0
      },
      {
        level: 33,
        requiredLevel: 63,
        spCost: 33210000,
        mpCost: 60,
        power: 0
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 34210000,
        mpCost: 62,
        power: 0
      },
      {
        level: 35,
        requiredLevel: 65,
        spCost: 35230000,
        mpCost: 63,
        power: 0
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 36230000,
        mpCost: 64,
        power: 0
      },
      {
        level: 37,
        requiredLevel: 67,
        spCost: 37290000,
        mpCost: 64,
        power: 0
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 38290000,
        mpCost: 65,
        power: 0
      },
      {
        level: 39,
        requiredLevel: 69,
        spCost: 39470000,
        mpCost: 67,
        power: 0
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 40470000,
        mpCost: 67,
        power: 0
      },
      {
        level: 41,
        requiredLevel: 71,
        spCost: 41640000,
        mpCost: 68,
        power: 0
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 42640000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "sleep",
        mode: "flat",
        value: 1
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1072",
    l2SkillId: 1072,
    minLevel: 44,
    spCost: 43000,
    nameUk: "Хмара сну",
    hintUk: "Хмара сну на площі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 43000,
        mpCost: 59,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 77,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 250000,
        mpCost: 87,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 93,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 590000,
        mpCost: 98,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1073",
    l2SkillId: 1073,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Поцілунок Еви",
    hintUk: "Потужне зцілення в стилі Еви.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 20,
        power: 5
      }
    ],
    effects: [
      {
        stat: "breathGauge",
        mode: "multiplier",
        value: 5
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1074",
    l2SkillId: 1074,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Здача вітру",
    hintUk: "Магічний удар стихією вітру.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 35,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 43000,
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
        requiredLevel: 58,
        spCost: 150000,
        mpCost: 54,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 180000,
        mpCost: 55,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 250000,
        mpCost: 58,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 60,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 62,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 64,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 590000,
        mpCost: 65,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 940000,
        mpCost: 67,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1075",
    l2SkillId: 1075,
    minLevel: 40,
    spCost: 236000,
    nameUk: "Мир",
    hintUk: "Знімає ворожість або заспокоює бій.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 236000,
        mpCost: 35,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 41,
        spCost: 341000,
        mpCost: 39,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 42,
        spCost: 463000,
        mpCost: 44,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 43,
        spCost: 595000,
        mpCost: 48,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 44,
        spCost: 6100000,
        mpCost: 52,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 45,
        spCost: 7130000,
        mpCost: 54,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 8170000,
        mpCost: 55,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 47,
        spCost: 9270000,
        mpCost: 58,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 48,
        spCost: 10280000,
        mpCost: 60,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 11410000,
        mpCost: 62,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 50,
        spCost: 12450000,
        mpCost: 64,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 51,
        spCost: 13590000,
        mpCost: 65,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 14940000,
        mpCost: 67,
        power: 0
      },
      {
        level: 15,
        requiredLevel: 53,
        spCost: 151300000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1077",
    l2SkillId: 1077,
    minLevel: 44,
    spCost: 39000,
    nameUk: "Фокус",
    hintUk: "Підвищує точність і крит для групи.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 39,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 20
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1078",
    l2SkillId: 1078,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Концентрація",
    hintUk: "Підвищує швидкість читання заклинань.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 20,
        power: 18
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 27,
        power: 25
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 31,
        power: 36
      },
      {
        level: 4,
        requiredLevel: 48,
        spCost: 75000,
        mpCost: 38,
        power: 42
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 130000,
        mpCost: 44,
        power: 48
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 51,
        power: 53
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent",
        value: 5
      },
      {
        stat: "mentalResist",
        mode: "percent",
        value: 10
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1083",
    l2SkillId: 1083,
    minLevel: 25,
    spCost: 5500,
    nameUk: "Здача вогню",
    hintUk: "Магічний удар вогнем.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 12,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 14,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 15,
        power: 0
      }
    ],
    effects: [
      {
        stat: "fireResist",
        mode: "percent",
        value: -25
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1085",
    l2SkillId: 1085,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Кмітливість",
    hintUk: "Підвищує кмітливість (WIT).",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 20,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 21000,
        mpCost: 30,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 30
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1086",
    l2SkillId: 1086,
    minLevel: 44,
    spCost: 39000,
    nameUk: "Поспіх",
    hintUk: "Підвищує швидкість атаки.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 39,
        power: 1.33
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 48,
        power: 1.33
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "percent",
        value: 33
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
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
        spCost: 21000,
        mpCost: 74,
        power: 73
      },
      {
        level: 10,
        requiredLevel: 44,
        spCost: 21000,
        mpCost: 78,
        power: 77
      },
      {
        level: 11,
        requiredLevel: 48,
        spCost: 37000,
        mpCost: 82,
        power: 81
      },
      {
        level: 12,
        requiredLevel: 48,
        spCost: 37000,
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
        spCost: 63000,
        mpCost: 98,
        power: 98
      },
      {
        level: 16,
        requiredLevel: 56,
        spCost: 63000,
        mpCost: 103,
        power: 102
      },
      {
        level: 17,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 104,
        power: 104
      },
      {
        level: 18,
        requiredLevel: 58,
        spCost: 79000,
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
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
        spCost: 14000,
        mpCost: 64,
        power: 465
      },
      {
        level: 17,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 65,
        power: 481
      },
      {
        level: 18,
        requiredLevel: 44,
        spCost: 14000,
        mpCost: 68,
        power: 496
      },
      {
        level: 19,
        requiredLevel: 48,
        spCost: 25000,
        mpCost: 72,
        power: 528
      },
      {
        level: 20,
        requiredLevel: 48,
        spCost: 25000,
        mpCost: 74,
        power: 544
      },
      {
        level: 21,
        requiredLevel: 48,
        spCost: 25000,
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
        spCost: 42000,
        mpCost: 87,
        power: 658
      },
      {
        level: 26,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 89,
        power: 674
      },
      {
        level: 27,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 90,
        power: 690
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 79000,
        mpCost: 93,
        power: 706
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 79000,
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
    battleId: "l2_1129",
    l2SkillId: 1129,
    minLevel: 44,
    spCost: 35000,
    nameUk: "Покликання віджилого",
    hintUk: "Викликає нежить-слугу.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 35000,
        mpCost: 78,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 94,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 110,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 119,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 127,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 133,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 137,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1144",
    l2SkillId: 1144,
    minLevel: 48,
    spCost: 75000,
    nameUk: "Крок вітру слуги",
    hintUk: "Накладає крок вітру на слугу.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 48,
        spCost: 75000,
        mpCost: 46,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1147",
    l2SkillId: 1147,
    minLevel: 14,
    spCost: 1100,
    nameUk: "Вампірний дотик",
    hintUk: "Витягує HP з ворога на себе.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 25,
        power: 18
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 28,
        power: 21
      }
    ],
    effects: [
      {
        stat: "vampirism",
        mode: "percent",
        value: 40
      }
    ],
    cooldownSec: 12,
    skipMobHp: false
  },
  {
    battleId: "l2_1148",
    l2SkillId: 1148,
    minLevel: 44,
    spCost: 35000,
    nameUk: "Шип смерті",
    hintUk: "Темна магічна шкода по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 35000,
        mpCost: 23,
        power: 58
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 27,
        power: 65
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 30,
        power: 72
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 35,
        power: 78
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 36,
        power: 82
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 38,
        power: 85
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 40,
        power: 89
      },
      {
        level: 8,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 41,
        power: 92
      },
      {
        level: 9,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 43,
        power: 96
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 45,
        power: 99
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 46,
        power: 102
      },
      {
        level: 12,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 47,
        power: 105
      },
      {
        level: 13,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 50,
        power: 108
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1151",
    l2SkillId: 1151,
    minLevel: 30,
    spCost: 11000,
    nameUk: "Витяг життя з трупа",
    hintUk: "Черпає силу з трупа ворога.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 14,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 15,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1154",
    l2SkillId: 1154,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Покликання скверного",
    hintUk: "Викликає скверну істоту.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
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
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 87,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 103,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 115,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 123,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 130,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1155",
    l2SkillId: 1155,
    minLevel: 48,
    spCost: 27000,
    nameUk: "Вибух трупа",
    hintUk: "Підриває труп, шкодуючи навколо.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 27000,
        mpCost: 42,
        power: 31
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 27000,
        mpCost: 44,
        power: 33
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 39000,
        mpCost: 45,
        power: 34
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 39000,
        mpCost: 48,
        power: 36
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 49,
        power: 38
      },
      {
        level: 6,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 52,
        power: 39
      },
      {
        level: 7,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 41
      },
      {
        level: 8,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 43
      },
      {
        level: 9,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 45
      },
      {
        level: 10,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 46
      },
      {
        level: 11,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 48
      },
      {
        level: 12,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 50
      },
      {
        level: 13,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 51
      },
      {
        level: 14,
        requiredLevel: 72,
        spCost: 630000,
        mpCost: 67,
        power: 53
      },
      {
        level: 15,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 54
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: false
  },
  {
    battleId: "l2_1156",
    l2SkillId: 1156,
    minLevel: 44,
    spCost: 35000,
    nameUk: "Забуття",
    hintUk: "Змушує ворога втратити ціль.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 35000,
        mpCost: 39,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 48,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 52,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 67,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1157",
    l2SkillId: 1157,
    minLevel: 25,
    spCost: 5500,
    nameUk: "Тіло в розум",
    hintUk: "Обмінює тіло й розум між цілями.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1159",
    l2SkillId: 1159,
    minLevel: 52,
    spCost: 39000,
    nameUk: "Прокляття зв’язку смерті",
    hintUk: "Прокляття зв’язку зі смертю.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 39000,
        mpCost: 45,
        power: 68
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 39000,
        mpCost: 48,
        power: 72
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 49,
        power: 75
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 52,
        power: 78
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 50000,
        mpCost: 53,
        power: 80
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 50000,
        mpCost: 54,
        power: 82
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 65000,
        mpCost: 55,
        power: 84
      },
      {
        level: 8,
        requiredLevel: 60,
        spCost: 65000,
        mpCost: 55,
        power: 85
      },
      {
        level: 9,
        requiredLevel: 62,
        spCost: 91000,
        mpCost: 57,
        power: 87
      },
      {
        level: 10,
        requiredLevel: 62,
        spCost: 91000,
        mpCost: 58,
        power: 89
      },
      {
        level: 11,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 59,
        power: 90
      },
      {
        level: 12,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 60,
        power: 92
      },
      {
        level: 13,
        requiredLevel: 66,
        spCost: 150000,
        mpCost: 60,
        power: 94
      },
      {
        level: 14,
        requiredLevel: 66,
        spCost: 150000,
        mpCost: 62,
        power: 96
      },
      {
        level: 15,
        requiredLevel: 68,
        spCost: 170000,
        mpCost: 63,
        power: 97
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 170000,
        mpCost: 64,
        power: 99
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 200000,
        mpCost: 64,
        power: 100
      },
      {
        level: 18,
        requiredLevel: 70,
        spCost: 200000,
        mpCost: 65,
        power: 102
      },
      {
        level: 19,
        requiredLevel: 72,
        spCost: 310000,
        mpCost: 67,
        power: 104
      },
      {
        level: 20,
        requiredLevel: 72,
        spCost: 310000,
        mpCost: 67,
        power: 105
      },
      {
        level: 21,
        requiredLevel: 74,
        spCost: 460000,
        mpCost: 68,
        power: 107
      },
      {
        level: 22,
        requiredLevel: 74,
        spCost: 460000,
        mpCost: 69,
        power: 108
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1160",
    l2SkillId: 1160,
    minLevel: 35,
    spCost: 18000,
    nameUk: "Сповільнення",
    hintUk: "Сповільнює рух і атаки цілі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 30,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 7,
    skipMobHp: true
  },
  {
    battleId: "l2_1163",
    l2SkillId: 1163,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Прокляття розладу",
    hintUk: "Прокляття розладу: знижує захист.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
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
        spCost: 35000,
        mpCost: 39,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 44,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 48,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 52,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 67,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent",
        value: -20
      },
      {
        stat: "mDef",
        mode: "percent",
        value: -20
      }
    ],
    cooldownSec: 40,
    skipMobHp: true
  },
  {
    battleId: "l2_1164",
    l2SkillId: 1164,
    minLevel: 14,
    spCost: 2100,
    nameUk: "Прокляття: слабкість",
    hintUk: "Прокляття слабкості: знижує фізичну атаку.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 14,
        spCost: 2100,
        mpCost: 3,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent",
        value: -25
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1167",
    l2SkillId: 1167,
    minLevel: 25,
    spCost: 5500,
    nameUk: "Отруйна хмара",
    hintUk: "Хмара отрути на площі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 34,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 45,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1168",
    l2SkillId: 1168,
    minLevel: 7,
    spCost: 470,
    nameUk: "Прокляття: отрута",
    hintUk: "Накладає отруту.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 10,
        power: 0
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "percent",
        value: -15
      }
    ],
    cooldownSec: 12,
    skipMobHp: true
  },
  {
    battleId: "l2_1169",
    l2SkillId: 1169,
    minLevel: 40,
    spCost: 32000,
    nameUk: "Прокляття страху",
    hintUk: "Накладає страх.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
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
        spCost: 35000,
        mpCost: 39,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 44,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 48,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 52,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 67,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent",
        value: -50
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1170",
    l2SkillId: 1170,
    minLevel: 44,
    spCost: 35000,
    nameUk: "Якір",
    hintUk: "Приковує ціль на місці.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 35000,
        mpCost: 39,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 48,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 52,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 67,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent",
        value: -90
      }
    ],
    cooldownSec: 180,
    skipMobHp: true
  },
  {
    battleId: "l2_1171",
    l2SkillId: 1171,
    minLevel: 40,
    spCost: 17000,
    nameUk: "Палюче коло",
    hintUk: "Вогняне коло: шкода по площі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 50,
        power: 29
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 53,
        power: 30
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 22000,
        mpCost: 55,
        power: 32
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 22000,
        mpCost: 59,
        power: 34
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 62,
        power: 36
      },
      {
        level: 6,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 65,
        power: 38
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 53000,
        mpCost: 68,
        power: 40
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 53000,
        mpCost: 70,
        power: 42
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 74,
        power: 44
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 77,
        power: 46
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 150000,
        mpCost: 80,
        power: 48
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 180000,
        mpCost: 83,
        power: 50
      },
      {
        level: 13,
        requiredLevel: 62,
        spCost: 250000,
        mpCost: 87,
        power: 52
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 89,
        power: 55
      },
      {
        level: 15,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 93,
        power: 57
      },
      {
        level: 16,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 95,
        power: 58
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 590000,
        mpCost: 98,
        power: 60
      },
      {
        level: 18,
        requiredLevel: 72,
        spCost: 940000,
        mpCost: 100,
        power: 62
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 103,
        power: 64
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false
  },
  {
    battleId: "l2_1172",
    l2SkillId: 1172,
    minLevel: 20,
    spCost: 1400,
    nameUk: "Аура полум’я",
    hintUk: "Аура вогню навколо персонажа.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 18,
        power: 19
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 20,
        power: 21
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 22,
        power: 24
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 23,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 25,
        power: 28
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 27,
        power: 30
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 29,
        power: 33
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 8800,
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
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
        spCost: 240,
        mpCost: 9,
        power: 13
      },
      {
        level: 3,
        requiredLevel: 7,
        spCost: 240,
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
    battleId: "l2_1181",
    l2SkillId: 1181,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Удар полум’я",
    hintUk: "Магічний удар вогнем.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 29,
        power: 13
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 34,
        power: 16
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 40,
        power: 19
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false
  },
  {
    battleId: "l2_1182",
    l2SkillId: 1182,
    minLevel: 58,
    spCost: 220000,
    nameUk: "Стійкість до води",
    hintUk: "Підвищує стійкість до води.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 220000,
        mpCost: 23,
        power: 0.85
      },
      {
        level: 2,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 35,
        power: 0.77
      },
      {
        level: 3,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 39,
        power: 0.7
      }
    ],
    effects: [
      {
        stat: "waterResist",
        mode: "flat",
        value: 30
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1184",
    l2SkillId: 1184,
    minLevel: 7,
    spCost: 240,
    nameUk: "Крижана блискавка",
    hintUk: "Крижана блискавка по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 240,
        mpCost: 9,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 7,
        spCost: 240,
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
    effects: [],
    cooldownSec: 8,
    skipMobHp: false
  },
  {
    battleId: "l2_1189",
    l2SkillId: 1189,
    minLevel: 58,
    spCost: 220000,
    nameUk: "Стійкість до вітру",
    hintUk: "Підвищує стійкість до вітру.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 220000,
        mpCost: 30,
        power: 0.85
      },
      {
        level: 2,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 35,
        power: 0.77
      },
      {
        level: 3,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 39,
        power: 0.7
      }
    ],
    effects: [
      {
        stat: "windResist",
        mode: "flat",
        value: 30
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1191",
    l2SkillId: 1191,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Стійкість до вогню",
    hintUk: "Підвищує стійкість до вогню.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 35,
        power: 0.85
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 39,
        power: 0.77
      }
    ],
    effects: [
      {
        stat: "fireResist",
        mode: "flat",
        value: 30
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1201",
    l2SkillId: 1201,
    minLevel: 40,
    spCost: 11000,
    nameUk: "Коріння дріади",
    hintUk: "Приковує ворогів корінням.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 34,
        power: 30
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 34,
        power: 30
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 11000,
        mpCost: 35,
        power: 30
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 38,
        power: 30
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 38,
        power: 30
      },
      {
        level: 15,
        requiredLevel: 44,
        spCost: 13000,
        mpCost: 39,
        power: 30
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 42,
        power: 30
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 43,
        power: 30
      },
      {
        level: 18,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 44,
        power: 30
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 45,
        power: 30
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 47,
        power: 30
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 33000,
        mpCost: 48,
        power: 30
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 49,
        power: 30
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 50,
        power: 30
      },
      {
        level: 24,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 52,
        power: 30
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 220000,
        mpCost: 54,
        power: 30
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 270000,
        mpCost: 55,
        power: 30
      },
      {
        level: 27,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 58,
        power: 30
      },
      {
        level: 28,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 60,
        power: 30
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 62,
        power: 30
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 770000,
        mpCost: 64,
        power: 30
      },
      {
        level: 31,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 65,
        power: 30
      },
      {
        level: 32,
        requiredLevel: 72,
        spCost: 1700000,
        mpCost: 67,
        power: 30
      },
      {
        level: 33,
        requiredLevel: 74,
        spCost: 2600000,
        mpCost: 69,
        power: 30
      }
    ],
    effects: [
      {
        stat: "hold",
        mode: "flat",
        value: 1
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
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 20,
        power: 20
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 13000,
        mpCost: 27,
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
    battleId: "l2_1216",
    l2SkillId: 1216,
    minLevel: 1,
    spCost: 0,
    nameUk: "Самозцілення",
    hintUk: "Миттєве зцілення себе.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_bishop",
      "human_cardinal",
      "human_cleric",
      "human_hierophant",
      "human_mage",
      "human_necromancer",
      "human_prophet",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
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
    minLevel: 40,
    spCost: 112000,
    nameUk: "Велике зцілення",
    hintUk: "Сильне зцілення однієї цілі.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 112000,
        mpCost: 58,
        power: 371
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 212000,
        mpCost: 60,
        power: 384
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 312000,
        mpCost: 62,
        power: 398
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 414000,
        mpCost: 64,
        power: 426
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 514000,
        mpCost: 65,
        power: 441
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 614000,
        mpCost: 68,
        power: 455
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 721000,
        mpCost: 72,
        power: 484
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 821000,
        mpCost: 74,
        power: 499
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 921000,
        mpCost: 77,
        power: 514
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 1032000,
        mpCost: 80,
        power: 544
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 1132000,
        mpCost: 80,
        power: 559
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 1232000,
        mpCost: 83,
        power: 574
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 1333000,
        mpCost: 87,
        power: 603
      },
      {
        level: 14,
        requiredLevel: 53,
        spCost: 1433000,
        mpCost: 89,
        power: 618
      },
      {
        level: 15,
        requiredLevel: 54,
        spCost: 1533000,
        mpCost: 90,
        power: 633
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 1665000,
        mpCost: 93,
        power: 647
      },
      {
        level: 17,
        requiredLevel: 56,
        spCost: 1765000,
        mpCost: 95,
        power: 662
      },
      {
        level: 18,
        requiredLevel: 57,
        spCost: 1883000,
        mpCost: 97,
        power: 676
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 1983000,
        mpCost: 98,
        power: 690
      },
      {
        level: 20,
        requiredLevel: 59,
        spCost: 20130000,
        mpCost: 98,
        power: 704
      },
      {
        level: 21,
        requiredLevel: 60,
        spCost: 21130000,
        mpCost: 100,
        power: 718
      },
      {
        level: 22,
        requiredLevel: 61,
        spCost: 22140000,
        mpCost: 102,
        power: 731
      },
      {
        level: 23,
        requiredLevel: 62,
        spCost: 23140000,
        mpCost: 104,
        power: 745
      },
      {
        level: 24,
        requiredLevel: 63,
        spCost: 24210000,
        mpCost: 105,
        power: 758
      },
      {
        level: 25,
        requiredLevel: 64,
        spCost: 25210000,
        mpCost: 108,
        power: 770
      },
      {
        level: 26,
        requiredLevel: 65,
        spCost: 26230000,
        mpCost: 109,
        power: 783
      },
      {
        level: 27,
        requiredLevel: 66,
        spCost: 27230000,
        mpCost: 112,
        power: 795
      },
      {
        level: 28,
        requiredLevel: 67,
        spCost: 28290000,
        mpCost: 113,
        power: 806
      },
      {
        level: 29,
        requiredLevel: 68,
        spCost: 29290000,
        mpCost: 114,
        power: 817
      },
      {
        level: 30,
        requiredLevel: 69,
        spCost: 30470000,
        mpCost: 115,
        power: 828
      },
      {
        level: 31,
        requiredLevel: 70,
        spCost: 31470000,
        mpCost: 117,
        power: 839
      },
      {
        level: 32,
        requiredLevel: 71,
        spCost: 32640000,
        mpCost: 119,
        power: 849
      },
      {
        level: 33,
        requiredLevel: 72,
        spCost: 33640000,
        mpCost: 120,
        power: 858
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1218",
    l2SkillId: 1218,
    minLevel: 40,
    spCost: 112000,
    nameUk: "Велике бойове зцілення",
    hintUk: "Сильне бойове зцілення.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 112000,
        mpCost: 87,
        power: 371
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 212000,
        mpCost: 90,
        power: 384
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 312000,
        mpCost: 92,
        power: 398
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 414000,
        mpCost: 95,
        power: 426
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 514000,
        mpCost: 98,
        power: 441
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 614000,
        mpCost: 102,
        power: 455
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 721000,
        mpCost: 108,
        power: 484
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 821000,
        mpCost: 110,
        power: 499
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 921000,
        mpCost: 114,
        power: 514
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 1032000,
        mpCost: 120,
        power: 544
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 1132000,
        mpCost: 121,
        power: 559
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 1232000,
        mpCost: 123,
        power: 574
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 1333000,
        mpCost: 129,
        power: 603
      },
      {
        level: 14,
        requiredLevel: 53,
        spCost: 1433000,
        mpCost: 133,
        power: 618
      },
      {
        level: 15,
        requiredLevel: 54,
        spCost: 1533000,
        mpCost: 135,
        power: 633
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 1665000,
        mpCost: 139,
        power: 647
      },
      {
        level: 17,
        requiredLevel: 56,
        spCost: 1765000,
        mpCost: 142,
        power: 662
      },
      {
        level: 18,
        requiredLevel: 57,
        spCost: 1883000,
        mpCost: 145,
        power: 676
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 1983000,
        mpCost: 147,
        power: 690
      },
      {
        level: 20,
        requiredLevel: 59,
        spCost: 20130000,
        mpCost: 147,
        power: 704
      },
      {
        level: 21,
        requiredLevel: 60,
        spCost: 21130000,
        mpCost: 150,
        power: 718
      },
      {
        level: 22,
        requiredLevel: 61,
        spCost: 22140000,
        mpCost: 153,
        power: 731
      },
      {
        level: 23,
        requiredLevel: 62,
        spCost: 23140000,
        mpCost: 155,
        power: 745
      },
      {
        level: 24,
        requiredLevel: 63,
        spCost: 24210000,
        mpCost: 158,
        power: 758
      },
      {
        level: 25,
        requiredLevel: 64,
        spCost: 25210000,
        mpCost: 160,
        power: 770
      },
      {
        level: 26,
        requiredLevel: 65,
        spCost: 26230000,
        mpCost: 164,
        power: 783
      },
      {
        level: 27,
        requiredLevel: 66,
        spCost: 27230000,
        mpCost: 167,
        power: 795
      },
      {
        level: 28,
        requiredLevel: 67,
        spCost: 28290000,
        mpCost: 168,
        power: 806
      },
      {
        level: 29,
        requiredLevel: 68,
        spCost: 29290000,
        mpCost: 170,
        power: 817
      },
      {
        level: 30,
        requiredLevel: 69,
        spCost: 30470000,
        mpCost: 173,
        power: 828
      },
      {
        level: 31,
        requiredLevel: 70,
        spCost: 31470000,
        mpCost: 175,
        power: 839
      },
      {
        level: 32,
        requiredLevel: 71,
        spCost: 32640000,
        mpCost: 178,
        power: 849
      },
      {
        level: 33,
        requiredLevel: 72,
        spCost: 33640000,
        mpCost: 179,
        power: 858
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1219",
    l2SkillId: 1219,
    minLevel: 40,
    spCost: 112000,
    nameUk: "Велике групове зцілення",
    hintUk: "Сильне групове зцілення.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 112000,
        mpCost: 115,
        power: 297
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 212000,
        mpCost: 119,
        power: 308
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 312000,
        mpCost: 122,
        power: 319
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 414000,
        mpCost: 127,
        power: 341
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 514000,
        mpCost: 130,
        power: 353
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 614000,
        mpCost: 134,
        power: 364
      },
      {
        level: 7,
        requiredLevel: 46,
        spCost: 721000,
        mpCost: 143,
        power: 388
      },
      {
        level: 8,
        requiredLevel: 47,
        spCost: 821000,
        mpCost: 148,
        power: 399
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 921000,
        mpCost: 152,
        power: 411
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 1032000,
        mpCost: 159,
        power: 435
      },
      {
        level: 11,
        requiredLevel: 50,
        spCost: 1132000,
        mpCost: 159,
        power: 447
      },
      {
        level: 12,
        requiredLevel: 51,
        spCost: 1232000,
        mpCost: 164,
        power: 459
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 1333000,
        mpCost: 173,
        power: 483
      },
      {
        level: 14,
        requiredLevel: 53,
        spCost: 1433000,
        mpCost: 177,
        power: 495
      },
      {
        level: 15,
        requiredLevel: 54,
        spCost: 1533000,
        mpCost: 180,
        power: 506
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 1665000,
        mpCost: 185,
        power: 518
      },
      {
        level: 17,
        requiredLevel: 56,
        spCost: 1765000,
        mpCost: 189,
        power: 529
      },
      {
        level: 18,
        requiredLevel: 57,
        spCost: 1883000,
        mpCost: 193,
        power: 541
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 1983000,
        mpCost: 195,
        power: 552
      },
      {
        level: 20,
        requiredLevel: 59,
        spCost: 20130000,
        mpCost: 195,
        power: 563
      },
      {
        level: 21,
        requiredLevel: 60,
        spCost: 21130000,
        mpCost: 199,
        power: 574
      },
      {
        level: 22,
        requiredLevel: 61,
        spCost: 22140000,
        mpCost: 203,
        power: 585
      },
      {
        level: 23,
        requiredLevel: 62,
        spCost: 23140000,
        mpCost: 207,
        power: 596
      },
      {
        level: 24,
        requiredLevel: 63,
        spCost: 24210000,
        mpCost: 210,
        power: 606
      },
      {
        level: 25,
        requiredLevel: 64,
        spCost: 25210000,
        mpCost: 214,
        power: 616
      },
      {
        level: 26,
        requiredLevel: 65,
        spCost: 26230000,
        mpCost: 218,
        power: 626
      },
      {
        level: 27,
        requiredLevel: 66,
        spCost: 27230000,
        mpCost: 222,
        power: 636
      },
      {
        level: 28,
        requiredLevel: 67,
        spCost: 28290000,
        mpCost: 224,
        power: 645
      },
      {
        level: 29,
        requiredLevel: 68,
        spCost: 29290000,
        mpCost: 228,
        power: 654
      },
      {
        level: 30,
        requiredLevel: 69,
        spCost: 30470000,
        mpCost: 230,
        power: 663
      },
      {
        level: 31,
        requiredLevel: 70,
        spCost: 31470000,
        mpCost: 233,
        power: 671
      },
      {
        level: 32,
        requiredLevel: 71,
        spCost: 32640000,
        mpCost: 237,
        power: 679
      },
      {
        level: 33,
        requiredLevel: 72,
        spCost: 33640000,
        mpCost: 239,
        power: 687
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1220",
    l2SkillId: 1220,
    minLevel: 20,
    spCost: 1400,
    nameUk: "Полум’я",
    hintUk: "Вогняний магічний удар.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 18,
        power: 23
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 20,
        power: 26
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 22,
        power: 29
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 2800,
        mpCost: 23,
        power: 32
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 25,
        power: 35
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 27,
        power: 38
      },
      {
        level: 7,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 29,
        power: 42
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 30,
        power: 44
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1222",
    l2SkillId: 1222,
    minLevel: 35,
    spCost: 18000,
    nameUk: "Прокляття хаосу",
    hintUk: "Прокляття хаосу на ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 15,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1225",
    l2SkillId: 1225,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Покликання кота М’яу",
    hintUk: "Викликає кота М’яу.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 39,
        power: 5
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 44,
        power: 10
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 53,
        power: 15
      },
      {
        level: 4,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 60,
        power: 20
      }
    ],
    effects: [],
    cooldownSec: 5,
    skipMobHp: true
  },
  {
    battleId: "l2_1230",
    l2SkillId: 1230,
    minLevel: 40,
    spCost: 17000,
    nameUk: "Промінь",
    hintUk: "Магічний промінь по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 34,
        power: 49
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 17000,
        mpCost: 35,
        power: 52
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 22000,
        mpCost: 38,
        power: 55
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 22000,
        mpCost: 39,
        power: 58
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 42,
        power: 61
      },
      {
        level: 6,
        requiredLevel: 48,
        spCost: 33000,
        mpCost: 44,
        power: 65
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 53000,
        mpCost: 45,
        power: 68
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 53000,
        mpCost: 48,
        power: 72
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 49,
        power: 75
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 52,
        power: 78
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 53,
        power: 80
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 54,
        power: 82
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 88000,
        mpCost: 55,
        power: 84
      },
      {
        level: 14,
        requiredLevel: 60,
        spCost: 88000,
        mpCost: 55,
        power: 85
      },
      {
        level: 15,
        requiredLevel: 62,
        spCost: 130000,
        mpCost: 57,
        power: 87
      },
      {
        level: 16,
        requiredLevel: 62,
        spCost: 130000,
        mpCost: 58,
        power: 89
      },
      {
        level: 17,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 59,
        power: 90
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
        spCost: 210000,
        mpCost: 60,
        power: 94
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 62,
        power: 96
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 210000,
        mpCost: 63,
        power: 97
      },
      {
        level: 22,
        requiredLevel: 68,
        spCost: 210000,
        mpCost: 64,
        power: 99
      },
      {
        level: 23,
        requiredLevel: 70,
        spCost: 290000,
        mpCost: 64,
        power: 100
      },
      {
        level: 24,
        requiredLevel: 70,
        spCost: 290000,
        mpCost: 65,
        power: 102
      },
      {
        level: 25,
        requiredLevel: 72,
        spCost: 470000,
        mpCost: 67,
        power: 104
      },
      {
        level: 26,
        requiredLevel: 72,
        spCost: 470000,
        mpCost: 67,
        power: 105
      },
      {
        level: 27,
        requiredLevel: 74,
        spCost: 640000,
        mpCost: 68,
        power: 107
      },
      {
        level: 28,
        requiredLevel: 74,
        spCost: 640000,
        mpCost: 69,
        power: 108
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1231",
    l2SkillId: 1231,
    minLevel: 40,
    spCost: 17000,
    nameUk: "Спалах аури",
    hintUk: "Спалах аури: шкода навколо.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
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
        spCost: 22000,
        mpCost: 38,
        power: 44
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 22000,
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
        spCost: 53000,
        mpCost: 45,
        power: 55
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 53000,
        mpCost: 48,
        power: 57
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 49,
        power: 60
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 56000,
        mpCost: 52,
        power: 63
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 53,
        power: 64
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 73000,
        mpCost: 54,
        power: 66
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 88000,
        mpCost: 55,
        power: 67
      },
      {
        level: 14,
        requiredLevel: 60,
        spCost: 88000,
        mpCost: 55,
        power: 68
      },
      {
        level: 15,
        requiredLevel: 62,
        spCost: 130000,
        mpCost: 57,
        power: 70
      },
      {
        level: 16,
        requiredLevel: 62,
        spCost: 130000,
        mpCost: 58,
        power: 71
      },
      {
        level: 17,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 59,
        power: 72
      },
      {
        level: 18,
        requiredLevel: 64,
        spCost: 150000,
        mpCost: 60,
        power: 74
      },
      {
        level: 19,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 60,
        power: 75
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 210000,
        mpCost: 62,
        power: 77
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 210000,
        mpCost: 63,
        power: 78
      },
      {
        level: 22,
        requiredLevel: 68,
        spCost: 210000,
        mpCost: 64,
        power: 79
      },
      {
        level: 23,
        requiredLevel: 70,
        spCost: 290000,
        mpCost: 64,
        power: 80
      },
      {
        level: 24,
        requiredLevel: 70,
        spCost: 290000,
        mpCost: 65,
        power: 82
      },
      {
        level: 25,
        requiredLevel: 72,
        spCost: 470000,
        mpCost: 67,
        power: 83
      },
      {
        level: 26,
        requiredLevel: 72,
        spCost: 470000,
        mpCost: 67,
        power: 84
      },
      {
        level: 27,
        requiredLevel: 74,
        spCost: 640000,
        mpCost: 68,
        power: 85
      },
      {
        level: 28,
        requiredLevel: 74,
        spCost: 640000,
        mpCost: 69,
        power: 87
      }
    ],
    effects: [],
    cooldownSec: 2,
    skipMobHp: false
  },
  {
    battleId: "l2_1232",
    l2SkillId: 1232,
    minLevel: 40,
    spCost: 34000,
    nameUk: "Палюча шкіра",
    hintUk: "Підпалює шкіру ворогів дотиком.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 34000,
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
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1233",
    l2SkillId: 1233,
    minLevel: 48,
    spCost: 67000,
    nameUk: "Занепад",
    hintUk: "Знижує параметри цілі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 65,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 77,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 89,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 103,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1234",
    l2SkillId: 1234,
    minLevel: 40,
    spCost: 16000,
    nameUk: "Вампірні кігті",
    hintUk: "Вампірні кігті: крадіжка життя.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 50,
        power: 49
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 16000,
        mpCost: 53,
        power: 52
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 55,
        power: 55
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 18000,
        mpCost: 59,
        power: 58
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 27000,
        mpCost: 62,
        power: 61
      },
      {
        level: 6,
        requiredLevel: 48,
        spCost: 27000,
        mpCost: 65,
        power: 65
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 39000,
        mpCost: 68,
        power: 68
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 39000,
        mpCost: 70,
        power: 72
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 74,
        power: 75
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 42000,
        mpCost: 77,
        power: 78
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 50000,
        mpCost: 79,
        power: 80
      },
      {
        level: 12,
        requiredLevel: 58,
        spCost: 50000,
        mpCost: 80,
        power: 82
      },
      {
        level: 13,
        requiredLevel: 60,
        spCost: 65000,
        mpCost: 82,
        power: 84
      },
      {
        level: 14,
        requiredLevel: 60,
        spCost: 65000,
        mpCost: 83,
        power: 85
      },
      {
        level: 15,
        requiredLevel: 62,
        spCost: 91000,
        mpCost: 85,
        power: 87
      },
      {
        level: 16,
        requiredLevel: 62,
        spCost: 91000,
        mpCost: 87,
        power: 89
      },
      {
        level: 17,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 88,
        power: 90
      },
      {
        level: 18,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 89,
        power: 92
      },
      {
        level: 19,
        requiredLevel: 66,
        spCost: 150000,
        mpCost: 90,
        power: 94
      },
      {
        level: 20,
        requiredLevel: 66,
        spCost: 150000,
        mpCost: 93,
        power: 96
      },
      {
        level: 21,
        requiredLevel: 68,
        spCost: 170000,
        mpCost: 94,
        power: 97
      },
      {
        level: 22,
        requiredLevel: 68,
        spCost: 170000,
        mpCost: 95,
        power: 99
      },
      {
        level: 23,
        requiredLevel: 70,
        spCost: 200000,
        mpCost: 97,
        power: 100
      },
      {
        level: 24,
        requiredLevel: 70,
        spCost: 200000,
        mpCost: 98,
        power: 102
      },
      {
        level: 25,
        requiredLevel: 72,
        spCost: 310000,
        mpCost: 99,
        power: 104
      },
      {
        level: 26,
        requiredLevel: 72,
        spCost: 310000,
        mpCost: 100,
        power: 105
      },
      {
        level: 27,
        requiredLevel: 74,
        spCost: 460000,
        mpCost: 102,
        power: 107
      },
      {
        level: 28,
        requiredLevel: 74,
        spCost: 460000,
        mpCost: 103,
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
    cooldownSec: 12,
    skipMobHp: false
  },
  {
    battleId: "l2_1240",
    l2SkillId: 1240,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Настанова",
    hintUk: "Бойова настанова для союзника.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 35,
        power: 4
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 4
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 4
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat",
        value: 4
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1242",
    l2SkillId: 1242,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Шепіт смерті",
    hintUk: "Темна магія: додаткова шкода.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 35,
        power: 1.35
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 1.35
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 1.35
      }
    ],
    effects: [
      {
        stat: "critDamage",
        mode: "percent",
        value: 35
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1243",
    l2SkillId: 1243,
    minLevel: 40,
    spCost: 31000,
    nameUk: "Благословення щита",
    hintUk: "Підсилює захист щита.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 31000,
        mpCost: 35,
        power: 1.4
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 44,
        power: 1.4
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 52,
        power: 1.4
      }
    ],
    effects: [
      {
        stat: "shieldBlockRate",
        mode: "percent",
        value: 40
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1254",
    l2SkillId: 1254,
    minLevel: 40,
    spCost: 136000,
    nameUk: "Масове воскресіння",
    hintUk: "Воскресіння кількох союзників.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 136000,
        mpCost: 243,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 241000,
        mpCost: 268,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 395000,
        mpCost: 327,
        power: 30
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 4100000,
        mpCost: 360,
        power: 40
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 5130000,
        mpCost: 377,
        power: 50
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 6450000,
        mpCost: 442,
        power: 60
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1258",
    l2SkillId: 1258,
    minLevel: 40,
    spCost: 141000,
    nameUk: "Відновлення життя",
    hintUk: "Сильне відновлення HP цілі.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 141000,
        mpCost: 80,
        power: 15
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 263000,
        mpCost: 107,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 395000,
        mpCost: 133,
        power: 25
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 4100000,
        mpCost: 159,
        power: 30
      }
    ],
    effects: [],
    cooldownSec: 120,
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
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 32000,
        mpCost: 7,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 9,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 11,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 11,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 13,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1263",
    l2SkillId: 1263,
    minLevel: 44,
    spCost: 35000,
    nameUk: "Прокляття згуби",
    hintUk: "Прокляття згуби: тривала шкода.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 35000,
        mpCost: 39,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 55000,
        mpCost: 44,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 78000,
        mpCost: 48,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 52,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 67,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent",
        value: -25
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1269",
    l2SkillId: 1269,
    minLevel: 58,
    spCost: 100000,
    nameUk: "Прокляття хвороби",
    hintUk: "Прокляття хвороби: періодична шкода.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 54,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 55,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 58,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 60,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 300000,
        mpCost: 62,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 64,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 65,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 67,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 69,
        power: 0
      }
    ],
    effects: [
      {
        stat: "attackSpeed",
        mode: "percent",
        value: -20
      },
      {
        stat: "runSpeed",
        mode: "percent",
        value: -10
      }
    ],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1271",
    l2SkillId: 1271,
    minLevel: 66,
    spCost: 410000,
    nameUk: "Бенедикція",
    hintUk: "Потужне благословення групи.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 214,
        power: 100
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: true
  },
  {
    battleId: "l2_1272",
    l2SkillId: 1272,
    minLevel: 44,
    spCost: 39000,
    nameUk: "Слово страху",
    hintUk: "Накладає страх на ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 39000,
        mpCost: 117,
        power: 200
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 129,
        power: 200
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 140,
        power: 200
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 153,
        power: 200
      },
      {
        level: 5,
        requiredLevel: 58,
        spCost: 220000,
        mpCost: 159,
        power: 200
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 270000,
        mpCost: 165,
        power: 200
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 172,
        power: 200
      },
      {
        level: 8,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 178,
        power: 200
      },
      {
        level: 9,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 184,
        power: 200
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 770000,
        mpCost: 189,
        power: 200
      },
      {
        level: 11,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 194,
        power: 200
      },
      {
        level: 12,
        requiredLevel: 72,
        spCost: 1700000,
        mpCost: 199,
        power: 200
      },
      {
        level: 13,
        requiredLevel: 74,
        spCost: 2600000,
        mpCost: 204,
        power: 200
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
    spCost: 2900,
    nameUk: "Енергетична блискавка",
    hintUk: "Енергетичний залп по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_archmage",
      "human_necromancer",
      "human_sorcerer",
      "human_soultaker",
      "human_warlock",
      "human_wizard"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 10,
        power: 13
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 5500,
        mpCost: 12,
        power: 16
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 14,
        power: 19
      },
      {
        level: 4,
        requiredLevel: 35,
        spCost: 18000,
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
    spCost: 34000,
    nameUk: "Блискавка аури",
    hintUk: "Блискавка аури по площі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 34000,
        mpCost: 18,
        power: 26
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 43000,
        mpCost: 20,
        power: 29
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 67000,
        mpCost: 23,
        power: 33
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 100000,
        mpCost: 24,
        power: 36
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 27,
        power: 39
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 150000,
        mpCost: 28,
        power: 41
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 180000,
        mpCost: 28,
        power: 43
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 250000,
        mpCost: 29,
        power: 45
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 30,
        power: 46
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 32,
        power: 48
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 33,
        power: 50
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 590000,
        mpCost: 33,
        power: 51
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 940000,
        mpCost: 34,
        power: 53
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 35,
        power: 54
      }
    ],
    effects: [],
    cooldownSec: 3,
    skipMobHp: false
  },
  {
    battleId: "l2_1285",
    l2SkillId: 1285,
    minLevel: 66,
    spCost: 410000,
    nameUk: "Насіння вогню",
    hintUk: "Насіння вогню: періодичний вогонь.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 250,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: false
  },
  {
    battleId: "l2_1288",
    l2SkillId: 1288,
    minLevel: 68,
    spCost: 430000,
    nameUk: "Симфонія аури",
    hintUk: "Симфонія аури: масовий ефект.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 250,
        power: 350
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: false
  },
  {
    battleId: "l2_1289",
    l2SkillId: 1289,
    minLevel: 70,
    spCost: 590000,
    nameUk: "Пекло",
    hintUk: "Пекельний залп по площі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 70,
        spCost: 590000,
        mpCost: 250,
        power: 350
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: false
  },
  {
    battleId: "l2_1292",
    l2SkillId: 1292,
    minLevel: 72,
    spCost: 940000,
    nameUk: "Стихійний натиск",
    hintUk: "Стихійний натиск по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 72,
        spCost: 940000,
        mpCost: 250,
        power: 500
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: false
  },
  {
    battleId: "l2_1296",
    l2SkillId: 1296,
    minLevel: 58,
    spCost: 150000,
    nameUk: "Дощ вогню",
    hintUk: "Дощ вогню на зону.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage",
      "human_sorcerer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 150000,
        mpCost: 54,
        power: 41
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 180000,
        mpCost: 55,
        power: 43
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 250000,
        mpCost: 58,
        power: 45
      },
      {
        level: 4,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 60,
        power: 46
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 410000,
        mpCost: 62,
        power: 48
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 64,
        power: 50
      },
      {
        level: 7,
        requiredLevel: 70,
        spCost: 590000,
        mpCost: 65,
        power: 51
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 940000,
        mpCost: 67,
        power: 53
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1300000,
        mpCost: 69,
        power: 54
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: false
  },
  {
    battleId: "l2_1298",
    l2SkillId: 1298,
    minLevel: 62,
    spCost: 91000,
    nameUk: "Масове сповільнення",
    hintUk: "Сповільнює багатьох ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 62,
        spCost: 91000,
        mpCost: 0,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 62,
        spCost: 91000,
        mpCost: 0,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 0,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 64,
        spCost: 100000,
        mpCost: 0,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 66,
        spCost: 150000,
        mpCost: 0,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 66,
        spCost: 150000,
        mpCost: 0,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 68,
        spCost: 170000,
        mpCost: 0,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 68,
        spCost: 170000,
        mpCost: 0,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 70,
        spCost: 200000,
        mpCost: 0,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 70,
        spCost: 200000,
        mpCost: 0,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 72,
        spCost: 310000,
        mpCost: 0,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 72,
        spCost: 310000,
        mpCost: 0,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 74,
        spCost: 460000,
        mpCost: 0,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 460000,
        mpCost: 0,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent",
        value: -50
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1299",
    l2SkillId: 1299,
    minLevel: 52,
    spCost: 110000,
    nameUk: "Остання оборона слуги",
    hintUk: "Остання лінія захисту слуги.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_warlock"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 110000,
        mpCost: 38,
        power: 1800
      },
      {
        level: 2,
        requiredLevel: 70,
        spCost: 670000,
        mpCost: 52,
        power: 3600
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat"
      },
      {
        stat: "mDef",
        mode: "flat"
      }
    ],
    cooldownSec: 1800,
    skipMobHp: true
  },
  {
    battleId: "l2_1307",
    l2SkillId: 1307,
    minLevel: 40,
    spCost: 1410000,
    nameUk: "Молитва",
    hintUk: "Підсилює силу зцілення та ефективність хілів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 1410000,
        mpCost: 244,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 2590000,
        mpCost: 259,
        power: 10
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 31300000,
        mpCost: 272,
        power: 12
      }
    ],
    effects: [
      {
        stat: "healPower",
        mode: "percent"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1311",
    l2SkillId: 1311,
    minLevel: 40,
    spCost: 163000,
    nameUk: "Тіло аватара",
    hintUk: "Підвищує максимум HP у формі аватара.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_bishop",
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 163000,
        mpCost: 342,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 41,
        spCost: 2100000,
        mpCost: 408,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 42,
        spCost: 3170000,
        mpCost: 440,
        power: 20
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 4280000,
        mpCost: 473,
        power: 25
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 5450000,
        mpCost: 503,
        power: 30
      },
      {
        level: 6,
        requiredLevel: 45,
        spCost: 940000,
        mpCost: 530,
        power: 35
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "percent"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1331",
    l2SkillId: 1331,
    minLevel: 56,
    spCost: 105000,
    nameUk: "Покликання котячої королеви",
    hintUk: "Викликає котячу королеву.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_warlock"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 56,
        spCost: 105000,
        mpCost: 0,
        power: 5
      },
      {
        level: 2,
        requiredLevel: 68,
        spCost: 520000,
        mpCost: 0,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 74,
        spCost: 1400000,
        mpCost: 0,
        power: 10
      }
    ],
    effects: [
      {
        stat: "atkSpeed",
        mode: "percent"
      },
      {
        stat: "vampirism",
        mode: "percent"
      },
      {
        stat: "pAtk",
        mode: "percent"
      },
      {
        stat: "pDef",
        mode: "percent"
      }
    ],
    cooldownSec: 300,
    skipMobHp: true
  },
  {
    battleId: "l2_1334",
    l2SkillId: 1334,
    minLevel: 56,
    spCost: 83000,
    nameUk: "Покликання проклятого",
    hintUk: "Викликає проклятого слугу.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_necromancer",
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 56,
        spCost: 83000,
        mpCost: 103,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 110,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 200000,
        mpCost: 119,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 68,
        spCost: 330000,
        mpCost: 127,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 410000,
        mpCost: 130,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 72,
        spCost: 610000,
        mpCost: 133,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 74,
        spCost: 920000,
        mpCost: 137,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1335",
    l2SkillId: 1335,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Масове воскресіння",
    hintUk: "Масове воскресіння союзників.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 62,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1336",
    l2SkillId: 1336,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Прокляття загибелі",
    hintUk: "Масове прокляття загибелі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1337",
    l2SkillId: 1337,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Прокляття безодні",
    hintUk: "Прокляття безодні: глибокий дебаф.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 72,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mAtk",
        mode: "percent",
        value: -30
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: -20
      },
      {
        stat: "skillCritRate",
        mode: "percent",
        value: -30
      },
      {
        stat: "runSpeed",
        mode: "percent",
        value: -10
      },
      {
        stat: "pDef",
        mode: "percent",
        value: -30
      },
      {
        stat: "evasion",
        mode: "flat",
        value: -6
      }
    ],
    cooldownSec: 300,
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
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 72,
        power: 40
      }
    ],
    effects: [],
    cooldownSec: 60,
    skipMobHp: false
  },
  {
    battleId: "l2_1339",
    l2SkillId: 1339,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Вогняний вихор",
    hintUk: "Вогняний вихор на площі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_archmage"
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
        mode: "percent",
        value: -10
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: -30
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: -10
      },
      {
        stat: "fireResist",
        mode: "percent",
        value: -20
      }
    ],
    cooldownSec: 60,
    skipMobHp: false
  },
  {
    battleId: "l2_1343",
    l2SkillId: 1343,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Темний вихор",
    hintUk: "Темний вихор: магічна шкода.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 105,
        power: 139
      }
    ],
    effects: [
      {
        stat: "darkResist",
        mode: "percent",
        value: -30
      },
      {
        stat: "vampirism",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 60,
    skipMobHp: false
  },
  {
    battleId: "l2_1344",
    l2SkillId: 1344,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Масове прокляття воїнів",
    hintUk: "Прокляття воїнів на площі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 105,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 30,
    skipMobHp: true
  },
  {
    battleId: "l2_1345",
    l2SkillId: 1345,
    minLevel: 78,
    spCost: 21000000,
    nameUk: "Масове прокляття магів",
    hintUk: "Прокляття магів на площі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_soultaker"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 21000000,
        mpCost: 107,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 30,
    skipMobHp: true
  },
  {
    battleId: "l2_1346",
    l2SkillId: 1346,
    minLevel: 77,
    spCost: 15000000,
    nameUk: "Підсилення воїна",
    hintUk: "Підсилює воїна-союзника.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_arcana_lord"
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
        stat: "pDef",
        mode: "percent",
        value: 20
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 4
      },
      {
        stat: "pAtk",
        mode: "percent",
        value: 10
      },
      {
        stat: "runSpeed",
        mode: "percent",
        value: -10
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "debuffResist",
        mode: "percent",
        value: 10
      }
    ],
    cooldownSec: null,
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
      "human_arcana_lord"
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
        stat: "runSpeed",
        mode: "percent",
        value: -20
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
        stat: "atkSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "critRate",
        mode: "percent",
        value: 20
      },
      {
        stat: "critDamage",
        mode: "percent",
        value: 20
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
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1350",
    l2SkillId: 1350,
    minLevel: 76,
    spCost: 12000000,
    nameUk: "Прокляття воїна",
    hintUk: "Знижує бойову силу воїнів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 12000000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1351",
    l2SkillId: 1351,
    minLevel: 77,
    spCost: 15000000,
    nameUk: "Прокляття мага",
    hintUk: "Знижує магічну силу ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_arcana_lord"
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
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1352",
    l2SkillId: 1352,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Стихійний захист",
    hintUk: "Стихійний захист від шкоди.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 70,
        power: 0.8
      }
    ],
    effects: [
      {
        stat: "fireResist",
        mode: "percent",
        value: 30
      },
      {
        stat: "waterResist",
        mode: "percent",
        value: 20
      },
      {
        stat: "windResist",
        mode: "percent",
        value: 20
      },
      {
        stat: "earthResist",
        mode: "percent",
        value: 20
      }
    ],
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
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 70,
        power: 0
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
    battleId: "l2_1356",
    l2SkillId: 1356,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Пророцтво вогню",
    hintUk: "Пророцтво вогню: потужний баф атаки.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 72,
        power: 1.1
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
        stat: "pDef",
        mode: "percent",
        value: 20
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 4
      },
      {
        stat: "pAtk",
        mode: "percent",
        value: 10
      },
      {
        stat: "runSpeed",
        mode: "percent",
        value: -10
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
    battleId: "l2_1358",
    l2SkillId: 1358,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Блок щита",
    hintUk: "Блокує частину фізичних ударів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_hierophant"
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
        stat: "pDef",
        mode: "percent",
        value: -10
      }
    ],
    cooldownSec: 30,
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
      "human_hierophant"
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
        mode: "percent",
        value: -10
      }
    ],
    cooldownSec: 30,
    skipMobHp: true
  },
  {
    battleId: "l2_1360",
    l2SkillId: 1360,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Масовий блок щита",
    hintUk: "Масовий блок щитом.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 105,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent",
        value: -10
      }
    ],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1361",
    l2SkillId: 1361,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Масовий блок швидкості",
    hintUk: "Масовий блок прискорення.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 107,
        power: 0
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent",
        value: -10
      }
    ],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1388",
    l2SkillId: 1388,
    minLevel: 66,
    spCost: 700000,
    nameUk: "Велика сила",
    hintUk: "Сильно підвищує силу.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 69,
        power: 4
      },
      {
        level: 2,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 69,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 74,
        spCost: 1700000,
        mpCost: 69,
        power: 10
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1389",
    l2SkillId: 1389,
    minLevel: 66,
    spCost: 700000,
    nameUk: "Великий щит",
    hintUk: "Сильно підвищує захист.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_hierophant",
      "human_prophet"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 700000,
        mpCost: 69,
        power: 5
      },
      {
        level: 2,
        requiredLevel: 70,
        spCost: 1000000,
        mpCost: 69,
        power: 10
      },
      {
        level: 3,
        requiredLevel: 74,
        spCost: 1700000,
        mpCost: 69,
        power: 15
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1410",
    l2SkillId: 1410,
    minLevel: 79,
    spCost: 60000000,
    nameUk: "Спасіння",
    hintUk: "Рятівне зцілення або захист цілі.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_cardinal"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 79,
        spCost: 60000000,
        mpCost: 86,
        power: 0
      }
    ],
    effects: [
      {
        stat: "salvation",
        mode: "percent",
        value: 70
      }
    ],
    cooldownSec: 3600,
    skipMobHp: true
  },
  {
    battleId: "l2_1453",
    l2SkillId: 1453,
    minLevel: 40,
    spCost: 2500,
    nameUk: "Морозний вітер",
    hintUk: "Морозний вітер: шкода і сповільнення.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "human_arcana_lord",
      "human_bishop",
      "human_cardinal",
      "human_hierophant",
      "human_prophet",
      "human_warlock"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 2500,
        mpCost: 22,
        power: 52
      },
      {
        level: 2,
        requiredLevel: 42,
        spCost: 4000,
        mpCost: 22,
        power: 55
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 6500,
        mpCost: 23,
        power: 58
      },
      {
        level: 4,
        requiredLevel: 46,
        spCost: 10000,
        mpCost: 23,
        power: 61
      },
      {
        level: 5,
        requiredLevel: 48,
        spCost: 16000,
        mpCost: 24,
        power: 64
      },
      {
        level: 6,
        requiredLevel: 50,
        spCost: 25000,
        mpCost: 24,
        power: 67
      },
      {
        level: 7,
        requiredLevel: 52,
        spCost: 40000,
        mpCost: 25,
        power: 70
      },
      {
        level: 8,
        requiredLevel: 54,
        spCost: 65000,
        mpCost: 25,
        power: 73
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 105000,
        mpCost: 26,
        power: 76
      },
      {
        level: 10,
        requiredLevel: 58,
        spCost: 170000,
        mpCost: 26,
        power: 79
      },
      {
        level: 11,
        requiredLevel: 60,
        spCost: 270000,
        mpCost: 27,
        power: 82
      },
      {
        level: 12,
        requiredLevel: 62,
        spCost: 420000,
        mpCost: 27,
        power: 85
      },
      {
        level: 13,
        requiredLevel: 64,
        spCost: 650000,
        mpCost: 28,
        power: 88
      },
      {
        level: 14,
        requiredLevel: 66,
        spCost: 1000000,
        mpCost: 28,
        power: 91
      },
      {
        level: 15,
        requiredLevel: 68,
        spCost: 1450000,
        mpCost: 29,
        power: 94
      },
      {
        level: 16,
        requiredLevel: 70,
        spCost: 2000000,
        mpCost: 29,
        power: 97
      },
      {
        level: 17,
        requiredLevel: 72,
        spCost: 2600000,
        mpCost: 30,
        power: 100
      },
      {
        level: 18,
        requiredLevel: 73,
        spCost: 3200000,
        mpCost: 30,
        power: 103
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 3900000,
        mpCost: 31,
        power: 106
      },
      {
        level: 20,
        requiredLevel: 75,
        spCost: 4600000,
        mpCost: 31,
        power: 108
      },
      {
        level: 21,
        requiredLevel: 76,
        spCost: 5500000,
        mpCost: 32,
        power: 110
      }
    ],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false
  },
  {
    battleId: "l2_1532",
    l2SkillId: 1532,
    minLevel: 79,
    spCost: 32000000,
    nameUk: "Просвітлення",
    hintUk: "Підвищує духовні параметри.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "human_archmage",
      "human_hierophant"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 79,
        spCost: 32000000,
        mpCost: 73,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mAtk",
        mode: "percent",
        value: 10
      },
      {
        stat: "hpRegen",
        mode: "percent",
        value: 40
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: 50
      },
      {
        stat: "skillCritRate",
        mode: "percent",
        value: 50
      },
      {
        stat: "mpRegen",
        mode: "percent",
        value: 90
      }
    ],
    cooldownSec: 150,
    skipMobHp: true
  }
];

/** Усі l2 id скілів мага, що можуть бути «дією» в бою (не пасивки). */
export const HUMAN_MYSTIC_ACTIVE_L2_IDS: readonly number[] = [336, 337, 338, 1011, 1012, 1015, 1016, 1018, 1020, 1027, 1028, 1031, 1032, 1033, 1034, 1035, 1036, 1040, 1042, 1043, 1044, 1045, 1048, 1049, 1056, 1062, 1064, 1068, 1069, 1072, 1073, 1074, 1075, 1077, 1078, 1083, 1085, 1086, 1126, 1127, 1129, 1144, 1147, 1148, 1151, 1154, 1155, 1156, 1157, 1159, 1160, 1163, 1164, 1167, 1168, 1169, 1170, 1171, 1172, 1177, 1181, 1182, 1184, 1189, 1191, 1201, 1204, 1216, 1217, 1218, 1219, 1220, 1222, 1225, 1230, 1231, 1232, 1233, 1234, 1240, 1242, 1243, 1254, 1258, 1262, 1263, 1269, 1271, 1272, 1274, 1275, 1285, 1288, 1289, 1292, 1296, 1298, 1299, 1307, 1311, 1331, 1334, 1335, 1336, 1337, 1338, 1339, 1343, 1344, 1345, 1346, 1349, 1350, 1351, 1352, 1353, 1356, 1358, 1359, 1360, 1361, 1388, 1389, 1410, 1453, 1532];
