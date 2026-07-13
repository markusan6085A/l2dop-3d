import {
  effectiveBattleMaxHp,
  jsonFiniteNum,
  type BattleActionId,
  type BattleBattleMods,
  type BattleJsonState,
} from '../domain/battle.js';
import { mergeDisplayBattleMods } from '../domain/combatDisplayContext.js';
import type { BattleSpawnMeta } from '../domain/battlePvpContext.js';
import type { CombatStatsSnapshot } from '../data/l2dopCombatFormulas.js';
import {
  battleActionSkipsMobHp,
  randomMobRetaliationWindowHits,
} from './battleServicePerformBattleAction.helpers.js';
import { rollMobPhysicalVsPlayer } from './battleServiceDamageRolls.js';

export type MobRetaliationGateArgs = {
  st: BattleJsonState;
  action: BattleActionId;
  race: string;
  classBranch: string;
  skipMobCounterAttackOnce?: boolean;
  mobRetaliationDelayHits?: number;
  nowMs?: number;
};

/** Чи моб контратакує цього ходу; може змінити `st.mobHitsUntilRetaliation`. */
export function resolveMobShouldCounterAttack(args: MobRetaliationGateArgs): boolean {
  const {
    st,
    action,
    race,
    classBranch,
    skipMobCounterAttackOnce,
    mobRetaliationDelayHits,
    nowMs = Date.now(),
  } = args;

  let shouldMobCounterAttack = true;
  const sleepUntilNow = jsonFiniteNum(st.battleMods?.mobSleepUntilMs);
  const mobSleepingNow = sleepUntilNow !== undefined && sleepUntilNow > nowMs;
  if (mobSleepingNow) {
    shouldMobCounterAttack = false;
  }
  if (skipMobCounterAttackOnce) {
    shouldMobCounterAttack = false;
  }
  if (
    typeof mobRetaliationDelayHits === 'number' &&
    Number.isFinite(mobRetaliationDelayHits) &&
    mobRetaliationDelayHits > 0
  ) {
    const delayHits = Math.max(1, Math.floor(mobRetaliationDelayHits));
    const curHitsUntil =
      typeof st.mobHitsUntilRetaliation === 'number' &&
      Number.isFinite(st.mobHitsUntilRetaliation) &&
      st.mobHitsUntilRetaliation > 0
        ? Math.floor(st.mobHitsUntilRetaliation)
        : randomMobRetaliationWindowHits();
    st.mobHitsUntilRetaliation = Math.max(curHitsUntil, delayHits);
    shouldMobCounterAttack = false;
  }
  if (
    !mobSleepingNow &&
    !battleActionSkipsMobHp(action, race, classBranch)
  ) {
    const curHitsUntil =
      typeof st.mobHitsUntilRetaliation === 'number' &&
      Number.isFinite(st.mobHitsUntilRetaliation) &&
      st.mobHitsUntilRetaliation > 0
        ? Math.floor(st.mobHitsUntilRetaliation)
        : randomMobRetaliationWindowHits();
    const nextHitsUntil = curHitsUntil - 1;
    if (nextHitsUntil <= 0) {
      shouldMobCounterAttack = true;
      st.mobHitsUntilRetaliation = randomMobRetaliationWindowHits();
    } else {
      shouldMobCounterAttack = false;
      st.mobHitsUntilRetaliation = nextHitsUntil;
    }
  }
  if (skipMobCounterAttackOnce) {
    shouldMobCounterAttack = false;
    const curHitsUntil =
      typeof st.mobHitsUntilRetaliation === 'number' &&
      Number.isFinite(st.mobHitsUntilRetaliation) &&
      st.mobHitsUntilRetaliation > 0
        ? Math.floor(st.mobHitsUntilRetaliation)
        : randomMobRetaliationWindowHits();
    st.mobHitsUntilRetaliation = Math.max(1, curHitsUntil);
  }
  return shouldMobCounterAttack;
}

export type MobCounterDamageArgs = {
  st: BattleJsonState;
  spawn: BattleSpawnMeta;
  combat: CombatStatsSnapshot;
  worldBattleMods?: BattleBattleMods;
  maxHpEffAfter: number;
  playerHp: number;
  mobHp: number;
  log: string[];
};

/** Контратака моба + відбиття; повертає оновлені HP і дописує лог. */
export function applyMobCounterDamage(args: MobCounterDamageArgs): {
  playerHp: number;
  mobHp: number;
} {
  const { st, spawn, combat, worldBattleMods, maxHpEffAfter, log } = args;
  let { playerHp, mobHp } = args;

  const modsForMobCounter = mergeDisplayBattleMods(
    st,
    worldBattleMods,
    st.battleMods
  );
  const mobCounter = rollMobPhysicalVsPlayer(
    st.mobPAtk,
    spawn.level,
    combat,
    st,
    modsForMobCounter
  );
  const rRefl = jsonFiniteNum(modsForMobCounter?.reflectDamageReturnRatio) ?? 0;
  const rMir = jsonFiniteNum(modsForMobCounter?.physicalMirrorReflectRatio) ?? 0;
  const rVen = jsonFiniteNum(modsForMobCounter?.vengeanceReflectRatio) ?? 0;
  const reflTot = Math.min(0.72, rRefl + rMir + rVen);
  if (reflTot > 0 && mobCounter.damage > 0 && mobCounter.outcome !== 'miss') {
    const refl = Math.floor(mobCounter.damage * reflTot);
    if (refl > 0) {
      mobHp = Math.max(0, mobHp - refl);
      log.push('Відбиття на моба: −' + refl + ' HP.');
    }
  }
  playerHp = Math.max(0, playerHp - mobCounter.damage);
  playerHp = Math.min(
    effectiveBattleMaxHp(maxHpEffAfter, st.battleMods),
    playerHp
  );
  if (mobCounter.outcome === 'miss') {
    log.push('[' + spawn.name + '] промахнувся.');
  } else if (mobCounter.outcome === 'crit' && mobCounter.damage > 0) {
    log.push('[' + spawn.name + '] — крит! −' + mobCounter.damage + ' HP.');
  } else if (mobCounter.damage > 0) {
    log.push('[' + spawn.name + '] −' + mobCounter.damage + ' HP.');
  }
  return { playerHp, mobHp };
}
