import { prisma } from '../lib/prisma.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import {
  GameConflictError,
  type CharacterRow,
} from './charService.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import {
  HUNT_LEVEL_TOLERANCE,
  listHuntCandidatesOrdered,
} from '../domain/battleHuntChain.js';
import { getEffectiveCharacterLevel } from '../domain/effectiveCharacterLevel.js';
import { startBattleInTx } from './battleServiceSession.js';

const HUNT_START_RETRYABLE = new Set([
  'mob_on_respawn',
  'battle_too_far',
  'battle_spawn_unknown',
]);

/**
 * «Полювати далі»: знайти найближчого моба рівня персонажа ± tolerance поруч і одразу розпочати бій.
 * Пошук і старт — в одній транзакції (той самий snapshot mobSpawnHpJson).
 */
export async function startHuntContinueBattle(
  userId: string,
  expectedRevision: number,
  excludeSpawnId?: string,
  levelTolerance?: number,
  preferredSpawnId?: string
) {
  const tol = Math.max(
    0,
    Math.min(10, Math.floor(levelTolerance ?? HUNT_LEVEL_TOLERANCE))
  );

  return prisma.$transaction(async (tx) => {
    const row = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!row) throw new Error('no_character');

    const base = resolveMapMovement(applyPassiveHpRegen(row as CharacterRow));
    const nowMs = Date.now();
    const playerLevel = getEffectiveCharacterLevel(base.exp);
    const candidates = listHuntCandidatesOrdered({
      worldX: base.worldX,
      worldY: base.worldY,
      targetLevel: playerLevel,
      excludeSpawnId,
      preferredSpawnId,
      mobSpawnHpJson: base.mobSpawnHpJson,
      nowMs,
      levelTolerance: tol,
    });

    if (candidates.length === 0) {
      throw new Error('battle_hunt_no_targets');
    }

    let lastRetryable: string | null = null;
    for (const cand of candidates) {
      try {
        return await startBattleInTx(
          tx,
          userId,
          cand.spawnId,
          expectedRevision
        );
      } catch (e) {
        if (e instanceof GameConflictError) throw e;
        if (
          e instanceof Error &&
          HUNT_START_RETRYABLE.has(e.message)
        ) {
          lastRetryable = e.message;
          continue;
        }
        throw e;
      }
    }

    if (lastRetryable === 'mob_on_respawn') {
      throw new Error('battle_hunt_no_live_targets');
    }
    throw new Error('battle_hunt_no_targets');
  });
}
