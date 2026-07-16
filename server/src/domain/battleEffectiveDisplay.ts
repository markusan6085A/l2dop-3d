import { textRpgHfToggleStanceDelta } from '../data/textRpgHfToggleBattleApply.js';
import { focusAttackAccuracyFlat } from '../data/l2dopFocusAttack.js';
import type { BattleBattleMods } from './battleTypes.js';
import {
  jsonFiniteNum,
  jsonBoolLike,
  isStanceAccuracyActive,
  isStanceViciousActive,
  isStanceParryActive,
  isFocusAttackActive,
  normalizeBattleModsFromJson,
  migrateBattleModsStancesFromLegacy,
  stripExpiredZealotFromBattleMods,
} from './battleModsJson.js';
import {
  applyRiposteReflectToBattleMods,
  isRiposteStanceActive,
  RIPOSTE_ACCURACY_FLAT,
  RIPOSTE_ATK_SPD_MUL,
  RIPOSTE_RUN_SPEED_MUL,
} from './riposteStance.js';

/** Ефективний max HP гравця в бою з урахуванням Battle Roar. */
export function effectiveBattleMaxHp(
  baseMaxHp: number,
  mods: BattleBattleMods | undefined
): number {
  const m = jsonFiniteNum(mods?.battleRoarMaxHpMul);
  if (m !== undefined && m > 1) {
    return Math.max(1, Math.floor(baseMaxHp * m));
  }
  return Math.max(1, baseMaxHp);
}

/**
 * Множник War Cry з сирого `battleJson` (як у `parseBattleJson` у battleService):
 * спочатку `battleMods`, інакше корінь — щоб UI / snapshot бачили той самий бонус, що й кидок урону.
 */
export function readWarCryPatkMulFromBattleJson(raw: unknown): number | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }
  const o = raw as Record<string, unknown>;
  let wcNested: number | undefined;
  if (
    o.battleMods != null &&
    typeof o.battleMods === 'object' &&
    !Array.isArray(o.battleMods)
  ) {
    const bm = o.battleMods as Record<string, unknown>;
    wcNested = jsonFiniteNum(
      bm.warCryPatkMul ??
        (bm as { war_cry_patk_mul?: unknown }).war_cry_patk_mul
    );
  }
  const wcRoot = jsonFiniteNum(o.warCryPatkMul ?? o.war_cry_patk_mul);
  if (wcNested !== undefined && wcNested > 1) return wcNested;
  if (wcRoot !== undefined && wcRoot > 1) return wcRoot;
  return undefined;
}

/** War Cry з уже розпарсених `battleMods` (світ поза боєм — `worldCombatStateJson`). */
export function readWarCryPatkMulFromBattleMods(
  mods: BattleBattleMods | undefined
): number | undefined {
  if (!mods) return undefined;
  const w = jsonFiniteNum(mods.warCryPatkMul);
  return w !== undefined && w > 1 ? w : undefined;
}

/**
 * Активні `battleMods` для UI: у бою — лише з `battleJson`; інакше — з `worldCombatStateJson`.
 * Не змішуємо світ і бій, щоб після `startBattle` не тягнути застарілий world.
 */
export function resolveDisplayBattleMods(
  rawBattleJson: unknown,
  worldBattleMods: BattleBattleMods | undefined
): BattleBattleMods | undefined {
  if (rawBattleJson != null && typeof rawBattleJson === 'object' && !Array.isArray(rawBattleJson)) {
    const o = rawBattleJson as Record<string, unknown>;
    if (typeof o.spawnId === 'string' && o.spawnId) {
      const bm = o.battleMods;
      if (bm != null && typeof bm === 'object' && !Array.isArray(bm)) {
        const m: BattleBattleMods = { ...(bm as BattleBattleMods) };
        normalizeBattleModsFromJson(m);
        migrateBattleModsStancesFromLegacy(m);
        stripExpiredZealotFromBattleMods(m, Date.now());
        applyRiposteReflectToBattleMods(m);
        return m;
      }
      /** У бою `battleMods` інколи відсутній у JSON — тоді стійки/Focus з `worldCombatStateJson`. */
      if (worldBattleMods) {
        const m: BattleBattleMods = { ...worldBattleMods };
        normalizeBattleModsFromJson(m);
        migrateBattleModsStancesFromLegacy(m);
        stripExpiredZealotFromBattleMods(m, Date.now());
        applyRiposteReflectToBattleMods(m);
        return m;
      }
      return undefined;
    }
  }
  if (worldBattleMods) {
    const m: BattleBattleMods = { ...worldBattleMods };
    normalizeBattleModsFromJson(m);
    migrateBattleModsStancesFromLegacy(m);
    stripExpiredZealotFromBattleMods(m, Date.now());
    applyRiposteReflectToBattleMods(m);
    return m;
  }
  return undefined;
}

/**
 * Множник фіз. атаки від стійок (як у `rollPlayerPhysicalDmg`).
 * Стійка точності (256): з text-rpg, якщо є `buffPatk` у дельті.
 */
export function stancePhysicalPatkMultiplier(
  mods: BattleBattleMods | undefined,
  /** Ранг l2_256 для формул text-rpg. */
  accuracyStanceSkillRank: number = 1
): number {
  if (!isStanceAccuracyActive(mods)) return 1;
  const d = textRpgHfToggleStanceDelta(256, Math.max(1, accuracyStanceSkillRank));
  const m = d?.buffPatk;
  return m != null && m > 0 && Number.isFinite(m) ? m : 1;
}

/** P.Atk для панелі статів: War Cry + стійки (узгоджено з `rollPlayerPhysicalDmg`). */
export function effectiveBattlePatkDisplay(
  basePatk: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods,
  /** Ранг l2_256 (стійка точності), text-rpg. */
  accuracyStanceSkillRank?: number
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  const wc =
    readWarCryPatkMulFromBattleMods(mods) ??
    readWarCryPatkMulFromBattleJson(rawBattleJson);
  const wcEff = wc !== undefined && wc > 1 ? wc : 1;
  const tfRaw = jsonFiniteNum(mods?.thrillFightPatkMul);
  const tfMul = tfRaw !== undefined && tfRaw > 1 ? tfRaw : 1;
  const rgRaw = jsonFiniteNum(mods?.rageBattlePatkMul);
  const rgMul = rgRaw !== undefined && rgRaw > 1 ? rgRaw : 1;
  const fzRaw = jsonFiniteNum(mods?.frenzyBattlePatkMul);
  const fzMul = fzRaw !== undefined && fzRaw > 1 ? fzRaw : 1;
  const stanceM = stancePhysicalPatkMultiplier(mods, accuracyStanceSkillRank);
  const sn = jsonFiniteNum(mods?.snipePatkFlat);
  const snFlat = sn !== undefined && sn > 0 ? Math.floor(sn) : 0;
  const mys = jsonFiniteNum(mods?.mysticPatkBuffMul);
  const mysMul = mys !== undefined && mys > 1 ? mys : 1;
  /**
   * ВАЖЛИВО: soulshot-множник не показуємо у статах.
   * Соски мають впливати лише на фактичний кидок урону (`rollPlayerPhysicalDmg`),
   * а не на відображуваний P.Atk у профілі/HUD.
   */
  /** Як у `rollPlayerPhysicalDmg` (без soulshot у display): WC → Thrill → Rage → Frenzy → баф мага → стійка; далі +Snipe. Zealot — лише ASPD/біг/точн./крит, не P.Atk. */
  let atkEff = Math.max(
    1,
    Math.floor(basePatk * wcEff * tfMul * rgMul * fzMul * mysMul * stanceM)
  );
  atkEff = Math.max(1, atkEff + snFlat);
  return atkEff;
}

/** M.Atk для панелі: бафи мага (Acumen тощо) через `mysticMatkBuffMul`. */
export function effectiveBattleMatkDisplay(
  baseMatk: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  const mm = jsonFiniteNum(mods?.mysticMatkBuffMul);
  const mul = mm !== undefined && mm > 1 ? mm : 1;
  /**
   * ВАЖЛИВО: blessed spiritshot-множник не показуємо у статах.
   * Він застосовується лише в бойовому розрахунку маг-урону, не в HUD M.Atk.
   */
  return Math.max(1, Math.floor(baseMatk * mul));
}

/**
 * Точність для панелі статів: стійка точності (256), далі парування (339): flat accuracy з text-rpg.
 */
export function effectiveBattleAccuracyDisplay(
  baseAccuracy: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods,
  /** Ранг l2_256 (стійка точності). */
  accuracyStanceSkillRank?: number,
  /** Ранг l2_339 (стійка парування). */
  parryStanceSkillRank: number = 1,
  /** Ранг l2_317 (Focus Attack). */
  focusAttackSkillRank: number = 1
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  let acc = baseAccuracy;
  if (isStanceAccuracyActive(mods)) {
    const d = textRpgHfToggleStanceDelta(
      256,
      Math.max(1, accuracyStanceSkillRank ?? 1)
    );
    if (d?.buffAcc != null && Number.isFinite(d.buffAcc)) {
      acc = Math.max(0, Math.floor(acc + d.buffAcc));
    }
  }
  if (isStanceParryActive(mods)) {
    const d = textRpgHfToggleStanceDelta(
      339,
      Math.max(1, parryStanceSkillRank)
    );
    if (d?.buffAcc != null && Number.isFinite(d.buffAcc)) {
      acc = Math.max(0, Math.floor(acc + d.buffAcc));
    }
  }
  const snA = jsonFiniteNum(mods?.snipeAccuracyFlat);
  if (snA !== undefined && snA > 0) {
    acc = Math.max(0, Math.floor(acc + snA));
  }
  const zAcc = jsonFiniteNum(mods?.zealotAccuracyFlat);
  if (zAcc !== undefined && zAcc > 0) {
    acc = Math.max(0, Math.floor(acc + zAcc));
  }
  const fzAcc = jsonFiniteNum(mods?.frenzyBattleAccFlat);
  if (fzAcc !== undefined && fzAcc > 0) {
    acc = Math.max(0, Math.floor(acc + fzAcc));
  }
  if (isRiposteStanceActive(mods)) {
    acc = Math.max(0, Math.floor(acc + RIPOSTE_ACCURACY_FLAT));
  }
  if (isFocusAttackActive(mods)) {
    acc = Math.max(
      0,
      Math.floor(acc + focusAttackAccuracyFlat(focusAttackSkillRank))
    );
  }
  return acc;
}

/**
 * Швидкість фіз. атаки для панелі: стійка парування (339) — множник atkSpeed % з text-rpg.
 */
export function effectiveBattlePAtkSpdDisplay(
  basePAtkSpd: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods,
  parryStanceSkillRank: number = 1,
  /** Лук: інакше Rapid Shot не застосовується до панелі (як у L2). */
  weaponKind?: string
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  let spd = basePAtkSpd;
  if (isStanceParryActive(mods)) {
    const d = textRpgHfToggleStanceDelta(
      339,
      Math.max(1, parryStanceSkillRank)
    );
    const m = d?.buffAspd;
    if (m != null && m > 0 && Number.isFinite(m)) {
      spd = Math.max(1, Math.floor(spd * m));
    }
  }
  const rs = jsonFiniteNum(mods?.rapidShotAspdMul);
  if (
    weaponKind === 'bow' &&
    rs !== undefined &&
    rs > 1 &&
    Number.isFinite(rs)
  ) {
    spd = Math.max(1, Math.floor(spd * rs));
  }
  const zAspd = jsonFiniteNum(mods?.zealotAspdMul);
  if (zAspd !== undefined && zAspd > 1 && Number.isFinite(zAspd)) {
    spd = Math.max(1, Math.floor(spd * zAspd));
  }
  if (isRiposteStanceActive(mods)) {
    spd = Math.max(1, Math.floor(spd * RIPOSTE_ATK_SPD_MUL));
  }
  return spd;
}

/**
 * Швидкість бігу для панелі статів: Ривок (4) — плоский бонус до внутрішньої швидкості (як `addSpeed` у calc_stats).
 * `runSpeed = floor(floor(S)*2)` → T = floor(S) = runSpeed/2; з Dash: `floor(2*(T + dashFlat))`.
 */
export function effectiveBattleRunSpeedDisplay(
  baseRunSpeed: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  const T = Math.floor(baseRunSpeed / 2);
  const dashD = jsonFiniteNum(mods?.dashRunSpeedFlat);
  const dashAdd = dashD !== undefined && dashD > 0 ? Math.floor(dashD) : 0;
  const smAdd =
    jsonBoolLike(mods?.silentMoveActive) &&
    jsonFiniteNum(mods?.silentMoveRunFlat) !== undefined &&
    (jsonFiniteNum(mods?.silentMoveRunFlat) ?? 0) > 0
      ? Math.floor(jsonFiniteNum(mods?.silentMoveRunFlat)!)
      : 0;
  const zRun = jsonFiniteNum(mods?.zealotRunSpeedFlat);
  const zealRunAdd =
    zRun !== undefined && zRun > 0 ? Math.floor(zRun) : 0;
  let runMul = 1;
  if (isRiposteStanceActive(mods)) {
    runMul = RIPOSTE_RUN_SPEED_MUL;
  }
  if (dashAdd === 0 && smAdd === 0 && zealRunAdd === 0 && runMul === 1) {
    return baseRunSpeed;
  }
  return Math.max(1, Math.floor(2 * (T + dashAdd + smAdd + zealRunAdd) * runMul));
}

/** Крит. шанс (стат) для панелі: жорстка стійка — text-rpg (Focus без окремого stat у даних). */
export function effectiveBattleCritRateDisplay(
  baseCritRate: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods,
  /** Ранг l2_312 для дельти text-rpg. */
  viciousStanceSkillRank?: number
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  let cr = baseCritRate;
  if (isStanceViciousActive(mods)) {
    const d = textRpgHfToggleStanceDelta(
      312,
      Math.max(1, viciousStanceSkillRank ?? 1)
    );
    if (d?.addCrit != null && Number.isFinite(d.addCrit)) {
      cr = Math.min(500, Math.floor(cr + d.addCrit));
    }
  }
  const snC = jsonFiniteNum(mods?.snipeCritRateAdd);
  if (snC !== undefined && snC > 0) {
    cr = Math.min(500, Math.floor(cr + snC));
  }
  const zCr = jsonFiniteNum(mods?.zealotCritRateAdd);
  if (zCr !== undefined && zCr > 0) {
    cr = Math.min(500, Math.floor(cr + zCr));
  }
  return cr;
}

/** Ухилення для панелі: безшумний рух, абсолютне ухилення. */
export function effectiveBattleEvasionDisplay(
  baseEvasion: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  let ev = baseEvasion;
  if (jsonBoolLike(mods?.silentMoveActive)) {
    const sm = jsonFiniteNum(mods?.silentMoveEvasionFlat);
    if (sm !== undefined && sm > 0) ev = Math.max(0, Math.floor(ev + sm));
  }
  if (jsonBoolLike(mods?.ultimateEvasionActive)) {
    const ue = jsonFiniteNum(mods?.ultimateEvasionEvasionFlat);
    if (ue !== undefined && ue > 0) ev = Math.max(0, Math.floor(ev + ue));
  }
  return ev;
}

/**
 * Множники P.Def / M.Def від стійки парування (339) — `textRpgHfToggleEffects`, без хардкоду з PHP.
 */
export function stanceParryDefMultipliersFromTextRpg(
  mods: BattleBattleMods | undefined,
  /** Ранг l2_339 (у Interlude зазвичай 1). */
  parrySkillRank: number = 1
): { pDefMul: number; mDefMul: number } {
  if (!isStanceParryActive(mods)) {
    return { pDefMul: 1, mDefMul: 1 };
  }
  const d = textRpgHfToggleStanceDelta(339, Math.max(1, parrySkillRank));
  const pDefMul =
    d?.buffPdef != null && d.buffPdef > 0 && Number.isFinite(d.buffPdef)
      ? d.buffPdef
      : 1;
  const mDefMul =
    d?.buffMdef != null && d.buffMdef > 0 && Number.isFinite(d.buffMdef)
      ? d.buffMdef
      : 1;
  return { pDefMul, mDefMul };
}

/** P.Def для панелі: стійка парування — множники з text-rpg (узгоджено з `rollMobPhysicalVsPlayer`). */
export function effectiveBattlePDefDisplay(
  basePDef: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods,
  parrySkillRank: number = 1
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  const { pDefMul } = stanceParryDefMultipliersFromTextRpg(mods, parrySkillRank);
  let m = pDefMul;
  if (jsonBoolLike(mods?.aegisStanceActive)) {
    const ae = jsonFiniteNum(mods?.aegisPDefMul);
    if (ae !== undefined && ae > 0) m *= ae;
  }
  const mpb = jsonFiniteNum(mods?.mysticPdefBuffMul);
  if (mpb !== undefined && mpb > 1) m *= mpb;
  const rpd = jsonFiniteNum(mods?.rageBattlePdefMul);
  if (rpd !== undefined && rpd > 0 && rpd < 1) m *= rpd;
  const gpd = jsonFiniteNum(mods?.gutsBattlePdefMul);
  if (gpd !== undefined && gpd > 1) m *= gpd;
  if (m !== 1) {
    return Math.max(1, Math.floor(basePDef * m));
  }
  return basePDef;
}

/** M.Def для панелі: стійка парування — ті самі множники, що й для P.Def (339). */
export function effectiveBattleMDefDisplay(
  baseMDef: number,
  rawBattleJson: unknown,
  worldBattleMods?: BattleBattleMods,
  parrySkillRank: number = 1
): number {
  const mods = resolveDisplayBattleMods(rawBattleJson, worldBattleMods);
  const { mDefMul } = stanceParryDefMultipliersFromTextRpg(mods, parrySkillRank);
  let m = mDefMul;
  if (jsonBoolLike(mods?.aegisStanceActive)) {
    const ae = jsonFiniteNum(mods?.aegisMDefMul);
    if (ae !== undefined && ae > 0) m *= ae;
  }
  const mmb = jsonFiniteNum(mods?.mysticMdefBuffMul);
  if (mmb !== undefined && mmb > 1) m *= mmb;
  if (m !== 1) {
    return Math.max(1, Math.floor(baseMDef * m));
  }
  return baseMDef;
}
