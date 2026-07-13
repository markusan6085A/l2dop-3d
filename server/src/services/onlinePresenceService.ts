import { MAP_TOWNS } from '../data/mapLocalities.js';
import { prisma } from '../lib/prisma.js';

/** Активність за останні N хв — вважаємо «в онлайні». */
const ONLINE_TTL_MS = 10 * 60 * 1000;

export type OnlineSortMode = 'level' | 'name';

type PresenceEntry = {
  characterId: string;
  name: string;
  level: number;
  cityId: string;
  cityLabelUk: string;
  cityLabelEn: string;
  lastSeenMs: number;
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
    select: { id: true, name: true, level: true, cityId: true },
  });
  const labels = resolveCityLabels(row?.cityId ?? '');
  return {
    characterId: row?.id?.trim() || '',
    name: row?.name?.trim() || '—',
    level: row?.level != null ? Number(row.level) : 1,
    cityId: row?.cityId?.trim() || '',
    cityLabelUk: labels.cityLabelUk,
    cityLabelEn: labels.cityLabelEn,
    lastSeenMs: Date.now(),
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
  cityId: string;
  cityLabelUk: string;
  cityLabelEn: string;
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
  out.sort((a, b) => {
    const dl = b.level - a.level;
    if (dl !== 0) return dl;
    return a.name.localeCompare(b.name, 'uk');
  });
  return out;
}

export function getOnlinePresenceSnapshot(
  sort: OnlineSortMode = 'level'
): OnlinePresenceSnapshot {
  const now = Date.now();
  pruneExpired(now);

  const players: OnlinePresencePlayer[] = [];
  for (const entry of byUserId.values()) {
    if (now - entry.lastSeenMs <= ONLINE_TTL_MS) {
      players.push({
        characterId: entry.characterId,
        name: entry.name,
        level: entry.level,
        cityId: entry.cityId,
        cityLabelUk: entry.cityLabelUk,
        cityLabelEn: entry.cityLabelEn,
      });
    }
  }

  return {
    count: players.length,
    players: sortPlayers(players, sort),
  };
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
