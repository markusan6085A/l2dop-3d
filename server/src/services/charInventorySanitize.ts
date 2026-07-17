import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  applyInventoryReadPatches,
  parseInventoryRaw,
} from '../data/inventory.js';
import type { CharacterRow } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

/**
 * Read-path sanitize інвентаря: прибрати дубль одягненого в stacks,
 * міграція `_sk`, стартова мантія магів — один раз у БД (revision +1 лише якщо змінилось).
 */
export async function ensureInventoryReadPatchesRow(
  row: CharacterRow
): Promise<CharacterRow> {
  const invRaw = parseInventoryRaw(row.inventoryJson);
  const patched = applyInventoryReadPatches(invRaw, row.classBranch);
  if (!patched.changed) return row;

  return prisma.$transaction(async (tx) => {
    const result = await mutateCharacterWithRevision(
      tx,
      row.id,
      row.revision,
      () => ({
        changed: true,
        data: {
          inventoryJson: patched.inv as unknown as Prisma.InputJsonValue,
        },
      })
    );
    if (!result.ok) {
      const fallback = (result.character as CharacterRow | null) ?? row;
      return row.clan ? { ...fallback, clan: row.clan } : fallback;
    }
    const updated = result.character as CharacterRow;
    return row.clan ? { ...updated, clan: row.clan } : updated;
  });
}
