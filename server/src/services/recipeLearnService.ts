/**
 * Вивчення D-grade weapon recipe scroll (етап 3B).
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  countBagQty,
  parseInventory,
  removeBagQty,
} from '../data/inventory.js';
import {
  D_GRADE_WEAPON_RECIPE_ITEM_BY_ID,
  isDGradeWeaponRecipeItemId,
} from '../data/dGradeWeaponRecipeItemsCatalog.js';
import {
  crafterProfessionLabelUk,
  isDwarfCrafterProfession,
  resolveCreateItemLevel,
} from '../domain/craftedResourceCraftAccess.js';
import {
  addLearnedRecipe,
  isRecipeLearned,
  normalizeRecipeBookJson,
  type RecipeBookJson,
} from '../domain/recipeBook.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { gameConflictFromMutation } from './charConflict.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function normalizeRow(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

export async function applyLearnRecipeFromBag(
  userId: string,
  itemIdRaw: number,
  expectedRevision: number,
): Promise<{ character: CharacterSnapshot; learnedRecipeCode: string }> {
  const itemId = Math.floor(Number(itemIdRaw) || 0);
  if (!isDGradeWeaponRecipeItemId(itemId)) {
    throw new Error('recipe_unknown_item');
  }
  const recipeItem = D_GRADE_WEAPON_RECIPE_ITEM_BY_ID.get(itemId)!;

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');

    let learnedRecipeCode = '';

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizeRow(current as CharacterRow);
        if (parseBattleJson(base.battleJson)) throw new Error('in_battle');

        if (!isDwarfCrafterProfession(base.l2Profession)) {
          throw new Error('recipe_bad_profession');
        }

        const createItemLevel = resolveCreateItemLevel(base);
        if (createItemLevel < 1) throw new Error('recipe_no_create_item');
        if (createItemLevel < recipeItem.requiredCreateItemLevel) {
          throw new Error('RECIPE_CREATE_LEVEL_TOO_LOW');
        }

        const book = normalizeRecipeBookJson(
          (base as CharacterRow & { recipeBookJson?: unknown }).recipeBookJson,
        );
        if (isRecipeLearned(book, recipeItem.targetRecipeCode)) {
          throw new Error('RECIPE_ALREADY_LEARNED');
        }

        const inv = parseInventory(base.inventoryJson);
        if (countBagQty(inv, itemId) < 1) {
          throw new Error('recipe_not_in_bag');
        }

        const nextInv = removeBagQty(inv, itemId, 1);
        const nextBook = addLearnedRecipe(book, recipeItem.targetRecipeCode);
        learnedRecipeCode = recipeItem.targetRecipeCode;

        return {
          changed: true,
          data: {
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
            recipeBookJson: nextBook as unknown as Prisma.InputJsonValue,
          },
        };
      },
    );

    if (!result.ok) throw gameConflictFromMutation(result);
    const character = await buildCharacterClientSnapshot(
      result.character as CharacterRow,
      userId,
    );
    return { character, learnedRecipeCode };
  });
}

export function recipeLearnErrorMessageUk(code: string): string | null {
  const map: Record<string, string> = {
    no_character: 'Персонаж не знайдений.',
    recipe_unknown_item: 'Цей предмет не є рецептом.',
    recipe_bad_profession: `Вивчення доступне тільки професіям ${crafterProfessionLabelUk()}.`,
    recipe_no_create_item: 'Потрібен скіл Create Item.',
    RECIPE_CREATE_LEVEL_TOO_LOW: `Потрібен Create Item рівень ${4}.`,
    RECIPE_ALREADY_LEARNED: 'Рецепт уже вивчено.',
    recipe_not_in_bag: 'Немає рецепта в сумці.',
    in_battle: 'Неможливо під час бою.',
  };
  return map[code] ?? null;
}

export function readRecipeBookFromRow(row: CharacterRow): RecipeBookJson {
  return normalizeRecipeBookJson(
    (row as CharacterRow & { recipeBookJson?: unknown }).recipeBookJson,
  );
}
