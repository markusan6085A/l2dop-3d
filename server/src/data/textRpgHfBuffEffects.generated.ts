/* eslint-disable */
/**
 * Автоген: node server/scripts/gen-text-rpg-hf-buff-effects.mjs
 * Дані з text-rpg HumanFighter (бафи: effects + power по рівню).
 */

export type TextRpgHfBuffEffectMod = {
  readonly stat: string;
  readonly mode: 'percent' | 'flat' | 'multiplier';
};

export type TextRpgHfBuffRow = {
  readonly l2SkillId: number;
  readonly maxLevel: number;
  readonly effects: readonly TextRpgHfBuffEffectMod[];
  /** Індекс = рівень скіла (як у L2); 0 не використовується. */
  readonly powerByLevel: readonly number[];
};

export const TEXT_RPG_HF_BUFF_EFFECTS: readonly TextRpgHfBuffRow[] = [
  {
    l2SkillId: 4,
    maxLevel: 2,
    effects: [{"stat":"runSpeed","mode":"flat"}] as const,
    powerByLevel: [0,40,66] as const,
  },
  {
    l2SkillId: 44,
    maxLevel: 3,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,3,7,9] as const,
  },
  {
    l2SkillId: 72,
    maxLevel: 3,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,15,23,30] as const,
  },
  {
    l2SkillId: 75,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,30] as const,
  },
  {
    l2SkillId: 78,
    maxLevel: 2,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,20,25] as const,
  },
  {
    l2SkillId: 80,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,30] as const,
  },
  {
    l2SkillId: 82,
    maxLevel: 3,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,7,11,15] as const,
  },
  {
    l2SkillId: 86,
    maxLevel: 3,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,10,15,20] as const,
  },
  {
    l2SkillId: 87,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,30] as const,
  },
  {
    l2SkillId: 88,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,30] as const,
  },
  {
    l2SkillId: 99,
    maxLevel: 1,
    effects: [{"stat":"atkSpeed","mode":"multiplier"}] as const,
    /** Один ранг у грі = сила Hawkeye (×1.12); Rogue L1 не дублюємо окремим рангом. */
    powerByLevel: [0,1.12] as const,
  },
  {
    l2SkillId: 104,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,30] as const,
  },
  {
    l2SkillId: 110,
    maxLevel: 2,
    effects: [{"stat":"invulnerable","mode":"flat"}] as const,
    powerByLevel: [0,1800,3600] as const,
  },
  {
    l2SkillId: 111,
    maxLevel: 2,
    effects: [{"stat":"pAtk","mode":"flat"}] as const,
    powerByLevel: [0,0,25] as const,
  },
  {
    l2SkillId: 112,
    maxLevel: 2,
    effects: [{"stat":"pDef","mode":"percent"}] as const,
    powerByLevel: [0,16,19] as const,
  },
  {
    l2SkillId: 121,
    maxLevel: 6,
    effects: [{"stat":"maxHp","mode":"percent"}] as const,
    powerByLevel: [0,10,15,20,25,30,35] as const,
  },
  {
    l2SkillId: 130,
    maxLevel: 2,
    effects: [{"stat":"atkSpeed","mode":"percent"}] as const,
    powerByLevel: [0,5,10] as const,
  },
  {
    l2SkillId: 287,
    maxLevel: 3,
    effects: [{"stat":"stunResist","mode":"percent"},{"stat":"sleepResist","mode":"percent"},{"stat":"holdResist","mode":"percent"},{"stat":"mentalResist","mode":"percent"},{"stat":"mDef","mode":"percent"}] as const,
    powerByLevel: [0,60,80,0] as const,
  },
  {
    l2SkillId: 297,
    maxLevel: 2,
    effects: [{"stat":"atkSpeed","mode":"percent"}] as const,
    powerByLevel: [0,8,12] as const,
  },
  {
    l2SkillId: 313,
    maxLevel: 8,
    effects: [{"stat":"pAtk","mode":"flat"},{"stat":"accuracy","mode":"flat"}] as const,
    powerByLevel: [0,124,134,145,155,166,177,188,199] as const,
  },
  {
    l2SkillId: 317,
    maxLevel: 5,
    effects: [{"stat":"critDamage","mode":"percent"}] as const,
    powerByLevel: [0,10,15,20,25,30] as const,
  },
  {
    l2SkillId: 341,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,0] as const,
  },
  {
    l2SkillId: 350,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,0] as const,
  },
  {
    l2SkillId: 356,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,20] as const,
  },
  {
    l2SkillId: 357,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,20] as const,
  },
  {
    l2SkillId: 359,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,30] as const,
  },
  {
    l2SkillId: 360,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,30] as const,
  },
  {
    l2SkillId: 368,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"flat"}] as const,
    powerByLevel: [0,3994] as const,
  },
  {
    l2SkillId: 406,
    maxLevel: 3,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,10,20,30] as const,
  },
  {
    l2SkillId: 426,
    maxLevel: 1,
    effects: [{"stat":"pAtk","mode":"percent"}] as const,
    powerByLevel: [0,0] as const,
  },
  {
    l2SkillId: 451,
    maxLevel: 2,
    effects: [{"stat":"runSpeed","mode":"flat"}] as const,
    powerByLevel: [0,40,66] as const,
  },
] as const;
