import type { WeaknessKind } from './mobWeaknessFamily.js';

export const BATTLE_RANGE = 28_000;
export const MAX_BATTLE_LOG = 36;
/** Тривалість ефекту Zealot (мс); після `zealotUntilMs` сервер знімає бонуси. */
export const ZEALOT_EFFECT_DURATION_MS = 120_000;

/** Кілька детектів слабкості в одному бою: вид → множник P.Atk (лише для «своїх» мобів). */
export type WeaknessDetectMap = Partial<Record<WeaknessKind, number>>;

/** Тимчасові модифікатори лише в межах поточного бою (не в світі). */
export interface BattleBattleMods {
  /** Бойовий клич (78): множник до фіз. урону по мобу (~+20% у каталозі). */
  warCryPatkMul?: number;
  /** Бойовий рик (121): множник до max HP у цьому бою. */
  battleRoarMaxHpMul?: number;
  /**
   * Застаріле: одне поле «одна стійка». Читається лише для міграції в `stanceAccuracy` /
   * `stanceVicious` / `stanceParry`; при збереженні не використовується.
   */
  stance?: 'accuracy' | 'vicious' | 'parry' | null;
  /** Стійка точності (256) — незалежний тогл від інших стійок. */
  stanceAccuracy?: boolean;
  /** Жорстка стійка (312). */
  stanceVicious?: boolean;
  /** Ранг скіла 312 — persisted mirror learned rank (read-repair); ефект — `resolveViciousStanceEffect(learnedRank)`. */
  viciousStanceSkillRank?: number;
  /** Стійка парування (339). */
  stanceParry?: boolean;
  /**
   * Активні toggle-стійки расових Fighter / Mystic (Elf/DE/Orc/Dwarf, всі мистики):
   * мапа `l2SkillId` (як рядок) → ранг скіла. Слугує одночасно прапором «увімкнено»
   * і вхідним параметром для `raceFighterToggleStanceCombatDelta(...)`. HF-стійки
   * 256/312/364 живуть у власних `stance*` полях вище — щоб не переписувати багато
   * legacy-логіки `effectiveBattle*Display`/`isStance*Active`.
   */
  raceToggleRanks?: Record<string, number>;
  /** Детект слабкості: підтип цілі (див. `mobWeaknessFamily`). */
  weaknessKind?:
    | 'insect'
    | 'monster'
    | 'animal'
    | 'plant'
    | 'dragon'
    | 'eye_hunter'
    | 'eye_slayer'
    | null;
  /** Множник P.Atk, якщо `weaknessKind` збігається з ціллю. */
  weaknessPatkMul?: number;
  /**
   * Усі накладені детекти (кожен каст додає свій ключ; не перезаписує інші).
   * `weaknessKind` / `weaknessPatkMul` дублюють останній каст — для старих збережень / UI.
   */
  weaknessDetects?: WeaknessDetectMap;
  /** Howl (116): множник до P.Atk моба (напр. 0.77). */
  mobPatkDebuffMul?: number;
  /** Provoke (286): зниження опору цілі до списів/алебарди (%), більший урон від pole. */
  mobPoleResistCutPct?: number;
  /** Thrill Fight (130): трохи сильніші атаки. */
  thrillFightPatkMul?: number;
  /** Rage (94, орк Destroyer/Raider/Titan): множник P.Atk у бою. */
  rageBattlePatkMul?: number;
  /** Rage: множник власного P.Def (&lt;1 — нижчий захист, як у L2). */
  rageBattlePdefMul?: number;
  /**
   * Frenzy (176, Destroyer/Raider/Titan): множник P.Atk з `L2DOP_FRENZY` / `L2DOP_FRENZY2HS` (окремо від Rage і mystic Might).
   */
  frenzyBattlePatkMul?: number;
  /** Frenzy з дворучною важкою зброєю: плоский бонус до точності (`L2DOP_FRENZY2HSACC`). */
  frenzyBattleAccFlat?: number;
  /** Guts (139): множник P.Def у бою. */
  gutsBattlePdefMul?: number;
  /**
   * Zealot (420, text-rpg / XML): множник швидкості фіз. атаки 1.1 / 1.2 / 1.3 за рангом.
   * Не множить P.Atk — лише pAtkSpd у профілі та логіці «швидшої атаки».
   */
  zealotAspdMul?: number;
  /** Zealot: плоский бонус до внутрішньої швидкості бігу (10/20/30), як `addSpeed`. */
  zealotRunSpeedFlat?: number;
  /** Zealot: +6 до точності (Interlude). */
  zealotAccuracyFlat?: number;
  zealotCritRateAdd?: number;
  zealotCritDmgMul?: number;
  /** Zealot: час закінчення ефекту (unix ms). */
  zealotUntilMs?: number;
  /** Lionheart (287): +стійкості до шоку/сну/утримання/паралічу через `activeBuffsJson`. */
  lionheartIncomingPhysMul?: number;
  /**
   * Focus Attack (317): toggle — +Accuracy flat і +Critical Damage % за рангом (polearm).
   * (L2 Interlude) — зберігається в `st.battleModsExpiresAtMsBySkillId["317"]`.
   */
  focusAttackActive?: boolean;
  /** Ривок (4): плоский бонус до «швидкості» в бою (як power у text-rpg). */
  dashRunSpeedFlat?: number;
  /** Швидкий постріл (99): множник швидкості атаки з луком (toggle у бою). */
  rapidShotAspdMul?: number;
  /** Snipe (313): плоскі бонуси до P.Atk / точності / криту (toggle у бою). */
  snipePatkFlat?: number;
  snipeAccuracyFlat?: number;
  snipeCritRateAdd?: number;
  //==== HF gap skills (Treasure Hunter / Adventurer / Knight / DA) — text-rpg орієнтири ====
  /** Фокус шансу (356): активний баф кинджалом (крит/Blow залежать від напрямку). */
  focusChanceActive?: boolean;
  /** Фокус сили (357): активний баф кинджалом (урон критів/Blow залежить від напрямку). */
  focusPowerActive?: boolean;
  /** Блеф (358): множник до сили криту. @deprecated — стара модель Bluff. */
  bluffCritDmgMul?: number;
  /** Bluff (358): ворог розвернутий спиною — unix ms. */
  mobBackExposedUntilMs?: number;
  mobBackExposedIconSkillId?: number;
  silentMoveActive?: boolean;
  silentMoveRunFlat?: number;
  silentMoveEvasionFlat?: number;
  ultimateEvasionActive?: boolean;
  ultimateEvasionEvasionFlat?: number;
  /** Ultimate Defense (110): персонаж не може рухатися. */
  ultimateDefenseImmobile?: boolean;
  fakeDeathActive?: boolean;
  /** Святилище (97): множник вхідного фіз. урону (<1). */
  sanctuaryIncomingPhysMul?: number;
  aegisStanceActive?: boolean;
  aegisPDefMul?: number;
  aegisMDefMul?: number;
  /** Фортеця щита (322). */
  shieldFortressPDefMul?: number;
  /** Підміна (12) тощо: множник P.Def цілі (моба) для атак гравця. */
  mobTargetPDefMul?: number;
  /** Множник M.Def цілі (моба) для магічних атак гравця. */
  mobTargetMDefMul?: number;
  /** Іконка джерела дебафа до сили атаки моба. */
  mobPatkDebuffIconSkillId?: number;
  /** Усі іконки джерел дебафа до сили атаки моба (стек, без ліміту 1). */
  mobPatkDebuffIconSkillIds?: number[];
  /** Іконка джерела дебафа до P.Def моба. */
  mobTargetPDefDebuffIconSkillId?: number;
  /** Усі іконки джерел дебафа до P.Def моба (стек, без ліміту 1). */
  mobTargetPDefDebuffIconSkillIds?: number[];
  /** Іконка джерела дебафа до M.Def (магічного резисту) моба. */
  mobTargetMDefDebuffIconSkillId?: number;
  /** Усі іконки джерел дебафа до M.Def (магічного резисту) моба (стек, без ліміту 1). */
  mobTargetMDefDebuffIconSkillIds?: number[];
  /** Sleep (1069): до цього часу моб спить і не контратакує. */
  mobSleepUntilMs?: number;
  /** Іконка джерела Sleep дебафа (зазвичай 1069). */
  mobSleepIconSkillId?: number;
  /** Shock/Stun на мобі (Hammer Crush 260 тощо) — unix ms. */
  mobStunUntilMs?: number;
  mobStunIconSkillId?: number;
  /** Hamstring Shot (354): множник швидкості пересування моба (<1). */
  mobRunSpeedDebuffMul?: number;
  mobRunSpeedDebuffUntilMs?: number;
  mobRunSpeedDebuffIconSkillId?: number;
  /** PvP: гравець оглушений (жертва) — unix ms. */
  playerStunUntilMs?: number;
  playerStunIconSkillId?: number;
  /** Shield Slam (353): моб не може використовувати фізичні скіли (контратака) — unix ms. */
  mobPhysSkillsBlockedUntilMs?: number;
  mobPhysSkillsBlockedIconSkillId?: number;
  /** Touch of Death (342): дебаф на цілі — unix ms. */
  mobTouchOfDeathUntilMs?: number;
  mobTouchOfDeathIconSkillId?: number;
  /** Touch of Death: −% до debuffResist цілі, поки дебаф активний. */
  mobTouchOfDeathDebuffResistPenaltyPct?: number;
  /** Touch of Death: −% до ефективності лікування цілі (PvP). */
  mobTouchOfDeathHealReceivedPenaltyPct?: number;
  /** Touch of Death: max CP до дебафа (для відновлення після expire). */
  touchOfDeathMobMaxCpBaseline?: number;
  /** PvP: Touch of Death на гравці-жертві — unix ms. */
  playerTouchOfDeathUntilMs?: number;
  playerTouchOfDeathIconSkillId?: number;
  playerTouchOfDeathDebuffResistPenaltyPct?: number;
  playerTouchOfDeathHealReceivedPenaltyPct?: number;
  /** PvP: max CP жертви до ToD (для відновлення після expire). */
  touchOfDeathPlayerMaxCpBaseline?: number;
  /** PvP: жертва не може використовувати фізичні скіли — unix ms. */
  playerPhysSkillsBlockedUntilMs?: number;
  playerPhysSkillsBlockedIconSkillId?: number;
  /** Відбиття шкоди (86): частка вхідного урону → назад мобу. */
  reflectDamageReturnRatio?: number;
  /** Фізичне дзеркало (350): % шанс відбити фізичний скіл. */
  physicalMirrorPhysReflectChancePct?: number;
  /** Фізичне дзеркало (350): % шанс відбити магію. */
  physicalMirrorMagicReflectChancePct?: number;
  physicalMirrorIconSkillId?: number;
  /** @deprecated Стара модель Physical Mirror — знімається при expire 350. */
  physicalMirrorReflectRatio?: number;
  /** Відплата (368): персонаж не може рухатися під час селф-захисту. */
  vengeanceImmobile?: boolean;
  /** Snipe (313): персонаж не може рухатися під час точного пострілу. */
  snipeImmobile?: boolean;
  /** @deprecated Стара модель Vengeance — знімається при expire 368. */
  vengeanceIncomingPhysMul?: number;
  /** @deprecated Стара модель Vengeance — знімається при expire 368. */
  vengeanceReflectRatio?: number;
  //==== Human Mystic — бафи в бою (Might, Acumen, Shield …) ====
  /** Множник P.Atk від магічних бафів (не змішується з War Cry — добуток у кидку). */
  mysticPatkBuffMul?: number;
  mysticMatkBuffMul?: number;
  mysticCastSpdBuffMul?: number;
  mysticPdefBuffMul?: number;
  mysticMdefBuffMul?: number;
  /**
   * Лише UI: який `l2SkillId` наклав відповідний mystic-* баф (щоб іконка в смузі збігалася з панеллю).
   */
  mysticPatkBuffIconSkillId?: number;
  mysticMatkBuffIconSkillId?: number;
  mysticCastSpdBuffIconSkillId?: number;
  mysticPdefBuffIconSkillId?: number;
  mysticMdefBuffIconSkillId?: number;
  /**
   * Заряд душі воїна (фіз. соска): множник до фіз. атаки в цьому бою після активації на хотбарі.
   * Списання патронів — при успішному фіз. попаданні по мобу.
   */
  fighterSoulshotPatkMul?: number;
  fighterSoulshotItemId?: number;
  /**
   * Благословений заряд духу (маг): множник до M.Atk у магічних кидках після активації на хотбарі.
   */
  mysticBlessedSpiritshotMatkMul?: number;
  mysticBlessedSpiritshotItemId?: number;
}

/** Бойове зілля: відновлення HP/MP імпульсами (див. `battleCombatPotions.ts`). */
export interface BattlePotionHoTEntry {
  remaining: number;
  perTick: number;
  nextTickAtMs: number;
  /** Інтервал між імпульсами (мс); за замовчуванням 1000 (зілля). */
  tickMs?: number;
}

/** Додаткові «поруч» для AoE (Вихор 36, Sonic Storm 7): той самий фіз. урон, що й по головній цілі. */
export interface WhirlwindExtraMobJson {
  spawnId: string;
  name: string;
  mobHp: number;
  mobMaxHp: number;
  mobPAtk: number;
  mobPDef: number;
  mobMAtk: number;
  mobMDef: number;
  mobEvasion: number;
  /** Howl (116): множник P.Atk цього додаткового моба (0.77 = −23%). */
  mobPatkDebuffMul?: number;
  /** Provoke (286): −% опору до списів для цієї додаткової цілі. */
  mobPoleResistCutPct?: number;
  /** Лут/EXP уже видано (щоб не дублювати при наступних ударах). */
  lootGranted?: boolean;
}

export interface BattleJsonState {
  spawnId: string;
  /** PvE за замовчуванням; `pvp` — бій з іншим гравцем на карті. */
  battleMode?: 'pve' | 'pvp';
  /** Ціль PvP (character.id опонента). */
  pvpTargetCharacterId?: string;
  pvpTargetName?: string;
  pvpTargetLevel?: number;
  mobHp: number;
  mobMaxHp: number;
  /** У PvE — «CP моба» для ефектів на кшталт Гніву (Wrath); max зазвичай від max HP. */
  mobCp?: number;
  mobMaxCp?: number;
  mobPAtk: number;
  mobPDef: number;
  mobMAtk: number;
  mobMDef: number;
  /** Ухилення для формули попадання (l2dop sqrt(DEX)*6+LVL). У старих збереженнях перераховуємо з рівня спавну). */
  mobEvasion?: number;
  /** Howl (116): множник P.Atk цього додаткового моба (0.77 = −23%). */
  mobPatkDebuffMul?: number;
  log: string[];
  /** MP у цьому бою (l2dop skills mpConsume). Якщо немає — трактуємо як повний пул у старих збереженнях. */
  playerMp?: number;
  /** PvP: поточний CP гравця в бою (Wrath знімає CP). */
  playerCp?: number;
  /** PvP: max CP гравця на старті бою. */
  playerMaxCp?: number;
  /** Бафи скілів / стійки — джерело істини для множників у `rollPlayerPhysicalDmg` та ліміту HP. */
  battleMods?: BattleBattleMods;
  /**
   * Дубль War Cry (78): той самий множник, що й `battleMods.warCryPatkMul`.
   * На верхньому рівні JSON — щоб драйвер/БД не губили вкладене поле (часто лишався лише Battle Roar).
   */
  warCryPatkMul?: number;
  /** КД магічних скілів: `l2_<id>` → timestamp (ms), коли знову доступний. */
  mysticSkillCdUntil?: Record<string, number>;
  /**
   * Час останнього тику MP-дренажу від стійок у бою (ms). Між ходами стійка
   * витрачає MP зі швидкістю `STANCE_MP_PER_SEC`; коли MP = 0 — стійка слітає.
   */
  lastStanceTickMs?: number;
  /**
   * Час останнього тіку бойового регену HP/MP (ms). Тік застосовується пакетами
   * раз на 2 секунди під час `performBattleAction`.
   */
  lastRegenTickMs?: number;
  /**
   * `expiresAt` (unix ms) для legacy-бафів у `battleMods`, яких поки що немає
   * в `activeBuffsJson` (Rage / Frenzy / Guts / Lionheart / Howl / Focus Attack /
   * Weakness-детекти). Ключ — L2 skillId як рядок (`"94"`, `"317"`).
   * Див. `LEGACY_BUFF_STRIP_BY_SKILL_ID` у `battleServicePerformBattleAction`.
   */
  battleModsExpiresAtMsBySkillId?: Record<string, number>;
  /** До 2 додаткових мобів у радіусі бою (не головна ціль); HP зменшуються при успішному Вихорі.
   */
  whirlwindExtras?: WhirlwindExtraMobJson[];
  /**
   * PvP: жертва вступила в бій / завдала урон — безкармове вбивство неможливе.
   */
  pvpVictimFoughtBack?: boolean;
  /** PvP: цей гравець першим розпочав атаку (для карми). */
  pvpIsAggressor?: boolean;
  /** Контекст PvP: world / siege / arena / olympiad (формули однакові). */
  playerCombatMode?: import('./playerCombatMode.js').PlayerCombatMode;
  /** Clan Siege: id активної облоги (server-authoritative). */
  siegeId?: string;
  /** Clan Siege: cityId облоги для return URL. */
  siegeCityId?: string;
  /**
   * Після успішного Вихору: скільки наступних базових автоатак мають cleave по `whirlwindExtras`.
   * Зараз використовуємо 1 (лише наступна автоатака).
   */
  whirlwindNextAutoCleaveHits?: number;
  /**
   * Timestamp (unix ms) останньої базової дії `attack` гравця у цьому бою.
   * Потрібен для «накопичувальної атаки»: кількість ударів = floor(dt / interval).
   */
  lastPlayerAttackAtMs?: number;
  /**
   * Лічильник до контрудару моба: після кожної «атакуючої» дії гравця зменшується на 1.
   * Коли доходить до 0 — моб б'є у відповідь, а лічильник скидається у випадкове 1..3.
   */
  mobHitsUntilRetaliation?: number;
  /**
   * Зілля зцілення в бою: імпульси HP раз на 1 с після використання з хотбара.
   */
  battlePotionHpHoT?: BattlePotionHoTEntry;
  /**
   * Зілля мани в бою: імпульси MP раз на 1 с.
   */
  battlePotionMpHoT?: BattlePotionHoTEntry;
  /** Touch of Life (341): +250 HP кожні 5 с протягом захисного ефекту. */
  battleTouchOfLifeHpHoT?: BattlePotionHoTEntry;
  /**
   * Sonic Focus (Gladiator/Duelist, id 8): поточна кількість накопичених зарядів.
   * Додається при касті Sonic Focus; витрачається при касті sonic-скілів
   * (див. `SONIC_CHARGE_COST_BY_SKILL_ID`). Скидається до 0 при смерті гравця.
   */
  sonicCharges?: number;
  /**
   * Максимум Sonic-зарядів. За замовчуванням `SONIC_MAX_CHARGES_DEFAULT` (10);
   * L2 Interlude — 7, але за бажанням гравця тримаємо 10 для комфорту.
   */
  maxSonicCharges?: number;
  /**
   * Монотонний лічильник змін бойового стану (включно з RB tick/flush).
   * Не збігається з `character.revision` — revision++ лише на видимих мутаціях гравця.
   */
  battleVersion?: number;
  /** Покоління спільної сесії РБ — для anti-stale sync після respawn. */
  worldBossSpawnGeneration?: number;
  /** Sync-only: battleJson застарів відносно WorldBossSession.spawnGeneration. */
  worldBossSpawnStale?: boolean;
  /**
   * Монотонний лічильник рядків логу (виживає обрізання `log` до MAX_BATTLE_LOG).
   */
  lastLogSeq?: number;
  /** Party PvE: pointer на canonical PartyBattleSession (mobHp у session, не solo). */
  partyBattleId?: string;
}

/** Касти мага: канонічний `l2_<skillId>` з каталогу Human Mystic. */
export type MysticL2BattleActionId = `l2_${string}`;

/** Базові дії (інші раси / гілки). Людина-воїн: див. l2dopHumanFighterBattleSkills. */
export type BattleActionId =
  | 'attack'
  | 'power'
  | 'bolt'
  | 'stun'
  | 'power_strike'
  | 'power_shot'
  | 'double_shot'
  | 'burst_shot'
  | 'mortal_blow'
  | 'war_cry'
  | 'stun_attack'
  | 'wild_sweep'
  | 'power_smash'
  | 'whirlwind'
  | 'thunder_storm'
  | 'provoke'
  /** Стійки (toggle); поки заглушка в резолвері — без урону, для панелі й навчання. */
  | 'accuracy_stance'
  | 'vicious_stance'
  | 'parry_stance'
  | 'riposte_stance'
  /** Ривок (4) — короткий бонус до швидкості в бою (Rogue-гілка). */
  | 'dash'
  /** Швидкий постріл (99) — баф швидкості атаки з луком (Hawkeye / Sagittarius). */
  | 'rapid_shot'
  | 'hawk_eye'
  | 'soul_of_sagittarius'
  | 'snipe'
  | 'stun_shot'
  | 'lethal_shot'
  | 'hamstring_shot'
  /** Самобафи / детекти / warlord-dreadnought (мапінг у CANONICAL_L2_SKILL_TO_BATTLE_ACTION). */
  | 'detect_insect_weakness'
  | 'detect_monster_weakness'
  | 'detect_animal_weakness'
  | 'detect_dragon_weakness'
  | 'detect_plant_weakness'
  | 'howl'
  | 'battle_roar'
  | 'thrill_fight'
  | 'revival'
  | 'lionheart'
  | 'focus_attack'
  | 'wrath'
  | 'earthquake'
  | 'eye_hunter'
  | 'eye_slayer'
  | 'shock_blast'
  | 'backstab'
  | 'deadly_blow_dagger'
  | 'switch_target'
  | 'unlock'
  | 'lure'
  | 'fake_death'
  | 'ultimate_evasion'
  | 'silent_move'
  | 'lethal_blow_adv'
  | 'focus_chance'
  | 'focus_power'
  | 'bluff'
  | 'aggression'
  | 'hate_aura'
  | 'divine_heal'
  | 'holy_blessing'
  | 'sacrifice'
  | 'remedy'
  | 'holy_strike'
  | 'drain_health'
  | 'iron_will'
  | 'majesty'
  | 'ultimate_defense'
  | 'deflect_arrow'
  | 'shield_stun'
  | 'shield_slam'
  | 'sanctuary'
  | 'aegis_stance'
  | 'horror'
  | 'reflect_damage'
  | 'corpse_plague'
  | 'hamstring_slash'
  | 'summon_dark_panther'
  | 'shield_fortress'
  | 'touch_of_life'
  | 'fortitude'
  | 'focus_skill_mastery'
  | 'touch_of_death'
  | 'physical_mirror'
  | 'vengeance'
  /** Zealot (420) — орк: Destroyer, Titan, Tyrant, Grand Khavatari. */
  | 'zealot'
  /** Тогл заряду душі (фіз.) з хотбара — лише для гілки воїна, перевірка itemId на сервері. */
  | 'fighter_soulshot_toggle'
  /** Тогл благословенного заряду духу з хотбара — лише для гілки мага. */
  | 'mystic_spiritshot_toggle'
  /** Використати бойове зілля з хотбара (HP/MP банки). */
  | 'battle_potion_use'
  /** Gladiator / Duelist (гілка подвійних мечів, text-rpg + l2db). */
  | 'triple_slash'
  | 'double_sonic_slash'
  | 'sonic_blaster'
  | 'sonic_storm'
  | 'sonic_focus'
  | 'sonic_buster'
  | 'fatal_strike'
  | 'hammer_crush'
  | 'triple_sonic_slash'
  | 'sonic_move'
  | 'sonic_guard'
  | 'sonic_rage'
  | MysticL2BattleActionId;

/**
 * Дії без зміни HP моба (баф/дебаф/стійка/детект). Останній рубіж у `performBattleAction`.
 */
export const BATTLE_ACTIONS_NO_MOB_HP = new Set<BattleActionId>([
  'war_cry',
  'fighter_soulshot_toggle',
  'mystic_spiritshot_toggle',
  'dash',
  'rapid_shot',
  'hawk_eye',
  'soul_of_sagittarius',
  'snipe',
  'battle_roar',
  'accuracy_stance',
  'vicious_stance',
  'parry_stance',
  'riposte_stance',
  'detect_insect_weakness',
  'detect_monster_weakness',
  'detect_animal_weakness',
  'detect_dragon_weakness',
  'detect_plant_weakness',
  'howl',
  'thrill_fight',
  'revival',
  'lionheart',
  'drain_health',
  'iron_will',
  'majesty',
  'ultimate_defense',
  'deflect_arrow',
  'shield_stun',
  'shield_slam',
  'zealot',
  'eye_hunter',
  'eye_slayer',
  'focus_attack',
  /** У L2 — агро/дебаф, без прямого урону по цілі в нашій моделі. */
  'provoke',
  'switch_target',
  'unlock',
  'lure',
  'fake_death',
  'ultimate_evasion',
  'silent_move',
  'focus_chance',
  'focus_power',
  'bluff',
  'aggression',
  'hate_aura',
  'divine_heal',
  'holy_blessing',
  'sacrifice',
  'remedy',
  'sanctuary',
  'aegis_stance',
  'horror',
  'reflect_damage',
  'summon_dark_panther',
  'shield_fortress',
  'physical_mirror',
  'vengeance',
  'touch_of_life',
  'fortitude',
  'focus_skill_mastery',
  /** Sonic-каст: self-buff (charges), без удару по мобу. */
  'sonic_focus',
  /** Sonic-буфер швидкості/захисту. */
  'sonic_move',
  'sonic_guard',
]);
