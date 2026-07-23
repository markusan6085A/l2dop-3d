/**
 * Книга рецептів персонажа (recipeBookJson).
 */
import { isKnownDGradeWeaponRecipeCode } from '../data/dGradeWeaponCraftRecipes.js';

export const RECIPE_BOOK_VERSION = 1;

export type RecipeBookJson = {
  v: number;
  learned: string[];
};

export function emptyRecipeBook(): RecipeBookJson {
  return { v: RECIPE_BOOK_VERSION, learned: [] };
}

/** Нормалізація: v=1, унікальні known recipeCode, без malformed. */
export function normalizeRecipeBookJson(raw: unknown): RecipeBookJson {
  if (raw == null) return emptyRecipeBook();
  if (typeof raw !== 'object' || Array.isArray(raw)) return emptyRecipeBook();
  const o = raw as Record<string, unknown>;
  const learnedRaw = o.learned;
  if (!Array.isArray(learnedRaw)) return emptyRecipeBook();

  const seen = new Set<string>();
  const learned: string[] = [];
  for (const entry of learnedRaw) {
    if (typeof entry !== 'string') continue;
    const code = entry.trim().toLowerCase();
    if (!code || seen.has(code)) continue;
    if (!isKnownDGradeWeaponRecipeCode(code)) continue;
    seen.add(code);
    learned.push(code);
  }
  return { v: RECIPE_BOOK_VERSION, learned };
}

export function isRecipeLearned(book: RecipeBookJson, recipeCode: string): boolean {
  const code = String(recipeCode ?? '').trim().toLowerCase();
  return book.learned.includes(code);
}

export function addLearnedRecipe(
  book: RecipeBookJson,
  recipeCode: string,
): RecipeBookJson {
  const code = String(recipeCode ?? '').trim().toLowerCase();
  if (!isKnownDGradeWeaponRecipeCode(code)) return book;
  if (book.learned.includes(code)) return book;
  return {
    v: RECIPE_BOOK_VERSION,
    learned: [...book.learned, code],
  };
}
