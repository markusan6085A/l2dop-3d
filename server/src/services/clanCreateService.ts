import { prisma } from '../lib/prisma.js';
import {
  CLAN_CREATE_COST_ADENA,
  CLAN_CREATE_MIN_LEVEL,
  normalizeClanName,
} from '../domain/clanCreate.js';
import { parseClanEmblemId } from '../domain/clanEmblem.js';
import { CLAN_START_LEVEL } from '../domain/clanLevel.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { gameConflictFromMutation } from './charConflict.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

const CHARACTER_WITH_CLAN = {
  include: {
    clan: { select: { name: true, emblemId: true } },
  },
} as const;

type CharacterWithClanRow = CharacterRow & {
  clan?: { name: string; emblemId?: number | null } | null;
};

function rowWithClanInclude(row: CharacterWithClanRow): CharacterRow {
  return row as CharacterRow;
}

function assertCanCreateClan(row: CharacterRow, clanName: string): void {
  if (row.battleJson != null) {
    throw new Error('clan_create_in_battle');
  }
  const level = levelFromTotalExp(row.exp);
  if (level < CLAN_CREATE_MIN_LEVEL) {
    throw new Error('clan_create_level');
  }
  if (row.clanId) {
    throw new Error('clan_create_already_in_clan');
  }
  const adena = BigInt(row.adena);
  if (adena < CLAN_CREATE_COST_ADENA) {
    throw new Error('clan_create_not_enough_adena');
  }
  if (!clanName) {
    throw new Error('clan_name_required');
  }
}

/** Створити клан: списати adena, прив’язати персонажа як leader. */
export async function createClanForUser(
  userId: string,
  expectedRevision: number,
  rawName: unknown,
  rawEmblemId?: unknown
): Promise<CharacterSnapshot> {
  const parsed = normalizeClanName(rawName);
  if (!parsed.ok) {
    throw new Error(parsed.code);
  }
  const clanName = parsed.name;
  let emblemId: number | null = null;
  if (rawEmblemId !== undefined && rawEmblemId !== null && rawEmblemId !== '') {
    const emblemParsed = parseClanEmblemId(rawEmblemId);
    if (!emblemParsed.ok) {
      throw new Error(emblemParsed.code);
    }
    emblemId = emblemParsed.emblemId;
  }

  return prisma.$transaction(async (tx) => {
    const char = (await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');

    assertCanCreateClan(char, clanName);

    const taken = await tx.clan.findUnique({
      where: { name: clanName },
      select: { id: true },
    });
    if (taken) {
      throw new Error('clan_name_taken');
    }

    const clan = await tx.clan.create({
      data: {
        name: clanName,
        leaderId: char.id,
        emblemId,
        level: CLAN_START_LEVEL,
      },
    });

    const nextAdena = BigInt(char.adena) - CLAN_CREATE_COST_ADENA;
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = current as CharacterRow;
        if (base.clanId) {
          throw new Error('clan_create_already_in_clan');
        }
        if (BigInt(base.adena) < CLAN_CREATE_COST_ADENA) {
          throw new Error('clan_create_not_enough_adena');
        }
        if (levelFromTotalExp(base.exp) < CLAN_CREATE_MIN_LEVEL) {
          throw new Error('clan_create_level');
        }
        if (base.battleJson != null) {
          throw new Error('clan_create_in_battle');
        }
        return {
          changed: true,
          data: {
            adena: nextAdena,
            clanId: clan.id,
            clanRole: 'leader',
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    const fresh = (await tx.character.findUnique({
      where: { id: char.id },
      ...CHARACTER_WITH_CLAN,
    })) as CharacterWithClanRow | null;
    if (!fresh) throw new Error('no_character');
    return buildCharacterClientSnapshot(rowWithClanInclude(fresh), userId);
  });
}

export type ClanListEntry = {
  id: string;
  name: string;
  leaderName: string;
  emblemId: number | null;
};

/** Список кланів для hub-сторінки (нік лідера: назва клану). */
export async function listClansForClient(): Promise<ClanListEntry[]> {
  const rows = await prisma.clan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      emblemId: true,
      leader: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    leaderName: r.leader.name,
    emblemId: r.emblemId ?? null,
  }));
}

/** Завантажити персонажа з clan include для snapshot. */
export async function findCharacterRowWithClan(
  userId: string
): Promise<CharacterWithClanRow | null> {
  return (await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    ...CHARACTER_WITH_CLAN,
  })) as CharacterWithClanRow | null;
}
