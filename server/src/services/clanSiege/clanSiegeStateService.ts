import {
  SIEGE_ATTACK_MIN_INTERVAL_MS,
  SIEGE_PARTICIPANT_PRESENCE_MS,
  SIEGE_PARTICIPANT_PRESENCE_TOUCH_MS,
  SIEGE_REWARD_CLAN_POINTS,
  SIEGE_TIME_ZONE,
  SIEGE_WALL_MAX_HP,
  isSiegeCityId,
  siegeCityLabelUk,
} from '../../domain/clanSiegeConfig.js';
import {
  CLAN_SIEGE_FINISH_REASON,
  CLAN_SIEGE_STATE,
} from '../../domain/clanSiegeConstants.js';
import { prisma } from '../../lib/prisma.js';
import {
  deriveEffectiveSiegeState,
  findLatestSiegeForCity,
  findSiegeRowForCityAtTime,
  findUpcomingSiegeForCity,
  resolveCurrentSiegeKyivDate,
  resolveUpcomingWeeklySiegeWindowForCity,
} from './clanSiegeScheduleService.js';
import {
  readClanSiegeTestConfig,
  resolveTestSiegeWindowFromConfig,
} from './clanSiegeTestConfig.js';
import {
  finishClanSiegeInTx,
  lockClanSiegeInTx,
  lockClanSiegeParticipantInTx,
  rollSiegeWallDamage,
} from './clanSiegeFinishService.js';
import {
  createClanSiegeWallActionInTx,
  findClanSiegeWallActionInTx,
  siegeViewFromWallAction,
} from './clanSiegeWallActionService.js';
import { isPrismaUniqueViolation } from '../party/partyPrismaErrors.js';
import { maybeClearPveBattleOnSiegeEnterInTx } from './clanSiegeBattleClearService.js';
export type SiegeClanBrief = { id: string; name: string } | null;

export type SiegeTopClanRow = {
  clanId: string;
  clanName: string;
  totalDamage: number;
  place: number;
};

export type SiegeParticipantBrief = {
  characterId: string;
  nickname: string;
  clanId: string;
  clanName: string;
  eliminated: boolean;
};

export type SiegeParticipantsView = {
  allies: SiegeParticipantBrief[];
  enemies: SiegeParticipantBrief[];
};

export type SiegeIncomingDamageNotice = {
  attackerName: string;
  damage: number;
  at: string;
};

export type SiegeStateView = {
  serverTime: string;
  timeZone: string;
  cityId: string;
  cityName: string;
  state: string;
  startsAt: string | null;
  endsAt: string | null;
  wallHp: number;
  wallMaxHp: number;
  version: number;
  ownerClan: SiegeClanBrief;
  winnerClan: SiegeClanBrief;
  canAttackWall: boolean;
  canStartSiegePvp: boolean;
  wallAttackBlockReason: string | null;
  pvpBlockReason: string | null;
  viewerEliminated: boolean;
  viewerClan: SiegeClanBrief;
  viewerClanDamage: number;
  viewerCharacterDamage: number;
  topClans: SiegeTopClanRow[];
  rewardPoints: number;
  finishReason: string | null;
  participants?: SiegeParticipantsView;
  incomingDamageNotice: SiegeIncomingDamageNotice | null;
};

async function loadClanBrief(clanId: string | null | undefined): Promise<SiegeClanBrief> {
  if (!clanId) return null;
  const row = await prisma.clan.findUnique({
    where: { id: clanId },
    select: { id: true, name: true },
  });
  if (!row) return null;
  return { id: row.id, name: row.name };
}

async function loadTopClans(siegeId: string): Promise<SiegeTopClanRow[]> {
  const rows = await prisma.clanSiegeClanDamage.findMany({
    where: { siegeId },
    orderBy: [
      { totalDamage: 'desc' },
      { lastHitAt: 'asc' },
      { clanId: 'asc' },
    ],
    take: 5,
    select: {
      clanId: true,
      totalDamage: true,
      clan: { select: { name: true } },
    },
  });
  return rows.map((r, idx) => ({
    clanId: r.clanId,
    clanName: r.clan.name,
    totalDamage: r.totalDamage,
    place: idx + 1,
  }));
}

async function touchSiegeParticipantPresence(
  siegeId: string,
  characterId: string,
  clanId: string,
  nowMs: number
): Promise<void> {
  const existing = await prisma.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: { siegeId, characterId },
    },
    select: { id: true, lastSeenAt: true, clanId: true, eliminatedAt: true },
  });
  if (existing?.eliminatedAt) {
    if (existing.lastSeenAt) {
      const ageMs = nowMs - existing.lastSeenAt.getTime();
      if (ageMs >= 0 && ageMs < SIEGE_PARTICIPANT_PRESENCE_TOUCH_MS) {
        return;
      }
    }
    const seenAt = new Date(nowMs);
    await prisma.clanSiegeParticipant.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: seenAt,
        ...(existing.clanId !== clanId ? { clanId } : {}),
      },
    });
    return;
  }
  if (existing?.lastSeenAt) {
    const ageMs = nowMs - existing.lastSeenAt.getTime();
    if (ageMs >= 0 && ageMs < SIEGE_PARTICIPANT_PRESENCE_TOUCH_MS) {
      return;
    }
  }

  const seenAt = new Date(nowMs);
  if (existing) {
    await prisma.clanSiegeParticipant.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: seenAt,
        ...(existing.clanId !== clanId ? { clanId } : {}),
      },
    });
    return;
  }
  try {
    await prisma.clanSiegeParticipant.create({
      data: {
        siegeId,
        characterId,
        clanId,
        lastSeenAt: seenAt,
      },
    });
  } catch (_eUnique) {
    await prisma.clanSiegeParticipant.updateMany({
      where: { siegeId, characterId },
      data: { lastSeenAt: seenAt, clanId },
    });
  }
}

async function loadNearbySiegeParticipants(
  siegeId: string,
  viewerClanId: string | null,
  nowMs: number
): Promise<SiegeParticipantsView | undefined> {
  if (!viewerClanId) return undefined;
  const presenceSince = new Date(nowMs - SIEGE_PARTICIPANT_PRESENCE_MS);
  const rows = await prisma.clanSiegeParticipant.findMany({
    where: {
      siegeId,
      OR: [
        { lastSeenAt: { gte: presenceSince } },
        { eliminatedAt: { not: null } },
      ],
    },
    select: {
      characterId: true,
      clanId: true,
      eliminatedAt: true,
      character: { select: { name: true, hp: true } },
    },
    orderBy: [{ character: { name: 'asc' } }],
    take: 40,
  });
  const clanIds = [...new Set(rows.map((r) => r.clanId))];
  const clans =
    clanIds.length > 0
      ? await prisma.clan.findMany({
          where: { id: { in: clanIds } },
          select: { id: true, name: true },
        })
      : [];
  const clanNameById = new Map(clans.map((c) => [c.id, c.name]));
  const allies: SiegeParticipantBrief[] = [];
  const enemies: SiegeParticipantBrief[] = [];
  for (const row of rows) {
    const brief: SiegeParticipantBrief = {
      characterId: row.characterId,
      nickname: row.character.name,
      clanId: row.clanId,
      clanName: clanNameById.get(row.clanId) ?? '—',
      eliminated: !!row.eliminatedAt,
    };
    if (row.clanId === viewerClanId) {
      allies.push(brief);
    } else {
      enemies.push(brief);
    }
  }
  return { allies, enemies };
}

function resolveWallAttackBlockedReason(args: {
  effectiveState: string;
  viewerClanId: string | null;
  ownerClanId: string | null;
  viewerEliminated: boolean;
  viewerHp: number;
}): { canAttackWall: boolean; reason: string | null } {
  if (args.effectiveState === CLAN_SIEGE_STATE.scheduled) {
    return { canAttackWall: false, reason: 'siege_not_started' };
  }
  if (args.effectiveState === CLAN_SIEGE_STATE.finished) {
    return { canAttackWall: false, reason: 'siege_finished' };
  }
  if (!args.viewerClanId) {
    return { canAttackWall: false, reason: 'siege_no_clan' };
  }
  if (args.viewerEliminated) {
    return { canAttackWall: false, reason: 'siege_eliminated' };
  }
  if (Math.max(0, Math.floor(args.viewerHp)) <= 0) {
    return { canAttackWall: false, reason: 'siege_dead' };
  }
  if (args.ownerClanId && args.ownerClanId === args.viewerClanId) {
    return { canAttackWall: false, reason: 'siege_defender' };
  }
  return { canAttackWall: true, reason: null };
}

function resolveSiegePvpBlockedReason(args: {
  effectiveState: string;
  viewerClanId: string | null;
  viewerEliminated: boolean;
  viewerHp: number;
}): { canStartSiegePvp: boolean; reason: string | null } {
  if (args.effectiveState === CLAN_SIEGE_STATE.scheduled) {
    return { canStartSiegePvp: false, reason: 'siege_not_started' };
  }
  if (args.effectiveState === CLAN_SIEGE_STATE.finished) {
    return { canStartSiegePvp: false, reason: 'siege_finished' };
  }
  if (!args.viewerClanId) {
    return { canStartSiegePvp: false, reason: 'siege_no_clan' };
  }
  if (args.viewerEliminated) {
    return { canStartSiegePvp: false, reason: 'siege_eliminated' };
  }
  if (Math.max(0, Math.floor(args.viewerHp)) <= 0) {
    return { canStartSiegePvp: false, reason: 'siege_dead' };
  }
  return { canStartSiegePvp: true, reason: null };
}

function buildSiegeActionPermissions(args: {
  effectiveState: string;
  viewerClanId: string | null;
  ownerClanId: string | null;
  viewerEliminated: boolean;
  viewerHp: number;
  wallHp: number;
}) {
  const wall = resolveWallAttackBlockedReason(args);
  const pvp = resolveSiegePvpBlockedReason(args);
  return {
    canAttackWall: wall.canAttackWall && args.wallHp > 0,
    wallAttackBlockReason: wall.reason,
    canStartSiegePvp: pvp.canStartSiegePvp,
    pvpBlockReason: pvp.reason,
  };
}

function resolveVirtualSiegeSchedule(
  cityId: string,
  nowMs: number
): { startsAt: Date; endsAt: Date } | null {
  const testCfg = readClanSiegeTestConfig();
  if (testCfg.enabled && testCfg.cityId === cityId) {
    return resolveTestSiegeWindowFromConfig(nowMs);
  }
  return resolveUpcomingWeeklySiegeWindowForCity(cityId, nowMs);
}

export async function getSiegeStateForUser(
  userId: string,
  cityId: string,
  characterId?: string | null,
  nowMs = Date.now()
): Promise<SiegeStateView> {
  const cid = String(cityId || '').trim();
  if (!isSiegeCityId(cid)) throw new Error('siege_invalid_city');

  const char = await prisma.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: characterId } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, clanId: true, cityId: true, hp: true, clan: { select: { id: true, name: true } } },
  });
  if (!char) throw new Error('no_character');

  let siege =
    (await findSiegeRowForCityAtTime(cid, nowMs)) ??
    (await findUpcomingSiegeForCity(cid, nowMs)) ??
    (await findLatestSiegeForCity(cid));

  const castle = await prisma.cityCastle.findUnique({
    where: { cityId: cid },
    select: { ownerClanId: true },
  });
  const ownerClan = await loadClanBrief(castle?.ownerClanId);

  if (!siege) {
    const virtual = resolveVirtualSiegeSchedule(cid, nowMs);
    const perms = buildSiegeActionPermissions({
      effectiveState: CLAN_SIEGE_STATE.scheduled,
      viewerClanId: char.clanId,
      ownerClanId: castle?.ownerClanId ?? null,
      viewerEliminated: false,
      viewerHp: char.hp,
      wallHp: SIEGE_WALL_MAX_HP,
    });
    return {
      serverTime: new Date(nowMs).toISOString(),
      timeZone: SIEGE_TIME_ZONE,
      cityId: cid,
      cityName: siegeCityLabelUk(cid),
      state: CLAN_SIEGE_STATE.scheduled,
      startsAt: virtual?.startsAt.toISOString() ?? null,
      endsAt: virtual?.endsAt.toISOString() ?? null,
      wallHp: SIEGE_WALL_MAX_HP,
      wallMaxHp: SIEGE_WALL_MAX_HP,
      version: 0,
      ownerClan,
      winnerClan: null,
      canAttackWall: perms.canAttackWall,
      canStartSiegePvp: perms.canStartSiegePvp,
      wallAttackBlockReason: perms.wallAttackBlockReason,
      pvpBlockReason: perms.pvpBlockReason,
      viewerEliminated: false,
      viewerClan: char.clan
        ? { id: char.clan.id, name: char.clan.name }
        : null,
      viewerClanDamage: 0,
      viewerCharacterDamage: 0,
      topClans: [],
      rewardPoints: SIEGE_REWARD_CLAN_POINTS,
      finishReason: null,
      incomingDamageNotice: null,
    };
  }

  const effectiveState = deriveEffectiveSiegeState(siege, nowMs);
  const winnerClan = await loadClanBrief(siege.winnerClanId);

  let viewerClanDamage = 0;
  let viewerCharacterDamage = 0;
  if (char.clanId) {
    const clanRow = await prisma.clanSiegeClanDamage.findUnique({
      where: {
        siegeId_clanId: { siegeId: siege.id, clanId: char.clanId },
      },
      select: { totalDamage: true },
    });
    viewerClanDamage = clanRow?.totalDamage ?? 0;
  }
  const partRow = await prisma.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: { siegeId: siege.id, characterId: char.id },
    },
    select: {
      totalWallDamage: true,
      eliminatedAt: true,
      lastIncomingAttackerName: true,
      lastIncomingDamage: true,
      lastIncomingAt: true,
    },
  });
  viewerCharacterDamage = partRow?.totalWallDamage ?? 0;
  const viewerEliminated = !!partRow?.eliminatedAt;

  const perms = buildSiegeActionPermissions({
    effectiveState,
    viewerClanId: char.clanId,
    ownerClanId: castle?.ownerClanId ?? null,
    viewerEliminated,
    viewerHp: char.hp,
    wallHp: siege.wallHp,
  });

  let participants: SiegeParticipantsView | undefined;
  if (
    effectiveState === CLAN_SIEGE_STATE.active &&
    char.clanId &&
    String(char.cityId || '').trim() === cid
  ) {
    await prisma.$transaction(async (tx) => {
      await maybeClearPveBattleOnSiegeEnterInTx(tx, {
        characterId: char.id,
        siegeId: siege.id,
        cityId: cid,
        viewerCityId: char.cityId,
        effectiveStateActive: true,
      });
    });
    await touchSiegeParticipantPresence(
      siege.id,
      char.id,
      char.clanId,
      nowMs
    );
    participants = await loadNearbySiegeParticipants(
      siege.id,
      char.clanId,
      nowMs
    );
  }

  let incomingDamageNotice: SiegeIncomingDamageNotice | null = null;
  if (
    partRow?.lastIncomingAt &&
    partRow.lastIncomingAttackerName &&
    typeof partRow.lastIncomingDamage === 'number' &&
    partRow.lastIncomingDamage > 0
  ) {
    incomingDamageNotice = {
      attackerName: partRow.lastIncomingAttackerName,
      damage: partRow.lastIncomingDamage,
      at: partRow.lastIncomingAt.toISOString(),
    };
  }

  return {
    serverTime: new Date(nowMs).toISOString(),
    timeZone: SIEGE_TIME_ZONE,
    cityId: cid,
    cityName: siegeCityLabelUk(cid),
    state: effectiveState,
    startsAt: siege.startsAt.toISOString(),
    endsAt: siege.endsAt.toISOString(),
    wallHp: siege.wallHp,
    wallMaxHp: siege.wallMaxHp,
    version: siege.version,
    ownerClan,
    winnerClan,
    canAttackWall: perms.canAttackWall,
    canStartSiegePvp: perms.canStartSiegePvp,
    wallAttackBlockReason: perms.wallAttackBlockReason,
    pvpBlockReason: perms.pvpBlockReason,
    viewerEliminated,
    viewerClan: char.clan
      ? { id: char.clan.id, name: char.clan.name }
      : null,
    viewerClanDamage,
    viewerCharacterDamage,
    topClans: await loadTopClans(siege.id),
    rewardPoints: SIEGE_REWARD_CLAN_POINTS,
    finishReason: siege.finishReason,
    participants,
    incomingDamageNotice,
  };
}

export type SiegeAttackResult = {
  ok: true;
  damage: number;
  wallHp: number;
  wallMaxHp: number;
  siegeVersion: number;
  clanTotalDamage: number;
  characterTotalDamage: number;
  state: string;
  finished: boolean;
  winnerClan: SiegeClanBrief;
  rewardPoints: number | null;
  idempotentReplay?: boolean;
};

export class SiegeAttackError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly messageUk: string
  ) {
    super(message);
    this.name = 'SiegeAttackError';
  }
}

async function buildAttackResponseFromRows(args: {
  siege: {
    wallHp: number;
    wallMaxHp: number;
    version: number;
    state: string;
    finishReason: string | null;
    winnerClanId: string | null;
  };
  damage: number;
  clanTotalDamage: number;
  characterTotalDamage: number;
  finished: boolean;
  idempotentReplay?: boolean;
}): Promise<SiegeAttackResult> {
  const winnerClan = await loadClanBrief(args.siege.winnerClanId);
  return {
    ok: true,
    damage: args.damage,
    wallHp: args.siege.wallHp,
    wallMaxHp: args.siege.wallMaxHp,
    siegeVersion: args.siege.version,
    clanTotalDamage: args.clanTotalDamage,
    characterTotalDamage: args.characterTotalDamage,
    state: args.siege.state,
    finished: args.finished,
    winnerClan,
    rewardPoints:
      args.finished &&
      args.siege.finishReason === CLAN_SIEGE_FINISH_REASON.wallDestroyed
        ? SIEGE_REWARD_CLAN_POINTS
        : null,
    idempotentReplay: args.idempotentReplay,
  };
}

async function buildReplayFromWallAction(
  siege: Awaited<ReturnType<typeof lockClanSiegeInTx>> & object,
  action: Awaited<ReturnType<typeof findClanSiegeWallActionInTx>> & object
): Promise<SiegeAttackResult> {
  const view = siegeViewFromWallAction(siege, action);
  return buildAttackResponseFromRows({
    siege: view,
    damage: action.damage,
    clanTotalDamage: action.clanTotalAfter,
    characterTotalDamage: action.characterTotalAfter,
    finished:
      view.state === CLAN_SIEGE_STATE.finished ||
      view.finishReason === CLAN_SIEGE_FINISH_REASON.timeExpired,
    idempotentReplay: true,
  });
}

async function ensureParticipantLockedInTx(
  tx: Parameters<typeof lockClanSiegeParticipantInTx>[0],
  siegeId: string,
  characterId: string,
  clanId: string,
  nowMs: number,
  viewerHp: number
) {
  let participant = await lockClanSiegeParticipantInTx(tx, siegeId, characterId);
  if (!participant) {
    try {
      await tx.clanSiegeParticipant.create({
        data: {
          siegeId,
          characterId,
          clanId,
          lastSeenAt: new Date(nowMs),
        },
      });
    } catch (_eUnique) {
      /* concurrent first hit */
    }
    participant = await lockClanSiegeParticipantInTx(tx, siegeId, characterId);
  }
  if (!participant) {
    throw new SiegeAttackError(
      'internal_error',
      'internal_error',
      'Не вдалося зареєструвати учасника.'
    );
  }
  if (participant.eliminatedAt) {
    throw new SiegeAttackError(
      'siege_eliminated',
      'siege_eliminated',
      'Ви вибули з цієї облоги.'
    );
  }
  if (Math.max(0, Math.floor(viewerHp)) <= 0) {
    throw new SiegeAttackError(
      'siege_dead',
      'siege_dead',
      'Персонаж неживий.'
    );
  }
  return participant;
}

export async function attackSiegeWallForUser(
  userId: string,
  cityId: string,
  actionId: string,
  characterId?: string | null,
  nowMs = Date.now()
): Promise<SiegeAttackResult> {
  const cid = String(cityId || '').trim();
  const act = String(actionId || '').trim();
  if (!isSiegeCityId(cid)) {
    throw new SiegeAttackError(
      'siege_invalid_city',
      'siege_invalid_city',
      'Невідоме місто облоги.'
    );
  }
  if (!act || act.length > 128) {
    throw new SiegeAttackError(
      'invalid_input',
      'invalid_input',
      'Невірний actionId.'
    );
  }

  const char = await prisma.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: characterId } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, clanId: true, hp: true },
  });
  if (!char) throw new SiegeAttackError('no_character', 'no_character', 'Немає персонажа.');
  if (!char.clanId) {
    throw new SiegeAttackError(
      'siege_no_clan',
      'siege_no_clan',
      'Для участі в облозі потрібно перебувати в клані.'
    );
  }

  const castle = await prisma.cityCastle.findUnique({
    where: { cityId: cid },
    select: { ownerClanId: true },
  });
  if (castle?.ownerClanId && castle.ownerClanId === char.clanId) {
    throw new SiegeAttackError(
      'siege_defender',
      'siege_defender',
      'Ваш клан захищає це місто.'
    );
  }

  let siegeRow = await findSiegeRowForCityAtTime(cid, nowMs);
  if (!siegeRow) {
    siegeRow = await prisma.clanSiege.findFirst({
      where: {
        cityId: cid,
        startsAt: { lte: new Date(nowMs) },
      },
      orderBy: { startsAt: 'desc' },
    });
  }
  if (!siegeRow) {
    throw new SiegeAttackError(
      'siege_not_active',
      'siege_not_started',
      'Облога ще не розпочалась.'
    );
  }

  return prisma.$transaction(async (tx) => {
    const locked = await lockClanSiegeInTx(tx, siegeRow.id);
    if (!locked) {
      throw new SiegeAttackError(
        'siege_not_active',
        'siege_not_active',
        'Облога не активна.'
      );
    }

    const now = nowMs;
    if (now < locked.startsAt.getTime()) {
      throw new SiegeAttackError(
        'siege_not_started',
        'siege_not_started',
        'Облога ще не розпочалась.'
      );
    }

    const existingAction = await findClanSiegeWallActionInTx(
      tx,
      locked.id,
      char.id,
      act
    );
    if (existingAction) {
      return buildReplayFromWallAction(locked, existingAction);
    }

    if (now >= locked.endsAt.getTime() || locked.state === CLAN_SIEGE_STATE.finished) {
      let finalSiege = locked;
      if (locked.state !== CLAN_SIEGE_STATE.finished) {
        const fin = await finishClanSiegeInTx(
          tx,
          locked.id,
          CLAN_SIEGE_FINISH_REASON.timeExpired,
          now
        );
        if (fin) finalSiege = fin;
      }
      const clanRow = await tx.clanSiegeClanDamage.findUnique({
        where: {
          siegeId_clanId: { siegeId: locked.id, clanId: char.clanId! },
        },
        select: { totalDamage: true },
      });
      const partRow = await tx.clanSiegeParticipant.findUnique({
        where: {
          siegeId_characterId: { siegeId: locked.id, characterId: char.id },
        },
        select: { totalWallDamage: true },
      });
      return buildAttackResponseFromRows({
        siege: finalSiege,
        damage: 0,
        clanTotalDamage: clanRow?.totalDamage ?? 0,
        characterTotalDamage: partRow?.totalWallDamage ?? 0,
        finished: true,
      });
    }

    if (locked.wallHp <= 0) {
      if (locked.state !== CLAN_SIEGE_STATE.finished) {
        const fin = await finishClanSiegeInTx(
          tx,
          locked.id,
          CLAN_SIEGE_FINISH_REASON.wallDestroyed,
          now
        );
        if (fin) {
          return buildAttackResponseFromRows({
            siege: fin,
            damage: 0,
            clanTotalDamage: 0,
            characterTotalDamage: 0,
            finished: true,
          });
        }
      }
      throw new SiegeAttackError(
        'siege_finished',
        'siege_finished',
        'Стіна вже зруйнована.'
      );
    }

    const participant = await ensureParticipantLockedInTx(
      tx,
      locked.id,
      char.id,
      char.clanId!,
      now,
      char.hp
    );

    if (
      participant.lastWallAttackAt &&
      now - participant.lastWallAttackAt.getTime() < SIEGE_ATTACK_MIN_INTERVAL_MS
    ) {
      throw new SiegeAttackError(
        'siege_cooldown',
        'siege_cooldown',
        'Зачекайте перед наступним ударом.'
      );
    }

    const randomDamage = rollSiegeWallDamage();
    const appliedDamage = Math.min(randomDamage, locked.wallHp);
    const newWallHp = locked.wallHp - appliedDamage;
    const hitAt = new Date(now);
    const nextVersion = locked.version + 1;

    const clanRowBefore = await tx.clanSiegeClanDamage.findUnique({
      where: {
        siegeId_clanId: { siegeId: locked.id, clanId: char.clanId! },
      },
      select: { totalDamage: true },
    });
    const nextCharTotal = participant.totalWallDamage + appliedDamage;
    const nextClanTotal = (clanRowBefore?.totalDamage ?? 0) + appliedDamage;

    try {
      await createClanSiegeWallActionInTx(tx, {
        siegeId: locked.id,
        characterId: char.id,
        actionId: act,
        damage: appliedDamage,
        wallHpAfter: newWallHp,
        siegeVersionAfter: nextVersion,
        characterTotalAfter: nextCharTotal,
        clanTotalAfter: nextClanTotal,
      });
    } catch (err) {
      if (isPrismaUniqueViolation(err)) {
        const replay = await findClanSiegeWallActionInTx(
          tx,
          locked.id,
          char.id,
          act
        );
        if (replay) {
          return buildReplayFromWallAction(locked, replay);
        }
      }
      throw err;
    }

    const updatedSiege = await tx.clanSiege.update({
      where: { id: locked.id },
      data: {
        wallHp: newWallHp,
        version: nextVersion,
        state: CLAN_SIEGE_STATE.active,
      },
    });

    const updatedParticipant = await tx.clanSiegeParticipant.update({
      where: { id: participant.id },
      data: {
        totalWallDamage: nextCharTotal,
        lastWallAttackAt: hitAt,
        lastSeenAt: hitAt,
      },
    });

    const clanDamage = await tx.clanSiegeClanDamage.upsert({
      where: {
        siegeId_clanId: { siegeId: locked.id, clanId: char.clanId! },
      },
      create: {
        siegeId: locked.id,
        clanId: char.clanId!,
        totalDamage: appliedDamage,
        firstHitAt: hitAt,
        lastHitAt: hitAt,
      },
      update: {
        totalDamage: nextClanTotal,
        lastHitAt: hitAt,
      },
    });

    let finalSiege = updatedSiege;
    let finished = false;

    if (newWallHp <= 0) {
      finished = true;
      const fin = await finishClanSiegeInTx(
        tx,
        locked.id,
        CLAN_SIEGE_FINISH_REASON.wallDestroyed,
        now
      );
      if (fin) finalSiege = fin;
    }

    return buildAttackResponseFromRows({
      siege: finalSiege,
      damage: appliedDamage,
      clanTotalDamage: clanDamage.totalDamage,
      characterTotalDamage: updatedParticipant.totalWallDamage,
      finished,
    });
  });
}

/** Для smoke: чи сьогодні день облог у Kyiv. */
export { resolveCurrentSiegeKyivDate };
