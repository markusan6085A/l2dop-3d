import { CANONICAL_L2_SKILL_TO_BATTLE_ACTION } from '../data/humanFighterSkillCatalog.js';
import {
  ELVEN_MYSTIC_ALL_L2_IDS,
} from '../data/elvenMysticSkillCatalog.js';
import {
  DARK_MYSTIC_ALL_L2_IDS,
} from '../data/darkMysticSkillCatalog.js';
import {
  ORC_MYSTIC_ALL_L2_IDS,
} from '../data/orcMysticSkillCatalog.js';
import {
  HUMAN_MYSTIC_ALL_L2_IDS,
} from '../data/humanMysticSkillCatalog.js';
import { ORC_FIGHTER_ACTIVE_L2_IDS } from '../data/orcFighterSkillCatalog.generated.js';
import { ELVEN_FIGHTER_ACTIVE_L2_IDS } from '../data/elvenFighterSkillCatalog.generated.js';
import { DARK_FIGHTER_ACTIVE_L2_IDS } from '../data/darkFighterSkillCatalog.generated.js';
import { DWARF_FIGHTER_ACTIVE_L2_IDS } from '../data/dwarfFighterSkillCatalog.generated.js';

/** Активні бойові `l2_*` расових воїнів (Orc/Elf/Dark Elf/Dwarf) — дозвіл POST /battle/action. */
export const RACE_FIGHTER_ACTIVE_L2_ID_SET = new Set<number>([
  ...ORC_FIGHTER_ACTIVE_L2_IDS,
  ...ELVEN_FIGHTER_ACTIVE_L2_IDS,
  ...DARK_FIGHTER_ACTIVE_L2_IDS,
  ...DWARF_FIGHTER_ACTIVE_L2_IDS,
]);

export function raceFighterL2ActionAllowed(actionNorm: string): boolean {
  const mysticId = /^l2_(\d+)$/.exec(actionNorm);
  if (!mysticId) return false;
  return RACE_FIGHTER_ACTIVE_L2_ID_SET.has(Number(mysticId[1]));
}

/** Клієнт / хотбар інколи шлють `l2_256` замість `accuracy_stance` — узгоджуємо з каталогом. */
export function normalizeClientBattleAction(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  const mysticId = /^l2_(\d+)$/.exec(t);
  if (mysticId) {
    const id = Number(mysticId[1]);
    if (
      HUMAN_MYSTIC_ALL_L2_IDS.has(id) ||
      ELVEN_MYSTIC_ALL_L2_IDS.has(id) ||
      DARK_MYSTIC_ALL_L2_IDS.has(id) ||
      ORC_MYSTIC_ALL_L2_IDS.has(id) ||
      RACE_FIGHTER_ACTIVE_L2_ID_SET.has(id)
    ) {
      return t;
    }
  }
  const mapped =
    CANONICAL_L2_SKILL_TO_BATTLE_ACTION[
      t as keyof typeof CANONICAL_L2_SKILL_TO_BATTLE_ACTION
    ];
  return mapped ?? t;
}
