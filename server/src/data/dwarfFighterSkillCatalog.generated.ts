/**
 * Автоген з text-rpg (`npm run gen:race-fighter-skills`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const DWARF_FIGHTER_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = [
  {
    battleId: "l2_13",
    l2SkillId: 13,
    minLevel: 49,
    spCost: 700000,
    nameUk: "Summon Siege Golem",
    hintUk: "Summon Siege Golem",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 49,
        spCost: 700000,
        mpCost: 530,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_25",
    l2SkillId: 25,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Summon Mechanic Golem",
    hintUk: "Summon Mechanic Golem",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 75,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 110000,
        mpCost: 88,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 55,
        spCost: 250000,
        mpCost: 100,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 60,
        spCost: 370000,
        mpCost: 110,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 64,
        spCost: 600000,
        mpCost: 118,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 68,
        spCost: 870000,
        mpCost: 126,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 72,
        spCost: 1700000,
        mpCost: 133,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_34",
    l2SkillId: 34,
    minLevel: 46,
    spCost: 67000,
    nameUk: "Bandage",
    hintUk: "Bandage",
    kind: "battle",
    category: "heal",
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
        level: 2,
        requiredLevel: 46,
        spCost: 67000,
        mpCost: 41,
        power: 7
      },
      {
        level: 3,
        requiredLevel: 62,
        spCost: 440000,
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
    battleId: "l2_36",
    l2SkillId: 36,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Вихор (Whirlwind)",
    hintUk: "Стабільний AoE-спам: б’є головну ціль і ще до 2 поруч. Лише зі списом/алебардою. Кулдаун 6 с.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 40,
        power: 369
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 41,
        power: 392
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 14000,
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
        spCost: 22000,
        mpCost: 47,
        power: 525
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 48,
        power: 555
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 49,
        power: 586
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 51,
        power: 618
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 52,
        power: 651
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 54,
        power: 686
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 55,
        power: 722
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 55,
        power: 758
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 56,
        power: 796
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 58,
        power: 835
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 59,
        power: 875
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 61,
        power: 916
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 62,
        power: 959
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 63,
        power: 1002
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 65,
        power: 1046
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 66,
        power: 1091
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 68,
        power: 1136
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 68,
        power: 1183
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 69,
        power: 1230
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 70,
        power: 1278
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 72,
        power: 1327
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 73,
        power: 1376
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 74,
        power: 1425
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 75,
        power: 1475
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 77,
        power: 1525
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 78,
        power: 1576
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 79,
        power: 1626
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 80,
        power: 1677
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 81,
        power: 1727
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 82,
        power: 1777
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 83,
        power: 1827
      }
    ],
    effects: [],
    cooldownSec: 17,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_42",
    l2SkillId: 42,
    minLevel: 10,
    spCost: 1100,
    nameUk: "Sweeper",
    hintUk: "Sweeper",
    kind: "battle",
    category: "special",
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
        requiredLevel: 10,
        spCost: 1100,
        mpCost: 3,
        power: 80
      }
    ],
    effects: [],
    cooldownSec: 0,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_60",
    l2SkillId: 60,
    minLevel: 40,
    spCost: 43000,
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
        spCost: 43000,
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
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 22,
        power: 30
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 22,
        power: 33
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 22,
        power: 35
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 2300,
        mpCost: 23,
        power: 41
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 2300,
        mpCost: 24,
        power: 44
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 2300,
        mpCost: 25,
        power: 48
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 4400,
        mpCost: 27,
        power: 55
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 4400,
        mpCost: 29,
        power: 59
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 4400,
        mpCost: 30,
        power: 64
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 8300,
        mpCost: 31,
        power: 73
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 8300,
        mpCost: 31,
        power: 79
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 8300,
        mpCost: 33,
        power: 84
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 11000,
        mpCost: 35,
        power: 96
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 11000,
        mpCost: 36,
        power: 102
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 11000,
        mpCost: 37,
        power: 109
      }
    ],
    effects: [],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_141",
    l2SkillId: 141,
    minLevel: 5,
    spCost: 310,
    nameUk: "Майстерність обладунку (Armor Mastery)",
    hintUk: "Пасив: +9 P. Def. за кожен вивчений рівень скіла.",
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
        spCost: 310,
        mpCost: 0,
        power: 2
      },
      {
        level: 2,
        requiredLevel: 10,
        spCost: 1100,
        mpCost: 0,
        power: 3
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
    spCost: 310,
    nameUk: "Майстерність зброї (Weapon Mastery)",
    hintUk: "Пасив: +P. Atk (flat) за рівнем скіла (1 р. — +1.5, 40 р. — +79.4).",
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
        spCost: 310,
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
        requiredLevel: 15,
        spCost: 6700,
        mpCost: 0,
        power: 12
      },
      {
        level: 4,
        requiredLevel: 15,
        spCost: 3300,
        mpCost: 0,
        power: 13
      },
      {
        level: 5,
        requiredLevel: 15,
        spCost: 3300,
        mpCost: 0,
        power: 14
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
    battleId: "l2_148",
    l2SkillId: 148,
    minLevel: 40,
    spCost: 43000,
    nameUk: "Життєва сила (Vital Force)",
    hintUk: "Пасив: швидше відновлення HP, коли персонаж сидить.",
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
        level: 3,
        requiredLevel: 40,
        spCost: 43000,
        mpCost: 0,
        power: 2
      },
      {
        level: 4,
        requiredLevel: 46,
        spCost: 67000,
        mpCost: 0,
        power: 3
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 180000,
        mpCost: 0,
        power: 4
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 300000,
        mpCost: 0,
        power: 4
      },
      {
        level: 7,
        requiredLevel: 64,
        spCost: 600000,
        mpCost: 0,
        power: 5
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 1700000,
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
        mode: "flat",
        value: 0
      }
    ],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_150",
    l2SkillId: 150,
    minLevel: 24,
    spCost: 7000,
    nameUk: "Weight Limit",
    hintUk: "Weight Limit",
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
        level: 2,
        requiredLevel: 24,
        spCost: 7000,
        mpCost: 0,
        power: 3
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_172",
    l2SkillId: 172,
    minLevel: 5,
    spCost: 310,
    nameUk: "Create Item",
    hintUk: "Create Item",
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
        spCost: 310,
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
    battleId: "l2_194",
    l2SkillId: 194,
    minLevel: 1,
    spCost: 0,
    nameUk: "Lucky",
    hintUk: "Lucky",
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
    battleId: "l2_205",
    l2SkillId: 205,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Blunt Mastery",
    hintUk: "Blunt Mastery",
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
        level: 9,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 23
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 25
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 14000,
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
        spCost: 22000,
        mpCost: 0,
        power: 35
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 37
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 39
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 41
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 44
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 46
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 54
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 57
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 60
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 63
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 66
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 69
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 72
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 79
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 82
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 86
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 89
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 93
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 96
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 100
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 103
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 107
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 111
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 114
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 118
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 122
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 0,
        power: 125
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 1100000,
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
    spCost: 46000,
    nameUk: "Підсилення HP (Boost HP)",
    hintUk: "Пасив: збільшує максимальне HP.",
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
        level: 4,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 0,
        power: 200
      },
      {
        level: 5,
        requiredLevel: 49,
        spCost: 110000,
        mpCost: 0,
        power: 250
      },
      {
        level: 6,
        requiredLevel: 55,
        spCost: 250000,
        mpCost: 0,
        power: 300
      },
      {
        level: 7,
        requiredLevel: 62,
        spCost: 440000,
        mpCost: 0,
        power: 350
      },
      {
        level: 8,
        requiredLevel: 66,
        spCost: 780000,
        mpCost: 0,
        power: 400
      },
      {
        level: 9,
        requiredLevel: 70,
        spCost: 1100000,
        mpCost: 0,
        power: 440
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 2300000,
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
    spCost: 43000,
    nameUk: "Швидке відновлення HP (Fast HP Recovery)",
    hintUk: "Пасив: підвищує відновлення HP.",
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
        level: 3,
        requiredLevel: 40,
        spCost: 43000,
        mpCost: 0,
        power: 1
      },
      {
        level: 4,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 0,
        power: 2
      },
      {
        level: 5,
        requiredLevel: 52,
        spCost: 180000,
        mpCost: 0,
        power: 2
      },
      {
        level: 6,
        requiredLevel: 58,
        spCost: 300000,
        mpCost: 0,
        power: 2
      },
      {
        level: 7,
        requiredLevel: 68,
        spCost: 870000,
        mpCost: 0,
        power: 3
      },
      {
        level: 8,
        requiredLevel: 74,
        spCost: 2300000,
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
    spCost: 14000,
    nameUk: "Майстерність древка (Polearm Mastery)",
    hintUk: "Пасив: підвищує P. Atk зі списом і алебардами.",
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
        level: 9,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 23
      },
      {
        level: 10,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 25
      },
      {
        level: 11,
        requiredLevel: 40,
        spCost: 14000,
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
        spCost: 22000,
        mpCost: 0,
        power: 35
      },
      {
        level: 16,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 37
      },
      {
        level: 17,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 39
      },
      {
        level: 18,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 41
      },
      {
        level: 19,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 44
      },
      {
        level: 20,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 46
      },
      {
        level: 21,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 49
      },
      {
        level: 22,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 51
      },
      {
        level: 23,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 54
      },
      {
        level: 24,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 57
      },
      {
        level: 25,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 60
      },
      {
        level: 26,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 63
      },
      {
        level: 27,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 66
      },
      {
        level: 28,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 69
      },
      {
        level: 29,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 72
      },
      {
        level: 30,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 76
      },
      {
        level: 31,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 79
      },
      {
        level: 32,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 82
      },
      {
        level: 33,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 86
      },
      {
        level: 34,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 89
      },
      {
        level: 35,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 93
      },
      {
        level: 36,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 96
      },
      {
        level: 37,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 100
      },
      {
        level: 38,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 103
      },
      {
        level: 39,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 107
      },
      {
        level: 40,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 111
      },
      {
        level: 41,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 114
      },
      {
        level: 42,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 118
      },
      {
        level: 43,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 122
      },
      {
        level: 44,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 0,
        power: 125
      },
      {
        level: 45,
        requiredLevel: 74,
        spCost: 1100000,
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
    spCost: 14000,
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
        level: 14,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 21
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 22
      },
      {
        level: 16,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 24
      },
      {
        level: 17,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 25
      },
      {
        level: 18,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 26
      },
      {
        level: 19,
        requiredLevel: 43,
        spCost: 15000,
        mpCost: 0,
        power: 27
      },
      {
        level: 20,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 29
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 30
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 32
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 33
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 35
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 36
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 38
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 39
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 41
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 42
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 44
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 46
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 47
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 49
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 51
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 53
      },
      {
        level: 36,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 54
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 56
      },
      {
        level: 38,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 58
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 60
      },
      {
        level: 40,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 62
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 64
      },
      {
        level: 42,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 65
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 67
      },
      {
        level: 44,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 69
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 71
      },
      {
        level: 46,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 73
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 75
      },
      {
        level: 48,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 77
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 0,
        power: 79
      },
      {
        level: 50,
        requiredLevel: 74,
        spCost: 1100000,
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
        mode: "flat"
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
    spCost: 14000,
    nameUk: "Майстерність важкої броні (Heavy Armor Mastery)",
    hintUk: "Пасив: підвищує P. Def у важкій броні.",
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
        level: 14,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 20
      },
      {
        level: 15,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 0,
        power: 21
      },
      {
        level: 16,
        requiredLevel: 40,
        spCost: 14000,
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
        spCost: 22000,
        mpCost: 0,
        power: 28
      },
      {
        level: 21,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 29
      },
      {
        level: 22,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 0,
        power: 30
      },
      {
        level: 23,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 32
      },
      {
        level: 24,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 33
      },
      {
        level: 25,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 0,
        power: 35
      },
      {
        level: 26,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 36
      },
      {
        level: 27,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 38
      },
      {
        level: 28,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 0,
        power: 39
      },
      {
        level: 29,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 41
      },
      {
        level: 30,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 43
      },
      {
        level: 31,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 0,
        power: 44
      },
      {
        level: 32,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 46
      },
      {
        level: 33,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 48
      },
      {
        level: 34,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 0,
        power: 49
      },
      {
        level: 35,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 51
      },
      {
        level: 36,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 0,
        power: 53
      },
      {
        level: 37,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 55
      },
      {
        level: 38,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 0,
        power: 56
      },
      {
        level: 39,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 58
      },
      {
        level: 40,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 0,
        power: 60
      },
      {
        level: 41,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 62
      },
      {
        level: 42,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 0,
        power: 64
      },
      {
        level: 43,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 66
      },
      {
        level: 44,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 0,
        power: 67
      },
      {
        level: 45,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 69
      },
      {
        level: 46,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 0,
        power: 71
      },
      {
        level: 47,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 73
      },
      {
        level: 48,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 0,
        power: 75
      },
      {
        level: 49,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 0,
        power: 77
      },
      {
        level: 50,
        requiredLevel: 74,
        spCost: 1100000,
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
    battleId: "l2_239",
    l2SkillId: 239,
    minLevel: 20,
    spCost: 0,
    nameUk: "Expertise D",
    hintUk: "Expertise D",
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
        requiredLevel: 20,
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
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_scavenger",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 22,
        power: 90
      },
      {
        level: 2,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 22,
        power: 97
      },
      {
        level: 3,
        requiredLevel: 20,
        spCost: 1200,
        mpCost: 22,
        power: 105
      },
      {
        level: 4,
        requiredLevel: 24,
        spCost: 2300,
        mpCost: 23,
        power: 123
      },
      {
        level: 5,
        requiredLevel: 24,
        spCost: 2300,
        mpCost: 24,
        power: 132
      },
      {
        level: 6,
        requiredLevel: 24,
        spCost: 2300,
        mpCost: 25,
        power: 143
      },
      {
        level: 7,
        requiredLevel: 28,
        spCost: 4400,
        mpCost: 27,
        power: 165
      },
      {
        level: 8,
        requiredLevel: 28,
        spCost: 4400,
        mpCost: 29,
        power: 177
      },
      {
        level: 9,
        requiredLevel: 28,
        spCost: 4400,
        mpCost: 30,
        power: 191
      },
      {
        level: 10,
        requiredLevel: 32,
        spCost: 8300,
        mpCost: 31,
        power: 219
      },
      {
        level: 11,
        requiredLevel: 32,
        spCost: 8300,
        mpCost: 31,
        power: 235
      },
      {
        level: 12,
        requiredLevel: 32,
        spCost: 8300,
        mpCost: 33,
        power: 251
      },
      {
        level: 13,
        requiredLevel: 36,
        spCost: 11000,
        mpCost: 35,
        power: 287
      },
      {
        level: 14,
        requiredLevel: 36,
        spCost: 11000,
        mpCost: 36,
        power: 306
      },
      {
        level: 15,
        requiredLevel: 36,
        spCost: 11000,
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
    battleId: "l2_248",
    l2SkillId: 248,
    minLevel: 40,
    spCost: 43000,
    nameUk: "Crystallize",
    hintUk: "Crystallize",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_artisan",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 2,
        requiredLevel: 40,
        spCost: 43000,
        mpCost: 0,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 52,
        spCost: 170000,
        mpCost: 0,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 60,
        spCost: 370000,
        mpCost: 0,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 850000,
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
    battleId: "l2_254",
    l2SkillId: 254,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Spoil",
    hintUk: "Spoil",
    kind: "battle",
    category: "debuff",
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
        level: 5,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 38,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 49,
        spCost: 110000,
        mpCost: 44,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 55,
        spCost: 250000,
        mpCost: 50,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 60,
        spCost: 410000,
        mpCost: 55,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 64,
        spCost: 600000,
        mpCost: 59,
        power: 0
      },
      {
        level: 10,
        requiredLevel: 68,
        spCost: 870000,
        mpCost: 63,
        power: 0
      },
      {
        level: 11,
        requiredLevel: 72,
        spCost: 1700000,
        mpCost: 67,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_260",
    l2SkillId: 260,
    minLevel: 40,
    spCost: 14000,
    nameUk: "Скрушний молот (Hammer Crush)",
    hintUk: "Важкий удар булавою з високою шкодою. Лише з булавою.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 40,
        power: 123
      },
      {
        level: 2,
        requiredLevel: 40,
        spCost: 14000,
        mpCost: 41,
        power: 131
      },
      {
        level: 3,
        requiredLevel: 40,
        spCost: 14000,
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
        spCost: 22000,
        mpCost: 47,
        power: 175
      },
      {
        level: 8,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 48,
        power: 185
      },
      {
        level: 9,
        requiredLevel: 46,
        spCost: 22000,
        mpCost: 49,
        power: 196
      },
      {
        level: 10,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 51,
        power: 206
      },
      {
        level: 11,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 52,
        power: 217
      },
      {
        level: 12,
        requiredLevel: 49,
        spCost: 36000,
        mpCost: 54,
        power: 229
      },
      {
        level: 13,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 55,
        power: 241
      },
      {
        level: 14,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 55,
        power: 253
      },
      {
        level: 15,
        requiredLevel: 52,
        spCost: 63000,
        mpCost: 56,
        power: 266
      },
      {
        level: 16,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 58,
        power: 279
      },
      {
        level: 17,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 59,
        power: 292
      },
      {
        level: 18,
        requiredLevel: 55,
        spCost: 81000,
        mpCost: 61,
        power: 306
      },
      {
        level: 19,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 62,
        power: 320
      },
      {
        level: 20,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 63,
        power: 334
      },
      {
        level: 21,
        requiredLevel: 58,
        spCost: 100000,
        mpCost: 65,
        power: 349
      },
      {
        level: 22,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 66,
        power: 364
      },
      {
        level: 23,
        requiredLevel: 60,
        spCost: 210000,
        mpCost: 68,
        power: 379
      },
      {
        level: 24,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 68,
        power: 395
      },
      {
        level: 25,
        requiredLevel: 62,
        spCost: 220000,
        mpCost: 69,
        power: 410
      },
      {
        level: 26,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 70,
        power: 426
      },
      {
        level: 27,
        requiredLevel: 64,
        spCost: 300000,
        mpCost: 72,
        power: 443
      },
      {
        level: 28,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 73,
        power: 459
      },
      {
        level: 29,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 74,
        power: 475
      },
      {
        level: 30,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 75,
        power: 492
      },
      {
        level: 31,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 77,
        power: 509
      },
      {
        level: 32,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 78,
        power: 526
      },
      {
        level: 33,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 79,
        power: 542
      },
      {
        level: 34,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 80,
        power: 559
      },
      {
        level: 35,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 81,
        power: 576
      },
      {
        level: 36,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 82,
        power: 593
      },
      {
        level: 37,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 83,
        power: 609
      }
    ],
    effects: [],
    cooldownSec: 13,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_299",
    l2SkillId: 299,
    minLevel: 58,
    spCost: 800000,
    nameUk: "Summon Wild Hog Cannon",
    hintUk: "Summon Wild Hog Cannon",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 800000,
        mpCost: 530,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_301",
    l2SkillId: 301,
    minLevel: 58,
    spCost: 270000,
    nameUk: "Summon Big Boom",
    hintUk: "Summon Big Boom",
    kind: "battle",
    category: "special",
    visibleForProfessions: [
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 58,
        spCost: 270000,
        mpCost: 74,
        power: 0
      },
      {
        level: 2,
        requiredLevel: 62,
        spCost: 400000,
        mpCost: 82,
        power: 0
      },
      {
        level: 3,
        requiredLevel: 66,
        spCost: 780000,
        mpCost: 88,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 70,
        spCost: 850000,
        mpCost: 94,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 100,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 20,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_302",
    l2SkillId: 302,
    minLevel: 43,
    spCost: 46000,
    nameUk: "Spoil Festival",
    hintUk: "Spoil Festival",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_scavenger"
    ],
    levels: [
      {
        level: 3,
        requiredLevel: 43,
        spCost: 46000,
        mpCost: 113,
        power: 0
      },
      {
        level: 4,
        requiredLevel: 49,
        spCost: 110000,
        mpCost: 131,
        power: 0
      },
      {
        level: 5,
        requiredLevel: 55,
        spCost: 250000,
        mpCost: 150,
        power: 0
      },
      {
        level: 6,
        requiredLevel: 62,
        spCost: 440000,
        mpCost: 172,
        power: 0
      },
      {
        level: 7,
        requiredLevel: 66,
        spCost: 780000,
        mpCost: 183,
        power: 0
      },
      {
        level: 8,
        requiredLevel: 70,
        spCost: 1100000,
        mpCost: 194,
        power: 0
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 2300000,
        mpCost: 204,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: 10,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_320",
    l2SkillId: 320,
    minLevel: 66,
    spCost: 390000,
    nameUk: "Гнів (Wrath)",
    hintUk: "Зона як «поруч» на карті (r≈26000): фіз. урон і зняття частки max CP цілей — 7% (1 р.) … 30% (10 р.). Лише спис або алебарда.",
    kind: "battle",
    category: "debuff",
    visibleForProfessions: [
      "dwarf_bounty_hunter",
      "dwarf_fortune_seeker",
      "dwarf_maestro",
      "dwarf_warsmith"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 73,
        power: 7
      },
      {
        level: 2,
        requiredLevel: 66,
        spCost: 390000,
        mpCost: 74,
        power: 10
      },
      {
        level: 3,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 75,
        power: 12
      },
      {
        level: 4,
        requiredLevel: 68,
        spCost: 430000,
        mpCost: 77,
        power: 15
      },
      {
        level: 5,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 78,
        power: 17
      },
      {
        level: 6,
        requiredLevel: 70,
        spCost: 520000,
        mpCost: 79,
        power: 20
      },
      {
        level: 7,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 80,
        power: 22
      },
      {
        level: 8,
        requiredLevel: 72,
        spCost: 840000,
        mpCost: 81,
        power: 25
      },
      {
        level: 9,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 82,
        power: 27
      },
      {
        level: 10,
        requiredLevel: 74,
        spCost: 1100000,
        mpCost: 83,
        power: 30
      }
    ],
    effects: [],
    cooldownSec: 120,
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
      "dwarf_fortune_seeker",
      "dwarf_maestro"
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
      "dwarf_fortune_seeker",
      "dwarf_maestro"
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
    spCost: 13000000,
    nameUk: "Майстерність скілів (Skill Mastery)",
    hintUk: "Пасив: шанс повторно застосувати вміння або подовжити ефект.",
    kind: "passive",
    category: "passive",
    visibleForProfessions: [
      "dwarf_fortune_seeker",
      "dwarf_maestro"
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
      "dwarf_fortune_seeker",
      "dwarf_maestro"
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
    battleId: "l2_340",
    l2SkillId: 340,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Riposte Stance",
    hintUk: "Riposte Stance",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dwarf_fortune_seeker",
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
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
    battleId: "l2_347",
    l2SkillId: 347,
    minLevel: 78,
    spCost: 32000000,
    nameUk: "Землетрус (Earthquake)",
    hintUk: "Масовий удар по землі з шансом шоку/оглушення. Добрий opener проти пачки мобів. Лише зі списом/алебардою.",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_fortune_seeker",
      "dwarf_maestro"
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
    battleId: "l2_348",
    l2SkillId: 348,
    minLevel: 76,
    spCost: 10000000,
    nameUk: "Whirlwind Attack",
    hintUk: "Whirlwind Attack",
    kind: "toggle",
    category: "toggle",
    visibleForProfessions: [
      "dwarf_fortune_seeker"
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
    effects: [],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_362",
    l2SkillId: 362,
    minLevel: 77,
    spCost: 13000000,
    nameUk: "Armor Crush",
    hintUk: "Armor Crush",
    kind: "battle",
    category: "physical_attack",
    visibleForProfessions: [
      "dwarf_fortune_seeker",
      "dwarf_maestro"
    ],
    levels: [
      {
        level: 1,
        requiredLevel: 77,
        spCost: 13000000,
        mpCost: 65,
        power: 1973
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
      }
    ],
    cooldownSec: 15,
    skipMobHp: false,
    hideAtBaseFighterUntilFirstProf: false
  },
  {
    battleId: "l2_2541",
    l2SkillId: 2541,
    minLevel: 40,
    spCost: 50000,
    nameUk: "Auto Spoil",
    hintUk: "Auto Spoil",
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
        spCost: 50000,
        mpCost: 50,
        power: 0
      }
    ],
    effects: [],
    cooldownSec: null,
    skipMobHp: true,
    hideAtBaseFighterUntilFirstProf: false
  }
];

/** Активні / toggle l2 id (пасивки виключено). */
export const DWARF_FIGHTER_ACTIVE_L2_IDS: readonly number[] = [13, 25, 34, 36, 42, 60, 100, 245, 254, 260, 299, 301, 302, 320, 339, 340, 347, 348, 362, 2541];
