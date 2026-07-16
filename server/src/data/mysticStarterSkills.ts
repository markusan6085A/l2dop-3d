import type { LearnedSkillEntry } from './humanFighterSkillCatalog.types.js';
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { defaultMysticL2ProfessionForRace } from './l2dopHumanMysticBattleSkills.js';
import { DARK_MYSTIC_SKILL_CATALOG_GENERATED } from './darkMysticSkillCatalog.generated.js';
import { ELVEN_MYSTIC_SKILL_CATALOG_GENERATED } from './elvenMysticSkillCatalog.generated.js';
import { HUMAN_MYSTIC_SKILL_CATALOG_GENERATED } from './humanMysticSkillCatalog.generated.js';
import { ORC_MYSTIC_SKILL_CATALOG_GENERATED } from './orcMysticSkillCatalog.generated.js';

function mysticCatalogForRace(race: string): readonly HumanMysticSkillCatalogEntry[] {
  const r = String(race ?? '').trim().toLowerCase();
  if (r === 'elf') return ELVEN_MYSTIC_SKILL_CATALOG_GENERATED;
  if (r === 'dark elf') return DARK_MYSTIC_SKILL_CATALOG_GENERATED;
  if (r === 'orc') return ORC_MYSTIC_SKILL_CATALOG_GENERATED;
  return HUMAN_MYSTIC_SKILL_CATALOG_GENERATED;
}

/** Пасив з 1 безкоштовним рангом на старті (Interlude innate). */
function isInnateMysticPassive(entry: HumanMysticSkillCatalogEntry): boolean {
  if (entry.kind !== 'passive' || entry.minLevel > 1) return false;
  if (entry.levels.length === 0) return true;
  if (entry.levels[0]!.spCost !== 0) return false;
  return entry.levels.length === 1;
}

/** Перша магічна атака (Wind Strike тощо) — 1-й ранг без SP. */
function isInnateMysticStarterAttack(entry: HumanMysticSkillCatalogEntry): boolean {
  if (entry.kind !== 'battle' || entry.minLevel > 1) return false;
  if (entry.category !== 'magic_attack') return false;
  const r1 = entry.levels[0];
  return !!r1 && r1.level === 1 && r1.spCost === 0;
}

/** Self Heal (l2_1216) — innate зцілення себе на 1 р. */
function isInnateMysticStarterSelfHeal(entry: HumanMysticSkillCatalogEntry): boolean {
  if (entry.kind !== 'battle' || entry.minLevel > 1) return false;
  if (entry.l2SkillId !== 1216 || entry.category !== 'heal') return false;
  const r1 = entry.levels[0];
  return !!r1 && r1.level === 1 && r1.spCost === 0 && entry.levels.length === 1;
}

/**
 * Стартові вивчені скіли мага за расою (як innate у L2 Interlude):
 * Wind Strike + безкоштовні однорангові пасиви (Spellcraft, Anti Magic, Lucky, …).
 */
export function mysticStarterLearnedSkillsForRace(race: string): LearnedSkillEntry[] {
  const prof = defaultMysticL2ProfessionForRace(race);
  const catalog = mysticCatalogForRace(race);
  const out: LearnedSkillEntry[] = [];
  const seen = new Set<string>();

  for (const entry of catalog) {
    if (!entry.visibleForProfessions.includes(prof)) continue;
    if (
      !isInnateMysticPassive(entry) &&
      !isInnateMysticStarterAttack(entry) &&
      !isInnateMysticStarterSelfHeal(entry)
    ) {
      continue;
    }
    if (seen.has(entry.battleId)) continue;
    seen.add(entry.battleId);
    out.push({ battleId: entry.battleId, level: 1 });
  }

  out.sort((a, b) => a.battleId.localeCompare(b.battleId));
  return out;
}

/** Вроджений пасив уже на макс. ранзі — не показувати в списку «вивчити» у магістра. */
export function isInnateMysticPassiveOfferHidden(
  entry: HumanMysticSkillCatalogEntry,
  skillLevel: number,
  maxSkillLevel: number
): boolean {
  if (!isInnateMysticPassive(entry)) return false;
  return skillLevel >= 1 && skillLevel >= maxSkillLevel;
}
