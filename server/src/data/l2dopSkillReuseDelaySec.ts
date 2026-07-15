/**
 * Interlude reuse delay (відкат «Откат»), секунди.
 *
 * НЕ плутати з cast/hit time («Каст» / «Время перезарядки» на l2db skillInfo —
 * там часто потрапляє саме час касту, див. `l2dbSkillCooldowns.generated.ts`).
 *
 * Джерело: lineage2wiki.org/interlude + l2db UI (поле «Откат»).
 */
export const L2DOP_SKILL_REUSE_DELAY_SEC: Readonly<
  Partial<Record<number, number>>
> = {
  /** War Cry — відкат 180 с (каст 1.5 с). */
  78: 180,
  /** Stun Attack — відкат 13 с на всіх рівнях (каст 1.08 с). */
  100: 13,
  /** Power Smash — відкат 13 с на всіх рівнях (каст 1.08 с). */
  255: 13,
};
