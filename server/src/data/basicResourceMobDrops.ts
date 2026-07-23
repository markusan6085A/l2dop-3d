import type { DropEntry } from '../types/combatDrop.js';
import type { MapSpawnKind } from './mapWorldSpawns.js';
import { L2DOP_NPC_TYPE } from './l2dopNpcMeta.generated.js';
import {
  BASIC_RESOURCE_BY_CODE,
  BASIC_RESOURCE_CATALOG,
  isBasicResourcePieceItemId,
  type BasicResourceEntry,
} from './basicResourceCatalog.js';

export type BasicResourceTier = 1 | 2 | 3 | 4 | 5 | 6;

export interface BasicResourceDropOverlayContext {
  npcId: number | null;
  level: number;
  spawnId?: string | null;
  isRaidBoss?: boolean;
  isEpicBoss?: boolean;
  hasCustomDropBag?: boolean;
  spawnKind?: MapSpawnKind;
}

export interface BasicResourceTierRollSpec {
  normalChance: number;
  normalQty: { min: number; max: number };
  spoilChance: number;
  spoilQty: { min: number; max: number };
}

/** Основний drop pool за tier (code). */
const TIER_PRIMARY_POOL_CODES: Readonly<Record<BasicResourceTier, readonly string[]>> =
  {
    1: [
      'stem',
      'thread',
      'animal_bone',
      'animal_skin',
      'iron_ore',
      'coal',
      'charcoal',
      'varnish',
    ],
    2: [
      'stem',
      'thread',
      'animal_bone',
      'animal_skin',
      'iron_ore',
      'coal',
      'charcoal',
      'varnish',
      'suede',
      'silver_nugget',
    ],
    3: [
      'suede',
      'silver_nugget',
      'stone_of_purity',
      'mithril_ore',
      'weapon_piece',
      'armor_piece',
      'accessory_gemstone',
    ],
    4: [
      'stone_of_purity',
      'mithril_ore',
      'oriharukon_ore',
      'weapon_piece',
      'armor_piece',
      'accessory_gemstone',
    ],
    5: [
      'mithril_ore',
      'oriharukon_ore',
      'adamantite_nugget',
      'weapon_piece',
      'armor_piece',
      'accessory_gemstone',
    ],
    6: [
      'oriharukon_ore',
      'adamantite_nugget',
      'weapon_piece',
      'armor_piece',
      'accessory_gemstone',
    ],
  };

export const BASIC_RESOURCE_TIER_ROLL_SPEC: Readonly<
  Record<BasicResourceTier, BasicResourceTierRollSpec>
> = {
  1: {
    normalChance: 0.28,
    normalQty: { min: 1, max: 3 },
    spoilChance: 0.45,
    spoilQty: { min: 2, max: 5 },
  },
  2: {
    normalChance: 0.32,
    normalQty: { min: 1, max: 4 },
    spoilChance: 0.5,
    spoilQty: { min: 3, max: 7 },
  },
  3: {
    normalChance: 0.36,
    normalQty: { min: 2, max: 6 },
    spoilChance: 0.55,
    spoilQty: { min: 4, max: 10 },
  },
  4: {
    normalChance: 0.4,
    normalQty: { min: 3, max: 8 },
    spoilChance: 0.6,
    spoilQty: { min: 6, max: 14 },
  },
  5: {
    normalChance: 0.45,
    normalQty: { min: 4, max: 12 },
    spoilChance: 0.65,
    spoilQty: { min: 8, max: 20 },
  },
  6: {
    normalChance: 0.5,
    normalQty: { min: 6, max: 16 },
    spoilChance: 0.7,
    spoilQty: { min: 12, max: 28 },
  },
};

const PIECE_QTY_MULTIPLIER: Readonly<Partial<Record<BasicResourceTier, number>>> =
  {
    3: 3,
    4: 5,
    5: 8,
    6: 12,
  };

const EXCLUSIVE_NORMAL_GROUP = 'basic_resource_normal';
const EXCLUSIVE_SPOIL_GROUP = 'basic_resource_spoil';

const NON_COMBAT_NPC_TYPES = new Set([
  'L2Merchant',
  'L2Teleporter',
  'L2Guard',
  'L2Npc',
  'L2Warehouse',
  'L2SymbolMaker',
  'L2Trainer',
  'L2VillageMaster',
  'L2Auctioneer',
  'L2Doormen',
  'L2CastleDoormen',
  'L2CastleTeleporter',
  'L2CastleWarehouse',
  'L2ClanHallManager',
  'L2ClanHallDoormen',
  'L2OlympiadManager',
  'L2SignsPriest',
  'L2ManorManager',
  'L2Observation',
  'L2FestivalGuide',
  'L2FestivalMonster',
  'L2XmassTree',
  'L2ControlTower',
  'L2EffectPoint',
  'L2Pet',
  'L2BabyPet',
  'L2Summon',
  'L2Decoy',
  'L2Door',
  'L2FlameTower',
  'L2Mercenary',
  'L2NpcWalker',
  'L2RaceManager',
  'L2SepulcherNpc',
  'L2SepulcherMonster',
  'L2FortManager',
  'L2FortDoormen',
  'L2FortSiegeGuard',
  'L2FortEnvoy',
  'L2FortLogistics',
  'L2FortCommander',
  'L2FortSiegeNpc',
]);

const BLOCKED_SPAWN_KINDS = new Set<MapSpawnKind>([
  'raid',
  'epic',
  'epic_guard',
  'dungeon',
]);

export function basicResourceTierFromLevel(level: number): BasicResourceTier {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  if (lv <= 20) return 1;
  if (lv <= 35) return 2;
  if (lv <= 50) return 3;
  if (lv <= 60) return 4;
  if (lv <= 75) return 5;
  return 6;
}

function stableHash32(seed: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}

function codesForTier(tier: BasicResourceTier): readonly string[] {
  return TIER_PRIMARY_POOL_CODES[tier];
}

/** Детермінований pool: primary tier + частина нижчих tier для T2+. */
export function resolveStableBasicResourcePoolCodes(
  npcId: number | null,
  level: number,
  spawnId?: string | null,
): readonly string[] {
  const tier = basicResourceTierFromLevel(level);
  const primary = [...codesForTier(tier)];
  const pool = new Set(primary);

  if (tier > 1) {
    const seed = `${npcId ?? 0}|${level}|${spawnId ?? ''}`;
    const h = stableHash32(seed);
    for (let t = 1; t < tier; t++) {
      const lowerCodes = codesForTier(t as BasicResourceTier);
      const pickCount = Math.min(2, lowerCodes.length);
      for (let i = 0; i < pickCount; i++) {
        const idx = (h + i * 17 + t * 131) % lowerCodes.length;
        pool.add(lowerCodes[idx]!);
      }
    }
  }

  return [...pool].sort();
}

export function resolveStableBasicResourcePoolItemIds(
  npcId: number | null,
  level: number,
  spawnId?: string | null,
): number[] {
  return resolveStableBasicResourcePoolCodes(npcId, level, spawnId).map(
    (code) => BASIC_RESOURCE_BY_CODE.get(code)!.itemId,
  );
}

export function pieceQtyMultiplierForTier(
  tier: BasicResourceTier,
  itemId: number,
): number {
  if (!isBasicResourcePieceItemId(itemId)) return 1;
  return PIECE_QTY_MULTIPLIER[tier] ?? 1;
}

function scaledQtyRange(
  tier: BasicResourceTier,
  itemId: number,
  range: { min: number; max: number },
): { min: number; max: number } {
  const mult = pieceQtyMultiplierForTier(tier, itemId);
  if (mult === 1) return { min: range.min, max: range.max };
  return {
    min: range.min * mult,
    max: range.max * mult,
  };
}

function dropEntryForResource(
  ctxKey: string,
  mode: 'normal' | 'spoil',
  row: BasicResourceEntry,
  tier: BasicResourceTier,
  spec: BasicResourceTierRollSpec,
  poolSize: number,
): DropEntry {
  const masterChance =
    mode === 'normal' ? spec.normalChance : spec.spoilChance;
  const perItemChance = masterChance / Math.max(1, poolSize);
  const qtyBase = mode === 'normal' ? spec.normalQty : spec.spoilQty;
  const qty = scaledQtyRange(tier, row.itemId, qtyBase);
  const group =
    mode === 'normal' ? EXCLUSIVE_NORMAL_GROUP : EXCLUSIVE_SPOIL_GROUP;

  return {
    id: `basic_res_${mode}_${ctxKey}_${row.code}`,
    kind: 'resource',
    chance: perItemChance,
    min: qty.min,
    max: qty.max,
    l2ItemId: row.itemId,
    displayName: row.nameEn,
    iconUrl: row.iconUrl,
    exclusiveGroup: group,
  };
}

export function shouldApplyBasicResourceDropOverlay(
  ctx: BasicResourceDropOverlayContext,
): boolean {
  if (ctx.hasCustomDropBag) return false;
  if (ctx.isRaidBoss || ctx.isEpicBoss) return false;
  if (ctx.spawnKind != null && BLOCKED_SPAWN_KINDS.has(ctx.spawnKind)) {
    return false;
  }
  if (ctx.npcId != null) {
    const npcType = L2DOP_NPC_TYPE[ctx.npcId];
    if (npcType != null) {
      if (npcType !== 'L2Monster') return false;
      if (NON_COMBAT_NPC_TYPES.has(npcType)) return false;
    }
  }
  return true;
}

export interface BasicResourceDropOverlay {
  drops: DropEntry[];
  spoil: DropEntry[];
}

/**
 * Детермінований overlay basic resources для звичайних мобів.
 * Доповнює існуючу сумку, не замінює adena/equipment/spoil.
 */
export function buildBasicResourceDropOverlay(
  ctx: BasicResourceDropOverlayContext,
): BasicResourceDropOverlay {
  if (!shouldApplyBasicResourceDropOverlay(ctx)) {
    return { drops: [], spoil: [] };
  }

  const tier = basicResourceTierFromLevel(ctx.level);
  const spec = BASIC_RESOURCE_TIER_ROLL_SPEC[tier];
  const poolCodes = resolveStableBasicResourcePoolCodes(
    ctx.npcId,
    ctx.level,
    ctx.spawnId,
  );
  const ctxKey = `${ctx.npcId ?? 0}_${ctx.level}_${ctx.spawnId ?? 'world'}`;
  const poolSize = poolCodes.length;

  const drops: DropEntry[] = [];
  const spoil: DropEntry[] = [];

  for (const code of poolCodes) {
    const row = BASIC_RESOURCE_BY_CODE.get(code);
    if (!row) continue;
    drops.push(
      dropEntryForResource(ctxKey, 'normal', row, tier, spec, poolSize),
    );
    spoil.push(
      dropEntryForResource(ctxKey, 'spoil', row, tier, spec, poolSize),
    );
  }

  return { drops, spoil };
}

/** Для тестів / звіту — усі codes каталогу. */
export function listAllBasicResourceCodes(): string[] {
  return BASIC_RESOURCE_CATALOG.map((row) => row.code);
}

export {
  EXCLUSIVE_NORMAL_GROUP as BASIC_RESOURCE_EXCLUSIVE_NORMAL_GROUP,
  EXCLUSIVE_SPOIL_GROUP as BASIC_RESOURCE_EXCLUSIVE_SPOIL_GROUP,
};
