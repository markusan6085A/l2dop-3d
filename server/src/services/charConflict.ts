import type { Character } from '@prisma/client';
import { GameConflictError, type MutationConflictResult } from './charErrors.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow } from './charTypes.js';

export function gameConflictFromCharacter(
  character: Character | CharacterRow
): GameConflictError {
  const row = character as CharacterRow;
  return new GameConflictError({
    serverRevision: row.revision,
    character: toSnapshot(row),
  });
}

export function gameConflictFromMutation(
  result: MutationConflictResult
): GameConflictError {
  const row = result.character as CharacterRow | null;
  return new GameConflictError({
    serverRevision: result.serverRevision,
    character: row ? toSnapshot(row) : null,
  });
}
