import type { Prisma } from '@prisma/client';
import { parseBattleJson } from '../battleServiceParseBattleJson.js';

type Tx = Prisma.TransactionClient;

export type CharacterCpHpSnapshot = {
  hp: number;
  cp: number;
};

export async function readCharacterCpHpInTx(
  tx: Tx,
  characterId: string
): Promise<CharacterCpHpSnapshot | null> {
  const cid = String(characterId || '').trim();
  if (!cid) return null;
  const row = await tx.character.findFirst({
    where: { id: cid },
    select: { hp: true, battleJson: true },
  });
  if (!row) return null;
  const bj = parseBattleJson(row.battleJson);
  let cp = 0;
  if (typeof bj?.playerCp === 'number' && Number.isFinite(bj.playerCp)) {
    cp = Math.max(0, Math.floor(bj.playerCp));
  } else if (
    typeof bj?.playerMaxCp === 'number' &&
    Number.isFinite(bj.playerMaxCp)
  ) {
    cp = Math.max(0, Math.floor(bj.playerMaxCp));
  }
  return {
    hp: Math.max(0, Math.floor(Number(row.hp) || 0)),
    cp,
  };
}

export function computeAppliedCpHpDamage(
  before: CharacterCpHpSnapshot,
  after: CharacterCpHpSnapshot
): number {
  const hpLost = Math.max(0, before.hp - after.hp);
  const cpLost = Math.max(0, before.cp - after.cp);
  return hpLost + cpLost;
}

export async function recordSiegeIncomingPvpHitInTx(
  tx: Tx,
  args: {
    siegeId: string;
    victimCharacterId: string;
    attackerCharacterId: string;
    attackerName: string;
    appliedDamage: number;
    nowMs: number;
  }
): Promise<void> {
  const siegeId = String(args.siegeId || '').trim();
  const victimCharacterId = String(args.victimCharacterId || '').trim();
  const attackerCharacterId = String(args.attackerCharacterId || '').trim();
  const applied = Math.max(0, Math.floor(args.appliedDamage));
  if (!siegeId || !victimCharacterId || !attackerCharacterId || applied <= 0) {
    return;
  }
  const attackerName = String(args.attackerName || '').trim().slice(0, 64);
  if (!attackerName) return;

  await tx.clanSiegeParticipant.updateMany({
    where: { siegeId, characterId: victimCharacterId },
    data: {
      lastIncomingAttackerCharacterId: attackerCharacterId,
      lastIncomingAttackerName: attackerName,
      lastIncomingDamage: applied,
      lastIncomingAt: new Date(args.nowMs),
    },
  });
}
