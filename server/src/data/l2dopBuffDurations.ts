/**
 * Тривалості активних бафів у секундах (L2 Interlude).
 *
 * Джерело: L2 Interlude skill XML (abnormalTime / operateCond). Для бафів, яких тут немає,
 * система трактує запис у `activeBuffsJson` як постійний (до cancel / смерті), поки ми не
 * додамо відповідний рядок. НЕ вигадуємо тривалість «на око»: додаємо лише перевірене.
 *
 * Використання: `activeBuffExpiresAt(skillId, nowMs)` повертає `now + durationSec*1000` або `undefined`.
 * Записується разом з бафом у `activeBuffsJson` як `expiresAt` і перевіряється у
 * `combatBuffsFromActiveJson` / `stripExpiredActiveBuffs`.
 */

/** Мапа `l2SkillId -> durationSec`. Тримаємо вузько, нарощуємо по мірі покриття скілів. */
export const L2DOP_BUFF_DURATION_SEC_BY_SKILL_ID: Readonly<
  Partial<Record<number, number>>
> = {
  // ---- Human Fighter → Warrior → Warlord → Dreadnought ----
  /** Dash (Rogue — для довідки, бо є в каталозі Fighter) */
  4: 20,
  /** Detect Insect Weakness */
  75: 300,
  /** Aggression (18) — короткий контроль агро/дебаф. */
  18: 15,
  /** War Cry */
  78: 120,
  /** Detect Monster Weakness */
  80: 300,
  /** Detect Animal Weakness */
  87: 300,
  /** Detect Dragon Weakness */
  88: 300,
  /** Detect Plant Weakness */
  104: 300,
  /** Horror (Dark Avenger/Hell Knight) */
  65: 20,
  /** Reflect Damage */
  86: 60,
  /** Summon Dark Panther (в нашій battle-моделі як тимчасовий бонус). */
  283: 60,
  /** Rage (Warlord-гілка) — сильніший фіз. удар, нижчий P.Def (L2 Interlude ~60с). */
  94: 60,
  /** Rapid Shot — вища швидкість атаки з луком (L2 Interlude-style self-buff). */
  99: 60,
  /** Howl (Warlord) — дебаф P.Atk моба. */
  116: 120,
  /** Battle Roar (+Max HP / миттєвий хіл) */
  121: 1200,
  /** Thrill Fight */
  130: 600,
  /** Guts — міцніший P.Def. */
  139: 60,
  /** Ultimate Evasion (Treasure Hunter/Adventurer) */
  111: 30,
  /** Frenzy — різко сильніший фіз. удар при низькому HP. */
  176: 30,
  /** Lionheart (антистани) */
  287: 60,
  /** Focus Attack (полеарм +accuracy/+crit) */
  317: 30,
  /** Eye of the Hunter */
  359: 300,
  /** Eye of the Slayer */
  360: 300,
  /** Sanctuary (Paladin/Phoenix) */
  97: 30,
  /** Shield Fortress */
  322: 30,
  /** Physical Mirror */
  350: 60,
  /** Vengeance */
  368: 30,
  // ---- Rogue / Adventurer (для майбутньої гілки, але часто перетинаються) ----
  /** Focus Chance */
  356: 300,
  /** Focus Power */
  357: 300,
  /** Bluff */
  358: 8,
  /** Snipe */
  313: 60,
  // ---- Gladiator / Duelist (sonic-гілка, l2db Interlude) ----
  /** Sonic Move (451) — L2 Interlude: +speed на ~15 с. */
  451: 15,
  /** Sonic Guard (442) — захисний самобаф на ~10 с. */
  442: 10,
  // ---- Mystic self-buffs / підтримка таймера ring у бою ----
  /** Might */
  1068: 1200,
  /** Shield */
  1040: 1200,
  /** Bless the Body */
  1045: 1200,
  /** Bless the Soul */
  1048: 1200,
  /** Empower */
  1059: 1200,
  /** Berserker Spirit */
  1062: 1200,
  /** Magic Barrier */
  1036: 1200,
  /** Focus */
  1077: 1200,
  /** Concentration (1078) — self-buff швидкості касту. */
  1078: 1200,
  /** Acumen */
  1085: 1200,
  /** Haste */
  1086: 1200,
  /** Wind Walk */
  1204: 1200,
  /** Guidance */
  1240: 1200,
  /** Death Whisper */
  1242: 1200,
  /** Bless Shield */
  1243: 1200,
};

/** Секунди тривалості для `skillId`; `undefined` — тривалість не описана (трактується як постійний). */
export function buffDurationSecForSkillId(skillId: number): number | undefined {
  const v = L2DOP_BUFF_DURATION_SEC_BY_SKILL_ID[skillId];
  return typeof v === 'number' && v > 0 ? v : undefined;
}

/**
 * `expiresAt` у мс для запису в `activeBuffsJson`. `undefined` — якщо тривалість невідома
 * (пишемо без поля — буф не знімається за часом, лише за cancel/смертю/ручним strip).
 */
export function activeBuffExpiresAt(
  skillId: number,
  nowMs: number
): number | undefined {
  const sec = buffDurationSecForSkillId(skillId);
  if (sec === undefined) return undefined;
  return nowMs + Math.floor(sec * 1000);
}
