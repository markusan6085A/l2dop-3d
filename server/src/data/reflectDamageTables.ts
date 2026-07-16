/**
 * Reflect Damage (skill 86) — Human Dark Avenger → Hell Knight.
 * Селф-баф: відбиває частину звичайного ближнього фіз. урону (автоатака), не скіли.
 */
export const REFLECT_DAMAGE_L2_SKILL_ID = 86;
export const REFLECT_DAMAGE_BATTLE_ID = 'l2_86';
export const REFLECT_DAMAGE_MAX_RANK = 3;
export const REFLECT_DAMAGE_BUFF_DURATION_SEC = 1200;
export const REFLECT_DAMAGE_COOLDOWN_SEC = 6;
export const REFLECT_DAMAGE_CAST_SEC = 4;

export const REFLECT_DAMAGE_LEVEL_ROWS = [
  { level: 1, requiredLevel: 40, spCost: 33_000, mpCost: 35, reflectPct: 10 },
  { level: 2, requiredLevel: 46, spCost: 47_000, mpCost: 42, reflectPct: 15 },
  { level: 3, requiredLevel: 52, spCost: 120_000, mpCost: 48, reflectPct: 20 },
] as const;

export const REFLECT_DAMAGE_HINT_UK =
  'Селф-баф на 20 хв: відбиває частину звичайного ближнього фіз. урону назад атакуючому. ' +
  'Не діє на урон від фізичних скілів. ' +
  '1 р. — 40 лв (10%), 2 р. — 46 лв (15%), 3 р. — 52 лв (20%). Dark Avenger. ' +
  'Каст ' +
  REFLECT_DAMAGE_CAST_SEC +
  ' с, відкат ' +
  REFLECT_DAMAGE_COOLDOWN_SEC +
  ' с.';

export function reflectDamageReflectPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(REFLECT_DAMAGE_MAX_RANK, Math.floor(rank)));
  return REFLECT_DAMAGE_LEVEL_ROWS[r - 1]?.reflectPct ?? 0;
}

/** Частка відбитого урону (0.10 = 10%). */
export function reflectDamageReflectRatioAtRank(rank: number): number {
  return reflectDamageReflectPctAtRank(rank) / 100;
}

export function reflectDamageRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return REFLECT_DAMAGE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function reflectDamageMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(REFLECT_DAMAGE_MAX_RANK, Math.floor(rank)));
  const mp = REFLECT_DAMAGE_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function reflectDamageSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = REFLECT_DAMAGE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function reflectDamageStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(REFLECT_DAMAGE_MAX_RANK, Math.floor(rank)));
  const pct = reflectDamageReflectPctAtRank(r);
  const mp = reflectDamageMpAtRank(r);
  const reqLv = REFLECT_DAMAGE_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    'Відбиття ' +
    pct +
    '% ближнього фіз. урону (не скіли) на 20 хв, р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ', каст ' +
    REFLECT_DAMAGE_CAST_SEC +
    ' с, відкат ' +
    REFLECT_DAMAGE_COOLDOWN_SEC +
    ' с.'
  );
}

export function reflectDamageSkillLineUk(rank: number): string {
  const pct = reflectDamageReflectPctAtRank(rank);
  return (
    'Відбиття шкоди (86, Reflect Damage): ' +
    pct +
    '% ближнього фіз. урону назад (не скіли), 20 хв.'
  );
}
