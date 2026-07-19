import type { ClanSiege, Prisma } from '@prisma/client';
import {
  CLAN_SIEGE_FINISH_REASON,
  CLAN_SIEGE_STATE,
} from '../../domain/clanSiegeConstants.js';

type Tx = Prisma.TransactionClient;

export type ClanSiegeWallActionRow = {
  id: string;
  siegeId: string;
  characterId: string;
  actionId: string;
  damage: number;
  wallHpAfter: number;
  siegeVersionAfter: number;
  characterTotalAfter: number;
  clanTotalAfter: number;
  createdAt: Date;
};

export async function findClanSiegeWallActionInTx(
  tx: Tx,
  siegeId: string,
  characterId: string,
  actionId: string
): Promise<ClanSiegeWallActionRow | null> {
  return tx.clanSiegeWallAction.findUnique({
    where: {
      siegeId_characterId_actionId: {
        siegeId,
        characterId,
        actionId,
      },
    },
  });
}

export async function createClanSiegeWallActionInTx(
  tx: Tx,
  data: {
    siegeId: string;
    characterId: string;
    actionId: string;
    damage: number;
    wallHpAfter: number;
    siegeVersionAfter: number;
    characterTotalAfter: number;
    clanTotalAfter: number;
  }
): Promise<ClanSiegeWallActionRow> {
  return tx.clanSiegeWallAction.create({ data });
}

/** Idempotent replay payload from ledger row + current siege meta. */
export function siegeViewFromWallAction(
  siege: ClanSiege,
  action: ClanSiegeWallActionRow
): Pick<
  ClanSiege,
  'wallHp' | 'wallMaxHp' | 'version' | 'state' | 'finishReason' | 'winnerClanId'
> {
  return {
    wallHp: action.wallHpAfter,
    wallMaxHp: siege.wallMaxHp,
    version: action.siegeVersionAfter,
    state:
      siege.state === CLAN_SIEGE_STATE.finished
        ? CLAN_SIEGE_STATE.finished
        : action.wallHpAfter <= 0
          ? CLAN_SIEGE_STATE.finished
          : siege.state,
    finishReason:
      siege.finishReason ??
      (action.wallHpAfter <= 0
        ? CLAN_SIEGE_FINISH_REASON.wallDestroyed
        : null),
    winnerClanId: siege.winnerClanId,
  };
}
