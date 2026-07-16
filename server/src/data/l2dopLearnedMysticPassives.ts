/**
 * Пасиви Human Mystic з `skillsLearnedJson` → модифікатори `computeCombatStats`.
 */
import type { InventoryState } from './inventory.js';
import { equippedArmorKindForPassives } from './inventory.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
  partialCombatBuffDeltaFromNeutral,
  type L2dopCombatBuffModifiers,
} from './l2dopCombatBuffModifiers.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import type { LearnedSkillEntry } from './humanFighterSkillCatalog.types.js';
import {
  defaultMysticL2ProfessionForRace,
  MYSTIC_MANA_RECOVERY_L2_SKILL_ID,
  MYSTIC_MANA_RECOVERY_ROBE_MP_REGEN_MUL,
  MYSTIC_SPELLCRAFT_L2_SKILL_ID,
  MYSTIC_SPELLCRAFT_NON_ROBE_CAST_MUL,
} from './l2dopHumanMysticBattleSkills.js';
import {
  antiMagicMdefFlatAtRank,
  ANTI_MAGIC_L2_SKILL_ID,
} from './antiMagicTables.js';
import {
  isMysticArmorMasteryCatalogSkill,
  mysticArmorMasteryPdefFlatAtRank,
  MYSTIC_ARMOR_MASTERY_L2_SKILL_ID,
} from './mysticArmorMasteryTables.js';
import {
  isMysticStarterWeaponMasteryRank,
  isMysticStarterWeaponMasterySkill,
  mysticStarterWeaponMasteryCombatDelta,
  MYSTIC_STARTER_WEAPON_MASTERY_L2_SKILL_ID,
} from './mysticStarterWeaponMasteryTables.js';
import { mysticCatalogEntryVisibleForProfession } from './humanMysticSkillCatalog.professionRules.js';
import { maxMysticSkillRankForBattleId } from './humanMysticSkillCatalog.learnedRanks.js';
import { mysticCatalogEntryForRace } from './mysticSkillCatalog.byRace.js';
import { l2dopXmlSkillRow } from './l2dopXmlSkillLevels.lookup.js';
import {
  isMysticWeaponMasterySkill,
  weaponMasteryMatkAtRank,
} from './weaponMasteryTables.js';

function clampMysticRank(battleId: string, level: number, race: string): number {
  const max = maxMysticSkillRankForBattleId(battleId, race);
  return Math.max(1, Math.min(max, Math.floor(level)));
}

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

export function learnedMysticPassivesBuffDelta(
  entries: LearnedSkillEntry[],
  inv: InventoryState,
  l2Profession: string,
  race: string
): Partial<L2dopCombatBuffModifiers> {
  const prof =
    String(l2Profession || '').trim() || defaultMysticL2ProfessionForRace(race);
  const armorKind = equippedArmorKindForPassives(inv);
  let acc = neutralCombatBuffs();

  for (const e of entries) {
    if (e.level < 1) continue;
    const bid = canonicalBattleSkillId(e.battleId);
    const cat = mysticCatalogEntryForRace(race, bid);
    if (!cat || cat.kind !== 'passive') continue;
    const r = clampMysticRank(bid, e.level, race);
    const armorMasteryLearned =
      cat.l2SkillId === MYSTIC_ARMOR_MASTERY_L2_SKILL_ID && e.level >= 1;
    const weaponMasteryLearned =
      isMysticStarterWeaponMasterySkill(cat.l2SkillId) && e.level >= 1;
    if (
      !armorMasteryLearned &&
      !weaponMasteryLearned &&
      !mysticCatalogEntryVisibleForProfession(cat, prof)
    ) {
      continue;
    }
    /** Spellcraft: без повної мантії каст на 50% повільніший (light / heavy / без броні). */
    if (cat.l2SkillId === MYSTIC_SPELLCRAFT_L2_SKILL_ID) {
      if (armorKind !== 'magic') {
        acc = applyBuffDelta(acc, {
          buffCast: MYSTIC_SPELLCRAFT_NON_ROBE_CAST_MUL,
        });
      }
      continue;
    }
    /** Mana Recovery: +20% MP regen лише в повній мантії (верх + низ). */
    if (cat.l2SkillId === MYSTIC_MANA_RECOVERY_L2_SKILL_ID) {
      if (armorKind === 'magic') {
        acc = applyBuffDelta(acc, {
          regenMpMul: MYSTIC_MANA_RECOVERY_ROBE_MP_REGEN_MUL,
        });
      }
      continue;
    }
    /** Anti Magic: flat +M.Def за таблицею Interlude. */
    if (cat.l2SkillId === ANTI_MAGIC_L2_SKILL_ID) {
      const flat = antiMagicMdefFlatAtRank(r);
      if (flat > 0) acc = applyBuffDelta(acc, { addMdef: flat });
      continue;
    }
    /** Armor Mastery: flat +P.Def (лише стартова профа mystic, ефект лишається після 1-ї зміни). */
    if (isMysticArmorMasteryCatalogSkill(cat.l2SkillId)) {
      const flat = mysticArmorMasteryPdefFlatAtRank(r);
      if (flat > 0) acc = applyBuffDelta(acc, { addPdef: flat });
      continue;
    }
    /** Weapon Mastery 1–2: flat + % P.Atk і M.Atk (Human Mystic). */
    if (
      cat.l2SkillId === MYSTIC_STARTER_WEAPON_MASTERY_L2_SKILL_ID &&
      isMysticStarterWeaponMasteryRank(r)
    ) {
      const d = mysticStarterWeaponMasteryCombatDelta(r);
      if (Object.keys(d).length > 0) acc = applyBuffDelta(acc, d);
      continue;
    }
    if (
      isMysticWeaponMasterySkill({
        l2SkillId: cat.l2SkillId,
        nameUk: cat.nameUk,
        effectStats: cat.effects.map((fx) => fx.stat),
      })
    ) {
      const matk = weaponMasteryMatkAtRank(r);
      if (matk > 0) acc = applyBuffDelta(acc, { addMatk: matk });
      continue;
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
