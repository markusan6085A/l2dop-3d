import { HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ } from './l2dopHumanFighterBattleSkills.js';
import { mapFighterProfessionToHumanSkillCatalog } from './fighterProfessionHumanCatalogMap.js';
import { HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL } from './humanFighterSkillCatalog.constants.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { isL2dbRgSkillAllowedForProfession } from './l2dbRgProfessionSkillGate.js';
import {
  humanFighterCatalogEntry,
} from './humanFighterSkillCatalog.lookup.js';
import type {
  HumanFighterSkillCatalogEntry,
  LearnedSkillEntry,
} from './humanFighterSkillCatalog.types.js';

/** Warlord або Dreadnought — одна гілка алебарди. */
export function isHumanWarlordTrackProfession(l2Profession: string): boolean {
  const p = String(l2Profession || '').trim();
  return p === 'human_warlord' || p === 'human_dreadnought';
}

/** Gladiator або Duelist — гілка подвійних мечів (text-rpg: human_fighter_gladiator → duelist). */
export function isHumanGladiatorTrackProfession(l2Profession: string): boolean {
  const p = String(l2Profession || '').trim();
  return p === 'human_gladiator' || p === 'human_duelist';
}

/** Друга профа будь-якої гілки воїна (Warlord або Gladiator) + треті профи. */
export function isHumanSecondTierWarriorBranchProfession(
  l2Profession: string
): boolean {
  return (
    isHumanWarlordTrackProfession(l2Profession) ||
    isHumanGladiatorTrackProfession(l2Profession)
  );
}

/** Гілка лицаря: світла (Paladin → Phoenix) або темна (Dark Avenger → Hell Knight). */
export function isHumanKnightTrackProfession(l2Profession: string): boolean {
  const p = String(l2Profession || '').trim();
  return (
    p === 'human_knight' ||
    p === 'human_paladin' ||
    p === 'human_phoenix_knight' ||
    p === 'human_dark_avenger' ||
    p === 'human_hell_knight'
  );
}

export function isHumanPaladinTrackProfession(l2Profession: string): boolean {
  const p = String(l2Profession || '').trim();
  return p === 'human_paladin' || p === 'human_phoenix_knight';
}

/** Темна гілка лицаря: Dark Avenger → Hell Knight. */
export function isHumanDarkAvengerTrackProfession(
  l2Profession: string
): boolean {
  const p = String(l2Profession || '').trim();
  return p === 'human_dark_avenger' || p === 'human_hell_knight';
}

/** Гілка розбійника: Rogue → Treasure Hunter → Adventurer. */
export function isHumanRogueTrackProfession(l2Profession: string): boolean {
  const p = String(l2Profession || '').trim();
  return (
    p === 'human_rogue' ||
    p === 'human_treasure_hunter' ||
    p === 'human_adventurer'
  );
}

/** Гілка лучника: Rogue → Hawkeye → Sagittarius (l2db). */
export function isHumanArcherTrackProfession(l2Profession: string): boolean {
  const p = String(l2Profession || '').trim();
  return p === 'human_hawkeye' || p === 'human_sagittarius';
}

export function isHumanWarriorSubclassProfession(l2Profession: string): boolean {
  const p = String(l2Profession || '').trim();
  return (
    p === 'human_warrior' ||
    p === 'human_warlord' ||
    p === 'human_dreadnought' ||
    p === 'human_gladiator' ||
    p === 'human_duelist' ||
    isHumanKnightTrackProfession(p)
  );
}

export function catalogEntryVisibleForProfession(
  entry: HumanFighterSkillCatalogEntry,
  l2Profession: string
): boolean {
  const p = mapFighterProfessionToHumanSkillCatalog(
    String(l2Profession || '').trim()
  );
  if (!isL2dbRgSkillAllowedForProfession(p, entry.l2SkillId)) return false;
  if (entry.professionReq == null) return true;
  if (entry.professionReq === 'human_warrior') {
    return isHumanWarriorSubclassProfession(p);
  }
  if (entry.professionReq === 'human_warrior_or_rogue_track') {
    return (
      isHumanWarriorSubclassProfession(p) ||
      isHumanRogueTrackProfession(p) ||
      isHumanArcherTrackProfession(p)
    );
  }
  if (entry.professionReq === 'human_warlord') {
    return isHumanWarlordTrackProfession(p);
  }
  if (entry.professionReq === 'human_warlord_shared') {
    return isHumanSecondTierWarriorBranchProfession(p);
  }
  if (entry.professionReq === 'human_gladiator') {
    return isHumanGladiatorTrackProfession(p);
  }
  if (entry.professionReq === 'human_dreadnought') {
    return p === 'human_dreadnought';
  }
  if (entry.professionReq === 'human_dreadnought_or_duelist') {
    return p === 'human_dreadnought' || p === 'human_duelist';
  }
  if (entry.professionReq === 'human_dreadnought_or_duelist_or_phoenix_or_hell') {
    return (
      p === 'human_dreadnought' ||
      p === 'human_duelist' ||
      p === 'human_phoenix_knight' ||
      p === 'human_hell_knight'
    );
  }
  if (entry.professionReq === 'human_dreadnought_or_phoenix_or_hell') {
    return (
      p === 'human_dreadnought' ||
      p === 'human_phoenix_knight' ||
      p === 'human_hell_knight'
    );
  }
  if (entry.professionReq === 'human_paladin_track') {
    return isHumanPaladinTrackProfession(p);
  }
  if (entry.professionReq === 'human_dark_avenger_track') {
    return isHumanDarkAvengerTrackProfession(p);
  }
  if (entry.professionReq === 'human_knight_shield_fortress') {
    return (
      isHumanPaladinTrackProfession(p) || isHumanDarkAvengerTrackProfession(p)
    );
  }
  if (entry.professionReq === 'human_phoenix_or_hell_knight') {
    return p === 'human_phoenix_knight' || p === 'human_hell_knight';
  }
  if (entry.professionReq === 'human_phoenix_knight') {
    return p === 'human_phoenix_knight';
  }
  if (entry.professionReq === 'human_hell_knight') {
    return p === 'human_hell_knight';
  }
  if (entry.professionReq === 'human_rogue_track') {
    return (
      isHumanRogueTrackProfession(p) ||
      p === 'human_hawkeye' ||
      p === 'human_sagittarius'
    );
  }
  if (entry.professionReq === 'human_treasure_hunter_track') {
    return p === 'human_treasure_hunter' || p === 'human_adventurer';
  }
  if (entry.professionReq === 'human_adventurer') {
    return p === 'human_adventurer';
  }
  if (entry.professionReq === 'human_hawkeye_track') {
    return p === 'human_hawkeye' || p === 'human_sagittarius';
  }
  if (entry.professionReq === 'human_sagittarius') {
    return p === 'human_sagittarius';
  }
  return false;
}

/**
 * Прибирає зі списку вивчених скіли іншої гілки (наприклад гілковий скіл не для поточної професії).
 * Запис у БД не змінює — лише для відображення й логіки бою.
 */
export function filterLearnedSkillEntriesForProfession(
  entries: LearnedSkillEntry[],
  l2Profession: string
): LearnedSkillEntry[] {
  return entries.filter((e) => {
    const entry = humanFighterCatalogEntry(e.battleId);
    if (!entry) return true;
    return catalogEntryVisibleForProfession(entry, l2Profession);
  });
}

/** Магістр Глудіо: Fighter без профи — лише common до 20 р. */
export function catalogEntryOfferedAtGludioMagister(
  entry: HumanFighterSkillCatalogEntry,
  l2Profession: string
): boolean {
  if (!catalogEntryVisibleForProfession(entry, l2Profession)) return false;
  const p = mapFighterProfessionToHumanSkillCatalog(
    String(l2Profession || '').trim()
  );
  if (
    !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
    p === 'human_fighter'
  ) {
    if (
      entry.professionReq == null &&
      entry.minLevel > HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL
    ) {
      return false;
    }
  }
  return true;
}

export function catalogEntryMeetsRequirements(
  entry: HumanFighterSkillCatalogEntry,
  effectiveLevel: number,
  l2Profession: string
): boolean {
  if (!catalogEntryVisibleForProfession(entry, l2Profession)) return false;
  if (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ) return true;
  return effectiveLevel >= entry.minLevel;
}

/** Ранги 6–20 Vicious Stance (312) — лише 2–3 профа алебарди (Interlude). */
export function catalogEntryAllowsSkillRank(
  entry: HumanFighterSkillCatalogEntry,
  l2Profession: string,
  targetRank: number
): boolean {
  if (!catalogEntryVisibleForProfession(entry, l2Profession)) return false;
  const c = canonicalBattleSkillId(entry.battleId);
  const r = Math.max(1, Math.floor(targetRank));
  if (c === 'l2_312' && r >= 6) {
    const p = mapFighterProfessionToHumanSkillCatalog(
      String(l2Profession || '').trim()
    );
    return (
      isHumanWarlordTrackProfession(p) ||
      isHumanGladiatorTrackProfession(p) ||
      isHumanPaladinTrackProfession(p) ||
      isHumanDarkAvengerTrackProfession(p) ||
      isHumanRogueTrackProfession(p) ||
      isHumanArcherTrackProfession(p)
    );
  }
  return true;
}
