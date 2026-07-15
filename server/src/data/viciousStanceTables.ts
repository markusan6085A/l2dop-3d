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

export function resolveViciousStanceEffectRank(
  learnedRank: number,
  mods?: BattleBattleMods
): number {
  if (isStanceViciousActive(mods)) {
    const stored = mods?.viciousStanceSkillRank;
    if (typeof stored === 'number' && Number.isFinite(stored) && stored >= 1) {
      return clampViciousStanceRank(stored);
    }
  }
  return clampViciousStanceRank(learnedRank);
}

function formatViciousStanceBonusParts(rank: number): string[] {
  const d = textRpgHfToggleStanceDelta(312, rank);
  if (!d) return [];
  const parts: string[] = [];
  if (d.addCrit != null && d.addCrit > 0) {
    parts.push('+' + d.addCrit + ' крит');
  }
  if (d.critDmgMul != null && d.critDmgMul > 1 && Number.isFinite(d.critDmgMul)) {
    parts.push('+' + Math.round((d.critDmgMul - 1) * 100) + '% сила криту');
  }
  if (d.addCritDmg != null && d.addCritDmg > 0) {
    parts.push('+' + d.addCritDmg + ' сила криту (flat)');
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
