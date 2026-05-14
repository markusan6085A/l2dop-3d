/**
 * Одноразова генерація `humanFighterTurnCore*.ts` з монолітного `humanFighterTurnCore.ts`.
 * Після першого успішного прогону entry стає тонким — повторний запуск блокується.
 *
 * Спільний блок IMPORTS у виводі — заглушка: реальні модулі тримай із звуженими імпортами
 * (як у репозиторії після `npx tsc --noEmit`).
 *
 * Запуск з кореня репо: node server/scripts/split-human-fighter-turn-core.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const corePath = path.join(
  repoRoot,
  'server',
  'src',
  'domain',
  'battleSkills',
  'humanFighterTurnCore.ts'
);

const headerComment = (title) =>
  `/**\n * Human fighter turn — ${title} (ланцюг з resolveHumanFighterTurnCore).\n */\n`;

const IMPORTS = `import {
  burstShotMpAndPower,
  doubleShotMpAndPower,
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
import type { BattleSkillTurnResult } from './types.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
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
import type { FighterTurnCoreArgs } from './humanFighterTurnCoreArgs.js';
`;

const segments = [
  {
    file: 'humanFighterTurnCoreBasics.ts',
    fn: 'tryResolveHumanFighterTurnBasics',
    title: 'базові удари, лук, War Cry, Dash, Roar, POLE/мечі до Provoke',
    start: 101,
    end: 609,
  },
  {
    file: 'humanFighterTurnCoreDetections.ts',
    fn: 'tryResolveHumanFighterTurnDetections',
    title: 'детекти слабкості, Howl, Hammer, Shock Blast',
    start: 610,
    end: 1020,
  },
  {
    file: 'humanFighterTurnCoreStances.ts',
    fn: 'tryResolveHumanFighterTurnStances',
    title: 'стійки та l2_94 / l2_176 / l2_139',
    start: 1021,
    end: 1234,
  },
  {
    file: 'humanFighterTurnCoreSonic.ts',
    fn: 'tryResolveHumanFighterTurnSonic',
    title: 'Gladiator / Duelist, sonic-заряди',
    start: 1235,
    end: 1593,
  },
];

function main() {
  const text = fs.readFileSync(corePath, 'utf8');
  if (
    text.includes('tryResolveHumanFighterTurnBasics') ||
    text.includes('humanFighterTurnCoreBasics.js')
  ) {
    console.error(
      '[split-human-fighter-turn-core] Пропуск: humanFighterTurnCore.ts уже тонкий entry. Щоб знову вирізати ланцюги — віднови монолітний core з git, потім запусти скрипт.'
    );
    process.exit(2);
  }

  const lines = text.split(/\r?\n/);

  for (const s of segments) {
    const body = lines.slice(s.start, s.end).join('\n');
    const out =
      headerComment(s.title) +
      IMPORTS +
      `
export function ${s.fn}(a: FighterTurnCoreArgs): BattleSkillTurnResult | undefined {
  const { ctx, rollPhys, action, combat, preLevel, l2Profession, profM, rank } = a;
${body}
  return undefined;
}
`;
    fs.writeFileSync(
      path.join(path.dirname(corePath), s.file),
      out,
      'utf8'
    );
    // eslint-disable-next-line no-console
    console.log('wrote', s.file);
  }

  const entry = `/**
 * Розгалуження усіх скілів fighter (урон, бафи, контроль).
 */
import { humanFighterProfessionAtkMult } from '../../data/l2dopHumanFighterBattleSkills.js';
import { battleActionNamedFromL2IfMapped } from '../../data/humanFighterSkillCatalog.js';
import { tryResolveFighterRaceCatalogTurn } from './fighterRaceCatalogTurn.js';
import { resolveHumanFighterGapSkillsTurn } from './humanFighterGapSkillsTurn.js';
import { skillRankForCurrentAction } from './humanFighterTurnHelpers.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import type { FighterTurnCoreArgs } from './humanFighterTurnCoreArgs.js';
import { tryResolveHumanFighterTurnBasics } from './humanFighterTurnCoreBasics.js';
import { tryResolveHumanFighterTurnDetections } from './humanFighterTurnCoreDetections.js';
import { tryResolveHumanFighterTurnStances } from './humanFighterTurnCoreStances.js';
import { tryResolveHumanFighterTurnSonic } from './humanFighterTurnCoreSonic.js';

export function resolveHumanFighterTurnCore(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult {
  const { combat, preLevel, l2Profession } = ctx;
  const action = battleActionNamedFromL2IfMapped(ctx.action);
  const profM = humanFighterProfessionAtkMult(preLevel, l2Profession);
  const rank = skillRankForCurrentAction(ctx);
  const args: FighterTurnCoreArgs = {
    ctx,
    rollPhys,
    action,
    combat,
    preLevel,
    l2Profession,
    profM,
    rank,
  };

  const b = tryResolveHumanFighterTurnBasics(args);
  if (b) return b;
  const d = tryResolveHumanFighterTurnDetections(args);
  if (d) return d;
  const s = tryResolveHumanFighterTurnStances(args);
  if (s) return s;
  const so = tryResolveHumanFighterTurnSonic(args);
  if (so) return so;

  const raceCat = tryResolveFighterRaceCatalogTurn(ctx, rollPhys);
  if (raceCat) return raceCat;

  const gap = resolveHumanFighterGapSkillsTurn(ctx, rollPhys);
  if (gap) return gap;

  throw new Error('battle_skill_not_allowed');
}
`;
  fs.writeFileSync(corePath, entry, 'utf8');
  // eslint-disable-next-line no-console
  console.log('wrote humanFighterTurnCore.ts (entry)');
}

main();
