import type { L2ItemInventoryTabHint } from './l2dopItemInventoryTab.generated.js';
import {
  BASIC_RESOURCE_CATALOG,
  type BasicResourceEntry,
} from './basicResourceCatalog.js';
import type { ItemMeta } from './itemsCatalog.js';

/** Ресурси — stackable ETC у сумці, вкладка «Ресурси», без екіпу/заточки/«Використати». */
export function mergeBasicResources(target: Record<number, ItemMeta>): void {
  for (const row of BASIC_RESOURCE_CATALOG) {
    target[row.itemId] = basicResourceItemMeta(row);
  }
}

function basicResourceItemMeta(row: BasicResourceEntry): ItemMeta {
  return {
    nameUk: row.nameUk,
    slot: 'consumable',
  };
}

export function basicResourceInventoryTabHints(): Record<
  number,
  L2ItemInventoryTabHint
> {
  const out: Record<number, L2ItemInventoryTabHint> = {};
  for (const row of BASIC_RESOURCE_CATALOG) {
    out[row.itemId] = 'resource';
  }
  return out;
}

export function basicResourceIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of BASIC_RESOURCE_CATALOG) {
    out[row.itemId] = row.iconUrl;
  }
  return out;
}

export function basicResourceNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of BASIC_RESOURCE_CATALOG) {
    out[row.itemId] = row.nameUk;
  }
  return out;
}

export function basicResourceNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of BASIC_RESOURCE_CATALOG) {
    out[row.itemId] = row.nameEn;
  }
  return out;
}
