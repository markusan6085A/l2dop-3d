import type { L2ItemInventoryTabHint } from './l2dopItemInventoryTab.generated.js';
import {
  CRAFTED_RESOURCE_CATALOG,
  type CraftedResourceEntry,
} from './craftedResourceCatalog.js';
import type { ItemMeta } from './itemsCatalog.js';

export function mergeCraftedResources(target: Record<number, ItemMeta>): void {
  for (const row of CRAFTED_RESOURCE_CATALOG) {
    target[row.itemId] = craftedResourceItemMeta(row);
  }
}

function craftedResourceItemMeta(row: CraftedResourceEntry): ItemMeta {
  return {
    nameUk: row.nameUk,
    slot: 'consumable',
  };
}

export function craftedResourceInventoryTabHints(): Record<
  number,
  L2ItemInventoryTabHint
> {
  const out: Record<number, L2ItemInventoryTabHint> = {};
  for (const row of CRAFTED_RESOURCE_CATALOG) {
    out[row.itemId] = row.inventoryTab;
  }
  return out;
}

export function craftedResourceIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of CRAFTED_RESOURCE_CATALOG) {
    out[row.itemId] = row.iconUrl;
  }
  return out;
}

export function craftedResourceNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of CRAFTED_RESOURCE_CATALOG) {
    out[row.itemId] = row.nameUk;
  }
  return out;
}

export function craftedResourceNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of CRAFTED_RESOURCE_CATALOG) {
    out[row.itemId] = row.nameEn;
  }
  return out;
}
