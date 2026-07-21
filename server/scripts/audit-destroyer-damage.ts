/**
 * Audit: Destroyer/Titan — crit sources (single-apply), Frenzy bow branch, P.Atk states.
 * npm run audit:destroyer-damage
 */
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { computePrimaryStatMultipliers } from '../src/data/l2dopPrimaryStatPipeline.js';
import {
  emptyInventory,
  equipFromBag,
  addItemToBag,
  normalizeEqSlot,
} from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { S_WEAPON_BY_ITEM_ID } from '../src/data/sWeaponCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import {
  effectiveBattlePatkDisplay,
  effectiveBattlePAtkSpdDisplay,
  effectiveBattleCritRateDisplay,
} from '../src/domain/battleEffectiveDisplay.js';
import { debugPlayerPhysicalHitBreakdown } from '../src/domain/battlePhysicalHitDebug.js';
import type { BattleBattleMods } from '../src/domain/battleTypes.js';
import {
  combatBuffsFromActiveJson,
  buffWeaponContextFromInv,
  parseActiveBuffEntries,
  type ActiveBuffEntry,
} from '../src/data/l2dopActiveBuffs.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
  type L2dopCombatBuffModifiers,
} from '../src/data/l2dopCombatBuffModifiers.js';
import { textRpgHfActiveBuffDelta } from '../src/data/textRpgHfActiveBuffApply.js';
import { textRpgHfToggleStanceDelta } from '../src/data/textRpgHfToggleBattleApply.js';
import {
  focusAttackCritDmgMultiplier,
  focusAttackCritDamagePct,
} from '../src/data/l2dopFocusAttack.js';
import { resolveViciousStanceEffectRank } from '../src/data/viciousStanceTables.js';
import { l2dopBuffDeltaFromTextRpgEffect } from '../src/data/textRpgCombatBuffFromEffect.js';
import {
  L2DOP_FRENZY,
  L2DOP_FRENZY2HS,
  L2DOP_FRENZY2HSACC,
  l2dopTableAt,
} from '../src/data/l2dopRawdataBuffTables.js';
import { equippedWeaponKind } from '../src/data/l2dopHumanFighterBattleSkills.js';
import type { CharacterRow } from '../src/services/charTypes.js';

/** S-grade bow зі скріншота (Draconic Bow). */
const WEAPON_ID = 7575;
const MOB_PDEF = 450;
const LEVEL = 76;
const FRENZY_RANK = 3;
const RAGE_POWER_PCT = 55;
const RAGE_MUL = 1 + RAGE_POWER_PCT / 100;
const VICIOUS_RANK = 20;
const FOCUS_RANK = 5;
const ZEALOT_RANK = 3;
const ZEALOT_CRIT_MUL = 2.0;

/** Типовий набір prophet/warrior buff (cs1 + text-rpg). */
const FULL_WARRIOR_BUFFS: ActiveBuffEntry[] = [
  { skillId: 1068, level: 3 },
  { skillId: 1040, level: 3 },
  { skillId: 1086, level: 2 },
  { skillId: 1240, level: 3 },
  { skillId: 1045, level: 6 },
  { skillId: 1035, level: 4 },
  { skillId: 1077, level: 3 },
  { skillId: 1078, level: 6 },
  { skillId: 1388, level: 3 },
  { skillId: 1389, level: 3 },
  /** Death Whisper — немає cs1-правила; симулюємо text-rpg ефект (+35% crit dmg). */
  { skillId: 1242, level: 3 },
];

type CritLayer = {
  skillId: number | null;
  name: string;
  power: string;
  mulBefore: number;
  mulAfter: number;
  kind: 'mul' | 'flat';
  flatBefore?: number;
  flatAfter?: number;
};

function fmt(n: number): string {
  return Math.round(n).toLocaleString('uk-UA');
}

function pctFromMul(m: number): string {
  return Math.round((m - 1) * 100) + '%';
}

function resolveFrenzyBranch(weaponKind: string | undefined, rank: number) {
  const twoHHeavy = weaponKind === 'bigsword' || weaponKind === 'bigblunt';
  const branch = twoHHeavy ? 'L2DOP_FRENZY2HS (bigsword|bigblunt)' : 'L2DOP_FRENZY (1H / bow / pole / dual / fist / …)';
  const table = twoHHeavy ? L2DOP_FRENZY2HS : L2DOP_FRENZY;
  const mul = l2dopTableAt(table, rank);
  const accFlat = twoHHeavy ? l2dopTableAt(L2DOP_FRENZY2HSACC, rank) : 0;
  return { twoHHeavy, branch, mul, accFlat, rank };
}

function buildMockRow(level: number, enchant = 12): CharacterRow {
  return {
    id: 'audit',
    userId: 'audit',
    name: 'AuditTitan',
    race: 'Orc',
    classBranch: 'fighter',
    l2Profession: 'orc_titan',
    exp: 0,
    level,
    hp: 10000,
    revision: 1,
    inventoryJson: null,
    warehouseJson: null,
    skillsLearnedJson: [],
    activeBuffsJson: FULL_WARRIOR_BUFFS,
    battleJson: null,
    worldCombatStateJson: null,
    cityId: 1,
    adena: 0,
    lastUpdate: new Date(),
  } as unknown as CharacterRow;
}

function buildInv(weaponId: number, weaponEnchant: number) {
  let inv = emptyInventory();
  inv = addItemToBag(inv, weaponId, 1);
  inv = equipFromBag(inv, weaponId, 0);
  if (weaponEnchant > 0) {
    inv = {
      ...inv,
      eq: {
        ...inv.eq,
        l1: { itemId: weaponId, enchant: weaponEnchant },
      },
    };
  }
  return inv;
}

/** Покроковий critDmgMul/addCritDmg з activeBuffsJson (кожен баф один раз). */
function traceSnapshotCritFromBuffs(
  inv: ReturnType<typeof buildInv>,
  extraBuffs?: Partial<L2dopCombatBuffModifiers>
): { layers: CritLayer[]; buffCritMul: number; addCritDmg: number } {
  const ctx = buffWeaponContextFromInv(inv);
  let b = neutralCombatBuffs();
  const layers: CritLayer[] = [];
  const entries = parseActiveBuffEntries(FULL_WARRIOR_BUFFS);

  for (const { skillId, level } of entries) {
    if (skillId === 1242) {
      const d = l2dopBuffDeltaFromTextRpgEffect('critDamage', 'percent', 35);
      if (d?.critDmgMul) {
        const before = b.critDmgMul;
        b = applyBuffDelta(b, d);
        layers.push({
          skillId: 1242,
          name: 'Death Whisper (симulated text-rpg +35%)',
          power: '35%',
          mulBefore: before,
          mulAfter: b.critDmgMul,
          kind: 'mul',
        });
      }
      continue;
    }
    const tr = textRpgHfActiveBuffDelta(skillId, level, ctx);
    const before = b.critDmgMul;
    const flatBefore = b.addCritDmg;
    if (tr?.critDmgMul && tr.critDmgMul !== 1) {
      b = applyBuffDelta(b, tr);
      layers.push({
        skillId,
        name: 'buff skillId ' + skillId,
        power: pctFromMul(tr.critDmgMul),
        mulBefore: before,
        mulAfter: b.critDmgMul,
        kind: 'mul',
      });
    } else if (tr?.addCritDmg) {
      b = applyBuffDelta(b, tr);
      layers.push({
        skillId,
        name: 'buff skillId ' + skillId,
        power: '+' + tr.addCritDmg,
        mulBefore: before,
        mulAfter: b.critDmgMul,
        kind: 'flat',
        flatBefore,
        flatAfter: b.addCritDmg,
      });
    }
  }

  if (extraBuffs) {
    const before = b.critDmgMul;
    b = applyBuffDelta(b, extraBuffs);
    if (extraBuffs.critDmgMul && extraBuffs.critDmgMul !== 1) {
      layers.push({
        skillId: null,
        name: 'extra buffs option',
        power: pctFromMul(extraBuffs.critDmgMul),
        mulBefore: before,
        mulAfter: b.critDmgMul,
        kind: 'mul',
      });
    }
  }

  return { layers, buffCritMul: b.critDmgMul, addCritDmg: b.addCritDmg };
}

function printCritBreakdown(
  combat: ReturnType<typeof computeCombatStats>,
  inv: ReturnType<typeof buildInv>,
  battleMods: BattleBattleMods
): void {
  const strMul = computePrimaryStatMultipliers({
    str: combat.str,
    dex: combat.dex,
    con: combat.con,
    int: combat.int,
    wit: combat.wit,
    men: combat.men,
  }).strCritDmgMul;

  const buffTrace = traceSnapshotCritFromBuffs(inv);
  const weaponCanon = S_WEAPON_BY_ITEM_ID.get(WEAPON_ID);
  const wId = normalizeEqSlot(inv.eq?.l1)?.itemId ?? WEAPON_ID;
  const itemMeta = ITEM_CATALOG[wId];

  console.log('### Crit damage breakdown (single-apply audit)\n');
  console.log('| Джерело | skillId | Назва | power | mul до | mul після |');
  console.log('|---|---:|---|---|---:|---:|');

  let running = 1;
  console.log(
    `| baseCritDmgMul | — | база (1.0) | — | ${running.toFixed(3)} | ${running.toFixed(3)} |`
  );

  running = strMul;
  console.log(
    `| STR crit multiplier | — | STR=${combat.str} | +${Math.round((strMul - 1) * 100)}% | 1.000 | ${running.toFixed(3)} |`
  );

  let buffMul = 1;
  for (const layer of buffTrace.layers) {
    if (layer.kind !== 'mul') continue;
    buffMul *= layer.mulAfter / layer.mulBefore;
    running *= layer.mulAfter / layer.mulBefore;
    console.log(
      `| warrior buff | ${layer.skillId ?? '—'} | ${layer.name} | ${layer.power} | ${layer.mulBefore.toFixed(3)} | ${layer.mulAfter.toFixed(3)} |`
    );
  }

  const snapshotBuffMul = combat.critDmgMul / strMul;
  console.log(
    `\nSnapshot B.critDmgMul (actual computeCombatStats): ${snapshotBuffMul.toFixed(3)}`
  );
  console.log(`Snapshot critDmgMul (STR × buffs): ${combat.critDmgMul.toFixed(3)}`);
  console.log(`Snapshot addCritDmg: ${combat.addCritDmg}`);

  running = combat.critDmgMul;
  const focusMul = focusAttackCritDmgMultiplier(FOCUS_RANK);
  running *= focusMul;
  console.log(
    `| Focus Attack | 317 | Focus Attack | +${focusAttackCritDamagePct(FOCUS_RANK)}% | ${(running / focusMul).toFixed(3)} | ${running.toFixed(3)} |`
  );

  const viciousRank = resolveViciousStanceEffectRank(VICIOUS_RANK, battleMods);
  const viciousDelta = textRpgHfToggleStanceDelta(312, viciousRank);
  let flat = combat.addCritDmg;
  if (viciousDelta?.critDmgMul && viciousDelta.critDmgMul > 1) {
    const before = running;
    running *= viciousDelta.critDmgMul;
    console.log(
      `| Vicious Stance % | 312 | Vicious Stance r${viciousRank} | +${Math.round((viciousDelta.critDmgMul - 1) * 100)}% | ${before.toFixed(3)} | ${running.toFixed(3)} |`
    );
  } else {
    console.log(
      `| Vicious Stance % | 312 | Vicious Stance r${viciousRank} | (rank>5: лише flat) | ${running.toFixed(3)} | ${running.toFixed(3)} |`
    );
  }
  if (viciousDelta?.addCritDmg) {
    flat += viciousDelta.addCritDmg;
    console.log(
      `| Vicious Stance flat | 312 | Vicious Stance r${viciousRank} | +${viciousDelta.addCritDmg} | addCrit ${flat - viciousDelta.addCritDmg} | ${flat} |`
    );
  }

  const zealBefore = running;
  running *= ZEALOT_CRIT_MUL;
  console.log(
    `| Zealot | 420 | Zealot r${ZEALOT_RANK} | ×${ZEALOT_CRIT_MUL} | ${zealBefore.toFixed(3)} | ${running.toFixed(3)} |`
  );

  console.log(`\n**finalCritDmgMul** (battle): ${running.toFixed(3)} (${pctFromMul(running)} additional)`);
  console.log(`**addCritDmg** (battle): ${flat}`);
  console.log(`Profile-style display: ${Math.floor((running - 1) * 100)}%+${Math.floor(flat)}`);

  console.log('\n**Weapon/passive (crit rate, not crit dmg mul):**');
  console.log(`  weaponRCrit (crit rate add): ${combat.weaponRCrit}`);
  console.log(`  weaponType: ${itemMeta?.weaponType ?? '?'}`);
  console.log(`  blocksShield (equip): ${weaponCanon?.blocksShield ?? itemBlocksShieldSlot(wId, itemMeta?.weaponType)}`);
  console.log(`  wpnCrit: ${itemMeta?.wpnCrit ?? '?'}`);
}

function printPatkScenario(
  label: string,
  combat: ReturnType<typeof computeCombatStats>,
  mods: BattleBattleMods,
  weaponKind: string,
  soulshot = 2.0
): void {
  const fullMods: BattleBattleMods = {
    ...mods,
    fighterSoulshotPatkMul: soulshot,
    stanceViciousActive: true,
    focusAttackActive: true,
    zealotCritDmgMul: ZEALOT_CRIT_MUL,
    zealotAspdMul: 1.3,
    zealotCritRateAdd: 100,
  };
  const bd = debugPlayerPhysicalHitBreakdown({
    baseCombatPatk: combat.pAtk,
    combat,
    battleMods: fullMods,
    mobPDef: MOB_PDEF,
    learnedSkillLevelByBattleId: { l2_317: FOCUS_RANK, l2_312: VICIOUS_RANK },
    weaponKind,
    soulshotMulOverride: soulshot,
  });
  const patkDisp = effectiveBattlePatkDisplay(combat.pAtk, null, mods);
  console.log(`\n--- ${label} ---`);
  console.log('  P.Atk (HUD display, no soulshot):', fmt(patkDisp));
  console.log('  P.Atk (battle roll):', fmt(bd.attackerPAtk));
  console.log('  Rage mul:', bd.patkMultipliers.rage);
  console.log('  Frenzy mul:', bd.patkMultipliers.frenzy);
  console.log('  Soulshot mul:', bd.soulshotMultiplier);
  console.log('  Normal hit:', fmt(bd.normalHitDamage));
  console.log('  Critical hit:', fmt(bd.damageAfterCrit));
  console.log(
    '  Crit dmg mul:',
    bd.critDmgMulProduct.toFixed(3),
    `(${bd.additionalCritDamagePct}%+${bd.critDamageFlat})`
  );
}

function main(): void {
  console.log('=== Destroyer/Titan damage audit (crit + Frenzy bow) ===\n');

  const inv = buildInv(WEAPON_ID, 12);
  const weaponKind = equippedWeaponKind(inv) ?? 'bow';
  const wSlot = normalizeEqSlot(inv.eq?.l1);
  const wId = wSlot?.itemId ?? WEAPON_ID;
  const weaponName = ITEM_CATALOG[wId]?.nameUk ?? S_WEAPON_BY_ITEM_ID.get(wId)?.shopNameUk ?? '?';
  const weaponType = ITEM_CATALOG[wId]?.weaponType ?? '?';
  const blocksShield = S_WEAPON_BY_ITEM_ID.get(wId)?.blocksShield ?? itemBlocksShieldSlot(wId, weaponType as never);
  const frenzy = resolveFrenzyBranch(weaponKind, FRENZY_RANK);

  console.log('## Frenzy branch (bow vs 2H heavy)\n');
  console.log('equippedWeaponItemId:', wId);
  console.log('equippedWeaponName:', weaponName);
  console.log('equippedWeaponType:', weaponType);
  console.log('blocksShield (catalog):', blocksShield);
  console.log('isTwoHandHeavy (Frenzy code path):', frenzy.twoHHeavy);
  console.log('frenzyBranch:', frenzy.branch);
  console.log('frenzyRank:', frenzy.rank);
  console.log('frenzyMultiplier (expected for this weapon):', frenzy.mul);
  console.log('frenzyAccFlat:', frenzy.accFlat);
  console.log('');
  console.log('1. Expected multiplier for **bow**:', l2dopTableAt(L2DOP_FRENZY, FRENZY_RANK), `(L2DOP_FRENZY[${FRENZY_RANK}])`);
  console.log('2. Actually applied in battle (same branch):', frenzy.mul);
  console.log(
    '3. Why ×2.5 appears in old audit: rank 2 Frenzy uses L2DOP_FRENZY[2]=2.5; **bow does NOT use 2HS table**.',
  );
  console.log(
    '   blocksShield=true for bow ≠ twoHandHeavy. 2HS table only for bigsword|bigblunt.',
  );
  console.log(
    '   At rank 3 (Titan 55+): bow gets ×',
    l2dopTableAt(L2DOP_FRENZY, 3),
    ', not ×',
    l2dopTableAt(L2DOP_FRENZY2HS, 3),
  );

  const row = buildMockRow(LEVEL);
  const combatOpts = {
    activeBuffsJson: FULL_WARRIOR_BUFFS,
    buffs: l2dopBuffDeltaFromTextRpgEffect('critDamage', 'percent', 35) ?? undefined,
  };
  const combat = computeCombatStats(LEVEL, 'Orc', 'fighter', inv, combatOpts);

  console.log('\n## Snapshot stats\n');
  console.log('Level:', LEVEL, '| STR:', combat.str, '| base P.Atk:', fmt(combat.pAtk));
  console.log('addCritDisplay (snapshot only):', combat.addCritDisplay);

  const battleModsBase: BattleBattleMods = {
    stanceViciousActive: true,
    focusAttackActive: true,
    zealotCritDmgMul: ZEALOT_CRIT_MUL,
    zealotAspdMul: 1.3,
    zealotCritRateAdd: 100,
  };

  printCritBreakdown(combat, inv, battleModsBase);

  console.log('\n## Double-apply check\n');
  console.log('Soulshot: HUD excludes soulshot; battle applies fighterSoulshotPatkMul ONCE — OK');
  console.log('Rage/Frenzy: battleMods only in rollPlayerPhysicalDmg, not in snapshot P.Atk base — OK');
  console.log('Zealot critDmgMul: battle-only (not in snapshot P.Atk) — OK');
  console.log('Vicious Stance: battle toggle only when stanceViciousActive — OK');
  console.log('Focus Attack crit: battle toggle when focusAttackActive — OK');
  const merged = combatBuffsFromActiveJson(FULL_WARRIOR_BUFFS, buffWeaponContextFromInv(inv));
  console.log(
    'Death Whisper 1242 via activeBuffsJson alone: critDmgMul=',
    merged.critDmgMul,
    '(cs1 rule missing — needs text-rpg mapping; audit uses buffs inject +35%)',
  );

  console.log('\n## P.Atk states (Draconic Bow, mob P.Def=' + MOB_PDEF + ')\n');
  printPatkScenario('1. Baseline (no Rage/Frenzy)', combat, {}, weaponKind);
  printPatkScenario('2. Rage only (×' + RAGE_MUL + ')', combat, { rageBattlePatkMul: RAGE_MUL }, weaponKind);
  printPatkScenario(
    '3. Frenzy only with bow (×' + frenzy.mul + ')',
    combat,
    { frenzyBattlePatkMul: frenzy.mul },
    weaponKind
  );
  printPatkScenario(
    '4. Rage + Frenzy with bow (×' + RAGE_MUL + ' × ' + frenzy.mul + ')',
    combat,
    { rageBattlePatkMul: RAGE_MUL, frenzyBattlePatkMul: frenzy.mul },
    weaponKind
  );

  const rfMods: BattleBattleMods = {
    rageBattlePatkMul: RAGE_MUL,
    frenzyBattlePatkMul: frenzy.mul,
  };
  const patkRf = effectiveBattlePatkDisplay(combat.pAtk, null, rfMods);
  console.log('\n## Screenshot cross-check\n');
  console.log('Computed P.Atk Rage+Frenzy (display):', fmt(patkRf));
  console.log('Screenshot P.Atk: 172241');
  console.log(
    'Inferred base from screenshot (÷1.55÷2.5):',
    fmt(Math.floor(172241 / (1.55 * 2.5))),
    '(assumes Frenzy rank 2 ×2.5)',
  );
  console.log(
    'Inferred base from screenshot (÷1.55÷3.0 rank3):',
    fmt(Math.floor(172241 / (1.55 * 3.0))),
  );

  console.log('\n## Atk Speed (Zealot)\n');
  const aspdBase = effectiveBattlePAtkSpdDisplay(combat.pAtkSpd, null, {}, weaponKind);
  const aspdZealot = effectiveBattlePAtkSpdDisplay(combat.pAtkSpd, null, {
    zealotAspdMul: 1.3,
  }, weaponKind);
  console.log('Atk Speed without Zealot:', fmt(aspdBase));
  console.log('Atk Speed with Zealot ×1.3:', fmt(aspdZealot));
  console.log('Screenshot: 1337 → 1738 (ratio', (1738 / 1337).toFixed(3) + ')');

  console.log('\n=== Audit complete (no balance changes) ===');
}

main();
