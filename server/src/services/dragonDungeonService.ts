import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  DRAGON_DUNGEON_BOSS_ORDER,
  buildDragonBossListItem,
  dragonHpPercent,
  getDragonBossConfig,
  parseDragonBossId,
  remainingSecondsUntil,
  type DragonBossId,
} from '../domain/dragonDungeon.js';
import {
  findActiveClanDragonDungeon,
  isClanDragonDungeonActive,
  loadClanDragonDungeonById,
  resolveDragonConfigForRow,
} from './dragonDungeonLifecycle.js';
import {
  postClanDragonJournalOpened,
  postClanDragonJournalExpired,
} from './dragonDungeonJournal.js';
import { finalizeStaleContributionAttempt } from './dragonDungeonLifecycle.js';

export type DragonDungeonContributionRow = {
  characterName: string;
  damageDealt: string;
  attempts: number;
  deaths: number;
};

export type DragonDungeonView = {
  clan: {
    id: string;
    name: string;
    diamonds: number;
    isLeader: boolean;
  } | null;
  noClanMessageUk: string | null;
  activeDungeon: null | {
    id: string;
    dragonId: DragonBossId;
    nameUk: string;
    nameEn: string;
    titleEn: string;
    imageUrl: string;
    maxHp: string;
    currentHp: string;
    hpPercent: number;
    openedAt: string;
    expiresAt: string;
    defeatedAt: string | null;
    remainingSeconds: number;
    reward: { adena: number; coinOfLuck: number; clanReputation: number };
  };
  bosses: ReturnType<typeof buildDragonBossListItem>[];
  myContribution: null | {
    damageDealt: string;
    attempts: number;
    deaths: number;
    nextEntryAt: string | null;
    cooldownRemainingSeconds: number;
    canEnter: boolean;
    inBattle: boolean;
    battleRemainingSeconds: number;
  };
  contributions: DragonDungeonContributionRow[];
};

type CharCtx = {
  id: string;
  name: string;
  clanId: string | null;
  clanRole: string | null;
  battleJson: unknown;
};

async function loadCharacterCtx(userId: string): Promise<CharCtx | null> {
  return prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: {
      id: true,
      name: true,
      clanId: true,
      clanRole: true,
      battleJson: true,
    },
  });
}

function hasIncompatibleBattle(battleJson: unknown): boolean {
  return battleJson != null && typeof battleJson === 'object';
}

function buildActiveDungeonDto(
  row: NonNullable<Awaited<ReturnType<typeof findActiveClanDragonDungeon>>>,
  boss: ReturnType<typeof getDragonBossConfig>,
  now: Date
) {
  return {
    id: row.id,
    dragonId: boss.id,
    nameUk: boss.nameUk,
    nameEn: boss.nameEn,
    titleEn: boss.titleEn,
    imageUrl: boss.imageUrl,
    maxHp: row.maxHp.toString(),
    currentHp: row.currentHp.toString(),
    hpPercent: dragonHpPercent(row.currentHp, row.maxHp),
    openedAt: row.openedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    defeatedAt: row.defeatedAt?.toISOString() ?? null,
    remainingSeconds: remainingSecondsUntil(row.expiresAt, now),
    reward: boss.reward,
  };
}

async function loadContributions(
  dungeonId: string
): Promise<DragonDungeonContributionRow[]> {
  const rows = await prisma.clanDragonContribution.findMany({
    where: { dungeonId },
    orderBy: [
      { damageDealt: 'desc' },
      { updatedAt: 'asc' },
      { characterId: 'asc' },
    ],
    include: { character: { select: { name: true } } },
  });
  return rows.map((r) => ({
    characterName: r.character.name,
    damageDealt: r.damageDealt.toString(),
    attempts: r.attempts,
    deaths: r.deaths,
  }));
}

/** GET /game/dragon-dungeon */
export async function getDragonDungeonForUser(
  userId: string
): Promise<DragonDungeonView | null> {
  const char = await loadCharacterCtx(userId);
  if (!char) return null;
  const now = new Date();

  if (!char.clanId) {
    const bosses = DRAGON_DUNGEON_BOSS_ORDER.map((id) =>
      buildDragonBossListItem(getDragonBossConfig(id), {
        inClan: false,
        isLeader: false,
        clanDiamonds: 0,
        hasActiveDragon: false,
      })
    );
    return {
      clan: null,
      noClanMessageUk: 'Для участі потрібен клан.',
      activeDungeon: null,
      bosses,
      myContribution: null,
      contributions: [],
    };
  }

  const clan = await prisma.clan.findUnique({
    where: { id: char.clanId },
    select: { id: true, name: true, diamonds: true },
  });
  if (!clan) return null;

  let active = await findActiveClanDragonDungeon(prisma, clan.id);
  if (active && active.expiresAt <= now && !active.defeatedAt && !active.expiredAt) {
    await prisma.$transaction(async (tx) => {
      const expired = await tx.clanDragonDungeon.updateMany({
        where: { id: active!.id, expiredAt: null, defeatedAt: null },
        data: { expiredAt: now },
      });
      if (expired.count === 1) {
        const bossId = parseDragonBossId(active!.dragonId);
        if (bossId) {
          await postClanDragonJournalExpired(tx, clan.id, char.id, bossId);
        }
      }
    });
    active = null;
  }

  const hasActive = !!active;
  const bosses = DRAGON_DUNGEON_BOSS_ORDER.map((id) =>
    buildDragonBossListItem(getDragonBossConfig(id), {
      inClan: true,
      isLeader: char.clanRole === 'leader',
      clanDiamonds: clan.diamonds,
      hasActiveDragon: hasActive,
    })
  );

  let activeDungeon: DragonDungeonView['activeDungeon'] = null;
  let myContribution: DragonDungeonView['myContribution'] = null;
  let contributions: DragonDungeonContributionRow[] = [];

  if (active) {
    const boss = resolveDragonConfigForRow(active);
    if (boss) {
      activeDungeon = buildActiveDungeonDto(active, boss, now);
      contributions = await loadContributions(active.id);
      const contrib = await prisma.clanDragonContribution.findUnique({
        where: {
          dungeonId_characterId: {
            dungeonId: active.id,
            characterId: char.id,
          },
        },
      });
      if (contrib) {
        if (contrib.activeBattleAt && contrib.battleEndsAt) {
          await finalizeStaleContributionAttempt(
            prisma,
            contrib.id,
            boss.entryCooldownSeconds,
            now
          );
        }
        const fresh = await prisma.clanDragonContribution.findUnique({
          where: { id: contrib.id },
        });
        const cooldownRemaining = remainingSecondsUntil(fresh?.nextEntryAt ?? null, now);
        const battleRemaining = remainingSecondsUntil(fresh?.battleEndsAt ?? null, now);
        const inBattle =
          !!fresh?.activeBattleAt &&
          !!fresh.battleEndsAt &&
          fresh.battleEndsAt > now;
        const canEnter =
          isClanDragonDungeonActive(active, now) &&
          !inBattle &&
          cooldownRemaining <= 0 &&
          !hasIncompatibleBattle(char.battleJson);
        myContribution = {
          damageDealt: (fresh?.damageDealt ?? 0n).toString(),
          attempts: fresh?.attempts ?? 0,
          deaths: fresh?.deaths ?? 0,
          nextEntryAt: fresh?.nextEntryAt?.toISOString() ?? null,
          cooldownRemainingSeconds: cooldownRemaining,
          canEnter,
          inBattle,
          battleRemainingSeconds: inBattle ? battleRemaining : 0,
        };
      } else if (isClanDragonDungeonActive(active, now) && !hasIncompatibleBattle(char.battleJson)) {
        myContribution = {
          damageDealt: '0',
          attempts: 0,
          deaths: 0,
          nextEntryAt: null,
          cooldownRemainingSeconds: 0,
          canEnter: true,
          inBattle: false,
          battleRemainingSeconds: 0,
        };
      }
    }
  }

  return {
    clan: {
      id: clan.id,
      name: clan.name,
      diamonds: clan.diamonds,
      isLeader: char.clanRole === 'leader',
    },
    noClanMessageUk: null,
    activeDungeon,
    bosses,
    myContribution,
    contributions,
  };
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

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, name: true, clanId: true, clanRole: true },
    });
    if (!char) throw new Error('character_not_found');
    if (!char.clanId) throw new Error('clan_required');
    if (char.clanRole !== 'leader') throw new Error('clan_leader_required');

    const active = await findActiveClanDragonDungeon(tx, char.clanId);
    if (active) throw new Error('dragon_already_active');

    const cost = boss.unlockCostDiamonds;
    const debited = await tx.clan.updateMany({
      where: { id: char.clanId, diamonds: { gte: cost } },
      data: { diamonds: { decrement: cost } },
    });
    if (debited.count !== 1) throw new Error('clan_diamonds_insufficient');

    const openedAt = new Date();
    const expiresAt = new Date(
      openedAt.getTime() + boss.durationHours * 3600 * 1000
    );
    try {
      const dungeon = await tx.clanDragonDungeon.create({
        data: {
          clanId: char.clanId,
          dragonId: boss.id,
          maxHp: BigInt(boss.maxHp),
          currentHp: BigInt(boss.maxHp),
          openedById: char.id,
          openedAt,
          expiresAt,
        },
      });
      await postClanDragonJournalOpened(
        tx,
        char.clanId,
        char.id,
        char.name,
        boss.id,
        cost
      );
      void dungeon;
    } catch (err) {
      if (isUniqueViolation(err)) throw new Error('dragon_unlock_conflict');
      throw err;
    }
  });

  const view = await getDragonDungeonForUser(userId);
  if (!view) throw new Error('character_not_found');
  return view;
}

export async function getDragonDungeonByIdForUser(
  userId: string,
  dungeonId: string
): Promise<{ dungeon: Awaited<ReturnType<typeof loadClanDragonDungeonById>>; char: CharCtx }> {
  const char = await loadCharacterCtx(userId);
  if (!char?.clanId) throw new Error('clan_required');
  const dungeon = await loadClanDragonDungeonById(prisma, dungeonId);
  if (!dungeon || dungeon.clanId !== char.clanId) throw new Error('dragon_dungeon_forbidden');
  return { dungeon, char };
}
