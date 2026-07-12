import { prisma } from '../lib/prisma.js';
import { gameConflictFromMutation } from './charConflict.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

export const PROFILE_STATUS_MAX_LEN = 100;

export function normalizeProfileStatus(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return null;
  if (s.length > PROFILE_STATUS_MAX_LEN) {
    throw new Error('status_too_long');
  }
  return s;
}

function storedProfileStatus(row: CharacterRow): string | null {
  if (row.profileStatus == null || !String(row.profileStatus).trim()) {
    return null;
  }
  return String(row.profileStatus).trim();
}

/** Зберегти текст статусу профілю (видимий іншим гравцям). */
export async function applyProfileStatus(
  userId: string,
  expectedRevision: number,
  rawStatus: unknown
): Promise<CharacterSnapshot> {
  const nextStatus = normalizeProfileStatus(rawStatus);

  return prisma.$transaction(async (tx) => {
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
        const row = current as CharacterRow;
        const prev = storedProfileStatus(row);
        if (prev === nextStatus) {
          return { changed: false };
        }
        return {
          changed: true,
          data: { profileStatus: nextStatus },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
