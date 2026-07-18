/**
 * Рівний поділ EXP/SP/adena між eligible members.
 * Залишок (+1) — у stable order, killer first, потім characterId asc.
 */
export function splitEvenly(
  total: number,
  eligibleIds: readonly string[],
  killerId: string
): Map<string, number> {
  const unique = [...new Set(eligibleIds.map((id) => String(id).trim()).filter(Boolean))];
  const n = unique.length;
  const out = new Map<string, number>();
  if (n <= 0 || !Number.isFinite(total) || total <= 0) return out;

  const base = Math.floor(total / n);
  const remainder = total - base * n;
  for (const id of unique) {
    out.set(id, base);
  }

  const ordered = [
    ...(unique.includes(killerId) ? [killerId] : []),
    ...unique.filter((id) => id !== killerId).sort(),
  ];
  for (let i = 0; i < remainder; i++) {
    const id = ordered[i]!;
    out.set(id, (out.get(id) ?? 0) + 1);
  }
  return out;
}

export function splitEvenlyBigInt(
  total: bigint,
  eligibleIds: readonly string[],
  killerId: string
): Map<string, bigint> {
  const unique = [...new Set(eligibleIds.map((id) => String(id).trim()).filter(Boolean))];
  const n = unique.length;
  const out = new Map<string, bigint>();
  if (n <= 0 || total <= 0n) return out;

  const nBig = BigInt(n);
  const base = total / nBig;
  const remainder = Number(total - base * nBig);
  for (const id of unique) {
    out.set(id, base);
  }

  const ordered = [
    ...(unique.includes(killerId) ? [killerId] : []),
    ...unique.filter((id) => id !== killerId).sort(),
  ];
  for (let i = 0; i < remainder; i++) {
    const id = ordered[i]!;
    out.set(id, (out.get(id) ?? 0n) + 1n);
  }
  return out;
}

/** Сума shares === total (для тестів). */
export function sumSplitMap(values: Map<string, number>): number {
  let s = 0;
  for (const v of values.values()) s += v;
  return s;
}

export function sumSplitBigIntMap(values: Map<string, bigint>): bigint {
  let s = 0n;
  for (const v of values.values()) s += v;
  return s;
}
