/**
 * Overlay drop/spoil для D-grade weapon recipe scrolls на field mobs.
 */
import type { DropEntry } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import {
  D_GRADE_WEAPON_RECIPE_ITEM_BY_ID,
  D_GRADE_WEAPON_RECIPE_ITEM_IDS,
} from './dGradeWeaponRecipeItemsCatalog.js';
import {
  D_GRADE_WEAPON_RECIPE_MOB_SOURCES,
  type DGradeWeaponRecipeDropChannel,
  type DGradeWeaponRecipeMobSource,
} from './dGradeWeaponRecipeMobDropCatalog.js';
import { L2DOP_NPC_LEVEL } from './l2dopNpcMeta.generated.js';

/** Перетворення Interlude percent → engine probability (0–1). */
export function interludePercentToDropChance(percent: number): number {
  return percent / 100;
}

/** Приклад: 0.04997% → 0.0004997 */
export function formatChanceConversionExample(percent: number): {
  percent: number;
  probability: number;
} {
  return { percent, probability: interludePercentToDropChance(percent) };
}

function sourceKey(source: DGradeWeaponRecipeMobSource): string {
  return `${source.npcId}:${source.itemId}:${source.channel}`;
}

function recipeDropEntry(source: DGradeWeaponRecipeMobSource): DropEntry {
  const recipe = D_GRADE_WEAPON_RECIPE_ITEM_BY_ID.get(source.itemId);
  if (!recipe) {
    throw new Error(`missing recipe item ${source.itemId}`);
  }
  return {
    id: `d_wpn_recipe_${source.channel}_${source.npcId}_${source.itemId}`,
    kind: 'other',
    chance: interludePercentToDropChance(source.chancePercent),
    min: 1,
    max: 1,
    l2ItemId: source.itemId,
    displayName: recipe.nameUk,
    iconUrl: recipe.iconPath,
  };
}

function validateCatalogAtLoad(): void {
  const seen = new Set<string>();
  for (const source of D_GRADE_WEAPON_RECIPE_MOB_SOURCES) {
    const key = sourceKey(source);
    if (seen.has(key)) {
      throw new Error(`duplicate d-grade recipe mob source: ${key}`);
    }
    seen.add(key);
    if (!D_GRADE_WEAPON_RECIPE_ITEM_BY_ID.has(source.itemId)) {
      throw new Error(`unknown recipe itemId ${source.itemId} in mob drop catalog`);
    }
    if (!D_GRADE_WEAPON_RECIPE_ITEM_IDS.includes(source.itemId)) {
      throw new Error(`itemId ${source.itemId} not in recipe allowlist`);
    }
    if (L2DOP_NPC_LEVEL[source.npcId] == null) {
      throw new Error(`npcId ${source.npcId} missing from l2dopNpcMeta`);
    }
  }
}

validateCatalogAtLoad();

const OVERLAY_BY_NPC_ID = new Map<number, NpcDropBag>();

for (const source of D_GRADE_WEAPON_RECIPE_MOB_SOURCES) {
  let bag = OVERLAY_BY_NPC_ID.get(source.npcId);
  if (!bag) {
    bag = { drops: [], spoil: [] };
    OVERLAY_BY_NPC_ID.set(source.npcId, bag);
  }
  const entry = recipeDropEntry(source);
  if (source.channel === 'drop') {
    bag.drops.push(entry);
  } else {
    bag.spoil.push(entry);
  }
}

export function dGradeWeaponRecipeOverlayForNpc(
  npcId: number | null | undefined,
): NpcDropBag | null {
  if (npcId == null) return null;
  const bag = OVERLAY_BY_NPC_ID.get(Math.floor(npcId));
  if (!bag) return null;
  if (bag.drops.length === 0 && bag.spoil.length === 0) return null;
  return bag;
}

export function hasDGradeWeaponRecipeMobDrop(npcId: number | null | undefined): boolean {
  return dGradeWeaponRecipeOverlayForNpc(npcId) != null;
}

export function listDGradeWeaponRecipeSourcesForNpc(
  npcId: number,
): readonly DGradeWeaponRecipeMobSource[] {
  return D_GRADE_WEAPON_RECIPE_MOB_SOURCES.filter((s) => s.npcId === npcId);
}

export function findDGradeWeaponRecipeSource(
  npcId: number,
  itemId: number,
  channel: DGradeWeaponRecipeDropChannel,
): DGradeWeaponRecipeMobSource | undefined {
  return D_GRADE_WEAPON_RECIPE_MOB_SOURCES.find(
    (s) => s.npcId === npcId && s.itemId === itemId && s.channel === channel,
  );
}

export function mergeDGradeWeaponRecipeDropOverlay(
  bag: NpcDropBag,
  npcId: number | null,
): NpcDropBag {
  const overlay = dGradeWeaponRecipeOverlayForNpc(npcId);
  if (!overlay) return bag;
  return {
    ...bag,
    drops: [...bag.drops, ...overlay.drops],
    spoil: [...bag.spoil, ...overlay.spoil],
  };
}
