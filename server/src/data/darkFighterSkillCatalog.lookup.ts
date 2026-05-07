import { DARK_FIGHTER_SKILL_CATALOG_GENERATED } from './darkFighterSkillCatalog.generated.js';
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';

const BY_BATTLE_ID = new Map<string, HumanMysticSkillCatalogEntry>();
for (const e of DARK_FIGHTER_SKILL_CATALOG_GENERATED) {
  BY_BATTLE_ID.set(e.battleId, e);
}

export function darkFighterCatalogHasBattleId(battleId: string): boolean {
  return BY_BATTLE_ID.has(canonicalBattleSkillId(battleId));
}

export function darkFighterCatalogEntry(
  battleId: string
): HumanMysticSkillCatalogEntry | undefined {
  return BY_BATTLE_ID.get(canonicalBattleSkillId(battleId));
}
