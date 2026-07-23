/**
 * Крафт проміжних crafted-ресурсів (етап 2).
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  CRAFTED_RESOURCE_BY_ITEM_ID,
} from '../data/craftedResourceCatalog.js';
import {
  CRAFTED_RESOURCE_RECIPE_BY_CODE,
  type CraftedResourceRecipe,
} from '../data/craftedResourceRecipes.js';
import {
  crafterProfessionLabelUk,
  isDwarfCrafterProfession,
  resolveCreateItemLevel,
} from '../domain/craftedResourceCraftAccess.js';
import {
  addItemToBag,
  countBagQty,
  parseInventory,
  removeBagQty,
  type InventoryState,
} from '../data/inventory.js';
import { ITEM_CATALOG } from '../data/itemsCatalog.js';
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
const MAX_CRAFT_COUNT = 100_000;

export type CraftedResourceRecipeClientDto = {
  code: string;
  output: { itemId: number; nameUk: string; iconUrl: string; quantity: number };
  ingredients: Array<{
    itemId: number;
    nameUk: string;
    iconUrl: string;
    quantity: number;
    have: number;
  }>;
  createItemLevel: number;
  mpCost: number;
  successChance: number;
  maxCraftable: number;
  lockedReason: string | null;
};

function normalizeRow(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function itemLabel(itemId: number): string {
  return CRAFTED_RESOURCE_BY_ITEM_ID.get(itemId)?.nameUk ?? `#${itemId}`;
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

export function parseCraftCount(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_CRAFT_COUNT) {
    throw new Error('craft_bad_count');
  }
  return n;
}

function safeMul(a: number, b: number): number | null {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) return null;
  const r = a * b;
  return Number.isSafeInteger(r) ? r : null;
}

function lockedReasonForRecipe(
  recipe: CraftedResourceRecipe,
  row: CharacterRow,
  inv: InventoryState,
  createItemLevel: number,
  currentMpVal: number,
): string | null {
  if (!isDwarfCrafterProfession(row.l2Profession)) {
    return `Крафт доступний тільки професіям ${crafterProfessionLabelUk()}.`;
  }
  if (createItemLevel < 1) {
    return 'Потрібен скіл Create Item.';
  }
  if (createItemLevel < recipe.createItemLevel) {
    return `Потрібен Create Item рівень ${recipe.createItemLevel}.`;
  }
  if (currentMpVal < recipe.mpCost) {
    return 'Недостатньо MP.';
  }
  for (const ing of recipe.ingredients) {
    if (countBagQty(inv, ing.itemId) < ing.quantity) {
      return `Недостатньо: ${itemLabel(ing.itemId)}.`;
    }
  }
  return null;
}

export function computeMaxCraftable(
  recipe: CraftedResourceRecipe,
  inv: InventoryState,
  createItemLevel: number,
  currentMpVal: number,
  canCraftProfession: boolean,
): number {
  if (!canCraftProfession || createItemLevel < recipe.createItemLevel) return 0;
  let max = MAX_CRAFT_COUNT;
  for (const ing of recipe.ingredients) {
    const have = countBagQty(inv, ing.itemId);
    max = Math.min(max, Math.floor(have / ing.quantity));
  }
  if (recipe.mpCost > 0) {
    max = Math.min(max, Math.floor(currentMpVal / recipe.mpCost));
  }
  return Math.max(0, max);
}

function ingredientName(itemId: number): string {
  const crafted = CRAFTED_RESOURCE_BY_ITEM_ID.get(itemId);
  if (crafted) return crafted.nameUk;
  return ITEM_CATALOG[itemId]?.nameUk ?? `#${itemId}`;
}

function ingredientIcon(itemId: number): string {
  const crafted = CRAFTED_RESOURCE_BY_ITEM_ID.get(itemId);
  if (crafted) return crafted.iconUrl;
  return `/game/item-icon/${itemId}`;
}

export async function buildCraftedResourceMaterialsBook(
  userId: string,
): Promise<{
  createItemLevel: number;
  currentMp: number;
  maxMp: number;
  canCraftProfession: boolean;
  recipes: CraftedResourceRecipeClientDto[];
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

  const recipes = [...CRAFTED_RESOURCE_RECIPE_BY_CODE.values()].map((recipe) => {
    const outRow = CRAFTED_RESOURCE_BY_ITEM_ID.get(recipe.outputItemId)!;
    return {
      code: recipe.code,
      output: {
        itemId: recipe.outputItemId,
        nameUk: outRow.nameUk,
        iconUrl: outRow.iconUrl,
        quantity: recipe.outputQuantity,
      },
      ingredients: recipe.ingredients.map((ing) => ({
        itemId: ing.itemId,
        nameUk: ingredientName(ing.itemId),
        iconUrl: ingredientIcon(ing.itemId),
        quantity: ing.quantity,
        have: countBagQty(inv, ing.itemId),
      })),
      createItemLevel: recipe.createItemLevel,
      mpCost: recipe.mpCost,
      successChance: recipe.successChance,
      maxCraftable: computeMaxCraftable(
        recipe,
        inv,
        createItemLevel,
        mpVal,
        canCraftProfession,
      ),
      lockedReason: lockedReasonForRecipe(
        recipe,
        base,
        inv,
        createItemLevel,
        mpVal,
      ),
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

export async function applyCraftedResourceCraft(
  userId: string,
  recipeCodeRaw: unknown,
  craftCountRaw: unknown,
  expectedRevision: number,
): Promise<CharacterSnapshot> {
  const recipeCode =
    typeof recipeCodeRaw === 'string' ? recipeCodeRaw.trim().toLowerCase() : '';
  const recipe = CRAFTED_RESOURCE_RECIPE_BY_CODE.get(recipeCode);
  if (!recipe) throw new Error('craft_unknown_recipe');
  const craftCount = parseCraftCount(craftCountRaw);
  const nowMs = Date.now();

  const totalMpCost = safeMul(recipe.mpCost, craftCount);
  if (totalMpCost == null) throw new Error('craft_overflow');
  const totalOutputQty = safeMul(recipe.outputQuantity, craftCount);
  if (totalOutputQty == null) throw new Error('craft_overflow');

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

        const createItemLevel = resolveCreateItemLevel(base);
        if (!isDwarfCrafterProfession(base.l2Profession)) {
          throw new Error('craft_bad_profession');
        }
        if (createItemLevel < 1) throw new Error('craft_no_create_item');
        if (createItemLevel < recipe.createItemLevel) {
          throw new Error('craft_level_too_low');
        }

        let inv = parseInventory(base.inventoryJson);
        const { maxMp, regenMp, worldTicked } = computeMpCaps(base, inv, nowMs);
        const mpVal = currentMp(base, maxMp, regenMp, nowMs);
        if (mpVal < totalMpCost) throw new Error('craft_no_mp');

        for (const ing of recipe.ingredients) {
          const need = safeMul(ing.quantity, craftCount);
          if (need == null) throw new Error('craft_overflow');
          if (countBagQty(inv, ing.itemId) < need) {
            throw new Error('craft_no_materials');
          }
        }

        for (const ing of recipe.ingredients) {
          const need = ing.quantity * craftCount;
          inv = removeBagQty(inv, ing.itemId, need);
        }
        inv = addItemToBag(inv, recipe.outputItemId, totalOutputQty);

        const mpAfter = mpVal - totalMpCost;
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
