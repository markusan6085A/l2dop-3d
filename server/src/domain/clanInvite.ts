/** Текст HUD-повідомлення для запрошеного гравця. */
export function clanInviteHudNoticeUk(
  inviterName: string,
  clanName: string
): string {
  const nick = String(inviterName || '—').trim() || '—';
  const clan = String(clanName || '—').trim() || '—';
  return (
    'Гравець ' + nick + ' запрошує вас вступити до клану «' + clan + '».'
  );
}
