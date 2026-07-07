/** In-memory rate limit для auth (один процес pm2). */
const buckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxHits: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= maxHits) return false;
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
