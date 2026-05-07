import type { HumanFighterSkillKind } from '../data/humanFighterSkillCatalog.js';
import {
  HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL,
  HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL,
  HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
  HUMAN_FIGHTER_PRO_WARRIOR_LEVEL,
  HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL,
  burstShotMpAndPower,
  doubleShotMpAndPower,
  humanFighterProfessionAtkMult,
  mortalBlowMpAndPower,
  powerShotMpAndPower,
  powerSmashMpAndPower,
  powerStrikeMpAndPower,
  stunAttackMpAndPower,
  stunShotMpAndPower,
  thunderStormMpAndPower,
  wildSweepMpAndPower,
  whirlwindMpAndPower,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { l2dopXmlMpPower } from '../data/l2dopXmlSkillLevels.lookup.js';
import {
  canonicalBattleSkillId,
  isHumanGladiatorTrackProfession,
  isHumanWarlordTrackProfession,
} from '../data/humanFighterSkillCatalog.js';

function magisterWarriorPreviewProfOk(l2Profession: string): boolean {
  const p = String(l2Profession).trim();
  if (
    p === 'human_warrior' ||
    p === 'human_warlord' ||
    p === 'human_dreadnought' ||
    p === 'human_gladiator' ||
    p === 'human_duelist' ||
    p === 'human_knight' ||
    p === 'human_paladin' ||
    p === 'human_phoenix_knight' ||
    p === 'human_dark_avenger' ||
    p === 'human_hell_knight' ||
    p === 'human_rogue' ||
    p === 'human_treasure_hunter' ||
    p === 'human_adventurer' ||
    p === 'human_hawkeye' ||
    p === 'human_sagittarius'
  ) {
    return true;
  }
  return HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && p === 'human_fighter';
}

/**
 * База фізичного удару скілом (floor), як у `humanFighterTurn` перед `rollPhys`.
 * Не враховує P. Def., щит, крит — лише орієнтир для гравця.
 */
export function magisterEstimatedAtkBase(
  battleId: string,
  kind: HumanFighterSkillKind,
  playerLevel: number,
  catalogMinLevel: number,
  pAtk: number,
  l2Profession: string,
  skillRank: number
): number | null {
  if (kind === 'passive' || kind === 'toggle') return null;
  const b = canonicalBattleSkillId(battleId);
  const lv = Math.max(playerLevel, catalogMinLevel);
  const prof = String(l2Profession).trim();
  const profM = humanFighterProfessionAtkMult(lv, l2Profession);

  switch (b) {
    case 'l2_78':
      return Math.floor(pAtk * 1.02 * profM);
    case 'l2_3': {
      const ps =
        l2dopXmlMpPower(3, skillRank) ??
        powerStrikeMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_POWER_STRIKE_MIN_LEVEL),
          skillRank
        );
      if (!ps) return null;
      return Math.floor(pAtk * (1.08 + ps.power / 450) * profM);
    }
    case 'l2_56': {
      const pshot =
        l2dopXmlMpPower(56, skillRank) ??
        powerShotMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL),
          skillRank
        );
      if (!pshot) return null;
      return Math.floor(pAtk * (1.07 + pshot.power / 500) * profM);
    }
    case 'l2_16': {
      const mb =
        l2dopXmlMpPower(16, skillRank) ??
        mortalBlowMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL),
          skillRank
        );
      if (!mb) return null;
      return Math.floor(pAtk * (1.07 + mb.power / 440) * profM);
    }
    case 'l2_19': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const ds =
        l2dopXmlMpPower(19, skillRank) ??
        doubleShotMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL),
          skillRank
        );
      if (!ds) return null;
      return Math.floor(pAtk * (1.09 + ds.power / 420) * profM);
    }
    case 'l2_24': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const bs =
        l2dopXmlMpPower(24, skillRank) ??
        burstShotMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_MORTAL_POWERSHOT_MIN_LEVEL),
          skillRank
        );
      if (!bs) return null;
      return Math.floor(pAtk * (1.08 + bs.power / 480) * profM);
    }
    case 'l2_100': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const sa =
        l2dopXmlMpPower(100, skillRank) ??
        stunAttackMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_STUN_ATTACK_MIN_LEVEL),
          skillRank
        );
      if (!sa) return null;
      return Math.floor(pAtk * (1.06 + sa.power / 480) * profM);
    }
    case 'l2_245': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const ws =
        l2dopXmlMpPower(245, skillRank) ??
        wildSweepMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_PRO_WARRIOR_LEVEL),
          skillRank
        );
      if (!ws) return null;
      return Math.floor(pAtk * (1.1 + ws.power / 700) * profM);
    }
    case 'l2_255': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const sm =
        l2dopXmlMpPower(255, skillRank) ??
        powerSmashMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_PRO_WARRIOR_LEVEL),
          skillRank
        );
      if (!sm) return null;
      return Math.floor(pAtk * (1.08 + sm.power / 470) * profM);
    }
    case 'l2_36': {
      if (!isHumanWarlordTrackProfession(prof)) return null;
      const ww =
        l2dopXmlMpPower(36, skillRank) ??
        whirlwindMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_WHIRLWIND_MIN_LEVEL),
          skillRank
        );
      if (!ww) return null;
      return Math.floor(pAtk * (1.1 + ww.power / 700) * profM);
    }
    case 'l2_48': {
      if (!isHumanWarlordTrackProfession(prof)) return null;
      const ts =
        l2dopXmlMpPower(48, skillRank) ??
        thunderStormMpAndPower(
          Math.max(lv, HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL),
          skillRank
        );
      if (!ts) return null;
      return Math.floor(pAtk * (1.12 + ts.power / 250) * profM);
    }
    case 'l2_286': {
      if (!isHumanWarlordTrackProfession(prof)) return null;
      return null;
    }
    case 'l2_75': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      return Math.floor(pAtk * 1.03 * profM);
    }
    case 'l2_347': {
      if (prof !== 'human_dreadnought') return null;
      return Math.floor(pAtk * 1.18 * profM);
    }
    case 'l2_361': {
      if (prof !== 'human_dreadnought') return null;
      return Math.floor(pAtk * 1.14 * profM);
    }
    case 'l2_1': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const t = l2dopXmlMpPower(1, skillRank);
      const pow = t?.power ?? 431;
      return Math.floor(pAtk * (1.1 + pow / 520) * profM);
    }
    case 'l2_6': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const sb = l2dopXmlMpPower(6, skillRank);
      const pow = sb?.power ?? 300;
      return Math.floor(pAtk * (1.09 + pow / 540) * profM);
    }
    case 'l2_8': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      return null;
    }
    case 'l2_5': {
      if (!isHumanGladiatorTrackProfession(prof)) return null;
      const ds = l2dopXmlMpPower(5, skillRank);
      const pow = ds?.power ?? 450;
      return Math.floor(pAtk * (1.12 + pow / 500) * profM);
    }
    case 'l2_9': {
      if (!isHumanGladiatorTrackProfession(prof)) return null;
      const sb = l2dopXmlMpPower(9, skillRank);
      const pow = sb?.power ?? 520;
      return Math.floor(pAtk * (1.13 + pow / 500) * profM);
    }
    case 'l2_7': {
      if (!isHumanGladiatorTrackProfession(prof)) return null;
      const ss = l2dopXmlMpPower(7, skillRank);
      const pow = ss?.power ?? 600;
      return Math.floor(pAtk * (1.15 + pow / 460) * profM);
    }
    case 'l2_190': {
      if (!isHumanGladiatorTrackProfession(prof)) return null;
      const fs = l2dopXmlMpPower(190, skillRank);
      const pow = fs?.power ?? 540;
      return Math.floor(pAtk * (1.14 + pow / 460) * profM);
    }
    case 'l2_260': {
      if (!isHumanGladiatorTrackProfession(prof)) return null;
      const hc = l2dopXmlMpPower(260, skillRank);
      const pow = hc?.power ?? 680;
      return Math.floor(pAtk * (1.17 + pow / 440) * profM);
    }
    case 'l2_261': {
      if (!isHumanGladiatorTrackProfession(prof)) return null;
      const ts = l2dopXmlMpPower(261, skillRank);
      const pow = ts?.power ?? 720;
      return Math.floor(pAtk * (1.16 + pow / 460) * profM);
    }
    case 'l2_101': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const ss =
        l2dopXmlMpPower(101, skillRank) ?? stunShotMpAndPower(skillRank);
      if (!ss) return null;
      return Math.floor(pAtk * (1.07 + ss.power / 420) * profM);
    }
    case 'l2_343': {
      if (prof !== 'human_sagittarius') return null;
      const lt = l2dopXmlMpPower(343, skillRank);
      const pow = lt?.power ?? 5132;
      return Math.floor(pAtk * (1.28 + pow / 2200) * profM);
    }
    case 'l2_344': {
      if (prof !== 'human_adventurer') return null;
      const lb = l2dopXmlMpPower(344, skillRank);
      const pow = lb?.power ?? 6856;
      return Math.floor(pAtk * (1.35 + pow / 900) * profM);
    }
    case 'l2_49': {
      if (!magisterWarriorPreviewProfOk(prof)) return null;
      const hs = l2dopXmlMpPower(49, skillRank);
      const pow = hs?.power ?? 188;
      return Math.floor(pAtk * (1.12 + pow / 500) * profM);
    }
    case 'l2_342': {
      if (prof !== 'human_hell_knight') return null;
      const td = l2dopXmlMpPower(342, skillRank);
      const pow = td?.power ?? 280;
      return Math.floor(pAtk * (1.25 + pow / 400) * profM);
    }
    case 'l2_103': {
      if (prof !== 'human_dark_avenger' && prof !== 'human_hell_knight') {
        return null;
      }
      const cp = l2dopXmlMpPower(103, skillRank);
      const pow = cp?.power ?? 121;
      return Math.floor(pAtk * (1.05 + pow / 550) * profM);
    }
    case 'l2_127': {
      if (prof !== 'human_dark_avenger' && prof !== 'human_hell_knight') {
        return null;
      }
      const hs = l2dopXmlMpPower(127, skillRank);
      const pow = hs?.power ?? 188;
      return Math.floor(pAtk * (1.1 + pow / 480) * profM);
    }
    case 'l2_354': {
      if (prof !== 'human_sagittarius') return null;
      const hm = l2dopXmlMpPower(354, skillRank);
      const pow = hm?.power ?? 1973;
      return Math.floor(pAtk * (1.12 + pow / 480) * profM);
    }
    default:
      return null;
  }
}

export function magisterDamageHintUk(
  battleId: string,
  estimatedAtk: number | null,
  power: number | null
): string | null {
  if (estimatedAtk == null) return null;
  const b = canonicalBattleSkillId(battleId);
  let s =
    'Орієнт. база удару скілом (до захисту): ~' +
    estimatedAtk +
    (power != null ? ' · power ' + power : '') +
    '.';
  if (b === 'l2_36' || b === 'l2_48' || b === 'l2_245' || b === 'l2_347' || b === 'l2_361') {
    s += ' У бою потрібні алебарда або спис (древко).';
  }
  if (b === 'l2_56' || b === 'l2_101' || b === 'l2_343' || b === 'l2_354') {
    s += ' У бою потрібен лук.';
  }
  if (b === 'l2_100') {
    s += ' У бою потрібна булава (тупе).';
  }
  if (b === 'l2_255') {
    s += ' У бою потрібен меч або булава.';
  }
  if (b === 'l2_49' || b === 'l2_342') {
    s += ' У бою потрібен меч або булава.';
  }
  if (b === 'l2_127') {
    s += ' У бою потрібен меч або булава.';
  }
  if (b === 'l2_344') {
    s += ' У бою потрібен кинжал.';
  }
  if (b === 'l2_1' || b === 'l2_5' || b === 'l2_261') {
    s += ' У бою потрібен дуальний меч.';
  }
  if (b === 'l2_260') {
    s += ' У бою потрібна булава.';
  }
  if (b === 'l2_6' || b === 'l2_7' || b === 'l2_9' || b === 'l2_190') {
    s += ' У бою потрібен меч, булава або дуальний меч.';
  }
  return s;
}
