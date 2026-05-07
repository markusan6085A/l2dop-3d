/**
 * Каталог орка-шамана (Orc Mystic) — text-rpg `OrcShaman/**` та гілки.
 * Регенерація: `npm run gen:om-skills`.
 */
import {
  ORC_MYSTIC_ACTIVE_L2_IDS,
  ORC_MYSTIC_SKILL_CATALOG_GENERATED,
} from './orcMysticSkillCatalog.generated.js';

export { ORC_MYSTIC_SKILL_CATALOG_GENERATED } from './orcMysticSkillCatalog.generated.js';
export {
  orcMysticCatalogEntry,
  orcMysticCatalogHasBattleId,
} from './orcMysticSkillCatalog.lookup.js';

/** Усі l2 id (включно з пасивками) — для `normalizeClientBattleAction`. */
export const ORC_MYSTIC_ALL_L2_IDS: ReadonlySet<number> = new Set(
  ORC_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.l2SkillId)
);

export const ORC_MYSTIC_ACTIVE_L2_ID_SET: ReadonlySet<number> = new Set(
  ORC_MYSTIC_ACTIVE_L2_IDS
);
