/**
 * НПС міста для UI (кнопки-дії як у l2dop: npc.php + html/{id}.htm).
 * id — lineage npcid; підписи українською. Розширюйте масиви по містах.
 * Якщо для міста немає запису з посиланням на магістра — у список додається
 * типовий наставник (той самий каталог скілів, що й у Глудіо).
 */

export interface TownNpcActionPayload {
  labelUk: string;
  /** Відкрити сторінку клієнта (відносний шлях). */
  href?: string;
  /** Якщо немає href — показуємо цей текст як заглушку. */
  stubUk?: string;
}

export interface TownNpcPayload {
  l2NpcId: number;
  titleUk: string;
  nameUk: string;
  /** Для заголовка сторінок (наприклад магістр). */
  nameEn: string;
  actions: TownNpcActionPayload[];
}

//==== Town of Gludio (spawn/html узгоджено з l2dop) ====

const GLUDIO_TOWN_NPCS: TownNpcPayload[] = [
  {
    l2NpcId: 30256,
    titleUk: 'Хранитель порталу',
    nameUk: 'Белла',
    nameEn: 'Bella',
    actions: [
      { labelUk: 'Телепорт', href: '/teleport.html' },
      {
        labelUk: 'Обмін кристалів',
        stubUk: 'Обмін «Алмазів Інших Світів» — пізніше.',
      },
      { labelUk: 'Квест', stubUk: 'Квест у НПС — пізніше.' },
    ],
  },
  {
    l2NpcId: 30006,
    titleUk: 'Хранитель порталу',
    nameUk: 'Міллія',
    nameEn: 'Millia',
    actions: [
      { labelUk: 'Телепорт', href: '/teleport.html' },
      {
        labelUk: 'Обмін кристалів',
        stubUk: 'Обмін «Алмазів Інших Світів» — пізніше.',
      },
      { labelUk: 'Квест', stubUk: 'Квест у НПС — пізніше.' },
    ],
  },
  {
    l2NpcId: 30344,
    titleUk: 'Магістр',
    nameUk: 'Ромер',
    nameEn: 'Rohmer',
    actions: [
      { labelUk: 'Вивчити навички', href: '/magister.html?npcId=30344' },
      { labelUk: 'Квест', stubUk: 'Квест у Ромера — пізніше.' },
    ],
  },
  {
    l2NpcId: 30506,
    titleUk: 'Префект',
    nameUk: 'Бука',
    nameEn: 'Buka',
    actions: [
      {
        labelUk: 'Вивчити навички (орк)',
        stubUk: 'Навички орка — окремий каталог, пізніше.',
      },
      { labelUk: 'Квест', stubUk: 'Квест у Буки — пізніше.' },
    ],
  },
  {
    l2NpcId: 30507,
    titleUk: 'Пророк (Seer)',
    nameUk: 'Ракой',
    nameEn: 'Racoy',
    actions: [
      {
        labelUk: 'Вивчити навички (орк)',
        stubUk: 'Навички орка — окремий каталог, пізніше.',
      },
      { labelUk: 'Квест', stubUk: 'Квест у Ракоя — пізніше.' },
    ],
  },
];

const BY_CITY: Record<string, TownNpcPayload[]> = {
  l2dop_gludio: GLUDIO_TOWN_NPCS,
};

/**
 * У будь-якому місті є наставник з умінь (каталог як у Глудіо, без прив’язки до квестів).
 * id 30344 — той самий набір, що й Магістр Ромер у Глудіо.
 */
const DEFAULT_CITY_SKILL_MAGISTER: TownNpcPayload = {
  l2NpcId: 30344,
  titleUk: 'Магістр',
  nameUk: 'Наставник умінь',
  nameEn: 'Skill Trainer',
  actions: [
    { labelUk: 'Вивчити навички', href: '/magister.html?npcId=30344' },
  ],
};

function cityListHasSkillMagister(list: TownNpcPayload[]): boolean {
  return list.some((n) =>
    (n.actions || []).some(
      (a) => a.href && String(a.href).indexOf('magister.html') !== -1
    )
  );
}

export function townNpcEntryById(l2NpcId: number): TownNpcPayload | null {
  for (const list of Object.values(BY_CITY)) {
    const e = list.find((x) => x.l2NpcId === l2NpcId);
    if (e) return e;
  }
  return null;
}

export function townNpcsPayloadForCity(cityId: string): TownNpcPayload[] {
  const id = String(cityId || '').trim();
  const base = BY_CITY[id] ?? [];
  if (cityListHasSkillMagister(base)) return base;
  return [DEFAULT_CITY_SKILL_MAGISTER, ...base];
}
