/**
 * Бойові дії людини-воїна (пакет l2dopHumanFighterBattleSkills).
 *
 * Урон по «AoE» скілах (Whirlwind, Thunder Storm, Earthquake, …) у цій моделі — лише по
 * `mobHp` у `battleJson`, як у text-rpg для однієї цілі; не додається до pAtk/mAtk у профілі
 * (`computeCombatStats` у `performBattleAction` не бачить `battleMods`).
 */
import {
  burstShotMpAndPower,
  doubleShotMpAndPower,
  fighterProfessionAllowedForRace,
  humanFighterProfessionAtkMult,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isFighterClassBranch,
  mortalBlowMpAndPower,
  powerShotMpAndPower,
  powerSmashMpAndPower,
  powerStrikeMpAndPower,
  provokeMpAndPower,
  stunAttackMpAndPower,
  stunShotMpAndPower,
  thunderStormMpAndPower,
  wildSweepMpAndPower,
  whirlwindMpAndPower,
} from '../../data/l2dopHumanFighterBattleSkills.js';
import {
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  jsonFiniteNum,
  type BattleBattleMods,
} from '../battle.js';
import {
  effectiveMobDebuffResistPct,
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';

/**
 * Скіли «гілки воїна» (Power Smash, Wild Sweep, подвійний постріл тощо): людина — явний список;
 * інші раси — будь-яка fighter-профа цієї раси з `fighterProfessionAllowedForRace` (орк, гном, ельф…).
 */
function warriorProfOkForSkill(ctx: BattleSkillResolveContext): boolean {
  const p = String(ctx.l2Profession).trim();
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
  if (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && p === 'human_fighter') {
    return true;
  }
  if (!isFighterClassBranch(ctx.classBranch)) return false;
  const r = String(ctx.race ?? '').trim().toLowerCase();
  return fighterProfessionAllowedForRace(p, r);
}

function warlordBranchProfession(l2Profession: string): boolean {
  const p = String(l2Profession).trim();
  return p === 'human_warlord' || p === 'human_dreadnought';
}

/** Друга профа гілки гладіатора + третя (Duelist). */
function gladiatorBranchProfession(l2Profession: string): boolean {
  const p = String(l2Profession).trim();
  return p === 'human_gladiator' || p === 'human_duelist';
}

/** Спільні детекти / Howl тощо: обидві гілки після Warrior. */
function warlordOrGladiatorTier2(l2Profession: string): boolean {
  return (
    warlordBranchProfession(l2Profession) ||
    gladiatorBranchProfession(l2Profession)
  );
}

function swordOrBluntWeapon(wk: string | undefined): boolean {
  return (
    wk === 'sword' ||
    wk === 'blunt' ||
    wk === 'bigsword' ||
    wk === 'bigblunt'
  );
}

/** Дуальний меч (обидві ланки Gladiator/Duelist). */
function dualSwordWeapon(wk: string | undefined): boolean {
  return wk === 'dual' || wk === 'dualsword';
}

/** Меч/булава/дуал — зброя для «загальних» sonic-скілів (Blaster/Buster/Storm). */
function swordOrBluntOrDualWeapon(wk: string | undefined): boolean {
  return swordOrBluntWeapon(wk) || dualSwordWeapon(wk);
}

/**
 * Перевіряє та повертає витрату Sonic Focus зарядів для `skillId`. Якщо поточних
 * зарядів не вистачає — кидає `battle_skill_not_enough_charges` (клієнт переклав у
 * зрозуміле повідомлення). Повертає кількість, яку треба відняти через
 * `sonicChargesPatch.delta = -cost`.
 */
function requireSonicChargeCost(
  ctx: BattleSkillResolveContext,
  skillId: number
): number {
  const cost = sonicChargeRequirementForSkillId(skillId);
  if (cost <= 0) return 0;
  const cur = ctx.st.sonicCharges ?? 0;
  if (cur < cost) {
    throw new Error('battle_skill_not_enough_charges');
  }
  return cost;
}

const SONIC_MASTERY_SKILL_IDS = new Set([5, 6, 7, 9, 261]);
const SONIC_MASTERY_VAMPIRISM_RATIO = 0.15;

function sonicMasteryLifestealHeal(
  ctx: BattleSkillResolveContext,
  skillId: number,
  dealtDamage: number
): number {
  if (!SONIC_MASTERY_SKILL_IDS.has(skillId)) return 0;
  if (dealtDamage <= 0) return 0;
  const rank = ctx.learnedSkillLevelByBattleId?.['l2_992'] ?? 0;
  if (rank < 1) return 0;
  return Math.max(
    1,
    Math.floor(Math.max(0, dealtDamage) * SONIC_MASTERY_VAMPIRISM_RATIO)
  );
}
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import type { BattleActionId } from '../battle.js';
import { ZEALOT_EFFECT_DURATION_MS } from '../battleTypes.js';
import {
  battleActionNamedFromL2IfMapped,
  canonicalBattleIdForAction,
  canonicalBattleSkillId,
  catalogEntryVisibleForProfession,
  humanFighterCatalogEntry,
} from '../../data/humanFighterSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { mysticCatalogEntryVisibleForProfession } from '../../data/humanMysticSkillCatalog.professionRules.js';
import { tryResolveFighterRaceCatalogTurn } from './fighterRaceCatalogTurn.js';
import { resolveHumanFighterGapSkillsTurn } from './humanFighterGapSkillsTurn.js';
import type { HumanFighterSkillCatalogEntry } from '../../data/humanFighterSkillCatalog.js';
import {
  l2dopXmlMpPower,
  l2dopXmlSkillRow,
} from '../../data/l2dopXmlSkillLevels.lookup.js';
import {
  L2DOP_FRENZY,
  L2DOP_FRENZY2HS,
  L2DOP_FRENZY2HSACC,
  l2dopTableAt,
} from '../../data/l2dopRawdataBuffTables.js';
import {
  mobMaxCpFromMobMaxHp,
  WRATH_EFFECT_RADIUS_WORLD,
  wrathCpDrainPercentForSkillLevel,
} from '../../data/wrathSkillConstants.js';
import { cooldownSecForSkillId } from '../../data/skillCooldowns.js';
import { buffDurationSecForSkillId } from '../../data/l2dopBuffDurations.js';
import {
  SONIC_FOCUS_GAIN_PER_CAST,
  SONIC_MAX_CHARGES_DEFAULT,
  sonicChargeRequirementForSkillId,
} from '../sonicCharges.js';

const WARRIOR_ACCUM_BASE_INTERVAL_SEC = 1.5;
const WARRIOR_ACCUM_MIN_ASPD = 400;
const WARRIOR_ACCUM_MAX_ASPD = 3000;
const WARRIOR_ACCUM_MAX_ASPD_INTERVAL_SEC = 0.5;
const WARRIOR_ACCUM_MAX_HITS = 15;
const DREADNOUGHT_SKILL_MASTERY_CD_RESET_CHANCE = 0.08;
const DREADNOUGHT_SKILL_MASTERY_DURATION_CHANCE = 0.08;
const SHOCK_BLAST_PDEF_DEBUFF_MS = 10_000;
const HAMMER_CRUSH_BASE_STUN_CHANCE_PCT = 45;
const HAMMER_CRUSH_STUN_PER_RANK_PCT = 2;
const HAMMER_CRUSH_STUN_CHANCE_CAP_PCT = 75;
const STUN_SHOT_BASE_STUN_CHANCE_PCT = 40;
const STUN_SHOT_STUN_PER_RANK_PCT = 2;
const STUN_SHOT_STUN_CHANCE_CAP_PCT = 70;
const HAMSTRING_SHOT_BASE_CONTROL_CHANCE_PCT = 45;
const HAMSTRING_SHOT_CONTROL_PER_RANK_PCT = 2;
const HAMSTRING_SHOT_CONTROL_CHANCE_CAP_PCT = 70;

function warriorAccumHitsForPAtkSpd(pAtkSpd: number): {
  intervalSec: number;
} {
  const aspd = Math.max(
    WARRIOR_ACCUM_MIN_ASPD,
    Math.min(WARRIOR_ACCUM_MAX_ASPD, Math.floor(pAtkSpd))
  );
  const t =
    (aspd - WARRIOR_ACCUM_MIN_ASPD) /
    (WARRIOR_ACCUM_MAX_ASPD - WARRIOR_ACCUM_MIN_ASPD);
  const intervalSec =
    WARRIOR_ACCUM_BASE_INTERVAL_SEC +
    t * (WARRIOR_ACCUM_MAX_ASPD_INTERVAL_SEC - WARRIOR_ACCUM_BASE_INTERVAL_SEC);
  return {
    intervalSec,
  };
}

function rollAccumulatedWarriorAttack(
  rollPhys: PhysicalRollFn,
  atk: number,
  pAtkSpd: number,
  lastPlayerAttackAtMs?: number
): {
  damage: number;
  outcome: 'miss' | 'hit' | 'crit';
  linesUk: string[];
  weaknessLogLineUk?: string;
} {
  const { intervalSec } = warriorAccumHitsForPAtkSpd(pAtkSpd);
  const nowMs = Date.now();
  const elapsedSec =
    typeof lastPlayerAttackAtMs === 'number' &&
    Number.isFinite(lastPlayerAttackAtMs) &&
    lastPlayerAttackAtMs > 0
      ? Math.max(0, (nowMs - lastPlayerAttackAtMs) / 1000)
      : intervalSec;
  const hits = Math.max(
    1,
    Math.min(WARRIOR_ACCUM_MAX_HITS, Math.floor(elapsedSec / intervalSec))
  );
  let totalDamage = 0;
  let normalHits = 0;
  let critHits = 0;
  let missHits = 0;
  let normalDamage = 0;
  let critDamage = 0;
  const linesUk: string[] = [];
  let weaknessLogLineUk: string | undefined;
  for (let i = 0; i < hits; i++) {
    const r = rollPhys(atk);
    totalDamage += r.damage;
    if (r.outcome === 'crit') {
      critHits++;
      critDamage += r.damage;
    } else if (r.outcome === 'hit') {
      normalHits++;
      normalDamage += r.damage;
    } else {
      missHits++;
    }
    if (weaknessLogLineUk == null && r.weaknessLogLineUk) {
      weaknessLogLineUk = r.weaknessLogLineUk;
    }
  }
  const outcome: 'miss' | 'hit' | 'crit' = normalHits + critHits <= 0
    ? 'miss'
    : critHits > 0
      ? 'crit'
      : 'hit';
  const landedHits = normalHits + critHits;
  linesUk.push(
    'Комбо: ' +
      normalDamage +
      '/' +
      critDamage +
      ' урона | ' +
      landedHits +
      '/' +
      WARRIOR_ACCUM_MAX_HITS +
      ' ударів (' +
      critHits +
      ' крит, ' +
      missHits +
      ' промахи).'
  );
  return {
    damage: totalDamage,
    outcome,
    linesUk,
    ...(weaknessLogLineUk ? { weaknessLogLineUk } : {}),
  };
}

/**
 * Час закінчення legacy-бафа у `battleMods` (ключ `battleModsExpiresPatch["<skillId>"]`).
 * Повертає `undefined`, якщо для скіла не задана тривалість у `l2dopBuffDurations`.
 */
function legacyBuffExpiresPatch(
  skillId: number
): Record<string, number> | undefined {
  const sec = buffDurationSecForSkillId(skillId);
  if (sec === undefined || sec <= 0) return undefined;
  return { [String(skillId)]: Date.now() + Math.floor(sec * 1000) };
}

/**
 * Перевірка, чи скіл `skillId` ще на кулдауні в поточному бою. Використовується
 * замість гілки toggle-off: повторний каст неможливий, поки йде CD — кидаємо
 * `battle_skill_not_allowed`, клієнт показує сірий overlay на хотбарі.
 */
function legacyBuffOnCd(
  ctx: BattleSkillResolveContext,
  skillId: number
): boolean {
  const cd = ctx.st.mysticSkillCdUntil?.['l2_' + skillId];
  return typeof cd === 'number' && Date.now() < cd;
}

/**
 * Спільні поля результату для self-buff-скіла: CD і expires. Додається через
 * spread у `return {... legacyBuffCdAndExpirePatches(skillId) }`.
 * Обидва значення беруться з генеричних таблиць (`humanFighterSkillCooldowns`,
 * `l2dopBuffDurations`), тож нові бафи автоматично отримують коректну поведінку.
 */
function legacyBuffCdAndExpirePatches(skillId: number): {
  mysticSkillCdUntilPatch?: Record<string, number>;
  battleModsExpiresPatch?: Record<string, number>;
} {
  const out: {
    mysticSkillCdUntilPatch?: Record<string, number>;
    battleModsExpiresPatch?: Record<string, number>;
  } = {};
  const nowMs = Date.now();
  const cdSec = cooldownSecForSkillId(skillId);
  if (typeof cdSec === 'number' && cdSec > 0) {
    out.mysticSkillCdUntilPatch = {
      ['l2_' + skillId]: nowMs + Math.floor(cdSec * 1000),
    };
  }
  const exp = legacyBuffExpiresPatch(skillId);
  if (exp) out.battleModsExpiresPatch = exp;
  return out;
}

function dreadnoughtSkillMasteryRank(ctx: BattleSkillResolveContext): number {
  const p = String(ctx.l2Profession || '').trim();
  if (p !== 'human_dreadnought') return 0;
  const rank = ctx.learnedSkillLevelByBattleId?.['l2_330'];
  return typeof rank === 'number' && rank >= 1 ? Math.floor(rank) : 0;
}

function maybeApplyDreadnoughtSkillMastery(
  ctx: BattleSkillResolveContext,
  result: BattleSkillTurnResult
): BattleSkillTurnResult {
  if (dreadnoughtSkillMasteryRank(ctx) < 1) return result;
  const battleId = battleIdForCooldownAction(ctx.action);
  if (!battleId || battleId === 'l2_330') return result;
  const hasDuration =
    result.battleModsExpiresPatch != null &&
    Object.keys(result.battleModsExpiresPatch).length > 0;
  const hasCandidateCd =
    result.mysticSkillCdUntilPatch?.[battleId] !== undefined || !hasDuration;
  if (!hasDuration && !hasCandidateCd) return result;
  const procChance = hasDuration
    ? DREADNOUGHT_SKILL_MASTERY_DURATION_CHANCE
    : DREADNOUGHT_SKILL_MASTERY_CD_RESET_CHANCE;
  if (Math.random() >= procChance) return result;

  const masteryLine =
    result.skillLine.length > 0
      ? result.skillLine + ' Майстерність скілів спрацювала.'
      : 'Майстерність скілів спрацювала.';

  if (hasDuration) {
    const now = Date.now();
    const src = result.battleModsExpiresPatch ?? {};
    const nextExp: Record<string, number> = {};
    for (const [sid, until] of Object.entries(src)) {
      if (typeof until !== 'number' || !Number.isFinite(until)) continue;
      const remMs = Math.max(0, Math.floor(until - now));
      nextExp[sid] = now + remMs * 2;
    }
    return {
      ...result,
      skillLine: masteryLine,
      ...(Object.keys(nextExp).length > 0
        ? { battleModsExpiresPatch: nextExp }
        : {}),
    };
  }

  const cdPatch = { ...(result.mysticSkillCdUntilPatch ?? {}) };
  delete cdPatch[battleId];
  return {
    ...result,
    skillLine: masteryLine,
    ...(Object.keys(cdPatch).length > 0
      ? { mysticSkillCdUntilPatch: cdPatch }
      : {}),
    skipStandardCooldown: true,
  };
}

function requireCatalogEntryForAction(
  action: BattleActionId,
  l2Profession: string
): HumanFighterSkillCatalogEntry {
  const canon = canonicalBattleIdForAction(action);
  if (!canon) throw new Error('battle_skill_not_allowed');
  const entry = humanFighterCatalogEntry(canon);
  if (!entry) throw new Error('battle_skill_not_allowed');
  if (!catalogEntryVisibleForProfession(entry, l2Profession)) {
    throw new Error('battle_skill_not_allowed');
  }
  return entry;
}

/** Канон `l2_*` для каталогу: з мапи дій або прямий id (расові скіли без іменованої дії). */
function resolveFighterCatalogBattleId(action: BattleActionId): string | undefined {
  const m = canonicalBattleIdForAction(action);
  if (m) return m;
  const s = String(action);
  if (/^l2_\d+$/.test(s)) return s;
  return undefined;
}

/** Людський каталог або race fighter (Orc/Elf/…) — для скілів на кшталт Zealot (420). */
function catalogAllowsFighterAction(
  action: BattleActionId,
  l2Profession: string,
  race: string,
  classBranch: string
): boolean {
  const canon = resolveFighterCatalogBattleId(action);
  if (!canon) return false;
  const human = humanFighterCatalogEntry(canon);
  if (human && catalogEntryVisibleForProfession(human, l2Profession)) {
    return true;
  }
  const rf = fighterCatalogEntryForRace(race, classBranch, canon);
  if (!rf) return false;
  return mysticCatalogEntryVisibleForProfession(rf, l2Profession);
}

/** MP першого рангу (як у прев’ю магістра); узгоджено з skillLearnService. */
const STUB_SKILL_MP: Record<string, number> = {
  l2_75: 14,
  l2_80: 24,
  l2_87: 18,
  l2_88: 27,
  l2_104: 21,
  l2_116: 29,
  l2_121: 18,
  l2_130: 21,
  l2_181: 25,
  l2_287: 16,
  l2_317: 18,
  l2_320: 73,
  l2_347: 87,
  l2_359: 70,
  l2_360: 71,
  l2_361: 65,
  l2_420: 106,
  l2_94: 25,
  l2_139: 19,
  l2_176: 21,
};

function stubMpForCanon(canon: string, rank: number = 1): number {
  const idM = /^l2_(\d+)$/.exec(canon);
  if (idM) {
    const id = parseInt(idM[1], 10);
    const row = l2dopXmlSkillRow(id, rank);
    if (row && Number.isFinite(row.m) && row.m >= 0) return row.m;
  }
  const n = STUB_SKILL_MP[canon];
  return typeof n === 'number' && n >= 0 ? n : 10;
}

/** Ранг поточної дії з snapshot; без мапи — як раніше (лише рівень персонажа). */
function skillRankForCurrentAction(ctx: BattleSkillResolveContext): number {
  const m = ctx.learnedSkillLevelByBattleId;
  const canon =
    canonicalBattleIdForAction(ctx.action) ??
    canonicalBattleSkillId(String(ctx.action));
  if (!m) return 999;
  const v = m[canon];
  if (typeof v === 'number' && v >= 1) return v;
  return 1;
}

/** `l2_<id>` для зіставлення з каталогом КД (іменовані дії → канонічний battleId). */
function battleIdForCooldownAction(action: BattleActionId): string | undefined {
  const named = canonicalBattleIdForAction(action);
  if (named && /^l2_\d+$/.test(named)) {
    return canonicalBattleSkillId(named);
  }
  const s = String(action);
  if (/^l2_\d+$/.test(s)) return canonicalBattleSkillId(s);
  return undefined;
}

/**
 * КД з каталогу (людина + расові файли) після резолву урону/бафів.
 * Якщо гілка вже виставила `mysticSkillCdUntilPatch` для цього ключа — не чіпаємо.
 */
function applyStandardFighterCooldown(
  ctx: BattleSkillResolveContext,
  result: BattleSkillTurnResult
): BattleSkillTurnResult {
  if (result.skipStandardCooldown) return result;
  const battleId = battleIdForCooldownAction(ctx.action);
  if (!battleId) return result;

  const existingOwn = result.mysticSkillCdUntilPatch?.[battleId];
  if (existingOwn !== undefined) return result;

  const ent =
    humanFighterCatalogEntry(battleId) ??
    fighterCatalogEntryForRace(ctx.race, ctx.classBranch, battleId);
  const isToggle = ent?.kind === 'toggle';
  const entryCd = isToggle
    ? 1
    : typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
      ? ent.cooldownSec
      : undefined;
  /**
   * Fallback: якщо запис каталогу не має `cooldownSec`, беремо значення з
   * автогенерованої таблиці XML L2DOP (`humanFighterSkillCooldowns.generated`).
   * Це покриває sonic-скіли Gladiator/Duelist (Triple Slash, Sonic Focus/
   * Blaster/Buster/Storm, Double/Triple Sonic Slash, Fatal Strike, Hammer Crush),
   * у яких CD задано в XML, а в каталозі поле лишилось порожнім.
   */
  let cdSec = entryCd;
  if (cdSec == null) {
    const m = /^l2_(\d+)$/.exec(battleId);
    if (m) {
      const sid = parseInt(m[1]!, 10);
      if (Number.isFinite(sid) && sid > 0) {
        const xmlCd = cooldownSecForSkillId(sid);
        if (typeof xmlCd === 'number' && xmlCd > 0) {
          cdSec = xmlCd;
        }
      }
    }
  }
  if (cdSec == null) return result;

  const until = jsonFiniteNum(ctx.st.mysticSkillCdUntil?.[battleId]);
  const toggleAlreadyOn =
    isToggle &&
    ((battleId === 'l2_256' && isStanceAccuracyActive(ctx.st.battleMods)) ||
      (battleId === 'l2_312' && isStanceViciousActive(ctx.st.battleMods)) ||
      (battleId === 'l2_339' && isStanceParryActive(ctx.st.battleMods)) ||
      (battleId === 'l2_318' && ctx.st.battleMods?.aegisStanceActive === true));
  if (until !== undefined && Date.now() < until && !toggleAlreadyOn) {
    throw new Error('battle_skill_not_allowed');
  }

  return {
    ...result,
    mysticSkillCdUntilPatch: {
      ...(result.mysticSkillCdUntilPatch ?? {}),
      [battleId]: Date.now() + cdSec * 1000,
    },
  };
}

export function resolveHumanFighterTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult {
  const masteryResult = maybeApplyDreadnoughtSkillMastery(
    ctx,
    resolveHumanFighterTurnCore(ctx, rollPhys)
  );
  return applyStandardFighterCooldown(
    ctx,
    masteryResult
  );
}

function resolveHumanFighterTurnCore(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult {
  const { combat, preLevel, l2Profession } = ctx;
  const action = battleActionNamedFromL2IfMapped(ctx.action);
  const profM = humanFighterProfessionAtkMult(preLevel, l2Profession);
  const rank = skillRankForCurrentAction(ctx);

  if (action === 'attack') {
    const r = rollAccumulatedWarriorAttack(
      rollPhys,
      combat.pAtk,
      combat.pAtkSpd,
      ctx.st.lastPlayerAttackAtMs
    );
    return {
      mpCost: 0,
      pDmg: r.damage,
      skillLine: '',
      physOutcome: r.outcome,
      magicOutcome: null,
      playerDamageLogLines: r.linesUk,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'power_strike') {
    const ps =
      l2dopXmlMpPower(3, rank) ?? powerStrikeMpAndPower(preLevel, rank);
    if (!ps) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.08 + ps.power / 450) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ps.mp,
      pDmg: r.damage,
      skillLine: 'Силовий удар (3, Power Strike).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'mortal_blow') {
    const mb =
      l2dopXmlMpPower(16, rank) ?? mortalBlowMpAndPower(preLevel, rank);
    if (!mb) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.07 + mb.power / 440) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: mb.mp,
      pDmg: r.damage,
      skillLine: 'Смертельний удар (16, Mortal Blow).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'power_shot') {
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const pshot =
      l2dopXmlMpPower(56, rank) ?? powerShotMpAndPower(preLevel, rank);
    if (!pshot) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.07 + pshot.power / 500) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: pshot.mp,
      pDmg: r.damage,
      skillLine: 'Силовий постріл (56, Power Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'double_shot') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const ds =
      l2dopXmlMpPower(19, rank) ?? doubleShotMpAndPower(preLevel, rank);
    if (!ds) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.09 + ds.power / 420) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ds.mp,
      pDmg: r.damage,
      skillLine: 'Подвійний постріл (19, Double Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'burst_shot') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const bs =
      l2dopXmlMpPower(24, rank) ?? burstShotMpAndPower(preLevel, rank);
    if (!bs) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.08 + bs.power / 480) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: bs.mp,
      pDmg: r.damage,
      skillLine: 'Вибуховий залп (24, Burst Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'war_cry') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    /**
     * Не-тогл self-buff: повторне натискання НЕ вимикає ефект, а лише оновлює
     * тривалість (L2 Interlude). Якщо скіл на КД — кидаємо `battle_skill_not_allowed`,
     * клієнт показує сірий overlay на хотбарі.
     */
    const cdUntil = ctx.st.mysticSkillCdUntil?.['l2_78'];
    if (typeof cdUntil === 'number' && Date.now() < cdUntil) {
      throw new Error('battle_skill_not_allowed');
    }
    const wcRow = l2dopXmlSkillRow(78, rank);
    return {
      mpCost: wcRow?.m ?? 10,
      pDmg: 0,
      skillLine:
        'Бойовий клич (War Cry): +фіз. урон (L2 Interlude тривалість).',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 78, level: rank, action: 'add' },
    };
  }

  if (action === 'dash') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 4)) {
      throw new Error('battle_skill_not_allowed');
    }
    const DASH_MP = [10, 21] as const;
    const DASH_RUN_FLAT = [40, 66] as const;
    const r = Math.min(Math.max(1, rank), DASH_MP.length);
    const idx = r - 1;
    const dashRow = l2dopXmlSkillRow(4, rank);
    return {
      mpCost: dashRow?.m ?? DASH_MP[idx]!,
      pDmg: 0,
      skillLine:
        'Ривок (Dash): бонус до швидкості пересування в цьому бою (+' +
        (dashRow?.s ?? DASH_RUN_FLAT[idx]) +
        ').',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        dashRunSpeedFlat: dashRow?.s ?? DASH_RUN_FLAT[idx]!,
      },
      ...legacyBuffCdAndExpirePatches(4),
    };
  }

  if (action === 'rapid_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    if (legacyBuffOnCd(ctx, 99)) {
      throw new Error('battle_skill_not_allowed');
    }
    const rapidRow = l2dopXmlSkillRow(99, rank);
    const RAPID_MP = rapidRow?.m ?? (rank >= 2 ? 20 : 14);
    const RAPID_MUL = rapidRow?.r ?? (rank >= 2 ? 1.12 : 1.08);
    return {
      mpCost: RAPID_MP,
      pDmg: 0,
      skillLine:
        'Швидкий постріл (Rapid Shot): вища швидкість атаки з луком.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { rapidShotAspdMul: RAPID_MUL },
      ...legacyBuffCdAndExpirePatches(99),
    };
  }

  if (action === 'snipe') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    if (legacyBuffOnCd(ctx, 313)) {
      throw new Error('battle_skill_not_allowed');
    }
    const SNIPE_MP = [28, 29, 30, 31, 32, 33, 34, 34] as const;
    const SNIPE_POW = [124, 134, 145, 155, 166, 177, 188, 199] as const;
    const idx = Math.min(Math.max(1, rank), SNIPE_MP.length) - 1;
    const snipeRow = l2dopXmlSkillRow(313, rank);
    const pow = snipeRow?.a ?? SNIPE_POW[idx]!;
    return {
      mpCost: snipeRow?.m ?? SNIPE_MP[idx]!,
      pDmg: 0,
      skillLine:
        'Точний постріл (Snipe): бонус до точності, P.Atk і криту.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        snipePatkFlat: pow,
        snipeAccuracyFlat: pow,
        snipeCritRateAdd: 20,
      },
      ...legacyBuffCdAndExpirePatches(313),
    };
  }

  if (action === 'stun_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const ss =
      l2dopXmlMpPower(101, rank) ?? stunShotMpAndPower(rank);
    const atk = Math.floor(combat.pAtk * (1.07 + ss.power / 420) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    const stunChancePct = Math.min(
      STUN_SHOT_STUN_CHANCE_CAP_PCT,
      STUN_SHOT_BASE_STUN_CHANCE_PCT + rank * STUN_SHOT_STUN_PER_RANK_PCT
    );
    const effStunPct = scaleLandChancePercentAfterResist(
      stunChancePct,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    const appliedStun =
      r.damage > 0 &&
      r.outcome !== 'miss' &&
      Math.random() * 100 < effStunPct;
    return {
      mpCost: ss.mp,
      pDmg: r.damage,
      skillLine: appliedStun
        ? 'Оглушливий постріл (101, Stun Shot): ціль оглушено (~' +
          Math.round(effStunPct) +
          '%).'
        : 'Оглушливий постріл (101, Stun Shot): оглушення не спрацювало (~' +
          Math.round(effStunPct) +
          '%).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedStun ? { skipMobCounterAttackOnce: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'lethal_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const lethalXml = l2dopXmlMpPower(343, rank);
    const LETHAL_MP = lethalXml?.mp ?? 170;
    const LETHAL_POW = lethalXml?.power ?? 5132;
    const atk = Math.floor(
      combat.pAtk * (1.28 + LETHAL_POW / 2200) * profM
    );
    const r = rollPhys(atk);
    return {
      mpCost: LETHAL_MP,
      pDmg: r.damage,
      skillLine: 'Смертельний постріл (343, Lethal Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'hamstring_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const hamXml = l2dopXmlMpPower(354, rank);
    const HS_MP = hamXml?.mp ?? 86;
    const HS_POW = hamXml?.power ?? 1973;
    const atk = Math.floor(combat.pAtk * (1.12 + HS_POW / 480) * profM);
    const r = rollPhys(atk);
    const controlChancePct = Math.min(
      HAMSTRING_SHOT_CONTROL_CHANCE_CAP_PCT,
      HAMSTRING_SHOT_BASE_CONTROL_CHANCE_PCT +
        rank * HAMSTRING_SHOT_CONTROL_PER_RANK_PCT
    );
    const effControlPct = scaleLandChancePercentAfterResist(
      controlChancePct,
      effectiveMobDebuffResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    const appliedControl =
      r.damage > 0 &&
      r.outcome !== 'miss' &&
      Math.random() * 100 < effControlPct;
    return {
      mpCost: HS_MP,
      pDmg: r.damage,
      skillLine: appliedControl
        ? 'Постріл у сухожилля (354, Hamstring Shot): ціль сповільнено (~' +
          Math.round(effControlPct) +
          '%).'
        : 'Постріл у сухожилля (354, Hamstring Shot): сповільнення не спрацювало (~' +
          Math.round(effControlPct) +
          '%).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedControl ? { skipMobCounterAttackOnce: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'battle_roar') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    /**
     * Не-тогл: повторне натискання оновлює тривалість, не знімає. КД блокує refresh.
     */
    const brCd = ctx.st.mysticSkillCdUntil?.['l2_121'];
    if (typeof brCd === 'number' && Date.now() < brCd) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_121', rank),
      pDmg: 0,
      skillLine:
        'Бойовий рик (Battle Roar): +Max HP і миттєвий хіл (L2 Interlude).',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 121, level: rank, action: 'add' },
    };
  }

  if (action === 'stun_attack') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    const sa =
      l2dopXmlMpPower(100, rank) ?? stunAttackMpAndPower(preLevel, rank);
    if (!sa) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.06 + sa.power / 480) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    return {
      mpCost: sa.mp,
      pDmg: r.damage,
      skillLine: 'Приголомшувальний удар (100, Stun Attack).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'wild_sweep') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    const ws =
      l2dopXmlMpPower(245, rank) ?? wildSweepMpAndPower(preLevel, rank);
    if (!ws) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.1 + ws.power / 700) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ws.mp,
      pDmg: r.damage,
      skillLine: 'Дикий розмах (245, Wild Sweep).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'power_smash') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    const sm =
      l2dopXmlMpPower(255, rank) ?? powerSmashMpAndPower(preLevel, rank);
    if (!sm) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.08 + sm.power / 470) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: sm.mp,
      pDmg: r.damage,
      skillLine: 'Розгром (255, Power Smash).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'whirlwind') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    const ww =
      l2dopXmlMpPower(36, rank) ?? whirlwindMpAndPower(preLevel, rank);
    if (!ww) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.1 + ww.power / 700) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ww.mp,
      pDmg: r.damage,
      skillLine:
        'Вихор (36, Whirlwind): урон по головній цілі та до 2 поруч (до 3 цілей загалом).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'thunder_storm') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    const ts =
      l2dopXmlMpPower(48, rank) ?? thunderStormMpAndPower(preLevel, rank);
    if (!ts) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.12 + ts.power / 250) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ts.mp,
      pDmg: r.damage,
      skillLine: 'Грозова буря (48, Thunder Storm).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'provoke') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    const pr =
      l2dopXmlMpPower(286, rank) ?? provokeMpAndPower(preLevel, rank);
    if (!pr) throw new Error('battle_skill_not_allowed');
    return {
      mpCost: pr.mp,
      pDmg: 0,
      skillLine:
        'Провокація масова (Provoke): агро/дебаф — без прямого урону по мобу.',
      physOutcome: null,
      magicOutcome: null,
    };
  }

  if (action === 'detect_insect_weakness') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 75)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_75', rank),
      pDmg: 0,
      skillLine:
        'Вразливість комах: більший фіз. урон проти комах (L2 Interlude 300 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'insect', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(75),
    };
  }

  if (action === 'detect_monster_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 80)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_80', rank),
      pDmg: 0,
      skillLine:
        'Вразливість монстрів: більший фіз. урон проти монстрів (300 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'monster', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(80),
    };
  }

  if (action === 'detect_animal_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 87)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_87', rank),
      pDmg: 0,
      skillLine: 'Вразливість звірів: більший урон проти тварин (300 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'animal', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(87),
    };
  }

  if (action === 'detect_dragon_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 88)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_88', rank),
      pDmg: 0,
      skillLine: 'Вразливість драконів: більший урон проти драконів (300 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'dragon', weaknessPatkMul: 1.35 },
      ...legacyBuffCdAndExpirePatches(88),
    };
  }

  if (action === 'detect_plant_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 104)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_104', rank),
      pDmg: 0,
      skillLine:
        'Вразливість рослин: більший урон проти рослинних істот (300 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'plant', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(104),
    };
  }

  if (action === 'howl') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 116)) {
      throw new Error('battle_skill_not_allowed');
    }
    const HOWL_MOB_PATK = 0.77;
    return {
      mpCost: stubMpForCanon('l2_116', rank),
      pDmg: 0,
      skillLine: 'Звіриний рев: слабший удар моба (~−23% його P.Atk), 120 с.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobPatkDebuffMul: HOWL_MOB_PATK },
      ...legacyBuffCdAndExpirePatches(116),
    };
  }

  if (action === 'thrill_fight') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Не-тогл: повторне натискання оновлює тривалість. КД блокує refresh.
     */
    const tfCd = ctx.st.mysticSkillCdUntil?.['l2_130'];
    if (typeof tfCd === 'number' && Date.now() < tfCd) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_130', rank),
      pDmg: 0,
      skillLine:
        'Азарт бою: +ASPD (L2 Interlude тривалість).',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 130, level: rank, action: 'add' },
    };
  }

  if (action === 'zealot') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_zealot_wrong_class');
    }
    const ZEALOT_ASPD = [1.1, 1.2, 1.3] as const;
    const ZEALOT_RUN = [10, 20, 30] as const;
    const ZEALOT_ACC = 6;
    const ZEALOT_CRIT_ADD = [33, 66, 100] as const;
    const ZEALOT_CRIT_DMG = [1.33, 1.66, 2.0] as const;
    const ZEALOT_HP_COST = [159, 183, 204] as const;
    const idx = Math.min(ZEALOT_ASPD.length - 1, Math.max(0, rank - 1));
    const zealCdUntil = jsonFiniteNum(ctx.st.mysticSkillCdUntil?.['l2_420']);
    if (
      zealCdUntil !== undefined &&
      Number.isFinite(zealCdUntil) &&
      Date.now() < zealCdUntil
    ) {
      throw new Error('battle_zealot_cooldown');
    }
    const maxH = Math.max(1, ctx.playerMaxHpInBattle);
    if (ctx.playerHpInBattle > maxH * 0.3 + 1e-6) {
      throw new Error('battle_zealot_need_low_hp');
    }
    const zealEntry = fighterCatalogEntryForRace(
      ctx.race,
      ctx.classBranch,
      'l2_420'
    );
    const zealCdSec =
      typeof zealEntry?.cooldownSec === 'number' && zealEntry.cooldownSec > 0
        ? zealEntry.cooldownSec
        : 900;
    const now = Date.now();
    return {
      mpCost: stubMpForCanon('l2_420', rank),
      pDmg: 0,
      skillLine:
        'Zealot: бойовий стан (~' +
        Math.round(ZEALOT_EFFECT_DURATION_MS / 1000) +
        ' с), HP ≤ 30%, витрата HP.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        zealotAspdMul: ZEALOT_ASPD[idx]!,
        zealotRunSpeedFlat: ZEALOT_RUN[idx]!,
        zealotAccuracyFlat: ZEALOT_ACC,
        zealotCritRateAdd: ZEALOT_CRIT_ADD[idx]!,
        zealotCritDmgMul: ZEALOT_CRIT_DMG[idx]!,
        zealotUntilMs: now + ZEALOT_EFFECT_DURATION_MS,
      },
      playerHpCost: ZEALOT_HP_COST[idx]!,
      mysticSkillCdUntilPatch: { l2_420: now + zealCdSec * 1000 },
    };
  }

  if (action === 'revival') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const maxH = Math.max(1, ctx.playerMaxHpInBattle);
    if (ctx.playerHpInBattle > maxH * 0.1) {
      throw new Error('battle_skill_not_allowed');
    }
    const heal = Math.min(
      maxH - ctx.playerHpInBattle,
      Math.max(1, Math.floor(maxH * 0.85))
    );
    return {
      mpCost: stubMpForCanon('l2_181', rank),
      pDmg: 0,
      skillLine: 'Відродження: сильне зцілення.',
      physOutcome: null,
      magicOutcome: null,
      playerHeal: heal,
    };
  }

  if (action === 'lionheart') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 287)) {
      throw new Error('battle_skill_not_allowed');
    }
    const LION_INCOMING = 0.88;
    return {
      mpCost: stubMpForCanon('l2_287', rank),
      pDmg: 0,
      skillLine: 'Левине серце: менший вхідний фіз. урон від моба (60 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { lionheartIncomingPhysMul: LION_INCOMING },
      ...legacyBuffCdAndExpirePatches(287),
    };
  }

  if (action === 'eye_hunter') {
    const ep = String(l2Profession).trim();
    if (ep !== 'human_dreadnought' && ep !== 'human_duelist') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 359)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_359', rank),
      pDmg: 0,
      skillLine:
        'Око мисливця: більший урон проти комах, рослин і звірів (300 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'eye_hunter', weaknessPatkMul: 1.4 },
      ...legacyBuffCdAndExpirePatches(359),
    };
  }

  if (action === 'eye_slayer') {
    const ep = String(l2Profession).trim();
    if (ep !== 'human_dreadnought' && ep !== 'human_duelist') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 360)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_360', rank),
      pDmg: 0,
      skillLine:
        'Око вбивці: більший урон проти звірів, драконів, гігантів і магічних істот (300 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'eye_slayer', weaknessPatkMul: 1.4 },
      ...legacyBuffCdAndExpirePatches(360),
    };
  }

  if (action === 'focus_attack') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Не-тогл: повторний каст оновлює `expiresAt` у `battleModsExpiresAtMsBySkillId["317"]`.
     * Поки активний CD (L2 Interlude: CD=12 с, duration=30 с) — refresh заблокований:
     * `legacyBuffOnCd` кидає `battle_skill_not_allowed`. `legacyBuffCdAndExpirePatches`
     * повертає одночасно CD і експірацію, CD персистимо через `mysticSkillCdUntilPatch`.
     */
    const cdUntil = ctx.st.mysticSkillCdUntil?.['l2_317'];
    if (typeof cdUntil === 'number' && Date.now() < cdUntil) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_317', rank),
      pDmg: 0,
      skillLine:
        'Зосереджений удар: вища точність, шанс і сила криту (30 с, древко).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { focusAttackActive: true },
      ...legacyBuffCdAndExpirePatches(317),
    };
  }

  if (action === 'wrath') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const atk = Math.floor(
      combat.pAtk * (1.12 + Math.min(rank, 10) * 0.015) * profM
    );
    const r = rollPhys(atk);
    const rankEff = Math.min(10, Math.max(1, rank));
    const cpPct = wrathCpDrainPercentForSkillLevel(rankEff);
    const mobMaxCp =
      ctx.st.mobMaxCp ?? mobMaxCpFromMobMaxHp(ctx.st.mobMaxHp);
    const mobCpBefore =
      ctx.st.mobCp !== undefined ? ctx.st.mobCp : mobMaxCp;
    const rawCpDrain = Math.floor(mobMaxCp * (cpPct / 100));
    const mobCpDrain = Math.min(
      Math.max(0, mobCpBefore),
      Math.max(0, rawCpDrain)
    );
    return {
      mpCost: stubMpForCanon('l2_320', rank),
      pDmg: r.damage,
      skillLine:
        'Гнів: зона r≈' +
        WRATH_EFFECT_RADIUS_WORLD +
        ' (як «поруч» на карті). З max CP цілі знято ' +
        cpPct +
        '% (−' +
        mobCpDrain +
        ' CP).',
      physOutcome: r.outcome,
      magicOutcome: null,
      mobCpDrain,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'earthquake') {
    if (String(l2Profession).trim() !== 'human_dreadnought') {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const atk = Math.floor(combat.pAtk * 1.18 * profM);
    const r = rollPhys(atk);
    return {
      mpCost: stubMpForCanon('l2_347', rank),
      pDmg: r.damage,
      skillLine:
        'Землетрус (347, Earthquake): удар по площі; шанс збити темп контратаки цілі.',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'shock_blast') {
    if (String(l2Profession).trim() !== 'human_dreadnought') {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const atk = Math.floor(combat.pAtk * 1.14 * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    return {
      mpCost: stubMpForCanon('l2_361', rank),
      pDmg: r.damage,
      skillLine:
        'Ударний імпульс (361, Shock Blast): урон + тимчасово нижчий P.Def цілі.',
      physOutcome: r.outcome,
      magicOutcome: null,
      battleModsPatch: { mobTargetPDefMul: 0.88 },
      battleModsExpiresPatch: {
        '361': Date.now() + SHOCK_BLAST_PDEF_DEBUFF_MS,
      },
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'accuracy_stance') {
    const on = isStanceAccuracyActive(ctx.st.battleMods);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Стійка точності вимкнена.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { stanceAccuracy: false },
      };
    }
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine:
        'Стійка точності: вища точність і більший фіз. урон по мобу.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { stanceAccuracy: true },
    };
  }

  if (action === 'vicious_stance') {
    const on = isStanceViciousActive(ctx.st.battleMods);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Жорстка стійка вимкнена.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { stanceVicious: false },
      };
    }
    const rank = skillRankForCurrentAction(ctx);
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine:
        'Жорстка стійка: крит і сила криту за даними text-rpg (toggle 312).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        stanceVicious: true,
        viciousStanceSkillRank: rank >= 1 ? rank : 1,
      },
    };
  }

  if (action === 'parry_stance') {
    const on = isStanceParryActive(ctx.st.battleMods);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Стійка парування вимкнена.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { stanceParry: false },
      };
    }
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine:
        'Стійка парування: P.Def / M.Def, нижча точність і швидкість атаки (toggle 339, text-rpg).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { stanceParry: true },
    };
  }

  if (action === 'l2_94') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const rank = skillRankForCurrentAction(ctx);
    const ent = fighterCatalogEntryForRace(ctx.race, ctx.classBranch, 'l2_94');
    const row =
      ent?.levels?.find((l) => l.level === rank) ?? ent?.levels?.[0];
    const patkPct = row?.power ?? 55;
    const RAGE_PATK_MUL = 1 + Math.max(0, patkPct) / 100;
    const RAGE_PDEF_MUL = 0.88;
    if (legacyBuffOnCd(ctx, 94)) {
      throw new Error('battle_skill_not_allowed');
    }
    const mpCost = row?.mpCost ?? stubMpForCanon('l2_94', rank);
    const cdSec =
      typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
        ? ent.cooldownSec
        : undefined;
    const now = Date.now();
    const expPatch = legacyBuffExpiresPatch(94);
    return {
      mpCost,
      pDmg: 0,
      skillLine: 'Rage: сильніший фіз. удар; захист трохи нижчий.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        rageBattlePatkMul: RAGE_PATK_MUL,
        rageBattlePdefMul: RAGE_PDEF_MUL,
      },
      ...(cdSec != null
        ? { mysticSkillCdUntilPatch: { l2_94: now + cdSec * 1000 } }
        : {}),
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
    };
  }

  if (action === 'l2_176') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const rank = skillRankForCurrentAction(ctx);
    const ent = fighterCatalogEntryForRace(ctx.race, ctx.classBranch, 'l2_176');
    const row =
      ent?.levels?.find((l) => l.level === rank) ?? ent?.levels?.[0];
    const maxHp = ctx.playerMaxHpInBattle;
    const hp = ctx.playerHpInBattle;
    if (maxHp > 0 && hp / maxHp > 0.3 + 1e-9) {
      throw new Error('battle_frenzy_need_low_hp');
    }
    if (legacyBuffOnCd(ctx, 176)) {
      throw new Error('battle_skill_not_allowed');
    }
    const twoH =
      ctx.weaponKind === 'bigsword' || ctx.weaponKind === 'bigblunt';
    const patkMul = twoH
      ? l2dopTableAt(L2DOP_FRENZY2HS, rank)
      : l2dopTableAt(L2DOP_FRENZY, rank);
    const accFlat = twoH ? l2dopTableAt(L2DOP_FRENZY2HSACC, rank) : 0;
    const mpCost = row?.mpCost ?? stubMpForCanon('l2_176', rank);
    const cdSec =
      typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
        ? ent.cooldownSec
        : undefined;
    const now = Date.now();
    const patch: Partial<BattleBattleMods> = { frenzyBattlePatkMul: patkMul };
    if (accFlat > 0) {
      patch.frenzyBattleAccFlat = Math.floor(accFlat);
    }
    const expPatch = legacyBuffExpiresPatch(176);
    return {
      mpCost,
      pDmg: 0,
      skillLine:
        'Frenzy: різко сильніший фіз. удар (як у L2, лише при низькому HP).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: patch,
      ...(cdSec != null
        ? { mysticSkillCdUntilPatch: { l2_176: now + cdSec * 1000 } }
        : {}),
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
    };
  }

  if (action === 'l2_139') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const rank = skillRankForCurrentAction(ctx);
    const ent = fighterCatalogEntryForRace(ctx.race, ctx.classBranch, 'l2_139');
    const row =
      ent?.levels?.find((l) => l.level === rank) ?? ent?.levels?.[0];
    if (legacyBuffOnCd(ctx, 139)) {
      throw new Error('battle_skill_not_allowed');
    }
    const pow = row?.power ?? 2;
    const GUTS_PDEF_MUL = 1 + Math.max(0, pow) / 100;
    const mpCost = row?.mpCost ?? stubMpForCanon('l2_139', rank);
    const cdSec =
      typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
        ? ent.cooldownSec
        : undefined;
    const now = Date.now();
    const expPatch = legacyBuffExpiresPatch(139);
    return {
      mpCost,
      pDmg: 0,
      skillLine: 'Guts: міцніший захист.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { gutsBattlePdefMul: GUTS_PDEF_MUL },
      ...(cdSec != null
        ? { mysticSkillCdUntilPatch: { l2_139: now + cdSec * 1000 } }
        : {}),
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
    };
  }

  /* ============================================================
   * Gladiator / Duelist (гілка дуальних мечів + sonic-заряди).
   *
   * Джерела: l2db Interlude (gladiator) + text-rpg Skill_0001/0005/
   * 0006/0007/0008/0009/0190/0260/0261/0442/0451. Заряди Sonic Focus
   * (max 10, див. `SONIC_MAX_CHARGES_DEFAULT`) зберігаються в
   * `BattleJsonState.sonicCharges` / `WorldCombatState.sonicCharges` (через
   * F5/телепорт/вихід з бою), скидаються на смерть. Витрати — через
   * `SONIC_CHARGE_COST_BY_SKILL_ID`.
   * ============================================================ */

  if (action === 'triple_slash') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const mp =
      (l2dopXmlMpPower(1, rank)?.mp) ?? stubMpForCanon('l2_1', rank);
    const pow =
      (l2dopXmlMpPower(1, rank)?.power) ?? 431;
    const atk = Math.floor(combat.pAtk * (1.10 + pow / 520) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine: 'Потрійний удар (1, Triple Slash).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_focus') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Sonic Focus (8): додає +1 заряд до ліміту `SONIC_MAX_CHARGES_DEFAULT`.
     * CD у каталозі = 0 с (миттєве накопичення), тому не блокуємо. Якщо вже
     * досягнуто ліміту — не змінюємо (дозволяємо гравцю перевірити візуально).
     */
    const mp =
      (l2dopXmlMpPower(8, rank)?.mp) ?? stubMpForCanon('l2_8', rank);
    const cur = ctx.st.sonicCharges ?? 0;
    const max =
      typeof ctx.st.maxSonicCharges === 'number' && ctx.st.maxSonicCharges > 0
        ? ctx.st.maxSonicCharges
        : SONIC_MAX_CHARGES_DEFAULT;
    if (cur >= max) {
      throw new Error('battle_sonic_max_charges');
    }
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine:
        'Концентрація звуку: +' +
        SONIC_FOCUS_GAIN_PER_CAST +
        ' заряд Sonic Focus.',
      physOutcome: null,
      magicOutcome: null,
      sonicChargesPatch: {
        delta: SONIC_FOCUS_GAIN_PER_CAST,
        maxSet: SONIC_MAX_CHARGES_DEFAULT,
      },
    };
  }

  if (action === 'sonic_blaster') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntOrDualWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 6);
    const mp = (l2dopXmlMpPower(6, rank)?.mp) ?? stubMpForCanon('l2_6', rank);
    const pow = (l2dopXmlMpPower(6, rank)?.power) ?? 300;
    const atk = Math.floor(combat.pAtk * (1.09 + pow / 540) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 6, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Звуковий залп (6, Sonic Blaster): −' + cost + ' заряд Sonic Focus.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'double_sonic_slash') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 5);
    const mp = (l2dopXmlMpPower(5, rank)?.mp) ?? stubMpForCanon('l2_5', rank);
    const pow = (l2dopXmlMpPower(5, rank)?.power) ?? 450;
    const atk = Math.floor(combat.pAtk * (1.12 + pow / 500) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 5, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Подвійний звуковий удар (5, Double Sonic Slash): −' +
        cost +
        ' заряди.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_buster') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntOrDualWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 9);
    const mp = (l2dopXmlMpPower(9, rank)?.mp) ?? stubMpForCanon('l2_9', rank);
    const pow = (l2dopXmlMpPower(9, rank)?.power) ?? 520;
    const atk = Math.floor(combat.pAtk * (1.13 + pow / 500) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 9, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Звуковий розрив (9, Sonic Buster): −' + cost + ' заряд Sonic Focus.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_storm') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntOrDualWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 7);
    const mp = (l2dopXmlMpPower(7, rank)?.mp) ?? stubMpForCanon('l2_7', rank);
    const pow = (l2dopXmlMpPower(7, rank)?.power) ?? 600;
    const atk = Math.floor(combat.pAtk * (1.15 + pow / 460) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 7, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Звукова буря (7, Sonic Storm): −' + cost + ' заряди Sonic Focus.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'triple_sonic_slash') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 261);
    const mp =
      (l2dopXmlMpPower(261, rank)?.mp) ?? stubMpForCanon('l2_261', rank);
    const pow =
      (l2dopXmlMpPower(261, rank)?.power) ?? 720;
    const atk = Math.floor(combat.pAtk * (1.16 + pow / 460) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 261, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Потрійний звуковий удар (261, Triple Sonic Slash): −' +
        cost +
        ' заряди.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'fatal_strike') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const mp =
      (l2dopXmlMpPower(190, rank)?.mp) ?? stubMpForCanon('l2_190', rank);
    const pow =
      (l2dopXmlMpPower(190, rank)?.power) ?? 540;
    const atk = Math.floor(combat.pAtk * (1.14 + pow / 460) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine: 'Фатальний удар (190, Fatal Strike).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'hammer_crush') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'blunt' && ctx.weaponKind !== 'bigblunt') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const mp =
      (l2dopXmlMpPower(260, rank)?.mp) ?? stubMpForCanon('l2_260', rank);
    const pow =
      (l2dopXmlMpPower(260, rank)?.power) ?? 680;
    const atk = Math.floor(combat.pAtk * (1.17 + pow / 440) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
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
    const appliedStun =
      r.outcome !== 'miss' &&
      r.damage > 0 &&
      Math.random() * 100 < effStunPct;
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine: appliedStun
        ? 'Скрушний молот (260, Hammer Crush): ціль оглушено, контрудар пропущено.'
        : 'Скрушний молот (260, Hammer Crush): оглушення не спрацювало.',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedStun ? { skipMobCounterAttackOnce: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_move') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Self-buff +speed на 15 с (L2 Interlude). Refresh-on-recast через
     * `legacyBuffCdAndExpirePatches(451)`. CD 30 с блокує повторний каст
     * до закінчення — поведінка як інші self-бафи гілки.
     */
    if (legacyBuffOnCd(ctx, 451)) {
      throw new Error('battle_skill_not_allowed');
    }
    const mp =
      (l2dopXmlMpPower(451, rank)?.mp) ?? stubMpForCanon('l2_451', rank);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine: 'Звуковий ривок: +швидкість пересування (15 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { dashRunSpeedFlat: 30 },
      ...legacyBuffCdAndExpirePatches(451),
    };
  }

  if (action === 'sonic_guard') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 442)) {
      throw new Error('battle_skill_not_allowed');
    }
    /**
     * Sonic Guard: потребує 5 зарядів Sonic Focus, дає сильне зниження вхідної
     * фіз. урона на 10 с. Refresh-on-recast, CD 180 с.
     */
    const cost = requireSonicChargeCost(ctx, 442);
    const mp =
      (l2dopXmlMpPower(442, rank)?.mp) ?? stubMpForCanon('l2_442', rank);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine:
        'Звуковий захист: −30% вхідної фіз. урона (10 с). −' +
        cost +
        ' заряди Sonic Focus.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { sanctuaryIncomingPhysMul: 0.7 },
      sonicChargesPatch: { delta: -cost },
      ...legacyBuffCdAndExpirePatches(442),
    };
  }

  const raceCat = tryResolveFighterRaceCatalogTurn(ctx, rollPhys);
  if (raceCat) return raceCat;

  const gap = resolveHumanFighterGapSkillsTurn(ctx, rollPhys);
  if (gap) return gap;

  throw new Error('battle_skill_not_allowed');
}
