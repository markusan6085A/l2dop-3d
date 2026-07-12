import type { Prisma } from '@prisma/client';

export interface PvpPendingDefeat {
  killerName: string;
  killerCharacterId: string;
  atMs: number;
  fullLog?: string[];
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
  const fullLog = Array.isArray(r.fullLog)
    ? r.fullLog.map((x) => String(x)).filter((x) => x.length > 0)
    : undefined;
  return {
    killerName,
    killerCharacterId,
    atMs: Math.floor(atMs),
    ...(fullLog && fullLog.length > 0 ? { fullLog } : {}),
  };
}

export function serializePvpPendingDefeat(
  defeat: PvpPendingDefeat
): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(defeat)) as Prisma.InputJsonValue;
}
