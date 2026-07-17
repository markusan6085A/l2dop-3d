import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { toSnapshot } from './charSnapshotLogic.js';
import { getUnreadReplyCount } from './chatService.js';

/** Snapshot для клієнта + лічильник непрочитаних відповідей у чаті. */
export async function toClientSnapshot(
  row: CharacterRow,
  userId: string
): Promise<CharacterSnapshot> {
  const snap = toSnapshot(row);
  const chatUnreadReplyCount = await getUnreadReplyCount(userId);
  return { ...snap, chatUnreadReplyCount };
}
