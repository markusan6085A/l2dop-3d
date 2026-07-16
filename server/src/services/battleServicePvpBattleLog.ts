import { Prisma } from '@prisma/client';
import type { BattleActionId } from '../domain/battle.js';
import type { BattleJsonState } from '../domain/battleTypes.js';
import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import {
  applyBattleLogWriteInPlace,
  bumpBattleVersionInPlace,
} from '../domain/battleVersion.js';
import {
  buildPvpHitLogPair,
  pvpSkillLabelUkFromTurn,
} from '../domain/pvpBattleLog.js';
import {
  compactBattleSkillLogLineUk,
  formatBattleSkillLogLineForClient,
  l2SkillIdForBattleLogLine,
} from '../domain/battleLogFormat.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';

/** Дописати рядки в лог жертви PvP (poll `/game/battle/sync`). */
export async function appendPvpIncomingLogToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    lines: string[];
  }
): Promise<void> {
  const lines = args.lines.map((ln) => String(ln || '').trim()).filter(Boolean);
  if (!lines.length) return;

  const victimId = String(args.victimId || '').trim();
  const attackerId = String(args.attackerId || '').trim();
  if (!victimId || !attackerId || victimId === attackerId) return;

  const victim = await tx.character.findFirst({
    where: { id: victimId },
    select: { battleJson: true },
  });
  if (!victim) return;

  const victimBj = parseBattleJson(victim.battleJson);
  if (
    !victimBj ||
    !isPvpBattleJson(victimBj) ||
    victimBj.pvpTargetCharacterId !== attackerId
  ) {
    return;
  }

  const log = [...(victimBj.log ?? [])];
  for (const line of lines) log.push(line);
  applyBattleLogWriteInPlace(victimBj, log, lines.length);
  bumpBattleVersionInPlace(victimBj);

  await persistCharacterFieldsInTx(tx, victimId, {
    battleJson: serializeBattleJsonForDb(victimBj),
  });
}

/** PvP: рядок урону з іменем цілі + дзеркало на екран жертви. */
export async function appendPvpTurnHitLogsInTx(
  tx: Prisma.TransactionClient,
  args: {
    st: BattleJsonState;
    attackerId: string;
    attackerName: string;
    action: BattleActionId;
    skillLine?: string | null;
    pDmg: number;
    physOutcome: 'miss' | 'hit' | 'crit' | null;
    magicOutcome: 'miss' | 'hit' | 'crit' | null;
    log: string[];
  }
): Promise<void> {
  if (!isPvpBattleJson(args.st) || !args.st.pvpTargetCharacterId) return;

  const targetName = args.st.pvpTargetName?.trim() || 'Гравець';
  const isMiss =
    args.action === 'bolt'
      ? args.magicOutcome === 'miss'
      : args.physOutcome === 'miss';
  const isCrit =
    args.action === 'bolt'
      ? args.magicOutcome === 'crit' && args.pDmg > 0
      : args.physOutcome === 'crit' && args.pDmg > 0;

  const skillLabel = pvpSkillLabelUkFromTurn({
    action: args.action,
    skillLine: args.skillLine,
  });
  const { attackerLine, victimLine } = buildPvpHitLogPair({
    attackerName: args.attackerName,
    targetName,
    damage: args.pDmg,
    isCrit,
    isMiss,
    skillLabelUk: skillLabel,
  });

  const l2Id = l2SkillIdForBattleLogLine(args.action);
  const useSkillIcon = !!args.skillLine || args.action !== 'attack';
  const logLine = useSkillIcon
    ? formatBattleSkillLogLineForClient(
        compactBattleSkillLogLineUk(attackerLine),
        l2Id,
        !isMiss && args.pDmg > 0
      )
    : attackerLine;

  args.log.push(logLine);

  await appendPvpIncomingLogToVictimInTx(tx, {
    victimId: args.st.pvpTargetCharacterId,
    attackerId: args.attackerId,
    lines: [victimLine],
  });
}
