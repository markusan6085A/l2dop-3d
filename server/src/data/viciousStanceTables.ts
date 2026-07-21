/**
 * Vicious Stance (skill 312) — toggle стійка (не аура).
 * Бонуси — `textRpgHfToggleEffects` + `textRpgHfToggleBattleApply`.
 * MP: `STANCE_MP_PER_SEC` за кожну активну стійку, поки увімкнено.
 */
import type { BattleBattleMods } from '../domain/battle.js';
import { isStanceViciousActive } from '../domain/battle.js';
import { clampViciousStanceRank } from './l2dopFocusAttack.js';
import { textRpgHfToggleStanceDelta } from './textRpgHfToggleBattleApply.js';
import { STANCE_MP_PER_SEC } from '../domain/worldCombatState.js';

export const VICIOUS_STANCE_MAX_RANK = 20;

export type ViciousStanceEffect = {
  critDmgMul: number;
  addCritDmg: number;
  addCrit: number;
};

/** Єдиний runtime-контракт ефекту Vicious Stance за learned rank (1–20). */
export function resolveViciousStanceEffect(rank: number): ViciousStanceEffect {
  const r = clampViciousStanceRank(rank);
  const d = textRpgHfToggleStanceDelta(312, r);
  const critDmgMul =
    d?.critDmgMul != null &&
    d.critDmgMul > 0 &&
    Number.isFinite(d.critDmgMul)
      ? d.critDmgMul
      : 1;
  return {
    critDmgMul,
    addCritDmg: d?.addCritDmg ?? 0,
    addCrit: d?.addCrit ?? 0,
  };
}

/**
 * Ранг ефекту — лише learned rank з `skillsLearnedJson`.
 * Persisted `battleMods.viciousStanceSkillRank` не використовується для розрахунку.
 */
export function resolveViciousStanceEffectRank(learnedRank: number): number {
  return clampViciousStanceRank(learnedRank);
}

/**
 * Read-repair persisted `battleMods` для skill 312 (усі класи).
 * Повертає true, якщо state змінено.
 */
export function repairViciousStanceBattleModsInPlace(
  mods: BattleBattleMods,
  learnedRank: number
): boolean {
  let changed = false;
  if (!isStanceViciousActive(mods)) {
    if (mods.viciousStanceSkillRank != null) {
      delete mods.viciousStanceSkillRank;
      changed = true;
    }
    return changed;
  }
  if (learnedRank < 1) {
    delete mods.stanceVicious;
    delete mods.viciousStanceSkillRank;
    return true;
  }
  const correctRank = clampViciousStanceRank(learnedRank);
  if (mods.viciousStanceSkillRank !== correctRank) {
    mods.viciousStanceSkillRank = correctRank;
    changed = true;
  }
  return changed;
}

function formatViciousStanceBonusParts(rank: number): string[] {
  const eff = resolveViciousStanceEffect(rank);
  const parts: string[] = [];
  if (eff.addCrit > 0) {
    parts.push('+' + eff.addCrit + ' крит');
  }
  if (eff.critDmgMul > 1 && Number.isFinite(eff.critDmgMul)) {
    parts.push('+' + Math.round((eff.critDmgMul - 1) * 100) + '% сила криту');
  }
  if (eff.addCritDmg > 0) {
    parts.push('+' + eff.addCritDmg + ' сила криту (flat)');
  }
  return parts;
}

export const VICIOUS_STANCE_HINT_UK =
  'Toggle (не аура): крит / сила криту, поки увімкнено. MP ~0.4/с. 1 р. — +12 крит, +35% сила криту; 6 р. — +139 flat; 20 р. — +609 flat. Ранги 6+ — 2–3 профа.';

/** Текст для магістра / UI на конкретному рівні скіла. */
export function viciousStanceStatsNoteUk(rank: number): string {
  const r = clampViciousStanceRank(rank);
  const parts = formatViciousStanceBonusParts(r);
  const bonus = parts.length > 0 ? parts.join(', ') : 'бонус криту';
  const phase =
    r <= 5
      ? 'ранги 1–5: крит + % сила криту'
      : 'ранги 6–20: flat сила криту (2–3 профа)';
  return (
    'Toggle: ' +
    bonus +
    ' на р. ' +
    r +
    ' (' +
    phase +
    '). MP ~' +
    STANCE_MP_PER_SEC +
    '/с, поки увімкнено. Перемикач у бою та поза боєм.'
  );
}
