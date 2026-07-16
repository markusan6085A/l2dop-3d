/**
 * Deflect Arrow (skill 112) — Human Knight / Dark Avenger.
 * Селф-баф: +% захисту від атак луком/арбалетом, 20 хв, без урону.
 */
import { persistableActiveBuffsFromJson } from './l2dopActiveBuffs.js';
import type { BattleActionId } from '../domain/battleTypes.js';

export const DEFLECT_ARROW_L2_SKILL_ID = 112;
export const DEFLECT_ARROW_BATTLE_ID = 'l2_112';
export const DEFLECT_ARROW_MAX_RANK = 4;
export const DEFLECT_ARROW_BUFF_DURATION_SEC = 20 * 60;
export const DEFLECT_ARROW_COOLDOWN_SEC = 10;
export const DEFLECT_ARROW_CAST_SEC = 1.5;

export const DEFLECT_ARROW_BOW_DEF_PCT_BY_RANK = [0, 16, 19, 22, 25] as const;

export const DEFLECT_ARROW_LEVEL_ROWS = [
  { level: 1, requiredLevel: 24, spCost: 10_000, mpCost: 22 },
  { level: 2, requiredLevel: 32, spCost: 25_000, mpCost: 28 },
  { level: 3, requiredLevel: 43, spCost: 38_000, mpCost: 38 },
  { level: 4, requiredLevel: 49, spCost: 70_000, mpCost: 44 },
] as const;

export const DEFLECT_ARROW_HINT_UK =
  'Активний селф-баф: +% захисту від атак луком/арбалетом на 20 хв. ' +
  '1–2 р. — Human Knight (24 / 32 лв); 3–4 р. — Dark Avenger (43 / 49 лв). ' +
  'Каст 1,5 с, відкат 10 с. Урону не завдає.';

export function deflectArrowBowDefPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(DEFLECT_ARROW_MAX_RANK, Math.floor(rank)));
  return DEFLECT_ARROW_BOW_DEF_PCT_BY_RANK[r] ?? 0;
}

export function deflectArrowRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return DEFLECT_ARROW_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function deflectArrowSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = DEFLECT_ARROW_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function deflectArrowMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(DEFLECT_ARROW_MAX_RANK, Math.floor(rank)));
  const mp = DEFLECT_ARROW_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

/** Knight / Paladin — 2 р.; Dark Avenger — 4 р. */
export function deflectArrowMaxRankForMappedProfession(
  mappedHumanProf: string
): number {
  const p = String(mappedHumanProf || '').trim();
  if (p === 'human_dark_avenger' || p === 'human_hell_knight') {
    return DEFLECT_ARROW_MAX_RANK;
  }
  if (
    p === 'human_knight' ||
    p === 'human_paladin' ||
    p === 'human_phoenix_knight'
  ) {
    return 2;
  }
  return 0;
}

export function deflectArrowStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(DEFLECT_ARROW_MAX_RANK, Math.floor(rank)));
  const pct = deflectArrowBowDefPctAtRank(r);
  const mp = deflectArrowMpAtRank(r);
  const reqLv = DEFLECT_ARROW_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    '+' +
    pct +
    '% захисту від лука/арбалета на 20 хв (р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ', каст ' +
    DEFLECT_ARROW_CAST_SEC +
    ' с, відкат ' +
    DEFLECT_ARROW_COOLDOWN_SEC +
    ' с).'
  );
}

export function deflectArrowSkillLineUk(rank: number): string {
  const pct = deflectArrowBowDefPctAtRank(rank);
  return (
    'Відбиття стріли (112): +' +
    pct +
    '% захисту від лука/арбалета на 20 хв.'
  );
}

/** Множник вхідного фіз. урону від лука (1 = без змін, 0.84 = −16%). */
export function deflectArrowIncomingPhysMulFromActiveBuffs(
  activeBuffsJson: unknown,
  nowMs: number
): number {
  const buffs = persistableActiveBuffsFromJson(activeBuffsJson, nowMs);
  const row = buffs.find((b) => b.skillId === DEFLECT_ARROW_L2_SKILL_ID);
  if (!row || row.level < 1) return 1;
  const pct = deflectArrowBowDefPctAtRank(row.level);
  if (pct <= 0) return 1;
  return Math.max(0.05, 1 - pct / 100);
}

const BOW_BATTLE_ACTIONS = new Set<BattleActionId>([
  'power_shot',
  'double_shot',
  'burst_shot',
  'rapid_shot',
  'snipe',
  'stun_shot',
  'lethal_shot',
  'hamstring_shot',
]);

const BOW_L2_SKILL_IDS = new Set([56, 19, 24, 99, 101, 313, 343, 354]);

/** Чи атака в PvP рахується «луком/арбалетом» для Deflect Arrow. */
export function isPvpBowPhysicalAttack(
  action: BattleActionId,
  weaponKind: string | undefined
): boolean {
  if (BOW_BATTLE_ACTIONS.has(action)) return true;
  if (action === 'attack' && weaponKind === 'bow') return true;
  const s = String(action);
  if (/^l2_\d+$/.test(s)) {
    const id = Number(s.slice(3));
    if (Number.isFinite(id) && BOW_L2_SKILL_IDS.has(id)) return true;
  }
  return false;
}
