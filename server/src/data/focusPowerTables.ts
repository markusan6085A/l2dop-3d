/**
 * Focus Power (skill 357) — Human Adventurer.
 * Самобаф кинджалом: урон критів і Blow-скілів залежить від напрямку атаки.
 */
import { jsonBoolLike } from '../domain/battle.js';
import type { BattleBattleMods, BattleJsonState } from '../domain/battleTypes.js';
import { isDaggerWeaponKind } from './backstabTables.js';
import {
  resolveFocusChanceAttackPosition,
  type FocusChanceAttackPosition,
} from './focusChanceTables.js';

export const FOCUS_POWER_L2_SKILL_ID = 357;
export const FOCUS_POWER_BATTLE_ID = 'l2_357';
export const FOCUS_POWER_MAX_RANK = 1;
export const FOCUS_POWER_COOLDOWN_SEC = 120;
export const FOCUS_POWER_CAST_SEC = 2;
export const FOCUS_POWER_DURATION_SEC = 120;

/** Множники crit damage (Interlude: front −30%, side +30%, back +60%). */
export const FOCUS_POWER_CRIT_DMG_MUL_FRONT = 0.7;
export const FOCUS_POWER_CRIT_DMG_MUL_SIDE = 1.3;
export const FOCUS_POWER_CRIT_DMG_MUL_BACK = 1.6;

export const FOCUS_POWER_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 78,
    spCost: 21_000_000,
    mpCost: 71,
  },
] as const;

export const FOCUS_POWER_HINT_UK =
  'Активний самобаф на ' +
  FOCUS_POWER_DURATION_SEC +
  ' с: змінює урон критичних атак і кинджальних Blow-скілів залежно від напрямку удару. ' +
  'Зі спини: +' +
  Math.round((FOCUS_POWER_CRIT_DMG_MUL_BACK - 1) * 100) +
  '%; збоку: +' +
  Math.round((FOCUS_POWER_CRIT_DMG_MUL_SIDE - 1) * 100) +
  '%; спереду: ' +
  Math.round((FOCUS_POWER_CRIT_DMG_MUL_FRONT - 1) * 100) +
  '%. ' +
  'На відміну від Focus Chance, впливає на урон, а не на шанс Blow. ' +
  'Працює лише з кинджалом у руці. Adventurer, 78 лв. Каст ' +
  FOCUS_POWER_CAST_SEC +
  ' с, відкат ' +
  FOCUS_POWER_COOLDOWN_SEC +
  ' с.';

export function focusPowerMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(FOCUS_POWER_MAX_RANK, Math.floor(rank)));
  const row = FOCUS_POWER_LEVEL_ROWS[r - 1];
  return row?.mpCost ?? null;
}

export function focusPowerRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return FOCUS_POWER_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function focusPowerSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = FOCUS_POWER_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function focusPowerCritDmgMul(
  position: FocusChanceAttackPosition
): number {
  switch (position) {
    case 'back':
      return FOCUS_POWER_CRIT_DMG_MUL_BACK;
    case 'side':
      return FOCUS_POWER_CRIT_DMG_MUL_SIDE;
    default:
      return FOCUS_POWER_CRIT_DMG_MUL_FRONT;
  }
}

export function applyFocusPowerCritDmgMul(
  critDmgMul: number,
  mods: BattleBattleMods | undefined,
  st: Pick<BattleJsonState, 'battleMods'>,
  weaponKind: string | undefined
): number {
  if (!jsonBoolLike(mods?.focusPowerActive)) return critDmgMul;
  if (!isDaggerWeaponKind(weaponKind)) return critDmgMul;
  const pos = resolveFocusChanceAttackPosition(st);
  return critDmgMul * focusPowerCritDmgMul(pos);
}

export function focusPowerStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(FOCUS_POWER_MAX_RANK, Math.floor(rank)));
  const row = FOCUS_POWER_LEVEL_ROWS[lv - 1];
  const reqLv = row?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Adventurer, ${reqLv} лв)` : '';
  return (
    'Самобаф: MP ' +
    (row?.mpCost ?? 71) +
    ', ' +
    FOCUS_POWER_DURATION_SEC +
    ' с — урон критів/Blow залежить від напрямку (спереду ' +
    Math.round((FOCUS_POWER_CRIT_DMG_MUL_FRONT - 1) * 100) +
    '%, збоку +' +
    Math.round((FOCUS_POWER_CRIT_DMG_MUL_SIDE - 1) * 100) +
    '%, зі спини +' +
    Math.round((FOCUS_POWER_CRIT_DMG_MUL_BACK - 1) * 100) +
    '%)' +
    reqPart +
    '. Каст ' +
    FOCUS_POWER_CAST_SEC +
    ' с, відкат ' +
    FOCUS_POWER_COOLDOWN_SEC +
    ' с. Лише кинджал.'
  );
}

export function focusPowerSkillLineUk(): string {
  return (
    'Фокус сили (Focus Power): баф на ' +
    FOCUS_POWER_DURATION_SEC +
    ' с — урон критів і Blow-скілів залежить від напрямку (лише кинджал).'
  );
}

export function focusPowerBuffLineUk(
  position: FocusChanceAttackPosition
): string {
  const pct =
    position === 'back'
      ? '+' + Math.round((FOCUS_POWER_CRIT_DMG_MUL_BACK - 1) * 100) + '%'
      : position === 'side'
        ? '+' + Math.round((FOCUS_POWER_CRIT_DMG_MUL_SIDE - 1) * 100) + '%'
        : Math.round((FOCUS_POWER_CRIT_DMG_MUL_FRONT - 1) * 100) + '%';
  const posUk =
    position === 'back' ? 'зі спини' : position === 'side' ? 'збоку' : 'спереду';
  return 'Фокус сили: урон критів ' + pct + ' (' + posUk + ')';
}
