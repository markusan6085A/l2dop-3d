/**
 * D-grade weapon key materials (етап 3B) — канонічний каталог.
 */

export interface DGradeWeaponKeyMaterialEntry {
  itemId: number;
  code: string;
  nameEn: string;
  nameUk: string;
  iconPath: string;
  category: 'material';
  materialType: 'weapon_key_material';
  grade: 'D';
  stackable: true;
  tradable: true;
  droppable: true;
  sellable: true;
  equipable: false;
  inventoryTab: 'resource';
}

const ICON_BASE = '/icons/key_materials/d_grade/weapons';

export const D_GRADE_WEAPON_KEY_MATERIAL_CATALOG: readonly DGradeWeaponKeyMaterialEntry[] = [
  {
    itemId: 4113,
    code: 'bonebreaker_head',
    nameEn: 'Bonebreaker Head',
    nameUk: 'Головка Костолома',
    iconPath: `${ICON_BASE}/bonebreaker_head.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
  {
    itemId: 4114,
    code: 'claymore_blade',
    nameEn: 'Claymore Blade',
    nameUk: 'Лезо Клеймора',
    iconPath: `${ICON_BASE}/claymore_blade.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
  {
    itemId: 4116,
    code: 'elven_long_sword_blade',
    nameEn: 'Elven Long Sword Blade',
    nameUk: 'Лезо довгого меча ельфів',
    iconPath: `${ICON_BASE}/elven_long_sword_blade.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
  {
    itemId: 4117,
    code: 'glaive_edge',
    nameEn: 'Glaive Edge',
    nameUk: 'Вістря Глефи',
    iconPath: `${ICON_BASE}/glaive_edge.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
  {
    itemId: 4118,
    code: 'light_crossbow_shaft',
    nameEn: 'Light Crossbow Shaft',
    nameUk: 'Основа легкого арбалета',
    iconPath: `${ICON_BASE}/light_crossbow_shaft.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
  {
    itemId: 4119,
    code: 'mithril_dagger_blade',
    nameEn: 'Mithril Dagger Blade',
    nameUk: 'Лезо міфрилового кинджала',
    iconPath: `${ICON_BASE}/mithril_dagger_blade.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
  {
    itemId: 4120,
    code: 'scallop_jamadhr_edge',
    nameEn: 'Scallop Jamadhr Edge',
    nameUk: 'Вістря Scallop Jamadhr',
    iconPath: `${ICON_BASE}/scallop_jamadhr_edge.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
  {
    itemId: 4121,
    code: 'staff_of_life_shaft',
    nameEn: 'Staff of Life Shaft',
    nameUk: 'Основа Посоха життя',
    iconPath: `${ICON_BASE}/staff_of_life_shaft.png`,
    category: 'material',
    materialType: 'weapon_key_material',
    grade: 'D',
    stackable: true,
    tradable: true,
    droppable: true,
    sellable: true,
    equipable: false,
    inventoryTab: 'resource',
  },
] as const;

export const D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS: readonly number[] =
  D_GRADE_WEAPON_KEY_MATERIAL_CATALOG.map((row) => row.itemId);

export const D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID = new Map<
  number,
  DGradeWeaponKeyMaterialEntry
>(D_GRADE_WEAPON_KEY_MATERIAL_CATALOG.map((row) => [row.itemId, row]));

export const D_GRADE_WEAPON_KEY_MATERIAL_BY_CODE = new Map<
  string,
  DGradeWeaponKeyMaterialEntry
>(D_GRADE_WEAPON_KEY_MATERIAL_CATALOG.map((row) => [row.code, row]));

export function isDGradeWeaponKeyMaterialItemId(itemId: number): boolean {
  return D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.has(Math.floor(Number(itemId) || 0));
}
