/**
 * Тогли HF з `textRpgHfToggleEffects.generated.ts` → модифікатори бою (як `applySkillToggles` у text-rpg).
 * Застосовується при увімкненій стійці (battleMods), не з activeBuffsJson.
 * Єдине джерело для 256/312/339 — без таблиць rawdata / $VICSTAN у PHP.
 */
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';
import { l2dopBuffDeltaFromTextRpgEffect } from './textRpgCombatBuffFromEffect.js';
import {
  TEXT_RPG_HF_TOGGLE_EFFECTS,
  type TextRpgHfToggleEffectMod,
  type TextRpgHfToggleRow,
} from './textRpgHfToggleEffects.generated.js';
import { accuracyStanceFlatAtRank } from './accuracyStanceTables.js';
import type { TextRpgEffectMode } from './textRpgSkillEffectTypes.js';

const BY_ID = new Map(
  TEXT_RPG_HF_TOGGLE_EFFECTS.map((row) => [row.l2SkillId, row])
);

export const TEXT_RPG_HF_TOGGLE_SKILL_IDS = new Set(BY_ID.keys());

function powerForToggleLevel(row: TextRpgHfToggleRow, requestedRank: number): number {
  if (row.l2SkillId === 256) {
    return accuracyStanceFlatAtRank(requestedRank);
  }
  const r = Math.max(1, Math.floor(requestedRank));
  const capped = Math.min(r, row.maxLevel);
  let p = row.powerByLevel[capped];
  if (p != null && Number.isFinite(p) && p > 0) return p;
  for (let i = capped; i >= 1; i--) {
    const v = row.powerByLevel[i];
    if (v != null && Number.isFinite(v) && v > 0) return v;
  }
  for (let i = capped + 1; i <= row.maxLevel; i++) {
    const v = row.powerByLevel[i];
    if (v != null && Number.isFinite(v) && v > 0) return v;
  }
  return 0;
}

function effectPower(
  eff: TextRpgHfToggleEffectMod,
  levelPower: number
): number {
  if (eff.value !== undefined && Number.isFinite(eff.value)) return eff.value;
  return levelPower;
}

function mergeToggleDelta(
  acc: {
    buffPatk: number;
    buffMatk: number;
    buffPdef: number;
    buffMdef: number;
    buffMaxHp: number;
    buffAspd: number;
    buffCast: number;
    buffSpeed: number;
    buffAcc: number;
    buffEva: number;
    addPatk: number;
    addMatk: number;
    addPdef: number;
    addMdef: number;
    addCrit: number;
    addCritDmg: number;
    critDmgMul: number;
    regenHpMul: number;
    regenMpMul: number;
  },
  d: Partial<L2dopCombatBuffModifiers>
): void {
  if (d.buffPatk != null) acc.buffPatk *= d.buffPatk;
  if (d.buffMatk != null) acc.buffMatk *= d.buffMatk;
  if (d.buffPdef != null) acc.buffPdef *= d.buffPdef;
  if (d.buffMdef != null) acc.buffMdef *= d.buffMdef;
  if (d.buffMaxHp != null) acc.buffMaxHp *= d.buffMaxHp;
  if (d.buffAspd != null) acc.buffAspd *= d.buffAspd;
  if (d.buffCast != null) acc.buffCast *= d.buffCast;
  if (d.buffSpeed != null) acc.buffSpeed *= d.buffSpeed;
  if (d.buffAcc != null) acc.buffAcc += d.buffAcc;
  if (d.buffEva != null) acc.buffEva += d.buffEva;
  if (d.addPatk != null) acc.addPatk += d.addPatk;
  if (d.addMatk != null) acc.addMatk += d.addMatk;
  if (d.addPdef != null) acc.addPdef += d.addPdef;
  if (d.addMdef != null) acc.addMdef += d.addMdef;
  if (d.addCrit != null) acc.addCrit += d.addCrit;
  if (d.addCritDmg != null) acc.addCritDmg += d.addCritDmg;
  if (d.critDmgMul != null) acc.critDmgMul *= d.critDmgMul;
  if (d.regenHpMul != null) acc.regenHpMul *= d.regenHpMul;
  if (d.regenMpMul != null) acc.regenMpMul *= d.regenMpMul;
}

function filter312Effects(
  row: TextRpgHfToggleRow,
  rank: number
): TextRpgHfToggleEffectMod[] {
  if (rank <= 5) {
    return row.effects.filter((e) => e.mode === 'percent');
  }
  return row.effects.filter(
    (e) => e.stat === 'critDamage' && e.mode === 'flat'
  );
}

/**
 * Модифікатори стійки за даними text-rpg (рівень скіла = ранг із `skillsLearnedJson`).
 */
export function textRpgHfToggleStanceDelta(
  l2SkillId: number,
  rank: number
): Partial<L2dopCombatBuffModifiers> | null {
  const row = BY_ID.get(l2SkillId);
  if (!row) return null;

  const r = Math.max(1, Math.floor(rank));
  const p = powerForToggleLevel(row, r);

  const effs =
    l2SkillId === 312 ? filter312Effects(row, r) : [...row.effects];

  const acc = {
    buffPatk: 1,
    buffMatk: 1,
    buffPdef: 1,
    buffMdef: 1,
    buffMaxHp: 1,
    buffAspd: 1,
    buffCast: 1,
    buffSpeed: 1,
    buffAcc: 0,
    buffEva: 0,
    addPatk: 0,
    addMatk: 0,
    addPdef: 0,
    addMdef: 0,
    addCrit: 0,
    addCritDmg: 0,
    critDmgMul: 1,
    regenHpMul: 1,
    regenMpMul: 1,
  };

  let any = false;
  for (const eff of effs) {
    const pow = effectPower(eff, p);
    const mode = eff.mode as TextRpgEffectMode;
    const d = l2dopBuffDeltaFromTextRpgEffect(eff.stat, mode, pow);
    if (d && Object.keys(d).length > 0) {
      mergeToggleDelta(acc, d);
      any = true;
    }
  }

  if (!any) return null;

  const out: Partial<L2dopCombatBuffModifiers> = {};
  if (acc.buffPatk !== 1) out.buffPatk = acc.buffPatk;
  if (acc.buffMatk !== 1) out.buffMatk = acc.buffMatk;
  if (acc.buffPdef !== 1) out.buffPdef = acc.buffPdef;
  if (acc.buffMdef !== 1) out.buffMdef = acc.buffMdef;
  if (acc.buffMaxHp !== 1) out.buffMaxHp = acc.buffMaxHp;
  if (acc.buffAspd !== 1) out.buffAspd = acc.buffAspd;
  if (acc.buffCast !== 1) out.buffCast = acc.buffCast;
  if (acc.buffSpeed !== 1) out.buffSpeed = acc.buffSpeed;
  if (acc.buffAcc !== 0) out.buffAcc = acc.buffAcc;
  if (acc.buffEva !== 0) out.buffEva = acc.buffEva;
  if (acc.addPatk !== 0) out.addPatk = acc.addPatk;
  if (acc.addMatk !== 0) out.addMatk = acc.addMatk;
  if (acc.addPdef !== 0) out.addPdef = acc.addPdef;
  if (acc.addMdef !== 0) out.addMdef = acc.addMdef;
  if (acc.addCrit !== 0) out.addCrit = acc.addCrit;
  if (acc.addCritDmg !== 0) out.addCritDmg = acc.addCritDmg;
  if (acc.critDmgMul !== 1) out.critDmgMul = acc.critDmgMul;
  if (acc.regenHpMul !== 1) out.regenHpMul = acc.regenHpMul;
  if (acc.regenMpMul !== 1) out.regenMpMul = acc.regenMpMul;

  return Object.keys(out).length > 0 ? out : null;
}
