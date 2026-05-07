import type { CharacterRow } from './charService.js';
import { HUMAN_FIGHTER_SKILL_CATALOG } from '../data/humanFighterSkillCatalog.js';
import {
  isFighterClassBranch,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  isL2DarkElfRace,
  isL2DwarfRace,
  isL2ElfRace,
  isL2HumanRace,
  isL2OrcRace,
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import { ELVEN_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/elvenFighterSkillCatalog.generated.js';
import { DARK_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/darkFighterSkillCatalog.generated.js';
import { ORC_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/orcFighterSkillCatalog.generated.js';
import { DWARF_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/dwarfFighterSkillCatalog.generated.js';
import { ELVEN_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/elvenMysticSkillCatalog.generated.js';
import { DARK_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/darkMysticSkillCatalog.generated.js';
import { ORC_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/orcMysticSkillCatalog.generated.js';
import { HUMAN_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/humanMysticSkillCatalog.generated.js';
import type { HumanFighterSkillCatalogEntry } from '../data/humanFighterSkillCatalog.types.js';
import type { HumanMysticSkillCatalogEntry } from '../data/humanMysticSkillCatalog.types.js';
import { townNpcEntryById } from '../data/townNpcs.js';
import type { MagisterNpcPayload } from './skillLearnMagisterTypes.js';
import { GLUDIO_MAGISTER_NPC } from './skillLearnMagisterTypes.js';

export type MagisterRawOffer =
  | HumanFighterSkillCatalogEntry
  | HumanMysticSkillCatalogEntry;

export const LEARNABLE_IDS = new Set([
  ...HUMAN_FIGHTER_SKILL_CATALOG.map((e) => e.battleId),
  ...ELVEN_FIGHTER_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
  ...DARK_FIGHTER_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
  ...ORC_FIGHTER_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
  ...DWARF_FIGHTER_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
  ...HUMAN_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
  ...ELVEN_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
  ...DARK_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
  ...ORC_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.battleId),
]);

export function offersForCharacter(row: CharacterRow): {
  noteUk: string | null;
  offers: readonly MagisterRawOffer[];
} {
  if (isFighterClassBranch(row.classBranch)) {
    if (isL2ElfRace(row.race)) {
      return { noteUk: null, offers: ELVEN_FIGHTER_SKILL_CATALOG_GENERATED };
    }
    if (isL2DarkElfRace(row.race)) {
      return { noteUk: null, offers: DARK_FIGHTER_SKILL_CATALOG_GENERATED };
    }
    if (isL2OrcRace(row.race)) {
      return { noteUk: null, offers: ORC_FIGHTER_SKILL_CATALOG_GENERATED };
    }
    if (String(row.race ?? '').trim().toLowerCase() === 'dwarf') {
      return { noteUk: null, offers: DWARF_FIGHTER_SKILL_CATALOG_GENERATED };
    }
    return { noteUk: null, offers: HUMAN_FIGHTER_SKILL_CATALOG };
  }
  if (isMysticClassBranch(row.classBranch)) {
    if (isL2ElfRace(row.race)) {
      return { noteUk: null, offers: ELVEN_MYSTIC_SKILL_CATALOG_GENERATED };
    }
    if (isL2DarkElfRace(row.race)) {
      return { noteUk: null, offers: DARK_MYSTIC_SKILL_CATALOG_GENERATED };
    }
    if (isL2OrcRace(row.race)) {
      return { noteUk: null, offers: ORC_MYSTIC_SKILL_CATALOG_GENERATED };
    }
    const r = String(row.race ?? '').trim();
    const noteUk =
      isL2HumanRace(r) || isL2DwarfRace(r)
        ? null
        : 'Поки що той самий список скілів, що й у людини-мага; окремі каталоги для цієї раси ще не підключені.';
    return { noteUk, offers: HUMAN_MYSTIC_SKILL_CATALOG_GENERATED };
  }
  return {
    noteUk:
      'У цього магістра поки що є лише список бойових скілів для гілок воїн і маг. Інші гілки додамо пізніше.',
    offers: [],
  };
}

export function parseMagisterNpcIdQuery(raw: unknown): number | undefined {
  if (raw == null) return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isInteger(n) || n < 1 || n > 999999) return undefined;
  return n;
}

/** Підпис НПС для діалогу: відомий з townNpcs, інакше заглушка (будь-яке місто). */
export function magisterNpcPayloadForEffectiveId(effectiveNpcId: number): MagisterNpcPayload {
  if (effectiveNpcId === GLUDIO_MAGISTER_NPC.npcId) {
    return { ...GLUDIO_MAGISTER_NPC };
  }
  const entry = townNpcEntryById(effectiveNpcId);
  if (entry) {
    return {
      npcId: entry.l2NpcId,
      nameUk: entry.nameUk,
      nameEn: entry.nameEn,
      titleUk: entry.titleUk,
    };
  }
  return {
    npcId: effectiveNpcId,
    nameUk: 'Наставник умінь',
    nameEn: 'Skill Trainer',
    titleUk: 'Магістр',
  };
}
