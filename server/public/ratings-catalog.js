/**
 * Категорії рейтингів (підписи для UI).
 */
(function (global) {
  global.L2RatingsCatalog = {
    categories: [
      {
        id: 'level',
        labelUk: 'Рівень',
        hintUk: 'гравці з найвищим рівнем і EXP',
      },
      {
        id: 'power',
        labelUk: 'Бойова сила',
        hintUk: 'загальна сила персонажа за статами та екіпіруванням',
      },
      {
        id: 'pvp',
        labelUk: 'PvP',
        hintUk: 'кількість перемог над іншими гравцями',
      },
      {
        id: 'pk',
        labelUk: 'PK',
        hintUk: 'кількість убивств гравців без дозволеного PvP',
      },
      {
        id: 'raid_boss',
        labelUk: 'Рейд-боси',
        hintUk: 'кількість убитих Raid Boss або завдана їм шкода',
      },
      {
        id: 'wealth',
        labelUk: 'Багатство',
        hintUk: 'кількість Adena',
      },
      {
        id: 'clans',
        labelUk: 'Клани',
        hintUk: 'рейтинг кланів за очками, рівнем і перемогами',
        stub: true,
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
