/**
 * Персонаж: типи, snapshot і мутації з перевіркою revision.
 * Реалізація розбита на `char*.ts` (ліміт рядків на файл).
 */
export type { CharacterRow, CharacterSnapshot } from './charTypes.js';
export { GameConflictError } from './charErrors.js';
export {
  combatOptsFromRow,
  toSnapshot,
} from './charSnapshotLogic.js';
export { applyPassiveHpRegen } from './charPassiveRegen.js';
export { ensureSanitizedSkillsLearnedRow } from './charSkillsSanitize.js';
export {
  applyPersistedCombatBuffs,
  getSnapshotForUser,
  applyEquipFromBag,
  applyUnequip,
} from './charMutations.js';
export { castActiveSelfBuff } from './castActiveSelfBuff.js';
export { toggleSelfStance } from './toggleSelfStance.js';
export {
  performHunt,
  performMapMove,
  performTeleport,
  performReturnToNearestTown,
} from './charWorldMutations.js';
