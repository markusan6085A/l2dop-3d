import type { BattleActionId, BattleJsonState } from './battle.js';
import {
  assertSkillCooldownReady,
  isCooldownBlocked,
} from './battleSkills/humanFighterTurnHelpers.js';
import { l2SkillIdForBattleActionIcon } from '../data/humanFighterSkillCatalog.js';

/** КД базової атаки на панелі бою (сек). */
export const BASIC_ATTACK_COOLDOWN_SEC = 0.5;

export function isBasicPanelAttackAction(action: BattleActionId): boolean {
  return action === 'attack' || action === 'bolt';
}

/** Ключі `mysticSkillCdUntil` для UI і серверної перевірки. */
export function basicAttackCooldownKeys(action: BattleActionId): string[] {
  if (action === 'attack') {
    return ['attack', 'l2_' + String(l2SkillIdForBattleActionIcon('attack'))];
  }
  if (action === 'bolt') {
    return ['bolt', 'l2_' + String(l2SkillIdForBattleActionIcon('bolt'))];
  }
  return [];
}

export function assertBasicAttackCooldownReady(
  st: BattleJsonState,
  action: BattleActionId,
  nowMs: number
): void {
  if (!isBasicPanelAttackAction(action)) return;
  for (const key of basicAttackCooldownKeys(action)) {
    const until = st.mysticSkillCdUntil?.[key];
    if (isCooldownBlocked(until, nowMs)) {
      assertSkillCooldownReady(until);
    }
  }
}

export function basicAttackCooldownPatch(
  action: BattleActionId,
  nowMs: number
): Record<string, number> | undefined {
  if (!isBasicPanelAttackAction(action)) return undefined;
  const readyAt = nowMs + BASIC_ATTACK_COOLDOWN_SEC * 1000;
  const patch: Record<string, number> = {};
  for (const key of basicAttackCooldownKeys(action)) {
    patch[key] = readyAt;
  }
  return patch;
}
