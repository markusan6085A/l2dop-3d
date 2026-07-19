import type { Prisma } from '@prisma/client';
import {
  L2DOP_MAX_TOTAL_EXP_INCLUSIVE,
  levelFromTotalExp,
} from '../../data/l2dopExpgain.js';
import { addItemToBag, parseInventory } from '../../data/inventory.js';
import { COIN_OF_LUCK_ITEM_ID } from '../../domain/dailyQuestRewards.js';
import type { ClanTaskPersonalReward } from '../../domain/clanTasks.js';
import { mutateCharacterWithRevision } from '../characterMutation.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusInTx,
} from '../characterClanHallVitals.js';
import type { CharacterRow } from '../charService.js';

type Tx = Prisma.TransactionClient;

export async function grantClanTaskPersonalRewardInTx(
  tx: Tx,
  ownerId: string,
  reward: ClanTaskPersonalReward
): Promise<void> {
  const hasReward =
    reward.exp > 0 || reward.adena > 0 || reward.coinOfLuck > 0;
  if (!hasReward) return;

  const result = await mutateCharacterWithRevision(tx, ownerId, null, (row) => {
    const data: Prisma.CharacterUpdateManyMutationInput = {};
    let changed = false;

    if (reward.exp > 0) {
      let newExp = row.exp + BigInt(reward.exp);
      if (newExp > L2DOP_MAX_TOTAL_EXP_INCLUSIVE) {
        newExp = L2DOP_MAX_TOTAL_EXP_INCLUSIVE;
      }
      data.exp = newExp;
      changed = true;
    }

    if (reward.adena > 0) {
      data.adena = { increment: BigInt(reward.adena) };
      changed = true;
    }

    if (reward.coinOfLuck > 0) {
      const inv = parseInventory(row.inventoryJson);
      const nextInv = addItemToBag(inv, COIN_OF_LUCK_ITEM_ID, reward.coinOfLuck);
      data.inventoryJson = nextInv as unknown as Prisma.InputJsonValue;
      changed = true;
    }

    if (!changed) return { changed: false };
    return { changed: true, data };
  });

  if (!result.ok) throw new Error('clan_task_owner_reward_failed');

  if (reward.exp > 0) {
    const fresh = await tx.character.findUnique({ where: { id: ownerId } });
    if (!fresh) return;
    const newLevel = levelFromTotalExp(fresh.exp);
    if (newLevel !== fresh.level) {
      const clanHallBonus = await resolveClanHallBonusInTx(tx, fresh);
      const vitals = computeCharacterVitalsBundle({
        row: fresh as CharacterRow,
        clanHallBonus,
      });
      await tx.character.update({
        where: { id: ownerId },
        data: {
          level: newLevel,
          hp: vitals.maxHpChain.maxHpWithClanHall,
          maxHp: vitals.maxHpChain.maxHpWithClanHall,
        },
      });
    }
  }
}

export function formatClanTaskPersonalRewardUk(
  reward: ClanTaskPersonalReward
): string {
  const parts: string[] = [];
  if (reward.exp > 0) {
    parts.push(reward.exp.toLocaleString('uk-UA') + ' досвіду');
  }
  if (reward.adena > 0) {
    parts.push(reward.adena.toLocaleString('uk-UA') + ' адени');
  }
  if (reward.coinOfLuck > 0) {
    parts.push(reward.coinOfLuck + ' Coin of Luck');
  }
  return parts.join(', ');
}
