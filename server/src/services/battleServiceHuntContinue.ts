import { prisma } from '../lib/prisma.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import type { CharacterRow } from './charService.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { findNextSameLevelHuntSpawn } from '../domain/battleHuntChain.js';
import { startBattle } from './battleServiceSession.js';

/**
 * «Полювати далі»: знайти найближчого моба того ж рівня поруч і одразу розпочати бій.
 * Пошук цілі — на момент запиту (актуальна позиція + mobSpawnHpJson).
 */
export async function startHuntContinueBattle(
  userId: string,
  expectedRevision: number,
  targetLevel: number,
  excludeSpawnId?: string,
  levelTolerance: number = 10
) {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) throw new Error('no_character');

  const base = resolveMapMovement(applyPassiveHpRegen(row as CharacterRow));
  const nowMs = Date.now();
  const tol = Math.max(0, Math.min(10, Math.floor(levelTolerance)));
  let excluded = excludeSpawnId;
  let lastErr: unknown = null;
  for (let i = 0; i < 10; i++) {
    const next = findNextSameLevelHuntSpawn({
      worldX: base.worldX,
      worldY: base.worldY,
      targetLevel: Math.max(1, Math.floor(targetLevel)),
      excludeSpawnId: excluded,
      mobSpawnHpJson: base.mobSpawnHpJson,
      nowMs,
      levelTolerance: tol,
    });
    if (!next) {
      throw new Error('battle_hunt_no_targets');
    }
    try {
      return await startBattle(userId, next.spawnId, expectedRevision);
    } catch (e) {
      lastErr = e;
      if (
        e instanceof Error &&
        (e.message === 'mob_on_respawn' ||
          e.message === 'battle_too_far' ||
          e.message === 'battle_spawn_unknown')
      ) {
        excluded = next.spawnId;
        continue;
      }
      throw e;
    }
  }
  if (lastErr instanceof Error && lastErr.message === 'mob_on_respawn') {
    throw new Error('battle_hunt_no_live_targets');
  }
  throw new Error('battle_hunt_no_targets');
}
