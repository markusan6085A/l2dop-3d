/**
 * Єдиний resolver комплектів броні та серіалізатор для клієнта.
 */
import type { InventoryState } from './inventory.js';
import { normalizeEqSlot } from './inventory.js';
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';
import {
  type ArmorSetDefinition,
  type ArmorSetEffects,
  D_GRADE_ARMOR_SETS,
  armorSetDefinitionById,
  armorSetDefinitionForItem,
  armorSetItemRoleForItem,
  armorSetPieceName,
  type ArmorSetItemRole,
} from './armorSetCatalog.js';
import { dGradeArmorCatalogRow } from './dGradeArmorCatalog.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import {
  dGradeFullArmorSetBonusDeltaLegacyOnly,
  resolveActiveArmorSetProfile as resolveLegacyActiveArmorSetProfile,
} from './l2dopDGradeArmorSetBonuses.js';

const EQ_SCAN_KEYS = ['l3', 'l4', 'lh', 'lg', 'lf', 'l2'] as const;

export type EquippedArmorSetActive = {
  setId: string;
  name: string;
  grade: string;
  equippedCorePieces: number;
  totalCorePieces: number;
  shieldEquipped: boolean;
  activeStages: number[];
  effects: ArmorSetEffects;
  displayLines: string[];
};

export type ArmorSetBonusTotals = {
  maxHpFlat: number;
  maxMpFlat: number;
  mAtkPct: number;
  addCritDmg: number;
  poisonResistancePct: number;
  shieldDefensePct: number;
};

export type ResolveEquippedArmorSetBonusesResult = {
  activeSets: EquippedArmorSetActive[];
  totals: ArmorSetBonusTotals;
};

export type ItemClientViewArmorSetInfo = {
  setId: string;
  name: string;
  grade: string;
  pieceIds: number[];
  pieceNames: string[];
  stages: Array<{
    requiredCorePieces: number;
    requiresShield?: boolean;
    displayLines: string[];
  }>;
  optionalShieldId?: number;
  optionalShieldName?: string;
};

export type ItemClientViewEquippedProgress = {
  equippedCorePieces: number;
  totalCorePieces: number;
  shieldEquipped: boolean;
  activeStageLabels: string[];
};

export type ItemClientView = {
  itemId: number;
  name: string;
  grade: string | null;
  slot: string | null;
  pDef: number | null;
  shieldDefense: number | null;
  shieldBlockRatePct: number | null;
  armorSetInfo: ItemClientViewArmorSetInfo | null;
  setItemRole: ArmorSetItemRole | null;
  equippedSetProgress: ItemClientViewEquippedProgress | null;
  activeSetEffects: ArmorSetEffects | null;
};

function emptyTotals(): ArmorSetBonusTotals {
  return {
    maxHpFlat: 0,
    maxMpFlat: 0,
    mAtkPct: 0,
    addCritDmg: 0,
    poisonResistancePct: 0,
    shieldDefensePct: 0,
  };
}

function mergeEffects(into: ArmorSetEffects, add: ArmorSetEffects): ArmorSetEffects {
  const out: ArmorSetEffects = { ...into };
  if (add.maxHpFlat) out.maxHpFlat = (out.maxHpFlat ?? 0) + add.maxHpFlat;
  if (add.maxMpFlat) out.maxMpFlat = (out.maxMpFlat ?? 0) + add.maxMpFlat;
  if (add.mAtkPct) out.mAtkPct = (out.mAtkPct ?? 0) + add.mAtkPct;
  if (add.addCritDmg) out.addCritDmg = (out.addCritDmg ?? 0) + add.addCritDmg;
  if (add.poisonResistancePct) {
    out.poisonResistancePct = (out.poisonResistancePct ?? 0) + add.poisonResistancePct;
  }
  if (add.shieldDefensePct) {
    out.shieldDefensePct = (out.shieldDefensePct ?? 0) + add.shieldDefensePct;
  }
  return out;
}

function effectsToTotals(effects: ArmorSetEffects): ArmorSetBonusTotals {
  return {
    maxHpFlat: effects.maxHpFlat ?? 0,
    maxMpFlat: effects.maxMpFlat ?? 0,
    mAtkPct: effects.mAtkPct ?? 0,
    addCritDmg: effects.addCritDmg ?? 0,
    poisonResistancePct: effects.poisonResistancePct ?? 0,
    shieldDefensePct: effects.shieldDefensePct ?? 0,
  };
}

function equippedItemIds(eq: InventoryState['eq']): Set<number> {
  const ids = new Set<number>();
  for (const key of EQ_SCAN_KEYS) {
    const slot = normalizeEqSlot(eq?.[key]);
    if (slot?.itemId) ids.add(slot.itemId);
  }
  return ids;
}

function resolveSetActive(
  set: ArmorSetDefinition,
  worn: Set<number>
): EquippedArmorSetActive | null {
  const coreEquipped = set.corePieceIds.filter((id) => worn.has(id)).length;
  if (coreEquipped < 2) return null;

  const shieldEquipped =
    set.optionalShieldId != null && worn.has(set.optionalShieldId);

  let combined: ArmorSetEffects = {};
  const activeStages: number[] = [];
  const displayLines: string[] = [];

  for (let i = 0; i < set.stages.length; i++) {
    const stage = set.stages[i]!;
    if (coreEquipped < stage.requiredCorePieces) continue;
    if (stage.requiresShield && !shieldEquipped) continue;
    combined = mergeEffects(combined, stage.effects);
    activeStages.push(i + 1);
    for (const line of stage.displayLines) {
      if (!displayLines.includes(line)) displayLines.push(line);
    }
  }

  if (activeStages.length === 0) return null;

  return {
    setId: set.setId,
    name: set.name,
    grade: set.grade,
    equippedCorePieces: coreEquipped,
    totalCorePieces: set.corePieceIds.length,
    shieldEquipped,
    activeStages,
    effects: combined,
    displayLines,
  };
}

/** Єдиний resolver активних бонусів комплектів за екіпірованими itemId. */
export function resolveEquippedArmorSetBonuses(
  equipment: InventoryState['eq'] | InventoryState
): ResolveEquippedArmorSetBonusesResult {
  const eq = 'eq' in equipment && equipment.eq ? equipment.eq : equipment;
  const worn = equippedItemIds(eq as InventoryState['eq']);

  const activeSets: EquippedArmorSetActive[] = [];
  let totals = emptyTotals();

  for (const set of D_GRADE_ARMOR_SETS) {
    const active = resolveSetActive(set, worn);
    if (!active) continue;
    activeSets.push(active);
    const t = effectsToTotals(active.effects);
    totals = {
      maxHpFlat: totals.maxHpFlat + t.maxHpFlat,
      maxMpFlat: totals.maxMpFlat + t.maxMpFlat,
      mAtkPct: totals.mAtkPct + t.mAtkPct,
      addCritDmg: totals.addCritDmg + t.addCritDmg,
      poisonResistancePct: totals.poisonResistancePct + t.poisonResistancePct,
      shieldDefensePct: totals.shieldDefensePct + t.shieldDefensePct,
    };
  }

  return { activeSets, totals };
}

/** Конвертація totals → модифікатори бою + flat HP/MP для computeCombatStats. */
export function armorSetTotalsToCombatDelta(totals: ArmorSetBonusTotals): {
  buffDelta: Partial<L2dopCombatBuffModifiers>;
  flatMaxHp: number;
  flatMaxMp: number;
} {
  const buffDelta: Partial<L2dopCombatBuffModifiers> = {};
  if (totals.addCritDmg > 0) buffDelta.addCritDmg = totals.addCritDmg;
  if (totals.mAtkPct > 0) buffDelta.buffMatk = 1 + totals.mAtkPct / 100;
  if (totals.poisonResistancePct > 0) {
    buffDelta.poisonResistMul = 1 + totals.poisonResistancePct / 100;
  }
  if (totals.shieldDefensePct > 0) {
    buffDelta.shieldDefenceRatePct = totals.shieldDefensePct;
  }
  return {
    buffDelta,
    flatMaxHp: totals.maxHpFlat,
    flatMaxMp: totals.maxMpFlat,
  };
}

/** Дельта для C/B/A/S legacy full-set (не D-grade staged). */
export function legacyFullArmorSetBonusDelta(
  inv: InventoryState
): Partial<L2dopCombatBuffModifiers> {
  return dGradeFullArmorSetBonusDeltaLegacyOnly(inv);
}

export function armorSetCatalogForClient(): ItemClientViewArmorSetInfo[] {
  return D_GRADE_ARMOR_SETS.map((set) => ({
    setId: set.setId,
    name: set.name,
    grade: set.grade,
    pieceIds: [...set.corePieceIds],
    pieceNames: set.corePieceIds.map(armorSetPieceName),
    stages: set.stages.map((s) => ({
      requiredCorePieces: s.requiredCorePieces,
      ...(s.requiresShield ? { requiresShield: true } : {}),
      displayLines: [...s.displayLines],
    })),
    ...(set.optionalShieldId != null
      ? {
          optionalShieldId: set.optionalShieldId,
          optionalShieldName: armorSetPieceName(set.optionalShieldId),
        }
      : {}),
  }));
}

export function armorSetInfoForItem(itemId: number): ItemClientViewArmorSetInfo | null {
  const set = armorSetDefinitionForItem(itemId);
  if (!set) return null;
  return armorSetCatalogForClient().find((s) => s.setId === set.setId) ?? null;
}

function resolveItemName(itemId: number): string {
  const canon = dGradeArmorCatalogRow(itemId);
  if (canon) return canon.name;
  return ITEM_CATALOG[itemId]?.nameUk ?? `Item ${itemId}`;
}

function resolveItemStats(itemId: number): {
  slot: string | null;
  pDef: number | null;
  shieldDefense: number | null;
  shieldBlockRatePct: number | null;
} {
  const canon = dGradeArmorCatalogRow(itemId);
  const meta = ITEM_CATALOG[itemId];
  const slot = canon?.slot ?? meta?.slot ?? null;
  if (canon?.shieldDefense != null) {
    return {
      slot,
      pDef: null,
      shieldDefense: canon.shieldDefense,
      shieldBlockRatePct: canon.shieldBlockRatePct ?? null,
    };
  }
  return {
    slot,
    pDef: canon?.pDef ?? meta?.pDef ?? null,
    shieldDefense: meta?.shieldDefense ?? null,
    shieldBlockRatePct: meta?.shieldBlockRatePct ?? null,
  };
}

function shieldOnlySetEffects(effects: ArmorSetEffects | null): ArmorSetEffects | null {
  if (!effects?.shieldDefensePct) return null;
  return { shieldDefensePct: effects.shieldDefensePct };
}

function progressLabelsForItemView(
  setItemRole: ArmorSetItemRole | null,
  active: EquippedArmorSetActive | null,
  coreEquipped: number,
  totalCore: number,
  shieldEquipped: boolean
): string[] {
  if (setItemRole === 'optionalShield') {
    return shieldEquipped && coreEquipped >= totalCore && active?.effects.shieldDefensePct
      ? ['Shield Defense +2.63%']
      : [];
  }
  return active?.displayLines ?? [];
}

/** Спільний серіалізатор предмета для shop / inventory / modal / drop preview. */
export function buildItemClientView(
  itemId: number,
  characterEquipment?: InventoryState['eq'] | InventoryState | null
): ItemClientView {
  const id = Math.floor(itemId);
  const stats = resolveItemStats(id);
  const setItemRole = armorSetItemRoleForItem(id);
  const setInfo = armorSetInfoForItem(id);

  let equippedSetProgress: ItemClientViewEquippedProgress | null = null;
  let activeSetEffects: ArmorSetEffects | null = null;

  if (characterEquipment && setInfo) {
    const resolved = resolveEquippedArmorSetBonuses(characterEquipment);
    const active = resolved.activeSets.find((s) => s.setId === setInfo.setId) ?? null;
    const eq =
      'eq' in characterEquipment && characterEquipment.eq
        ? characterEquipment.eq
        : characterEquipment;
    const worn = equippedItemIds(eq as InventoryState['eq']);
    const set = armorSetDefinitionById(setInfo.setId);
    const coreEquipped = set
      ? set.corePieceIds.filter((pid) => worn.has(pid)).length
      : 0;
    const totalCore = set?.corePieceIds.length ?? setInfo.pieceIds.length;
    const shieldEquipped =
      set?.optionalShieldId != null && worn.has(set.optionalShieldId);

    equippedSetProgress = {
      equippedCorePieces: active?.equippedCorePieces ?? coreEquipped,
      totalCorePieces: active?.totalCorePieces ?? totalCore,
      shieldEquipped: active?.shieldEquipped ?? shieldEquipped,
      activeStageLabels: progressLabelsForItemView(
        setItemRole,
        active,
        coreEquipped,
        totalCore,
        shieldEquipped
      ),
    };

    if (setItemRole === 'optionalShield') {
      activeSetEffects = shieldOnlySetEffects(active?.effects ?? null);
    } else if (active) {
      activeSetEffects = active.effects;
    }
  }

  return {
    itemId: id,
    name: resolveItemName(id),
    grade: dGradeArmorCatalogRow(id)?.grade ?? null,
    slot: stats.slot,
    pDef: stats.pDef,
    shieldDefense: stats.shieldDefense,
    shieldBlockRatePct: stats.shieldBlockRatePct,
    armorSetInfo: setInfo,
    setItemRole,
    equippedSetProgress,
    activeSetEffects,
  };
}

/** Профіль / bonuses page — активні D-grade staged sets + legacy full sets. */
export function resolveActiveArmorSetProfileLines(
  inv: InventoryState
): { id: string; nameUk: string; linesUk: string[] } | null {
  const staged = resolveEquippedArmorSetBonuses(inv);
  if (staged.activeSets.length > 0) {
    const primary = staged.activeSets[0]!;
    return {
      id: primary.setId,
      nameUk: `${primary.name} (${primary.grade})`,
      linesUk: primary.displayLines,
    };
  }
  const legacy = resolveLegacyActiveArmorSetProfile(inv);
  return legacy;
}

export function formatArmorSetBonusLinesUkFromEffects(
  effects: ArmorSetEffects
): string[] {
  const lines: string[] = [];
  if (effects.maxHpFlat) lines.push(`Max HP +${effects.maxHpFlat}`);
  if (effects.maxMpFlat) lines.push(`Max MP +${effects.maxMpFlat}`);
  if (effects.mAtkPct) lines.push(`M.Atk +${effects.mAtkPct}%`);
  if (effects.addCritDmg) lines.push(`P. Critical Damage +${effects.addCritDmg}`);
  if (effects.poisonResistancePct) {
    lines.push(`Poison Resistance +${effects.poisonResistancePct}%`);
  }
  if (effects.shieldDefensePct) {
    lines.push(`Shield Defense +${effects.shieldDefensePct}%`);
  }
  return lines;
}
