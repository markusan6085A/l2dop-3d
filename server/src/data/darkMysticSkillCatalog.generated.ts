/**
 * Автоген з text-rpg DarkMystic (`npm run gen:dm-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const DARK_MYSTIC_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
        stat: "attackSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_146",
    l2SkillId: 146,
    minLevel: 1,
    spCost: 0,
    nameUk: "Антимагія",
    hintUk: "Пасив: підвищує опір магічній шкоді (M. Def).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
        stat: "castSpeed",
        mode: "multiplier"
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
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
    battleId: "l2_194",
    l2SkillId: 194,
    minLevel: 1,
    spCost: 0,
    nameUk: "Удача",
    hintUk: "Пасив: впливає на якість випадіння луту з ворогів.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
    minLevel: 1,
    spCost: 0,
    nameUk: "Швидке відновлення HP",
    hintUk: "Пасив: прискорює відновлення HP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    minLevel: 40,
    spCost: 39000,
    nameUk: "Підсилення мани",
    hintUk: "Пасив: збільшує максимум MP.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 0,
        power: 70
      },
      {
        level: 4,
        requiredLevel: 48,
        spCost: 85000,
        mpCost: 0,
        power: 100
      },
      {
        level: 5,
        requiredLevel: 56,
        spCost: 140000,
        mpCost: 0,
        power: 140
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 250000,
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
        spCost: 1400000,
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
        stat: "mpRegen",
        mode: "multiplier"
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
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
      },
      {
        level: 3,
        requiredLevel: 45,
        spCost: 50000,
        mpCost: 0,
        power: 1
      }
    ],
    effects: [
      {
        stat: "castSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_229",
    l2SkillId: 229,
    minLevel: 44,
    spCost: 43000,
    nameUk: "Швидке відновлення MP",
    hintUk: "Пасив: швидше відновлення MP у бою.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 44,
        spCost: 43000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 52,
        spCost: 110000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 60,
        spCost: 250000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 68,
        spCost: 700000,
        mpCost: 0,
        power: 3
      },
      {
        level: 7,
        requiredLevel: 74,
        spCost: 2100000,
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
    minLevel: 1,
    spCost: 0,
    nameUk: "Майстерність мантії",
    hintUk: "Пасив: кращі бонуси в мантії.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    spCost: 13000,
    nameUk: "Майстерність мантії",
    hintUk: "Пасив: кращі бонуси в мантії.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 26
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 27
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 28
      },
      {
        level: 12,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 31
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 32
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 34
      },
      {
        level: 15,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 37
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 38
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 40
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 43
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 44
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 46
      },
      {
        level: 21,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 53
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 0,
        power: 54
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 0,
        power: 56
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 58
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 60
      },
      {
        level: 28,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 62
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
        power: 65
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 67
      },
      {
        level: 32,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 69
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 71
      },
      {
        level: 34,
        requiredLevel: 68,
        spCost: 350000,
        mpCost: 0,
        power: 73
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 350000,
        mpCost: 0,
        power: 75
      },
      {
        level: 36,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 77
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 79
      },
      {
        level: 38,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 81
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 83
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 85
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 87
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
    minLevel: 40,
    spCost: 13000,
    nameUk: "Майстерність легкої броні",
    hintUk: "Пасив: кращі бонуси в легкій броні.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 9,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 19
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 20
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 21
      },
      {
        level: 12,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 24
      },
      {
        level: 13,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 25
      },
      {
        level: 14,
        requiredLevel: 44,
        spCost: 15000,
        mpCost: 0,
        power: 26
      },
      {
        level: 15,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 28
      },
      {
        level: 16,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 29
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 31
      },
      {
        level: 18,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 33
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 34
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 36
      },
      {
        level: 21,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 38
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 40
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 41
      },
      {
        level: 24,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 0,
        power: 43
      },
      {
        level: 25,
        requiredLevel: 58,
        spCost: 92000,
        mpCost: 0,
        power: 44
      },
      {
        level: 26,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 46
      },
      {
        level: 27,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 47
      },
      {
        level: 28,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 49
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 50
      },
      {
        level: 30,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 52
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 53
      },
      {
        level: 32,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 55
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 56
      },
      {
        level: 34,
        requiredLevel: 68,
        spCost: 350000,
        mpCost: 0,
        power: 58
      },
      {
        level: 35,
        requiredLevel: 68,
        spCost: 350000,
        mpCost: 0,
        power: 59
      },
      {
        level: 36,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 61
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 63
      },
      {
        level: 38,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 64
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 66
      },
      {
        level: 40,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 68
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 69
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
    battleId: "l2_244",
    l2SkillId: 244,
    minLevel: 7,
    spCost: 470,
    nameUk: "Майстерність обладунків",
    hintUk: "Пасив: кращі бонуси в обладунках.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
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
        requiredLevel: 20,
        spCost: 3000,
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
    battleId: "l2_249",
    l2SkillId: 249,
    minLevel: 40,
    spCost: 13000,
    nameUk: "Майстерність зброї",
    hintUk: "Пасив: кращі бонуси від зброї.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 10,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 16
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 13000,
        mpCost: 0,
        power: 17
      },
      {
        level: 12,
        requiredLevel: 40,
        spCost: 13000,
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
        spCost: 29000,
        mpCost: 0,
        power: 25
      },
      {
        level: 17,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 26
      },
      {
        level: 18,
        requiredLevel: 48,
        spCost: 29000,
        mpCost: 0,
        power: 28
      },
      {
        level: 19,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 31
      },
      {
        level: 20,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 33
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 38000,
        mpCost: 0,
        power: 34
      },
      {
        level: 22,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 38
      },
      {
        level: 23,
        requiredLevel: 56,
        spCost: 48000,
        mpCost: 0,
        power: 39
      },
      {
        level: 24,
        requiredLevel: 56,
        spCost: 48000,
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
        spCost: 130000,
        mpCost: 0,
        power: 47
      },
      {
        level: 28,
        requiredLevel: 60,
        spCost: 130000,
        mpCost: 0,
        power: 49
      },
      {
        level: 29,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 51
      },
      {
        level: 30,
        requiredLevel: 62,
        spCost: 180000,
        mpCost: 0,
        power: 53
      },
      {
        level: 31,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 55
      },
      {
        level: 32,
        requiredLevel: 64,
        spCost: 240000,
        mpCost: 0,
        power: 57
      },
      {
        level: 33,
        requiredLevel: 66,
        spCost: 350000,
        mpCost: 0,
        power: 59
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
        spCost: 350000,
        mpCost: 0,
        power: 64
      },
      {
        level: 36,
        requiredLevel: 68,
        spCost: 350000,
        mpCost: 0,
        power: 66
      },
      {
        level: 37,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 68
      },
      {
        level: 38,
        requiredLevel: 70,
        spCost: 470000,
        mpCost: 0,
        power: 70
      },
      {
        level: 39,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 72
      },
      {
        level: 40,
        requiredLevel: 72,
        spCost: 680000,
        mpCost: 0,
        power: 75
      },
      {
        level: 41,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 77
      },
      {
        level: 42,
        requiredLevel: 74,
        spCost: 1000000,
        mpCost: 0,
        power: 79
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
      },
      {
        stat: "pAtk",
        mode: "multiplier"
      },
      {
        stat: "mAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_285",
    l2SkillId: 285,
    minLevel: 1,
    spCost: 0,
    nameUk: "Більший приріст мани",
    hintUk: "Пасив: більший приріст MP з рівнем.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    spCost: 10000000,
    nameUk: "Мудрість",
    hintUk: "Пасив: підвищує WIT.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master"
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
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master"
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
      "dark_elf_shillien_saint"
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
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_331",
    l2SkillId: 331,
    minLevel: 77,
    spCost: 15000000,
    nameUk: "Скіл №331",
    hintUk: "Пасив: підвищує майстерність умінь (Skill Mastery).",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_spectral_master"
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
      "dark_elf_shillien_saint"
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
        mode: "multiplier"
      }
    ],
    cooldownSec: 0,
    skipMobHp: true
  },
  {
    battleId: "l2_337",
    l2SkillId: 337,
    minLevel: 76,
    spCost: 32000000,
    nameUk: "Таємна сила",
    hintUk: "Пасив: прихований бонус до STR.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
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
    minLevel: 1,
    spCost: 0,
    nameUk: "Таємна спритність",
    hintUk: "Пасив: прихований бонус до DEX.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dark_elf_spectral_master"
    ],
    levels: [],
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 8,
        power: 3
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 3000,
        mpCost: 24,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 15000,
        mpCost: 44,
        power: 9
      }
    ],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1013",
    l2SkillId: 1013,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1013",
    hintUk: "Скіл №1013",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
    ],
    levels: [],
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
    minLevel: 1,
    spCost: 0,
    nameUk: "Воскресіння",
    hintUk: "Повертає до життя поваленого союзника.",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 120,
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
    battleId: "l2_1031",
    l2SkillId: 1031,
    minLevel: 1,
    spCost: 0,
    nameUk: "Розсіювання мерців",
    hintUk: "Розганяє нежить у зоні.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 8,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 3000,
        mpCost: 18,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 15000,
        mpCost: 31,
        power: 1
      }
    ],
    effects: [
      {
        stat: "pDef",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1064",
    l2SkillId: 1064,
    minLevel: 1,
    spCost: 0,
    nameUk: "Мовчання",
    hintUk: "Накладає німоту на ціль або зону.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "castSpeed",
        mode: "percent"
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 7,
        spCost: 470,
        mpCost: 8,
        power: 1
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 3000,
        mpCost: 16,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 15000,
        mpCost: 28,
        power: 1
      }
    ],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1069",
    l2SkillId: 1069,
    minLevel: 1,
    spCost: 0,
    nameUk: "Сон",
    hintUk: "Накладає сон на ціль.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    battleId: "l2_1074",
    l2SkillId: 1074,
    minLevel: 1,
    spCost: 0,
    nameUk: "Здача вітру",
    hintUk: "Магічний удар стихією вітру.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "windResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1078",
    l2SkillId: 1078,
    minLevel: 1,
    spCost: 0,
    nameUk: "Концентрація",
    hintUk: "Підвищує швидкість читання заклинань.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "cancel",
        mode: "flat"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1126",
    l2SkillId: 1126,
    minLevel: 1,
    spCost: 0,
    nameUk: "Перезарядка слуги",
    hintUk: "Скидає перезарядку вмінь слуги.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 12,
    skipMobHp: true
  },
  {
    battleId: "l2_1127",
    l2SkillId: 1127,
    minLevel: 1,
    spCost: 0,
    nameUk: "Зцілення слуги",
    hintUk: "Зцілює призваного слугу.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1128",
    l2SkillId: 1128,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1128",
    hintUk: "Скіл №1128",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1140",
    l2SkillId: 1140,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1140",
    hintUk: "Скіл №1140",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
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
    battleId: "l2_1146",
    l2SkillId: 1146,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1146",
    hintUk: "Скіл №1146",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1147",
    l2SkillId: 1147,
    minLevel: 1,
    spCost: 0,
    nameUk: "Вампірний дотик",
    hintUk: "Витягує HP з ворога на себе.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    minLevel: 1,
    spCost: 0,
    nameUk: "Шип смерті",
    hintUk: "Темна магічна шкода по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1151",
    l2SkillId: 1151,
    minLevel: 1,
    spCost: 0,
    nameUk: "Витяг життя з трупа",
    hintUk: "Черпає силу з трупа ворога.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
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
    category: "special",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1159",
    l2SkillId: 1159,
    minLevel: 1,
    spCost: 0,
    nameUk: "Прокляття зв’язку смерті",
    hintUk: "Прокляття зв’язку зі смертю.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1160",
    l2SkillId: 1160,
    minLevel: 1,
    spCost: 0,
    nameUk: "Сповільнення",
    hintUk: "Сповільнює рух і атаки цілі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      }
    ],
    cooldownSec: 7,
    skipMobHp: true
  },
  {
    battleId: "l2_1164",
    l2SkillId: 1164,
    minLevel: 1,
    spCost: 0,
    nameUk: "Прокляття: слабкість",
    hintUk: "Прокляття слабкості: знижує фізичну атаку.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "pAtk",
        mode: "multiplier"
      }
    ],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1167",
    l2SkillId: 1167,
    minLevel: 1,
    spCost: 0,
    nameUk: "Отруйна хмара",
    hintUk: "Хмара отрути на площі.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1168",
    l2SkillId: 1168,
    minLevel: 1,
    spCost: 0,
    nameUk: "Прокляття: отрута",
    hintUk: "Накладає отруту.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 12,
    skipMobHp: true
  },
  {
    battleId: "l2_1172",
    l2SkillId: 1172,
    minLevel: 1,
    spCost: 0,
    nameUk: "Аура полум’я",
    hintUk: "Аура вогню навколо персонажа.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 2,
    skipMobHp: false
  },
  {
    battleId: "l2_1176",
    l2SkillId: 1176,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1176",
    hintUk: "Скіл №1176",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 15,
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 7,
        power: 12
      },
      {
        level: 2,
        requiredLevel: 7,
        spCost: 240,
        mpCost: 7,
        power: 13
      },
      {
        level: 3,
        requiredLevel: 7,
        spCost: 240,
        mpCost: 8,
        power: 15
      },
      {
        level: 4,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 11,
        power: 18
      },
      {
        level: 5,
        requiredLevel: 14,
        spCost: 1100,
        mpCost: 12,
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
    minLevel: 17,
    spCost: 3200,
    nameUk: "Скіл №1178",
    hintUk: "Скіл №1178",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 17,
        spCost: 3200,
        mpCost: 18,
        power: 23
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 5800,
        mpCost: 20,
        power: 26
      },
      {
        level: 3,
        requiredLevel: 23,
        spCost: 12000,
        mpCost: 22,
        power: 29
      },
      {
        level: 4,
        requiredLevel: 25,
        spCost: 23000,
        mpCost: 23,
        power: 32
      },
      {
        level: 5,
        requiredLevel: 28,
        spCost: 39000,
        mpCost: 26,
        power: 35
      },
      {
        level: 6,
        requiredLevel: 30,
        spCost: 56000,
        mpCost: 27,
        power: 38
      },
      {
        level: 7,
        requiredLevel: 33,
        spCost: 71000,
        mpCost: 29,
        power: 42
      },
      {
        level: 8,
        requiredLevel: 35,
        spCost: 92000,
        mpCost: 30,
        power: 44
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
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
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
    battleId: "l2_1184",
    l2SkillId: 1184,
    minLevel: 1,
    spCost: 0,
    nameUk: "Крижана блискавка",
    hintUk: "Крижана блискавка по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    battleId: "l2_1201",
    l2SkillId: 1201,
    minLevel: 1,
    spCost: 0,
    nameUk: "Коріння дріади",
    hintUk: "Приковує ворогів корінням.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
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
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
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
        requiredLevel: 35,
        spCost: 23000,
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
    spCost: 39000,
    nameUk: "Повільність",
    hintUk: "Сповільнює ціль: важче пересуватися, удари слабші.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint"
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
        requiredLevel: 44,
        spCost: 43000,
        mpCost: 39,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 48,
        spCost: 85000,
        mpCost: 44,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 52,
        spCost: 110000,
        mpCost: 48,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 56,
        spCost: 140000,
        mpCost: 52,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 54,
        power: 0
      },
      {
        level: 12,
        requiredLevel: 60,
        spCost: 250000,
        mpCost: 55,
        power: 0
      },
      {
        level: 13,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 58,
        power: 0
      },
      {
        level: 14,
        requiredLevel: 64,
        spCost: 480000,
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
        spCost: 700000,
        mpCost: 64,
        power: 0
      },
      {
        level: 17,
        requiredLevel: 70,
        spCost: 940000,
        mpCost: 65,
        power: 0
      },
      {
        level: 18,
        requiredLevel: 72,
        spCost: 1400000,
        mpCost: 67,
        power: 0
      },
      {
        level: 19,
        requiredLevel: 74,
        spCost: 2100000,
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
    battleId: "l2_1208",
    l2SkillId: 1208,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1208",
    hintUk: "Скіл №1208",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1209",
    l2SkillId: 1209,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1209",
    hintUk: "Скіл №1209",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1210",
    l2SkillId: 1210,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1210",
    hintUk: "Скіл №1210",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1211",
    l2SkillId: 1211,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Скіл №1211",
    hintUk: "Скіл №1211",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 35,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 48,
        spCost: 85000,
        mpCost: 44,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 56,
        spCost: 140000,
        mpCost: 52,
        power: 0
      }
    ],
    effects: [
      {
        stat: "holdResist",
        mode: "percent",
        value: 60
      },
      {
        stat: "sleepResist",
        mode: "percent",
        value: 60
      },
      {
        stat: "fearResist",
        mode: "percent",
        value: 60
      },
      {
        stat: "mentalResist",
        mode: "percent",
        value: 60
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1213",
    l2SkillId: 1213,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1213",
    hintUk: "Скіл №1213",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1214",
    l2SkillId: 1214,
    minLevel: 40,
    spCost: 39000,
    nameUk: "Скіл №1214",
    hintUk: "Скіл №1214",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 39000,
        mpCost: 35,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 44,
        spCost: 43000,
        mpCost: 39,
        power: 0
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
    battleId: "l2_1215",
    l2SkillId: 1215,
    minLevel: 44,
    spCost: 43000,
    nameUk: "Скіл №1215",
    hintUk: "Скіл №1215",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 44,
        spCost: 43000,
        mpCost: 0,
        power: 1
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 110000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 58,
        spCost: 180000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 64,
        spCost: 480000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 74,
        spCost: 2100000,
        mpCost: 0,
        power: 2
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "percent"
      }
    ],
    cooldownSec: null,
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
      "dark_elf_dark_wizard",
      "dark_elf_mage",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_oracle",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 1,
        spCost: 0,
        mpCost: 7,
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
    minLevel: 1,
    spCost: 0,
    nameUk: "Велике зцілення",
    hintUk: "Сильне зцілення однієї цілі.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true
  },
  {
    battleId: "l2_1218",
    l2SkillId: 1218,
    minLevel: 1,
    spCost: 0,
    nameUk: "Велике бойове зцілення",
    hintUk: "Сильне бойове зцілення.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 3,
    skipMobHp: true
  },
  {
    battleId: "l2_1219",
    l2SkillId: 1219,
    minLevel: 1,
    spCost: 0,
    nameUk: "Велике групове зцілення",
    hintUk: "Сильне групове зцілення.",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 25,
    skipMobHp: true
  },
  {
    battleId: "l2_1221",
    l2SkillId: 1221,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1221",
    hintUk: "Скіл №1221",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1222",
    l2SkillId: 1222,
    minLevel: 1,
    spCost: 0,
    nameUk: "Прокляття хаосу",
    hintUk: "Прокляття хаосу на ворогів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    battleId: "l2_1223",
    l2SkillId: 1223,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1223",
    hintUk: "Скіл №1223",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
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
    battleId: "l2_1224",
    l2SkillId: 1224,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1224",
    hintUk: "Скіл №1224",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "poisonResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 8,
    skipMobHp: true
  },
  {
    battleId: "l2_1226",
    l2SkillId: 1226,
    minLevel: 52,
    spCost: 110000,
    nameUk: "Скіл №1226",
    hintUk: "Скіл №1226",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 52,
        spCost: 110000,
        mpCost: 48,
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
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1228",
    l2SkillId: 1228,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1228",
    hintUk: "Скіл №1228",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1229",
    l2SkillId: 1229,
    minLevel: 62,
    spCost: 360000,
    nameUk: "Скіл №1229",
    hintUk: "Гімн: прискорює відновлення HP союзників.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 62,
        spCost: 360000,
        mpCost: 58,
        power: 40
      },
      {
        level: 2,
        requiredLevel: 70,
        spCost: 940000,
        mpCost: 65,
        power: 60
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
  },
  {
    battleId: "l2_1234",
    l2SkillId: 1234,
    minLevel: 1,
    spCost: 0,
    nameUk: "Вампірні кігті",
    hintUk: "Вампірні кігті: крадіжка життя.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    battleId: "l2_1239",
    l2SkillId: 1239,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1239",
    hintUk: "Скіл №1239",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 6,
    skipMobHp: false
  },
  {
    battleId: "l2_1262",
    l2SkillId: 1262,
    minLevel: 1,
    spCost: 0,
    nameUk: "Покликання слуги",
    hintUk: "Викликає бойового слугу.",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: null,
    skipMobHp: true
  },
  {
    battleId: "l2_1266",
    l2SkillId: 1266,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1266",
    hintUk: "Скіл №1266",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_dark_wizard",
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master",
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 30,
    skipMobHp: false
  },
  {
    battleId: "l2_1267",
    l2SkillId: 1267,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1267",
    hintUk: "Скіл №1267",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 30,
    skipMobHp: false
  },
  {
    battleId: "l2_1268",
    l2SkillId: 1268,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1268",
    hintUk: "Бойовий гімн: баф групі.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint"
    ],
    levels: [],
    effects: [
      {
        stat: "vampirism",
        mode: "percent"
      }
    ],
    cooldownSec: 6,
    skipMobHp: true
  },
  {
    battleId: "l2_1276",
    l2SkillId: 1276,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1276",
    hintUk: "Скіл №1276",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1278",
    l2SkillId: 1278,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1278",
    hintUk: "Скіл №1278",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1287",
    l2SkillId: 1287,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Скіл №1287",
    hintUk: "Скіл №1287",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 76,
        spCost: 10000000,
        mpCost: 250,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: true
  },
  {
    battleId: "l2_1289",
    l2SkillId: 1289,
    minLevel: 1,
    spCost: 0,
    nameUk: "Пекло",
    hintUk: "Пекельний залп по площі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: false
  },
  {
    battleId: "l2_1291",
    l2SkillId: 1291,
    minLevel: 70,
    spCost: 10000000,
    nameUk: "Скіл №1291",
    hintUk: "Скіл №1291",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 70,
        spCost: 10000000,
        mpCost: 250,
        power: 350
      }
    ],
    effects: [
      {
        stat: "hpRegen",
        mode: "multiplier"
      }
    ],
    cooldownSec: 3600,
    skipMobHp: false
  },
  {
    battleId: "l2_1292",
    l2SkillId: 1292,
    minLevel: 72,
    spCost: 10000000,
    nameUk: "Стихійний натиск",
    hintUk: "Стихійний натиск по цілі.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_storm_screamer"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 72,
        spCost: 10000000,
        mpCost: 250,
        power: 500
      }
    ],
    effects: [],
    cooldownSec: 3600,
    skipMobHp: false
  },
  {
    battleId: "l2_1297",
    l2SkillId: 1297,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1297",
    hintUk: "Скіл №1297",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dark_elf_spellhowler",
      "dark_elf_storm_screamer"
    ],
    levels: [],
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
    battleId: "l2_1299",
    l2SkillId: 1299,
    minLevel: 1,
    spCost: 0,
    nameUk: "Остання оборона слуги",
    hintUk: "Остання лінія захисту слуги.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: 1800,
    skipMobHp: true
  },
  {
    battleId: "l2_1300",
    l2SkillId: 1300,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1300",
    hintUk: "Скіл №1300",
    kind: "battle",
    category: "heal",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1301",
    l2SkillId: 1301,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1301",
    hintUk: "Скіл №1301",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: 15,
    skipMobHp: true
  },
  {
    battleId: "l2_1333",
    l2SkillId: 1333,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1333",
    hintUk: "Скіл №1333",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dark_elf_phantom_summoner",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true
  },
  {
    battleId: "l2_1341",
    l2SkillId: 1341,
    minLevel: 1,
    spCost: 0,
    nameUk: "Скіл №1341",
    hintUk: "Скіл №1341",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "runSpeed",
        mode: "multiplier"
      },
      {
        stat: "attackSpeed",
        mode: "multiplier"
      },
      {
        stat: "castSpeed",
        mode: "multiplier"
      },
      {
        stat: "windResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 60,
    skipMobHp: false
  },
  {
    battleId: "l2_1343",
    l2SkillId: 1343,
    minLevel: 1,
    spCost: 0,
    nameUk: "Темний вихор",
    hintUk: "Темний вихор: магічна шкода.",
    kind: "battle",
    category: "magic_attack",
    visibleForProfessions: [
      "dark_elf_storm_screamer"
    ],
    levels: [],
    effects: [
      {
        stat: "darkResist",
        mode: "multiplier"
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
    battleId: "l2_1349",
    l2SkillId: 1349,
    minLevel: 1,
    spCost: 0,
    nameUk: "Останній слуга",
    hintUk: "Викликає останнього слугу.",
    kind: "battle",
    category: "buff",
    visibleForProfessions: [
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [
      {
        stat: "critRate",
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
        stat: "atkSpeed",
        mode: "percent",
        value: 20
      },
      {
        stat: "maxHp",
        mode: "percent",
        value: 20
      },
      {
        stat: "runSpeed",
        mode: "percent"
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
    cooldownSec: 600,
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
      "dark_elf_shillien_saint"
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
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 78,
        spCost: 32000000,
        mpCost: 57,
        power: 0
      }
    ],
    effects: [
      {
        stat: "accuracy",
        mode: "flat",
        value: 4
      },
      {
        stat: "evasion",
        mode: "flat",
        value: 4
      },
      {
        stat: "attackSpeed",
        mode: "multiplier"
      },
      {
        stat: "vampirism",
        mode: "flat",
        value: 5
      },
      {
        stat: "debuffResist",
        mode: "multiplier"
      }
    ],
    cooldownSec: 120,
    skipMobHp: true
  },
  {
    battleId: "l2_1358",
    l2SkillId: 1358,
    minLevel: 77,
    spCost: 20000000,
    nameUk: "Блок щита",
    hintUk: "Блокує частину фізичних ударів.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dark_elf_shillien_saint"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 20000000,
        mpCost: 56,
        power: 0
      }
    ],
    effects: [
      {
        stat: "pDef",
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
      "dark_elf_phantom_summoner",
      "dark_elf_shillien_elder",
      "dark_elf_shillien_saint",
      "dark_elf_spectral_master"
    ],
    levels: [],
    effects: [],
    cooldownSec: 4,
    skipMobHp: false
  }
];

export const DARK_MYSTIC_ACTIVE_L2_IDS: readonly number[] = [336, 337, 338, 1011, 1012, 1013, 1015, 1016, 1027, 1031, 1040, 1064, 1068, 1069, 1074, 1078, 1126, 1127, 1128, 1140, 1146, 1147, 1148, 1151, 1157, 1159, 1160, 1164, 1167, 1168, 1172, 1176, 1177, 1178, 1181, 1184, 1201, 1204, 1206, 1208, 1209, 1210, 1211, 1213, 1214, 1216, 1217, 1218, 1219, 1221, 1222, 1223, 1224, 1226, 1228, 1229, 1234, 1239, 1262, 1266, 1267, 1268, 1276, 1278, 1287, 1289, 1291, 1292, 1299, 1300, 1301, 1333, 1341, 1343, 1349, 1354, 1357, 1358, 1453];
