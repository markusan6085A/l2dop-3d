import { HUMAN_MYSTIC_SKILL_CATALOG_GENERATED as CAT } from '../src/data/humanMysticSkillCatalog.generated.js';

const SUPPORTED = new Set([
  'percent:mDef',
  'percent:pDef',
  'percent:pAtk',
  'percent:mAtk',
  'percent:maxHp',
  'percent:maxMp',
  'percent:hpRegen',
  'percent:mpRegen',
  'percent:castSpeed',
  'percent:atkSpeed',
  'flat:hpRegen',
  'flat:mpRegen',
  'flat:castSpeed',
  'flat:atkSpeed',
  'flat:attackSpeed',
  'flat:runSpeed',
  'flat:accuracy',
  'flat:evasion',
  'flat:pDef',
  'flat:mDef',
  'flat:pAtk',
  'flat:mAtk',
  'flat:maxHp',
  'flat:maxMp',
  'flat:maxCp',
  'multiplier:hpRegen',
  'multiplier:mpRegen',
  'multiplier:castSpeed',
  'multiplier:atkSpeed',
  'multiplier:attackSpeed',
  'multiplier:runSpeed',
  'multiplier:pAtk',
  'multiplier:mAtk',
  'multiplier:pDef',
  'multiplier:mDef',
  'multiplier:cooldownReduction',
  'multiplier:holdResist',
  'multiplier:sleepResist',
  'multiplier:mentalResist',
  'multiplier:poisonResist',
  'multiplier:bleedResist',
  'percent:cooldownReduction',
  'percent:holdResist',
  'percent:sleepResist',
  'percent:mentalResist',
  'percent:poisonResist',
  'percent:bleedResist',
]);

const TARGET_PROFS = new Set([
  'human_dreadnought',
  'human_duelist',
  'human_phoenix_knight',
  'human_hell_knight',
  'human_adventurer',
  'human_sagittarius',
  'human_archmage',
  'human_soultaker',
]);

type Gap = {
  battleId: string;
  l2SkillId: number;
  nameUk: string;
  effect: string;
};

const gaps: Gap[] = [];
for (const e of CAT) {
  if (e.kind !== 'passive') continue;
  if (!e.visibleForProfessions.some((p) => TARGET_PROFS.has(p))) continue;
  for (const fx of e.effects ?? []) {
    const key = String(fx.mode) + ':' + String(fx.stat);
    if (!SUPPORTED.has(key)) {
      gaps.push({
        battleId: e.battleId,
        l2SkillId: e.l2SkillId,
        nameUk: e.nameUk,
        effect: key,
      });
    }
  }
}

console.log(JSON.stringify(gaps, null, 2));
