/**
 * Якщо ім'я в mapLocalities / спавні не збігається з ключами в каталозі — підставляємо канонічне ім'я з lineage або прямий npcid.
 */
export const L2DOP_MOB_NAME_ALIASES: Record<string, string | number> = {
  /** UA/помилкові написи → RU з l2dop/lineage.sql */
  'Бородатий Шакал': 'Бородатый Шакал',
  Ельпі: 'Молодой Лис',
  'Материй Кельтир': 'Матерый Бурый Шакал',
  Гоблін: 'Гоблин',
  Змій: 'Змей',
  Шершень: 'Жалящая Оса',
  Паук: 'Когтистый Паук',

  /** Англ. назви з mapLocalities (Schuttgart / Rune / Goddard) → ключі l2dopNpcIdByName або RU з lineage */
  'Alpen Kookaburra': 'Kookaburra',
  'Hoarfrost Yeti': 'Frost Yeti',
  'Alpen Cougar': 'Горный Кугуар',
  'Ice Giant': 'Ледяной Гигант',
  'Frost Tarantula Soldier': 'Frost Tarantula',
  /** «Лідер» у мапі — у дампі лише Buffalo Slave (Буйвол Невольник). */
  'Buffalo Slave Leader': 'Buffalo Slave',

  /** Англ. назви епіків / РБ на карті (SPECIAL_SPAWNS) → RU з lineage для npcid і дропу */
  'Queen Ant': 'Королева Муравьев',
  Core: 'Ядро',
  Orfen: 'Орфен',
  Zaken: 'Закен',
  Valakas: 'Валакас',
  Antharas: 'Антарас',
};
