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
  jsonBoolLike,
  migrateBattleModsStancesFromLegacy,
  normalizeBattleModsFromJson,
  stripExpiredZealotFromBattleMods,
} from './battle.js';
import { battleModsHasPersistableBuffs } from './battleModsPatch.js';
import { LEGACY_BUFF_STRIP_BY_SKILL_ID } from './legacyBuffStrip.js';

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

export function stanceCount(mods: BattleBattleMods | undefined): number {
  if (!mods) return 0;
  let n = 0;
  if (isStanceAccuracyActive(mods)) n++;
  if (isStanceViciousActive(mods)) n++;
  if (isStanceParryActive(mods)) n++;
  if (jsonBoolLike(mods.aegisStanceActive)) n++;
  if (mods.raceToggleRanks && typeof mods.raceToggleRanks === 'object') {
    n += Object.keys(mods.raceToggleRanks).length;
  }
  return n;
}

export function stripStances(mods: BattleBattleMods): BattleBattleMods {
  const o = { ...mods };
  delete o.stanceAccuracy;
  delete o.stanceVicious;
  delete o.viciousStanceSkillRank;
  delete o.stanceParry;
  delete o.aegisStanceActive;
  delete o.aegisPDefMul;
  delete o.aegisMDefMul;
  delete o.raceToggleRanks;
  migrateBattleModsStancesFromLegacy(o);
  delete o.stance;
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

  const sc = stanceCount(mods);
  const drain =
    sc > 0 && dtSec > 0 ? Math.floor(dtSec * STANCE_MP_PER_SEC * sc) : 0;
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
  if (sc > 0 && mp <= 0) {
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
