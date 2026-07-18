import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import { bowMasteryPatkFlatAtRank } from '../data/bowMasteryTables.js';
import { daggerMasteryPatkFlatAtRank } from '../data/daggerMasteryTables.js';
import { parseInventory, type InventoryState } from '../data/inventory.js';
import {
  computeCombatStats,
  type ComputeCombatStatsOptions,
} from '../data/l2dopCombatFormulas.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { resolveActiveArmorSetProfile } from '../data/l2dopDGradeArmorSetBonuses.js';
import { resolveL2ProfessionForSkillsRow } from '../data/l2dopHumanFighterBattleSkills.js';
import { polearmMasteryPatkFlatAtRank } from '../data/polearmMasteryTables.js';
import { swordBluntMasteryPatkFlatAtRank } from '../data/swordBluntMasteryTables.js';
import {
  weaponMasteryMatkAtRank,
  weaponMasteryPatkAtRank,
} from '../data/weaponMasteryTables.js';
import { resolveClanHallPassiveBonus } from './clanHall.js';
import { professionDisplayUk } from './professionDisplay.js';
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.js';
import { enrichLearnedSkillsForSnapshot } from '../services/charLearnedSkillsSnapshot.js';
import { combatOptsFromRow } from '../services/charSnapshotLogic.js';
import type { CharacterRow } from '../services/charTypes.js';

export type CharacterBonusesWeaponRow = {
  labelUk: string;
  valueUk: string;
};

export type CharacterBonusesViewDto = {
  raceBranchLabelUk: string;
  professionLabelUk: string;
  passiveBonusesTitleUk: string;
  soulshotSpiritshotLineUk: string;
  clanBonusLinesUk: string[];
  passiveSkillsTitleUk: string;
  passiveSkillsIntroUk: string;
  passiveWeaponRows: CharacterBonusesWeaponRow[];
  armorBonusesTitleUk: string;
  armorBonusRows: CharacterBonusesWeaponRow[];
  armorSetLinesUk: string[];
};

type WeaponCategory =
  | 'sword'
  | 'blunt'
  | 'book'
  | 'bow'
  | 'dagger'
  | 'fist'
  | 'pole';

const WEAPON_ROWS: ReadonlyArray<{ key: WeaponCategory; labelUk: string }> = [
  { key: 'sword', labelUk: 'К мечам' },
  { key: 'blunt', labelUk: 'К булавам' },
  { key: 'book', labelUk: 'К книгам' },
  { key: 'bow', labelUk: 'К лукам' },
  { key: 'dagger', labelUk: 'К кинжалам' },
  { key: 'fist', labelUk: 'К кастетам' },
  { key: 'pole', labelUk: 'К пикам' },
];

const L2_SKILL_WEAPON_CATEGORIES: Readonly<
  Record<number, readonly WeaponCategory[]>
> = {
  142: ['sword', 'blunt', 'bow', 'dagger', 'fist', 'pole'],
  249: ['book'],
  208: ['bow'],
  209: ['dagger'],
  216: ['pole'],
  257: ['sword', 'blunt'],
  217: ['sword', 'blunt'],
  2: ['sword'],
  205: ['blunt'],
  210: ['fist'],
};

function fmtStat(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const v = Math.round(n * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function fmtSigned(n: number): string {
  return '+ ' + fmtStat(Math.max(0, n));
}

function fmtPatkBonus(n: number): string {
  return fmtSigned(n) + ' атаки';
}

function fmtMatkBonus(n: number): string {
  return '+ ' + fmtStat(Math.max(0, n)) + ' M.Atk';
}

function raceBranchLabelUk(row: CharacterRow): string {
  const race = String(row.race || 'Human').trim();
  const branch = String(row.classBranch || 'fighter').trim().toLowerCase();
  const raceMap: Record<string, string> = {
    Human: 'Людина',
    Elf: 'Ельф',
    'Dark Elf': 'Темний ельф',
    Darkelf: 'Темний ельф',
    Orc: 'Орк',
    Dwarf: 'Гном',
  };
  const raceUk = raceMap[race] || race;
  const branchUk = branch === 'mystic' ? 'маг' : 'воин';
  return raceUk + ' (' + branchUk + ')';
}

function flatPatkBonusForSkill(l2SkillId: number, rank: number): number {
  const r = Math.max(1, Math.floor(rank));
  switch (l2SkillId) {
    case 142:
      return weaponMasteryPatkAtRank(r);
    case 249:
      return weaponMasteryMatkAtRank(r);
    case 208:
      return bowMasteryPatkFlatAtRank(r);
    case 209:
      return daggerMasteryPatkFlatAtRank(r);
    case 216:
      return polearmMasteryPatkFlatAtRank(r);
    case 257:
    case 217:
      return swordBluntMasteryPatkFlatAtRank(r);
    default:
      return 0;
  }
}

function collectWeaponMasteryBonuses(
  row: CharacterRow
): Map<WeaponCategory, number> {
  const totals = new Map<WeaponCategory, number>();
  for (const w of WEAPON_ROWS) totals.set(w.key, 0);

  const prof = resolveL2ProfessionForSkillsRow(row);
  const learned = enrichLearnedSkillsForSnapshot(
    filterLearnedSkillEntriesForCharacter(
      normalizeLearnedSkillsJson(row.skillsLearnedJson),
      row.race,
      row.classBranch,
      prof
    ),
    row.race,
    row.classBranch
  );

  for (const entry of learned) {
    if (entry.kind !== 'passive' || entry.level < 1) continue;
    const l2SkillId = entry.l2SkillId;
    if (l2SkillId == null || !Number.isFinite(Number(l2SkillId))) continue;
    const id = Math.floor(Number(l2SkillId));
    const categories = L2_SKILL_WEAPON_CATEGORIES[id];
    if (!categories?.length) continue;
    const bonus = flatPatkBonusForSkill(id, entry.level);
    if (bonus <= 0) continue;
    for (const cat of categories) {
      const prev = totals.get(cat) ?? 0;
      totals.set(cat, Math.max(prev, bonus));
    }
  }

  return totals;
}

function buildPassiveWeaponRows(
  row: CharacterRow
): CharacterBonusesWeaponRow[] {
  const totals = collectWeaponMasteryBonuses(row);
  return WEAPON_ROWS.map(({ key, labelUk }) => {
    const val = totals.get(key) ?? 0;
    const valueUk =
      key === 'book' ? fmtMatkBonus(val) : fmtPatkBonus(val);
    return { labelUk, valueUk };
  });
}

function armorEquipDelta(
  level: number,
  row: CharacterRow,
  inv: InventoryState,
  opts: ComputeCombatStatsOptions
): {
  attackSpeed: number;
  crit: number;
  magicCrit: number;
  runSpeed: number;
} {
  const nakedInv: InventoryState = { ...inv, stacks: inv.stacks, eq: {} };
  const full = computeCombatStats(level, row.race, row.classBranch, inv, opts);
  const noEq = computeCombatStats(
    level,
    row.race,
    row.classBranch,
    nakedInv,
    opts
  );
  return {
    attackSpeed: full.pAtkSpd - noEq.pAtkSpd,
    crit: full.critRate - noEq.critRate,
    magicCrit: full.mCritPct - noEq.mCritPct,
    runSpeed: full.runSpeed - noEq.runSpeed,
  };
}

function buildSoulshotSpiritshotLine(
  row: CharacterRow,
  inv: InventoryState,
  opts: ComputeCombatStatsOptions,
  level: number
): string {
  const stats = computeCombatStats(level, row.race, row.classBranch, inv, opts);
  const branch = String(row.classBranch || '').trim().toLowerCase();
  const soulMul = branch === 'fighter' ? 2.0 : 1.0;
  const spiritMul = branch === 'mystic' ? 3.0 : 1.0;
  const patk = stats.pAtk * soulMul;
  const matk = stats.mAtk * spiritMul;
  return 'P.Atk ' + fmtStat(patk) + ', M.Atk ' + fmtStat(matk);
}

function buildClanBonusLines(row: CharacterRow): string[] {
  const bonus = resolveClanHallPassiveBonus(row.clan ?? null);
  if (!bonus) return [];
  return [
    'Рівень клану ' +
      String(bonus.level) +
      ' (Клан-хол): P.Atk +' +
      String(bonus.pAtk) +
      ', M.Atk +' +
      String(bonus.mAtk) +
      ', P.Def +' +
      String(bonus.pDef) +
      ', M.Def +' +
      String(bonus.mDef) +
      ', Макс. HP +' +
      String(bonus.maxHp),
  ];
}

function buildArmorBonusRows(
  row: CharacterRow,
  inv: InventoryState,
  opts: ComputeCombatStatsOptions,
  level: number
): CharacterBonusesWeaponRow[] {
  const d = armorEquipDelta(level, row, inv, opts);
  return [
    {
      labelUk: 'Швидкість атаки',
      valueUk: fmtSigned(d.attackSpeed),
    },
    {
      labelUk: 'Крит',
      valueUk: fmtSigned(d.crit),
    },
    {
      labelUk: 'Маг. крит',
      valueUk: fmtSigned(d.magicCrit) + '%',
    },
    {
      labelUk: 'Швидкість бігу',
      valueUk: fmtSigned(d.runSpeed),
    },
    {
      labelUk: 'Макс. HP',
      valueUk: fmtSigned(0),
    },
    {
      labelUk: 'P.Def',
      valueUk: fmtSigned(0),
    },
    {
      labelUk: 'M.Def',
      valueUk: fmtSigned(0),
    },
    {
      labelUk: 'P.Atk',
      valueUk: fmtSigned(0),
    },
    {
      labelUk: 'M.Atk',
      valueUk: fmtSigned(0),
    },
  ];
}

export function buildCharacterBonusesView(row: CharacterRow): CharacterBonusesViewDto {
  const inv = parseInventory(row.inventoryJson);
  const level = levelFromTotalExp(row.exp);
  const opts = combatOptsFromRow(row);
  const armorSet = resolveActiveArmorSetProfile(inv);

  return {
    raceBranchLabelUk: raceBranchLabelUk(row),
    professionLabelUk: professionDisplayUk(row.l2Profession),
    passiveBonusesTitleUk: 'Пасивні бонуси',
    soulshotSpiritshotLineUk: buildSoulshotSpiritshotLine(row, inv, opts, level),
    clanBonusLinesUk: buildClanBonusLines(row),
    passiveSkillsTitleUk: 'Пасивні умения',
    passiveSkillsIntroUk: 'Бонуси від вивчених пасивних навичок:',
    passiveWeaponRows: buildPassiveWeaponRows(row),
    armorBonusesTitleUk: 'Бонуси від броні',
    armorBonusRows: buildArmorBonusRows(row, inv, opts, level),
    armorSetLinesUk: armorSet?.linesUk ? [...armorSet.linesUk] : [],
  };
}
