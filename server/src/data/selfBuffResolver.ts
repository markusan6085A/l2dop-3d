/**
 * Уніфікований лукап self-бафа поза боєм для будь-якої раси/гілки.
 *
 * Шукає по черзі: HF-каталог → race-fighter каталог → race-mystic каталог.
 * Повертає мінімум, потрібний для `castActiveSelfBuff` і `buildCastableSelfBuffs`:
 * `l2SkillId`, `battleId`, `nameUk`, `kind` і `cooldownSec` (з каталогу, fallback —
 * `cooldownSecForSkillId` для HF-підмножини).
 *
 * Чому окремий модуль: до цього лукап був хардкодом на `humanFighterCatalogEntry`,
 * через що для Elf/Dark Elf/Orc/Dwarf і всіх Mystic ні `castActiveSelfBuff`, ні
 * список доступних бафів у клієнті не працювали.
 */
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { humanFighterCatalogEntry } from './humanFighterSkillCatalog.lookup.js';
import { catalogEntryVisibleForProfession } from './humanFighterSkillCatalog.professionRules.js';
import { fighterCatalogEntryForRace } from './fighterSkillCatalog.byRace.js';
import { mysticCatalogEntryForRace } from './mysticSkillCatalog.byRace.js';
import { mysticCatalogEntryVisibleForProfession } from './humanMysticSkillCatalog.professionRules.js';
import { cooldownSecForSkillId } from './skillCooldowns.js';

export type SelfBuffEntryKind = 'battle' | 'toggle' | 'passive';

export interface ResolvedSelfBuffEntry {
  battleId: string;
  l2SkillId: number;
  nameUk: string;
  kind: SelfBuffEntryKind;
  cooldownSec: number | null;
}

function asBattleId(s: string): string {
  return canonicalBattleSkillId(s);
}

/**
 * Лукап будь-якої racey/branch версії скіла. `passive` теж повертаємо, щоб
 * викличний код міг сам відкинути або врахувати (для self-buff cast — так).
 */
export function resolveAnyCatalogEntry(
  battleIdOrL2: string,
  race: string,
  classBranch: string,
  l2Profession: string
): ResolvedSelfBuffEntry | null {
  const canon = asBattleId(battleIdOrL2);
  const prof = String(l2Profession || '').trim();

  const hf = humanFighterCatalogEntry(canon);
  if (hf && catalogEntryVisibleForProfession(hf, prof)) {
    return {
      battleId: hf.battleId,
      l2SkillId: hf.l2SkillId,
      nameUk: hf.nameUk,
      kind: hf.kind,
      cooldownSec: hf.cooldownSec ?? cooldownSecForSkillId(hf.l2SkillId) ?? null,
    };
  }

  const rf = fighterCatalogEntryForRace(race, classBranch, canon);
  if (rf && mysticCatalogEntryVisibleForProfession(rf, prof)) {
    return {
      battleId: rf.battleId,
      l2SkillId: rf.l2SkillId,
      nameUk: rf.nameUk,
      kind: rf.kind,
      cooldownSec: rf.cooldownSec ?? cooldownSecForSkillId(rf.l2SkillId) ?? null,
    };
  }

  const rm = mysticCatalogEntryForRace(race, canon);
  if (rm && mysticCatalogEntryVisibleForProfession(rm, prof)) {
    return {
      battleId: rm.battleId,
      l2SkillId: rm.l2SkillId,
      nameUk: rm.nameUk,
      kind: rm.kind,
      cooldownSec: rm.cooldownSec ?? cooldownSecForSkillId(rm.l2SkillId) ?? null,
    };
  }

  return null;
}
