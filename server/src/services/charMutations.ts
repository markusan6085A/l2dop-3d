import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  parseInventory,
  parseInventoryRaw,
  stripEquippedFromStacks,
  needsStarterKitMigration,
  migrateInventoryToSk2,
  equipFromBag,
  unequipSlot,
  ensureMysticRobeStarterPieces,
} from '../data/inventory.js';
import { resolveMapMovement, resolveMapMovementPatch } from '../domain/mapMovement.js';
import { GameConflictError } from './charErrors.js';
import { applyPassiveHpRegen, computePassiveHpRegenPatch } from './charPassiveRegen.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import { resolveL2ProfessionForSkillsRow } from '../data/l2dopHumanFighterBattleSkills.js';
import {
  isMysticClassBranch,
  MYSTIC_STARTER_LEARNED_SKILLS,
} from '../data/l2dopHumanMysticBattleSkills.js';
import { mutateCharacterWithRevision } from './characterMutation.js';


function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function movementFieldsChanged(a: CharacterRow, b: CharacterRow): boolean {
  return (
    a.worldX !== b.worldX ||
    a.worldY !== b.worldY ||
    a.targetX !== b.targetX ||
    a.targetY !== b.targetY ||
    (a.moveStartAt?.getTime() ?? 0) !== (b.moveStartAt?.getTime() ?? 0) ||
    a.moveFromX !== b.moveFromX ||
    a.moveFromY !== b.moveFromY
  );
}

/**
 * Зберегти режим героя / Zealot у БД (як cs1.php $heroic / $zealot). Оновлює revision.
 */
export async function applyPersistedCombatBuffs(
  userId: string,
  expectedRevision: number,
  buffHeroicTier: number | null,
  buffZealotStacks: number | null
): Promise<CharacterSnapshot> {
  if (
    buffHeroicTier != null &&
    buffHeroicTier !== 1 &&
    buffHeroicTier !== 2 &&
    buffHeroicTier !== 3
  ) {
    throw new Error('invalid_heroic_tier');
  }
  if (
    buffZealotStacks != null &&
    (!Number.isInteger(buffZealotStacks) ||
      buffZealotStacks < 1 ||
      buffZealotStacks > 3)
  ) {
    throw new Error('invalid_zealot_stacks');
  }

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          base.buffHeroicTier !== buffHeroicTier ||
          base.buffZealotStacks !== buffZealotStacks;
        if (!changed) {
          return { changed: false };
        }
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            buffHeroicTier,
            buffZealotStacks,
          },
        };
      }
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}

export async function getSnapshotForUser(
  userId: string
): Promise<CharacterSnapshot | null> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!row) return null;

    const cr = row as CharacterRow;
    const nowMs = Date.now();
    const data: Prisma.CharacterUncheckedUpdateInput = {};
    let bumpRevision = false;

    let invJsonForShadow = cr.inventoryJson;
    const invRaw = parseInventoryRaw(cr.inventoryJson);
    const invStripped = stripEquippedFromStacks(invRaw);
    if (
      JSON.stringify(invRaw.stacks) !== JSON.stringify(invStripped.stacks)
    ) {
      invJsonForShadow = invStripped as unknown as Prisma.JsonValue;
      data.inventoryJson = invStripped as unknown as Prisma.InputJsonValue;
      bumpRevision = true;
    }
    let inv = invStripped;
    if (needsStarterKitMigration(inv)) {
      const migrated = migrateInventoryToSk2(inv);
      inv = migrated;
      invJsonForShadow = migrated as unknown as Prisma.JsonValue;
      data.inventoryJson = migrated as unknown as Prisma.InputJsonValue;
      bumpRevision = true;
    }
    const robePatch = ensureMysticRobeStarterPieces(inv, cr.classBranch);
    if (robePatch.changed) {
      inv = robePatch.inv;
      invJsonForShadow = robePatch.inv as unknown as Prisma.JsonValue;
      data.inventoryJson = robePatch.inv as unknown as Prisma.InputJsonValue;
      bumpRevision = true;
    }

    const prof = resolveL2ProfessionForSkillsRow(cr);
    const currentEntries = normalizeLearnedSkillsJson(cr.skillsLearnedJson);
    let nextEntries = filterLearnedSkillEntriesForCharacter(
      currentEntries,
      cr.race,
      cr.classBranch,
      prof
    );
    const sa = JSON.stringify(
      [...currentEntries].sort((x, y) => x.battleId.localeCompare(y.battleId))
    );
    const sbFiltered = JSON.stringify(
      [...nextEntries].sort((x, y) => x.battleId.localeCompare(y.battleId))
    );
    if (sa !== sbFiltered) {
      bumpRevision = true;
    }
    if (isMysticClassBranch(cr.classBranch)) {
      const have = new Set(
        nextEntries.filter((e) => e.level >= 1).map((e) => e.battleId)
      );
      const missingStarters = MYSTIC_STARTER_LEARNED_SKILLS.filter(
        (s) => !have.has(s.battleId)
      );
      if (missingStarters.length > 0) {
        nextEntries = normalizeLearnedSkillsJson([
          ...nextEntries,
          ...missingStarters,
        ]);
        bumpRevision = true;
      }
    }
    const sb = JSON.stringify(
      [...nextEntries].sort((x, y) => x.battleId.localeCompare(y.battleId))
    );
    const oldSkillsSorted = JSON.stringify(
      [...normalizeLearnedSkillsJson(cr.skillsLearnedJson)].sort((x, y) =>
        x.battleId.localeCompare(y.battleId)
      )
    );
    let skillsJsonForShadow = cr.skillsLearnedJson;
    if (sb !== oldSkillsSorted) {
      skillsJsonForShadow = nextEntries as unknown as Prisma.JsonValue;
      data.skillsLearnedJson = nextEntries as unknown as Prisma.InputJsonValue;
    }

    const shadowRow = {
      ...cr,
      inventoryJson: invJsonForShadow,
      skillsLearnedJson: skillsJsonForShadow,
    } as CharacterRow;

    const regenPatch = computePassiveHpRegenPatch(shadowRow, nowMs);
    if (regenPatch.changed) {
      data.hp = regenPatch.nextHp;
      bumpRevision = true;
    }

    const movePatch = resolveMapMovementPatch(shadowRow, nowMs);
    if (movePatch.changed) {
      data.worldX = movePatch.data.worldX;
      data.worldY = movePatch.data.worldY;
      data.targetX = movePatch.data.targetX;
      data.targetY = movePatch.data.targetY;
      data.moveStartAt = movePatch.data.moveStartAt;
      data.moveFromX = movePatch.data.moveFromX;
      data.moveFromY = movePatch.data.moveFromY;
      bumpRevision = true;
    }

    const hasWrite =
      Object.keys(data).length > 0;
    if (!hasWrite) {
      return toSnapshot(cr);
    }
    if (bumpRevision) {
      data.revision = { increment: 1 };
    }
    const next = await tx.character.update({
      where: { id: cr.id },
      data,
    });
    return toSnapshot(next as CharacterRow);
  });
}

export async function applyEquipFromBag(
  userId: string,
  itemId: number,
  expectedRevision: number,
  enchant: number = 0
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const nextInv = equipFromBag(inv, itemId, enchant);
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          JSON.stringify(nextInv) !== JSON.stringify(inv);
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}

export async function applyUnequip(
  userId: string,
  slot: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const nextInv = unequipSlot(inv, slot);
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          JSON.stringify(nextInv) !== JSON.stringify(inv);
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}

