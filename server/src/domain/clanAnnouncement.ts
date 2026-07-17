/** Оголошення клану (pure). */
export const CLAN_ANNOUNCEMENT_MAX_LEN = 300;

export type ClanAnnouncementValidation =
  | { ok: true; text: string }
  | { ok: false; code: string };

export function normalizeClanAnnouncement(raw: unknown): ClanAnnouncementValidation {
  if (raw == null) {
    return { ok: true, text: '' };
  }
  const text = String(raw).trim();
  if (text.length > CLAN_ANNOUNCEMENT_MAX_LEN) {
    return { ok: false, code: 'clan_announcement_length' };
  }
  return { ok: true, text };
}

export function formatClanAnnouncementDisplay(text: string): string {
  const trimmed = text.trim();
  return trimmed || '—';
}
