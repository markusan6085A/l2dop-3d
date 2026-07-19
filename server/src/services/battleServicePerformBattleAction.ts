import {
  isPvpBattleJson,
  resolveBattleSpawnMeta,
} from '../domain/battlePvpContext.js';
import { shouldApplyWorldPvpPkRules } from '../domain/playerCombatMode.js';
import {
  applyBattleModsPatch,
  effectiveBattleMaxHp,
  jsonFiniteNum,
  type BattleActionId,
} from '../domain/battle.js';
import { mergeDisplayBattleMods } from '../domain/combatDisplayContext.js';
import { applyClanHallToCombatStats, computeMaxHpChain } from '../domain/characterClanHallVitals.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusInTx,
} from './characterClanHallVitals.js';
import { isPhysicalBattleSkillAction } from '../domain/battlePhysicalSkillBlock.js';
import {
  persistableActiveBuffsFromJson,
  type ActiveBuffEntry,
} from '../data/l2dopActiveBuffs.js';
import { activeBuffExpiresAt } from '../data/l2dopBuffDurations.js';
import { hateAuraBattleLogLineUk } from '../data/hateAuraTables.js';
import { provokeBattleLogLineUk } from '../data/provokeTables.js';
import {
  LEGACY_BUFF_EXPIRE_LOG_BY_SKILL_ID,
  LEGACY_BUFF_STRIP_BY_SKILL_ID,
} from '../domain/legacyBuffStrip.js';
import {
  cooldownSecForSkillId,
  markSkillCast,
  parseSkillCooldowns,
  skillCooldownReadyAtMs,
  type SkillCooldownEntry,
} from '../data/skillCooldowns.js';
import { resolveBattleSkillCooldownSec } from '../data/skillCooldownScaling.js';
import { humanFighterCatalogEntry } from '../data/humanFighterSkillCatalog.js';
import {
  parseWorldCombatState,
  hfStanceMpDrainForIntervalSec,
  stripStances,
  tickWorldCombatState,
} from '../domain/worldCombatState.js';
import {
  shieldFortressActiveRank,
  shieldFortressMpDrainForIntervalSec,
} from '../data/shieldFortressTables.js';
import {
  fortitudeActiveRank,
  fortitudeMpDrainForIntervalSec,
} from '../data/fortitudeTables.js';
import {
  focusSkillMasteryActiveRank,
  focusSkillMasteryMpDrainForIntervalSec,
} from '../data/focusSkillMasteryTables.js';
import {
  compactBattleSkillLogLineUk,
  formatBattleSkillLogLineForClient,
  l2SkillIdForBattleLogLine,
} from '../domain/battleLogFormat.js';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  basicAttackCooldownPatch,
} from '../domain/battleBasicAttackCooldown.js';
import {
  gameConflictFromCharacter,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
} from './charService.js';
import {
  computeCombatStats,
  computeCombatStatsOptionsForCharacter,
} from '../data/l2dopCombatFormulas.js';
import { stunResistPctFromCon } from '../data/l2dopPrimaryStatPipeline.js';
import { parseInventory, countBagQty, removeBagQty } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
  equippedWeaponKind,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { isPvpBowPhysicalAttack } from '../data/deflectArrowTables.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import {
  learnedBattleIdsFromEntries,
  normalizeLearnedSkillsJson,
} from '../data/humanFighterSkillCatalog.js';
import {
  applyDailyQuestBattleTurn,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
} from '../domain/dailyQuests.js';
import { mergeDailyQuestsJsonPatch } from './dailyQuestProgressService.js';
import {
  persistBattleDefeatInTx,
} from './battleServiceBattleOutcomeTx.js';
import { applyPvpHitToVictimInTx, applyPvpCpDrainToVictimInTx, applyPvpCpSetToVictimInTx, mirrorPvpPhysSkillsBlockToVictimInTx, mirrorPvpStunToVictimInTx, mirrorPvpTouchOfDeathToVictimInTx } from './battleServicePvpDamage.js';
import { appendPvpTurnHitLogsInTx } from './battleServicePvpBattleLog.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  mobEvasionForBattle,
} from './battleServiceDamageRolls.js';
import { battleActionAllowed } from './battleServiceBattleUi.js';
import type { BattleActionDeltaResponse, BattleActionResponse } from './battleServiceDeltaTypes.js';
import { logSkillCooldownApplied } from './battleServiceCooldown.js';
import { battleVersionFromState } from '../domain/battleVersion.js';
import {
  assertActionCooldownReady,
  mergeBattleCooldownMaps,
  syncMysticSkillCdUntilFromMerged,
} from '../domain/battleSkillCooldownResolve.js';
import { enrichPartialClientSnapshot, ensureClanHallOnRow } from './charClientSnapshot.js';
import { findCharacterForUserInTx } from './charResolveForUser.js';
import { persistPassiveAndMoveInTx } from './battleServiceApplyPassive.js';
import {
  isPartyBattleActionPath,
  lockPartyBattleSessionForActionInTx,
  peekPartyBattleIdFromBattleJson,
} from './party/partyBattleActionLock.js';
import { throwIfPartyBattleRouteBlocked } from '../domain/partyBattleFlags.js';
import {
  persistPartyBattleContinueTurnInTx,
  resolvePartyBattleStageBTestVictoryInTx,
} from './party/partyBattleOutcomeTx.js';
import { resolvePartyBattleVictoryInTx } from './party/partyBattleVictoryTx.js';
import { isPartyBattleRewardDistributionReady } from '../domain/partyBattleFlags.js';
import type { PartyBattleActionLockContext } from './party/partyBattleActionLock.js';
import { mobMaxCpFromMobMaxHp } from '../data/wrathSkillConstants.js';
import {
  computeAppliedCpHpDamage,
  readCharacterCpHpInTx,
  recordSiegeIncomingPvpHitInTx,
  type CharacterCpHpSnapshot,
} from './clanSiege/clanSiegeIncomingDamageService.js';
import {
  EARTHQUAKE_EXTRA_MOB_CAP,
  earthquakeWorldRadius,
} from '../data/earthquakeSkillConstants.js';
import {
  SHOCK_BLAST_EXTRA_MOB_CAP,
  shockBlastWorldRadius,
} from '../data/shockBlastSkillConstants.js';
import {
  applyPhysDamageToNearbyExtraMobs,
  applyHowlDebuffToNearbyExtraMobs,
  ensureHateAuraExtraMobs,
  ensureProvokeExtraMobs,
  ensureWhirlwindExtraMobs,
  stripProvokeDebuffFromExtraMobs,
  HOWL_EXTRA_MOB_CAP,
  SONIC_STORM_EXTRA_MOB_CAP,
  THUNDER_STORM_EXTRA_MOB_CAP,
  WHIRLWIND_EXTRA_MOB_CAP,
} from '../domain/battleWhirlwindExtras.js';
import {
  applyNearbyExtraMobKillLoot,
  type NearbyExtraMobEconomyPatch,
} from './battleNearbyExtraMobLoot.js';
import { FIGHTER_PHYSICAL_SOULSHOT_ITEM_IDS } from '../data/fighterPhysicalSoulshot.js';
import { MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS } from '../data/mysticBlessedSpiritshot.js';
import { applyBattlePotionHoTTicks } from '../domain/battleCombatPotions.js';
import {
  amplifyHealByReceivedPct,
  TOUCH_OF_LIFE_HEAL_RECEIVED_PCT,
} from '../data/touchOfLifeTables.js';
import {
  applyTouchOfLifeHoTTicks,
  clearTouchOfLifeHoT,
  startTouchOfLifeHoT as armTouchOfLifeHoT,
} from '../domain/touchOfLifeHoT.js';
import {
  restoreTouchOfDeathMobCp,
  restoreTouchOfDeathPlayerCp,
} from '../domain/battleSkills/touchOfDeathTurn.js';
import { consumeBowArrowsOnHit } from '../domain/battleBowArrowConsumption.js';
import {
  isMobUnableToAttackNow,
} from '../domain/battleMobControl.js';
import {
  applyMobCounterDamage,
  resolveMobShouldCounterAttack,
} from './battleServicePerformBattleAction.mobRetaliation.js';
import {
  persistBattleContinueFromTurn,
  resolveMobDeadVictoryInTx,
  wrapBattleDefeatAsDelta,
  type BattleContinueTurnBase,
  type BattleTurnPersistSide,
} from './battleServicePerformBattleAction.outcome.js';
import { executeBattleTurnResolve } from './battleServicePerformBattleAction.turnResolve.js';
import {
  isSharedWorldBossKind,
  recordWorldBossBattlePresenceInTx,
  recordWorldBossDamagingHitInTx,
  applyWorldBossAggressionTauntInTx,
  isWorldBossAutoAttackDueInTx,
  runWorldBossCombatTickInTx,
  flushWorldBossPendingMobHitsForCharacterInTx,
  resolveCanonicalWorldBossMobHpInTx,
  loadWorldBossSessionMobHp,
} from './worldBossSessionService.js';
import { refreshPvpOpponentHpForCharacterInTx } from './battleServicePvpSession.js';
import {
  BATTLE_REGEN_TICK_SECONDS,
  battleActionSkipsMobHp,
  stripLegacyBattleModsInPlace,
} from './battleServicePerformBattleAction.helpers.js';
import {
  applyBattleModsExpiresPatchInPlace,
  applySonicChargesPatchInPlace,
  mergeMysticSkillCdUntilPatchIntoCooldownRows,
} from './battleServicePerformBattleAction.turnPatches.js';

function catalogEntryCategory(entry: unknown): string | null | undefined {
  if (!entry || typeof entry !== 'object') return undefined;
  const c = (entry as { category?: unknown }).category;
  return typeof c === 'string' ? c : undefined;
}

export async function performBattleActionInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  action: BattleActionId,
  expectedRevision: number,
  opts?: {
    characterId?: string | null;
    battleSpawnId?: string | null;
    fighterSoulshotItemId?: number;
    mysticSpiritshotItemId?: number;
    battlePotionItemId?: number;
  }
): Promise<BattleActionResponse> {
    let char = await findCharacterForUserInTx(tx, userId, {
      characterId: opts?.characterId,
      battleSpawnId: opts?.battleSpawnId,
      include: { clan: { select: { name: true, hallBlessingAt: true, level: true } } },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw gameConflictFromCharacter(char);

    const partyBattleIdPeek =
      peekPartyBattleIdFromBattleJson((char as CharacterRow).battleJson) ??
      parseBattleJson((char as CharacterRow).battleJson)?.partyBattleId ??
      null;
    const partyActionPath = isPartyBattleActionPath(
      (char as CharacterRow).battleJson,
      partyBattleIdPeek
    );
    const bjPeekPrePassive = parseBattleJson((char as CharacterRow).battleJson);
    const pvpActionPath =
      bjPeekPrePassive != null && isPvpBattleJson(bjPeekPrePassive);

    if (!partyActionPath && !pvpActionPath) {
      char = await persistPassiveAndMoveInTx(tx, char as CharacterRow);
    }

    char = await flushWorldBossPendingMobHitsForCharacterInTx(
      tx,
      char as CharacterRow,
      Date.now()
    );

    char = await refreshPvpOpponentHpForCharacterInTx(tx, char as CharacterRow);

    const bjPeekAfterFlush = parseBattleJson((char as CharacterRow).battleJson);
    if (!bjPeekAfterFlush) {
      const snapAfterFlushEarly = toSnapshot(
        await ensureClanHallOnRow(char as CharacterRow, tx)
      );
      if (snapAfterFlushEarly.pveDefeat) {
        return wrapBattleDefeatAsDelta({
          character: snapAfterFlushEarly,
          defeat: snapAfterFlushEarly.pveDefeat,
        });
      }
      throw new Error('battle_none');
    }

    if (char.revision !== expectedRevision) {
      throw gameConflictFromCharacter(char);
    }

    /** Після flush pending-ударів РБ revision не змінюється, але char могло оновитись. */
    const writeRevision = char.revision;

    const bj = parseBattleJson((char as CharacterRow).battleJson);
    if (!bj) {
      const snapAfterFlush = toSnapshot(
        await ensureClanHallOnRow(char as CharacterRow, tx)
      );
      if (snapAfterFlush.pveDefeat) {
        return wrapBattleDefeatAsDelta({
          character: snapAfterFlush,
          defeat: snapAfterFlush.pveDefeat,
        });
      }
      throw new Error('battle_none');
    }

    const spawn = resolveBattleSpawnMeta(bj);
    if (!spawn) throw new Error('battle_spawn_gone');

    let partyBattleCtx: PartyBattleActionLockContext | null = null;
    let partyBattleMobHpAtTurnOpen = 0;
    const crEarly = char as CharacterRow;
    if (partyActionPath && partyBattleIdPeek) {
      throwIfPartyBattleRouteBlocked();
      partyBattleCtx = await lockPartyBattleSessionForActionInTx(tx, {
        sessionId: partyBattleIdPeek,
        characterId: crEarly.id,
        spawnId: spawn.spawnId,
        charRow: crEarly,
      });
      char = partyBattleCtx.char;
      if (partyBattleCtx.session.mobHp <= 0) {
        throw new Error('party_battle_session_not_active');
      }
      partyBattleMobHpAtTurnOpen = partyBattleCtx.session.mobHp;
    }

    let inv = parseInventory((char as CharacterRow).inventoryJson);
    let inventoryDirty = false;
    const preLevel = levelFromTotalExp(char.exp);
    const cr = char as CharacterRow;
    const charRowAtTurnOpen = cr;
    /** Профільні боїві стати (+ світові бафи). Не змішувати з `st.battleMods` — вони лише в кидках урону. */
    const combatBase = computeCombatStats(
      preLevel,
      char.race,
      char.classBranch,
      inv,
      combatOptsFromRow(cr)
    );
    const clanHallPassive = await resolveClanHallBonusInTx(tx, cr);
    const combat = applyClanHallToCombatStats(combatBase, clanHallPassive);
    const vitalsBundle = computeCharacterVitalsBundle({
      row: cr,
      clanHallBonus: clanHallPassive,
      battleMods: bj.battleMods,
    });
    const maxHpEff = vitalsBundle.maxHpChain.maxHpWithClanHall;
    const maxMpEff = vitalsBundle.maxMp;

    const profAct = resolveL2ProfessionForSkillsRow(cr);
    const learnedEntries = filterLearnedSkillEntriesForCharacter(
      normalizeLearnedSkillsJson(char.skillsLearnedJson),
      char.race,
      char.classBranch,
      profAct
    );
    const learnedBattle = learnedBattleIdsFromEntries(learnedEntries);
    const learnedSkillLevelByBattleId: Record<string, number> = {};
    for (const e of learnedEntries) {
      if (e.level >= 1) learnedSkillLevelByBattleId[e.battleId] = e.level;
    }
    if (
      !battleActionAllowed(
        action,
        preLevel,
        char.race,
        char.classBranch,
        learnedBattle,
        profAct,
        inv
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }

    let st = { ...bj };
    if (partyBattleCtx) {
      st.mobHp = partyBattleCtx.session.mobHp;
      st.partyBattleId = partyBattleCtx.session.id;
      st.battleVersion = partyBattleCtx.session.battleVersion;
    }
    const worldBossBattle = isSharedWorldBossKind(spawn.kind);
    if (worldBossBattle) {
      const presenceMs = Date.now();
      await recordWorldBossBattlePresenceInTx(
        tx,
        spawn.spawnId,
        cr.id,
        presenceMs
      );
      const sharedHp = await resolveCanonicalWorldBossMobHpInTx(
        tx,
        spawn.spawnId,
        st.mobMaxHp,
        st.mobHp
      );
      st.mobHp = sharedHp;
    }
    const log = [...st.log];
    const initialLogLen = log.length;
    /** У бою беремо HP з колонки БД (урон уже персиститься на continue), без clan-hall «bump». */
    const battleHpCap = effectiveBattleMaxHp(maxHpEff, st.battleMods);
    let playerHp = Math.min(
      battleHpCap,
      Math.max(0, Math.floor(char.hp))
    );
    let mobHp = st.mobHp;

    let currentMp =
      typeof st.playerMp === 'number' && Number.isFinite(st.playerMp)
        ? st.playerMp
        : maxMpEff;
    currentMp = Math.min(maxMpEff, Math.max(0, Math.floor(currentMp)));
    const initialMp = currentMp;

    const mobEva = mobEvasionForBattle(st, spawn.level);
    const maxHpBattle = effectiveBattleMaxHp(maxHpEff, st.battleMods);
    /** Ті самі `battleMods`, що й у профілі (`toSnapshot`): злиття battleJson + worldCombatStateJson. */
    const wTickForBattleMods = tickWorldCombatState(
      parseWorldCombatState((char as CharacterRow).worldCombatStateJson),
      maxMpEff,
      Date.now(),
      combat.regenMp
    );
    const modsForPlayerPhysicalRoll = mergeDisplayBattleMods(
      st,
      wTickForBattleMods?.battleMods,
      st.battleMods
    );
    const nowMsTurn = Date.now();
    if (st.battleMods) {
      const sleepUntil = jsonFiniteNum(st.battleMods.mobSleepUntilMs);
      if (sleepUntil !== undefined && sleepUntil <= nowMsTurn) {
        delete st.battleMods.mobSleepUntilMs;
        delete st.battleMods.mobSleepIconSkillId;
      }
      const stunUntil = jsonFiniteNum(st.battleMods.mobStunUntilMs);
      if (stunUntil !== undefined && stunUntil <= nowMsTurn) {
        delete st.battleMods.mobStunUntilMs;
        delete st.battleMods.mobStunIconSkillId;
      }
      const slowUntil = jsonFiniteNum(st.battleMods.mobRunSpeedDebuffUntilMs);
      if (slowUntil !== undefined && slowUntil <= nowMsTurn) {
        delete st.battleMods.mobRunSpeedDebuffMul;
        delete st.battleMods.mobRunSpeedDebuffUntilMs;
        delete st.battleMods.mobRunSpeedDebuffIconSkillId;
      }
      const playerStunUntil = jsonFiniteNum(st.battleMods.playerStunUntilMs);
      if (playerStunUntil !== undefined && playerStunUntil <= nowMsTurn) {
        delete st.battleMods.playerStunUntilMs;
        delete st.battleMods.playerStunIconSkillId;
      }
      const mobPhysBlockUntil = jsonFiniteNum(
        st.battleMods.mobPhysSkillsBlockedUntilMs
      );
      if (mobPhysBlockUntil !== undefined && mobPhysBlockUntil <= nowMsTurn) {
        delete st.battleMods.mobPhysSkillsBlockedUntilMs;
        delete st.battleMods.mobPhysSkillsBlockedIconSkillId;
      }
      const playerPhysBlockUntil = jsonFiniteNum(
        st.battleMods.playerPhysSkillsBlockedUntilMs
      );
      if (
        playerPhysBlockUntil !== undefined &&
        playerPhysBlockUntil <= nowMsTurn
      ) {
        delete st.battleMods.playerPhysSkillsBlockedUntilMs;
        delete st.battleMods.playerPhysSkillsBlockedIconSkillId;
      }
    }
    const playerStunActive = jsonFiniteNum(st.battleMods?.playerStunUntilMs);
    if (
      playerStunActive !== undefined &&
      playerStunActive > nowMsTurn
    ) {
      throw new Error('battle_player_stunned');
    }
    const playerPhysBlockActive = jsonFiniteNum(
      st.battleMods?.playerPhysSkillsBlockedUntilMs
    );
    if (
      playerPhysBlockActive !== undefined &&
      playerPhysBlockActive > nowMsTurn &&
      isPhysicalBattleSkillAction(action, char.classBranch)
    ) {
      throw new Error('battle_phys_skills_blocked');
    }
    const activeBuffsPre = persistableActiveBuffsFromJson(
      (char as CharacterRow).activeBuffsJson,
      nowMsTurn
    );
    let activeBuffsForTurn = activeBuffsPre.slice();

    /**
     * Перед обробкою дії: єдиний merged cooldown map (json + mystic, max на ключ).
     */
    {
      const mergedCd = mergeBattleCooldownMaps(
        char as CharacterRow,
        st,
        nowMsTurn
      );
      syncMysticSkillCdUntilFromMerged(st, mergedCd);
    }

    assertActionCooldownReady({
      characterId: char.id,
      row: char as CharacterRow,
      st,
      action,
      nowMs: nowMsTurn,
    });

    /**
     * Generic expire-tick для legacy-бафів з `st.battleModsExpiresAtMsBySkillId`:
     * для кожного skillId, чий `expiresAt <= now`, викликаємо strip-функцію
     * з `LEGACY_BUFF_STRIP_BY_SKILL_ID`, знімаючи відповідні поля з `battleMods`,
     * і видаляємо запис з мапи. Покриває Focus Attack (317), Rage (94),
     * Frenzy (176), Guts (139), Lionheart (287), Howl (116), weakness-детекти,
     * Dash (4), Rapid Shot (99), Snipe (313), Eye of Hunter/Slayer (359/360).
     * Zealot/War Cry/Battle Roar/Thrill Fight — через свої канали (activeBuffsJson
     * або окремий `stripExpiredZealotFromBattleMods`).
     */
    if (st.battleModsExpiresAtMsBySkillId && st.battleMods) {
      const mods = { ...st.battleMods };
      const nextMap: Record<string, number> = {
        ...st.battleModsExpiresAtMsBySkillId,
      };
      let anyChange = false;
      for (const [key, expiresAt] of Object.entries(nextMap)) {
        if (typeof expiresAt !== 'number' || expiresAt > nowMsTurn) continue;
        const sid = parseInt(key, 10);
        if (!Number.isFinite(sid) || sid <= 0) {
          delete nextMap[key];
          anyChange = true;
          continue;
        }
        const strip = LEGACY_BUFF_STRIP_BY_SKILL_ID[sid];
        if (strip) strip(mods);
        if (sid === 286) stripProvokeDebuffFromExtraMobs(st);
        if (sid === 341) clearTouchOfLifeHoT(st);
        if (sid === 342) {
          restoreTouchOfDeathMobCp(st);
          restoreTouchOfDeathPlayerCp(st);
        }
        delete nextMap[key];
        anyChange = true;
        const logLine = LEGACY_BUFF_EXPIRE_LOG_BY_SKILL_ID[sid];
        if (logLine) log.push(logLine);
      }
      if (anyChange) {
        st.battleMods = mods;
        if (Object.keys(nextMap).length === 0) {
          delete st.battleModsExpiresAtMsBySkillId;
        } else {
          st.battleModsExpiresAtMsBySkillId = nextMap;
        }
      }
    }

    /**
     * Тогл-стійки та Shield Fortress витрачають MP між ходами.
     */
    {
      const lastTick = st.lastStanceTickMs ?? nowMsTurn;
      const dtSec = Math.max(0, (nowMsTurn - lastTick) / 1000);
      if (dtSec > 0) {
        const drain = hfStanceMpDrainForIntervalSec(st.battleMods, dtSec);
        if (drain > 0) {
          const before = currentMp;
          currentMp = Math.max(0, currentMp - drain);
          if (currentMp !== before) {
            st.playerMp = currentMp;
          }
          if (currentMp <= 0 && st.battleMods) {
            st.battleMods = stripStances(st.battleMods);
            log.push('MP вичерпано — toggle-ефекти знято.');
          }
        }
      }
      const sfRank = shieldFortressActiveRank(activeBuffsForTurn);
      if (sfRank != null && dtSec > 0 && currentMp > 0) {
        const sfDrain = shieldFortressMpDrainForIntervalSec(sfRank, dtSec);
        if (sfDrain > 0) {
          const before = currentMp;
          currentMp = Math.max(0, currentMp - sfDrain);
          if (currentMp !== before) {
            st.playerMp = currentMp;
          }
          if (currentMp <= 0) {
            activeBuffsForTurn = activeBuffsForTurn.filter(
              (b) => Math.floor(Number(b.skillId)) !== 322
            );
            log.push('MP вичерпано — Фортеця щита вимкнена.');
          }
        }
      }
      const ftRank = fortitudeActiveRank(activeBuffsForTurn);
      if (ftRank != null && dtSec > 0 && currentMp > 0) {
        const ftDrain = fortitudeMpDrainForIntervalSec(ftRank, dtSec);
        if (ftDrain > 0) {
          const before = currentMp;
          currentMp = Math.max(0, currentMp - ftDrain);
          if (currentMp !== before) {
            st.playerMp = currentMp;
          }
          if (currentMp <= 0) {
            activeBuffsForTurn = activeBuffsForTurn.filter(
              (b) => Math.floor(Number(b.skillId)) !== 335
            );
            log.push('MP вичерпано — Стійкість вимкнена.');
          }
        }
      }
      const fsmRank = focusSkillMasteryActiveRank(
        activeBuffsForTurn,
        st.battleMods?.raceToggleRanks
      );
      if (fsmRank != null && dtSec > 0 && currentMp > 0) {
        const fsmDrain = focusSkillMasteryMpDrainForIntervalSec(fsmRank, dtSec);
        if (fsmDrain > 0) {
          const before = currentMp;
          currentMp = Math.max(0, currentMp - fsmDrain);
          if (currentMp !== before) {
            st.playerMp = currentMp;
          }
          if (currentMp <= 0) {
            activeBuffsForTurn = activeBuffsForTurn.filter(
              (b) => Math.floor(Number(b.skillId)) !== 334
            );
            log.push('MP вичерпано — Фокус майстерності скілів вимкнено.');
          }
        }
      }
      st.lastStanceTickMs = nowMsTurn;
    }

    /**
     * Бойовий пасивний реген HP/MP пакетами по 2с (як у профілі): якщо між ходами
     * минув час, додаємо `regenHp/regenMp * secTicked` і зберігаємо `lastRegenTickMs`.
     */
    {
      const lastRegen = st.lastRegenTickMs ?? nowMsTurn;
      const elapsedMsRegen = Math.max(0, nowMsTurn - lastRegen);
      const secTicked =
        Math.floor(elapsedMsRegen / (BATTLE_REGEN_TICK_SECONDS * 1000)) *
        BATTLE_REGEN_TICK_SECONDS;
      if (secTicked > 0) {
        if (combat.regenHp > 0) {
          const cap = effectiveBattleMaxHp(maxHpEff, st.battleMods);
          playerHp = Math.min(cap, playerHp + combat.regenHp * secTicked);
        }
        if (combat.regenMp > 0) {
          currentMp = Math.min(maxMpEff, currentMp + combat.regenMp * secTicked);
          st.playerMp = currentMp;
        }
        st.lastRegenTickMs = lastRegen + secTicked * 1000;
      } else {
        st.lastRegenTickMs = lastRegen;
      }
    }

    {
      const healPctFromTol = activeBuffsForTurn.some((b) => b.skillId === 341)
        ? TOUCH_OF_LIFE_HEAL_RECEIVED_PCT
        : 0;
      const ho = applyBattlePotionHoTTicks({
        nowMs: nowMsTurn,
        st,
        playerHp,
        maxHpBattle,
        currentMp,
        maxMpEff,
        log,
      });
      playerHp = ho.playerHp;
      currentMp = ho.currentMp;
      playerHp = applyTouchOfLifeHoTTicks({
        nowMs: nowMsTurn,
        st,
        playerHp,
        maxHpBattle,
        healReceivedPct: healPctFromTol,
        log,
      });
      st.playerMp = currentMp;
    }

    /** HP-умовні пасиви (Final Frenzy 290, Final Fortress 291) — за поточним HP у бою. */
    const combatForTurn = computeCombatStats(
      preLevel,
      char.race,
      char.classBranch,
      inv,
      computeCombatStatsOptionsForCharacter({
        ...(char as CharacterRow),
        hp: playerHp,
        maxHp: maxHpBattle,
      })
    );

    let spawnStunResistPct = spawn.stunResistPct;
    if (isPvpBattleJson(st) && st.pvpTargetCharacterId) {
      const victimRow = await tx.character.findFirst({
        where: { id: st.pvpTargetCharacterId },
        select: {
          race: true,
          classBranch: true,
          exp: true,
          inventoryJson: true,
          skillsLearnedJson: true,
          activeBuffsJson: true,
        },
      });
      if (victimRow) {
        const victimInv = parseInventory(victimRow.inventoryJson);
        const victimCombat = computeCombatStats(
          levelFromTotalExp(victimRow.exp),
          victimRow.race,
          victimRow.classBranch,
          victimInv,
          combatOptsFromRow(victimRow as CharacterRow)
        );
        spawnStunResistPct = stunResistPctFromCon(victimCombat.con);
      }
    }


    const turnResolved = executeBattleTurnResolve({
      action,
      preLevel,
      race: char.race,
      classBranch: char.classBranch,
      profAct,
      combat: combatForTurn,
      st,
      spawnLevel: spawn.level,
      spawnStunResistPct,
      spawnDebuffResistPct: spawn.debuffResistPct,
      spawnMobName: spawn.name,
      spawnKind: spawn.kind,
      playerHp,
      maxHpBattle,
      maxMpEff,
      currentMp,
      mobEva,
      inv,
      learnedSkillLevelByBattleId,
      activeBuffsPre: activeBuffsForTurn,
      modsForPlayerPhysicalRoll,
      nowMsTurn,
      log,
      opts,
    });
    inv = turnResolved.inv;
    inventoryDirty = turnResolved.inventoryDirty || inventoryDirty;
    playerHp = turnResolved.playerHp;
    currentMp = turnResolved.currentMp;
    const resolvedTurn = turnResolved.resolvedTurn;

    let {
      mpCost,
      pDmg,
      skillLine,
      physOutcome,
      magicOutcome,
      battleModsPatch,
      playerHeal,
      playerHpCost,
      weaknessLogLineUk,
      mysticSkillCdUntilPatch,
      mobCpDrain,
      mobMaxCpSet,
      touchOfDeathStripAllTargetBuffs,
      activeBuffPatch,
      battleModsExpiresPatch,
      sonicChargesPatch,
      playerDamageLogLines,
      skipMobCounterAttackOnce,
      mobRetaliationDelayHits,
      playerHealSourceUk,
      playerHpCostSourceUk,
      playerHpCostBeforeHeal,
      startTouchOfLifeHoT,
      worldBossTaunt,
      lethalShotProc,
      skipStandardCooldown,
    } = resolvedTurn;

    let whirlwindExtraHitNames: string[] | undefined;
    let thunderStormExtraHitNames: string[] | undefined;
    let earthquakeExtraHitNames: string[] | undefined;
    let shockBlastExtraHitNames: string[] | undefined;

    if (battleActionSkipsMobHp(action, char.race, char.classBranch)) {
      pDmg = 0;
      physOutcome = null;
    }

    const mpCostEff =
      mpCost <= 0
        ? 0
        : Math.max(1, Math.round(mpCost * combat.skillMpCostMul));

    if (currentMp < mpCostEff) {
      throw new Error('battle_low_mp');
    }
    currentMp -= mpCostEff;
    st.playerMp = currentMp;
    if (action === 'attack' && isFighterClassBranch(char.classBranch)) {
      st.lastPlayerAttackAtMs = Date.now();
    }

    if (
      mysticSkillCdUntilPatch &&
      Object.keys(mysticSkillCdUntilPatch).length > 0
    ) {
      st.mysticSkillCdUntil = {
        ...(st.mysticSkillCdUntil ?? {}),
        ...mysticSkillCdUntilPatch,
      };
    }
    {
      const basicCdPatch = basicAttackCooldownPatch(action, nowMsTurn);
      if (basicCdPatch) {
        st.mysticSkillCdUntil = {
          ...(st.mysticSkillCdUntil ?? {}),
          ...basicCdPatch,
        };
        mysticSkillCdUntilPatch = {
          ...(mysticSkillCdUntilPatch ?? {}),
          ...basicCdPatch,
        };
      }
    }

    /**
     * Персист КД з `mysticSkillCdUntilPatch` (ключі `l2_<id>` → readyAt ms).
     * Генерик-канал: будь-який хендлер, що встановив КД на скіл через цей патч,
     * автоматично отримує персистенцію в `skillCooldownsJson` — переживає F5 / вихід з бою.
     * Використовується, зокрема, для Focus Attack (317).
     */
    let cooldownsChanged = false;
    let nextCooldowns: SkillCooldownEntry[] = parseSkillCooldowns(
      (char as CharacterRow).skillCooldownsJson,
      nowMsTurn
    );
    const cdFromMysticPatch = mergeMysticSkillCdUntilPatchIntoCooldownRows(
      nextCooldowns,
      mysticSkillCdUntilPatch,
      nowMsTurn
    );
    nextCooldowns = cdFromMysticPatch.rows;
    cooldownsChanged = cdFromMysticPatch.changed;
    if (cdFromMysticPatch.changed && mysticSkillCdUntilPatch) {
      const bvLog = battleVersionFromState(st);
      for (const [skillKey, untilMs] of Object.entries(mysticSkillCdUntilPatch)) {
        if (typeof untilMs !== 'number' || !Number.isFinite(untilMs)) continue;
        if (untilMs <= nowMsTurn) continue;
        logSkillCooldownApplied({
          characterId: char.id,
          skillId: skillKey,
          nowMs: nowMsTurn,
          cooldownUntilMs: untilMs,
          battleVersion: bvLog,
        });
      }
    }

    const prevRoarMul = st.battleMods?.battleRoarMaxHpMul ?? 1;
    const mergedMods = applyBattleModsPatch(st.battleMods, battleModsPatch);
    if (mergedMods === undefined) {
      delete st.battleMods;
      delete st.warCryPatkMul;
    } else {
      st.battleMods = mergedMods;
      const wSync = jsonFiniteNum(mergedMods.warCryPatkMul);
      if (wSync !== undefined && wSync > 1) {
        st.warCryPatkMul = wSync;
      } else {
        delete st.warCryPatkMul;
      }
    }

    if (isPvpBattleJson(st) && st.pvpTargetCharacterId) {
      await mirrorPvpStunToVictimInTx(tx, {
        victimId: st.pvpTargetCharacterId,
        attackerId: char.id,
        stunUntilMs: jsonFiniteNum(st.battleMods?.mobStunUntilMs),
        iconSkillId: jsonFiniteNum(st.battleMods?.mobStunIconSkillId),
        nowMs: nowMsTurn,
      });
      await mirrorPvpPhysSkillsBlockToVictimInTx(tx, {
        victimId: st.pvpTargetCharacterId,
        attackerId: char.id,
        blockUntilMs: jsonFiniteNum(st.battleMods?.mobPhysSkillsBlockedUntilMs),
        iconSkillId: jsonFiniteNum(st.battleMods?.mobPhysSkillsBlockedIconSkillId),
        nowMs: nowMsTurn,
      });
      await mirrorPvpTouchOfDeathToVictimInTx(tx, {
        victimId: st.pvpTargetCharacterId,
        attackerId: char.id,
        untilMs: jsonFiniteNum(st.battleMods?.mobTouchOfDeathUntilMs),
        iconSkillId: jsonFiniteNum(st.battleMods?.mobTouchOfDeathIconSkillId),
        debuffResistPenaltyPct: jsonFiniteNum(
          st.battleMods?.mobTouchOfDeathDebuffResistPenaltyPct
        ),
        healReceivedPenaltyPct: jsonFiniteNum(
          st.battleMods?.mobTouchOfDeathHealReceivedPenaltyPct
        ),
        maxCpSet: typeof mobMaxCpSet === 'number' ? mobMaxCpSet : undefined,
        maxCpBaseline: jsonFiniteNum(st.battleMods?.touchOfDeathMobMaxCpBaseline),
        stripAllBuffs: touchOfDeathStripAllTargetBuffs === true,
        nowMs: nowMsTurn,
      });
    }

    applyBattleModsExpiresPatchInPlace(
      st,
      battleModsExpiresPatch,
      nowMsTurn
    );

    applySonicChargesPatchInPlace(st, sonicChargesPatch);

    /**
     * `activeBuffPatch` з in-battle каста (War Cry 78 / Battle Roar 121 / Thrill Fight 130):
     * єдине джерело — `activeBuffsJson`. Одночасно чистимо відповідні legacy-поля в
     * `battleMods`, щоб не було подвійного застосування з `combatBuffsFromActiveJson`.
     *
     * Також ставимо кулдаун: `skillCooldownsJson` (переживає вихід з бою / F5) + дзеркало
     * в `st.mysticSkillCdUntil['l2_<id>']`, яке читає хотбар (`battle-hotbar.js` →
     * `applySkillCdOverlay`) — кругова чорна смужка + секунди поверх кнопки скіла.
     */
    let nextActiveBuffs: ActiveBuffEntry[] = activeBuffsForTurn.slice();
    let activeBuffsChanged = false;
    if (activeBuffPatch) {
      const { skillId, level, action: patchAction } = activeBuffPatch;
      stripLegacyBattleModsInPlace(st.battleMods, skillId);
      if (patchAction === 'remove') {
        nextActiveBuffs = nextActiveBuffs.filter((b) => b.skillId !== skillId);
      } else {
        const exp =
          typeof activeBuffPatch.expiresAtMs === 'number' &&
          Number.isFinite(activeBuffPatch.expiresAtMs)
            ? Math.floor(activeBuffPatch.expiresAtMs)
            : activeBuffExpiresAt(skillId, nowMsTurn);
        const entry: ActiveBuffEntry =
          exp !== undefined
            ? { skillId, level, expiresAt: exp }
            : { skillId, level };
        const idx = nextActiveBuffs.findIndex((b) => b.skillId === skillId);
        if (idx >= 0) {
          nextActiveBuffs[idx] = entry;
        } else {
          nextActiveBuffs.push(entry);
        }
        const buffEntry = humanFighterCatalogEntry('l2_' + skillId);
        const rawCd = buffEntry?.cooldownSec ?? cooldownSecForSkillId(skillId);
        const cdSec =
          rawCd !== undefined && rawCd > 0
            ? resolveBattleSkillCooldownSec({
                classBranch: char.classBranch,
                category: catalogEntryCategory(buffEntry),
                kind: buffEntry?.kind,
                skillRank: level,
                baseCdSec: rawCd,
                l2SkillId: skillId,
                castSpd: combat.castSpd,
                pAtkSpd: combat.pAtkSpd,
                cooldownReductionMul: combat.cooldownReductionMul,
              })
            : undefined;
        if (
          cdSec !== undefined &&
          cdSec > 0 &&
          skipStandardCooldown !== true
        ) {
          nextCooldowns = markSkillCast(
            nextCooldowns,
            skillId,
            cdSec,
            nowMsTurn
          );
          const readyAt = skillCooldownReadyAtMs(nowMsTurn, cdSec);
          st.mysticSkillCdUntil = {
            ...(st.mysticSkillCdUntil ?? {}),
            ['l2_' + skillId]: readyAt,
          };
          cooldownsChanged = true;
        }
      }
      activeBuffsChanged = true;
    }

    if (startTouchOfLifeHoT) {
      armTouchOfLifeHoT(st, nowMsTurn);
    }

    /**
     * Перелік Max HP після (можливого) додавання Battle Roar у `activeBuffsJson`.
     * Heal-delta на нову межу Max HP — як у L2 Interlude (миттєвий хіл на приріст).
     */
    let maxHpEffAfter = maxHpEff;
    if (
      activeBuffPatch &&
      activeBuffPatch.skillId === 121 &&
      activeBuffPatch.action === 'add'
    ) {
      const crPatched: CharacterRow = {
        ...(char as CharacterRow),
        activeBuffsJson:
          nextActiveBuffs as unknown as CharacterRow['activeBuffsJson'],
      };
      const combat2Raw = computeCombatStats(
        preLevel,
        char.race,
        char.classBranch,
        inv,
        combatOptsFromRow(crPatched)
      );
      const vit2 = computeVitals(
        preLevel,
        char.race,
        char.classBranch,
        combat2Raw.con,
        combat2Raw.men
      );
      maxHpEffAfter = computeMaxHpChain({
        vitMaxHp: vit2.maxHp,
        combat: combat2Raw,
        clanHallBonus: clanHallPassive,
        applyBattleRoar: (base) => effectiveBattleMaxHp(base, st.battleMods),
      }).maxHpWithClanHall;
      const prevMaxWithBattleMods = effectiveBattleMaxHp(
        maxHpEff,
        st.battleMods
      );
      const newMaxWithBattleMods = effectiveBattleMaxHp(
        maxHpEffAfter,
        st.battleMods
      );
      const bonus = Math.max(0, newMaxWithBattleMods - prevMaxWithBattleMods);
      if (bonus > 0) {
        playerHp = Math.min(newMaxWithBattleMods, playerHp + bonus);
      }
    }

    const newRoarMul = st.battleMods?.battleRoarMaxHpMul ?? 1;
    if (newRoarMul > prevRoarMul) {
      const oldMax = Math.max(1, Math.floor(maxHpEff * prevRoarMul));
      const newMax = Math.max(1, Math.floor(maxHpEff * newRoarMul));
      const bonus = newMax - oldMax;
      playerHp = Math.min(newMax, playerHp + bonus);
    }
    playerHp = Math.min(
      effectiveBattleMaxHp(maxHpEffAfter, st.battleMods),
      playerHp
    );

    if (
      process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL === '1' &&
      partyBattleCtx &&
      action === 'attack' &&
      partyBattleMobHpAtTurnOpen <= 1
    ) {
      pDmg = Math.max(pDmg, partyBattleMobHpAtTurnOpen);
      if (pDmg > 0 && physOutcome === 'miss') {
        physOutcome = 'hit';
      }
    }

    mobHp = Math.max(0, mobHp - pDmg);

    const landedPhysicalHit =
      pDmg > 0 && physOutcome != null && physOutcome !== 'miss';
    const landedMagicHit =
      pDmg > 0 && magicOutcome != null && magicOutcome !== 'miss';
    const damagingPlayerHit = landedPhysicalHit || landedMagicHit;

    let siegeIncomingCpHpBefore: CharacterCpHpSnapshot | null = null;
    const siegeIncomingCtx =
      isPvpBattleJson(st) &&
      damagingPlayerHit &&
      st.pvpTargetCharacterId &&
      st.playerCombatMode === 'siege' &&
      st.siegeId
        ? {
            siegeId: String(st.siegeId),
            victimId: String(st.pvpTargetCharacterId),
          }
        : null;
    if (siegeIncomingCtx) {
      siegeIncomingCpHpBefore = await readCharacterCpHpInTx(
        tx,
        siegeIncomingCtx.victimId
      );
    }

    if (
      lethalShotProc === true &&
      damagingPlayerHit &&
      !isPvpBattleJson(st) &&
      mobHp > 1
    ) {
      mobHp = 1;
      st.mobHp = 1;
    }

    if (
      isPvpBattleJson(st) &&
      damagingPlayerHit &&
      st.pvpTargetCharacterId
    ) {
      const pvpNowMs = Date.now();
      let mirrorReflectKind: 'physical' | 'magic' | undefined;
      if (landedMagicHit) {
        mirrorReflectKind = 'magic';
      } else if (landedPhysicalHit && action !== 'attack') {
        mirrorReflectKind = 'physical';
      }
      const pvpHit = await applyPvpHitToVictimInTx(tx, {
        victimId: st.pvpTargetCharacterId,
        attackerId: char.id,
        damage: pDmg,
        nowMs: pvpNowMs,
        isBowAttack: isPvpBowPhysicalAttack(
          action,
          equippedWeaponKind(inv)
        ),
        mirrorReflectKind,
        applyWorldPkRules: shouldApplyWorldPvpPkRules(st),
      });
      if (pvpHit.mirrorLogLineUk) {
        log.push(pvpHit.mirrorLogLineUk);
      }
      if (typeof pvpHit.victimHp === 'number') {
        mobHp = pvpHit.victimHp;
        st.mobHp = mobHp;
      }
    }

    if (worldBossBattle && damagingPlayerHit) {
      let sessionDamage = pDmg;
      if (
        lethalShotProc === true &&
        !isPvpBattleJson(st) &&
        mobHp === 1 &&
        pDmg > 0
      ) {
        const sharedPre = await loadWorldBossSessionMobHp(tx, spawn.spawnId);
        if (sharedPre != null && sharedPre > 1) {
          sessionDamage = Math.min(pDmg, Math.max(0, sharedPre - 1));
        }
      }
      const hit = await recordWorldBossDamagingHitInTx(
        tx,
        spawn.spawnId,
        cr.id,
        sessionDamage,
        Date.now()
      );
      if (hit) {
        mobHp = hit.nextHp;
        st.mobHp = hit.nextHp;
        if (
          lethalShotProc === true &&
          !isPvpBattleJson(st) &&
          mobHp > 1 &&
          hit.damageApplied > 0
        ) {
          mobHp = 1;
          st.mobHp = 1;
        }
        if (hit.nextHp <= 0) {
          console.log('[rb-lethal]', {
            spawnId: spawn.spawnId,
            preHp: hit.preHp,
            damage: hit.damageApplied,
            nextMobHp: hit.nextHp,
            persistedMobHp: hit.session.mobHp,
            outcome: 'pending_victory',
            battleVersion: st.battleVersion ?? 0,
          });
        }
      } else {
        mobHp = 0;
        st.mobHp = 0;
      }
    }

    if (worldBossBattle && worldBossTaunt) {
      await applyWorldBossAggressionTauntInTx(
        tx,
        spawn.spawnId,
        cr.id,
        Date.now()
      );
    }

    if (landedPhysicalHit && magicOutcome == null) {
      const arrowUse = consumeBowArrowsOnHit(
        inv,
        action,
        char.race,
        char.classBranch,
      );
      if (arrowUse.consumed > 0) {
        inv = arrowUse.inv;
        inventoryDirty = true;
      }
    }

    if (
      isFighterClassBranch(char.classBranch) &&
      landedPhysicalHit &&
      magicOutcome == null &&
      st.battleMods
    ) {
      const ssMul = jsonFiniteNum(st.battleMods.fighterSoulshotPatkMul);
      const ssRaw = st.battleMods.fighterSoulshotItemId;
      const ssId =
        typeof ssRaw === 'number' && Number.isFinite(ssRaw)
          ? Math.floor(ssRaw)
          : undefined;
      if (
        ssMul !== undefined &&
        ssMul > 1 &&
        ssId !== undefined &&
        ssId > 0 &&
        FIGHTER_PHYSICAL_SOULSHOT_ITEM_IDS.has(ssId)
      ) {
        const needQty = action === 'attack' ? 1 : 2;
        const haveQty = countBagQty(inv, ssId);
        const take = Math.min(haveQty, needQty);
        if (take <= 0) {
          const bm = st.battleMods ? { ...st.battleMods } : {};
          delete bm.fighterSoulshotPatkMul;
          delete bm.fighterSoulshotItemId;
          if (Object.keys(bm).length === 0) {
            delete st.battleMods;
          } else {
            st.battleMods = bm;
          }
        } else {
          inv = removeBagQty(inv, ssId, take);
          inventoryDirty = true;
          const left = countBagQty(inv, ssId);
          if (take < needQty || left < 1) {
            const bm = st.battleMods ? { ...st.battleMods } : {};
            delete bm.fighterSoulshotPatkMul;
            delete bm.fighterSoulshotItemId;
            if (Object.keys(bm).length === 0) {
              delete st.battleMods;
            } else {
              st.battleMods = bm;
            }
            log.push(
              take < needQty
                ? 'Заряд душі вимкнено — не вистачило патронів для удару.'
                : 'Заряд душі вимкнено — патрони скінчились.'
            );
          }
        }
      }
    }

    if (isMysticClassBranch(char.classBranch) && damagingPlayerHit && st.battleMods) {
      const msMul = jsonFiniteNum(st.battleMods.mysticBlessedSpiritshotMatkMul);
      const msRaw = st.battleMods.mysticBlessedSpiritshotItemId;
      const msId =
        typeof msRaw === 'number' && Number.isFinite(msRaw)
          ? Math.floor(msRaw)
          : undefined;
      if (
        msMul !== undefined &&
        msMul > 1 &&
        msId !== undefined &&
        msId > 0 &&
        MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS.has(msId)
      ) {
        const needQty = 1;
        const haveQty = countBagQty(inv, msId);
        const take = Math.min(haveQty, needQty);
        if (take <= 0) {
          const bm = st.battleMods ? { ...st.battleMods } : {};
          delete bm.mysticBlessedSpiritshotMatkMul;
          delete bm.mysticBlessedSpiritshotItemId;
          if (Object.keys(bm).length === 0) {
            delete st.battleMods;
          } else {
            st.battleMods = bm;
          }
        } else {
          inv = removeBagQty(inv, msId, take);
          inventoryDirty = true;
          if (countBagQty(inv, msId) < 1) {
            const bm = st.battleMods ? { ...st.battleMods } : {};
            delete bm.mysticBlessedSpiritshotMatkMul;
            delete bm.mysticBlessedSpiritshotItemId;
            if (Object.keys(bm).length === 0) {
              delete st.battleMods;
            } else {
              st.battleMods = bm;
            }
            log.push('Благословений заряд духу вимкнено — патрони скінчились.');
          }
        }
      }
    }
    if (pDmg > 0 && st.battleMods) {
      const sleepUntil = jsonFiniteNum(st.battleMods.mobSleepUntilMs);
      if (sleepUntil !== undefined && sleepUntil > nowMsTurn) {
        delete st.battleMods.mobSleepUntilMs;
        delete st.battleMods.mobSleepIconSkillId;
        log.push('Сон знято: ціль прокинулась від урону.');
      }
    }
    if (action === 'whirlwind' && pDmg > 0 && !partyBattleCtx) {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId,
        WHIRLWIND_EXTRA_MOB_CAP
      );
      whirlwindExtraHitNames = applyPhysDamageToNearbyExtraMobs(st, pDmg);
      /** Після Вихору наступна базова автоатака також cleave'ить по додаткових цілях. */
      st.whirlwindNextAutoCleaveHits = 1;
    }
    if (action === 'sonic_storm' && pDmg > 0) {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId,
        SONIC_STORM_EXTRA_MOB_CAP
      );
      const extraHits = applyPhysDamageToNearbyExtraMobs(st, pDmg);
      if (extraHits.length > 0) {
        log.push(
          'Звукова буря вразила ворогів поруч: ' +
            extraHits.map((n) => n + ' −' + pDmg).join(', ') +
            '.'
        );
      }
    }
    if (action === 'thunder_storm' && pDmg > 0) {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId,
        THUNDER_STORM_EXTRA_MOB_CAP
      );
      thunderStormExtraHitNames = applyPhysDamageToNearbyExtraMobs(st, pDmg);
    }
    if (action === 'earthquake' && pDmg > 0) {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId,
        EARTHQUAKE_EXTRA_MOB_CAP,
        earthquakeWorldRadius()
      );
      earthquakeExtraHitNames = applyPhysDamageToNearbyExtraMobs(st, pDmg);
    }
    if (action === 'shock_blast' && pDmg > 0) {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId,
        SHOCK_BLAST_EXTRA_MOB_CAP,
        shockBlastWorldRadius()
      );
      shockBlastExtraHitNames = applyPhysDamageToNearbyExtraMobs(st, pDmg);
    }
    if (action === 'hate_aura') {
      const hateRank = Math.max(
        1,
        Math.floor(learnedSkillLevelByBattleId['l2_18'] ?? 1)
      );
      const pulled = ensureHateAuraExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId
      );
      const names = [spawn.name, ...pulled];
      log.push(hateAuraBattleLogLineUk(hateRank, names));
    }
    if (action === 'provoke') {
      const provokeRank = Math.max(
        1,
        Math.floor(learnedSkillLevelByBattleId['l2_286'] ?? 1)
      );
      const pulled = ensureProvokeExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId,
        provokeRank
      );
      const names = [spawn.name, ...pulled];
      log.push(provokeBattleLogLineUk(provokeRank, names));
    }
    if (action === 'howl') {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId,
        HOWL_EXTRA_MOB_CAP
      );
      const howlExtraNames = applyHowlDebuffToNearbyExtraMobs(st);
      const names = [spawn.name, ...howlExtraNames];
      log.push(
        'Звіриний рев ослабив P.Atk (−23%, 30 с): ' + names.join(', ') + '.'
      );
    }
    if (
      action === 'attack' &&
      pDmg > 0 &&
      st.whirlwindExtras &&
      st.whirlwindExtras.length > 0
    ) {
      const cleaveHits = applyPhysDamageToNearbyExtraMobs(st, pDmg);
      if (cleaveHits.length > 0) {
        log.push(
          'Древко розсікло ворогів поруч: ' +
            cleaveHits.map((n) => n + ' −' + pDmg).join(', ') +
            '.'
        );
      }
    }
    if (typeof mobCpDrain === 'number' && mobCpDrain > 0) {
      const mmc = st.mobMaxCp ?? mobMaxCpFromMobMaxHp(st.mobMaxHp);
      st.mobMaxCp = mmc;
      const cur = st.mobCp !== undefined ? st.mobCp : mmc;
      st.mobCp = Math.max(0, cur - mobCpDrain);
      if (isPvpBattleJson(st) && st.pvpTargetCharacterId) {
        await applyPvpCpDrainToVictimInTx(tx, {
          victimId: st.pvpTargetCharacterId,
          attackerId: char.id,
          cpDrain: mobCpDrain,
        });
      }
    }
    if (
      lethalShotProc === true &&
      damagingPlayerHit &&
      isPvpBattleJson(st)
    ) {
      const mmc = st.mobMaxCp ?? mobMaxCpFromMobMaxHp(st.mobMaxHp);
      st.mobMaxCp = mmc;
      st.mobCp = 1;
      if (st.pvpTargetCharacterId) {
        await applyPvpCpSetToVictimInTx(tx, {
          victimId: st.pvpTargetCharacterId,
          attackerId: char.id,
          cp: 1,
        });
      }
    }
    if (typeof mobMaxCpSet === 'number' && Number.isFinite(mobMaxCpSet) && mobMaxCpSet >= 0) {
      st.mobMaxCp = Math.floor(mobMaxCpSet);
      const cur =
        typeof st.mobCp === 'number' && Number.isFinite(st.mobCp)
          ? Math.max(0, Math.floor(st.mobCp))
          : st.mobMaxCp;
      st.mobCp = Math.min(cur, st.mobMaxCp);
    }
    if (siegeIncomingCtx && siegeIncomingCpHpBefore) {
      const cpHpAfter = await readCharacterCpHpInTx(tx, siegeIncomingCtx.victimId);
      if (cpHpAfter) {
        const appliedDamage = computeAppliedCpHpDamage(
          siegeIncomingCpHpBefore,
          cpHpAfter
        );
        if (appliedDamage > 0) {
          await recordSiegeIncomingPvpHitInTx(tx, {
            siegeId: siegeIncomingCtx.siegeId,
            victimCharacterId: siegeIncomingCtx.victimId,
            attackerCharacterId: char.id,
            attackerName: char.name,
            appliedDamage,
            nowMs: Date.now(),
          });
        }
      }
    }
    if (skillLine) {
      const compact = compactBattleSkillLogLineUk(skillLine);
      const skillHit =
        pDmg > 0 ||
        (playerDamageLogLines != null && playerDamageLogLines.length > 0);
      const l2Id = l2SkillIdForBattleLogLine(action);
      const pvpBattle = isPvpBattleJson(st);
      if (!pvpBattle) {
        log.push(formatBattleSkillLogLineForClient(compact, l2Id, skillHit));
      } else if (!skillHit) {
        log.push(formatBattleSkillLogLineForClient(compact, l2Id, false));
      }
    }
    if (weaknessLogLineUk) log.push(weaknessLogLineUk);
    if (playerDamageLogLines && playerDamageLogLines.length > 0) {
      for (const ln of playerDamageLogLines) {
        if (ln) log.push(ln);
      }
    }

    const healReceivedPctNow = nextActiveBuffs.some((b) => b.skillId === 341)
      ? TOUCH_OF_LIFE_HEAL_RECEIVED_PCT
      : 0;
    const todHealPenalty = jsonFiniteNum(
      st.battleMods?.playerTouchOfDeathHealReceivedPenaltyPct
    );
    const healReceivedPctEff =
      todHealPenalty !== undefined && todHealPenalty > 0
        ? Math.max(-95, healReceivedPctNow - todHealPenalty)
        : healReceivedPctNow;

    if (
      typeof playerHpCost === 'number' &&
      Number.isFinite(playerHpCost) &&
      playerHpCost > 0 &&
      playerHpCostBeforeHeal
    ) {
      const cost = Math.floor(playerHpCost);
      playerHp = Math.max(1, playerHp - cost);
      const hpCostLabel = playerHpCostSourceUk ?? 'Touch of Life';
      log.push('HP: −' + cost + ' (' + hpCostLabel + ').');
    }

    if (
      typeof playerHeal === 'number' &&
      Number.isFinite(playerHeal) &&
      playerHeal > 0
    ) {
      const cap = effectiveBattleMaxHp(maxHpEffAfter, st.battleMods);
      const healRaw = amplifyHealByReceivedPct(
        Math.floor(playerHeal),
        healReceivedPctEff
      );
      const healed = Math.min(cap - playerHp, healRaw);
      if (healed > 0) {
        playerHp = Math.min(cap, playerHp + healed);
        if (playerHealSourceUk) {
          log.push(playerHealSourceUk + ': +' + healed + ' HP.');
        }
        log.push('HP: +' + healed + ' (зцілення).');
      }
    }
    if (
      typeof playerHpCost === 'number' &&
      Number.isFinite(playerHpCost) &&
      playerHpCost > 0 &&
      !playerHpCostBeforeHeal
    ) {
      const cost = Math.floor(playerHpCost);
      playerHp = Math.max(1, playerHp - cost);
      const hpCostLabel = playerHpCostSourceUk ?? 'Zealot';
      log.push('HP: −' + cost + ' (' + hpCostLabel + ').');
    }
    const skipDamageFollowupLog =
      pDmg === 0 &&
      physOutcome === null &&
      magicOutcome === null &&
      action !== 'bolt';
    if (!skipDamageFollowupLog) {
      if (isPvpBattleJson(st)) {
        await appendPvpTurnHitLogsInTx(tx, {
          st,
          attackerId: char.id,
          attackerName: char.name,
          action,
          skillLine,
          pDmg,
          physOutcome,
          magicOutcome,
          log,
        });
      } else if (!(playerDamageLogLines && playerDamageLogLines.length > 0)) {
        if (action === 'bolt') {
          if (magicOutcome === 'miss') {
            log.push('Промах (магія).');
          } else if (magicOutcome === 'crit' && pDmg > 0) {
            log.push('Крит! Ти завдав ' + pDmg + ' урона.');
          } else {
            log.push('Ти завдав ' + pDmg + ' урона.');
          }
        } else if (magicOutcome === 'crit' && pDmg > 0) {
          log.push('Крит! Ти завдав ' + pDmg + ' урона.');
        } else if (physOutcome === 'miss') {
          log.push('Промах.');
        } else if (physOutcome === 'crit' && pDmg > 0) {
          log.push('Крит! Ти завдав ' + pDmg + ' урона.');
        } else {
          log.push('Ти завдав ' + pDmg + ' урона.');
        }
      }
    }
    if (
      action === 'whirlwind' &&
      whirlwindExtraHitNames &&
      whirlwindExtraHitNames.length > 0 &&
      pDmg > 0
    ) {
      log.push(
        'Вихор вразив ворогів поруч: ' +
          whirlwindExtraHitNames.map((n) => n + ' −' + pDmg).join(', ') +
          '.'
      );
    }
    if (
      action === 'thunder_storm' &&
      thunderStormExtraHitNames &&
      thunderStormExtraHitNames.length > 0 &&
      pDmg > 0
    ) {
      log.push(
        'Грозова буря вразила ворогів поруч: ' +
          thunderStormExtraHitNames.map((n) => n + ' −' + pDmg).join(', ') +
          '.'
      );
    }
    if (
      action === 'earthquake' &&
      earthquakeExtraHitNames &&
      earthquakeExtraHitNames.length > 0 &&
      pDmg > 0
    ) {
      log.push(
        'Землетрус вразив ворогів поруч: ' +
          earthquakeExtraHitNames.map((n) => n + ' −' + pDmg).join(', ') +
          '.'
      );
    }
    if (
      action === 'shock_blast' &&
      shockBlastExtraHitNames &&
      shockBlastExtraHitNames.length > 0 &&
      pDmg > 0
    ) {
      log.push(
        'Ударний імпульс вразив ворогів поруч: ' +
          shockBlastExtraHitNames.map((n) => n + ' −' + pDmg).join(', ') +
          '.'
      );
    }

    if (!isPvpBattleJson(bj)) {
      const dailyQuestsState = applyDailyQuestBattleTurn(
        parseDailyQuestsJson(charRowAtTurnOpen.dailyQuestsJson, nowMsTurn),
        {
          nowMs: nowMsTurn,
          action,
          mpCostEff,
          damageDealt: damagingPlayerHit ? Math.max(0, pDmg) : 0,
        }
      );
      char = {
        ...(char as CharacterRow),
        dailyQuestsJson: serializeDailyQuestsJson(
          dailyQuestsState
        ) as CharacterRow['dailyQuestsJson'],
      };
    }

    let nearbyExtraEconomy: NearbyExtraMobEconomyPatch | undefined;
    if (!isPvpBattleJson(bj) && !worldBossBattle && !partyBattleCtx) {
      const extraLoot = applyNearbyExtraMobKillLoot({
        st,
        char: char as CharacterRow,
        inv,
        preLevel,
        log,
        nowMs: nowMsTurn,
      });
      if (extraLoot.changed && extraLoot.economyPatch) {
        inv = extraLoot.inv;
        inventoryDirty = true;
        nearbyExtraEconomy = extraLoot.economyPatch;
        char = {
          ...(char as CharacterRow),
          exp: extraLoot.economyPatch.exp,
          level: extraLoot.economyPatch.level,
          maxHp: extraLoot.economyPatch.maxHp,
          mobSpawnHpJson:
            extraLoot.economyPatch.mobSpawnHpJson as CharacterRow['mobSpawnHpJson'],
          ...(extraLoot.economyPatch.questProgressJson != null
            ? {
                questProgressJson:
                  extraLoot.economyPatch.questProgressJson as CharacterRow['questProgressJson'],
              }
            : {}),
          ...(extraLoot.economyPatch.dailyQuestsJson != null
            ? {
                dailyQuestsJson:
                  extraLoot.economyPatch.dailyQuestsJson as CharacterRow['dailyQuestsJson'],
              }
            : {}),
        };
      }
    }

    const continueBase: BattleContinueTurnBase = {
      userId,
      expectedRevision: writeRevision,
      char: char as CharacterRow,
      bj,
      spawn,
      preLevel,
      learnedBattle,
      profAct,
      inv,
      st,
      playerHp,
      mobHp,
      log,
      maxMpEff,
    };
    const dailyQuestsJsonPatch = mergeDailyQuestsJsonPatch(
      charRowAtTurnOpen,
      parseDailyQuestsJson((char as CharacterRow).dailyQuestsJson, nowMsTurn),
      nowMsTurn
    );
    const persistSide: BattleTurnPersistSide = {
      activeBuffsChanged,
      nextActiveBuffs,
      cooldownsChanged,
      nextCooldowns,
      inventoryDirty,
      inv,
      nearbyExtraEconomy,
      ...(dailyQuestsJsonPatch ? { dailyQuestsJson: dailyQuestsJsonPatch } : {}),
      hotbarStale:
        activeBuffsChanged ||
        !!inventoryDirty ||
        nearbyExtraEconomy !== undefined ||
        dailyQuestsJsonPatch !== undefined ||
        Math.floor(currentMp) !== Math.floor(initialMp) ||
        (!!battleModsPatch && Object.keys(battleModsPatch).length > 0),
    };

    const logLinesAdded = Math.max(0, log.length - initialLogLen);

    const persistTurnOrParty = async (): Promise<BattleActionDeltaResponse> => {
      if (partyBattleCtx) {
        return persistPartyBattleContinueTurnInTx(tx, {
          sessionId: partyBattleCtx.session.id,
          characterId: cr.id,
          expectedRevision: writeRevision,
          char: char as CharacterRow,
          st,
          playerHp,
          mobHpBefore: partyBattleMobHpAtTurnOpen,
          mobHpAfter: mobHp,
          log,
          logLinesAdded,
          maxMpEff,
          side: persistSide,
        });
      }
      return persistBattleContinueFromTurn(
        tx,
        { ...continueBase, char: char as CharacterRow, playerHp, mobHp, st },
        persistSide,
        logLinesAdded
      );
    };

    if (mobHp <= 0) {
      let partyCtx = partyBattleCtx;
      let partyMobHpOpen = partyBattleMobHpAtTurnOpen;
      if (!partyCtx && !isPvpBattleJson(bj) && !worldBossBattle) {
        const sid =
          (typeof st.partyBattleId === 'string' && st.partyBattleId.trim()) ||
          peekPartyBattleIdFromBattleJson(bj) ||
          null;
        if (sid) {
          throwIfPartyBattleRouteBlocked();
          partyCtx = await lockPartyBattleSessionForActionInTx(tx, {
            sessionId: sid,
            characterId: cr.id,
            spawnId: spawn.spawnId,
            charRow: char as CharacterRow,
          });
          char = partyCtx.char;
          partyMobHpOpen = partyCtx.session.mobHp;
        }
      }

      if (partyCtx) {
        const partyVictoryBase = {
          sessionId: partyCtx.session.id,
          characterId: cr.id,
          expectedRevision: writeRevision,
          char: char as CharacterRow,
          st,
          playerHp,
          mobHpBefore: partyMobHpOpen,
          mobHpAfter: mobHp,
          log,
          logLinesAdded,
          maxMpEff,
          side: persistSide,
        };
        if (isPartyBattleRewardDistributionReady()) {
          return resolvePartyBattleVictoryInTx(tx, {
            ...partyVictoryBase,
            userId,
            bj,
            spawn,
            inv,
            preLevel,
            currentMp,
            cr: char as CharacterRow,
          });
        }
        return resolvePartyBattleStageBTestVictoryInTx(tx, partyVictoryBase);
      }
      const victory = await resolveMobDeadVictoryInTx(tx, {
        ...continueBase,
        cr: char as CharacterRow,
        currentMp,
        side: persistSide,
      });
      if (victory) return victory;
    }

    /** PvP: без автоконтратаки моба — ходи лише гравці (окремий flow пізніше). */
    if (isPvpBattleJson(bj)) {
      return persistBattleContinueFromTurn(
        tx,
        continueBase,
        persistSide,
        logLinesAdded
      );
    }

    if (worldBossBattle) {
      const mobControlLocked = isMobUnableToAttackNow(st, nowMsTurn);
      if (!damagingPlayerHit && !mobControlLocked) {
        const tickNowMs = Date.now();
        if (await isWorldBossAutoAttackDueInTx(tx, spawn.spawnId, tickNowMs)) {
          const ws = await runWorldBossCombatTickInTx(
            tx,
            spawn.spawnId,
            tickNowMs
          );
          if (ws) {
            mobHp = ws.mobHp;
            st.mobHp = ws.mobHp;
          }
        }
      }
      if (playerHp <= 0) {
        const d = await persistBattleDefeatInTx(tx, {
          userId,
        expectedRevision: writeRevision,
        char: char as CharacterRow,
        bj,
        spawn,
        maxHpEff: maxHpEffAfter,
        maxMpEff,
        st,
        log,
      });
      return wrapBattleDefeatAsDelta(d);
    }
    return persistTurnOrParty();
  }

  const shouldMobCounterAttack = resolveMobShouldCounterAttack({
      st,
      action,
      race: char.race,
      classBranch: char.classBranch,
      skipMobCounterAttackOnce,
      mobRetaliationDelayHits,
      nowMs: nowMsTurn,
    });

    if (!shouldMobCounterAttack) {
      return persistTurnOrParty();
    }

    const countered = applyMobCounterDamage({
      st,
      spawn,
      combat,
      worldBattleMods: wTickForBattleMods?.battleMods,
      maxHpEffAfter,
      playerHp,
      mobHp,
      log,
    });
    playerHp = countered.playerHp;
    mobHp = countered.mobHp;

    if (playerHp <= 0) {
      const d = await persistBattleDefeatInTx(tx, {
        userId,
        expectedRevision: writeRevision,
        char: char as CharacterRow,
        bj,
        spawn,
        maxHpEff,
        maxMpEff,
        st,
        log,
      });
      return wrapBattleDefeatAsDelta(d);
    }

    return persistTurnOrParty();
}

export async function performBattleAction(
  userId: string,
  action: BattleActionId,
  expectedRevision: number,
  opts?: {
    characterId?: string | null;
    battleSpawnId?: string | null;
    fighterSoulshotItemId?: number;
    mysticSpiritshotItemId?: number;
    battlePotionItemId?: number;
  }
): Promise<BattleActionResponse> {
  const result = await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, userId, action, expectedRevision, opts)
  );
  if (result.kind === 'full' && result.character) {
    result.character = await enrichPartialClientSnapshot(
      result.character,
      userId,
      { includeUnreadCount: Boolean(result.victory) }
    );
  }
  return result;
}
