/**
 * Boost Evasion (skill 198) — Human Rogue → Treasure Hunter.
 * Пасив: flat +Evasion (ухилення від фізичних атак).
 */
export const BOOST_EVASION_L2_SKILL_ID = 198;
export const BOOST_EVASION_BATTLE_ID = 'l2_198';
export const BOOST_EVASION_MAX_RANK = 3;

export const BOOST_EVASION_FLAT_BY_RANK = [0, 2, 3, 4] as const;

export const BOOST_EVASION_LEVEL_ROWS = [
  { level: 1, requiredLevel: 24, spCost: 5_900, evasionFlat: 2 },
  { level: 2, requiredLevel: 46, spCost: 47_000, evasionFlat: 3 },
  { level: 3, requiredLevel: 58, spCost: 200_000, evasionFlat: 4 },
] as const;

export const BOOST_EVASION_HINT_UK =
  'Пасив: +Evasion (ухилення від звичайних фізичних атак). ' +
  '1 р. — Rogue, 24 лв (+2); 2–3 р. — Treasure Hunter, 46–58 лв (+3/+4). ' +
  'MP у бою не витрачається.';

export function boostEvasionFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(BOOST_EVASION_MAX_RANK, Math.floor(rank)));
  return BOOST_EVASION_FLAT_BY_RANK[r] ?? 0;
}

export function boostEvasionRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return BOOST_EVASION_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function boostEvasionSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = BOOST_EVASION_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function boostEvasionStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(BOOST_EVASION_MAX_RANK, Math.floor(rank)));
  const eva = boostEvasionFlatAtRank(r);
  const reqLv = BOOST_EVASION_LEVEL_ROWS[r - 1]?.requiredLevel;
  const profPart = r === 1 ? 'Rogue' : r >= 2 ? 'Treasure Hunter' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (${profPart}, ${reqLv} лв)`
      : '';
  return (
    'Пасив: +' +
    eva +
    ' Evasion на р. ' +
    r +
    reqPart +
    '. MP у бою не витрачається.'
  );
}
