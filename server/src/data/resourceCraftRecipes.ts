/**
 * Крафт ресурсів (як у text-rpg `resourceCraftLevel*`), у numeric L2 item_id для сумки l2dop-3d.
 * Проміжні результати з «іменними» іконками — id 1883–1899 (не перетинаються з базовими 1864–1882, 1884–1885, 1889).
 */

export type ResourceCraftIngredientRow = { l2ItemId: number; count: number };

export type ResourceCraftRecipeRow = {
  outputL2ItemId: number;
  ingredients: ResourceCraftIngredientRow[];
};

export type ResourceCraftTierDef = {
  tier: number;
  unlockLevel: number;
  recipes: readonly ResourceCraftRecipeRow[];
};

/** Узгоджено з text-rpg ResourceCraftScreen. */
export const RESOURCE_CRAFT_TIERS: readonly ResourceCraftTierDef[] = [
  {
    tier: 1,
    unlockLevel: 20,
    recipes: [
      { outputL2ItemId: 1882, ingredients: [{ l2ItemId: 1867, count: 6 }] },
      { outputL2ItemId: 1881, ingredients: [{ l2ItemId: 1872, count: 1 }] },
      {
        outputL2ItemId: 1879,
        ingredients: [
          { l2ItemId: 1871, count: 3 },
          { l2ItemId: 1870, count: 3 },
        ],
      },
      {
        outputL2ItemId: 1880,
        ingredients: [
          { l2ItemId: 1865, count: 5 },
          { l2ItemId: 1869, count: 5 },
        ],
      },
      { outputL2ItemId: 1878, ingredients: [{ l2ItemId: 1864, count: 5 }] },
    ],
  },
  {
    tier: 2,
    unlockLevel: 40,
    recipes: [
      {
        outputL2ItemId: 1883,
        ingredients: [
          { l2ItemId: 1881, count: 3 },
          { l2ItemId: 1865, count: 3 },
          { l2ItemId: 1875, count: 1 },
        ],
      },
      {
        outputL2ItemId: 1886,
        ingredients: [
          { l2ItemId: 1879, count: 3 },
          { l2ItemId: 1874, count: 1 },
        ],
      },
      {
        outputL2ItemId: 1884,
        ingredients: [
          { l2ItemId: 1880, count: 2 },
          { l2ItemId: 1868, count: 25 },
        ],
      },
      {
        outputL2ItemId: 1887,
        ingredients: [
          { l2ItemId: 1878, count: 5 },
          { l2ItemId: 1879, count: 5 },
          { l2ItemId: 1873, count: 10 },
        ],
      },
      {
        outputL2ItemId: 1889,
        ingredients: [
          { l2ItemId: 1878, count: 5 },
          { l2ItemId: 1868, count: 5 },
        ],
      },
      {
        outputL2ItemId: 1885,
        ingredients: [
          { l2ItemId: 1881, count: 1 },
          { l2ItemId: 1866, count: 3 },
        ],
      },
      {
        outputL2ItemId: 1888,
        ingredients: [
          { l2ItemId: 1878, count: 5 },
          { l2ItemId: 1869, count: 5 },
          { l2ItemId: 1870, count: 5 },
        ],
      },
    ],
  },
  {
    tier: 3,
    unlockLevel: 50,
    recipes: [
      {
        outputL2ItemId: 1890,
        ingredients: [
          { l2ItemId: 1883, count: 1 },
          { l2ItemId: 1880, count: 2 },
          { l2ItemId: 1876, count: 1 },
        ],
      },
      {
        outputL2ItemId: 1894,
        ingredients: [
          { l2ItemId: 1884, count: 4 },
          { l2ItemId: 1882, count: 4 },
          { l2ItemId: 1870, count: 4 },
        ],
      },
      {
        outputL2ItemId: 1891,
        ingredients: [
          { l2ItemId: 1887, count: 1 },
          { l2ItemId: 1883, count: 5 },
          { l2ItemId: 1876, count: 10 },
        ],
      },
      {
        outputL2ItemId: 1892,
        ingredients: [
          { l2ItemId: 1888, count: 1 },
          { l2ItemId: 1883, count: 5 },
          { l2ItemId: 1877, count: 10 },
        ],
      },
      {
        outputL2ItemId: 1893,
        ingredients: [
          { l2ItemId: 1886, count: 1 },
          { l2ItemId: 1873, count: 12 },
          { l2ItemId: 1874, count: 4 },
        ],
      },
      {
        outputL2ItemId: 5220,
        ingredients: [
          { l2ItemId: 1864, count: 10 },
          { l2ItemId: 1865, count: 10 },
          { l2ItemId: 1869, count: 10 },
        ],
      },
      {
        outputL2ItemId: 1895,
        ingredients: [
          { l2ItemId: 1884, count: 20 },
          { l2ItemId: 1873, count: 15 },
        ],
      },
      {
        outputL2ItemId: 5550,
        ingredients: [
          { l2ItemId: 5549, count: 5 },
          { l2ItemId: 1876, count: 5 },
        ],
      },
      {
        outputL2ItemId: 5549,
        ingredients: [
          { l2ItemId: 1868, count: 10 },
          { l2ItemId: 1869, count: 5 },
        ],
      },
    ],
  },
  {
    tier: 4,
    unlockLevel: 60,
    recipes: [
      {
        outputL2ItemId: 1896,
        ingredients: [
          { l2ItemId: 1891, count: 1 },
          { l2ItemId: 4039, count: 10 },
          { l2ItemId: 4043, count: 5 },
        ],
      },
      {
        outputL2ItemId: 1897,
        ingredients: [
          { l2ItemId: 1892, count: 2 },
          { l2ItemId: 4041, count: 20 },
          { l2ItemId: 4042, count: 5 },
        ],
      },
      {
        outputL2ItemId: 1898,
        ingredients: [
          { l2ItemId: 1883, count: 10 },
          { l2ItemId: 4040, count: 10 },
          { l2ItemId: 4041, count: 10 },
        ],
      },
      {
        outputL2ItemId: 1899,
        ingredients: [
          { l2ItemId: 1886, count: 4 },
          { l2ItemId: 4039, count: 4 },
          { l2ItemId: 4040, count: 4 },
        ],
      },
    ],
  },
] as const;
