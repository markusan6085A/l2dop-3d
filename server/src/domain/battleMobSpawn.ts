import type { MapWorldSpawn } from '../data/mapWorldSpawns.js';
import { l2dopPhysicalBaseDamage } from '../data/l2dopDamageFormulas.js';

/** Пул HP / «бак» для РБ і епіків; окремо від загрози (atk), щоб не було 25× і до HP, і до урону в картці. */
const RAID_HP_MULT = 66;
const RAID_OFF_MULT = 4;
const RAID_DEF_MULT = 1.22;

const EPIC_HP_MULT = 380;
const EPIC_OFF_MULT = 7;
const EPIC_DEF_MULT = 1.45;

export function mobCombatFromSpawn(spawn: MapWorldSpawn): {
  maxHp: number;
  pAtk: number;
  pDef: number;
  mAtk: number;
  mDef: number;
  evasion: number;
} {
  const lvl = Math.max(1, spawn.level);
  const baseHp = 180 + lvl * 48;
  const basePatk = lvl * 11 + 10;
  const baseMatk = lvl * 9 + 6;
  const basePdef = lvl * 8 + 15;
  const baseMdef = lvl * 7 + 12;

  let hpMult = 1;
  let offMult = 1;
  /** Лише РБ/епік: товстіший захист проти гравця (раніше def не масштабувався). */
  let defMult = 1;

  if (spawn.kind === 'raid') {
    hpMult = RAID_HP_MULT;
    offMult = RAID_OFF_MULT;
    defMult = RAID_DEF_MULT;
  } else if (spawn.kind === 'epic') {
    hpMult = EPIC_HP_MULT;
    offMult = EPIC_OFF_MULT;
    defMult = EPIC_DEF_MULT;
  } else if (spawn.kind === 'epic_guard') {
    /** Сильніші за звичайних мобів, слабші за райд-боса. */
    hpMult = 38;
    offMult = 3.1;
    defMult = 1.2;
  } else if (spawn.kind === 'dungeon') {
    /** Balance pass 3: трохи нижче HP — sim p95 dungeon TTK у межах ~75 с без штучного натягування hit. */
    hpMult = 2.78;
    offMult = 3;
  } else if (spawn.kind === 'champion') {
    hpMult = 1.45;
    offMult = 1.45;
  }

  let maxHp = Math.floor(baseHp * hpMult);
  const pAtk = Math.floor(basePatk * offMult);
  const pDef = Math.floor(basePdef * defMult);
  const mAtk = Math.floor(baseMatk * offMult);
  const mDef = Math.floor(baseMdef * defMult);
  const dex = 28 + Math.floor(lvl * 0.35);
  const evasion = Math.floor(Math.sqrt(dex) * 6 + lvl);
  /** Канонічне HP з картки (l2mobi / npc) — лише maxHp, атака/захист з формули. */
  const canonHp = spawn.stats?.maxHp;
  if (
    spawn.kind === 'epic' &&
    typeof canonHp === 'number' &&
    Number.isFinite(canonHp) &&
    canonHp > 0
  ) {
    maxHp = Math.max(1, Math.floor(canonHp));
  }
  return { maxHp, pAtk, pDef, mAtk, mDef, evasion };
}

/** @deprecated Краще `l2dopPhysicalBaseDamage` напряму; лишено для сумісності імпортів. */
export function rollDamage(attackerAtk: number, targetDef: number): number {
  return l2dopPhysicalBaseDamage(attackerAtk, targetDef);
}

/** MP гравця з battleJson (якщо є). */
export function readBattlePlayerMp(raw: unknown): number | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.playerMp !== 'number' || !Number.isFinite(o.playerMp)) return null;
  return o.playerMp;
}
