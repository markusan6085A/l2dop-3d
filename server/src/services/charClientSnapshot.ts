import {
  CHARACTER_CATALOG_VERSION,
  RESOURCE_CRAFT_BOOK_VERSION,
} from '../data/characterCatalogVersion.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { toSnapshot } from './charSnapshotLogic.js';
import {
  getUnreadReplyCount,
  getUnreadReplyCountForCharacter,
} from './chatService.js';

/** Єдиний client snapshot для GET і POST (HUD, +1, catalog/book версії). Після commit транзакції. */
export async function buildCharacterClientSnapshot(
  row: CharacterRow,
  _userId: string,
  extras?: Partial<CharacterSnapshot>
): Promise<CharacterSnapshot> {
  const snap = toSnapshot(row);
  const chatUnreadReplyCount = await getUnreadReplyCountForCharacter(
    row.id,
    row.chatRepliesReadAt ?? null
  );
  return {
    ...snap,
    catalogVersion: CHARACTER_CATALOG_VERSION,
    bookVersion: RESOURCE_CRAFT_BOOK_VERSION,
    chatUnreadReplyCount,
    snapshotGeneratedAt: Date.now(),
    ...extras,
  };
}

/** Доповнити snapshot після commit (напр. battle tx повернув toSnapshot). */
export async function enrichPartialClientSnapshot(
  snap: CharacterSnapshot,
  userId: string
): Promise<CharacterSnapshot> {
  const chatUnreadReplyCount = await getUnreadReplyCount(userId);
  return {
    ...snap,
    catalogVersion: CHARACTER_CATALOG_VERSION,
    bookVersion: RESOURCE_CRAFT_BOOK_VERSION,
    chatUnreadReplyCount,
    snapshotGeneratedAt: Date.now(),
  };
}

/** @deprecated — використовуй buildCharacterClientSnapshot */
export async function toClientSnapshot(
  row: CharacterRow,
  userId: string
): Promise<CharacterSnapshot> {
  return buildCharacterClientSnapshot(row, userId);
}
