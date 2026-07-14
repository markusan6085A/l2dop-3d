import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { parseInventory } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { prisma } from '../lib/prisma.js';
import {
  combatOptsFromRow,
  type CharacterRow,
} from './charService.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  battleCooldownsForSync,
  buildBattleSyncResponse,
} from './battleServiceDelta.js';
import type { BattleSyncResponse } from './battleServiceDeltaTypes.js';

export type BattleSyncQuery = {
  battleVersion?: number;
  lastLogSeq?: number;
};

/**
 * Строго read-only sync: без flush, tick, presence, FOR UPDATE, snapshot.
 */
export async function getBattleSyncForUser(
  userId: string,
  query: BattleSyncQuery
): Promise<BattleSyncResponse | null> {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) return null;

  const cr = row as CharacterRow;
  const revision = cr.revision;
  const clientBv = query.battleVersion;
  const clientLogSeq = query.lastLogSeq ?? 0;

  if (parsePvePendingDefeat(cr.pvePendingDefeatJson)) {
    const effLv = levelFromTotalExp(cr.exp);
    const inv = parseInventory(cr.inventoryJson);
    const combat = computeCombatStats(
      effLv,
      cr.race,
      cr.classBranch,
      inv,
      combatOptsFromRow(cr)
    );
    const vit = computeVitals(
      effLv,
      cr.race,
      cr.classBranch,
      combat.con,
      combat.men
    );
    const maxHpEff = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
    const maxMpEff = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
    return {
      changed: true,
      revision,
      battleVersion: 0,
      logSeq: 0,
      logTail: [],
      inBattle: false,
      characterHp: Math.max(0, cr.hp),
      characterMp: maxMpEff,
      characterMaxHp: maxHpEff,
      characterMaxMp: maxMpEff,
      outcome: 'DEFEAT',
      battleEnded: true,
    };
  }

  const bj = parseBattleJson(cr.battleJson);
  if (!bj) {
    const hadClientState =
      clientBv != null && clientBv > 0;
    return {
      changed: hadClientState,
      revision,
      battleVersion: 0,
      logSeq: 0,
      logTail: [],
      inBattle: false,
      outcome: null,
      battleEnded: false,
    };
  }

  const effLv = levelFromTotalExp(cr.exp);
  const inv = parseInventory(cr.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    cr.race,
    cr.classBranch,
    inv,
    combatOptsFromRow(cr)
  );
  const vit = computeVitals(
    effLv,
    cr.race,
    cr.classBranch,
    combat.con,
    combat.men
  );
  const maxHpEff = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const maxMpEff = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const playerMp =
    typeof bj.playerMp === 'number' && Number.isFinite(bj.playerMp)
      ? Math.max(0, Math.min(maxMpEff, Math.floor(bj.playerMp)))
      : maxMpEff;

  const nowMs = Date.now();
  const mysticSkillCdUntil = battleCooldownsForSync(cr, bj, nowMs);

  return buildBattleSyncResponse({
    row: cr,
    st: bj,
    maxHpEff,
    maxMpEff,
    playerMp,
    clientBattleVersion: clientBv,
    clientLastLogSeq: clientLogSeq,
    mysticSkillCdUntil,
  });
}
