/**
 * Рівні MP/power з l2dop/skills XML (згенеровано gen-l2dop-skill-xml-tables.mjs).
 */
import DATA from './l2dopSkillXmlLevels.generated.js';

export type L2dopXmlSkillRow = {
  readonly m: number;
  readonly p: number;
  readonly a?: number;
  readonly r?: number;
  readonly s?: number;
  readonly mx?: number;
};

function clampRank(rank1Based: number, len: number): number {
  const r = Math.floor(rank1Based);
  if (!Number.isFinite(r) || r < 1) return 1;
  return Math.min(r, len);
}

export function l2dopXmlSkillRow(
  l2SkillId: number,
  rank1Based: number
): L2dopXmlSkillRow | undefined {
  const rows = DATA[String(l2SkillId) as keyof typeof DATA];
  if (!rows?.length) return undefined;
  const idx = clampRank(rank1Based, rows.length) - 1;
  return rows[idx] as L2dopXmlSkillRow;
}

/** MP і skill power для фіз./маг. формул бою (як у PHP l2dop). */
export function l2dopXmlMpPower(
  l2SkillId: number,
  rank1Based: number
): { mp: number; power: number } | undefined {
  const row = l2dopXmlSkillRow(l2SkillId, rank1Based);
  if (!row) return undefined;
  return { mp: row.m, power: row.p };
}
