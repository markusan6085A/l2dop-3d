import {
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  isFocusAttackActive,
  stanceParryDefMultipliersFromTextRpg,
  jsonFiniteNum,
  jsonBoolLike,
  getWeaknessDetectMap,
  type BattleBattleMods,
  type BattleJsonState,
} from '../domain/battle.js';
import {
  formatWeaknessBattleLogUk,
  weaknessMatchesKind,
  type WeaknessKind,
} from '../domain/mobWeaknessFamily.js';
import {
  mobAccuracyFromSpawnLevel,
  mobEvasionFromSpawnLevel,
  resolvePhysicalHit,
} from '../data/l2dopHitResolution.js';
import { computeCombatStats } from '../data/l2dopCombatFormulas.js';
import {
  focusAttackCritDmgMultiplier,
  focusAttackRankFromLearnedMap,
  viciousStanceRankFromLearnedMap,
} from '../data/l2dopFocusAttack.js';
import { textRpgHfToggleStanceDelta } from '../data/textRpgHfToggleBattleApply.js';

/**
 * Анти-оверкіл для ранніх рівнів: synthetic `mobPAtk` з карти проходить через
 * м'який скейл перед формулою `l2dopPhysicalBaseDamage`.
 *
 * Чому так:
 * - у нас `mobPAtk` показується компактним числом у картці моба;
 * - базова формула фіз. урону має великий коефіцієнт (70 * atk / def);
 * - на низькому pDef це давало піки на кшталт 200+ від low-lvl мобів.
 */
function mobOutgoingPatkScaleByLevel(spawnLevel: number): number {
  const lvl = Math.max(1, Math.floor(spawnLevel));
  /**
   * Ранній контент (1..20): суттєво м'якше.
   * Середній/пізній: поступово повертаємо коефіцієнт, щоб high-lvl контент
   * не став "ватним".
   */
  return Math.max(0.12, Math.min(0.52, 0.1 + lvl * 0.0045));
}

export function mobEvasionForBattle(
  st: BattleJsonState,
  spawnLevel: number
): number {
  if (typeof st.mobEvasion === 'number' && Number.isFinite(st.mobEvasion)) {
    return Math.max(0, Math.floor(st.mobEvasion));
  }
  return mobEvasionFromSpawnLevel(spawnLevel);
}

export function rollPlayerPhysicalDmg(
  atk: number,
  combat: ReturnType<typeof computeCombatStats>,
  st: BattleJsonState,
  spawnLevel: number,
  spawnMobName: string,
  learnedSkillLevelByBattleId?: Record<string, number>,
  /** Як у `toSnapshot` / `resolveDisplayBattleMods` — інакше втрачаються моди з `worldCombatStateJson`. */
  effectiveBattleMods?: BattleBattleMods,
  options?: { forceNoMiss?: boolean }
): {
  damage: number;
  outcome: 'miss' | 'hit' | 'crit';
  weaknessLogLineUk?: string;
} {
  const mobEva = mobEvasionForBattle(st, spawnLevel);
  const mods = effectiveBattleMods ?? st.battleMods;
  const wcRaw = jsonFiniteNum(mods?.warCryPatkMul ?? st.warCryPatkMul);
  const wc = wcRaw !== undefined && wcRaw > 1 ? wcRaw : 1;
  let weakMul = 1;
  let weaknessLogLineUk: string | undefined;
  const wd = getWeaknessDetectMap(mods);
  let bestMul = 1;
  const matchingKinds: WeaknessKind[] = [];
  for (const kindStr of Object.keys(wd)) {
    const wk = kindStr as WeaknessKind;
    const wpm = wd[wk];
    if (wpm === undefined || wpm <= 1) continue;
    if (!weaknessMatchesKind(wk, spawnMobName)) continue;
    if (wpm > bestMul) {
      bestMul = wpm;
      matchingKinds.length = 0;
      matchingKinds.push(wk);
    } else if (wpm === bestMul) {
      matchingKinds.push(wk);
    }
  }
  if (bestMul > 1) {
    weakMul = bestMul;
    const forLog = matchingKinds.find((k) => k !== 'monster');
    if (forLog != null) {
      weaknessLogLineUk = formatWeaknessBattleLogUk(forLog, bestMul);
    }
  }
  const tfRaw = jsonFiniteNum(mods?.thrillFightPatkMul);
  const thrill = tfRaw !== undefined && tfRaw > 1 ? tfRaw : 1;
  const rgRaw = jsonFiniteNum(mods?.rageBattlePatkMul);
  const rageAtk = rgRaw !== undefined && rgRaw > 1 ? rgRaw : 1;
  const fzRaw = jsonFiniteNum(mods?.frenzyBattlePatkMul);
  const frenzyAtk = fzRaw !== undefined && fzRaw > 1 ? fzRaw : 1;
  const mysPatk = jsonFiniteNum(mods?.mysticPatkBuffMul);
  const mysPatkMul = mysPatk !== undefined && mysPatk > 1 ? mysPatk : 1;
  const ssPatk = jsonFiniteNum(mods?.fighterSoulshotPatkMul);
  const ssPatkMul = ssPatk !== undefined && ssPatk > 1 ? ssPatk : 1;
  let atkEff = Math.max(
    1,
    Math.floor(atk * wc * weakMul * thrill * rageAtk * frenzyAtk * mysPatkMul * ssPatkMul)
  );
  let acc = combat.accuracy;
  let critRate = combat.critRate;
  let critDmgMul = combat.critDmgMul;
  let addCritDmg = combat.addCritDmg;
  /** Стійки (toggle): text-rpg (256 точність/P.Atk; 339 точність/швидкість атаки; 312 крит). */
  let stanceAtkMul = 1;
  if (isStanceAccuracyActive(mods)) {
    const ar = Math.max(
      1,
      Math.floor(learnedSkillLevelByBattleId?.['l2_256'] ?? 1)
    );
    const d256 = textRpgHfToggleStanceDelta(256, ar);
    if (d256?.buffAcc != null && Number.isFinite(d256.buffAcc)) {
      acc = Math.max(0, Math.floor(acc + d256.buffAcc));
    }
    if (
      d256?.buffPatk != null &&
      d256.buffPatk > 0 &&
      Number.isFinite(d256.buffPatk)
    ) {
      stanceAtkMul *= d256.buffPatk;
    }
  }
  if (isStanceParryActive(mods)) {
    const pr = Math.max(
      1,
      Math.floor(learnedSkillLevelByBattleId?.['l2_339'] ?? 1)
    );
    const d339 = textRpgHfToggleStanceDelta(339, pr);
    if (d339?.buffAcc != null && Number.isFinite(d339.buffAcc)) {
      acc = Math.max(0, Math.floor(acc + d339.buffAcc));
    }
  }
  atkEff = Math.max(1, Math.floor(atkEff * stanceAtkMul));
  if (isFocusAttackActive(mods)) {
    const fr = focusAttackRankFromLearnedMap(learnedSkillLevelByBattleId);
    critDmgMul *= focusAttackCritDmgMultiplier(fr);
  }
  if (isStanceViciousActive(mods)) {
    const rk = viciousStanceRankFromLearnedMap(learnedSkillLevelByBattleId);
    const d312 = textRpgHfToggleStanceDelta(312, rk);
    if (d312?.addCritDmg) addCritDmg += d312.addCritDmg;
    if (d312?.addCrit) {
      critRate = Math.min(500, Math.floor(critRate + d312.addCrit));
    }
    if (
      d312?.critDmgMul != null &&
      d312.critDmgMul > 0 &&
      Number.isFinite(d312.critDmgMul)
    ) {
      critDmgMul *= d312.critDmgMul;
    }
  }
  const snP = jsonFiniteNum(mods?.snipePatkFlat);
  if (snP !== undefined && snP > 0) {
    atkEff = Math.max(1, atkEff + Math.floor(snP));
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
  const snC = jsonFiniteNum(mods?.snipeCritRateAdd);
  if (snC !== undefined && snC > 0) {
    critRate = Math.min(500, Math.floor(critRate + snC));
  }
  const fpmOut = jsonFiniteNum(mods?.focusPowerPatkMul);
  if (fpmOut !== undefined && fpmOut > 1) {
    atkEff = Math.max(1, Math.floor(atkEff * fpmOut));
  }
  const fccOut = jsonFiniteNum(mods?.focusChanceCritRateAdd);
  if (fccOut !== undefined && fccOut > 0) {
    critRate = Math.min(500, Math.floor(critRate + fccOut));
  }
  const blfOut = jsonFiniteNum(mods?.bluffCritDmgMul);
  if (blfOut !== undefined && blfOut > 1) {
    critDmgMul *= blfOut;
  }
  const zealCr = jsonFiniteNum(mods?.zealotCritRateAdd);
  if (zealCr !== undefined && zealCr > 0) {
    critRate = Math.min(500, Math.floor(critRate + zealCr));
  }
  const zealCd = jsonFiniteNum(mods?.zealotCritDmgMul);
  if (zealCd !== undefined && zealCd > 1) {
    critDmgMul *= zealCd;
  }
  let mobPDefEff = st.mobPDef;
  const mtdPlayer = jsonFiniteNum(mods?.mobTargetPDefMul);
  if (mtdPlayer !== undefined && mtdPlayer > 0 && mtdPlayer < 1) {
    mobPDefEff = Math.max(1, Math.floor(mobPDefEff * mtdPlayer));
  }
  const hit = resolvePhysicalHit({
    attackerAtk: atkEff,
    targetPDef: mobPDefEff,
    attackerAccuracy: acc,
    targetEvasion: mobEva,
    critRateStat: critRate,
    critDmgMul: critDmgMul,
    addCritDmg,
    allowCrit: true,
    allowMiss: options?.forceNoMiss !== true,
  });
  return weaknessLogLineUk
    ? { ...hit, weaknessLogLineUk }
    : hit;
}

export function rollMobPhysicalVsPlayer(
  mobPAtk: number,
  spawnLevel: number,
  combat: ReturnType<typeof computeCombatStats>,
  st: BattleJsonState,
  effectiveBattleMods?: BattleBattleMods,
  options?: { worldBossMode?: boolean }
): { damage: number; outcome: 'miss' | 'hit' | 'crit' } {
  const mods = effectiveBattleMods ?? st.battleMods;
  const worldBossMode = options?.worldBossMode === true;
  if (jsonBoolLike(mods?.fakeDeathActive) && Math.random() < 0.42) {
    return { damage: 0, outcome: 'miss' };
  }
  const mobAcc = mobAccuracyFromSpawnLevel(spawnLevel);
  const L = Math.max(1, Math.floor(spawnLevel));
  const mobCritStat = Math.min(500, 12 + L * 5);
  const { pDefMul } = stanceParryDefMultipliersFromTextRpg(mods);
  let pDefMulEff = pDefMul;
  if (jsonBoolLike(mods?.aegisStanceActive)) {
    const ae = jsonFiniteNum(mods?.aegisPDefMul);
    if (ae !== undefined && ae > 0) pDefMulEff *= ae;
  }
  const shf = jsonFiniteNum(mods?.shieldFortressPDefMul);
  if (shf !== undefined && shf > 1) pDefMulEff *= shf;
  const mysPdef = jsonFiniteNum(mods?.mysticPdefBuffMul);
  if (mysPdef !== undefined && mysPdef > 1) pDefMulEff *= mysPdef;
  const ragePdef = jsonFiniteNum(mods?.rageBattlePdefMul);
  if (ragePdef !== undefined && ragePdef > 0 && ragePdef < 1) {
    pDefMulEff *= ragePdef;
  }
  const gutsPdef = jsonFiniteNum(mods?.gutsBattlePdefMul);
  if (gutsPdef !== undefined && gutsPdef > 1) {
    pDefMulEff *= gutsPdef;
  }
  const pDefEff = Math.max(1, Math.floor(combat.pDef * pDefMulEff));
  const deb = mods?.mobPatkDebuffMul;
  let atk = worldBossMode
    ? Math.max(1, Math.floor(mobPAtk))
    : Math.max(
        1,
        Math.floor(mobPAtk * mobOutgoingPatkScaleByLevel(spawnLevel))
      );
  if (typeof deb === 'number' && deb > 0 && deb < 1 && Number.isFinite(deb)) {
    atk = Math.max(1, Math.floor(atk * deb));
  }
  let eva = combat.evasion;
  if (jsonBoolLike(mods?.silentMoveActive)) {
    const sm = jsonFiniteNum(mods?.silentMoveEvasionFlat);
    if (sm !== undefined && sm > 0) eva = Math.max(0, Math.floor(eva + sm));
  }
  if (jsonBoolLike(mods?.ultimateEvasionActive)) {
    const ue = jsonFiniteNum(mods?.ultimateEvasionEvasionFlat);
    if (ue !== undefined && ue > 0) eva = Math.max(0, Math.floor(eva + ue));
  }
  const r = resolvePhysicalHit({
    attackerAtk: atk,
    targetPDef: pDefEff,
    attackerAccuracy: mobAcc,
    targetEvasion: eva,
    critRateStat: mobCritStat,
    critDmgMul: 1,
    addCritDmg: 0,
    allowCrit: true,
    damageMode: worldBossMode ? 'worldBoss' : 'standard',
  });
  let dmg = r.damage;
  const sanIn = jsonFiniteNum(mods?.sanctuaryIncomingPhysMul);
  const venIn = jsonFiniteNum(mods?.vengeanceIncomingPhysMul);
  if (sanIn !== undefined && sanIn > 0 && sanIn < 1) {
    dmg = Math.max(0, Math.floor(dmg * sanIn));
  }
  if (venIn !== undefined && venIn > 0 && venIn < 1) {
    dmg = Math.max(0, Math.floor(dmg * venIn));
  }
  const lion = st.battleMods?.lionheartIncomingPhysMul;
  if (
    typeof lion === 'number' &&
    lion > 0 &&
    lion < 1 &&
    Number.isFinite(lion)
  ) {
    return {
      ...r,
      damage: Math.max(1, Math.floor(dmg * lion)),
    };
  }
  return { ...r, damage: Math.max(0, dmg) };
}
