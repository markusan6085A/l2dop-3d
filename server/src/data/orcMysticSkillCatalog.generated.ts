/**
 * Автоген з text-rpg OrcMystic (`npm run gen:om-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const ORC_MYSTIC_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
  {
    battleId: "l2_72",
    l2SkillId: 72,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Гімн захисту",
    hintUk: "Груповий гімн: суттєво підвищує P. Def і M. Def союзникам.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 300,
        power: 40
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent",
        value: 40
      },
      {
        stat: "mDef",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 80,
    skipMobHp: true
  },
  {
    battleId: "l2_100",
    l2SkillId: 100,
    minLevel: 20,
    spCost: 960,
    nameUk: "Удар духовної сили",
    hintUk: "Фізичний удар духовною силою; тимчасово підсилює стійкість до оглушення.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 960,
        mpCost: 22,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 960,
        mpCost: 22,
        power: 33
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 960,
        mpCost: 22,
        power: 35
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 1900,
        mpCost: 23,
        power: 41
      },
      {
        level: 5,
        requiredLevel: 25,
        spCost: 1900,
        mpCost: 24,
        power: 44
      },
      {
        level: 6,
        requiredLevel: 25,
        spCost: 1900,
        mpCost: 25,
        power: 48
      },
      {
        level: 7,
        requiredLevel: 30,
        spCost: 3500,
        mpCost: 27,
        power: 55
      },
      {
        level: 8,
        requiredLevel: 30,
        spCost: 3500,
        mpCost: 29,
        power: 59
      },
      {
        level: 9,
        requiredLevel: 30,
        spCost: 3500,
        mpCost: 30,
        power: 64
      },
      {
        level: 10,
        requiredLevel: 35,
        spCost: 5900,
        mpCost: 31,
        power: 73
      },
      {
        level: 11,
        requiredLevel: 35,
        spCost: 5900,
        mpCost: 31,
        power: 79
      },
      {
        level: 12,
        requiredLevel: 35,
        spCost: 5900,
        mpCost: 33,
        power: 84
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 13,
    skipMobHp: false
  },
  {
    battleId: "l2_141",
    l2SkillId: 141,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Майстерність легкої броні",
    hintUk: "Пасив: підвищує захист і швидкість читання заклинань у відповідній броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 16
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 17
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 18
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 20
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 21
      },
      {
        level: 15,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 22
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 25
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 26
      },
      {
        level: 18,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 0,
        power: 28
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 0,
        power: 31
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 0,
        power: 33
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 0,
        power: 34
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
        power: 39
      },
      {
        level: 24,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 0,
        power: 41
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 78000,
        mpCost: 0,
        power: 43
      },
      {
        level: 26,
        requiredLevel: 58,
        spCost: 78000,
        mpCost: 0,
        power: 45
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 100000,
        mpCost: 0,
        power: 47
      },
      {
        level: 28,
        requiredLevel: 60,
        spCost: 100000,
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
        spCost: 160000,
        mpCost: 0,
        power: 55
      },
      {
        level: 32,
        requiredLevel: 64,
        spCost: 160000,
        mpCost: 0,
        power: 57
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 59
      },
      {
        level: 34,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 62
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 280000,
        mpCost: 0,
        power: 64
      },
      {
        level: 36,
        requiredLevel: 68,
        spCost: 280000,
        mpCost: 0,
        power: 66
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 68
      },
      {
        level: 38,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 70
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 0,
        power: 72
      },
      {
        level: 40,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 0,
        power: 75
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 770000,
        mpCost: 0,
        power: 77
      },
      {
        level: 42,
        requiredLevel: 74,
        spCost: 770000,
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
    battleId: "l2_146",
    l2SkillId: 146,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Антимагія",
    hintUk: "Пасив: підвищує опір магічній шкоді (M. Def).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 13,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 40
      },
      {
        level: 14,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 42
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 0,
        power: 43
      },
      {
        level: 16,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 46
      },
      {
        level: 17,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 0,
        power: 47
      },
      {
        level: 18,
        requiredLevel: 44,
        spCost: 12000,
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
        spCost: 32000,
        mpCost: 0,
        power: 59
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 0,
        power: 61
      },
      {
        level: 24,
        requiredLevel: 52,
        spCost: 32000,
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
        spCost: 78000,
        mpCost: 0,
        power: 72
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 78000,
        mpCost: 0,
        power: 74
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 100000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 100000,
        mpCost: 0,
        power: 78
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 80
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 0,
        power: 82
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 160000,
        mpCost: 0,
        power: 84
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 160000,
        mpCost: 0,
        power: 86
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 88
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 0,
        power: 91
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 280000,
        mpCost: 0,
        power: 93
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 280000,
        mpCost: 0,
        power: 95
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 97
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 0,
        power: 99
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 0,
        power: 102
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 0,
        power: 104
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 770000,
        mpCost: 0,
        power: 106
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 770000,
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
    battleId: "l2_164",
    l2SkillId: 164,
    minLevel: 20,
    spCost: 3300,
    nameUk: "Швидке відновлення",
    hintUk: "Пасив: швидше відновлення після використання активних умінь.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 3300,
        mpCost: 0,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 12000,
        mpCost: 0,
        power: 0
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
    battleId: "l2_211",
    l2SkillId: 211,
    minLevel: 40,
    spCost: 22000,
    nameUk: "Підсилення HP",
    hintUk: "Пасив: збільшує максимум HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 0,
        power: 60
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 0,
        power: 100
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 0,
        power: 150
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 0,
        power: 200
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 67000,
        mpCost: 0,
        power: 250
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "flat"
      }
    ],
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
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 0,
        power: 1
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
    spCost: 2900,
    nameUk: "Підсилення мани",
    hintUk: "Пасив: збільшує максимум MP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 0,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 0,
        power: 50
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
    battleId: "l2_228",
    l2SkillId: 228,
    minLevel: 25,
    spCost: 5800,
    nameUk: "Швидке зачарування",
    hintUk: "Пасив: скорочує час читання заклинань.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 0,
        power: 5
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent",
        value: 5
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_229",
    l2SkillId: 229,
    minLevel: 25,
    spCost: 5800,
    nameUk: "Швидке відновлення MP",
    hintUk: "Пасив: швидше відновлення MP у бою.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 0,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 0,
        power: 1
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
    battleId: "l2_231",
    l2SkillId: 231,
    minLevel: 20,
    spCost: 1400,
    nameUk: "Майстерність мантії",
    hintUk: "Пасив: майстерність мантії — бонус до P. Def і швидкості касту.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 15
      },
      {
        level: 4,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 17
      },
      {
        level: 5,
        requiredLevel: 25,
        spCost: 2900,
        mpCost: 0,
        power: 19
      },
      {
        level: 6,
        requiredLevel: 25,
        spCost: 2900,
        mpCost: 0,
        power: 21
      },
      {
        level: 7,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 23
      },
      {
        level: 8,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 25
      },
      {
        level: 9,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 28
      },
      {
        level: 10,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 30
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
        value: 71
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: 25
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
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 5,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 20
      },
      {
        level: 6,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 23
      },
      {
        level: 7,
        requiredLevel: 25,
        spCost: 2900,
        mpCost: 0,
        power: 26
      },
      {
        level: 8,
        requiredLevel: 25,
        spCost: 2900,
        mpCost: 0,
        power: 29
      },
      {
        level: 9,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 32
      },
      {
        level: 10,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 35
      },
      {
        level: 11,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 39
      },
      {
        level: 12,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 42
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
    battleId: "l2_236",
    l2SkillId: 236,
    minLevel: 20,
    spCost: 1400,
    nameUk: "Майстерність легкої броні",
    hintUk: "Пасив: кращі бонуси в легкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 5,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 21
      },
      {
        level: 6,
        requiredLevel: 20,
        spCost: 1400,
        mpCost: 0,
        power: 23
      },
      {
        level: 7,
        requiredLevel: 25,
        spCost: 2900,
        mpCost: 0,
        power: 25
      },
      {
        level: 8,
        requiredLevel: 25,
        spCost: 2900,
        mpCost: 0,
        power: 27
      },
      {
        level: 9,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 30
      },
      {
        level: 10,
        requiredLevel: 30,
        spCost: 5300,
        mpCost: 0,
        power: 32
      },
      {
        level: 11,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 36
      },
      {
        level: 12,
        requiredLevel: 35,
        spCost: 8800,
        mpCost: 0,
        power: 39
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
        value: 90
      },
      {
        stat: "atkSpeed",
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
    battleId: "l2_260",
    l2SkillId: 260,
    minLevel: 40,
    spCost: 9000,
    nameUk: "Звуковий удар",
    hintUk: "Потужний фізичний удар; тимчасово підсилює стійкість до оглушення.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_overlord",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 40,
        power: 123
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 41,
        power: 131
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 9000,
        mpCost: 43,
        power: 139
      },
      {
        level: 4,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 43,
        power: 148
      },
      {
        level: 5,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 44,
        power: 157
      },
      {
        level: 6,
        requiredLevel: 44,
        spCost: 12000,
        mpCost: 45,
        power: 166
      },
      {
        level: 7,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 47,
        power: 175
      },
      {
        level: 8,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 48,
        power: 185
      },
      {
        level: 9,
        requiredLevel: 48,
        spCost: 21000,
        mpCost: 49,
        power: 196
      },
      {
        level: 10,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 51,
        power: 206
      },
      {
        level: 11,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 52,
        power: 217
      },
      {
        level: 12,
        requiredLevel: 52,
        spCost: 32000,
        mpCost: 54,
        power: 229
      },
      {
        level: 13,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 55,
        power: 241
      },
      {
        level: 14,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 55,
        power: 253
      },
      {
        level: 15,
        requiredLevel: 56,
        spCost: 35000,
        mpCost: 56,
        power: 266
      },
      {
        level: 16,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 58,
        power: 279
      },
      {
        level: 17,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 59,
        power: 292
      },
      {
        level: 18,
        requiredLevel: 58,
        spCost: 52000,
        mpCost: 61,
        power: 306
      },
      {
        level: 19,
        requiredLevel: 60,
        spCost: 67000,
        mpCost: 62,
        power: 320
      },
      {
        level: 20,
        requiredLevel: 60,
        spCost: 67000,
        mpCost: 63,
        power: 334
      },
      {
        level: 21,
        requiredLevel: 60,
        spCost: 67000,
        mpCost: 65,
        power: 349
      },
      {
        level: 22,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 66,
        power: 364
      },
      {
        level: 23,
        requiredLevel: 62,
        spCost: 150000,
        mpCost: 68,
        power: 379
      },
      {
        level: 24,
        requiredLevel: 64,
        spCost: 160000,
        mpCost: 68,
        power: 395
      },
      {
        level: 25,
        requiredLevel: 64,
        spCost: 160000,
        mpCost: 69,
        power: 410
      },
      {
        level: 26,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 70,
        power: 426
      },
      {
        level: 27,
        requiredLevel: 66,
        spCost: 250000,
        mpCost: 72,
        power: 443
      },
      {
        level: 28,
        requiredLevel: 68,
        spCost: 280000,
        mpCost: 73,
        power: 459
      },
      {
        level: 29,
        requiredLevel: 68,
        spCost: 280000,
        mpCost: 74,
        power: 475
      },
      {
        level: 30,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 75,
        power: 492
      },
      {
        level: 31,
        requiredLevel: 70,
        spCost: 360000,
        mpCost: 77,
        power: 509
      },
      {
        level: 32,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 78,
        power: 526
      },
      {
        level: 33,
        requiredLevel: 72,
        spCost: 540000,
        mpCost: 79,
        power: 542
      },
      {
        level: 34,
        requiredLevel: 74,
        spCost: 770000,
        mpCost: 80,
        power: 559
      },
      {
        level: 35,
        requiredLevel: 74,
        spCost: 770000,
        mpCost: 81,
        power: 576
      }
    ],
    effects: [
      {
        stat: "stunResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 13,
    skipMobHp: false
  },
  {
    battleId: "l2_328",
    l2SkillId: 328,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Мудрість",
    hintUk: "Пасив: підвищує WIT.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 0,
        power: 20
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
      "orc_dominator",
      "orc_doomcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 0,
        power: 20
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
    skipMobHp: true
  },
  {
    battleId: "l2_331",
    l2SkillId: 331,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Майстерність умінь",
    hintUk: "Пасив: підвищує майстерність умінь (Skill Mastery).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
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
    battleId: "l2_336",
    l2SkillId: 336,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Таємна мудрість",
    hintUk: "Пасив: прихований бонус до WIT.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_doomcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 36,
        power: 30
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
    battleId: "l2_337",
    l2SkillId: 337,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Таємна сила",
    hintUk: "Пасив: прихований бонус до STR.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_dominator"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 36,
        power: 30
      }
    ],
    effects: [
      {
        stat: "mAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1001",
    l2SkillId: 1001,
    minLevel: 1,
    spCost: 0,
    nameUk: "Підсилення вітру",
    hintUk: "Підсилення вітру",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 2,
        power: 4
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 1800,
        mpCost: 3,
        power: 14
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "flat",
        value: 4
      }
    ],
    cooldownSec: 40,
    skipMobHp: true
  },
  {
    battleId: "l2_1002",
    l2SkillId: 1002,
    minLevel: 44,
    spCost: 37000,
    nameUk: "Підсилення полум’я",
    hintUk: "Підсилення полум’я",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 154,
        power: 23
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 204,
        power: 30
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent",
        value: 15
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1003",
    l2SkillId: 1003,
    minLevel: 30,
    spCost: 11000,
    nameUk: "Гімн атаки",
    hintUk: "Гімн: тимчасово підвищує фізичну атаку союзників.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 105,
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
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1004",
    l2SkillId: 1004,
    minLevel: 40,
    spCost: 22000,
    nameUk: "Підсилення вогню",
    hintUk: "Підсилення вогню",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 139,
        power: 15
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 172,
        power: 23
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent",
        value: 15
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1005",
    l2SkillId: 1005,
    minLevel: 35,
    spCost: 18000,
    nameUk: "Підсилення вогню",
    hintUk: "Підсилення вогню",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 120,
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
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1006",
    l2SkillId: 1006,
    minLevel: 40,
    spCost: 27000,
    nameUk: "Підсилення вітру",
    hintUk: "Підсилення вітру",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 27000,
        mpCost: 139,
        power: 23
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 188,
        power: 30
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent",
        value: 15
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1007",
    l2SkillId: 1007,
    minLevel: 14,
    spCost: 1800,
    nameUk: "Підсилення землі",
    hintUk: "Підсилення землі",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 14,
        spCost: 1800,
        mpCost: 60,
        power: 8
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent",
        value: 20
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: 10
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1008",
    l2SkillId: 1008,
    minLevel: 40,
    spCost: 22000,
    nameUk: "Підсилення води",
    hintUk: "Підсилення води",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 139,
        power: 15
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 172,
        power: 23
      }
    ],
    effects: [
      {
        stat: "mDef",
        mode: "percent",
        value: 15
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1009",
    l2SkillId: 1009,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Підсилення духу",
    hintUk: "Підсилення духу",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 77,
        power: 8
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 105,
        power: 12
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
        value: 15
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1010",
    l2SkillId: 1010,
    minLevel: 25,
    spCost: 5800,
    nameUk: "Чари вогню",
    hintUk: "Пасив: підсилює вогняні заклинання.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 23,
        power: 12
      },
      {
        level: 3,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 30,
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
    cooldownSec: 5,
    skipMobHp: true
  },
  {
    battleId: "l2_1090",
    l2SkillId: 1090,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Крок вітру",
    hintUk: "Підвищує швидкість пересування (крок вітру).",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 39,
        power: 26
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 44,
        power: 32
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 53,
        power: 38
      },
      {
        level: 6,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 60,
        power: 44
      }
    ],
    effects: [
      {
        stat: "vampirism",
        mode: "percent",
        value: 80
      }
    ],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1092",
    l2SkillId: 1092,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Швидке відновлення MP",
    hintUk: "Прискорює відновлення MP.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 20,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 23,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 27,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 30,
        power: 0
      }
    ],
    effects: [
      {
        stat: "fearResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1095",
    l2SkillId: 1095,
    minLevel: 7,
    spCost: 520,
    nameUk: "Дух вовка",
    hintUk: "Дух вовка: баф союзникам.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 520,
        mpCost: 10,
        power: 40
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 1800,
        mpCost: 15,
        power: 60
      }
    ],
    effects: [
      {
        stat: "poisonResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 12,
    skipMobHp: true
  },
  {
    battleId: "l2_1096",
    l2SkillId: 1096,
    minLevel: 30,
    spCost: 11000,
    nameUk: "Дух лева",
    hintUk: "Дух лева: баф союзникам.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 20,
        power: 12
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 23,
        power: 12
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1097",
    l2SkillId: 1097,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Дух медведя",
    hintUk: "Дух ведмедя: баф союзникам.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 20,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 23,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 27,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 30,
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
    battleId: "l2_1099",
    l2SkillId: 1099,
    minLevel: 35,
    spCost: 18000,
    nameUk: "Дух кобри",
    hintUk: "Дух кобри: знижує швидкість ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 45,
        power: 30
      }
    ],
    effects: [
      {
        stat: "runSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1100",
    l2SkillId: 1100,
    minLevel: 7,
    spCost: 520,
    nameUk: "Початковий залп",
    hintUk: "Ранній магічний удар по одній цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_mage",
      "orc_overlord",
      "orc_shaman",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 520,
        mpCost: 15,
        power: 20
      },
      {
        level: 2,
        requiredLevel: 14,
        spCost: 1800,
        mpCost: 23,
        power: 30
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1101",
    l2SkillId: 1101,
    minLevel: 25,
    spCost: 5800,
    nameUk: "Дух сокола",
    hintUk: "Дух сокола: магічний удар по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 50,
        power: 44
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 68,
        power: 60
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: false
  },
  {
    battleId: "l2_1102",
    l2SkillId: 1102,
    minLevel: 25,
    spCost: 5800,
    nameUk: "Дух кабана",
    hintUk: "Дух кабана: ослаблює опір ворога.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 23,
        power: 20
      },
      {
        level: 2,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 30,
        power: 25
      }
    ],
    effects: [
      {
        stat: "mentalResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 12,
    skipMobHp: true
  },
  {
    battleId: "l2_1104",
    l2SkillId: 1104,
    minLevel: 1,
    spCost: 0,
    nameUk: "Сповільнення атаки",
    hintUk: "Знижує швидкість атаки ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [],
    effects: [
      {
        stat: "atkSpeed",
        mode: "percent"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1105",
    l2SkillId: 1105,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Дух кабана",
    hintUk: "Дух кабана: дебаф на площі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 20,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 23,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 27,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 30,
        power: 0
      }
    ],
    effects: [
      {
        stat: "mentalResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 40,
    skipMobHp: true
  },
  {
    battleId: "l2_1107",
    l2SkillId: 1107,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Дух сокола",
    hintUk: "Дух сокола: додатковий магічний удар.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 29,
        power: 44
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 40,
        power: 60
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1108",
    l2SkillId: 1108,
    minLevel: 48,
    spCost: 40000,
    nameUk: "Руйнівний залп",
    hintUk: "Сильний магічний удар по одній цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 97,
        power: 77
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: false
  },
  {
    battleId: "l2_1208",
    l2SkillId: 1208,
    minLevel: 25,
    spCost: 5800,
    nameUk: "Прокляття слабкості",
    hintUk: "Прокляття слабкості",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 25,
        spCost: 5800,
        mpCost: 34,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 40,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 35,
        spCost: 18000,
        mpCost: 45,
        power: 0
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1209",
    l2SkillId: 1209,
    minLevel: 20,
    spCost: 2900,
    nameUk: "Прокляття отрути",
    hintUk: "Прокляття отрути",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_shaman"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 2900,
        mpCost: 29,
        power: 90
      },
      {
        level: 2,
        requiredLevel: 30,
        spCost: 11000,
        mpCost: 40,
        power: 120
      }
    ],
    effects: [
      {
        stat: "poisonResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1210",
    l2SkillId: 1210,
    minLevel: 44,
    spCost: 28000,
    nameUk: "Прокляття кровотечі",
    hintUk: "Прокляття кровотечі",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 59,
        power: 35
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 70,
        power: 40
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1213",
    l2SkillId: 1213,
    minLevel: 44,
    spCost: 28000,
    nameUk: "Прокляття страху",
    hintUk: "Прокляття страху",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 59,
        power: 20
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 65,
        power: 20
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 70,
        power: 20
      }
    ],
    effects: [
      {
        stat: "mentalResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1229",
    l2SkillId: 1229,
    minLevel: 25,
    spCost: 12000,
    nameUk: "Гімн відновлення",
    hintUk: "Гімн: прискорює відновлення HP союзників.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 5,
        requiredLevel: 25,
        spCost: 12000,
        mpCost: 50,
        power: 20
      },
      {
        level: 6,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 134,
        power: 31
      },
      {
        level: 7,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 152,
        power: 35
      },
      {
        level: 8,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 164,
        power: 39
      },
      {
        level: 9,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 180,
        power: 43
      },
      {
        level: 10,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 189,
        power: 45
      },
      {
        level: 11,
        requiredLevel: 60,
        spCost: 200000,
        mpCost: 195,
        power: 46
      },
      {
        level: 12,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 199,
        power: 48
      },
      {
        level: 13,
        requiredLevel: 64,
        spCost: 320000,
        mpCost: 207,
        power: 50
      },
      {
        level: 14,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 214,
        power: 52
      },
      {
        level: 15,
        requiredLevel: 68,
        spCost: 550000,
        mpCost: 222,
        power: 53
      },
      {
        level: 16,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 228,
        power: 55
      },
      {
        level: 17,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 233,
        power: 56
      },
      {
        level: 18,
        requiredLevel: 74,
        spCost: 1500000,
        mpCost: 239,
        power: 58
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: 50,
    skipMobHp: true
  },
  {
    battleId: "l2_1244",
    l2SkillId: 1244,
    minLevel: 40,
    spCost: 27000,
    nameUk: "Залякування",
    hintUk: "Деморалізує ворогів перед атакою.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 27000,
        mpCost: 53,
        power: 77
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 70,
        power: 94
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 320000,
        mpCost: 89,
        power: 108
      },
      {
        level: 4,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 100,
        power: 118
      }
    ],
    effects: [],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1245",
    l2SkillId: 1245,
    minLevel: 40,
    spCost: 27000,
    nameUk: "Перемога",
    hintUk: "Перемога",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "orc_dominator",
      "orc_doomcryer",
      "orc_overlord",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 27000,
        mpCost: 70,
        power: 52
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 78,
        power: 58
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 87,
        power: 65
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 94,
        power: 72
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 103,
        power: 78
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 107,
        power: 82
      },
      {
        level: 7,
        requiredLevel: 60,
        spCost: 200000,
        mpCost: 110,
        power: 85
      },
      {
        level: 8,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 115,
        power: 89
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 320000,
        mpCost: 119,
        power: 92
      },
      {
        level: 10,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 123,
        power: 96
      },
      {
        level: 11,
        requiredLevel: 68,
        spCost: 550000,
        mpCost: 127,
        power: 99
      },
      {
        level: 12,
        requiredLevel: 70,
        spCost: 720000,
        mpCost: 130,
        power: 102
      },
      {
        level: 13,
        requiredLevel: 72,
        spCost: 1100000,
        mpCost: 133,
        power: 105
      },
      {
        level: 14,
        requiredLevel: 74,
        spCost: 1500000,
        mpCost: 137,
        power: 108
      }
    ],
    effects: [
      {
        stat: "vampirism",
        mode: "percent",
        value: 80
      }
    ],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1246",
    l2SkillId: 1246,
    minLevel: 48,
    spCost: 40000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 65,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [
      {
        stat: "debuffResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1247",
    l2SkillId: 1247,
    minLevel: 40,
    spCost: 22000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 53,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 59,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 65,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 70,
        power: 0
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1248",
    l2SkillId: 1248,
    minLevel: 48,
    spCost: 40000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 65,
        power: 200
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 70,
        power: 200
      }
    ],
    effects: [
      {
        stat: "cooldownReduction",
        mode: "percent"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1249",
    l2SkillId: 1249,
    minLevel: 44,
    spCost: 28000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 154,
        power: 2
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 188,
        power: 3
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat",
        value: 2
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1250",
    l2SkillId: 1250,
    minLevel: 40,
    spCost: 22000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 139,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 172,
        power: 40
      }
    ],
    effects: [
      {
        stat: "shieldBlockRate",
        mode: "percent",
        value: 30
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1251",
    l2SkillId: 1251,
    minLevel: 20,
    spCost: 9000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 9000,
        mpCost: 40,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 204,
        power: 1
      }
    ],
    effects: [
      {
        stat: "atkSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 45,
    skipMobHp: true
  },
  {
    battleId: "l2_1252",
    l2SkillId: 1252,
    minLevel: 40,
    spCost: 27000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 27000,
        mpCost: 139,
        power: 2
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 172,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 204,
        power: 4
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1253",
    l2SkillId: 1253,
    minLevel: 56,
    spCost: 110000,
    nameUk: "Покликання слуги",
    hintUk: "Покликання слуги",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 56,
        spCost: 110000,
        mpCost: 204,
        power: 15
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent",
        value: 15
      }
    ],
    cooldownSec: 55,
    skipMobHp: true
  },
  {
    battleId: "l2_1256",
    l2SkillId: 1256,
    minLevel: 44,
    spCost: 28000,
    nameUk: "Покликання слуги",
    hintUk: "Викликає слугу певного типу.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 134,
        power: 31
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 152,
        power: 35
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 164,
        power: 39
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "flat",
        value: 31
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1260",
    l2SkillId: 1260,
    minLevel: 40,
    spCost: 22000,
    nameUk: "Покликання слуги",
    hintUk: "Викликає слугу (пісня виклику).",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 22000,
        mpCost: 139,
        power: 2
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 172,
        power: 3
      }
    ],
    effects: [
      {
        stat: "evasion",
        mode: "flat",
        value: 2
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1261",
    l2SkillId: 1261,
    minLevel: 44,
    spCost: 28000,
    nameUk: "Покликання слуги",
    hintUk: "Викликає слугу (пісня виклику).",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 154,
        power: 5
      },
      {
        level: 2,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 188,
        power: 8
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "percent",
        value: 5
      },
      {
        stat: "mAtk",
        mode: "percent",
        value: 5
      },
      {
        stat: "atkSpeed",
        mode: "percent",
        value: 5
      },
      {
        stat: "castSpeed",
        mode: "percent",
        value: 5
      },
      {
        stat: "runSpeed",
        mode: "flat",
        value: 5
      },
      {
        stat: "pDef",
        mode: "percent"
      },
      {
        stat: "mDef",
        mode: "percent"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1268",
    l2SkillId: 1268,
    minLevel: 52,
    spCost: 95000,
    nameUk: "Бойовий гімн",
    hintUk: "Бойовий гімн: баф групі.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 52,
        spCost: 95000,
        mpCost: 188,
        power: 20
      }
    ],
    effects: [
      {
        stat: "windResist",
        mode: "flat",
        value: 20
      }
    ],
    cooldownSec: 70,
    skipMobHp: true
  },
  {
    battleId: "l2_1283",
    l2SkillId: 1283,
    minLevel: 44,
    spCost: 28000,
    nameUk: "Покликання слуги",
    hintUk: "Викликає слугу через пісню.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "orc_dominator",
      "orc_overlord"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 28000,
        mpCost: 8,
        power: 293
      },
      {
        level: 2,
        requiredLevel: 48,
        spCost: 40000,
        mpCost: 9,
        power: 333
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 65000,
        mpCost: 10,
        power: 375
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "flat",
        value: 293
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1284",
    l2SkillId: 1284,
    minLevel: 62,
    spCost: 310000,
    nameUk: "Пісня вітру",
    hintUk: "Пісня вітру: баф або удар вітром.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 62,
        spCost: 310000,
        mpCost: 229,
        power: 10
      },
      {
        level: 2,
        requiredLevel: 68,
        spCost: 550000,
        mpCost: 252,
        power: 15
      },
      {
        level: 3,
        requiredLevel: 74,
        spCost: 1500000,
        mpCost: 272,
        power: 20
      }
    ],
    effects: [
      {
        stat: "reflect",
        mode: "percent"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1306",
    l2SkillId: 1306,
    minLevel: 30,
    spCost: 15000,
    nameUk: "Пісня землі",
    hintUk: "Пісня землі: підвищує стійкість до вогню.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 30,
        spCost: 15000,
        mpCost: 60,
        power: 20
      }
    ],
    effects: [
      {
        stat: "fireResist",
        mode: "flat",
        value: 20
      }
    ],
    cooldownSec: 60,
    skipMobHp: true
  },
  {
    battleId: "l2_1307",
    l2SkillId: 1307,
    minLevel: 68,
    spCost: 550000,
    nameUk: "Пісня води",
    hintUk: "Пісня води: підвищує стійкість до води.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 68,
        spCost: 550000,
        mpCost: 252,
        power: 20
      }
    ],
    effects: [
      {
        stat: "waterResist",
        mode: "flat",
        value: 20
      }
    ],
    cooldownSec: 70,
    skipMobHp: true
  },
  {
    battleId: "l2_1308",
    l2SkillId: 1308,
    minLevel: 48,
    spCost: 63000,
    nameUk: "Пісня вогню",
    hintUk: "Пісня вогню: шанс критичного удару та стійкість до вогню.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 172,
        power: 20
      },
      {
        level: 2,
        requiredLevel: 60,
        spCost: 200000,
        mpCost: 220,
        power: 25
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 550000,
        mpCost: 252,
        power: 30
      }
    ],
    effects: [
      {
        stat: "critRate",
        mode: "percent"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1309",
    l2SkillId: 1309,
    minLevel: 48,
    spCost: 63000,
    nameUk: "Пісня вітру",
    hintUk: "Пісня вітру: підвищує точність.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 172,
        power: 2
      },
      {
        level: 2,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 213,
        power: 3
      },
      {
        level: 3,
        requiredLevel: 64,
        spCost: 320000,
        mpCost: 237,
        power: 4
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1310",
    l2SkillId: 1310,
    minLevel: 44,
    spCost: 37000,
    nameUk: "Пісня вогню",
    hintUk: "Пісня вогню: вампіризм (крадіжка HP у вигляді відсотка від урону).",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 44,
        spCost: 37000,
        mpCost: 154,
        power: 6
      },
      {
        level: 2,
        requiredLevel: 58,
        spCost: 160000,
        mpCost: 213,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 66,
        spCost: 500000,
        mpCost: 244,
        power: 8
      },
      {
        level: 4,
        requiredLevel: 74,
        spCost: 1500000,
        mpCost: 272,
        power: 9
      }
    ],
    effects: [
      {
        stat: "vampirism",
        mode: "percent"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1311",
    l2SkillId: 1311,
    minLevel: 48,
    spCost: 63000,
    nameUk: "Пісня вітру",
    hintUk: "Пісня вітру: бонус до сили.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 48,
        spCost: 63000,
        mpCost: 172,
        power: 3
      }
    ],
    effects: [
      {
        stat: "str",
        mode: "flat",
        value: 3
      }
    ],
    cooldownSec: 70,
    skipMobHp: true
  },
  {
    battleId: "l2_1335",
    l2SkillId: 1335,
    minLevel: 64,
    spCost: 320000,
    nameUk: "Прокляття слабкості",
    hintUk: "Масове воскресіння союзників.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer",
      "orc_warcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 64,
        spCost: 320000,
        mpCost: 237,
        power: 30
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "percent",
        value: 30
      },
      {
        stat: "mDef",
        mode: "percent",
        value: 25
      }
    ],
    cooldownSec: 70,
    skipMobHp: true
  },
  {
    battleId: "l2_1362",
    l2SkillId: 1362,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Стійкість до скасувань",
    hintUk: "Підвищує опір скасуванням і дебафам.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 280,
        power: 30
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
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1363",
    l2SkillId: 1363,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Пісня тріумфу",
    hintUk: "Масовий потужний баф до більшості параметрів.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_doomcryer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 284,
        power: 20
      }
    ],
    effects: [
      {
        stat: "maxHp",
        mode: "multiplier"
      },
      {
        stat: "hpRegen",
        mode: "percent",
        value: 20
      },
      {
        stat: "pAtk",
        mode: "multiplier"
      },
      {
        stat: "pDef",
        mode: "multiplier"
      },
      {
        stat: "accuracy",
        mode: "flat",
        value: 4
      },
      {
        stat: "critRate",
        mode: "percent",
        value: 20
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
        stat: "critDamage",
        mode: "multiplier"
      },
      {
        stat: "mAtk",
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
        stat: "debuffResist",
        mode: "percent",
        value: 20
      }
    ],
    cooldownSec: 1200,
    skipMobHp: true
  },
  {
    battleId: "l2_1364",
    l2SkillId: 1364,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Пісня криту",
    hintUk: "Підсилює критичну шкоду союзників.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 280,
        power: 35
      }
    ],
    effects: [
      {
        stat: "critDamage",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1365",
    l2SkillId: 1365,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Пісня чарів",
    hintUk: "Підсилює магічну атаку союзників.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "orc_dominator"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 280,
        power: 75
      }
    ],
    effects: [
      {
        stat: "mAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1366",
    l2SkillId: 1366,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Прокляття знемоги",
    hintUk: "Масово знижує параметри ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 107,
        power: 40
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat"
      },
      {
        stat: "mDef",
        mode: "multiplier"
      },
      {
        stat: "pAtk",
        mode: "multiplier"
      },
      {
        stat: "atkSpeed",
        mode: "multiplier"
      },
      {
        stat: "critRate",
        mode: "flat"
      },
      {
        stat: "critDamage",
        mode: "multiplier"
      },
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 300,
    skipMobHp: true
  },
  {
    battleId: "l2_1367",
    l2SkillId: 1367,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Прокляття лікування",
    hintUk: "Знижує ефективність зцілення ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "orc_dominator"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 105,
        power: 50
      }
    ],
    effects: [
      {
        stat: "healPower",
        mode: "multiplier"
      }
    ],
    cooldownSec: 60,
    skipMobHp: true
  }
];

export const ORC_MYSTIC_ACTIVE_L2_IDS: readonly number[] = [72, 100, 260, 336, 337, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1090, 1092, 1095, 1096, 1097, 1099, 1100, 1101, 1102, 1104, 1105, 1107, 1108, 1208, 1209, 1210, 1213, 1229, 1244, 1245, 1246, 1247, 1248, 1249, 1250, 1251, 1252, 1253, 1256, 1260, 1261, 1268, 1283, 1284, 1306, 1307, 1308, 1309, 1310, 1311, 1335, 1362, 1363, 1364, 1365, 1366, 1367];
