export class GameConflictError extends Error {
  constructor() {
    super('revision_conflict');
    this.name = 'GameConflictError';
  }
}
