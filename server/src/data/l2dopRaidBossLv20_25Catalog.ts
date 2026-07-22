/** Перші 15 світових РБ 20–25 lvl: канонічні стати, EXP/SP, українські назви. Без предметного дропу та адени. */
export interface RaidBossLv20_25Spec {
  npcId: number;
  /** Стабільний spawn id (`l2dop_rb_{npcId}`). */
  spawnId: string;
  nameUk: string;
  level: number;
  maxHp: number;
  pAtk: number;
  mAtk: number;
  pDef: number;
  mDef: number;
  exp: number;
  sp: number;
}

export const RB_LV20_25_BOSSES: readonly RaidBossLv20_25Spec[] = [
  {
    npcId: 25378,
    spawnId: 'l2dop_rb_25378',
    nameUk: 'Звір Безумства',
    level: 20,
    maxHp: 87696,
    pAtk: 30,
    mAtk: 2,
    pDef: 283,
    mDef: 307,
    exp: 436632,
    sp: 37265,
  },
  {
    npcId: 25375,
    spawnId: 'l2dop_rb_25375',
    nameUk: 'Повелитель Зомбі Фаракелсус',
    level: 20,
    maxHp: 87696,
    pAtk: 30,
    mAtk: 2,
    pDef: 283,
    mDef: 307,
    exp: 436632,
    sp: 37265,
  },
  {
    npcId: 25372,
    spawnId: 'l2dop_rb_25372',
    nameUk: 'Відкинутий Страж',
    level: 20,
    maxHp: 175392,
    pAtk: 61,
    mAtk: 8,
    pDef: 283,
    mDef: 307,
    exp: 436632,
    sp: 37265,
  },
  {
    npcId: 25357,
    spawnId: 'l2dop_rb_25357',
    nameUk: 'Ватажок Боягузливих Щуролюдів',
    level: 21,
    maxHp: 90169,
    pAtk: 42,
    mAtk: 3,
    pDef: 295,
    mDef: 319,
    exp: 578451,
    sp: 45688,
  },
  {
    npcId: 25146,
    spawnId: 'l2dop_rb_25146',
    nameUk: 'Змієдемон Біфронс',
    level: 21,
    maxHp: 90169,
    pAtk: 42,
    mAtk: 3,
    pDef: 295,
    mDef: 319,
    exp: 578451,
    sp: 45688,
  },
  {
    npcId: 25373,
    spawnId: 'l2dop_rb_25373',
    nameUk: 'Герольд Дагоніеля Малекс',
    level: 21,
    maxHp: 90169,
    pAtk: 42,
    mAtk: 3,
    pDef: 295,
    mDef: 319,
    exp: 578451,
    sp: 45688,
  },
  {
    npcId: 25380,
    spawnId: 'l2dop_rb_25380',
    nameUk: 'Герольд Ікара Кайша',
    level: 21,
    maxHp: 90169,
    pAtk: 42,
    mAtk: 3,
    pDef: 295,
    mDef: 319,
    exp: 578451,
    sp: 45688,
  },
  {
    npcId: 25366,
    spawnId: 'l2dop_rb_25366',
    nameUk: 'Жрець Куробороса',
    level: 23,
    maxHp: 95986,
    pAtk: 52,
    mAtk: 4,
    pDef: 320,
    mDef: 345,
    exp: 599426,
    sp: 50860,
  },
  {
    npcId: 25001,
    spawnId: 'l2dop_rb_25001',
    nameUk: 'Кутус Сірий Кіготь',
    level: 23,
    maxHp: 95986,
    pAtk: 61,
    mAtk: 6,
    pDef: 320,
    mDef: 345,
    exp: 714843,
    sp: 67170,
  },
  {
    npcId: 25362,
    spawnId: 'l2dop_rb_25362',
    nameUk: 'Ватажок Слідопитів Шарук',
    level: 23,
    maxHp: 95986,
    pAtk: 52,
    mAtk: 4,
    pDef: 320,
    mDef: 345,
    exp: 599426,
    sp: 50860,
  },
  {
    npcId: 25127,
    spawnId: 'l2dop_rb_25127',
    nameUk: 'Матріарх Лангк Рашкос',
    level: 24,
    maxHp: 198734,
    pAtk: 134,
    mAtk: 27,
    pDef: 284,
    mDef: 361,
    exp: 723779,
    sp: 67853,
  },
  {
    npcId: 25060,
    spawnId: 'l2dop_rb_25060',
    nameUk: 'Відкинута Каель',
    level: 24,
    maxHp: 99367,
    pAtk: 57,
    mAtk: 5,
    pDef: 284,
    mDef: 361,
    exp: 606920,
    sp: 51383,
  },
  {
    npcId: 25166,
    spawnId: 'l2dop_rb_25166',
    nameUk: 'Ікунтай',
    level: 25,
    maxHp: 134813,
    pAtk: 133,
    mAtk: 31,
    pDef: 347,
    mDef: 377,
    exp: 1278325,
    sp: 108133,
  },
  {
    npcId: 25429,
    spawnId: 'l2dop_rb_25429',
    nameUk: 'Колекціонер Маммона Талос',
    level: 25,
    maxHp: 103092,
    pAtk: 62,
    mAtk: 5,
    pDef: 347,
    mDef: 377,
    exp: 612533,
    sp: 52699,
  },
  {
    npcId: 25149,
    spawnId: 'l2dop_rb_25149',
    nameUk: 'Повелитель Зомбі Кроул',
    level: 25,
    maxHp: 103092,
    pAtk: 110,
    mAtk: 15,
    pDef: 347,
    mDef: 377,
    exp: 856025,
    sp: 92883,
  },
] as const;

export const RB_LV20_25_NPC_IDS: readonly number[] = RB_LV20_25_BOSSES.map(
  (b) => b.npcId
);

const byNpcId = new Map(RB_LV20_25_BOSSES.map((b) => [b.npcId, b]));

export function raidBossLv20_25SpecForNpcId(
  npcId: number
): RaidBossLv20_25Spec | undefined {
  return byNpcId.get(npcId);
}

export function isRaidBossLv20_25NpcId(npcId: number): boolean {
  return byNpcId.has(npcId);
}
