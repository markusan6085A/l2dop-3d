/**
 * Діапазон адени за рівнем моба (опорні точки + лінійна інтерполяція між ними).
 */

const ADENA_DROP_ANCHORS: ReadonlyArray<{ level: number; min: number; max: number }> = [
  { level: 1, min: 145, max: 352 },
  { level: 5, min: 280, max: 685 },
  { level: 10, min: 865, max: 1158 },
  { level: 20, min: 985, max: 1450 },
  { level: 30, min: 1205, max: 2085 },
  { level: 40, min: 2456, max: 3565 },
  { level: 50, min: 3620, max: 5945 },
  { level: 60, min: 6740, max: 8325 },
  { level: 70, min: 8860, max: 11705 },
  { level: 80, min: 12980, max: 18085 },
];

function lerpInt(a: number, b: number, t: number): number {
  return Math.floor(a + (b - a) * t);
}

/** Мін/макс адени за рівнем моба (1–80+). */
export function mobAdenaDropRange(level: number): { min: number; max: number } {
  const L = Math.max(1, Math.floor(Number(level) || 1));
  const anchors = ADENA_DROP_ANCHORS;
  if (L <= anchors[0]!.level) {
    return { min: anchors[0]!.min, max: anchors[0]!.max };
  }
  const last = anchors[anchors.length - 1]!;
  if (L >= last.level) {
    return { min: last.min, max: last.max };
  }
  for (let i = 1; i < anchors.length; i++) {
    const hi = anchors[i]!;
    const lo = anchors[i - 1]!;
    if (L > hi.level) continue;
    const t = (L - lo.level) / (hi.level - lo.level);
    const min = lerpInt(lo.min, hi.min, t);
    const max = lerpInt(lo.max, hi.max, t);
    return { min, max: Math.max(min, max) };
  }
  return { min: last.min, max: last.max };
}
