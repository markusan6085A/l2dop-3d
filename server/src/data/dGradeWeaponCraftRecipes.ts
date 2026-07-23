/**
 * D-grade weapon craft recipes (етап 3B) — канонічні рецепти крафту зброї.
 */
import {
  CRYSTAL_D_ITEM_ID,
  GEMSTONE_D_ITEM_ID,
} from './gradeCraftMaterialsCatalog.js';

export interface DGradeWeaponCraftIngredient {
  itemId: number;
  quantity: number;
}

export interface DGradeWeaponCraftRecipe {
  recipeCode: string;
  recipeItemId: number;
  outputItemId: number;
  outputCount: 1;
  successRate: 100;
  requiredCreateItemLevel: 4;
  mpCost: 129;
  ingredients: readonly DGradeWeaponCraftIngredient[];
}

function recipe(
  recipeCode: string,
  recipeItemId: number,
  outputItemId: number,
  ingredients: DGradeWeaponCraftIngredient[],
): DGradeWeaponCraftRecipe {
  return {
    recipeCode,
    recipeItemId,
    outputItemId,
    outputCount: 1,
    successRate: 100,
    requiredCreateItemLevel: 4,
    mpCost: 129,
    ingredients,
  };
}

const CRYSTAL = CRYSTAL_D_ITEM_ID;
const GEM = GEMSTONE_D_ITEM_ID;

export const D_GRADE_WEAPON_CRAFT_RECIPES: readonly DGradeWeaponCraftRecipe[] = [
  recipe('bonebreaker_100', 921001, 159, [
    { itemId: 4113, quantity: 8 },
    { itemId: 1880, quantity: 160 },
    { itemId: 1879, quantity: 160 },
    { itemId: 1885, quantity: 80 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
  recipe('glaive_100', 921004, 297, [
    { itemId: 4117, quantity: 8 },
    { itemId: 1880, quantity: 220 },
    { itemId: 1879, quantity: 110 },
    { itemId: 1885, quantity: 55 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
  recipe('elven_long_sword_100', 921003, 2499, [
    { itemId: 4116, quantity: 8 },
    { itemId: 1880, quantity: 220 },
    { itemId: 1879, quantity: 220 },
    { itemId: 1883, quantity: 2 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
  recipe('claymore_100', 921002, 70, [
    { itemId: 4114, quantity: 8 },
    { itemId: 1880, quantity: 270 },
    { itemId: 1879, quantity: 135 },
    { itemId: 1883, quantity: 3 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
  recipe('mithril_dagger_100', 921006, 225, [
    { itemId: 4119, quantity: 8 },
    { itemId: 1880, quantity: 220 },
    { itemId: 1879, quantity: 220 },
    { itemId: 1883, quantity: 2 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
  recipe('light_crossbow_100', 921005, 280, [
    { itemId: 4118, quantity: 8 },
    { itemId: 1880, quantity: 275 },
    { itemId: 1885, quantity: 55 },
    { itemId: 1878, quantity: 55 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
  recipe('scallop_jamadhr_100', 921007, 262, [
    { itemId: 4120, quantity: 8 },
    { itemId: 1880, quantity: 160 },
    { itemId: 1879, quantity: 160 },
    { itemId: 1885, quantity: 80 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
  recipe('staff_of_life_100', 921008, 189, [
    { itemId: 4121, quantity: 8 },
    { itemId: 1880, quantity: 130 },
    { itemId: 1881, quantity: 260 },
    { itemId: 1878, quantity: 130 },
    { itemId: CRYSTAL, quantity: 550 },
    { itemId: GEM, quantity: 185 },
  ]),
] as const;

export const D_GRADE_WEAPON_CRAFT_RECIPE_CODES: readonly string[] =
  D_GRADE_WEAPON_CRAFT_RECIPES.map((row) => row.recipeCode);

export const D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE = new Map<
  string,
  DGradeWeaponCraftRecipe
>(D_GRADE_WEAPON_CRAFT_RECIPES.map((row) => [row.recipeCode, row]));

export function isKnownDGradeWeaponRecipeCode(code: string): boolean {
  return D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE.has(
    String(code ?? '').trim().toLowerCase(),
  );
}
