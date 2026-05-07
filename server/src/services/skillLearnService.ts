/**
 * Магістр у місті: каталог скілів для вивчення (SP) + збереження в skillsLearnedJson.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  GameConflictError,
  toSnapshot,
  type CharacterSnapshot,
  type CharacterRow,
} from './charService.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import type { HumanFighterSkillCatalogEntry } from '../data/humanFighterSkillCatalog.types.js';
import {
  canonicalBattleSkillId,
  catalogEntryAllowsSkillRank,
  catalogEntryMeetsRequirements,
  catalogEntryOfferedAtGludioMagister,
  catalogEntryVisibleForProfession,
  humanFighterCatalogEntry,
  maxSkillRankForBattleId,
  minCharLevelForSkillRank,
  normalizeLearnedSkillsJson,
  skillIconUrlForClient,
  spCostForSkillRankUpgrade,
  learnedBattleIdsFromEntries,
} from '../data/humanFighterSkillCatalog.js';
import {
  maxMysticSkillRankForBattleId,
  minCharLevelForMysticSkillRank,
  mysticCatalogEntryMeetsLevel,
  mysticCatalogEntryOfferedAtGludioMagister,
  mysticCatalogEntryVisibleForProfession,
  spCostForMysticSkillRankUpgrade,
} from '../data/humanMysticSkillCatalog.js';
import { mysticCatalogEntryForRace } from '../data/mysticSkillCatalog.byRace.js';
import {
  fighterCatalogEntryForRace,
  maxRaceFighterSkillRankForBattleId,
} from '../data/fighterSkillCatalog.byRace.js';
import { raceFighterCatalogEntryOfferedAtGludioMagister } from '../data/raceFighterSkillCatalog.offerRules.js';
import { l2dopXmlSkillRow } from '../data/l2dopXmlSkillLevels.lookup.js';
import { mysticDebuffProfileNoteUk } from '../data/l2dopMysticDebuffProfiles.js';
import { magisterBattleStatsPreview } from './skillLearnMagisterBattleStatsPreview.js';
import {
  magisterDamageHintUk,
  magisterEstimatedAtkBase,
} from './skillLearnMagisterAtkPreview.js';
import { professionBannerFor } from './skillLearnProfessionBanner.js';
import {
  LEARNABLE_IDS,
  magisterNpcPayloadForEffectiveId,
  offersForCharacter,
  parseMagisterNpcIdQuery,
} from './skillLearnMagisterDialogHelpers.js';
import type {
  MagisterDialogPayload,
  MagisterSkillOffer,
} from './skillLearnMagisterTypes.js';
import { GLUDIO_MAGISTER_NPC } from './skillLearnMagisterTypes.js';

export function parseSkillsLearnedJson(
  raw: Prisma.JsonValue | null | undefined,
  l2Profession: string,
  race = 'Human',
  classBranch = 'fighter'
): string[] {
  const prof = resolveL2ProfessionForSkillsRow({
    l2Profession,
    classBranch,
    race,
  });
  return learnedBattleIdsFromEntries(
    filterLearnedSkillEntriesForCharacter(
      normalizeLearnedSkillsJson(raw),
      race,
      classBranch,
      prof
    )
  );
}

export async function getMagisterDialogForUser(
  userId: string,
  queryNpcId?: unknown
): Promise<MagisterDialogPayload | null> {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) return null;

  const requestedId = parseMagisterNpcIdQuery(queryNpcId);
  const effectiveNpcId =
    requestedId ?? GLUDIO_MAGISTER_NPC.npcId;

  const prof = resolveL2ProfessionForSkillsRow(row as CharacterRow);
  const learnedEntries = filterLearnedSkillEntriesForCharacter(
    normalizeLearnedSkillsJson(row.skillsLearnedJson),
    row.race,
    row.classBranch,
    prof
  );
  const levelById = new Map(
    learnedEntries.map((e) => [e.battleId, e.level] as const)
  );
  const effLevel = levelFromTotalExp(row.exp);
  const { noteUk, offers } = offersForCharacter(row as CharacterRow);
  const snap = toSnapshot(row as CharacterRow);

  const skills: MagisterSkillOffer[] = offers
    .filter((o) => {
      const rf = fighterCatalogEntryForRace(
        row.race,
        row.classBranch,
        o.battleId
      );
      if (rf) {
        return raceFighterCatalogEntryOfferedAtGludioMagister(rf, prof);
      }
      const mysticEntry = mysticCatalogEntryForRace(row.race, o.battleId);
      if (mysticEntry) {
        return mysticCatalogEntryOfferedAtGludioMagister(mysticEntry, prof);
      }
      return catalogEntryOfferedAtGludioMagister(
        o as HumanFighterSkillCatalogEntry,
        prof
      );
    })
    .map((o) => {
      const rf = fighterCatalogEntryForRace(
        row.race,
        row.classBranch,
        o.battleId
      );
      const hm = mysticCatalogEntryForRace(row.race, o.battleId);
      const mysticLike = rf ?? hm;
      const skillLevel = levelById.get(o.battleId) ?? 0;
      const maxSkillLevel = mysticLike
        ? rf
          ? maxRaceFighterSkillRankForBattleId(
              row.race,
              row.classBranch,
              o.battleId
            )
          : maxMysticSkillRankForBattleId(o.battleId, row.race)
        : maxSkillRankForBattleId(o.battleId);
      const learnedMax = skillLevel >= maxSkillLevel;
      const nextRank = Math.min(maxSkillLevel, skillLevel + 1);
      const minForNext = mysticLike
        ? minCharLevelForMysticSkillRank(mysticLike, nextRank)
        : minCharLevelForSkillRank(o as HumanFighterSkillCatalogEntry, nextRank);
      const meetsNext =
        HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ || effLevel >= minForNext;
      const meetsBase = mysticLike
        ? mysticCatalogEntryMeetsLevel(mysticLike, effLevel, nextRank)
        : catalogEntryMeetsRequirements(
            o as HumanFighterSkillCatalogEntry,
            effLevel,
            prof
          );
      const meetsProfRank = mysticLike
        ? mysticCatalogEntryVisibleForProfession(mysticLike, prof)
        : catalogEntryAllowsSkillRank(
            o as HumanFighterSkillCatalogEntry,
            prof,
            nextRank
          );
      const spNext = mysticLike
        ? spCostForMysticSkillRankUpgrade(mysticLike, nextRank)
        : spCostForSkillRankUpgrade(o.battleId, nextRank) ?? o.spCost;
      const canLearn =
        !learnedMax &&
        meetsNext &&
        meetsBase &&
        meetsProfRank &&
        row.sp >= spNext;
      const rankPreview = skillLevel >= 1 ? skillLevel : 1;
      const mysticRow = mysticLike?.levels[rankPreview - 1];
      const mysticXml = mysticLike
        ? l2dopXmlSkillRow(mysticLike.l2SkillId, rankPreview)
        : undefined;
      let mysticMp: number | null = mysticRow?.mpCost ?? null;
      let mysticPower: number | null = mysticRow?.power ?? null;
      if (mysticLike && mysticXml) {
        mysticMp = mysticXml.m;
        if (
          mysticXml.p !== 0 ||
          mysticLike.category === 'magic_attack' ||
          mysticLike.category === 'physical_attack' ||
          mysticLike.category === 'heal'
        ) {
          mysticPower = mysticXml.p;
        }
      }
      const st = mysticLike
        ? {
            mp: mysticMp,
            power: mysticPower,
            statsNoteUk:
              mysticLike.category === 'debuff' ||
              mysticLike.category === 'magic_attack'
                ? mysticDebuffProfileNoteUk(mysticLike.l2SkillId)
                : (null as string | null),
          }
        : magisterBattleStatsPreview(
            o.battleId,
            o.kind,
            effLevel,
            o.minLevel,
            rankPreview
          );
      const atkBase = mysticLike
        ? mysticLike.category === 'magic_attack'
          ? snap.mAtk
          : snap.pAtk
        : magisterEstimatedAtkBase(
            o.battleId,
            o.kind,
            effLevel,
            o.minLevel,
            snap.pAtk,
            prof,
            rankPreview
          );
      return {
        battleId: o.battleId,
        l2SkillId: o.l2SkillId,
        minLevel: o.minLevel,
        spCost: learnedMax ? 0 : spNext,
        nameUk: o.nameUk,
        hintUk: o.hintUk,
        kind: o.kind,
        iconUrl: skillIconUrlForClient(o.l2SkillId),
        skillLevel,
        maxSkillLevel,
        learnedMax,
        learned: skillLevel >= 1,
        canLearn,
        mpCost: st.mp,
        damagePower: st.power,
        statsNoteUk: st.statsNoteUk,
        damageHintUk: mysticLike
          ? null
          : magisterDamageHintUk(o.battleId, atkBase, st.power),
      };
    })
    .sort((a, b) => {
      const la = Number.isFinite(a.minLevel) ? a.minLevel : 0;
      const lb = Number.isFinite(b.minLevel) ? b.minLevel : 0;
      if (la !== lb) return la - lb;
      return String(a.nameUk || '').localeCompare(String(b.nameUk || ''), 'uk');
    });

  const profBanner = professionBannerFor(row as CharacterRow);

  return {
    npc: magisterNpcPayloadForEffectiveId(effectiveNpcId),
    noteUk,
    skills,
    profession: profBanner,
  };
}

export async function learnSkillForUser(
  userId: string,
  battleId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const canon = canonicalBattleSkillId(battleId);
  if (!LEARNABLE_IDS.has(canon)) {
    throw new Error('skill_unknown');
  }

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const row = char as CharacterRow;
    const hfOk = isFighterClassBranch(row.classBranch);
    const hmOk = isMysticClassBranch(row.classBranch);
    if (!hfOk && !hmOk) {
      throw new Error('skill_wrong_class');
    }

    const prof = resolveL2ProfessionForSkillsRow(row);

    const mysticOffer = mysticCatalogEntryForRace(row.race, canon);
    const raceFighterOffer = fighterCatalogEntryForRace(
      row.race,
      row.classBranch,
      canon
    );
    const fighterOffer = humanFighterCatalogEntry(canon);

    const entries = normalizeLearnedSkillsJson(char.skillsLearnedJson);
    let idx: number;
    let nextLv: number;
    let spNeed: number;

    if (hmOk) {
      if (!mysticOffer) throw new Error('skill_unknown');
      if (!mysticCatalogEntryVisibleForProfession(mysticOffer, prof)) {
        throw new Error('skill_wrong_class');
      }
      const maxR = maxMysticSkillRankForBattleId(canon, row.race);
      idx = entries.findIndex((e) => e.battleId === canon);
      const currentLv0 = idx >= 0 ? entries[idx]!.level : 0;
      if (currentLv0 >= maxR) throw new Error('skill_already_maxed');
      nextLv = currentLv0 + 1;
      const effLevel0 = levelFromTotalExp(char.exp);
      const minForNext = minCharLevelForMysticSkillRank(mysticOffer, nextLv);
      if (
        !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
        effLevel0 < minForNext
      ) {
        throw new Error('skill_level_too_low');
      }
      if (!mysticCatalogEntryMeetsLevel(mysticOffer, effLevel0, nextLv)) {
        throw new Error('skill_level_too_low');
      }
      spNeed = spCostForMysticSkillRankUpgrade(mysticOffer, nextLv);
    } else if (raceFighterOffer) {
      if (!mysticCatalogEntryVisibleForProfession(raceFighterOffer, prof)) {
        throw new Error('skill_wrong_class');
      }
      if (!raceFighterCatalogEntryOfferedAtGludioMagister(raceFighterOffer, prof)) {
        throw new Error('skill_wrong_class');
      }
      const maxR = maxRaceFighterSkillRankForBattleId(
        row.race,
        row.classBranch,
        canon
      );
      idx = entries.findIndex((e) => e.battleId === canon);
      const currentLv = idx >= 0 ? entries[idx]!.level : 0;
      if (currentLv >= maxR) throw new Error('skill_already_maxed');
      nextLv = currentLv + 1;
      const effLevel = levelFromTotalExp(char.exp);
      const minForNext = minCharLevelForMysticSkillRank(raceFighterOffer, nextLv);
      if (
        !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
        effLevel < minForNext
      ) {
        throw new Error('skill_level_too_low');
      }
      if (!mysticCatalogEntryMeetsLevel(raceFighterOffer, effLevel, nextLv)) {
        throw new Error('skill_level_too_low');
      }
      spNeed = spCostForMysticSkillRankUpgrade(raceFighterOffer, nextLv);
    } else {
      if (!fighterOffer) throw new Error('skill_unknown');
      if (!catalogEntryVisibleForProfession(fighterOffer, prof)) {
        throw new Error('skill_wrong_class');
      }
      const maxR = maxSkillRankForBattleId(canon);
      idx = entries.findIndex((e) => e.battleId === canon);
      const currentLv = idx >= 0 ? entries[idx]!.level : 0;
      if (currentLv >= maxR) throw new Error('skill_already_maxed');
      nextLv = currentLv + 1;
      const effLevel = levelFromTotalExp(char.exp);
      const minForNext = minCharLevelForSkillRank(fighterOffer, nextLv);
      if (
        !HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ &&
        effLevel < minForNext
      ) {
        throw new Error('skill_level_too_low');
      }
      if (!catalogEntryMeetsRequirements(fighterOffer, effLevel, prof)) {
        throw new Error('skill_level_too_low');
      }
      if (!catalogEntryAllowsSkillRank(fighterOffer, prof, nextLv)) {
        throw new Error('skill_wrong_class');
      }
      spNeed = spCostForSkillRankUpgrade(canon, nextLv) ?? fighterOffer.spCost;
    }
    if (char.sp < spNeed) {
      throw new Error('skill_not_enough_sp');
    }

    let nextEntries: typeof entries;
    if (idx >= 0) {
      nextEntries = entries.map((e, i) =>
        i === idx ? { battleId: e.battleId, level: nextLv } : e
      );
    } else {
      nextEntries = [...entries, { battleId: canon, level: nextLv }];
    }

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        sp: char.sp - spNeed,
        skillsLearnedJson: nextEntries as unknown as Prisma.InputJsonValue,
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();

    const nextRow = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(nextRow as CharacterRow);
  });
}

