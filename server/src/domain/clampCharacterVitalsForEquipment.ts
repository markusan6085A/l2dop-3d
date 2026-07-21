/**
 * Clamp HP/MP після зміни екіпу (armor set → CON/MEN → max vitals).
 * Без безкоштовного heal: лише Math.min(current, newMax).
 */
import type { InventoryState } from '../data/inventory.js';
import { readBattlePlayerCp } from './battleMobSpawn.js';
import { parseWorldCombatState } from './worldCombatState.js';
import type { ClanHallBuffRow } from './clanHall.js';
import { computeCharacterVitalsBundle } from '../services/characterClanHallVitals.js';
import type { CharacterRow } from '../services/charTypes.js';
import { effectiveMaxCpWithFlat } from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';

export interface VitalsClampPatch {
  hp: number;
  maxHp: number;
  worldCombatStateJson?: CharacterRow['worldCombatStateJson'];
  battleJson?: CharacterRow['battleJson'];
}

export function clampCharacterVitalsForInventoryChange(args: {
  row: CharacterRow;
  nextInv: InventoryState;
  clanHallBonus: ClanHallBuffRow | null;
}): VitalsClampPatch {
  const rowWithInv: CharacterRow = {
    ...args.row,
    inventoryJson: args.nextInv as unknown as CharacterRow['inventoryJson'],
  };
  const bundle = computeCharacterVitalsBundle({
    row: rowWithInv,
    clanHallBonus: args.clanHallBonus,
  });
  const maxHp = bundle.maxHpChain.maxHpWithClanHall;
  const hp = Math.min(Math.max(0, Math.floor(args.row.hp)), maxHp);

  const effLv = levelFromTotalExp(args.row.exp);
  const vit = computeVitals(
    effLv,
    args.row.race,
    args.row.classBranch,
    bundle.combatBase.con,
    bundle.combatBase.men,
  );
  const maxMp = bundle.maxMp;
  const maxCp = effectiveMaxCpWithFlat(vit.maxCp, bundle.combatBase);

  let worldCombatStateJson = args.row.worldCombatStateJson;
  const world = parseWorldCombatState(args.row.worldCombatStateJson);
  if (world) {
    const mp = Math.min(Math.max(0, Math.floor(world.playerMp)), maxMp);
    if (mp !== world.playerMp) {
      worldCombatStateJson = {
        ...world,
        playerMp: mp,
      } as unknown as CharacterRow['worldCombatStateJson'];
    }
  }

  let battleJson = args.row.battleJson;
  const battleCp = readBattlePlayerCp(args.row.battleJson);
  if (battleCp != null) {
    const nextCp = Math.min(battleCp, maxCp);
    if (nextCp !== battleCp) {
      const raw =
        args.row.battleJson != null &&
        typeof args.row.battleJson === 'object' &&
        !Array.isArray(args.row.battleJson)
          ? (args.row.battleJson as Record<string, unknown>)
          : {};
      battleJson = {
        ...raw,
        playerCp: nextCp,
      } as unknown as CharacterRow['battleJson'];
    }
  }

  return {
    hp,
    maxHp,
    ...(worldCombatStateJson !== args.row.worldCombatStateJson
      ? { worldCombatStateJson }
      : {}),
    ...(battleJson !== args.row.battleJson ? { battleJson } : {}),
  };
}
