/**
 * Пасиви з таблиць text-rpg (`textRpgPassiveEffects.generated.ts`).
 * Формули — через `l2dopBuffDeltaFromTextRpgEffect` (той самий контракт, що й у text-rpg `effects[]`).
 * Дубля з cs1/rawdata для цих пасивів немає — див. `learnedPassivesBuffDelta`.
 */
import {
  equippedArmorKindForPassives,
  normalizeEqSlot,
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
import { equippedWeaponItemId, equippedWeaponKind } from './l2dopHumanFighterBattleSkills.js';
import { itemBlocksShieldSlot } from './l2dopTwoHandedWeapon.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import {
  heavyArmorKnightFlatPdefAtRank,
  heavyArmorWarriorPdefPercentAtRank,
} from './heavyArmorMasteryTables.js';
import {
  lightArmorMasteryEvasionFlatAtRank,
  lightArmorMasteryPdefPercentAtRank,
  isLightArmorMasteryRogueFlatProfession,
  lightArmorMasteryRogueEvasionFlatAtRank,
  lightArmorMasteryRogueFlatPdefAtRank,
} from './lightArmorMasteryTables.js';
import { swordBluntMasteryApplies, swordBluntMasteryPatkFlatAtRank } from './swordBluntMasteryTables.js';
import { bowMasteryPatkFlatAtRank } from './bowMasteryTables.js';
import { daggerMasteryPatkFlatAtRank } from './daggerMasteryTables.js';
import { focusMindMpRegenFlatAtRank } from './focusMindTables.js';
import { criticalPowerFlatAtRank } from './criticalPowerTables.js';
import { criticalChancePctAtRank } from './criticalChanceTables.js';
import { boostEvasionFlatAtRank } from './boostEvasionTables.js';
import { boostAttackSpeedPctAtRank } from './boostAttackSpeedTables.js';
import { quickStepSpeedFlatAtRank } from './quickStepTables.js';
import { magicResistanceMdefFlatAtRank } from './magicResistanceTables.js';
import { finalFortressPdefFlatAtRank } from './finalFortressTables.js';
import {
  shieldMasteryDefenceRatePctAtRank,
} from './shieldMasteryTables.js';
import type { TextRpgHfPassiveRow } from './textRpgPassiveEffects.generated.js';
import type { TextRpgEffectMode } from './textRpgSkillEffectTypes.js';

function powerAtRank(row: TextRpgHfPassiveRow, rank: number): number {
  if (row.l2SkillId === 191) {
    return focusMindMpRegenFlatAtRank(rank);
  }
  if (row.l2SkillId === 193) {
    return criticalPowerFlatAtRank(rank);
  }
  if (row.l2SkillId === 137) {
    return criticalChancePctAtRank(rank);
  }
  if (row.l2SkillId === 198) {
    return boostEvasionFlatAtRank(rank);
  }
  if (row.l2SkillId === 168) {
    return boostAttackSpeedPctAtRank(rank);
  }
  if (row.l2SkillId === 169) {
    return quickStepSpeedFlatAtRank(rank);
  }
  if (row.l2SkillId === 147) {
    return magicResistanceMdefFlatAtRank(rank);
  }
  if (row.l2SkillId === 153) {
    return shieldMasteryDefenceRatePctAtRank(rank);
  }
  if (row.l2SkillId === 232) {
    return heavyArmorKnightFlatPdefAtRank(rank);
  }
  if (row.l2SkillId === 257) {
    return swordBluntMasteryPatkFlatAtRank(rank);
  }
  if (row.l2SkillId === 208) {
    return bowMasteryPatkFlatAtRank(rank);
  }
  if (row.l2SkillId === 209) {
    return daggerMasteryPatkFlatAtRank(rank);
  }
  if (row.l2SkillId === 291) {
    return finalFortressPdefFlatAtRank(rank);
  }
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
  inv: InventoryState,
  l2Profession?: string
): Partial<L2dopCombatBuffModifiers> | undefined {
  const id = row.l2SkillId;
  const dPlace = dreadnoughtPlaceholderDelta(row, rank);
  if (dPlace) return dPlace;

  if (id === 153) {
    const sh = normalizeEqSlot(inv.eq?.l2);
    if (!sh) return undefined;
    const wSlot = normalizeEqSlot(inv.eq?.l1);
    const wId = wSlot?.itemId ?? 0;
    const wM = wId > 0 ? ITEM_CATALOG[wId] : undefined;
    if (itemBlocksShieldSlot(wId, wM?.weaponType)) return undefined;
    const rate = shieldMasteryDefenceRatePctAtRank(rank);
    if (rate <= 0) return undefined;
    return { shieldDefenceRatePct: rate };
  }

  const p = powerAtRank(row, rank);
  if (p <= 0) return undefined;

  const wk = equippedWeaponKind(inv) ?? '';
  const wItemId = equippedWeaponItemId(inv);
  const swordBlunt = swordBluntMasteryApplies(wk, wItemId);
  const pole = wk === 'pole';
  const armorKind = equippedArmorKindForPassives(inv);

  const reqA = row.requiresArmor;
  if (reqA === 'light' && armorKind !== 'light') return undefined;
  if (reqA === 'heavy' && armorKind !== 'heavy') return undefined;
  if (reqA === 'robe' && armorKind !== 'magic') return undefined;

  if (id === 227) {
    if (armorKind !== 'light') return undefined;
    if (isLightArmorMasteryRogueFlatProfession(l2Profession)) {
      const flat = lightArmorMasteryRogueFlatPdefAtRank(rank);
      const eva = lightArmorMasteryRogueEvasionFlatAtRank(rank);
      if (flat <= 0 && eva <= 0) return undefined;
      let acc = neutralCombatBuffs();
      if (flat > 0) {
        const pdefDelta = l2dopBuffDeltaFromTextRpgEffect('pDef', 'flat', flat);
        if (pdefDelta) acc = applyBuffDelta(acc, pdefDelta);
      }
      if (eva > 0) {
        const evaDelta = l2dopBuffDeltaFromTextRpgEffect('evasion', 'flat', eva);
        if (evaDelta) acc = applyBuffDelta(acc, evaDelta);
      }
      return partialCombatBuffDeltaFromNeutral(acc);
    }
    const pdefPct = lightArmorMasteryPdefPercentAtRank(rank);
    const eva = lightArmorMasteryEvasionFlatAtRank(rank);
    if (pdefPct <= 0 && eva <= 0) return undefined;
    let acc = neutralCombatBuffs();
    if (pdefPct > 0) {
      const pdefDelta = l2dopBuffDeltaFromTextRpgEffect('pDef', 'percent', pdefPct);
      if (pdefDelta) acc = applyBuffDelta(acc, pdefDelta);
    }
    if (eva > 0) {
      const evaDelta = l2dopBuffDeltaFromTextRpgEffect('evasion', 'flat', eva);
      if (evaDelta) acc = applyBuffDelta(acc, evaDelta);
    }
    return partialCombatBuffDeltaFromNeutral(acc);
  }

  if (id === 137) {
    const pct = criticalChancePctAtRank(rank);
    if (pct <= 0) return undefined;
    return { addPhysicalCritChancePct: pct };
  }

  if (id === 231 && armorKind !== 'heavy') return undefined;
  if (id === 232 && armorKind !== 'heavy') return undefined;

  if (id === 232) {
    const flat = heavyArmorKnightFlatPdefAtRank(rank);
    if (flat <= 0) return undefined;
    return l2dopBuffDeltaFromTextRpgEffect('pDef', 'flat', flat) ?? undefined;
  }

  if (id === 231) {
    const pdefPct = heavyArmorWarriorPdefPercentAtRank(rank);
    if (pdefPct <= 0) return undefined;
    const pdefDelta = l2dopBuffDeltaFromTextRpgEffect(
      'pDef',
      'percent',
      pdefPct
    );
    return pdefDelta ?? undefined;
  }

  if (id === 216 && !pole) return undefined;
  if (id === 257 && !swordBlunt) return undefined;
  if (id === 144 && wk !== 'dual' && wk !== 'dualsword') return undefined;
  /** Bow / Dagger Mastery — бонус лише з відповідною зброєю в руці (l1). */
  if (id === 208 && wk !== 'bow') return undefined;
  if (id === 209 && wk !== 'dagger') return undefined;
  if (row.requiresWeapon === 'pole' && wk !== 'pole') return undefined;
  if (row.requiresWeapon === 'sword_blunt' && !swordBlunt) return undefined;
  if (row.requiresWeapon === 'dual' && wk !== 'dual' && wk !== 'dualsword') {
    return undefined;
  }
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
