import type { Prisma } from '@prisma/client';
import {
  parseInventoryRaw,
  stripEquippedFromStacks,
  needsStarterKitMigration,
  migrateInventoryToSk2,
  ensureMysticRobeStarterPieces,
} from '../data/inventory.js';
import { resolveMapMovementPatch } from '../domain/mapMovement.js';
import { computePassiveHpRegenPatch } from './charPassiveRegen.js';
import type { CharacterRow } from './charTypes.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import { resolveL2ProfessionForSkillsRow } from '../data/l2dopHumanFighterBattleSkills.js';
import {
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import { mysticStarterLearnedSkillsForRace } from '../data/mysticStarterSkills.js';

/**
 * Read-path: regen, рух, sanitize скілів/інвентаря лише в пам’яті — без write у БД.
 * Використовувати для GET /character, GET /game/battle, GET /character/map-state.
 */
export function applyCharacterReadView(
  row: CharacterRow,
  nowMs = Date.now()
): CharacterRow {
  let invJsonForShadow = row.inventoryJson;
  const invRaw = parseInventoryRaw(row.inventoryJson);
  let inv = stripEquippedFromStacks(invRaw);
  if (JSON.stringify(invRaw.stacks) !== JSON.stringify(inv.stacks)) {
    invJsonForShadow = inv as unknown as Prisma.JsonValue;
  }
  if (needsStarterKitMigration(inv)) {
    inv = migrateInventoryToSk2(inv);
    invJsonForShadow = inv as unknown as Prisma.JsonValue;
  }
  const robePatch = ensureMysticRobeStarterPieces(inv, row.classBranch);
  if (robePatch.changed) {
    inv = robePatch.inv;
    invJsonForShadow = robePatch.inv as unknown as Prisma.JsonValue;
  }

  const prof = resolveL2ProfessionForSkillsRow(row);
  let nextEntries = filterLearnedSkillEntriesForCharacter(
    normalizeLearnedSkillsJson(row.skillsLearnedJson),
    row.race,
    row.classBranch,
    prof
  );
  if (isMysticClassBranch(row.classBranch)) {
    const have = new Set(
      nextEntries.filter((e) => e.level >= 1).map((e) => e.battleId)
    );
    const missingStarters = mysticStarterLearnedSkillsForRace(row.race).filter(
      (s) => !have.has(s.battleId)
    );
    if (missingStarters.length > 0) {
      nextEntries = normalizeLearnedSkillsJson([
        ...nextEntries,
        ...missingStarters,
      ]);
    }
  }
  const oldSkillsSorted = JSON.stringify(
    [...normalizeLearnedSkillsJson(row.skillsLearnedJson)].sort((x, y) =>
      x.battleId.localeCompare(y.battleId)
    )
  );
  const sb = JSON.stringify(
    [...nextEntries].sort((x, y) => x.battleId.localeCompare(y.battleId))
  );
  let skillsJsonForShadow = row.skillsLearnedJson;
  if (sb !== oldSkillsSorted) {
    skillsJsonForShadow = nextEntries as unknown as Prisma.JsonValue;
  }

  let shadowRow = {
    ...row,
    inventoryJson: invJsonForShadow,
    skillsLearnedJson: skillsJsonForShadow,
  } as CharacterRow;

  const regenPatch = computePassiveHpRegenPatch(shadowRow, nowMs);
  if (regenPatch.changed) {
    shadowRow = { ...shadowRow, hp: regenPatch.nextHp };
  }

  const movePatch = resolveMapMovementPatch(shadowRow, nowMs);
  if (movePatch.changed) {
    shadowRow = {
      ...shadowRow,
      worldX: movePatch.data.worldX,
      worldY: movePatch.data.worldY,
      targetX: movePatch.data.targetX,
      targetY: movePatch.data.targetY,
      moveStartAt: movePatch.data.moveStartAt,
      moveFromX: movePatch.data.moveFromX ?? shadowRow.moveFromX,
      moveFromY: movePatch.data.moveFromY ?? shadowRow.moveFromY,
    };
  }

  return shadowRow;
}
