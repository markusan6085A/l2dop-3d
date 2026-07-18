import { Prisma } from '@prisma/client';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { parsePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';
import type { CharacterRow } from './charTypes.js';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';
import { flushWorldBossPendingMobHitsForCharacterInTx } from './worldBossSessionService.js';

type Tx = Prisma.TransactionClient;

function hasPendingDefeat(char: CharacterRow): boolean {
  return (
    parsePvePendingDefeat(char.pvePendingDefeatJson) != null ||
    parsePvpPendingDefeat(char.pvpPendingDefeatJson) != null
  );
}

function shouldClearStaleBattleJson(char: CharacterRow): boolean {
  if (char.battleJson == null) return false;
  if (hasPendingDefeat(char)) return true;
  return char.hp <= 0;
}

/** Після поразки battleJson має бути порожнім; при «завислому» бою — прибрати без revision++. */
export async function sanitizeDefeatOrphanBattleInTx(
  tx: Tx,
  char: CharacterRow
): Promise<CharacterRow> {
  if (!shouldClearStaleBattleJson(char)) return char;
  if (char.battleJson == null) return char;
  await persistCharacterFieldsInTx(tx, char.id, {
    battleJson: Prisma.JsonNull,
  });
  const fresh = await tx.character.findUnique({ where: { id: char.id } });
  return (fresh as CharacterRow) ?? char;
}

/** Flush pending РБ + sanitize перед «В місто» / GET battle. */
export async function prepareCharacterAfterDefeatInTx(
  tx: Tx,
  char: CharacterRow,
  nowMs: number
): Promise<CharacterRow> {
  let row = await flushWorldBossPendingMobHitsForCharacterInTx(tx, char, nowMs);
  row = await sanitizeDefeatOrphanBattleInTx(tx, row);
  return row;
}

export function isBattleBlockingReturnToTown(char: CharacterRow): boolean {
  if (char.battleJson == null) return false;
  if (hasPendingDefeat(char)) return false;
  if (char.hp <= 0) return false;
  return true;
}
