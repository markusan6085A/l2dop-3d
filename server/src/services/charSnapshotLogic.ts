import { Prisma } from '@prisma/client';
import { parseInventory, countBagQty } from '../data/inventory.js';
import { parseWarehouse, warehouseToSnapshot } from '../data/warehouse.js';
import {
  computeCombatStats,
  computeCombatStatsOptionsForCharacter,
  effectiveMaxMpWithJewelFlat,
  type ComputeCombatStatsOptions,
} from '../data/l2dopCombatFormulas.js';
import { resolveActiveArmorSetProfile } from '../data/l2dopDGradeArmorSetBonuses.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { mapAngleDeg } from '../data/l2dopMapCoords.js';
import {
  equippedWeaponKind,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { mapMoveSpeedFromRunSpeed } from '../domain/mapMovement.js';
import { nickColorFromKarmaRow } from '../domain/pvpKarma.js';
import { parsePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';
import {
  parsePvePendingDefeat,
  pvePendingDefeatToSummary,
} from '../domain/pvePendingDefeat.js';
import { parseBattleHotbarSlots } from '../domain/battleHotbar.js';
import { enrichLearnedSkillsForSnapshot } from './charLearnedSkillsSnapshot.js';
import {
  effectiveBattleAccuracyDisplay,
  effectiveBattleCritRateDisplay,
  effectiveBattleEvasionDisplay,
  effectiveBattleMaxHp,
  effectiveBattlePatkDisplay,
  effectiveBattleMatkDisplay,
  effectiveBattlePDefDisplay,
  effectiveBattleMDefDisplay,
  effectiveBattlePAtkSpdDisplay,
  effectiveBattleRunSpeedDisplay,
  isFocusAttackActive,
  isStanceViciousActive,
  jsonFiniteNum,
  readBattlePlayerMp,
  readBattlePlayerCp,
  type BattleBattleMods,
} from '../domain/battle.js';
import { mergeDisplayBattleMods } from '../domain/combatDisplayContext.js';
import {
  computeMaxHpChain,
  resolveHpWithClanHallPassive,
} from '../domain/characterClanHallVitals.js';
import {
  applyClanHallPassiveFlat,
  resolveClanHallPassiveBonus,
} from '../domain/clanHall.js';
import {
  isRiposteStanceActive,
  RIPOSTE_REFLECT_PCT,
} from '../domain/riposteStance.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
} from '../domain/worldCombatState.js';
import {
  expSegmentForLevelBar,
  levelFromTotalExp,
} from '../data/l2dopExpgain.js';
import {
  focusAttackCritDmgMultiplier,
  focusAttackRankFromLearnedEntries,
  viciousStanceRankFromLearnedEntries,
} from '../data/l2dopFocusAttack.js';
import { textRpgHfToggleStanceDelta } from '../data/textRpgHfToggleBattleApply.js';
import { resolveViciousStanceEffectRank } from '../data/viciousStanceTables.js';
import {
  canonicalBattleSkillId,
  learnedBattleIdsFromEntries,
  normalizeLearnedSkillsJson,
  type LearnedSkillEntry,
} from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';
import {
  parseSkillCooldowns,
  skillCooldownDisplaySec,
} from '../data/skillCooldowns.js';
import { buildCastableSelfBuffs } from '../data/castableSelfBuffs.js';
import { isHumanFighter } from '../data/l2dopHumanFighterBattleSkills.js';
import {
  firstProfessionQuestSnapshot,
  parseQuestProgressJson,
} from '../domain/humanFighterFirstProfessionQuest.js';
import { dailyQuestsSnapshot } from '../domain/dailyQuests.js';
import { COIN_OF_LUCK_ITEM_ID } from '../domain/dailyQuestRewards.js';
import {
  computeHeroPower,
  heroPowerStatBonusPercent,
  learnedSkillCountForHeroPower,
} from '../domain/heroPower.js';
import type {
  ActiveBuffSnapshotEntry,
  CharacterRow,
  CharacterSnapshot,
  SkillCooldownSnapshotEntry,
} from './charTypes.js';
import { parseDungeonStateJson } from '../domain/dungeonState.js';

function buildActiveBuffsSnapshot(
  raw: Prisma.JsonValue | null,
  nowMs: number
): ActiveBuffSnapshotEntry[] {
  const entries = persistableActiveBuffsFromJson(raw, nowMs);
  return entries.map((e) => {
    const exp = e.expiresAt ?? null;
    const remainingSec =
      exp != null ? Math.max(0, Math.ceil((exp - nowMs) / 1000)) : null;
    return {
      skillId: e.skillId,
      level: e.level,
      expiresAt: exp,
      remainingSec,
    };
  });
}

function buildSkillCooldownsSnapshot(
  raw: Prisma.JsonValue | null,
  nowMs: number
): SkillCooldownSnapshotEntry[] {
  const cds = parseSkillCooldowns(raw, nowMs);
  return cds.map((c) => ({
    skillId: c.skillId,
    readyAt: c.readyAt,
    remainingSec: skillCooldownDisplaySec(c.readyAt - nowMs),
  }));
}

function parseLearnedBattleSkills(
  raw: Prisma.JsonValue | null,
  l2Profession: string,
  race: string,
  classBranch: string
): string[] {
  return learnedBattleIdsFromEntries(
    filterLearnedSkillEntriesForCharacter(
      normalizeLearnedSkillsJson(raw),
      race,
      classBranch,
      l2Profession
    )
  );
}

/**
 * Опції для `computeCombatStats`: світові бафи (`activeBuffsJson`) + пасивні скіли (`skillsLearnedJson`),
 * як users_skills у PHP / пасиви в text-rpg.
 */
export function combatOptsFromRow(row: CharacterRow): ComputeCombatStatsOptions {
  return computeCombatStatsOptionsForCharacter(row);
}

/** Мощ героя для списку онлайн та інших легких read-path. */
export function resolveHeroPowerFromCharacterRow(row: CharacterRow): number {
  const inv = parseInventory(row.inventoryJson);
  const effectiveLevel = levelFromTotalExp(row.exp);
  const combat = computeCombatStats(
    effectiveLevel,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row)
  );
  const l2ProfResolved = resolveL2ProfessionForSkillsRow(row);
  const learnedDetail = enrichLearnedSkillsForSnapshot(
    filterLearnedSkillEntriesForCharacter(
      normalizeLearnedSkillsJson(row.skillsLearnedJson),
      row.race,
      row.classBranch,
      l2ProfResolved
    ),
    row.race,
    row.classBranch
  );
  return computeHeroPower({
    level: effectiveLevel,
    learnedSkillCount: learnedSkillCountForHeroPower(learnedDetail),
    str: combat.str,
    int: combat.int,
    dex: combat.dex,
    wit: combat.wit,
    con: combat.con,
    men: combat.men,
    statBonusPercent: heroPowerStatBonusPercent(
      effectiveLevel,
      row.race,
      row.classBranch,
      inv,
      combatOptsFromRow(row)
    ),
  });
}

/** Max HP з урахуванням Battle Roar у бою (`battleJson`) або поза боєм (`worldCombatStateJson`). */
export function effectiveMaxHpWithBattleRoar(
  row: CharacterRow,
  maxHpBase: number,
  worldBattleMods?: BattleBattleMods
): number {
  const rawBj = row.battleJson;
  if (rawBj != null && typeof rawBj === 'object' && !Array.isArray(rawBj)) {
    const o = rawBj as Record<string, unknown>;
    if (typeof o.spawnId === 'string' && o.spawnId) {
      const mods = o.battleMods;
      if (mods != null && typeof mods === 'object' && !Array.isArray(mods)) {
        return effectiveBattleMaxHp(maxHpBase, mods as BattleBattleMods);
      }
    }
  }
  if (worldBattleMods) {
    return effectiveBattleMaxHp(maxHpBase, worldBattleMods);
  }
  return maxHpBase;
}

/**
 * «Дод. крит» — як `l2dop/player.php`: floor((critdmg-1)*100)% + AddCritDmg;
 * Focus Attack за рангом l2_317; Жорстка стійка — text-rpg (`textRpgHfToggleBattleApply`).
 */
function addCritDisplayForProfile(
  combat: ReturnType<typeof computeCombatStats>,
  displayMods: BattleBattleMods | undefined,
  learned: LearnedSkillEntry[],
  focusAttackRank: number
): string {
  let mul = combat.critDmgMul;
  let flat = combat.addCritDmg;
  if (isFocusAttackActive(displayMods)) {
    mul *= focusAttackCritDmgMultiplier(focusAttackRank);
  }
  if (isStanceViciousActive(displayMods)) {
    const d = textRpgHfToggleStanceDelta(
      312,
      resolveViciousStanceEffectRank(
        viciousStanceRankFromLearnedEntries(learned),
        displayMods
      )
    );
    if (d?.addCritDmg) flat += d.addCritDmg;
    if (d?.critDmgMul != null && d.critDmgMul > 0 && Number.isFinite(d.critDmgMul)) {
      mul *= d.critDmgMul;
    }
  }
  const zCd = jsonFiniteNum(displayMods?.zealotCritDmgMul);
  if (zCd !== undefined && zCd > 1) {
    mul *= zCd;
  }
  return (
    Math.floor((mul - 1) * 100) + '%+' + String(Math.floor(flat))
  );
}

export function toSnapshot(row: CharacterRow): CharacterSnapshot {
  const inv = parseInventory(row.inventoryJson);
  const wh = warehouseToSnapshot(parseWarehouse(row.warehouseJson));
  const nowMs = Date.now();
  const effectiveLevel = levelFromTotalExp(row.exp);
  const expSeg = expSegmentForLevelBar(row.exp);
  const combat = computeCombatStats(
    effectiveLevel,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row)
  );
  const vit = computeVitals(
    effectiveLevel,
    row.race,
    row.classBranch,
    combat.con,
    combat.men
  );
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const worldTicked = tickWorldCombatState(
    parseWorldCombatState(row.worldCombatStateJson),
    maxMp,
    nowMs,
    combat.regenMp
  );
  const clanHallPassive = resolveClanHallPassiveBonus(row.clan ?? null);
  const maxHpChain = computeMaxHpChain({
    vitMaxHp: vit.maxHp,
    combat,
    clanHallBonus: clanHallPassive,
    applyBattleRoar: (base) =>
      effectiveMaxHpWithBattleRoar(row, base, worldTicked?.battleMods),
  });
  const maxHp = maxHpChain.maxHpWithClanHall;
  const hp = resolveHpWithClanHallPassive({
    storedHp: row.hp,
    maxHpWithoutClanHall: maxHpChain.maxHpWithoutClanHall,
    maxHpWithClanHall: maxHpChain.maxHpWithClanHall,
    clanHallBonus: clanHallPassive,
  });
  const l2ProfResolved = resolveL2ProfessionForSkillsRow(row);
  const learnedDetail = enrichLearnedSkillsForSnapshot(
    filterLearnedSkillEntriesForCharacter(
      normalizeLearnedSkillsJson(row.skillsLearnedJson),
      row.race,
      row.classBranch,
      l2ProfResolved
    ),
    row.race,
    row.classBranch
  );
  const focusAttackRank = focusAttackRankFromLearnedEntries(learnedDetail);
  const accuracyStanceRank =
    learnedDetail.find(
      (e) => canonicalBattleSkillId(e.battleId) === 'l2_256'
    )?.level ?? 1;
  const parryStanceRank =
    learnedDetail.find(
      (e) => canonicalBattleSkillId(e.battleId) === 'l2_339'
    )?.level ?? 1;
  const pAtk = effectiveBattlePatkDisplay(
    combat.pAtk,
    row.battleJson,
    worldTicked?.battleMods,
    accuracyStanceRank
  );
  const accuracy = effectiveBattleAccuracyDisplay(
    combat.accuracy,
    row.battleJson,
    worldTicked?.battleMods,
    accuracyStanceRank,
    parryStanceRank,
    focusAttackRank
  );
  const pAtkSpd = effectiveBattlePAtkSpdDisplay(
    combat.pAtkSpd,
    row.battleJson,
    worldTicked?.battleMods,
    parryStanceRank,
    equippedWeaponKind(inv)
  );
  const viciousRankDisplay = resolveViciousStanceEffectRank(
    viciousStanceRankFromLearnedEntries(learnedDetail),
    worldTicked?.battleMods
  );
  const critRate = effectiveBattleCritRateDisplay(
    combat.critRate,
    row.battleJson,
    worldTicked?.battleMods,
    viciousRankDisplay
  );
  const displayMods = mergeDisplayBattleMods(
    row.battleJson,
    worldTicked?.battleMods
  );
  const pDef = effectiveBattlePDefDisplay(
    combat.pDef,
    row.battleJson,
    worldTicked?.battleMods,
    parryStanceRank
  );
  const mDef = effectiveBattleMDefDisplay(
    combat.mDef,
    row.battleJson,
    worldTicked?.battleMods,
    parryStanceRank
  );
  const mAtk = effectiveBattleMatkDisplay(
    combat.mAtk,
    row.battleJson,
    worldTicked?.battleMods
  );
  const clanHallStatFlats = applyClanHallPassiveFlat(
    {
      pAtk,
      mAtk,
      pDef,
      mDef,
      maxHp: 0,
    },
    clanHallPassive
  );
  const pAtkOut = clanHallStatFlats.pAtk;
  const mAtkOut = clanHallStatFlats.mAtk;
  const pDefOut = clanHallStatFlats.pDef;
  const mDefOut = clanHallStatFlats.mDef;
  const maxHpOut = maxHp;
  const maxCp = Math.max(0, Math.floor(vit.maxCp * combat.buffMaxCpMul));
  /** У PvE урон по HP не знімає CP. Зниження CP — лише для ПК (окремий стан, коли з’явиться). */
  const battleCp = readBattlePlayerCp(row.battleJson);
  const cp =
    battleCp != null
      ? Math.min(maxCp, Math.max(0, Math.floor(battleCp)))
      : maxCp;
  const battleMp = readBattlePlayerMp(row.battleJson);
  const mp =
    battleMp != null
      ? Math.min(maxMp, Math.max(0, Math.floor(battleMp)))
      : worldTicked
        ? Math.min(maxMp, Math.max(0, Math.floor(worldTicked.playerMp)))
        : maxMp;
  const runSpeed = effectiveBattleRunSpeedDisplay(
    combat.runSpeed,
    row.battleJson,
    worldTicked?.battleMods
  );
  const mapMoveSpeed = mapMoveSpeedFromRunSpeed(runSpeed);
  const mapMoving = row.targetX !== 0 || row.targetY !== 0;
  const mapAngle =
    mapMoving
      ? mapAngleDeg(row.worldX, row.worldY, row.targetX, row.targetY)
      : 0;
  return {
    id: row.id,
    name: row.name,
    level: effectiveLevel,
    hp,
    maxHp: maxHpOut,
    cp,
    maxCp,
    mp,
    maxMp,
    cityId: row.cityId,
    race: row.race,
    classBranch: row.classBranch,
    gender: row.gender === 'female' ? 'female' : 'male',
    l2Profession: l2ProfResolved,
    adena: row.adena.toString(),
    exp: row.exp.toString(),
    expBarCur: expSeg.cur.toString(),
    expBarMax: expSeg.max.toString(),
    expBarPct: expSeg.pct,
    sp: row.sp,
    mobsKilled: Math.max(0, Math.floor(Number(row.mobsKilled) || 0)),
    profileStatus:
      row.profileStatus != null && String(row.profileStatus).trim()
        ? String(row.profileStatus).trim()
        : null,
    karma: Math.max(0, Math.floor(Number(row.karma) || 0)),
    pk: Math.max(0, Math.floor(Number(row.karma) || 0)),
    recommendations: 0,
    recommendationsLeft: 0,
    pvpWins: Math.max(0, Math.floor(Number(row.pvpWins) || 0)),
    pvpLosses: 0,
    revision: row.revision,
    lastUpdate: row.lastUpdate.toISOString(),
    activeDungeonId: parseDungeonStateJson(row.dungeonStateJson)?.dungeonId ?? null,
    inventory: inv,
    warehouse: wh,
    pAtk: pAtkOut,
    pDef: pDefOut,
    mAtk: mAtkOut,
    mDef: mDefOut,
    str: combat.str,
    int: combat.int,
    dex: combat.dex,
    wit: combat.wit,
    con: combat.con,
    men: combat.men,
    accuracy,
    evasion: effectiveBattleEvasionDisplay(
      combat.evasion,
      row.battleJson,
      worldTicked?.battleMods
    ),
    critRate,
    pAtkSpd,
    runSpeed,
    castSpd: combat.castSpd,
    shieldPDef: combat.shieldPDef,
    mCritPct: combat.mCritPct,
    magicCritDmgMul: combat.magicCritDmgMul,
    critDmgMul: combat.critDmgMul,
    stunResistPct: combat.stunResistPct,
    paralyzeResistPct: combat.paralyzeResistPct,
    debuffResistPct: combat.debuffResistPct,
    skillMpCostMul: combat.skillMpCostMul,
    addDebuffLandChancePct: combat.addDebuffLandChancePct,
    armorSetBonus: resolveActiveArmorSetProfile(inv),
    addCritDmg: combat.addCritDmg,
    addCritDisplay: addCritDisplayForProfile(
      combat,
      displayMods,
      learnedDetail,
      focusAttackRank
    ),
    weaponGradeMatchesArmor: combat.weaponGradeMatchesArmor,
    vampiricPct: combat.vampiricPct,
    reflectPct: isRiposteStanceActive(displayMods)
      ? RIPOSTE_REFLECT_PCT
      : combat.reflectPct,
    regenCp: combat.regenCp,
    regenHp: combat.regenHp,
    regenMp: combat.regenMp,
    worldX: row.worldX,
    worldY: row.worldY,
    targetX: row.targetX,
    targetY: row.targetY,
    mapMoving,
    mapAngle,
    mapMoveSpeed,
    learnedBattleSkills: parseLearnedBattleSkills(
      row.skillsLearnedJson,
      l2ProfResolved,
      row.race,
      row.classBranch
    ),
    learnedBattleSkillsDetail: learnedDetail,
    buffHeroicTier:
      row.buffHeroicTier === 1 ||
      row.buffHeroicTier === 2 ||
      row.buffHeroicTier === 3
        ? row.buffHeroicTier
        : null,
    buffZealotStacks:
      typeof row.buffZealotStacks === 'number' &&
      row.buffZealotStacks >= 1 &&
      row.buffZealotStacks <= 3
        ? Math.floor(row.buffZealotStacks)
        : null,
    activeBuffs: buildActiveBuffsSnapshot(row.activeBuffsJson, nowMs),
    skillCooldowns: buildSkillCooldownsSnapshot(row.skillCooldownsJson, nowMs),
    castableSelfBuffs: buildCastableSelfBuffs({
      learned: learnedDetail,
      l2Profession: l2ProfResolved,
      race: String(row.race ?? 'Human'),
      classBranch: String(row.classBranch ?? 'fighter'),
      activeBuffsJson: row.activeBuffsJson,
      skillCooldownsJson: row.skillCooldownsJson,
      nowMs,
    }),
    battleHotbarSlots: parseBattleHotbarSlots(row.battleHotbarJson),
    nickColor: nickColorFromKarmaRow(
      Math.max(0, Math.floor(Number(row.karma) || 0)),
      row.pvpAggressorUntilMs ?? 0,
      Date.now()
    ),
    pvpDefeat: (() => {
      const pending = parsePvpPendingDefeat(row.pvpPendingDefeatJson);
      if (!pending) return null;
      return {
        killerName: pending.killerName,
        killerCharacterId: pending.killerCharacterId,
        ...(pending.fullLog && pending.fullLog.length > 0
          ? { fullLog: pending.fullLog }
          : {}),
      };
    })(),
    pveDefeat: (() => {
      const pending = parsePvePendingDefeat(row.pvePendingDefeatJson);
      if (!pending) return null;
      return pvePendingDefeatToSummary(pending);
    })(),
    firstProfessionQuest: (() => {
      if (!isHumanFighter(row.race, row.classBranch)) return null;
      const prof =
        typeof row.l2Profession === 'string' && row.l2Profession.trim()
          ? row.l2Profession.trim()
          : 'human_fighter';
      if (prof !== 'human_fighter') return null;
      return firstProfessionQuestSnapshot(
        parseQuestProgressJson(row.questProgressJson),
        inv
      );
    })(),
    dailyQuests: dailyQuestsSnapshot(row.dailyQuestsJson, Date.now()),
    coinOfLuck: countBagQty(inv, COIN_OF_LUCK_ITEM_ID),
    heroPower: computeHeroPower({
      level: effectiveLevel,
      learnedSkillCount: learnedSkillCountForHeroPower(learnedDetail),
      str: combat.str,
      int: combat.int,
      dex: combat.dex,
      wit: combat.wit,
      con: combat.con,
      men: combat.men,
      statBonusPercent: heroPowerStatBonusPercent(
        effectiveLevel,
        row.race,
        row.classBranch,
        inv,
        combatOptsFromRow(row)
      ),
    }),
    clanId: row.clanId ?? null,
    clanName: row.clan?.name ?? null,
    clanEmblemId: row.clan?.emblemId ?? null,
    clanRole: row.clanRole ?? null,
    clanHallBonus: clanHallPassive
      ? {
          active: true,
          clanLevel: clanHallPassive.level,
          pAtk: clanHallPassive.pAtk,
          mAtk: clanHallPassive.mAtk,
          pDef: clanHallPassive.pDef,
          mDef: clanHallPassive.mDef,
          maxHp: clanHallPassive.maxHp,
        }
      : null,
  };
}
