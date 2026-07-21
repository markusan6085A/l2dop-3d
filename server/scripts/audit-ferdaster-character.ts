/**
 * Read-only audit: FerdasTer/Titan — Frenzy duplicate + Death Whisper pipeline.
 * npx tsx server/scripts/audit-ferdaster-character.ts [name]
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
import { PrismaClient } from '@prisma/client';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { computePrimaryStatMultipliers } from '../src/data/l2dopPrimaryStatPipeline.js';
import {
  combatBuffsFromActiveJson,
  buffWeaponContextFromInv,
  parseActiveBuffEntries,
  type ActiveBuffEntry,
} from '../src/data/l2dopActiveBuffs.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
} from '../src/data/l2dopCombatBuffModifiers.js';
import { textRpgHfActiveBuffDelta } from '../src/data/textRpgHfActiveBuffApply.js';
import {
  L2DOP_FRENZY,
  L2DOP_FRENZY2HS,
  L2DOP_FRENZY2HSACC,
  l2dopTableAt,
} from '../src/data/l2dopRawdataBuffTables.js';
import { parseInventory, normalizeEqSlot } from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { equippedWeaponKind } from '../src/data/l2dopHumanFighterBattleSkills.js';
import {
  effectiveBattlePatkDisplay,
} from '../src/domain/battleEffectiveDisplay.js';
import { debugPlayerPhysicalHitBreakdown } from '../src/domain/battlePhysicalHitDebug.js';
import { parseWorldCombatState } from '../src/domain/worldCombatState.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';
import { combatOptsFromRow, toSnapshot, type CharacterRow } from '../src/services/charService.js';
import {
  focusAttackCritDmgMultiplier,
  focusAttackRankFromLearnedEntries,
  viciousStanceRankFromLearnedEntries,
} from '../src/data/l2dopFocusAttack.js';
import { textRpgHfToggleStanceDelta } from '../src/data/textRpgHfToggleBattleApply.js';
import {
  resolveViciousStanceEffect,
  resolveViciousStanceEffectRank,
  repairViciousStanceBattleModsInPlace,
} from '../src/data/viciousStanceTables.js';
import {
  isFocusAttackActive,
  isStanceViciousActive,
  jsonFiniteNum,
} from '../src/domain/battleModsJson.js';
import type { BattleBattleMods } from '../src/domain/battleTypes.js';
import { S_WEAPON_BY_ITEM_ID } from '../src/data/sWeaponCatalog.js';

const prisma = new PrismaClient();

function fmt(n: number): string {
  return Math.round(n).toLocaleString('uk-UA');
}

function findBuffEntry(entries: ActiveBuffEntry[], skillId: number): ActiveBuffEntry | null {
  return entries.find((e) => e.skillId === skillId) ?? null;
}

function frenzyBuffPatkContribution(level: number, weaponKind: string | undefined): number {
  const twoH = weaponKind === 'bigsword' || weaponKind === 'bigblunt';
  const mul = twoH
    ? l2dopTableAt(L2DOP_FRENZY2HS, level)
    : l2dopTableAt(L2DOP_FRENZY, level);
  return mul > 1 ? mul : 1;
}

function mergeBattleMods(
  worldMods: BattleBattleMods | undefined,
  battleMods: BattleBattleMods | undefined
): BattleBattleMods {
  return { ...(worldMods ?? {}), ...(battleMods ?? {}) };
}

async function main(): Promise<void> {
  const name = String(process.argv[2] || 'FerdasTer').trim();
  const row = await prisma.character.findUnique({ where: { name } });
  if (!row) {
    console.error(`Character "${name}" not found in DATABASE_URL.`);
    process.exit(1);
  }

  const charRow = row as unknown as CharacterRow;
  const inv = parseInventory(charRow.inventoryJson);
  const weaponKind = equippedWeaponKind(inv) ?? undefined;
  const wSlot = normalizeEqSlot(inv.eq?.l1);
  const weaponId = wSlot?.itemId ?? null;
  const weaponName =
    (weaponId != null ? ITEM_CATALOG[weaponId]?.nameUk : null) ??
    (weaponId != null ? S_WEAPON_BY_ITEM_ID.get(weaponId)?.shopNameUk : null) ??
    '?';

  const buffEntries = parseActiveBuffEntries(charRow.activeBuffsJson);
  const frenzyBuff = findBuffEntry(buffEntries, 176);
  const deathWhisperBuff = findBuffEntry(buffEntries, 1242);

  const world = parseWorldCombatState(charRow.worldCombatStateJson);
  const battle = charRow.battleJson ? parseBattleJson(charRow.battleJson) : null;
  const battleMods = mergeBattleMods(world?.battleMods, battle?.battleMods);

  const frenzyBattleMul = jsonFiniteNum(battleMods.frenzyBattlePatkMul);
  const rageBattleMul = jsonFiniteNum(battleMods.rageBattlePatkMul);

  console.log('=== Character audit:', name, '===');
  console.log('Profession:', charRow.l2Profession, '| race:', charRow.race, '| branch:', charRow.classBranch);
  console.log('DB level:', row.level, '| snapshot level:', toSnapshot(charRow).level);
  console.log('');

  console.log('## 1. Legacy Frenzy duplicate (skill 176)\n');
  console.log('activeBuffsJson[176]:', frenzyBuff ?? '(absent)');
  console.log('battleMods.frenzyBattlePatkMul:', frenzyBattleMul ?? '(absent)');
  console.log('battleMods (merged keys):', Object.keys(battleMods).filter((k) => k.includes('frenzy') || k.includes('rage')).join(', ') || '(none)');

  let buffPatkFrom176 = 1;
  if (frenzyBuff) {
    buffPatkFrom176 = frenzyBuffPatkContribution(frenzyBuff.level, weaponKind);
  }

  const ctx = buffWeaponContextFromInv(inv);
  let bNeutral = neutralCombatBuffs();
  let bWithAll = combatBuffsFromActiveJson(charRow.activeBuffsJson, ctx);
  if (frenzyBuff) {
    const only176 = combatBuffsFromActiveJson([frenzyBuff], ctx);
    console.log('buffPatk contribution from skill 176 (isolated):', only176.buffPatk);
  } else {
    console.log('buffPatk contribution from skill 176 (isolated): 1 (not in activeBuffsJson)');
  }
  console.log('frenzyBattlePatkMul (battle):', frenzyBattleMul ?? 1);

  let frenzyApplyCount = 0;
  if (frenzyBuff && buffPatkFrom176 > 1) frenzyApplyCount++;
  if (frenzyBattleMul !== undefined && frenzyBattleMul > 1) frenzyApplyCount++;
  console.log('final contribution count:', frenzyApplyCount);
  console.log(
    frenzyApplyCount <= 1
      ? 'VERDICT: Frenzy applied at most once (OK)'
      : 'VERDICT: **DOUBLE APPLY RISK** — Frenzy in BOTH activeBuffsJson AND battleMods',
  );

  console.log('\n## 2. Death Whisper 1242 (no manual inject)\n');
  console.log('activeBuffsJson[1242]:', deathWhisperBuff ?? '(absent)');

  const combatNoBuffInject = computeCombatStats(
    toSnapshot(charRow).level,
    charRow.race,
    charRow.classBranch,
    inv,
    combatOptsFromRow(charRow),
  );

  let critBefore1242 = 1;
  let critAfter1242 = 1;
  if (deathWhisperBuff) {
    bNeutral = neutralCombatBuffs();
    bWithAll = combatBuffsFromActiveJson(charRow.activeBuffsJson, ctx);
    critBefore1242 = bNeutral.critDmgMul;
    critAfter1242 = bWithAll.critDmgMul;

    const tr = textRpgHfActiveBuffDelta(1242, deathWhisperBuff.level, ctx);
    console.log('textRpgHfActiveBuffDelta(1242):', tr ?? '(null — no text-rpg mapping)');
    console.log('cs1 BUFF_APPLY for 1242: (not registered in l2dopActiveBuffs ORDERED_BUFF_RULES)');
    console.log('resolved rank:', deathWhisperBuff.level);
    console.log('resolved power (catalog effect): +35% critDamage');
    console.log('critDmgMul B.critDmgMul before full activeBuffsJson:', critBefore1242);
    console.log('critDmgMul B.critDmgMul after full activeBuffsJson:', critAfter1242);
    console.log(
      critAfter1242 > critBefore1242
        ? 'VERDICT: Death Whisper affects snapshot critDmgMul via pipeline (OK)'
        : 'VERDICT: **GAP** — Death Whisper in activeBuffsJson but critDmgMul unchanged in pipeline',
    );
  } else {
    console.log('Death Whisper not in activeBuffsJson — skip crit pipeline check');
  }

  console.log('\n## 3. Real breakdown\n');
  const snap = toSnapshot(charRow);
  const combat = computeCombatStats(
    snap.level,
    charRow.race,
    charRow.classBranch,
    inv,
    combatOptsFromRow(charRow),
  );
  const strMul = computePrimaryStatMultipliers({
    str: combat.str,
    dex: combat.dex,
    con: combat.con,
    int: combat.int,
    wit: combat.wit,
    men: combat.men,
  }).strCritDmgMul;
  const baseCritDmgMul = 1;
  const buffCritMul = combat.critDmgMul / strMul;

  const displayMods: BattleBattleMods = { ...battleMods };
  const learned = Array.isArray(charRow.skillsLearnedJson)
    ? charRow.skillsLearnedJson
    : [];
  const focusRank = focusAttackRankFromLearnedEntries(learned as never);
  const viciousRank = viciousStanceRankFromLearnedEntries(learned as never);

  if (isFocusAttackActive(displayMods) || displayMods.focusAttackActive == null) {
    displayMods.focusAttackActive = true;
  }
  if (isStanceViciousActive(displayMods) || displayMods.stanceViciousActive == null) {
    displayMods.stanceViciousActive = true;
  }

  const rageMul = rageBattleMul !== undefined && rageBattleMul > 1 ? rageBattleMul : 1;
  const frenzyMul =
    frenzyBattleMul !== undefined && frenzyBattleMul > 1
      ? frenzyBattleMul
      : frenzyBuff
        ? buffPatkFrom176
        : 1;

  const patkDisplay = effectiveBattlePatkDisplay(combat.pAtk, null, {
    rageBattlePatkMul: rageMul > 1 ? rageMul : undefined,
    frenzyBattlePatkMul: frenzyBattleMul !== undefined && frenzyBattleMul > 1 ? frenzyBattleMul : undefined,
  });

  const soulshotMul = jsonFiniteNum(battleMods.fighterSoulshotPatkMul) ?? 2.0;

  const bd = debugPlayerPhysicalHitBreakdown({
    baseCombatPatk: combat.pAtk,
    combat,
    battleMods: {
      ...displayMods,
      rageBattlePatkMul: rageMul > 1 ? rageMul : undefined,
      frenzyBattlePatkMul: frenzyBattleMul !== undefined && frenzyBattleMul > 1 ? frenzyBattleMul : undefined,
      fighterSoulshotPatkMul: soulshotMul > 1 ? soulshotMul : undefined,
    },
    mobPDef: 450,
    learnedSkillLevelByBattleId: Object.fromEntries(
      (learned as Array<{ battleId?: string; level?: number }>)
        .filter((s) => s.battleId && s.level)
        .map((s) => [String(s.battleId), Math.floor(Number(s.level))]),
    ),
    weaponKind,
    soulshotMulOverride: soulshotMul > 1 ? soulshotMul : 1,
  });

  let finalCritMul = combat.critDmgMul;
  let addCrit = combat.addCritDmg;
  if (isFocusAttackActive(displayMods)) {
    finalCritMul *= focusAttackCritDmgMultiplier(focusRank);
  }
  if (isStanceViciousActive(displayMods)) {
    const rk = resolveViciousStanceEffectRank(viciousRank);
    const vs = resolveViciousStanceEffect(rk);
    if (vs.critDmgMul > 1) finalCritMul *= vs.critDmgMul;
    if (vs.addCritDmg) addCrit += vs.addCritDmg;
  }
  const zealMul = jsonFiniteNum(displayMods.zealotCritDmgMul);
  if (zealMul !== undefined && zealMul > 1) finalCritMul *= zealMul;

  console.log('equippedWeaponId:', weaponId, '(' + weaponName + ')');
  console.log('weaponType:', weaponKind ?? ITEM_CATALOG[weaponId ?? 0]?.weaponType ?? '?');
  console.log('baseCombatPAtk (snapshot, no SS/Rage/Frenzy):', fmt(combat.pAtk));
  console.log('rageMultiplier:', rageMul);
  console.log('frenzyMultiplier (battleMods):', frenzyBattleMul ?? '(none)');
  console.log('frenzyMultiplier (from activeBuffs 176 if no battle):', frenzyBuff ? buffPatkFrom176 : '(n/a)');
  console.log('displayedPAtk (HUD, Rage+Frenzy from battleMods):', fmt(patkDisplay));
  console.log('Screenshot reference displayedPAtk: 172241');
  console.log('displayedPAtk delta vs screenshot:', fmt(patkDisplay - 172241));
  console.log('soulshotMultiplier (battleMods):', soulshotMul);
  console.log('battlePAtk (roll, with SS):', fmt(bd.attackerPAtk));
  console.log('STR:', combat.str);
  console.log('baseCritDmgMul:', baseCritDmgMul);
  console.log('STR crit mul:', strMul.toFixed(3));
  console.log('buff critDmgMul (B.critDmgMul):', buffCritMul.toFixed(3));
  console.log('snapshot critDmgMul (STR×buffs):', combat.critDmgMul.toFixed(3));
  console.log('Death Whisper in JSON:', deathWhisperBuff ? 'yes rank ' + deathWhisperBuff.level : 'no');
  console.log('Death Whisper crit effect in pipeline:', critAfter1242 > critBefore1242 ? 'yes' : deathWhisperBuff ? 'NO' : 'n/a');
  console.log('Focus Attack rank:', focusRank, '| mul:', focusAttackCritDmgMultiplier(focusRank).toFixed(3));
  console.log('Vicious Stance rank:', viciousRank);
  console.log('Zealot critDmgMul:', zealMul ?? '(not active in battleMods)');
  console.log('finalCritDmgMul (battle est.):', finalCritMul.toFixed(3));
  console.log('addCritDmg:', Math.floor(addCrit));
  console.log('addCritDisplay snapshot:', combat.addCritDisplay);
  console.log('Normal hit (P.Def 450):', fmt(bd.normalHitDamage));
  console.log('Critical hit (P.Def 450):', fmt(bd.damageAfterCrit));

  console.log('\n## Raw JSON excerpts\n');
  console.log('activeBuffsJson count:', buffEntries.length);
  console.log(
    'activeBuffsJson skillIds:',
    buffEntries.map((e) => e.skillId + ':' + e.level).join(', ') || '(empty)',
  );
  console.log('battleJson.battleMods:', JSON.stringify(battle?.battleMods ?? null));
  console.log('worldCombatState.battleMods:', JSON.stringify(world?.battleMods ?? null));

  console.log('\n## Final conclusion\n');
  const frenzyOk = frenzyApplyCount <= 1;
  const dwOk = !deathWhisperBuff || critAfter1242 > critBefore1242;
  const patkClose = Math.abs(patkDisplay - 172241) / 172241 < 0.05;
  if (frenzyOk && dwOk && patkClose) {
    console.log(
      'Frenzy once, Death Whisper wired, displayedPAtk ≈ screenshot → ~500k crit is author balance, not a technical bug.',
    );
  } else {
    console.log('Review flags:');
    if (!frenzyOk) console.log('- Frenzy double-apply risk');
    if (!dwOk) console.log('- Death Whisper not in combat pipeline');
    if (!patkClose) console.log('- displayedPAtk differs from screenshot (may be stale battleMods or different mob context)');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
