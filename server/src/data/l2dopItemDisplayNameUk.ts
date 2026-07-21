/**
 * Українські назви предметів для UI, коли в дампі / автогені зламана назва (обрізка до «a.» тощо).
 * Джерело імен: l2dop/lineage.sql items3 (поле назви RU → локалізація для гравця).
 */
export const L2DOP_ITEM_DISPLAY_NAME_UK: Record<number, string> = {
  /** Leather Shield NG (items / droplist id 18). */
  18: 'Шкіряний щит',
  /** items3 lineage.sql — типові дропи з мобів (матеріал / кільце / рецепт) */
  116: 'Магічне кільце',
  1868: 'Нитки',
  2138: 'Рецепт: грубий кістковий порошок',
  /** Свиток: Защита Валакаса (у items eng. назва «Flames» — для UI беремо захист) */
  6652: 'Свиток: Захист Валакаса',
  /** Свиток: Пламя Валакаса */
  6654: 'Свиток: Полум’я Валакаса',
  /** Свиток: Убийство Валакаса — Slay Valakas */
  6655: 'Свиток: Полювання на Валакаса',
};

/** Слот предмета для підказки fallback іконки, якщо id немає в GM gearCatalog (items3). */
export const L2DOP_ITEM_SLOT_HINT: Record<number, string> = {
  18: 'shield',
  116: 'ring',
};

/** Грейд для UI (NG / D / C …), коли id немає лише в GM-каталозі або треба перевизначити. */
export const L2DOP_ITEM_GRADE_UK: Record<number, string> = {
  18: 'NG',
  116: 'NG',
  /** Зброя з ручних рядків у `itemsCatalog.ts` (немає в GM weapons CSV). */
  317: 'D',
  308: 'NG',
  79: 'B',
  151: 'A',
  164: 'A',
  212: 'A',
  289: 'A',
  /** S-grade permanent weapon ids (mergeS overrides GM/Event rows). */
  82: 'S',
  6365: 'S',
  6366: 'S',
  6367: 'S',
  6368: 'S',
  6369: 'S',
  6370: 'S',
  6371: 'S',
  6372: 'S',
  6579: 'S',
  7575: 'S',
  910201: 'S',
  910202: 'S',
  8336: 'B',
  8340: 'B',
  900224: 'C',
  /** C-grade Apprentice's Spellbook — синтетичний id (NG лишається на lineage 99). */
  900225: 'C',
  /** NG Apprentice's Spellbook — lineage id 99 (GM-CSV має C-grade рядок). */
  99: 'NG',
  9009154: 'NG',
};

/**
 * Базові стати з items3 (Interlude), якщо id не в GM-каталозі або треба доповнити.
 * Для кілець/намиста `mAtk` у каталозі = бонус M.Def у бою (як у GM-рядках біжутерії).
 */
export const L2DOP_ITEM_STATS_HINT: Record<
  number,
  { pDef?: number; mAtk?: number }
> = {
  18: { pDef: 20 },
  /** Magic Ring — типово M.Def +5 */
  116: { mAtk: 5 },
};
