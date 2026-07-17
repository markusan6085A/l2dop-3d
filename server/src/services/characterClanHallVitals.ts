import type { BattleBattleMods } from '../domain/battle.js';
import { effectiveBattleMaxHp } from '../domain/battleEffectiveDisplay.js';
import {
  applyClanHallToCombatStats,
  computeMaxHpChain,
  resolveHpWithClanHallPassive,
  type MaxHpChainResult,
} from '../domain/characterClanHallVitals.js';
import { resolveClanHallPassiveBonus, type ClanHallBuffRow } from '../domain/clanHall.js';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { parseInventory } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { combatOptsFromRow, type CharacterRow } from './charService.js';
import { effectiveMaxHpWithBattleRoar } from './charSnapshotLogic.js';
import {
  fetchClanHallPassiveBonusByClanId,
  fetchClanHallPassiveBonusInTx,
} from './clanHallService.js';
import type { Prisma } from '@prisma/client';

export type CharacterVitalsBundle = {
  combatBase: ReturnType<typeof computeCombatStats>;
  combatWithClan: ReturnType<typeof computeCombatStats>;
  maxHpChain: MaxHpChainResult;
  maxMp: number;
  displayHp: number;
  clanHallBonus: ClanHallBuffRow | null;
};

function applyRoarForRow(
  row: CharacterRow,
  battleMods: BattleBattleMods | null | undefined,
  worldBattleMods: BattleBattleMods | undefined
): (base: number) => number {
  if (battleMods && Object.keys(battleMods).length > 0) {
    return (base) => effectiveBattleMaxHp(base, battleMods);
  }
  return (base) => effectiveMaxHpWithBattleRoar(row, base, worldBattleMods);
}

/** Пасив клан-холу з row.clan або за clanId (read-path). */
export async function resolveClanHallBonusForCharacter(
  row: Pick<CharacterRow, 'clan' | 'clanId'>
): Promise<ClanHallBuffRow | null> {
  if (row.clan) return resolveClanHallPassiveBonus(row.clan);
  return fetchClanHallPassiveBonusByClanId(row.clanId);
}

export async function resolveClanHallBonusInTx(
  tx: Prisma.TransactionClient,
  row: Pick<CharacterRow, 'clan' | 'clanId'>
): Promise<ClanHallBuffRow | null> {
  if (row.clan) return resolveClanHallPassiveBonus(row.clan);
  return fetchClanHallPassiveBonusInTx(tx, row.clanId);
}

/** Єдиний розрахунок HP/MP/combat для snapshot, бою, regen. */
export function computeCharacterVitalsBundle(args: {
  row: CharacterRow;
  clanHallBonus: ClanHallBuffRow | null;
  battleMods?: BattleBattleMods | null;
  worldBattleMods?: BattleBattleMods;
}): CharacterVitalsBundle {
  const effLv = levelFromTotalExp(args.row.exp);
  const inv = parseInventory(args.row.inventoryJson);
  const combatBase = computeCombatStats(
    effLv,
    args.row.race,
    args.row.classBranch,
    inv,
    combatOptsFromRow(args.row)
  );
  const combatWithClan = applyClanHallToCombatStats(
    combatBase,
    args.clanHallBonus
  );
  const vit = computeVitals(
    effLv,
    args.row.race,
    args.row.classBranch,
    combatBase.con,
    combatBase.men
  );
  const applyRoar = applyRoarForRow(
    args.row,
    args.battleMods,
    args.worldBattleMods
  );
  const maxHpChain = computeMaxHpChain({
    vitMaxHp: vit.maxHp,
    combat: combatBase,
    clanHallBonus: args.clanHallBonus,
    applyBattleRoar: applyRoar,
  });
  const displayHp = resolveHpWithClanHallPassive({
    storedHp: args.row.hp,
    maxHpWithoutClanHall: maxHpChain.maxHpWithoutClanHall,
    maxHpWithClanHall: maxHpChain.maxHpWithClanHall,
    clanHallBonus: args.clanHallBonus,
  });
  return {
    combatBase,
    combatWithClan,
    maxHpChain,
    maxMp: effectiveMaxMpWithJewelFlat(vit.maxMp, combatBase),
    displayHp,
    clanHallBonus: args.clanHallBonus,
  };
}
