import {
  CHARACTER_CATALOG_VERSION,
  RESOURCE_CRAFT_BOOK_VERSION,
} from '../data/characterCatalogVersion.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { toSnapshot } from './charSnapshotLogic.js';
import { getUnreadReplyCount } from './chatService.js';

/** Єдиний client snapshot для GET і POST (HUD, +1, catalog/book версії). */
export async function buildCharacterClientSnapshot(
  row: CharacterRow,
  userId: string,
  extras?: Partial<CharacterSnapshot>
): Promise<CharacterSnapshot> {
  const snap = toSnapshot(row);
  const chatUnreadReplyCount = await getUnreadReplyCount(userId);
  return {
    ...snap,
    catalogVersion: CHARACTER_CATALOG_VERSION,
    bookVersion: RESOURCE_CRAFT_BOOK_VERSION,
    chatUnreadReplyCount,
    ...extras,
  };
}

/** @deprecated — використовуй buildCharacterClientSnapshot */
export async function toClientSnapshot(
  row: CharacterRow,
  userId: string
): Promise<CharacterSnapshot> {
  return buildCharacterClientSnapshot(row, userId);
}
