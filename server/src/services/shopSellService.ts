import { prisma } from '../lib/prisma.js';
import {
  parseInventoryRaw,
  removeEnchantedFromBag,
  stripEquippedFromStacks,
} from '../data/inventory.js';
import type { Prisma } from '@prisma/client';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { applyCharacterReadView } from './charReadView.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { gameConflictFromMutation } from './charConflict.js';
import { loadDropsShopOverrides } from './dropsShopService.js';
import { dropsGmPurchaseByShopKeyLower } from '../domain/dropsShopGmItemIdByShopKey.js';
import { DROPS_SHOP_CATALOG } from '../data/dropsShopCatalog.generated.js';
import { DROPS_SHOP_CONSUMABLE_ROWS } from '../data/dropsShopConsumablesCatalog.js';
import { DROPS_SHOP_ARROW_ROWS } from '../data/dropsShopArrowsCatalog.js';
import { DROPS_SHOP_FIGHTER_SOULSHOT_ROWS } from '../data/dropsShopFighterSoulshotsCatalog.js';
import { DROPS_SHOP_ENCHANT_SCROLL_ROWS } from '../data/dropsShopEnchantScrollsCatalog.js';
import { dropsShopRelPathFromGmIcon } from '../domain/dropsShopGmItemIdByShopKey.js';
import type { DropsShopCatalogRow } from '../data/dropsShopCatalog.generated.js';
import type { DropsShopOverrideEntry } from './dropsShopService.js';
import {
  itemGradeHintsForClient,
  itemInventoryTabHintsForClient,
} from '../data/itemsCatalog.js';
import { RESOURCE_CRAFT_ITEM_NAMES_UK } from '../data/resourceCraftItemNamesUk.js';
import { applyCGradeWeaponGmShopPrice } from '../domain/dropsShopPurchasePrice.js';
import {
  resourceSellPriceAdena,
  shopSellTotalAdena,
  shopSellUnitAdenaFromBuyPrice,
} from '../domain/shopSellPricing.js';
import { MAX_ENCHANT_LEVEL } from '../data/enchantConfig.js';

type OverridesMap = Record<string, DropsShopOverrideEntry>;

function resolveBuyOfferForRow(
  row: DropsShopCatalogRow,
  overrides: OverridesMap
): { itemId: number; priceAdena: number } | null {
  const shopKeyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
  const iconRel = dropsShopRelPathFromGmIcon(row.iconUrl);
  const o =
    overrides[row.shopKey] ??
    overrides[shopKeyNorm] ??
    (iconRel ? overrides[iconRel] : undefined);
  if (o && o.itemId > 0 && o.priceAdena > 0) {
    const priced = applyCGradeWeaponGmShopPrice(row, {
      itemId: o.itemId,
      priceAdena: o.priceAdena,
    });
    if (priced.priceAdena == null || priced.priceAdena <= 0) return null;
    return { itemId: priced.itemId, priceAdena: priced.priceAdena };
  }
  const gm = dropsGmPurchaseByShopKeyLower();
  const gmOffer =
    (iconRel ? gm.get(iconRel) : undefined) ?? gm.get(shopKeyNorm);
  if (
    gmOffer &&
    gmOffer.itemId > 0 &&
    gmOffer.priceAdena != null &&
    gmOffer.priceAdena > 0
  ) {
    const priced = applyCGradeWeaponGmShopPrice(row, gmOffer);
    if (priced.priceAdena == null || priced.priceAdena <= 0) return null;
    return { itemId: priced.itemId, priceAdena: priced.priceAdena };
  }
  return null;
}

function buildBuyPriceByItemId(): Map<number, number> {
  const m = new Map<number, number>();
  const overrides = loadDropsShopOverrides();
  const allRows = DROPS_SHOP_CATALOG.concat(
    DROPS_SHOP_CONSUMABLE_ROWS,
    DROPS_SHOP_ARROW_ROWS,
    DROPS_SHOP_FIGHTER_SOULSHOT_ROWS,
    DROPS_SHOP_ENCHANT_SCROLL_ROWS
  );
  for (const row of allRows) {
    const offer = resolveBuyOfferForRow(row, overrides);
    if (offer) m.set(offer.itemId, offer.priceAdena);
  }
  for (const offer of dropsGmPurchaseByShopKeyLower().values()) {
    if (
      offer.itemId > 0 &&
      offer.priceAdena != null &&
      offer.priceAdena > 0 &&
      !m.has(offer.itemId)
    ) {
      m.set(offer.itemId, offer.priceAdena);
    }
  }
  return m;
}

function itemGradeKey(itemId: number): string {
  const hints = itemGradeHintsForClient();
  const g = hints[itemId];
  if (g != null && String(g).trim() !== '') {
    return String(g).trim().toLowerCase();
  }
  return '';
}

function buildResourceSellByItemId(): Map<number, number> {
  const m = new Map<number, number>();
  const tabs = itemInventoryTabHintsForClient();
  for (const idStr of Object.keys(tabs)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) continue;
    if (tabs[id] !== 'resource') continue;
    m.set(id, resourceSellPriceAdena(id, itemGradeKey(id)));
  }
  for (const idStr of Object.keys(RESOURCE_CRAFT_ITEM_NAMES_UK)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0 || m.has(id)) continue;
    m.set(id, resourceSellPriceAdena(id, itemGradeKey(id)));
  }
  return m;
}

function buyPriceIndex(): ReadonlyMap<number, number> {
  return buildBuyPriceByItemId();
}

function resourceSellIndex(): ReadonlyMap<number, number> {
  return buildResourceSellByItemId();
}

export function resolveSellPriceAdena(itemId: number): number | null {
  const id = Math.floor(itemId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const buy = buyPriceIndex().get(id);
  if (buy != null && buy > 0) {
    return shopSellUnitAdenaFromBuyPrice(id, buy);
  }
  const res = resourceSellIndex().get(id);
  if (res != null && res > 0) return res;
  return null;
}

export function resolveSellTotalAdena(itemId: number, qty: number): number | null {
  const id = Math.floor(itemId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const q = Math.max(1, Math.floor(qty));
  const buy = buyPriceIndex().get(id);
  if (buy != null && buy > 0) {
    return shopSellTotalAdena(id, buy, q);
  }
  const unit = resourceSellIndex().get(id);
  if (unit != null && unit > 0) return unit * q;
  return null;
}

export function buildShopSellPricesForClient(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, buy] of buyPriceIndex()) {
    out[String(id)] = shopSellUnitAdenaFromBuyPrice(id, buy);
  }
  for (const [id, price] of resourceSellIndex()) {
    if (out[String(id)] == null) out[String(id)] = price;
  }
  return out;
}

function normEnchant(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(MAX_ENCHANT_LEVEL, Math.floor(raw)));
}

export async function applyShopSell(
  userId: string,
  expectedRevision: number,
  itemIdRaw: number,
  enchantRaw: unknown,
  qtyRaw: unknown
): Promise<CharacterSnapshot> {
  const itemId = Math.floor(itemIdRaw);
  if (!Number.isFinite(itemId) || itemId <= 0) throw new Error('shop_sell_bad_item');
  const enchant = normEnchant(enchantRaw);

  let qty = 1;
  if (qtyRaw != null) {
    const q =
      typeof qtyRaw === 'number' && Number.isInteger(qtyRaw)
        ? qtyRaw
        : typeof qtyRaw === 'string' && /^\d+$/.test(String(qtyRaw).trim())
          ? parseInt(String(qtyRaw).trim(), 10)
          : NaN;
    if (!Number.isFinite(q) || q < 1 || q > 9999) throw new Error('shop_sell_bad_qty');
    qty = q;
  }

  const totalSell = resolveSellTotalAdena(itemId, qty);
  if (totalSell == null || totalSell <= 0) throw new Error('shop_sell_not_sellable');

  const row = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const row = current as CharacterRow;
        const base = resolveMapMovement(applyPassiveHpRegen(row));
        const invRaw = parseInventoryRaw(base.inventoryJson);
        const bagView = stripEquippedFromStacks(invRaw);
        const src = bagView.stacks.find(
          (s) => s.itemId === itemId && normEnchant(s.enchant) === enchant
        );
        if (!src || src.qty < qty) throw new Error('shop_sell_not_in_bag');

        const nextInv = removeEnchantedFromBag(invRaw, itemId, qty, enchant);
        const nextAdena = BigInt(base.adena) + BigInt(totalSell);
        const invChanged = JSON.stringify(nextInv) !== JSON.stringify(invRaw);
        const changed =
          base.hp !== current.hp ||
          base.worldX !== current.worldX ||
          base.worldY !== current.worldY ||
          base.targetX !== current.targetX ||
          base.targetY !== current.targetY ||
          (base.moveStartAt?.getTime() ?? 0) !==
            ((current as CharacterRow).moveStartAt?.getTime() ?? 0) ||
          base.moveFromX !== current.moveFromX ||
          base.moveFromY !== current.moveFromY ||
          nextAdena !== current.adena ||
          invChanged;
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            adena: nextAdena,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(applyCharacterReadView(row), userId);
}
