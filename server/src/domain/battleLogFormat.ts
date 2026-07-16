/**
 * Текст логу бою для гравця: прибираємо "(id, EngName)" / "(EngName)" з рядка скіла.
 */
import type { BattleActionId } from './battle.js';
import {
  canonicalBattleIdForAction,
  l2SkillIdForBattleActionIcon,
} from '../data/humanFighterSkillCatalog.js';
import { humanFighterCatalogEntry } from '../data/humanFighterSkillCatalog.lookup.js';

/** L2 id для іконки в лозі бою — каталог має пріоритет над switch у battleActionMap. */
export function l2SkillIdForBattleLogLine(action: BattleActionId): number {
  const canon = canonicalBattleIdForAction(action);
  if (canon) {
    const entry = humanFighterCatalogEntry(canon);
    if (entry && entry.l2SkillId >= 1) return entry.l2SkillId;
  }
  const raw = String(action);
  if (/^l2_\d+$/.test(raw)) {
    const id = Number(raw.slice(3));
    if (Number.isFinite(id) && id > 0) return Math.floor(id);
  }
  return l2SkillIdForBattleActionIcon(action);
}

export function compactBattleSkillLogLineUk(line: string): string {
  let s = String(line || '').trim();
  if (!s) return s;
  s = s.replace(/\s*\(\d+,\s*[^)]+\)/g, '');
  s = s.replace(/\s*\(([A-Za-z][A-Za-z0-9\s\-',/+]*)\)/g, '');
  s = s.replace(/\s+/g, ' ').replace(/\s+\./g, '.').trim();
  return s;
}

const SKILL_LOG_HIT_MARK = '\u2060';
const SKILL_LOG_ID_SEP = '\u200B';

/** Рядок скіла в лог: [⁠][skillId][ZWSP]текст — для іконки в UI. */
export function formatBattleSkillLogLineForClient(
  compact: string,
  l2SkillId: number,
  skillHit: boolean
): string {
  let line = skillHit ? SKILL_LOG_HIT_MARK : '';
  const id = Math.floor(l2SkillId);
  if (id > 0) {
    line += String(id) + SKILL_LOG_ID_SEP;
  }
  line += compact;
  return line;
}
