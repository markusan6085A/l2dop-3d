import { ELVEN_MYSTIC_SKILL_CATALOG_GENERATED } from './elvenMysticSkillCatalog.generated.js';
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';

const BY_BATTLE_ID = new Map<string, HumanMysticSkillCatalogEntry>();
for (const e of ELVEN_MYSTIC_SKILL_CATALOG_GENERATED) {
  BY_BATTLE_ID.set(e.battleId, e);
}

export function elvenMysticCatalogHasBattleId(battleId: string): boolean {
  return BY_BATTLE_ID.has(canonicalBattleSkillId(battleId));
}

export function elvenMysticCatalogEntry(
  battleId: string
): HumanMysticSkillCatalogEntry | undefined {
  return BY_BATTLE_ID.get(canonicalBattleSkillId(battleId));
}
