/**
 * Множники/додавання з calc_stats.php ($BuffPATK, $AddPATK, $AddCRIT, $subcritical, $critdmg …).
 * За замовчуванням — як «чистий» персонаж без бафів (усі Buff* = 1, Add* = 0).
 */

export interface L2dopCombatBuffModifiers {
  buffPatk: number;
  addPatk: number;
  buffPdef: number;
  addPdef: number;
  buffMatk: number;
  addMatk: number;
  buffMdef: number;
  addMdef: number;
  /** Додається в суму точності (як $BuffACC). */
  buffAcc: number;
  /** Додається в суму ухилення (як $BuffEVA). */
  buffEva: number;
  addCrit: number;
  subcritical: number;
  /**
   * Як сума доданків `basecritical * k` у calc_stats/cs1 ($subcritical з частини k·basecritical).
   * Фінальний crit: basecritical + addCrit + subcritical + basecritical * subcriticalMulOfBase + rCrit.
   */
  subcriticalMulOfBase: number;
  /** Множник у $mcrit=5*$WITMOD*$mCritRate. */
  mCritRate: number;
  buffAspd: number;
  addAspd: number;
  buffSpeed: number;
  addSpeed: number;
  buffCast: number;
  addCast: number;
  /** $critdmg — добуток від бафів cAtk (стартує з 1 у PHP). */
  critDmgMul: number;
  /** $AddCritDmg (+ $cAtkStatic у PHP). */
  addCritDmg: number;
  necklacePatk: number;
  necklaceMatk: number;
  /** Епічні кільця: $RINGOFQUEENACC + $RINGOFBAIUMACC + $RINGOFCOREACC. */
  ringAccBonus: number;
  /** $BuffHP — множник до maxHp після computeVitals. */
  buffMaxHp: number;
  /** $BuffMP */
  buffMaxMp: number;
  /** $BuffCP */
  buffMaxCp: number;
  /** Множник до базового regenHp (Seal of Scourge → 0). */
  regenHpMul: number;
  regenMpMul: number;
  regenCpMul: number;
  /** Як $AddHPREGEN / зілля в cs1.php (до тика після множника). */
  addRegenHp: number;
  addRegenMp: number;
  addRegenCp: number;
  cooldownReductionMul: number;
  holdResistMul: number;
  sleepResistMul: number;
  mentalResistMul: number;
  poisonResistMul: number;
  bleedResistMul: number;
  /** Плоский доданок до `stunResistPct` після CON (сет-бонуси тощо), у % до стійкості. */
  addStunResistPct: number;
  /** Плоский доданок до `debuffResistPct` після MEN. */
  addDebuffResistPct: number;
  /** Плоский доданок до `mCritPct` після WIT/mCritRate (сет мага тощо), у % до шансу маг. крита. */
  addMCritPct: number;
  /**
   * Множник до вартості MP бойових скілів (1 = без змін). 0.95 = −5% витрат (сет Demon).
   */
  skillMpCostMul: number;
  /** +N% до шансу «зайти» маг. дебафу/контролю після резисту моба (0–1 у формулі як N/100). */
  addDebuffLandChancePct: number;
  /** +N% до шансу фіз. крита (до капа 60%) перед мапінгом у critRate. */
  addPhysicalCritChancePct: number;
  /**
   * Shield Mastery (153): % ефективності захисту щита при блоці (Interlude p_shield_defence_rate).
   * Застосовується до shieldPDef у snapshot лише з екіпованим щитом.
   */
  shieldDefenceRatePct: number;
}

const NEUTRAL: L2dopCombatBuffModifiers = {
  buffPatk: 1,
  addPatk: 0,
  buffPdef: 1,
  addPdef: 0,
  buffMatk: 1,
  addMatk: 0,
  buffMdef: 1,
  addMdef: 0,
  buffAcc: 0,
  buffEva: 0,
  addCrit: 0,
  subcritical: 0,
  subcriticalMulOfBase: 0,
  mCritRate: 1,
  buffAspd: 1,
  addAspd: 0,
  buffSpeed: 1,
  addSpeed: 0,
  buffCast: 1,
  addCast: 0,
  critDmgMul: 1,
  addCritDmg: 0,
  necklacePatk: 1,
  necklaceMatk: 1,
  ringAccBonus: 0,
  buffMaxHp: 1,
  buffMaxMp: 1,
  buffMaxCp: 1,
  regenHpMul: 1,
  regenMpMul: 1,
  regenCpMul: 1,
  addRegenHp: 0,
  addRegenMp: 0,
  addRegenCp: 0,
  cooldownReductionMul: 1,
  holdResistMul: 1,
  sleepResistMul: 1,
  mentalResistMul: 1,
  poisonResistMul: 1,
  bleedResistMul: 1,
  addStunResistPct: 0,
  addDebuffResistPct: 0,
  addMCritPct: 0,
  skillMpCostMul: 1,
  addDebuffLandChancePct: 0,
  addPhysicalCritChancePct: 0,
  shieldDefenceRatePct: 0,
};

export function neutralCombatBuffs(): L2dopCombatBuffModifiers {
  return { ...NEUTRAL };
}

/** Накладання шару бафа (множники добутком, плоскі — сумою). */
export function applyBuffDelta(
  base: L2dopCombatBuffModifiers,
  d: Partial<L2dopCombatBuffModifiers>
): L2dopCombatBuffModifiers {
  if (!d || Object.keys(d).length === 0) return base;
  return {
    buffPatk: base.buffPatk * (d.buffPatk ?? 1),
    addPatk: base.addPatk + (d.addPatk ?? 0),
    buffPdef: base.buffPdef * (d.buffPdef ?? 1),
    addPdef: base.addPdef + (d.addPdef ?? 0),
    buffMatk: base.buffMatk * (d.buffMatk ?? 1),
    addMatk: base.addMatk + (d.addMatk ?? 0),
    buffMdef: base.buffMdef * (d.buffMdef ?? 1),
    addMdef: base.addMdef + (d.addMdef ?? 0),
    buffAcc: base.buffAcc + (d.buffAcc ?? 0),
    buffEva: base.buffEva + (d.buffEva ?? 0),
    addCrit: base.addCrit + (d.addCrit ?? 0),
    subcritical: base.subcritical + (d.subcritical ?? 0),
    subcriticalMulOfBase:
      base.subcriticalMulOfBase + (d.subcriticalMulOfBase ?? 0),
    mCritRate: base.mCritRate * (d.mCritRate ?? 1),
    buffAspd: base.buffAspd * (d.buffAspd ?? 1),
    addAspd: base.addAspd + (d.addAspd ?? 0),
    buffSpeed: base.buffSpeed * (d.buffSpeed ?? 1),
    addSpeed: base.addSpeed + (d.addSpeed ?? 0),
    buffCast: base.buffCast * (d.buffCast ?? 1),
    addCast: base.addCast + (d.addCast ?? 0),
    critDmgMul: base.critDmgMul * (d.critDmgMul ?? 1),
    addCritDmg: base.addCritDmg + (d.addCritDmg ?? 0),
    necklacePatk: base.necklacePatk * (d.necklacePatk ?? 1),
    necklaceMatk: base.necklaceMatk * (d.necklaceMatk ?? 1),
    ringAccBonus: base.ringAccBonus + (d.ringAccBonus ?? 0),
    buffMaxHp: base.buffMaxHp * (d.buffMaxHp ?? 1),
    buffMaxMp: base.buffMaxMp * (d.buffMaxMp ?? 1),
    buffMaxCp: base.buffMaxCp * (d.buffMaxCp ?? 1),
    regenHpMul: base.regenHpMul * (d.regenHpMul ?? 1),
    regenMpMul: base.regenMpMul * (d.regenMpMul ?? 1),
    regenCpMul: base.regenCpMul * (d.regenCpMul ?? 1),
    addRegenHp: base.addRegenHp + (d.addRegenHp ?? 0),
    addRegenMp: base.addRegenMp + (d.addRegenMp ?? 0),
    addRegenCp: base.addRegenCp + (d.addRegenCp ?? 0),
    cooldownReductionMul:
      base.cooldownReductionMul * (d.cooldownReductionMul ?? 1),
    holdResistMul: base.holdResistMul * (d.holdResistMul ?? 1),
    sleepResistMul: base.sleepResistMul * (d.sleepResistMul ?? 1),
    mentalResistMul: base.mentalResistMul * (d.mentalResistMul ?? 1),
    poisonResistMul: base.poisonResistMul * (d.poisonResistMul ?? 1),
    bleedResistMul: base.bleedResistMul * (d.bleedResistMul ?? 1),
    addStunResistPct: base.addStunResistPct + (d.addStunResistPct ?? 0),
    addDebuffResistPct: base.addDebuffResistPct + (d.addDebuffResistPct ?? 0),
    addMCritPct: base.addMCritPct + (d.addMCritPct ?? 0),
    skillMpCostMul: base.skillMpCostMul * (d.skillMpCostMul ?? 1),
    addDebuffLandChancePct:
      base.addDebuffLandChancePct + (d.addDebuffLandChancePct ?? 0),
    addPhysicalCritChancePct:
      base.addPhysicalCritChancePct + (d.addPhysicalCritChancePct ?? 0),
    shieldDefenceRatePct: Math.max(
      base.shieldDefenceRatePct,
      d.shieldDefenceRatePct ?? 0
    ),
  };
}

export function mergeCombatBuffs(
  partial: Partial<L2dopCombatBuffModifiers> | undefined
): L2dopCombatBuffModifiers {
  return applyBuffDelta(neutralCombatBuffs(), partial ?? {});
}

/**
 * Повний шар модифікаторів (після накопичення пасивів з neutral) → Partial лише з відхиленнями від neutral.
 * Далі `applyBuffDelta(B_active, partial)` дає той самий ефект, що послідовне `applyBuffDelta(neutral, d_i)`.
 */
export function partialCombatBuffDeltaFromNeutral(
  acc: L2dopCombatBuffModifiers
): Partial<L2dopCombatBuffModifiers> {
  const n = NEUTRAL;
  const out: Partial<L2dopCombatBuffModifiers> = {};
  (Object.keys(n) as (keyof L2dopCombatBuffModifiers)[]).forEach((k) => {
    if (acc[k] !== n[k]) {
      (out as Record<string, number>)[k] = acc[k] as number;
    }
  });
  return out;
}
