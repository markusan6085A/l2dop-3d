/**
 * Стати щитів у крамниці дропів (ключ = shopKey з каталогу, нижній регістр у мапі).
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import dropsShopOverrides from './dropsShopOverrides.json';

export interface DropsShieldPatch {
  /** Підпис у списку / модалці (англ. назва L2). */
  nameUk: string;
  pDef: number;
  /** Шанс блоку щитом, %. */
  shieldRatePercent: number;
  shieldDef: number;
  weight?: number;
}

function pathKey(segment: string): string {
  return segment.replace(/\\/g, '/').toLowerCase();
}

const RAW: Array<[string, DropsShieldPatch]> = [
  [
    'arrom_ng/shield_leather_shield_i00_0.jpg',
    {
      nameUk: 'Leather Shield',
      pDef: 20,
      shieldRatePercent: 20,
      shieldDef: 11,
      weight: 440,
    },
  ],
  [
    'arrom_d/shield_bronze_shield_i00_0.jpg',
    {
      nameUk: 'Bronze Shield',
      pDef: 33,
      shieldRatePercent: 20,
      shieldDef: 18,
    },
  ],
  [
    'arrom_d/shield_hoplon_i00_0.jpg',
    {
      nameUk: 'Hoplon',
      pDef: 38,
      shieldRatePercent: 20,
      shieldDef: 20,
    },
  ],
  [
    'arrom_d/shield_plate_shield_i00_0.jpg',
    {
      nameUk: 'Plate Shield',
      pDef: 44,
      shieldRatePercent: 20,
      shieldDef: 23,
    },
  ],
  [
    'arrom_c/shield_composite_shield_i00_0.jpg',
    {
      nameUk: 'Composite Shield',
      pDef: 52,
      shieldRatePercent: 20,
      shieldDef: 27,
    },
  ],
  [
    'arrom_c/shield_full_plate_shield_i00_0.jpg',
    {
      nameUk: 'Full Plate Shield',
      pDef: 60,
      shieldRatePercent: 20,
      shieldDef: 31,
    },
  ],
  [
    'arrom_b/shield_avadon_shield_i00_0.jpg',
    {
      nameUk: 'Avadon Shield',
      pDef: 70,
      shieldRatePercent: 20,
      shieldDef: 36,
    },
  ],
  [
    'arrom_b/shield_doom_shield_i00_0.jpg',
    {
      nameUk: 'Doom Shield',
      pDef: 76,
      shieldRatePercent: 20,
      shieldDef: 39,
    },
  ],
  [
    'arrom_b/shield_shield_of_pledge_i00_0.jpg',
    {
      nameUk: 'Shield of Pledge',
      pDef: 86,
      shieldRatePercent: 20,
      shieldDef: 44,
    },
  ],
  [
    'arrom_а/shield_dark_crystal_shield_i00_0.jpg',
    {
      nameUk: 'Dark Crystal Shield',
      pDef: 92,
      shieldRatePercent: 20,
      shieldDef: 47,
    },
  ],
  [
    'arrom_а/shield_shield_of_nightmare_i00_0.jpg',
    {
      nameUk: 'Shield of Nightmare',
      pDef: 98,
      shieldRatePercent: 20,
      shieldDef: 50,
    },
  ],
  [
    'arrom_s/imperial_crusader_shield.jpg',
    {
      nameUk: 'Imperial Crusader Shield',
      pDef: 110,
      shieldRatePercent: 20,
      shieldDef: 56,
    },
  ],
];

export const L2DOP_DROPS_SHIELD_BY_SHOP_KEY_LOWER: Readonly<
  Record<string, DropsShieldPatch>
> = RAW.reduce(
  (acc, [segment, patch]) => {
    acc[pathKey(segment)] = patch;
    return acc;
  },
  {} as Record<string, DropsShieldPatch>,
);

/** Пошук патча щита за назвою предмета (сумка / модалка). */
export const L2DOP_DROPS_SHIELD_BY_NAME_UK_LOWER: Readonly<
  Record<string, DropsShieldPatch>
> = RAW.reduce(
  (acc, [, patch]) => {
    acc[patch.nameUk.trim().toLowerCase()] = patch;
    return acc;
  },
  {} as Record<string, DropsShieldPatch>,
);

export function dropsShieldPatchByNameUk(
  nameUk: string | undefined | null,
): DropsShieldPatch | undefined {
  const key = String(nameUk ?? '').trim().toLowerCase();
  if (!key) return undefined;
  return L2DOP_DROPS_SHIELD_BY_NAME_UK_LOWER[key];
}

/** itemId → патч щита (shopKey з `dropsShopOverrides.json` + RAW). */
export const L2DOP_DROPS_SHIELD_BY_ITEM_ID: Readonly<
  Record<number, DropsShieldPatch>
> = (() => {
  const out: Record<number, DropsShieldPatch> = {};
  const overrides = dropsShopOverrides as Record<
    string,
    { itemId?: number }
  >;
  for (const [segment, patch] of RAW) {
    const segKey = pathKey(segment);
    for (const [ovKey, ov] of Object.entries(overrides)) {
      if (pathKey(ovKey) !== segKey) continue;
      const id =
        typeof ov.itemId === 'number' && Number.isFinite(ov.itemId)
          ? Math.floor(ov.itemId)
          : 0;
      if (id > 0) out[id] = patch;
    }
  }
  return out;
})();

/** Англ. назви для UA-підписів у `ITEM_CATALOG` (без циклічних імпортів). */
const SHIELD_ITEM_EN_NAME_FALLBACK: Readonly<Record<number, string>> = {
  18: 'Leather Shield',
};

/**
 * Патч щита для екіпу: спочатку itemId, потім nameUk, потім EN-fallback (id 18 тощо).
 */
export function dropsShieldPatchForEquipped(
  itemId: number,
  nameUk?: string | null
): DropsShieldPatch | undefined {
  const id = Math.floor(itemId);
  if (Number.isFinite(id) && id > 0) {
    const byId = L2DOP_DROPS_SHIELD_BY_ITEM_ID[id];
    if (byId) return byId;
  }
  const byName = dropsShieldPatchByNameUk(nameUk);
  if (byName) return byName;
  const en = SHIELD_ITEM_EN_NAME_FALLBACK[id];
  if (en) return dropsShieldPatchByNameUk(en);
  return undefined;
}

export function dropsShieldShopPreviewLines(
  patch: DropsShieldPatch,
): DropsShopStatLineUk[] {
  const lines: DropsShopStatLineUk[] = [
    { labelUk: 'P.Def', valueUk: String(patch.pDef) },
    {
      labelUk: 'Блок щитом',
      valueUk: `${patch.shieldRatePercent}%`,
    },
    { labelUk: 'Захист щита', valueUk: String(patch.shieldDef) },
  ];
  if (patch.weight != null) {
    lines.push({ labelUk: 'Вага', valueUk: String(patch.weight) });
  }
  return lines;
}
