import type { WeaknessKind } from './mobWeaknessFamily.js';
import type { BattleBattleMods, WeaknessDetectMap } from './battleTypes.js';
import { jsonFiniteNum, jsonBoolLike } from './battleModsJson.js';

/** Нормалізація числових полів `battleMods` після патча (Prisma/JSON). */
export function normalizeBattleModsNumsInPlace(m: BattleBattleMods): void {
  const w = jsonFiniteNum(m.warCryPatkMul);
  if (w !== undefined) m.warCryPatkMul = w;
  else delete m.warCryPatkMul;
  const br = jsonFiniteNum(m.battleRoarMaxHpMul);
  if (br !== undefined) m.battleRoarMaxHpMul = br;
  else delete m.battleRoarMaxHpMul;
  const wp = jsonFiniteNum(m.weaknessPatkMul);
  if (wp !== undefined) m.weaknessPatkMul = wp;
  else delete m.weaknessPatkMul;
  const wd = m.weaknessDetects;
  if (wd && typeof wd === 'object' && !Array.isArray(wd)) {
    const nextWd: WeaknessDetectMap = {};
    for (const k of Object.keys(wd) as WeaknessKind[]) {
      const v = jsonFiniteNum(wd[k]);
      if (v !== undefined && v > 1) nextWd[k] = v;
    }
    if (Object.keys(nextWd).length === 0) delete m.weaknessDetects;
    else m.weaknessDetects = nextWd;
  }
  const md = jsonFiniteNum(m.mobPatkDebuffMul);
  if (md !== undefined) m.mobPatkDebuffMul = md;
  else delete m.mobPatkDebuffMul;
  if (md !== undefined && md > 0 && md < 1) {
    const i = jsonFiniteNum(m.mobPatkDebuffIconSkillId);
    if (i !== undefined && i > 0) m.mobPatkDebuffIconSkillId = Math.floor(i);
    else delete m.mobPatkDebuffIconSkillId;
    if (Array.isArray(m.mobPatkDebuffIconSkillIds)) {
      const ids = m.mobPatkDebuffIconSkillIds
        .map((x) => Math.floor(Number(x)))
        .filter((x) => Number.isFinite(x) && x > 0);
      if (ids.length > 0) m.mobPatkDebuffIconSkillIds = ids;
      else delete m.mobPatkDebuffIconSkillIds;
    } else {
      delete m.mobPatkDebuffIconSkillIds;
    }
  } else {
    delete m.mobPatkDebuffIconSkillId;
    delete m.mobPatkDebuffIconSkillIds;
  }
  const tf = jsonFiniteNum(m.thrillFightPatkMul);
  if (tf !== undefined) m.thrillFightPatkMul = tf;
  else delete m.thrillFightPatkMul;
  const rgp = jsonFiniteNum(m.rageBattlePatkMul);
  if (rgp !== undefined) m.rageBattlePatkMul = rgp;
  else delete m.rageBattlePatkMul;
  const rgd = jsonFiniteNum(m.rageBattlePdefMul);
  if (rgd !== undefined) m.rageBattlePdefMul = rgd;
  else delete m.rageBattlePdefMul;
  const fzp = jsonFiniteNum(m.frenzyBattlePatkMul);
  if (fzp !== undefined) m.frenzyBattlePatkMul = fzp;
  else delete m.frenzyBattlePatkMul;
  const fza = jsonFiniteNum(m.frenzyBattleAccFlat);
  if (fza !== undefined) m.frenzyBattleAccFlat = fza;
  else delete m.frenzyBattleAccFlat;
  const gut = jsonFiniteNum(m.gutsBattlePdefMul);
  if (gut !== undefined) m.gutsBattlePdefMul = gut;
  else delete m.gutsBattlePdefMul;
  const mLegacy = m as BattleBattleMods & { zealotPatkMul?: number };
  const zOld = jsonFiniteNum(mLegacy.zealotPatkMul);
  let zAspd = jsonFiniteNum(m.zealotAspdMul);
  if (
    (zAspd === undefined || zAspd <= 1) &&
    zOld !== undefined &&
    zOld > 1
  ) {
    m.zealotAspdMul = zOld;
    zAspd = zOld;
  }
  if (zOld !== undefined) delete mLegacy.zealotPatkMul;
  if (zAspd !== undefined) m.zealotAspdMul = zAspd;
  else delete m.zealotAspdMul;
  const zRun = jsonFiniteNum(m.zealotRunSpeedFlat);
  if (zRun !== undefined) m.zealotRunSpeedFlat = zRun;
  else delete m.zealotRunSpeedFlat;
  const zAcc = jsonFiniteNum(m.zealotAccuracyFlat);
  if (zAcc !== undefined) m.zealotAccuracyFlat = zAcc;
  else delete m.zealotAccuracyFlat;
  const zc = jsonFiniteNum(m.zealotCritRateAdd);
  if (zc !== undefined) m.zealotCritRateAdd = zc;
  else delete m.zealotCritRateAdd;
  const zd = jsonFiniteNum(m.zealotCritDmgMul);
  if (zd !== undefined) m.zealotCritDmgMul = zd;
  else delete m.zealotCritDmgMul;
  const zUntil = jsonFiniteNum(m.zealotUntilMs);
  if (zUntil !== undefined) m.zealotUntilMs = Math.floor(zUntil);
  else delete m.zealotUntilMs;
  const lh = jsonFiniteNum(m.lionheartIncomingPhysMul);
  if (lh !== undefined) m.lionheartIncomingPhysMul = lh;
  else delete m.lionheartIncomingPhysMul;
  const ds = jsonFiniteNum(m.dashRunSpeedFlat);
  if (ds !== undefined) m.dashRunSpeedFlat = ds;
  else delete m.dashRunSpeedFlat;
  const rs = jsonFiniteNum(m.rapidShotAspdMul);
  if (rs !== undefined) m.rapidShotAspdMul = rs;
  else delete m.rapidShotAspdMul;
  const sp = jsonFiniteNum(m.snipePatkFlat);
  if (sp !== undefined) m.snipePatkFlat = sp;
  else delete m.snipePatkFlat;
  const sa = jsonFiniteNum(m.snipeAccuracyFlat);
  if (sa !== undefined) m.snipeAccuracyFlat = sa;
  else delete m.snipeAccuracyFlat;
  const sc = jsonFiniteNum(m.snipeCritRateAdd);
  if (sc !== undefined) m.snipeCritRateAdd = sc;
  else delete m.snipeCritRateAdd;
  if (jsonBoolLike(m.focusChanceActive)) m.focusChanceActive = true;
  else delete m.focusChanceActive;
  if (jsonBoolLike(m.focusPowerActive)) m.focusPowerActive = true;
  else delete m.focusPowerActive;
  const bcm = jsonFiniteNum(m.bluffCritDmgMul);
  if (bcm !== undefined) m.bluffCritDmgMul = bcm;
  else delete m.bluffCritDmgMul;
  const smr = jsonFiniteNum(m.silentMoveRunFlat);
  if (smr !== undefined) m.silentMoveRunFlat = smr;
  else delete m.silentMoveRunFlat;
  const sme = jsonFiniteNum(m.silentMoveEvasionFlat);
  if (sme !== undefined) m.silentMoveEvasionFlat = sme;
  else delete m.silentMoveEvasionFlat;
  const uee = jsonFiniteNum(m.ultimateEvasionEvasionFlat);
  if (uee !== undefined) m.ultimateEvasionEvasionFlat = uee;
  else delete m.ultimateEvasionEvasionFlat;
  const san = jsonFiniteNum(m.sanctuaryIncomingPhysMul);
  if (san !== undefined) m.sanctuaryIncomingPhysMul = san;
  else delete m.sanctuaryIncomingPhysMul;
  const apd = jsonFiniteNum(m.aegisPDefMul);
  if (apd !== undefined) m.aegisPDefMul = apd;
  else delete m.aegisPDefMul;
  const amd = jsonFiniteNum(m.aegisMDefMul);
  if (amd !== undefined) m.aegisMDefMul = amd;
  else delete m.aegisMDefMul;
  const sh = jsonFiniteNum(m.shieldFortressPDefMul);
  if (sh !== undefined) m.shieldFortressPDefMul = sh;
  else delete m.shieldFortressPDefMul;
  const mtd = jsonFiniteNum(m.mobTargetPDefMul);
  if (mtd !== undefined) m.mobTargetPDefMul = mtd;
  else delete m.mobTargetPDefMul;
  if (mtd !== undefined && mtd > 0 && mtd < 1) {
    const i = jsonFiniteNum(m.mobTargetPDefDebuffIconSkillId);
    if (i !== undefined && i > 0) {
      m.mobTargetPDefDebuffIconSkillId = Math.floor(i);
    } else delete m.mobTargetPDefDebuffIconSkillId;
    if (Array.isArray(m.mobTargetPDefDebuffIconSkillIds)) {
      const ids = m.mobTargetPDefDebuffIconSkillIds
        .map((x) => Math.floor(Number(x)))
        .filter((x) => Number.isFinite(x) && x > 0);
      if (ids.length > 0) m.mobTargetPDefDebuffIconSkillIds = ids;
      else delete m.mobTargetPDefDebuffIconSkillIds;
    } else {
      delete m.mobTargetPDefDebuffIconSkillIds;
    }
  } else {
    delete m.mobTargetPDefDebuffIconSkillId;
    delete m.mobTargetPDefDebuffIconSkillIds;
  }
  const mtm = jsonFiniteNum(m.mobTargetMDefMul);
  if (mtm !== undefined) m.mobTargetMDefMul = mtm;
  else delete m.mobTargetMDefMul;
  if (mtm !== undefined && mtm > 0 && mtm < 1) {
    const i = jsonFiniteNum(m.mobTargetMDefDebuffIconSkillId);
    if (i !== undefined && i > 0) {
      m.mobTargetMDefDebuffIconSkillId = Math.floor(i);
    } else delete m.mobTargetMDefDebuffIconSkillId;
    if (Array.isArray(m.mobTargetMDefDebuffIconSkillIds)) {
      const ids = m.mobTargetMDefDebuffIconSkillIds
        .map((x) => Math.floor(Number(x)))
        .filter((x) => Number.isFinite(x) && x > 0);
      if (ids.length > 0) m.mobTargetMDefDebuffIconSkillIds = ids;
      else delete m.mobTargetMDefDebuffIconSkillIds;
    } else {
      delete m.mobTargetMDefDebuffIconSkillIds;
    }
  } else {
    delete m.mobTargetMDefDebuffIconSkillId;
    delete m.mobTargetMDefDebuffIconSkillIds;
  }
  const sleepUntil = jsonFiniteNum(m.mobSleepUntilMs);
  if (sleepUntil !== undefined && sleepUntil > 0) {
    m.mobSleepUntilMs = Math.floor(sleepUntil);
    const sid = jsonFiniteNum(m.mobSleepIconSkillId);
    m.mobSleepIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 1069;
  } else {
    delete m.mobSleepUntilMs;
    delete m.mobSleepIconSkillId;
  }
  const stunUntil = jsonFiniteNum(m.mobStunUntilMs);
  if (stunUntil !== undefined && stunUntil > 0) {
    m.mobStunUntilMs = Math.floor(stunUntil);
    const sid = jsonFiniteNum(m.mobStunIconSkillId);
    m.mobStunIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 260;
  } else {
    delete m.mobStunUntilMs;
    delete m.mobStunIconSkillId;
  }
  const backUntil = jsonFiniteNum(m.mobBackExposedUntilMs);
  if (backUntil !== undefined && backUntil > 0) {
    m.mobBackExposedUntilMs = Math.floor(backUntil);
    const sid = jsonFiniteNum(m.mobBackExposedIconSkillId);
    m.mobBackExposedIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 358;
  } else {
    delete m.mobBackExposedUntilMs;
    delete m.mobBackExposedIconSkillId;
  }
  const slowUntil = jsonFiniteNum(m.mobRunSpeedDebuffUntilMs);
  if (slowUntil !== undefined && slowUntil > 0) {
    m.mobRunSpeedDebuffUntilMs = Math.floor(slowUntil);
    const mul = jsonFiniteNum(m.mobRunSpeedDebuffMul);
    if (mul !== undefined && mul > 0 && mul < 1) {
      m.mobRunSpeedDebuffMul = mul;
    }
    const sid = jsonFiniteNum(m.mobRunSpeedDebuffIconSkillId);
    m.mobRunSpeedDebuffIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 354;
  } else {
    delete m.mobRunSpeedDebuffMul;
    delete m.mobRunSpeedDebuffUntilMs;
    delete m.mobRunSpeedDebuffIconSkillId;
  }
  const playerStunUntil = jsonFiniteNum(m.playerStunUntilMs);
  if (playerStunUntil !== undefined && playerStunUntil > 0) {
    m.playerStunUntilMs = Math.floor(playerStunUntil);
    const psid = jsonFiniteNum(m.playerStunIconSkillId);
    m.playerStunIconSkillId =
      psid !== undefined && psid > 0 ? Math.floor(psid) : 260;
  } else {
    delete m.playerStunUntilMs;
    delete m.playerStunIconSkillId;
  }
  const mobPhysBlockUntil = jsonFiniteNum(m.mobPhysSkillsBlockedUntilMs);
  if (mobPhysBlockUntil !== undefined && mobPhysBlockUntil > 0) {
    m.mobPhysSkillsBlockedUntilMs = Math.floor(mobPhysBlockUntil);
    const sid = jsonFiniteNum(m.mobPhysSkillsBlockedIconSkillId);
    m.mobPhysSkillsBlockedIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 353;
  } else {
    delete m.mobPhysSkillsBlockedUntilMs;
    delete m.mobPhysSkillsBlockedIconSkillId;
  }
  const todUntil = jsonFiniteNum(m.mobTouchOfDeathUntilMs);
  if (todUntil !== undefined && todUntil > 0) {
    m.mobTouchOfDeathUntilMs = Math.floor(todUntil);
    const sid = jsonFiniteNum(m.mobTouchOfDeathIconSkillId);
    m.mobTouchOfDeathIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 342;
  } else {
    delete m.mobTouchOfDeathUntilMs;
    delete m.mobTouchOfDeathIconSkillId;
  }
  const todDr = jsonFiniteNum(m.mobTouchOfDeathDebuffResistPenaltyPct);
  if (todDr !== undefined && todDr > 0) {
    m.mobTouchOfDeathDebuffResistPenaltyPct = todDr;
  } else {
    delete m.mobTouchOfDeathDebuffResistPenaltyPct;
  }
  const todHeal = jsonFiniteNum(m.mobTouchOfDeathHealReceivedPenaltyPct);
  if (todHeal !== undefined && todHeal > 0) {
    m.mobTouchOfDeathHealReceivedPenaltyPct = todHeal;
  } else {
    delete m.mobTouchOfDeathHealReceivedPenaltyPct;
  }
  const todCpBase = jsonFiniteNum(m.touchOfDeathMobMaxCpBaseline);
  if (todCpBase !== undefined && todCpBase > 0) {
    m.touchOfDeathMobMaxCpBaseline = Math.floor(todCpBase);
  } else {
    delete m.touchOfDeathMobMaxCpBaseline;
  }
  const playerTodUntil = jsonFiniteNum(m.playerTouchOfDeathUntilMs);
  if (playerTodUntil !== undefined && playerTodUntil > 0) {
    m.playerTouchOfDeathUntilMs = Math.floor(playerTodUntil);
    const sid = jsonFiniteNum(m.playerTouchOfDeathIconSkillId);
    m.playerTouchOfDeathIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 342;
  } else {
    delete m.playerTouchOfDeathUntilMs;
    delete m.playerTouchOfDeathIconSkillId;
  }
  const playerTodDr = jsonFiniteNum(m.playerTouchOfDeathDebuffResistPenaltyPct);
  if (playerTodDr !== undefined && playerTodDr > 0) {
    m.playerTouchOfDeathDebuffResistPenaltyPct = playerTodDr;
  } else {
    delete m.playerTouchOfDeathDebuffResistPenaltyPct;
  }
  const playerTodHeal = jsonFiniteNum(m.playerTouchOfDeathHealReceivedPenaltyPct);
  if (playerTodHeal !== undefined && playerTodHeal > 0) {
    m.playerTouchOfDeathHealReceivedPenaltyPct = playerTodHeal;
  } else {
    delete m.playerTouchOfDeathHealReceivedPenaltyPct;
  }
  const playerTodCpBase = jsonFiniteNum(m.touchOfDeathPlayerMaxCpBaseline);
  if (playerTodCpBase !== undefined && playerTodCpBase > 0) {
    m.touchOfDeathPlayerMaxCpBaseline = Math.floor(playerTodCpBase);
  } else {
    delete m.touchOfDeathPlayerMaxCpBaseline;
  }
  const playerPhysBlockUntil = jsonFiniteNum(m.playerPhysSkillsBlockedUntilMs);
  if (playerPhysBlockUntil !== undefined && playerPhysBlockUntil > 0) {
    m.playerPhysSkillsBlockedUntilMs = Math.floor(playerPhysBlockUntil);
    const psid = jsonFiniteNum(m.playerPhysSkillsBlockedIconSkillId);
    m.playerPhysSkillsBlockedIconSkillId =
      psid !== undefined && psid > 0 ? Math.floor(psid) : 353;
  } else {
    delete m.playerPhysSkillsBlockedUntilMs;
    delete m.playerPhysSkillsBlockedIconSkillId;
  }
  const rdr = jsonFiniteNum(m.reflectDamageReturnRatio);
  if (rdr !== undefined) m.reflectDamageReturnRatio = rdr;
  else delete m.reflectDamageReturnRatio;
  const pmr = jsonFiniteNum(m.physicalMirrorReflectRatio);
  if (pmr !== undefined) m.physicalMirrorReflectRatio = pmr;
  else delete m.physicalMirrorReflectRatio;
  const pmPhys = jsonFiniteNum(m.physicalMirrorPhysReflectChancePct);
  if (pmPhys !== undefined && pmPhys > 0) {
    m.physicalMirrorPhysReflectChancePct = Math.min(100, Math.floor(pmPhys));
    const sid = jsonFiniteNum(m.physicalMirrorIconSkillId);
    m.physicalMirrorIconSkillId =
      sid !== undefined && sid > 0 ? Math.floor(sid) : 350;
  } else {
    delete m.physicalMirrorPhysReflectChancePct;
    delete m.physicalMirrorMagicReflectChancePct;
    delete m.physicalMirrorIconSkillId;
  }
  const pmMag = jsonFiniteNum(m.physicalMirrorMagicReflectChancePct);
  if (pmMag !== undefined && pmMag > 0) {
    m.physicalMirrorMagicReflectChancePct = Math.min(100, Math.floor(pmMag));
  } else if (pmPhys === undefined || pmPhys <= 0) {
    delete m.physicalMirrorMagicReflectChancePct;
  }
  const vim = jsonFiniteNum(m.vengeanceIncomingPhysMul);
  if (vim !== undefined) m.vengeanceIncomingPhysMul = vim;
  else delete m.vengeanceIncomingPhysMul;
  const vrr = jsonFiniteNum(m.vengeanceReflectRatio);
  if (vrr !== undefined) m.vengeanceReflectRatio = vrr;
  else delete m.vengeanceReflectRatio;
  const mpatk = jsonFiniteNum(m.mysticPatkBuffMul);
  if (mpatk !== undefined) m.mysticPatkBuffMul = mpatk;
  else delete m.mysticPatkBuffMul;
  const mmatk = jsonFiniteNum(m.mysticMatkBuffMul);
  if (mmatk !== undefined) m.mysticMatkBuffMul = mmatk;
  else delete m.mysticMatkBuffMul;
  const mcast = jsonFiniteNum(m.mysticCastSpdBuffMul);
  if (mcast !== undefined) m.mysticCastSpdBuffMul = mcast;
  else delete m.mysticCastSpdBuffMul;
  const mpdef = jsonFiniteNum(m.mysticPdefBuffMul);
  if (mpdef !== undefined) m.mysticPdefBuffMul = mpdef;
  else delete m.mysticPdefBuffMul;
  const mmdef = jsonFiniteNum(m.mysticMdefBuffMul);
  if (mmdef !== undefined) m.mysticMdefBuffMul = mmdef;
  else delete m.mysticMdefBuffMul;

  const mpatkN = jsonFiniteNum(m.mysticPatkBuffMul);
  if (mpatkN === undefined || mpatkN <= 1) {
    delete m.mysticPatkBuffMul;
    delete m.mysticPatkBuffIconSkillId;
  } else {
    const ic = jsonFiniteNum(m.mysticPatkBuffIconSkillId);
    if (ic !== undefined && ic > 0) m.mysticPatkBuffIconSkillId = Math.floor(ic);
    else delete m.mysticPatkBuffIconSkillId;
  }
  const mmatkN = jsonFiniteNum(m.mysticMatkBuffMul);
  if (mmatkN === undefined || mmatkN <= 1) {
    delete m.mysticMatkBuffMul;
    delete m.mysticMatkBuffIconSkillId;
  } else {
    const ic = jsonFiniteNum(m.mysticMatkBuffIconSkillId);
    if (ic !== undefined && ic > 0) m.mysticMatkBuffIconSkillId = Math.floor(ic);
    else delete m.mysticMatkBuffIconSkillId;
  }
  const mcastN = jsonFiniteNum(m.mysticCastSpdBuffMul);
  if (mcastN === undefined || mcastN <= 1) {
    delete m.mysticCastSpdBuffMul;
    delete m.mysticCastSpdBuffIconSkillId;
  } else {
    const ic = jsonFiniteNum(m.mysticCastSpdBuffIconSkillId);
    if (ic !== undefined && ic > 0) {
      m.mysticCastSpdBuffIconSkillId = Math.floor(ic);
    } else delete m.mysticCastSpdBuffIconSkillId;
  }
  const mpdefN = jsonFiniteNum(m.mysticPdefBuffMul);
  if (mpdefN === undefined || mpdefN <= 1) {
    delete m.mysticPdefBuffMul;
    delete m.mysticPdefBuffIconSkillId;
  } else {
    const ic = jsonFiniteNum(m.mysticPdefBuffIconSkillId);
    if (ic !== undefined && ic > 0) m.mysticPdefBuffIconSkillId = Math.floor(ic);
    else delete m.mysticPdefBuffIconSkillId;
  }
  const mmdefN = jsonFiniteNum(m.mysticMdefBuffMul);
  if (mmdefN === undefined || mmdefN <= 1) {
    delete m.mysticMdefBuffMul;
    delete m.mysticMdefBuffIconSkillId;
  } else {
    const ic = jsonFiniteNum(m.mysticMdefBuffIconSkillId);
    if (ic !== undefined && ic > 0) m.mysticMdefBuffIconSkillId = Math.floor(ic);
    else delete m.mysticMdefBuffIconSkillId;
  }

  const ssN = jsonFiniteNum(m.fighterSoulshotPatkMul);
  const ssItem = jsonFiniteNum(m.fighterSoulshotItemId);
  if (
    ssN === undefined ||
    ssN <= 1 ||
    ssItem === undefined ||
    ssItem <= 0
  ) {
    delete m.fighterSoulshotPatkMul;
    delete m.fighterSoulshotItemId;
  } else {
    m.fighterSoulshotPatkMul = ssN;
    m.fighterSoulshotItemId = Math.floor(ssItem);
  }

  const msN = jsonFiniteNum(m.mysticBlessedSpiritshotMatkMul);
  const msItem = jsonFiniteNum(m.mysticBlessedSpiritshotItemId);
  if (
    msN === undefined ||
    msN <= 1 ||
    msItem === undefined ||
    msItem <= 0
  ) {
    delete m.mysticBlessedSpiritshotMatkMul;
    delete m.mysticBlessedSpiritshotItemId;
  } else {
    m.mysticBlessedSpiritshotMatkMul = msN;
    m.mysticBlessedSpiritshotItemId = Math.floor(msItem);
  }

  const fzPatkN = jsonFiniteNum(m.frenzyBattlePatkMul);
  if (fzPatkN === undefined || fzPatkN <= 1) {
    delete m.frenzyBattlePatkMul;
    delete m.frenzyBattleAccFlat;
  } else {
    const fa = jsonFiniteNum(m.frenzyBattleAccFlat);
    if (fa !== undefined && fa > 0) m.frenzyBattleAccFlat = Math.floor(fa);
    else delete m.frenzyBattleAccFlat;
  }
}
