import { Prisma } from '@prisma/client';
import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import { prisma } from '../lib/prisma.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';

export interface PvpIncomingAttack {
  attackerCharacterId: string;
  attackerName: string;
  attackerLevel: number;
}

/** Хто зараз б'є цього гравця в PvP (battleJson.pvpTargetCharacterId). */
export async function findPvpIncomingForCharacter(
  characterId: string
): Promise<PvpIncomingAttack | null> {
  const selfId = String(characterId || '').trim();
  if (!selfId) return null;

  const rows = await prisma.character.findMany({
    where: { battleJson: { not: Prisma.JsonNull } },
    select: {
      id: true,
      name: true,
      exp: true,
      battleJson: true,
    },
    take: 400,
  });

  for (const row of rows) {
    if (row.id === selfId) continue;
    const bj = parseBattleJson(row.battleJson);
    if (!bj || !isPvpBattleJson(bj)) continue;
    if (bj.pvpTargetCharacterId !== selfId) continue;
    return {
      attackerCharacterId: row.id,
      attackerName: row.name,
      attackerLevel: levelFromTotalExp(row.exp),
    };
  }
  return null;
}
