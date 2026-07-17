import { prisma } from '../lib/prisma.js';
import {
  CLAN_HALL_BLESSING_COST_ADENA,
  buildClanHallView,
  type ClanHallView,
} from '../domain/clanHall.js';
import { gameConflictFromMutation } from './charConflict.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

export type ClanHallPurchaseResult = {
  character: CharacterSnapshot;
  hall: ClanHallView;
};

async function loadHallStateForUser(userId: string): Promise<{
  clanId: string | null;
  clanRole: string | null;
  hallBlessingAt: Date | null;
} | null> {
  const char = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: {
      clanId: true,
      clanRole: true,
      clan: { select: { hallBlessingAt: true } },
    },
  });
  if (!char) return null;
  return {
    clanId: char.clanId,
    clanRole: char.clanRole,
    hallBlessingAt: char.clan?.hallBlessingAt ?? null,
  };
}

/** null — персонаж не в клані. */
export async function getClanHallForUser(
  userId: string
): Promise<ClanHallView | null> {
  const row = await loadHallStateForUser(userId);
  if (!row?.clanId) return null;
  const hasBlessing = row.hallBlessingAt != null;
  const canBuy = row.clanRole === 'leader' && !hasBlessing;
  return buildClanHallView(hasBlessing, canBuy);
}

/** Купити благословення Клан-холу (лише лідер, списання adena). */
export async function purchaseClanHallBlessingForUser(
  userId: string,
  expectedRevision: number
): Promise<ClanHallPurchaseResult> {
  return prisma.$transaction(async (tx) => {
    const char = (await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');
    if (!char.clanId) throw new Error('clan_hall_not_in_clan');
    if (char.clanRole !== 'leader') throw new Error('clan_hall_buy_forbidden');

    const clan = await tx.clan.findUnique({
      where: { id: char.clanId },
      select: { id: true, hallBlessingAt: true },
    });
    if (!clan) throw new Error('clan_hall_not_in_clan');
    if (clan.hallBlessingAt != null) throw new Error('clan_hall_already_owned');

    if (BigInt(char.adena) < CLAN_HALL_BLESSING_COST_ADENA) {
      throw new Error('clan_hall_not_enough_adena');
    }
    if (char.battleJson != null) {
      throw new Error('clan_hall_in_battle');
    }

    const nextAdena = BigInt(char.adena) - CLAN_HALL_BLESSING_COST_ADENA;
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = current as CharacterRow;
        if (!base.clanId) throw new Error('clan_hall_not_in_clan');
        if (base.clanRole !== 'leader') throw new Error('clan_hall_buy_forbidden');
        if (BigInt(base.adena) < CLAN_HALL_BLESSING_COST_ADENA) {
          throw new Error('clan_hall_not_enough_adena');
        }
        if (base.battleJson != null) throw new Error('clan_hall_in_battle');
        return {
          changed: true,
          data: { adena: nextAdena },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    await tx.clan.update({
      where: { id: clan.id },
      data: { hallBlessingAt: new Date() },
    });

    const fresh = (await tx.character.findUnique({
      where: { id: char.id },
    })) as CharacterRow | null;
    if (!fresh) throw new Error('no_character');

    return {
      character: await buildCharacterClientSnapshot(fresh, userId),
      hall: buildClanHallView(true, false),
    };
  });
}
