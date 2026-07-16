import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { isL2dbRgSkillAllowedForProfession } from './l2dbRgProfessionSkillGate.js';
import {
  antiMagicAllowsSkillRank,
  isAntiMagicCatalogSkill,
} from './antiMagicTables.js';
import {
  isMysticArmorMasteryCatalogSkill,
  mysticArmorMasteryAllowsSkillRank,
} from './mysticArmorMasteryTables.js';
import {
  humanMysticWeaponMasteryAllowsSkillRank,
  isMysticStarterWeaponMasterySkill,
} from './mysticStarterWeaponMasteryTables.js';
import {
  humanBattleHealAllowsSkillRank,
  isBattleHealCatalogSkill,
} from './battleHealTables.js';
import {
  humanGroupHealAllowsSkillRank,
  isGroupHealCatalogSkill,
} from './groupHealTables.js';
import {
  humanIceBoltAllowsSkillRank,
  isIceBoltCatalogSkill,
} from './iceBoltTables.js';
import {
  humanCurseWeaknessAllowsSkillRank,
  isCurseWeaknessCatalogSkill,
} from './curseWeaknessTables.js';

export function mysticCatalogEntryVisibleForProfession(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  const p = String(l2Profession || '').trim();
  if (!isL2dbRgSkillAllowedForProfession(p, entry.l2SkillId)) return false;
  return entry.visibleForProfessions.includes(p);
}

/** Ранг скіла доступний для вивчення поточною професією (Anti Magic тощо). */
export function mysticCatalogEntryAllowsSkillRank(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string,
  targetRank: number,
  currentSkillLevel = 0
): boolean {
  if (!mysticCatalogEntryVisibleForProfession(entry, l2Profession)) return false;
  const cur = Math.max(0, Math.floor(currentSkillLevel));
  if (isAntiMagicCatalogSkill(entry.l2SkillId)) {
    return antiMagicAllowsSkillRank(l2Profession, targetRank);
  }
  if (isMysticArmorMasteryCatalogSkill(entry.l2SkillId)) {
    return mysticArmorMasteryAllowsSkillRank(l2Profession, targetRank);
  }
  if (
    isMysticStarterWeaponMasterySkill(entry.l2SkillId) &&
    String(l2Profession || '').trim().startsWith('human_')
  ) {
    return humanMysticWeaponMasteryAllowsSkillRank(
      l2Profession,
      targetRank,
      cur
    );
  }
  if (
    isBattleHealCatalogSkill(entry.l2SkillId) &&
    String(l2Profession || '').trim().startsWith('human_')
  ) {
    return humanBattleHealAllowsSkillRank(l2Profession, targetRank, cur);
  }
  if (
    isGroupHealCatalogSkill(entry.l2SkillId) &&
    String(l2Profession || '').trim().startsWith('human_')
  ) {
    return humanGroupHealAllowsSkillRank(l2Profession, targetRank, cur);
  }
  if (
    isIceBoltCatalogSkill(entry.l2SkillId) &&
    String(l2Profession || '').trim().startsWith('human_')
  ) {
    return humanIceBoltAllowsSkillRank(l2Profession, targetRank, cur);
  }
  if (
    isCurseWeaknessCatalogSkill(entry.l2SkillId) &&
    String(l2Profession || '').trim().startsWith('human_')
  ) {
    return humanCurseWeaknessAllowsSkillRank(
      l2Profession,
      targetRank,
      cur
    );
  }
  return true;
}

/** У Глудіо той самий НПС магістра — усі видимі для професії рядки каталогу. */
export function mysticCatalogEntryOfferedAtGludioMagister(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  return mysticCatalogEntryVisibleForProfession(entry, l2Profession);
}
