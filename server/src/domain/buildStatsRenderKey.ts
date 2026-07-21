import type { CombatStatsSnapshot } from '../data/l2dopCombatFormulas.js';

/** Ключ для клієнтського dedupe рендеру stats HUD після equip/unequip. */
export function buildStatsRenderKey(
  combat: Pick<
    CombatStatsSnapshot,
    | 'str'
    | 'dex'
    | 'con'
    | 'int'
    | 'wit'
    | 'men'
    | 'pAtk'
    | 'mAtk'
    | 'pAtkSpd'
    | 'castSpd'
  >,
  maxHp: number,
  maxMp: number,
  maxCp: number
): string {
  return [
    combat.str,
    combat.dex,
    combat.con,
    combat.int,
    combat.wit,
    combat.men,
    combat.pAtk,
    combat.mAtk,
    maxHp,
    maxMp,
    maxCp,
    combat.pAtkSpd,
    combat.castSpd,
  ].join(':');
}
