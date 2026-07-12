import type { Character } from '@prisma/client';
import type { CharacterSnapshot } from './charTypes.js';

export class GameConflictError extends Error {
  readonly serverRevision: number | null;
  readonly character: CharacterSnapshot | null;

  constructor(payload?: {
    serverRevision?: number | null;
    character?: CharacterSnapshot | null;
  }) {
    super('revision_conflict');
    this.name = 'GameConflictError';
    this.serverRevision = payload?.serverRevision ?? null;
    this.character = payload?.character ?? null;
  }
}

export type MutationConflictResult = {
  ok: false;
  conflict: true;
  serverRevision: number | null;
  character: Character | null;
};
