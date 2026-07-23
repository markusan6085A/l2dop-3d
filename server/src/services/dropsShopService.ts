import fs from 'node:fs';
import { gameConflictFromMutation } from './charConflict.js';
import path from 'node:path';

import { ITEM_CATALOG } from '../data/itemsCatalog.js';
import type {
  DropsShopCatalogRow,
  DropsShopCategory,
  DropsShopGradeUk,
} from '../data/dropsShopCatalog.generated.js';
import { DROPS_SHOP_CATALOG } from '../data/dropsShopCatalog.generated.js';
import { DROPS_SHOP_ARROW_ROWS } from '../data/dropsShopArrowsCatalog.js';
import { DROPS_SHOP_CONSUMABLE_ROWS } from '../data/dropsShopConsumablesCatalog.js';
import { DROPS_SHOP_FIGHTER_SOULSHOT_ROWS } from '../data/dropsShopFighterSoulshotsCatalog.js';
import { DROPS_SHOP_RESOURCE_ROWS } from '../data/dropsShopResourcesCatalog.js';
import { DROPS_SHOP_ENCHANT_SCROLL_ROWS } from '../data/dropsShopEnchantScrollsCatalog.js';
import { prisma } from '../lib/prisma.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import {
  addItemToBag,
  countBagQty,
  parseInventory,
  removeBagQty,
} from '../data/inventory.js';
import { COIN_OF_LUCK_ITEM_ID } from '../domain/dailyQuestRewards.js';
import type { Prisma } from '@prisma/client';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import {
  dropsGmPurchaseByShopKeyLower,
  dropsShopRelPathFromGmIcon,
  type GmShopPurchaseOffer,
} from '../domain/dropsShopGmItemIdByShopKey.js';
import { applyDropsShopPurchasePricing } from '../domain/dropsShopPurchasePrice.js';
import embeddedDropsShopOverrides from '../data/dropsShopOverrides.json';
import { buildDropsShopStatsPreviewUk } from '../domain/dropsShopStatsPreviewUk.js';
import {
  L2DOP_DROPS_SHIELD_BY_SHOP_KEY_LOWER,
  dropsShieldShopPreviewLines,
} from '../data/l2dopDropsShieldPatches.js';
import {
  L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  aGradeWeaponDropsPreviewLines,
} from '../data/l2dopAWeaponDropsPatches.js';
import {
  L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  bGradeWeaponDropsPreviewLines,
} from '../data/l2dopBWeaponDropsPatches.js';
import {
  L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  cGradeWeaponDropsPreviewLines,
} from '../data/l2dopCWeaponDropsPatches.js';
import {
  L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  dGradeWeaponDropsPreviewLines,
} from '../data/l2dopDWeaponDropsPatches.js';
import {
  L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  ngWeaponDropsPreviewLines,
} from '../data/l2dopNgWeaponDropsPatches.js';
import {
  L2DOP_NG_DROPS_ARMOR_BY_SHOP_KEY_LOWER,
  ngArmorDropsPreviewLines,
} from '../data/l2dopNgArmorDropsPatches.js';
import {
  L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  sGradeWeaponDropsPreviewLines,
} from '../data/l2dopSWeaponDropsPatches.js';
import {
  resolveDropsShopWeaponSubtype,
  type DropsShopWeaponSubtype,
} from '../domain/dropsShopWeaponSubtype.js';
import {
  resolveDropsShopArmorPiece,
  resolveDropsShopJewelrySubtype,
  resolveDropsShopJewelrySubtypeFromShopKey,
  type DropsShopArmorPiece,
  type DropsShopJewelrySubtype,
} from '../domain/dropsShopGearSubtypes.js';
import {
  enchantScrollByItemId,
  enchantScrollShopDescriptionUk,
} from '../data/enchantScrollCatalog.js';

export type { DropsShopWeaponSubtype } from '../domain/dropsShopWeaponSubtype.js';
export type {
  DropsShopArmorPiece,
  DropsShopJewelrySubtype,
} from '../domain/dropsShopGearSubtypes.js';

/** Підвкладки «Розхідники» в gm-shop (фільтр по полю в відповіді). */
export type DropsShopConsumableSubtype =
  | 'vials'
  | 'arrows'
  | 'charges'
  | 'resources'
  | 'enchantment';

export interface DropsShopOverrideEntry {
  itemId: number;
  priceAdena: number | null;
}

type OverridesMap = Record<string, DropsShopOverrideEntry>;

/** Порядок вкладок грейдів у UI. */
export const DROPS_SHOP_GRADE_ORDER: DropsShopGradeUk[] = [
  'S',
  'A',
  'B',
  'C',
  'D',
  'NG',
];

const CATEGORY_UK: Record<DropsShopCategory, string> = {
  weapon: 'Зброя',
  shield: 'Щити',
  armor: 'Броня',
  earring: 'Аксесуари',
  consumable: 'Розхідники',
};

let overridesCache: OverridesMap | undefined;
let overridesStatMtimeMs = 0;

function overridesPathCandidates(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, 'server', 'src', 'data', 'dropsShopOverrides.json'),
    path.join(cwd, 'src', 'data', 'dropsShopOverrides.json'),
  ];
}

function parseOverridesJson(raw: unknown): OverridesMap {
  if (!raw || typeof raw !== 'object') return {};
  const out: OverridesMap = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (k.startsWith('_')) continue;
    if (!v || typeof v !== 'object') continue;
    const o = v as Record<string, unknown>;
    const itemId = Number(o.itemId);
    if (!Number.isFinite(itemId) || itemId <= 0) continue;
    const priceRaw = o.priceAdena;
    const hasPrice =
      priceRaw !== undefined &&
      priceRaw !== null &&
      Number.isFinite(Number(priceRaw)) &&
      Number(priceRaw) >= 0;
    out[k] = {
      itemId: Math.floor(itemId),
      priceAdena: hasPrice ? Math.floor(Number(priceRaw)) : null,
    };
  }
  return out;
}

function embeddedOverridesMap(): OverridesMap {
  return parseOverridesJson(embeddedDropsShopOverrides);
}

export function loadDropsShopOverrides(): OverridesMap {
  for (const p of overridesPathCandidates()) {
    try {
      const st = fs.statSync(p);
      if (overridesCache != null && st.mtimeMs === overridesStatMtimeMs) {
        return overridesCache;
      }
      overridesStatMtimeMs = st.mtimeMs;
      const raw = fs.readFileSync(p, 'utf8');
      overridesCache = parseOverridesJson(JSON.parse(raw) as unknown);
      return overridesCache;
    } catch {
      // try next candidate
    }
  }
  overridesStatMtimeMs = 0;
  overridesCache = embeddedOverridesMap();
  return overridesCache;
}

/** Для тестів / форсування перечитування JSON. */
export function clearDropsShopOverridesCache(): void {
  overridesCache = undefined;
  overridesStatMtimeMs = 0;
}

/** Предмет узгоджується з секцією магазину (античит). */
export function dropsShopItemMatchesCategory(
  itemId: number,
  category: DropsShopCategory
): boolean {
  const m = ITEM_CATALOG[itemId];
  if (!m?.slot) return false;
  if (category === 'weapon') return m.slot === 'rhand';
  if (category === 'shield') return m.slot === 'lhand';
  if (category === 'earring') {
    return m.slot === 'earring' || m.slot === 'neck' || m.slot === 'ring';
  }
  if (category === 'armor') {
    return (
      m.slot === 'chest' ||
      m.slot === 'legs' ||
      m.slot === 'head' ||
      m.slot === 'gloves' ||
      m.slot === 'feet' ||
      m.slot === 'fullarmor'
    );
  }
  if (category === 'consumable') {
    return m.slot === 'consumable';
  }
  return false;
}

export interface DropsShopItemResponse {
  shopKey: string;
  category: DropsShopCategory;
  categoryUk: string;
  grade: DropsShopGradeUk;
  iconUrl: string;
  nameUk: string;
  /** Предмет і ціна: overrides або GM-каталог за iconUrl; null, якщо немає ні там, ні там. */
  itemId: number | null;
  /**
   * ItemId для прев’ю статів / бонусу сету в UI: override або збіг shopKey із GM-каталогом за іконкою.
   */
  previewItemId: number | null;
  priceAdena: number | null;
  priceCoinOfLuck: number | null;
  purchasable: boolean;
  /** S/NG/D/C/B/A зброя — патчі; інакше ITEM_CATALOG (override / GM по іконці). */
  statsPreview?: { lines: { labelUk: string; valueUk: string }[] };
  /** Лише зброя: фільтр під вкладці «Зброя». */
  weaponSubtype?: DropsShopWeaponSubtype;
  /** Лише броня: фільтр за частиною сету. */
  armorPiece?: DropsShopArmorPiece;
  /** Лише аксесуари (category `earring`): амулет / сережки / кільця. */
  jewelrySubtype?: DropsShopJewelrySubtype;
  /** Лише розхідники: «Банки» / «Стріли» / «Заряди» / «Ресурси». */
  consumableSubtype?: DropsShopConsumableSubtype;
}

function resolveDropsShopPurchaseOffer(
  row: DropsShopCatalogRow,
  overrides: OverridesMap
): GmShopPurchaseOffer | null {
  const shopKeyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
  const iconRel = dropsShopRelPathFromGmIcon(row.iconUrl);
  const o =
    overrides[row.shopKey] ??
    overrides[shopKeyNorm] ??
    (iconRel ? overrides[iconRel] : undefined);
  if (o) return o;

  const gm = dropsGmPurchaseByShopKeyLower();
  const gmOffer =
    (iconRel ? gm.get(iconRel) : undefined) ?? gm.get(shopKeyNorm);
  return gmOffer ?? null;
}

function resolveDropsShopPurchaseOfferPriced(
  row: DropsShopCatalogRow,
  overrides: OverridesMap
): GmShopPurchaseOffer | null {
  const offer = resolveDropsShopPurchaseOffer(row, overrides);
  if (!offer) return null;
  const meta = ITEM_CATALOG[offer.itemId];
  return applyDropsShopPurchasePricing(row, offer, meta);
}

function offerHasPurchasablePrice(offer: GmShopPurchaseOffer): boolean {
  const col = offer.priceCoinOfLuck;
  if (col != null && col > 0) return true;
  const adena = offer.priceAdena;
  return adena != null && Number.isFinite(adena) && adena >= 0;
}

function rowToClient(
  row: DropsShopCatalogRow,
  overrides: OverridesMap
): DropsShopItemResponse {
  const keyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
  const offer = resolveDropsShopPurchaseOfferPriced(row, overrides);
  const itemId = offer?.itemId ?? null;
  const priceAdena = offer?.priceAdena ?? null;
  const priceCoinOfLuck =
    offer?.priceCoinOfLuck != null && offer.priceCoinOfLuck > 0
      ? Math.floor(offer.priceCoinOfLuck)
      : null;
  const previewItemId = itemId ?? null;
  const previewMeta =
    previewItemId != null ? ITEM_CATALOG[previewItemId] : undefined;
  const previewFromCatalog = previewMeta
    ? { lines: buildDropsShopStatsPreviewUk(previewMeta) }
    : undefined;

  const sWeaponPatch =
    row.category === 'weapon' && row.grade === 'S'
      ? L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;
  const ngWeaponPatch =
    row.category === 'weapon' && row.grade === 'NG'
      ? L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;
  const dWeaponPatch =
    row.category === 'weapon' && row.grade === 'D'
      ? L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;
  const cWeaponPatch =
    row.category === 'weapon' && row.grade === 'C'
      ? L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;
  const bWeaponPatch =
    row.category === 'weapon' && row.grade === 'B'
      ? L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;
  const aWeaponPatch =
    row.category === 'weapon' && row.grade === 'A'
      ? L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;
  const shieldPatch =
    row.category === 'shield'
      ? L2DOP_DROPS_SHIELD_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;
  const ngArmorPatch =
    row.category === 'armor' && row.grade === 'NG'
      ? L2DOP_NG_DROPS_ARMOR_BY_SHOP_KEY_LOWER[keyNorm]
      : undefined;

  let purchasable = false;
  if (
    itemId != null &&
    offer &&
    offerHasPurchasablePrice(offer) &&
    ITEM_CATALOG[itemId] &&
    dropsShopItemMatchesCategory(itemId, row.category)
  ) {
    purchasable = true;
  }

  const statsPreviewChosen = shieldPatch
    ? { lines: dropsShieldShopPreviewLines(shieldPatch) }
    : ngArmorPatch
      ? { lines: ngArmorDropsPreviewLines(ngArmorPatch.pDef) }
    : sWeaponPatch
    ? { lines: sGradeWeaponDropsPreviewLines(sWeaponPatch) }
    : ngWeaponPatch
      ? { lines: ngWeaponDropsPreviewLines(ngWeaponPatch) }
      : dWeaponPatch
        ? { lines: dGradeWeaponDropsPreviewLines(dWeaponPatch) }
        : cWeaponPatch
          ? { lines: cGradeWeaponDropsPreviewLines(cWeaponPatch) }
          : bWeaponPatch
            ? { lines: bGradeWeaponDropsPreviewLines(bWeaponPatch) }
            : aWeaponPatch
              ? { lines: aGradeWeaponDropsPreviewLines(aWeaponPatch) }
              : previewFromCatalog;

  const listNameUkOverride = shieldPatch
    ? shieldPatch.nameUk
    : ngArmorPatch
      ? ngArmorPatch.nameUk
    : sWeaponPatch
    ? sWeaponPatch.nameUk
    : ngWeaponPatch
      ? ngWeaponPatch.nameUk
      : dWeaponPatch
        ? dWeaponPatch.nameUk
        : cWeaponPatch
          ? cWeaponPatch.nameUk
          : bWeaponPatch
            ? bWeaponPatch.nameUk
            : aWeaponPatch
              ? aWeaponPatch.nameUk
              : null;

  const out: DropsShopItemResponse = {
    shopKey: row.shopKey,
    category: row.category,
    categoryUk: CATEGORY_UK[row.category],
    grade: row.grade,
    iconUrl: row.iconUrl,
    nameUk: listNameUkOverride ?? row.nameUk,
    itemId,
    previewItemId,
    priceAdena,
    priceCoinOfLuck,
    purchasable,
  };

  if (row.category === 'weapon') {
    const displayName =
      listNameUkOverride ?? row.nameUk ?? previewMeta?.nameUk ?? '';
    out.weaponSubtype =
      resolveDropsShopWeaponSubtype(
        row,
        keyNorm,
        previewMeta,
        displayName,
      ) ?? 'sword';
  }

  if (row.category === 'armor') {
    const ap =
      ngArmorPatch?.armorPiece ??
      resolveDropsShopArmorPiece(previewMeta?.slot);
    if (ap) out.armorPiece = ap;
  }
  if (row.category === 'earring') {
    const fromShopKey = resolveDropsShopJewelrySubtypeFromShopKey(
      row.shopKey,
    );
    const fromSlot = resolveDropsShopJewelrySubtype(previewMeta?.slot);
    const jp = fromShopKey ?? fromSlot;
    if (jp) out.jewelrySubtype = jp;
  }

  if (row.category === 'consumable') {
    if (keyNorm.startsWith('consumable/potion_')) {
      out.consumableSubtype = 'vials';
    } else if (keyNorm.startsWith('consumable/arrow_')) {
      out.consumableSubtype = 'arrows';
    } else if (
      keyNorm.startsWith('consumable/fighter_soulshot_') ||
      keyNorm.startsWith('consumable/blessed_spiritshot_')
    ) {
      out.consumableSubtype = 'charges';
    } else if (keyNorm.startsWith('consumable/resource_')) {
      out.consumableSubtype = 'resources';
    } else if (keyNorm.startsWith('consumable/enchant_scroll_')) {
      out.consumableSubtype = 'enchantment';
    }
  }

  if (row.category === 'consumable' && itemId != null) {
    const scroll = enchantScrollByItemId(itemId);
    if (scroll) {
      out.statsPreview = {
        lines: [
          {
            labelUk: 'Призначення',
            valueUk: enchantScrollShopDescriptionUk(scroll.target, scroll.grade),
          },
        ],
      };
    }
  }

  if (statsPreviewChosen?.lines?.length) {
    out.statsPreview = statsPreviewChosen;
  }
  return out;
}

export interface DropsShopGradeGroup {
  grade: DropsShopGradeUk;
  sections: {
    category: DropsShopCategory;
    categoryUk: string;
    items: DropsShopItemResponse[];
  }[];
}

export function buildDropsShopCatalogForClient(): {
  grades: DropsShopGradeGroup[];
} {
  const overrides = loadDropsShopOverrides();
  const byGrade = new Map<DropsShopGradeUk, DropsShopCatalogRow[]>();
  for (const g of DROPS_SHOP_GRADE_ORDER) byGrade.set(g, []);
  const allCatalogRows = DROPS_SHOP_CATALOG.concat(
    DROPS_SHOP_CONSUMABLE_ROWS,
    DROPS_SHOP_ARROW_ROWS,
    DROPS_SHOP_FIGHTER_SOULSHOT_ROWS,
    DROPS_SHOP_RESOURCE_ROWS,
    DROPS_SHOP_ENCHANT_SCROLL_ROWS,
  );
  for (const row of allCatalogRows) {
    const arr = byGrade.get(row.grade);
    if (arr) arr.push(row);
  }

  const catOrder: DropsShopCategory[] = [
    'weapon',
    'shield',
    'armor',
    'earring',
    'consumable',
  ];
  const grades: DropsShopGradeGroup[] = [];

  for (const grade of DROPS_SHOP_GRADE_ORDER) {
    const rows = byGrade.get(grade) ?? [];
    if (rows.length === 0) continue;
    const byCat = new Map<DropsShopCategory, DropsShopCatalogRow[]>();
    for (const c of catOrder) byCat.set(c, []);
    for (const r of rows) {
      byCat.get(r.category)?.push(r);
    }
    const sections = catOrder
      .map((category) => ({
        category,
        categoryUk: CATEGORY_UK[category],
        items: (byCat.get(category) ?? [])
          .map((x) => rowToClient(x, overrides))
          .filter((item) => item.purchasable),
      }))
      .filter((s) => s.items.length > 0);

    grades.push({ grade, sections });
  }

  return { grades };
}

export async function applyDropsShopPurchase(
  userId: string,
  shopKeyRaw: string,
  expectedRevision: number,
  qtyRaw?: unknown
): Promise<CharacterSnapshot> {
  const normalized = String(shopKeyRaw || '')
    .trim()
    .replace(/\\/g, '/');
  const allRows = DROPS_SHOP_CATALOG.concat(
    DROPS_SHOP_CONSUMABLE_ROWS,
    DROPS_SHOP_ARROW_ROWS,
    DROPS_SHOP_FIGHTER_SOULSHOT_ROWS,
    DROPS_SHOP_RESOURCE_ROWS,
    DROPS_SHOP_ENCHANT_SCROLL_ROWS,
  );
  const row = allRows.find((r) => {
    const rk = r.shopKey.replace(/\\/g, '/');
    return rk === normalized || rk.toLowerCase() === normalized.toLowerCase();
  });
  if (!row) throw new Error('drops_shop_unknown');

  const overrides = loadDropsShopOverrides();
  const offer = resolveDropsShopPurchaseOfferPriced(row, overrides);
  if (!offer || !offerHasPurchasablePrice(offer)) {
    throw new Error('drops_shop_not_configured');
  }
  const itemId = offer.itemId;
  const meta = ITEM_CATALOG[itemId];
  if (!meta) throw new Error('drops_shop_bad_item');
  if (!dropsShopItemMatchesCategory(itemId, row.category)) {
    throw new Error('drops_shop_category_mismatch');
  }

  const unitCoin =
    offer.priceCoinOfLuck != null && offer.priceCoinOfLuck > 0
      ? Math.floor(offer.priceCoinOfLuck)
      : 0;
  const useCoinOfLuck = unitCoin > 0;
  const unitAdena =
    !useCoinOfLuck && offer.priceAdena != null
      ? BigInt(Math.max(0, Math.floor(offer.priceAdena)))
      : 0n;
  if (!useCoinOfLuck && unitAdena <= 0n) {
    throw new Error('drops_shop_not_configured');
  }

  let qty = 1;
  if (qtyRaw !== undefined) {
    const q =
      typeof qtyRaw === 'number' && Number.isInteger(qtyRaw)
        ? qtyRaw
        : typeof qtyRaw === 'string' && /^\d+$/.test(String(qtyRaw).trim())
          ? parseInt(String(qtyRaw).trim(), 10)
          : NaN;
    if (!Number.isFinite(q) || q < 1 || q > 9999) {
      throw new Error('drops_shop_bad_qty');
    }
    qty = q;
  }

  const characterRow = await prisma.$transaction(async (tx) => {
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
        const base = resolveMapMovement(applyPassiveHpRegen(current as CharacterRow));
        const adena = BigInt(base.adena);
        const inv = parseInventory(base.inventoryJson);
        let nextInv = inv;
        let nextAdena = adena;

        if (useCoinOfLuck) {
          const totalCoin = unitCoin * qty;
          const haveCoin = countBagQty(inv, COIN_OF_LUCK_ITEM_ID);
          if (haveCoin < totalCoin) throw new Error('drops_shop_no_coin_of_luck');
          nextInv = addItemToBag(inv, itemId, qty);
          nextInv = removeBagQty(nextInv, COIN_OF_LUCK_ITEM_ID, totalCoin);
        } else {
          const totalPrice = unitAdena * BigInt(qty);
          if (adena < totalPrice) throw new Error('drops_shop_no_adena');
          nextInv = addItemToBag(inv, itemId, qty);
          nextAdena = adena - totalPrice;
        }
        const invChanged =
          JSON.stringify(nextInv) !==
          JSON.stringify(parseInventory(current.inventoryJson));
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
  return buildCharacterClientSnapshot(characterRow, userId);
}
