import { Prisma } from '@prisma/client';
import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import {
  nextPvpAggressorUntilMs,
} from '../domain/pvpKarma.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';

/** Синхронізує урон PvP із HP жертви в БД (обидва боки взаємного бою). */
export async function applyPvpHitToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    damage: number;
    nowMs: number;
  }
): Promise<void> {
  const dmg = Math.max(0, Math.floor(args.damage));
  if (dmg <= 0) return;

  const victimId = String(args.victimId || '').trim();
  const attackerId = String(args.attackerId || '').trim();
  if (!victimId || !attackerId || victimId === attackerId) return;

  const victim = await tx.character.findFirst({
    where: { id: victimId },
  });
  if (!victim) return;

  const newHp = Math.max(0, victim.hp - dmg);
  const victimData: Prisma.CharacterUncheckedUpdateInput = {
    hp: newHp,
  };

  const victimBj = parseBattleJson(victim.battleJson);
  if (
    victimBj &&
    isPvpBattleJson(victimBj) &&
    victimBj.pvpTargetCharacterId === attackerId
  ) {
    const patch = {
      ...victimBj,
      playerHp: newHp,
    };
    /** Агресора вдарили у відповідь — карма за вбивство не нараховується. */
    if (victimBj.pvpIsAggressor === true) {
      patch.pvpVictimFoughtBack = true;
    }
    victimData.battleJson = serializeBattleJsonForDb(patch);
  }

  await tx.character.update({
    where: { id: victimId },
    data: victimData,
  });

  await tx.character.update({
    where: { id: attackerId },
    data: {
      pvpAggressorUntilMs: nextPvpAggressorUntilMs(args.nowMs),
    },
  });
}
