import type { Prisma } from '@prisma/client';

export interface PvpPendingDefeat {
  killerName: string;
  killerCharacterId: string;
  atMs: number;
}

export function parsePvpPendingDefeat(
  raw: unknown
): PvpPendingDefeat | null {
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
  return {
    killerName,
    killerCharacterId,
    atMs: Math.floor(atMs),
  };
}

export function serializePvpPendingDefeat(
  defeat: PvpPendingDefeat
): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(defeat)) as Prisma.InputJsonValue;
}
