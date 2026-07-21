/**
 * Таблиця фактичних залежностей шести базових статів з коду (фаза 4.1 audit).
 */
export type StatDependencyRow = {
  stat: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIT' | 'MEN';
  derivedStats: string;
  helper: string;
  formula: string;
  cap: string;
  profile: string;
  battle: string;
  sourceFile: string;
};

export const BASE_STAT_DEPENDENCY_TABLE: StatDependencyRow[] = [
  {
    stat: 'STR',
    derivedStats: 'P.Atk multiplier, physical crit damage multiplier',
    helper: 'resolveStrPhysicalAttackMultiplier',
    formula: 'max(0.10, 1 + (finalSTR - 20) × 0.045)',
    cap: 'floor 0.10; без upper cap',
    profile: 'computeCombatStats.pAtk via computePatkFromFinalStr',
    battle: 'combat.pAtk → rollPlayerPhysicalDmg(atk=combat.pAtk)',
    sourceFile: 'server/src/domain/resolveStrPhysicalAttackMultiplier.ts',
  },
  {
    stat: 'DEX',
    derivedStats: 'Attack Speed (pAtkSpd), Accuracy, Evasion, Physical Crit Rate',
    helper: 'computePrimaryStatMultipliers + physicalCritChancePct + critRateStatFromPhysicalCritPct',
    formula:
      'dexAtkSpeedMul=clamp(1+(DEX-20)×0.03); crit%=clamp(10+(DEX-20)×0.5, 5..60); acc/eva from DEX tables',
    cap: 'multipliers clamp 0.30..3.00; crit% 5..60',
    profile: 'combat.pAtkSpd, accuracy, evasion, critRate',
    battle: 'combat.accuracy/critRate in rollPlayerPhysicalDmg',
    sourceFile: 'server/src/data/l2dopPrimaryStatPipeline.ts',
  },
  {
    stat: 'CON',
    derivedStats: 'Max HP, Max CP, HP regen, P.Def multiplier, stun resist',
    helper: 'conHpMultiplier, computePrimaryStatMultipliers, stunResistPctFromCon',
    formula:
      'conHpMul=clamp(1+(CON-20)×0.05); conPDefMul=clamp(1+(CON-20)×0.01); stun%=clamp((CON-20)×1, 0..80)',
    cap: 'multipliers clamp 0.30..3.00; stun resist +95 cap in computeCombatStats',
    profile: 'maxHp via computeVitals; combat.pDef; stunResistPct',
    battle: 'target P.Def unchanged; player pDef for incoming damage',
    sourceFile: 'server/src/data/l2dopPrimaryStatPipeline.ts',
  },
  {
    stat: 'INT',
    derivedStats: 'M.Atk multiplier, magic crit damage multiplier',
    helper: 'computePrimaryStatMultipliers + clampMagicCritDmgMulForDamage',
    formula: 'intMAtkMul=clamp(1+(INT-20)×0.055); intMagicCritDmgMul=clamp(1+(INT-20)×0.02)',
    cap: 'multipliers clamp 0.30..3.00; magic crit dmg clamp 0.30..2.50 in damage',
    profile: 'combat.mAtk, magicCritDmgMul',
    battle: 'magic skills via l2dopMagicSkillDamage',
    sourceFile: 'server/src/data/l2dopPrimaryStatPipeline.ts',
  },
  {
    stat: 'WIT',
    derivedStats: 'Casting Speed, Magic Critical Rate',
    helper: 'computePrimaryStatMultipliers + magicCritChancePct',
    formula:
      'witCastSpeedMul=clamp(1+(WIT-20)×0.04); mCrit%=clamp(1+(WIT-20)×0.4, 1..30)',
    cap: 'multipliers clamp 0.30..3.00; mCrit% 1..30',
    profile: 'combat.castSpd, mCritPct',
    battle: 'magic crit chance in mystic skills',
    sourceFile: 'server/src/data/l2dopPrimaryStatPipeline.ts',
  },
  {
    stat: 'MEN',
    derivedStats: 'Max MP, M.Def multiplier, MP regen, debuff resist',
    helper: 'menMpMultiplier, computePrimaryStatMultipliers, debuffResistPctFromMen',
    formula:
      'menMpMul=clamp(1+(MEN-20)×0.05); menMDefMul=clamp(1+(MEN-20)×0.015); debuff%=clamp((MEN-20)×1, 0..80)',
    cap: 'multipliers clamp 0.30..3.00; debuff resist +95 cap in computeCombatStats',
    profile: 'maxMp via computeVitals; combat.mDef; debuffResistPct',
    battle: 'magic defense in mystic damage formulas',
    sourceFile: 'server/src/data/l2dopPrimaryStatPipeline.ts',
  },
];

export function printBaseStatDependencyTable(): void {
  console.log('\n## Base stat dependency table (from code)\n');
  for (const row of BASE_STAT_DEPENDENCY_TABLE) {
    console.log(`### ${row.stat}`);
    console.log(`- Derived: ${row.derivedStats}`);
    console.log(`- Helper: ${row.helper}`);
    console.log(`- Formula: ${row.formula}`);
    console.log(`- Cap: ${row.cap}`);
    console.log(`- Profile: ${row.profile}`);
    console.log(`- Battle: ${row.battle}`);
    console.log(`- Source: ${row.sourceFile}`);
    console.log('');
  }
}
