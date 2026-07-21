/**
 * Канонічний каталог комплектів броні (D-grade Interlude).
 * Визначення сетів — через itemId, не через назву.
 */
import { dGradeArmorCatalogRow } from './dGradeArmorCatalog.js';

export type ArmorSetArmorType = 'heavy' | 'light' | 'robe';

export type ArmorSetEffects = {
  maxHpFlat?: number;
  maxMpFlat?: number;
  mAtkPct?: number;
  addCritDmg?: number;
  poisonResistancePct?: number;
  shieldDefensePct?: number;
};

export type ArmorSetStage = {
  requiredCorePieces: number;
  requiresShield?: boolean;
  effects: ArmorSetEffects;
  displayLines: string[];
};

export type ArmorSetDefinition = {
  setId: string;
  name: string;
  grade: string;
  armorType: ArmorSetArmorType;
  corePieceIds: readonly number[];
  optionalShieldId?: number;
  stages: readonly ArmorSetStage[];
};

export const D_KNOWLEDGE_SET: ArmorSetDefinition = {
  setId: 'd_knowledge',
  name: 'Knowledge Set',
  grade: 'D',
  armorType: 'robe',
  corePieceIds: [436, 469, 2447],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { maxMpFlat: 40 },
      displayLines: ['Max MP +40'],
    },
    {
      requiredCorePieces: 3,
      effects: { mAtkPct: 10 },
      displayLines: ['M.Atk +10%'],
    },
  ],
};

export const D_REINFORCED_LEATHER_SET: ArmorSetDefinition = {
  setId: 'd_reinforced_leather',
  name: 'Reinforced Leather Set',
  grade: 'D',
  armorType: 'light',
  corePieceIds: [394, 416, 2422],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { maxMpFlat: 80 },
      displayLines: ['Max MP +80'],
    },
    {
      requiredCorePieces: 3,
      effects: { addCritDmg: 10 },
      displayLines: ['P. Critical Damage +10'],
    },
  ],
};

export const D_MITHRIL_SET: ArmorSetDefinition = {
  setId: 'd_mithril',
  name: 'Mithril Set',
  grade: 'D',
  armorType: 'heavy',
  corePieceIds: [499, 58, 59],
  optionalShieldId: 628,
  stages: [
    {
      requiredCorePieces: 2,
      effects: { maxHpFlat: 126 },
      displayLines: ['Max HP +126'],
    },
    {
      requiredCorePieces: 3,
      effects: { poisonResistancePct: 20 },
      displayLines: ['Poison Resistance +20%'],
    },
    {
      requiredCorePieces: 3,
      requiresShield: true,
      effects: { shieldDefensePct: 2.63 },
      displayLines: ['Shield Defense +2.63%'],
    },
  ],
};

/** Усі D-grade сети з канонічним контрактом Interlude. */
export const D_GRADE_ARMOR_SETS: readonly ArmorSetDefinition[] = [
  D_KNOWLEDGE_SET,
  D_REINFORCED_LEATHER_SET,
  D_MITHRIL_SET,
];

/** itemId → setId для частин, що входять у corePieceIds. */
export const ARMOR_SET_ID_BY_CORE_PIECE: ReadonlyMap<number, string> = (() => {
  const m = new Map<number, string>();
  for (const set of D_GRADE_ARMOR_SETS) {
    for (const id of set.corePieceIds) {
      m.set(id, set.setId);
    }
  }
  return m;
})();

export function armorSetDefinitionById(setId: string): ArmorSetDefinition | undefined {
  return D_GRADE_ARMOR_SETS.find((s) => s.setId === setId);
}

export function armorSetDefinitionForItem(itemId: number): ArmorSetDefinition | undefined {
  const setId = ARMOR_SET_ID_BY_CORE_PIECE.get(Math.floor(itemId));
  return setId ? armorSetDefinitionById(setId) : undefined;
}

export function armorSetPieceName(itemId: number): string {
  const canon = dGradeArmorCatalogRow(itemId);
  if (canon) return canon.name;
  return `Item ${itemId}`;
}
