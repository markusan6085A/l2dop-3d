/**
 * Бій гравець ↔ моб на карті (l2dop / text-rpg: pAtk, pDef, HP).
 *
 * **Шари як у text-rpg** (див. `text-rpg/src/state/battle/actions/useSkill.ts`,
 * `attackSkill.ts` / `buffSkill.ts` / `toggleSkill.ts`, `pickCombatStatsForServer` у `pveAttackSkillOnline.ts`):
 *
 * 1. **Профіль / персонаж у місті** — `CharacterSnapshot`: `computeCombatStats` + екіп + світові бафи
 *    (`activeBuffsJson`) + **пасивні скіли з `skillsLearnedJson`** (як users_skills у PHP).
 *    Поза боєм **стійки / War Cry** з `worldCombatStateJson` враховані в показі P.Atk / точності / P.Def / M.Def
 *    (text-rpg toggles / бафи; узгоджено з `rollPlayerPhysicalDmg`). У **бою** — те саме з `battleJson.battleMods`.
 *    Злиття «бій + світ (після tick)» для модів — **`mergeDisplayBattleMods`** у `combatDisplayContext.ts` (не передавати лише вкладений `battleMods` без `spawnId`).
 * 2. **Сесія бою** — `battleJson`: HP моба, MP у бою, **`battleMods`** (War Cry, Battle Roar, стійка).
 *    Це окремо від профільних статів; при виході з бою `battleJson` скидається.
 * 3. **Урон по мобу** (атака, скіл, у т.ч. умовний «AoE» при одній цілі) — лише **`mobHp`** у `battleJson`.
 *    Як у text-rpg для 1v1: `scope: "area"` все одно б’є поточну ціль (`debuffHandlers.ts` коментар).
 *    Урон **не** накопичується в pAtk/mAtk у snapshot.
 *
 * Дроп, SP, агро — пізніше.
 *
 * Реалізацію розбито на модулі `battleTypes`, `battleModsJson`, `battleModsPatch`, `battleEffectiveDisplay`, `battleMobSpawn`.
 */

export * from './battleTypes.js';
export * from './battleModsJson.js';
export * from './battleModsPatch.js';
export * from './battleEffectiveDisplay.js';
export * from './battleMobSpawn.js';
export * from './combatDisplayContext.js';
export * from './effectiveCharacterLevel.js';
