import { MAP_NEARBY_HERO_RADIUS } from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from '../domain/battleTypes.js';
import { getEffectiveCharacterLevel } from '../domain/effectiveCharacterLevel.js';
import {
  resolveMapMovement,
  type MapMovementFields,
} from '../domain/mapMovement.js';
import {
  isPvpBattleJson,
} from '../domain/battlePvpContext.js';
import {
  resolvePvpNickColor,
  type PvpNickColor,
} from '../domain/pvpKarma.js';
import { prisma } from '../lib/prisma.js';
import { isCharacterOnlineNow } from './onlinePresenceService.js';
import { isInPvpSafeZone } from '../domain/pvpSafeZones.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { parsePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';

/** Герой у радіусі обзору карти (як nearbySpawns для мобів). */
export interface NearbyHeroEntry {
  characterId: string;
  name: string;
  level: number;
  worldX: number;
  worldY: number;
  distance: number;
  /** У радіусі атаки (BATTLE_RANGE). */
  inBattleRange: boolean;
  inBattle: boolean;
  /** Можна натиснути [pk] — не зайнятий чужим PvP. */
  canPkAttack: boolean;
  /** Колір ніка: default | aggressor | pk */
  pvpNickColor: PvpNickColor;
  isOnline: boolean;
  gender: string;
  l2Profession: string;
  /** Карма > 0 — для маркера PK. */
  pk: number;
}

const MAX_NEARBY_HEROES = 50;

const HERO_MAP_SELECT = {
  id: true,
  name: true,
  exp: true,
  worldX: true,
  worldY: true,
  targetX: true,
  targetY: true,
  moveStartAt: true,
  moveFromX: true,
  moveFromY: true,
  race: true,
  classBranch: true,
  inventoryJson: true,
  l2Profession: true,
  gender: true,
  battleJson: true,
  karma: true,
  pvpAggressorUntilMs: true,
  hp: true,
  pvpPendingDefeatJson: true,
  pvePendingDefeatJson: true,
  activeBuffsJson: true,
  buffHeroicTier: true,
  buffZealotStacks: true,
  skillsLearnedJson: true,
  worldCombatStateJson: true,
} as const;

type HeroMapRow = MapMovementFields & {
  id: string;
  name: string;
  exp: bigint;
  l2Profession: string;
  gender: string;
  battleJson: unknown;
  karma: number;
  pvpAggressorUntilMs: bigint;
  hp: number;
  pvpPendingDefeatJson: unknown;
  pvePendingDefeatJson: unknown;
};

function canPkAttackHero(
  row: HeroMapRow,
  viewerCharacterId: string
): boolean {
  if (!row.battleJson) return true;
  const bj = parseBattleJson(row.battleJson);
  if (!bj) return false;
  if (!isPvpBattleJson(bj)) return true;
  return bj.pvpTargetCharacterId === viewerCharacterId;
}

/** Read-only: герої в радіусі MAP_NEARBY_HERO_RADIUS (без мутацій позиції в БД). */
export async function getNearbyHeroesForMap(
  worldX: number,
  worldY: number,
  excludeCharacterId: string,
  nowMs: number = Date.now()
): Promise<NearbyHeroEntry[]> {
  const R = MAP_NEARBY_HERO_RADIUS;
  const R2 = R * R;
  const exclude = String(excludeCharacterId || '').trim();
  if (!exclude) return [];

  const rows = await prisma.character.findMany({
    where: {
      id: { not: exclude },
      worldX: { gte: worldX - R, lte: worldX + R },
      worldY: { gte: worldY - R, lte: worldY + R },
    },
    select: HERO_MAP_SELECT,
    take: 200,
  });

  const candidates: NearbyHeroEntry[] = [];
  for (const raw of rows) {
    const row = raw as unknown as HeroMapRow;
    const moved = resolveMapMovement(row);
    const hx = moved.worldX;
    const hy = moved.worldY;
    const dx = hx - worldX;
    const dy = hy - worldY;
    if (dx * dx + dy * dy > R2) continue;
    if (isInPvpSafeZone(hx, hy)) continue;
    if (!isCharacterOnlineNow(row.id)) continue;
    if (Math.max(0, Math.floor(Number(row.hp) || 0)) <= 0) continue;
    if (parsePvpPendingDefeat(row.pvpPendingDefeatJson)) continue;
    if (parsePvePendingDefeat(row.pvePendingDefeatJson)) continue;
    const d = Math.hypot(dx, dy);
    const karma = Math.max(0, Math.floor(Number(row.karma) || 0));
    const pvpNickColor = resolvePvpNickColor(
      karma,
      row.pvpAggressorUntilMs,
      nowMs
    );
    const pkAllowed = canPkAttackHero(row, exclude);
    candidates.push({
      characterId: row.id,
      name: row.name,
      level: getEffectiveCharacterLevel(row.exp),
      worldX: hx,
      worldY: hy,
      distance: Math.round(d),
      inBattleRange: d <= BATTLE_RANGE,
      inBattle: row.battleJson != null,
      canPkAttack: pkAllowed,
      pvpNickColor,
      isOnline: isCharacterOnlineNow(row.id),
      gender: row.gender || 'male',
      l2Profession: row.l2Profession || '',
      pk: karma > 0 ? karma : 0,
    });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates.slice(0, MAX_NEARBY_HEROES);
}
