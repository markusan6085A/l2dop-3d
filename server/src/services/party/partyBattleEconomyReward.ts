import type { Prisma } from '@prisma/client';
import {
  L2DOP_MAX_TOTAL_EXP_INCLUSIVE,
  levelFromTotalExp,
} from '../../data/l2dopExpgain.js';
import type { CharacterRow } from '../charService.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusInTx,
} from '../characterClanHallVitals.js';
import { mutateCharacterWithRevision } from '../characterMutation.js';
import { gameConflictFromMutation } from '../charService.js';

type Tx = Prisma.TransactionClient;

/**
 * Economy-only reward для eligible non-killer.
 * Без inventory, quest/daily/mobsKilled, battleJson, movement.
 * expectedRevision=null — без touchDailyQuestPlayerActivity.
 */
export async function applyPartyEconomyRewardInTx(
  tx: Tx,
  char: CharacterRow,
  shares: {
    expGain: bigint;
    spGain: number;
    adenaGain: bigint;
  }
): Promise<CharacterRow> {
  let newExp = char.exp + shares.expGain;
  if (newExp > L2DOP_MAX_TOTAL_EXP_INCLUSIVE) {
    newExp = L2DOP_MAX_TOTAL_EXP_INCLUSIVE;
  }
  const preLevel = char.level;
  const newLevel = levelFromTotalExp(newExp);
  const rowAfterLevel = { ...char, exp: newExp, level: newLevel } as CharacterRow;
  const clanHallBonus = await resolveClanHallBonusInTx(tx, char);
  const vitals = computeCharacterVitalsBundle({
    row: rowAfterLevel,
    clanHallBonus,
  });
  const maxHpAfter = vitals.maxHpChain.maxHpWithClanHall;
  const leveledUp = newLevel > preLevel;

  const data: Prisma.CharacterUpdateManyMutationInput = {
    exp: newExp,
    sp: { increment: shares.spGain },
    adena: { increment: shares.adenaGain },
  };

  if (leveledUp) {
    data.level = newLevel;
    data.hp = maxHpAfter;
    data.maxHp = maxHpAfter;
  }

  const result = await mutateCharacterWithRevision(tx, char.id, null, () => ({
    changed: true,
    data,
  }));
  if (!result.ok) throw gameConflictFromMutation(result);
  return result.character as CharacterRow;
}
