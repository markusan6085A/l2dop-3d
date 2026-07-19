import { prisma } from '../lib/prisma.js';
import {
  CLAN_MAX_LEVEL,
  buildClanLevelProgression,
  buildClanNextUpgrade,
  clanLevelUpCost,
  isValidClanLevel,
  type ClanLevelProgressionRow,
  type ClanNextUpgrade,
} from '../domain/clanLevel.js';

export type ClanLevelClanDto = {
  id: string;
  name: string;
  level: number;
  clanPoints: number;
  emblemId: number | null;
  isLeader: boolean;
};

export type ClanLevelView = {
  clan: ClanLevelClanDto;
  maxLevel: number;
  progression: ClanLevelProgressionRow[];
  nextUpgrade: ClanNextUpgrade | null;
};

const CLAN_LEVEL_SELECT = {
  id: true,
  name: true,
  level: true,
  clanPoints: true,
  emblemId: true,
} as const;

function buildClanLevelView(
  clan: {
    id: string;
    name: string;
    level: number;
    clanPoints: number;
    emblemId: number | null;
  },
  isLeader: boolean
): ClanLevelView {
  return {
    clan: {
      id: clan.id,
      name: clan.name,
      level: clan.level,
      clanPoints: clan.clanPoints,
      emblemId: clan.emblemId ?? null,
      isLeader,
    },
    maxLevel: CLAN_MAX_LEVEL,
    progression: buildClanLevelProgression(),
    nextUpgrade: buildClanNextUpgrade(clan.level, clan.clanPoints),
  };
}

async function loadClanMemberContext(userId: string): Promise<{
  characterId: string;
  clanRole: string | null;
  clan: {
    id: string;
    name: string;
    level: number;
    clanPoints: number;
    emblemId: number | null;
  };
} | null> {
  const char = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: {
      id: true,
      clanId: true,
      clanRole: true,
      clan: { select: CLAN_LEVEL_SELECT },
    },
  });
  if (!char?.clanId || !char.clan) return null;
  return {
    characterId: char.id,
    clanRole: char.clanRole,
    clan: char.clan,
  };
}

/** GET /game/clans/level — будь-який член клану. */
export async function getClanLevelProgressForUser(
  userId: string
): Promise<ClanLevelView | null> {
  const ctx = await loadClanMemberContext(userId);
  if (!ctx) return null;
  return buildClanLevelView(ctx.clan, ctx.clanRole === 'leader');
}

function parseExpectedClanLevel(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n)) throw new Error('clan_level_conflict');
  if (!isValidClanLevel(n)) throw new Error('clan_level_conflict');
  return n;
}

function mapAtomicLevelUpFailure(
  beforeLevel: number,
  fresh: { level: number; clanPoints: number } | null
): never {
  if (!fresh) throw new Error('clan_not_found');
  if (fresh.level !== beforeLevel) throw new Error('clan_level_conflict');
  if (fresh.level >= CLAN_MAX_LEVEL) throw new Error('clan_max_level');
  const cost = clanLevelUpCost(beforeLevel);
  if (cost != null && fresh.clanPoints < cost) {
    throw new Error('clan_points_insufficient');
  }
  throw new Error('clan_level_conflict');
}

/** POST /game/clans/level-up — лише лідер, +1 рівень атомарно. */
export async function levelUpClanForUser(
  userId: string,
  rawExpectedClanLevel: unknown
): Promise<ClanLevelView> {
  const expectedClanLevel = parseExpectedClanLevel(rawExpectedClanLevel);

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, clanId: true, clanRole: true },
    });
    if (!char?.clanId) throw new Error('clan_not_found');
    if (char.clanRole !== 'leader') throw new Error('clan_leader_required');

    const clan = await tx.clan.findUnique({
      where: { id: char.clanId },
      select: CLAN_LEVEL_SELECT,
    });
    if (!clan) throw new Error('clan_not_found');

    if (
      expectedClanLevel != null &&
      clan.level !== expectedClanLevel
    ) {
      throw new Error('clan_level_conflict');
    }

    const currentLevel = clan.level;
    if (currentLevel >= CLAN_MAX_LEVEL) {
      throw new Error('clan_max_level');
    }

    const cost = clanLevelUpCost(currentLevel);
    if (cost == null) throw new Error('clan_max_level');
    if (clan.clanPoints < cost) throw new Error('clan_points_insufficient');

    const updated = await tx.clan.updateMany({
      where: {
        id: clan.id,
        leaderId: char.id,
        level: currentLevel,
        clanPoints: { gte: cost },
      },
      data: {
        level: currentLevel + 1,
        clanPoints: { decrement: cost },
      },
    });

    if (updated.count !== 1) {
      const fresh = await tx.clan.findUnique({
        where: { id: clan.id },
        select: { level: true, clanPoints: true },
      });
      mapAtomicLevelUpFailure(currentLevel, fresh);
    }

    const after = await tx.clan.findUnique({
      where: { id: clan.id },
      select: CLAN_LEVEL_SELECT,
    });
    if (!after) throw new Error('clan_not_found');

    return buildClanLevelView(after, true);
  });
}
