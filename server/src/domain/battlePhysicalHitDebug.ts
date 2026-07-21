/**
 * Детальний breakdown одного фізичного удару (debug / audit).
 * Дзеркалить rollPlayerPhysicalDmg без RNG (pre-variance значення).
 */
import type { BattleBattleMods } from './battleTypes.js';
import {
  isStanceAccuracyActive,
  isStanceViciousActive,
  isFocusAttackActive,
  jsonFiniteNum,
} from './battleModsJson.js';
import { computeCombatStats } from '../data/l2dopCombatFormulas.js';
import { textRpgHfToggleStanceDelta } from '../data/textRpgHfToggleBattleApply.js';
import {
  focusAttackCritDmgMultiplier,
  focusAttackRankFromLearnedMap,
  viciousStanceRankFromLearnedMap,
} from '../data/l2dopFocusAttack.js';
import { resolveViciousStanceEffectRank } from '../data/viciousStanceTables.js';
import { applyFocusPowerCritDmgMul } from '../data/focusPowerTables.js';
import { physicalCritChance } from '../data/l2dopHitResolution.js';
import { effectiveBattlePatkDisplay } from './battleEffectiveDisplay.js';

export type PhysicalHitDebugInput = {
  /** combat.pAtk з computeCombatStats (без soulshot). */
  baseCombatPatk: number;
  combat: ReturnType<typeof computeCombatStats>;
  battleMods?: BattleBattleMods;
  mobPDef: number;
  learnedSkillLevelByBattleId?: Record<string, number>;
  weaponKind?: string;
  /** Примусовий soulshot-множник (1.8–2.0); якщо undefined — з battleMods. */
  soulshotMulOverride?: number;
};

export type PhysicalHitDebugBreakdown = {
  attackerPAtk: number;
  targetPDef: number;
  baseDamageBeforeSoulshot: number;
  soulshotMultiplier: number;
  damageAfterSoulshot: number;
  normalHitDamage: number;
  normalCritCore: number;
  normalCritMultiplier: number;
  additionalCritDamagePct: number;
  critDamageFlat: number;
  critDmgMulProduct: number;
  damageAfterCrit: number;
  critRateStat: number;
  critChancePct: number;
  /** Множники P.Atk до soulshot. */
  patkMultipliers: {
    warCry: number;
    weakness: number;
    thrillFight: number;
    rage: number;
    frenzy: number;
    mysticPatkBuff: number;
    stanceAccuracy: number;
    soulshot: number;
  };
  /** Джерела critDmgMul (мультиplicativні). */
  critDmgMulLayers: Array<{ label: string; mul: number; running: number }>;
  /** Джерела addCritDmg (адитивні). */
  addCritDmgLayers: Array<{ label: string; flat: number; running: number }>;
  displayedPatkFromSnapshot: number;
  soulshotContributionInDisplayedPatk: number;
};

function buildCritLayers(
  combat: ReturnType<typeof computeCombatStats>,
  mods: BattleBattleMods | undefined,
  learned: Record<string, number> | undefined,
  weaponKind: string | undefined
): {
  critRate: number;
  critDmgMul: number;
  addCritDmg: number;
  layers: PhysicalHitDebugBreakdown['critDmgMulLayers'];
  flatLayers: PhysicalHitDebugBreakdown['addCritDmgLayers'];
} {
  let critRate = combat.critRate;
  let critDmgMul = combat.critDmgMul;
  let addCritDmg = combat.addCritDmg;
  const layers: PhysicalHitDebugBreakdown['critDmgMulLayers'] = [
    { label: 'snapshot (STR × passives/buffs)', mul: combat.critDmgMul, running: combat.critDmgMul },
  ];
  const flatLayers: PhysicalHitDebugBreakdown['addCritDmgLayers'] = [
    { label: 'snapshot addCritDmg', flat: combat.addCritDmg, running: combat.addCritDmg },
  ];

  if (isFocusAttackActive(mods)) {
    const fr = focusAttackRankFromLearnedMap(learned);
    const fa = focusAttackCritDmgMultiplier(fr);
    critDmgMul *= fa;
    layers.push({ label: `Focus Attack r${fr}`, mul: fa, running: critDmgMul });
  }
  if (isStanceViciousActive(mods)) {
    const rk = resolveViciousStanceEffectRank(
      viciousStanceRankFromLearnedMap(learned),
      mods
    );
    const d312 = textRpgHfToggleStanceDelta(312, rk);
    if (d312?.addCritDmg) {
      addCritDmg += d312.addCritDmg;
      flatLayers.push({
        label: `Vicious Stance r${rk} flat`,
        flat: d312.addCritDmg,
        running: addCritDmg,
      });
    }
    if (d312?.addCrit) {
      critRate = Math.min(500, Math.floor(critRate + d312.addCrit));
    }
    if (d312?.critDmgMul != null && d312.critDmgMul > 0 && Number.isFinite(d312.critDmgMul)) {
      critDmgMul *= d312.critDmgMul;
      layers.push({
        label: `Vicious Stance r${rk} %`,
        mul: d312.critDmgMul,
        running: critDmgMul,
      });
    }
  }
  const blfOut = jsonFiniteNum(mods?.bluffCritDmgMul);
  if (blfOut !== undefined && blfOut > 1) {
    critDmgMul *= blfOut;
    layers.push({ label: 'Bluff', mul: blfOut, running: critDmgMul });
  }
  const zealCr = jsonFiniteNum(mods?.zealotCritRateAdd);
  if (zealCr !== undefined && zealCr > 0) {
    critRate = Math.min(500, Math.floor(critRate + zealCr));
  }
  const zealCd = jsonFiniteNum(mods?.zealotCritDmgMul);
  if (zealCd !== undefined && zealCd > 1) {
    critDmgMul *= zealCd;
    layers.push({ label: 'Zealot', mul: zealCd, running: critDmgMul });
  }
  critDmgMul = applyFocusPowerCritDmgMul(critDmgMul, mods, {}, weaponKind);

  return { critRate, critDmgMul, addCritDmg, layers, flatLayers };
}

/** Breakdown одного удару (без ±10% variance). */
export function debugPlayerPhysicalHitBreakdown(
  input: PhysicalHitDebugInput
): PhysicalHitDebugBreakdown {
  const mods = input.battleMods ?? {};
  const learned = input.learnedSkillLevelByBattleId;
  const wcRaw = jsonFiniteNum(mods.warCryPatkMul);
  const wc = wcRaw !== undefined && wcRaw > 1 ? wcRaw : 1;
  const thrill = (() => {
    const t = jsonFiniteNum(mods.thrillFightPatkMul);
    return t !== undefined && t > 1 ? t : 1;
  })();
  const rage = (() => {
    const r = jsonFiniteNum(mods.rageBattlePatkMul);
    return r !== undefined && r > 1 ? r : 1;
  })();
  const frenzy = (() => {
    const f = jsonFiniteNum(mods.frenzyBattlePatkMul);
    return f !== undefined && f > 1 ? f : 1;
  })();
  const mys = (() => {
    const m = jsonFiniteNum(mods.mysticPatkBuffMul);
    return m !== undefined && m > 1 ? m : 1;
  })();
  let stanceMul = 1;
  if (isStanceAccuracyActive(mods)) {
    const ar = Math.max(1, Math.floor(learned?.['l2_256'] ?? 1));
    const d256 = textRpgHfToggleStanceDelta(256, ar);
    if (d256?.buffPatk != null && d256.buffPatk > 0 && Number.isFinite(d256.buffPatk)) {
      stanceMul = d256.buffPatk;
    }
  }
  const ssFromMods = jsonFiniteNum(mods.fighterSoulshotPatkMul);
  const soulshot =
    input.soulshotMulOverride ??
    (ssFromMods !== undefined && ssFromMods > 1 ? ssFromMods : 1);

  const beforeSs = Math.max(
    1,
    Math.floor(input.baseCombatPatk * wc * thrill * rage * frenzy * mys)
  );
  const afterSs = Math.max(1, Math.floor(beforeSs * soulshot));
  let atkEff = Math.max(1, Math.floor(afterSs * stanceMul));
  const snP = jsonFiniteNum(mods.snipePatkFlat);
  if (snP !== undefined && snP > 0) {
    atkEff = Math.max(1, atkEff + Math.floor(snP));
  }

  const def = Math.max(1, Math.floor(input.mobPDef));
  const normalCore = (70 * atkEff) / def;
  const normalHit = Math.max(1, Math.floor(normalCore));
  const critCore = (2 * 70 * atkEff) / def;

  const critBuilt = buildCritLayers(input.combat, mods, learned, input.weaponKind);
  const critMul = Math.max(1, critBuilt.critDmgMul);
  const critDamage = Math.max(
    1,
    Math.floor(critCore * critMul + Math.max(0, critBuilt.addCritDmg))
  );

  const displayed = effectiveBattlePatkDisplay(
    input.baseCombatPatk,
    null,
    mods
  );

  return {
    attackerPAtk: atkEff,
    targetPDef: def,
    baseDamageBeforeSoulshot: Math.max(1, Math.floor((70 * beforeSs) / def)),
    soulshotMultiplier: soulshot,
    damageAfterSoulshot: Math.max(1, Math.floor((70 * afterSs) / def)),
    normalHitDamage: normalHit,
    normalCritCore: critCore,
    normalCritMultiplier: critMul,
    additionalCritDamagePct: Math.floor((critMul - 1) * 100),
    critDamageFlat: Math.floor(critBuilt.addCritDmg),
    critDmgMulProduct: critMul,
    damageAfterCrit: critDamage,
    critRateStat: critBuilt.critRate,
    critChancePct: Math.round(physicalCritChance(critBuilt.critRate) * 1000) / 10,
    patkMultipliers: {
      warCry: wc,
      weakness: 1,
      thrillFight: thrill,
      rage,
      frenzy,
      mysticPatkBuff: mys,
      stanceAccuracy: stanceMul,
      soulshot,
    },
    critDmgMulLayers: critBuilt.layers,
    addCritDmgLayers: critBuilt.flatLayers,
    displayedPatkFromSnapshot: displayed,
    soulshotContributionInDisplayedPatk: 0,
  };
}
