import { expSegmentForLevelBar, levelFromTotalExp } from '../data/l2dopExpgain.js';
import { prisma } from '../lib/prisma.js';
import { professionDisplayUk } from '../domain/professionDisplay.js';
import { resolveHeroPowerFromCharacterRow } from './charSnapshotLogic.js';
import type { CharacterRow } from './charTypes.js';

export const RATINGS_PAGE_SIZE = 15;

export type RatingsType =
  | 'level'
  | 'power'
  | 'pvp'
  | 'pk'
  | 'raid_boss'
  | 'wealth'
  | 'clans';

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
  Exclude<RatingsType, 'clans'>,
  { titleUk: string; valueColumnUk: string; valueLabelUk: string }
> = {
  level: {
    titleUk: 'Рейтинг за рівнем',
    valueColumnUk: 'EXP',
    valueLabelUk: 'EXP',
  },
  power: {
    titleUk: 'Рейтинг за бойовою силою',
    valueColumnUk: 'Мощ',
    valueLabelUk: 'Мощ',
  },
  pvp: {
    titleUk: 'Рейтинг PvP',
    valueColumnUk: 'Перемоги',
    valueLabelUk: 'Перемоги',
  },
  pk: {
    titleUk: 'Рейтинг PK',
    valueColumnUk: 'PK',
    valueLabelUk: 'PK',
  },
  raid_boss: {
    titleUk: 'Рейтинг рейд-босів',
    valueColumnUk: 'Участь',
    valueLabelUk: 'Участь',
  },
  wealth: {
    titleUk: 'Рейтинг за багатством',
    valueColumnUk: 'Adena',
    valueLabelUk: 'Adena',
  },
};

function parseRatingsType(raw: unknown): RatingsType {
  const s = String(raw || '').trim();
  if (
    s === 'power' ||
    s === 'pvp' ||
    s === 'pk' ||
    s === 'raid_boss' ||
    s === 'wealth' ||
    s === 'clans'
  ) {
    return s;
  }
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

type ScoredEntry = {
  row: CharacterRow;
  level: number;
  expPct: number;
  sortKey: bigint;
  sortNum: number;
  value: string;
};

function scoreEntry(row: CharacterRow, type: Exclude<RatingsType, 'clans'>): ScoredEntry {
  const level = levelFromTotalExp(row.exp);
  const expSeg = expSegmentForLevelBar(row.exp);

  if (type === 'level') {
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
    const wins = Math.max(0, Math.floor(Number(row.pvpWins) || 0));
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
    const pk = Math.max(0, Math.floor(Number(row.karma) || 0));
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: pk,
      value: String(pk),
    };
  }
  if (type === 'raid_boss') {
    const rb = Math.max(0, Math.floor(Number(row.raidBossKills) || 0));
    return {
      row,
      level,
      expPct: expSeg.pct,
      sortKey: 0n,
      sortNum: rb,
      value: String(rb),
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
  if (type === 'level' || type === 'wealth') {
    if (a.sortKey !== b.sortKey) {
      return a.sortKey > b.sortKey ? -1 : 1;
    }
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

export async function getRatingsSnapshot(args: {
  userId: string;
  typeRaw: unknown;
  pageRaw: unknown;
}): Promise<RatingsSnapshot> {
  const type = parseRatingsType(args.typeRaw);
  const page = parsePage(args.pageRaw);

  if (type === 'clans') {
    return {
      type,
      titleUk: 'Рейтинг кланів',
      valueColumnUk: 'Очки',
      page: 1,
      pageSize: RATINGS_PAGE_SIZE,
      totalPages: 0,
      totalCount: 0,
      rows: [],
      viewer: null,
      stub: true,
      stubMessageUk: 'Клани з’являться пізніше.',
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
        value:
          type === 'level'
            ? String(Math.round(viewerHit.entry.expPct)) + '%'
            : viewerHit.entry.value,
        valueLabelUk: type === 'level' ? 'EXP' : meta.valueLabelUk,
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
