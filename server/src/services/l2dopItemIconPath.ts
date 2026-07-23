import fs from 'node:fs';
import path from 'node:path';
import { sealStoneIconUrlForItemId } from '../data/sevenSignsSealStoneItems.js';
import { BASIC_RESOURCE_BY_ITEM_ID } from '../data/basicResourceCatalog.js';
import { CRAFTED_RESOURCE_BY_ITEM_ID } from '../data/craftedResourceCatalog.js';
import { D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID } from '../data/dGradeWeaponKeyMaterialsCatalog.js';
import { D_GRADE_WEAPON_RECIPE_ITEM_BY_ID } from '../data/dGradeWeaponRecipeItemsCatalog.js';
import { GRADE_CRAFT_MATERIAL_BY_ITEM_ID } from '../data/gradeCraftMaterialsCatalog.js';
import { enchantScrollByItemId } from '../data/enchantScrollCatalog.js';
import {
  COIN_OF_LUCK_ICON_URL,
  COIN_OF_LUCK_ITEM_ID,
} from '../domain/dailyQuestRewards.js';

function publicDirCandidates(relParts: string[]): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, 'public', ...relParts),
    path.join(cwd, 'server', 'public', ...relParts),
  ];
}

function firstExistingPath(candidates: string[]): string | null {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function publicFileFromUrl(iconUrl: string): string | null {
  const raw = String(iconUrl || '').trim();
  if (!raw.startsWith('/')) return null;
  const rel = raw.slice(1).split('/').filter(Boolean);
  if (rel.length === 0) return null;
  return firstExistingPath(publicDirCandidates(rel));
}

/**
 * Реальні іконки предметів (jpg/png/webp у статичній папці або l2dop legacy).
 */
export function resolveL2dopItemIconFilePath(itemId: number): string | null {
  if (!Number.isFinite(itemId) || itemId < 1 || itemId > 9_999_999) {
    return null;
  }

  const basicResource = BASIC_RESOURCE_BY_ITEM_ID.get(itemId);
  if (basicResource) {
    const fromCatalog = publicFileFromUrl(basicResource.iconUrl);
    if (fromCatalog) return fromCatalog;
  }

  const craftMaterial = GRADE_CRAFT_MATERIAL_BY_ITEM_ID.get(itemId);
  if (craftMaterial) {
    const fromCatalog = publicFileFromUrl(craftMaterial.iconUrl);
    if (fromCatalog) return fromCatalog;
  }

  const craftedResource = CRAFTED_RESOURCE_BY_ITEM_ID.get(itemId);
  if (craftedResource) {
    const fromCatalog = publicFileFromUrl(craftedResource.iconUrl);
    if (fromCatalog) return fromCatalog;
  }

  const keyMaterial = D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(itemId);
  if (keyMaterial) {
    const fromCatalog = publicFileFromUrl(keyMaterial.iconPath);
    if (fromCatalog) return fromCatalog;
  }

  const recipeItem = D_GRADE_WEAPON_RECIPE_ITEM_BY_ID.get(itemId);
  if (recipeItem) {
    const fromCatalog = publicFileFromUrl(recipeItem.iconPath);
    if (fromCatalog) return fromCatalog;
  }

  const enchantScroll = enchantScrollByItemId(itemId);
  if (enchantScroll) {
    const fromCatalog = publicFileFromUrl(enchantScroll.iconUrl);
    if (fromCatalog) return fromCatalog;
  }

  const sealStoneUrl = sealStoneIconUrlForItemId(itemId);
  if (sealStoneUrl) {
    const fromCatalog = publicFileFromUrl(sealStoneUrl);
    if (fromCatalog) return fromCatalog;
  }

  const file = `${itemId}.jpg`;
  const baseEnv = process.env.L2DOP_ITEM_ICONS_DIR;
  if (baseEnv) {
    const p = path.join(baseEnv, file);
    if (fs.existsSync(p)) return p;
  }

  const byItemId = firstExistingPath(
    publicDirCandidates(['icons', 'drops', 'resours', 'l2dop-by-itemid', file]),
  );
  if (byItemId) return byItemId;

  const cwd = process.cwd();
  const legacyCandidates = [
    path.join(cwd, '..', 'l2dop', 'img', 'items', file),
    path.join(cwd, '..', '..', 'l2dop', 'img', 'items', file),
    path.join(cwd, 'l2dop', 'img', 'items', file),
  ];
  const legacy = firstExistingPath(legacyCandidates);
  if (legacy) return legacy;

  if (itemId === 57) {
    return firstExistingPath(
      publicDirCandidates(['assets', 'l2dop', 'etc_adena_i00.png']),
    );
  }
  if (itemId === COIN_OF_LUCK_ITEM_ID) {
    return firstExistingPath(
      publicDirCandidates(['assets', 'l2dop', '4037.jpg']),
    );
  }
  return null;
}

/** @deprecated Використовуй resolveL2dopItemIconFilePath — підтримує png/jpg/webp. */
export function resolveL2dopItemIconJpgPath(itemId: number): string | null {
  return resolveL2dopItemIconFilePath(itemId);
}

/** URL для `<img src>`: прямий шлях до статики, інакше проксі `/game/item-icon/`. */
export function resolveItemIconPublicUrl(itemId: number): string {
  if (!Number.isFinite(itemId) || itemId < 1) {
    return '/icons/drops/other.svg';
  }
  if (itemId === 57) {
    const adena = firstExistingPath(
      publicDirCandidates(['assets', 'l2dop', 'etc_adena_i00.png']),
    );
    if (adena) return '/assets/l2dop/etc_adena_i00.png';
  }
  if (itemId === COIN_OF_LUCK_ITEM_ID) {
    return COIN_OF_LUCK_ICON_URL;
  }
  const sealStoneUrl = sealStoneIconUrlForItemId(itemId);
  if (sealStoneUrl) return sealStoneUrl;
  const basicResource = BASIC_RESOURCE_BY_ITEM_ID.get(itemId);
  if (basicResource) return basicResource.iconUrl;
  const craftMaterial = GRADE_CRAFT_MATERIAL_BY_ITEM_ID.get(itemId);
  if (craftMaterial) return craftMaterial.iconUrl;
  const craftedResource = CRAFTED_RESOURCE_BY_ITEM_ID.get(itemId);
  if (craftedResource) return craftedResource.iconUrl;
  const keyMaterial = D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(itemId);
  if (keyMaterial) return keyMaterial.iconPath;
  const recipeItem = D_GRADE_WEAPON_RECIPE_ITEM_BY_ID.get(itemId);
  if (recipeItem) return recipeItem.iconPath;
  const enchantScroll = enchantScrollByItemId(itemId);
  if (enchantScroll) return enchantScroll.iconUrl;
  const file = `${itemId}.jpg`;
  const byItemId = firstExistingPath(
    publicDirCandidates(['icons', 'drops', 'resours', 'l2dop-by-itemid', file]),
  );
  if (byItemId) {
    return `/icons/drops/resours/l2dop-by-itemid/${file}`;
  }
  return `/game/item-icon/${itemId}`;
}
