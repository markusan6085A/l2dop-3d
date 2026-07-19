import type { Prisma } from '@prisma/client';

export type PvpDefeatScope = 'world' | 'clan_siege';

export interface PvpPendingDefeat {
  killerName: string;
  killerCharacterId: string;
  atMs: number;
  deathEventId: string;
  scope: PvpDefeatScope;
  siegeCityId?: string;
  siegeId?: string;
  eliminatedFromSiege?: boolean;
  fullLog?: string[];
}

export interface PvpDefeatClientSummary {
  killerName: string;
  killerCharacterId: string;
  deathEventId: string;
  scope: PvpDefeatScope;
  playerDied: true;
  eliminatedFromSiege?: boolean;
  siegeCityId?: string;
  messageUk: string;
  fullLog?: string[];
}

function legacyDeathEventId(pending: {
  atMs: number;
  killerCharacterId: string;
}): string {
  return (
    'legacy:' +
    String(Math.floor(Number(pending.atMs) || 0)) +
    ':' +
    String(pending.killerCharacterId || '').trim()
  );
}

export function parsePvpPendingDefeat(raw: unknown): PvpPendingDefeat | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const killerName =
    typeof r.killerName === 'string' ? r.killerName.trim() : '';
  const killerCharacterId =
    typeof r.killerCharacterId === 'string'
      ? r.killerCharacterId.trim()
      : '';
  const atMs = Number(r.atMs);
  if (!killerName || !killerCharacterId || !Number.isFinite(atMs)) return null;
  const fullLog = Array.isArray(r.fullLog)
    ? r.fullLog.map((x) => String(x)).filter((x) => x.length > 0)
    : undefined;
  const scope: PvpDefeatScope =
    r.scope === 'clan_siege' ? 'clan_siege' : 'world';
  const deathEventIdRaw =
    typeof r.deathEventId === 'string' ? r.deathEventId.trim() : '';
  const siegeCityId =
    typeof r.siegeCityId === 'string' && r.siegeCityId.trim()
      ? r.siegeCityId.trim()
      : undefined;
  const siegeId =
    typeof r.siegeId === 'string' && r.siegeId.trim()
      ? r.siegeId.trim()
      : undefined;
  const eliminatedFromSiege =
    r.eliminatedFromSiege === true ||
    (scope === 'clan_siege' && r.eliminatedFromSiege !== false);

  const base = {
    killerName,
    killerCharacterId,
    atMs: Math.floor(atMs),
    scope,
    ...(siegeCityId ? { siegeCityId } : {}),
    ...(siegeId ? { siegeId } : {}),
    ...(eliminatedFromSiege ? { eliminatedFromSiege: true } : {}),
    ...(fullLog && fullLog.length > 0 ? { fullLog } : {}),
  };

  return {
    ...base,
    deathEventId:
      deathEventIdRaw ||
      legacyDeathEventId({ atMs: base.atMs, killerCharacterId }),
  };
}

export function buildPvpDefeatMessageUk(pending: PvpPendingDefeat): string {
  const killer = pending.killerName || '—';
  if (pending.scope === 'clan_siege') {
    if (pending.eliminatedFromSiege) {
      return `Вас переміг ${killer}. Ви вибули з облоги.`;
    }
    return `Вас переміг ${killer}.`;
  }
  return `Вас вбив гравець [${killer}]!`;
}

export function pvpPendingDefeatToClientSummary(
  pending: PvpPendingDefeat
): PvpDefeatClientSummary {
  return {
    killerName: pending.killerName,
    killerCharacterId: pending.killerCharacterId,
    deathEventId: pending.deathEventId,
    scope: pending.scope,
    playerDied: true,
    ...(pending.eliminatedFromSiege ? { eliminatedFromSiege: true } : {}),
    ...(pending.siegeCityId ? { siegeCityId: pending.siegeCityId } : {}),
    messageUk: buildPvpDefeatMessageUk(pending),
    ...(pending.fullLog && pending.fullLog.length > 0
      ? { fullLog: pending.fullLog }
      : {}),
  };
}

export function serializePvpPendingDefeat(
  defeat: PvpPendingDefeat
): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(defeat)) as Prisma.InputJsonValue;
}
