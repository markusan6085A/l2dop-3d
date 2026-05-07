/**
 * Каталог ельфа-мага (Elven Mystic) — text-rpg `ElvenMystic/**`.
 * Регенерація: `npm run gen:em-skills`.
 */
import {
  ELVEN_MYSTIC_ACTIVE_L2_IDS,
  ELVEN_MYSTIC_SKILL_CATALOG_GENERATED,
} from './elvenMysticSkillCatalog.generated.js';

export { ELVEN_MYSTIC_SKILL_CATALOG_GENERATED } from './elvenMysticSkillCatalog.generated.js';
export {
  elvenMysticCatalogEntry,
  elvenMysticCatalogHasBattleId,
} from './elvenMysticSkillCatalog.lookup.js';

/** Усі l2 id (включно з пасивками) — для `normalizeClientBattleAction`. */
export const ELVEN_MYSTIC_ALL_L2_IDS: ReadonlySet<number> = new Set(
  ELVEN_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.l2SkillId)
);

export const ELVEN_MYSTIC_ACTIVE_L2_ID_SET: ReadonlySet<number> = new Set(
  ELVEN_MYSTIC_ACTIVE_L2_IDS
);
