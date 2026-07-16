import type { HumanFighterSkillKind } from '../data/humanFighterSkillCatalog.js';
import {
  HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL,
  HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL,
  HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
  HUMAN_FIGHTER_PRO_WARRIOR_LEVEL,
  HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL,
  HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL,
  mortalBlowMpAndPower,
  powerShotMpAndPower,
  powerSmashMpAndPower,
  powerStrikeMpAndPower,
  stunAttackMpAndPower,
  stunShotMpAndPower,
  thunderStormMpAndPower,
  wildSweepMpAndPower,
  wildSweepStatsNoteUk,
  whirlwindMpAndPower,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  warCryMpAtRank,
  warCryPatkPercentAtRank,
  warCryStatsNoteUk,
} from '../data/warCryTables.js';
import {
  battleRoarMpAtRank,
  battleRoarStatsNoteUk,
} from '../data/battleRoarTables.js';
import {
  majestyMpAtRank,
  majestyStatsNoteUk,
} from '../data/majestyTables.js';
import {
  shieldStunMpAtRank,
  shieldStunStatsNoteUk,
} from '../data/shieldStunTables.js';
import { powerSmashStatsNoteUk } from '../data/powerSmashTables.js';
import { stunAttackStatsNoteUk } from '../data/stunAttackTables.js';
import { tripleSlashStatsNoteUk, sonicBlasterStatsNoteUk, sonicBusterStatsNoteUk, sonicStormStatsNoteUk } from '../data/sonicGladiatorTables.js';
import { provokeMpAtRank,
  provokePoleResistCutPctAtRank,
  provokeStatsNoteUk,
} from '../data/provokeTables.js';
import {
  drainHealthMpAndPowerAtRank,
  drainHealthStatsNoteUk,
} from '../data/drainHealthTables.js';
import { shieldMasteryStatsNoteUk } from '../data/shieldMasteryTables.js';
import { hammerCrushStatsNoteUk } from '../data/hammerCrushTables.js';
import { canonicalBattleSkillId } from '../data/humanFighterSkillCatalog.js';
import { applyL2dopXmlMagisterOverlay } from '../data/l2dopXmlMagisterOverlay.js';
import {
  l2dopXmlMpPower,
  l2dopXmlSkillRow,
} from '../data/l2dopXmlSkillLevels.lookup.js';
function magisterPassiveCombatNoteUk(battleId: string): string | null {
  const b = canonicalBattleSkillId(battleId);
  switch (b) {
    case 'l2_141':
      return 'Пасив: +9 P. Def. за кожен рівень скіла. MP у бою не витрачається.';
    case 'l2_142':
      return 'Пасив: +P. Atk (flat) за рівень скіла. MP у бою не витрачається.';
    case 'l2_148':
      return 'Пасив: більше HP/CP. MP у бою не витрачається.';
    case 'l2_211':
      return 'Пасив: максимум HP. MP у бою не витрачається.';
    case 'l2_212':
      return 'Пасив: +HP/тік за рангом скіла. MP у бою не витрачається.';
    case 'l2_216':
      return 'Пасив: +P. Atk (flat) зі списом або алебардою. MP у бою не витрачається.';
    case 'l2_144':
      return 'Пасив: +P. Atk (flat) з дуальними мечами. MP у бою не витрачається.';
    case 'l2_227':
      return 'Пасив: +P. Def (%) і ухилення в легкій броні. MP у бою не витрачається.';
    case 'l2_231':
      return 'Пасив: +P. Def (%) у важкій броні. MP у бою не витрачається.';
    case 'l2_256':
      return 'Toggle: точність; MP знімається в такті. У картці — як пасив для зручності.';
    case 'l2_257':
      return 'Пасив: +P. Atk (flat) з мечем або булавою. MP у бою не витрачається.';
    case 'l2_290':
      return 'Пасив: автоматично +P.Atk (flat), коли HP < 30%. 1 р. +32.9 … 13 р. +129.3. MP у бою не витрачається.';
    case 'l2_312':
      return 'Toggle: крит / сила криту; MP ~0.4/с, поки увімкнено (не аура).';
    case 'l2_328':
      return 'Пасивний скіл. Hold/Sleep/Mental +20 (76 лв, 1 р.). Макс. рівень скіла — 1. MP у бою не витрачається.';
    case 'l2_329':
      return 'Пасивний скіл. Poison/Bleed/Hold/Sleep/Mental +20 (76 лв, 1 р.). Макс. рівень скіла — 1. MP у бою не витрачається.';
    case 'l2_330':
      return 'Пасивний скіл. Шанс без MP і без reuse; при спрацюванні — повтор одразу (77 лв, 1 р.). MP у бою не витрачається.';
    case 'l2_339':
      return 'Стійка: вищий захист, нижча швидкість/атака; MP знімається, поки активна.';
    case 'l2_342':
      return 'Актив: темне прокляття по ворогу (Hell Knight); у бою — заглушка до переносу формул.';
    case 'l2_60':
      return 'Toggle: удавана смерть; MP знімається в такті.';
    case 'l2_992':
      return 'Пасив: Sonic Mastery дає вампіризм для sonic-ударів (відновлення HP від шкоди).';
    case 'l2_153':
      return shieldMasteryStatsNoteUk(1);
    default:
      return null;
  }
}

function magisterBattleStatsPreviewCore(
  battleId: string,
  kind: HumanFighterSkillKind,
  playerLevel: number,
  catalogMinLevel: number,
  skillRank: number
): { mp: number | null; power: number | null; statsNoteUk: string | null } {
  const b = canonicalBattleSkillId(battleId);
  if (kind === 'passive' || kind === 'toggle') {
    const extra = magisterPassiveCombatNoteUk(b);
    return {
      mp: null,
      power: null,
      statsNoteUk: extra ?? 'Пасив — MP у бою не витрачається.',
    };
  }
  const lv = Math.max(playerLevel, catalogMinLevel);
  let row: { mp: number; power: number } | null = null;

  switch (b) {
    case 'l2_78':
      return {
        mp: warCryMpAtRank(skillRank) ?? 10,
        power: warCryPatkPercentAtRank(skillRank),
        statsNoteUk: warCryStatsNoteUk(skillRank),
      };
    case 'l2_3':
      row = powerStrikeMpAndPower(
        Math.max(lv, HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL),
        skillRank
      );
      break;
    case 'l2_16':
      row = mortalBlowMpAndPower(
        Math.max(lv, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL),
        skillRank
      );
      break;
    case 'l2_56':
      row = powerShotMpAndPower(
        Math.max(lv, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL),
        skillRank
      );
      if (!row) {
        return {
          mp: null,
          power: null,
          statsNoteUk:
            'З ' +
            HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL +
            ' р., у бою — лише з луком.',
        };
      }
      break;
    case 'l2_100':
      row = stunAttackMpAndPower(
        Math.max(lv, HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL),
        skillRank
      );
      if (!row) {
        return {
          mp: null,
          power: null,
          statsNoteUk:
            'З ' + HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL + ' р., гілка воїна.',
        };
      }
      return {
        mp: row.mp,
        power: row.power,
        statsNoteUk: stunAttackStatsNoteUk(skillRank),
      };
    case 'l2_245':
      row = wildSweepMpAndPower(
        Math.max(lv, HUMAN_FIGHTER_PRO_WARRIOR_LEVEL),
        skillRank
      );
      if (!row) {
        return {
          mp: null,
          power: null,
          statsNoteUk: 'Після профи воїн; у бою — древко.',
        };
      }
      return {
        mp: row.mp,
        power: row.power,
        statsNoteUk: wildSweepStatsNoteUk(skillRank),
      };
    case 'l2_255':
      row = powerSmashMpAndPower(
        Math.max(lv, HUMAN_FIGHTER_PRO_WARRIOR_LEVEL),
        skillRank
      );
      if (!row) {
        return {
          mp: null,
          power: null,
          statsNoteUk: 'Після профи воїн; у бою — меч або булава.',
        };
      }
      return {
        mp: row.mp,
        power: row.power,
        statsNoteUk: powerSmashStatsNoteUk(skillRank),
      };
    case 'l2_36': {
      const wlv = Math.max(lv, HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL);
      row = whirlwindMpAndPower(wlv, skillRank);
      if (!row) {
        return {
          mp: null,
          power: null,
          statsNoteUk:
            'Масова атака навколо. Warlord; з ' +
            HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL +
            ' лвл; спис/алебарда.',
        };
      }
      return {
        mp: row.mp,
        power: row.power,
        statsNoteUk:
          'Масова атака: головна + до 3 поруч (до 4). Спис/алебарда; Power ' +
          row.power +
          '.',
      };
    }
    case 'l2_48': {
      const tlv = Math.max(lv, HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL);
      const ts =
        l2dopXmlMpPower(48, skillRank) ?? thunderStormMpAndPower(tlv, skillRank);
      if (!ts) {
        return {
          mp: null,
          power: null,
          statsNoteUk:
            'Burst AoE + шок ~50%. Warlord; спис/алебарда; з ' +
            HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL +
            ' лвл.',
        };
      }
      return {
        mp: ts.mp,
        power: ts.power,
        statsNoteUk:
          'Burst AoE: головна + до 3 поруч (до 4); шок ~50%. Спис/алебарда; Power ' +
          ts.power +
          '.',
      };
    }
    case 'l2_286':
      return {
        mp: provokeMpAtRank(skillRank),
        power: provokePoleResistCutPctAtRank(skillRank),
        statsNoteUk: provokeStatsNoteUk(skillRank),
      };
    case 'l2_70': {
      const row = drainHealthMpAndPowerAtRank(skillRank);
      return {
        mp: row?.mp ?? null,
        power: row?.power ?? null,
        statsNoteUk: drainHealthStatsNoteUk(skillRank, lv),
      };
    }
    case 'l2_1': {
      const xr = l2dopXmlSkillRow(1, skillRank);
      return {
        mp: xr?.m ?? 47,
        power: xr?.p ?? 431,
        statsNoteUk: tripleSlashStatsNoteUk(skillRank),
      };
    }
    case 'l2_6': {
      const xr = l2dopXmlSkillRow(6, skillRank);
      return {
        mp: xr?.m ?? 19,
        power: xr?.p ?? 300,
        statsNoteUk: sonicBlasterStatsNoteUk(skillRank),
      };
    }
    case 'l2_8': {
      const xr = l2dopXmlSkillRow(8, skillRank);
      return {
        mp: xr?.m ?? 12,
        power: null,
        statsNoteUk:
          'Дає +1 заряд Sonic Focus (до 10). Без прямого урону.',
      };
    }
    case 'l2_5': {
      const xr = l2dopXmlSkillRow(5, skillRank);
      return {
        mp: xr?.m ?? 47,
        power: xr?.p ?? 450,
        statsNoteUk:
          'Потрібен дуальний меч. Витрачає 2 заряди Sonic Focus. З Sonic Mastery дає вампіризм.',
      };
    }
    case 'l2_9': {
      const xr = l2dopXmlSkillRow(9, skillRank);
      return {
        mp: xr?.m ?? 47,
        power: xr?.p ?? 520,
        statsNoteUk: sonicBusterStatsNoteUk(skillRank),
      };
    }
    case 'l2_7': {
      const xr = l2dopXmlSkillRow(7, skillRank);
      return {
        mp: xr?.m ?? 82,
        power: xr?.p ?? 600,
        statsNoteUk: sonicStormStatsNoteUk(skillRank),
      };
    }
    case 'l2_190': {
      const xr = l2dopXmlSkillRow(190, skillRank);
      return {
        mp: xr?.m ?? 52,
        power: xr?.p ?? 540,
        statsNoteUk: 'Швидкий фізичний удар. Меч або булава.',
      };
    }
    case 'l2_260': {
      const xr = l2dopXmlSkillRow(260, skillRank);
      return {
        mp: xr?.m ?? 68,
        power: xr?.p ?? 680,
        statsNoteUk: hammerCrushStatsNoteUk(skillRank),
      };
    }
    case 'l2_261': {
      const xr = l2dopXmlSkillRow(261, skillRank);
      return {
        mp: xr?.m ?? 78,
        power: xr?.p ?? 720,
        statsNoteUk:
          'Потрібен дуальний меч. Витрачає 3 заряди Sonic Focus. З Sonic Mastery дає вампіризм.',
      };
    }
    case 'l2_451': {
      const xr = l2dopXmlSkillRow(451, skillRank);
      return {
        mp: xr?.m ?? 41,
        power: null,
        statsNoteUk: 'Баф швидкості пересування на ~15 с.',
      };
    }
    case 'l2_442': {
      const xr = l2dopXmlSkillRow(442, skillRank);
      return {
        mp: xr?.m ?? 80,
        power: null,
        statsNoteUk:
          'Потрібен дуальний меч і 5 зарядів Sonic Focus. Знижує вхідну фізичну шкоду на ~10 с.',
      };
    }
    case 'l2_75':
      return {
        mp: 14,
        power: 30,
        statsNoteUk: 'Баф P. Atk проти комах; тривалість ~10 хв.',
      };
    case 'l2_287':
      return {
        mp: 16,
        power: 40,
        statsNoteUk:
          '+40% стійкості до шоку, сну, утримання (Root) та паралічу; 60 с.',
      };
    case 'l2_80':
      return {
        mp: 24,
        power: 30,
        statsNoteUk:
          '+30% P.Atk проти Monster/Beast на 10 хв. 1 р., 52 лвл; відкат 3 с. Warlord.',
      };
    case 'l2_87':
      return { mp: 18, power: null, statsNoteUk: 'Проти тварин: ~+30% P. Atk, ~10 хв.' };
    case 'l2_88':
      return {
        mp: 30,
        power: 30,
        statsNoteUk:
          '+30% P.Atk проти Dragon на 10 хв. 1 р., 58 лвл; MP 30; відкат 3 с. Warlord.',
      };
    case 'l2_104':
      return {
        mp: 21,
        power: null,
        statsNoteUk:
          'Проти Plant: +30% P.Atk на 10 хв. 1 р., 21 MP, відкат 10 с.',
      };
    case 'l2_116': {
      const howlMp = l2dopXmlMpPower(116, skillRank);
      return {
        mp: howlMp?.mp ?? 29,
        power: 23,
        statsNoteUk:
          'Дебаф −23% P.Atk ворогів у радіусі бою (як моби на карті) на 30 с. Warlord.',
      };
    }
    case 'l2_121':
      return {
        mp: battleRoarMpAtRank(skillRank) ?? 18,
        power: null,
        statsNoteUk: battleRoarStatsNoteUk(skillRank),
      };
    case 'l2_82':
      return {
        mp: majestyMpAtRank(skillRank) ?? 10,
        power: null,
        statsNoteUk: majestyStatsNoteUk(skillRank),
      };
    case 'l2_92':
      return {
        mp: shieldStunMpAtRank(skillRank) ?? null,
        power: null,
        statsNoteUk: shieldStunStatsNoteUk(skillRank, lv),
      };
    case 'l2_130': {
      const tfMp = l2dopXmlMpPower(130, skillRank);
      const tfRank = Math.max(1, Math.min(2, Math.floor(skillRank)));
      const aspdPct = tfRank >= 2 ? 10 : 5;
      return {
        mp: tfMp?.mp ?? (tfRank >= 2 ? 25 : 21),
        power: aspdPct,
        statsNoteUk:
          '−20% Run Speed; +' +
          aspdPct +
          '% Attack Speed на 5 хв. Warlord; 46 / 55 лвл.',
      };
    }
    case 'l2_317':
      return {
        mp: 18,
        power: null,
        statsNoteUk:
          'Toggle (спис/алебарда): 1 ціль; +2…+6 Acc і +10…+30% Crit Dmg за рангом.',
      };
    case 'l2_320':
      return {
        mp: 73,
        power: null,
        statsNoteUk:
          'Фіз. урон + зняття max CP цілі: 7–30% (рівні 1–10). PvP — CP гравця; PvE — CP моба. Спис/алебарда; кулдаун 120 с.',
      };
    case 'l2_181':
      return {
        mp: 25,
        power: 1685,
        statsNoteUk:
          'Лікування HP на собі; сила 1685 — лише якщо HP ~10% або нижче. Кулдаун 2 хв.',
      };
    case 'l2_347':
      return {
        mp: 87,
        power: 4040,
        statsNoteUk:
          'На себе, r≈150: фіз. сила 4040, скидає таргет; можливий оверхit/крит. Спис/алебарда; 78 лв, 1 р.',
      };
    case 'l2_359':
      return {
        mp: 33,
        power: null,
        statsNoteUk:
          'Активний баф: +30% P.Atk проти Animal, Plant, Insect на 10 хв. 77 лв, 1 р., 33 MP. Макс. рівень — 1.',
      };
    case 'l2_360':
      return {
        mp: 71,
        power: null,
        statsNoteUk:
          'Активний баф: +30% P.Atk протi Beast, Magic Creature, Giant, Dragon на 10 хв. 78 лв, 1 р., 71 MP, каст 2 с, відкат 3 с.',
      };
    case 'l2_361':
      return {
        mp: 53,
        power: 1973,
        statsNoteUk:
          'Shock Blast: r≈150 навколо цілі, сила 1973, стан ~9 с (40%), −30% P.Def/M.Def, скидає таргет. Лише спис/алебарда.',
      };
    case 'l2_340':
      return {
        mp: 35,
        power: null,
        statsNoteUk:
          'Toggle: 30% відбиття ближнього урону; −20% Atk.Spd., −10% Run Speed, −4 Accuracy; MP у такті.',
      };
    case 'l2_345':
      return {
        mp: 5,
        power: 600,
        statsNoteUk:
          'Дальній удар; +1 Sonic Focus. Лише дуальний меч.',
      };
    case 'l2_18':
      return {
        mp: 28,
        power: null,
        statsNoteUk:
          'Aggression: контроль загрози, послаблює атаку моба (~15 с).',
      };
    case 'l2_65':
      return {
        mp: 35,
        power: null,
        statsNoteUk:
          'Horror: тимчасово послаблює атаку цілі (~20 с), далі кулдаун.',
      };
    case 'l2_86':
      return {
        mp: 40,
        power: null,
        statsNoteUk:
          'Reflect Damage: частина вхідного урону повертається назад (~60 с).',
      };
    case 'l2_103': {
      const xr = l2dopXmlSkillRow(103, skillRank);
      return {
        mp: xr?.m ?? 34,
        power: xr?.p ?? 121,
        statsNoteUk: 'Corpse Plague: атакуючий темний удар/прокляття.',
      };
    }
    case 'l2_127': {
      const xr = l2dopXmlSkillRow(127, skillRank);
      return {
        mp: xr?.m ?? 28,
        power: xr?.p ?? 188,
        statsNoteUk: 'Hamstring: урон + уповільнення цілі.',
      };
    }
    case 'l2_283':
      return {
        mp: 70,
        power: null,
        statsNoteUk:
          'Summon Dark Panther: у нашій battle-моделі дає тимчасовий бонус атаки (~60 с).',
      };
    case 'l2_49': {
      const xr = l2dopXmlSkillRow(49, skillRank);
      return {
        mp: xr?.m ?? 26,
        power: xr?.p ?? 188,
        statsNoteUk: 'Святий фізичний удар (Paladin/Phoenix).',
      };
    }
    case 'l2_97':
      return {
        mp: 38,
        power: null,
        statsNoteUk:
          'Sanctuary: менший вхідний фіз. урон на короткий час (~30 с).',
      };
    case 'l2_318':
      return {
        mp: null,
        power: null,
        statsNoteUk:
          'Aegis Stance (toggle): вищий P.Def/M.Def, поки активна.',
      };
    case 'l2_322':
      return {
        mp: 55,
        power: null,
        statsNoteUk:
          'Shield Fortress: сильніший захист із щитом (~30 с), далі кулдаун.',
      };
    case 'l2_341': {
      const xr = l2dopXmlSkillRow(341, skillRank);
      return {
        mp: xr?.m ?? 48,
        power: xr?.p ?? 775,
        statsNoteUk:
          'Touch of Life: миттєвий self-heal, великий кулдаун.',
      };
    }
    case 'l2_342': {
      const xr = l2dopXmlSkillRow(342, skillRank);
      return {
        mp: xr?.m ?? 86,
        power: xr?.p ?? 280,
        statsNoteUk:
          'Touch of Death: потужний dark-удар з великим кулдауном.',
      };
    }
    case 'l2_350':
      return {
        mp: 52,
        power: null,
        statsNoteUk:
          'Physical Mirror: відбиває частину фізичної шкоди (~60 с), далі кулдаун.',
      };
    case 'l2_368':
      return {
        mp: 48,
        power: null,
        statsNoteUk:
          'Vengeance: менший вхідний фіз. урон + відбиття (~30 с), далі кулдаун.',
      };
    case 'l2_313': {
      const SNIPE_MP = [28, 29, 30, 31, 32, 33, 34, 34] as const;
      const SNIPE_POW = [124, 134, 145, 155, 166, 177, 188, 199] as const;
      const idx = Math.min(Math.max(1, skillRank), SNIPE_MP.length) - 1;
      return {
        mp: SNIPE_MP[idx]!,
        power: SNIPE_POW[idx]!,
        statsNoteUk:
          'З луком: бонус до P.Atk і точності, +20 до криту (~60 с, далі кулдаун).',
      };
    }
    case 'l2_111':
      return {
        mp: 50,
        power: null,
        statsNoteUk:
          'Ultimate Evasion: різко підвищує ухилення (~30 с), далі довгий кулдаун.',
      };
    case 'l2_344': {
      const xr = l2dopXmlSkillRow(344, skillRank);
      return {
        mp: xr?.m ?? 58,
        power: xr?.p ?? 6856,
        statsNoteUk:
          'Lethal Blow: сильний удар кинжалом (Adventurer).',
      };
    }
    case 'l2_356':
      return {
        mp: 42,
        power: null,
        statsNoteUk:
          'Focus Chance: тимчасовий бонус шансу криту (~300 с).',
      };
    case 'l2_357':
      return {
        mp: 42,
        power: null,
        statsNoteUk:
          'Focus Power: тимчасовий бонус фізичної атаки (~300 с).',
      };
    case 'l2_358':
      return {
        mp: 48,
        power: null,
        statsNoteUk:
          'Bluff: короткий дебаф захисту цілі + бонус сили криту (~8 с).',
      };
    case 'l2_99': {
      const r = Math.max(1, skillRank);
      return {
        mp: r >= 2 ? 20 : 14,
        power: null,
        statsNoteUk:
          r >= 2
            ? 'Ранг 2: MP 20, ~+12% швидкості атаки з луком (~60 с, далі кулдаун).'
            : 'Ранг 1: MP 14, ~+8% (~60 с); другий ранг у магістрі — MP 20, ~+12%.',
      };
    }
    case 'l2_101': {
      row = stunShotMpAndPower(skillRank);
      if (!row) {
        return {
          mp: null,
          power: null,
          statsNoteUk: 'Гілка розбійника; у бою — лише з луком.',
        };
      }
      const stunPct = Math.min(70, 40 + Math.max(1, skillRank) * 2);
      return {
        mp: row.mp,
        power: row.power,
        statsNoteUk:
          'Stun Shot: гарантований урон; шанс оглушення ~' +
          stunPct +
          '% (при успіху ціль пропускає контрудар).',
      };
    }
    case 'l2_343':
      return {
        mp: 170,
        power: 5132,
        statsNoteUk: 'Sagittarius; потужний постріл з лука; оверхіт.',
      };
    case 'l2_354':
      {
        const hamPct = Math.min(70, 45 + Math.max(1, skillRank) * 2);
        return {
          mp: 86,
          power: 1973,
          statsNoteUk:
            'Sagittarius; урон і шанс сповільнення ~' +
            hamPct +
            '% (контрудар цілі може бути пропущено); потрібен лук.',
        };
      }
    default: {
      const idM = /^l2_(\d+)$/.exec(b);
      if (!idM) return { mp: null, power: null, statsNoteUk: null };
      const id = parseInt(idM[1], 10);
      const xr = l2dopXmlSkillRow(id, skillRank);
      if (!xr) return { mp: null, power: null, statsNoteUk: null };
      return {
        mp: xr.m,
        power: xr.p !== 0 ? xr.p : null,
        statsNoteUk: null,
      };
    }
  }

  if (
    row &&
    typeof row === 'object' &&
    'mp' in row &&
    'power' in row
  ) {
    return {
      mp: row.mp,
      power: row.power,
      statsNoteUk: null,
    };
  }
  return { mp: null, power: null, statsNoteUk: null };
}

export function magisterBattleStatsPreview(
  battleId: string,
  kind: HumanFighterSkillKind,
  playerLevel: number,
  catalogMinLevel: number,
  skillRank: number
): { mp: number | null; power: number | null; statsNoteUk: string | null } {
  const b = canonicalBattleSkillId(battleId);
  const core = magisterBattleStatsPreviewCore(
    battleId,
    kind,
    playerLevel,
    catalogMinLevel,
    skillRank
  );
  if (kind === 'passive' || kind === 'toggle') return core;
  return applyL2dopXmlMagisterOverlay(b, skillRank, core);
}
