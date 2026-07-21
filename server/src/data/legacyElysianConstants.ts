/** Legacy Elysian bow itemId — лише міграція з БД, не acquisition. */
export const LEGACY_ELYSIAN_BOW_ITEM_ID = 290;

/** Канонічний Elysian A-grade (1H blunt). */
export const ELYSIAN_ITEM_ID = 164;

/** Legacy itemId, які не можна видавати з acquisition sources. */
export const LEGACY_BLOCKED_ACQUISITION_ITEM_IDS: ReadonlySet<number> = new Set([
  LEGACY_ELYSIAN_BOW_ITEM_ID,
]);

export function isLegacyBlockedAcquisitionItemId(itemId: number): boolean {
  return LEGACY_BLOCKED_ACQUISITION_ITEM_IDS.has(Math.floor(itemId));
}

export function remapLegacyElysianItemId(itemId: number): number {
  return itemId === LEGACY_ELYSIAN_BOW_ITEM_ID ? ELYSIAN_ITEM_ID : itemId;
}

/** Admin/grant: legacy id → канонічний id перед видачею. */
export function resolveAcquisitionIssueItemId(itemId: number): number {
  return remapLegacyElysianItemId(itemId);
}
