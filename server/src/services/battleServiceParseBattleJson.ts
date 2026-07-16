import { Prisma } from '@prisma/client';
import {
  jsonFiniteNum,
  jsonBoolLike,
  migrateBattleModsStancesFromLegacy,
  isFocusAttackActive,
  stripExpiredZealotFromBattleMods,
  type BattleBattleMods,
  type BattleJsonState,
  type BattlePotionHoTEntry,
  type WhirlwindExtraMobJson,
} from '../domain/battle.js';
import type { WeaknessKind } from '../domain/mobWeaknessFamily.js';
import { applyRiposteReflectToBattleMods } from '../domain/riposteStance.js';
import {
  mobMaxCpFromMobMaxHp,
} from '../data/wrathSkillConstants.js';

function parseBattlePotionHoTField(
  raw: unknown
): BattlePotionHoTEntry | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }
  const r = raw as Record<string, unknown>;
  const remaining = jsonFiniteNum(r.remaining);
  const perTick = jsonFiniteNum(r.perTick);
  const nextTickAtMs = jsonFiniteNum(r.nextTickAtMs);
  const tickMs = jsonFiniteNum(r.tickMs);
  if (
    remaining === undefined ||
    remaining <= 0 ||
    perTick === undefined ||
    perTick <= 0 ||
    nextTickAtMs === undefined
  ) {
    return undefined;
  }
  return {
    remaining: Math.floor(remaining),
    perTick: Math.floor(perTick),
    nextTickAtMs: Math.floor(nextTickAtMs),
    ...(tickMs !== undefined && tickMs > 0
      ? { tickMs: Math.floor(tickMs) }
      : {}),
  };
}

export function parseBattleJson(
  raw: Prisma.JsonValue | null | undefined
): BattleJsonState | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.spawnId !== 'string') return null;
  if (typeof o.mobHp !== 'number' || typeof o.mobMaxHp !== 'number') return null;
  if (typeof o.mobPAtk !== 'number') return null;
  if (typeof o.mobPDef !== 'number') return null;
  if (typeof o.mobMAtk !== 'number') return null;
  if (typeof o.mobMDef !== 'number') return null;
  if (!Array.isArray(o.log)) return null;
  const playerMp =
    typeof o.playerMp === 'number' && Number.isFinite(o.playerMp)
      ? o.playerMp
      : undefined;
  const mobEvasion =
    typeof o.mobEvasion === 'number' && Number.isFinite(o.mobEvasion)
      ? o.mobEvasion
      : undefined;
  let battleMods: BattleJsonState['battleMods'];
  if (
    o.battleMods != null &&
    typeof o.battleMods === 'object' &&
    !Array.isArray(o.battleMods)
  ) {
    const bm = o.battleMods as Record<string, unknown>;
    const next: NonNullable<BattleJsonState['battleMods']> = {};
    const wcm = jsonFiniteNum(
      bm.warCryPatkMul ?? (bm as { war_cry_patk_mul?: unknown }).war_cry_patk_mul
    );
    if (wcm !== undefined) {
      next.warCryPatkMul = wcm;
    }
    const brm = jsonFiniteNum(
      bm.battleRoarMaxHpMul ?? bm.battle_roar_max_hp_mul
    );
    if (brm !== undefined) {
      next.battleRoarMaxHpMul = brm;
    }
    const jsonBool = (v: unknown): boolean =>
      v === true || v === 'true' || v === 1;
    if (jsonBool(bm.stanceAccuracy)) {
      next.stanceAccuracy = true;
    }
    if (jsonBool(bm.stanceVicious)) {
      next.stanceVicious = true;
    }
    if (jsonBool(bm.stanceParry)) {
      next.stanceParry = true;
    }
    if (bm.stance === 'accuracy' || bm.stance === 'vicious' || bm.stance === 'parry') {
      next.stance = bm.stance;
    }
    migrateBattleModsStancesFromLegacy(next);
    const wk = bm.weaknessKind;
    if (
      wk === 'insect' ||
      wk === 'monster' ||
      wk === 'animal' ||
      wk === 'plant' ||
      wk === 'dragon' ||
      wk === 'eye_hunter' ||
      wk === 'eye_slayer'
    ) {
      next.weaknessKind = wk;
    }
    const wpm = jsonFiniteNum(bm.weaknessPatkMul);
    if (wpm !== undefined) {
      next.weaknessPatkMul = wpm;
    }
    const wdetRaw = bm.weaknessDetects;
    if (wdetRaw != null && typeof wdetRaw === 'object' && !Array.isArray(wdetRaw)) {
      const valid = new Set<string>([
        'insect',
        'monster',
        'animal',
        'plant',
        'dragon',
        'eye_hunter',
        'eye_slayer',
      ]);
      const nextDet: NonNullable<BattleBattleMods['weaknessDetects']> = {};
      for (const k of Object.keys(wdetRaw)) {
        if (!valid.has(k)) continue;
        const v = jsonFiniteNum((wdetRaw as Record<string, unknown>)[k]);
        if (v !== undefined && v > 1) {
          nextDet[k as WeaknessKind] = v;
        }
      }
      if (Object.keys(nextDet).length > 0) {
        next.weaknessDetects = nextDet;
      }
    }
    const mdm = jsonFiniteNum(bm.mobPatkDebuffMul);
    if (mdm !== undefined) {
      next.mobPatkDebuffMul = mdm;
      const sid = jsonFiniteNum(bm.mobPatkDebuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mobPatkDebuffIconSkillId = Math.floor(sid);
      }
      const idsRaw = (bm as { mobPatkDebuffIconSkillIds?: unknown })
        .mobPatkDebuffIconSkillIds;
      if (Array.isArray(idsRaw)) {
        const ids = idsRaw
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0);
        if (ids.length > 0) next.mobPatkDebuffIconSkillIds = ids;
      }
    }
    const tfm = jsonFiniteNum(bm.thrillFightPatkMul);
    if (tfm !== undefined) {
      next.thrillFightPatkMul = tfm;
    }
    const rgPatk = jsonFiniteNum(bm.rageBattlePatkMul);
    if (rgPatk !== undefined && rgPatk > 1) {
      next.rageBattlePatkMul = rgPatk;
    }
    const rgPdef = jsonFiniteNum(bm.rageBattlePdefMul);
    if (rgPdef !== undefined && rgPdef > 0 && rgPdef < 1) {
      next.rageBattlePdefMul = rgPdef;
    }
    const fzPatk = jsonFiniteNum(bm.frenzyBattlePatkMul);
    if (fzPatk !== undefined && fzPatk > 1) {
      next.frenzyBattlePatkMul = fzPatk;
      const fzAcc = jsonFiniteNum(bm.frenzyBattleAccFlat);
      if (fzAcc !== undefined && fzAcc > 0) {
        next.frenzyBattleAccFlat = Math.floor(fzAcc);
      }
    }
    const gutsPdef = jsonFiniteNum(bm.gutsBattlePdefMul);
    if (gutsPdef !== undefined && gutsPdef > 1) {
      next.gutsBattlePdefMul = gutsPdef;
    }
    const zAspd = jsonFiniteNum(bm.zealotAspdMul);
    if (zAspd !== undefined && zAspd > 1) {
      next.zealotAspdMul = zAspd;
      const zRun = jsonFiniteNum(bm.zealotRunSpeedFlat);
      if (zRun !== undefined && zRun > 0) next.zealotRunSpeedFlat = zRun;
      const zAc = jsonFiniteNum(bm.zealotAccuracyFlat);
      if (zAc !== undefined && zAc > 0) next.zealotAccuracyFlat = zAc;
      const zCr = jsonFiniteNum(bm.zealotCritRateAdd);
      if (zCr !== undefined && zCr > 0) next.zealotCritRateAdd = zCr;
      const zCd = jsonFiniteNum(bm.zealotCritDmgMul);
      if (zCd !== undefined && zCd > 1) next.zealotCritDmgMul = zCd;
      const zUm = jsonFiniteNum(bm.zealotUntilMs);
      if (zUm !== undefined && zUm > 0) next.zealotUntilMs = Math.floor(zUm);
    }
    const lhm = jsonFiniteNum(bm.lionheartIncomingPhysMul);
    if (lhm !== undefined) {
      next.lionheartIncomingPhysMul = lhm;
    }
    if (jsonBool(bm.focusAttackActive)) {
      next.focusAttackActive = true;
    }
    const vsr = jsonFiniteNum(bm.viciousStanceSkillRank);
    if (vsr !== undefined && vsr >= 1) {
      next.viciousStanceSkillRank = Math.floor(vsr);
    }
    const dashM = jsonFiniteNum(bm.dashRunSpeedFlat);
    if (dashM !== undefined && dashM > 0) {
      next.dashRunSpeedFlat = dashM;
    }
    const rshot = jsonFiniteNum(bm.rapidShotAspdMul);
    if (rshot !== undefined && rshot > 1) {
      next.rapidShotAspdMul = rshot;
    }
    const snPk = jsonFiniteNum(bm.snipePatkFlat);
    const snAc = jsonFiniteNum(bm.snipeAccuracyFlat);
    const snCr = jsonFiniteNum(bm.snipeCritRateAdd);
    if (snPk !== undefined && snPk > 0) {
      next.snipePatkFlat = snPk;
      next.snipeAccuracyFlat =
        snAc !== undefined && snAc > 0 ? snAc : snPk;
      next.snipeCritRateAdd =
        snCr !== undefined && snCr > 0 ? snCr : 20;
    }
    if (jsonBoolLike(bm.focusChanceActive)) next.focusChanceActive = true;
    const gapFcc = jsonBoolLike(next.focusChanceActive);
    if (jsonBoolLike(bm.focusPowerActive)) next.focusPowerActive = true;
    const gapFpm = jsonBoolLike(next.focusPowerActive);
    const gapBlf = jsonFiniteNum(bm.bluffCritDmgMul);
    if (gapBlf !== undefined && gapBlf > 1) next.bluffCritDmgMul = gapBlf;
    if (jsonBoolLike(bm.silentMoveActive)) {
      next.silentMoveActive = true;
      const gr = jsonFiniteNum(bm.silentMoveRunFlat);
      const ge = jsonFiniteNum(bm.silentMoveEvasionFlat);
      if (gr !== undefined && gr > 0) next.silentMoveRunFlat = gr;
      if (ge !== undefined && ge > 0) next.silentMoveEvasionFlat = ge;
    }
    if (jsonBoolLike(bm.ultimateEvasionActive)) {
      next.ultimateEvasionActive = true;
      const ue = jsonFiniteNum(bm.ultimateEvasionEvasionFlat);
      if (ue !== undefined && ue > 0) next.ultimateEvasionEvasionFlat = ue;
    }
    if (jsonBoolLike(bm.fakeDeathActive)) next.fakeDeathActive = true;
    const gapSan = jsonFiniteNum(bm.sanctuaryIncomingPhysMul);
    if (gapSan !== undefined && gapSan > 0 && gapSan < 1) {
      next.sanctuaryIncomingPhysMul = gapSan;
    }
    if (jsonBoolLike(bm.aegisStanceActive)) {
      next.aegisStanceActive = true;
      const ap = jsonFiniteNum(bm.aegisPDefMul);
      const am = jsonFiniteNum(bm.aegisMDefMul);
      if (ap !== undefined && ap > 0) next.aegisPDefMul = ap;
      if (am !== undefined && am > 0) next.aegisMDefMul = am;
    }
    const gapSh = jsonFiniteNum(bm.shieldFortressPDefMul);
    if (gapSh !== undefined && gapSh > 1) next.shieldFortressPDefMul = gapSh;
    const gapMtd = jsonFiniteNum(bm.mobTargetPDefMul);
    if (gapMtd !== undefined && gapMtd > 0 && gapMtd < 1) {
      next.mobTargetPDefMul = gapMtd;
      const sid = jsonFiniteNum(bm.mobTargetPDefDebuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mobTargetPDefDebuffIconSkillId = Math.floor(sid);
      }
      const idsRaw = (bm as { mobTargetPDefDebuffIconSkillIds?: unknown })
        .mobTargetPDefDebuffIconSkillIds;
      if (Array.isArray(idsRaw)) {
        const ids = idsRaw
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0);
        if (ids.length > 0) next.mobTargetPDefDebuffIconSkillIds = ids;
      }
    }
    const gapMtm = jsonFiniteNum(bm.mobTargetMDefMul);
    if (gapMtm !== undefined && gapMtm > 0 && gapMtm < 1) {
      next.mobTargetMDefMul = gapMtm;
      const sid = jsonFiniteNum(bm.mobTargetMDefDebuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mobTargetMDefDebuffIconSkillId = Math.floor(sid);
      }
      const idsRaw = (bm as { mobTargetMDefDebuffIconSkillIds?: unknown })
        .mobTargetMDefDebuffIconSkillIds;
      if (Array.isArray(idsRaw)) {
        const ids = idsRaw
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0);
        if (ids.length > 0) next.mobTargetMDefDebuffIconSkillIds = ids;
      }
    }
    const sleepUntil = jsonFiniteNum(bm.mobSleepUntilMs);
    if (sleepUntil !== undefined && sleepUntil > 0) {
      next.mobSleepUntilMs = Math.floor(sleepUntil);
      const sid = jsonFiniteNum(bm.mobSleepIconSkillId);
      next.mobSleepIconSkillId =
        sid !== undefined && sid > 0 ? Math.floor(sid) : 1069;
    }
    const stunUntil = jsonFiniteNum(bm.mobStunUntilMs);
    if (stunUntil !== undefined && stunUntil > 0) {
      next.mobStunUntilMs = Math.floor(stunUntil);
      const stunSid = jsonFiniteNum(bm.mobStunIconSkillId);
      next.mobStunIconSkillId =
        stunSid !== undefined && stunSid > 0 ? Math.floor(stunSid) : 260;
    }
    const slowUntil = jsonFiniteNum(bm.mobRunSpeedDebuffUntilMs);
    if (slowUntil !== undefined && slowUntil > 0) {
      next.mobRunSpeedDebuffUntilMs = Math.floor(slowUntil);
      const slowMul = jsonFiniteNum(bm.mobRunSpeedDebuffMul);
      if (slowMul !== undefined && slowMul > 0 && slowMul < 1) {
        next.mobRunSpeedDebuffMul = slowMul;
      }
      const slowSid = jsonFiniteNum(bm.mobRunSpeedDebuffIconSkillId);
      next.mobRunSpeedDebuffIconSkillId =
        slowSid !== undefined && slowSid > 0 ? Math.floor(slowSid) : 354;
    }
    const playerStunUntil = jsonFiniteNum(bm.playerStunUntilMs);
    if (playerStunUntil !== undefined && playerStunUntil > 0) {
      next.playerStunUntilMs = Math.floor(playerStunUntil);
      const playerStunSid = jsonFiniteNum(bm.playerStunIconSkillId);
      next.playerStunIconSkillId =
        playerStunSid !== undefined && playerStunSid > 0
          ? Math.floor(playerStunSid)
          : 260;
    }
    const mobPhysBlockUntil = jsonFiniteNum(bm.mobPhysSkillsBlockedUntilMs);
    if (mobPhysBlockUntil !== undefined && mobPhysBlockUntil > 0) {
      next.mobPhysSkillsBlockedUntilMs = Math.floor(mobPhysBlockUntil);
      const mobPhysSid = jsonFiniteNum(bm.mobPhysSkillsBlockedIconSkillId);
      next.mobPhysSkillsBlockedIconSkillId =
        mobPhysSid !== undefined && mobPhysSid > 0
          ? Math.floor(mobPhysSid)
          : 353;
    }
    const playerPhysBlockUntil = jsonFiniteNum(bm.playerPhysSkillsBlockedUntilMs);
    if (playerPhysBlockUntil !== undefined && playerPhysBlockUntil > 0) {
      next.playerPhysSkillsBlockedUntilMs = Math.floor(playerPhysBlockUntil);
      const playerPhysSid = jsonFiniteNum(bm.playerPhysSkillsBlockedIconSkillId);
      next.playerPhysSkillsBlockedIconSkillId =
        playerPhysSid !== undefined && playerPhysSid > 0
          ? Math.floor(playerPhysSid)
          : 353;
    }
    const gapRdr = jsonFiniteNum(bm.reflectDamageReturnRatio);
    if (gapRdr !== undefined && gapRdr > 0) next.reflectDamageReturnRatio = gapRdr;
    const rtRaw = (bm as { raceToggleRanks?: unknown }).raceToggleRanks;
    if (rtRaw != null && typeof rtRaw === 'object' && !Array.isArray(rtRaw)) {
      const nextRanks: Record<string, number> = {};
      for (const [k, v] of Object.entries(rtRaw as Record<string, unknown>)) {
        const r = jsonFiniteNum(v);
        if (r !== undefined && r >= 1) nextRanks[k] = Math.floor(r);
      }
      if (Object.keys(nextRanks).length > 0) {
        next.raceToggleRanks = nextRanks;
      }
    }
    const gapPmr = jsonFiniteNum(bm.physicalMirrorReflectRatio);
    if (gapPmr !== undefined && gapPmr > 0) next.physicalMirrorReflectRatio = gapPmr;
    const gapVin = jsonFiniteNum(bm.vengeanceIncomingPhysMul);
    if (gapVin !== undefined && gapVin > 0 && gapVin < 1) {
      next.vengeanceIncomingPhysMul = gapVin;
    }
    const gapVrr = jsonFiniteNum(bm.vengeanceReflectRatio);
    if (gapVrr !== undefined && gapVrr > 0) next.vengeanceReflectRatio = gapVrr;
    const gapMysPatk = jsonFiniteNum(bm.mysticPatkBuffMul);
    if (gapMysPatk !== undefined && gapMysPatk > 1) {
      next.mysticPatkBuffMul = gapMysPatk;
      const sid = jsonFiniteNum(bm.mysticPatkBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticPatkBuffIconSkillId = Math.floor(sid);
      }
    }
    const gapMysMatk = jsonFiniteNum(bm.mysticMatkBuffMul);
    if (gapMysMatk !== undefined && gapMysMatk > 1) {
      next.mysticMatkBuffMul = gapMysMatk;
      const sid = jsonFiniteNum(bm.mysticMatkBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticMatkBuffIconSkillId = Math.floor(sid);
      }
    }
    const gapMysCast = jsonFiniteNum(bm.mysticCastSpdBuffMul);
    if (gapMysCast !== undefined && gapMysCast > 1) {
      next.mysticCastSpdBuffMul = gapMysCast;
      const sid = jsonFiniteNum(bm.mysticCastSpdBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticCastSpdBuffIconSkillId = Math.floor(sid);
      }
    }
    const gapMysPdef = jsonFiniteNum(bm.mysticPdefBuffMul);
    if (gapMysPdef !== undefined && gapMysPdef > 1) {
      next.mysticPdefBuffMul = gapMysPdef;
      const sid = jsonFiniteNum(bm.mysticPdefBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticPdefBuffIconSkillId = Math.floor(sid);
      }
    }
    const gapMysMdef = jsonFiniteNum(bm.mysticMdefBuffMul);
    if (gapMysMdef !== undefined && gapMysMdef > 1) {
      next.mysticMdefBuffMul = gapMysMdef;
      const sid = jsonFiniteNum(bm.mysticMdefBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticMdefBuffIconSkillId = Math.floor(sid);
      }
    }
    const gapSsMul = jsonFiniteNum(bm.fighterSoulshotPatkMul);
    const gapSsId = jsonFiniteNum(bm.fighterSoulshotItemId);
    if (
      gapSsMul !== undefined &&
      gapSsMul > 1 &&
      gapSsId !== undefined &&
      gapSsId > 0
    ) {
      next.fighterSoulshotPatkMul = gapSsMul;
      next.fighterSoulshotItemId = Math.floor(gapSsId);
    }
    const gapMbsMul = jsonFiniteNum(bm.mysticBlessedSpiritshotMatkMul);
    const gapMbsId = jsonFiniteNum(bm.mysticBlessedSpiritshotItemId);
    if (
      gapMbsMul !== undefined &&
      gapMbsMul > 1 &&
      gapMbsId !== undefined &&
      gapMbsId > 0
    ) {
      next.mysticBlessedSpiritshotMatkMul = gapMbsMul;
      next.mysticBlessedSpiritshotItemId = Math.floor(gapMbsId);
    }
    if (
      next.warCryPatkMul != null ||
      next.battleRoarMaxHpMul != null ||
      next.stanceAccuracy === true ||
      next.stanceVicious === true ||
      next.stanceParry === true ||
      next.weaknessKind != null ||
      next.weaknessPatkMul != null ||
      (next.weaknessDetects != null &&
        Object.keys(next.weaknessDetects).length > 0) ||
      next.mobPatkDebuffMul != null ||
      next.thrillFightPatkMul != null ||
      next.rageBattlePatkMul != null ||
      next.rageBattlePdefMul != null ||
      next.frenzyBattlePatkMul != null ||
      next.gutsBattlePdefMul != null ||
      (zAspd !== undefined && zAspd > 1) ||
      next.lionheartIncomingPhysMul != null ||
      isFocusAttackActive(next) ||
      (dashM !== undefined && dashM > 0) ||
      (rshot !== undefined && rshot > 1) ||
      (snPk !== undefined && snPk > 0) ||
      gapFcc ||
      gapFpm ||
      (gapBlf !== undefined && gapBlf > 1) ||
      next.silentMoveActive === true ||
      next.ultimateEvasionActive === true ||
      next.fakeDeathActive === true ||
      (gapSan !== undefined && gapSan > 0 && gapSan < 1) ||
      next.aegisStanceActive === true ||
      (gapSh !== undefined && gapSh > 1) ||
      (gapMtd !== undefined && gapMtd > 0 && gapMtd < 1) ||
      (gapMtm !== undefined && gapMtm > 0 && gapMtm < 1) ||
      (sleepUntil !== undefined && sleepUntil > Date.now()) ||
      (stunUntil !== undefined && stunUntil > Date.now()) ||
      (playerStunUntil !== undefined && playerStunUntil > Date.now()) ||
      (mobPhysBlockUntil !== undefined && mobPhysBlockUntil > Date.now()) ||
      (playerPhysBlockUntil !== undefined && playerPhysBlockUntil > Date.now()) ||
      (gapRdr !== undefined && gapRdr > 0) ||
      (gapPmr !== undefined && gapPmr > 0) ||
      (gapVin !== undefined && gapVin > 0 && gapVin < 1) ||
      (gapVrr !== undefined && gapVrr > 0) ||
      (gapMysPatk !== undefined && gapMysPatk > 1) ||
      (gapMysMatk !== undefined && gapMysMatk > 1) ||
      (gapMysCast !== undefined && gapMysCast > 1) ||
      (gapMysPdef !== undefined && gapMysPdef > 1) ||
      (gapMysMdef !== undefined && gapMysMdef > 1) ||
      (gapSsMul !== undefined &&
        gapSsMul > 1 &&
        gapSsId !== undefined &&
        gapSsId > 0) ||
      (gapMbsMul !== undefined &&
        gapMbsMul > 1 &&
        gapMbsId !== undefined &&
        gapMbsId > 0) ||
      (next.raceToggleRanks != null &&
        Object.keys(next.raceToggleRanks).length > 0)
    ) {
      battleMods = next;
    }
  }

  let mysticSkillCdUntil: BattleJsonState['mysticSkillCdUntil'];
  const rawMysticCd = o.mysticSkillCdUntil;
  if (
    rawMysticCd != null &&
    typeof rawMysticCd === 'object' &&
    !Array.isArray(rawMysticCd)
  ) {
    const nextCd: Record<string, number> = {};
    for (const k of Object.keys(rawMysticCd)) {
      const v = jsonFiniteNum((rawMysticCd as Record<string, unknown>)[k]);
      if (v !== undefined && v > 0) nextCd[k] = v;
    }
    if (Object.keys(nextCd).length > 0) mysticSkillCdUntil = nextCd;
  }

  let battleModsExpiresAtMsBySkillId:
    | BattleJsonState['battleModsExpiresAtMsBySkillId'];
  const rawLegacyExp = (o as Record<string, unknown>)
    .battleModsExpiresAtMsBySkillId;
  if (
    rawLegacyExp != null &&
    typeof rawLegacyExp === 'object' &&
    !Array.isArray(rawLegacyExp)
  ) {
    const nextExp: Record<string, number> = {};
    for (const k of Object.keys(rawLegacyExp)) {
      const v = jsonFiniteNum(
        (rawLegacyExp as Record<string, unknown>)[k]
      );
      if (v !== undefined && v > 0) nextExp[k] = v;
    }
    if (Object.keys(nextExp).length > 0) {
      battleModsExpiresAtMsBySkillId = nextExp;
    }
  }

  const lastStanceTickMs = jsonFiniteNum(
    (o as Record<string, unknown>).lastStanceTickMs
  );
  const lastRegenTickMs = jsonFiniteNum(
    (o as Record<string, unknown>).lastRegenTickMs
  );
  const lastPlayerAttackAtMs = jsonFiniteNum(
    (o as Record<string, unknown>).lastPlayerAttackAtMs
  );
  const mobHitsUntilRetaliation = jsonFiniteNum(
    (o as Record<string, unknown>).mobHitsUntilRetaliation
  );

  const sonicChargesRaw = jsonFiniteNum(
    (o as Record<string, unknown>).sonicCharges
  );
  const maxSonicChargesRaw = jsonFiniteNum(
    (o as Record<string, unknown>).maxSonicCharges
  );

  const battlePotionHpHoT = parseBattlePotionHoTField(
    (o as Record<string, unknown>).battlePotionHpHoT
  );
  const battlePotionMpHoT = parseBattlePotionHoTField(
    (o as Record<string, unknown>).battlePotionMpHoT
  );
  const battleTouchOfLifeHpHoT = parseBattlePotionHoTField(
    (o as Record<string, unknown>).battleTouchOfLifeHpHoT
  );

  const wcRoot = jsonFiniteNum(o.warCryPatkMul ?? o.war_cry_patk_mul);
  const wcNested = battleMods
    ? jsonFiniteNum(battleMods.warCryPatkMul)
    : undefined;
  let wcFinal: number | undefined;
  if (wcNested !== undefined && wcNested > 1) {
    wcFinal = wcNested;
  } else if (wcRoot !== undefined && wcRoot > 1) {
    wcFinal = wcRoot;
  } else {
    wcFinal = undefined;
  }
  if (wcFinal !== undefined) {
    battleMods = { ...(battleMods ?? {}), warCryPatkMul: wcFinal };
  }

  if (battleMods) {
    applyRiposteReflectToBattleMods(battleMods);
    stripExpiredZealotFromBattleMods(battleMods, Date.now());
    if (Object.keys(battleMods).length === 0) battleMods = undefined;
  }

  const mobMaxHpNum = o.mobMaxHp;
  const mobMaxCpDerived = mobMaxCpFromMobMaxHp(mobMaxHpNum);
  let mobMaxCp: number;
  if (
    typeof o.mobMaxCp === 'number' &&
    Number.isFinite(o.mobMaxCp) &&
    o.mobMaxCp >= 0
  ) {
    mobMaxCp = Math.floor(o.mobMaxCp);
  } else {
    mobMaxCp = mobMaxCpDerived;
  }
  let mobCp: number;
  if (typeof o.mobCp === 'number' && Number.isFinite(o.mobCp) && o.mobCp >= 0) {
    mobCp = Math.max(0, Math.min(mobMaxCp, Math.floor(o.mobCp)));
  } else {
    mobCp = mobMaxCp;
  }

  let whirlwindExtras: WhirlwindExtraMobJson[] | undefined;
  const wexRaw = o.whirlwindExtras;
  if (Array.isArray(wexRaw)) {
    const next: WhirlwindExtraMobJson[] = [];
    for (const row of wexRaw) {
      if (row == null || typeof row !== 'object' || Array.isArray(row)) continue;
      const r = row as Record<string, unknown>;
      if (typeof r.spawnId !== 'string' || typeof r.name !== 'string') continue;
      const mobHp = jsonFiniteNum(r.mobHp);
      const mobMaxHp = jsonFiniteNum(r.mobMaxHp);
      const mobPAtk = jsonFiniteNum(r.mobPAtk);
      const mobPDef = jsonFiniteNum(r.mobPDef);
      const mobMAtk = jsonFiniteNum(r.mobMAtk);
      const mobMDef = jsonFiniteNum(r.mobMDef);
      const mobEvasion = jsonFiniteNum(r.mobEvasion);
      if (
        mobHp === undefined ||
        mobMaxHp === undefined ||
        mobPAtk === undefined ||
        mobPDef === undefined ||
        mobMAtk === undefined ||
        mobMDef === undefined ||
        mobEvasion === undefined
      ) {
        continue;
      }
      next.push({
        spawnId: r.spawnId,
        name: r.name,
        mobHp: Math.max(0, Math.floor(mobHp)),
        mobMaxHp: Math.max(1, Math.floor(mobMaxHp)),
        mobPAtk: Math.floor(mobPAtk),
        mobPDef: Math.floor(mobPDef),
        mobMAtk: Math.floor(mobMAtk),
        mobMDef: Math.floor(mobMDef),
        mobEvasion: Math.max(0, Math.floor(mobEvasion)),
        ...(r.lootGranted === true ? { lootGranted: true } : {}),
      });
      if (next.length >= 2) break;
    }
    if (next.length > 0) whirlwindExtras = next;
  }
  const whirlwindNextAutoCleaveHitsRaw = jsonFiniteNum(
    o.whirlwindNextAutoCleaveHits
  );
  const whirlwindNextAutoCleaveHits =
    whirlwindNextAutoCleaveHitsRaw !== undefined &&
    whirlwindNextAutoCleaveHitsRaw > 0
      ? Math.max(1, Math.floor(whirlwindNextAutoCleaveHitsRaw))
      : undefined;

  return {
    spawnId: o.spawnId,
    mobHp: o.mobHp,
    mobMaxHp: o.mobMaxHp,
    mobCp,
    mobMaxCp,
    mobPAtk: o.mobPAtk,
    mobPDef: o.mobPDef,
    mobMAtk: o.mobMAtk,
    mobMDef: o.mobMDef,
    ...(mobEvasion !== undefined ? { mobEvasion } : {}),
    log: o.log.filter((x): x is string => typeof x === 'string'),
    playerMp,
    ...(battleMods !== undefined ? { battleMods } : {}),
    ...(wcFinal !== undefined && wcFinal > 1 ? { warCryPatkMul: wcFinal } : {}),
    ...(mysticSkillCdUntil !== undefined
      ? { mysticSkillCdUntil }
      : {}),
    ...(battleModsExpiresAtMsBySkillId !== undefined
      ? { battleModsExpiresAtMsBySkillId }
      : {}),
    ...(lastStanceTickMs !== undefined && lastStanceTickMs > 0
      ? { lastStanceTickMs: Math.floor(lastStanceTickMs) }
      : {}),
    ...(lastRegenTickMs !== undefined && lastRegenTickMs > 0
      ? { lastRegenTickMs: Math.floor(lastRegenTickMs) }
      : {}),
    ...(lastPlayerAttackAtMs !== undefined && lastPlayerAttackAtMs > 0
      ? { lastPlayerAttackAtMs: Math.floor(lastPlayerAttackAtMs) }
      : {}),
    ...(mobHitsUntilRetaliation !== undefined && mobHitsUntilRetaliation > 0
      ? { mobHitsUntilRetaliation: Math.floor(mobHitsUntilRetaliation) }
      : {}),
    ...(whirlwindExtras !== undefined ? { whirlwindExtras } : {}),
    ...(whirlwindNextAutoCleaveHits !== undefined
      ? { whirlwindNextAutoCleaveHits }
      : {}),
    ...(sonicChargesRaw !== undefined && sonicChargesRaw > 0
      ? { sonicCharges: Math.max(0, Math.floor(sonicChargesRaw)) }
      : {}),
    ...(maxSonicChargesRaw !== undefined && maxSonicChargesRaw > 0
      ? { maxSonicCharges: Math.max(1, Math.floor(maxSonicChargesRaw)) }
      : {}),
    ...(battlePotionHpHoT !== undefined ? { battlePotionHpHoT } : {}),
    ...(battlePotionMpHoT !== undefined ? { battlePotionMpHoT } : {}),
    ...(battleTouchOfLifeHpHoT !== undefined
      ? { battleTouchOfLifeHpHoT }
      : {}),
    ...(o.battleMode === 'pvp' ? { battleMode: 'pvp' as const } : {}),
    ...(typeof o.pvpTargetCharacterId === 'string' &&
    o.pvpTargetCharacterId.trim()
      ? { pvpTargetCharacterId: o.pvpTargetCharacterId.trim() }
      : {}),
    ...(typeof o.pvpTargetName === 'string' && o.pvpTargetName.trim()
      ? { pvpTargetName: o.pvpTargetName.trim() }
      : {}),
    ...(typeof o.pvpTargetLevel === 'number' &&
    Number.isFinite(o.pvpTargetLevel)
      ? { pvpTargetLevel: Math.max(1, Math.floor(o.pvpTargetLevel)) }
      : {}),
    ...(o.pvpIsAggressor === true ? { pvpIsAggressor: true as const } : {}),
    ...(o.pvpIsAggressor === false ? { pvpIsAggressor: false as const } : {}),
    ...(o.pvpVictimFoughtBack === true
      ? { pvpVictimFoughtBack: true as const }
      : {}),
    ...(typeof o.playerCp === 'number' && Number.isFinite(o.playerCp) && o.playerCp >= 0
      ? { playerCp: Math.floor(o.playerCp) }
      : {}),
    ...(typeof o.playerMaxCp === 'number' &&
    Number.isFinite(o.playerMaxCp) &&
    o.playerMaxCp >= 0
      ? { playerMaxCp: Math.floor(o.playerMaxCp) }
      : {}),
  };
}
