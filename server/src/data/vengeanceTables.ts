/**
 * Vengeance (skill 368) — Phoenix / Hell / Eva's / Shillien Templar.
 * Масова провокація (радіус 200) + селф-захист: +P.Def / +M.Def, без руху.
 */
export const VENGEANCE_L2_SKILL_ID = 368;
export const VENGEANCE_BATTLE_ID = 'l2_368';
export const VENGEANCE_MAX_RANK = 1;
export const VENGEANCE_AGGRO_POWER = 3994;
export const VENGEANCE_PDEF_FLAT = 5400;
export const VENGEANCE_MDEF_FLAT = 4050;
export const VENGEANCE_MP_COST = 105;
export const VENGEANCE_SP_COST = 20_000_000;
export const VENGEANCE_REQUIRED_LEVEL = 77;
export const VENGEANCE_COOLDOWN_SEC = 1800;
export const VENGEANCE_CAST_SEC = 1;
export const VENGEANCE_DURATION_SEC = 30;
export const VENGEANCE_RADIUS = 200;

export const VENGEANCE_HINT_UK =
  'Масова провокація (радіус ' +
  VENGEANCE_RADIUS +
  '): усі вороги беруть вас у таргет (power ' +
  VENGEANCE_AGGRO_POWER +
  ' = агро, без урону). ' +
  'На 30 с: +' +
  VENGEANCE_PDEF_FLAT +
  ' P.Def, +' +
  VENGEANCE_MDEF_FLAT +
  ' M.Def; персонаж не рухається. Потрібен щит. ' +
  'Каст 1 с, відкат 30 хв. Phoenix / Hell / Eva\'s / Shillien Templar, 77 лв, 1 р.';

export function vengeanceMpAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(VENGEANCE_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return VENGEANCE_MP_COST;
}

export function vengeanceRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(VENGEANCE_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return VENGEANCE_REQUIRED_LEVEL;
}

export function vengeanceSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(VENGEANCE_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return VENGEANCE_SP_COST;
}

export function vengeanceStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.floor(rank));
  return (
    'Масова провокація (радіус ' +
    VENGEANCE_RADIUS +
    ', power ' +
    VENGEANCE_AGGRO_POWER +
    ') + +' +
    VENGEANCE_PDEF_FLAT +
    ' P.Def / +' +
    VENGEANCE_MDEF_FLAT +
    ' M.Def на ' +
    VENGEANCE_DURATION_SEC +
    ' с без руху (р. ' +
    r +
    ', MP ' +
    VENGEANCE_MP_COST +
    ', каст ' +
    VENGEANCE_CAST_SEC +
    ' с, відкат ' +
    VENGEANCE_COOLDOWN_SEC / 60 +
    ' хв).'
  );
}

export function vengeanceSkillLineUk(rank: number): string {
  const r = Math.max(1, Math.min(VENGEANCE_MAX_RANK, Math.floor(rank)));
  return (
    'Відплата (368, Vengeance): провокація в радіусі ' +
    VENGEANCE_RADIUS +
    ' (агро ' +
    VENGEANCE_AGGRO_POWER +
    '), +' +
    VENGEANCE_PDEF_FLAT +
    ' P.Def, +' +
    VENGEANCE_MDEF_FLAT +
    ' M.Def на ' +
    VENGEANCE_DURATION_SEC +
    ' с; персонаж не рухається (р. ' +
    r +
    ').'
  );
}
