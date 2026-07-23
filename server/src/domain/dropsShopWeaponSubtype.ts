/**
 * Вкладки фільтра зброї в магазині дропів (за типом зброї / «магія»).
 */
import type {
  DropsShopCatalogRow,
  DropsShopGradeUk,
} from '../data/dropsShopCatalog.generated.js';
import type { ItemMeta } from '../data/itemsCatalog.js';
import { L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopAWeaponDropsPatches.js';
import { L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopBWeaponDropsPatches.js';
import { L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopCWeaponDropsPatches.js';
import { L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopDWeaponDropsPatches.js';
import { L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopNgWeaponDropsPatches.js';
import { L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopSWeaponDropsPatches.js';
import type { WeaponKindForEnchant } from '../data/l2dopEnchant.js';
import { lookupCanonWeaponSubtypeFromDisplayLabel } from './dropsShopWeaponSubtypeCanonLookup.js';

export type DropsShopWeaponSubtype =
  | 'sword'
  | 'bigsword'
  | 'dagger'
  | 'bow'
  | 'blunt'
  | 'bigblunt'
  | 'pole'
  | 'fist'
  | 'dual'
  | 'magic';

export const DROPS_SHOP_WEAPON_SUBTYPE_ORDER = [
  'sword',
  'bigsword',
  'dagger',
  'bow',
  'blunt',
  'bigblunt',
  'pole',
  'fist',
  'dual',
  'magic',
] as const satisfies readonly DropsShopWeaponSubtype[];

function gradeWeaponPatch(
  grade: DropsShopGradeUk,
  keyNorm: string,
): unknown {
  switch (grade) {
    case 'NG':
      return L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
    case 'D':
      return L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
    case 'C':
      return L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
    case 'B':
      return L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
    case 'A':
      return L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
    case 'S':
      return L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
    default:
      return undefined;
  }
}

function patchIsMagic(p: unknown): boolean {
  return (
    !!p &&
    typeof p === 'object' &&
    'mode' in p &&
    (p as { mode?: string }).mode === 'magic'
  );
}

function catalogLooksMagicMelee(meta: ItemMeta): boolean {
  const ma = meta.mAtk != null ? Number(meta.mAtk) : NaN;
  const pa = meta.pAtk != null ? Number(meta.pAtk) : NaN;
  if (!Number.isFinite(ma)) return false;
  if (!Number.isFinite(pa) || pa === 0) return true;
  if (meta.weaponType === 'bigblunt' && ma >= pa) return true;
  return ma >= pa + 10;
}

function mapWeaponKindToSubtype(
  wt?: WeaponKindForEnchant,
): DropsShopWeaponSubtype {
  switch (wt) {
    case 'dual':
      return 'dual';
    case 'sword':
      return 'sword';
    case 'bigsword':
      return 'bigsword';
    case 'dagger':
      return 'dagger';
    case 'bow':
      return 'bow';
    case 'blunt':
      return 'blunt';
    case 'bigblunt':
      return 'bigblunt';
    case 'pole':
      return 'pole';
    case 'fist':
      return 'fist';
    default:
      return 'sword';
  }
}

/**
 * Якщо рядок — не зброя, повертає `undefined`.
 * `@param catalogMeta` — `ITEM_CATALOG[itemId або preview]` для відомого id зброї.
 * `@param displayLabelUk` — підпис у списку (патч / override), інакше fallback на каталог.
 */
export function resolveDropsShopWeaponSubtype(
  row: DropsShopCatalogRow,
  keyNorm: string,
  catalogMeta?: ItemMeta,
  displayLabelUk?: string,
): DropsShopWeaponSubtype | undefined {
  if (row.category !== 'weapon') return undefined;

  if (keyNorm.includes('dualsword')) return 'dual';

  const label = String(displayLabelUk || row.nameUk || '').trim();
  const fromCanon = lookupCanonWeaponSubtypeFromDisplayLabel(label);
  if (fromCanon) return fromCanon;

  const patch = gradeWeaponPatch(row.grade, keyNorm);
  if (patchIsMagic(patch)) return 'magic';

  if (
    catalogMeta &&
    catalogLooksMagicMelee(catalogMeta) &&
    catalogMeta.slot === 'rhand'
  )
    return 'magic';

  if (catalogMeta?.weaponType)
    return mapWeaponKindToSubtype(catalogMeta.weaponType);

  return 'sword';
}
