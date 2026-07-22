/** Стабільний ключ idempotency / HUD notice для world party kill. */
export function buildWorldPartyKillRewardNoticeId(args: {
  killerCharacterId: string;
  spawnId: string;
  killRevision: number;
}): string {
  return `wk:${args.killerCharacterId}:${args.spawnId}:${args.killRevision}`;
}

export function parseWorldPartyKillRewardNoticeId(
  noticeId: string
): { killerCharacterId: string; spawnId: string; killRevision: number } | null {
  const raw = String(noticeId || '').trim();
  if (!raw.startsWith('wk:')) return null;
  const parts = raw.slice(3).split(':');
  if (parts.length < 3) return null;
  const killRevision = Number(parts[parts.length - 1]);
  const spawnId = parts[parts.length - 2]!;
  const killerCharacterId = parts.slice(0, -2).join(':');
  if (!killerCharacterId || !spawnId || !Number.isFinite(killRevision)) return null;
  return { killerCharacterId, spawnId, killRevision: Math.floor(killRevision) };
}
