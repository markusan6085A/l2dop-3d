/**
 * Поза боєм: бойові моди та MP після виходу з бою (стійки, War Cry тощо).
 * Тики: зняття стійок при нестачі MP; загальний термін — `expiresAt`.
 */
import type { BattleBattleMods } from './battle.js';
import type { BattleJsonState } from './battle.js';
import {
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  isFocusAttackActive,
  jsonBoolLike,
  migrateBattleModsStancesFromLegacy,
  normalizeBattleModsFromJson,
  stripExpiredZealotFromBattleMods,
} from './battle.js';
import { battleModsHasPersistableBuffs } from './battleModsPatch.js';
import { applyRiposteReflectToBattleMods } from './riposteStance.js';
import { LEGACY_BUFF_STRIP_BY_SKILL_ID } from './legacyBuffStrip.js';
import { ACCURACY_STANCE_MP_DRAIN_PER_SEC } from '../data/accuracyStanceTables.js';
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
import { HUMAN_FIGHTER_SKILL_CATALOG } from '../data/humanFighterSkillCatalog.entries.js';
import { ELVEN_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/elvenFighterSkillCatalog.generated.js';
import { DARK_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/darkFighterSkillCatalog.generated.js';
import { ORC_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/orcFighterSkillCatalog.generated.js';
import { DWARF_FIGHTER_SKILL_CATALOG_GENERATED } from '../data/dwarfFighterSkillCatalog.generated.js';
import { HUMAN_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/humanMysticSkillCatalog.generated.js';
import { ELVEN_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/elvenMysticSkillCatalog.generated.js';
import { DARK_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/darkMysticSkillCatalog.generated.js';
import { ORC_MYSTIC_SKILL_CATALOG_GENERATED } from '../data/orcMysticSkillCatalog.generated.js';

export interface WorldCombatState {
  battleMods: BattleBattleMods;
  playerMp: number;
  lastTickAt: number;
  /** Після цього часу всі ефекти знімаються (стінг ~30 хв). */
  expiresAt: number;
  /**
   * Індивідуальні терміни legacy-бафів (Dash/Rapid Shot/Snipe/Howl/Rage/
   * Frenzy/Guts/Lionheart/Focus Attack/детекти): ключ — skillId як рядок,
   * значення — `expiresAt` (мс epoch). Дзеркало `battleModsExpiresAtMsBySkillId`
   * з `battleJson`, щоб L2-тайминги не скидалися при виході з бою / F5.
   */
  battleModsExpiresAtMsBySkillId?: Record<string, number>;
  /**
   * Sonic Focus (Gladiator/Duelist) — дзеркало `st.sonicCharges` у `battleJson`.
   * Зберігаємо поза боєм, щоб заряди не обнулялись при F5/виході з бою/телепорті.
   * Скидається в 0 на смерть гравця (`persistBattleDefeatInTx`).
   */
  sonicCharges?: number;
  /** Поточний ліміт зарядів (зазвичай `SONIC_MAX_CHARGES_DEFAULT` = 10). */
  maxSonicCharges?: number;
}

const WORLD_COMBAT_MAX_MS = 30 * 60 * 1000;
const WORLD_MP_REGEN_TICK_SEC = 2;
/**
 * Наближено до L2 Interlude: витрата MP на утримання однієї стійки (`per second`).
 * Спільна ставка для світового тика (поза боєм) та `performBattleAction` (у бою).
 */
export const STANCE_MP_PER_SEC = 0.4;

let toggleSkillIdSetCache: ReadonlySet<number> | null = null;

/** Toggle l2 id з усіх расових каталогів — lazy, щоб уникнути circular init. */
function toggleSkillIdSet(): ReadonlySet<number> {
  if (toggleSkillIdSetCache) return toggleSkillIdSetCache;
  toggleSkillIdSetCache = new Set(
    [
      ...HUMAN_FIGHTER_SKILL_CATALOG,
      ...ELVEN_FIGHTER_SKILL_CATALOG_GENERATED,
      ...DARK_FIGHTER_SKILL_CATALOG_GENERATED,
      ...ORC_FIGHTER_SKILL_CATALOG_GENERATED,
      ...DWARF_FIGHTER_SKILL_CATALOG_GENERATED,
      ...HUMAN_MYSTIC_SKILL_CATALOG_GENERATED,
      ...ELVEN_MYSTIC_SKILL_CATALOG_GENERATED,
      ...DARK_MYSTIC_SKILL_CATALOG_GENERATED,
      ...ORC_MYSTIC_SKILL_CATALOG_GENERATED,
    ]
      .filter((e) => e.kind === 'toggle')
      .map((e) => e.l2SkillId)
  );
  return toggleSkillIdSetCache;
}

function activeIconToggleSkillIds(mods: BattleBattleMods): number[] {
  const ids = new Set<number>();
  const pushIcon = (iconRaw: unknown, mulRaw: unknown): void => {
    const icon =
      typeof iconRaw === 'number' && Number.isFinite(iconRaw)
        ? Math.floor(iconRaw)
        : NaN;
    const mul =
      typeof mulRaw === 'number' && Number.isFinite(mulRaw) ? mulRaw : 1;
    if (icon > 0 && mul > 1 && toggleSkillIdSet().has(icon)) {
      ids.add(icon);
    }
  };
  pushIcon(mods.mysticPatkBuffIconSkillId, mods.mysticPatkBuffMul);
  pushIcon(mods.mysticMatkBuffIconSkillId, mods.mysticMatkBuffMul);
  pushIcon(mods.mysticCastSpdBuffIconSkillId, mods.mysticCastSpdBuffMul);
  pushIcon(mods.mysticPdefBuffIconSkillId, mods.mysticPdefBuffMul);
  pushIcon(mods.mysticMdefBuffIconSkillId, mods.mysticMdefBuffMul);
  return [...ids];
}

export function stanceCount(mods: BattleBattleMods | undefined): number {
  if (!mods) return 0;
  let n = 0;
  if (isStanceAccuracyActive(mods)) n++;
  if (isStanceViciousActive(mods)) n++;
  if (isStanceParryActive(mods)) n++;
  if (isFocusAttackActive(mods)) n++;
  if (jsonBoolLike(mods.aegisStanceActive)) n++;
  if (mods.raceToggleRanks && typeof mods.raceToggleRanks === 'object') {
    for (const key of Object.keys(mods.raceToggleRanks)) {
      if (key !== 'l2_322' && key !== 'l2_335' && key !== 'l2_334') n++;
    }
  }
  n += activeIconToggleSkillIds(mods).length;
  return n;
}

/** Сумарна витрата MP/с від активних HF toggle-стійок (256 — 0.2, інші — 0.4). */
export function hfStanceMpDrainPerSec(mods: BattleBattleMods | undefined): number {
  if (!mods) return 0;
  let rate = 0;
  if (isStanceAccuracyActive(mods)) {
    rate += ACCURACY_STANCE_MP_DRAIN_PER_SEC;
  }
  if (isStanceViciousActive(mods)) rate += STANCE_MP_PER_SEC;
  if (isStanceParryActive(mods)) rate += STANCE_MP_PER_SEC;
  if (isFocusAttackActive(mods)) rate += STANCE_MP_PER_SEC;
  if (jsonBoolLike(mods.aegisStanceActive)) rate += STANCE_MP_PER_SEC;
  if (mods.raceToggleRanks && typeof mods.raceToggleRanks === 'object') {
    for (const key of Object.keys(mods.raceToggleRanks)) {
      if (key !== 'l2_322' && key !== 'l2_335' && key !== 'l2_334') rate += STANCE_MP_PER_SEC;
    }
  }
  rate += activeIconToggleSkillIds(mods).length * STANCE_MP_PER_SEC;
  return rate;
}

export function hfStanceMpDrainForIntervalSec(
  mods: BattleBattleMods | undefined,
  dtSec: number
): number {
  if (dtSec <= 0) return 0;
  const rate = hfStanceMpDrainPerSec(mods);
  return rate > 0 ? Math.floor(dtSec * rate) : 0;
}

export function stripStances(mods: BattleBattleMods): BattleBattleMods {
  const o = { ...mods };
  delete o.stanceAccuracy;
  delete o.stanceVicious;
  delete o.viciousStanceSkillRank;
  delete o.stanceParry;
  delete o.focusAttackActive;
  delete o.aegisStanceActive;
  delete o.aegisPDefMul;
  delete o.aegisMDefMul;
  delete o.raceToggleRanks;
  const iconToggleIds = activeIconToggleSkillIds(o);
  const clearIconChannelIfToggle = (
    iconKey:
      | 'mysticPatkBuffIconSkillId'
      | 'mysticMatkBuffIconSkillId'
      | 'mysticCastSpdBuffIconSkillId'
      | 'mysticPdefBuffIconSkillId'
      | 'mysticMdefBuffIconSkillId',
    mulKey:
      | 'mysticPatkBuffMul'
      | 'mysticMatkBuffMul'
      | 'mysticCastSpdBuffMul'
      | 'mysticPdefBuffMul'
      | 'mysticMdefBuffMul'
  ): void => {
    const iconRaw = o[iconKey];
    const icon =
      typeof iconRaw === 'number' && Number.isFinite(iconRaw)
        ? Math.floor(iconRaw)
        : NaN;
    if (icon > 0 && iconToggleIds.includes(icon)) {
      delete o[iconKey];
      o[mulKey] = 1;
    }
  };
  clearIconChannelIfToggle('mysticPatkBuffIconSkillId', 'mysticPatkBuffMul');
  clearIconChannelIfToggle('mysticMatkBuffIconSkillId', 'mysticMatkBuffMul');
  clearIconChannelIfToggle(
    'mysticCastSpdBuffIconSkillId',
    'mysticCastSpdBuffMul'
  );
  clearIconChannelIfToggle('mysticPdefBuffIconSkillId', 'mysticPdefBuffMul');
  clearIconChannelIfToggle('mysticMdefBuffIconSkillId', 'mysticMdefBuffMul');
  migrateBattleModsStancesFromLegacy(o);
  delete o.stance;
  applyRiposteReflectToBattleMods(o);
  return o;
}

function modsMeaningful(m: BattleBattleMods | undefined): boolean {
  if (!m) return false;
  return battleModsHasPersistableBuffs(m);
}

/**
 * Моб-цільові дебафи не повинні переходити на наступного моба.
 * Залишаємо тільки self-бафи персонажа для міжбойового персисту.
 */
function stripMobTargetDebuffsInPlace(m: BattleBattleMods): void {
  delete m.mobPatkDebuffMul;
  delete m.mobPatkDebuffIconSkillId;
  delete m.mobPatkDebuffIconSkillIds;
  delete m.mobTargetPDefMul;
  delete m.mobTargetPDefDebuffIconSkillId;
  delete m.mobTargetPDefDebuffIconSkillIds;
  delete m.mobTargetMDefMul;
  delete m.mobTargetMDefDebuffIconSkillId;
  delete m.mobTargetMDefDebuffIconSkillIds;
  delete m.mobSleepUntilMs;
  delete m.mobSleepIconSkillId;
  delete m.mobStunUntilMs;
  delete m.mobStunIconSkillId;
  delete m.mobBackExposedUntilMs;
  delete m.mobBackExposedIconSkillId;
}

export function parseWorldCombatState(
  raw: unknown
): WorldCombatState | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const bm = o.battleMods;
  if (bm == null || typeof bm !== 'object' || Array.isArray(bm)) {
    return null;
  }
  const playerMp = typeof o.playerMp === 'number' && Number.isFinite(o.playerMp)
    ? o.playerMp
    : 0;
  const lastTickAt =
    typeof o.lastTickAt === 'number' && Number.isFinite(o.lastTickAt)
      ? o.lastTickAt
      : Date.now();
  const expiresAt =
    typeof o.expiresAt === 'number' && Number.isFinite(o.expiresAt)
      ? o.expiresAt
      : lastTickAt + WORLD_COMBAT_MAX_MS;
  const battleMods = { ...(bm as BattleBattleMods) };
  normalizeBattleModsFromJson(battleMods);
  migrateBattleModsStancesFromLegacy(battleMods);
  stripMobTargetDebuffsInPlace(battleMods);

  let battleModsExpiresAtMsBySkillId: Record<string, number> | undefined;
  const rawExp = o.battleModsExpiresAtMsBySkillId;
  if (rawExp != null && typeof rawExp === 'object' && !Array.isArray(rawExp)) {
    const map: Record<string, number> = {};
    for (const k of Object.keys(rawExp as Record<string, unknown>)) {
      const v = (rawExp as Record<string, unknown>)[k];
      const n = typeof v === 'number' && Number.isFinite(v) ? v : NaN;
      if (Number.isFinite(n) && n > 0) map[k] = Math.floor(n);
    }
    if (Object.keys(map).length > 0) {
      battleModsExpiresAtMsBySkillId = map;
    }
  }

  const sonicChargesRaw =
    typeof o.sonicCharges === 'number' && Number.isFinite(o.sonicCharges)
      ? Math.max(0, Math.floor(o.sonicCharges))
      : undefined;
  const maxSonicChargesRaw =
    typeof o.maxSonicCharges === 'number' && Number.isFinite(o.maxSonicCharges)
      ? Math.max(1, Math.floor(o.maxSonicCharges))
      : undefined;

  return {
    battleMods,
    playerMp,
    lastTickAt,
    expiresAt,
    ...(battleModsExpiresAtMsBySkillId !== undefined
      ? { battleModsExpiresAtMsBySkillId }
      : {}),
    ...(sonicChargesRaw !== undefined && sonicChargesRaw > 0
      ? { sonicCharges: sonicChargesRaw }
      : {}),
    ...(maxSonicChargesRaw !== undefined
      ? { maxSonicCharges: maxSonicChargesRaw }
      : {}),
  };
}

/**
 * MP поза боєм: `playerMp` і `lastTickAt` у БД — базова точка; витрата з моменту lastTickAt без подвійного лічильника.
 * `lastTickAt` у результаті не зсуваємо (оновлення лише при збереженні після бою / вході в бій).
 */
export function tickWorldCombatState(
  state: WorldCombatState | null,
  maxMp: number,
  nowMs: number,
  regenMpPerSec: number = 0
): WorldCombatState | null {
  if (!state) return null;
  if (nowMs >= state.expiresAt) {
    return null;
  }
  const dtSec = Math.max(0, (nowMs - state.lastTickAt) / 1000);
  let mods = { ...state.battleMods };
  migrateBattleModsStancesFromLegacy(mods);
  stripExpiredZealotFromBattleMods(mods, nowMs);
  stripMobTargetDebuffsInPlace(mods);

  /**
   * Знімаємо legacy-бафи, у яких вийшов час, згідно `battleModsExpiresAtMsBySkillId`.
   * У L2 Interlude це те ж саме, що робить «внутрішньобойовий» експірейшн-тік —
   * тут лише поза боєм (F5/рух, телепорт) або між бійками.
   */
  const nextExpires: Record<string, number> = {
    ...(state.battleModsExpiresAtMsBySkillId ?? {}),
  };
  let strippedAny = false;
  for (const key of Object.keys(nextExpires)) {
    const t = nextExpires[key];
    if (typeof t !== 'number' || t <= nowMs) {
      const sid = parseInt(key, 10);
      const strip = Number.isFinite(sid)
        ? LEGACY_BUFF_STRIP_BY_SKILL_ID[sid]
        : undefined;
      if (strip) strip(mods);
      delete nextExpires[key];
      strippedAny = true;
    }
  }

  const sfRank = shieldFortressActiveRank(undefined, mods.raceToggleRanks);
  const ftRank = fortitudeActiveRank(undefined, mods.raceToggleRanks);
  const fsmRank = focusSkillMasteryActiveRank(undefined, mods.raceToggleRanks);
  const stanceDrain =
    dtSec > 0 ? hfStanceMpDrainForIntervalSec(mods, dtSec) : 0;
  const sfDrain =
    sfRank != null
      ? shieldFortressMpDrainForIntervalSec(sfRank, dtSec)
      : 0;
  const ftDrain =
    ftRank != null ? fortitudeMpDrainForIntervalSec(ftRank, dtSec) : 0;
  const fsmDrain =
    fsmRank != null ? focusSkillMasteryMpDrainForIntervalSec(fsmRank, dtSec) : 0;
  const drain = stanceDrain + sfDrain + ftDrain + fsmDrain;
  const regenSec =
    regenMpPerSec > 0
      ? Math.floor(dtSec / WORLD_MP_REGEN_TICK_SEC) * WORLD_MP_REGEN_TICK_SEC
      : 0;
  const mpRegen =
    regenMpPerSec > 0 && regenSec > 0
      ? Math.floor(regenMpPerSec * regenSec)
      : 0;
  let mp = Math.max(0, Math.floor(state.playerMp - drain + mpRegen));
  mp = Math.min(maxMp, mp);
  const sc = stanceCount(mods);
  if ((sc > 0 || sfRank != null || ftRank != null || fsmRank != null) && mp <= 0) {
    mods = stripStances(mods);
  }
  const hasSonic =
    typeof state.sonicCharges === 'number' && state.sonicCharges > 0;
  const hasMaxSonic =
    typeof state.maxSonicCharges === 'number' && state.maxSonicCharges > 0;
  if (
    !modsMeaningful(mods) &&
    mp >= maxMp - 1 &&
    !hasSonic &&
    !hasMaxSonic
  ) {
    return null;
  }
  const hasExp = Object.keys(nextExpires).length > 0;
  return {
    battleMods: mods,
    playerMp: mp,
    lastTickAt: state.lastTickAt,
    expiresAt: state.expiresAt,
    ...(hasExp
      ? { battleModsExpiresAtMsBySkillId: nextExpires }
      : strippedAny
        ? {}
        : state.battleModsExpiresAtMsBySkillId !== undefined
          ? { battleModsExpiresAtMsBySkillId: state.battleModsExpiresAtMsBySkillId }
          : {}),
    ...(hasSonic ? { sonicCharges: state.sonicCharges } : {}),
    ...(hasMaxSonic ? { maxSonicCharges: state.maxSonicCharges } : {}),
  };
}

export function worldCombatStateFromBattleJson(
  st: BattleJsonState,
  maxMp: number,
  nowMs: number,
  opts?: { stripBattleMods?: boolean }
): WorldCombatState | null {
  const mpRaw =
    typeof st.playerMp === 'number' && Number.isFinite(st.playerMp)
      ? Math.min(maxMp, Math.max(0, Math.floor(st.playerMp)))
      : maxMp;
  let mods: BattleBattleMods | undefined =
    opts?.stripBattleMods === true
      ? undefined
      : st.battleMods
        ? { ...st.battleMods }
        : undefined;
  if (mods) {
    normalizeBattleModsFromJson(mods);
    migrateBattleModsStancesFromLegacy(mods);
    stripExpiredZealotFromBattleMods(mods, nowMs);
    stripMobTargetDebuffsInPlace(mods);
  }
  const hasMods = mods && modsMeaningful(mods);
  const mpNotFull = mpRaw < maxMp - 1;

  /**
   * Копіюємо індивідуальні терміни legacy-бафів з `battleJson` — щоб вони
   * не обнулялись при поверненні у світ. Порожні/неактуальні ключі прибираємо.
   */
  let legacyExpires: Record<string, number> | undefined;
  if (opts?.stripBattleMods !== true && st.battleModsExpiresAtMsBySkillId) {
    const src = st.battleModsExpiresAtMsBySkillId;
    const next: Record<string, number> = {};
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (typeof v === 'number' && v > nowMs) next[k] = Math.floor(v);
    }
    if (Object.keys(next).length > 0) legacyExpires = next;
  }

  /**
   * Sonic-заряди теж переносимо у світовий стан (якщо не просили стерти
   * battleMods на смерть). Це дає persistance через F5/телепорт/вихід з бою.
   */
  const sonicCharges =
    opts?.stripBattleMods !== true &&
    typeof st.sonicCharges === 'number' &&
    st.sonicCharges > 0
      ? Math.floor(st.sonicCharges)
      : undefined;
  const maxSonicCharges =
    opts?.stripBattleMods !== true &&
    typeof st.maxSonicCharges === 'number' &&
    st.maxSonicCharges > 0
      ? Math.floor(st.maxSonicCharges)
      : undefined;

  if (
    !hasMods &&
    !mpNotFull &&
    !legacyExpires &&
    sonicCharges === undefined &&
    maxSonicCharges === undefined
  ) {
    return null;
  }
  return {
    battleMods: hasMods ? mods! : {},
    playerMp: mpRaw,
    lastTickAt: nowMs,
    expiresAt: nowMs + WORLD_COMBAT_MAX_MS,
    ...(legacyExpires !== undefined
      ? { battleModsExpiresAtMsBySkillId: legacyExpires }
      : {}),
    ...(sonicCharges !== undefined ? { sonicCharges } : {}),
    ...(maxSonicCharges !== undefined ? { maxSonicCharges } : {}),
  };
}

export function isCharacterInBattle(battleJson: unknown): boolean {
  if (battleJson == null || typeof battleJson !== 'object' || Array.isArray(battleJson)) {
    return false;
  }
  return typeof (battleJson as Record<string, unknown>).spawnId === 'string';
}
