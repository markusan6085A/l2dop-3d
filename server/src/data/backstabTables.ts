/**
 * Backstab (skill 30) — Human Treasure Hunter → Adventurer.
 * Активний фізичний удар кинджалом зі спини; можливий over-hit.
 */
import { jsonBoolLike, jsonFiniteNum } from '../domain/battle.js';
import type { BattleSkillResolveContext } from '../domain/battleSkills/types.js';

export const BACKSTAB_L2_SKILL_ID = 30;
export const BACKSTAB_BATTLE_ID = 'l2_30';
export const BACKSTAB_MAX_RANK = 37;
export const BACKSTAB_COOLDOWN_SEC = 11;
export const BACKSTAB_CAST_SEC = 1.08;

export const BACKSTAB_LEVEL_ROWS = [
  { level: 1, requiredLevel: 40, spCost: 12_000, power: 1107, mpCost: 53 },
  { level: 2, requiredLevel: 40, spCost: 12_000, power: 1176, mpCost: 55 },
  { level: 3, requiredLevel: 40, spCost: 12_000, power: 1249, mpCost: 57 },
  { level: 4, requiredLevel: 43, spCost: 14_000, power: 1325, mpCost: 57 },
  { level: 5, requiredLevel: 43, spCost: 14_000, power: 1405, mpCost: 58 },
  { level: 6, requiredLevel: 43, spCost: 14_000, power: 1488, mpCost: 60 },
  { level: 7, requiredLevel: 46, spCost: 15_000, power: 1574, mpCost: 62 },
  { level: 8, requiredLevel: 46, spCost: 15_000, power: 1664, mpCost: 64 },
  { level: 9, requiredLevel: 46, spCost: 15_000, power: 1757, mpCost: 66 },
  { level: 10, requiredLevel: 49, spCost: 30_000, power: 1853, mpCost: 67 },
  { level: 11, requiredLevel: 49, spCost: 30_000, power: 1953, mpCost: 69 },
  { level: 12, requiredLevel: 49, spCost: 30_000, power: 2057, mpCost: 71 },
  { level: 13, requiredLevel: 52, spCost: 38_000, power: 2164, mpCost: 73 },
  { level: 14, requiredLevel: 52, spCost: 38_000, power: 2274, mpCost: 73 },
  { level: 15, requiredLevel: 52, spCost: 38_000, power: 2388, mpCost: 75 },
  { level: 16, requiredLevel: 55, spCost: 56_000, power: 2505, mpCost: 77 },
  { level: 17, requiredLevel: 55, spCost: 56_000, power: 2625, mpCost: 79 },
  { level: 18, requiredLevel: 55, spCost: 56_000, power: 2748, mpCost: 81 },
  { level: 19, requiredLevel: 58, spCost: 67_000, power: 2875, mpCost: 83 },
  { level: 20, requiredLevel: 58, spCost: 67_000, power: 3004, mpCost: 84 },
  { level: 21, requiredLevel: 58, spCost: 67_000, power: 3136, mpCost: 86 },
  { level: 22, requiredLevel: 60, spCost: 160_000, power: 3271, mpCost: 88 },
  { level: 23, requiredLevel: 60, spCost: 160_000, power: 3408, mpCost: 90 },
  { level: 24, requiredLevel: 62, spCost: 220_000, power: 3548, mpCost: 90 },
  { level: 25, requiredLevel: 62, spCost: 220_000, power: 3690, mpCost: 92 },
  { level: 26, requiredLevel: 64, spCost: 220_000, power: 3834, mpCost: 94 },
  { level: 27, requiredLevel: 64, spCost: 220_000, power: 3980, mpCost: 95 },
  { level: 28, requiredLevel: 66, spCost: 390_000, power: 4127, mpCost: 97 },
  { level: 29, requiredLevel: 66, spCost: 390_000, power: 4275, mpCost: 99 },
  { level: 30, requiredLevel: 68, spCost: 390_000, power: 4425, mpCost: 100 },
  { level: 31, requiredLevel: 68, spCost: 390_000, power: 4575, mpCost: 102 },
  { level: 32, requiredLevel: 70, spCost: 520_000, power: 4726, mpCost: 104 },
  { level: 33, requiredLevel: 70, spCost: 520_000, power: 4878, mpCost: 105 },
  { level: 34, requiredLevel: 72, spCost: 680_000, power: 5029, mpCost: 107 },
  { level: 35, requiredLevel: 72, spCost: 680_000, power: 5180, mpCost: 108 },
  { level: 36, requiredLevel: 74, spCost: 1_300_000, power: 5330, mpCost: 110 },
  { level: 37, requiredLevel: 74, spCost: 1_300_000, power: 5479, mpCost: 111 },
] as const;

export const BACKSTAB_HINT_UK =
  'Активний фізичний удар кинжалом зі спини ворога; можливий over-hit. ' +
  'Працює лише з кинджалом у руці. У бою потрібна позиція зі спини: ' +
  'Безшумний рух, Удавана смерть або оглушення/сон цілі. ' +
  'Treasure Hunter, з 40 лв. Каст ' +
  BACKSTAB_CAST_SEC +
  ' с, відкат ' +
  BACKSTAB_COOLDOWN_SEC +
  ' с, ближній бій.';

export function isDaggerWeaponKind(weaponKind: string | undefined): boolean {
  return weaponKind === 'dagger';
}

export function backstabMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(BACKSTAB_MAX_RANK, Math.floor(rank)));
  const row = BACKSTAB_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

/** Зворотна сумісність з `l2dopHfGapSkillsBattle`. */
export function backstabMpAndPower(rank: number): { mp: number; power: number } {
  return backstabMpPowerAtRank(rank) ?? { mp: 53, power: 1107 };
}

export function backstabRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return BACKSTAB_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function backstabSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = BACKSTAB_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

/** Фіз. урон кинджалом зі спини (як у `humanFighterGapSkillsTurn`). */
export function backstabDamageAtk(
  pAtk: number,
  power: number,
  profMult: number
): number {
  return Math.floor(pAtk * (1.22 + power / 380) * profMult);
}

/**
 * У text-бою немає координат — «зі спини» через стелс або недієздатність цілі.
 */
export function isMobBackExposedForBackstab(
  ctx: Pick<BattleSkillResolveContext, 'st'>
): boolean {
  const mods = ctx.st.battleMods;
  if (!mods) return false;
  const nowMs = Date.now();
  if (jsonBoolLike(mods.silentMoveActive)) return true;
  if (jsonBoolLike(mods.fakeDeathActive)) return true;
  const stunUntil = jsonFiniteNum(mods.mobStunUntilMs);
  if (stunUntil !== undefined && stunUntil > nowMs) return true;
  const backUntil = jsonFiniteNum(mods.mobBackExposedUntilMs);
  if (backUntil !== undefined && backUntil > nowMs) return true;
  const sleepUntil = jsonFiniteNum(mods.mobSleepUntilMs);
  if (sleepUntil !== undefined && sleepUntil > nowMs) return true;
  return false;
}

export function backstabStatsNoteUk(rank: number): string {
  const row = backstabMpPowerAtRank(rank);
  const lv = Math.max(1, Math.min(BACKSTAB_MAX_RANK, Math.floor(rank)));
  const reqLv = BACKSTAB_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (Treasure Hunter, ${reqLv} лв)`
      : '';
  if (!row) {
    return BACKSTAB_HINT_UK;
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    reqPart +
    '. Лише кинджал; удар зі спини (стелс або оглушення/сон цілі). Каст ' +
    BACKSTAB_CAST_SEC +
    ' с, відкат ' +
    BACKSTAB_COOLDOWN_SEC +
    ' с, ближній бій. Можливий over-hit.'
  );
}

export function backstabSkillLineUk(fromBehind: boolean, power: number): string {
  if (!fromBehind) {
    return (
      'Удар у спину (Backstab): не вдалося — потрібна позиція зі спини ' +
      '(Безшумний рух, Удавана смерть або оглушення/сон цілі).'
    );
  }
  return 'Удар у спину (Backstab): power ' + power + '.';
}
