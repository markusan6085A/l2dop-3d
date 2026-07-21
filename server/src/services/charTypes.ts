import { Prisma } from '@prisma/client';
import type { InventoryState } from '../data/inventory.js';
import type { WarehouseSnapshot } from '../data/warehouse.js';
import type { LearnedSkillSnapshotEntry } from './charLearnedSkillsSnapshot.js';
import type { CastableSelfBuffEntry } from '../data/castableSelfBuffs.js';
import type { FirstProfessionQuestSnapshot } from '../domain/humanFighterFirstProfessionQuest.js';
import type { DailyQuestsSnapshot } from '../domain/dailyQuests.js';
import type { BattleHotbarSlot } from '../domain/battleHotbar.js';

/** Активна сесія Seven Signs подземелля (null — на світовій карті / у місті). */
export type ActiveDungeonId = string | null;

/** Development-only breakdown базових статів (L2DOP_STAT_DEBUG=1). */
export type StatBreakdownDebugPayload = {
  baseStats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wit: number;
    men: number;
  };
  statModifiers: {
    armorSets: Record<string, number>;
    dyes: Record<string, number>;
    passives: Record<string, number>;
    items: Record<string, number>;
    other: Record<string, number>;
  };
  finalStats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wit: number;
    men: number;
  };
  derivedSnapshot: {
    pAtk: number;
    mAtk: number;
    maxHp: number;
    maxMp: number;
    maxCp: number;
    pAtkSpd: number;
    castSpd: number;
    mCritPct: number;
  };
};

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
  /** male | female */
  gender: string;
  /** human_fighter | human_warrior | … */
  l2Profession: string;
  adena: bigint;
  exp: bigint;
  sp: number;
  mobsKilled: number;
  /** PvP-карма (PK). */
  karma: number;
  /** Перемоги в PvP. */
  pvpWins: number;
  /** Участь у перемозі над рейд-босом. */
  raidBossKills: number;
  /** До якого часу (epoch ms) нік агресора фіолетовий. */
  pvpAggressorUntilMs: bigint;
  pvpPendingDefeatJson: Prisma.JsonValue | null;
  pvePendingDefeatJson: Prisma.JsonValue | null;
  /** Текст статусу профілю для інших гравців. */
  profileStatus: string | null;
  revision: number;
  userId: string;
  lastUpdate: Date;
  inventoryJson: Prisma.JsonValue | null;
  warehouseJson: Prisma.JsonValue | null;
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
  /** Залишок HP мобів на карті (spawnId → hp) між боями. */
  mobSpawnHpJson: Prisma.JsonValue | null;
  skillsLearnedJson: Prisma.JsonValue | null;
  activeBuffsJson: Prisma.JsonValue | null;
  /** Перезарядки скілів поза боєм: `[{skillId, readyAt}]` (мс epoch). */
  skillCooldownsJson: Prisma.JsonValue | null;
  /** Розкладка панелі скілів у бою (41 слот). */
  battleHotbarJson: Prisma.JsonValue | null;
  questProgressJson: Prisma.JsonValue | null;
  dungeonStateJson: Prisma.JsonValue | null;
  dailyQuestsJson: Prisma.JsonValue | null;
  buffHeroicTier: number | null;
  buffZealotStacks: number | null;
  chatRepliesReadAt: Date;
  /** Клан; null — без клану. */
  clanId: string | null;
  clanRole: string | null;
  /** Якщо завантажено з include clan. */
  clan?: { name: string; hallBlessingAt?: Date | null; level?: number; emblemId?: number | null } | null;
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
  gender: string;
  l2Profession: string;
  adena: string;
  /** Накопичений EXP (рядок для BigInt у JSON) */
  exp: string;
  /** Прогрес EXP у поточному рівні (l2dop expgain.php), для смуги на клієнті */
  expBarCur: string;
  expBarMax: string;
  expBarPct: number;
  sp: number;
  mobsKilled: number;
  /** Текст статусу профілю; `null` — «Немає статусу». */
  profileStatus: string | null;
  karma: number;
  pk: number;
  recommendations: number;
  recommendationsLeft: number;
  pvpWins: number;
  pvpLosses: number;
  revision: number;
  lastUpdate: string;
  /** `dungeonStateJson.dungeonId` або null — для синхрону map/city ↔ dungeon між пристроями. */
  activeDungeonId: ActiveDungeonId;
  inventory: InventoryState;
  /** Склад у місті (лише stacks; екіпу немає). */
  warehouse: WarehouseSnapshot;
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
  /** Стійкість до паралічу (Fortitude тощо), 0–95. */
  paralyzeResistPct: number;
  /** Стійкість до дебафів (MEN), 0–80. */
  debuffResistPct: number;
  /** Множник витрат MP бойових скілів (сет Demon тощо). */
  skillMpCostMul: number;
  /** Бонус до шансу дебафу мага (%). */
  addDebuffLandChancePct: number;
  /**
   * Ключ для клієнтського dedupe stats HUD (final base + derived vitals/combat).
   */
  statsRenderKey: string;
  /** Лише при L2DOP_STAT_DEBUG=1 на сервері. */
  statBreakdownDebug?: StatBreakdownDebugPayload;
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
  learnedBattleSkillsDetail: LearnedSkillSnapshotEntry[];
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
  /** Розкладка панелі скілів у бою (41 слот); `null` — ще не збережено. */
  battleHotbarSlots: (BattleHotbarSlot | null)[] | null;
  /** Колір ніка для HUD (#rrggbb): карма / агресор / стандарт. */
  nickColor: string;
  /** PvP-поразка, що чекає підтвердження на battle/siege. */
  pvpDefeat: {
    killerName: string;
    killerCharacterId: string;
    deathEventId: string;
    scope: 'world' | 'clan_siege';
    playerDied: true;
    eliminatedFromSiege?: boolean;
    siegeCityId?: string;
    messageUk: string;
    fullLog?: string[];
  } | null;
  /** PvE-поразка — обов'язкова кнопка «В місто». */
  pveDefeat: {
    spawnId: string;
    mobName: string;
    mobLevel: number;
    aggressive: boolean;
    fullLog: string[];
    nearestTownLabelUk: string;
    nearestTeleportId: string;
  } | null;
  /** Квест 1-ї профи людини-воїна; `null` — не human_fighter. */
  firstProfessionQuest: FirstProfessionQuestSnapshot | null;
  /** Прогрес щоденних завдань (лише лічильники; нагороди — окремо). */
  dailyQuests: DailyQuestsSnapshot;
  /** Coin of Luck у сумці (item 4037). */
  coinOfLuck: number;
  /** Мощ героя (формула на сервері). */
  heroPower: number;
  /** Непрочитані відповіді в чаті (replyToCharacterId = цей герой). */
  chatUnreadReplyCount?: number;
  /** Версія catalog-hints (інвалідація клієнтського кешу каталогу). */
  catalogVersion?: string;
  /** Версія книги крафту ресурсів. */
  bookVersion?: string;
  /** Час формування snapshot на сервері (ms) — tie-break при однаковому revision. */
  snapshotGeneratedAt?: number;
  /** Монотонна версія client snapshot (transport tie-break; не версія даних). */
  clientSnapshotVersion?: number;
  /** id клану або null. */
  clanId?: string | null;
  /** Назва клану для UI. */
  clanName?: string | null;
  /** Емблема клану (1–35, 37, 40) або null. */
  clanEmblemId?: number | null;
  /** leader | member | null */
  clanRole?: string | null;
  /** Пасивний бонус Клан-холу (для UI профілю). */
  clanHallBonus?: ClanHallBonusSnapshot | null;
  /** Одноразове повідомлення під HUD-барами (зникає після показу). */
  hudNoticeUk?: string | null;
  /** Активне запрошення в клан (після першого показу під HUD). */
  pendingClanInvite?: PendingClanInviteSnapshot | null;
}

export type PendingClanInviteSnapshot = {
  inviteId: string;
  inviterName: string;
  clanName: string;
};

export type ClanHallBonusSnapshot = {
  active: boolean;
  clanLevel: number;
  pAtk: number;
  mAtk: number;
  pDef: number;
  mDef: number;
  maxHp: number;
};
