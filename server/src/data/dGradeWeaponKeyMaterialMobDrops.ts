/**
 * Overlay drop/spoil для D-grade weapon key materials на field mobs.
 */
import type { DropEntry } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID,
  D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS,
} from './dGradeWeaponKeyMaterialsCatalog.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES,
  type DGradeWeaponKeyMaterialMobSource,
} from './dGradeWeaponKeyMaterialMobDropCatalog.js';
import { L2DOP_NPC_LEVEL } from './l2dopNpcMeta.generated.js';

function sourceKey(source: DGradeWeaponKeyMaterialMobSource): string {
  return `${source.npcId}:${source.itemId}:${source.sourceType}`;
}

function keyMaterialDropEntry(source: DGradeWeaponKeyMaterialMobSource): DropEntry {
  const item = D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(source.itemId);
  if (!item) {
    throw new Error(`missing key material item ${source.itemId}`);
  }
  return {
    id: `d_wpn_key_${source.sourceType}_${source.npcId}_${source.itemId}`,
    kind: 'other',
    chance: source.chance,
    min: source.minCount,
    max: source.maxCount,
    l2ItemId: source.itemId,
    displayName: item.nameUk,
    iconUrl: item.iconPath,
  };
}

function validateCatalogAtLoad(): void {
  const seen = new Set<string>();
  for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
    const key = sourceKey(source);
    if (seen.has(key)) {
      throw new Error(`duplicate d-grade key material mob source: ${key}`);
    }
    seen.add(key);
    if (!D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.has(source.itemId)) {
      throw new Error(`unknown key material itemId ${source.itemId} in mob drop catalog`);
    }
    if (!D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS.includes(source.itemId)) {
      throw new Error(`itemId ${source.itemId} not in key material allowlist`);
    }
    if (L2DOP_NPC_LEVEL[source.npcId] == null) {
      throw new Error(`npcId ${source.npcId} missing from l2dopNpcMeta`);
    }
    if (source.sourceType === 'normal_drop' && source.chance !== 0.01) {
      throw new Error(`normal drop chance must be 0.01 for ${key}`);
    }
    if (source.sourceType === 'spoil' && source.chance !== 0.08) {
      throw new Error(`spoil chance must be 0.08 for ${key}`);
    }
    if (source.minCount !== 1 || source.maxCount !== 1) {
      throw new Error(`field mob qty must be 1 for ${key}`);
    }
  }
}

validateCatalogAtLoad();

const OVERLAY_BY_NPC_ID = new Map<number, NpcDropBag>();

for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
  let bag = OVERLAY_BY_NPC_ID.get(source.npcId);
  if (!bag) {
    bag = { drops: [], spoil: [] };
    OVERLAY_BY_NPC_ID.set(source.npcId, bag);
  }
  const entry = keyMaterialDropEntry(source);
  if (source.sourceType === 'normal_drop') {
    bag.drops.push(entry);
  } else {
    bag.spoil.push(entry);
  }
}

export function dGradeWeaponKeyMaterialOverlayForNpc(
  npcId: number | null | undefined,
): NpcDropBag | null {
  if (npcId == null) return null;
  const bag = OVERLAY_BY_NPC_ID.get(Math.floor(npcId));
  if (!bag) return null;
  if (bag.drops.length === 0 && bag.spoil.length === 0) return null;
  return bag;
}

export function hasDGradeWeaponKeyMaterialMobDrop(
  npcId: number | null | undefined,
): boolean {
  return dGradeWeaponKeyMaterialOverlayForNpc(npcId) != null;
}

export function listDGradeWeaponKeyMaterialSourcesForNpc(
  npcId: number,
): readonly DGradeWeaponKeyMaterialMobSource[] {
  return D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES.filter((s) => s.npcId === npcId);
}

export function findDGradeWeaponKeyMaterialSource(
  npcId: number,
  itemId: number,
  sourceType: 'normal_drop' | 'spoil',
): DGradeWeaponKeyMaterialMobSource | undefined {
  return D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES.find(
    (s) => s.npcId === npcId && s.itemId === itemId && s.sourceType === sourceType,
  );
}

export function mergeDGradeWeaponKeyMaterialDropOverlay(
  bag: NpcDropBag,
  npcId: number | null,
): NpcDropBag {
  const overlay = dGradeWeaponKeyMaterialOverlayForNpc(npcId);
  if (!overlay) return bag;
  return {
    ...bag,
    drops: [...bag.drops, ...overlay.drops],
    spoil: [...bag.spoil, ...overlay.spoil],
  };
}
