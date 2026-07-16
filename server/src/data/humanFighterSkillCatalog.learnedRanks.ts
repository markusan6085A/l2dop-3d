import {
  INTERLUDE_HF_MAX_RANK_BY_BATTLE_ID,
  INTERLUDE_HF_MIN_CHAR_LEVEL_BY_RANK,
  INTERLUDE_HF_SP_BY_RANK,
} from './l2dbInterludeHumanFighterSkillLevels.generated.js';
import {
  l2dbMinCharLevelForSkillRank,
  l2dbMaxRankForSkillId,
  l2dbSpCostForSkillRank,
  sonicBlasterMinCharLevelForRank,
  sonicBusterMinCharLevelForRank,
} from './sonicGladiatorTables.js';
import { humanFighterCatalogEntry } from './humanFighterSkillCatalog.lookup.js';
import {
  shieldMasteryRequiredLevelAtRank,
  shieldMasterySpCostAtRank,
} from './shieldMasteryTables.js';
import {
  majestyRequiredLevelAtRank,
  majestySpCostAtRank,
} from './majestyTables.js';
import {
  heavyArmorKnightRequiredLevelAtRank,
  heavyArmorKnightSpCostAtRank,
} from './heavyArmorMasteryTables.js';
import {
  swordBluntMasteryRequiredLevelAtRank,
  swordBluntMasterySpCostAtRank,
} from './swordBluntMasteryTables.js';
import {
  ultimateDefenseRequiredLevelAtRank,
  ultimateDefenseSpCostAtRank,
} from './ultimateDefenseTables.js';
import {
  deflectArrowRequiredLevelAtRank,
  deflectArrowSpCostAtRank,
} from './deflectArrowTables.js';
import {
  aggressionRequiredLevelAtRank,
  aggressionSpCostAtRank,
} from './aggressionTables.js';
import {
  hateAuraRequiredLevelAtRank,
  hateAuraSpCostAtRank,
} from './hateAuraTables.js';
import {
  quickStepRequiredLevelAtRank,
  quickStepSpCostAtRank,
} from './quickStepTables.js';
import {
  accuracyStanceRequiredLevelAtRank,
  accuracyStanceSpCostAtRank,
} from './accuracyStanceTables.js';
import {
  boostEvasionRequiredLevelAtRank,
  boostEvasionSpCostAtRank,
} from './boostEvasionTables.js';
import {
  boostAttackSpeedRequiredLevelAtRank,
  boostAttackSpeedSpCostAtRank,
} from './boostAttackSpeedTables.js';
import {
  criticalPowerRequiredLevelAtRank,
  criticalPowerSpCostAtRank,
} from './criticalPowerTables.js';
import {
  criticalChanceRequiredLevelAtRank,
  criticalChanceSpCostAtRank,
} from './criticalChanceTables.js';
import {
  dashRequiredLevelAtRank,
  dashSpCostAtRank,
} from './dashTables.js';
import {
  rapidShotRequiredLevelAtRank,
  rapidShotSpCostAtRank,
} from './rapidShotTables.js';
import {
  stunShotRequiredLevelAtRank,
  stunShotSpCostAtRank,
} from './stunShotTables.js';
import {
  divineHealRequiredLevelAtRank,
  divineHealSpCostAtRank,
} from './divineHealTables.js';
import {
  focusMindRequiredLevelAtRank,
  focusMindSpCostAtRank,
} from './focusMindTables.js';
import {
  holyBlessingRequiredLevelAtRank,
  holyBlessingSpCostAtRank,
} from './holyBlessingTables.js';
import {
  sacrificeRequiredLevelAtRank,
  sacrificeSpCostAtRank,
} from './sacrificeTables.js';
import {
  shieldFortressRequiredLevelAtRank,
  shieldFortressSpCostAtRank,
} from './shieldFortressTables.js';
import {
  fortitudeRequiredLevelAtRank,
  fortitudeSpCostAtRank,
} from './fortitudeTables.js';
import {
  shieldSlamRequiredLevelAtRank,
  shieldSlamSpCostAtRank,
} from './shieldSlamTables.js';
import {
  physicalMirrorRequiredLevelAtRank,
  physicalMirrorSpCostAtRank,
} from './physicalMirrorTables.js';
import {
  vengeanceRequiredLevelAtRank,
  vengeanceSpCostAtRank,
} from './vengeanceTables.js';
import {
  touchOfLifeRequiredLevelAtRank,
  touchOfLifeSpCostAtRank,
} from './touchOfLifeTables.js';
import {
  touchOfDeathRequiredLevelAtRank,
  touchOfDeathSpCostAtRank,
} from './touchOfDeathTables.js';
import {
  bowMasteryRequiredLevelAtRank,
  bowMasterySpCostAtRank,
} from './bowMasteryTables.js';
import {
  daggerMasteryRequiredLevelAtRank,
  daggerMasterySpCostAtRank,
} from './daggerMasteryTables.js';
import {
  lightArmorMasteryRogueRequiredLevelAtRank,
  lightArmorMasteryRogueSpCostAtRank,
  isLightArmorMasteryRogueFlatProfession,
} from './lightArmorMasteryTables.js';
import {
  ironWillRequiredLevelAtRank,
  ironWillSpCostAtRank,
} from './ironWillTables.js';
import {
  finalFortressRequiredLevelAtRank,
  finalFortressSpCostAtRank,
} from './finalFortressTables.js';
import {
  reflectDamageRequiredLevelAtRank,
  reflectDamageSpCostAtRank,
} from './reflectDamageTables.js';
import {
  shieldStunRequiredLevelAtRank,
  shieldStunSpCostAtRank,
} from './shieldStunTables.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { humanFighterCatalogHasBattleId } from './humanFighterSkillCatalog.lookup.js';
import { humanMysticCatalogHasBattleId } from './humanMysticSkillCatalog.lookup.js';
import { elvenMysticCatalogHasBattleId } from './elvenMysticSkillCatalog.lookup.js';
import { darkMysticCatalogHasBattleId } from './darkMysticSkillCatalog.lookup.js';
import { orcMysticCatalogHasBattleId } from './orcMysticSkillCatalog.lookup.js';
import {
  maxMysticSkillRankAcrossCatalogs,
} from './humanMysticSkillCatalog.learnedRanks.js';
import {
  maxRaceFighterSkillRankAcrossCatalogs,
  raceFighterCatalogHasBattleId,
} from './fighterSkillCatalog.learnedRanks.js';
import type {
  HumanFighterSkillCatalogEntry,
  LearnedSkillEntry,
} from './humanFighterSkillCatalog.types.js';

/**
 * Макс. ранг для скіла — зліплення text-rpg HumanFighter (+ l2db SP для 312).
 * Перегенерація: `node server/scripts/gen-interlude-hf-skill-tables.mjs` (потрібен `../text-rpg`).
 */
export const MAX_SKILL_RANK_BY_BATTLE_ID: Record<string, number> = {
  ...INTERLUDE_HF_MAX_RANK_BY_BATTLE_ID,
  /** Dark Avenger — text-rpg рівні. */
  l2_65: 13,
  l2_86: 3,
  l2_103: 4,
  l2_127: 14,
  l2_283: 7,
  l2_291: 11,
  l2_322: 6,
  l2_335: 1,
  l2_341: 1,
  l2_353: 1,
  l2_350: 1,
  l2_368: 1,
  l2_342: 1,
  l2_4: 2,
  l2_12: 14,
  l2_27: 14,
  l2_30: 37,
  l2_51: 1,
  l2_60: 1,
  l2_101: 40,
  l2_111: 2,
  l2_113: 2,
  l2_137: 3,
  l2_168: 3,
  l2_169: 2,
  l2_208: 52,
  l2_209: 45,
  l2_227: 50,
  l2_221: 1,
  l2_225: 3,
  l2_193: 6,
  l2_198: 3,
  l2_256: 1,
  l2_263: 37,
  l2_344: 1,
  l2_356: 1,
  l2_357: 1,
  l2_358: 1,
  /** Sagittarius — у text-rpg окремого Skill_0333 немає; один ранг у каталозі. */
  l2_333: 1,
  /**
   * Rapid Shot (99): у грі **два ранги** (1 → 2); у text-rpg Rogue має рівень 1, Hawkeye — рівень 2 (різні MP/power).
   */
  l2_99: 2,
  /**
   * Gladiator/Duelist sonic-скіли. Кількість рангів — з l2dop XML
   * (`l2dopSkillXmlLevels.generated.ts`), що збігається з L2 Interlude.
   * Min-level для рангу повертається фолбеком `entry.minLevel + (r - 1)`,
   * бо окремих таблиць в `INTERLUDE_HF_MIN_CHAR_LEVEL_BY_RANK` для цих
   * скілів немає. SP fallback — `entry.spCost` (див. магістр).
   */
  l2_1: 37,
  l2_5: 31,
  l2_6: 37,
  l2_7: 28,
  l2_8: 7,
  l2_9: 34,
  l2_190: 37,
  l2_260: 19,
  l2_261: 22,
  /** Dual Weapon Mastery — Gladiator/Duelist (l2db Interlude, 37 р.). */
  l2_144: 37,
  /** War Cry: 2 р. лише Gladiator/Duelist (2-й — з 43 лвл). */
  l2_78: 2,
  /** Lionheart — лише 1 р. (Warrior → Gladiator / Warlord). */
  l2_287: 1,
  l2_442: 1,
  l2_451: 2,
  /** Magic Resistance — Knight / Paladin / Dark Avenger (l2db, 51 р.). */
  l2_147: 51,
  /** Shield Mastery — Knight / Paladin / Dark Avenger (Interlude, 4 р.). */
  l2_153: 4,
  /** Majesty — Knight (1 р.) / Paladin / Dark Avenger (3 р.). */
  l2_82: 3,
  /** Shield Stun — Knight → Paladin (Interlude, 52 р.). */
  l2_92: 52,
  /** Ultimate Defense — Knight (1 р.) / Paladin / Dark Avenger (2 р.). */
  l2_110: 2,
  /** Deflect Arrow — Knight (2 р.) / Dark Avenger (4 р.). */
  l2_112: 4,
  /** Aggression — Human Knight (49 р.). */
  l2_28: 49,
  /** Hate Aura — Paladin / Phoenix Knight (37 р.). */
  l2_18: 37,
  /** Divine Heal — Human Knight (9 р.). */
  l2_45: 9,
  /** Focus Mind — Knight → Dark Avenger (6 р.). */
  l2_191: 6,
  /** Holy Blessing — Paladin / Phoenix Knight (37 р.). */
  l2_262: 37,
  /** Sacrifice — Paladin / Phoenix Knight (25 р.). */
  l2_69: 25,
  /** Iron Will — Paladin / Dark Avenger (3 р.). */
  l2_72: 3,
  /** Heavy Armor Mastery (232) — Knight-гілка, flat P.Def, 52 р. */
  l2_232: 52,
  /** Sword / Blunt Mastery (257) — Knight → Dark Avenger, 45 р. */
  l2_257: 45,
};

export function maxSkillRankForBattleId(battleId: string): number {
  const c = canonicalBattleSkillId(battleId);
  const n = MAX_SKILL_RANK_BY_BATTLE_ID[c];
  if (typeof n === 'number' && n >= 1) return n;
  const entry = humanFighterCatalogEntry(c);
  if (entry) {
    const fromL2db = l2dbMaxRankForSkillId(entry.l2SkillId);
    if (fromL2db != null && fromL2db >= 1) return fromL2db;
  }
  return 1;
}

/**
 * Мін. рівень персонажа для рангу rank (1-based) — таблиці з `*.generated.ts`;
 * якщо рангу немає в таблиці — +1 рівень на ранг від `entry.minLevel`.
 */
export function minCharLevelForSkillRank(
  entry: HumanFighterSkillCatalogEntry,
  rank: number,
  mappedHumanProf?: string
): number {
  const r = Math.max(1, Math.floor(rank));
  const c = canonicalBattleSkillId(entry.battleId);
  if (c === 'l2_1') {
    const fromL2db = l2dbMinCharLevelForSkillRank(entry.l2SkillId, r);
    if (fromL2db !== undefined) return fromL2db;
  }
  if (c === 'l2_6') {
    const fromSonic = sonicBlasterMinCharLevelForRank(r);
    if (fromSonic !== undefined) return fromSonic;
  }
  if (c === 'l2_9') {
    const fromSonic = sonicBusterMinCharLevelForRank(r);
    if (fromSonic !== undefined) return fromSonic;
  }
  if (c === 'l2_147') {
    const fromL2db = l2dbMinCharLevelForSkillRank(147, r);
    if (fromL2db !== undefined) return fromL2db;
  }
  if (c === 'l2_153') {
    const fromTable = shieldMasteryRequiredLevelAtRank(r);
    if (fromTable !== undefined) return fromTable;
  }
  if (c === 'l2_82') {
    const fromMajesty = majestyRequiredLevelAtRank(r);
    if (fromMajesty !== undefined) return fromMajesty;
  }
  if (c === 'l2_110') {
    const fromUd = ultimateDefenseRequiredLevelAtRank(r);
    if (fromUd !== undefined) return fromUd;
  }
  if (c === 'l2_112') {
    const fromDa = deflectArrowRequiredLevelAtRank(r);
    if (fromDa !== undefined) return fromDa;
  }
  if (c === 'l2_28') {
    const fromAgg = aggressionRequiredLevelAtRank(r);
    if (fromAgg !== undefined) return fromAgg;
  }
  if (c === 'l2_18') {
    const fromHa = hateAuraRequiredLevelAtRank(r);
    if (fromHa !== undefined) return fromHa;
  }
  if (c === 'l2_4') {
    const fromDash = dashRequiredLevelAtRank(r);
    if (fromDash !== undefined) return fromDash;
  }
  if (c === 'l2_99') {
    const fromRs = rapidShotRequiredLevelAtRank(r);
    if (fromRs !== undefined) return fromRs;
  }
  if (c === 'l2_101') {
    const fromSs = stunShotRequiredLevelAtRank(r);
    if (fromSs !== undefined) return fromSs;
  }
  if (c === 'l2_193') {
    const fromCp = criticalPowerRequiredLevelAtRank(r);
    if (fromCp !== undefined) return fromCp;
  }
  if (c === 'l2_137') {
    const fromCc = criticalChanceRequiredLevelAtRank(r);
    if (fromCc !== undefined) return fromCc;
  }
  if (c === 'l2_198') {
    const fromBe = boostEvasionRequiredLevelAtRank(r);
    if (fromBe !== undefined) return fromBe;
  }
  if (c === 'l2_168') {
    const fromBas = boostAttackSpeedRequiredLevelAtRank(r);
    if (fromBas !== undefined) return fromBas;
  }
  if (c === 'l2_256') {
    const fromAcc = accuracyStanceRequiredLevelAtRank(r);
    if (fromAcc !== undefined) return fromAcc;
  }
  if (c === 'l2_169') {
    const fromQs = quickStepRequiredLevelAtRank(r);
    if (fromQs !== undefined) return fromQs;
  }
  if (c === 'l2_45') {
    const fromHeal = divineHealRequiredLevelAtRank(r);
    if (fromHeal !== undefined) return fromHeal;
  }
  if (c === 'l2_191') {
    const fromFm = focusMindRequiredLevelAtRank(r);
    if (fromFm !== undefined) return fromFm;
  }
  if (c === 'l2_262') {
    const fromHb = holyBlessingRequiredLevelAtRank(r);
    if (fromHb !== undefined) return fromHb;
  }
  if (c === 'l2_69') {
    const fromSac = sacrificeRequiredLevelAtRank(r);
    if (fromSac !== undefined) return fromSac;
  }
  if (c === 'l2_322') {
    const fromSf = shieldFortressRequiredLevelAtRank(r);
    if (fromSf !== undefined) return fromSf;
  }
  if (c === 'l2_335') {
    const fromFt = fortitudeRequiredLevelAtRank(r);
    if (fromFt !== undefined) return fromFt;
  }
  if (c === 'l2_72') {
    const fromIw = ironWillRequiredLevelAtRank(r);
    if (fromIw !== undefined) return fromIw;
  }
  if (c === 'l2_291') {
    const fromFf = finalFortressRequiredLevelAtRank(r);
    if (fromFf !== undefined) return fromFf;
  }
  if (c === 'l2_86') {
    const fromRd = reflectDamageRequiredLevelAtRank(r);
    if (fromRd !== undefined) return fromRd;
  }
  if (c === 'l2_232') {
    const fromHa = heavyArmorKnightRequiredLevelAtRank(r);
    if (fromHa !== undefined) return fromHa;
  }
  if (c === 'l2_257') {
    const fromSb = swordBluntMasteryRequiredLevelAtRank(r);
    if (fromSb !== undefined) return fromSb;
  }
  if (c === 'l2_208') {
    const fromBow = bowMasteryRequiredLevelAtRank(r);
    if (fromBow !== undefined) return fromBow;
  }
  if (c === 'l2_209') {
    const fromDag = daggerMasteryRequiredLevelAtRank(r);
    if (fromDag !== undefined) return fromDag;
  }
  if (c === 'l2_227' && isLightArmorMasteryRogueFlatProfession(mappedHumanProf)) {
    const fromRogue = lightArmorMasteryRogueRequiredLevelAtRank(r);
    if (fromRogue !== undefined) return fromRogue;
  }
  if (c === 'l2_92') {
    const fromShieldStun = shieldStunRequiredLevelAtRank(r);
    if (fromShieldStun !== undefined) return fromShieldStun;
  }
  if (c === 'l2_353') {
    const fromShieldSlam = shieldSlamRequiredLevelAtRank(r);
    if (fromShieldSlam !== undefined) return fromShieldSlam;
  }
  if (c === 'l2_341') {
    const fromTol = touchOfLifeRequiredLevelAtRank(r);
    if (fromTol !== undefined) return fromTol;
  }
  if (c === 'l2_342') {
    const fromTod = touchOfDeathRequiredLevelAtRank(r);
    if (fromTod !== undefined) return fromTod;
  }
  if (c === 'l2_350') {
    const fromMirror = physicalMirrorRequiredLevelAtRank(r);
    if (fromMirror !== undefined) return fromMirror;
  }
  if (c === 'l2_368') {
    const fromVengeance = vengeanceRequiredLevelAtRank(r);
    if (fromVengeance !== undefined) return fromVengeance;
  }
  const fromL2db = l2dbMinCharLevelForSkillRank(entry.l2SkillId, r);
  if (fromL2db !== undefined) return fromL2db;
  const tbl = INTERLUDE_HF_MIN_CHAR_LEVEL_BY_RANK[c];
  if (tbl != null && r < tbl.length) {
    const v = tbl[r];
    if (typeof v === 'number' && v >= 1) return v;
  }
  return entry.minLevel + (r - 1);
}

/**
 * SP за перехід на ранг `targetRank` (1 = перше вивчення).
 * З таблиці Interlude; якщо немає — використовується `entry.spCost` у магістрі.
 */
export function spCostForSkillRankUpgrade(
  battleId: string,
  targetRank: number,
  mappedHumanProf?: string
): number | undefined {
  const c = canonicalBattleSkillId(battleId);
  const r = Math.max(1, Math.floor(targetRank));
  if (c === 'l2_1') {
    const sp = l2dbSpCostForSkillRank(1, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_6') {
    const sp = l2dbSpCostForSkillRank(6, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_9') {
    const sp = l2dbSpCostForSkillRank(9, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_147') {
    const sp = l2dbSpCostForSkillRank(147, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_153') {
    const sp = shieldMasterySpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_82' && mappedHumanProf) {
    const sp = majestySpCostAtRank(r, mappedHumanProf);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_110' && mappedHumanProf) {
    const sp = ultimateDefenseSpCostAtRank(r, mappedHumanProf);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_112') {
    const sp = deflectArrowSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_28') {
    const sp = aggressionSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_18') {
    const sp = hateAuraSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_4') {
    const sp = dashSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_99') {
    const sp = rapidShotSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_101') {
    const sp = stunShotSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_193') {
    const sp = criticalPowerSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_137') {
    const sp = criticalChanceSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_198') {
    const sp = boostEvasionSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_168') {
    const sp = boostAttackSpeedSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_256') {
    const sp = accuracyStanceSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_169') {
    const sp = quickStepSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_45') {
    const sp = divineHealSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_191') {
    const sp = focusMindSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_262') {
    const sp = holyBlessingSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_69') {
    const sp = sacrificeSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_322' && mappedHumanProf) {
    const sp = shieldFortressSpCostAtRank(r, mappedHumanProf);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_335') {
    const sp = fortitudeSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_72' && mappedHumanProf) {
    const sp = ironWillSpCostAtRank(r, mappedHumanProf);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_291') {
    const sp = finalFortressSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_86') {
    const sp = reflectDamageSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_232') {
    const sp = heavyArmorKnightSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_257') {
    const sp = swordBluntMasterySpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_208') {
    const sp = bowMasterySpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_209') {
    const sp = daggerMasterySpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_227' && isLightArmorMasteryRogueFlatProfession(mappedHumanProf)) {
    const sp = lightArmorMasteryRogueSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_92') {
    const sp = shieldStunSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_353') {
    const sp = shieldSlamSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_341') {
    const sp = touchOfLifeSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_342') {
    const sp = touchOfDeathSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_350') {
    const sp = physicalMirrorSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_368') {
    const sp = vengeanceSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  const fromL2dbSp = l2dbSpCostForSkillRank(
    humanFighterCatalogEntry(c)?.l2SkillId ?? 0,
    r
  );
  if (fromL2dbSp !== undefined) return fromL2dbSp;
  const tbl = INTERLUDE_HF_SP_BY_RANK[c];
  if (tbl != null && r < tbl.length && typeof tbl[r] === 'number') {
    const v = tbl[r];
    /** У згенерованих таблицях часто `0` замість «немає даних» — тоді беремо `entry.spCost` у магістрі. */
    if (v >= 1) return v;
  }
  return undefined;
}

/** Видалені з гри скіли — прибираємо з JSON навіть якщо запис лишився в БД. */
const REMOVED_LEARNED_SKILL_BATTLE_IDS = new Set<string>(['l2_1320']);

/**
 * Нормалізує skillsLearnedJson: legacy `["l2_3"]` → рівень 1; новий формат `{ battleId, level }`.
 */
function catalogHasLearnableBattleId(c: string): boolean {
  return (
    humanFighterCatalogHasBattleId(c) ||
    raceFighterCatalogHasBattleId(c) ||
    humanMysticCatalogHasBattleId(c) ||
    elvenMysticCatalogHasBattleId(c) ||
    darkMysticCatalogHasBattleId(c) ||
    orcMysticCatalogHasBattleId(c)
  );
}

function maxLearnableRankForBattleId(c: string): number {
  let m = 1;
  if (humanFighterCatalogHasBattleId(c)) {
    m = Math.max(m, maxSkillRankForBattleId(c));
  }
  if (raceFighterCatalogHasBattleId(c)) {
    m = Math.max(m, maxRaceFighterSkillRankAcrossCatalogs(c));
  }
  if (
    humanMysticCatalogHasBattleId(c) ||
    elvenMysticCatalogHasBattleId(c) ||
    darkMysticCatalogHasBattleId(c) ||
    orcMysticCatalogHasBattleId(c)
  ) {
    m = Math.max(m, maxMysticSkillRankAcrossCatalogs(c));
  }
  return m;
}

export function normalizeLearnedSkillsJson(raw: unknown): LearnedSkillEntry[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, number>();
  for (const x of raw) {
    if (typeof x === 'string' && x.trim()) {
      const c = canonicalBattleSkillId(x.trim());
      if (REMOVED_LEARNED_SKILL_BATTLE_IDS.has(c)) continue;
      if (!catalogHasLearnableBattleId(c)) continue;
      byId.set(c, Math.max(byId.get(c) ?? 0, 1));
    } else if (x && typeof x === 'object' && !Array.isArray(x)) {
      const o = x as Record<string, unknown>;
      const bid =
        typeof o.battleId === 'string'
          ? o.battleId
          : typeof o.id === 'string'
            ? o.id
            : '';
      if (!String(bid).trim()) continue;
      const c = canonicalBattleSkillId(String(bid).trim());
      if (REMOVED_LEARNED_SKILL_BATTLE_IDS.has(c)) continue;
      if (!catalogHasLearnableBattleId(c)) continue;
      let lv =
        typeof o.level === 'number' && Number.isFinite(o.level)
          ? Math.floor(o.level)
          : 1;
      const maxR = maxLearnableRankForBattleId(c);
      lv = Math.max(0, Math.min(maxR, lv));
      byId.set(c, Math.max(byId.get(c) ?? 0, lv));
    }
  }
  return Array.from(byId.entries())
    .map(([battleId, level]) => ({ battleId, level }))
    .sort((a, b) => a.battleId.localeCompare(b.battleId));
}

export function learnedBattleIdsFromEntries(entries: LearnedSkillEntry[]): string[] {
  return entries.filter((e) => e.level >= 1).map((e) => e.battleId);
}

/** Legacy: масив рядків; повний JSON — normalizeLearnedSkillsJson. */
export function normalizeLearnedBattleSkillsList(raw: string[]): string[] {
  return learnedBattleIdsFromEntries(normalizeLearnedSkillsJson(raw));
}
