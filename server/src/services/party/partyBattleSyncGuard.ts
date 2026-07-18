/**
 * Read-only guard для GET /game/battle/sync у party battle (Stage B+).
 *
 * Sync не повинен:
 * - touch lastActivityAt;
 * - bump battleVersion;
 * - mutate Character.revision;
 * - create participant;
 * - revive session після timeout.
 */

import type { BattleJsonState } from '../../domain/battleTypes.js';

/** Чи цей battleJson вказує на party session (лише read path). */
export function isPartyBattleSyncContext(
  bj: BattleJsonState | null | undefined
): boolean {
  const id = bj?.partyBattleId?.trim();
  return typeof id === 'string' && id.length > 0;
}

/**
 * Контракт read-only sync для party battle.
 * Викликати на початку party sync builder (Stage B) — assert no writes.
 */
export function assertPartyBattleSyncReadOnlyContract(): void {
  // Placeholder для Stage B partyBattleSyncService — документує контракт.
  // Реальні write перевіряються code review + тестами; GET /battle/sync уже read-only.
}
