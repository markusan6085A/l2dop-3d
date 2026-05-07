/**
 * Обчислення модифікаторів `computeCombatStats` від активних toggle-стійок
 * не-HF Fighter і всіх Mystic. Джерело істини, які toggle зараз увімкнено —
 * `worldCombatStateJson.battleMods.raceToggleRanks` (мапа `l2_<id>` → ранг).
 *
 * Чому окремо від `learnedPassivesBuffDelta` / `learnedMysticPassivesBuffDelta`:
 * пасиви активні з моменту вивчення; toggle-стійки — лише поки гравець їх
 * увімкнув і поки тікає MP. Тож вивчений скіл має бути в каталозі (kind:
 * 'toggle'), але дельта застосовується тільки якщо він присутній у
 * `raceToggleRanks`.
 *
 * Ефекти беремо з тієї ж форми `effects[]`, що і пасиви; формула — спільний
 * `deltaFromEffect`, скопійований з `l2dopLearnedRaceFighterPassives`. Так
 * уникаємо круга залежностей між generated-каталогами і ручною логікою бою.
 */
import {
  applyBuffDelta,
  neutralCombatBuffs,
  partialCombatBuffDeltaFromNeutral,
  type L2dopCombatBuffModifiers,
} from './l2dopCombatBuffModifiers.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { fighterCatalogEntryForRace } from './fighterSkillCatalog.byRace.js';
import { maxRaceFighterSkillRankForBattleId } from './fighterSkillCatalog.byRace.js';
import { mysticCatalogEntryForRace } from './mysticSkillCatalog.byRace.js';
import { maxMysticSkillRankForBattleId } from './humanMysticSkillCatalog.learnedRanks.js';
import type { BattleBattleMods } from '../domain/battleTypes.js';
import { l2dopXmlSkillRow } from './l2dopXmlSkillLevels.lookup.js';

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
  }
  return null;
}

interface CatalogLike {
  readonly l2SkillId: number;
  readonly kind: string;
  readonly visibleForProfessions: ReadonlyArray<string>;
  readonly levels: ReadonlyArray<{ readonly power: number }>;
  readonly effects: ReadonlyArray<{
    readonly stat: string;
    readonly mode: string;
    readonly value?: number;
  }>;
}

function lookupToggleEntry(
  battleId: string,
  race: string,
  classBranch: string
): CatalogLike | undefined {
  const bid = canonicalBattleSkillId(battleId);
  const fr = fighterCatalogEntryForRace(race, classBranch, bid);
  if (fr && fr.kind === 'toggle') return fr;
  const my = mysticCatalogEntryForRace(race, bid);
  if (my && my.kind === 'toggle') return my;
  return undefined;
}

function maxRankForToggle(
  battleId: string,
  race: string,
  classBranch: string
): number {
  const bid = canonicalBattleSkillId(battleId);
  const fr = fighterCatalogEntryForRace(race, classBranch, bid);
  if (fr) return maxRaceFighterSkillRankForBattleId(race, classBranch, bid);
  return maxMysticSkillRankForBattleId(bid, race);
}

/**
 * Дельта стат від усіх toggle-стійок, що зараз увімкнено в `mods.raceToggleRanks`.
 * HF-стійки 256 / 312 / 364 ігноруються — вони мають окремий шлях через
 * `effectiveBattle*Display` + `textRpgHfToggleStanceDelta`.
 */
export function raceFighterToggleStanceCombatDelta(
  mods: BattleBattleMods | undefined,
  l2Profession: string,
  race: string,
  classBranch: string
): Partial<L2dopCombatBuffModifiers> {
  const ranks = mods?.raceToggleRanks;
  if (!ranks || typeof ranks !== 'object') return {};
  const prof = String(l2Profession || '').trim();
  let acc = neutralCombatBuffs();

  for (const [rawId, rawRank] of Object.entries(ranks)) {
    const rank = Math.floor(Number(rawRank));
    if (!Number.isFinite(rank) || rank < 1) continue;
    const cat = lookupToggleEntry(rawId, race, classBranch);
    if (!cat) continue;
    if (prof && !cat.visibleForProfessions.includes(prof)) continue;
    const maxR = maxRankForToggle(rawId, race, classBranch);
    const r = Math.max(1, Math.min(maxR, rank));
    const row = cat.levels[r - 1];
    if (!row) continue;
    const xmlRow = l2dopXmlSkillRow(cat.l2SkillId, r);
    const xmlRatioR =
      typeof xmlRow?.r === 'number' && Number.isFinite(xmlRow.r)
        ? xmlRow.r
        : undefined;
    for (const fx of cat.effects) {
      const d = deltaFromEffect(fx.stat, fx.mode, row.power, fx.value, xmlRatioR);
      if (d) acc = applyBuffDelta(acc, d);
    }
  }

  return partialCombatBuffDeltaFromNeutral(acc);
}

/** Чи вмикається toggle у `raceToggleRanks` (а не HF stance / not-toggle/passive)? */
export function isRaceToggleEligible(
  battleId: string,
  race: string,
  classBranch: string
): { l2SkillId: number; maxRank: number } | null {
  const bid = canonicalBattleSkillId(battleId);
  const cat = lookupToggleEntry(bid, race, classBranch);
  if (!cat) return null;
  return {
    l2SkillId: cat.l2SkillId,
    maxRank: maxRankForToggle(bid, race, classBranch),
  };
}
