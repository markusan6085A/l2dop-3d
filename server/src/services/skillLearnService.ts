/**
 * Магістр у місті: каталог скілів для вивчення (SP) + збереження в skillsLearnedJson.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
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
  maxSkillRankForCatalogEntry,
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
import { isInnateMysticPassiveOfferHidden } from '../data/mysticStarterSkills.js';
import {
  fighterCatalogEntryForRace,
  maxRaceFighterSkillRankForBattleId,
} from '../data/fighterSkillCatalog.byRace.js';
import { raceFighterCatalogEntryOfferedAtGludioMagister } from '../data/raceFighterSkillCatalog.offerRules.js';
import {
  raceFighterCatalogEntryAllowsSkillRank,
  raceFighterCatalogEntryVisibleForProfession,
} from '../data/raceFighterSkillCatalog.professionRules.js';
import { l2dopXmlSkillRow } from '../data/l2dopXmlSkillLevels.lookup.js';
import { mysticDebuffProfileNoteUk } from '../data/l2dopMysticDebuffProfiles.js';
import { boostHpStatsNoteUk } from '../data/boostHpTables.js';
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from '../data/textRpgPassiveEffects.generated.js';
import { magisterBattleStatsPreview } from './skillLearnMagisterBattleStatsPreview.js';
import {
  magisterDamageHintUk,
  magisterEstimatedAtkBase,
} from './skillLearnMagisterAtkPreview.js';
import { professionBannerFor } from './skillLearnProfessionBanner.js';
import { magisterHideOfferExclusiveToNextProfession } from '../data/magisterProfessionGate.js';
import { L2DB_SKILL_HINT_UK_BY_ID } from '../data/l2dbSkillHintUk.generated.js';
import {
  isMysticWeaponMasterySkill,
  weaponMasteryFighterStatsNoteUk,
  weaponMasteryMysticStatsNoteUk,
  WEAPON_MASTERY_FIGHTER_HINT_UK,
  WEAPON_MASTERY_MYSTIC_HINT_UK,
} from '../data/weaponMasteryTables.js';
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
import { mutateCharacterWithRevision } from './characterMutation.js';

const FINAL_FRENZY_PASSIVE = TEXT_RPG_HF_PASSIVE_EFFECTS.find(
  (r) => r.l2SkillId === 290
);
const PASSIVE_ROW_BY_BATTLE_ID = new Map(
  TEXT_RPG_HF_PASSIVE_EFFECTS.map((r) => [r.battleId, r])
);

function finalFrenzyStatsNoteUk(rankRaw: number, currentPatk: number): string {
  const rank = Math.max(1, Math.floor(rankRaw));
  const flat =
    FINAL_FRENZY_PASSIVE &&
    rank <= FINAL_FRENZY_PASSIVE.maxRank &&
    typeof FINAL_FRENZY_PASSIVE.powerByRank[rank] === 'number'
      ? FINAL_FRENZY_PASSIVE.powerByRank[rank]!
      : 0;
  const pct = currentPatk > 0 ? (flat / currentPatk) * 100 : 0;
  const pctText = pct > 0 ? pct.toFixed(1) : '0.0';
  return (
    'Пасив (<=30% HP): на поточному ранзі +' +
    flat.toFixed(1) +
    ' P.Atk (прибл. +' +
    pctText +
    '% від твоєї поточної базової P.Atk).'
  );
}

function compactSkillHintUk(args: {
  baseHint: string;
  kind: 'battle' | 'toggle' | 'passive';
  mpCost: number | null;
  power: number | null;
  statsNoteUk: string | null;
}): string {
  const base = String(args.baseHint || '').replace(/\s+/g, ' ').trim();
  const firstSentence = base.split('.').map((s) => s.trim()).find(Boolean) ?? '';
  const equipMatch =
    base.match(/Лише з [^.]+/i) ??
    base.match(/Потрібен [^.]+/i) ??
    base.match(/Меч, булава або дуал/i) ??
    base.match(/Лише зі списом[^.]*/i) ??
    base.match(/Лише з луком[^.]*/i);
  const equip = equipMatch ? equipMatch[0].replace(/\.$/, '') : null;
  const parts: string[] = [];

  if (args.kind === 'passive') {
    parts.push('Пасив');
  } else if (args.kind === 'toggle') {
    parts.push('Стійка');
  } else {
    parts.push('Активний');
  }
  if (args.mpCost != null) {
    parts.push('MP: ' + Math.max(0, Math.floor(args.mpCost)));
  }
  if (args.power != null) {
    parts.push('Сила: ' + Math.max(0, Math.floor(args.power)));
  }
  if (equip) {
    parts.push('Екіп: ' + equip);
  }

  const coreRaw =
    args.statsNoteUk && args.statsNoteUk.trim()
      ? args.statsNoteUk.trim()
      : firstSentence || base;
  const core = coreRaw
    .replace(/^пасив\s*[:\-]\s*/i, '')
    .replace(/^активний\s*[:\-]\s*/i, '')
    .replace(/^стійка\s*[:\-]\s*/i, '')
    .trim();
  if (core) parts.push(core.replace(/\.$/, ''));

  return parts.join(' · ');
}

function swordBluntMasteryStatsNoteUk(maxRankRaw: number): string {
  const row = PASSIVE_ROW_BY_BATTLE_ID.get('l2_257');
  const maxRank = Math.max(1, Math.floor(maxRankRaw));
  if (!row) {
    return 'Пасив: працює лише з мечем або булавою; кожен ранг підвищує P.Atk.';
  }
  const rankParts: string[] = [];
  for (let r = 1; r <= maxRank; r++) {
    const p = row.powerByRank[r];
    if (typeof p !== 'number' || !Number.isFinite(p)) continue;
    rankParts.push(String(r) + ': +' + p.toFixed(1) + '%');
  }
  if (rankParts.length === 0) {
    return 'Пасив: працює лише з мечем або булавою; кожен ранг підвищує P.Atk.';
  }
  return (
    'Пасив: лише з мечем або булавою. Бонус P.Atk за рангами — ' +
    rankParts.join(', ') +
    '.'
  );
}

function passiveRankPercentsNoteUk(
  battleId: string,
  titleUk: string,
  maxRankRaw: number
): string | null {
  const row = PASSIVE_ROW_BY_BATTLE_ID.get(battleId);
  const maxRank = Math.max(1, Math.floor(maxRankRaw));
  if (!row) return null;
  const rankParts: string[] = [];
  for (let r = 1; r <= maxRank; r++) {
    const p = row.powerByRank[r];
    if (typeof p !== 'number' || !Number.isFinite(p)) continue;
    rankParts.push(String(r) + ': +' + p.toFixed(1) + '%');
  }
  if (rankParts.length === 0) return null;
  return titleUk + ': бонус за рангами — ' + rankParts.join(', ') + '.';
}

function dreadnoughtSkillStatsNoteUk(args: {
  canonBattleId: string;
  rankPreview: number;
  maxSkillLevel: number;
  power: number | null;
}): string | null {
  const b = args.canonBattleId;
  if (b === 'l2_328') {
    return (
      passiveRankPercentsNoteUk(
        b,
        'Пасив (Wisdom): стійкість до hold/sleep/mental',
        args.maxSkillLevel
      ) ??
      'Пасив (Wisdom): підвищує стійкість до hold/sleep/mental; ефект росте з рангом.'
    );
  }
  if (b === 'l2_329') {
    return (
      passiveRankPercentsNoteUk(
        b,
        'Пасив (Health): стійкість до poison/bleed',
        args.maxSkillLevel
      ) ??
      'Пасив (Health): підвищує стійкість до poison/bleed; ефект росте з рангом.'
    );
  }
  if (b === 'l2_330') {
    return 'Пасив (Skill Mastery): шанс proc-ефекту на скілах (рекаст/подовження); шанс росте з рангом.';
  }
  if (b === 'l2_320') {
    const cpPctByRank = [0, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30] as const;
    const r = Math.max(1, Math.min(10, Math.floor(args.rankPreview)));
    return (
      'Лише спис/алебарда. Поточний ранг ' +
      r +
      ': зріз max CP цілі ' +
      cpPctByRank[r] +
      '%.'
    );
  }
  if (b === 'l2_347') {
    const p = args.power != null ? Math.max(0, Math.floor(args.power)) : null;
    return p != null
      ? 'Лише спис/алебарда. Поточний ранг: AoE-удар, сила ' + p + ', шанс шоку ~24-32%.'
      : 'Лише спис/алебарда. Поточний ранг: AoE-удар по площі, шанс шоку ~24-32%.';
  }
  if (b === 'l2_361') {
    const p = args.power != null ? Math.max(0, Math.floor(args.power)) : null;
    return p != null
      ? 'Лише спис/алебарда. Поточний ранг: control-удар, сила ' +
          p +
          ', шанс шоку ~55-70% + дебаф P.Def.'
      : 'Лише спис/алебарда. Поточний ранг: control-удар з шансом шоку ~55-70% + дебаф P.Def.';
  }
  if (b === 'l2_359') {
    return 'Поточний ранг: баф P.Atk проти комах/рослин/тварин (~10 хв).';
  }
  if (b === 'l2_360') {
    return 'Поточний ранг: баф P.Atk проти звірів/гігантів/драконів/магічних істот (~10 хв).';
  }
  return null;
}

function throwIfMagisterHidesFutureProfessionSkill(args: {
  row: { race: string; classBranch: string };
  currentProf: string;
  effLevel: number;
  battleId: string;
  catalogMinLevel: number;
}): void {
  if (magisterHideOfferExclusiveToNextProfession(args)) {
    throw new Error('skill_wrong_class');
  }
}

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

/**
 * Ланцюжок майстра (перевірка підключення):
 * `magister.html` / `magister.js` → `GET /character/magister` (`characterReadRoutes.ts`)
 * → тут → масив `skills` у JSON; навчання: `POST /character/skills/learn` → `learnSkillForUser`.
 */
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
  /** Узгоджено з каноном `l2_*`: у БД інколи лишаються legacy id у skillsLearnedJson. */
  const levelById = new Map<string, number>();
  for (const e of learnedEntries) {
    levelById.set(canonicalBattleSkillId(e.battleId), e.level);
  }
  const effLevel = levelFromTotalExp(row.exp);
  const { noteUk, offers } = offersForCharacter(row as CharacterRow);
  const snap = toSnapshot(row as CharacterRow);

  const gateRow = {
    race: row.race,
    classBranch: row.classBranch,
  };

  const skills: MagisterSkillOffer[] = [];
  for (const o of offers) {
    const rf = fighterCatalogEntryForRace(
      row.race,
      row.classBranch,
      o.battleId
    );
    const mysticEntry = mysticCatalogEntryForRace(row.race, o.battleId);
    const offeredOk = rf
      ? raceFighterCatalogEntryOfferedAtGludioMagister(rf, prof)
      : mysticEntry
        ? mysticCatalogEntryOfferedAtGludioMagister(mysticEntry, prof)
        : catalogEntryOfferedAtGludioMagister(
            o as HumanFighterSkillCatalogEntry,
            prof
          );
    if (!offeredOk) continue;

    const hm = mysticEntry;
    const mysticLike = rf ?? hm;
    const skillLevel =
      levelById.get(canonicalBattleSkillId(o.battleId)) ?? 0;
    const maxSkillLevel = mysticLike
      ? rf
        ? maxRaceFighterSkillRankForBattleId(
            row.race,
            row.classBranch,
            o.battleId
          )
        : maxMysticSkillRankForBattleId(o.battleId, row.race)
      : maxSkillRankForCatalogEntry(o as HumanFighterSkillCatalogEntry, prof);
    if (
      hm &&
      isInnateMysticPassiveOfferHidden(hm, skillLevel, maxSkillLevel)
    ) {
      continue;
    }
    const learnedMax = skillLevel >= maxSkillLevel;
    const nextRank = Math.min(maxSkillLevel, skillLevel + 1);
    const minForNext =
      mysticLike != null
        ? minCharLevelForMysticSkillRank(mysticLike, nextRank)
        : minCharLevelForSkillRank(o as HumanFighterSkillCatalogEntry, nextRank);
    /** Повний макс. ранг — не показувати в «вивчити» (лише у вкладці вивчених). */
    if (learnedMax) {
      continue;
    }
    /** Наступний ранг ще недоступний за рівнем — ховаємо до нового lv (частково вивчені теж). */
    if (effLevel < minForNext) {
      continue;
    }
    if (
      magisterHideOfferExclusiveToNextProfession({
        row: gateRow,
        currentProf: prof,
        effLevel,
        battleId: o.battleId,
        catalogMinLevel: o.minLevel,
      })
    ) {
      continue;
    }

    const meetsNext =
      HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ || effLevel >= minForNext;
    const meetsBase = mysticLike
      ? mysticCatalogEntryMeetsLevel(mysticLike, effLevel, nextRank)
      : catalogEntryMeetsRequirements(
          o as HumanFighterSkillCatalogEntry,
          effLevel,
          prof
        );
    const meetsProfRank = rf
      ? raceFighterCatalogEntryAllowsSkillRank(rf, prof, nextRank)
      : hm
        ? mysticCatalogEntryVisibleForProfession(hm, prof)
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
              : mysticLike.kind === 'passive' && mysticLike.l2SkillId === 163
                ? '×2 швидкість касту в мантії (магічна броня).'
                : mysticLike.kind === 'passive' && mysticLike.hintUk.trim()
                  ? mysticLike.hintUk.replace(/^Пасив:\s*/i, '').trim()
                  : (null as string | null),
        }
      : magisterBattleStatsPreview(
          o.battleId,
          o.kind,
          effLevel,
          o.minLevel,
          rankPreview
        );
    const canonBattleId = canonicalBattleSkillId(o.battleId);
    if (canonBattleId === 'l2_290') {
      st.statsNoteUk = finalFrenzyStatsNoteUk(rankPreview, Math.max(1, snap.pAtk));
    }
    if (canonBattleId === 'l2_257') {
      st.statsNoteUk = swordBluntMasteryStatsNoteUk(maxSkillLevel);
    }
    if (o.l2SkillId === 211) {
      st.statsNoteUk = boostHpStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 142 && !mysticLike) {
      st.statsNoteUk = weaponMasteryFighterStatsNoteUk(rankPreview);
    } else if (
      mysticLike &&
      (o.l2SkillId === 142 ||
        isMysticWeaponMasterySkill({
          l2SkillId: o.l2SkillId,
          nameUk: o.nameUk,
          effectStats: mysticLike.effects.map((fx) => fx.stat),
        }))
    ) {
      st.statsNoteUk = weaponMasteryMysticStatsNoteUk(rankPreview);
    }
    const dreadNote = dreadnoughtSkillStatsNoteUk({
      canonBattleId,
      rankPreview,
      maxSkillLevel,
      power: st.power,
    });
    if (dreadNote) {
      st.statsNoteUk = dreadNote;
    }
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
    const l2dbHint = L2DB_SKILL_HINT_UK_BY_ID[o.l2SkillId];
    const passiveHintUk =
      o.kind === 'passive'
        ? st.statsNoteUk && st.statsNoteUk.trim()
          ? st.statsNoteUk.trim()
          : o.l2SkillId === 142 && !mysticLike
            ? WEAPON_MASTERY_FIGHTER_HINT_UK
            : mysticLike &&
                (o.l2SkillId === 142 ||
                  isMysticWeaponMasterySkill({
                    l2SkillId: o.l2SkillId,
                    nameUk: o.nameUk,
                    effectStats: mysticLike.effects.map((fx) => fx.stat),
                  }))
              ? WEAPON_MASTERY_MYSTIC_HINT_UK
              : mysticLike && mysticLike.hintUk.trim()
                ? mysticLike.hintUk.trim()
                : l2dbHint && l2dbHint.trim()
                  ? l2dbHint.trim()
                  : o.hintUk.trim()
        : '';
    const compactHintUk =
      o.kind === 'passive'
        ? passiveHintUk
        : compactSkillHintUk({
            baseHint: o.hintUk.trim()
              ? o.hintUk
              : l2dbHint && l2dbHint.trim()
                ? l2dbHint
                : '',
            kind: o.kind,
            mpCost: st.mp,
            power: st.power,
            statsNoteUk: st.statsNoteUk,
          });
    skills.push({
      battleId: o.battleId,
      l2SkillId: o.l2SkillId,
      minLevel: o.minLevel,
      spCost: learnedMax ? 0 : spNext,
      nameUk: o.nameUk,
      hintUk: compactHintUk,
      kind: o.kind,
      iconUrl: skillIconUrlForClient(o.l2SkillId),
      skillLevel,
      maxSkillLevel,
      learnedMax,
      learned: skillLevel >= 1,
      canLearn,
      mpCost: st.mp,
      damagePower: st.power,
      statsNoteUk: o.kind === 'passive' ? null : st.statsNoteUk,
      damageHintUk: mysticLike
        ? null
        : magisterDamageHintUk(o.battleId, atkBase, st.power),
    });
  }

  skills.sort((a, b) => {
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
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const row = char as CharacterRow;
    const hfOk = isFighterClassBranch(row.classBranch);
    const hmOk = isMysticClassBranch(row.classBranch);
    if (!hfOk && !hmOk) {
      throw new Error('skill_wrong_class');
    }

    const prof = resolveL2ProfessionForSkillsRow(row);

    const gateCtx = {
      row: { race: row.race, classBranch: row.classBranch },
      currentProf: prof,
      effLevel: levelFromTotalExp(char.exp),
      battleId: canon,
    };

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
      throwIfMagisterHidesFutureProfessionSkill({
        ...gateCtx,
        catalogMinLevel: mysticOffer.minLevel,
      });
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
      if (!raceFighterCatalogEntryVisibleForProfession(raceFighterOffer, prof)) {
        throw new Error('skill_wrong_class');
      }
      if (!raceFighterCatalogEntryOfferedAtGludioMagister(raceFighterOffer, prof)) {
        throw new Error('skill_wrong_class');
      }
      throwIfMagisterHidesFutureProfessionSkill({
        ...gateCtx,
        catalogMinLevel: raceFighterOffer.minLevel,
      });
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
      if (
        !raceFighterCatalogEntryAllowsSkillRank(raceFighterOffer, prof, nextLv)
      ) {
        throw new Error('skill_wrong_class');
      }
      spNeed = spCostForMysticSkillRankUpgrade(raceFighterOffer, nextLv);
    } else {
      if (!fighterOffer) throw new Error('skill_unknown');
      if (!catalogEntryVisibleForProfession(fighterOffer, prof)) {
        throw new Error('skill_wrong_class');
      }
      throwIfMagisterHidesFutureProfessionSkill({
        ...gateCtx,
        catalogMinLevel: fighterOffer.minLevel,
      });
      const maxR = maxSkillRankForCatalogEntry(fighterOffer, prof);
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

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          sp: char.sp - spNeed,
          skillsLearnedJson: nextEntries as unknown as Prisma.InputJsonValue,
        },
      })
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}

