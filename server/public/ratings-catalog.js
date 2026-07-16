/**
 * Категорії рейтингів (короткі назви для UI).
 */
(function (global) {
  global.L2RatingsCatalog = {
    categories: [
      { id: 'level', labelUk: 'Рівень' },
      { id: 'power', labelUk: 'Сила' },
      { id: 'exp', labelUk: 'Досвід' },
      { id: 'pvp', labelUk: 'PvP' },
      { id: 'pk', labelUk: 'PK' },
      { id: 'bosses', labelUk: 'Боси' },
      { id: 'wealth', labelUk: 'Багатство' },
      { id: 'clans', labelUk: 'Клани', stub: true },
      { id: 'activity', labelUk: 'Активність' },
      { id: 'victories', labelUk: 'Перемоги' },
      { id: 'damage', labelUk: 'Шкода', stub: true },
      { id: 'arena', labelUk: 'Арена', stub: true },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
