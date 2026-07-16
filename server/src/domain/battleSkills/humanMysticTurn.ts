/**
 * Бій людини-мага: касти `l2_<id>` з каталогу Human Mystic.
 */
import { resolveMagicBoltHit } from '../../data/l2dopHitResolution.js';
import { jsonFiniteNum } from '../battle.js';
import {
  effectiveMobDebuffResistPct,
  effectiveMobStunResistPct,
  type MobSpawnControlResistInput,
} from '../controlLandResist.js';
import type {
  BattleBattleMods,
  BattleJsonState,
} from '../battle.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  MagicBoltRollFn,
  PhysicalRollFn,
} from './types.js';
import { resolveLegacyMeleeTurn } from './legacyMeleeTurn.js';
import { mysticCatalogEntryVisibleForProfession } from '../../data/humanMysticSkillCatalog.js';
import { mysticCatalogEntryForRace } from '../../data/mysticSkillCatalog.byRace.js';
import { MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS } from '../../data/mysticBlessedSpiritshot.js';
import { canonicalBattleSkillId } from '../../data/humanFighterSkillCatalog.legacyIds.js';
import type { HumanMysticSkillCatalogEntry } from '../../data/humanMysticSkillCatalog.types.js';
import { l2dopXmlSkillRow } from '../../data/l2dopXmlSkillLevels.lookup.js';
import { buffDurationSecForSkillId } from '../../data/l2dopBuffDurations.js';
import {
  mysticDebuffLandProfileForSkillId,
  type MysticDebuffControlKind,
} from '../../data/l2dopMysticDebuffProfiles.js';
import { mysticDebuffSpotChanceMultiplier } from '../../data/l2dopMysticDebuffSpotTuning.js';
import { resolveBattleSkillCooldownSec } from '../../data/skillCooldownScaling.js';
import {
  effectiveCastSpdForCooldown,
} from './humanFighterTurnHelpers.js';
import { cooldownSecForSkillId } from '../../data/skillCooldowns.js';
import {
  MYSTIC_SELF_HEAL_L2_SKILL_ID,
  MYSTIC_SELF_HEAL_POWER,
  MYSTIC_BATTLE_HEAL_L2_SKILL_ID,
  MYSTIC_GROUP_HEAL_L2_SKILL_ID,
} from '../../data/l2dopHumanMysticBattleSkills.js';
import {
  battleHealPowerAtRank,
  isBattleHealStarterRank,
} from '../../data/battleHealTables.js';
import { groupHealPowerAtRank } from '../../data/groupHealTables.js';
import {
  iceBoltPowerAtRank,
  iceBoltSlowDurationMs,
  isIceBoltCatalogSkill,
  ICE_BOLT_RUN_SPEED_MUL,
} from '../../data/iceBoltTables.js';
import {
  curseWeaknessDebuffExpiresAtMs,
  curseWeaknessMpCostAtRank,
  curseWeaknessPatkMulAtRank,
  isCurseWeaknessCatalogSkill,
} from '../../data/curseWeaknessTables.js';
import {
  assertSkillCooldownReady,
  isCooldownBlocked,
} from './humanFighterTurnHelpers.js';

function mysticCdKey(skillId: number): string {
  return `l2_${skillId}`;
}

const CONTROL_STATS = new Set([
  'sleep',
  'hold',
  'fear',
  'silence',
  'stun',
  'root',
  'paralysis',
  'paralyze',
  'cancel',
]);
const NAME_HARD_CONTROL_RE =
  /(сон|якір|утрим|страх|мовчан|забутт|параліч|оков|сков)/i;
const NAME_SOFT_CONTROL_RE = /(сповіль|занепад|хаос|безодн|проклят|розлад)/i;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

type MysticDebuffApplyMode = 'refresh' | 'stack';

const STACKING_MYSTIC_DEBUFF_SKILL_IDS = new Set<number>([]);
const SUMMON_UTILITY_SKILL_IDS = new Set<number>([
  1126, // Recharge Servitor
  1299, // Servitor's last defense
  1300, // Servitor utility/heal skillline
  1301, // Servitor utility buff skillline
  1333, // Summoner utility
]);
const ORC_SUPPORT_BUFF_SKILL_IDS = new Set<number>([
  1092, // MP regen chant line
  1095, // Spirit of Wolf
  1097, // Spirit of Bear
  1213, // Fear-protection chant line
  1246, // Clan/party support chant
  1247, // Clan/party support chant
  1248, // Clan/party support chant
]);
const OFFENSIVE_EMPTY_BUFF_SKILL_IDS = new Set<number>([
  75, // Detect Insect Weakness
  80, // Detect Monster Weakness
  87, // Detect Animal Weakness
  88, // Detect Dragon Weakness
  104, // Detect Plant Weakness
  359, // Eye of the Hunter
  360, // Eye of the Slayer
]);

function mysticDebuffApplyMode(skillId: number): MysticDebuffApplyMode {
  return STACKING_MYSTIC_DEBUFF_SKILL_IDS.has(skillId) ? 'stack' : 'refresh';
}

function isSummonUtilitySkill(skillId: number): boolean {
  return SUMMON_UTILITY_SKILL_IDS.has(skillId);
}

function isOrcSupportBuffSkill(skillId: number): boolean {
  return ORC_SUPPORT_BUFF_SKILL_IDS.has(skillId);
}

export function applyMobDebuffsWithPolicy(
  st: BattleJsonState,
  patch: Partial<BattleBattleMods>,
  sourceSkillId: number
): Partial<BattleBattleMods> {
  const cur = st.battleMods;
  const mode = mysticDebuffApplyMode(sourceSkillId);
  const out: Partial<BattleBattleMods> = { ...patch };

  const applyStat = (
    incoming: number | undefined,
    prevMulRaw: number | undefined,
    prevIdsRaw: number[] | undefined
  ): {
    nextMul?: number;
    nextIds?: number[];
  } => {
    if (incoming === undefined) return {};
    const incomingClamped = clamp(incoming, 0.08, 1);
    if (mode === 'refresh') {
      return {
        nextMul: incomingClamped,
        nextIds: [sourceSkillId],
      };
    }
    const prevMul = prevMulRaw ?? 1;
    const prevIds = prevIdsRaw ?? [];
    const already = prevIds.includes(sourceSkillId);
    return {
      nextMul: already
        ? prevMul
        : clamp(prevMul * incomingClamped, 0.08, 1),
      nextIds: already ? prevIds : [...prevIds, sourceSkillId],
    };
  };

  if (out.mobPatkDebuffMul !== undefined) {
    const prevMul = jsonFiniteNum(cur?.mobPatkDebuffMul);
    const prevIds = Array.isArray(cur?.mobPatkDebuffIconSkillIds)
      ? cur.mobPatkDebuffIconSkillIds
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0)
      : [];
    const next = applyStat(out.mobPatkDebuffMul, prevMul, prevIds);
    out.mobPatkDebuffMul = next.nextMul;
    out.mobPatkDebuffIconSkillId = sourceSkillId;
    out.mobPatkDebuffIconSkillIds = next.nextIds;
  }
  if (out.mobTargetPDefMul !== undefined) {
    const prevMul = jsonFiniteNum(cur?.mobTargetPDefMul);
    const prevIds = Array.isArray(cur?.mobTargetPDefDebuffIconSkillIds)
      ? cur.mobTargetPDefDebuffIconSkillIds
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0)
      : [];
    const next = applyStat(out.mobTargetPDefMul, prevMul, prevIds);
    out.mobTargetPDefMul = next.nextMul;
    out.mobTargetPDefDebuffIconSkillId = sourceSkillId;
    out.mobTargetPDefDebuffIconSkillIds = next.nextIds;
  }
  if (out.mobTargetMDefMul !== undefined) {
    const prevMul = jsonFiniteNum(cur?.mobTargetMDefMul);
    const prevIds = Array.isArray(cur?.mobTargetMDefDebuffIconSkillIds)
      ? cur.mobTargetMDefDebuffIconSkillIds
          .map((x) => Math.floor(Number(x)))
          .filter((x) => Number.isFinite(x) && x > 0)
      : [];
    const next = applyStat(out.mobTargetMDefMul, prevMul, prevIds);
    out.mobTargetMDefMul = next.nextMul;
    out.mobTargetMDefDebuffIconSkillId = sourceSkillId;
    out.mobTargetMDefDebuffIconSkillIds = next.nextIds;
  }
  return out;
}

function inferredDebuffPatchBySkillId(
  skillId: number,
  power: number
): Partial<BattleBattleMods> {
  const cutLight = clamp(0.1 + power / 260, 0.1, 0.4);
  const cutMid = clamp(0.12 + power / 230, 0.12, 0.52);
  const cutStrong = clamp(0.14 + power / 210, 0.14, 0.6);
  switch (skillId) {
    case 1028: // Might of Heaven (Cardinal line) - support cast, no direct damage.
      return {};
    case 1034: // Repose
    case 1042: // Hold Undead
    case 1049: // Requiem
    case 1075: // Peace
    case 1056: // Cancel
    case 12: // Switch
    case 107: // Holy Aura
    case 1273: // Eva's Serenade
    case 84: // Poison Blade Dance
    case 103: // Corpse Plague
      return { mobPatkDebuffMul: 1 - cutLight };
    case 15: // Charm
    case 102: // Entangle
    case 342: // Touch of Death
    case 95: // Cripple
    case 1244: // Intimidation
      return { mobPatkDebuffMul: 1 - cutMid };
    case 122: // Hex
      return { mobTargetPDefMul: 1 - cutStrong };
    case 358: // Bluff
    case 367: // Dance of Medusa
      return { mobPatkDebuffMul: 1 - cutStrong };
    case 1160: // Slow
    case 1164: // Curse Weakness
    case 1167: // Poison Cloud
    case 1168: // Poison
    case 1269: // Curse Disease
    case 1344: // Mass Curse Warrior
      return { mobPatkDebuffMul: 1 - cutMid };
    case 1163: // Curse Disorder
      return { mobTargetPDefMul: 1 - cutLight, mobTargetMDefMul: 1 - cutLight };
    case 1233: // Decay
      return { mobPatkDebuffMul: 1 - cutMid, mobTargetPDefMul: 1 - cutLight };
    case 1263: // Curse Gloom
      return { mobTargetMDefMul: 1 - cutStrong };
    case 1337: // Curse of Abyss
      return { mobPatkDebuffMul: 1 - cutMid, mobTargetMDefMul: 1 - cutMid };
    case 1345: // Mass Curse Mage
      return { mobTargetMDefMul: 1 - cutMid };
    default:
      return {};
  }
}

function controlKindForEntry(
  entry: HumanMysticSkillCatalogEntry
): MysticDebuffControlKind {
  const p = mysticDebuffLandProfileForSkillId(entry.l2SkillId);
  if (p) return p.control;
  const fx = entry.effects ?? [];
  if (fx.some((e) => CONTROL_STATS.has(String(e.stat || '')))) return 'hard';
  if (NAME_HARD_CONTROL_RE.test(entry.nameUk)) return 'hard';
  if (NAME_SOFT_CONTROL_RE.test(entry.nameUk)) return 'soft';
  return 'none';
}

function readMysticCd(
  st: BattleJsonState,
  skillId: number
): number | undefined {
  const raw = st.mysticSkillCdUntil?.[mysticCdKey(skillId)];
  return jsonFiniteNum(raw);
}

function mysticToggleOffPatchByEntry(
  st: BattleJsonState,
  entry: HumanMysticSkillCatalogEntry
): Partial<BattleBattleMods> {
  const m = st.battleMods;
  if (!m) return {};
  const out: Partial<BattleBattleMods> = {};
  const fx = entry.effects ?? [];
  const hasPatk = fx.some((e) => e.stat === 'pAtk');
  const hasMatk = fx.some((e) => e.stat === 'mAtk');
  const hasCast = fx.some((e) => e.stat === 'castSpeed');
  const hasPdef = fx.some((e) => e.stat === 'pDef');
  const hasMdef = fx.some((e) => e.stat === 'mDef');
  if (hasPatk && (jsonFiniteNum(m.mysticPatkBuffMul) ?? 1) > 1) {
    out.mysticPatkBuffMul = 1;
  }
  if (hasMatk && (jsonFiniteNum(m.mysticMatkBuffMul) ?? 1) > 1) {
    out.mysticMatkBuffMul = 1;
  }
  if (hasCast && (jsonFiniteNum(m.mysticCastSpdBuffMul) ?? 1) > 1) {
    out.mysticCastSpdBuffMul = 1;
  }
  if (hasPdef && (jsonFiniteNum(m.mysticPdefBuffMul) ?? 1) > 1) {
    out.mysticPdefBuffMul = 1;
  }
  if (hasMdef && (jsonFiniteNum(m.mysticMdefBuffMul) ?? 1) > 1) {
    out.mysticMdefBuffMul = 1;
  }
  if (Object.keys(out).length > 0) return out;
  const skillId = entry.l2SkillId;
  const iconPatk = jsonFiniteNum(m.mysticPatkBuffIconSkillId);
  if (iconPatk !== undefined && Math.floor(iconPatk) === skillId) {
    return { mysticPatkBuffMul: 1 };
  }
  const iconMatk = jsonFiniteNum(m.mysticMatkBuffIconSkillId);
  if (iconMatk !== undefined && Math.floor(iconMatk) === skillId) {
    return { mysticMatkBuffMul: 1 };
  }
  const iconCast = jsonFiniteNum(m.mysticCastSpdBuffIconSkillId);
  if (iconCast !== undefined && Math.floor(iconCast) === skillId) {
    return { mysticCastSpdBuffMul: 1 };
  }
  const iconPdef = jsonFiniteNum(m.mysticPdefBuffIconSkillId);
  if (iconPdef !== undefined && Math.floor(iconPdef) === skillId) {
    return { mysticPdefBuffMul: 1 };
  }
  const iconMdef = jsonFiniteNum(m.mysticMdefBuffIconSkillId);
  if (iconMdef !== undefined && Math.floor(iconMdef) === skillId) {
    return { mysticMdefBuffMul: 1 };
  }
  return {};
}

function mysticToggleIsActiveBySkillId(
  st: BattleJsonState,
  entry: HumanMysticSkillCatalogEntry
): boolean {
  return Object.keys(mysticToggleOffPatchByEntry(st, entry)).length > 0;
}

export function mysticBuffPatch(
  entry: HumanMysticSkillCatalogEntry,
  rank: number,
  xmlPower?: number
): Partial<BattleBattleMods> {
  const row = entry.levels[rank - 1] ?? entry.levels[0];
  const power = xmlPower ?? row?.power ?? 10;
  const patch: Partial<BattleBattleMods> = {};
  if (entry.category !== 'buff' && entry.kind !== 'toggle') return patch;

  const iconId = entry.l2SkillId;
  for (const fx of entry.effects) {
    const pctFromPower = power / 100;
    const vRaw =
      fx.mode === 'percent'
        ? (fx.value != null ? fx.value / 100 : pctFromPower)
        : fx.mode === 'multiplier' && fx.value === 1
          ? pctFromPower
          : fx.mode === 'flat'
            ? (fx.value != null ? fx.value : power) / 10000
          : fx.value != null
            ? fx.value / 100
            : pctFromPower;
    let v = clamp(vRaw, -0.6, 1.2);
    /**
     * L2 Interlude: Arcane Power (337) має давати відчутний бонус M.Atk.
     * У частині расових каталогів зустрічається `power: 0` + без `value`,
     * через що toggle виходить з множником 1.0 і виглядає "не вмикається".
     */
    if (entry.l2SkillId === 337 && fx.stat === 'mAtk' && v <= 0) {
      v = 0.3;
    }
    if (fx.stat === 'pAtk') {
      patch.mysticPatkBuffMul = 1 + v;
      patch.mysticPatkBuffIconSkillId = iconId;
    } else if (fx.stat === 'mAtk') {
      patch.mysticMatkBuffMul = 1 + v;
      patch.mysticMatkBuffIconSkillId = iconId;
    } else if (fx.stat === 'attackSpeed' || fx.stat === 'atkSpeed') {
      // In turn-based combat we fold atk speed buffs into physical output multiplier.
      patch.mysticPatkBuffMul = 1 + clamp(v, 0.05, 0.45);
      patch.mysticPatkBuffIconSkillId = iconId;
    } else if (fx.stat === 'castSpeed') {
      patch.mysticCastSpdBuffMul = 1 + v;
      patch.mysticCastSpdBuffIconSkillId = iconId;
    } else if (fx.stat === 'hpRegen' || fx.stat === 'healPower' || fx.stat === 'maxHp') {
      patch.mysticPdefBuffMul = 1 + clamp(v, 0.05, 0.3);
      patch.mysticPdefBuffIconSkillId = iconId;
    } else if (fx.stat === 'mpRegen' || fx.stat === 'maxMp') {
      patch.mysticMdefBuffMul = 1 + clamp(v, 0.05, 0.3);
      patch.mysticMdefBuffIconSkillId = iconId;
    } else if (
      fx.stat.endsWith('Resist') ||
      fx.stat === 'debuffResist' ||
      fx.stat === 'cancelResist' ||
      fx.stat === 'mentalResist'
    ) {
      // We model utility resist chants through a defensive magic multiplier.
      patch.mysticMdefBuffMul = 1 + clamp(v, 0.06, 0.28);
      patch.mysticMdefBuffIconSkillId = iconId;
    } else if (fx.stat === 'cooldownReduction') {
      // No dedicated cooldown mod in battleMods, so we proxy through cast speed channel.
      patch.mysticCastSpdBuffMul = 1 + clamp(v, 0.05, 0.35);
      patch.mysticCastSpdBuffIconSkillId = iconId;
    } else if (fx.stat === 'pDef') {
      patch.mysticPdefBuffMul = 1 + v;
      patch.mysticPdefBuffIconSkillId = iconId;
    } else if (fx.stat === 'mDef') {
      patch.mysticMdefBuffMul = 1 + v;
      patch.mysticMdefBuffIconSkillId = iconId;
    } else if (fx.stat === 'salvation') {
      const salvationMul = 1 + clamp(v, 0.2, 0.7);
      patch.mysticPdefBuffMul = salvationMul;
      patch.mysticMdefBuffMul = salvationMul;
      patch.mysticPdefBuffIconSkillId = iconId;
      patch.mysticMdefBuffIconSkillId = iconId;
    }
  }
  if (
    Object.keys(patch).length === 0 &&
    entry.category === 'buff' &&
    entry.effects.length === 0
  ) {
    if (OFFENSIVE_EMPTY_BUFF_SKILL_IDS.has(entry.l2SkillId)) {
      patch.mysticPatkBuffMul = 1 + clamp(power / 100, 0.08, 0.35);
      patch.mysticPatkBuffIconSkillId = iconId;
    } else {
      patch.mysticMdefBuffMul = 1 + Math.min(0.5, power / 100);
      patch.mysticMdefBuffIconSkillId = iconId;
    }
  }
  return patch;
}

export function mysticDebuffPatch(
  entry: HumanMysticSkillCatalogEntry,
  rank: number,
  xmlPower?: number
): Partial<BattleBattleMods> {
  const row = entry.levels[rank - 1];
  const power = xmlPower ?? row?.power ?? 10;
  const fx = entry.effects ?? [];
  const out: Partial<BattleBattleMods> = {};
  const has = (pred: (stat: string) => boolean): boolean =>
    fx.some((e) => pred(String(e.stat || '')));
  const hasName = (re: RegExp): boolean => re.test(entry.nameUk);

  if (isIceBoltCatalogSkill(entry.l2SkillId)) {
    return {
      mobRunSpeedDebuffMul: ICE_BOLT_RUN_SPEED_MUL,
      mobRunSpeedDebuffIconSkillId: entry.l2SkillId,
    };
  }

  if (isCurseWeaknessCatalogSkill(entry.l2SkillId)) {
    return {
      mobPatkDebuffMul: curseWeaknessPatkMulAtRank(rank),
      mobPatkDebuffIconSkillId: entry.l2SkillId,
    };
  }

  if (
    has((s) =>
      [
        'runSpeed',
        'moveSpeed',
        'attackSpeed',
        'atkSpeed',
        'castSpeed',
        'pAtk',
        'mAtk',
        'hpRegen',
        'evasion',
        'skillCritRate',
      ].includes(s)
    ) ||
    hasName(NAME_SOFT_CONTROL_RE)
  ) {
    const cut = clamp(0.12 + power / 240, 0.12, 0.52);
    out.mobPatkDebuffMul = 1 - cut;
  }

  if (has((s) => s === 'pDef')) {
    const cut = clamp(0.1 + power / 260, 0.1, 0.42);
    out.mobTargetPDefMul = 1 - cut;
  }

  if (
    has((s) => s === 'mDef' || s.endsWith('Resist')) ||
    hasName(/безодн|хаос|розлад/i)
  ) {
    const cut = clamp(0.1 + power / 250, 0.1, 0.45);
    out.mobTargetMDefMul = 1 - cut;
  }

  const inferred = inferredDebuffPatchBySkillId(entry.l2SkillId, power);
  const merged = { ...inferred, ...out };
  if (
    Object.keys(merged).length === 0 &&
    entry.category === 'debuff' &&
    (entry.effects?.length ?? 0) === 0
  ) {
    // Fail-safe: explicit debuff skills with empty data should still apply a real mob-side effect.
    const cutFallback = clamp(0.08 + power / 320, 0.08, 0.24);
    merged.mobPatkDebuffMul = 1 - cutFallback;
  }
  if (merged.mobPatkDebuffMul !== undefined) {
    merged.mobPatkDebuffIconSkillId = entry.l2SkillId;
  }
  if (merged.mobTargetPDefMul !== undefined) {
    merged.mobTargetPDefDebuffIconSkillId = entry.l2SkillId;
  }
  if (merged.mobTargetMDefMul !== undefined) {
    merged.mobTargetMDefDebuffIconSkillId = entry.l2SkillId;
  }
  return merged;
}

function isControlDebuff(entry: HumanMysticSkillCatalogEntry): boolean {
  return controlKindForEntry(entry) === 'hard';
}

function hasDebuffPayload(entry: HumanMysticSkillCatalogEntry): boolean {
  const fx = entry.effects ?? [];
  const hasTargetDebuffStat = fx.some((e) => {
    const stat = String(e.stat || '');
    if (CONTROL_STATS.has(stat)) return true;
    if (
      [
        'runSpeed',
        'moveSpeed',
        'attackSpeed',
        'atkSpeed',
        'castSpeed',
        'pAtk',
        'mAtk',
        'hpRegen',
        'evasion',
        'skillCritRate',
        'pDef',
        'mDef',
      ].includes(stat)
    ) {
      return true;
    }
    return stat.endsWith('Resist');
  });
  if (hasTargetDebuffStat) return true;
  if (
    NAME_HARD_CONTROL_RE.test(entry.nameUk) || NAME_SOFT_CONTROL_RE.test(entry.nameUk)
  ) {
    return true;
  }
  return Object.keys(inferredDebuffPatchBySkillId(entry.l2SkillId, 100)).length > 0;
}

function mobControlResist(ctx: BattleSkillResolveContext): MobSpawnControlResistInput {
  return {
    level: ctx.spawnLevel,
    stunResistPct: ctx.spawnStunResistPct,
    debuffResistPct: ctx.spawnDebuffResistPct,
  };
}

function mobControlLandResistPctForMysticEntry(
  entry: HumanMysticSkillCatalogEntry,
  spawn: MobSpawnControlResistInput
): number {
  const stunFromFx = (entry.effects ?? []).some(
    (e) => String(e.stat || '') === 'stun'
  );
  return stunFromFx
    ? effectiveMobStunResistPct(spawn)
    : effectiveMobDebuffResistPct(spawn);
}

function debuffLandChance(
  entry: HumanMysticSkillCatalogEntry,
  skillPower: number,
  playerLevel: number,
  spawn: MobSpawnControlResistInput,
  spawnMobName: string,
  playerInt: number,
  playerMatk: number,
  mobMDef: number,
  fromMagicDamageHit: boolean = false,
  /** Плоский бонус після резисту моба, у % до шансу (сет Karmian тощо). */
  addLandChancePp: number = 0
): number {
  const profile = mysticDebuffLandProfileForSkillId(entry.l2SkillId);
  const control = controlKindForEntry(entry);
  let base =
    profile?.baseChance ??
    (control === 'hard' ? 0.48 : control === 'soft' ? 0.58 : 0.72);
  if (fromMagicDamageHit) base += 0.05;
  const powerAdj = clamp(skillPower / 1200, 0, 0.16);
  const levelAdj = clamp((playerLevel - spawn.level) * 0.01, -0.18, 0.12);
  const intAdj = clamp((playerInt - 40) * 0.004, -0.08, 0.12);
  const mDefRatio = playerMatk / Math.max(1, mobMDef);
  const mDefAdj = clamp((mDefRatio - 1) * 0.12, -0.12, 0.16);
  const spotMul = mysticDebuffSpotChanceMultiplier(spawnMobName, control);
  const rawChance = (base + powerAdj + levelAdj + intAdj + mDefAdj) * spotMul;
  const afterMobResist =
    rawChance * (1 - mobControlLandResistPctForMysticEntry(entry, spawn) / 100);
  return clamp(
    afterMobResist + addLandChancePp / 100,
    profile?.minChance ?? 0.15,
    profile?.maxChance ?? 0.95
  );
}

function skillExpiresPatch(skillId: number): Record<string, number> | undefined {
  const sec = buffDurationSecForSkillId(skillId);
  if (sec === undefined || sec <= 0) return undefined;
  return { [String(skillId)]: Date.now() + Math.floor(sec * 1000) };
}

function mysticDebuffExpiresPatch(
  entry: HumanMysticSkillCatalogEntry,
  rank: number
): Record<string, number> | undefined {
  if (isCurseWeaknessCatalogSkill(entry.l2SkillId)) {
    const exp = curseWeaknessDebuffExpiresAtMs(rank, Date.now());
    if (exp === undefined) return undefined;
    return { [String(entry.l2SkillId)]: exp };
  }
  return skillExpiresPatch(entry.l2SkillId);
}

export function resolveHumanMysticTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn,
  rollBolt: MagicBoltRollFn
): BattleSkillTurnResult {
  const {
    action,
    combat,
    st,
    preLevel,
    race,
    l2Profession,
    learnedSkillLevelByBattleId,
  } = ctx;
  const prof = String(l2Profession || '').trim();

  if (
    action === 'attack' ||
    action === 'power' ||
    action === 'bolt' ||
    action === 'stun'
  ) {
    return resolveLegacyMeleeTurn(ctx, rollPhys, rollBolt);
  }

  const act = String(action);
  if (!/^l2_\d+$/.test(act)) {
    throw new Error('battle_skill_not_allowed');
  }
  const battleId = canonicalBattleSkillId(act);
  const entry = mysticCatalogEntryForRace(race, battleId);
  if (!entry || entry.kind === 'passive') {
    throw new Error('battle_skill_not_allowed');
  }
  if (!mysticCatalogEntryVisibleForProfession(entry, prof)) {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = learnedSkillLevelByBattleId?.[battleId] ?? 0;
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const row = entry.levels[rank - 1] ?? entry.levels[0];
  const xmlRank = Math.max(1, rank);
  const xmlRow = l2dopXmlSkillRow(entry.l2SkillId, xmlRank);
  if (!row && !xmlRow) throw new Error('battle_skill_not_allowed');

  const toggleOnNow =
    entry.kind === 'toggle'
      ? mysticToggleIsActiveBySkillId(st, entry)
      : false;
  const cdUntil = readMysticCd(st, entry.l2SkillId);
  if (
    isCooldownBlocked(cdUntil) &&
    !(entry.kind === 'toggle' && toggleOnNow)
  ) {
    assertSkillCooldownReady(cdUntil);
  }

  const mpCostRaw = Math.max(
    0,
    Math.floor(xmlRow?.m ?? row?.mpCost ?? 0)
  );
  let mpCost = mpCostRaw;
  if (isCurseWeaknessCatalogSkill(entry.l2SkillId)) {
    const mpFromTable = curseWeaknessMpCostAtRank(rank);
    if (mpFromTable !== undefined) mpCost = mpFromTable;
  }
  const rowPower = row?.power ?? 0;
  let skillPower =
    xmlRow == null
      ? rowPower
      : (() => {
          const xmlP = xmlRow.p;
          const preferXml =
            xmlP !== 0 ||
            entry.category === 'magic_attack' ||
            entry.category === 'physical_attack' ||
            entry.category === 'heal';
          if (!preferXml) return rowPower;
          return xmlP !== 0 ? xmlP : rowPower;
        })();
  if (isIceBoltCatalogSkill(entry.l2SkillId)) {
    const fromTable = iceBoltPowerAtRank(rank);
    if (fromTable > 0) skillPower = fromTable;
  }
  const effectiveCastSpd = effectiveCastSpdForCooldown(ctx);
  const fixedCdRaw =
    typeof entry.cooldownSec === 'number' && entry.cooldownSec > 0
      ? entry.cooldownSec
      : (() => {
          const reuseCd = cooldownSecForSkillId(entry.l2SkillId);
          return typeof reuseCd === 'number' && reuseCd > 0 ? reuseCd : null;
        })();
  const cdSec = resolveBattleSkillCooldownSec({
    classBranch: ctx.classBranch,
    category: entry.category,
    kind: entry.kind,
    skillRank: rank,
    baseCdSec: fixedCdRaw,
    l2SkillId: entry.l2SkillId,
    castSpd: effectiveCastSpd,
    pAtkSpd: combat.pAtkSpd,
    cooldownReductionMul: combat.cooldownReductionMul,
  });
  const mysticSkillCdUntilPatch: Record<string, number> = {};
  if (typeof cdSec === 'number' && cdSec > 0) {
    mysticSkillCdUntilPatch[mysticCdKey(entry.l2SkillId)] =
      Date.now() + Math.ceil(cdSec * 1000);
  }

  const skillLine = entry.nameUk + '.';

  // l2_1028 in source data is marked as magic_attack, but gameplay-wise this is support buff.
  if (entry.l2SkillId === 1028) {
    const powerBuff = clamp(skillPower / 260, 0.14, 0.38);
    const patch: Partial<BattleBattleMods> = {
      mysticMatkBuffMul: 1 + powerBuff,
      mysticMatkBuffIconSkillId: entry.l2SkillId,
    };
    const expPatch = skillExpiresPatch(entry.l2SkillId);
    return {
      mpCost,
      pDmg: 0,
      skillLine,
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: patch,
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
      mysticSkillCdUntilPatch,
    };
  }

  if (entry.category === 'physical_attack') {
    const pMul = jsonFiniteNum(st.battleMods?.mysticPatkBuffMul) ?? 1;
    const pAtkEff = Math.max(
      1,
      Math.floor(combat.pAtk * (pMul > 1 ? pMul : 1))
    );
    const atkForSkill = Math.max(1, Math.floor(pAtkEff + skillPower));
    const r = rollPhys(atkForSkill);
    return {
      mpCost,
      pDmg: r.damage,
      skillLine,
      physOutcome: r.outcome,
      magicOutcome: null,
      mysticSkillCdUntilPatch,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (entry.category === 'magic_attack') {
    const mMul = jsonFiniteNum(st.battleMods?.mysticMatkBuffMul) ?? 1;
    let mAtkEff = Math.max(1, Math.floor(combat.mAtk * (mMul > 1 ? mMul : 1)));
    const blessMul = jsonFiniteNum(st.battleMods?.mysticBlessedSpiritshotMatkMul);
    const blessRaw = st.battleMods?.mysticBlessedSpiritshotItemId;
    const blessId =
      typeof blessRaw === 'number' && Number.isFinite(blessRaw)
        ? Math.floor(blessRaw)
        : undefined;
    if (
      blessMul !== undefined &&
      blessMul > 1 &&
      blessId !== undefined &&
      blessId > 0 &&
      MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS.has(blessId)
    ) {
      mAtkEff = Math.max(1, Math.floor(mAtkEff * blessMul));
    }
    const mobMdefMul = jsonFiniteNum(st.battleMods?.mobTargetMDefMul) ?? 1;
    const mobMDefEff =
      mobMdefMul > 0 && mobMdefMul < 1
        ? Math.max(1, Math.floor(st.mobMDef * mobMdefMul))
        : st.mobMDef;
    const mobEva =
      typeof st.mobEvasion === 'number' && Number.isFinite(st.mobEvasion)
        ? Math.max(0, Math.floor(st.mobEvasion))
        : Math.floor(Math.sqrt(combat.dex) * 6 + preLevel);
    const r = resolveMagicBoltHit({
      mAtk: mAtkEff,
      mobMDef: mobMDefEff,
      playerInt: combat.int,
      playerWit: combat.wit,
      playerMen: combat.men,
      playerLevel: preLevel,
      mobEvasion: mobEva,
      skillPower,
      bonusSps: 1,
      mCritPct: combat.mCritPct,
      magicCritDmgMul: combat.magicCritDmgMul,
      allowMiss: false,
      allowMagicCrit: true,
    });
    let skillLineFinal = skillLine;
    let battleModsPatch: Partial<BattleBattleMods> | undefined;
    let skipMobCounterAttackOnce = false;
    let mobRetaliationDelayHits: number | undefined;
    let pDmgOut = r.damage;
    if (r.outcome === 'hit' && hasDebuffPayload(entry)) {
      const deb = mysticDebuffPatch(entry, rank, skillPower);
      const chance = debuffLandChance(
        entry,
        skillPower,
        preLevel,
        mobControlResist(ctx),
        ctx.spawnMobName,
        combat.int,
        mAtkEff,
        mobMDefEff,
        true,
        combat.addDebuffLandChancePct
      );
      const chancePct = Math.round(chance * 100);
      if (Math.random() < chance) {
        if (Object.keys(deb).length > 0) {
          battleModsPatch = applyMobDebuffsWithPolicy(st, deb, entry.l2SkillId);
        }
        if (battleModsPatch?.mobRunSpeedDebuffMul !== undefined) {
          const until = Date.now() + iceBoltSlowDurationMs();
          battleModsPatch = {
            ...battleModsPatch,
            mobRunSpeedDebuffUntilMs: until,
          };
        }
        if (isControlDebuff(entry)) {
          skipMobCounterAttackOnce = true;
          mobRetaliationDelayHits = entry.l2SkillId === 1069 ? 3 : 2;
        }
        skillLineFinal =
          entry.nameUk +
          '. Ефект пройшов (' +
          chancePct +
          '%).';
      } else {
        skillLineFinal = entry.nameUk + '. Ціль опирається ефекту (' + chancePct + '%).';
      }
    }
    const debuffExpPatch =
      battleModsPatch != null ? skillExpiresPatch(entry.l2SkillId) : undefined;
    const vampFx = entry.effects.find((e) => e.stat === 'vampirism');
    const vampRatioRaw =
      vampFx?.value != null && Number.isFinite(vampFx.value)
        ? vampFx.value / 100
        : undefined;
    const vampRatio =
      vampRatioRaw !== undefined ? clamp(vampRatioRaw, 0.05, 0.45) : undefined;
    const playerHeal =
      vampRatio !== undefined && r.damage > 0
        ? Math.max(1, Math.floor(pDmgOut * vampRatio))
        : undefined;
    return {
      mpCost,
      pDmg: pDmgOut,
      skillLine: skillLineFinal,
      physOutcome: null,
      magicOutcome: r.outcome,
      ...(battleModsPatch ? { battleModsPatch } : {}),
      ...(debuffExpPatch ? { battleModsExpiresPatch: debuffExpPatch } : {}),
      ...(skipMobCounterAttackOnce ? { skipMobCounterAttackOnce: true } : {}),
      ...(mobRetaliationDelayHits !== undefined
        ? { mobRetaliationDelayHits }
        : {}),
      ...(playerHeal !== undefined
        ? { playerHeal, playerHealSourceUk: 'Вампіризм' }
        : {}),
      mysticSkillCdUntilPatch,
    };
  }

  if (entry.category === 'heal') {
    // Summon-only utility in Interlude; we keep neutral battle behavior until summon combat is implemented.
    if (isSummonUtilitySkill(entry.l2SkillId)) {
      return {
        mpCost,
        pDmg: 0,
        skillLine: entry.nameUk + '. Уміння слуги застосовано.',
        physOutcome: null,
        magicOutcome: null,
        mysticSkillCdUntilPatch,
      };
    }
    /** Self Heal (1216): flat power з каталогу, лише на себе. */
    if (entry.l2SkillId === MYSTIC_SELF_HEAL_L2_SKILL_ID) {
      const heal = Math.max(
        1,
        Math.floor(skillPower > 0 ? skillPower : MYSTIC_SELF_HEAL_POWER)
      );
      return {
        mpCost,
        pDmg: 0,
        skillLine,
        physOutcome: null,
        magicOutcome: null,
        playerHeal: heal,
        mysticSkillCdUntilPatch,
      };
    }
    /** Battle Heal (1015) ранги 1–3: flat power з таблиці Interlude. */
    if (
      entry.l2SkillId === MYSTIC_BATTLE_HEAL_L2_SKILL_ID &&
      isBattleHealStarterRank(rank)
    ) {
      const fromTable = battleHealPowerAtRank(rank);
      const heal = Math.max(
        1,
        Math.floor(fromTable > 0 ? fromTable : skillPower)
      );
      return {
        mpCost,
        pDmg: 0,
        skillLine,
        physOutcome: null,
        magicOutcome: null,
        playerHeal: heal,
        mysticSkillCdUntilPatch,
      };
    }
    /** Group Heal (1027): flat power з таблиці Interlude (усі ранги). */
    if (entry.l2SkillId === MYSTIC_GROUP_HEAL_L2_SKILL_ID) {
      const fromTable = groupHealPowerAtRank(rank);
      const heal = Math.max(
        1,
        Math.floor(fromTable > 0 ? fromTable : skillPower)
      );
      return {
        mpCost,
        pDmg: 0,
        skillLine,
        physOutcome: null,
        magicOutcome: null,
        playerHeal: heal,
        mysticSkillCdUntilPatch,
      };
    }
    const heal = Math.max(
      1,
      Math.floor(skillPower * 4 + preLevel * 3 + rank * 5)
    );
    return {
      mpCost,
      pDmg: 0,
      skillLine,
      physOutcome: null,
      magicOutcome: null,
      playerHeal: heal,
      mysticSkillCdUntilPatch,
    };
  }

  if (
    entry.category === 'buff' ||
    entry.kind === 'toggle' ||
    isOrcSupportBuffSkill(entry.l2SkillId)
  ) {
    if (entry.kind !== 'toggle' && isSummonUtilitySkill(entry.l2SkillId)) {
      return {
        mpCost,
        pDmg: 0,
        skillLine: entry.nameUk + '. Уміння слуги застосовано.',
        physOutcome: null,
        magicOutcome: null,
        mysticSkillCdUntilPatch,
      };
    }
    if (entry.kind === 'toggle' && toggleOnNow) {
      const offPatch = mysticToggleOffPatchByEntry(st, entry);
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: entry.nameUk + ' вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        ...(Object.keys(offPatch).length > 0 ? { battleModsPatch: offPatch } : {}),
        mysticSkillCdUntilPatch,
      };
    }
    const patch = mysticBuffPatch(entry, rank, skillPower);
    const expPatch =
      entry.kind === 'toggle' ? undefined : skillExpiresPatch(entry.l2SkillId);
    return {
      mpCost,
      pDmg: 0,
      skillLine,
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: patch,
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
      mysticSkillCdUntilPatch,
    };
  }

  if (entry.category === 'debuff') {
    const chance = debuffLandChance(
      entry,
      skillPower,
      preLevel,
      mobControlResist(ctx),
      ctx.spawnMobName,
      combat.int,
      combat.mAtk,
      st.mobMDef,
      false,
      combat.addDebuffLandChancePct
    );
    const chancePct = Math.round(chance * 100);
    const landed = Math.random() < chance;
    const deb0 = landed ? mysticDebuffPatch(entry, rank, skillPower) : {};
    const deb = landed
      ? applyMobDebuffsWithPolicy(st, deb0, entry.l2SkillId)
      : {};
    if (landed && entry.l2SkillId === 1069) {
      deb.mobSleepUntilMs = Date.now() + 10_000;
      deb.mobSleepIconSkillId = 1069;
    }
    const skipMobCounterAttackOnce = landed && isControlDebuff(entry);
    const mobRetaliationDelayHits =
      skipMobCounterAttackOnce
        ? entry.l2SkillId === 1069
          ? 3
          : 2
        : undefined;
    const expPatch =
      landed && Object.keys(deb).length > 0
        ? mysticDebuffExpiresPatch(entry, rank)
        : undefined;
    return {
      mpCost,
      pDmg: 0,
      skillLine: landed
        ? entry.nameUk + '. Ефект пройшов (' + chancePct + '%).'
        : entry.nameUk + '. Ціль опирається ефекту (' + chancePct + '%).',
      physOutcome: null,
      magicOutcome: null,
      ...(Object.keys(deb).length > 0 ? { battleModsPatch: deb } : {}),
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
      ...(skipMobCounterAttackOnce ? { skipMobCounterAttackOnce: true } : {}),
      ...(mobRetaliationDelayHits !== undefined
        ? { mobRetaliationDelayHits }
        : {}),
      mysticSkillCdUntilPatch,
    };
  }

  /* special / none — лише MP та КД, без HP моба */
  return {
    mpCost,
    pDmg: 0,
    skillLine,
    physOutcome: null,
    magicOutcome: null,
    mysticSkillCdUntilPatch,
  };
}
