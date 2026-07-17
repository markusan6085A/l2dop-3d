/**
 * Персонаж: типи, snapshot і мутації з перевіркою revision.
 * Реалізація розбита на `char*.ts` (ліміт рядків на файл).
 */
export type { CharacterRow, CharacterSnapshot } from './charTypes.js';
export { GameConflictError } from './charErrors.js';
export {
  gameConflictFromCharacter,
  gameConflictFromMutation,
} from './charConflict.js';
export {
  combatOptsFromRow,
  resolveHeroPowerFromCharacterRow,
  toSnapshot,
} from './charSnapshotLogic.js';
export {
  buildCharacterClientSnapshot,
  enrichPartialClientSnapshot,
  toClientSnapshot,
} from './charClientSnapshot.js';
export { applyPassiveHpRegen, applyPassiveHpRegenPure } from './charPassiveRegen.js';
export { ensureSanitizedSkillsLearnedRow, ensureMysticStarterSkillsRow } from './charSkillsSanitize.js';
export {
  applyPersistedCombatBuffs,
  getSnapshotForUser,
  applyEquipFromBag,
  applyUnequip,
} from './charMutations.js';
export { applyUsePotionFromBag } from './charConsumableUseService.js';
export { applyProfileStatus } from './charProfileStatusService.js';
export { castActiveSelfBuff } from './castActiveSelfBuff.js';
export { toggleSelfStance } from './toggleSelfStance.js';
export { applyTownBuffer } from './townBufferService.js';
export { applyTownRestoreVitals } from './townBufferRestoreService.js';
export {
  applyWarehouseDeposit,
  applyWarehouseWithdraw,
} from './warehouseService.js';
export {
  performHunt,
  performMapMove,
  performTeleport,
  performRaidBossTeleport,
  performReturnToNearestTown,
} from './charWorldMutations.js';
