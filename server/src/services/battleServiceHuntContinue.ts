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
  excludeSpawnId?: string
) {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) throw new Error('no_character');

  const base = resolveMapMovement(applyPassiveHpRegen(row as CharacterRow));
  const nowMs = Date.now();
  const next = findNextSameLevelHuntSpawn({
    worldX: base.worldX,
    worldY: base.worldY,
    targetLevel: Math.max(1, Math.floor(targetLevel)),
    excludeSpawnId,
    mobSpawnHpJson: base.mobSpawnHpJson,
    nowMs,
  });
  if (!next) {
    throw new Error('battle_hunt_no_targets');
  }

  return startBattle(userId, next.spawnId, expectedRevision);
}
