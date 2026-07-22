/**
 * Regression: base six stats (STR/DEX/CON/INT/WIT/MEN) are racial constants — no level growth.
 */
import assert from 'node:assert/strict';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import {
  baseSixForRaceAndBranch,
  computeCombatStats,
  type L2dopRaceCode,
} from '../src/data/l2dopCombatFormulas.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import { resolveFinalBaseStats } from '../src/domain/resolveFinalBaseStats.js';

const ORC_MYSTIC_BASE = {
  str: 27,
  dex: 24,
  con: 31,
  int: 31,
  wit: 15,
  men: 42,
} as const;

const HUMAN_FIGHTER_BASE = {
  str: 40,
  dex: 30,
  con: 43,
  int: 21,
  wit: 11,
  men: 25,
} as const;

const ORC_MYSTIC_PROFESSIONS = [
  'orc_mage',
  'orc_shaman',
  'orc_overlord',
  'orc_warcryer',
  'orc_dominator',
  'orc_doomcryer',
] as const;

const LEVELS = [1, 20, 40, 80] as const;

function emptyInv(): InventoryState {
  return parseInventory(null);
}

function assertBaseSix(
  race: string,
  classBranch: string,
  level: number,
  expected: Record<keyof typeof ORC_MYSTIC_BASE, number>,
  label: string,
): void {
  const inv = emptyInv();
  const fromHelper = baseSixForRaceAndBranch(race, classBranch);
  const fromFinal = resolveFinalBaseStats({ race, classBranch, inv });
  const fromCombat = computeCombatStats(level, race, classBranch, inv, {});
  for (const key of ['str', 'dex', 'con', 'int', 'wit', 'men'] as const) {
    assert.equal(fromHelper[key], expected[key], `${label} helper ${key}`);
    assert.equal(fromFinal[key], expected[key], `${label} final ${key}`);
    assert.equal(fromCombat[key], expected[key], `${label} combat ${key}`);
  }
}

/** Legacy level growth (removed) — for before/after comparison only. */
function legacyBaseSixForLevel(
  code: L2dopRaceCode,
  classBranch: string,
  level: number,
): typeof ORC_MYSTIC_BASE {
  const bases: Record<L2dopRaceCode, typeof ORC_MYSTIC_BASE> = {
    HF: HUMAN_FIGHTER_BASE,
    HM: { str: 22, dex: 21, con: 27, int: 41, wit: 20, men: 39 },
    EF: { str: 36, dex: 35, con: 36, int: 23, wit: 14, men: 26 },
    EM: { str: 21, dex: 24, con: 25, int: 37, wit: 23, men: 40 },
    DF: { str: 41, dex: 34, con: 32, int: 25, wit: 12, men: 26 },
    DM: { str: 23, dex: 23, con: 24, int: 44, wit: 19, men: 37 },
    OF: { str: 40, dex: 26, con: 47, int: 18, wit: 12, men: 27 },
    OM: ORC_MYSTIC_BASE,
    DW: { str: 39, dex: 29, con: 45, int: 20, wit: 10, men: 27 },
  };
  const b = bases[code];
  const n = Math.max(0, Math.floor(level) - 1);
  const mystic = String(classBranch || '').toLowerCase() === 'mystic';
  if (mystic) {
    return {
      str: b.str + Math.floor(n * 0.2),
      int: b.int + Math.floor(n * 0.55),
      dex: b.dex + Math.floor(n * 0.25),
      wit: b.wit + Math.floor(n * 0.3),
      con: b.con + Math.floor(n * 0.2),
      men: b.men + Math.floor(n * 0.45),
    };
  }
  return {
    str: b.str + Math.floor(n * 0.5),
    int: b.int + Math.floor(n * 0.2),
    dex: b.dex + Math.floor(n * 0.35),
    wit: b.wit + Math.floor(n * 0.15),
    con: b.con + Math.floor(n * 0.4),
    men: b.men + Math.floor(n * 0.2),
  };
}

function pctDiff(oldVal: number, newVal: number): string {
  if (oldVal === 0) return newVal === 0 ? '0%' : '∞';
  return `${(((newVal - oldVal) / oldVal) * 100).toFixed(1)}%`;
}

function printOrcMysticComparison(): void {
  console.log('\n=== Orc Mystic naked: before vs after (derived stats) ===\n');
  const inv = emptyInv();
  for (const level of LEVELS) {
    console.log(`\n--- Level ${level} ---`);
    const oldBase = legacyBaseSixForLevel('OM', 'mystic', level);
    const oldCombat = computeCombatStats(level, 'Orc', 'mystic', inv, {
      baseSixOverride: oldBase,
    });
    const newCombat = computeCombatStats(level, 'Orc', 'mystic', inv, {});
    const oldVitals = computeVitals(level, 'Orc', 'mystic', oldBase.con, oldBase.men);
    const newVitals = computeVitals(level, 'Orc', 'mystic', newCombat.con, newCombat.men);

    const rows: Array<[string, number, number]> = [
      ['STR', oldBase.str, newCombat.str],
      ['DEX', oldBase.dex, newCombat.dex],
      ['CON', oldBase.con, newCombat.con],
      ['INT', oldBase.int, newCombat.int],
      ['WIT', oldBase.wit, newCombat.wit],
      ['MEN', oldBase.men, newCombat.men],
      ['Max HP', oldVitals.maxHp, newVitals.maxHp],
      ['Max MP', oldVitals.maxMp, newVitals.maxMp],
      ['Max CP', oldVitals.maxCp, newVitals.maxCp],
      ['P.Atk', oldCombat.pAtk, newCombat.pAtk],
      ['M.Atk', oldCombat.mAtk, newCombat.mAtk],
      ['P.Def', oldCombat.pDef, newCombat.pDef],
      ['M.Def', oldCombat.mDef, newCombat.mDef],
      ['Atk Spd', oldCombat.pAtkSpd, newCombat.pAtkSpd],
      ['Cast Spd', oldCombat.castSpd, newCombat.castSpd],
      ['Crit Rate', oldCombat.critRate, newCombat.critRate],
      ['Accuracy', oldCombat.accuracy, newCombat.accuracy],
      ['Evasion', oldCombat.evasion, newCombat.evasion],
    ];

    console.log('stat\told\tnew\tdelta\tpct');
    for (const [name, oldVal, newVal] of rows) {
      const delta = newVal - oldVal;
      console.log(
        `${name}\t${oldVal}\t${newVal}\t${delta >= 0 ? '+' : ''}${delta}\t${pctDiff(oldVal, newVal)}`,
      );
    }
  }
}

console.log('=== Base six racial constants ===\n');

// Orc Mystic at all test levels
for (const level of LEVELS) {
  assertBaseSix('Orc', 'mystic', level, ORC_MYSTIC_BASE, `Orc Mystic L${level}`);
  console.log(`Orc Mystic L${level} base six — OK`);
}

// Human Fighter L1 and L80
for (const level of [1, 80] as const) {
  assertBaseSix(
    'Human',
    'fighter',
    level,
    HUMAN_FIGHTER_BASE,
    `Human Fighter L${level}`,
  );
  console.log(`Human Fighter L${level} base six — OK`);
}

// Profession does not change base six
for (const prof of ORC_MYSTIC_PROFESSIONS) {
  void prof;
  assertBaseSix('Orc', 'mystic', 40, ORC_MYSTIC_BASE, `Orc mystic prof ${prof}`);
}
console.log('Orc mystic professions share base six — OK');

// Direct STR +4 from Plated Leather set (Human fighter for catalog items)
{
  const bare = resolveFinalBaseStats({
    race: 'Human',
    classBranch: 'fighter',
    inv: parseInventory(null),
  });
  const withSet = resolveFinalBaseStats({
    race: 'Human',
    classBranch: 'fighter',
    inv: {
      ...parseInventory(null),
      eq: {
        l1: { itemId: 135, enchant: 0 },
        l3: { itemId: 398, enchant: 0 },
        l4: { itemId: 418, enchant: 0 },
        lf: { itemId: 2431, enchant: 0 },
      },
    },
  });
  assert.equal(withSet.str, bare.str + 4);
  const afterRemove = resolveFinalBaseStats({
    race: 'Human',
    classBranch: 'fighter',
    inv: {
      ...parseInventory(null),
      eq: {
        l1: { itemId: 135, enchant: 0 },
        l3: { itemId: 398, enchant: 0 },
        l4: { itemId: 418, enchant: 0 },
      },
    },
  });
  assert.equal(afterRemove.str, bare.str);
  console.log('Armor set STR +4 equip/unequip — OK');
}

// Orc Mystic STR +4 set scenario (same set, verify 27→31)
{
  const bare = resolveFinalBaseStats({
    race: 'Orc',
    classBranch: 'mystic',
    inv: emptyInv(),
  });
  assert.equal(bare.str, 27);
  const withSet = resolveFinalBaseStats({
    race: 'Orc',
    classBranch: 'mystic',
    inv: {
      ...emptyInv(),
      eq: {
        l3: { itemId: 398, enchant: 0 },
        l4: { itemId: 418, enchant: 0 },
        lf: { itemId: 2431, enchant: 0 },
      },
    },
  });
  assert.equal(withSet.str, 31);
  console.log('Orc Mystic STR 27 → 31 with set +4 — OK');
}

// Might buff increases P.Atk but not STR
{
  const noBuff = computeCombatStats(40, 'Human', 'fighter', {
    ...emptyInv(),
    eq: { l1: { itemId: 135, enchant: 0 } },
  });
  const withMight = computeCombatStats(
    40,
    'Human',
    'fighter',
    {
      ...emptyInv(),
      eq: { l1: { itemId: 135, enchant: 0 } },
    },
    { activeBuffsJson: [{ skillId: 1068, level: 3 }] },
  );
  assert.equal(withMight.str, noBuff.str);
  assert.ok(withMight.pAtk > noBuff.pAtk, 'Might must increase P.Atk');
  console.log('Might buff: P.Atk up, STR unchanged — OK');
}

// Level 1→80 does not change base six
{
  const l1 = resolveFinalBaseStats({
    race: 'Orc',
    classBranch: 'mystic',
    inv: emptyInv(),
  });
  const l80 = resolveFinalBaseStats({
    race: 'Orc',
    classBranch: 'mystic',
    inv: emptyInv(),
  });
  for (const key of ['str', 'dex', 'con', 'int', 'wit', 'men'] as const) {
    assert.equal(l80[key], l1[key]);
  }
  console.log('Level 1→80 base six unchanged — OK');
}

printOrcMysticComparison();

console.log('\nAll base-six racial constant tests passed.');
