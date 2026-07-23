/**
 * Пасиви расових Fighter-каталогів (Elven / Dark Elven / Orc Fighter, Dwarf) →
 * модифікатори `computeCombatStats`.
 *
 * Для людини-воїна пасиви беруться з `TEXT_RPG_HF_PASSIVE_EFFECTS` (через
 * `learnedPassivesBuffDelta`). Для решти Fighter-рас джерело — їхні `*FighterCatalog`
 * (entries з `kind: 'passive'` + `effects[]` тієї ж форми, що і в Mystic). Без
 * цього лукапу пасивні скіли расового Fighter (наприклад майстерності зброї/
 * броні чи стат-бусти) повністю пропадали з розрахунку статів.
 */
import type { InventoryState } from './inventory.js';
import { equippedArmorKindForPassives, normalizeEqSlot } from './inventory.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
  partialCombatBuffDeltaFromNeutral,
  type L2dopCombatBuffModifiers,
} from './l2dopCombatBuffModifiers.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import type { LearnedSkillEntry } from './humanFighterSkillCatalog.types.js';
import { fighterCatalogEntryForRace } from './fighterSkillCatalog.byRace.js';
import {
  maxRaceFighterSkillRankForBattleId,
} from './fighterSkillCatalog.byRace.js';
import { raceFighterCatalogEntryVisibleForProfession } from './raceFighterSkillCatalog.professionRules.js';
import { l2dopXmlSkillRow } from './l2dopXmlSkillLevels.lookup.js';
import { equippedWeaponItemId, equippedWeaponKind, equippedWeaponMasteryKind } from './l2dopHumanFighterBattleSkills.js';
import { itemBlocksShieldSlot } from './l2dopTwoHandedWeapon.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import {
  heavyArmorKnightFlatPdefAtRank,
  HEAVY_ARMOR_KNIGHT_MAX_RANK,
  isHeavyArmorKnightFlatCatalogSkill,
} from './heavyArmorMasteryTables.js';
import {
  shieldMasteryDefenceRatePctAtRank,
} from './shieldMasteryTables.js';
import {
  SWORD_BLUNT_MASTERY_MAX_RANK,
  swordBluntMasteryApplies,
  swordBluntMasteryPatkFlatAtRank,
} from './swordBluntMasteryTables.js';
import {
  dualWeaponMasteryPatkFlatAtRank,
} from './dualWeaponMasteryTables.js';
import {
  weaponMasteryPatkAtRank,
  WEAPON_MASTERY_L2_SKILL_ID_FIGHTER,
} from './weaponMasteryTables.js';

function clampRank(
  battleId: string,
  level: number,
  race: string,
  classBranch: string
): number {
  const max = maxRaceFighterSkillRankForBattleId(race, classBranch, battleId);
  return Math.max(1, Math.min(max, Math.floor(level)));
}

/**
 * Дельта стат від одного `effect`-рядка race-fighter каталогу. Логіка симетрична з
 * `l2dopLearnedMysticPassives.deltaFromEffect`, але виокремлена окремо, щоб не
 * створювати кругову залежність між фіксер-каталогами.
 */
function deltaFromEffect(
  stat: string,
  mode: string,
  power: number,
  effectValue?: number,
  xmlRatioR?: number
): Partial<L2dopCombatBuffModifiers> | null {
  const ratioR =
    typeof xmlRatioR === 'number' && Number.isFinite(xmlRatioR) && xmlRatioR > 1
      ? xmlRatioR
      : undefined;
  const pct =
    mode === 'percent'
      ? typeof effectValue === 'number'
        ? effectValue / 100
        : ratioR !== undefined
          ? ratioR - 1
          : power / 100
      : 0;
  const mul = 1 + Math.max(0, pct);
  const flatRaw = typeof effectValue === 'number' ? effectValue : power;
  const flat = Number.isFinite(flatRaw) ? flatRaw : 0;
  const flatPoolMul = 1 + Math.max(0, flat) / 5000;
  if (stat === 'mDef' && mode === 'percent') return { buffMdef: mul };
  if (stat === 'pDef' && mode === 'percent') return { buffPdef: mul };
  if (stat === 'pAtk' && mode === 'percent') return { buffPatk: mul };
  if (stat === 'mAtk' && mode === 'percent') return { buffMatk: mul };
  if (stat === 'maxHp' && mode === 'percent') return { buffMaxHp: mul };
  if (stat === 'maxMp' && mode === 'percent') return { buffMaxMp: mul };
  if (stat === 'hpRegen' && mode === 'percent') return { regenHpMul: mul };
  if (stat === 'mpRegen' && mode === 'percent') return { regenMpMul: mul };
  if (stat === 'castSpeed' && mode === 'percent') return { buffCast: mul };
  if (stat === 'atkSpeed' && mode === 'percent') return { buffAspd: mul };
  if (stat === 'hpRegen' && mode === 'flat') return { addRegenHp: flat };
  if (stat === 'mpRegen' && mode === 'flat') return { addRegenMp: flat };
  if (stat === 'castSpeed' && mode === 'flat') return { addCast: flat };
  if (stat === 'atkSpeed' && mode === 'flat') return { addAspd: flat };
  if (stat === 'attackSpeed' && mode === 'flat') return { addAspd: flat };
  if (stat === 'runSpeed' && mode === 'flat') return { addSpeed: flat };
  if (stat === 'accuracy' && mode === 'flat') return { buffAcc: flat };
  if (stat === 'evasion' && mode === 'flat') return { buffEva: flat };
  if (stat === 'pDef' && mode === 'flat') return { addPdef: flat };
  if (stat === 'mDef' && mode === 'flat') return { addMdef: flat };
  if (stat === 'pAtk' && mode === 'flat') return { addPatk: flat };
  if (stat === 'mAtk' && mode === 'flat') return { addMatk: flat };
  if (stat === 'maxHp' && mode === 'flat') return { buffMaxHp: flatPoolMul };
  if (stat === 'maxMp' && mode === 'flat') return { buffMaxMp: flatPoolMul };
  if (stat === 'maxCp' && mode === 'flat') return { buffMaxCp: flatPoolMul };
  if (mode === 'multiplier' && flat > 0) {
    if (stat === 'hpRegen') return { regenHpMul: flat };
    if (stat === 'mpRegen') return { regenMpMul: flat };
    if (stat === 'castSpeed') return { buffCast: flat };
    if (stat === 'atkSpeed' || stat === 'attackSpeed') return { buffAspd: flat };
    if (stat === 'runSpeed') return { buffSpeed: flat };
    if (stat === 'pAtk') return { buffPatk: flat };
    if (stat === 'mAtk') return { buffMatk: flat };
    if (stat === 'pDef') return { buffPdef: flat };
    if (stat === 'mDef') return { buffMdef: flat };
    if (stat === 'cooldownReduction') return { cooldownReductionMul: flat };
    if (stat === 'holdResist') return { holdResistMul: flat };
    if (stat === 'sleepResist') return { sleepResistMul: flat };
    if (stat === 'mentalResist') return { mentalResistMul: flat };
    if (stat === 'poisonResist') return { poisonResistMul: flat };
    if (stat === 'bleedResist') return { bleedResistMul: flat };
  }
  if (mode === 'percent') {
    if (stat === 'cooldownReduction') return { cooldownReductionMul: mul };
    if (stat === 'holdResist') return { holdResistMul: mul };
    if (stat === 'sleepResist') return { sleepResistMul: mul };
    if (stat === 'mentalResist') return { mentalResistMul: mul };
    if (stat === 'poisonResist') return { poisonResistMul: mul };
    if (stat === 'bleedResist') return { bleedResistMul: mul };
  }
  return null;
}

export function learnedRaceFighterPassivesBuffDelta(
  entries: LearnedSkillEntry[],
  _inv: InventoryState,
  l2Profession: string,
  race: string,
  classBranch: string
): Partial<L2dopCombatBuffModifiers> {
  const prof = String(l2Profession || '').trim();
  let acc = neutralCombatBuffs();

  for (const e of entries) {
    if (e.level < 1) continue;
    const bid = canonicalBattleSkillId(e.battleId);
    const cat = fighterCatalogEntryForRace(race, classBranch, bid);
    if (!cat || cat.kind !== 'passive') continue;
    if (!raceFighterCatalogEntryVisibleForProfession(cat, prof)) continue;
    const r = clampRank(bid, e.level, race, classBranch);
    if (cat.l2SkillId === WEAPON_MASTERY_L2_SKILL_ID_FIGHTER) {
      const patk = weaponMasteryPatkAtRank(r);
      if (patk > 0) acc = applyBuffDelta(acc, { addPatk: patk });
      continue;
    }
    if (cat.l2SkillId === 144) {
      const masteryWk = equippedWeaponMasteryKind(_inv) ?? '';
      if (masteryWk !== 'dual' && masteryWk !== 'dualsword') continue;
      const patk = dualWeaponMasteryPatkFlatAtRank(r);
      if (patk > 0) acc = applyBuffDelta(acc, { addPatk: patk });
      continue;
    }
    if (cat.l2SkillId === 153) {
      const sh = normalizeEqSlot(_inv.eq?.l2);
      if (!sh) continue;
      const wSlot = normalizeEqSlot(_inv.eq?.l1);
      const wId = wSlot?.itemId ?? 0;
      const wM = wId > 0 ? ITEM_CATALOG[wId] : undefined;
      if (itemBlocksShieldSlot(wId, wM?.weaponType)) continue;
      const rate = shieldMasteryDefenceRatePctAtRank(r);
      if (rate > 0) acc = applyBuffDelta(acc, { shieldDefenceRatePct: rate });
      continue;
    }
    if (
      isHeavyArmorKnightFlatCatalogSkill(
        cat.l2SkillId,
        cat.effects.map((fx) => ({ stat: fx.stat, mode: fx.mode }))
      )
    ) {
      if (equippedArmorKindForPassives(_inv) !== 'heavy') continue;
      const r = Math.max(
        1,
        Math.min(
          HEAVY_ARMOR_KNIGHT_MAX_RANK,
          Math.floor(e.level)
        )
      );
      const flat = heavyArmorKnightFlatPdefAtRank(r);
      if (flat > 0) acc = applyBuffDelta(acc, { addPdef: flat });
      continue;
    }
    if (cat.l2SkillId === 257) {
      const wk = equippedWeaponKind(_inv) ?? '';
      const wItemId = equippedWeaponItemId(_inv);
      if (!swordBluntMasteryApplies(wk, wItemId)) continue;
      const r = Math.max(
        1,
        Math.min(SWORD_BLUNT_MASTERY_MAX_RANK, Math.floor(e.level))
      );
      const patk = swordBluntMasteryPatkFlatAtRank(r);
      if (patk > 0) acc = applyBuffDelta(acc, { addPatk: patk });
      continue;
    }
    if (cat.l2SkillId === 208) {
      if ((equippedWeaponMasteryKind(_inv) ?? '') !== 'bow') continue;
    } else if (cat.l2SkillId === 209) {
      if ((equippedWeaponMasteryKind(_inv) ?? '') !== 'dagger') continue;
    } else if (cat.l2SkillId === 227) {
      if (equippedArmorKindForPassives(_inv) !== 'light') continue;
    }
    const row = cat.levels[r - 1];
    if (!row) continue;
    const power = row.power;
    const xmlRow = l2dopXmlSkillRow(cat.l2SkillId, r);
    const xmlRatioR =
      typeof xmlRow?.r === 'number' && Number.isFinite(xmlRow.r)
        ? xmlRow.r
        : undefined;
    for (const fx of cat.effects) {
      const d = deltaFromEffect(
        fx.stat,
        fx.mode,
        power,
        fx.value,
        xmlRatioR
      );
      if (d) acc = applyBuffDelta(acc, d);
    }
  }

  return partialCombatBuffDeltaFromNeutral(acc);
}
