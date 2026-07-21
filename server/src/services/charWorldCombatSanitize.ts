import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import { resolveL2ProfessionForSkillsRow } from '../data/l2dopHumanFighterBattleSkills.js';
import { viciousStanceRankFromLearnedEntries } from '../data/l2dopFocusAttack.js';
import {
  parseWorldCombatState,
  type WorldCombatState,
} from '../domain/worldCombatState.js';
import {
  repairViciousStanceBattleModsInPlace,
} from '../data/viciousStanceTables.js';
import type { CharacterRow } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function repairWorldCombatViciousStance(
  row: CharacterRow
): { next: WorldCombatState | null; changed: boolean } {
  const parsed = parseWorldCombatState(row.worldCombatStateJson);
  if (!parsed) return { next: null, changed: false };

  const prof = resolveL2ProfessionForSkillsRow(row);
  const learned = filterLearnedSkillEntriesForCharacter(
    normalizeLearnedSkillsJson(row.skillsLearnedJson),
    row.race,
    row.classBranch,
    prof
  );
  const learnedRank = viciousStanceRankFromLearnedEntries(learned);
  const mods = { ...parsed.battleMods };
  const changed = repairViciousStanceBattleModsInPlace(mods, learnedRank);
  if (!changed) return { next: parsed, changed: false };

  return {
    next: { ...parsed, battleMods: mods },
    changed: true,
  };
}

/**
 * Read-path repair Vicious Stance у `worldCombatStateJson` — один раз у БД,
 * як `ensureInventoryReadPatchesRow`.
 */
export async function ensureWorldCombatViciousStanceReadRepairRow(
  row: CharacterRow
): Promise<CharacterRow> {
  const { next, changed } = repairWorldCombatViciousStance(row);
  if (!changed || !next) return row;

  return prisma.$transaction(async (tx) => {
    const result = await mutateCharacterWithRevision(
      tx,
      row.id,
      row.revision,
      () => ({
        changed: true,
        data: {
          worldCombatStateJson: JSON.parse(
            JSON.stringify(next)
          ) as unknown as Prisma.InputJsonValue,
        },
      })
    );
    if (!result.ok) {
      const fallback = (result.character as CharacterRow | null) ?? row;
      return row.clan ? { ...fallback, clan: row.clan } : fallback;
    }
    const updated = result.character as CharacterRow;
    return row.clan ? { ...updated, clan: row.clan } : updated;
  });
}
