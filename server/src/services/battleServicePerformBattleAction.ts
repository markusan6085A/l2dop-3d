import { Prisma } from '@prisma/client';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';
import {
  applyBattleModsPatch,
  effectiveBattleMaxHp,
  jsonFiniteNum,
  type BattleActionId,
} from '../domain/battle.js';
import { mergeDisplayBattleMods } from '../domain/combatDisplayContext.js';
import {
  persistableActiveBuffsFromJson,
  type ActiveBuffEntry,
} from '../data/l2dopActiveBuffs.js';
import { activeBuffExpiresAt } from '../data/l2dopBuffDurations.js';
import {
  LEGACY_BUFF_EXPIRE_LOG_BY_SKILL_ID,
  LEGACY_BUFF_STRIP_BY_SKILL_ID,
} from '../domain/legacyBuffStrip.js';
import {
  cooldownSecForSkillId,
  markSkillCast,
  parseSkillCooldowns,
  type SkillCooldownEntry,
} from '../data/skillCooldowns.js';
import { resolveBattleSkillCooldownSec } from '../data/skillCooldownScaling.js';
import { humanFighterCatalogEntry } from '../data/humanFighterSkillCatalog.js';
import {
  parseWorldCombatState,
  stanceCount,
  STANCE_MP_PER_SEC,
  stripStances,
  tickWorldCombatState,
} from '../domain/worldCombatState.js';
import { resolveMagicBoltHit } from '../data/l2dopHitResolution.js';
import { compactBattleSkillLogLineUk } from '../domain/battleLogFormat.js';
import { prisma } from '../lib/prisma.js';
import {
  combatOptsFromRow,
  GameConflictError,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { parseInventory, countBagQty, removeBagQty } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { resolvePlayerBattleTurn } from '../domain/battleSkills/index.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  equippedWeaponKind,
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import {
  battleActionNamedFromL2IfMapped,
  learnedBattleIdsFromEntries,
  normalizeLearnedSkillsJson,
} from '../data/humanFighterSkillCatalog.js';
import {
  persistBattleContinueTurnInTx,
  persistBattleDefeatInTx,
  persistBattleVictoryInTx,
} from './battleServiceBattleOutcomeTx.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  mobEvasionForBattle,
  rollMobPhysicalVsPlayer,
  rollPlayerPhysicalDmg,
} from './battleServiceDamageRolls.js';
import { battleActionAllowed } from './battleServiceBattleUi.js';
import type {
  BattleDefeatSummary,
  BattleVictorySummary,
  BattleView,
} from './battleServiceTypes.js';
import { applyPassiveAndMove } from './battleServiceApplyPassive.js';
import { mobMaxCpFromMobMaxHp } from '../data/wrathSkillConstants.js';
import { ensureWhirlwindExtraMobs } from '../domain/battleWhirlwindExtras.js';
import { FIGHTER_PHYSICAL_SOULSHOT_ITEM_IDS } from '../data/fighterPhysicalSoulshot.js';
import { MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS } from '../data/mysticBlessedSpiritshot.js';
import { applyFighterSoulshotToggle } from '../domain/battleFighterSoulshotToggle.js';
import { applyMysticBlessedSpiritshotToggle } from '../domain/battleMysticBlessedSpiritshotToggle.js';
import {
  applyBattlePotionHoTTicks,
  startBattlePotionHoT,
} from '../domain/battleCombatPotions.js';
import { stripChargeShotsIfWeaponGradeMismatch } from '../domain/battleChargeGradeSanitize.js';
import { rollKillLoot } from '../domain/killLoot.js';
import {
  BATTLE_REGEN_TICK_SECONDS,
  battleActionSkipsMobHp,
  randomMobRetaliationWindowHits,
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

export async function performBattleAction(
  userId: string,
  action: BattleActionId,
  expectedRevision: number,
  opts?: {
    fighterSoulshotItemId?: number;
    mysticSpiritshotItemId?: number;
    battlePotionItemId?: number;
  }
): Promise<{
  character: CharacterSnapshot;
  battle: BattleView | null;
  victory?: BattleVictorySummary;
  defeat?: BattleDefeatSummary;
}> {
  let pre = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!pre) throw new Error('no_character');
  pre = (await applyPassiveAndMove(pre as CharacterRow)) as CharacterRow;

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const bj = parseBattleJson((char as CharacterRow).battleJson);
    if (!bj) throw new Error('battle_none');

    const spawn = getWorldSpawnById(bj.spawnId);
    if (!spawn) throw new Error('battle_spawn_gone');

    let inv = parseInventory((char as CharacterRow).inventoryJson);
    let inventoryDirty = false;
    const preLevel = levelFromTotalExp(char.exp);
    const cr = char as CharacterRow;
    /** Профільні боїві стати (+ світові бафи). Не змішувати з `st.battleMods` — вони лише в кидках урону. */
    const combat = computeCombatStats(
      preLevel,
      char.race,
      char.classBranch,
      inv,
      combatOptsFromRow(cr)
    );
    const vit = computeVitals(
      preLevel,
      char.race,
      char.classBranch,
      combat.con,
      combat.men
    );
    const maxHpEff = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
    const maxMpEff = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);

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
    const log = [...st.log];
    const pushExtraMobLootLog = (
      mobName: string,
      exLoot: ReturnType<typeof rollKillLoot>
    ) => {
      log.push('Додаткова ціль повалена: ' + mobName + '.');
      log.push(
        'Здобуто: +' +
          exLoot.adena.toString() +
          ' адени, +' +
          Number(exLoot.spGain) +
          ' SP, +' +
          exLoot.expGain.toString() +
          ' EXP.'
      );
      for (const it of exLoot.items) {
        log.push('Отримано: ' + it.label + ' ×' + it.qty + '.');
      }
    };
    let playerHp = Math.min(
      Math.max(0, char.hp),
      effectiveBattleMaxHp(maxHpEff, st.battleMods)
    );
    let mobHp = st.mobHp;

    let currentMp =
      typeof st.playerMp === 'number' && Number.isFinite(st.playerMp)
        ? st.playerMp
        : maxMpEff;
    currentMp = Math.min(maxMpEff, Math.max(0, Math.floor(currentMp)));

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
    }
    const activeBuffsPre = persistableActiveBuffsFromJson(
      (char as CharacterRow).activeBuffsJson,
      nowMsTurn
    );

    /**
     * Перед обробкою дії мерджимо постійний `skillCooldownsJson` у
     * `st.mysticSkillCdUntil` — так хендлери self-buff-ів (War Cry 78,
     * Battle Roar 121, Thrill Fight 130, Focus Attack 317) коректно
     * бачать КД, навіть якщо він виставлений ще до входу в цей бій
     * (напр. каст out-of-battle або після F5).
     */
    {
      const persistedCds = parseSkillCooldowns(
        (char as CharacterRow).skillCooldownsJson,
        nowMsTurn
      );
      if (persistedCds.length > 0) {
        const mergedCd: Record<string, number> = {
          ...(st.mysticSkillCdUntil ?? {}),
        };
        for (const e of persistedCds) {
          const key = 'l2_' + e.skillId;
          const prev = mergedCd[key];
          if (!Number.isFinite(prev) || (prev as number) < e.readyAt) {
            mergedCd[key] = e.readyAt;
          }
        }
        st.mysticSkillCdUntil = mergedCd;
      }
    }

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
     * Тогл-стійки в бою витрачають MP за тією ж ставкою, що й у світі
     * (`STANCE_MP_PER_SEC` на стійку). Тик — від попереднього ходу до поточного;
     * для першого ходу у бою беремо lower-bound 0, щоб не знімати «за минуле»
     * (там спрацював `tickWorldCombatState`). Коли MP падає до 0 — стійки слітають
     * з `st.battleMods`, що прибирає їхні бонуси з наступних кидків/іконок.
     */
    {
      const sc = stanceCount(st.battleMods);
      if (sc > 0) {
        const lastTick = st.lastStanceTickMs ?? nowMsTurn;
        const dtSec = Math.max(0, (nowMsTurn - lastTick) / 1000);
        const drain = Math.floor(dtSec * STANCE_MP_PER_SEC * sc);
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
      st.playerMp = currentMp;
    }

    if (action === 'fighter_soulshot_toggle') {
      const raw = opts?.fighterSoulshotItemId;
      const sid =
        typeof raw === 'number' && Number.isFinite(raw)
          ? Math.floor(raw)
          : NaN;
      if (!Number.isFinite(sid) || sid <= 0) {
        throw new Error('battle_soulshot_bad_item');
      }
      applyFighterSoulshotToggle({
        st,
        inv,
        log,
        classBranch: char.classBranch,
        itemId: sid,
      });
    }

    if (action === 'mystic_spiritshot_toggle') {
      const raw = opts?.mysticSpiritshotItemId;
      const sid =
        typeof raw === 'number' && Number.isFinite(raw)
          ? Math.floor(raw)
          : NaN;
      if (!Number.isFinite(sid) || sid <= 0) {
        throw new Error('mystic_spiritshot_bad_item');
      }
      applyMysticBlessedSpiritshotToggle({
        st,
        inv,
        log,
        classBranch: char.classBranch,
        itemId: sid,
      });
    }

    if (action === 'battle_potion_use') {
      const raw = opts?.battlePotionItemId;
      const pid =
        typeof raw === 'number' && Number.isFinite(raw)
          ? Math.floor(raw)
          : NaN;
      if (!Number.isFinite(pid) || pid <= 0) {
        throw new Error('battle_bad_potion');
      }
      inv = startBattlePotionHoT({
        st,
        inv,
        log,
        itemId: pid,
        nowMs: nowMsTurn,
      });
      /**
       * Одразу прокручуємо імпульс зілля в тому ж POST /battle/action,
       * щоб HP/MP бари оновлювалися без перезавантаження сторінки.
       */
      {
        const hoNow = applyBattlePotionHoTTicks({
          nowMs: nowMsTurn,
          st,
          playerHp,
          maxHpBattle,
          currentMp,
          maxMpEff,
          log,
        });
        playerHp = hoNow.playerHp;
        currentMp = hoNow.currentMp;
        st.playerMp = currentMp;
      }
      inventoryDirty = true;
    }

    stripChargeShotsIfWeaponGradeMismatch({
      inv,
      st,
      log,
      classBranch: char.classBranch,
    });

    const skipResolveTurn =
      action === 'fighter_soulshot_toggle' ||
      action === 'mystic_spiritshot_toggle' ||
      action === 'battle_potion_use';

    const resolvedTurn =
      skipResolveTurn
        ? {
            mpCost: 0,
            pDmg: 0,
            skillLine: '',
            physOutcome: null,
            magicOutcome: null,
          }
        : resolvePlayerBattleTurn(
      {
        action,
        preLevel,
        race: char.race,
        classBranch: char.classBranch,
        l2Profession: profAct,
        combat,
        st,
        spawnLevel: spawn.level,
        spawnStunResistPct: spawn.stunResistPct,
        spawnDebuffResistPct: spawn.debuffResistPct,
        spawnMobName: spawn.name,
        playerHpInBattle: playerHp,
        playerMaxHpInBattle: maxHpBattle,
        weaponKind: equippedWeaponKind(inv),
        learnedSkillLevelByBattleId,
        activeBuffs: activeBuffsPre,
      },
      (atk, options) =>
        rollPlayerPhysicalDmg(
          atk,
          combat,
          st,
          spawn.level,
          spawn.name,
          learnedSkillLevelByBattleId,
          modsForPlayerPhysicalRoll,
          {
            ...(options ?? {}),
            /**
             * Вимога геймдизайну: усі скіли воїна повинні влучати гарантовано.
             * Базова автоатака (`attack`) лишається зі стандартною перевіркою hit/miss.
             */
            forceNoMiss:
              options?.forceNoMiss ??
              (isFighterClassBranch(char.classBranch) &&
                battleActionNamedFromL2IfMapped(action) !== 'attack'),
          }
        ),
      () => {
        const mm =
          jsonFiniteNum(modsForPlayerPhysicalRoll?.mysticMatkBuffMul) ?? 1;
        let mAtkEff = Math.max(
          1,
          Math.floor(combat.mAtk * (mm > 1 ? mm : 1))
        );
        if (isMysticClassBranch(char.classBranch) && st.battleMods) {
          const bMul = jsonFiniteNum(st.battleMods.mysticBlessedSpiritshotMatkMul);
          const bRaw = st.battleMods.mysticBlessedSpiritshotItemId;
          const bId =
            typeof bRaw === 'number' && Number.isFinite(bRaw)
              ? Math.floor(bRaw)
              : undefined;
          if (
            bMul !== undefined &&
            bMul > 1 &&
            bId !== undefined &&
            bId > 0 &&
            MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS.has(bId)
          ) {
            mAtkEff = Math.max(1, Math.floor(mAtkEff * bMul));
          }
        }
        const mobMdefMul =
          jsonFiniteNum(modsForPlayerPhysicalRoll?.mobTargetMDefMul) ?? 1;
        const mobMDefEff =
          mobMdefMul > 0 && mobMdefMul < 1
            ? Math.max(1, Math.floor(st.mobMDef * mobMdefMul))
            : st.mobMDef;
        return resolveMagicBoltHit({
          mAtk: mAtkEff,
          mobMDef: mobMDefEff,
          playerInt: combat.int,
          playerWit: combat.wit,
          playerMen: combat.men,
          playerLevel: preLevel,
          mobEvasion: mobEva,
          mCritPct: combat.mCritPct,
          magicCritDmgMul: combat.magicCritDmgMul,
        });
      }
    );

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
      activeBuffPatch,
      battleModsExpiresPatch,
      sonicChargesPatch,
      playerDamageLogLines,
      skipMobCounterAttackOnce,
      mobRetaliationDelayHits,
      playerHealSourceUk,
    } = resolvedTurn;

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
    let nextActiveBuffs: ActiveBuffEntry[] = activeBuffsPre.slice();
    let activeBuffsChanged = false;
    if (activeBuffPatch) {
      const { skillId, level, action: patchAction } = activeBuffPatch;
      stripLegacyBattleModsInPlace(st.battleMods, skillId);
      if (patchAction === 'remove') {
        nextActiveBuffs = nextActiveBuffs.filter((b) => b.skillId !== skillId);
      } else {
        const exp = activeBuffExpiresAt(skillId, nowMsTurn);
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
                castSpd: combat.castSpd,
                pAtkSpd: combat.pAtkSpd,
                cooldownReductionMul: combat.cooldownReductionMul,
              })
            : undefined;
        if (cdSec !== undefined && cdSec > 0) {
          nextCooldowns = markSkillCast(
            nextCooldowns,
            skillId,
            cdSec,
            nowMsTurn
          );
          const readyAt = nowMsTurn + Math.floor(cdSec * 1000);
          st.mysticSkillCdUntil = {
            ...(st.mysticSkillCdUntil ?? {}),
            ['l2_' + skillId]: readyAt,
          };
          cooldownsChanged = true;
        }
      }
      activeBuffsChanged = true;
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
      const combat2 = computeCombatStats(
        preLevel,
        char.race,
        char.classBranch,
        inv,
        combatOptsFromRow(crPatched)
      );
      maxHpEffAfter = effectiveMaxHpWithJewelFlat(vit.maxHp, combat2);
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

    mobHp = Math.max(0, mobHp - pDmg);

    const landedPhysicalHit =
      pDmg > 0 && physOutcome != null && physOutcome !== 'miss';
    const landedMagicHit =
      pDmg > 0 && magicOutcome != null && magicOutcome !== 'miss';
    const damagingPlayerHit = landedPhysicalHit || landedMagicHit;

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
    if (action === 'whirlwind' && pDmg > 0) {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId
      );
      if (st.whirlwindExtras) {
        for (const ex of st.whirlwindExtras) {
          const before = ex.mobHp;
          ex.mobHp = Math.max(0, ex.mobHp - pDmg);
          if (before > 0 && ex.mobHp <= 0) {
            const exSpawn = getWorldSpawnById(ex.spawnId);
            const exLevel = exSpawn?.level ?? spawn.level;
            const exLoot = rollKillLoot(null, exLevel, inv, {
              race: char.race,
              l2Profession: profAct,
              skillsLearnedJson: char.skillsLearnedJson,
            });
            pushExtraMobLootLog(ex.name, exLoot);
          }
        }
      }
      /** Після Вихору наступна базова автоатака також cleave'ить по додаткових цілях. */
      st.whirlwindNextAutoCleaveHits = 1;
    }
    if (action === 'provoke') {
      ensureWhirlwindExtraMobs(
        st,
        char.worldX,
        char.worldY,
        bj.spawnId
      );
      if (st.whirlwindExtras && st.whirlwindExtras.length > 0) {
        log.push(
          'У бій втягнуто: ' +
            st.whirlwindExtras.map((e) => e.name).join(', ') +
            '.'
        );
      }
    }
    if (
      action === 'attack' &&
      pDmg > 0 &&
      st.whirlwindExtras &&
      st.whirlwindExtras.length > 0
    ) {
      for (const ex of st.whirlwindExtras) {
        const before = ex.mobHp;
        ex.mobHp = Math.max(0, ex.mobHp - pDmg);
        if (before > 0 && ex.mobHp <= 0) {
          const exSpawn = getWorldSpawnById(ex.spawnId);
          const exLevel = exSpawn?.level ?? spawn.level;
          const exLoot = rollKillLoot(null, exLevel, inv, {
            race: char.race,
            l2Profession: profAct,
            skillsLearnedJson: char.skillsLearnedJson,
          });
          pushExtraMobLootLog(ex.name, exLoot);
        }
      }
      log.push(
        'Древко розсікло ворогів поруч: ' +
          st.whirlwindExtras.map((e) => e.name + ' −' + pDmg).join(', ') +
          '.'
      );
    }
    if (typeof mobCpDrain === 'number' && mobCpDrain > 0) {
      const mmc = st.mobMaxCp ?? mobMaxCpFromMobMaxHp(st.mobMaxHp);
      st.mobMaxCp = mmc;
      const cur = st.mobCp !== undefined ? st.mobCp : mmc;
      st.mobCp = Math.max(0, cur - mobCpDrain);
    }
    if (skillLine) {
      const compact = compactBattleSkillLogLineUk(skillLine);
      const skillHit =
        pDmg > 0 ||
        (playerDamageLogLines != null && playerDamageLogLines.length > 0);
      log.push((skillHit ? '\u2060' : '') + compact);
    }
    if (weaknessLogLineUk) log.push(weaknessLogLineUk);
    if (playerDamageLogLines && playerDamageLogLines.length > 0) {
      for (const ln of playerDamageLogLines) {
        if (ln) log.push(ln);
      }
    }

    if (
      typeof playerHeal === 'number' &&
      Number.isFinite(playerHeal) &&
      playerHeal > 0
    ) {
      const cap = effectiveBattleMaxHp(maxHpEffAfter, st.battleMods);
      const healed = Math.min(cap - playerHp, Math.floor(playerHeal));
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
      playerHpCost > 0
    ) {
      const cost = Math.floor(playerHpCost);
      playerHp = Math.max(1, playerHp - cost);
      log.push('HP: −' + cost + ' (Zealot).');
    }
    const skipDamageFollowupLog =
      pDmg === 0 &&
      physOutcome === null &&
      magicOutcome === null &&
      action !== 'bolt';
    if (!skipDamageFollowupLog && !(playerDamageLogLines && playerDamageLogLines.length > 0)) {
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
    if (
      action === 'whirlwind' &&
      pDmg > 0 &&
      st.whirlwindExtras &&
      st.whirlwindExtras.length > 0
    ) {
      log.push(
        'Древко розсікло ворогів поруч: ' +
          st.whirlwindExtras
            .map((e) => e.name + ' −' + pDmg)
            .join(', ') +
          '.'
      );
    }
    if (mobHp <= 0) {
      const v = await persistBattleVictoryInTx(tx, {
        userId,
        expectedRevision,
        char: char as CharacterRow,
        bj,
        spawn,
        inv,
        cr,
        preLevel,
        playerHp,
        currentMp,
        st,
        log,
        ...(activeBuffsChanged
          ? {
              activeBuffsJson:
                nextActiveBuffs as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(cooldownsChanged
          ? {
              skillCooldownsJson:
                nextCooldowns as unknown as Prisma.InputJsonValue,
            }
          : {}),
      });
      return { ...v, battle: null };
    }

    let shouldMobCounterAttack = true;
    const sleepUntilNow = jsonFiniteNum(st.battleMods?.mobSleepUntilMs);
    const mobSleepingNow =
      sleepUntilNow !== undefined && sleepUntilNow > Date.now();
    if (mobSleepingNow) {
      shouldMobCounterAttack = false;
    }
    if (skipMobCounterAttackOnce) {
      shouldMobCounterAttack = false;
    }
    if (
      typeof mobRetaliationDelayHits === 'number' &&
      Number.isFinite(mobRetaliationDelayHits) &&
      mobRetaliationDelayHits > 0
    ) {
      const delayHits = Math.max(1, Math.floor(mobRetaliationDelayHits));
      const curHitsUntil =
        typeof st.mobHitsUntilRetaliation === 'number' &&
        Number.isFinite(st.mobHitsUntilRetaliation) &&
        st.mobHitsUntilRetaliation > 0
          ? Math.floor(st.mobHitsUntilRetaliation)
          : randomMobRetaliationWindowHits();
      st.mobHitsUntilRetaliation = Math.max(curHitsUntil, delayHits);
      shouldMobCounterAttack = false;
    }
    if (
      !mobSleepingNow &&
      !battleActionSkipsMobHp(action, char.race, char.classBranch)
    ) {
      const curHitsUntil =
        typeof st.mobHitsUntilRetaliation === 'number' &&
        Number.isFinite(st.mobHitsUntilRetaliation) &&
        st.mobHitsUntilRetaliation > 0
          ? Math.floor(st.mobHitsUntilRetaliation)
          : randomMobRetaliationWindowHits();
      const nextHitsUntil = curHitsUntil - 1;
      if (nextHitsUntil <= 0) {
        shouldMobCounterAttack = true;
        st.mobHitsUntilRetaliation = randomMobRetaliationWindowHits();
      } else {
        shouldMobCounterAttack = false;
        st.mobHitsUntilRetaliation = nextHitsUntil;
      }
    }
    if (skipMobCounterAttackOnce) {
      shouldMobCounterAttack = false;
      const curHitsUntil =
        typeof st.mobHitsUntilRetaliation === 'number' &&
        Number.isFinite(st.mobHitsUntilRetaliation) &&
        st.mobHitsUntilRetaliation > 0
          ? Math.floor(st.mobHitsUntilRetaliation)
          : randomMobRetaliationWindowHits();
      st.mobHitsUntilRetaliation = Math.max(1, curHitsUntil);
    }

    if (!shouldMobCounterAttack) {
      return persistBattleContinueTurnInTx(tx, {
        userId,
        expectedRevision,
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
        ...(activeBuffsChanged
          ? {
              activeBuffsJson:
                nextActiveBuffs as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(cooldownsChanged
          ? {
              skillCooldownsJson:
                nextCooldowns as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(inventoryDirty
          ? {
              inventoryJson: inv as unknown as Prisma.InputJsonValue,
            }
          : {}),
      });
    }

    const modsForMobCounter = mergeDisplayBattleMods(
      st,
      wTickForBattleMods?.battleMods,
      st.battleMods
    );
    const mobCounter = rollMobPhysicalVsPlayer(
      st.mobPAtk,
      spawn.level,
      combat,
      st,
      modsForMobCounter
    );
    const rRefl =
      jsonFiniteNum(modsForMobCounter?.reflectDamageReturnRatio) ?? 0;
    const rMir =
      jsonFiniteNum(modsForMobCounter?.physicalMirrorReflectRatio) ?? 0;
    const rVen =
      jsonFiniteNum(modsForMobCounter?.vengeanceReflectRatio) ?? 0;
    const reflTot = Math.min(0.72, rRefl + rMir + rVen);
    if (
      reflTot > 0 &&
      mobCounter.damage > 0 &&
      mobCounter.outcome !== 'miss'
    ) {
      const refl = Math.floor(mobCounter.damage * reflTot);
      if (refl > 0) {
        mobHp = Math.max(0, mobHp - refl);
        log.push('Відбиття на моба: ' + refl + ' урона.');
      }
    }
    playerHp = Math.max(0, playerHp - mobCounter.damage);
    playerHp = Math.min(
      effectiveBattleMaxHp(maxHpEffAfter, st.battleMods),
      playerHp
    );
    if (mobCounter.outcome === 'miss') {
      log.push(spawn.name + ' промахнувся.');
    } else if (mobCounter.outcome === 'crit' && mobCounter.damage > 0) {
      log.push(
        'Крит! ' + spawn.name + ' завдав ' + mobCounter.damage + ' урона.'
      );
    } else {
      log.push(spawn.name + ' завдав ' + mobCounter.damage + ' урона.');
    }

    if (playerHp <= 0) {
      const d = await persistBattleDefeatInTx(tx, {
        userId,
        expectedRevision,
        char: char as CharacterRow,
        bj,
        spawn,
        maxHpEff,
        maxMpEff,
        st,
        log,
      });
      return { ...d, battle: null };
    }

    return persistBattleContinueTurnInTx(tx, {
      userId,
      expectedRevision,
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
      ...(activeBuffsChanged
        ? {
            activeBuffsJson:
              nextActiveBuffs as unknown as Prisma.InputJsonValue,
          }
        : {}),
      ...(cooldownsChanged
        ? {
            skillCooldownsJson:
              nextCooldowns as unknown as Prisma.InputJsonValue,
          }
        : {}),
      ...(inventoryDirty
        ? {
            inventoryJson: inv as unknown as Prisma.InputJsonValue,
          }
        : {}),
    });
  });
}
