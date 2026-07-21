/**
 * Скан acquisition sources на legacy Elysian itemId 290.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ELYSIAN_ITEM_ID,
  LEGACY_ELYSIAN_BOW_ITEM_ID,
  isLegacyBlockedAcquisitionItemId,
  remapLegacyElysianItemId,
  resolveAcquisitionIssueItemId,
} from '../../src/data/legacyElysianConstants.js';
import {
  L2DOP_GM_SHOP_ARMOR,
  L2DOP_GM_SHOP_JEWELRY,
  L2DOP_GM_SHOP_WEAPONS,
} from '../../src/data/l2dopGmShopCatalog.generated.js';
import { DROPS_SHOP_CATALOG } from '../../src/data/dropsShopCatalog.generated.js';
import embeddedDropsShopOverrides from '../../src/data/dropsShopOverrides.json';
import { dropsGmPurchaseByShopKeyLower } from '../../src/domain/dropsShopGmItemIdByShopKey.js';
import { RB_DROP_ITEM_A } from '../../src/data/l2dopRaidBossDropSharedA.js';
import { collectAllCanonWeapons } from './weaponCanonAuditCore.js';
import { listGearCatalogForClient } from '../../src/data/itemsCatalog.js';
import { requiresArrowsForWeaponType } from '../../src/data/weaponTypeContract.js';
import { itemBlocksShieldSlot } from '../../src/data/l2dopTwoHandedWeapon.js';
import { ITEM_CATALOG } from '../../src/data/itemsCatalog.js';
import {
  parseInventoryRaw,
  type BagStack,
} from '../../src/data/inventory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

export interface AcquisitionReference {
  source: string;
  detail: string;
}

function isLegacyItemRef(itemId: unknown): boolean {
  return Number(itemId) === LEGACY_ELYSIAN_BOW_ITEM_ID;
}

export function collectLegacyElysianAcquisitionReferences(): AcquisitionReference[] {
  const refs: AcquisitionReference[] = [];

  for (const row of L2DOP_GM_SHOP_WEAPONS) {
    if (isLegacyItemRef(row.itemId)) {
      refs.push({
        source: 'L2DOP_GM_SHOP_WEAPONS',
        detail: `itemId=${row.itemId} nameUk=${row.nameUk}`,
      });
    }
  }
  for (const row of L2DOP_GM_SHOP_ARMOR) {
    if (isLegacyItemRef(row.itemId)) {
      refs.push({ source: 'L2DOP_GM_SHOP_ARMOR', detail: `itemId=${row.itemId}` });
    }
  }
  for (const row of L2DOP_GM_SHOP_JEWELRY) {
    if (isLegacyItemRef(row.itemId)) {
      refs.push({ source: 'L2DOP_GM_SHOP_JEWELRY', detail: `itemId=${row.itemId}` });
    }
  }

  const overrides = embeddedDropsShopOverrides as Record<
    string,
    { itemId?: number; priceAdena?: number }
  >;
  for (const [shopKey, row] of Object.entries(overrides)) {
    if (isLegacyItemRef(row?.itemId)) {
      refs.push({ source: 'dropsShopOverrides.json', detail: `${shopKey} itemId=290` });
    }
  }

  for (const [shopKey, offer] of dropsGmPurchaseByShopKeyLower()) {
    if (isLegacyItemRef(offer.itemId)) {
      refs.push({ source: 'dropsGmPurchaseByShopKeyLower', detail: `${shopKey} itemId=290` });
    }
  }

  for (const row of DROPS_SHOP_CATALOG) {
    const shopKeyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
    const o =
      overrides[row.shopKey] ??
      overrides[shopKeyNorm] ??
      overrides[row.shopKey.replace(/\\/g, '/').toLowerCase()];
    if (isLegacyItemRef(o?.itemId)) {
      refs.push({ source: 'DROPS_SHOP_CATALOG+override', detail: row.shopKey });
    }
  }

  if (isLegacyItemRef(RB_DROP_ITEM_A.elysian?.l2ItemId)) {
    refs.push({ source: 'RB_DROP_ITEM_A.elysian', detail: 'l2ItemId=290' });
  }

  for (const row of listGearCatalogForClient()) {
    if (isLegacyItemRef(row.itemId)) {
      refs.push({ source: 'listGearCatalogForClient', detail: `itemId=290 name=${row.nameUk}` });
    }
  }

  const grantSrc = fs.readFileSync(
    path.join(REPO_ROOT, 'server/scripts/grant-item.ts'),
    'utf8',
  );
  if (!grantSrc.includes('resolveAcquisitionIssueItemId')) {
    refs.push({
      source: 'grant-item.ts',
      detail: 'missing resolveAcquisitionIssueItemId remap',
    });
  }

  return refs;
}

export function findGmElysianWeaponRows(): Array<{
  itemId: number;
  nameUk: string;
  weaponType: string;
  blocksShield: boolean;
  requiresArrows: boolean;
}> {
  const out: Array<{
    itemId: number;
    nameUk: string;
    weaponType: string;
    blocksShield: boolean;
    requiresArrows: boolean;
  }> = [];
  const needle = /elysian|елізій/i;
  for (const row of L2DOP_GM_SHOP_WEAPONS) {
    if (!needle.test(row.nameUk) && !needle.test(row.iconUrl ?? '')) continue;
    const meta = ITEM_CATALOG[row.itemId];
    out.push({
      itemId: row.itemId,
      nameUk: row.nameUk,
      weaponType: row.weaponType,
      blocksShield: itemBlocksShieldSlot(row.itemId, row.weaponType),
      requiresArrows: requiresArrowsForWeaponType(row.weaponType),
    });
    void meta;
  }
  return out;
}

export function legacyInventoryRepairSample(): {
  stacks: BagStack[];
  eq: Record<string, number>;
} {
  const raw = {
    stacks: [{ itemId: LEGACY_ELYSIAN_BOW_ITEM_ID, qty: 1 }],
    eq: { l1: LEGACY_ELYSIAN_BOW_ITEM_ID },
  };
  const parsed = parseInventoryRaw(raw);
  return {
    stacks: parsed.stacks ?? [],
    eq: Object.fromEntries(
      Object.entries(parsed.eq ?? {}).map(([k, v]) => [k, typeof v === 'number' ? v : 0]),
    ),
  };
}

export function assertLegacyBlockedExports(): string[] {
  const errors: string[] = [];
  if (!isLegacyBlockedAcquisitionItemId(LEGACY_ELYSIAN_BOW_ITEM_ID)) {
    errors.push('290 must be blocked acquisition id');
  }
  if (resolveAcquisitionIssueItemId(LEGACY_ELYSIAN_BOW_ITEM_ID) !== ELYSIAN_ITEM_ID) {
    errors.push('resolveAcquisitionIssueItemId(290) must return 164');
  }
  if (remapLegacyElysianItemId(LEGACY_ELYSIAN_BOW_ITEM_ID) !== ELYSIAN_ITEM_ID) {
    errors.push('remapLegacyElysianItemId(290) must return 164');
  }
  const canonIds = new Set(collectAllCanonWeapons().map((w) => w.itemId));
  if (canonIds.has(LEGACY_ELYSIAN_BOW_ITEM_ID)) {
    errors.push('290 must not be in 144 canonical weapons');
  }
  if (!canonIds.has(ELYSIAN_ITEM_ID)) {
    errors.push('164 must remain in 144 canonical weapons');
  }
  return errors;
}

export {
  ELYSIAN_ITEM_ID,
  LEGACY_ELYSIAN_BOW_ITEM_ID,
};
