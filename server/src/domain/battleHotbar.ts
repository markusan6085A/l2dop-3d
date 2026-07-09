/** Кількість слотів панелі скілів у бою (як у battle-hotbar.js). */
export const BATTLE_HOTBAR_SLOT_COUNT = 41;

export type BattleHotbarSlot =
  | { k: 'a'; a: string }
  | { k: 'i'; id: number; e: number }
  | { k: 'u'; id: number };

function normalizeBattleHotbarSlot(x: unknown): BattleHotbarSlot | null {
  if (x == null || typeof x !== 'object') return null;
  const o = x as Record<string, unknown>;
  if (o.k === 'a' && typeof o.a === 'string') {
    const a = o.a.trim();
    if (!a.length || a.length > 64) return null;
    return { k: 'a', a };
  }
  if (o.k === 'i' && typeof o.id === 'number' && Number.isFinite(o.id)) {
    return {
      k: 'i',
      id: Math.floor(o.id),
      e: typeof o.e === 'number' && Number.isFinite(o.e) ? Math.floor(o.e) : 0,
    };
  }
  if (o.k === 'u' && typeof o.id === 'number' && Number.isFinite(o.id)) {
    return { k: 'u', id: Math.floor(o.id) };
  }
  return null;
}

/** Парсить збережену розкладку хотбару; `null` — немає або пошкоджено. */
export function parseBattleHotbarSlots(
  raw: unknown
): (BattleHotbarSlot | null)[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return null;
  const out: (BattleHotbarSlot | null)[] = [];
  for (let i = 0; i < BATTLE_HOTBAR_SLOT_COUNT; i++) {
    out.push(i < raw.length ? normalizeBattleHotbarSlot(raw[i]) : null);
  }
  return out;
}

export function hasAnyBattleHotbarSlot(
  slots: (BattleHotbarSlot | null)[] | null
): boolean {
  if (!slots) return false;
  return slots.some((s) => s != null);
}
