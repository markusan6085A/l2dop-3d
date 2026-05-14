import { Prisma } from '@prisma/client';
import type { InventoryState } from '../data/inventory.js';
import type { LearnedSkillEntry } from '../data/humanFighterSkillCatalog.js';
import type { CastableSelfBuffEntry } from '../data/castableSelfBuffs.js';

/** Рядок Character з БД (Prisma XOR інколи «губить» Json у create/update — тут явно). */
export interface CharacterRow {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  cityId: string;
  race: string;
  classBranch: string;
  /** human_fighter | human_warrior | … */
  l2Profession: string;
  adena: bigint;
  exp: bigint;
  sp: number;
  revision: number;
  userId: string;
  lastUpdate: Date;
  inventoryJson: Prisma.JsonValue | null;
  worldX: number;
  worldY: number;
  targetX: number;
  targetY: number;
  moveStartAt: Date | null;
  moveFromX: number;
  moveFromY: number;
  battleJson: Prisma.JsonValue | null;
  /** Поза боєм: стійки / MP після бою — див. `worldCombatState.ts`. */
  worldCombatStateJson: Prisma.JsonValue | null;
  skillsLearnedJson: Prisma.JsonValue | null;
  activeBuffsJson: Prisma.JsonValue | null;
  /** Перезарядки скілів поза боєм: `[{skillId, readyAt}]` (мс epoch). */
  skillCooldownsJson: Prisma.JsonValue | null;
  buffHeroicTier: number | null;
  buffZealotStacks: number | null;
}

/** Активний баф у снепшоті (для UI): з урахуванням `expiresAt` (L2 abnormalTime). */
export interface ActiveBuffSnapshotEntry {
  skillId: number;
  level: number;
  /** Мс epoch або `null` — постійний до смерті/cancel. */
  expiresAt: number | null;
  /** Секунди, що лишилися до закінчення, або `null` (якщо постійний). */
  remainingSec: number | null;
}

/** Перезарядка скіла у снепшоті (для UI-таймера). */
export interface SkillCooldownSnapshotEntry {
  skillId: number;
  readyAt: number;
  remainingSec: number;
}

export interface CharacterSnapshot {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  cp: number;
  maxCp: number;
  mp: number;
  maxMp: number;
  cityId: string;
  race: string;
  classBranch: string;
  l2Profession: string;
  adena: string;
  /** Накопичений EXP (рядок для BigInt у JSON) */
  exp: string;
  /** Прогрес EXP у поточному рівні (l2dop expgain.php), для смуги на клієнті */
  expBarCur: string;
  expBarMax: string;
  expBarPct: number;
  sp: number;
  revision: number;
  lastUpdate: string;
  inventory: InventoryState;
  /** l2dop calc_stats.php + rawdata.php + сумарний екіп з ITEM_CATALOG */
  pAtk: number;
  pDef: number;
  mAtk: number;
  mDef: number;
  str: number;
  int: number;
  dex: number;
  wit: number;
  con: number;
  men: number;
  accuracy: number;
  evasion: number;
  critRate: number;
  pAtkSpd: number;
  runSpeed: number;
  castSpd: number;
  shieldPDef: number;
  mCritPct: number;
  critDmgMul: number;
  /** Множник маг. крит-урону від INT (фаза 1). */
  magicCritDmgMul: number;
  /** Стійкість до станів (CON), 0–80. */
  stunResistPct: number;
  /** Стійкість до дебафів (MEN), 0–80. */
  debuffResistPct: number;
  /** Множник витрат MP бойових скілів (сет Demon тощо). */
  skillMpCostMul: number;
  /** Бонус до шансу дебафу мага (%). */
  addDebuffLandChancePct: number;
  /**
   * Повний сет броні з l2dopDGradeArmorSetBonuses — лише для відображення в профілі;
   * бойові числа вже з урахуванням сету в pAtk / maxHp / …
   */
  armorSetBonus: null | {
    id: string;
    nameUk: string;
    linesUk: string[];
  };
  addCritDmg: number;
  addCritDisplay: string;
  weaponGradeMatchesArmor: boolean;
  vampiricPct: number;
  reflectPct: number;
  /** Реген за тик (calc_stats.php 4683–4693, floor). Пасивне відновлення HP — applyPassiveHpRegenPure (квант 2с). */
  regenCp: number;
  regenHp: number;
  regenMp: number;
  /** l2dop map.php — світ і рух */
  worldX: number;
  worldY: number;
  targetX: number;
  targetY: number;
  mapMoving: boolean;
  mapAngle: number;
  mapMoveSpeed: number;
  /** Вивчені скіли (battle action id), напр. power_strike */
  learnedBattleSkills: string[];
  /** Ранг кожного вивченого скіла (для UI / магістра). */
  learnedBattleSkillsDetail: LearnedSkillEntry[];
  /** cs1 $heroic (1 атака / 2 захист / 3 підмога); null — вимкнено. */
  buffHeroicTier: number | null;
  /** Zealot (420), верстви; null — вимкнено. */
  buffZealotStacks: number | null;
  /** Активні бафи на персонажі (L2 Interlude), вже без прострочених. */
  activeBuffs: ActiveBuffSnapshotEntry[];
  /** Перезарядки скілів поза боєм, без прострочених. */
  skillCooldowns: SkillCooldownSnapshotEntry[];
  /**
   * Селф-бафи, доступні до касту поза боєм (вивчені + з описаною тривалістю
   * і MP cost). Для UI: `active`, `activeRemainingSec`, `readyRemainingSec`.
   */
  castableSelfBuffs: CastableSelfBuffEntry[];
}
