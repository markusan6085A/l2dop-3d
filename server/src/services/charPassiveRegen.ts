import { prisma } from '../lib/prisma.js';
import { parseInventory } from '../data/inventory.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import type { CharacterRow } from './charTypes.js';
import {
  combatOptsFromRow,
  effectiveMaxHpWithBattleRoar,
} from './charSnapshotLogic.js';

/** Макс. накопичення пасивного регену HP за один запит (24 год), щоб не «злітати» після року офлайну. */
export const PASSIVE_REGEN_MAX_SECONDS = 86_400;
/** Пасивний реген застосовується пакетами раз на 2 секунди. */
export const PASSIVE_REGEN_TICK_SECONDS = 2;

/**
 * Відновлює HP у БД за час простою (regenHp за секунду з calc_stats).
 * Не змінює revision (лише hp + lastUpdate).
 */
export async function applyPassiveHpRegen(row: CharacterRow): Promise<CharacterRow> {
  const elapsedMs = Date.now() - row.lastUpdate.getTime();
  if (elapsedMs < PASSIVE_REGEN_TICK_SECONDS * 1000) return row;

  const inv = parseInventory(row.inventoryJson);
  const effLv = levelFromTotalExp(row.exp);
  const combat = computeCombatStats(
    effLv,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row)
  );
  const vit = computeVitals(
    effLv,
    row.race,
    row.classBranch,
    combat.con,
    combat.men
  );
  const maxHpBase = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const maxHp = effectiveMaxHpWithBattleRoar(row, maxHpBase);

  const secRaw =
    Math.floor(elapsedMs / (PASSIVE_REGEN_TICK_SECONDS * 1000)) *
    PASSIVE_REGEN_TICK_SECONDS;
  const sec = Math.min(
    PASSIVE_REGEN_MAX_SECONDS,
    Math.max(0, secRaw)
  );
  if (sec <= 0) return row;

  const curHp = Math.max(0, Math.min(maxHp, Math.floor(row.hp)));
  const nextHp =
    combat.regenHp > 0 ? Math.min(maxHp, curHp + combat.regenHp * sec) : curHp;
  if (nextHp === row.hp) return row;

  const updated = await prisma.character.update({
    where: { id: row.id },
    data: { hp: nextHp },
  });
  return updated as CharacterRow;
}
