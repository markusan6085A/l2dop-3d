import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export function mysticCatalogEntryVisibleForProfession(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  const p = String(l2Profession || '').trim();
  return entry.visibleForProfessions.includes(p);
}

/** У Глудіо той самий НПС магістра — усі видимі для професії рядки каталогу. */
export function mysticCatalogEntryOfferedAtGludioMagister(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  return mysticCatalogEntryVisibleForProfession(entry, l2Profession);
}
