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
    { itemId: 1880, quantity: 12 },
    { itemId: 1879, quantity: 12 },
    { itemId: 1885, quantity: 6 },
    { itemId: CRYSTAL, quantity: 135 },
    { itemId: GEM, quantity: 31 },
  ]),
  recipe('glaive_100', 921004, 297, [
    { itemId: 4117, quantity: 8 },
    { itemId: 1880, quantity: 12 },
    { itemId: 1879, quantity: 7 },
    { itemId: 1885, quantity: 4 },
    { itemId: CRYSTAL, quantity: 115 },
    { itemId: GEM, quantity: 30 },
  ]),
  recipe('elven_long_sword_100', 921003, 2499, [
    { itemId: 4116, quantity: 8 },
    { itemId: 1880, quantity: 10 },
    { itemId: 1879, quantity: 10 },
    { itemId: 1883, quantity: 1 },
    { itemId: CRYSTAL, quantity: 90 },
    { itemId: GEM, quantity: 22 },
  ]),
  recipe('claymore_100', 921002, 70, [
    { itemId: 4114, quantity: 8 },
    { itemId: 1880, quantity: 13 },
    { itemId: 1879, quantity: 8 },
    { itemId: 1883, quantity: 1 },
    { itemId: CRYSTAL, quantity: 115 },
    { itemId: GEM, quantity: 28 },
  ]),
  recipe('mithril_dagger_100', 921006, 225, [
    { itemId: 4119, quantity: 8 },
    { itemId: 1880, quantity: 8 },
    { itemId: 1879, quantity: 8 },
    { itemId: 1883, quantity: 1 },
    { itemId: CRYSTAL, quantity: 85 },
    { itemId: GEM, quantity: 26 },
  ]),
  recipe('light_crossbow_100', 921005, 280, [
    { itemId: 4118, quantity: 8 },
    { itemId: 1880, quantity: 18 },
    { itemId: 1885, quantity: 4 },
    { itemId: 1878, quantity: 4 },
    { itemId: CRYSTAL, quantity: 185 },
    { itemId: GEM, quantity: 45 },
  ]),
  recipe('scallop_jamadhr_100', 921007, 262, [
    { itemId: 4120, quantity: 8 },
    { itemId: 1880, quantity: 10 },
    { itemId: 1879, quantity: 10 },
    { itemId: 1885, quantity: 6 },
    { itemId: CRYSTAL, quantity: 105 },
    { itemId: GEM, quantity: 28 },
  ]),
  recipe('staff_of_life_100', 921008, 189, [
    { itemId: 4121, quantity: 8 },
    { itemId: 1880, quantity: 10 },
    { itemId: 1881, quantity: 14 },
    { itemId: 1878, quantity: 8 },
    { itemId: CRYSTAL, quantity: 145 },
    { itemId: GEM, quantity: 32 },
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
