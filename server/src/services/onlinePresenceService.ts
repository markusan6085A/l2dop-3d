import { MAP_TOWNS } from '../data/mapLocalities.js';
import { isCharacterVisibleOnWorldMap } from '../domain/mapHeroWorldVisibility.js';
import { resolveCanonicalMapLocation } from '../domain/mapPlayfieldContext.js';
import { getEffectiveCharacterLevel } from '../domain/effectiveCharacterLevel.js';
import { prisma } from '../lib/prisma.js';
import { HERO_POWER_BASE } from '../domain/heroPower.js';
import { resolveHeroPowerFromCharacterRow } from './charSnapshotLogic.js';
import type { CharacterRow } from './charTypes.js';

/** Активність за останні N хв — вважаємо «в онлайні». */
const ONLINE_TTL_MS = 10 * 60 * 1000;

export type OnlineSortMode = 'level' | 'name' | 'power';

export type CharacterPlayfieldUi = 'world_map' | 'city';

type PresenceEntry = {
  characterId: string;
  name: string;
  level: number;
  heroPower: number;
  cityId: string;
  canonicalLocationKey: string;
  cityLabelUk: string;
  cityLabelEn: string;
  clanEmblemId: number | null;
  lastSeenMs: number;
  playfieldUi: CharacterPlayfieldUi;
};

const byUserId = new Map<string, PresenceEntry>();

function resolveCityLabels(cityId: string): { cityLabelUk: string; cityLabelEn: string } {
  const id = String(cityId || '').trim();
  const town = MAP_TOWNS.find((t) => t.cityId === id);
  if (town) {
    return { cityLabelUk: town.labelUk, cityLabelEn: town.labelEn };
  }
  return { cityLabelUk: id || '—', cityLabelEn: id || '—' };
}

async function loadPresenceEntry(userId: string): Promise<PresenceEntry> {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    include: { clan: { select: { emblemId: true } } },
  });
  const labels = resolveCityLabels(row?.cityId ?? '');
  const heroRow = row as CharacterRow | null;
  const heroPower =
    heroRow != null
      ? resolveHeroPowerFromCharacterRow(heroRow)
      : HERO_POWER_BASE;
  const canonicalLocationKey = row
    ? resolveCanonicalMapLocation({
        worldX: row.worldX,
        worldY: row.worldY,
        dungeonStateJson: row.dungeonStateJson,
      }).key
    : '';
  const playfieldUi: CharacterPlayfieldUi = row
    ? isCharacterVisibleOnWorldMap({
        worldX: row.worldX,
        worldY: row.worldY,
        dungeonStateJson: row.dungeonStateJson,
      })
      ? 'world_map'
      : 'city'
    : 'city';
  return {
    characterId: row?.id?.trim() || '',
    name: row?.name?.trim() || '—',
    level: row != null ? getEffectiveCharacterLevel(row.exp) : 1,
    heroPower,
    cityId: row?.cityId?.trim() || '',
    canonicalLocationKey,
    cityLabelUk: labels.cityLabelUk,
    cityLabelEn: labels.cityLabelEn,
    clanEmblemId: row?.clan?.emblemId ?? null,
    lastSeenMs: Date.now(),
    playfieldUi,
  };
}

/** Оновити присутність (викликати після успішної auth-дії). */
export async function touchOnlinePresence(userId: string): Promise<void> {
  const id = String(userId || '').trim();
  if (!id) return;
  const entry = await loadPresenceEntry(id);
  byUserId.set(id, entry);
}

export type OnlinePresencePlayer = {
  characterId: string;
  name: string;
  level: number;
  heroPower: number;
  cityId: string;
  cityLabelUk: string;
  cityLabelEn: string;
  clanEmblemId: number | null;
};

export type OnlinePresenceSnapshot = {
  count: number;
  players: OnlinePresencePlayer[];
};

function pruneExpired(now: number): void {
  for (const [userId, entry] of byUserId) {
    if (now - entry.lastSeenMs > ONLINE_TTL_MS) {
      byUserId.delete(userId);
    }
  }
}

function sortPlayers(
  players: OnlinePresencePlayer[],
  sort: OnlineSortMode
): OnlinePresencePlayer[] {
  const out = players.slice();
  if (sort === 'name') {
    out.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    return out;
  }
  if (sort === 'power') {
    out.sort((a, b) => {
      const dp = b.heroPower - a.heroPower;
      if (dp !== 0) return dp;
      return a.name.localeCompare(b.name, 'uk');
    });
    return out;
  }
  out.sort((a, b) => {
    const dl = b.level - a.level;
    if (dl !== 0) return dl;
    return a.name.localeCompare(b.name, 'uk');
  });
  return out;
}

async function resolveCanonicalLevelsByCharacterId(
  characterIds: string[]
): Promise<Map<string, number>> {
  const ids = [...new Set(characterIds.map((id) => String(id || '').trim()).filter(Boolean))];
  if (!ids.length) return new Map();

  const rows = await prisma.character.findMany({
    where: { id: { in: ids } },
    select: { id: true, exp: true },
  });
  const out = new Map<string, number>();
  for (const row of rows) {
    out.set(row.id, getEffectiveCharacterLevel(row.exp));
  }
  return out;
}

export async function getOnlinePresenceSnapshot(
  sort: OnlineSortMode = 'level'
): Promise<OnlinePresenceSnapshot> {
  const now = Date.now();
  pruneExpired(now);

  const activeEntries: PresenceEntry[] = [];
  for (const entry of byUserId.values()) {
    if (now - entry.lastSeenMs <= ONLINE_TTL_MS) {
      activeEntries.push(entry);
    }
  }

  const canonicalLevels = await resolveCanonicalLevelsByCharacterId(
    activeEntries.map((entry) => entry.characterId)
  );

  const players: OnlinePresencePlayer[] = [];
  for (const entry of activeEntries) {
    const canonicalLevel = canonicalLevels.get(entry.characterId);
    if (canonicalLevel != null) {
      entry.level = canonicalLevel;
    }
    players.push({
      characterId: entry.characterId,
      name: entry.name,
      level: canonicalLevel ?? entry.level,
      heroPower:
        typeof entry.heroPower === 'number' && Number.isFinite(entry.heroPower)
          ? entry.heroPower
          : HERO_POWER_BASE,
      cityId: entry.cityId,
      cityLabelUk: entry.cityLabelUk,
      cityLabelEn: entry.cityLabelEn,
      clanEmblemId: entry.clanEmblemId,
    });
  }

  return {
    count: players.length,
    players: sortPlayers(players, sort),
  };
}

/** world-pk-map smoke: inject stale cached level without DB change. */
export function setOnlinePresenceCachedLevelForSmoke(
  characterId: string,
  staleLevel: number
): boolean {
  const id = String(characterId || '').trim();
  if (!id) return false;
  for (const entry of byUserId.values()) {
    if (entry.characterId === id) {
      entry.level = Math.max(1, Math.floor(Number(staleLevel) || 1));
      return true;
    }
  }
  return false;
}

/** Час останньої активності userId/characterId у presence-map (epoch ms). */
export function getCharacterLastSeenMs(characterId: string): number | null {
  const id = String(characterId || '').trim();
  if (!id) return null;
  const now = Date.now();
  pruneExpired(now);
  for (const entry of byUserId.values()) {
    if (entry.characterId === id) {
      return entry.lastSeenMs;
    }
  }
  return null;
}

/** Canonical playfield key з in-memory presence (map anti-stale). */
export function getPresenceCanonicalLocationKeyForCharacter(
  characterId: string
): string | null {
  const id = String(characterId || '').trim();
  if (!id) return null;
  const now = Date.now();
  pruneExpired(now);
  for (const entry of byUserId.values()) {
    if (entry.characterId === id && now - entry.lastSeenMs <= ONLINE_TTL_MS) {
      const key = String(entry.canonicalLocationKey || '').trim();
      return key || null;
    }
  }
  return null;
}

/** cityId з in-memory presence (read-path для map nearbyHeroes anti-stale). */
export function getPresenceCityIdForCharacter(characterId: string): string | null {
  const id = String(characterId || '').trim();
  if (!id) return null;
  const now = Date.now();
  pruneExpired(now);
  for (const entry of byUserId.values()) {
    if (entry.characterId === id && now - entry.lastSeenMs <= ONLINE_TTL_MS) {
      const cityId = String(entry.cityId || '').trim();
      return cityId || null;
    }
  }
  return null;
}

/** UI-шар гравця: world map vs city (anti-stale для nearbyHeroes). */
export function getPresencePlayfieldUiForCharacter(
  characterId: string
): CharacterPlayfieldUi | null {
  const id = String(characterId || '').trim();
  if (!id) return null;
  const now = Date.now();
  pruneExpired(now);
  for (const entry of byUserId.values()) {
    if (entry.characterId === id && now - entry.lastSeenMs <= ONLINE_TTL_MS) {
      return entry.playfieldUi;
    }
  }
  return null;
}

/** Оновити playfield UI без reload з БД (map/city navigation). */
export function markCharacterPlayfieldUiForUser(
  userId: string,
  playfieldUi: CharacterPlayfieldUi
): void {
  const id = String(userId || '').trim();
  if (!id) return;
  const entry = byUserId.get(id);
  if (entry) {
    entry.playfieldUi = playfieldUi;
    entry.lastSeenMs = Date.now();
  }
}

/** Свіжі координати з БД + явний world_map UI (map.html / телепорт на поле). */
export async function syncWorldMapPresenceForUser(userId: string): Promise<void> {
  await touchOnlinePresence(userId);
  markCharacterPlayfieldUiForUser(userId, 'world_map');
}

/** Чи персонаж зараз у списку онлайн (TTL 10 хв). */
export function isCharacterOnlineNow(characterId: string): boolean {
  const id = String(characterId || '').trim();
  if (!id) return false;
  const now = Date.now();
  pruneExpired(now);
  for (const entry of byUserId.values()) {
    if (entry.characterId === id && now - entry.lastSeenMs <= ONLINE_TTL_MS) {
      return true;
    }
  }
  return false;
}
