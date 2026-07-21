/**
 * Regression: final base stats (STR/DEX/CON/INT/WIT/MEN) → derived combat stats.
 * Перевіряє, що flat armor-set bonuses входять у computeCombatStats рівно один раз.
 */
import assert from 'node:assert/strict';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../src/data/l2dopCombatFormulas.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import { resolveEquippedArmorSetBonuses } from '../src/data/armorSetResolver.js';
import { resolveFinalBaseStats } from '../src/domain/resolveFinalBaseStats.js';
import { buildStatsRenderKey } from '../src/domain/buildStatsRenderKey.js';

const LVL = 40;
const WEAPON_FIGHTER = 135;
const WEAPON_MYSTIC = 206;

function eq(pieces: Record<string, number>): InventoryState['eq'] {
  const out: InventoryState['eq'] = {};
  for (const [slot, itemId] of Object.entries(pieces)) {
    out[slot as keyof InventoryState['eq']] = { itemId, enchant: 0 };
  }
  return out;
}

function inv(pieces: Record<string, number>): InventoryState {
  return { ...parseInventory(null), eq: eq(pieces) };
}

function combatFor(
  pieces: Record<string, number>,
  branch: string,
  race = 'Human',
  weaponId = WEAPON_FIGHTER,
  opts: { weaponGradeMatchesArmor?: boolean } = { weaponGradeMatchesArmor: true }
): ReturnType<typeof computeCombatStats> {
  return computeCombatStats(
    LVL,
    race,
    branch,
    inv({ l1: weaponId, ...pieces }),
    opts
  );
}

function maxHpFor(
  combat: ReturnType<typeof computeCombatStats>,
  branch: string,
  race = 'Human'
): number {
  const vit = computeVitals(LVL, race, branch, combat.con, combat.men);
  return effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
}

function maxMpFor(
  combat: ReturnType<typeof computeCombatStats>,
  branch: string,
  race = 'Human'
): number {
  const vit = computeVitals(LVL, race, branch, combat.con, combat.men);
  return effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
}

function assertFinalStatsMatchCombat(
  pieces: Record<string, number>,
  branch: string,
  race = 'Human',
  weaponId = WEAPON_FIGHTER
): void {
  const inventory = inv({ l1: weaponId, ...pieces });
  const finalBase = resolveFinalBaseStats({
    level: LVL,
    race,
    classBranch: branch,
    inv: inventory,
  });
  const combat = computeCombatStats(LVL, race, branch, inventory, {});
  for (const key of ['str', 'dex', 'con', 'int', 'wit', 'men'] as const) {
    assert.equal(
      combat[key],
      finalBase[key],
      `${key} mismatch for ${branch} set`
    );
  }
}

function assertSingleFlatApplication(
  pieces: Record<string, number>,
  branch: string,
  stat: 'str' | 'dex' | 'con' | 'int' | 'wit' | 'men',
  expectedFlat: number
): void {
  const inventory = inv({ l1: WEAPON_FIGHTER, ...pieces });
  const bare = resolveFinalBaseStats({
    level: LVL,
    race: 'Human',
    classBranch: branch,
    inv: inv({ l1: WEAPON_FIGHTER }),
  });
  const withSet = resolveFinalBaseStats({
    level: LVL,
    race: 'Human',
    classBranch: branch,
    inv: inventory,
  });
  assert.equal(withSet[stat] - bare[stat], expectedFlat);
  assert.equal(withSet.breakdown.armorSets[stat], expectedFlat);
}

console.log('=== Base stat → derived effects regression ===\n');

// A. Plated Leather: STR +4 → P.Atk
{
  const noSet = combatFor({}, 'fighter');
  const full = combatFor({ l3: 398, l4: 418, lf: 2431 }, 'fighter');
  assert.equal(full.str, noSet.str + 4);
  assert.ok(full.pAtk > noSet.pAtk, 'STR +4 must increase P.Atk');
  console.log(
    `A. Plated Leather STR +4 → P.Atk ${noSet.pAtk} → ${full.pAtk} — OK`
  );
}

// B. Plated Leather: CON -1 → Max HP
{
  const noSet = combatFor({}, 'fighter');
  const full = combatFor({ l3: 398, l4: 418, lf: 2431 }, 'fighter');
  const hpNo = maxHpFor(noSet, 'fighter');
  const hpFull = maxHpFor(full, 'fighter');
  assert.equal(full.con, noSet.con - 1);
  assert.ok(hpFull < hpNo, 'CON -1 must reduce Max HP');
  console.log(`B. Plated Leather CON -1 → Max HP ${hpNo} → ${hpFull} — OK`);
}

// C. Demon: INT +4 → INT-derived stats (M.Atk або magicCritDmgMul при cap intMAtkMul)
{
  const noSet = combatFor({}, 'mystic', 'Human', WEAPON_MYSTIC);
  const full = combatFor({ l3: 441, l4: 472, lg: 2459 }, 'mystic', 'Human', WEAPON_MYSTIC);
  assert.equal(full.int, noSet.int + 4);
  assert.ok(
    full.mAtk > noSet.mAtk || full.magicCritDmgMul > noSet.magicCritDmgMul,
    'INT +4 must affect INT-derived combat stats'
  );
  console.log(
    `C. Demon INT +4 → mAtk ${noSet.mAtk}→${full.mAtk}, magicCritDmgMul ${noSet.magicCritDmgMul}→${full.magicCritDmgMul} — OK`
  );
}

// D. Demon: WIT -1 → Casting Speed / M.Crit
{
  const noSet = combatFor({}, 'mystic', 'Human', WEAPON_MYSTIC);
  const full = combatFor({ l3: 441, l4: 472, lg: 2459 }, 'mystic', 'Human', WEAPON_MYSTIC);
  assert.equal(full.wit, noSet.wit - 1);
  assert.ok(
    full.castSpd <= noSet.castSpd || full.mCritPct <= noSet.mCritPct,
    'WIT -1 must affect cast speed or magic crit'
  );
  console.log(
    `D. Demon WIT -1 → castSpd ${noSet.castSpd}→${full.castSpd}, mCrit ${noSet.mCritPct}→${full.mCritPct} — OK`
  );
}

// E. Blue Wolf Heavy: STR +3 → P.Atk
{
  const pieces = { l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 };
  const noSet = combatFor({}, 'fighter');
  const full = combatFor(pieces, 'fighter');
  assert.equal(full.str, noSet.str + 3);
  assert.ok(full.pAtk > noSet.pAtk);
  console.log(`E. Blue Wolf STR +3 → P.Atk ${noSet.pAtk} → ${full.pAtk} — OK`);
}

// F. Blue Wolf: CON -1, DEX -2 → derived stats
{
  const pieces = { l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 };
  const noSet = combatFor({}, 'fighter');
  const full = combatFor(pieces, 'fighter');
  assert.equal(full.con, noSet.con - 1);
  assert.equal(full.dex, noSet.dex - 2);
  assert.ok(maxHpFor(full, 'fighter') < maxHpFor(noSet, 'fighter'));
  assert.ok(full.pAtkSpd !== noSet.pAtkSpd || full.accuracy !== noSet.accuracy);
  console.log('F. Blue Wolf CON/DEX negatives → derived stats — OK');
}

// G. Doom Light: DEX +3 → derived stats
{
  const pieces = { l3: 30009, lh: 30008, lg: 30010, lf: 30011 };
  const noSet = combatFor({}, 'fighter');
  const full = combatFor(pieces, 'fighter');
  assert.equal(full.dex, noSet.dex + 3);
  assert.ok(
    full.pAtkSpd !== noSet.pAtkSpd ||
      full.accuracy !== noSet.accuracy ||
      full.evasion !== noSet.evasion
  );
  console.log('G. Doom Light DEX +3 → derived stats — OK');
}

// H. Dark Crystal Heavy: STR -2 → P.Atk; CON +2 → Max HP
{
  const pieces = { l3: 512, l4: 365, lh: 388, lg: 2472, lf: 563 };
  const noSet = combatFor({}, 'fighter');
  const full = combatFor(pieces, 'fighter');
  assert.equal(full.str, noSet.str - 2);
  assert.equal(full.con, noSet.con + 2);
  assert.ok(full.pAtk < noSet.pAtk);
  assert.ok(maxHpFor(full, 'fighter') > maxHpFor(noSet, 'fighter'));
  console.log('H. Dark Crystal STR/CON flats → P.Atk & Max HP — OK');
}

// I. Majestic Robe: MEN +1, INT -1 → derived stats
{
  const pieces = { l3: 2419, l4: 2409, lg: 2482, lf: 583 };
  const noSet = combatFor({}, 'mystic', 'Human', WEAPON_MYSTIC);
  const full = combatFor(pieces, 'mystic', 'Human', WEAPON_MYSTIC);
  assert.equal(full.men, noSet.men + 1);
  assert.equal(full.int, noSet.int - 1);
  assert.ok(maxMpFor(full, 'mystic') > maxMpFor(noSet, 'mystic'));
  assert.ok(
    full.mDef !== noSet.mDef ||
      full.mAtk !== noSet.mAtk ||
      full.castSpd !== noSet.castSpd
  );
  console.log('I. Majestic MEN/INT flats → derived stats — OK');
}

// J. Imperial Crusader: STR +2, DEX -2
{
  const pieces = { l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376 };
  const noSet = combatFor({}, 'fighter');
  const full = combatFor(pieces, 'fighter');
  assert.equal(full.str, noSet.str + 2);
  assert.equal(full.dex, noSet.dex - 2);
  assert.ok(full.pAtk > noSet.pAtk);
  console.log('J. Imperial Crusader STR/DEX flats — OK');
}

// K. Draconic: STR +1, DEX +1, CON -2
{
  const pieces = { l3: 6379, lh: 6382, lg: 6380, lf: 6381 };
  const noSet = combatFor({}, 'fighter');
  const full = combatFor(pieces, 'fighter');
  assert.equal(full.str, noSet.str + 1);
  assert.equal(full.dex, noSet.dex + 1);
  assert.equal(full.con, noSet.con - 2);
  assert.ok(full.pAtk > noSet.pAtk);
  assert.ok(maxHpFor(full, 'fighter') < maxHpFor(noSet, 'fighter'));
  console.log('K. Draconic STR/DEX/CON flats — OK');
}

// L. Major Arcana: WIT +1, INT +1, MEN -2
{
  const pieces = { l3: 6383, lh: 6386, lg: 6384, lf: 6385 };
  const noSet = combatFor({}, 'mystic', 'Human', WEAPON_MYSTIC);
  const full = combatFor(pieces, 'mystic', 'Human', WEAPON_MYSTIC);
  assert.equal(full.wit, noSet.wit + 1);
  assert.equal(full.int, noSet.int + 1);
  assert.equal(full.men, noSet.men - 2);
  assert.ok(full.mAtk > noSet.mAtk);
  console.log('L. Major Arcana WIT/INT/MEN flats — OK');
}

// M. computeCombatStats ↔ resolveFinalBaseStats (profile/battle canonical)
{
  const cases: Array<{ pieces: Record<string, number>; branch: string }> = [
    { pieces: { l3: 398, l4: 418, lf: 2431 }, branch: 'fighter' },
    { pieces: { l3: 441, l4: 472, lg: 2459 }, branch: 'mystic' },
    { pieces: { l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 }, branch: 'fighter' },
    { pieces: { l3: 6373, l4: 6374, lh: 6378, lg: 6375, lf: 6376 }, branch: 'fighter' },
  ];
  for (const c of cases) {
    assertFinalStatsMatchCombat(c.pieces, c.branch, 'Human', c.branch === 'mystic' ? WEAPON_MYSTIC : WEAPON_FIGHTER);
  }
  console.log('M. Profile/battle final stats match resolveFinalBaseStats — OK');
}

// N. Flat stat bonus applied exactly once
{
  assertSingleFlatApplication({ l3: 398, l4: 418, lf: 2431 }, 'fighter', 'str', 4);
  assertSingleFlatApplication({ l3: 398, l4: 418, lf: 2431 }, 'fighter', 'con', -1);
  assertSingleFlatApplication({ l3: 441, l4: 472, lg: 2459 }, 'mystic', 'int', 4);
  assertSingleFlatApplication({ l3: 441, l4: 472, lg: 2459 }, 'mystic', 'wit', -1);
  console.log('N. Armor set flats applied exactly once — OK');
}

// O. Plated Leather equip/unequip boots cycle
{
  const basePieces = { l3: 398, l4: 418 };
  const fullPieces = { l3: 398, l4: 418, lf: 2431 };
  const noArmor = combatFor({}, 'fighter');
  const twoOfThree = combatFor(basePieces, 'fighter');
  const threeOfThree = combatFor(fullPieces, 'fighter');
  const afterUnequipBoots = combatFor(basePieces, 'fighter');

  assert.equal(twoOfThree.str, noArmor.str);
  assert.equal(threeOfThree.str, noArmor.str + 4);
  assert.ok(threeOfThree.pAtk > noArmor.pAtk);
  assert.equal(
    resolveEquippedArmorSetBonuses(inv({ l1: WEAPON_FIGHTER, ...basePieces })).totals
      .sleepHoldResistancePct,
    20
  );

  assert.equal(afterUnequipBoots.str, noArmor.str);
  assert.equal(afterUnequipBoots.pAtk, twoOfThree.pAtk);
  assert.equal(afterUnequipBoots.con, noArmor.con);

  const reEquipped = combatFor(fullPieces, 'fighter');
  assert.equal(reEquipped.str, threeOfThree.str);
  assert.equal(reEquipped.pAtk, threeOfThree.pAtk);
  console.log('O. Plated Leather boots equip/unequip cycle — OK');
}

// P. statsRenderKey changes when derived stats change
{
  const noSet = combatFor({}, 'fighter');
  const full = combatFor({ l3: 398, l4: 418, lf: 2431 }, 'fighter');
  const keyNo = buildStatsRenderKey(
    noSet,
    maxHpFor(noSet, 'fighter'),
    maxMpFor(noSet, 'fighter'),
    0
  );
  const keyFull = buildStatsRenderKey(
    full,
    maxHpFor(full, 'fighter'),
    maxMpFor(full, 'fighter'),
    0
  );
  assert.notEqual(keyNo, keyFull);
  console.log('P. statsRenderKey reflects stat/derived changes — OK');
}

// Q. Negative flats are not skipped (truthy guard regression)
{
  const full = resolveFinalBaseStats({
    level: LVL,
    race: 'Human',
    classBranch: 'fighter',
    inv: inv({ l1: WEAPON_FIGHTER, l3: 398, l4: 418, lf: 2431 }),
  });
  assert.equal(full.breakdown.armorSets.con, -1);
  assert.ok(full.con >= 1, 'CON clamp min 1');
  console.log('Q. Negative CON flat (-1) applied — OK');
}

console.log('\nAll base-stat derived-effects regression tests passed.');
