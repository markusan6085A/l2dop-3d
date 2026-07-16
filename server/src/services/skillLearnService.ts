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
import { hammerCrushStatsNoteUk } from '../data/hammerCrushTables.js';
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
import { magicResistanceStatsNoteUk } from '../data/magicResistanceTables.js';
import { shieldMasteryStatsNoteUk } from '../data/shieldMasteryTables.js';
import { fighterPassiveHintUk } from '../data/fighterCommonPassiveSkillDisplay.js';
import { fastHpRecoveryStatsNoteUk } from '../data/fastHpRecoveryTables.js';
import { focusMindStatsNoteUk } from '../data/focusMindTables.js';
import { battleRoarStatsNoteUk } from '../data/battleRoarTables.js';
import { majestyStatsNoteUk } from '../data/majestyTables.js';
import { deflectArrowStatsNoteUk } from '../data/deflectArrowTables.js';
import { aggressionStatsNoteUk } from '../data/aggressionTables.js';
import { hateAuraStatsNoteUk } from '../data/hateAuraTables.js';
import { divineHealStatsNoteUk } from '../data/divineHealTables.js';
import { holyBlessingStatsNoteUk } from '../data/holyBlessingTables.js';
import { sacrificeStatsNoteUk } from '../data/sacrificeTables.js';
import { shieldFortressStatsNoteUk } from '../data/shieldFortressTables.js';
import { fortitudeStatsNoteUk } from '../data/fortitudeTables.js';
import { ironWillStatsNoteUk } from '../data/ironWillTables.js';
import { finalFortressStatsNoteUk } from '../data/finalFortressTables.js';
import { reflectDamageStatsNoteUk } from '../data/reflectDamageTables.js';
import { touchOfDeathStatsNoteUk } from '../data/touchOfDeathTables.js';
import { dashStatsNoteUk } from '../data/dashTables.js';
import { rapidShotStatsNoteUk } from '../data/rapidShotTables.js';
import { stunShotStatsNoteUk } from '../data/stunShotTables.js';
import { criticalPowerStatsNoteUk } from '../data/criticalPowerTables.js';
import { criticalChanceStatsNoteUk } from '../data/criticalChanceTables.js';
import { boostEvasionStatsNoteUk } from '../data/boostEvasionTables.js';
import { boostAttackSpeedStatsNoteUk } from '../data/boostAttackSpeedTables.js';
import { accuracyStanceStatsNoteUk } from '../data/accuracyStanceTables.js';
import { quickStepStatsNoteUk } from '../data/quickStepTables.js';
import { bowMasteryStatsNoteUk } from '../data/bowMasteryTables.js';
import { daggerMasteryStatsNoteUk } from '../data/daggerMasteryTables.js';
import { ultimateDefenseStatsNoteUk } from '../data/ultimateDefenseTables.js';
import { shieldStunStatsNoteUk } from '../data/shieldStunTables.js';
import { shieldSlamStatsNoteUk } from '../data/shieldSlamTables.js';
import { physicalMirrorStatsNoteUk } from '../data/physicalMirrorTables.js';
import { vengeanceStatsNoteUk } from '../data/vengeanceTables.js';
import {
  heavyArmorMasteryStatsNoteUk,
  isHeavyArmorKnightFlatCatalogSkill,
} from '../data/heavyArmorMasteryTables.js';
import {
  lightArmorMasteryStatsNoteUk,
} from '../data/lightArmorMasteryTables.js';
import {
  polearmMasteryStatsNoteUk,
} from '../data/polearmMasteryTables.js';
import {
  DUAL_WEAPON_MASTERY_HINT_UK,
  dualWeaponMasteryStatsNoteUk,
} from '../data/dualWeaponMasteryTables.js';
import {
  powerSmashStatsNoteUk,
} from '../data/powerSmashTables.js';
import { stunAttackStatsNoteUk } from '../data/stunAttackTables.js';
import { viciousStanceStatsNoteUk } from '../data/viciousStanceTables.js';
import {
  swordBluntMasteryStatsNoteUk,
} from '../data/swordBluntMasteryTables.js';
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from '../data/textRpgPassiveEffects.generated.js';
import {
  magisterBattleStatsPreview,
  isGenericPassiveMagisterNoteUk,
} from './skillLearnMagisterBattleStatsPreview.js';
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

function extractSkillEquipHintUk(baseHint: string): string | null {
  const base = String(baseHint || '').replace(/\s+/g, ' ').trim();
  const equipMatch =
    base.match(/Лише з [^.]+/i) ??
    base.match(/Потрібен [^.]+/i) ??
    base.match(/Меч, булава або дуал/i) ??
    base.match(/Лише зі списом[^.]*/i) ??
    base.match(/Лише з луком[^.]*/i);
  return equipMatch ? equipMatch[0].replace(/\.$/, '') : null;
}

function equipHintAlreadyInText(equip: string | null, text: string): boolean {
  if (!equip || !text) return false;
  const needle = equip
    .replace(/^ліше з\s*/i, '')
    .replace(/^потрібен\s*/i, '')
    .slice(0, 12)
    .toLowerCase();
  return needle.length >= 4 && text.toLowerCase().includes(needle);
}

function joinMagisterHintParts(parts: string[]): string {
  const clean = parts
    .map((p) => String(p || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((p) => p.replace(/\.+$/, ''));
  if (clean.length === 0) return '';
  return clean.join('. ') + '.';
}

function compactSkillHintUk(args: {
  baseHint: string;
  kind: 'battle' | 'toggle' | 'passive';
  mpCost: number | null;
  power: number | null;
  statsNoteUk: string | null;
}): string {
  const statsNote = args.statsNoteUk?.trim();
  if (statsNote) {
    const equip = extractSkillEquipHintUk(args.baseHint);
    if (equip && !equipHintAlreadyInText(equip, statsNote)) {
      return joinMagisterHintParts([statsNote, equip]);
    }
    return statsNote.endsWith('.') ? statsNote : statsNote + '.';
  }

  const base = String(args.baseHint || '').replace(/\s+/g, ' ').trim();
  const firstSentence = base.split('.').map((s) => s.trim()).find(Boolean) ?? '';
  const equip = extractSkillEquipHintUk(base);
  const tech: string[] = [];
  if (args.mpCost != null) {
    tech.push('MP ' + Math.max(0, Math.floor(args.mpCost)));
  }
  if (args.power != null) {
    tech.push('сила ' + Math.max(0, Math.floor(args.power)));
  }

  const parts: string[] = [];
  if (firstSentence) parts.push(firstSentence);
  if (tech.length > 0) parts.push(tech.join(', '));
  if (equip && !equipHintAlreadyInText(equip, firstSentence)) parts.push(equip);
  return joinMagisterHintParts(parts);
}

function appendMagisterDamageHintUk(
  hintUk: string,
  damageHintUk: string | null,
  power: number | null
): string {
  const damage = String(damageHintUk || '').replace(/\s+/g, ' ').trim();
  if (!damage) return hintUk;
  let shortDamage = damage;
  if (power != null && Number.isFinite(power)) {
    shortDamage = shortDamage.replace(
      new RegExp('\\s*·\\s*power\\s+' + Math.floor(power) + '\\b', 'i'),
      ''
    );
  }
  shortDamage = shortDamage.replace(/\s+/g, ' ').trim();
  if (!shortDamage) return hintUk;
  const base = String(hintUk || '').replace(/\s+/g, ' ').trim();
  if (!base) return shortDamage.endsWith('.') ? shortDamage : shortDamage + '.';
  return joinMagisterHintParts([base.replace(/\.+$/, ''), shortDamage]);
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
      ? 'Лише спис/алебарда. r≈150, сила ' +
          p +
          '; скидає таргет; можливий оверхit.'
      : 'Лише спис/алебарда. r≈150, AoE-удар; скидає таргет цілей.';
  }
  if (b === 'l2_361') {
    const p = args.power != null ? Math.max(0, Math.floor(args.power)) : null;
    return p != null
      ? 'Лише спис/алебарда. r≈150 навколо цілі, сила ' +
          p +
          '; стан ~9 с (40%); −30% P.Def/M.Def; скидає таргет; можливий оверхit.'
      : 'Лише спис/алебарда. r≈150, AoE-удар; стан ~9 с; −30% P.Def/M.Def; скидає таргет.';
  }
  if (b === 'l2_359') {
    return 'Поточний ранг: +30% P.Atk проти Animal/Plant/Insect на 10 хв (33 MP).';
  }
  if (b === 'l2_360') {
    return 'Поточний ранг: +30% P.Atk проти Beast/Magic Creature/Giant/Dragon на 10 хв (71 MP, каст 2 с, відкат 3 с).';
  }
  if (b === 'l2_340') {
    return 'Поточний ранг: toggle — 30% відбиття ближнього урону; −20% Atk.Spd., −10% Run Speed, −4 Accuracy.';
  }
  if (b === 'l2_345') {
    return 'Поточний ранг: дальній удар; +1 Sonic Focus. Лише дуальний меч.';
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
        : minCharLevelForSkillRank(o as HumanFighterSkillCatalogEntry, nextRank, prof);
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
      : spCostForSkillRankUpgrade(o.battleId, nextRank, prof) ?? o.spCost;
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
    if (canonBattleId === 'l2_291') {
      st.statsNoteUk = finalFortressStatsNoteUk(rankPreview, Math.max(1, snap.pDef));
    }
    if (canonBattleId === 'l2_255' && !mysticLike) {
      st.statsNoteUk = powerSmashStatsNoteUk(rankPreview);
    }
    if (canonBattleId === 'l2_100' && !mysticLike) {
      st.statsNoteUk = stunAttackStatsNoteUk(rankPreview);
    }
    if (canonBattleId === 'l2_260') {
      st.statsNoteUk = hammerCrushStatsNoteUk(rankPreview);
    }
    if (o.l2SkillId === 312 && !mysticLike) {
      st.statsNoteUk = viciousStanceStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 256 && !mysticLike) {
      st.statsNoteUk = accuracyStanceStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 169 && !mysticLike) {
      st.statsNoteUk = quickStepStatsNoteUk(rankPreview);
    }
    if (o.l2SkillId === 211) {
      st.statsNoteUk = boostHpStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 212) {
      st.statsNoteUk = fastHpRecoveryStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 191) {
      st.statsNoteUk = focusMindStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 121) {
      st.statsNoteUk = battleRoarStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 82) {
      st.statsNoteUk = majestyStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 110) {
      st.statsNoteUk = ultimateDefenseStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 112) {
      st.statsNoteUk = deflectArrowStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 28) {
      st.statsNoteUk = aggressionStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 18 && !mysticLike) {
      st.statsNoteUk = hateAuraStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 45) {
      st.statsNoteUk = divineHealStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 262 && !mysticLike) {
      st.statsNoteUk = holyBlessingStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 69 && !mysticLike) {
      st.statsNoteUk = sacrificeStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 322 && !mysticLike) {
      st.statsNoteUk = shieldFortressStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 335 && !mysticLike) {
      st.statsNoteUk = fortitudeStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 72 && !mysticLike) {
      st.statsNoteUk = ironWillStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 291 && !mysticLike) {
      st.statsNoteUk = finalFortressStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 86 && !mysticLike) {
      st.statsNoteUk = reflectDamageStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 342 && !mysticLike) {
      st.statsNoteUk = touchOfDeathStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 4 && !mysticLike) {
      st.statsNoteUk = dashStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 99 && !mysticLike) {
      st.statsNoteUk = rapidShotStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 101 && !mysticLike) {
      st.statsNoteUk = stunShotStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 193 && !mysticLike) {
      st.statsNoteUk = criticalPowerStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 137 && !mysticLike) {
      st.statsNoteUk = criticalChanceStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 198 && !mysticLike) {
      st.statsNoteUk = boostEvasionStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 168 && !mysticLike) {
      st.statsNoteUk = boostAttackSpeedStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 92 && !mysticLike) {
      st.statsNoteUk = shieldStunStatsNoteUk(rankPreview, effLevel);
    } else if (o.l2SkillId === 353 && !mysticLike) {
      st.statsNoteUk = shieldSlamStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 350 && !mysticLike) {
      st.statsNoteUk = physicalMirrorStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 368 && !mysticLike) {
      st.statsNoteUk = vengeanceStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 231) {
      const passiveEffects =
        'effects' in o && Array.isArray(o.effects)
          ? o.effects.map((fx) => ({ stat: fx.stat, mode: fx.mode }))
          : [];
      const haNoteId = isHeavyArmorKnightFlatCatalogSkill(
        o.l2SkillId,
        passiveEffects
      )
        ? 232
        : 231;
      st.statsNoteUk = heavyArmorMasteryStatsNoteUk(rankPreview, haNoteId);
    } else if (o.l2SkillId === 232 && !mysticLike) {
      st.statsNoteUk = heavyArmorMasteryStatsNoteUk(rankPreview, 232);
    } else if (o.l2SkillId === 227 && !mysticLike) {
      st.statsNoteUk = lightArmorMasteryStatsNoteUk(rankPreview, prof);
    } else if (o.l2SkillId === 208 && !mysticLike) {
      st.statsNoteUk = bowMasteryStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 209 && !mysticLike) {
      st.statsNoteUk = daggerMasteryStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 216 && !mysticLike) {
      st.statsNoteUk = polearmMasteryStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 144 && !mysticLike) {
      st.statsNoteUk = dualWeaponMasteryStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 257) {
      st.statsNoteUk = swordBluntMasteryStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 147 && !mysticLike) {
      st.statsNoteUk = magicResistanceStatsNoteUk(rankPreview);
    } else if (o.l2SkillId === 153 && !mysticLike) {
      st.statsNoteUk = shieldMasteryStatsNoteUk(
        skillLevel >= 1 ? skillLevel : nextRank
      );
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
        : canonBattleId === 'l2_260'
          ? magisterEstimatedAtkBase(
              o.battleId,
              o.kind,
              effLevel,
              o.minLevel,
              snap.pAtk,
              prof,
              rankPreview
            )
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
    const commonPassiveHint =
      o.kind === 'passive' && !mysticLike
        ? fighterPassiveHintUk(o.l2SkillId)
        : undefined;
    const passiveHintUk =
      o.kind === 'passive'
        ? st.statsNoteUk &&
            st.statsNoteUk.trim() &&
            !isGenericPassiveMagisterNoteUk(st.statsNoteUk)
          ? st.statsNoteUk.trim()
          : commonPassiveHint
            ? commonPassiveHint
            : o.hintUk.trim()
              ? o.hintUk.trim()
              : o.l2SkillId === 144 && !mysticLike
              ? DUAL_WEAPON_MASTERY_HINT_UK
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
        : appendMagisterDamageHintUk(
            compactSkillHintUk({
              baseHint: o.hintUk.trim()
                ? o.hintUk
                : l2dbHint && l2dbHint.trim()
                  ? l2dbHint
                  : '',
              kind: o.kind,
              mpCost: st.mp,
              power: st.power,
              statsNoteUk: st.statsNoteUk,
            }),
            mysticLike
              ? null
              : magisterDamageHintUk(o.battleId, atkBase, st.power),
            st.power
          );
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
      statsNoteUk:
        o.kind === 'passive' && passiveHintUk.trim()
          ? passiveHintUk.trim()
          : null,
      damageHintUk: null,
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
      const minForNext = minCharLevelForSkillRank(fighterOffer, nextLv, prof);
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
      spNeed = spCostForSkillRankUpgrade(canon, nextLv, prof) ?? fighterOffer.spCost;
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

