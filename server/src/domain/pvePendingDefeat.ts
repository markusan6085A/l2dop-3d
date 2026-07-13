import type { Prisma } from '@prisma/client';

export interface PvePendingDefeat {
  spawnId: string;
  mobName: string;
  mobLevel: number;
  aggressive: boolean;
  atMs: number;
  fullLog: string[];
  nearestTownLabelUk: string;
  nearestTeleportId: string;
}

export function parsePvePendingDefeat(raw: unknown): PvePendingDefeat | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const spawnId = typeof r.spawnId === 'string' ? r.spawnId.trim() : '';
  const mobName = typeof r.mobName === 'string' ? r.mobName.trim() : '';
  const mobLevel = Number(r.mobLevel);
  const aggressive = r.aggressive === true;
  const atMs = Number(r.atMs);
  const nearestTownLabelUk =
    typeof r.nearestTownLabelUk === 'string' ? r.nearestTownLabelUk.trim() : '';
  const nearestTeleportId =
    typeof r.nearestTeleportId === 'string' ? r.nearestTeleportId.trim() : '';
  if (
    !spawnId ||
    !mobName ||
    !Number.isFinite(mobLevel) ||
    mobLevel < 1 ||
    !Number.isFinite(atMs) ||
    !nearestTownLabelUk ||
    !nearestTeleportId
  ) {
    return null;
  }
  const fullLog = Array.isArray(r.fullLog)
    ? r.fullLog.map((x) => String(x)).filter((x) => x.length > 0)
    : [];
  return {
    spawnId,
    mobName,
    mobLevel: Math.floor(mobLevel),
    aggressive,
    atMs: Math.floor(atMs),
    fullLog,
    nearestTownLabelUk,
    nearestTeleportId,
  };
}

export function serializePvePendingDefeat(
  defeat: PvePendingDefeat
): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(defeat)) as Prisma.InputJsonValue;
}

export function pvePendingDefeatToSummary(defeat: PvePendingDefeat) {
  return {
    spawnId: defeat.spawnId,
    mobName: defeat.mobName,
    mobLevel: defeat.mobLevel,
    aggressive: defeat.aggressive,
    fullLog: defeat.fullLog,
    nearestTownLabelUk: defeat.nearestTownLabelUk,
    nearestTeleportId: defeat.nearestTeleportId,
  };
}
