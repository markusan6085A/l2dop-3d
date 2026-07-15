import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import { mysticStarterLearnedSkillsForRace } from '../data/mysticStarterSkills.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import type { CharacterRow } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function mergeMissingMysticStarterSkills(
  entries: ReturnType<typeof normalizeLearnedSkillsJson>
): ReturnType<typeof normalizeLearnedSkillsJson> | null {
  const have = new Set(
    entries.filter((e) => e.level >= 1).map((e) => e.battleId)
  );
  const missing = mysticStarterLearnedSkillsForRace(row.race).filter(
    (s) => !have.has(s.battleId)
  );
  if (missing.length === 0) return null;
  return normalizeLearnedSkillsJson([...entries, ...missing]);
}

/**
 * Старі персонажі-містики: один раз додаємо стартові Wind Strike + Spellcraft.
 */
export async function ensureMysticStarterSkillsRow(
  row: CharacterRow
): Promise<CharacterRow> {
  if (!isMysticClassBranch(row.classBranch)) return row;
  const prof = resolveL2ProfessionForSkillsRow(row);
  const current = normalizeLearnedSkillsJson(row.skillsLearnedJson);
  const mergedRaw = mergeMissingMysticStarterSkills(current);
  if (!mergedRaw) return row;
  const merged = filterLearnedSkillEntriesForCharacter(
    mergedRaw,
    row.race,
    row.classBranch,
    prof
  );
  const sa = JSON.stringify(
    [...current].sort((x, y) => x.battleId.localeCompare(y.battleId))
  );
  const sb = JSON.stringify(
    [...merged].sort((x, y) => x.battleId.localeCompare(y.battleId))
  );
  if (sa === sb) return row;
  return prisma.$transaction(async (tx) => {
    const result = await mutateCharacterWithRevision(
      tx,
      row.id,
      row.revision,
      () => ({
        changed: true,
        data: {
          skillsLearnedJson: merged as unknown as Prisma.InputJsonValue,
        },
      })
    );
    if (!result.ok) {
      return (result.character as CharacterRow | null) ?? row;
    }
    return result.character as CharacterRow;
  });
}

/**
 * Прибирає з БД у `skillsLearnedJson` записи скілів іншої професії.
 * Один раз при завантаженні персонажа — revision +1 лише якщо щось видалили.
 */
export async function ensureSanitizedSkillsLearnedRow(
  row: CharacterRow
): Promise<CharacterRow> {
  if (!isFighterClassBranch(row.classBranch) && !isMysticClassBranch(row.classBranch)) {
    return row;
  }
  const prof = resolveL2ProfessionForSkillsRow(row);
  const entries = normalizeLearnedSkillsJson(row.skillsLearnedJson);
  const filtered = filterLearnedSkillEntriesForCharacter(
    entries,
    row.race,
    row.classBranch,
    prof
  );
  const sa = JSON.stringify(
    [...entries].sort((x, y) => x.battleId.localeCompare(y.battleId))
  );
  const sb = JSON.stringify(
    [...filtered].sort((x, y) => x.battleId.localeCompare(y.battleId))
  );
  if (sa === sb) return row;
  return prisma.$transaction(async (tx) => {
    const result = await mutateCharacterWithRevision(
      tx,
      row.id,
      row.revision,
      () => ({
        changed: true,
        data: {
          skillsLearnedJson: filtered as unknown as Prisma.InputJsonValue,
        },
      })
    );
    if (!result.ok) {
      return (result.character as CharacterRow | null) ?? row;
    }
    return result.character as CharacterRow;
  });
}
