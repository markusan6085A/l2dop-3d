import { Prisma } from '@prisma/client';
import { gameConflictFromMutation } from './charConflict.js';
import {
  computeCombatStats,
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
import { combatOptsFromRow } from './charSnapshotLogic.js';
import { buildMutationCharacterSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { computeCharacterVitalsBundle } from './characterClanHallVitals.js';
import { resolveClanHallPassiveBonus } from '../domain/clanHall.js';
import { resolveMapMovement } from '../domain/mapMovement.js';

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

  const nextRow = await prisma.$transaction(async (tx) => {
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
        const vitalsCaps = computeCharacterVitalsBundle({
          row: base,
          clanHallBonus: resolveClanHallPassiveBonus(base.clan ?? null),
          worldBattleMods: worldTicked?.battleMods,
        });
        const maxHp = vitalsCaps.maxHpChain.maxHpWithClanHall;
        const nextHp = maxHp;
        const nextWorldJson = buildWorldAfterMp(maxMp, nowMs, worldTicked);

        const curMp =
          worldTicked != null
            ? Math.min(maxMp, Math.max(0, Math.floor(worldTicked.playerMp)))
            : maxMp;
        const alreadyFull = base.hp >= maxHp && curMp >= maxMp;
        if (alreadyFull) {
          return { changed: false };
        }

        const changed =
          base.hp !== nextHp ||
          JSON.stringify(base.worldCombatStateJson ?? null) !==
            JSON.stringify(nextWorldJson);
        if (!changed) {
          return { changed: false };
        }

        return {
          changed: true,
          data: {
            hp: nextHp,
            worldCombatStateJson:
              nextWorldJson as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });

  return {
    character: await buildMutationCharacterSnapshot(nextRow, userId),
    feeAdena: '0',
  };
}
