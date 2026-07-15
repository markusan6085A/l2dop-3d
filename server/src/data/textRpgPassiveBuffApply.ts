/**
 * Пасиви з таблиць text-rpg (`textRpgPassiveEffects.generated.ts`).
 * Формули — через `l2dopBuffDeltaFromTextRpgEffect` (той самий контракт, що й у text-rpg `effects[]`).
 * Дубля з cs1/rawdata для цих пасивів немає — див. `learnedPassivesBuffDelta`.
 */
import {
  equippedArmorKindForPassives,
  type InventoryState,
} from './inventory.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
  partialCombatBuffDeltaFromNeutral,
  type L2dopCombatBuffModifiers,
} from './l2dopCombatBuffModifiers.js';
import {
  l2dopBuffDeltaFromTextRpgEffect,
} from './textRpgCombatBuffFromEffect.js';
import {
  weaponMasteryPatkAtRank,
} from './weaponMasteryTables.js';
import { equippedWeaponKind } from './l2dopHumanFighterBattleSkills.js';
import type { TextRpgHfPassiveRow } from './textRpgPassiveEffects.generated.js';
import type { TextRpgEffectMode } from './textRpgSkillEffectTypes.js';

function powerAtRank(row: TextRpgHfPassiveRow, rank: number): number {
  const r = Math.max(1, Math.min(row.maxRank, Math.floor(rank)));
  const p = row.powerByRank[r];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}

/**
 * Dreadnought 328/329 мають резисти, яких ще нема в `L2dopCombatBuffModifiers`,
 * тому тримаємо лише обережний defensive fallback без бонусу в атаку.
 * 330 (Skill Mastery) реалізований в battle-резолвері як proc, а не стат-множник.
 */
function dreadnoughtPlaceholderDelta(
  row: TextRpgHfPassiveRow,
  rank: number
): Partial<L2dopCombatBuffModifiers> | undefined {
  const r = Math.max(1, Math.min(row.maxRank, Math.floor(rank)));
  if (row.l2SkillId === 328) {
    return { buffMdef: 1 + 0.04 * r };
  }
  if (row.l2SkillId === 329) {
    return { buffPdef: 1 + 0.02 * r, buffMaxHp: 1 + 0.01 * r };
  }
  return undefined;
}

export function textRpgPassiveDeltaForSkill(
  row: TextRpgHfPassiveRow,
  rank: number,
  inv: InventoryState
): Partial<L2dopCombatBuffModifiers> | undefined {
  const id = row.l2SkillId;
  const dPlace = dreadnoughtPlaceholderDelta(row, rank);
  if (dPlace) return dPlace;

  const p = powerAtRank(row, rank);
  if (p <= 0) return undefined;

  const wk = equippedWeaponKind(inv) ?? '';
  const swordBlunt =
    wk === 'sword' ||
    wk === 'blunt' ||
    wk === 'bigsword' ||
    wk === 'bigblunt';
  const pole = wk === 'pole';
  const armorKind = equippedArmorKindForPassives(inv);

  const reqA = row.requiresArmor;
  if (reqA === 'light' && armorKind !== 'light') return undefined;
  if (reqA === 'heavy' && armorKind !== 'heavy') return undefined;
  if (reqA === 'robe' && armorKind !== 'magic') return undefined;

  if (id === 227 && armorKind !== 'light') return undefined;
  if (id === 231 && armorKind !== 'heavy') return undefined;
  if (id === 216 && !pole) return undefined;
  if (id === 257 && !swordBlunt) return undefined;
  /** Bow / Dagger Mastery — бонус лише з відповідною зброєю в руці (l1). */
  if (id === 208 && wk !== 'bow') return undefined;
  if (id === 209 && wk !== 'dagger') return undefined;
  if (row.requiresWeapon === 'bow' && wk !== 'bow') return undefined;
  if (row.requiresWeapon === 'dagger' && wk !== 'dagger') return undefined;

  const pairs =
    row.effectPairs.length > 0
      ? row.effectPairs
      : [{ stat: row.stat, mode: row.mode as TextRpgEffectMode }];
  let acc = neutralCombatBuffs();
  for (const eff of pairs) {
    const mapped = l2dopBuffDeltaFromTextRpgEffect(
      eff.stat,
      eff.mode as TextRpgEffectMode,
      p
    );
    if (mapped) acc = applyBuffDelta(acc, mapped);
  }
  return partialCombatBuffDeltaFromNeutral(acc);
}

/** 142: flat P.Atk за таблицею Weapon Mastery (воїни). */
export function textRpgWeaponMastery142Delta(
  row: TextRpgHfPassiveRow,
  rank: number
): Partial<L2dopCombatBuffModifiers> | undefined {
  if (row.l2SkillId !== 142) return undefined;
  const add = weaponMasteryPatkAtRank(rank);
  if (add <= 0) return undefined;
  return { addPatk: add };
}
