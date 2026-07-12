import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { prisma } from '../lib/prisma.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';

export interface PvpIncomingAttack {
  attackerCharacterId: string;
  attackerName: string;
  attackerLevel: number;
}

/** Хто зараз б'є цього гравця в PvP — точковий JSON-запит замість scan 400 battleJson. */
export async function findPvpIncomingForCharacter(
  characterId: string
): Promise<PvpIncomingAttack | null> {
  const selfId = String(characterId || '').trim();
  if (!selfId) return null;

  const row = await prisma.character.findFirst({
    where: {
      battleJson: {
        path: ['pvpTargetCharacterId'],
        equals: selfId,
      },
    },
    select: {
      id: true,
      name: true,
      exp: true,
      battleJson: true,
    },
  });
  if (!row) return null;

  const bj = parseBattleJson(row.battleJson);
  if (!bj || !isPvpBattleJson(bj)) return null;
  if (bj.pvpTargetCharacterId !== selfId) return null;

  return {
    attackerCharacterId: row.id,
    attackerName: row.name,
    attackerLevel: levelFromTotalExp(row.exp),
  };
}
