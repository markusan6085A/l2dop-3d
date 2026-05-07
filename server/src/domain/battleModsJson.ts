import type { WeaknessKind } from './mobWeaknessFamily.js';
import type { BattleBattleMods, WeaknessDetectMap } from './battleTypes.js';

export function jsonFiniteNum(x: unknown): number | undefined {
  if (x == null || x === '') return undefined;
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  if (typeof x === 'string' && x.trim() !== '') {
    const v = Number(x.trim());
    return Number.isFinite(v) ? v : undefined;
  }
  if (typeof x === 'bigint') {
    const v = Number(x);
    return Number.isFinite(v) ? v : undefined;
  }
  if (typeof x === 'object' && x !== null && 'toNumber' in x) {
    try {
      const v = (x as { toNumber: () => number }).toNumber();
      return Number.isFinite(v) ? v : undefined;
    } catch {
      /* ignore */
    }
  }
  const v = Number(x);
  return Number.isFinite(v) ? v : undefined;
}

/**
 * Активні детекти з `weaknessDetects` + міграція з одного `weaknessKind`/`weaknessPatkMul` у БД.
 * Урон: max множник серед тих видів, для яких ціль підходить (`weaknessMatchesKind`).
 */
export function getWeaknessDetectMap(m: BattleBattleMods | undefined): WeaknessDetectMap {
  if (!m) return {};
  const out: WeaknessDetectMap = {};
  const raw = m.weaknessDetects;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const k of Object.keys(raw) as WeaknessKind[]) {
      const v = jsonFiniteNum(raw[k]);
      if (v !== undefined && v > 1) out[k] = v;
    }
  }
  const wk = m.weaknessKind;
  const wp = jsonFiniteNum(m.weaknessPatkMul);
  if (wk != null && wp !== undefined && wp > 1 && out[wk] === undefined) {
    out[wk] = wp;
  }
  return out;
}

/** Prisma/JSON інколи зберігає прапорці рядком `"true"` або числом `1`. */
export function jsonBoolLike(v: unknown): boolean {
  return v === true || v === 'true' || v === 1;
}

/**
 * Нормалізація `battleMods` після читання з БД — інакше стійки/Focus не впливають на профіль.
 */
export function normalizeBattleModsFromJson(m: BattleBattleMods): void {
  if (jsonBoolLike(m.stanceAccuracy)) m.stanceAccuracy = true;
  if (jsonBoolLike(m.stanceVicious)) m.stanceVicious = true;
  if (jsonBoolLike(m.stanceParry)) m.stanceParry = true;
  if (jsonBoolLike(m.focusAttackActive)) m.focusAttackActive = true;
  if (jsonBoolLike(m.silentMoveActive)) m.silentMoveActive = true;
  if (jsonBoolLike(m.ultimateEvasionActive)) m.ultimateEvasionActive = true;
  if (jsonBoolLike(m.fakeDeathActive)) m.fakeDeathActive = true;
  if (jsonBoolLike(m.aegisStanceActive)) m.aegisStanceActive = true;
  const vr = jsonFiniteNum(m.viciousStanceSkillRank);
  if (vr !== undefined && vr >= 1) {
    m.viciousStanceSkillRank = Math.floor(vr);
  } else {
    delete m.viciousStanceSkillRank;
  }
  /**
   * `raceToggleRanks` — мапа `l2SkillId → rank` для расових/мистичних toggle-стійок.
   * Якщо в JSON прийшов масив / не-об'єкт, відкидаємо повністю; не-числові значення
   * чи rank ≤ 0 теж зрізаємо.
   */
  const rt = (m as { raceToggleRanks?: unknown }).raceToggleRanks;
  if (rt != null && typeof rt === 'object' && !Array.isArray(rt)) {
    const next: Record<string, number> = {};
    for (const [k, v] of Object.entries(rt as Record<string, unknown>)) {
      const r = jsonFiniteNum(v);
      if (r !== undefined && r >= 1) next[k] = Math.floor(r);
    }
    if (Object.keys(next).length > 0) {
      m.raceToggleRanks = next;
    } else {
      delete m.raceToggleRanks;
    }
  } else if (rt !== undefined) {
    delete m.raceToggleRanks;
  }
}

export function migrateBattleModsStancesFromLegacy(m: BattleBattleMods): void {
  const s = m.stance;
  if (s === 'accuracy') {
    m.stanceAccuracy = true;
    delete m.stance;
  } else if (s === 'vicious') {
    m.stanceVicious = true;
    delete m.stance;
  } else if (s === 'parry') {
    m.stanceParry = true;
    delete m.stance;
  } else {
    delete m.stance;
  }
}

export function isStanceAccuracyActive(
  m: BattleBattleMods | undefined
): boolean {
  if (!m) return false;
  if (jsonBoolLike(m.stanceAccuracy)) return true;
  return m.stance === 'accuracy';
}

export function isStanceViciousActive(
  m: BattleBattleMods | undefined
): boolean {
  if (!m) return false;
  if (jsonBoolLike(m.stanceVicious)) return true;
  return m.stance === 'vicious';
}

export function isStanceParryActive(m: BattleBattleMods | undefined): boolean {
  if (!m) return false;
  if (jsonBoolLike(m.stanceParry)) return true;
  return m.stance === 'parry';
}

/** Focus Attack увімкнено (узгоджено з `jsonBoolLike`). */
export function isFocusAttackActive(mods: BattleBattleMods | undefined): boolean {
  if (!mods) return false;
  return jsonBoolLike(mods.focusAttackActive);
}

/** Zealot за терміном або зіпсований запис без `zealotUntilMs` — зняти всі поля. */
export function stripExpiredZealotFromBattleMods(
  m: BattleBattleMods | undefined,
  nowMs: number
): void {
  if (!m) return;
  const aspd = jsonFiniteNum(m.zealotAspdMul);
  if (aspd === undefined || aspd <= 1) {
    delete m.zealotUntilMs;
    return;
  }
  const until = jsonFiniteNum(m.zealotUntilMs);
  /** Без дати закінчення (старі збереження) — не знімаємо, інакше ефект «не працює» після оновлення. */
  if (until === undefined || until <= 0) {
    return;
  }
  if (nowMs < until) return;
  delete m.zealotAspdMul;
  delete m.zealotCritRateAdd;
  delete m.zealotCritDmgMul;
  delete m.zealotRunSpeedFlat;
  delete m.zealotAccuracyFlat;
  delete m.zealotUntilMs;
}
