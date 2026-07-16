/**
 * Расові воїни (Orc/Elf/Dark Elf/Dwarf): `l2_*` з каталогів як у text-rpg / `resolveHumanMysticTurn`.
 * Людина-воїн зазвичай б’є іменованими діями (`power_strike` …) — тут entry немає → null.
 */
import { resolveMagicBoltHit } from '../../data/l2dopHitResolution.js';
import { humanFighterProfessionAtkMult } from '../../data/l2dopHumanFighterBattleSkills.js';
import { canonicalBattleSkillId } from '../../data/humanFighterSkillCatalog.legacyIds.js';
import { mysticCatalogEntryVisibleForProfession } from '../../data/humanMysticSkillCatalog.js';
import type { HumanMysticSkillCatalogEntry } from '../../data/humanMysticSkillCatalog.types.js';
import { l2dopXmlSkillRow } from '../../data/l2dopXmlSkillLevels.lookup.js';
import { buffDurationSecForSkillId } from '../../data/l2dopBuffDurations.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { jsonFiniteNum } from '../battle.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import {
  applyMobDebuffsWithPolicy,
  mysticBuffPatch,
  mysticDebuffPatch,
} from './humanMysticTurn.js';
import {
  assertSkillCooldownReady,
  isCooldownBlocked,
} from './humanFighterTurnHelpers.js';
import { buildRiposteStanceToggleTurn } from '../riposteStance.js';
import { resolveVengeanceTurn } from './vengeanceTurn.js';
import { resolveTouchOfLifeTurn } from './touchOfLifeTurn.js';

function mysticCdKey(skillId: number): string {
  return `l2_${skillId}`;
}

function readMysticCd(
  st: BattleSkillResolveContext['st'],
  skillId: number
): number | undefined {
  const raw = st.mysticSkillCdUntil?.[mysticCdKey(skillId)];
  return jsonFiniteNum(raw);
}

function raceFighterMysticToggleOffPatchBySkillId(
  st: BattleSkillResolveContext['st'],
  entry: HumanMysticSkillCatalogEntry
) {
  const m = st.battleMods;
  if (!m) return {};
  const out: Record<string, number> = {};
  const fx = entry.effects ?? [];
  const hasPatk = fx.some((e) => e.stat === 'pAtk');
  const hasMatk = fx.some((e) => e.stat === 'mAtk');
  const hasPdef = fx.some((e) => e.stat === 'pDef');
  const hasMdef = fx.some((e) => e.stat === 'mDef');
  const hasAtkSpd = fx.some((e) => e.stat === 'attackSpeed' || e.stat === 'atkSpeed');
  const hasCdReduction = fx.some((e) => e.stat === 'cooldownReduction');
  if (hasPatk && (jsonFiniteNum(m.mysticPatkBuffMul) ?? 1) > 1) {
    out.mysticPatkBuffMul = 1;
  }
  if (hasMatk && (jsonFiniteNum(m.mysticMatkBuffMul) ?? 1) > 1) {
    out.mysticMatkBuffMul = 1;
  }
  if (hasAtkSpd && (jsonFiniteNum(m.mysticPatkBuffMul) ?? 1) > 1) {
    out.mysticPatkBuffMul = 1;
  }
  if (hasPdef && (jsonFiniteNum(m.mysticPdefBuffMul) ?? 1) > 1) {
    out.mysticPdefBuffMul = 1;
  }
  if (hasMdef && (jsonFiniteNum(m.mysticMdefBuffMul) ?? 1) > 1) {
    out.mysticMdefBuffMul = 1;
  }
  if (hasCdReduction && (jsonFiniteNum(m.mysticCastSpdBuffMul) ?? 1) > 1) {
    out.mysticCastSpdBuffMul = 1;
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

/** Як у `humanFighterTurn`: лук / древко / меч / кинжал для фіз. скілів з каталогу. */
const BOW_PHYS_L2 = new Set([
  56, 19, 24, 99, 101, 313, 343, 354,
]);
const POLE_PHYS_L2 = new Set([36, 48, 245, 320, 347]);
const SWORD_BLUNT_PHYS_L2 = new Set([3, 255]);
const BLUNT_ONLY_PHYS_L2 = new Set([100]);
const DAGGER_PHYS_L2 = new Set([16, 30, 263, 344]);
const POLE_MAGIC_L2 = new Set([347, 361]);

function swordOrBluntWeapon(wk: string | undefined): boolean {
  return (
    wk === 'sword' ||
    wk === 'blunt' ||
    wk === 'bigsword' ||
    wk === 'bigblunt'
  );
}

function assertWeaponRaceFighterPhysical(
  entry: HumanMysticSkillCatalogEntry,
  wk: string | undefined
): void {
  /**
   * За геймплейним правилом у цій гілці: toggle-скіли можна вмикати
   * з будь-якою зброєю (без weapon gate).
   */
  if (entry.kind === 'toggle') return;
  if (entry.category !== 'physical_attack') return;
  const id = entry.l2SkillId;
  if (BOW_PHYS_L2.has(id)) {
    if (wk !== 'bow') throw new Error('battle_skill_not_allowed');
    return;
  }
  if (POLE_PHYS_L2.has(id)) {
    if (wk !== 'pole') throw new Error('battle_skill_not_allowed');
    return;
  }
  if (BLUNT_ONLY_PHYS_L2.has(id)) {
    if (wk !== 'blunt' && wk !== 'bigblunt') {
      throw new Error('battle_skill_not_allowed');
    }
    return;
  }
  if (SWORD_BLUNT_PHYS_L2.has(id)) {
    if (!swordOrBluntWeapon(wk)) throw new Error('battle_skill_not_allowed');
    return;
  }
  if (DAGGER_PHYS_L2.has(id)) {
    if (wk !== 'dagger' && wk !== 'dual') {
      throw new Error('battle_skill_not_allowed');
    }
  }
}

function assertWeaponRaceFighterMagic(
  entry: HumanMysticSkillCatalogEntry,
  wk: string | undefined
): void {
  if (entry.kind === 'toggle') return;
  if (entry.category !== 'magic_attack') return;
  if (POLE_MAGIC_L2.has(entry.l2SkillId) && wk !== 'pole') {
    throw new Error('battle_skill_not_allowed');
  }
}

function skillExpiresPatch(skillId: number): Record<string, number> | undefined {
  const sec = buffDurationSecForSkillId(skillId);
  if (sec === undefined || sec <= 0) return undefined;
  return { [String(skillId)]: Date.now() + Math.floor(sec * 1000) };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

const FIGHTER_HARD_CONTROL_DEBUFF_IDS = new Set<number>([
  12, // Switch
  102, // Entangle
  358, // Bluff
  367, // Dance of Medusa
]);

function fighterDebuffLandChance(
  entry: HumanMysticSkillCatalogEntry,
  skillPower: number,
  playerLevel: number,
  spawnLevel: number,
  playerDex: number,
  playerPatk: number,
  mobPDef: number,
  addLandChancePp: number = 0
): number {
  const isHard = FIGHTER_HARD_CONTROL_DEBUFF_IDS.has(entry.l2SkillId);
  const base = isHard ? 0.44 : 0.62;
  const powerAdj = clamp(skillPower / 1300, 0, 0.16);
  const levelAdj = clamp((playerLevel - spawnLevel) * 0.01, -0.14, 0.12);
  const dexAdj = clamp((playerDex - 30) * 0.004, -0.08, 0.1);
  const defRatio = playerPatk / Math.max(1, mobPDef);
  const defAdj = clamp((defRatio - 1) * 0.1, -0.1, 0.14);
  return clamp(
    base + powerAdj + levelAdj + dexAdj + defAdj + addLandChancePp / 100,
    0.12,
    0.93
  );
}

export function tryResolveFighterRaceCatalogTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult | null {
  const act = String(ctx.action);
  if (!/^l2_\d+$/.test(act)) return null;

  const battleId = canonicalBattleSkillId(act);
  const entry = fighterCatalogEntryForRace(
    ctx.race,
    ctx.classBranch,
    battleId
  );
  if (!entry || entry.kind === 'passive') return null;

  if (entry.l2SkillId === 340) {
    const prof = String(ctx.l2Profession || '').trim();
    if (!mysticCatalogEntryVisibleForProfession(entry, prof)) return null;
    const rank = ctx.learnedSkillLevelByBattleId?.[battleId] ?? 0;
    if (rank < 1) return null;
    return buildRiposteStanceToggleTurn(ctx, rank);
  }

  const prof = String(ctx.l2Profession || '').trim();
  if (!mysticCatalogEntryVisibleForProfession(entry, prof)) return null;

  const rank = ctx.learnedSkillLevelByBattleId?.[battleId] ?? 0;
  if (rank < 1) return null;

  const row = entry.levels[rank - 1] ?? entry.levels[0];
  const xmlRank = Math.max(1, rank);
  const xmlRow = l2dopXmlSkillRow(entry.l2SkillId, xmlRank);
  if (!row && !xmlRow) return null;
  const toggleOnNow =
    entry.kind === 'toggle'
      ? Object.keys(
          raceFighterMysticToggleOffPatchBySkillId(ctx.st, entry)
        ).length > 0
      : false;
  const cdUntil = readMysticCd(ctx.st, entry.l2SkillId);
  if (
    cdUntil !== undefined &&
    isCooldownBlocked(cdUntil) &&
    !(entry.kind === 'toggle' && toggleOnNow)
  ) {
    assertSkillCooldownReady(cdUntil);
  }

  const mpCost = Math.max(0, Math.floor(xmlRow?.m ?? row?.mpCost ?? 0));
  const rowPower = row?.power ?? 0;
  const skillPower =
    xmlRow == null
      ? rowPower
      : xmlRow.p !== 0 ||
          entry.category === 'magic_attack' ||
          entry.category === 'physical_attack' ||
          entry.category === 'heal'
        ? xmlRow.p
        : rowPower;

  const { combat, st, preLevel, l2Profession } = ctx;
  const skillLine = entry.nameUk + '.';
  const profM = humanFighterProfessionAtkMult(preLevel, l2Profession);

  if (entry.category === 'physical_attack') {
    assertWeaponRaceFighterPhysical(entry, ctx.weaponKind);
    const pMul = jsonFiniteNum(st.battleMods?.mysticPatkBuffMul) ?? 1;
    const pAtkEff = Math.max(
      1,
      Math.floor(combat.pAtk * (pMul > 1 ? pMul : 1))
    );
    const atk = Math.max(
      1,
      Math.floor(pAtkEff * (1.06 + skillPower / 450) * profM)
    );
    const r = rollPhys(atk);
    const landed = r.damage > 0 && r.outcome !== 'miss';
    const eqTargetBreak = entry.l2SkillId === 347 && landed;
    return {
      mpCost,
      pDmg: r.damage,
      skillLine:
        entry.l2SkillId === 347
          ? entry.nameUk +
            ': сила ' +
            skillPower +
            ', r≈150' +
            (landed ? '; цілі втратили таргет.' : '.')
          : skillLine,
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(eqTargetBreak
        ? { skipMobCounterAttackOnce: true, mobRetaliationDelayHits: 2 }
        : {}),
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (entry.category === 'magic_attack') {
    assertWeaponRaceFighterMagic(entry, ctx.weaponKind);
    const mMul = jsonFiniteNum(st.battleMods?.mysticMatkBuffMul) ?? 1;
    const mAtkEff = Math.max(1, Math.floor(combat.mAtk * (mMul > 1 ? mMul : 1)));
    const mobEva =
      typeof st.mobEvasion === 'number' && Number.isFinite(st.mobEvasion)
        ? Math.max(0, Math.floor(st.mobEvasion))
        : Math.floor(Math.sqrt(combat.dex) * 6 + preLevel);
    const r = resolveMagicBoltHit({
      mAtk: mAtkEff,
      mobMDef: st.mobMDef,
      playerInt: combat.int,
      playerWit: combat.wit,
      playerMen: combat.men,
      playerLevel: preLevel,
      mobEvasion: mobEva,
      skillPower,
      bonusSps: 1,
      mCritPct: combat.mCritPct,
      magicCritDmgMul: combat.magicCritDmgMul,
      allowMiss: true,
      allowMagicCrit: true,
    });
    return {
      mpCost,
      pDmg: r.damage,
      skillLine,
      physOutcome: null,
      magicOutcome: r.outcome,
    };
  }

  if (entry.category === 'heal') {
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
    };
  }

  if (entry.l2SkillId === 368) {
    return resolveVengeanceTurn(ctx);
  }

  if (entry.l2SkillId === 341) {
    return resolveTouchOfLifeTurn(ctx);
  }

  if (entry.category === 'buff' || entry.kind === 'toggle') {
    if (entry.l2SkillId === 99) {
      // Rapid Shot has no parsed effects in catalog; keep a real DPS impact.
      const patch = {
        mysticPatkBuffMul: 1.12,
        mysticPatkBuffIconSkillId: 99,
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
      };
    }
    if (entry.kind === 'toggle' && toggleOnNow) {
      const offPatch = raceFighterMysticToggleOffPatchBySkillId(
        ctx.st,
        entry
      );
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: entry.nameUk + ' вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        ...(Object.keys(offPatch).length > 0
          ? { battleModsPatch: offPatch }
          : {}),
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
    };
  }

  if (entry.category === 'debuff') {
    const chance = fighterDebuffLandChance(
      entry,
      skillPower,
      preLevel,
      ctx.spawnLevel,
      combat.dex,
      combat.pAtk,
      st.mobPDef,
      combat.addDebuffLandChancePct
    );
    const chancePct = Math.round(chance * 100);
    const landed = Math.random() < chance;
    const debRaw = landed ? mysticDebuffPatch(entry, rank, skillPower) : {};
    const deb =
      landed && Object.keys(debRaw).length > 0
        ? applyMobDebuffsWithPolicy(ctx.st, debRaw, entry.l2SkillId)
        : debRaw;
    const skipMobCounterAttackOnce =
      landed && FIGHTER_HARD_CONTROL_DEBUFF_IDS.has(entry.l2SkillId);
    const mobRetaliationDelayHits = skipMobCounterAttackOnce ? 2 : undefined;
    const expPatch =
      landed && Object.keys(deb).length > 0
        ? skillExpiresPatch(entry.l2SkillId)
        : undefined;
    return {
      mpCost,
      pDmg: 0,
      skillLine: landed
        ? entry.nameUk + '. Ефект пройшов (' + chancePct + '%).'
        : entry.nameUk + '. Ціль опирається ефекту (' + chancePct + '%).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: deb,
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
      ...(skipMobCounterAttackOnce ? { skipMobCounterAttackOnce: true } : {}),
      ...(mobRetaliationDelayHits !== undefined
        ? { mobRetaliationDelayHits }
        : {}),
    };
  }

  return {
    mpCost,
    pDmg: 0,
    skillLine,
    physOutcome: null,
    magicOutcome: null,
  };
}
