import { parseInventory } from '../data/inventory.js';
import {
  computeCombatStats,
  computeCombatStatsOptionsForCharacter,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { effectiveBattleRunSpeedDisplay } from './battleEffectiveDisplay.js';
import { getEffectiveCharacterLevel } from './effectiveCharacterLevel.js';
import { mapMoveSpeedFromRunSpeed } from './mapMovement.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
} from './worldCombatState.js';
import {
  computeVitals,
} from '../data/l2dopVitals.js';
import type { CharacterRow } from '../services/charTypes.js';

/** runSpeed (як у профілі) → пікселі/с на PNG катакомб. */
const DUNGEON_RUN_SPEED_TO_PX = 0.18;

export interface DungeonMoveSpeedStats {
  runSpeed: number;
  mapMoveSpeed: number;
  mapMoveSpeedPx: number;
}

export function dungeonMapMoveSpeedPxFromRunSpeed(runSpeed: number): number {
  return Math.max(16, Math.floor(runSpeed * DUNGEON_RUN_SPEED_TO_PX));
}

/** Ефективна швидкість бігу зі статів (екіп, бафи, стійки) — як у GET /character. */
export function resolveDungeonMoveSpeedStatsForRow(
  row: CharacterRow,
  nowMs: number = Date.now()
): DungeonMoveSpeedStats {
  const inv = parseInventory(row.inventoryJson);
  const level = getEffectiveCharacterLevel(row.exp);
  const combat = computeCombatStats(
    level,
    row.race,
    row.classBranch,
    inv,
    computeCombatStatsOptionsForCharacter({
      activeBuffsJson: row.activeBuffsJson,
      buffHeroicTier: row.buffHeroicTier,
      buffZealotStacks: row.buffZealotStacks,
      skillsLearnedJson: row.skillsLearnedJson,
      l2Profession: row.l2Profession,
      inventoryJson: row.inventoryJson,
      race: row.race,
      classBranch: row.classBranch,
      worldCombatStateJson: row.worldCombatStateJson,
    })
  );
  const vit = computeVitals(level, row.race, row.classBranch, combat.con, combat.men);
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const worldTicked = tickWorldCombatState(
    parseWorldCombatState(row.worldCombatStateJson),
    maxMp,
    nowMs,
    combat.regenMp
  );
  const runSpeed = effectiveBattleRunSpeedDisplay(
    combat.runSpeed,
    row.battleJson,
    worldTicked?.battleMods
  );
  const mapMoveSpeed = mapMoveSpeedFromRunSpeed(runSpeed);
  return {
    runSpeed,
    mapMoveSpeed,
    mapMoveSpeedPx: dungeonMapMoveSpeedPxFromRunSpeed(runSpeed),
  };
}
