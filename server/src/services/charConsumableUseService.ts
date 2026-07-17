/**
import { gameConflictFromMutation } from './charConflict.js';
 * Використання HP/MP зілля з сумки поза боєм (миттєве відновлення).
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  countBagQty,
  parseInventory,
  removeBagQty,
  type InventoryState,
} from '../data/inventory.js';
import { getPotionRestoreProfile } from '../domain/battleCombatPotions.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
  type WorldCombatState,
} from '../domain/worldCombatState.js';
import { gameConflictFromMutation } from './charConflict.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import {
  combatOptsFromRow,
  toSnapshot,
} from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { computeCharacterVitalsBundle } from './characterClanHallVitals.js';
import { resolveClanHallPassiveBonus } from '../domain/clanHall.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

const WORLD_TTL_MS = 30 * 60 * 1000;

function normalizeRow(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function computeVitalCaps(row: CharacterRow, inv: InventoryState, nowMs: number) {
  const effLv = levelFromTotalExp(row.exp);
  const combat = computeCombatStats(
    effLv,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row)
  );
  const vit = computeVitals(
    effLv,
    row.race,
    row.classBranch,
    combat.con,
    combat.men
  );
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const worldTicked = tickWorldCombatState(
    parseWorldCombatState(row.worldCombatStateJson),
    maxMp,
    nowMs,
    combat.regenMp
  );
  const vitalsCaps = computeCharacterVitalsBundle({
    row,
    clanHallBonus: resolveClanHallPassiveBonus(row.clan ?? null),
    worldBattleMods: worldTicked?.battleMods,
  });
  const maxHp = vitalsCaps.maxHpChain.maxHpWithClanHall;
  return { maxHp, maxMp, regenMp: combat.regenMp, worldTicked };
}

function currentMpFromWorld(
  row: CharacterRow,
  maxMp: number,
  regenMp: number,
  nowMs: number
): number {
  const world = tickWorldCombatState(
    parseWorldCombatState(row.worldCombatStateJson),
    maxMp,
    nowMs,
    regenMp
  );
  if (world != null) {
    return Math.min(maxMp, Math.max(0, Math.floor(world.playerMp)));
  }
  return maxMp;
}

function buildWorldAfterMp(
  mpAfter: number,
  nowMs: number,
  parsed: WorldCombatState | null
): Prisma.JsonValue {
  const battleMods =
    parsed?.battleMods && typeof parsed.battleMods === 'object'
      ? parsed.battleMods
      : {};
  const next: Record<string, unknown> = {
    battleMods,
    playerMp: Math.max(0, Math.floor(mpAfter)),
    lastTickAt: nowMs,
    expiresAt:
      parsed != null && typeof parsed.expiresAt === 'number'
        ? parsed.expiresAt
        : nowMs + WORLD_TTL_MS,
  };
  if (parsed?.battleModsExpiresAtMsBySkillId) {
    next.battleModsExpiresAtMsBySkillId = parsed.battleModsExpiresAtMsBySkillId;
  }
  if (parsed?.sonicCharges != null) {
    next.sonicCharges = parsed.sonicCharges;
  }
  if (parsed?.maxSonicCharges != null) {
    next.maxSonicCharges = parsed.maxSonicCharges;
  }
  return next as unknown as Prisma.JsonValue;
}

export async function applyUsePotionFromBag(
  userId: string,
  itemId: number,
  expectedRevision: number,
  quantity: number
): Promise<CharacterSnapshot> {
  const id = Math.floor(itemId);
  const profile = getPotionRestoreProfile(id);
  if (!profile) {
    throw new Error('bad_potion');
  }
  const qty = Math.max(1, Math.min(999, Math.floor(quantity)));
  const nowMs = Date.now();

  return prisma.$transaction(async (tx) => {
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
        const base = normalizeRow(current as CharacterRow);
        if (parseBattleJson(base.battleJson)) {
          throw new Error('in_battle');
        }
        const inv = parseInventory(base.inventoryJson);
        const have = countBagQty(inv, id);
        if (have < qty) {
          throw new Error('not_in_bag');
        }
        const { maxHp, maxMp, regenMp } = computeVitalCaps(base, inv, nowMs);
        const nextInv = removeBagQty(inv, id, qty);
        const restoreTotal = profile.total * qty;
        let nextHp = base.hp;
        let nextWorldJson = base.worldCombatStateJson;

        if (profile.channel === 'hp') {
          nextHp = Math.min(maxHp, Math.max(0, Math.floor(base.hp + restoreTotal)));
        } else {
          const curMp = currentMpFromWorld(base, maxMp, regenMp, nowMs);
          const nextMp = Math.min(maxMp, Math.max(0, curMp + restoreTotal));
          const parsed = tickWorldCombatState(
            parseWorldCombatState(base.worldCombatStateJson),
            maxMp,
            nowMs,
            regenMp
          );
          nextWorldJson = buildWorldAfterMp(nextMp, nowMs, parsed);
        }

        const changed =
          nextHp !== base.hp ||
          JSON.stringify(nextInv) !== JSON.stringify(inv) ||
          JSON.stringify(nextWorldJson) !== JSON.stringify(base.worldCombatStateJson);
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: nextHp,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
            worldCombatStateJson: nextWorldJson as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
