import { countBagQty, removeBagQty } from '../data/inventory.js';
import { ITEM_CATALOG } from '../data/itemsCatalog.js';
import type { InventoryState } from '../data/inventory.js';
import type { BattleJsonState, BattlePotionHoTEntry } from './battleTypes.js';

/** Інтервал імпульсу відновлення HP/MP від бойових зілель (мс). */
export const BATTLE_POTION_TICK_MS = 1000;

const HP_LESSER = 1060;
const HP_NORMAL = 1061;
const MP_SMALL = 726;
const MP_LARGE = 728;

export function isBattlePotionItemId(id: number): boolean {
  const x = Math.floor(id);
  return (
    x === HP_LESSER ||
    x === HP_NORMAL ||
    x === MP_SMALL ||
    x === MP_LARGE
  );
}

type PotionProfile =
  | { channel: 'hp'; total: number; perTick: number }
  | { channel: 'mp'; total: number; perTick: number };

function profileForItemId(id: number): PotionProfile | undefined {
  switch (Math.floor(id)) {
    case HP_LESSER:
      return { channel: 'hp', total: 350, perTick: 350 };
    case HP_NORMAL:
      return { channel: 'hp', total: 600, perTick: 600 };
    case MP_SMALL:
      return { channel: 'mp', total: 200, perTick: 200 };
    case MP_LARGE:
      return { channel: 'mp', total: 500, perTick: 500 };
    default:
      return undefined;
  }
}

function tickHoTLine(
  h: BattlePotionHoTEntry,
  nowMs: number
): boolean {
  return h.remaining > 0 && nowMs >= h.nextTickAtMs;
}

/**
 * Застосовує всі заплановані імпульси зілль до поточного моменту `nowMs`
 * (кілька «пропущених» секунд між ходами обробляються циклом).
 */
export function applyBattlePotionHoTTicks(args: {
  nowMs: number;
  st: BattleJsonState;
  playerHp: number;
  maxHpBattle: number;
  currentMp: number;
  maxMpEff: number;
  log: string[];
}): { playerHp: number; currentMp: number } {
  let playerHp = args.playerHp;
  let currentMp = args.currentMp;
  const st = args.st;
  const tickMs = BATTLE_POTION_TICK_MS;

  while (
    st.battlePotionHpHoT &&
    tickHoTLine(st.battlePotionHpHoT, args.nowMs)
  ) {
    const h = st.battlePotionHpHoT;
    const rawStep = Math.min(h.perTick, h.remaining);
    const healed = Math.min(
      Math.max(0, args.maxHpBattle - playerHp),
      rawStep
    );
    playerHp += healed;
    h.remaining -= rawStep;
    h.nextTickAtMs += tickMs;
    if (healed > 0) {
      args.log.push('Зілля: +' + healed + ' HP.');
    } else if (rawStep > 0) {
      args.log.push('Зілля: HP уже повне — імпульс марнується.');
    }
    if (h.remaining <= 0) {
      delete st.battlePotionHpHoT;
    }
  }

  while (
    st.battlePotionMpHoT &&
    tickHoTLine(st.battlePotionMpHoT, args.nowMs)
  ) {
    const m = st.battlePotionMpHoT;
    const rawStep = Math.min(m.perTick, m.remaining);
    const restored = Math.min(
      Math.max(0, args.maxMpEff - currentMp),
      rawStep
    );
    currentMp += restored;
    m.remaining -= rawStep;
    m.nextTickAtMs += tickMs;
    if (restored > 0) {
      args.log.push('Зілля: +' + restored + ' MP.');
    } else if (rawStep > 0) {
      args.log.push('Зілля: MP уже повне — імпульс марнується.');
    }
    if (m.remaining <= 0) {
      delete st.battlePotionMpHoT;
    }
  }

  return { playerHp, currentMp };
}

export function startBattlePotionHoT(args: {
  st: BattleJsonState;
  inv: InventoryState;
  log: string[];
  itemId: number;
  nowMs: number;
}): InventoryState {
  const id = Math.floor(args.itemId);
  const p = profileForItemId(id);
  if (!p) {
    throw new Error('battle_bad_potion');
  }
  if (countBagQty(args.inv, id) < 1) {
    throw new Error('battle_no_item');
  }

  const inv = removeBagQty(args.inv, id, 1);
  const entry: BattlePotionHoTEntry = {
    remaining: p.total,
    perTick: p.perTick,
    nextTickAtMs: args.nowMs + BATTLE_POTION_TICK_MS,
  };
  if (p.channel === 'hp') {
    args.st.battlePotionHpHoT = entry;
  } else {
    args.st.battlePotionMpHoT = entry;
  }

  const nameUk = ITEM_CATALOG[id]?.nameUk ?? 'Зілля';
  args.log.push(
    nameUk +
      ': відновлення імпульсами по ' +
      p.perTick +
      (p.channel === 'hp' ? ' HP' : ' MP') +
      ' кожні ' +
      BATTLE_POTION_TICK_MS / 1000 +
      ' с.'
  );
  return inv;
}
