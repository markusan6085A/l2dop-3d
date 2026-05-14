/**
 * Розбиває humanFighterTurn.ts → constants (+ helpers + core + entry).
 * node server/scripts/split-human-fighter-turn.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const battleDir = path.resolve(__dirname, '../src/domain/battleSkills');
const srcPath = path.join(battleDir, 'humanFighterTurn.ts');
const ls = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);

const exportFns = new Set([
  'warriorProfOkForSkill',
  'warlordBranchProfession',
  'gladiatorBranchProfession',
  'warlordOrGladiatorTier2',
  'swordOrBluntWeapon',
  'dualSwordWeapon',
  'swordOrBluntOrDualWeapon',
  'requireSonicChargeCost',
  'sonicMasteryLifestealHeal',
  'rollAccumulatedWarriorAttack',
  'legacyBuffOnCd',
  'legacyBuffCdAndExpirePatches',
  'legacyBuffExpiresPatch',
  'maybeApplyDreadnoughtSkillMastery',
  'requireCatalogEntryForAction',
  'resolveFighterCatalogBattleId',
  'catalogAllowsFighterAction',
  'stubMpForCanon',
  'skillRankForCurrentAction',
  'applyStandardFighterCooldown',
]);

function exp(ln) {
  const m = /^function ([A-Za-z0-9_]+)\s*\(/.exec(ln);
  if (m && exportFns.has(m[1])) return ln.replace(/^function /, 'export function ');
  return ln;
}

/** Рядки 43–145 (індекси 41–143). */
const headBlock = ls.slice(42, 145);
/** WARRIOR + DREAD константи (188–194 файлу) індекси 187–193 включно. */
const warriorDread = ls.slice(187, 194);
/** Код із 206 – закриваюча `}` applyStandard включно (індекси 205–573). */
const tailBlock = ls.slice(205, 574);

const helpersBodyLines = [...headBlock, ...warriorDread, ...tailBlock].map(exp);

const helpersHeader = `/**
 * Допоміжні функції fighter-turn перед resolveHumanFighterTurnCore.
 */
import {
  fighterProfessionAllowedForRace,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isFighterClassBranch,
} from '../../data/l2dopHumanFighterBattleSkills.js';
import {
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  jsonFiniteNum,
} from '../battle.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import type { BattleActionId } from '../battle.js';
import {
  canonicalBattleIdForAction,
  canonicalBattleSkillId,
  catalogEntryVisibleForProfession,
  humanFighterCatalogEntry,
} from '../../data/humanFighterSkillCatalog.js';
import type { HumanFighterSkillCatalogEntry } from '../../data/humanFighterSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { mysticCatalogEntryVisibleForProfession } from '../../data/humanMysticSkillCatalog.professionRules.js';
import { l2dopXmlSkillRow } from '../../data/l2dopXmlSkillLevels.lookup.js';
import { cooldownSecForSkillId } from '../../data/skillCooldowns.js';
import { buffDurationSecForSkillId } from '../../data/l2dopBuffDurations.js';
import { sonicChargeRequirementForSkillId } from '../sonicCharges.js';

`;

fs.writeFileSync(
  path.join(battleDir, 'humanFighterTurnHelpers.ts'),
  helpersHeader + helpersBodyLines.join('\n') + '\n',
  'utf8'
);

const coreIx = ls.findIndex((l) => /^function resolveHumanFighterTurnCore/.test(l));
if (coreIx < 0) throw new Error('resolveHumanFighterTurnCore not found');
const coreLines = ls.slice(coreIx);
coreLines[0] = coreLines[0].replace(
  /^function resolveHumanFighterTurnCore/,
  'export function resolveHumanFighterTurnCore'
);

const coreHeader = `/**
 * Розгалуження усіх скілів fighter (урон, бафи, контроль).
 */
import {
  burstShotMpAndPower,
  doubleShotMpAndPower,
  humanFighterProfessionAtkMult,
  mortalBlowMpAndPower,
  powerShotMpAndPower,
  powerSmashMpAndPower,
  powerStrikeMpAndPower,
  provokeMpAndPower,
  stunAttackMpAndPower,
  stunShotMpAndPower,
  thunderStormMpAndPower,
  wildSweepMpAndPower,
  whirlwindMpAndPower,
} from '../../data/l2dopHumanFighterBattleSkills.js';
import {
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  jsonFiniteNum,
  type BattleBattleMods,
} from '../battle.js';
import {
  effectiveMobDebuffResistPct,
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';
import { ZEALOT_EFFECT_DURATION_MS } from '../battleTypes.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import { battleActionNamedFromL2IfMapped } from '../../data/humanFighterSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { tryResolveFighterRaceCatalogTurn } from './fighterRaceCatalogTurn.js';
import { resolveHumanFighterGapSkillsTurn } from './humanFighterGapSkillsTurn.js';
import {
  l2dopXmlMpPower,
  l2dopXmlSkillRow,
} from '../../data/l2dopXmlSkillLevels.lookup.js';
import {
  L2DOP_FRENZY,
  L2DOP_FRENZY2HS,
  L2DOP_FRENZY2HSACC,
  l2dopTableAt,
} from '../../data/l2dopRawdataBuffTables.js';
import {
  mobMaxCpFromMobMaxHp,
  WRATH_EFFECT_RADIUS_WORLD,
  wrathCpDrainPercentForSkillLevel,
} from '../../data/wrathSkillConstants.js';
import {
  SONIC_FOCUS_GAIN_PER_CAST,
  SONIC_MAX_CHARGES_DEFAULT,
} from '../sonicCharges.js';

import {
  HAMMER_CRUSH_BASE_STUN_CHANCE_PCT,
  HAMMER_CRUSH_STUN_CHANCE_CAP_PCT,
  HAMMER_CRUSH_STUN_PER_RANK_PCT,
  HAMSTRING_SHOT_BASE_CONTROL_CHANCE_PCT,
  HAMSTRING_SHOT_CONTROL_CHANCE_CAP_PCT,
  HAMSTRING_SHOT_CONTROL_PER_RANK_PCT,
  SHOCK_BLAST_PDEF_DEBUFF_MS,
  STUN_SHOT_BASE_STUN_CHANCE_PCT,
  STUN_SHOT_STUN_CHANCE_CAP_PCT,
  STUN_SHOT_STUN_PER_RANK_PCT,
} from './humanFighterTurnConstants.js';
import {
  catalogAllowsFighterAction,
  dualSwordWeapon,
  gladiatorBranchProfession,
  legacyBuffCdAndExpirePatches,
  legacyBuffExpiresPatch,
  legacyBuffOnCd,
  requireCatalogEntryForAction,
  requireSonicChargeCost,
  rollAccumulatedWarriorAttack,
  skillRankForCurrentAction,
  sonicMasteryLifestealHeal,
  stubMpForCanon,
  swordOrBluntOrDualWeapon,
  swordOrBluntWeapon,
  warlordBranchProfession,
  warlordOrGladiatorTier2,
  warriorProfOkForSkill,
} from './humanFighterTurnHelpers.js';

`;

fs.writeFileSync(
  path.join(battleDir, 'humanFighterTurnCore.ts'),
  (
    coreHeader +
    coreLines.join('\n') +
    '\n'
  ).replace(/\.find\(\(l\) => /g, '.find((l: { level: number }) => '),
  'utf8'
);

const entry = `/**
 * Бойові дії людини-воїна (пакет l2dopHumanFighterBattleSkills).
 *
 * Урон по «AoE» скілах (Whirlwind, Thunder Storm, Earthquake, …) у цій моделі — лише по
 * \`mobHp\` у \`battleJson\`, як у text-rpg для однієї цілі; не додається до pAtk/mAtk у профілі
 * (\`computeCombatStats\` у \`performBattleAction\` не бачить \`battleMods\`).
 */
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import {
  applyStandardFighterCooldown,
  maybeApplyDreadnoughtSkillMastery,
} from './humanFighterTurnHelpers.js';
import { resolveHumanFighterTurnCore } from './humanFighterTurnCore.js';

export function resolveHumanFighterTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult {
  const masteryResult = maybeApplyDreadnoughtSkillMastery(
    ctx,
    resolveHumanFighterTurnCore(ctx, rollPhys)
  );
  return applyStandardFighterCooldown(ctx, masteryResult);
}
`;

fs.writeFileSync(path.join(battleDir, 'humanFighterTurn.ts'), entry, 'utf8');

console.log('OK: humanFighterTurn helpers/core/entry regenerated');
