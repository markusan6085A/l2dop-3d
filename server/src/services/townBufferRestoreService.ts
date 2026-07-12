import { Prisma } from '@prisma/client';
import { gameConflictFromMutation } from './charConflict.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { parseInventory } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
  type WorldCombatState,
} from '../domain/worldCombatState.js';
import { prisma } from '../lib/prisma.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  combatOptsFromRow,
  effectiveMaxHpWithBattleRoar,
  toSnapshot,
} from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { resolveMapMovement } from '../domain/mapMovement.js';

const TOWN_RESTORE_FREE_MAX_LEVEL = 40;
const TOWN_RESTORE_FEE_ADENA = 140000n;
const WORLD_TTL_MS = 30 * 60 * 1000;

export interface TownRestoreResult {
  character: CharacterSnapshot;
  feeAdena: string;
}

function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
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

/** Повне відновлення HP/MP/CP у міському бафері (CP у snapshot = maxCp). */
export async function applyTownRestoreVitals(
  userId: string,
  expectedRevision: number
): Promise<TownRestoreResult> {
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
        const base = normalizePassiveAndMove(current as CharacterRow);
        if (parseBattleJson(base.battleJson)) {
          throw new Error('in_battle');
        }

        const level = levelFromTotalExp(base.exp);
        const fee =
          level <= TOWN_RESTORE_FREE_MAX_LEVEL ? 0n : TOWN_RESTORE_FEE_ADENA;
        if (fee > 0n && base.adena < fee) {
          throw new Error('town_restore_not_enough_adena');
        }

        const inv = parseInventory(base.inventoryJson);
        const combat = computeCombatStats(
          level,
          base.race,
          base.classBranch,
          inv,
          combatOptsFromRow(base)
        );
        const vit = computeVitals(
          level,
          base.race,
          base.classBranch,
          combat.con,
          combat.men
        );
        const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
        const worldTicked = tickWorldCombatState(
          parseWorldCombatState(base.worldCombatStateJson),
          maxMp,
          nowMs,
          combat.regenMp
        );
        const maxHpBase = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
        const maxHp = effectiveMaxHpWithBattleRoar(
          base,
          maxHpBase,
          worldTicked?.battleMods
        );
        const nextHp = maxHp;
        const nextWorldJson = buildWorldAfterMp(maxMp, nowMs, worldTicked);

        const curMp =
          worldTicked != null
            ? Math.min(maxMp, Math.max(0, Math.floor(worldTicked.playerMp)))
            : maxMp;
        const alreadyFull = base.hp >= maxHp && curMp >= maxMp;
        if (alreadyFull && fee === 0n) {
          return { changed: false };
        }
        if (alreadyFull && fee > 0n) {
          throw new Error('town_restore_already_full');
        }

        const changed =
          base.hp !== nextHp ||
          JSON.stringify(base.worldCombatStateJson ?? null) !==
            JSON.stringify(nextWorldJson) ||
          fee > 0n;
        if (!changed) {
          return { changed: false };
        }

        return {
          changed: true,
          data: {
            hp: nextHp,
            worldCombatStateJson:
              nextWorldJson as unknown as Prisma.InputJsonValue,
            ...(fee > 0n ? { adena: { decrement: fee } } : {}),
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    const nextRow = result.character as CharacterRow;
    const fee =
      levelFromTotalExp(nextRow.exp) <= TOWN_RESTORE_FREE_MAX_LEVEL
        ? 0n
        : TOWN_RESTORE_FEE_ADENA;
    return {
      character: toSnapshot(nextRow),
      feeAdena: String(fee),
    };
  });
}
