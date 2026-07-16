import { expSegmentForLevelBar, levelFromTotalExp } from '../data/l2dopExpgain.js';
import { prisma } from '../lib/prisma.js';
import { professionDisplayUk } from '../domain/professionDisplay.js';
import { resolveHeroPowerFromCharacterRow } from './charSnapshotLogic.js';
import type { CharacterRow } from './charTypes.js';

export const RATINGS_PAGE_SIZE = 15;

export type RatingsType =
  | 'level'
  | 'power'
  | 'exp'
  | 'pvp'
  | 'pk'
  | 'bosses'
  | 'wealth'
  | 'clans'
  | 'activity'
  | 'victories'
  | 'damage'
  | 'arena';

type RatingsStubType = 'clans' | 'damage' | 'arena';
type RatingsScoredType = Exclude<RatingsType, RatingsStubType>;

export type RatingsRow = {
  rank: number;
  characterId: string;
  name: string;
  professionUk: string;
  level: number;
  value: string;
};

export type RatingsViewer = {
  rank: number | null;
  level: number;
  expPct: number;
  value: string;
  valueLabelUk: string;
};

export type RatingsSnapshot = {
  type: RatingsType;
  titleUk: string;
  valueColumnUk: string;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  rows: RatingsRow[];
  viewer: RatingsViewer | null;
  stub?: boolean;
  stubMessageUk?: string;
};

const TYPE_META: Record<
  RatingsScoredType,
  { titleUk: string; valueColumnUk: string; valueLabelUk: string }
> = {
  level: {
    titleUk: 'Рівень',
    valueColumnUk: 'Рівень',
    valueLabelUk: 'Рівень',
  },
  power: {
    titleUk: 'Сила',
    valueColumnUk: 'Мощ',
    valueLabelUk: 'Мощ',
  },
  exp: {
    titleUk: 'Досвід',
    valueColumnUk: 'EXP',
    valueLabelUk: 'EXP',
  },
  pvp: {
    titleUk: 'PvP',
    valueColumnUk: 'Перемоги',
    valueLabelUk: 'Перемоги',
  },
  pk: {
    titleUk: 'PK',
    valueColumnUk: 'PK',
    valueLabelUk: 'PK',
  },
  bosses: {
    titleUk: 'Боси',
    valueColumnUk: 'Боси',
    valueLabelUk: 'Боси',
  },
  wealth: {
    titleUk: 'Багатство',
    valueColumnUk: 'Adena',
    valueLabelUk: 'Adena',
  },
  activity: {
    titleUk: 'Активність',
    valueColumnUk: 'Очки',
    valueLabelUk: 'Очки',
  },
  victories: {
    titleUk: 'Перемоги',
    valueColumnUk: 'Перемоги',
    valueLabelUk: 'Перемоги',
  },
};

const STUB_META: Record<RatingsStubType, { titleUk: string; messageUk: string }> = {
  clans: {
    titleUk: 'Клани',
    messageUk: 'Клани з’являться пізніше.',
  },
  damage: {
    titleUk: 'Шкода',
    messageUk: 'Рейтинг шкоди з’явиться пізніше.',
  },
  arena: {
    titleUk: 'Арена',
    messageUk: 'Рейтинг арени з’явиться пізніше.',
  },
};

function parseRatingsType(raw: unknown): RatingsType {
  const s = String(raw || '').trim();
  if (s === 'raid_boss') return 'bosses';
  const allowed: RatingsType[] = [
    'level',
    'power',
    'exp',
    'pvp',
    'pk',
    'bosses',
    'wealth',
    'clans',
    'activity',
    'victories',
    'damage',
    'arena',
  ];
  if ((allowed as string[]).includes(s)) return s as RatingsType;
  return 'level';
}

function parsePage(raw: unknown): number {
  const n = Math.floor(Number(raw) || 1);
  return n >= 1 ? n : 1;
}

function fmtBigIntSpaces(v: bigint): string {
  const s = v.toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function intField(row: CharacterRow, key: keyof CharacterRow): number {
  return Math.max(0, Math.floor(Number(row[key]) || 0));
}

type ScoredEntry = {
  row: CharacterRow;
  level: number;
  expPct: number;
  sortKey: bigint;
  sortNum: number;
  value: string;
};

function scoreEntry(row: CharacterRow, type: RatingsScoredType): ScoredEntry {
  const level = levelFromTotalExp(row.exp);
  const expSeg = expSegmentForLevelBar(row.exp);

  if (type === 'level') {
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: row.exp,
      sortNum: level,
      value: String(level),
    };
  }
  if (type === 'exp') {
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: row.exp,
      sortNum: 0,
      value: fmtBigIntSpaces(row.exp),
    };
  }
  if (type === 'power') {
    const power = resolveHeroPowerFromCharacterRow(row);
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: power,
      value: String(power),
    };
  }
  if (type === 'pvp') {
    const wins = intField(row, 'pvpWins');
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: wins,
      value: String(wins),
    };
  }
  if (type === 'pk') {
    const pk = intField(row, 'karma');
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: pk,
      value: String(pk),
    };
  }
  if (type === 'bosses') {
    const rb = intField(row, 'raidBossKills');
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: rb,
      value: String(rb),
    };
  }
  if (type === 'activity') {
    const score =
      intField(row, 'mobsKilled') +
      intField(row, 'pvpWins') +
      intField(row, 'raidBossKills');
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: score,
      value: String(score),
    };
  }
  if (type === 'victories') {
    const wins = intField(row, 'mobsKilled');
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: wins,
      value: String(wins),
    };
  }
  const adena = row.adena >= 0n ? row.adena : 0n;
  return {
    row,
    level,
    expPct: expSeg.pct,
    sortKey: adena,
    sortNum: 0,
    value: fmtBigIntSpaces(adena),
  };
}

function compareEntries(a: ScoredEntry, b: ScoredEntry, type: RatingsType): number {
  if (type === 'level') {
    if (a.sortNum !== b.sortNum) return b.sortNum - a.sortNum;
    if (a.sortKey !== b.sortKey) return a.sortKey > b.sortKey ? -1 : 1;
  } else if (type === 'exp' || type === 'wealth') {
    if (a.sortKey !== b.sortKey) return a.sortKey > b.sortKey ? -1 : 1;
  } else if (a.sortNum !== b.sortNum) {
    return b.sortNum - a.sortNum;
  }
  if (a.level !== b.level) return b.level - a.level;
  return a.row.name.localeCompare(b.row.name, 'uk');
}

function findViewerEntry(
  sorted: ScoredEntry[],
  viewerCharacterId: string | null
): { entry: ScoredEntry; rank: number } | null {
  const id = String(viewerCharacterId || '').trim();
  if (!id) return null;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].row.id === id) {
      return { entry: sorted[i], rank: i + 1 };
    }
  }
  return null;
}

function viewerValueForType(
  type: RatingsScoredType,
  entry: ScoredEntry
): { value: string; valueLabelUk: string } {
  const meta = TYPE_META[type];
  if (type === 'level') {
    return {
      value: String(Math.round(entry.expPct)) + '%',
      valueLabelUk: 'EXP',
    };
  }
  if (type === 'exp') {
    return {
      value: String(Math.round(entry.expPct)) + '%',
      valueLabelUk: 'EXP',
    };
  }
  return {
    value: entry.value,
    valueLabelUk: meta.valueLabelUk,
  };
}

export async function getRatingsSnapshot(args: {
  userId: string;
  typeRaw: unknown;
  pageRaw: unknown;
}): Promise<RatingsSnapshot> {
  const type = parseRatingsType(args.typeRaw);
  const page = parsePage(args.pageRaw);

  if (type === 'clans' || type === 'damage' || type === 'arena') {
    const stub = STUB_META[type];
    return {
      type,
      titleUk: stub.titleUk,
      valueColumnUk: '—',
      page: 1,
      pageSize: RATINGS_PAGE_SIZE,
      totalPages: 0,
      totalCount: 0,
      rows: [],
      viewer: null,
      stub: true,
      stubMessageUk: stub.messageUk,
    };
  }

  const meta = TYPE_META[type];
  const viewerRow = await prisma.character.findFirst({
    where: { userId: args.userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  const viewerCharacterId = viewerRow?.id?.trim() || null;

  const allRows = (await prisma.character.findMany()) as CharacterRow[];
  const scored = allRows.map((row) => scoreEntry(row, type));
  scored.sort((a, b) => compareEntries(a, b, type));

  const totalCount = scored.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / RATINGS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * RATINGS_PAGE_SIZE;
  const pageSlice = scored.slice(start, start + RATINGS_PAGE_SIZE);

  const rows: RatingsRow[] = pageSlice.map((e, idx) => ({
    rank: start + idx + 1,
    characterId: e.row.id,
    name: e.row.name,
    professionUk: professionDisplayUk(e.row.l2Profession),
    level: e.level,
    value: e.value,
  }));

  const viewerHit = findViewerEntry(scored, viewerCharacterId);
  const viewer: RatingsViewer | null = viewerHit
    ? {
        rank: viewerHit.rank,
        level: viewerHit.entry.level,
        expPct: viewerHit.entry.expPct,
        ...viewerValueForType(type, viewerHit.entry),
      }
    : null;

  return {
    type,
    titleUk: meta.titleUk,
    valueColumnUk: meta.valueColumnUk,
    page: safePage,
    pageSize: RATINGS_PAGE_SIZE,
    totalPages,
    totalCount,
    rows,
    viewer,
  };
}
