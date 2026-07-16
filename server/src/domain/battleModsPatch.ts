import type { BattleBattleMods } from './battleTypes.js';
import {
  jsonFiniteNum,
  getWeaknessDetectMap,
  isFocusAttackActive,
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  jsonBoolLike,
  migrateBattleModsStancesFromLegacy,
} from './battleModsJson.js';
import { normalizeBattleModsNumsInPlace } from './battleModsNormalizeNums.js';
import { applyRiposteReflectToBattleMods } from './riposteStance.js';

/** Що треба зберігати в `worldCombatStateJson` після бою / між ходами (узгоджено з `applyBattleModsPatch`). */
export function battleModsHasPersistableBuffs(next: BattleBattleMods): boolean {
  const wcN = jsonFiniteNum(next.warCryPatkMul);
  const brN = jsonFiniteNum(next.battleRoarMaxHpMul);
  const mdN = jsonFiniteNum(next.mobPatkDebuffMul);
  const tfN = jsonFiniteNum(next.thrillFightPatkMul);
  const rgPatkN = jsonFiniteNum(next.rageBattlePatkMul);
  const rgPdefN = jsonFiniteNum(next.rageBattlePdefMul);
  const fzPatkN = jsonFiniteNum(next.frenzyBattlePatkMul);
  const gutsPdefN = jsonFiniteNum(next.gutsBattlePdefMul);
  const zealN = jsonFiniteNum(next.zealotAspdMul);
  const lhN = jsonFiniteNum(next.lionheartIncomingPhysMul);
  const dashN = jsonFiniteNum(next.dashRunSpeedFlat);
  const rsN = jsonFiniteNum(next.rapidShotAspdMul);
  const snN = jsonFiniteNum(next.snipePatkFlat);
  const fccGap = jsonFiniteNum(next.focusChanceCritRateAdd);
  const fpmGap = jsonFiniteNum(next.focusPowerPatkMul);
  const blfGap = jsonFiniteNum(next.bluffCritDmgMul);
  const sanGap = jsonFiniteNum(next.sanctuaryIncomingPhysMul);
  const shGap = jsonFiniteNum(next.shieldFortressPDefMul);
  const mtdGap = jsonFiniteNum(next.mobTargetPDefMul);
  const mtmGap = jsonFiniteNum(next.mobTargetMDefMul);
  const sleepUntilGap = jsonFiniteNum(next.mobSleepUntilMs);
  const stunUntilGap = jsonFiniteNum(next.mobStunUntilMs);
  const playerStunUntilGap = jsonFiniteNum(next.playerStunUntilMs);
  const rdrGap = jsonFiniteNum(next.reflectDamageReturnRatio);
  const pmrGap = jsonFiniteNum(next.physicalMirrorReflectRatio);
  const vimGap = jsonFiniteNum(next.vengeanceIncomingPhysMul);
  const vrrGap = jsonFiniteNum(next.vengeanceReflectRatio);
  const mysPatkGap = jsonFiniteNum(next.mysticPatkBuffMul);
  const mysMatkGap = jsonFiniteNum(next.mysticMatkBuffMul);
  const mysCastGap = jsonFiniteNum(next.mysticCastSpdBuffMul);
  const mysPdefGap = jsonFiniteNum(next.mysticPdefBuffMul);
  const mysMdefGap = jsonFiniteNum(next.mysticMdefBuffMul);
  const ssGap = jsonFiniteNum(next.fighterSoulshotPatkMul);
  const mystBlessSsGap = jsonFiniteNum(next.mysticBlessedSpiritshotMatkMul);
  const hasWeaknessDetects = Object.keys(getWeaknessDetectMap(next)).length > 0;
  const hasRaceToggles =
    !!next.raceToggleRanks &&
    typeof next.raceToggleRanks === 'object' &&
    Object.keys(next.raceToggleRanks).length > 0;
  return (
    (wcN !== undefined && wcN > 1) ||
    (brN !== undefined && brN > 1) ||
    isStanceAccuracyActive(next) ||
    isStanceViciousActive(next) ||
    isStanceParryActive(next) ||
    hasRaceToggles ||
    hasWeaknessDetects ||
    (mdN !== undefined && mdN > 0 && mdN < 1) ||
    (tfN !== undefined && tfN > 1) ||
    (rgPatkN !== undefined && rgPatkN > 1) ||
    (rgPdefN !== undefined && rgPdefN > 0 && rgPdefN < 1) ||
    (fzPatkN !== undefined && fzPatkN > 1) ||
    (gutsPdefN !== undefined && gutsPdefN > 1) ||
    (zealN !== undefined && zealN > 1) ||
    (lhN !== undefined && lhN > 0 && lhN < 1) ||
    isFocusAttackActive(next) ||
    (dashN !== undefined && dashN > 0) ||
    (rsN !== undefined && rsN > 1) ||
    (snN !== undefined && snN > 0) ||
    (fccGap !== undefined && fccGap > 0) ||
    (fpmGap !== undefined && fpmGap > 1) ||
    (blfGap !== undefined && blfGap > 1) ||
    jsonBoolLike(next.silentMoveActive) ||
    jsonBoolLike(next.ultimateEvasionActive) ||
    jsonBoolLike(next.fakeDeathActive) ||
    (sanGap !== undefined && sanGap > 0 && sanGap < 1) ||
    jsonBoolLike(next.aegisStanceActive) ||
    (shGap !== undefined && shGap > 1) ||
    (mtdGap !== undefined && mtdGap > 0 && mtdGap < 1) ||
    (mtmGap !== undefined && mtmGap > 0 && mtmGap < 1) ||
    (sleepUntilGap !== undefined && sleepUntilGap > Date.now()) ||
    (stunUntilGap !== undefined && stunUntilGap > Date.now()) ||
    (playerStunUntilGap !== undefined && playerStunUntilGap > Date.now()) ||
    (rdrGap !== undefined && rdrGap > 0) ||
    (pmrGap !== undefined && pmrGap > 0) ||
    (vimGap !== undefined && vimGap > 0 && vimGap < 1) ||
    (vrrGap !== undefined && vrrGap > 0) ||
    (mysPatkGap !== undefined && mysPatkGap > 1) ||
    (mysMatkGap !== undefined && mysMatkGap > 1) ||
    (mysCastGap !== undefined && mysCastGap > 1) ||
    (mysPdefGap !== undefined && mysPdefGap > 1) ||
    (mysMdefGap !== undefined && mysMdefGap > 1) ||
    (ssGap !== undefined && ssGap > 1) ||
    (mystBlessSsGap !== undefined && mystBlessSsGap > 1)
  );
}

export function applyBattleModsPatch(
  prev: BattleBattleMods | undefined,
  patch: Partial<BattleBattleMods> | undefined
): BattleBattleMods | undefined {
  if (!patch) return prev;
  const next: BattleBattleMods = { ...(prev ?? {}) };
  migrateBattleModsStancesFromLegacy(next);
  if (patch.warCryPatkMul !== undefined) {
    const w = jsonFiniteNum(patch.warCryPatkMul);
    if (w !== undefined && w > 1) {
      next.warCryPatkMul = w;
    } else {
      delete next.warCryPatkMul;
    }
  }
  if (patch.battleRoarMaxHpMul !== undefined) {
    const br = jsonFiniteNum(patch.battleRoarMaxHpMul);
    if (br !== undefined && br > 1) {
      next.battleRoarMaxHpMul = br;
    } else {
      delete next.battleRoarMaxHpMul;
    }
  }
  if (patch.stanceAccuracy !== undefined) {
    if (patch.stanceAccuracy) {
      next.stanceAccuracy = true;
    } else {
      delete next.stanceAccuracy;
    }
  }
  if (patch.stanceVicious !== undefined) {
    if (patch.stanceVicious) {
      next.stanceVicious = true;
    } else {
      delete next.stanceVicious;
      delete next.viciousStanceSkillRank;
    }
  }
  if (patch.viciousStanceSkillRank !== undefined) {
    const r = Math.floor(Number(patch.viciousStanceSkillRank));
    if (Number.isFinite(r) && r >= 1) {
      next.viciousStanceSkillRank = r;
    } else {
      delete next.viciousStanceSkillRank;
    }
  }
  if (patch.stanceParry !== undefined) {
    if (patch.stanceParry) {
      next.stanceParry = true;
    } else {
      delete next.stanceParry;
    }
  }
  if (patch.stance !== undefined) {
    if (patch.stance === null) {
      delete next.stance;
      delete next.stanceAccuracy;
      delete next.stanceVicious;
      delete next.stanceParry;
    } else {
      delete next.stanceAccuracy;
      delete next.stanceVicious;
      delete next.stanceParry;
      if (patch.stance === 'accuracy') {
        next.stanceAccuracy = true;
      } else if (patch.stance === 'vicious') {
        next.stanceVicious = true;
      } else if (patch.stance === 'parry') {
        next.stanceParry = true;
      }
      delete next.stance;
    }
  }
  if (patch.weaknessKind !== undefined) {
    if (patch.weaknessKind === null) {
      delete next.weaknessKind;
      delete next.weaknessPatkMul;
      delete next.weaknessDetects;
    } else {
      next.weaknessKind = patch.weaknessKind;
    }
  }
  if (patch.weaknessPatkMul !== undefined) {
    next.weaknessPatkMul = patch.weaknessPatkMul;
  }
  if (patch.weaknessKind != null && patch.weaknessPatkMul !== undefined) {
    const pMul = jsonFiniteNum(patch.weaknessPatkMul);
    if (pMul !== undefined && pMul > 1) {
      next.weaknessDetects = {
        ...(next.weaknessDetects ?? {}),
        [patch.weaknessKind]: pMul,
      };
      next.weaknessKind = patch.weaknessKind;
      next.weaknessPatkMul = pMul;
    }
  }
  if (patch.mobPatkDebuffMul !== undefined) {
    const md = jsonFiniteNum(patch.mobPatkDebuffMul);
    if (md !== undefined && md > 0 && md < 1) {
      next.mobPatkDebuffMul = md;
      const sid = jsonFiniteNum(patch.mobPatkDebuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mobPatkDebuffIconSkillId = Math.floor(sid);
      }
      if (Array.isArray(patch.mobPatkDebuffIconSkillIds)) {
        const ids = patch.mobPatkDebuffIconSkillIds
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0);
        next.mobPatkDebuffIconSkillIds = ids;
      }
    } else {
      delete next.mobPatkDebuffMul;
      delete next.mobPatkDebuffIconSkillId;
      delete next.mobPatkDebuffIconSkillIds;
    }
  }
  if (patch.mobPoleResistCutPct !== undefined) {
    const pc = jsonFiniteNum(patch.mobPoleResistCutPct);
    if (pc !== undefined && pc > 0 && pc < 100) {
      next.mobPoleResistCutPct = pc;
    } else {
      delete next.mobPoleResistCutPct;
    }
  }
  if (patch.thrillFightPatkMul !== undefined) {
    const tf = jsonFiniteNum(patch.thrillFightPatkMul);
    if (tf !== undefined && tf > 1) {
      next.thrillFightPatkMul = tf;
    } else {
      delete next.thrillFightPatkMul;
    }
  }
  if (patch.rageBattlePatkMul !== undefined) {
    const rg = jsonFiniteNum(patch.rageBattlePatkMul);
    if (rg !== undefined && rg > 1) {
      next.rageBattlePatkMul = rg;
    } else {
      delete next.rageBattlePatkMul;
    }
  }
  if (patch.rageBattlePdefMul !== undefined) {
    const rd = jsonFiniteNum(patch.rageBattlePdefMul);
    if (rd !== undefined && rd > 0 && rd < 1) {
      next.rageBattlePdefMul = rd;
    } else {
      delete next.rageBattlePdefMul;
    }
  }
  if (patch.frenzyBattlePatkMul !== undefined) {
    const fz = jsonFiniteNum(patch.frenzyBattlePatkMul);
    if (fz !== undefined && fz > 1) {
      next.frenzyBattlePatkMul = fz;
      if ('frenzyBattleAccFlat' in patch) {
        const af = jsonFiniteNum(patch.frenzyBattleAccFlat);
        if (af !== undefined && af > 0) {
          next.frenzyBattleAccFlat = Math.floor(af);
        } else {
          delete next.frenzyBattleAccFlat;
        }
      } else {
        delete next.frenzyBattleAccFlat;
      }
    } else {
      delete next.frenzyBattlePatkMul;
      delete next.frenzyBattleAccFlat;
    }
  }
  if (patch.gutsBattlePdefMul !== undefined) {
    const gu = jsonFiniteNum(patch.gutsBattlePdefMul);
    if (gu !== undefined && gu > 1) {
      next.gutsBattlePdefMul = gu;
    } else {
      delete next.gutsBattlePdefMul;
    }
  }
  if (patch.zealotAspdMul !== undefined) {
    const z = jsonFiniteNum(patch.zealotAspdMul);
    if (z !== undefined && z > 1) {
      next.zealotAspdMul = z;
      const cr = jsonFiniteNum(patch.zealotCritRateAdd);
      if (cr !== undefined && cr > 0) {
        next.zealotCritRateAdd = Math.floor(cr);
      }
      const cd = jsonFiniteNum(patch.zealotCritDmgMul);
      if (cd !== undefined && cd > 1) {
        next.zealotCritDmgMul = cd;
      }
      const run = jsonFiniteNum(patch.zealotRunSpeedFlat);
      if (run !== undefined && run > 0) {
        next.zealotRunSpeedFlat = Math.floor(run);
      }
      const ac = jsonFiniteNum(patch.zealotAccuracyFlat);
      if (ac !== undefined && ac > 0) {
        next.zealotAccuracyFlat = Math.floor(ac);
      }
      const zu = jsonFiniteNum(patch.zealotUntilMs);
      if (zu !== undefined && zu > 0) {
        next.zealotUntilMs = Math.floor(zu);
      }
    } else {
      delete next.zealotAspdMul;
      delete next.zealotCritRateAdd;
      delete next.zealotCritDmgMul;
      delete next.zealotRunSpeedFlat;
      delete next.zealotAccuracyFlat;
      delete next.zealotUntilMs;
    }
  }
  if (patch.lionheartIncomingPhysMul !== undefined) {
    const lh = jsonFiniteNum(patch.lionheartIncomingPhysMul);
    if (lh !== undefined && lh > 0 && lh < 1) {
      next.lionheartIncomingPhysMul = lh;
    } else {
      delete next.lionheartIncomingPhysMul;
    }
  }
  if (patch.focusAttackActive !== undefined) {
    if (patch.focusAttackActive) {
      next.focusAttackActive = true;
    } else {
      delete next.focusAttackActive;
    }
  }
  if (patch.dashRunSpeedFlat !== undefined) {
    const d = jsonFiniteNum(patch.dashRunSpeedFlat);
    if (d !== undefined && d > 0) {
      next.dashRunSpeedFlat = d;
    } else {
      delete next.dashRunSpeedFlat;
    }
  }
  if (patch.rapidShotAspdMul !== undefined) {
    const r = jsonFiniteNum(patch.rapidShotAspdMul);
    if (r !== undefined && r > 1) {
      next.rapidShotAspdMul = r;
    } else {
      delete next.rapidShotAspdMul;
    }
  }
  if (patch.snipePatkFlat !== undefined) {
    const p = jsonFiniteNum(patch.snipePatkFlat);
    if (p !== undefined && p > 0) {
      next.snipePatkFlat = p;
      const a = jsonFiniteNum(patch.snipeAccuracyFlat);
      next.snipeAccuracyFlat = a !== undefined && a > 0 ? a : p;
      const c = jsonFiniteNum(patch.snipeCritRateAdd);
      next.snipeCritRateAdd = c !== undefined && c > 0 ? c : 20;
    } else {
      delete next.snipePatkFlat;
      delete next.snipeAccuracyFlat;
      delete next.snipeCritRateAdd;
    }
  }
  if (patch.focusChanceCritRateAdd !== undefined) {
    const v = jsonFiniteNum(patch.focusChanceCritRateAdd);
    if (v !== undefined && v > 0) next.focusChanceCritRateAdd = v;
    else delete next.focusChanceCritRateAdd;
  }
  if (patch.focusPowerPatkMul !== undefined) {
    const v = jsonFiniteNum(patch.focusPowerPatkMul);
    if (v !== undefined && v > 1) next.focusPowerPatkMul = v;
    else delete next.focusPowerPatkMul;
  }
  if (patch.bluffCritDmgMul !== undefined) {
    const v = jsonFiniteNum(patch.bluffCritDmgMul);
    if (v !== undefined && v > 1) next.bluffCritDmgMul = v;
    else delete next.bluffCritDmgMul;
  }
  if (patch.fighterSoulshotPatkMul !== undefined || patch.fighterSoulshotItemId !== undefined) {
    const m = jsonFiniteNum(patch.fighterSoulshotPatkMul);
    const iid = jsonFiniteNum(patch.fighterSoulshotItemId);
    if (m !== undefined && m > 1 && iid !== undefined && iid > 0) {
      next.fighterSoulshotPatkMul = m;
      next.fighterSoulshotItemId = Math.floor(iid);
    } else {
      delete next.fighterSoulshotPatkMul;
      delete next.fighterSoulshotItemId;
    }
  }
  if (
    patch.mysticBlessedSpiritshotMatkMul !== undefined ||
    patch.mysticBlessedSpiritshotItemId !== undefined
  ) {
    const m = jsonFiniteNum(patch.mysticBlessedSpiritshotMatkMul);
    const iid = jsonFiniteNum(patch.mysticBlessedSpiritshotItemId);
    if (m !== undefined && m > 1 && iid !== undefined && iid > 0) {
      next.mysticBlessedSpiritshotMatkMul = m;
      next.mysticBlessedSpiritshotItemId = Math.floor(iid);
    } else {
      delete next.mysticBlessedSpiritshotMatkMul;
      delete next.mysticBlessedSpiritshotItemId;
    }
  }
  if (patch.silentMoveActive !== undefined) {
    if (patch.silentMoveActive) {
      next.silentMoveActive = true;
      const r = jsonFiniteNum(patch.silentMoveRunFlat);
      const e = jsonFiniteNum(patch.silentMoveEvasionFlat);
      if (r !== undefined && r > 0) next.silentMoveRunFlat = r;
      if (e !== undefined && e > 0) next.silentMoveEvasionFlat = e;
    } else {
      delete next.silentMoveActive;
      delete next.silentMoveRunFlat;
      delete next.silentMoveEvasionFlat;
    }
  }
  if (patch.silentMoveRunFlat !== undefined && next.silentMoveActive) {
    const r = jsonFiniteNum(patch.silentMoveRunFlat);
    if (r !== undefined && r > 0) next.silentMoveRunFlat = r;
  }
  if (patch.silentMoveEvasionFlat !== undefined && next.silentMoveActive) {
    const e = jsonFiniteNum(patch.silentMoveEvasionFlat);
    if (e !== undefined && e > 0) next.silentMoveEvasionFlat = e;
  }
  if (patch.ultimateEvasionActive !== undefined) {
    if (patch.ultimateEvasionActive) {
      next.ultimateEvasionActive = true;
      const e = jsonFiniteNum(patch.ultimateEvasionEvasionFlat);
      if (e !== undefined && e > 0) next.ultimateEvasionEvasionFlat = e;
    } else {
      delete next.ultimateEvasionActive;
      delete next.ultimateEvasionEvasionFlat;
    }
  }
  if (patch.fakeDeathActive !== undefined) {
    if (patch.fakeDeathActive) next.fakeDeathActive = true;
    else delete next.fakeDeathActive;
  }
  if (patch.sanctuaryIncomingPhysMul !== undefined) {
    const v = jsonFiniteNum(patch.sanctuaryIncomingPhysMul);
    if (v !== undefined && v > 0 && v < 1) next.sanctuaryIncomingPhysMul = v;
    else delete next.sanctuaryIncomingPhysMul;
  }
  if (patch.aegisStanceActive !== undefined) {
    if (patch.aegisStanceActive) {
      next.aegisStanceActive = true;
      const pd = jsonFiniteNum(patch.aegisPDefMul);
      const md = jsonFiniteNum(patch.aegisMDefMul);
      if (pd !== undefined && pd > 0) next.aegisPDefMul = pd;
      if (md !== undefined && md > 0) next.aegisMDefMul = md;
    } else {
      delete next.aegisStanceActive;
      delete next.aegisPDefMul;
      delete next.aegisMDefMul;
    }
  }
  if (patch.shieldFortressPDefMul !== undefined) {
    const v = jsonFiniteNum(patch.shieldFortressPDefMul);
    if (v !== undefined && v > 1) next.shieldFortressPDefMul = v;
    else delete next.shieldFortressPDefMul;
  }
  if (patch.mobTargetPDefMul !== undefined) {
    const v = jsonFiniteNum(patch.mobTargetPDefMul);
    if (v !== undefined && v > 0 && v < 1) {
      next.mobTargetPDefMul = v;
      const sid = jsonFiniteNum(patch.mobTargetPDefDebuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mobTargetPDefDebuffIconSkillId = Math.floor(sid);
      }
      if (Array.isArray(patch.mobTargetPDefDebuffIconSkillIds)) {
        const ids = patch.mobTargetPDefDebuffIconSkillIds
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0);
        next.mobTargetPDefDebuffIconSkillIds = ids;
      }
    } else {
      delete next.mobTargetPDefMul;
      delete next.mobTargetPDefDebuffIconSkillId;
      delete next.mobTargetPDefDebuffIconSkillIds;
    }
  }
  if (patch.mobTargetMDefMul !== undefined) {
    const v = jsonFiniteNum(patch.mobTargetMDefMul);
    if (v !== undefined && v > 0 && v < 1) {
      next.mobTargetMDefMul = v;
      const sid = jsonFiniteNum(patch.mobTargetMDefDebuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mobTargetMDefDebuffIconSkillId = Math.floor(sid);
      }
      if (Array.isArray(patch.mobTargetMDefDebuffIconSkillIds)) {
        const ids = patch.mobTargetMDefDebuffIconSkillIds
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0);
        next.mobTargetMDefDebuffIconSkillIds = ids;
      }
    } else {
      delete next.mobTargetMDefMul;
      delete next.mobTargetMDefDebuffIconSkillId;
      delete next.mobTargetMDefDebuffIconSkillIds;
    }
  }
  if (patch.mobSleepUntilMs !== undefined) {
    const v = jsonFiniteNum(patch.mobSleepUntilMs);
    if (v !== undefined && v > Date.now()) {
      next.mobSleepUntilMs = Math.floor(v);
      const sid = jsonFiniteNum(patch.mobSleepIconSkillId);
      next.mobSleepIconSkillId =
        sid !== undefined && sid > 0 ? Math.floor(sid) : 1069;
    } else {
      delete next.mobSleepUntilMs;
      delete next.mobSleepIconSkillId;
    }
  }
  if (patch.mobStunUntilMs !== undefined) {
    const v = jsonFiniteNum(patch.mobStunUntilMs);
    if (v !== undefined && v > Date.now()) {
      next.mobStunUntilMs = Math.floor(v);
      const sid = jsonFiniteNum(patch.mobStunIconSkillId);
      next.mobStunIconSkillId =
        sid !== undefined && sid > 0 ? Math.floor(sid) : 260;
    } else {
      delete next.mobStunUntilMs;
      delete next.mobStunIconSkillId;
    }
  }
  if (patch.playerStunUntilMs !== undefined) {
    const v = jsonFiniteNum(patch.playerStunUntilMs);
    if (v !== undefined && v > Date.now()) {
      next.playerStunUntilMs = Math.floor(v);
      const sid = jsonFiniteNum(patch.playerStunIconSkillId);
      next.playerStunIconSkillId =
        sid !== undefined && sid > 0 ? Math.floor(sid) : 260;
    } else {
      delete next.playerStunUntilMs;
      delete next.playerStunIconSkillId;
    }
  }
  if (patch.reflectDamageReturnRatio !== undefined) {
    const v = jsonFiniteNum(patch.reflectDamageReturnRatio);
    if (v !== undefined && v > 0) next.reflectDamageReturnRatio = v;
    else delete next.reflectDamageReturnRatio;
  }
  if (patch.raceToggleRanks !== undefined) {
    const p = patch.raceToggleRanks;
    if (
      p == null ||
      typeof p !== 'object' ||
      Array.isArray(p) ||
      Object.keys(p).length === 0
    ) {
      delete next.raceToggleRanks;
    } else {
      next.raceToggleRanks = { ...p };
    }
  }
  if (patch.physicalMirrorReflectRatio !== undefined) {
    const v = jsonFiniteNum(patch.physicalMirrorReflectRatio);
    if (v !== undefined && v > 0) next.physicalMirrorReflectRatio = v;
    else delete next.physicalMirrorReflectRatio;
  }
  if (patch.vengeanceIncomingPhysMul !== undefined) {
    const v = jsonFiniteNum(patch.vengeanceIncomingPhysMul);
    if (v !== undefined && v > 0 && v < 1) next.vengeanceIncomingPhysMul = v;
    else delete next.vengeanceIncomingPhysMul;
  }
  if (patch.vengeanceReflectRatio !== undefined) {
    const v = jsonFiniteNum(patch.vengeanceReflectRatio);
    if (v !== undefined && v > 0) next.vengeanceReflectRatio = v;
    else delete next.vengeanceReflectRatio;
  }
  if (patch.mysticPatkBuffMul !== undefined) {
    const v = jsonFiniteNum(patch.mysticPatkBuffMul);
    if (v !== undefined && v > 1) {
      next.mysticPatkBuffMul = v;
      const sid = jsonFiniteNum(patch.mysticPatkBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticPatkBuffIconSkillId = Math.floor(sid);
      }
    } else {
      delete next.mysticPatkBuffMul;
      delete next.mysticPatkBuffIconSkillId;
    }
  }
  if (patch.mysticMatkBuffMul !== undefined) {
    const v = jsonFiniteNum(patch.mysticMatkBuffMul);
    if (v !== undefined && v > 1) {
      next.mysticMatkBuffMul = v;
      const sid = jsonFiniteNum(patch.mysticMatkBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticMatkBuffIconSkillId = Math.floor(sid);
      }
    } else {
      delete next.mysticMatkBuffMul;
      delete next.mysticMatkBuffIconSkillId;
    }
  }
  if (patch.mysticCastSpdBuffMul !== undefined) {
    const v = jsonFiniteNum(patch.mysticCastSpdBuffMul);
    if (v !== undefined && v > 1) {
      next.mysticCastSpdBuffMul = v;
      const sid = jsonFiniteNum(patch.mysticCastSpdBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticCastSpdBuffIconSkillId = Math.floor(sid);
      }
    } else {
      delete next.mysticCastSpdBuffMul;
      delete next.mysticCastSpdBuffIconSkillId;
    }
  }
  if (patch.mysticPdefBuffMul !== undefined) {
    const v = jsonFiniteNum(patch.mysticPdefBuffMul);
    if (v !== undefined && v > 1) {
      next.mysticPdefBuffMul = v;
      const sid = jsonFiniteNum(patch.mysticPdefBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticPdefBuffIconSkillId = Math.floor(sid);
      }
    } else {
      delete next.mysticPdefBuffMul;
      delete next.mysticPdefBuffIconSkillId;
    }
  }
  if (patch.mysticMdefBuffMul !== undefined) {
    const v = jsonFiniteNum(patch.mysticMdefBuffMul);
    if (v !== undefined && v > 1) {
      next.mysticMdefBuffMul = v;
      const sid = jsonFiniteNum(patch.mysticMdefBuffIconSkillId);
      if (sid !== undefined && sid > 0) {
        next.mysticMdefBuffIconSkillId = Math.floor(sid);
      }
    } else {
      delete next.mysticMdefBuffMul;
      delete next.mysticMdefBuffIconSkillId;
    }
  }
  normalizeBattleModsNumsInPlace(next);
  migrateBattleModsStancesFromLegacy(next);
  applyRiposteReflectToBattleMods(next);
  const hasBuff = battleModsHasPersistableBuffs(next);
  return hasBuff ? next : undefined;
}
