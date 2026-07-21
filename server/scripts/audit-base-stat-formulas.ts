/**
 * Read-only audit: base stat formulas on a real character.
 * npm run audit:base-stat-formulas -- DeadHertisab
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { normalizeEqSlot, parseInventory } from '../src/data/inventory.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import {
  l2dopPhysicalBaseDamageCore,
  l2dopPhysicalCritDamageCore,
} from '../src/data/l2dopDamageFormulas.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import { equippedWeaponKind } from '../src/data/l2dopHumanFighterBattleSkills.js';
import { resolveFinalBaseStats } from '../src/domain/resolveFinalBaseStats.js';
import { computePhysicalAttackBreakdown } from '../src/domain/physicalAttackBreakdown.js';
import { auditBattlePatkAndDamage } from '../src/domain/physicalAttackBreakdownAudit.js';
import { effectiveBattlePatkDisplay } from '../src/domain/battleEffectiveDisplay.js';
import { parseWorldCombatState } from '../src/domain/worldCombatState.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';
import { combatOptsFromRow, toSnapshot, type CharacterRow } from '../src/services/charService.js';
import { levelFromTotalExp } from '../src/data/l2dopExpgain.js';
import { printBaseStatDependencyTable } from './lib/baseStatFormulaAuditCore.js';
import { jsonFiniteNum } from '../src/domain/battleModsJson.js';

const prisma = new PrismaClient();
const TARGET_PDEF = 450;

function fmt(n: number, digits = 3): string {
  return Number(n).toLocaleString('uk-UA', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function printScenario(label: string, finalStr: number, baseInput: Parameters<typeof computePhysicalAttackBreakdown>[0]) {
  const breakdown = computePhysicalAttackBreakdown({
    ...baseInput,
    finalStrOverride: finalStr,
  });
  const combat = computeCombatStats(
    baseInput.level,
    baseInput.race,
    baseInput.classBranch,
    baseInput.inv,
    baseInput.options,
  );
  const combatForBattle = { ...combat, str: finalStr, pAtk: breakdown.canonicalPatk };
  const dmg = auditBattlePatkAndDamage({
    combat: combatForBattle,
    battleMods: baseInput.options?.buffs as never,
    targetPDef: TARGET_PDEF,
    soulshotMul: 1,
  });
  const normalCore = l2dopPhysicalBaseDamageCore(dmg.battlePatk, TARGET_PDEF);
  const critCore = l2dopPhysicalCritDamageCore(
    dmg.battlePatk,
    TARGET_PDEF,
    combatForBattle.critDmgMul,
    combatForBattle.addCritDmg,
  );
  console.log(`\n### Scenario ${label} (STR=${finalStr})`);
  console.log(`- preStrPAtk: ${fmt(breakdown.preStrPAtk, 2)}`);
  console.log(`- strPAtkMul: ${breakdown.strBreakdown.multiplier} (${breakdown.strBreakdown.formula})`);
  console.log(`- patkAfterStr: ${breakdown.patkAfterStr}`);
  console.log(`- displayedPAtk: ${dmg.displayedPatk}`);
  console.log(`- battlePAtk (no Rage/Frenzy/Soulshot): ${dmg.battlePatk}`);
  console.log(`- normalDamageCore vs P.Def ${TARGET_PDEF}: ${fmt(normalCore, 2)}`);
  console.log(`- criticalDamageCore vs P.Def ${TARGET_PDEF}: ${fmt(critCore, 2)}`);
}

async function main(): Promise<void> {
  const name = String(process.argv[2] || 'DeadHertisab').trim();
  const row = await prisma.character.findUnique({ where: { name } });
  if (!row) {
    console.error(`Character "${name}" not found.`);
    process.exit(1);
  }

  const charRow = row as unknown as CharacterRow;
  const inv = parseInventory(charRow.inventoryJson);
  const level = levelFromTotalExp(charRow.exp);
  const opts = combatOptsFromRow(charRow);
  const snapshot = toSnapshot(charRow);
  const finalBase = resolveFinalBaseStats({
    level,
    race: charRow.race,
    classBranch: charRow.classBranch,
    inv,
  });
  const combat = computeCombatStats(level, charRow.race, charRow.classBranch, inv, opts);
  const breakdown = computePhysicalAttackBreakdown({
    level,
    race: charRow.race,
    classBranch: charRow.classBranch,
    inv,
    options: opts,
  });

  const world = parseWorldCombatState(charRow.worldCombatStateJson);
  const battle = charRow.battleJson ? parseBattleJson(charRow.battleJson) : null;
  const battleMods = { ...(world?.battleMods ?? {}), ...(battle?.battleMods ?? {}) };
  const rage = jsonFiniteNum(battleMods.rageBattlePatkMul) ?? 1;
  const frenzy = jsonFiniteNum(battleMods.frenzyBattlePatkMul) ?? 1;
  const soulshot = jsonFiniteNum(battleMods.fighterSoulshotPatkMul) ?? 1;

  const wSlot = normalizeEqSlot(inv.eq?.l1);
  const weaponId = wSlot?.itemId ?? null;
  const weaponName = weaponId != null ? ITEM_CATALOG[weaponId]?.nameUk ?? `#${weaponId}` : '(unarmed)';
  const weaponKind = equippedWeaponKind(inv) ?? undefined;

  const dmgAudit = auditBattlePatkAndDamage({
    combat,
    battleMods,
    targetPDef: TARGET_PDEF,
    weaponKind,
    soulshotMul: soulshot,
  });

  console.log(`=== Base stat formula audit: ${name} ===`);
  console.log(`Level: ${level} | race: ${charRow.race} | branch: ${charRow.classBranch}`);
  console.log(`revision: ${snapshot.revision} | statsRenderKey: ${snapshot.statsRenderKey}`);

  console.log('\n## Base stats (display)');
  console.log(
    `STR ${snapshot.str} | DEX ${snapshot.dex} | CON ${snapshot.con} | INT ${snapshot.int} | WIT ${snapshot.wit} | MEN ${snapshot.men}`,
  );

  console.log('\n## Modifiers');
  console.log('armor set flats:', finalBase.breakdown.armorSets);
  console.log('dyes:', finalBase.breakdown.dyes);
  console.log('passives:', finalBase.breakdown.passives);
  console.log('items:', finalBase.breakdown.items);
  console.log('other:', finalBase.breakdown.other);

  console.log('\n## Final stats');
  console.log(
    `STR ${finalBase.str} | DEX ${finalBase.dex} | CON ${finalBase.con} | INT ${finalBase.int} | WIT ${finalBase.wit} | MEN ${finalBase.men}`,
  );

  console.log('\n## Physical attack breakdown');
  console.log(`weapon: ${weaponName} (itemId ${weaponId ?? '—'}, type ${weaponKind ?? '—'})`);
  console.log(`weapon P.Atk base: ${breakdown.weaponPAtk}`);
  console.log(`preStrPAtk: ${fmt(breakdown.preStrPAtk, 2)}`);
  console.log(
    `STR multiplier: ${breakdown.strBreakdown.multiplier} (${breakdown.strBreakdown.formula})`,
  );
  console.log(`P.Atk after STR: ${breakdown.patkAfterStr}`);
  console.log(
    `passive/set/buff layers in preStr: necklacePatk=${breakdown.necklacePatk}, masteryPatk=${breakdown.masteryPatk}, buffPatk=${breakdown.buffPatk}, addPatk=${breakdown.addPatk}`,
  );
  console.log(`gradeMul: ${breakdown.gradeMul}`);
  console.log(`canonical combat.pAtk: ${combat.pAtk}`);
  console.log(`snapshot.pAtk (HUD/display): ${snapshot.pAtk}`);
  console.log(`displayedPAtk (battle mods, no soulshot): ${dmgAudit.displayedPatk}`);
  console.log(`Rage mul: ${rage} | Frenzy mul: ${frenzy} | Soulshot mul: ${soulshot}`);
  console.log(`battlePAtk (with above mods): ${dmgAudit.battlePatk}`);

  const normalCore = l2dopPhysicalBaseDamageCore(dmgAudit.battlePatk, TARGET_PDEF);
  const critCore = l2dopPhysicalCritDamageCore(
    dmgAudit.battlePatk,
    TARGET_PDEF,
    combat.critDmgMul,
    combat.addCritDmg,
  );
  console.log('\n## Damage vs fixed P.Def 450');
  console.log(`normal hit core (before ±10%): ${fmt(normalCore, 2)}`);
  console.log(`critical hit core (before ±10%): ${fmt(critCore, 2)}`);

  const vit = computeVitals(level, charRow.race, charRow.classBranch, combat.con, combat.men);
  console.log('\n## Vitals from final CON/MEN');
  console.log(`Max HP ${vit.maxHp} | Max MP ${vit.maxMp}`);

  const auditInput = {
    level,
    race: charRow.race,
    classBranch: charRow.classBranch,
    inv,
    options: opts,
  };
  printScenario('A', finalBase.str, auditInput);
  printScenario('B', finalBase.str + 4, auditInput);

  printBaseStatDependencyTable();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
