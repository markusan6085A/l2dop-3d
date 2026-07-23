/**
 * Raid Boss 20–25 drop bags для D-grade weapon key materials.
 */
import type { DropEntry } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID,
  D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS,
} from './dGradeWeaponKeyMaterialsCatalog.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES,
  type DGradeWeaponKeyMaterialRaidSource,
} from './dGradeWeaponKeyMaterialMobDropCatalog.js';
import {
  RB_LV20_25_BOSSES,
  isRaidBossLv20_25NpcId,
} from './l2dopRaidBossLv20_25Catalog.js';

/** РБ 20–25 без key material drop (лише EXP/SP). */
export const RB_LV20_25_EXP_ONLY_NPC_ID = 25149;

function sourceKey(source: DGradeWeaponKeyMaterialRaidSource): string {
  return `${source.raidBossId}:${source.itemId}:${source.sourceType}`;
}

function raidKeyMaterialDropEntry(source: DGradeWeaponKeyMaterialRaidSource): DropEntry {
  const item = D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(source.itemId);
  if (!item) {
    throw new Error(`missing key material item ${source.itemId}`);
  }
  return {
    id: `d_wpn_key_raid_${source.raidBossId}_${source.itemId}`,
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
  const rbByNpcId = new Map(RB_LV20_25_BOSSES.map((b) => [b.npcId, b]));

  for (const source of D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES) {
    const key = sourceKey(source);
    if (seen.has(key)) {
      throw new Error(`duplicate d-grade key material raid source: ${key}`);
    }
    seen.add(key);

    if (!D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.has(source.itemId)) {
      throw new Error(`unknown key material itemId ${source.itemId} in raid catalog`);
    }
    if (!D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS.includes(source.itemId)) {
      throw new Error(`itemId ${source.itemId} not in key material allowlist`);
    }
    if (!isRaidBossLv20_25NpcId(source.raidBossId)) {
      throw new Error(`raidBossId ${source.raidBossId} not in RB 20–25 catalog`);
    }
    const rb = rbByNpcId.get(source.raidBossId);
    if (!rb) {
      throw new Error(`raidBossId ${source.raidBossId} missing from RB catalog`);
    }
    if (rb.level !== source.level) {
      throw new Error(
        `RB ${source.raidBossId} level mismatch: catalog ${source.level} vs RB ${rb.level}`,
      );
    }
    if (source.minCount !== 1 || source.maxCount !== 2) {
      throw new Error(`raid drop qty must be 1–2 for ${key}`);
    }
    const expectedChance = source.level <= 21 ? 0.11 : 0.13;
    if (source.chance !== expectedChance) {
      throw new Error(`raid chance ${source.chance} != ${expectedChance} for ${key}`);
    }
  }

  if (RB_LV20_25_EXP_ONLY_NPC_ID !== 25149) {
    throw new Error('RB_LV20_25_EXP_ONLY_NPC_ID must stay 25149 (Krool)');
  }
}

validateCatalogAtLoad();

const RAID_DROP_BAG_BY_NPC_ID = new Map<number, NpcDropBag>();

for (const source of D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES) {
  if (RAID_DROP_BAG_BY_NPC_ID.has(source.raidBossId)) {
    throw new Error(`multiple raid key material lines for RB ${source.raidBossId}`);
  }
  RAID_DROP_BAG_BY_NPC_ID.set(source.raidBossId, {
    drops: [raidKeyMaterialDropEntry(source)],
    spoil: [],
  });
}

export const RB_LV20_25_KEY_MATERIAL_DROP_BAG_BY_NPC_ID: Readonly<
  Record<number, NpcDropBag>
> = Object.fromEntries(RAID_DROP_BAG_BY_NPC_ID);

export function dGradeWeaponKeyMaterialRaidDropBagForNpc(
  npcId: number | null | undefined,
): NpcDropBag | undefined {
  if (npcId == null) return undefined;
  return RAID_DROP_BAG_BY_NPC_ID.get(Math.floor(npcId));
}

export function findDGradeWeaponKeyMaterialRaidSource(
  raidBossId: number,
): DGradeWeaponKeyMaterialRaidSource | undefined {
  return D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES.find(
    (s) => s.raidBossId === raidBossId,
  );
}
