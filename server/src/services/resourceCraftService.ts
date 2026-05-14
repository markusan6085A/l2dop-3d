/**
 * Крафт ресурсів: лише dwarf_scavenger / _artisan / _maestro (l2Profession у БД).
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
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { resolveL2ProfessionForSkillsRow } from '../data/l2dopHumanFighterBattleSkills.js';
import { RESOURCE_CRAFT_TIERS } from '../data/resourceCraftRecipes.js';
import {
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

const CRAFT_L2_PROFESSION = new Set([
  'dwarf_scavenger',
  'dwarf_artisan',
  'dwarf_maestro',
]);

export function characterCanResourceCraft(row: CharacterRow): boolean {
  const p = resolveL2ProfessionForSkillsRow(row);
  return CRAFT_L2_PROFESSION.has(p);
}

export function getResourceCraftBook(): {
  tiers: Array<{
    tier: number;
    unlockLevel: number;
    recipes: Array<{
      outputL2ItemId: number;
      ingredients: Array<{ l2ItemId: number; count: number }>;
    }>;
  }>;
} {
  return {
    tiers: RESOURCE_CRAFT_TIERS.map((t) => ({
      tier: t.tier,
      unlockLevel: t.unlockLevel,
      recipes: t.recipes.map((r) => ({
        outputL2ItemId: r.outputL2ItemId,
        ingredients: r.ingredients.map((i) => ({
          l2ItemId: i.l2ItemId,
          count: i.count,
        })),
      })),
    })),
  };
}

function applyRecipeQty(
  inv: InventoryState,
  recipe: (typeof RESOURCE_CRAFT_TIERS)[number]['recipes'][number],
  quantity: number
): InventoryState {
  let next = {
    ...inv,
    stacks: inv.stacks.map((s) => ({ ...s })),
    eq: { ...inv.eq },
  };
  for (const ing of recipe.ingredients) {
    const need = ing.count * quantity;
    if (countBagQty(next, ing.l2ItemId) < need) {
      throw new Error('insufficient_materials');
    }
    next = removeBagQty(next, ing.l2ItemId, need);
  }
  return addItemToBag(next, recipe.outputL2ItemId, quantity);
}

export async function performResourceCraft(
  userId: string,
  expectedRevision: number,
  tier: number,
  recipeIndex: number,
  quantity: number
): Promise<CharacterSnapshot> {
  const tierDef = RESOURCE_CRAFT_TIERS.find((t) => t.tier === tier);
  if (!tierDef || recipeIndex < 0 || recipeIndex >= tierDef.recipes.length) {
    throw new Error('invalid_recipe');
  }
  const recipe = tierDef.recipes[recipeIndex]!;
  const q = Math.max(1, Math.min(1000, Math.floor(quantity)));
  if (!Number.isFinite(q) || q < 1) {
    throw new Error('invalid_quantity');
  }

  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw new GameConflictError();
    }
    if (!characterCanResourceCraft(char)) {
      throw new Error('craft_profession_required');
    }
    const lv = levelFromTotalExp(BigInt(char.exp));
    if (lv < tierDef.unlockLevel) {
      throw new Error('level_too_low');
    }
    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        let inv = parseInventory((current as CharacterRow).inventoryJson);
        try {
          inv = applyRecipeQty(inv, recipe, q);
        } catch (e) {
          if (e instanceof Error && e.message === 'insufficient_materials') {
            throw new Error('insufficient_materials');
          }
          throw e;
        }
        return {
          changed: true,
          data: {
            inventoryJson: inv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}
