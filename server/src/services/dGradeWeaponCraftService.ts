/**
 * Крафт D-grade зброї (етап 3B).
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  addItemToBag,
  countBagQty,
  parseInventory,
  removeBagQty,
  type InventoryState,
} from '../data/inventory.js';
import { ITEM_CATALOG } from '../data/itemsCatalog.js';
import { CRAFTED_RESOURCE_BY_ITEM_ID } from '../data/craftedResourceCatalog.js';
import { GRADE_CRAFT_MATERIAL_BY_ITEM_ID } from '../data/gradeCraftMaterialsCatalog.js';
import { D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID } from '../data/dGradeWeaponKeyMaterialsCatalog.js';
import {
  D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE,
  type DGradeWeaponCraftRecipe,
} from '../data/dGradeWeaponCraftRecipes.js';
import {
  crafterProfessionLabelUk,
  isDwarfCrafterProfession,
  resolveCreateItemLevel,
} from '../domain/craftedResourceCraftAccess.js';
import { isRecipeLearned, normalizeRecipeBookJson } from '../domain/recipeBook.js';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
  type WorldCombatState,
} from '../domain/worldCombatState.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { gameConflictFromMutation } from './charConflict.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { combatOptsFromRow } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

const WORLD_TTL_MS = 30 * 60 * 1000;

export type DGradeWeaponCraftRecipeClientDto = {
  recipeCode: string;
  learned: boolean;
  unlockedByProfession: boolean;
  requiredCreateItemLevel: number;
  currentCreateItemLevel: number;
  successRate: number;
  mpCost: number;
  output: { itemId: number; nameUk: string; iconUrl: string; quantity: number };
  materials: Array<{
    itemId: number;
    nameUk: string;
    iconUrl: string;
    requiredCount: number;
    ownedCount: number;
    enough: boolean;
  }>;
  canCraft: boolean;
  blockedReason: string | null;
};

function normalizeRow(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function ingredientName(itemId: number): string {
  const key = D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(itemId);
  if (key) return key.nameUk;
  const crafted = CRAFTED_RESOURCE_BY_ITEM_ID.get(itemId);
  if (crafted) return crafted.nameUk;
  const gem = GRADE_CRAFT_MATERIAL_BY_ITEM_ID.get(itemId);
  if (gem) return gem.nameUk;
  return ITEM_CATALOG[itemId]?.nameUk ?? `#${itemId}`;
}

function ingredientIcon(itemId: number): string {
  const key = D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(itemId);
  if (key) return key.iconPath;
  const crafted = CRAFTED_RESOURCE_BY_ITEM_ID.get(itemId);
  if (crafted) return crafted.iconUrl;
  const gem = GRADE_CRAFT_MATERIAL_BY_ITEM_ID.get(itemId);
  if (gem) return gem.iconUrl;
  return `/game/item-icon/${itemId}`;
}

function outputIcon(itemId: number): string {
  return `/game/item-icon/${itemId}`;
}

function computeMpCaps(row: CharacterRow, inv: InventoryState, nowMs: number) {
  const effLv = levelFromTotalExp(row.exp);
  const combat = computeCombatStats(
    effLv,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row),
  );
  const vit = computeVitals(effLv, row.race, row.classBranch, combat.con, combat.men);
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const worldTicked = tickWorldCombatState(
    parseWorldCombatState(row.worldCombatStateJson),
    maxMp,
    nowMs,
    combat.regenMp,
  );
  return { maxMp, regenMp: combat.regenMp, worldTicked };
}

function currentMp(row: CharacterRow, maxMp: number, regenMp: number, nowMs: number): number {
  const world = tickWorldCombatState(
    parseWorldCombatState(row.worldCombatStateJson),
    maxMp,
    nowMs,
    regenMp,
  );
  if (world != null) {
    return Math.min(maxMp, Math.max(0, Math.floor(world.playerMp)));
  }
  return maxMp;
}

function buildWorldAfterMp(
  mpAfter: number,
  nowMs: number,
  parsed: WorldCombatState | null,
): Prisma.JsonValue {
  const battleMods =
    parsed?.battleMods && typeof parsed.battleMods === 'object'
      ? parsed.battleMods
      : {};
  const next: Record<string, unknown> = {
    battleMods,
    playerMp: Math.max(0, Math.floor(mpAfter)),
    lastTickAt: nowMs,
    expiresAt:
      parsed != null && typeof parsed.expiresAt === 'number'
        ? parsed.expiresAt
        : nowMs + WORLD_TTL_MS,
  };
  if (parsed?.battleModsExpiresAtMsBySkillId) {
    next.battleModsExpiresAtMsBySkillId = parsed.battleModsExpiresAtMsBySkillId;
  }
  if (parsed?.sonicCharges != null) next.sonicCharges = parsed.sonicCharges;
  if (parsed?.maxSonicCharges != null) next.maxSonicCharges = parsed.maxSonicCharges;
  return next as unknown as Prisma.JsonValue;
}

function blockedReasonForRecipe(
  recipe: DGradeWeaponCraftRecipe,
  learned: boolean,
  unlockedByProfession: boolean,
  createItemLevel: number,
  currentMpVal: number,
  inv: InventoryState,
): string | null {
  if (!unlockedByProfession) {
    return `Крафт доступний тільки професіям ${crafterProfessionLabelUk()}.`;
  }
  if (!learned) return 'Рецепт не вивчено';
  if (createItemLevel < recipe.requiredCreateItemLevel) {
    return `Потрібен Create Item рівня ${recipe.requiredCreateItemLevel}`;
  }
  if (currentMpVal < recipe.mpCost) return 'Недостатньо MP';
  for (const ing of recipe.ingredients) {
    const have = countBagQty(inv, ing.itemId);
    if (have < ing.quantity) {
      return `Недостатньо: ${ingredientName(ing.itemId)}.`;
    }
  }
  return null;
}

export async function buildDGradeWeaponCraftBook(userId: string): Promise<{
  createItemLevel: number;
  currentMp: number;
  maxMp: number;
  canCraftProfession: boolean;
  recipes: DGradeWeaponCraftRecipeClientDto[];
}> {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) throw new Error('no_character');
  const base = normalizeRow(row as CharacterRow);
  const inv = parseInventory(base.inventoryJson);
  const nowMs = Date.now();
  const { maxMp, regenMp } = computeMpCaps(base, inv, nowMs);
  const mpVal = currentMp(base, maxMp, regenMp, nowMs);
  const createItemLevel = resolveCreateItemLevel(base);
  const canCraftProfession = isDwarfCrafterProfession(base.l2Profession);
  const book = normalizeRecipeBookJson(
    (base as CharacterRow & { recipeBookJson?: unknown }).recipeBookJson,
  );

  const recipes = [...D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE.values()].map((recipe) => {
    const learned = isRecipeLearned(book, recipe.recipeCode);
    const outMeta = ITEM_CATALOG[recipe.outputItemId];
    const materials = recipe.ingredients.map((ing) => {
      const owned = countBagQty(inv, ing.itemId);
      return {
        itemId: ing.itemId,
        nameUk: ingredientName(ing.itemId),
        iconUrl: ingredientIcon(ing.itemId),
        requiredCount: ing.quantity,
        ownedCount: owned,
        enough: owned >= ing.quantity,
      };
    });
    const blockedReason = blockedReasonForRecipe(
      recipe,
      learned,
      canCraftProfession,
      createItemLevel,
      mpVal,
      inv,
    );
    return {
      recipeCode: recipe.recipeCode,
      learned,
      unlockedByProfession: canCraftProfession,
      requiredCreateItemLevel: recipe.requiredCreateItemLevel,
      currentCreateItemLevel: createItemLevel,
      successRate: recipe.successRate,
      mpCost: recipe.mpCost,
      output: {
        itemId: recipe.outputItemId,
        nameUk: outMeta?.nameUk ?? `#${recipe.outputItemId}`,
        iconUrl: outputIcon(recipe.outputItemId),
        quantity: recipe.outputCount,
      },
      materials,
      canCraft: blockedReason == null,
      blockedReason,
    };
  });

  return {
    createItemLevel,
    currentMp: mpVal,
    maxMp,
    canCraftProfession,
    recipes,
  };
}

export async function applyDGradeWeaponCraft(
  userId: string,
  recipeCodeRaw: unknown,
  expectedRevision: number,
  craftCountRaw?: unknown,
): Promise<CharacterSnapshot> {
  if (craftCountRaw !== undefined && craftCountRaw !== null) {
    const cc = Number(craftCountRaw);
    if (Number.isFinite(cc) && cc !== 1) {
      throw new Error('weapon_craft_bad_count');
    }
  }

  const recipeCode =
    typeof recipeCodeRaw === 'string' ? recipeCodeRaw.trim().toLowerCase() : '';
  const recipe = D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE.get(recipeCode);
  if (!recipe) throw new Error('craft_unknown_recipe');

  const nowMs = Date.now();

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
        const base = normalizeRow(current as CharacterRow);
        if (parseBattleJson(base.battleJson)) throw new Error('in_battle');

        if (!isDwarfCrafterProfession(base.l2Profession)) {
          throw new Error('craft_bad_profession');
        }

        const createItemLevel = resolveCreateItemLevel(base);
        if (createItemLevel < 1) throw new Error('craft_no_create_item');
        if (createItemLevel < recipe.requiredCreateItemLevel) {
          throw new Error('craft_level_too_low');
        }

        const book = normalizeRecipeBookJson(
          (base as CharacterRow & { recipeBookJson?: unknown }).recipeBookJson,
        );
        if (!isRecipeLearned(book, recipe.recipeCode)) {
          throw new Error('craft_recipe_not_learned');
        }

        let inv = parseInventory(base.inventoryJson);
        const { maxMp, regenMp, worldTicked } = computeMpCaps(base, inv, nowMs);
        const mpVal = currentMp(base, maxMp, regenMp, nowMs);
        if (mpVal < recipe.mpCost) throw new Error('craft_no_mp');

        for (const ing of recipe.ingredients) {
          if (countBagQty(inv, ing.itemId) < ing.quantity) {
            throw new Error('craft_no_materials');
          }
        }

        if (!ITEM_CATALOG[recipe.outputItemId]) {
          throw new Error('craft_bad_output');
        }

        for (const ing of recipe.ingredients) {
          inv = removeBagQty(inv, ing.itemId, ing.quantity);
        }
        inv = addItemToBag(inv, recipe.outputItemId, recipe.outputCount);

        const mpAfter = mpVal - recipe.mpCost;
        const nextWorld = buildWorldAfterMp(mpAfter, nowMs, worldTicked);

        return {
          changed: true,
          data: {
            inventoryJson: inv as unknown as Prisma.InputJsonValue,
            worldCombatStateJson: nextWorld as Prisma.InputJsonValue,
          },
        };
      },
    );

    if (!result.ok) throw gameConflictFromMutation(result);
    return buildCharacterClientSnapshot(result.character as CharacterRow, userId);
  });
}

export function weaponCraftErrorMessageUk(code: string): string | null {
  const map: Record<string, string> = {
    no_character: 'Персонаж не знайдений.',
    craft_unknown_recipe: 'Невідомий рецепт.',
    weapon_craft_bad_count: 'Для зброї можна створити лише 1 предмет за раз.',
    craft_bad_profession: 'Крафт доступний тільки професіям Artisan, Warsmith і Maestro.',
    craft_no_create_item: 'Потрібен скіл Create Item.',
    craft_level_too_low: 'Потрібен Create Item рівень 4.',
    craft_recipe_not_learned: 'Рецепт не вивчено.',
    craft_no_mp: 'Недостатньо MP.',
    craft_no_materials: 'Недостатньо матеріалів.',
    craft_bad_output: 'Невідомий результат крафту.',
    in_battle: 'Неможливо під час бою.',
  };
  return map[code] ?? null;
}
