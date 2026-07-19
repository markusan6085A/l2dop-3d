import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  DRAGON_DUNGEON_BOSS_ORDER,
  buildDragonBossView,
  getDragonBossConfig,
  parseDragonBossId,
  type DragonBossView,
} from '../domain/dragonDungeon.js';

export type DragonDungeonView = {
  diamonds: number;
  bosses: DragonBossView[];
};

type DbClient = Prisma.TransactionClient | typeof prisma;

async function buildViewForCharacter(
  db: DbClient,
  characterId: string,
  diamondsRaw: number
): Promise<DragonDungeonView> {
  const diamonds = Math.max(0, Math.floor(diamondsRaw));
  const unlockRows = await db.characterDragonDungeonUnlock.findMany({
    where: { characterId },
    select: { dragonId: true },
  });
  const unlocked = new Set(unlockRows.map((row) => row.dragonId));
  const bosses = DRAGON_DUNGEON_BOSS_ORDER.map((id) =>
    buildDragonBossView(
      getDragonBossConfig(id),
      diamonds,
      unlocked.has(id)
    )
  );
  return { diamonds, bosses };
}

async function loadLatestCharacterId(
  db: DbClient,
  userId: string
): Promise<string | null> {
  const row = await db.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  return row?.id ?? null;
}

/** GET /game/dragon-dungeon */
export async function getDragonDungeonForUser(
  userId: string
): Promise<DragonDungeonView | null> {
  const characterId = await loadLatestCharacterId(prisma, userId);
  if (!characterId) return null;
  const char = await prisma.character.findUnique({
    where: { id: characterId },
    select: { diamonds: true },
  });
  if (!char) return null;
  return buildViewForCharacter(prisma, characterId, char.diamonds);
}

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
  );
}

/** POST /game/dragon-dungeon/:dragonId/unlock */
export async function unlockDragonForUser(
  userId: string,
  rawDragonId: unknown
): Promise<DragonDungeonView> {
  const dragonId = parseDragonBossId(rawDragonId);
  if (!dragonId) throw new Error('dragon_not_found');
  const boss = getDragonBossConfig(dragonId);

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, diamonds: true },
    });
    if (!char) throw new Error('character_not_found');

    const existing = await tx.characterDragonDungeonUnlock.findUnique({
      where: {
        characterId_dragonId: {
          characterId: char.id,
          dragonId: boss.id,
        },
      },
      select: { id: true },
    });
    if (existing) throw new Error('dragon_already_unlocked');

    const cost = boss.unlockCostDiamonds;
    if (char.diamonds < cost) throw new Error('diamonds_insufficient');

    const debited = await tx.character.updateMany({
      where: { id: char.id, diamonds: { gte: cost } },
      data: { diamonds: { decrement: cost } },
    });
    if (debited.count !== 1) throw new Error('diamonds_insufficient');

    try {
      await tx.characterDragonDungeonUnlock.create({
        data: { characterId: char.id, dragonId: boss.id },
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new Error('dragon_unlock_conflict');
      throw err;
    }

    const after = await tx.character.findUnique({
      where: { id: char.id },
      select: { diamonds: true },
    });
    if (!after) throw new Error('character_not_found');
    return buildViewForCharacter(tx, char.id, after.diamonds);
  });
}
