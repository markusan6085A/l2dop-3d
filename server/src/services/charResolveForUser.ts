import type { Prisma } from '@prisma/client';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import type { CharacterRow } from './charTypes.js';
import { prisma } from '../lib/prisma.js';

type Tx = Prisma.TransactionClient;

export type FindCharacterForUserOpts = {
  include?: Prisma.CharacterInclude;
  /** Явний id персонажа з UI (мутації бою). */
  characterId?: string | null;
  /** spawnId з URL бою — знайти героя саме в цьому бою. */
  battleSpawnId?: string | null;
};

function rowInActiveBattle(row: CharacterRow): boolean {
  const bj = parseBattleJson(row.battleJson);
  return typeof bj?.spawnId === 'string' && bj.spawnId.length > 0;
}

function rowBattleSpawnId(row: CharacterRow): string | null {
  const bj = parseBattleJson(row.battleJson);
  return typeof bj?.spawnId === 'string' && bj.spawnId.length > 0
    ? bj.spawnId
    : null;
}

function rowHasPendingPveDefeat(row: CharacterRow): boolean {
  return parsePvePendingDefeat(row.pvePendingDefeatJson) != null;
}

/**
 * Активний персонаж акаунта.
 * Пріоритет: characterId → battleSpawnId → будь-хто в бою → pending defeat → lastUpdate.
 */
export async function findCharacterForUserInTx(
  tx: Tx,
  userId: string,
  opts?: FindCharacterForUserOpts
): Promise<CharacterRow | null> {
  const charId =
    typeof opts?.characterId === 'string' && opts.characterId.trim()
      ? opts.characterId.trim()
      : null;
  if (charId) {
    const row = await tx.character.findFirst({
      where: { userId, id: charId },
      ...(opts?.include ? { include: opts.include } : {}),
    });
    return row ? (row as CharacterRow) : null;
  }

  const rows = await tx.character.findMany({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    ...(opts?.include ? { include: opts.include } : {}),
  });
  if (rows.length === 0) return null;
  if (rows.length === 1) return rows[0] as CharacterRow;

  const spawnId =
    typeof opts?.battleSpawnId === 'string' && opts.battleSpawnId.trim()
      ? opts.battleSpawnId.trim()
      : null;
  if (spawnId) {
    for (const row of rows) {
      if (rowBattleSpawnId(row as CharacterRow) === spawnId) {
        return row as CharacterRow;
      }
    }
  }

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
