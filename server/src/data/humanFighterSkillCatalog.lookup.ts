import { HUMAN_FIGHTER_SKILL_CATALOG } from './humanFighterSkillCatalog.entries.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import type { HumanFighterSkillCatalogEntry } from './humanFighterSkillCatalog.types.js';
import { HUMAN_FIGHTER_L2_COOLDOWN_SEC } from './humanFighterSkillCooldowns.generated.js';

const CATALOG_BY_BATTLE_ID = new Map(
  HUMAN_FIGHTER_SKILL_CATALOG.map((e) => [e.battleId, e])
);

export function humanFighterCatalogEntry(
  battleId: string
): HumanFighterSkillCatalogEntry | undefined {
  const e = CATALOG_BY_BATTLE_ID.get(canonicalBattleSkillId(battleId));
  if (!e) return undefined;
  const fromGen = HUMAN_FIGHTER_L2_COOLDOWN_SEC[e.l2SkillId];
  const genSec =
    typeof fromGen === 'number' && fromGen > 0 ? fromGen : undefined;
  const entrySec =
    typeof e.cooldownSec === 'number' && e.cooldownSec > 0
      ? e.cooldownSec
      : undefined;
  const cooldownSec = entrySec ?? genSec;
  if (cooldownSec === undefined) return e;
  if (entrySec === cooldownSec) return e;
  return { ...e, cooldownSec };
}

export function humanFighterCatalogHasBattleId(battleId: string): boolean {
  return CATALOG_BY_BATTLE_ID.has(canonicalBattleSkillId(battleId));
}
