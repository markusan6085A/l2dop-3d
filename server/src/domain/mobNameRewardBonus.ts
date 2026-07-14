import { L2DOP_MOB_NAME_ALIASES } from '../data/l2dopNpcNameAliases.js';

/** Локальні синоніми для таблиці бонусів (скорочені назви з запиту автора). */
const REWARD_NAME_ALIASES: Record<string, string> = {
  'Матерый Бурый': 'Матерый Бурый Шакал',
  Arachnid: 'Arachnid Predator',
};

/**
 * Бонус EXP / SP / адени за ім'ям моба (множиться з чемпіонським ×10, якщо є).
 * Ключі — канонічні імена з mapLocalities / lineage.
 */
const REWARD_MULT_BY_MOB_NAME: Record<string, number> = {
  // ×2
  'Бородатый Шакал': 2,
  'Матерый Бурый Шакал': 2,
  Гоблин: 2,
  'Орк Стрелок': 2,
  Dryad: 2,
  'Arachnid Predator': 2,
  'Ant Warrior': 2,

  // ×3
  'Ol Mahum Support': 3,
  'Turek Orc Warlord': 3,
  'Ant Larva': 3,
  'Lesser Basilisk': 3,
  'Imp Elder': 3,

  // ×4
  Гризли: 4,
  'Goblin Raider': 4,
  'Молодой Шакал': 4,
};

function canonicalMobNameForReward(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const local = REWARD_NAME_ALIASES[trimmed];
  if (local) return local;

  const alias = L2DOP_MOB_NAME_ALIASES[trimmed];
  if (typeof alias === 'string') return alias;

  return trimmed;
}

/** Множник нагороди (1 = без бонусу). */
export function mobNameRewardMult(mobName: string | undefined | null): number {
  const canon = canonicalMobNameForReward(String(mobName ?? ''));
  if (!canon) return 1;
  const mult = REWARD_MULT_BY_MOB_NAME[canon];
  return typeof mult === 'number' && mult > 0 ? mult : 1;
}
