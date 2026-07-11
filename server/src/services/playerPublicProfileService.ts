import { MAP_TOWNS } from '../data/mapLocalities.js';
import { prisma } from '../lib/prisma.js';
import { isCharacterOnlineNow } from './onlinePresenceService.js';

export type PlayerPublicProfileDto = {
  id: string;
  name: string;
  level: number;
  race: string;
  classBranch: string;
  gender: string;
  l2Profession: string;
  cityId: string;
  cityLabelUk: string;
  profileStatus: string | null;
  clanName: string | null;
  karma: number;
  pk: number;
  recommendations: number;
  recommendationsLeft: number;
  mobsKilled: number;
  pvpWins: number;
  pvpLosses: number;
  /** ISO — остання активність (для «був у мережі …»). */
  lastSeenAt: string;
  isOnline: boolean;
  registeredAt: string;
};

const PROFILE_SELECT = {
  id: true,
  name: true,
  level: true,
  race: true,
  classBranch: true,
  gender: true,
  l2Profession: true,
  cityId: true,
  mobsKilled: true,
  lastUpdate: true,
} as const;

type ProfileRow = {
  id: string;
  name: string;
  level: number;
  race: string;
  classBranch: string;
  gender: string;
  l2Profession: string;
  cityId: string;
  mobsKilled: number;
  lastUpdate: Date;
};

function resolveCityLabelUk(cityId: string): string {
  const id = String(cityId || '').trim();
  const town = MAP_TOWNS.find((t) => t.cityId === id);
  return town?.labelUk || id || '—';
}

function rowToProfile(row: ProfileRow): PlayerPublicProfileDto {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    race: row.race,
    classBranch: row.classBranch,
    gender: row.gender,
    l2Profession: row.l2Profession,
    cityId: row.cityId,
    cityLabelUk: resolveCityLabelUk(row.cityId),
    profileStatus: null,
    clanName: null,
    karma: 0,
    pk: 0,
    recommendations: 0,
    recommendationsLeft: 0,
    mobsKilled: Math.max(0, Math.floor(Number(row.mobsKilled) || 0)),
    pvpWins: 0,
    pvpLosses: 0,
    lastSeenAt: row.lastUpdate.toISOString(),
    isOnline: isCharacterOnlineNow(row.id),
    registeredAt: row.lastUpdate.toISOString(),
  };
}

export async function getPlayerPublicProfileById(
  characterId: string
): Promise<PlayerPublicProfileDto | null> {
  const id = String(characterId || '').trim();
  if (!id) return null;

  const row = await prisma.character.findUnique({
    where: { id },
    select: PROFILE_SELECT,
  });
  if (!row) return null;
  return rowToProfile(row);
}

export async function getPlayerPublicProfileByName(
  name: string
): Promise<PlayerPublicProfileDto | null> {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;

  const row = await prisma.character.findUnique({
    where: { name: trimmed },
    select: PROFILE_SELECT,
  });
  if (!row) return null;
  return rowToProfile(row);
}
