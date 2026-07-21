/**
 * Єдиний resolver комплектів броні та серіалізатор для клієнта.
 */
import type { InventoryState } from './inventory.js';
import { normalizeEqSlot } from './inventory.js';
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';
import {
  type ArmorSetDefinition,
  type ArmorSetEffects,
  ALL_ARMOR_SETS,
  armorSetDefinitionById,
  armorSetDefinitionForItem,
  armorSetItemRoleForItem,
  armorSetPieceName,
  type ArmorSetItemRole,
} from './armorSetCatalog.js';
import { gradeArmorCatalogRow } from './gradeArmorCatalog.js';
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
  bleedResistancePct: number;
  shieldDefensePct: number;
  sleepHoldResistancePct: number;
  castingSpdPct: number;
  pDefPct: number;
  stunResistancePct: number;
  hpRegenPct: number;
  mpRegenPct: number;
  speedFlat: number;
  pAtkPct: number;
  intFlat: number;
  witFlat: number;
  strFlat: number;
  conFlat: number;
  dexFlat: number;
};

export type ArmorSetFlatStats = {
  strFlat: number;
  intFlat: number;
  witFlat: number;
  conFlat: number;
  dexFlat: number;
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
  armorType: string | null;
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
    bleedResistancePct: 0,
    shieldDefensePct: 0,
    sleepHoldResistancePct: 0,
    castingSpdPct: 0,
    pDefPct: 0,
    stunResistancePct: 0,
    hpRegenPct: 0,
    mpRegenPct: 0,
    speedFlat: 0,
    pAtkPct: 0,
    intFlat: 0,
    witFlat: 0,
    strFlat: 0,
    conFlat: 0,
    dexFlat: 0,
  };
}

function addOptionalNumber(into: number, add: number | undefined): number {
  return into + (add ?? 0);
}

function mergeEffects(into: ArmorSetEffects, add: ArmorSetEffects): ArmorSetEffects {
  const out: ArmorSetEffects = { ...into };
  if (add.maxHpFlat != null) out.maxHpFlat = (out.maxHpFlat ?? 0) + add.maxHpFlat;
  if (add.maxMpFlat != null) out.maxMpFlat = (out.maxMpFlat ?? 0) + add.maxMpFlat;
  if (add.mAtkPct != null) out.mAtkPct = (out.mAtkPct ?? 0) + add.mAtkPct;
  if (add.addCritDmg != null) out.addCritDmg = (out.addCritDmg ?? 0) + add.addCritDmg;
  if (add.poisonResistancePct != null) {
    out.poisonResistancePct = (out.poisonResistancePct ?? 0) + add.poisonResistancePct;
  }
  if (add.bleedResistancePct != null) {
    out.bleedResistancePct = (out.bleedResistancePct ?? 0) + add.bleedResistancePct;
  }
  if (add.shieldDefensePct != null) {
    out.shieldDefensePct = (out.shieldDefensePct ?? 0) + add.shieldDefensePct;
  }
  if (add.sleepHoldResistancePct != null) {
    out.sleepHoldResistancePct =
      (out.sleepHoldResistancePct ?? 0) + add.sleepHoldResistancePct;
  }
  if (add.castingSpdPct != null) {
    out.castingSpdPct = (out.castingSpdPct ?? 0) + add.castingSpdPct;
  }
  if (add.pDefPct != null) out.pDefPct = (out.pDefPct ?? 0) + add.pDefPct;
  if (add.stunResistancePct != null) {
    out.stunResistancePct = (out.stunResistancePct ?? 0) + add.stunResistancePct;
  }
  if (add.hpRegenPct != null) out.hpRegenPct = (out.hpRegenPct ?? 0) + add.hpRegenPct;
  if (add.mpRegenPct != null) out.mpRegenPct = (out.mpRegenPct ?? 0) + add.mpRegenPct;
  if (add.speedFlat != null) out.speedFlat = (out.speedFlat ?? 0) + add.speedFlat;
  if (add.pAtkPct != null) out.pAtkPct = (out.pAtkPct ?? 0) + add.pAtkPct;
  if (add.intFlat != null) out.intFlat = (out.intFlat ?? 0) + add.intFlat;
  if (add.witFlat != null) out.witFlat = (out.witFlat ?? 0) + add.witFlat;
  if (add.strFlat != null) out.strFlat = (out.strFlat ?? 0) + add.strFlat;
  if (add.conFlat != null) out.conFlat = (out.conFlat ?? 0) + add.conFlat;
  if (add.dexFlat != null) out.dexFlat = (out.dexFlat ?? 0) + add.dexFlat;
  return out;
}

function effectsToTotals(effects: ArmorSetEffects): ArmorSetBonusTotals {
  return {
    maxHpFlat: effects.maxHpFlat ?? 0,
    maxMpFlat: effects.maxMpFlat ?? 0,
    mAtkPct: effects.mAtkPct ?? 0,
    addCritDmg: effects.addCritDmg ?? 0,
    poisonResistancePct: effects.poisonResistancePct ?? 0,
    bleedResistancePct: effects.bleedResistancePct ?? 0,
    shieldDefensePct: effects.shieldDefensePct ?? 0,
    sleepHoldResistancePct: effects.sleepHoldResistancePct ?? 0,
    castingSpdPct: effects.castingSpdPct ?? 0,
    pDefPct: effects.pDefPct ?? 0,
    stunResistancePct: effects.stunResistancePct ?? 0,
    hpRegenPct: effects.hpRegenPct ?? 0,
    mpRegenPct: effects.mpRegenPct ?? 0,
    speedFlat: effects.speedFlat ?? 0,
    pAtkPct: effects.pAtkPct ?? 0,
    intFlat: effects.intFlat ?? 0,
    witFlat: effects.witFlat ?? 0,
    strFlat: effects.strFlat ?? 0,
    conFlat: effects.conFlat ?? 0,
    dexFlat: effects.dexFlat ?? 0,
  };
}

function sumTotals(a: ArmorSetBonusTotals, b: ArmorSetBonusTotals): ArmorSetBonusTotals {
  return {
    maxHpFlat: addOptionalNumber(a.maxHpFlat, b.maxHpFlat),
    maxMpFlat: addOptionalNumber(a.maxMpFlat, b.maxMpFlat),
    mAtkPct: addOptionalNumber(a.mAtkPct, b.mAtkPct),
    addCritDmg: addOptionalNumber(a.addCritDmg, b.addCritDmg),
    poisonResistancePct: addOptionalNumber(a.poisonResistancePct, b.poisonResistancePct),
    bleedResistancePct: addOptionalNumber(a.bleedResistancePct, b.bleedResistancePct),
    shieldDefensePct: addOptionalNumber(a.shieldDefensePct, b.shieldDefensePct),
    sleepHoldResistancePct: addOptionalNumber(
      a.sleepHoldResistancePct,
      b.sleepHoldResistancePct
    ),
    castingSpdPct: addOptionalNumber(a.castingSpdPct, b.castingSpdPct),
    pDefPct: addOptionalNumber(a.pDefPct, b.pDefPct),
    stunResistancePct: addOptionalNumber(a.stunResistancePct, b.stunResistancePct),
    hpRegenPct: addOptionalNumber(a.hpRegenPct, b.hpRegenPct),
    mpRegenPct: addOptionalNumber(a.mpRegenPct, b.mpRegenPct),
    speedFlat: addOptionalNumber(a.speedFlat, b.speedFlat),
    pAtkPct: addOptionalNumber(a.pAtkPct, b.pAtkPct),
    intFlat: addOptionalNumber(a.intFlat, b.intFlat),
    witFlat: addOptionalNumber(a.witFlat, b.witFlat),
    strFlat: addOptionalNumber(a.strFlat, b.strFlat),
    conFlat: addOptionalNumber(a.conFlat, b.conFlat),
    dexFlat: addOptionalNumber(a.dexFlat, b.dexFlat),
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

  for (const set of ALL_ARMOR_SETS) {
    const active = resolveSetActive(set, worn);
    if (!active) continue;
    activeSets.push(active);
    totals = sumTotals(totals, effectsToTotals(active.effects));
  }

  return { activeSets, totals };
}

/** Конвертація totals → модифікатори бою + flat HP/MP/stats для computeCombatStats. */
export function armorSetTotalsToCombatDelta(totals: ArmorSetBonusTotals): {
  buffDelta: Partial<L2dopCombatBuffModifiers>;
  flatMaxHp: number;
  flatMaxMp: number;
  flatStats: ArmorSetFlatStats;
} {
  const buffDelta: Partial<L2dopCombatBuffModifiers> = {};
  if (totals.addCritDmg > 0) buffDelta.addCritDmg = totals.addCritDmg;
  if (totals.mAtkPct > 0) buffDelta.buffMatk = 1 + totals.mAtkPct / 100;
  if (totals.poisonResistancePct > 0) {
    buffDelta.poisonResistMul = 1 + totals.poisonResistancePct / 100;
  }
  if (totals.bleedResistancePct > 0) {
    buffDelta.bleedResistMul = 1 + totals.bleedResistancePct / 100;
  }
  if (totals.shieldDefensePct > 0) {
    buffDelta.shieldDefenceRatePct = totals.shieldDefensePct;
  }
  if (totals.sleepHoldResistancePct > 0) {
    const mul = 1 + totals.sleepHoldResistancePct / 100;
    buffDelta.holdResistMul = mul;
    buffDelta.sleepResistMul = mul;
  }
  if (totals.castingSpdPct > 0) {
    buffDelta.buffCast = 1 + totals.castingSpdPct / 100;
  }
  if (totals.pDefPct > 0) {
    buffDelta.buffPdef = 1 + totals.pDefPct / 100;
  }
  if (totals.stunResistancePct > 0) {
    buffDelta.addStunResistPct = totals.stunResistancePct;
  }
  if (totals.hpRegenPct > 0) {
    buffDelta.regenHpMul = 1 + totals.hpRegenPct / 100;
  }
  if (totals.mpRegenPct > 0) {
    buffDelta.regenMpMul = 1 + totals.mpRegenPct / 100;
  }
  if (totals.speedFlat !== 0) {
    buffDelta.addSpeed = totals.speedFlat;
  }
  if (totals.pAtkPct > 0) {
    buffDelta.buffPatk = 1 + totals.pAtkPct / 100;
  }
  return {
    buffDelta,
    flatMaxHp: totals.maxHpFlat,
    flatMaxMp: totals.maxMpFlat,
    flatStats: {
      strFlat: totals.strFlat,
      intFlat: totals.intFlat,
      witFlat: totals.witFlat,
      conFlat: totals.conFlat,
      dexFlat: totals.dexFlat,
    },
  };
}

/** Дельта для C/B/A/S legacy full-set (не D-grade staged). */
export function legacyFullArmorSetBonusDelta(
  inv: InventoryState
): Partial<L2dopCombatBuffModifiers> {
  return dGradeFullArmorSetBonusDeltaLegacyOnly(inv);
}

export function armorSetCatalogForClient(): ItemClientViewArmorSetInfo[] {
  return ALL_ARMOR_SETS.map((set) => ({
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
  const canon = gradeArmorCatalogRow(itemId);
  if (canon) return canon.name;
  return ITEM_CATALOG[itemId]?.nameUk ?? `Item ${itemId}`;
}

function resolveItemStats(itemId: number): {
  slot: string | null;
  armorType: string | null;
  pDef: number | null;
  shieldDefense: number | null;
  shieldBlockRatePct: number | null;
} {
  const canon = gradeArmorCatalogRow(itemId);
  const meta = ITEM_CATALOG[itemId];
  const slot = canon?.slot ?? meta?.slot ?? null;
  const armorType = canon?.armorType ?? meta?.armorType ?? null;
  if (canon && 'shieldDefense' in canon && canon.shieldDefense != null) {
    return {
      slot,
      armorType,
      pDef: null,
      shieldDefense: canon.shieldDefense,
      shieldBlockRatePct: canon.shieldBlockRatePct ?? null,
    };
  }
  return {
    slot,
    armorType,
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
    grade: gradeArmorCatalogRow(id)?.grade ?? null,
    armorType: stats.armorType,
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

/** Профіль / bonuses page — активні staged sets + legacy full sets (B+). */
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
  if (effects.maxHpFlat != null) {
    lines.push(`Max HP ${effects.maxHpFlat > 0 ? '+' : ''}${effects.maxHpFlat}`);
  }
  if (effects.maxMpFlat != null) lines.push(`Max MP +${effects.maxMpFlat}`);
  if (effects.mAtkPct != null) lines.push(`M.Atk +${effects.mAtkPct}%`);
  if (effects.addCritDmg != null) lines.push(`P. Critical Damage +${effects.addCritDmg}`);
  if (effects.poisonResistancePct != null) {
    lines.push(`Poison Resistance +${effects.poisonResistancePct}%`);
  }
  if (effects.bleedResistancePct != null) {
    lines.push(`Bleed Resistance +${effects.bleedResistancePct}%`);
  }
  if (effects.shieldDefensePct != null) {
    lines.push(`Shield Defense +${effects.shieldDefensePct}%`);
  }
  if (effects.sleepHoldResistancePct != null) {
    lines.push(`Sleep/Hold Resistance +${effects.sleepHoldResistancePct}%`);
  }
  if (effects.castingSpdPct != null) lines.push(`Casting Speed +${effects.castingSpdPct}%`);
  if (effects.pDefPct != null) lines.push(`P.Def +${effects.pDefPct}%`);
  if (effects.stunResistancePct != null) {
    lines.push(`Stun Resistance +${effects.stunResistancePct}%`);
  }
  if (effects.hpRegenPct != null) {
    lines.push(`HP Recovery Bonus +${effects.hpRegenPct}%`);
  }
  if (effects.mpRegenPct != null) {
    lines.push(`MP Recovery Bonus +${effects.mpRegenPct}%`);
  }
  if (effects.speedFlat != null) lines.push(`Speed +${effects.speedFlat}`);
  if (effects.pAtkPct != null) lines.push(`P.Atk +${effects.pAtkPct}%`);
  if (effects.intFlat != null) {
    lines.push(`INT ${effects.intFlat > 0 ? '+' : ''}${effects.intFlat}`);
  }
  if (effects.witFlat != null) {
    lines.push(`WIT ${effects.witFlat > 0 ? '+' : ''}${effects.witFlat}`);
  }
  if (effects.strFlat != null) {
    lines.push(`STR ${effects.strFlat > 0 ? '+' : ''}${effects.strFlat}`);
  }
  if (effects.conFlat != null) {
    lines.push(`CON ${effects.conFlat > 0 ? '+' : ''}${effects.conFlat}`);
  }
  if (effects.dexFlat != null) {
    lines.push(`DEX ${effects.dexFlat > 0 ? '+' : ''}${effects.dexFlat}`);
  }
  return lines;
}
