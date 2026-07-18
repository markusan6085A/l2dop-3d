import type { Prisma } from '@prisma/client';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import type { CharacterRow } from './charTypes.js';
import { prisma } from '../lib/prisma.js';

type Tx = Prisma.TransactionClient;

export type FindCharacterForUserOpts = {
  include?: Prisma.CharacterInclude;
};

function rowInActiveBattle(row: CharacterRow): boolean {
  const bj = parseBattleJson(row.battleJson);
  return typeof bj?.spawnId === 'string' && bj.spawnId.length > 0;
}

function rowHasPendingPveDefeat(row: CharacterRow): boolean {
  return parsePvePendingDefeat(row.pvePendingDefeatJson) != null;
}

/**
 * Активний персонаж акаунта: спочатку той, хто в бою / з pending defeat,
 * інакше останній за lastUpdate (як раніше).
 */
export async function findCharacterForUserInTx(
  tx: Tx,
  userId: string,
  opts?: FindCharacterForUserOpts
): Promise<CharacterRow | null> {
  const rows = await tx.character.findMany({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    ...(opts?.include ? { include: opts.include } : {}),
  });
  if (rows.length === 0) return null;
  if (rows.length === 1) return rows[0] as CharacterRow;

  for (const row of rows) {
    if (rowInActiveBattle(row as CharacterRow)) return row as CharacterRow;
  }
  for (const row of rows) {
    if (rowHasPendingPveDefeat(row as CharacterRow)) return row as CharacterRow;
  }
  return rows[0] as CharacterRow;
}

export async function findCharacterForUser(
  userId: string,
  opts?: FindCharacterForUserOpts
): Promise<CharacterRow | null> {
  return findCharacterForUserInTx(prisma, userId, opts);
}
