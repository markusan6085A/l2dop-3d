/**
 * D-grade weapon recipe scroll items (етап 3B).
 */

export interface DGradeWeaponRecipeItemEntry {
  itemId: number;
  code: string;
  nameEn: string;
  nameUk: string;
  iconPath: string;
  targetRecipeCode: string;
  category: 'recipe';
  recipeType: 'dwarven_weapon';
  grade: 'D';
  successRate: 100;
  requiredCreateItemLevel: 4;
  stackable: true;
  tradable: true;
  droppable: true;
  sellable: true;
  equipable: false;
  useAction: 'learn_recipe';
  inventoryTab: 'recipe';
}

const RECIPE_ICON = '/icons/recipes/d_grade/recipe_weapon_d.jpg';

export const D_GRADE_WEAPON_RECIPE_ITEM_CATALOG: readonly DGradeWeaponRecipeItemEntry[] = [
  {
    itemId: 921001,
    code: 'recipe_bonebreaker_100',
    nameEn: 'Recipe: Bonebreaker (100%)',
    nameUk: 'Рецепт: Костолом (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'bonebreaker_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
  {
    itemId: 921002,
    code: 'recipe_claymore_100',
    nameEn: 'Recipe: Claymore (100%)',
    nameUk: 'Рецепт: Клеймор (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'claymore_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
  {
    itemId: 921003,
    code: 'recipe_elven_long_sword_100',
    nameEn: 'Recipe: Elven Long Sword (100%)',
    nameUk: 'Рецепт: Довгий меч ельфів (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'elven_long_sword_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
  {
    itemId: 921004,
    code: 'recipe_glaive_100',
    nameEn: 'Recipe: Glaive (100%)',
    nameUk: 'Рецепт: Глефа (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'glaive_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
  {
    itemId: 921005,
    code: 'recipe_light_crossbow_100',
    nameEn: 'Recipe: Light Crossbow (100%)',
    nameUk: 'Рецепт: Легкий арбалет (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'light_crossbow_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
  {
    itemId: 921006,
    code: 'recipe_mithril_dagger_100',
    nameEn: 'Recipe: Mithril Dagger (100%)',
    nameUk: 'Рецепт: Міфриловий кинджал (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'mithril_dagger_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
  {
    itemId: 921007,
    code: 'recipe_scallop_jamadhr_100',
    nameEn: 'Recipe: Scallop Jamadhr (100%)',
    nameUk: 'Рецепт: Scallop Jamadhr (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'scallop_jamadhr_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
  {
    itemId: 921008,
    code: 'recipe_staff_of_life_100',
    nameEn: 'Recipe: Staff of Life (100%)',
    nameUk: 'Рецепт: Посох життя (100%)',
    iconPath: RECIPE_ICON,
    targetRecipeCode: 'staff_of_life_100',
    category: 'recipe',
    recipeType: 'dwarven_weapon',
    grade: 'D',
    successRate: 100,
    requiredCreateItemLevel: 4,
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    useAction: 'learn_recipe',
    inventoryTab: 'recipe',
  },
] as const;

export const D_GRADE_WEAPON_RECIPE_ITEM_IDS: readonly number[] =
  D_GRADE_WEAPON_RECIPE_ITEM_CATALOG.map((row) => row.itemId);

export const D_GRADE_WEAPON_RECIPE_ITEM_BY_ID = new Map<
  number,
  DGradeWeaponRecipeItemEntry
>(D_GRADE_WEAPON_RECIPE_ITEM_CATALOG.map((row) => [row.itemId, row]));

export const D_GRADE_WEAPON_RECIPE_ITEM_BY_CODE = new Map<
  string,
  DGradeWeaponRecipeItemEntry
>(D_GRADE_WEAPON_RECIPE_ITEM_CATALOG.map((row) => [row.code, row]));

export function isDGradeWeaponRecipeItemId(itemId: number): boolean {
  return D_GRADE_WEAPON_RECIPE_ITEM_BY_ID.has(Math.floor(Number(itemId) || 0));
}

export function recipeItemByTargetCode(
  targetRecipeCode: string,
): DGradeWeaponRecipeItemEntry | undefined {
  const code = String(targetRecipeCode ?? '').trim().toLowerCase();
  for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    if (row.targetRecipeCode === code) return row;
  }
  return undefined;
}
