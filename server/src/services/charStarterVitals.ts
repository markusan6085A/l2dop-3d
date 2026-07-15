import type { InventoryState } from '../data/inventory.js';
import {
  computeCombatStats,
  computeCombatStatsOptionsForCharacter,
  effectiveMaxHpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';

/** Стартовий рівень нового героя (register). */
export const NEW_CHARACTER_LEVEL = 1;

/**
 * HP/maxHp для нового персонажа — з формул (computeVitals), не з Prisma @default(100).
 */
export function computeStarterVitalsForNewCharacter(input: {
  race: string;
  classBranch: string;
  l2Profession: string;
  inventory: InventoryState;
  skillsLearnedJson?: unknown;
}): { hp: number; maxHp: number } {
  const combat = computeCombatStats(
    NEW_CHARACTER_LEVEL,
    input.race,
    input.classBranch,
    input.inventory,
    computeCombatStatsOptionsForCharacter({
      activeBuffsJson: null,
      buffHeroicTier: null,
      buffZealotStacks: null,
      skillsLearnedJson: input.skillsLearnedJson ?? null,
      l2Profession: input.l2Profession,
      inventoryJson: input.inventory,
      race: input.race,
      classBranch: input.classBranch,
    })
  );
  const vit = computeVitals(
    NEW_CHARACTER_LEVEL,
    input.race,
    input.classBranch,
    combat.con,
    combat.men
  );
  const maxHp = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  return { hp: maxHp, maxHp };
}
