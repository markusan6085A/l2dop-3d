import {
  MAMMON_MERCHANT_ROTATION_MS,
  resolveMammonMerchantRotation,
} from '../domain/mammonMerchantRotation.js';
import { resolveMammonBlacksmithRotation } from '../domain/mammonBlacksmithRotation.js';
import { prisma } from '../lib/prisma.js';

export type ServerNewsKind =
  | 'mammon_spawn'
  | 'mammon_blacksmith_spawn'
  | 'player_join';

export interface ServerNewsEntryDto {
  id: string;
  kind: ServerNewsKind;
  createdAt: string;
  locationEn?: string;
  playerName?: string;
}

export interface ServerNewsListResult {
  page: number;
  pageSize: number;
  totalPages: number;
  entries: ServerNewsEntryDto[];
}

const PAGE_SIZE = 20;
const MAX_STORED_ENTRIES = 200;
const META_MAMMON_MERCHANT_ROTATION_SLOT = 'mammon_merchant_news_rotation_slot';
const META_MAMMON_BLACKSMITH_ROTATION_SLOT = 'mammon_blacksmith_news_rotation_slot';

function toDto(row: {
  id: string;
  kind: string;
  locationEn: string | null;
  playerName: string | null;
  createdAt: Date;
}): ServerNewsEntryDto {
  let kind: ServerNewsKind = 'mammon_spawn';
  if (row.kind === 'player_join') kind = 'player_join';
  else if (row.kind === 'mammon_blacksmith_spawn') kind = 'mammon_blacksmith_spawn';
  return {
    id: row.id,
    kind,
    createdAt: row.createdAt.toISOString(),
    ...(row.locationEn ? { locationEn: row.locationEn } : {}),
    ...(row.playerName ? { playerName: row.playerName } : {}),
  };
}

async function pruneOldEntries(): Promise<void> {
  const rows = await prisma.serverNewsEntry.findMany({
    orderBy: { createdAt: 'desc' },
    skip: MAX_STORED_ENTRIES,
    select: { id: true },
  });
  if (rows.length === 0) return;
  await prisma.serverNewsEntry.deleteMany({
    where: { id: { in: rows.map((r) => r.id) } },
  });
}

/** Публікує новину про нового гравця (після успішного register). */
export async function postPlayerJoinNews(playerName: string): Promise<void> {
  const name = String(playerName || '').trim();
  if (!name) return;
  await prisma.serverNewsEntry.create({
    data: {
      kind: 'player_join',
      playerName: name,
    },
  });
  await pruneOldEntries();
}

/** Одна новина на кожен 4-годинний слот ротації Торговця Маммона. */
export async function ensureMammonMerchantSpawnNews(
  nowMs: number = Date.now()
): Promise<void> {
  const rotationSlot = String(Math.floor(nowMs / MAMMON_MERCHANT_ROTATION_MS));
  const meta = await prisma.serverMeta.findUnique({
    where: { key: META_MAMMON_MERCHANT_ROTATION_SLOT },
  });
  if (meta?.value === rotationSlot) return;

  const rot = resolveMammonMerchantRotation(nowMs);
  await prisma.serverNewsEntry.create({
    data: {
      kind: 'mammon_spawn',
      locationEn: rot.current.labelEn,
    },
  });
  await prisma.serverMeta.upsert({
    where: { key: META_MAMMON_MERCHANT_ROTATION_SLOT },
    create: { key: META_MAMMON_MERCHANT_ROTATION_SLOT, value: rotationSlot },
    update: { value: rotationSlot },
  });
  await pruneOldEntries();
}

/** Одна новина на кожен 4-годинний слот ротації Коваля Маммона. */
export async function ensureMammonBlacksmithSpawnNews(
  nowMs: number = Date.now()
): Promise<void> {
  const rotationSlot = String(Math.floor(nowMs / MAMMON_MERCHANT_ROTATION_MS));
  const meta = await prisma.serverMeta.findUnique({
    where: { key: META_MAMMON_BLACKSMITH_ROTATION_SLOT },
  });
  if (meta?.value === rotationSlot) return;

  const rot = resolveMammonBlacksmithRotation(nowMs);
  await prisma.serverNewsEntry.create({
    data: {
      kind: 'mammon_blacksmith_spawn',
      locationEn: rot.current.labelEn,
    },
  });
  await prisma.serverMeta.upsert({
    where: { key: META_MAMMON_BLACKSMITH_ROTATION_SLOT },
    create: { key: META_MAMMON_BLACKSMITH_ROTATION_SLOT, value: rotationSlot },
    update: { value: rotationSlot },
  });
  await pruneOldEntries();
}

export async function ensureMammonSpawnNews(
  nowMs: number = Date.now()
): Promise<void> {
  await ensureMammonMerchantSpawnNews(nowMs);
  await ensureMammonBlacksmithSpawnNews(nowMs);
}

export async function listServerNews(
  pageRaw: unknown
): Promise<ServerNewsListResult> {
  try {
    await ensureMammonSpawnNews();
  } catch {
    /* ignore — стрічка все одно віддасть наявні записи */
  }

  const page = Math.max(1, Math.min(99, Number(pageRaw) || 1));
  const total = await prisma.serverNewsEntry.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const rows = await prisma.serverNewsEntry.findMany({
    orderBy: { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE,
  });

  return {
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
    entries: rows.map(toDto),
  };
}
