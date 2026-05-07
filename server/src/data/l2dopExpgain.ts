/**
 * Таблиця накопиченого EXP → рівень, як у l2dop/expgain.php (пороги $e1 / $n1 для кожного рівня).
 * Рівень 1: від 0 EXP до 67 невключно (у PHP exp>=1 для «офіційного» рівня 1; у нас 0 допускається для старту).
 * Верх рівня 80: exp < 500_000_000_000 (як у PHP $n1 для 80 рівня).
 *
 * Зв’язок з іншими формулами: `levelFromTotalExp` визначає рівень для snapshot і бою; далі
 * `computeCombatStats` / `computeVitals` (l2dop/calc_stats.php) рахують стати та HP/MP/CP від цього рівня.
 */

/** Мінімальний повний EXP, щоб перебувати на рівні (level), 1..80. Індекс = level - 1. */
export const L2DOP_LEVEL_MIN_EXP: readonly bigint[] = [
  0n,
  67n,
  362n,
  1167n,
  2883n,
  6037n,
  11286n,
  19422n,
  31377n,
  48228n,
  71201n,
  101676n,
  141192n,
  191453n,
  254329n,
  331866n,
  426287n,
  539999n,
  675595n,
  835861n,
  1023783n,
  1242545n,
  1301364n,
  1447733n,
  2118873n,
  2497076n,
  2925249n,
  3407896n,
  3949754n,
  4555797n,
  5231244n,
  5981575n,
  6812513n,
  7730043n,
  8740421n,
  9850165n,
  11066071n,
  12395215n,
  13844951n,
  15422930n,
  17137087n,
  18995665n,
  21007200n,
  23180554n,
  25524869n,
  28049631n,
  30764650n,
  33680051n,
  36806283n,
  40154161n,
  45525131n,
  51262487n,
  57383992n,
  63907914n,
  70853089n,
  80700827n,
  91162660n,
  102265882n,
  114038590n,
  126509649n,
  146308201n,
  167244350n,
  189364870n,
  212717913n,
  237352657n,
  271975264n,
  308443162n,
  346827140n,
  387199536n,
  429634534n,
  474207973n,
  532695010n,
  606322765n,
  696381299n,
  804225311n,
  931275813n,
  1351275550n,
  1911275986n,
  2799275960n,
  4000000000n,
];

/** Виключна верхня межа EXP для 80 рівня (як $n1 у expgain.php). */
export const L2DOP_MAX_EXP_EXCLUSIVE = 500000000000n;

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
  const pct = Math.min(100, Number((cur * 100n) / max));
  return { level, cur, max, pct };
}
