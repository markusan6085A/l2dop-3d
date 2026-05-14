import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import type { CharacterRow } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

const MYSTIC_STARTER_BATTLE_ID = 'l2_1177';

/**
 * Старі персонажі-містики без жодного вивченого скіла: один раз додаємо «Удар вітру».
 */
export async function ensureMysticStarterSkillsRow(
  row: CharacterRow
): Promise<CharacterRow> {
  if (!isMysticClassBranch(row.classBranch)) return row;
  const prof = resolveL2ProfessionForSkillsRow(row);
  const entries = filterLearnedSkillEntriesForCharacter(
    normalizeLearnedSkillsJson(row.skillsLearnedJson),
    row.race,
    row.classBranch,
    prof
  );
  if (entries.some((e) => e.level >= 1)) return row;

  const merged = normalizeLearnedSkillsJson([
    ...normalizeLearnedSkillsJson(row.skillsLearnedJson),
    { battleId: MYSTIC_STARTER_BATTLE_ID, level: 1 },
  ]);
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
