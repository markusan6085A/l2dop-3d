/**
 * Таблиці бафів з l2dop `l2calc/rawdata.php` (підключається в calc_stats.php).
 * Індекс 0 не використовується — рівні з PHP: $TBL[$bufflvl], bufflvl >= 1.
 */

export const L2DOP_MIGHT = [0, 1.08, 1.12, 1.15, 1.25] as const;
export const L2DOP_GREATER_MIGHT = [0, 1.04, 1.07, 1.1] as const;
export const L2DOP_SHIELD = [0, 1.08, 1.12, 1.15] as const;
export const L2DOP_GREATER_SHIELD = [0, 1.05, 1.1, 1.15] as const;
export const L2DOP_WINDWALK = [0, 20, 33] as const;
export const L2DOP_HASTE = [0, 1.15, 1.33] as const;
export const L2DOP_ACUMEN = [0, 1.15, 1.23, 1.3] as const;
export const L2DOP_EMPOWER = [0, 1.55, 1.65, 1.75, 1.44] as const;
export const L2DOP_MAGIC_BARRIER = [0, 1.15, 1.23, 1.3] as const;
export const L2DOP_GUIDANCE = [0, 2, 3, 4] as const;
export const L2DOP_FOCUS = [0, 0.2, 0.25, 0.3] as const;
export const L2DOP_AGILITY = [0, 2, 3, 4] as const;
export const L2DOP_CRITICAL_CHANCE = [0, 0.2, 0.3, 0.4] as const;
export const L2DOP_FASTCAST = [0, 1.05, 1.07, 1.1] as const;
export const L2DOP_GUTS = [0, 2, 2.5, 3] as const;
export const L2DOP_MAJESTY = [0, 1.07, 1.11, 1.15] as const;
export const L2DOP_MAJESTY_EVA = [0, -2, -4, -6] as const;
export const L2DOP_HAWKEYE = [0, 6, 8, 10] as const;
export const L2DOP_DASH = [0, 1.4, 1.66] as const;

export const L2DOP_DEACC = [0, 12, 13] as const;
export const L2DOP_DEASPD = [0, 0.83, 0.8, 0.77] as const;
/** Як $HEX у rawdata (індекс 0 = 0.77 — у PHP bufflvl зазвичай ≥1). */
export const L2DOP_HEX = [
  0, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77,
  0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77,
  0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77,
  0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77,
] as const;
export const L2DOP_WEAKNESS = [0, 0.83, 0.8, 0.77] as const;
export const L2DOP_SLOW = [0, 0.7, 0.55] as const;
export const L2DOP_CURSEOFSHADE = [0, 0.94, 0.92, 0.9] as const;
export const L2DOP_SNIPE = [0, 110, 119, 129, 138, 148, 158, 167, 177] as const;
export const L2DOP_SNIPEACC = [0, 2, 2, 2, 2, 2, 2, 2, 2] as const;
export const L2DOP_STEALTH = [0, 0.55, 0.7, 0.85] as const;
export const L2DOP_STEALTHEVA = [0, -12, -8, -4] as const;
export const L2DOP_THRILLFIGHT = [0, 1.05, 1.1] as const;
export const L2DOP_FRENZY = [0, 2, 2.5, 3] as const;
export const L2DOP_FRENZY2HS = [0, 2.502, 2.994, 4.0195] as const;
export const L2DOP_FRENZY2HSACC = [0, 4, 4, 4] as const;
export const L2DOP_RAGE = [0, 1.45, 1.55] as const;
export const L2DOP_RAGE2HS = [0, 1.554, 1.64085] as const;
export const L2DOP_RAGE2HSACC = [0, 2, 4] as const;
export const L2DOP_RAPIDFIRE = [0, 124, 134, 145, 155, 166, 177, 188, 199] as const;
export const L2DOP_RAPIDSHOT = [0, 1.08, 1.12] as const;
export const L2DOP_DEADEYEPATK = [0, 124, 134, 145, 155, 166, 177, 188, 199] as const;
export const L2DOP_DEADEYEACC = [0, 1, 1, 2, 2, 2, 3, 3, 3] as const;
export const L2DOP_HSCHOLACC = [0, 3, 6, 8, 10, 6, 0, 0, 0, 0, 0] as const;
export const L2DOP_HSCHOLEVA = [0, 0, -3, -3, -3, -5, -5, -5, -8, -9, -10] as const;
export const L2DOP_HSMALARIA = [0, 1.04, 1.08, 1.12, 1.16, 1.08, 1, 1, 1, 1, 1] as const;
export const L2DOP_UDPDEF = [
  0, 1800, 3600, 5400, 3636, 3672, 3708, 3744, 3780, 3816, 3852, 3888, 3924,
  3960, 3996, 4032, 4068, 4104, 4140, 4176, 4212, 4248, 4284, 4320, 4356,
  4392, 4428, 4464, 4500, 4536, 4572, 4608, 4644, 4680,
] as const;
export const L2DOP_UDMDEF = [
  0, 1350, 2700, 4050, 2727, 2754, 2781, 2808, 2835, 2862, 2889, 2916, 2943,
  2970, 2997, 3024, 3051, 3078, 3105, 3132, 3159, 3186, 3213, 3240, 3267,
  3294, 3321, 3348, 3375, 3402, 3429, 3456, 3483, 3510,
] as const;
export const L2DOP_UE = [0, 20, 25] as const;
export const L2DOP_PGIFT = [0, 1.08, 1.12, 1.15] as const;
export const L2DOP_TGOP = [0, 1.15, 1.23, 1.3] as const;
export const L2DOP_TTOP = [0, 2, 3, 4] as const;
export const L2DOP_TWOP = [0, 1.15, 1.23, 1.3] as const;
export const L2DOP_BOP = [0, 1.08, 1.12, 1.15] as const;
export const L2DOP_SEOS = [
  0, 0.7, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
] as const;

export const L2DOP_BTB = [0, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35] as const;
export const L2DOP_BTS = [0, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35] as const;
export const L2DOP_SOULOFSAG = [0, 1.1, 1.15, 1.2, 1.25] as const;

/** Значення з PHP-масиву за рівнем; за межами — останній валідний рівень. */
export function l2dopTableAt(
  tbl: ReadonlyArray<number>,
  bufflvl: number
): number {
  const lvl = Math.max(1, Math.floor(bufflvl));
  if (lvl < 1 || tbl.length <= 1) return tbl[1] ?? 1;
  const cap = tbl.length - 1;
  return tbl[lvl > cap ? cap : lvl] ?? 1;
}
