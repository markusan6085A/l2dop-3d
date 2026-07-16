/**
 * Спільні типи для розкладки «дія гравця в бою → шкода / MP / підпис».
 * Резолвер лишає в battleService лише БД, лог і контрудар моба.
 */
import type {
  BattleActionId,
  BattleBattleMods,
  BattleJsonState,
} from '../battle.js';
import type { ActiveBuffEntry } from '../../data/l2dopActiveBuffs.js';
import type { CombatStatsSnapshot } from '../../data/l2dopCombatFormulas.js';

export type { CombatStatsSnapshot };

export type BattleSkillResolveContext = {
  action: BattleActionId;
  preLevel: number;
  race: string;
  classBranch: string;
  /** l2Profession з БД (human_fighter / human_warrior / …). */
  l2Profession: string;
  combat: CombatStatsSnapshot;
  st: BattleJsonState;
  spawnLevel: number;
  /**
   * Фаза 4: явний stun-resist зі спавну (`MapWorldSpawn.stunResistPct`).
   * Якщо немає — у формулах land використовується synthetic за `spawnLevel`.
   */
  spawnStunResistPct?: number | undefined;
  /**
   * Фаза 4: явний debuff-resist зі спавну (`MapWorldSpawn.debuffResistPct`).
   */
  spawnDebuffResistPct?: number | undefined;
  /** Ім’я моба зі спавну — детекти слабкості (`mobWeaknessFamily`). */
  spawnMobName: string;
  /** Тип спавну (звичайний / raid / epic) — Hammer Crush stun тощо. */
  spawnKind?: import('../../data/mapWorldSpawns.js').MapWorldSpawn['kind'];
  /** Shield Stun (92) та інші скіли, що вимагають щит у l2. */
  hasEquippedShield?: boolean;
  /** Поточне HP в бою (до дії) — Відродження (181). */
  playerHpInBattle: number;
  /** Ефективний max HP у бою — Відродження. */
  playerMaxHpInBattle: number;
  /** l1 з ITEM_CATALOG (`pole` для Whirlwind · 36). */
  weaponKind?: string | undefined;
  /**
   * Ранг вивченого скіла: канонічний battleId (`l2_3`, …) → рівень 1..N з skillsLearnedJson.
   * Без цього поля бойові формули беруть лише рівень персонажа (старі знімки).
   */
  learnedSkillLevelByBattleId?: Record<string, number> | undefined;
  /**
   * Активні self-бафи персонажа на початок ходу (вже без прострочених). Джерело — `activeBuffsJson`.
   * Хендлери читають, щоб визначити, чи баф уже висить, і повернути `activeBuffPatch`
   * (каст/скасування). Легасі-поля `battleMods.warCryPatkMul` тощо поступово витісняються.
   */
  activeBuffs?: readonly ActiveBuffEntry[] | undefined;
};

export type BattleSkillTurnResult = {
  mpCost: number;
  pDmg: number;
  /** Рядок у лог бою (українською); порожній для «тихих» дій, якщо додамо пізніше. */
  skillLine: string;
  physOutcome: 'miss' | 'hit' | 'crit' | null;
  magicOutcome: 'miss' | 'hit' | 'crit' | null;
  /** Злиття в `battleJson.battleMods` після оплати MP (бафи, стійки). */
  battleModsPatch?: Partial<BattleBattleMods>;
  /** Одноразове зцілення гравця (Відродження). */
  playerHeal?: number;
  /** Одноразова втрата HP (Zealot 420). */
  playerHpCost?: number;
  /** Рядок про спрацювання вразливості (детект) перед уроном. */
  weaknessLogLineUk?: string;
  /** Оновлення КД мага після касту (`l2_<id>` → unix ms). */
  mysticSkillCdUntilPatch?: Record<string, number>;
  /**
   * Виставити `expiresAt` для legacy-бафів, що живуть у `battleMods` (не в
   * `activeBuffsJson`): Rage (94), Frenzy (176), Guts (139), Lionheart (287),
   * Howl (116), Focus Attack (317), Weakness-детекти, Eye of Hunter/Slayer тощо.
   * Ключ — L2 skillId (string form); значення — unix ms.
   * `performBattleAction` на початку кожного ходу знімає прострочені бафи
   * через `LEGACY_BUFF_STRIP_BY_SKILL_ID` і дає клієнту `buffExpiresAtMs`
   * у `battleBuffIconsForUi` для duration-кільця.
   */
  battleModsExpiresPatch?: Record<string, number>;
  /** Гнів (320): скільки зняти з поточного CP моба (не більше залишку). */
  mobCpDrain?: number;
  /**
   * Уніфікація з out-of-battle: додати/зняти self-buff у `activeBuffsJson` з `expiresAt` із
   * `l2dopBuffDurations`. Ефекти розраховуються через `combatBuffsFromActiveJson`, без
   * дублювання в `battleMods.<skill>PatkMul` / `<skill>MaxHpMul`.
   */
  activeBuffPatch?: {
    skillId: number;
    level: number;
    action: 'add' | 'remove';
  };
  /**
   * Gladiator / Duelist sonic charges (Sonic Focus → інші sonic-скіли).
   * `delta` — зміна зарядів (після клемпа до `[0, max]`), `maxSet` —
   * оновити максимум (напр. при першому касті, щоб гарантувати
   * `SONIC_MAX_CHARGES_DEFAULT`). Patch застосовується в
   * `performBattleAction` після списання MP.
   */
  sonicChargesPatch?: {
    delta?: number;
    maxSet?: number;
  };
  /**
   * Додаткові рядки логу від дії гравця (напр. накопичувальна атака:
   * окремо промах/звичайний/крит по кожному кидку).
   */
  playerDamageLogLines?: string[];
  /**
   * Внутрішній прапорець для резолвера: не застосовувати стандартний CD-патч
   * у `applyStandardFighterCooldown` (напр. коли спрацювала Skill Mastery 330).
   */
  skipStandardCooldown?: boolean;
  /**
   * Одноразовий контроль цілі: пропустити контрудар моба в поточному ході
   * (наприклад Hammer Crush наклав stun).
   */
  skipMobCounterAttackOnce?: boolean;
  /**
   * Додаткова затримка контрудару моба (у «хітах до відповіді»): hard-control
   * на кшталт Sleep/Anchor/Fear може відсунути наступний контрудар на кілька
   * успішних дій гравця, щоб контроль був відчутним у PvE.
   */
  mobRetaliationDelayHits?: number;
  /** Джерело зцілення для деталізованого лога (напр. Sonic Mastery). */
  playerHealSourceUk?: string;
};

/** Фізичний удар по мобу (атака гравця). */
export type PhysicalRollFn = (
  playerAtk: number,
  options?: { forceNoMiss?: boolean }
) => {
  damage: number;
  outcome: 'miss' | 'hit' | 'crit';
  weaknessLogLineUk?: string;
};

/** Магічний болт (legacy «bolt»). */
export type MagicBoltRollFn = () => {
  damage: number;
  outcome: 'miss' | 'hit' | 'crit';
};
