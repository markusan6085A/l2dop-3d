import type { Prisma } from '@prisma/client';
import { isRegularMobRespawnKind } from '../../domain/mobSpawnRespawn.js';
import { isSharedWorldBossKind } from '../../domain/worldBossSession.js';
import type { MapSpawnKind } from '../../data/mapWorldSpawns.js';
import { addClanTaskProgressForCharacter } from './clanTaskProgressService.js';

type Tx = Prisma.TransactionClient;

/** PvE progress hooks після server-side victory economy. */
export async function creditClanTaskPveVictoryInTx(
  tx: Tx,
  input: {
    characterId: string;
    spawnId: string;
    spawnKind: MapSpawnKind;
    expectedRevision: number | null;
    charRevision: number;
    adenaGain: bigint;
    spGain: number;
    mobKills: number;
  }
): Promise<void> {
  if (isSharedWorldBossKind(input.spawnKind)) return;
  if (!isRegularMobRespawnKind(input.spawnKind)) return;

  const eventBase = `pve:${input.characterId}:rev${input.expectedRevision ?? input.charRevision}:spawn:${input.spawnId}`;

  if (input.adenaGain > 0n) {
    await addClanTaskProgressForCharacter({
      tx,
      characterId: input.characterId,
      eventType: 'ADENA_EARNED_FROM_PVE',
      amount: input.adenaGain,
      eventKey: `${eventBase}:adena`,
    });
  }

  if (input.spGain > 0) {
    await addClanTaskProgressForCharacter({
      tx,
      characterId: input.characterId,
      eventType: 'SP_EARNED_FROM_MONSTERS',
      amount: input.spGain,
      eventKey: `${eventBase}:sp`,
    });
  }

  if (input.mobKills > 0) {
    await addClanTaskProgressForCharacter({
      tx,
      characterId: input.characterId,
      eventType: 'MONSTER_KILLS',
      amount: input.mobKills,
      eventKey: `${eventBase}:kill`,
    });
  }
}

export async function creditClanTaskSiegeWallDamageInTx(
  tx: Tx,
  input: {
    characterId: string;
    siegeId: string;
    actionId: string;
    appliedDamage: number;
  }
): Promise<void> {
  if (input.appliedDamage <= 0) return;
  await addClanTaskProgressForCharacter({
    tx,
    characterId: input.characterId,
    eventType: 'SIEGE_WALL_DAMAGE',
    amount: input.appliedDamage,
    eventKey: `siege:${input.siegeId}:${input.characterId}:${input.actionId}`,
  });
}
