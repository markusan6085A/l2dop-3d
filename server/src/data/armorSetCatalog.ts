/**
 * Канонічний каталог комплектів броні (D/C/B/A-grade Interlude).
 * Визначення сетів — через itemId, не через назву.
 * Спільні частини (шоломи) — many-to-many через ARMOR_SET_IDS_BY_*.
 */
import { gradeArmorCatalogRow } from './gradeArmorCatalog.js';
import {
  APELLA_LIGHT_PVP_SPEED_DEBUFF_CHANCE_PCT,
  APELLA_LIGHT_PVP_SPEED_DEBUFF_EFFECT_ID,
  APELLA_LIGHT_PVP_SPEED_DEBUFF_SKILL_ID,
} from './armorSetApellaPvpMetadata.js';

export type ArmorSetArmorType = 'heavy' | 'light' | 'robe';

export type ArmorSetEffects = {
  maxHpFlat?: number;
  maxMpFlat?: number;
  mAtkPct?: number;
  addCritDmg?: number;
  poisonResistancePct?: number;
  bleedResistancePct?: number;
  shieldDefensePct?: number;
  sleepHoldResistancePct?: number;
  castingSpdPct?: number;
  pDefPct?: number;
  stunResistancePct?: number;
  hpRegenPct?: number;
  mpRegenPct?: number;
  speedFlat?: number;
  pAtkPct?: number;
  intFlat?: number;
  witFlat?: number;
  strFlat?: number;
  conFlat?: number;
  dexFlat?: number;
  menFlat?: number;
  maxCpFlat?: number;
  cpRegenPct?: number;
  healingReceivedPct?: number;
  paralysisResistancePct?: number;
  shieldBlockRateMul?: number;
  pvpDeathExpPenaltyReductionPct?: number;
  pvpAttackerSpeedDebuffChancePct?: number;
  pvpAttackerSpeedDebuffSkillId?: number;
  pvpAttackerSpeedDebuffEffectId?: number;
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

export const C_KARMIAN_SET: ArmorSetDefinition = {
  setId: 'c_karmian',
  name: 'Karmian Set',
  grade: 'C',
  armorType: 'robe',
  corePieceIds: [439, 471, 2454],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { sleepHoldResistancePct: 20 },
      displayLines: ['Sleep/Hold Resistance +20%'],
    },
    {
      requiredCorePieces: 3,
      effects: { castingSpdPct: 15, pDefPct: 5.26 },
      displayLines: ['Casting Speed +15%', 'P.Def +5.26%'],
    },
  ],
};

export const C_DEMON_SET: ArmorSetDefinition = {
  setId: 'c_demon',
  name: "Demon's Set",
  grade: 'C',
  armorType: 'robe',
  corePieceIds: [441, 472, 2459],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { stunResistancePct: 10 },
      displayLines: ['Stun Resistance +10%'],
    },
    {
      requiredCorePieces: 3,
      effects: { intFlat: 4, witFlat: -1, maxHpFlat: -270 },
      displayLines: ['INT +4', 'WIT -1', 'Max HP -270'],
    },
  ],
};

export const C_PLATED_LEATHER_SET: ArmorSetDefinition = {
  setId: 'c_plated_leather',
  name: 'Plated Leather Set',
  grade: 'C',
  armorType: 'light',
  corePieceIds: [398, 418, 2431],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { sleepHoldResistancePct: 20 },
      displayLines: ['Sleep/Hold Resistance +20%'],
    },
    {
      requiredCorePieces: 3,
      effects: { strFlat: 4, conFlat: -1 },
      displayLines: ['STR +4', 'CON -1'],
    },
  ],
};

/** Усі C-grade staged-сети. */
export const C_GRADE_ARMOR_SETS: readonly ArmorSetDefinition[] = [
  C_KARMIAN_SET,
  C_DEMON_SET,
  C_PLATED_LEATHER_SET,
];

export const B_AVADON_ROBE_SET: ArmorSetDefinition = {
  setId: 'b_avadon_robe',
  name: 'Avadon Robe Set',
  grade: 'B',
  armorType: 'robe',
  corePieceIds: [30002, 30001, 30003, 30004],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { poisonResistancePct: 60, bleedResistancePct: 60 },
      displayLines: ['Poison Resistance +60%', 'Bleed Resistance +60%'],
    },
    {
      requiredCorePieces: 3,
      effects: { pDefPct: 5.26 },
      displayLines: ['P.Def +5.26%'],
    },
    {
      requiredCorePieces: 4,
      effects: { castingSpdPct: 15 },
      displayLines: ['Casting Speed +15%'],
    },
  ],
};

export const B_BLUE_WOLF_HEAVY_SET: ArmorSetDefinition = {
  setId: 'b_blue_wolf_heavy',
  name: 'Blue Wolf Heavy Armor Set',
  grade: 'B',
  armorType: 'heavy',
  corePieceIds: [358, 2380, 2416, 2487, 2439],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { hpRegenPct: 5.24 },
      displayLines: ['HP Recovery Bonus +5.24%'],
    },
    {
      requiredCorePieces: 3,
      effects: { speedFlat: 7 },
      displayLines: ['Speed +7'],
    },
    {
      requiredCorePieces: 4,
      effects: { stunResistancePct: 30 },
      displayLines: ['Stun Resistance +30%'],
    },
    {
      requiredCorePieces: 5,
      effects: { strFlat: 3, conFlat: -1, dexFlat: -2 },
      displayLines: ['STR +3', 'CON -1', 'DEX -2'],
    },
  ],
};

export const B_DOOM_LIGHT_SET: ArmorSetDefinition = {
  setId: 'b_doom_light',
  name: 'Doom Light Armor Set',
  grade: 'B',
  armorType: 'light',
  corePieceIds: [30009, 30008, 30010, 30011],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { mpRegenPct: 5.26 },
      displayLines: ['MP Recovery Bonus +5.26%'],
    },
    {
      requiredCorePieces: 3,
      effects: { pAtkPct: 2.7 },
      displayLines: ['P.Atk +2.7%'],
    },
    {
      requiredCorePieces: 4,
      effects: { dexFlat: 3, sleepHoldResistancePct: 50 },
      displayLines: ['DEX +3', 'Sleep/Hold Resistance +50%'],
    },
  ],
};

/** Усі B-grade staged-сети. */
export const B_GRADE_ARMOR_SETS: readonly ArmorSetDefinition[] = [
  B_AVADON_ROBE_SET,
  B_BLUE_WOLF_HEAVY_SET,
  B_DOOM_LIGHT_SET,
];

export const A_APELLA_LIGHT_SET: ArmorSetDefinition = {
  setId: 'a_apella_light',
  name: 'Apella Light Armor Set',
  grade: 'A',
  armorType: 'light',
  corePieceIds: [7860, 7864, 7865, 7866],
  stages: [
    {
      requiredCorePieces: 4,
      effects: {
        maxCpFlat: 195,
        cpRegenPct: 40,
        pvpDeathExpPenaltyReductionPct: 10,
        pvpAttackerSpeedDebuffChancePct: APELLA_LIGHT_PVP_SPEED_DEBUFF_CHANCE_PCT,
        pvpAttackerSpeedDebuffSkillId: APELLA_LIGHT_PVP_SPEED_DEBUFF_SKILL_ID,
        pvpAttackerSpeedDebuffEffectId: APELLA_LIGHT_PVP_SPEED_DEBUFF_EFFECT_ID,
      },
      displayLines: [
        'Max CP +195',
        'CP Recovery Bonus +40%',
        'PvP death EXP penalty reduced by 10%',
        '20% chance to cast a Speed reduction curse on the attacking player',
      ],
    },
  ],
};

export const A_DARK_CRYSTAL_HEAVY_SET: ArmorSetDefinition = {
  setId: 'a_dark_crystal_heavy',
  name: 'Dark Crystal Heavy Armor Set',
  grade: 'A',
  armorType: 'heavy',
  corePieceIds: [512, 365, 388, 2472, 563],
  optionalShieldId: 641,
  stages: [
    {
      requiredCorePieces: 2,
      effects: { hpRegenPct: 5.24 },
      displayLines: ['HP Recovery Bonus +5.24%'],
    },
    {
      requiredCorePieces: 3,
      effects: { healingReceivedPct: 4 },
      displayLines: ['Healing Received +4%'],
    },
    {
      requiredCorePieces: 4,
      effects: { paralysisResistancePct: 50 },
      displayLines: ['Paralysis Resistance +50%'],
    },
    {
      requiredCorePieces: 5,
      effects: { strFlat: -2, conFlat: 2, maxHpFlat: 238 },
      displayLines: ['STR -2', 'CON +2', 'Max HP +238'],
    },
    {
      requiredCorePieces: 5,
      requiresShield: true,
      effects: { shieldBlockRateMul: 1.24 },
      displayLines: ['Shield Block Rate +24%'],
    },
  ],
};

export const A_MAJESTIC_ROBE_SET: ArmorSetDefinition = {
  setId: 'a_majestic_robe',
  name: 'Majestic Robe Set',
  grade: 'A',
  armorType: 'robe',
  corePieceIds: [2419, 2409, 2482, 583],
  stages: [
    {
      requiredCorePieces: 2,
      effects: { mpRegenPct: 8 },
      displayLines: ['MP Recovery Bonus +8%'],
    },
    {
      requiredCorePieces: 3,
      effects: { menFlat: 1, intFlat: -1, maxMpFlat: 240 },
      displayLines: ['MEN +1', 'INT -1', 'Max MP +240'],
    },
    {
      requiredCorePieces: 4,
      effects: { castingSpdPct: 15, stunResistancePct: 50 },
      displayLines: ['Casting Speed +15%', 'Stun Resistance +50%'],
    },
  ],
};

/** Усі A-grade staged-сети. */
export const A_GRADE_ARMOR_SETS: readonly ArmorSetDefinition[] = [
  A_APELLA_LIGHT_SET,
  A_DARK_CRYSTAL_HEAVY_SET,
  A_MAJESTIC_ROBE_SET,
];

/** Усі staged-сети (D + C + B + A). */
export const ALL_ARMOR_SETS: readonly ArmorSetDefinition[] = [
  ...D_GRADE_ARMOR_SETS,
  ...C_GRADE_ARMOR_SETS,
  ...B_GRADE_ARMOR_SETS,
  ...A_GRADE_ARMOR_SETS,
];

export type ArmorSetItemRole = 'core' | 'optionalShield';

/** itemId → setId[] для core pieces (many-to-many). */
export const ARMOR_SET_IDS_BY_CORE_PIECE: ReadonlyMap<number, readonly string[]> = (() => {
  const m = new Map<number, string[]>();
  for (const set of ALL_ARMOR_SETS) {
    for (const id of set.corePieceIds) {
      const prev = m.get(id) ?? [];
      if (!prev.includes(set.setId)) {
        m.set(id, [...prev, set.setId]);
      }
    }
  }
  return m;
})();

/** itemId → setId[] для optionalShieldId (many-to-many). */
export const ARMOR_SET_IDS_BY_OPTIONAL_SHIELD: ReadonlyMap<number, readonly string[]> = (() => {
  const m = new Map<number, string[]>();
  for (const set of ALL_ARMOR_SETS) {
    if (set.optionalShieldId != null) {
      const id = set.optionalShieldId;
      const prev = m.get(id) ?? [];
      if (!prev.includes(set.setId)) {
        m.set(id, [...prev, set.setId]);
      }
    }
  }
  return m;
})();

/** @deprecated Single-set map; use armorSetIdsForCorePiece. */
export const ARMOR_SET_ID_BY_CORE_PIECE: ReadonlyMap<number, string> = (() => {
  const m = new Map<number, string>();
  for (const [id, setIds] of ARMOR_SET_IDS_BY_CORE_PIECE) {
    if (setIds[0]) m.set(id, setIds[0]);
  }
  return m;
})();

/** @deprecated Single-set map; use armorSetIdsForOptionalShield. */
export const ARMOR_SET_ID_BY_OPTIONAL_SHIELD: ReadonlyMap<number, string> = (() => {
  const m = new Map<number, string>();
  for (const [id, setIds] of ARMOR_SET_IDS_BY_OPTIONAL_SHIELD) {
    if (setIds[0]) m.set(id, setIds[0]);
  }
  return m;
})();

export function armorSetIdsForCorePiece(itemId: number): readonly string[] {
  return ARMOR_SET_IDS_BY_CORE_PIECE.get(Math.floor(itemId)) ?? [];
}

export function armorSetIdsForOptionalShield(itemId: number): readonly string[] {
  return ARMOR_SET_IDS_BY_OPTIONAL_SHIELD.get(Math.floor(itemId)) ?? [];
}

export function getArmorSetsForItem(itemId: number): ArmorSetDefinition[] {
  const id = Math.floor(itemId);
  const setIds = new Set<string>();
  for (const sid of armorSetIdsForCorePiece(id)) setIds.add(sid);
  for (const sid of armorSetIdsForOptionalShield(id)) setIds.add(sid);
  return [...setIds]
    .map((sid) => armorSetDefinitionById(sid))
    .filter((s): s is ArmorSetDefinition => s != null);
}

export function armorSetDefinitionById(setId: string): ArmorSetDefinition | undefined {
  return ALL_ARMOR_SETS.find((s) => s.setId === setId);
}

export function armorSetDefinitionForItem(itemId: number): ArmorSetDefinition | undefined {
  const sets = getArmorSetsForItem(itemId);
  return sets[0];
}

export function armorSetItemRoleForItemInSet(
  itemId: number,
  setId: string
): ArmorSetItemRole | null {
  const id = Math.floor(itemId);
  const set = armorSetDefinitionById(setId);
  if (!set) return null;
  if (set.corePieceIds.includes(id)) return 'core';
  if (set.optionalShieldId === id) return 'optionalShield';
  return null;
}

export function armorSetItemRoleForItem(itemId: number): ArmorSetItemRole | null {
  const id = Math.floor(itemId);
  if (armorSetIdsForCorePiece(id).length > 0) return 'core';
  if (armorSetIdsForOptionalShield(id).length > 0) return 'optionalShield';
  return null;
}

export function armorSetPieceName(itemId: number): string {
  const canon = gradeArmorCatalogRow(itemId);
  if (canon) return canon.name;
  return `Item ${itemId}`;
}
