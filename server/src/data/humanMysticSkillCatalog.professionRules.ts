import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { isL2dbRgSkillAllowedForProfession } from './l2dbRgProfessionSkillGate.js';

export function mysticCatalogEntryVisibleForProfession(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  const p = String(l2Profession || '').trim();
  if (!isL2dbRgSkillAllowedForProfession(p, entry.l2SkillId)) return false;
  return entry.visibleForProfessions.includes(p);
}

/** У Глудіо той самий НПС магістра — усі видимі для професії рядки каталогу. */
export function mysticCatalogEntryOfferedAtGludioMagister(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  return mysticCatalogEntryVisibleForProfession(entry, l2Profession);
}
