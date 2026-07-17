/**
 * Англійські назви предметів для UI (зброя, броня, аксесуари, розхідники, ресурси, дроп).
 * Джерела: patches NG, dropsShopCatalog, ресурси [English], ручні overrides.
 */
import { DROPS_SHOP_CATALOG } from './dropsShopCatalog.generated.js';
import { DROPS_SHOP_ARROW_ROWS } from './dropsShopArrowsCatalog.js';
import { DROPS_SHOP_CONSUMABLE_ROWS } from './dropsShopConsumablesCatalog.js';
import { DROPS_SHOP_FIGHTER_SOULSHOT_ROWS } from './dropsShopFighterSoulshotsCatalog.js';
import dropsShopOverrides from './dropsShopOverrides.json';
import { dropsGmPurchaseByShopKeyLower } from '../domain/dropsShopGmItemIdByShopKey.js';
import { L2DOP_NG_DROPS_ARMOR_BY_SHOP_KEY_LOWER } from './l2dopNgArmorDropsPatches.js';
import { L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from './l2dopNgWeaponDropsPatches.js';
import { RESOURCE_CRAFT_ITEM_NAMES_UK } from './resourceCraftItemNamesUk.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import { ancientAdenaNamesEnForClient } from './ancientAdenaItem.js';
import { sealStoneNamesEnForClient } from './sevenSignsSealStoneItems.js';

type OverrideRow = { itemId?: number };

const SYNTHETIC_SHOP_NAMES_EN: Record<string, string> = {
  'consumable/potion_lesser_healing': 'Lesser Healing Potion',
  'consumable/potion_healing': 'Healing Potion',
  'consumable/potion_mana_small': 'Mana Potion',
  'consumable/potion_mana_large': 'Greater Mana Potion',
  'consumable/blessed_spiritshot_ng': 'Blessed Spiritshot',
  'consumable/blessed_spiritshot_d': 'Blessed Spiritshot',
  'consumable/blessed_spiritshot_c': 'Blessed Spiritshot',
  'consumable/blessed_spiritshot_b': 'Blessed Spiritshot',
  'consumable/blessed_spiritshot_a': 'Blessed Spiritshot',
  'consumable/blessed_spiritshot_s': 'Blessed Spiritshot',
  'consumable/arrow_ng': 'Wooden Arrow',
  'consumable/arrow_d': 'Bone Arrow',
  'consumable/arrow_c': 'Fine Steel Arrow',
  'consumable/arrow_b': 'Silver Arrow',
  'consumable/arrow_a': 'Mithril Arrow',
  'consumable/arrow_s': 'Shining Arrow',
  'consumable/fighter_soulshot_ng': 'Soulshot',
  'consumable/fighter_soulshot_d': 'D-grade Soulshot',
  'consumable/fighter_soulshot_c': 'C-grade Soulshot',
  'consumable/fighter_soulshot_b': 'B-grade Soulshot',
  'consumable/fighter_soulshot_a': 'A-grade Soulshot',
  'consumable/fighter_soulshot_s': 'S-grade Soulshot',
};

/** Ручні overrides, коли в каталозі лише UA або зламаний підпис. */
const ITEM_NAMES_EN_OVERRIDES: Record<number, string> = {
  18: 'Leather Shield',
  116: 'Magic Ring',
  2138: 'Recipe: Coarse Bone Powder',
  6652: 'Scroll: Valakas Protection',
  6654: 'Scroll: Valakas Flames',
  6655: 'Scroll: Valakas Slay',
  4037: 'Coin of Luck',
};

let cache: Record<number, string> | null = null;

function hasCyrillic(s: string): boolean {
  return /[А-Яа-яІіЇїЄєґҐ]/.test(s);
}

function resourceNameEn(uk: string): string {
  const m = /\[([^\]]+)\]\s*$/.exec(String(uk || '').trim());
  return m ? m[1]!.trim() : String(uk || '').trim();
}

function stripGradeSuffix(name: string): string {
  return name
    .replace(/\s+(NG|D|C|B|A|S)(-grade)?\.?$/i, '')
    .replace(/\s+[A-Za-z]+-grade\.?$/i, '')
    .replace(/\.+$/, '')
    .trim();
}

function resolveItemIdForShopKey(shopKey: string): number | null {
  const overrides = dropsShopOverrides as Record<string, OverrideRow>;
  const gm = dropsGmPurchaseByShopKeyLower();
  const keyNorm = shopKey.replace(/\\/g, '/').toLowerCase();
  const override = overrides[shopKey];
  const fromOverride =
    override && typeof override.itemId === 'number' && override.itemId > 0
      ? Math.floor(override.itemId)
      : null;
  if (fromOverride != null) return fromOverride;
  return gm.get(keyNorm)?.itemId ?? null;
}

export function itemNamesEnForClient(): Record<number, string> {
  if (cache) return cache;
  const out: Record<number, string> = {};

  const put = (id: number, name: string, force = false): void => {
    if (!Number.isFinite(id) || id <= 0) return;
    const n = String(name || '').trim();
    if (!n) return;
    if (!force && out[id]) return;
    out[id] = n;
  };

  for (const row of DROPS_SHOP_CATALOG) {
    const id = resolveItemIdForShopKey(row.shopKey);
    if (id != null) put(id, row.nameUk);
  }

  const syntheticRows = [
    ...DROPS_SHOP_CONSUMABLE_ROWS,
    ...DROPS_SHOP_ARROW_ROWS,
    ...DROPS_SHOP_FIGHTER_SOULSHOT_ROWS,
  ];
  for (const row of syntheticRows) {
    const id = resolveItemIdForShopKey(row.shopKey);
    const en = SYNTHETIC_SHOP_NAMES_EN[row.shopKey];
    if (id != null && en) put(id, en, true);
  }

  for (const [key, patch] of Object.entries(L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER)) {
    const id = resolveItemIdForShopKey(key);
    if (id != null) put(id, patch.nameUk, true);
  }

  for (const [key, patch] of Object.entries(L2DOP_NG_DROPS_ARMOR_BY_SHOP_KEY_LOWER)) {
    const id = resolveItemIdForShopKey(key);
    if (id != null) put(id, patch.nameUk, true);
  }

  for (const [idStr, uk] of Object.entries(RESOURCE_CRAFT_ITEM_NAMES_UK)) {
    put(Number(idStr), resourceNameEn(uk), true);
  }

  for (const [idStr, en] of Object.entries(sealStoneNamesEnForClient())) {
    put(Number(idStr), en, true);
  }

  for (const [idStr, en] of Object.entries(ancientAdenaNamesEnForClient())) {
    put(Number(idStr), en, true);
  }

  for (const [idStr, en] of Object.entries(ITEM_NAMES_EN_OVERRIDES)) {
    put(Number(idStr), en, true);
  }

  for (const [idStr, m] of Object.entries(ITEM_CATALOG)) {
    const id = Number(idStr);
    if (out[id]) continue;
    const n = m.nameUk;
    if (!n || hasCyrillic(n)) continue;
    put(id, stripGradeSuffix(n));
  }

  cache = out;
  return out;
}
