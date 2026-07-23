import { addItemToBag, type InventoryState } from '../data/inventory.js';
import type { DropEntry } from '../types/combatDrop.js';
import { rollRaidBossKillReward } from '../data/l2dopRaidBossRewardPatches.js';
import { rollSevenSignsDungeonKillReward } from '../data/l2dopSevenSignsDungeonMobRewards.js';
import { hasCustomNpcDropBag } from '../data/npcDropsResolved.js';
import {
  ensureMobDropBag,
  rewardExpSpForSpawn,
  syntheticAdenaDropEntry,
} from './spawnSyntheticRewards.js';
import { dropDisplayNameShort } from '../utils/dropDisplayName.js';
import { viewerMaySeeSpoilLoot } from './dwarfSpoilerLootGate.js';
import type { Prisma } from '@prisma/client';
import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import {
  mobKillRewardMult,
} from './championMobRules.js';

function rollInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/** Ймовірність успіху: prefer chancePerMillion з дампу XML. */
function rollDropLine(d: DropEntry): number {
  const p =
    d.chancePerMillion != null ? d.chancePerMillion / 1_000_000 : d.chance;
  if (!Number.isFinite(p) || p <= 0) return 0;
  if (Math.random() >= p) return 0;
  return rollInt(Math.max(0, d.min), Math.max(d.min, d.max));
}

/** Контекст персонажа для правил спойлу при перемозі в бою. */
export interface KillLootCharacterContext {
  race: string;
  l2Profession: string;
  skillsLearnedJson?: Prisma.JsonValue | null;
}

export interface KillLootItemLine {
  l2ItemId: number;
  qty: number;
  spoil: boolean;
  label: string;
}

export interface KillLootResult {
  adena: bigint;
  expGain: bigint;
  spGain: number;
  inventory: InventoryState;
  logLines: string[];
  /** Для UI перемоги (іконки `/game/item-icon/`). */
  items: KillLootItemLine[];
}

export interface KillLootOptions {
  /** Тип спавна (чемпіон → ×10 EXP/SP/адена). */
  spawnKind?: MapSpawnKind;
  /** Ім'я моба зі спавна (бонус за таблицею mobNameRewardBonus). */
  mobName?: string;
  /** sdms_* — нагороди Seven Signs подземелля за dungeonId. */
  spawnId?: string;
}

/**
 * Нагорода за кілл: базова адена за рівнем (+ колишній fallback), EXP/SP з npc або формула.
 */
export function rollKillLoot(
  npcId: number | null,
  spawnLevel: number,
  inv: InventoryState,
  charCtx?: KillLootCharacterContext | null,
  opts?: KillLootOptions | null
): KillLootResult {
  let adena = BigInt(0);
  let next = inv;
  const itemLog: string[] = [];
  const adenaLog: string[] = [];
  const items: KillLootItemLine[] = [];

  const allowKillSpoil =
    charCtx != null &&
    viewerMaySeeSpoilLoot(charCtx.race, charCtx.l2Profession, charCtx.skillsLearnedJson ?? null);

  const rewardMult = mobKillRewardMult({
    spawnKind: opts?.spawnKind,
    mobName: opts?.mobName,
  });

  const bag = ensureMobDropBag(npcId, spawnLevel, opts?.spawnId);
  const customDropOnly = hasCustomNpcDropBag(npcId, opts?.spawnId);
  for (const d of bag.drops) {
    const qty = rollDropLine(d);
    if (qty <= 0) continue;
    if (d.kind === 'adena') {
      adena += BigInt(qty * rewardMult);
      adenaLog.push(`+${qty * rewardMult} аден`);
    } else if (d.l2ItemId) {
      next = addItemToBag(next, d.l2ItemId, qty);
      const label = dropDisplayNameShort(d.displayName ?? d.id, d.l2ItemId);
      itemLog.push(`+${qty}× ${label}`);
      items.push({ l2ItemId: d.l2ItemId, qty, spoil: false, label });
    }
  }

  if (allowKillSpoil && !customDropOnly) {
    for (const d of bag.spoil) {
      const qty = rollDropLine(d);
      if (qty <= 0) continue;
      if (d.kind === 'adena') {
        adena += BigInt(qty * rewardMult);
        adenaLog.push(`(спойл) +${qty * rewardMult} аден`);
      } else if (d.l2ItemId) {
        next = addItemToBag(next, d.l2ItemId, qty);
        const label = dropDisplayNameShort(d.displayName ?? d.id, d.l2ItemId);
        itemLog.push(`(спойл) +${qty}× ${label}`);
        items.push({ l2ItemId: d.l2ItemId, qty, spoil: true, label });
      }
    }
  }

  /** Якщо з рядків адени не випало — ще раз базова адена за рівнем (як у старій логіці). */
  if (adena === BigInt(0) && !customDropOnly) {
    const syn = syntheticAdenaDropEntry(spawnLevel);
    const qty = rollDropLine(syn);
    if (qty > 0) {
      const scaled = qty * rewardMult;
      adena += BigInt(scaled);
      adenaLog.push(`+${scaled} аден`);
    }
  }

  let expGain: bigint;
  let spGain: number;
  const sdKillReward =
    npcId != null
      ? rollSevenSignsDungeonKillReward(npcId, opts?.spawnId)
      : undefined;
  const rbKillReward =
    !sdKillReward && npcId != null ? rollRaidBossKillReward(npcId) : undefined;
  if (sdKillReward) {
    expGain = BigInt(sdKillReward.exp);
    spGain = sdKillReward.sp;
  } else if (rbKillReward) {
    expGain = BigInt(rbKillReward.exp);
    spGain = rbKillReward.sp;
  } else {
    const rw = rewardExpSpForSpawn(npcId, spawnLevel);
    expGain = BigInt(rw.exp * rewardMult);
    spGain = rw.sp * rewardMult;
  }

  const expSpLog: string[] = [];
  if (expGain > BigInt(0)) {
    expSpLog.push(`+${expGain.toString()} EXP`);
  }
  if (spGain > 0) {
    expSpLog.push(`+${spGain} SP`);
  }

  /** Лог: спочатку ресурси (предмети), потім EXP/SP, в кінці адена — як у зручному підсумку. */
  const log = [...itemLog, ...expSpLog, ...adenaLog];

  return { adena, expGain, spGain, inventory: next, logLines: log, items };
}
