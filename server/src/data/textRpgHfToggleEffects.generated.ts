/* eslint-disable */
/**
 * Автоген: node server/scripts/gen-text-rpg-hf-toggle-effects.mjs
 * Тогли HumanFighter з text-rpg.
 */

export type TextRpgHfToggleEffectMod = {
  readonly stat: string;
  readonly mode: 'percent' | 'flat' | 'multiplier';
  readonly value?: number;
};

export type TextRpgHfToggleRow = {
  readonly l2SkillId: number;
  readonly maxLevel: number;
  readonly effects: readonly TextRpgHfToggleEffectMod[];
  readonly powerByLevel: readonly number[];
};

export const TEXT_RPG_HF_TOGGLE_EFFECTS: readonly TextRpgHfToggleRow[] = [
  {
    l2SkillId: 256,
    maxLevel: 1,
    effects: [{"stat":"accuracy","mode":"flat"}] as const,
    powerByLevel: [0,3] as const,
  },
  {
    l2SkillId: 312,
    maxLevel: 20,
    effects: [{"stat":"critRate","mode":"percent"},{"stat":"critDamage","mode":"percent"},{"stat":"critDamage","mode":"flat"}] as const,
    powerByLevel: [0,35,48,64,84,109,139,166,196,229,266,306,349,379,410,443,475,509,542,576,609] as const,
  },
  {
    l2SkillId: 339,
    maxLevel: 1,
    effects: [{"stat":"pDef","mode":"percent","value":25},{"stat":"mDef","mode":"percent","value":25},{"stat":"atkSpeed","mode":"percent","value":-20},{"stat":"accuracy","mode":"flat","value":-4}] as const,
    powerByLevel: [0,0] as const,
  },
] as const;
