/**
 * Підмішує до прев’ю магістра MP / «силу» з l2dop XML, узгоджено з humanFighterTurn / humanMysticTurn.
 */
import { l2dopXmlSkillRow } from './l2dopXmlSkillLevels.lookup.js';

const BUFF_LIKE_MP_ONLY_POWER_FROM_CATALOG = new Set<string>([
  'l2_287',
  'l2_80',
  'l2_87',
  'l2_88',
  'l2_104',
  'l2_359',
  'l2_360',
  'l2_317',
  'l2_130',
]);

export function applyL2dopXmlMagisterOverlay(
  battleCanonId: string,
  skillRank: number,
  base: {
    mp: number | null;
    power: number | null;
    statsNoteUk: string | null;
  }
): {
  mp: number | null;
  power: number | null;
  statsNoteUk: string | null;
} {
  const m = /^l2_(\d+)$/.exec(battleCanonId);
  if (!m) return base;
  const id = parseInt(m[1], 10);
  const xr = l2dopXmlSkillRow(id, skillRank);
  if (!xr) return base;

  const out = { ...base, mp: xr.m };

  switch (battleCanonId) {
    case 'l2_313':
      if (xr.a != null) out.power = xr.a;
      break;
    case 'l2_78':
      if (xr.a != null) out.power = Math.round((xr.a - 1) * 100);
      break;
    case 'l2_320':
      out.power = null;
      break;
    case 'l2_88':
      out.mp = 30;
      break;
    case 'l2_359':
      out.mp = 33;
      break;
    case 'l2_360':
      out.mp = 71;
      break;
    case 'l2_99':
      out.power =
        xr.r != null ? Math.round((xr.r - 1) * 100) : base.power;
      break;
    default:
      if (BUFF_LIKE_MP_ONLY_POWER_FROM_CATALOG.has(battleCanonId)) {
        out.power = xr.p !== 0 ? xr.p : base.power;
      } else if (xr.p !== 0) {
        out.power = xr.p;
      } else {
        out.power = base.power;
      }
  }
  return out;
}
