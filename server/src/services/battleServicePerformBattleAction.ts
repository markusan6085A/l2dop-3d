import { Prisma } from '@prisma/client';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';
import {
  applyBattleModsPatch,
  BATTLE_ACTIONS_NO_MOB_HP,
  effectiveBattleMaxHp,
  jsonFiniteNum,
  type BattleActionId,
  type BattleBattleMods,
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
import { parseInventory } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { resolvePlayerBattleTurn } from '../domain/battleSkills/index.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  equippedWeaponKind,
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import {
  battleActionNamedFromL2IfMapped,
  learnedBattleIdsFromEntries,
  normalizeLearnedSkillsJson,
} from '../data/humanFighterSkillCatalog.js';
import { mysticSkillSkipsMobHpByBattleId } from '../data/humanMysticSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../data/fighterSkillCatalog.byRace.js';
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

const BATTLE_REGEN_TICK_SECONDS = 2;
function randomMobRetaliationWindowHits(): number {
  return 1 + Math.floor(Math.random() * 3);
}

function battleActionSkipsMobHp(
  action: BattleActionId,
  race: string,
  classBranch: string
): boolean {
  if (BATTLE_ACTIONS_NO_MOB_HP.has(action)) return true;
  if (typeof action === 'string' && /^l2_\d+$/.test(action)) {
    if (mysticSkillSkipsMobHpByBattleId(action, race)) return true;
    const fe = fighterCatalogEntryForRace(race, classBranch, action);
    if (fe && fe.skipMobHp) return true;
    return false;
  }
  return false;
}

export async function performBattleAction(
  userId: string,
  action: BattleActionId,
  expectedRevision: number
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

    const inv = parseInventory((char as CharacterRow).inventoryJson);
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
            log.push('MP вичерпано — стійки знято.');
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
    } = resolvePlayerBattleTurn(
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
        const mAtkEff = Math.max(
          1,
          Math.floor(combat.mAtk * (mm > 1 ? mm : 1))
        );
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
    if (mysticSkillCdUntilPatch) {
      for (const [key, readyAt] of Object.entries(mysticSkillCdUntilPatch)) {
        const m = /^l2_(\d+)$/.exec(key);
        if (!m || typeof readyAt !== 'number' || !Number.isFinite(readyAt)) {
          continue;
        }
        const skillId = parseInt(m[1]!, 10);
        if (!Number.isFinite(skillId) || skillId <= 0) continue;
        const remainingMs = readyAt - nowMsTurn;
        if (remainingMs <= 0) continue;
        nextCooldowns = markSkillCast(
          nextCooldowns,
          skillId,
          remainingMs / 1000,
          nowMsTurn
        );
        cooldownsChanged = true;
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

    /**
     * Застосовуємо `battleModsExpiresPatch` з хендлера (refresh-on-recast): для кожного
     * skillId кладемо/оновлюємо `expiresAt` у `st.battleModsExpiresAtMsBySkillId`.
     * Повторний каст того ж бафа до закінчення — через CD — не дійде сюди (кидаємо
     * `battle_skill_not_allowed` раніше). Нова гілка CD — короткі 2–12 с у детектів
     * і Focus Attack (17), а тривалість — як у L2 Interlude (60–300 с).
     */
    if (battleModsExpiresPatch) {
      const nextMap: Record<string, number> = {
        ...(st.battleModsExpiresAtMsBySkillId ?? {}),
      };
      for (const [key, expiresAt] of Object.entries(battleModsExpiresPatch)) {
        if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) {
          continue;
        }
        if (expiresAt <= nowMsTurn) {
          delete nextMap[key];
          continue;
        }
        nextMap[key] = expiresAt;
      }
      if (Object.keys(nextMap).length === 0) {
        delete st.battleModsExpiresAtMsBySkillId;
      } else {
        st.battleModsExpiresAtMsBySkillId = nextMap;
      }
    }

    /**
     * Sonic Focus (Gladiator/Duelist): додаємо/витрачаємо заряди. `maxSet` — одноразова
     * ініціалізація ліміту (зазвичай 10). `delta` клемпаємо у [0, max], щоб не піти в
     * мінус (витрата перевіряється хендлером скіла до виклику цього патча).
     */
    if (sonicChargesPatch) {
      const curMax =
        typeof st.maxSonicCharges === 'number' && st.maxSonicCharges > 0
          ? Math.floor(st.maxSonicCharges)
          : 0;
      const nextMax =
        typeof sonicChargesPatch.maxSet === 'number' &&
        Number.isFinite(sonicChargesPatch.maxSet) &&
        sonicChargesPatch.maxSet > 0
          ? Math.max(curMax, Math.floor(sonicChargesPatch.maxSet))
          : curMax;
      if (nextMax > 0) {
        st.maxSonicCharges = nextMax;
      }
      const delta =
        typeof sonicChargesPatch.delta === 'number' &&
        Number.isFinite(sonicChargesPatch.delta)
          ? Math.floor(sonicChargesPatch.delta)
          : 0;
      if (delta !== 0) {
        const cur =
          typeof st.sonicCharges === 'number' && st.sonicCharges > 0
            ? Math.floor(st.sonicCharges)
            : 0;
        const lim = nextMax > 0 ? nextMax : cur + Math.max(0, delta);
        const raw = cur + delta;
        const clamped = Math.max(0, Math.min(lim, raw));
        if (clamped > 0) st.sonicCharges = clamped;
        else delete st.sonicCharges;
      }
    }

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
        const cdSec = cooldownSecForSkillId(skillId);
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
          ex.mobHp = Math.max(0, ex.mobHp - pDmg);
        }
      }
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
        'Поруч зачеплено: ' +
          st.whirlwindExtras
            .map((e) => e.name + ' −' + pDmg)
            .join('; ') +
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
      log.push('[' + spawn.name + '] промахнувся.');
    } else if (mobCounter.outcome === 'crit' && mobCounter.damage > 0) {
      log.push(
        'Крит! [' +
          spawn.name +
          '] завдав ' +
          mobCounter.damage +
          ' урона.'
      );
    } else {
      log.push(
        '[' + spawn.name + '] завдав ' + mobCounter.damage + ' урона.'
      );
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
    });
  });
}

/**
 * Прибрати legacy-поля `battleMods`, пов’язані з уніфікованими self-buffs
 * (War Cry 78, Battle Roar 121, Thrill Fight 130). Використовується при касті
 * in-battle, щоб не було подвійного застосування з `combatBuffsFromActiveJson`.
 */
function stripLegacyBattleModsInPlace(
  bm: BattleBattleMods | undefined,
  skillId: number
): void {
  if (!bm) return;
  const fields: readonly (keyof BattleBattleMods)[] =
    skillId === 78
      ? ['warCryPatkMul']
      : skillId === 121
        ? ['battleRoarMaxHpMul']
        : skillId === 130
          ? ['thrillFightPatkMul']
          : [];
  for (const f of fields) {
    if (f in bm) {
      delete (bm as Record<string, unknown>)[f as string];
    }
  }
}
