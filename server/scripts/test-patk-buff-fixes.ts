/**
 * Regression: Armor Mastery l2_141 (orc) — no P.Atk; active buff dedupe by skillId.
 * npm run test:patk-buff-fixes
 */
import assert from 'node:assert/strict';
import {
  computeCombatStats,
  buildCombatBuffModifiers,
  computeCombatStatsOptionsForCharacter,
} from '../src/data/l2dopCombatFormulas.js';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import {
  combatBuffsFromActiveJson,
  dedupeActiveBuffEntriesBySkillId,
  parseActiveBuffEntries,
  type ActiveBuffEntry,
} from '../src/data/l2dopActiveBuffs.js';
import { effectiveBattlePatkDisplay } from '../src/domain/battleEffectiveDisplay.js';
import { debugPlayerPhysicalHitBreakdown } from '../src/domain/battlePhysicalHitDebug.js';
import type { CharacterRow } from '../src/services/charTypes.js';
import { l2dopTableAt, L2DOP_MIGHT, L2DOP_GREATER_MIGHT } from '../src/data/l2dopRawdataBuffTables.js';

const LEVEL = 80;
const RACE = 'Orc';
const BRANCH = 'fighter';
const BOW_ID = 7575;
const AXE_ID = 6369;

const FULL_BUFF_PACK: ActiveBuffEntry[] = [
  { skillId: 1068, level: 3 },
  { skillId: 1388, level: 3 },
  { skillId: 271, level: 1 },
  { skillId: 1363, level: 1 },
  { skillId: 1062, level: 1 },
  { skillId: 1003, level: 3 },
  { skillId: 1040, level: 3 },
  { skillId: 1389, level: 3 },
  { skillId: 1086, level: 2 },
  { skillId: 1240, level: 3 },
  { skillId: 1045, level: 6 },
  { skillId: 1035, level: 4 },
  { skillId: 1077, level: 3 },
  { skillId: 1078, level: 6 },
  { skillId: 1036, level: 3 },
  { skillId: 1204, level: 2 },
];

const TITAN_PASSIVES = [
  { battleId: 'l2_142', level: 45 },
  { battleId: 'l2_208', level: 45 },
  { battleId: 'l2_293', level: 20 },
  { battleId: 'l2_227', level: 10 },
];

function buildInv(weaponId: number): InventoryState {
  return {
    ...parseInventory(null),
    eq: {
      l1: { itemId: weaponId, enchant: 12 },
      l3: { itemId: 6379, enchant: 0 },
      lh: { itemId: 6382, enchant: 0 },
      lg: { itemId: 6380, enchant: 0 },
      lf: { itemId: 6381, enchant: 0 },
      l5: { itemId: 6377, enchant: 0 },
      l6: { itemId: 6374, enchant: 0 },
      l7: { itemId: 6375, enchant: 0 },
      l8: { itemId: 6374, enchant: 0 },
      l9: { itemId: 6375, enchant: 0 },
    },
  };
}

function combatOpts(
  buffs: ActiveBuffEntry[],
  extraSkills: { battleId: string; level: number }[] = TITAN_PASSIVES
) {
  const row = {
    activeBuffsJson: buffs,
    buffHeroicTier: null,
    buffZealotStacks: null,
    skillsLearnedJson: extraSkills,
    l2Profession: 'orc_titan',
    inventoryJson: null,
    race: RACE,
    classBranch: BRANCH,
    worldCombatStateJson: null,
  } as unknown as CharacterRow;
  return {
    ...computeCombatStatsOptionsForCharacter(row),
    weaponGradeMatchesArmor: true,
  };
}

// ---- Armor Mastery l2_141 (orc) ----
{
  const inv = buildInv(BOW_ID);
  const without141 = computeCombatStats(
    LEVEL,
    RACE,
    BRANCH,
    inv,
    combatOpts([], TITAN_PASSIVES)
  );
  const with141 = computeCombatStats(
    LEVEL,
    RACE,
    BRANCH,
    inv,
    combatOpts([], [...TITAN_PASSIVES, { battleId: 'l2_141', level: 3 }])
  );
  assert.equal(
    without141.pAtk,
    with141.pAtk,
    'Armor Mastery l2_141 must not change P.Atk'
  );
  assert.equal(without141.mAtk, with141.mAtk, 'Armor Mastery must not change M.Atk');
  assert.equal(without141.str, with141.str, 'Armor Mastery must not change STR');
  assert.equal(
    without141.critRate,
    with141.critRate,
    'Armor Mastery must not change crit rate stat'
  );
  assert.equal(
    without141.pAtkSpd,
    with141.pAtkSpd,
    'Armor Mastery must not change attack speed'
  );
  assert.ok(
    with141.pDef > without141.pDef,
    `Armor Mastery must increase P.Def (${without141.pDef} → ${with141.pDef})`
  );
  assert.ok(
    with141.pDef - without141.pDef >= 27,
    `Armor Mastery L3 adds at least +27 flat P.Def (got +${with141.pDef - without141.pDef})`
  );
  console.log('Armor Mastery l2_141: P.Atk unchanged, P.Def +27 — OK');
}

// ---- Might dedupe ----
{
  const dup = combatBuffsFromActiveJson([
    { skillId: 1068, level: 3 },
    { skillId: 1068, level: 3 },
  ]);
  assert.ok(
    Math.abs(dup.buffPatk - l2dopTableAt(L2DOP_MIGHT, 3)) < 1e-9,
    `duplicate Might buffPatk=${dup.buffPatk}, expected 1.15`
  );

  const mixed = combatBuffsFromActiveJson([
    { skillId: 1068, level: 1 },
    { skillId: 1068, level: 3 },
  ]);
  assert.ok(
    Math.abs(mixed.buffPatk - l2dopTableAt(L2DOP_MIGHT, 3)) < 1e-9,
    `mixed Might levels buffPatk=${mixed.buffPatk}, expected 1.15`
  );

  const mightGm = combatBuffsFromActiveJson([
    { skillId: 1068, level: 3 },
    { skillId: 1388, level: 3 },
  ]);
  const expectedGm =
    l2dopTableAt(L2DOP_MIGHT, 3) * l2dopTableAt(L2DOP_GREATER_MIGHT, 3);
  assert.ok(
    Math.abs(mightGm.buffPatk - expectedGm) < 1e-9,
    `Might+GM buffPatk=${mightGm.buffPatk}, expected ${expectedGm}`
  );
  console.log('Active buff dedupe (Might / Might+GM) — OK');
}

// ---- parseActiveBuffEntries dedupe ----
{
  const parsed = parseActiveBuffEntries([
    { skillId: 1068, level: 1 },
    { skillId: 1068, level: 3 },
    { skillId: 1068, level: 3 },
  ]);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0]!.skillId, 1068);
  assert.equal(parsed[0]!.level, 3);
  console.log('parseActiveBuffEntries dedupe — OK');
}

// ---- Profile = battle = damage base ----
{
  const inv = buildInv(BOW_ID);
  const opts = combatOpts(FULL_BUFF_PACK);
  const combat = computeCombatStats(LEVEL, RACE, BRANCH, inv, opts);
  const display = effectiveBattlePatkDisplay(combat.pAtk, null, undefined);
  const dbg = debugPlayerPhysicalHitBreakdown({
    baseCombatPatk: combat.pAtk,
    combat,
    battleMods: {},
    mobPDef: 450,
  });
  assert.equal(display, combat.pAtk);
  assert.equal(dbg.attackerPAtk, combat.pAtk);
  assert.equal(dbg.displayedPatkFromSnapshot, combat.pAtk);
  console.log('Profile = effectiveBattlePatkDisplay = damage base — OK');
}

// ---- Control calc (after fix) ----
{
  const invBow = buildInv(BOW_ID);
  const invAxe = buildInv(AXE_ID);
  const opts = combatOpts(FULL_BUFF_PACK, [
    ...TITAN_PASSIVES,
    { battleId: 'l2_141', level: 3 },
  ]);
  const bow = computeCombatStats(LEVEL, RACE, BRANCH, invBow, opts);
  const axe = computeCombatStats(LEVEL, RACE, BRANCH, invAxe, opts);
  const B = buildCombatBuffModifiers(invBow, RACE, opts);
  const normalized = dedupeActiveBuffEntriesBySkillId(
    parseActiveBuffEntries(FULL_BUFF_PACK)
  );

  /** До фіксу l2_141 давала buffPatk≈4 (×power) — орієнтир з аудиту. */
  const PATK_BEFORE_FIX_BOW = 31_542;
  const PATK_BEFORE_FIX_AXE = 20_517;

  console.log('\n--- Control calc Titan L80 (after fix) ---');
  console.log('P.Atk bow BEFORE fix (audit ref):', PATK_BEFORE_FIX_BOW);
  console.log('P.Atk bow AFTER fix:', bow.pAtk);
  console.log('P.Atk axe BEFORE fix (audit ref):', PATK_BEFORE_FIX_AXE);
  console.log('P.Atk axe AFTER fix:', axe.pAtk);
  console.log('P.Def bow (with l2_141 L3):', bow.pDef);
  const activeOnly = combatBuffsFromActiveJson(FULL_BUFF_PACK);
  console.log('buffPatk active-only (full pack):', activeOnly.buffPatk.toFixed(4));
  console.log('buffPatk with passives:', B.buffPatk.toFixed(4));
  console.log('Armor Mastery addPdef contribution: +27 (orc catalog; may stack with HF text-rpg path)');
  console.log(
    'Normalized active buffs:',
    normalized.map((e) => `${e.skillId}:L${e.level}`).join(', ')
  );

  assert.ok(bow.pAtk < PATK_BEFORE_FIX_BOW * 0.5, 'P.Atk must drop after l2_141 fix');
  assert.ok(
    Math.abs(activeOnly.buffPatk - 1.8819) < 0.001,
    `active buffPatk≈1.8819, got ${activeOnly.buffPatk}`
  );
}

console.log('\nAll P.Atk buff fix regression tests passed.');
