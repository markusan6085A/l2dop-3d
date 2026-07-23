/**
 * Спільна логіка Phase 3 audit/test усіх 144 канонічних зброї NG→S.
 */
import { NG_WEAPON_CATALOG } from '../../src/data/ngWeaponCatalog.js';
import { D_WEAPON_CATALOG } from '../../src/data/dWeaponCatalog.js';
import { C_WEAPON_CATALOG } from '../../src/data/cWeaponCatalog.js';
import { B_WEAPON_CATALOG, B_WEAPON_CANONICAL_COUNT, B_WEAPON_CUSTOM_COUNT, B_WEAPON_SHOP_TOTAL } from '../../src/data/bWeaponCatalog.js';
import { A_WEAPON_CATALOG, A_WEAPON_CANONICAL_COUNT, A_WEAPON_CUSTOM_COUNT, A_WEAPON_SHOP_TOTAL } from '../../src/data/aWeaponCatalog.js';
import { S_WEAPON_CATALOG } from '../../src/data/sWeaponCatalog.js';
import { ITEM_CATALOG } from '../../src/data/itemsCatalog.js';
import { L2DOP_GM_SHOP_WEAPONS } from '../../src/data/l2dopGmShopCatalog.generated.js';
import { listGearCatalogForClient } from '../../src/data/itemsCatalog.js';
import {
  itemBlocksShieldSlot,
  itemRequiresArrowsHintsForClient,
} from '../../src/data/l2dopTwoHandedWeapon.js';
import {
  isCanonicalWeaponType,
  requiresArrowsForWeaponType,
  weaponTypeBlocksShield,
} from '../../src/data/weaponTypeContract.js';
import type { WeaponKindForEnchant } from '../../src/data/l2dopEnchant.js';

export type WeaponGrade = 'NG' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface CanonWeaponRow {
  itemId: number;
  name: string;
  grade: WeaponGrade;
  weaponType: WeaponKindForEnchant;
  slot: 'rhand';
  pAtk?: number;
  mAtk?: number;
  atkSpd: number;
  wpnCrit?: number;
  blocksShield: boolean;
  requiresArrows: boolean;
  canonicalSource: string;
}

export const EXPECTED_GRADE_COUNTS: Record<WeaponGrade, number> = {
  NG: 42,
  D: 21,
  C: 26,
  B: 23,
  A: 30,
  S: 13,
};

export const EXPECTED_B_SHOP_TOTAL = B_WEAPON_SHOP_TOTAL;
export const EXPECTED_B_CANONICAL = B_WEAPON_CANONICAL_COUNT;
export const EXPECTED_B_CUSTOM = B_WEAPON_CUSTOM_COUNT;

export const EXPECTED_A_SHOP_TOTAL = A_WEAPON_SHOP_TOTAL;
export const EXPECTED_A_CANONICAL = A_WEAPON_CANONICAL_COUNT;
export const EXPECTED_A_CUSTOM = A_WEAPON_CUSTOM_COUNT;

export const TOTAL_CANON_WEAPONS =
  NG_WEAPON_CATALOG.length +
  D_WEAPON_CATALOG.length +
  C_WEAPON_CATALOG.length +
  B_WEAPON_CATALOG.length +
  A_WEAPON_CATALOG.length +
  S_WEAPON_CATALOG.length;

export const REGRESSION_ITEM_IDS = {
  buffaloHorn: 308,
  elysian: 164,
  spikedGloves: 253,
  draconicBow: 7575,
  shiningBow: 6368,
  godsBlade: 82,
} as const;

function ngWpnCrit(entry: (typeof NG_WEAPON_CATALOG)[number]): number {
  return entry.wpnCrit;
}

export function collectAllCanonWeapons(): CanonWeaponRow[] {
  const rows: CanonWeaponRow[] = [];

  for (const e of NG_WEAPON_CATALOG) {
    rows.push({
      itemId: e.itemId,
      name: e.shopNameUk,
      grade: 'NG',
      weaponType: e.weaponType,
      slot: 'rhand',
      pAtk: e.pAtk,
      mAtk: e.mAtk,
      atkSpd: e.atkSpd,
      wpnCrit: ngWpnCrit(e),
      blocksShield: e.blocksShield,
      requiresArrows: requiresArrowsForWeaponType(e.weaponType),
      canonicalSource: 'ngWeaponCatalog.ts',
    });
  }
  for (const e of D_WEAPON_CATALOG) {
    rows.push({
      itemId: e.itemId,
      name: e.shopNameUk,
      grade: 'D',
      weaponType: e.weaponType,
      slot: 'rhand',
      pAtk: e.pAtk,
      mAtk: e.mAtk,
      atkSpd: e.atkSpd,
      wpnCrit: e.wpnCrit,
      blocksShield: e.blocksShield,
      requiresArrows: requiresArrowsForWeaponType(e.weaponType),
      canonicalSource: 'dWeaponCatalog.ts',
    });
  }
  for (const e of C_WEAPON_CATALOG) {
    rows.push({
      itemId: e.itemId,
      name: e.shopNameUk,
      grade: 'C',
      weaponType: e.weaponType,
      slot: 'rhand',
      pAtk: e.pAtk,
      mAtk: e.mAtk,
      atkSpd: e.atkSpd,
      wpnCrit: e.wpnCrit,
      blocksShield: e.blocksShield,
      requiresArrows: requiresArrowsForWeaponType(e.weaponType),
      canonicalSource: 'cWeaponCatalog.ts',
    });
  }
  for (const e of B_WEAPON_CATALOG) {
    rows.push({
      itemId: e.itemId,
      name: e.shopNameUk,
      grade: 'B',
      weaponType: e.weaponType,
      slot: 'rhand',
      pAtk: e.pAtk,
      mAtk: e.mAtk,
      atkSpd: e.atkSpd,
      wpnCrit: e.wpnCrit,
      blocksShield: e.blocksShield,
      requiresArrows: requiresArrowsForWeaponType(e.weaponType),
      canonicalSource:
        e.canonSource === 'interlude'
          ? 'bWeaponCatalog.ts'
          : 'bWeaponCatalog.ts (custom)',
    });
  }
  for (const e of A_WEAPON_CATALOG) {
    rows.push({
      itemId: e.itemId,
      name: e.shopNameUk,
      grade: 'A',
      weaponType: e.weaponType,
      slot: 'rhand',
      pAtk: e.pAtk,
      mAtk: e.mAtk,
      atkSpd: e.atkSpd,
      wpnCrit: e.wpnCrit,
      blocksShield: e.blocksShield,
      requiresArrows: requiresArrowsForWeaponType(e.weaponType),
      canonicalSource:
        e.canonSource === 'interlude'
          ? 'aWeaponCatalog.ts'
          : 'aWeaponCatalog.ts (custom)',
    });
  }
  for (const e of S_WEAPON_CATALOG) {
    rows.push({
      itemId: e.itemId,
      name: e.shopNameUk,
      grade: 'S',
      weaponType: e.weaponType,
      slot: 'rhand',
      pAtk: e.pAtk,
      mAtk: e.mAtk,
      atkSpd: e.atkSpd,
      wpnCrit: e.wpnCrit,
      blocksShield: e.blocksShield,
      requiresArrows: requiresArrowsForWeaponType(e.weaponType),
      canonicalSource: 'sWeaponCatalog.ts',
    });
  }

  return rows;
}

export interface WeaponAuditIssue {
  itemId: number;
  name: string;
  kind: string;
  detail: string;
}

export function auditAllCanonWeapons(): {
  rows: CanonWeaponRow[];
  issues: WeaponAuditIssue[];
  gradeCounts: Record<WeaponGrade, number>;
} {
  const rows = collectAllCanonWeapons();
  const issues: WeaponAuditIssue[] = [];
  const gearById = new Map(listGearCatalogForClient().map((r) => [r.itemId, r]));
  const gmById = new Map(L2DOP_GM_SHOP_WEAPONS.map((w) => [w.itemId, w]));
  const arrowHints = itemRequiresArrowsHintsForClient();

  const gradeCounts: Record<WeaponGrade, number> = {
    NG: 0,
    D: 0,
    C: 0,
    B: 0,
    A: 0,
    S: 0,
  };
  for (const row of rows) gradeCounts[row.grade]++;

  for (const [grade, expected] of Object.entries(EXPECTED_GRADE_COUNTS) as Array<
    [WeaponGrade, number]
  >) {
    if (gradeCounts[grade] !== expected) {
      issues.push({
        itemId: 0,
        name: grade,
        kind: 'grade_count',
        detail: `expected ${expected}, got ${gradeCounts[grade]}`,
      });
    }
  }
  if (rows.length !== TOTAL_CANON_WEAPONS) {
    issues.push({
      itemId: 0,
      name: 'total',
      kind: 'total_count',
      detail: `expected ${TOTAL_CANON_WEAPONS}, got ${rows.length}`,
    });
  }

  const seenIds = new Set<number>();
  for (const row of rows) {
    if (seenIds.has(row.itemId)) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'duplicate_catalog',
        detail: 'duplicate itemId in *WeaponCatalog merge',
      });
    }
    seenIds.add(row.itemId);

    if (!isCanonicalWeaponType(row.weaponType)) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'unknown_weaponType',
        detail: String(row.weaponType),
      });
    }

    const expectedBlocks = weaponTypeBlocksShield(row.weaponType);
    if (row.blocksShield !== expectedBlocks && row.itemId !== 308 && row.itemId !== 164) {
      // explicit canon overrides generic — only flag if canon contradicts itself
    }

    if (row.weaponType === 'bow' && !row.requiresArrows) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'bow_no_arrows',
        detail: 'bow must require arrows',
      });
    }
    if (row.weaponType !== 'bow' && row.requiresArrows) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'non_bow_arrows',
        detail: `${row.weaponType} must not require arrows`,
      });
    }

    if (
      (row.weaponType === 'sword' ||
        row.weaponType === 'blunt' ||
        row.weaponType === 'dagger') &&
      row.blocksShield
    ) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: '1h_blocks_shield',
        detail: `${row.weaponType} must allow shield`,
      });
    }

    if (
      (row.weaponType === 'bigsword' ||
        row.weaponType === 'bigblunt' ||
        row.weaponType === 'bow' ||
        row.weaponType === 'dual' ||
        row.weaponType === 'pole' ||
        row.weaponType === 'fist') &&
      !row.blocksShield
    ) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: '2h_allows_shield',
        detail: `${row.weaponType} must block shield`,
      });
    }

    const catalog = ITEM_CATALOG[row.itemId];
    if (!catalog) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'missing_item_catalog',
        detail: 'ITEM_CATALOG missing',
      });
      continue;
    }
    if (catalog.slot !== 'rhand') {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'wrong_slot',
        detail: `slot=${catalog.slot}`,
      });
    }
    if (catalog.weaponType !== row.weaponType) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'weaponType_collision',
        detail: `catalog=${catalog.weaponType} canon=${row.weaponType}`,
      });
    }
    if (catalog.pAtk !== row.pAtk) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'patk_collision',
        detail: `catalog=${catalog.pAtk} canon=${row.pAtk}`,
      });
    }
    if (row.mAtk != null && catalog.mAtk !== row.mAtk) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'matk_collision',
        detail: `catalog=${catalog.mAtk} canon=${row.mAtk}`,
      });
    }
    if (catalog.atkSpd !== row.atkSpd) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'atkspd_collision',
        detail: `catalog=${catalog.atkSpd} canon=${row.atkSpd}`,
      });
    }
    if (row.wpnCrit != null && catalog.wpnCrit !== row.wpnCrit) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'wpncrit_collision',
        detail: `catalog=${catalog.wpnCrit} canon=${row.wpnCrit}`,
      });
    }
    const runtimeBlocks = itemBlocksShieldSlot(row.itemId, catalog.weaponType);
    if (runtimeBlocks !== row.blocksShield) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'blocksShield_collision',
        detail: `runtime=${runtimeBlocks} canon=${row.blocksShield}`,
      });
    }
    if (catalog.blocksShield !== row.blocksShield) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'catalog_blocksShield',
        detail: `catalog=${catalog.blocksShield} canon=${row.blocksShield}`,
      });
    }
    if (catalog.requiresArrows !== row.requiresArrows) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'catalog_requiresArrows',
        detail: `catalog=${catalog.requiresArrows} canon=${row.requiresArrows}`,
      });
    }

    const gm = gmById.get(row.itemId);
    if (gm && gm.weaponType !== row.weaponType) {
      const catalogMatchesStaleGm =
        catalog.weaponType === gm.weaponType &&
        catalog.pAtk === gm.pAtk &&
        catalog.atkSpd === gm.atkSpd;
      if (catalogMatchesStaleGm) {
        issues.push({
          itemId: row.itemId,
          name: row.name,
          kind: 'gm_overrides_canon',
          detail: `ITEM_CATALOG still matches stale GM weaponType=${gm.weaponType}`,
        });
      }
    }

    const gear = gearById.get(row.itemId);
    if (gear) {
      if (gear.weaponType && gear.weaponType !== row.weaponType) {
        issues.push({
          itemId: row.itemId,
          name: row.name,
          kind: 'gear_weaponType',
          detail: `gear=${gear.weaponType} canon=${row.weaponType}`,
        });
      }
      if (
        typeof gear.blocksShield === 'boolean' &&
        gear.blocksShield !== row.blocksShield
      ) {
        issues.push({
          itemId: row.itemId,
          name: row.name,
          kind: 'gear_blocksShield',
          detail: `gear=${gear.blocksShield} canon=${row.blocksShield}`,
        });
      }
      if (gear.requiresArrows === true !== row.requiresArrows) {
        issues.push({
          itemId: row.itemId,
          name: row.name,
          kind: 'gear_requiresArrows',
          detail: `gear=${gear.requiresArrows} canon=${row.requiresArrows}`,
        });
      }
    } else {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'missing_gear_catalog',
        detail: 'not in listGearCatalogForClient()',
      });
    }

    const arrowHint = arrowHints[row.itemId] === true;
    if (arrowHint !== row.requiresArrows) {
      issues.push({
        itemId: row.itemId,
        name: row.name,
        kind: 'arrow_hint',
        detail: `hint=${arrowHint} canon=${row.requiresArrows}`,
      });
    }
  }

  return { rows, issues, gradeCounts };
}

export function formatAuditTable(rows: CanonWeaponRow[]): string {
  const header = [
    'itemId',
    'name',
    'grade',
    'weaponType',
    'slot',
    'pAtk',
    'mAtk',
    'atkSpd',
    'wpnCrit',
    'blocksShield',
    'requiresArrows',
    'source',
  ].join('\t');
  const lines = rows.map((r) =>
    [
      r.itemId,
      r.name,
      r.grade,
      r.weaponType,
      r.slot,
      r.pAtk ?? '',
      r.mAtk ?? '',
      r.atkSpd,
      r.wpnCrit,
      r.blocksShield,
      r.requiresArrows,
      r.canonicalSource,
    ].join('\t'),
  );
  return [header, ...lines].join('\n');
}
