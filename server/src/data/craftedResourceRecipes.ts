/**
 * Рецепти crafted-ресурсів (без предметів-рецептів; доступ за Create Item level).
 */
import { CRAFTED_RESOURCE_BY_CODE } from './craftedResourceCatalog.js';

export interface ResourceCraftIngredient {
  itemId: number;
  quantity: number;
}

export interface CraftedResourceRecipe {
  code: string;
  outputItemId: number;
  outputQuantity: number;
  createItemLevel: 1 | 2 | 4;
  mpCost: number;
  successChance: 100;
  ingredients: readonly ResourceCraftIngredient[];
}

function out(code: string): number {
  return CRAFTED_RESOURCE_BY_CODE.get(code)!.itemId;
}

export const CRAFTED_RESOURCE_RECIPES: readonly CraftedResourceRecipe[] = [
  {
    code: 'braided_hemp',
    outputItemId: out('braided_hemp'),
    outputQuantity: 1,
    createItemLevel: 1,
    mpCost: 10,
    successChance: 100,
    ingredients: [{ itemId: 1864, quantity: 5 }],
  },
  {
    code: 'cokes',
    outputItemId: out('cokes'),
    outputQuantity: 1,
    createItemLevel: 1,
    mpCost: 10,
    successChance: 100,
    ingredients: [
      { itemId: 1871, quantity: 3 },
      { itemId: 1870, quantity: 3 },
    ],
  },
  {
    code: 'steel',
    outputItemId: out('steel'),
    outputQuantity: 1,
    createItemLevel: 1,
    mpCost: 10,
    successChance: 100,
    ingredients: [
      { itemId: 1869, quantity: 5 },
      { itemId: 1865, quantity: 5 },
    ],
  },
  {
    code: 'coarse_bone_powder',
    outputItemId: out('coarse_bone_powder'),
    outputQuantity: 1,
    createItemLevel: 1,
    mpCost: 10,
    successChance: 100,
    ingredients: [{ itemId: 1872, quantity: 10 }],
  },
  {
    code: 'leather',
    outputItemId: out('leather'),
    outputQuantity: 1,
    createItemLevel: 1,
    mpCost: 10,
    successChance: 100,
    ingredients: [{ itemId: 1867, quantity: 6 }],
  },
  {
    code: 'steel_mold',
    outputItemId: out('steel_mold'),
    outputQuantity: 1,
    createItemLevel: 2,
    mpCost: 20,
    successChance: 100,
    ingredients: [
      { itemId: out('braided_hemp'), quantity: 5 },
      { itemId: 1870, quantity: 5 },
      { itemId: 1869, quantity: 5 },
    ],
  },
  {
    code: 'cord',
    outputItemId: out('cord'),
    outputQuantity: 20,
    createItemLevel: 2,
    mpCost: 20,
    successChance: 100,
    ingredients: [
      { itemId: out('steel'), quantity: 2 },
      { itemId: 1868, quantity: 25 },
    ],
  },
  {
    code: 'high_grade_suede',
    outputItemId: out('high_grade_suede'),
    outputQuantity: 1,
    createItemLevel: 2,
    mpCost: 20,
    successChance: 100,
    ingredients: [
      { itemId: out('coarse_bone_powder'), quantity: 1 },
      { itemId: 1866, quantity: 3 },
    ],
  },
  {
    code: 'silver_mold',
    outputItemId: out('silver_mold'),
    outputQuantity: 1,
    createItemLevel: 2,
    mpCost: 20,
    successChance: 100,
    ingredients: [
      { itemId: out('braided_hemp'), quantity: 5 },
      { itemId: out('cokes'), quantity: 5 },
      { itemId: 1873, quantity: 10 },
    ],
  },
  {
    code: 'varnish_of_purity',
    outputItemId: out('varnish_of_purity'),
    outputQuantity: 1,
    createItemLevel: 2,
    mpCost: 20,
    successChance: 100,
    ingredients: [
      { itemId: 1875, quantity: 1 },
      { itemId: out('coarse_bone_powder'), quantity: 3 },
      { itemId: 1865, quantity: 3 },
    ],
  },
  {
    code: 'synthetic_cokes',
    outputItemId: out('synthetic_cokes'),
    outputQuantity: 1,
    createItemLevel: 2,
    mpCost: 20,
    successChance: 100,
    ingredients: [
      { itemId: 1874, quantity: 1 },
      { itemId: out('cokes'), quantity: 3 },
    ],
  },
  {
    code: 'compound_braid',
    outputItemId: out('compound_braid'),
    outputQuantity: 1,
    createItemLevel: 2,
    mpCost: 20,
    successChance: 100,
    ingredients: [
      { itemId: out('braided_hemp'), quantity: 5 },
      { itemId: 1868, quantity: 5 },
    ],
  },
  {
    code: 'mithril_alloy',
    outputItemId: out('mithril_alloy'),
    outputQuantity: 1,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: 1876, quantity: 1 },
      { itemId: out('varnish_of_purity'), quantity: 1 },
      { itemId: out('steel'), quantity: 2 },
    ],
  },
  {
    code: 'artisan_frame',
    outputItemId: out('artisan_frame'),
    outputQuantity: 1,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: out('steel_mold'), quantity: 1 },
      { itemId: out('varnish_of_purity'), quantity: 5 },
      { itemId: 1877, quantity: 10 },
    ],
  },
  {
    code: 'blacksmith_frame',
    outputItemId: out('blacksmith_frame'),
    outputQuantity: 1,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: out('silver_mold'), quantity: 1 },
      { itemId: out('varnish_of_purity'), quantity: 5 },
      { itemId: 1876, quantity: 10 },
    ],
  },
  {
    code: 'oriharukon',
    outputItemId: out('oriharukon'),
    outputQuantity: 1,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: out('synthetic_cokes'), quantity: 1 },
      { itemId: 1874, quantity: 4 },
      { itemId: 1873, quantity: 12 },
    ],
  },
  {
    code: 'crafted_leather',
    outputItemId: out('crafted_leather'),
    outputQuantity: 1,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: 1870, quantity: 4 },
      { itemId: out('cord'), quantity: 4 },
      { itemId: out('leather'), quantity: 4 },
    ],
  },
  {
    code: 'metallic_fiber',
    outputItemId: out('metallic_fiber'),
    outputQuantity: 20,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: 1873, quantity: 15 },
      { itemId: out('cord'), quantity: 20 },
    ],
  },
  {
    code: 'metallic_thread',
    outputItemId: out('metallic_thread'),
    outputQuantity: 1,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: 1869, quantity: 5 },
      { itemId: 1868, quantity: 10 },
    ],
  },
  {
    code: 'durable_metal_plate',
    outputItemId: out('durable_metal_plate'),
    outputQuantity: 1,
    createItemLevel: 4,
    mpCost: 40,
    successChance: 100,
    ingredients: [
      { itemId: out('metallic_thread'), quantity: 5 },
      { itemId: 1876, quantity: 5 },
    ],
  },
] as const;

export const CRAFTED_RESOURCE_RECIPE_BY_CODE = new Map<string, CraftedResourceRecipe>(
  CRAFTED_RESOURCE_RECIPES.map((row) => [row.code, row]),
);
