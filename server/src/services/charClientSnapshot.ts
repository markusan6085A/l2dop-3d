import {
  CHARACTER_CATALOG_VERSION,
  RESOURCE_CRAFT_BOOK_VERSION,
} from '../data/characterCatalogVersion.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { toSnapshot } from './charSnapshotLogic.js';
import { prisma } from '../lib/prisma.js';
import {
  getUnreadReplyCount,
  getUnreadReplyCountForCharacter,
} from './chatService.js';
import {
  applyDevSnapshotResponseDelay,
  nextClientSnapshotVersion,
} from './clientSnapshotVersion.js';

export type ClientSnapshotEnrichOpts = {
  /** false — без COUNT unread (battle action, hotbar тощо). */
  includeUnreadCount?: boolean;
  /** Dev-only: штучна затримка перед відправкою відповіді (після snapshot). */
  debugResponseDelayMs?: number;
};

function attachClientSnapshotMeta(
  snap: CharacterSnapshot,
  extras?: Partial<CharacterSnapshot>
): CharacterSnapshot {
  const id = snap.id != null ? String(snap.id) : '';
  return {
    ...snap,
    catalogVersion: CHARACTER_CATALOG_VERSION,
    bookVersion: RESOURCE_CRAFT_BOOK_VERSION,
    snapshotGeneratedAt: Date.now(),
    clientSnapshotVersion: id ? nextClientSnapshotVersion(id) : undefined,
    ...extras,
  };
}

async function ensureClanHallOnRow(row: CharacterRow): Promise<CharacterRow> {
  if (!row.clanId) return row;
  const needsFetch =
    !row.clan ||
    row.clan.hallBlessingAt === undefined ||
    row.clan.level === undefined;
  if (!needsFetch) return row;
  const clan = await prisma.clan.findUnique({
    where: { id: row.clanId },
    select: { name: true, hallBlessingAt: true, level: true },
  });
  if (!clan) return row;
  return {
    ...row,
    clan: {
      name: clan.name,
      hallBlessingAt: clan.hallBlessingAt,
      level: clan.level,
    },
  };
}

/** Єдиний client snapshot для GET і POST. Після commit транзакції. */
export async function buildCharacterClientSnapshot(
  row: CharacterRow,
  _userId: string,
  extras?: Partial<CharacterSnapshot>,
  opts?: ClientSnapshotEnrichOpts
): Promise<CharacterSnapshot> {
  const rowReady = await ensureClanHallOnRow(row);
  const snap = toSnapshot(rowReady);
  const chatUnreadReplyCount = await getUnreadReplyCountForCharacter(
    row.id,
    row.chatRepliesReadAt ?? null
  );
  const result = attachClientSnapshotMeta(snap, {
    chatUnreadReplyCount,
    ...extras,
  });
  await applyDevSnapshotResponseDelay(opts?.debugResponseDelayMs);
  return result;
}

/** Доповнити snapshot після commit (напр. battle tx повернув toSnapshot). */
export async function enrichPartialClientSnapshot(
  snap: CharacterSnapshot,
  userId: string,
  opts?: ClientSnapshotEnrichOpts
): Promise<CharacterSnapshot> {
  const includeUnread = opts?.includeUnreadCount !== false;
  let result: CharacterSnapshot;
  if (!includeUnread) {
    result = attachClientSnapshotMeta(snap);
  } else {
    const chatUnreadReplyCount = await getUnreadReplyCount(userId);
    result = attachClientSnapshotMeta(snap, { chatUnreadReplyCount });
  }
  await applyDevSnapshotResponseDelay(opts?.debugResponseDelayMs);
  return result;
}

/** @deprecated — використовуй buildCharacterClientSnapshot */
export async function toClientSnapshot(
  row: CharacterRow,
  userId: string
): Promise<CharacterSnapshot> {
  return buildCharacterClientSnapshot(row, userId);
}
