/**
 * Interlude reuse delay (відкат «Откат»), секунди — **база при castSpd = 600**.
 *
 * У бою масштабується через `scaleMysticCooldownByCastSpeed` (вищий castSpd → коротший CD).
 *
 * НЕ плутати з cast/hit time («Каст» / «Время перезарядки» на l2db skillInfo —
 * там часто потрапляє саме час касту, див. `l2dbSkillCooldowns.generated.ts`).
 *
 * Джерело: lineage2wiki.org/interlude + l2db UI (поле «Откат»).
 */
export const L2DOP_SKILL_REUSE_DELAY_SEC: Readonly<
  Partial<Record<number, number>>
> = {
  /** Dash — відкат 25 с (каст 1 с). */
  4: 25,
  /** War Cry — відкат 180 с (каст 1.5 с). */
  78: 180,
  /** Backstab — відкат 11 с (каст 1.08 с). */
  30: 11,
  /** Deadly Blow — відкат 11 с (каст 1.08 с). */
  263: 11,
  /** Lethal Blow — відкат 15 с (каст 1.8 с). */
  344: 15,
  /** Bluff — відкат 30 с (каст 1 с). */
  358: 30,
  /** Stun Attack — відкат 13 с на всіх рівнях (каст 1.08 с). */
  100: 13,
  /** Power Smash — відкат 13 с на всіх рівнях (каст 1.08 с). */
  255: 13,
  /** Wild Sweep — відкат 17 с на всіх рівнях (каст 1.08 с). */
  245: 17,
  /** Detect Plant Weakness — відкат 10 с (каст ~1.5 с). */
  104: 10,
  /** Self Heal — відкат 10 с (каст 5 с). */
  1216: 10,
  /** Battle Heal — відкат 3 с (каст 2 с). */
  1015: 3,
  /** Group Heal — відкат 25 с (каст 7 с). */
  1027: 25,
  /** Wind Strike — відкат 6 с (каст 4 с). */
  1177: 6,
  /** Ice Bolt — відкат 8 с (каст 3,1 с). */
  1184: 8,
  /** Vampiric Touch — відкат 12 с (каст 3,2 с). */
  1147: 12,
  /** Curse: Weakness — відкат 8 с (каст 1,5 с). */
  1164: 8,
  /** Eye of the Slayer — відкат 3 с (каст 2 с). */
  360: 3,
};
