/**
 * Каталог темного ельфа-мага (Dark Mystic) — text-rpg `DarkMystic/**`.
 * Регенерація: `npm run gen:dm-skills`.
 */
import {
  DARK_MYSTIC_ACTIVE_L2_IDS,
  DARK_MYSTIC_SKILL_CATALOG_GENERATED,
} from './darkMysticSkillCatalog.generated.js';

export { DARK_MYSTIC_SKILL_CATALOG_GENERATED } from './darkMysticSkillCatalog.generated.js';
export {
  darkMysticCatalogEntry,
  darkMysticCatalogHasBattleId,
} from './darkMysticSkillCatalog.lookup.js';

/** Усі l2 id (включно з пасивками) — для `normalizeClientBattleAction`. */
export const DARK_MYSTIC_ALL_L2_IDS: ReadonlySet<number> = new Set(
  DARK_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.l2SkillId)
);

export const DARK_MYSTIC_ACTIVE_L2_ID_SET: ReadonlySet<number> = new Set(
  DARK_MYSTIC_ACTIVE_L2_IDS
);
