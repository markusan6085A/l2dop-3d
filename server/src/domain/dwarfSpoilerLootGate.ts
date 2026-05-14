import { isL2DwarfRace } from '../data/l2dopHumanMysticBattleSkills.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import type { Prisma } from '@prisma/client';

const SPOIL_BATTLE_ID = 'l2_254';
const SPOIL_L2_SKILL_ID = 254;

/**
 * Дроп/прев’ю «спойл» у каталозі та автоматичний спойл за кілл — лише гном
 * з гілкою Spoiler (Bounty Hunter / Fortune Seeker), де є скіл Spoil.
 */
export function viewerMaySeeSpoilLoot(
  race: string,
  l2Profession: string,
  skillsLearnedJson?: Prisma.JsonValue | null
): boolean {
  const learned = normalizeLearnedSkillsJson(skillsLearnedJson);
  const hasSpoilSkill = learned.some((e) => {
    const bid = String(e.battleId ?? '').trim().toLowerCase();
    if (bid === SPOIL_BATTLE_ID) return true;
    if (bid === `l2_${SPOIL_L2_SKILL_ID}`) return true;
    return false;
  });
  if (!hasSpoilSkill) return false;
  if (!isL2DwarfRace(race)) return false;
  const p = String(l2Profession ?? '').trim().toLowerCase();
  return p === 'dwarf_bounty_hunter' || p === 'dwarf_fortune_seeker';
}
