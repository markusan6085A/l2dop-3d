import type { BattleJsonState } from '../domain/battle.js';
import {
  markSkillCast,
  type SkillCooldownEntry,
} from '../data/skillCooldowns.js';

/** Персист КД із `mysticSkillCdUntilPatch` (`l2_<id>` → readyAt ms). */
export function mergeMysticSkillCdUntilPatchIntoCooldownRows(
  base: SkillCooldownEntry[],
  mysticSkillCdUntilPatch: Record<string, number> | undefined,
  nowMsTurn: number
): { rows: SkillCooldownEntry[]; changed: boolean } {
  if (
    !mysticSkillCdUntilPatch ||
    Object.keys(mysticSkillCdUntilPatch).length === 0
  ) {
    return { rows: base, changed: false };
  }

  let changed = false;
  let rows = base;
  for (const [key, readyAt] of Object.entries(mysticSkillCdUntilPatch)) {
    const m = /^l2_(\d+)$/.exec(key);
    if (!m || typeof readyAt !== 'number' || !Number.isFinite(readyAt)) {
      continue;
    }
    const skillId = parseInt(m[1]!, 10);
    if (!Number.isFinite(skillId) || skillId <= 0) continue;
    const remainingMs = readyAt - nowMsTurn;
    if (remainingMs <= 0) continue;
    rows = markSkillCast(
      rows,
      skillId,
      remainingMs / 1000,
      nowMsTurn
    );
    changed = true;
  }
  return { rows, changed };
}

/** Оновити `st.battleModsExpiresAtMsBySkillId` з патча хендлера. */
export function applyBattleModsExpiresPatchInPlace(
  st: BattleJsonState,
  battleModsExpiresPatch: Record<string, number> | undefined,
  nowMsTurn: number
): void {
  if (!battleModsExpiresPatch) return;
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

/** Sonic Focus: додати/витратити заряди, оновити max. */
export function applySonicChargesPatchInPlace(
  st: BattleJsonState,
  sonicChargesPatch: { delta?: number; maxSet?: number } | undefined
): void {
  if (!sonicChargesPatch) return;
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
