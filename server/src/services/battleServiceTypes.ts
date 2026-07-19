import type {
  BattleActionId,
  BattleBattleMods,
} from '../domain/battle.js';

/** Іконки активних ефектів у бою (клієнт: `/game/skill-icon/:id`). */
export interface BattleBuffIcon {
  key: string;
  l2SkillId: number;
  labelUk: string;
  /** Кінець тимчасового ефекту (ms, як Date.now) — клієнт малює смужку разом із buffDurationTotalMs. */
  buffExpiresAtMs?: number;
  /** Повна тривалість ефекту (мс) для ширини смужки. */
  buffDurationTotalMs?: number;
  /**
   * Тогл-баф (стійка / aegis) — клієнт малює синє пульсуюче кільце замість
   * конічної смужки-таймера. MP витрачається поки тогл увімкнений.
   */
  isToggle?: boolean;
  /**
   * Скіл-заряди (Sonic Focus для Gladiator/Duelist, а в майбутньому — Momentum /
   * Focus Chain / тощо). Клієнт малює бейдж «N/Max» у куті іконки, щоб було видно
   * поточну кількість накопичених зарядів. При consume/gain icon перемальовується
   * з наступного мутаційного snapshot'а.
   */
  chargeCount?: number;
  chargeMax?: number;
}

export interface BattleWhirlwindExtraView {
  spawnId: string;
  name: string;
  mobHp: number;
  mobMaxHp: number;
  /** Портрет додаткової цілі (Whirlwind тощо) — той самий резолвер, що на мапі. */
  mobIconUrl?: string;
}

export interface BattleView {
  spawnId: string;
  mobName: string;
  /** Портрет цілі в бою — `mobIconUrlForSpawn` / fallback як у списку мобів на мапі. */
  mobIconUrl?: string;
  /** PvP — без портрета моба; детальніший лог урону. */
  battleMode?: 'pvp' | 'pve';
  /** Емблема клану PvP-цілі (лише battleMode=pvp). */
  mobClanEmblemId?: number | null;
  mobLevel: number;
  mobHp: number;
  mobMaxHp: number;
  /** Якщо задано — друга смуга (CP), наприклад після Гніву. */
  mobCp?: number;
  mobMaxCp?: number;
  aggressive: boolean;
  kind: string;
  log: string[];
  skills: {
    id: BattleActionId;
    labelUk: string;
    l2SkillId?: number;
    /** Секунди КД (магічні скіли містика) — для клієнтського «сірого скруга». */
    cooldownSec?: number;
  }[];
  /** Кінець КД за `Date.now()` (ms), ключі `l2_<skillId>` як у серверному стані бою. */
  mysticSkillCdUntil?: Record<string, number>;
  /**
   * Бойові модифікатори цього бою (War Cry / Battle Roar / стійка).
   * Не змішувати з `character.pAtk` тощо — ті з `computeCombatStats` + світові бафи, див. `domain/battle.ts`.
   */
  battleMods?: BattleBattleMods;
  /** Активні бафи українською — щоб було видно, що сервер їх застосував. */
  battleBuffsUk?: string[];
  /** Іконки активних дебафів на мобі (показ під HP/CP баром моба). */
  mobDebuffIcons?: BattleBuffIcon[];
  /** Ті самі ефекти, що в `battleBuffsUk`, для панелі іконок у куті екрана бою. */
  battleBuffIcons?: BattleBuffIcon[];
  /**
   * Тривалість ефекту Zealot (мс) — для кільця «скільки лишилось» на хотбарі.
   * Узгоджено з `ZEALOT_EFFECT_DURATION_MS` на сервері.
   */
  zealotEffectDurationMs?: number;
  /** Додаткові цілі Вихору (36), якщо вже зафіксовані в бою. */
  whirlwindExtras?: BattleWhirlwindExtraView[];
  /**
   * Sonic Focus charges: поточна / максимум. Показуємо окрему індикацію
   * над хотбаром для Gladiator/Duelist, щоб було видно вимогу зарядів для
   * sonic-скілів (Sonic Blaster, Double/Triple Sonic Slash тощо).
   */
  sonicCharges?: number;
  sonicMaxCharges?: number;
  /** Для легкого poll `/game/battle/sync`. */
  battleVersion?: number;
  logSeq?: number;
}

/** Відповідь на останній удар, коли моб переможений — екран перемоги в клієнті. */
export interface BattleVictoryItem {
  l2ItemId: number;
  qty: number;
  spoil: boolean;
  label: string;
}

export interface BattleVictorySummary {
  spawnId: string;
  mobName: string;
  mobLevel: number;
  aggressive: boolean;
  /** Повний лог бою (усі рядки до «Перемога!» включно з нагородами). */
  fullLog: string[];
  adenaGain: string;
  expGain: string;
  spGain: number;
  items: BattleVictoryItem[];
  levelUp: number | null;
  /** Найближчий моб рівня персонажа ±5 для «Полювати далі» (null — більше немає в радіусі). */
  nextHuntSpawnId?: string | null;
  /** Скільки підходящих мобів ще доступно поруч (включно з nextHuntSpawnId). */
  huntSameLevelRemaining?: number;
  /** PvP-перемога над гравцем. */
  isPvp?: boolean;
  /** Canonical тип перемоги для клієнта (без текстових евристик). */
  battleType?: 'pvp' | 'pve';
  /** PvP: characterId переможеного гравця. */
  defeatedCharacterId?: string | null;
  /** PvP контекст (world / siege / …). */
  playerCombatMode?: import('../domain/playerCombatMode.js').PlayerCombatMode;
  /** Clan Siege: cityId для повернення на siege.html. */
  siegeCityId?: string;
  /** Клієнтський return URL після PvP (напр. облога). */
  returnUrl?: string;
}

/** Поразка в бою — екран поразки + підказка найближчого міста для кнопки «в місто». */
export interface BattleDefeatSummary {
  spawnId: string;
  mobName: string;
  mobLevel: number;
  aggressive: boolean;
  fullLog: string[];
  nearestTownLabelUk: string;
  nearestTeleportId: string;
  /** PvP: вбивця — гравець. */
  isPvp?: boolean;
  killerName?: string;
}
