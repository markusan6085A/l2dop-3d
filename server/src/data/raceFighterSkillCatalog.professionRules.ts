import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { humanFighterCatalogEntry } from './humanFighterSkillCatalog.lookup.js';
import {
  catalogEntryAllowsSkillRank,
  catalogEntryVisibleForProfession,
} from './humanFighterSkillCatalog.professionRules.js';
import { mapFighterProfessionToHumanSkillCatalog } from './fighterProfessionHumanCatalogMap.js';
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { isL2dbRgSkillAllowedForProfession } from './l2dbRgProfessionSkillGate.js';

/**
 * Єдиний гейт професій для расових fighter-каталогів:
 * - враховує race-каталог (visibleForProfessions),
 * - додатково валідує через канонічні правила HF-каталогу по мапінгу професій.
 */
export function raceFighterCatalogEntryVisibleForProfession(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  const p = String(l2Profession || '').trim();
  if (!isL2dbRgSkillAllowedForProfession(p, entry.l2SkillId)) return false;
  if (!entry.visibleForProfessions.includes(p)) return false;
  const hf = humanFighterCatalogEntry(canonicalBattleSkillId(entry.battleId));
  if (!hf) return true;
  const mapped = mapFighterProfessionToHumanSkillCatalog(p);
  return catalogEntryVisibleForProfession(hf, mapped);
}

export function raceFighterCatalogEntryAllowsSkillRank(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string,
  targetRank: number
): boolean {
  if (!raceFighterCatalogEntryVisibleForProfession(entry, l2Profession)) {
    return false;
  }
  const hf = humanFighterCatalogEntry(canonicalBattleSkillId(entry.battleId));
  if (!hf) return true;
  const mapped = mapFighterProfessionToHumanSkillCatalog(
    String(l2Profession || '').trim()
  );
  return catalogEntryAllowsSkillRank(hf, mapped, targetRank);
}
