/**
 * Таблиця накопиченого EXP → рівень (база l2dop/expgain.php, пороги ÷3 для швидшого темпу L2DOP).
 * Рівень 1: від 0 EXP. Верх рівня 80: exp < L2DOP_MAX_EXP_EXCLUSIVE.
 *
 * `levelFromTotalExp` — snapshot, бій, стати (`computeCombatStats` / `computeVitals`).
 */

/** Мінімальний повний EXP для рівня 1..80 (канонічні пороги ÷3). Індекс = level - 1. */
export const L2DOP_LEVEL_MIN_EXP: readonly bigint[] = [
  0n,
  22n,
  120n,
  389n,
  961n,
  2012n,
  3762n,
  6474n,
  10459n,
  16076n,
  23733n,
  33892n,
  47064n,
  63817n,
  84776n,
  110622n,
  142095n,
  179999n,
  225198n,
  278620n,
  341261n,
  414181n,
  433788n,
  482577n,
  706291n,
  832358n,
  975083n,
  1135965n,
  1316584n,
  1518599n,
  1743748n,
  1993858n,
  2270837n,
  2576681n,
  2913473n,
  3283388n,
  3688690n,
  4131738n,
  4614983n,
  5140976n,
  5712362n,
  6331888n,
  7002400n,
  7726851n,
  8508289n,
  9349877n,
  10254883n,
  11226683n,
  12268761n,
  13384720n,
  15175043n,
  17087495n,
  19127997n,
  21302638n,
  23617696n,
  26900275n,
  30387553n,
  34088627n,
  38012863n,
  42169883n,
  48769400n,
  55748116n,
  63121623n,
  70905971n,
  79117552n,
  90658421n,
  102814387n,
  115609046n,
  129066512n,
  143211511n,
  158069324n,
  177565003n,
  202107588n,
  232127099n,
  268075103n,
  310425271n,
  450425183n,
  637091995n,
  933091986n,
  1333333333n,
];

/** Виключна верхня межа EXP для 80 рівня (канон ÷3). */
export const L2DOP_MAX_EXP_EXCLUSIVE = 166666666666n;

/** Максимальний накопичений EXP у БД (остання допустима величина для 80 рівня). */
export const L2DOP_MAX_TOTAL_EXP_INCLUSIVE = L2DOP_MAX_EXP_EXCLUSIVE - 1n;

export function levelFromTotalExp(exp: bigint): number {
  const e = exp < 0n ? 0n : exp;
  if (e >= L2DOP_MAX_EXP_EXCLUSIVE) {
    return 80;
  }
  for (let L = 80; L >= 1; L--) {
    if (e >= L2DOP_LEVEL_MIN_EXP[L - 1]!) {
      return L;
    }
  }
  return 1;
}

/**
 * Прогрес смуги EXP у поточному рівні: cur / max у межах рівня, відсоток заповнення.
 */
export function expSegmentForLevelBar(totalExp: bigint): {
  level: number;
  cur: bigint;
  max: bigint;
  pct: number;
} {
  const exp = totalExp < 0n ? 0n : totalExp;
  const level = levelFromTotalExp(exp);
  const start = L2DOP_LEVEL_MIN_EXP[level - 1]!;
  const endExclusive =
    level < 80 ? L2DOP_LEVEL_MIN_EXP[level]! : L2DOP_MAX_EXP_EXCLUSIVE;
  const max = endExclusive - start;
  let cur = exp - start;
  if (cur < 0n) cur = 0n;
  if (cur > max) cur = max;
  if (max <= 0n) {
    return { level, cur: 0n, max: 1n, pct: 100 };
  }
  const pct = Math.min(
    100,
    max > 0n ? Math.round((Number(cur) / Number(max)) * 10000) / 100 : 100
  );
  return { level, cur, max, pct };
}
