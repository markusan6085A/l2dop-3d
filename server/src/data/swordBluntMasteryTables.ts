/**
 * Sword / Blunt Mastery (skill 257) — flat +P.Atk з мечем або булавою.
 * Human Knight → Dark Avenger; також Orc Destroyer / Raider, Gladiator (інші SP).
 */
import { fighterPassiveHintUk } from './fighterCommonPassiveSkillDisplay.js';
import { ITEM_CATALOG } from './itemsCatalog.js';

export const SWORD_BLUNT_MASTERY_L2_SKILL_ID = 257;
export const SWORD_BLUNT_MASTERY_BATTLE_ID = 'l2_257';
export const SWORD_BLUNT_MASTERY_MAX_RANK = 45;

export const SWORD_BLUNT_PATK_FLAT_BY_RANK = [
  0, 1.5, 3.1, 4.1, 5.2, 6.5, 7.9, 9.4, 11.1, 13, 14, 15.1, 16.2, 17.3, 18.5,
  19.8, 21.1, 22.4, 23.8, 25.3, 26.8, 28.3, 29.9, 31.6, 33.3, 35, 36.8, 38.6,
  40.5, 42.4, 44.4, 46.4, 48.4, 50.4, 52.5, 54.6, 56.8, 58.9, 61.1, 63.3, 65.5,
  67.6, 69.8, 72, 74.2, 76.4,
] as const;

/** SP / рівень персонажа — Human Knight → Dark Avenger (авторська таблиця). */
export const SWORD_BLUNT_MASTERY_LEVEL_ROWS = [
  { level: 1, requiredLevel: 20, spCost: 4700 },
  { level: 2, requiredLevel: 24, spCost: 10000 },
  { level: 3, requiredLevel: 28, spCost: 6000 },
  { level: 4, requiredLevel: 28, spCost: 6000 },
  { level: 5, requiredLevel: 32, spCost: 13000 },
  { level: 6, requiredLevel: 32, spCost: 13000 },
  { level: 7, requiredLevel: 36, spCost: 19000 },
  { level: 8, requiredLevel: 36, spCost: 19000 },
  { level: 9, requiredLevel: 40, spCost: 14000 },
  { level: 10, requiredLevel: 40, spCost: 14000 },
  { level: 11, requiredLevel: 40, spCost: 14000 },
  { level: 12, requiredLevel: 43, spCost: 15000 },
  { level: 13, requiredLevel: 43, spCost: 15000 },
  { level: 14, requiredLevel: 43, spCost: 15000 },
  { level: 15, requiredLevel: 46, spCost: 15000 },
  { level: 16, requiredLevel: 46, spCost: 15000 },
  { level: 17, requiredLevel: 46, spCost: 15000 },
  { level: 18, requiredLevel: 49, spCost: 23000 },
  { level: 19, requiredLevel: 49, spCost: 23000 },
  { level: 20, requiredLevel: 49, spCost: 23000 },
  { level: 21, requiredLevel: 52, spCost: 38000 },
  { level: 22, requiredLevel: 52, spCost: 38000 },
  { level: 23, requiredLevel: 52, spCost: 38000 },
  { level: 24, requiredLevel: 55, spCost: 56000 },
  { level: 25, requiredLevel: 55, spCost: 56000 },
  { level: 26, requiredLevel: 55, spCost: 56000 },
  { level: 27, requiredLevel: 58, spCost: 57000 },
  { level: 28, requiredLevel: 58, spCost: 57000 },
  { level: 29, requiredLevel: 58, spCost: 57000 },
  { level: 30, requiredLevel: 60, spCost: 130000 },
  { level: 31, requiredLevel: 60, spCost: 130000 },
  { level: 32, requiredLevel: 62, spCost: 150000 },
  { level: 33, requiredLevel: 62, spCost: 150000 },
  { level: 34, requiredLevel: 64, spCost: 180000 },
  { level: 35, requiredLevel: 64, spCost: 180000 },
  { level: 36, requiredLevel: 66, spCost: 270000 },
  { level: 37, requiredLevel: 66, spCost: 270000 },
  { level: 38, requiredLevel: 68, spCost: 320000 },
  { level: 39, requiredLevel: 68, spCost: 320000 },
  { level: 40, requiredLevel: 70, spCost: 330000 },
  { level: 41, requiredLevel: 70, spCost: 330000 },
  { level: 42, requiredLevel: 72, spCost: 570000 },
  { level: 43, requiredLevel: 72, spCost: 570000 },
  { level: 44, requiredLevel: 74, spCost: 880000 },
  { level: 45, requiredLevel: 74, spCost: 880000 },
] as const;

export const SWORD_BLUNT_MASTERY_HINT_UK =
  'Пасив: +P.Atk (flat) з мечем або булавою. 1 р. — +1.5 (20 лв), 45 р. — +76.4 (74 лв). ' +
  'Human Knight → Dark Avenger. MP у бою не витрачається.';

function formatFlat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function isSwordOrBluntWeaponKind(weaponKind: string | undefined): boolean {
  const wk = weaponKind ?? '';
  return (
    wk === 'sword' ||
    wk === 'blunt' ||
    wk === 'bigsword' ||
    wk === 'bigblunt'
  );
}

/** Sword/Blunt Mastery (257) — з урахуванням ETC-винятків у ITEM_CATALOG. */
export function swordBluntMasteryApplies(
  weaponKind: string | undefined,
  itemId?: number,
): boolean {
  if (!isSwordOrBluntWeaponKind(weaponKind)) return false;
  if (typeof itemId === 'number' && itemId > 0) {
    if (ITEM_CATALOG[itemId]?.excludeFromSwordBluntMastery) return false;
  }
  return true;
}

export function swordBluntMasteryPatkFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SWORD_BLUNT_MASTERY_MAX_RANK, Math.floor(rank)));
  return SWORD_BLUNT_PATK_FLAT_BY_RANK[r] ?? 0;
}

export function swordBluntMasteryRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return SWORD_BLUNT_MASTERY_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function swordBluntMasterySpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = SWORD_BLUNT_MASTERY_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function swordBluntMasteryStatsNoteUk(rank: number): string {
  const flat = swordBluntMasteryPatkFlatAtRank(rank);
  const lv = Math.max(1, Math.min(SWORD_BLUNT_MASTERY_MAX_RANK, Math.floor(rank)));
  const reqLv = SWORD_BLUNT_MASTERY_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  if (flat <= 0) {
    return (
      fighterPassiveHintUk(SWORD_BLUNT_MASTERY_L2_SKILL_ID) ??
      SWORD_BLUNT_MASTERY_HINT_UK
    );
  }
  return (
    'Пасив: +' +
    formatFlat(flat) +
    ' P.Atk (flat) на р. ' +
    lv +
    ' скіла' +
    reqPart +
    '. Лише меч або булава. MP у бою не витрачається.'
  );
}
