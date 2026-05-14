/**
 * Скіли крафту / книг рецептів — не входять до бойового майстра l2dop-3d (крафт окремо).
 */

/** У каталогах містика (усі раси) id 172 = «Ремесло» / Common Craft (однаковий skill id у text-rpg). */
export const EXCLUDE_FROM_MYSTIC_MAGISTER_CATALOG = new Set([172]);

/**
 * Elf / Dark elf у common папці — Common Craft (id 172).
 * 1320 — Create Common Item (крафт L2), не використовується в l2dop-3d.
 * У гнома той самий numeric id 172 у text-rpg — це **Create Item**, тому 172 тут НЕ виключаємо.
 */
export const EXCLUDE_COMMON_CRAFT_FROM_ELVEN_AND_DARK_FIGHTER = new Set([172, 1320]);

/** DwarvenFighter: крафт-книги / Create Common Item / Expand Craft тощо — без бойового крафту тут. */
export const EXCLUDE_DWARF_ONLY_CRAFT_BOOK_SKILLS = new Set([1320, 1322, 1368]);
