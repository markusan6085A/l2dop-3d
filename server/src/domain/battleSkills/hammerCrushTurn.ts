/**
 * Hammer Crush (260) — спільний резолвер для fighter і orc-mystic гілок.
 */
import {
  HAMMER_CRUSH_COOLDOWN_SEC,
  hammerCrushStunDurationMs,
  spawnBlocksHammerCrushStun,
} from '../../data/hammerCrushTables.js';
import { humanFighterProfessionAtkMult } from '../../data/l2dopHumanFighterBattleSkills.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { mysticCatalogEntryForRace } from '../../data/mysticSkillCatalog.byRace.js';
import { mysticCatalogEntryVisibleForProfession } from '../../data/humanMysticSkillCatalog.js';
import { l2dopXmlMpPower } from '../../data/l2dopXmlSkillLevels.lookup.js';
import { resolveBattleSkillCooldownSec } from '../../data/skillCooldownScaling.js';
import { skillCooldownReadyAtMs } from '../../data/skillCooldowns.js';
import {
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';
import type { BattleBattleMods } from '../battle.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import {
  HAMMER_CRUSH_BASE_STUN_CHANCE_PCT,
  HAMMER_CRUSH_STUN_CHANCE_CAP_PCT,
  HAMMER_CRUSH_STUN_PER_RANK_PCT,
} from './humanFighterTurnConstants.js';
import {
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  effectiveCastSpdForCooldown,
  isCooldownBlocked,
  skillRankForCurrentAction,
  stubMpForCanon,
} from './humanFighterTurnHelpers.js';
import { isFighterClassBranch } from '../../data/l2dopHumanFighterBattleSkills.js';

const HAMMER_CRUSH_SKILL_ID = 260;
const HAMMER_CRUSH_BATTLE_ID = 'l2_260';

function hammerCrushEntryVisible(
  ctx: BattleSkillResolveContext
): boolean {
  if (isFighterClassBranch(ctx.classBranch)) {
    return catalogAllowsFighterAction(
      'hammer_crush',
      String(ctx.l2Profession),
      ctx.race,
      ctx.classBranch
    );
  }
  const entry = mysticCatalogEntryForRace(ctx.race, HAMMER_CRUSH_BATTLE_ID);
  if (!entry || entry.kind === 'passive') return false;
  return mysticCatalogEntryVisibleForProfession(
    entry,
    String(ctx.l2Profession)
  );
}

function hammerCrushRank(ctx: BattleSkillResolveContext): number {
  const fromMap = ctx.learnedSkillLevelByBattleId?.[HAMMER_CRUSH_BATTLE_ID];
  if (typeof fromMap === 'number' && fromMap >= 1) return Math.floor(fromMap);
  return skillRankForCurrentAction(ctx);
}

export function resolveHammerCrushTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult {
  if (!hammerCrushEntryVisible(ctx)) {
    throw new Error('battle_skill_not_allowed');
  }
  if (ctx.weaponKind !== 'blunt' && ctx.weaponKind !== 'bigblunt') {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = hammerCrushRank(ctx);
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const cdUntil = ctx.st.mysticSkillCdUntil?.[HAMMER_CRUSH_BATTLE_ID];
  if (isCooldownBlocked(cdUntil)) {
    assertSkillCooldownReady(cdUntil);
  }

  const xml = l2dopXmlMpPower(HAMMER_CRUSH_SKILL_ID, rank);
  const mp = xml?.mp ?? stubMpForCanon(HAMMER_CRUSH_BATTLE_ID, rank);
  const pow = xml?.power ?? 680;
  const profM = humanFighterProfessionAtkMult(ctx.preLevel, ctx.l2Profession);
  const atk = Math.floor(ctx.combat.pAtk * (1.17 + pow / 440) * profM);
  const r = rollPhys(atk, { forceNoMiss: true });

  const stunBlocked = spawnBlocksHammerCrushStun(ctx.spawnKind);
  let appliedStun = false;
  let battleModsPatch: Partial<BattleBattleMods> | undefined;

  if (!stunBlocked && r.outcome !== 'miss' && r.damage > 0) {
    const stunChancePct = Math.min(
      HAMMER_CRUSH_STUN_CHANCE_CAP_PCT,
      HAMMER_CRUSH_BASE_STUN_CHANCE_PCT + rank * HAMMER_CRUSH_STUN_PER_RANK_PCT
    );
    const effStunPct = scaleLandChancePercentAfterResist(
      stunChancePct,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    appliedStun = Math.random() * 100 < effStunPct;
    if (appliedStun) {
      const until = Date.now() + hammerCrushStunDurationMs(rank);
      battleModsPatch = {
        mobStunUntilMs: until,
        mobStunIconSkillId: HAMMER_CRUSH_SKILL_ID,
      };
    }
  }

  const stunSec = Math.round(hammerCrushStunDurationMs(rank) / 1000);
  let skillLine: string;
  if (stunBlocked) {
    skillLine =
      'Скрушний молот (Hammer Crush): удар пройшов; оглушення не діє на РБ/епіків.';
  } else if (appliedStun) {
    skillLine =
      'Скрушний молот (Hammer Crush): ціль оглушена (Shock) ~' +
      stunSec +
      ' с.';
  } else {
    skillLine =
      'Скрушний молот (Hammer Crush): удар завдано; оглушення не спрацювало.';
  }

  const cdSec = resolveBattleSkillCooldownSec({
    classBranch: ctx.classBranch,
    category: 'physical_attack',
    kind: 'battle',
    skillRank: rank,
    baseCdSec: HAMMER_CRUSH_COOLDOWN_SEC,
    l2SkillId: HAMMER_CRUSH_SKILL_ID,
    castSpd: effectiveCastSpdForCooldown(ctx),
    pAtkSpd: ctx.combat.pAtkSpd,
    cooldownReductionMul: ctx.combat.cooldownReductionMul,
  });
  const mysticSkillCdUntilPatch: Record<string, number> = {};
  if (cdSec > 0) {
    mysticSkillCdUntilPatch[HAMMER_CRUSH_BATTLE_ID] =
      skillCooldownReadyAtMs(Date.now(), cdSec);
  }

  return {
    mpCost: mp,
    pDmg: r.damage,
    skillLine,
    physOutcome: r.outcome,
    magicOutcome: null,
    ...(battleModsPatch ? { battleModsPatch } : {}),
    ...(appliedStun
      ? { skipMobCounterAttackOnce: true, mobRetaliationDelayHits: 2 }
      : {}),
    mysticSkillCdUntilPatch,
    ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
  };
}

/** Експорт для перевірки каталогу race-fighter (Destroyer / BH / Warsmith). */
export function raceFighterHasHammerCrush(
  race: string,
  classBranch: string
): boolean {
  const e = fighterCatalogEntryForRace(race, classBranch, HAMMER_CRUSH_BATTLE_ID);
  return !!e && e.kind !== 'passive';
}
