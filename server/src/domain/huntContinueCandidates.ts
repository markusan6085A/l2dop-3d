import { getDungeonMobSpawnById } from '../data/sevenSignsDungeonMobSpawns.js';
import type { CharacterRow } from '../services/charTypes.js';
import { resolvedWorldPositionFromCharacterRow } from '../services/mapAroundService.js';
import {
  listHuntCandidatesOrdered,
  type HuntNextSpawnResult,
} from './battleHuntChain.js';
import { resolveDungeonStateForRow } from './dungeonMoveLogic.js';
import { listDungeonHuntCandidatesOrdered } from './dungeonHuntChain.js';
import { parseDungeonStateJson } from './dungeonState.js';

export interface HuntContinueCandidateOpts {
  targetLevel: number;
  levelTolerance?: number;
  excludeSpawnId?: string;
  preferredSpawnId?: string;
  mobSpawnHpJson?: unknown;
  nowMs?: number;
}

/** Світова карта або подземелля — залежно від spawnId / dungeonStateJson. */
export function resolveHuntCandidatesForCharacter(
  row: CharacterRow,
  opts: HuntContinueCandidateOpts
): HuntNextSpawnResult[] {
  const nowMs = opts.nowMs ?? Date.now();
  const excludeSpawnId = opts.excludeSpawnId
    ? String(opts.excludeSpawnId).trim()
    : '';
  const killedDungeonMob = excludeSpawnId
    ? getDungeonMobSpawnById(excludeSpawnId)
    : undefined;
  const dState = parseDungeonStateJson(row.dungeonStateJson);
  const dungeonId = killedDungeonMob?.dungeonId ?? dState?.dungeonId;

  if (dungeonId && (killedDungeonMob || dState)) {
    const liveState = resolveDungeonStateForRow(row, dungeonId, nowMs);
    if (!liveState) return [];
    return listDungeonHuntCandidatesOrdered({
      dungeonId,
      playerMapX: liveState.mapX,
      playerMapY: liveState.mapY,
      targetLevel: opts.targetLevel,
      levelTolerance: opts.levelTolerance,
      excludeSpawnId: opts.excludeSpawnId,
      preferredSpawnId: opts.preferredSpawnId,
      mobSpawnHpJson: opts.mobSpawnHpJson ?? row.mobSpawnHpJson,
      nowMs,
    });
  }

  const huntPos = resolvedWorldPositionFromCharacterRow(row);
  return listHuntCandidatesOrdered({
    worldX: huntPos.worldX,
    worldY: huntPos.worldY,
    targetLevel: opts.targetLevel,
    levelTolerance: opts.levelTolerance,
    excludeSpawnId: opts.excludeSpawnId,
    preferredSpawnId: opts.preferredSpawnId,
    mobSpawnHpJson: opts.mobSpawnHpJson ?? huntPos.mobSpawnHpJson,
    nowMs,
  });
}

export function findNextHuntCandidateForCharacter(
  row: CharacterRow,
  opts: HuntContinueCandidateOpts
): HuntNextSpawnResult | null {
  return resolveHuntCandidatesForCharacter(row, opts)[0] ?? null;
}

export function countHuntCandidatesForCharacter(
  row: CharacterRow,
  opts: HuntContinueCandidateOpts
): number {
  return resolveHuntCandidatesForCharacter(row, opts).length;
}
