import type { Character, Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

/** Stable ORDER BY id — уникнення deadlock при multi-character writes. */
export async function lockCharacterRowsInStableOrderInTx(
  tx: Tx,
  characterIds: readonly string[]
): Promise<Map<string, Character>> {
  const unique = [...new Set(characterIds.map((id) => String(id).trim()).filter(Boolean))].sort();
  const out = new Map<string, Character>();
  for (const id of unique) {
    const rows = await tx.$queryRaw<Character[]>`
      SELECT *
      FROM "Character"
      WHERE id = ${id}
      FOR UPDATE
    `;
    const row = rows[0];
    if (row) out.set(id, row);
  }
  return out;
}

export function mergeUniqueCharacterIds(
  ...lists: readonly (readonly string[])[]
): string[] {
  const set = new Set<string>();
  for (const list of lists) {
    for (const id of list) {
      const trimmed = String(id || '').trim();
      if (trimmed) set.add(trimmed);
    }
  }
  return [...set].sort();
}
