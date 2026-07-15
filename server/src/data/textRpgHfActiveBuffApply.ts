/**
 * Активні бафи з `TEXT_RPG_HF_BUFF_EFFECTS` (text-rpg) → `L2dopCombatBuffModifiers`.
 * Для skillId з `textRpgHfOwnsActiveBuffSkillId` cs1-правила в `l2dopActiveBuffs` **не** підключаються — одне джерело.
 * Виняток: `TEXT_RPG_HF_ACTIVE_BUFF_CS1_FALLBACK_IDS` (поки окремий парсер у генераторі).
 * Якщо ефекти не змапились — `null` (без підміни cs1 для «власних» id).
 */
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';
import { l2dopBuffDeltaFromTextRpgEffect } from './textRpgCombatBuffFromEffect.js';
import {
  TEXT_RPG_HF_BUFF_EFFECTS,
  type TextRpgHfBuffRow,
} from './textRpgHfBuffEffects.generated.js';
import type { TextRpgEffectMode } from './textRpgSkillEffectTypes.js';

const BY_ID = new Map(
  TEXT_RPG_HF_BUFF_EFFECTS.map((row) => [row.l2SkillId, row])
);

export const TEXT_RPG_HF_ACTIVE_BUFF_SKILL_IDS = new Set(BY_ID.keys());

/**
 * Різні `value` на ефект у text-rpg — поки cs1 (`l2dopActiveBuffs`); не «власник» text-rpg.
 * Потім прибрати id з цього Set і з cs1-правила.
 */
export const TEXT_RPG_HF_ACTIVE_BUFF_CS1_FALLBACK_IDS = new Set([313]);

/** Чи цей id обробляється лише з text-rpg (без cs1/rawdata для активного бафа). */
export function textRpgHfOwnsActiveBuffSkillId(skillId: number): boolean {
  return (
    TEXT_RPG_HF_ACTIVE_BUFF_SKILL_IDS.has(skillId) &&
    !TEXT_RPG_HF_ACTIVE_BUFF_CS1_FALLBACK_IDS.has(skillId)
  );
}

/** Мінімум полів з `BuffWeaponContext` (без циклічного імпорту). */
export type TextRpgBuffWeaponCtx = { isBow: boolean };

/** Як у cs1: лук / арбалет. */
function hfBuffBowGuard(
  skillId: number,
  ctx: TextRpgBuffWeaponCtx | undefined
): boolean {
  if (skillId !== 99 && skillId !== 413) return true;
  return ctx?.isBow === true;
}

function mergeBuffPartial(
  acc: {
    buffPatk: number;
    buffMatk: number;
    buffPdef: number;
    buffMdef: number;
    buffMaxHp: number;
    buffMaxMp: number;
    buffMaxCp: number;
    regenHpMul: number;
    regenMpMul: number;
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
    subcriticalMulOfBase: number;
    holdResistMul: number;
    sleepResistMul: number;
    mentalResistMul: number;
    addStunResistPct: number;
  },
  d: Partial<L2dopCombatBuffModifiers>
): void {
  if (d.buffPatk != null) acc.buffPatk *= d.buffPatk;
  if (d.buffMatk != null) acc.buffMatk *= d.buffMatk;
  if (d.buffPdef != null) acc.buffPdef *= d.buffPdef;
  if (d.buffMdef != null) acc.buffMdef *= d.buffMdef;
  if (d.buffMaxHp != null) acc.buffMaxHp *= d.buffMaxHp;
  if (d.buffMaxMp != null) acc.buffMaxMp *= d.buffMaxMp;
  if (d.buffMaxCp != null) acc.buffMaxCp *= d.buffMaxCp;
  if (d.regenHpMul != null) acc.regenHpMul *= d.regenHpMul;
  if (d.regenMpMul != null) acc.regenMpMul *= d.regenMpMul;
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
  if (d.subcriticalMulOfBase != null) acc.subcriticalMulOfBase += d.subcriticalMulOfBase;
  if (d.holdResistMul != null) acc.holdResistMul *= d.holdResistMul;
  if (d.sleepResistMul != null) acc.sleepResistMul *= d.sleepResistMul;
  if (d.mentalResistMul != null) acc.mentalResistMul *= d.mentalResistMul;
  if (d.addStunResistPct != null) acc.addStunResistPct += d.addStunResistPct;
}

function powerForBuffLevel(row: TextRpgHfBuffRow, requestedLevel: number): number {
  const lv = Math.max(1, Math.floor(requestedLevel));
  const capped = Math.min(lv, row.maxLevel);
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

/**
 * Дельта бафа з text-rpg для Human Fighter; `null` — використати правило cs1.
 */
export function textRpgHfActiveBuffDelta(
  skillId: number,
  level: number,
  weaponCtx?: TextRpgBuffWeaponCtx
): Partial<L2dopCombatBuffModifiers> | null {
  if (TEXT_RPG_HF_ACTIVE_BUFF_CS1_FALLBACK_IDS.has(skillId)) return null;
  if (!hfBuffBowGuard(skillId, weaponCtx)) return null;

  const row = BY_ID.get(skillId);
  if (!row) return null;

  const p = powerForBuffLevel(row, level);
  if (p <= 0) return null;

  const acc = {
    buffPatk: 1,
    buffMatk: 1,
    buffPdef: 1,
    buffMdef: 1,
    buffMaxHp: 1,
    buffMaxMp: 1,
    buffMaxCp: 1,
    regenHpMul: 1,
    regenMpMul: 1,
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
    subcriticalMulOfBase: 0,
    holdResistMul: 1,
    sleepResistMul: 1,
    mentalResistMul: 1,
    addStunResistPct: 0,
  };

  let any = false;
  for (const eff of row.effects) {
    const mode = eff.mode as TextRpgEffectMode;
    const d = l2dopBuffDeltaFromTextRpgEffect(eff.stat, mode, p);
    if (d && Object.keys(d).length > 0) {
      mergeBuffPartial(acc, d);
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
  if (acc.buffMaxMp !== 1) out.buffMaxMp = acc.buffMaxMp;
  if (acc.buffMaxCp !== 1) out.buffMaxCp = acc.buffMaxCp;
  if (acc.regenHpMul !== 1) out.regenHpMul = acc.regenHpMul;
  if (acc.regenMpMul !== 1) out.regenMpMul = acc.regenMpMul;
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
  if (acc.subcriticalMulOfBase !== 0) {
    out.subcriticalMulOfBase = acc.subcriticalMulOfBase;
  }
  if (acc.holdResistMul !== 1) out.holdResistMul = acc.holdResistMul;
  if (acc.sleepResistMul !== 1) out.sleepResistMul = acc.sleepResistMul;
  if (acc.mentalResistMul !== 1) out.mentalResistMul = acc.mentalResistMul;
  if (acc.addStunResistPct !== 0) out.addStunResistPct = acc.addStunResistPct;

  return Object.keys(out).length > 0 ? out : null;
}
