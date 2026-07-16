/**
 * Focus Chance (skill 356) — Human Adventurer.
 * Самобаф кинджалом: крит і успіх Blow-скілів залежать від напрямку атаки.
 */
import { jsonBoolLike, jsonFiniteNum } from '../domain/battle.js';
import type { BattleBattleMods, BattleJsonState } from '../domain/battleTypes.js';
import { isDaggerWeaponKind } from './backstabTables.js';

export const FOCUS_CHANCE_L2_SKILL_ID = 356;
export const FOCUS_CHANCE_BATTLE_ID = 'l2_356';
export const FOCUS_CHANCE_MAX_RANK = 1;
export const FOCUS_CHANCE_COOLDOWN_SEC = 120;
export const FOCUS_CHANCE_CAST_SEC = 2;
export const FOCUS_CHANCE_DURATION_SEC = 120;

/** Множники crit rate (Interlude: front −30%, side +30%, back +60%). */
export const FOCUS_CHANCE_CRIT_MUL_FRONT = 0.7;
export const FOCUS_CHANCE_CRIT_MUL_SIDE = 1.3;
export const FOCUS_CHANCE_CRIT_MUL_BACK = 1.6;

export const FOCUS_CHANCE_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 78,
    spCost: 21_000_000,
    mpCost: 71,
  },
] as const;

export const FOCUS_CHANCE_HINT_UK =
  'Активний самобаф на ' +
  FOCUS_CHANCE_DURATION_SEC +
  ' с: змінює шанс критичного удару та успішність кинджальних Blow-скілів залежно від напрямку атаки. ' +
  'Зі спини: +' +
  Math.round((FOCUS_CHANCE_CRIT_MUL_BACK - 1) * 100) +
  '%; збоку: +' +
  Math.round((FOCUS_CHANCE_CRIT_MUL_SIDE - 1) * 100) +
  '%; спереду: ' +
  Math.round((FOCUS_CHANCE_CRIT_MUL_FRONT - 1) * 100) +
  '%. ' +
  'Працює лише з кинджалом у руці. Adventurer, 78 лв. Каст ' +
  FOCUS_CHANCE_CAST_SEC +
  ' с, відкат ' +
  FOCUS_CHANCE_COOLDOWN_SEC +
  ' с.';

export type FocusChanceAttackPosition = 'front' | 'side' | 'back';

export function focusChanceMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(FOCUS_CHANCE_MAX_RANK, Math.floor(rank)));
  const row = FOCUS_CHANCE_LEVEL_ROWS[r - 1];
  return row?.mpCost ?? null;
}

export function focusChanceRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return FOCUS_CHANCE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function focusChanceSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = FOCUS_CHANCE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function focusChanceCritRateMul(
  position: FocusChanceAttackPosition
): number {
  switch (position) {
    case 'back':
      return FOCUS_CHANCE_CRIT_MUL_BACK;
    case 'side':
      return FOCUS_CHANCE_CRIT_MUL_SIDE;
    default:
      return FOCUS_CHANCE_CRIT_MUL_FRONT;
  }
}

/**
 * У text-бою немає координат: «зі спини» — стелс, Bluff або недієздатність цілі;
 * «збоку» поки не моделюється окремо (лише спереду/ззаду).
 */
export function resolveFocusChanceAttackPosition(
  st: Pick<BattleJsonState, 'battleMods'>,
  nowMs: number = Date.now()
): FocusChanceAttackPosition {
  const mods = st.battleMods;
  if (!mods) return 'front';
  if (jsonBoolLike(mods.silentMoveActive)) return 'back';
  if (jsonBoolLike(mods.fakeDeathActive)) return 'back';
  const backUntil = jsonFiniteNum(mods.mobBackExposedUntilMs);
  if (backUntil !== undefined && backUntil > nowMs) return 'back';
  return 'front';
}

export function applyFocusChanceCritRateStat(
  critRate: number,
  mods: BattleBattleMods | undefined,
  st: Pick<BattleJsonState, 'battleMods'>,
  weaponKind: string | undefined
): number {
  if (!jsonBoolLike(mods?.focusChanceActive)) return critRate;
  if (!isDaggerWeaponKind(weaponKind)) return critRate;
  const pos = resolveFocusChanceAttackPosition(st);
  const mul = focusChanceCritRateMul(pos);
  return Math.max(0, Math.min(500, Math.floor(critRate * mul)));
}

export function focusChanceStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(FOCUS_CHANCE_MAX_RANK, Math.floor(rank)));
  const row = FOCUS_CHANCE_LEVEL_ROWS[lv - 1];
  const reqLv = row?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Adventurer, ${reqLv} лв)` : '';
  return (
    'Самобаф: MP ' +
    (row?.mpCost ?? 71) +
    ', ' +
    FOCUS_CHANCE_DURATION_SEC +
    ' с — крит і Blow залежать від напрямку (спереду ' +
    Math.round((FOCUS_CHANCE_CRIT_MUL_FRONT - 1) * 100) +
    '%, збоку +' +
    Math.round((FOCUS_CHANCE_CRIT_MUL_SIDE - 1) * 100) +
    '%, зі спини +' +
    Math.round((FOCUS_CHANCE_CRIT_MUL_BACK - 1) * 100) +
    '%)' +
    reqPart +
    '. Каст ' +
    FOCUS_CHANCE_CAST_SEC +
    ' с, відкат ' +
    FOCUS_CHANCE_COOLDOWN_SEC +
    ' с. Лише кинджал.'
  );
}

export function focusChanceSkillLineUk(): string {
  return (
    'Фокус шансу (Focus Chance): баф на ' +
    FOCUS_CHANCE_DURATION_SEC +
    ' с — крит і Blow-скіли залежать від напрямку атаки (лише кинджал).'
  );
}

export function focusChanceBuffLineUk(
  position: FocusChanceAttackPosition
): string {
  const pct =
    position === 'back'
      ? '+' + Math.round((FOCUS_CHANCE_CRIT_MUL_BACK - 1) * 100) + '%'
      : position === 'side'
        ? '+' + Math.round((FOCUS_CHANCE_CRIT_MUL_SIDE - 1) * 100) + '%'
        : Math.round((FOCUS_CHANCE_CRIT_MUL_FRONT - 1) * 100) + '%';
  const posUk =
    position === 'back' ? 'зі спини' : position === 'side' ? 'збоку' : 'спереду';
  return 'Фокус шансу: крит/Blow ' + pct + ' (' + posUk + ')';
}
