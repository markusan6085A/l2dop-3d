import { persistableActiveBuffsFromJson } from '../../data/l2dopActiveBuffs.js';
import { L2DB_SKILL_HINT_UK_BY_ID } from '../../data/l2dbSkillHintUk.generated.js';
import { skillIconUrlForClient } from '../../data/humanFighterSkillCatalog.js';

export type PartyMemberBuffIconDto = {
  skillId: number;
  icon: string;
  name: string;
  remainingSeconds: number;
};

const MAX_BUFF_ICONS = 12;

/** Lightweight buff icons з activeBuffsJson (без battleJson). */
export function partyMemberBuffIconsFromActiveJson(
  activeBuffsJson: unknown,
  nowMs: number = Date.now()
): { buffIcons: PartyMemberBuffIconDto[]; buffOverflow: number } {
  const active = persistableActiveBuffsFromJson(activeBuffsJson, nowMs);
  const icons: PartyMemberBuffIconDto[] = [];

  for (const b of active) {
    const skillId = Math.floor(Number(b.skillId) || 0);
    if (skillId <= 0) continue;
    let remainingSeconds = 0;
    if (typeof b.expiresAt === 'number' && Number.isFinite(b.expiresAt)) {
      remainingSeconds = Math.max(
        0,
        Math.ceil((b.expiresAt - nowMs) / 1000)
      );
    }
    const hint = L2DB_SKILL_HINT_UK_BY_ID[skillId];
    icons.push({
      skillId,
      icon: skillIconUrlForClient(skillId),
      name: hint && hint.trim() ? hint.trim() : `Скіл ${skillId}`,
      remainingSeconds,
    });
    if (icons.length >= MAX_BUFF_ICONS) break;
  }

  const total = active.length;
  const shown = icons.length;
  return {
    buffIcons: icons,
    buffOverflow: Math.max(0, total - shown),
  };
}
