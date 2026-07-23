/**
 * Аудит колізій itemId у dropsShopOverrides.json.
 */
import dropsShopOverrides from '../data/dropsShopOverrides.json';
import { DROPS_SHOP_CATALOG } from '../data/dropsShopCatalog.generated.js';
import { L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopAWeaponDropsPatches.js';
import { L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopBWeaponDropsPatches.js';
import { L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopCWeaponDropsPatches.js';
import { L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopDWeaponDropsPatches.js';
import { L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopNgWeaponDropsPatches.js';
import { L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopSWeaponDropsPatches.js';
import { NG_WEAPON_BY_SHOP_KEY_LOWER } from '../data/ngWeaponCatalog.js';
import { D_WEAPON_BY_SHOP_KEY_LOWER } from '../data/dWeaponCatalog.js';
import { C_WEAPON_BY_SHOP_KEY_LOWER } from '../data/cWeaponCatalog.js';
import { B_WEAPON_BY_SHOP_KEY_LOWER } from '../data/bWeaponCatalog.js';
import { A_WEAPON_BY_SHOP_KEY_LOWER } from '../data/aWeaponCatalog.js';
import { S_WEAPON_BY_SHOP_KEY_LOWER } from '../data/sWeaponCatalog.js';
import { ITEM_CATALOG } from '../data/itemsCatalog.js';

type OverrideRow = { itemId?: number; priceAdena?: number };

export interface DropsShopItemIdBinding {
  shopKey: string;
  itemId: number;
  grade: string;
  category: string;
  statFingerprint: string;
}

export interface DropsShopItemIdCollision {
  itemId: number;
  bindings: DropsShopItemIdBinding[];
  reason: string;
}

/** Явний allowlist: itemId → shopKeys, що справді один предмет з однаковими статами. */
export const DROPS_SHOP_ITEM_ID_ALIAS_ALLOWLIST: ReadonlyMap<number, readonly string[][]> =
  new Map([
    // приклад: [99, [['shop/a.png', 'shop/b.png']]]
  ]);

function shopKeyNorm(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

const GRADE_BY_SHOP_KEY = new Map<string, { grade: string; category: string }>(
  DROPS_SHOP_CATALOG.map((row) => [
    shopKeyNorm(row.shopKey),
    { grade: row.grade, category: row.category },
  ]),
);

function weaponPatchFingerprint(
  shopKeyLower: string,
  grade: string,
): string | null {
  const maps: Array<[string, Record<string, { mode: string; pAtk?: number; mAtk?: number; speed?: number; crit?: number }>]> = [
    ['NG', L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER],
    ['D', L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER],
    ['C', L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER],
    ['B', L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER],
    ['A', L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER],
    ['S', L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER],
  ];
  for (const [g, map] of maps) {
    if (g !== grade) continue;
    const patch = map[shopKeyLower];
    if (!patch) continue;
    if (patch.mode === 'magic' || patch.mode === 'magic_book') {
      return `magic:mAtk=${patch.mAtk}:spd=${patch.speed}`;
    }
    return `phys:pAtk=${patch.pAtk}:spd=${patch.speed}:crit=${patch.crit}`;
  }
  return null;
}

function catalogFingerprint(itemId: number): string {
  const m = ITEM_CATALOG[itemId];
  if (!m) return 'missing';
  const parts = [
    `slot=${m.slot ?? '?'}`,
    m.weaponType ? `wt=${m.weaponType}` : '',
    m.pAtk != null ? `p=${m.pAtk}` : '',
    m.mAtk != null ? `m=${m.mAtk}` : '',
    m.pDef != null ? `pd=${m.pDef}` : '',
    m.atkSpd != null ? `spd=${m.atkSpd}` : '',
    m.wpnCrit != null ? `wc=${m.wpnCrit}` : '',
  ].filter(Boolean);
  return parts.join(':') || 'empty';
}

function statFingerprint(shopKey: string, itemId: number, grade: string): string {
  const key = shopKeyNorm(shopKey);
  const ngCanon = NG_WEAPON_BY_SHOP_KEY_LOWER.get(key);
  if (ngCanon) {
    return [
      'ng-canon',
      `wt=${ngCanon.weaponType}`,
      `p=${ngCanon.pAtk}`,
      `m=${ngCanon.mAtk}`,
      `spd=${ngCanon.atkSpd}`,
      `wc=${ngCanon.wpnCrit}`,
    ]
      .filter(Boolean)
      .join(':');
  }
  const dCanon = D_WEAPON_BY_SHOP_KEY_LOWER.get(key);
  if (dCanon) {
    return [
      'd-canon',
      `wt=${dCanon.weaponType}`,
      `p=${dCanon.pAtk}`,
      dCanon.mAtk != null ? `m=${dCanon.mAtk}` : '',
      `spd=${dCanon.atkSpd}`,
      `wc=${dCanon.wpnCrit}`,
    ]
      .filter(Boolean)
      .join(':');
  }
  const cCanon = C_WEAPON_BY_SHOP_KEY_LOWER.get(key);
  if (cCanon) {
    return [
      'c-canon',
      `wt=${cCanon.weaponType}`,
      `p=${cCanon.pAtk}`,
      cCanon.mAtk != null ? `m=${cCanon.mAtk}` : '',
      `spd=${cCanon.atkSpd}`,
      `wc=${cCanon.wpnCrit}`,
    ]
      .filter(Boolean)
      .join(':');
  }
  const bCanon = B_WEAPON_BY_SHOP_KEY_LOWER.get(key);
  if (bCanon) {
    return [
      'b-canon',
      `wt=${bCanon.weaponType}`,
      `p=${bCanon.pAtk}`,
      bCanon.mAtk != null ? `m=${bCanon.mAtk}` : '',
      `spd=${bCanon.atkSpd}`,
      `wc=${bCanon.wpnCrit}`,
    ]
      .filter(Boolean)
      .join(':');
  }
  const aCanon = A_WEAPON_BY_SHOP_KEY_LOWER.get(key);
  if (aCanon) {
    return [
      'a-canon',
      `wt=${aCanon.weaponType}`,
      `p=${aCanon.pAtk}`,
      aCanon.mAtk != null ? `m=${aCanon.mAtk}` : '',
      `spd=${aCanon.atkSpd}`,
      `wc=${aCanon.wpnCrit}`,
    ]
      .filter(Boolean)
      .join(':');
  }
  const sCanon = S_WEAPON_BY_SHOP_KEY_LOWER.get(key);
  if (sCanon) {
    return [
      's-canon',
      `wt=${sCanon.weaponType}`,
      `p=${sCanon.pAtk}`,
      sCanon.mAtk != null ? `m=${sCanon.mAtk}` : '',
      `spd=${sCanon.atkSpd}`,
      `wc=${sCanon.wpnCrit}`,
    ]
      .filter(Boolean)
      .join(':');
  }
  const patchFp = weaponPatchFingerprint(key, grade);
  if (patchFp) return patchFp;
  return `catalog:${catalogFingerprint(itemId)}`;
}

function isAllowlisted(itemId: number, shopKeys: string[]): boolean {
  const groups = DROPS_SHOP_ITEM_ID_ALIAS_ALLOWLIST.get(itemId);
  if (!groups) return false;
  const sorted = [...shopKeys].sort();
  return groups.some((g) => {
    const gs = [...g].sort();
    return gs.length === sorted.length && gs.every((k, i) => k === sorted[i]);
  });
}

export function auditDropsShopItemIdCollisions(): DropsShopItemIdCollision[] {
  const overrides = dropsShopOverrides as Record<string, OverrideRow>;
  const byItemId = new Map<number, DropsShopItemIdBinding[]>();

  for (const [shopKey, row] of Object.entries(overrides)) {
    if (shopKey.startsWith('_') || row.itemId == null || row.itemId <= 0) continue;
    const itemId = Math.floor(row.itemId);
    const meta = GRADE_BY_SHOP_KEY.get(shopKeyNorm(shopKey));
    const grade = meta?.grade ?? '?';
    const category = meta?.category ?? '?';
    const binding: DropsShopItemIdBinding = {
      shopKey,
      itemId,
      grade,
      category,
      statFingerprint: statFingerprint(shopKey, itemId, grade),
    };
    if (!byItemId.has(itemId)) byItemId.set(itemId, []);
    byItemId.get(itemId)!.push(binding);
  }

  const collisions: DropsShopItemIdCollision[] = [];

  for (const [itemId, bindings] of byItemId.entries()) {
    if (bindings.length <= 1) continue;
    const shopKeys = bindings.map((b) => b.shopKey);
    if (isAllowlisted(itemId, shopKeys)) continue;

    const grades = new Set(bindings.map((b) => b.grade));
    const fingerprints = new Set(bindings.map((b) => b.statFingerprint));

    let reason: string;
    if (grades.size > 1) {
      reason = `різні грейди (${[...grades].join(', ')})`;
    } else if (fingerprints.size > 1) {
      reason = 'різні канонічні характеристики';
    } else {
      reason = 'дубль shopKey без явного allowlist';
    }

    collisions.push({ itemId, bindings, reason });
  }

  return collisions.sort((a, b) => a.itemId - b.itemId);
}

export function listDropsShopItemIdBindings(): DropsShopItemIdBinding[] {
  const overrides = dropsShopOverrides as Record<string, OverrideRow>;
  const out: DropsShopItemIdBinding[] = [];
  for (const [shopKey, row] of Object.entries(overrides)) {
    if (shopKey.startsWith('_') || row.itemId == null || row.itemId <= 0) continue;
    const itemId = Math.floor(row.itemId);
    const meta = GRADE_BY_SHOP_KEY.get(shopKeyNorm(shopKey));
    const grade = meta?.grade ?? '?';
    out.push({
      shopKey,
      itemId,
      grade,
      category: meta?.category ?? '?',
      statFingerprint: statFingerprint(shopKey, itemId, grade),
    });
  }
  return out.sort((a, b) => a.itemId - b.itemId || a.shopKey.localeCompare(b.shopKey));
}
