/**
 * Допоміжні функції fighter-turn перед resolveHumanFighterTurnCore.
 */
import {
  fighterProfessionAllowedForRace,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isFighterClassBranch,
} from '../../data/l2dopHumanFighterBattleSkills.js';
import {
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  jsonFiniteNum,
} from '../battle.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import type { BattleActionId } from '../battle.js';
import {
  canonicalBattleIdForAction,
  canonicalBattleSkillId,
  catalogEntryVisibleForProfession,
  humanFighterCatalogEntry,
} from '../../data/humanFighterSkillCatalog.js';
import type { HumanFighterSkillCatalogEntry } from '../../data/humanFighterSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { raceFighterCatalogEntryVisibleForProfession } from '../../data/raceFighterSkillCatalog.professionRules.js';
import { l2dopXmlSkillRow } from '../../data/l2dopXmlSkillLevels.lookup.js';
import { cooldownSecForSkillId } from '../../data/skillCooldowns.js';
import { resolveBattleSkillCooldownSec } from '../../data/skillCooldownScaling.js';
import { buffDurationSecForSkillId } from '../../data/l2dopBuffDurations.js';
import { sonicChargeRequirementForSkillId } from '../sonicCharges.js';
import { BattleSkillNotAllowedError } from '../battleSkillNotAllowedError.js';

export function warriorProfOkForSkill(ctx: BattleSkillResolveContext): boolean {
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

export function warlordBranchProfession(l2Profession: string): boolean {
  const p = String(l2Profession).trim();
  return p === 'human_warlord' || p === 'human_dreadnought';
}

/** Друга профа гілки гладіатора + третя (Duelist). */
export function gladiatorBranchProfession(l2Profession: string): boolean {
  const p = String(l2Profession).trim();
  return p === 'human_gladiator' || p === 'human_duelist';
}

/** Спільні детекти / Howl тощо: обидві гілки після Warrior. */
export function warlordOrGladiatorTier2(l2Profession: string): boolean {
  return (
    warlordBranchProfession(l2Profession) ||
    gladiatorBranchProfession(l2Profession)
  );
}

export function swordOrBluntWeapon(wk: string | undefined): boolean {
  return (
    wk === 'sword' ||
    wk === 'blunt' ||
    wk === 'bigsword' ||
    wk === 'bigblunt'
  );
}

/** Дуальний меч (обидві ланки Gladiator/Duelist). */
export function dualSwordWeapon(wk: string | undefined): boolean {
  return wk === 'dual' || wk === 'dualsword';
}

/** Меч/булава/дуал — зброя для «загальних» sonic-скілів (Blaster/Buster/Storm). */
export function swordOrBluntOrDualWeapon(wk: string | undefined): boolean {
  return swordOrBluntWeapon(wk) || dualSwordWeapon(wk);
}

/**
 * Перевіряє та повертає витрату Sonic Focus зарядів для `skillId`. Якщо поточних
 * зарядів не вистачає — кидає `battle_skill_not_enough_charges` (клієнт переклав у
 * зрозуміле повідомлення). Повертає кількість, яку треба відняти через
 * `sonicChargesPatch.delta = -cost`.
 */
export function requireSonicChargeCost(
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

export function sonicMasteryLifestealHeal(
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
const WARRIOR_ACCUM_BASE_INTERVAL_SEC = 1.5;
const WARRIOR_ACCUM_MIN_ASPD = 400;
const WARRIOR_ACCUM_MAX_ASPD = 3000;
const WARRIOR_ACCUM_MAX_ASPD_INTERVAL_SEC = 0.5;
const WARRIOR_ACCUM_MAX_HITS = 15;
const DREADNOUGHT_SKILL_MASTERY_CD_RESET_CHANCE = 0.08;
const DREADNOUGHT_SKILL_MASTERY_DURATION_CHANCE = 0.08;
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

export function rollAccumulatedWarriorAttack(
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
      ' | удари ' +
      landedHits +
      '/' +
      WARRIOR_ACCUM_MAX_HITS +
      ' | крит ' +
      critHits +
      ' | промахи ' +
      missHits
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
export function legacyBuffExpiresPatch(
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
export const COOLDOWN_READY_GRACE_MS = 50;

export function isCooldownBlocked(
  cooldownUntilMs: number | undefined,
  nowMs: number = Date.now()
): boolean {
  if (typeof cooldownUntilMs !== 'number' || !Number.isFinite(cooldownUntilMs)) {
    return false;
  }
  return cooldownUntilMs - nowMs > COOLDOWN_READY_GRACE_MS;
}

export function assertSkillCooldownReady(
  cooldownUntilMs: number | undefined,
  nowMs: number = Date.now()
): void {
  if (!isCooldownBlocked(cooldownUntilMs, nowMs)) return;
  const readyAtMs =
    typeof cooldownUntilMs === 'number' && Number.isFinite(cooldownUntilMs)
      ? Math.floor(cooldownUntilMs)
      : nowMs + COOLDOWN_READY_GRACE_MS;
  throw new BattleSkillNotAllowedError({
    reason: 'cooldown',
    remainingCooldownMs: Math.max(1, readyAtMs - nowMs),
    serverNowMs: nowMs,
    cooldownReadyAtMs: readyAtMs,
  });
}

export function legacyBuffOnCd(
  ctx: BattleSkillResolveContext,
  skillId: number
): boolean {
  const cd = ctx.st.mysticSkillCdUntil?.['l2_' + skillId];
  return isCooldownBlocked(typeof cd === 'number' ? cd : undefined);
}

/**
 * Спільні поля результату для self-buff-скіла: CD і expires. Додається через
 * spread у `return {... legacyBuffCdAndExpirePatches(skillId) }`.
 * Обидва значення беруться з генеричних таблиць (`humanFighterSkillCooldowns`,
 * `l2dopBuffDurations`), тож нові бафи автоматично отримують коректну поведінку.
 */
export function effectiveCastSpdForCooldown(
  ctx: BattleSkillResolveContext
): number {
  return Math.max(
    1,
    Math.floor(
      ctx.combat.castSpd *
        (jsonFiniteNum(ctx.st.battleMods?.mysticCastSpdBuffMul) ?? 1)
    )
  );
}

export function scaledSkillCooldownSec(
  ctx: BattleSkillResolveContext,
  baseCdSec: number | undefined | null,
  entry?: { kind?: string; category?: string | null } | null
): number {
  if (typeof baseCdSec !== 'number' || !Number.isFinite(baseCdSec) || baseCdSec <= 0) {
    return 0;
  }
  return resolveBattleSkillCooldownSec({
    classBranch: ctx.classBranch,
    category: entry?.category,
    kind: entry?.kind,
    skillRank: skillRankForCurrentAction(ctx),
    baseCdSec,
    castSpd: effectiveCastSpdForCooldown(ctx),
    pAtkSpd: ctx.combat.pAtkSpd,
    cooldownReductionMul: ctx.combat.cooldownReductionMul,
  });
}

export function legacyBuffCdAndExpirePatches(
  skillId: number,
  ctx: BattleSkillResolveContext
): {
  mysticSkillCdUntilPatch?: Record<string, number>;
  battleModsExpiresPatch?: Record<string, number>;
} {
  const out: {
    mysticSkillCdUntilPatch?: Record<string, number>;
    battleModsExpiresPatch?: Record<string, number>;
  } = {};
  const nowMs = Date.now();
  const entry = humanFighterCatalogEntry('l2_' + skillId);
  const rawCd = cooldownSecForSkillId(skillId);
  const cdSec = scaledSkillCooldownSec(ctx, rawCd, entry);
  if (cdSec > 0) {
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

export function maybeApplyDreadnoughtSkillMastery(
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

export function requireCatalogEntryForAction(
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
export function resolveFighterCatalogBattleId(action: BattleActionId): string | undefined {
  const m = canonicalBattleIdForAction(action);
  if (m) return m;
  const s = String(action);
  if (/^l2_\d+$/.test(s)) return s;
  return undefined;
}

/** Людський каталог або race fighter (Orc/Elf/…) — для скілів на кшталт Zealot (420). */
export function catalogAllowsFighterAction(
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
  return raceFighterCatalogEntryVisibleForProfession(rf, l2Profession);
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

export function stubMpForCanon(canon: string, rank: number = 1): number {
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
export function skillRankForCurrentAction(ctx: BattleSkillResolveContext): number {
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
export function applyStandardFighterCooldown(
  ctx: BattleSkillResolveContext,
  result: BattleSkillTurnResult
): BattleSkillTurnResult {
  if (result.skipStandardCooldown) return result;
  /** War Cry / Battle Roar / Thrill Fight — CD лише через `activeBuffPatch` у performBattleAction. */
  if (result.activeBuffPatch) return result;
  const battleId = battleIdForCooldownAction(ctx.action);
  if (!battleId) return result;

  const existingOwn = result.mysticSkillCdUntilPatch?.[battleId];
  if (existingOwn !== undefined) return result;

  const ent =
    humanFighterCatalogEntry(battleId) ??
    fighterCatalogEntryForRace(ctx.race, ctx.classBranch, battleId);
  const entryCd =
    typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
      ? ent.cooldownSec
      : undefined;
  /**
   * Fallback: якщо запис каталогу не має `cooldownSec`, беремо значення з
   * автогенерованої таблиці XML L2DOP (`humanFighterSkillCooldowns.generated`).
   * Це покриває sonic-скіли Gladiator/Duelist (Triple Slash, Sonic Focus/
   * Blaster/Buster/Storm, Double/Triple Sonic Slash, Fatal Strike, Hammer Crush),
   * у яких CD задано в XML, а в каталозі поле лишилось порожнім.
   */
  let rawCdSec = entryCd;
  if (rawCdSec == null) {
    const m = /^l2_(\d+)$/.exec(battleId);
    if (m) {
      const sid = parseInt(m[1]!, 10);
      if (Number.isFinite(sid) && sid > 0) {
        const xmlCd = cooldownSecForSkillId(sid);
        if (typeof xmlCd === 'number' && xmlCd > 0) {
          rawCdSec = xmlCd;
        }
      }
    }
  }
  const cdSec =
    ent?.kind === 'toggle'
      ? typeof rawCdSec === 'number' && rawCdSec > 0
        ? rawCdSec
        : 0
      : scaledSkillCooldownSec(ctx, rawCdSec, ent);
  if (cdSec <= 0) return result;

  const until = jsonFiniteNum(ctx.st.mysticSkillCdUntil?.[battleId]);
  const toggleAlreadyOn =
    ((battleId === 'l2_256' && isStanceAccuracyActive(ctx.st.battleMods)) ||
      (battleId === 'l2_312' && isStanceViciousActive(ctx.st.battleMods)) ||
      (battleId === 'l2_339' && isStanceParryActive(ctx.st.battleMods)) ||
      (battleId === 'l2_318' && ctx.st.battleMods?.aegisStanceActive === true));
  if (isCooldownBlocked(until) && !toggleAlreadyOn) {
    assertSkillCooldownReady(until);
  }

  return {
    ...result,
    mysticSkillCdUntilPatch: {
      ...(result.mysticSkillCdUntilPatch ?? {}),
      [battleId]: Date.now() + cdSec * 1000,
    },
  };
}
