import {
  SIEGE_ATTACK_MIN_INTERVAL_MS,
  SIEGE_REWARD_CLAN_POINTS,
  SIEGE_TIME_ZONE,
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
} from './clanSiegeScheduleService.js';
import {
  finishClanSiegeInTx,
  lockClanSiegeInTx,
  lockClanSiegeParticipantInTx,
  rollSiegeWallDamage,
} from './clanSiegeFinishService.js';

export type SiegeClanBrief = { id: string; name: string } | null;

export type SiegeTopClanRow = {
  clanId: string;
  clanName: string;
  totalDamage: number;
  place: number;
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
  canAttack: boolean;
  attackBlockedReason: string | null;
  viewerClan: SiegeClanBrief;
  viewerClanDamage: number;
  viewerCharacterDamage: number;
  topClans: SiegeTopClanRow[];
  rewardPoints: number;
  finishReason: string | null;
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

function resolveAttackBlockedReason(args: {
  effectiveState: string;
  viewerClanId: string | null;
  ownerClanId: string | null;
}): { canAttack: boolean; reason: string | null } {
  if (args.effectiveState === CLAN_SIEGE_STATE.scheduled) {
    return { canAttack: false, reason: 'siege_not_started' };
  }
  if (args.effectiveState === CLAN_SIEGE_STATE.finished) {
    return { canAttack: false, reason: 'siege_finished' };
  }
  if (!args.viewerClanId) {
    return { canAttack: false, reason: 'siege_no_clan' };
  }
  if (
    args.ownerClanId &&
    args.ownerClanId === args.viewerClanId
  ) {
    return { canAttack: false, reason: 'siege_defender' };
  }
  return { canAttack: true, reason: null };
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
    select: { id: true, clanId: true, clan: { select: { id: true, name: true } } },
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
    const attack = resolveAttackBlockedReason({
      effectiveState: CLAN_SIEGE_STATE.scheduled,
      viewerClanId: char.clanId,
      ownerClanId: castle?.ownerClanId ?? null,
    });
    return {
      serverTime: new Date(nowMs).toISOString(),
      timeZone: SIEGE_TIME_ZONE,
      cityId: cid,
      cityName: siegeCityLabelUk(cid),
      state: CLAN_SIEGE_STATE.scheduled,
      startsAt: null,
      endsAt: null,
      wallHp: 0,
      wallMaxHp: 0,
      version: 0,
      ownerClan,
      winnerClan: null,
      canAttack: attack.canAttack,
      attackBlockedReason: attack.reason,
      viewerClan: char.clan
        ? { id: char.clan.id, name: char.clan.name }
        : null,
      viewerClanDamage: 0,
      viewerCharacterDamage: 0,
      topClans: [],
      rewardPoints: SIEGE_REWARD_CLAN_POINTS,
      finishReason: null,
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
    select: { totalWallDamage: true },
  });
  viewerCharacterDamage = partRow?.totalWallDamage ?? 0;

  const attack = resolveAttackBlockedReason({
    effectiveState,
    viewerClanId: char.clanId,
    ownerClanId: castle?.ownerClanId ?? null,
  });

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
    canAttack: attack.canAttack && siege.wallHp > 0,
    attackBlockedReason: attack.reason,
    viewerClan: char.clan
      ? { id: char.clan.id, name: char.clan.name }
      : null,
    viewerClanDamage,
    viewerCharacterDamage,
    topClans: await loadTopClans(siege.id),
    rewardPoints: SIEGE_REWARD_CLAN_POINTS,
    finishReason: siege.finishReason,
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
      args.finished && args.siege.finishReason === CLAN_SIEGE_FINISH_REASON.wallDestroyed
        ? SIEGE_REWARD_CLAN_POINTS
        : null,
    idempotentReplay: args.idempotentReplay,
  };
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
    select: { id: true, clanId: true },
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
    if (now >= locked.endsAt.getTime() || locked.state === CLAN_SIEGE_STATE.finished) {
      throw new SiegeAttackError(
        'siege_finished',
        'siege_finished',
        'Облога вже завершилась.'
      );
    }
    if (locked.wallHp <= 0) {
      throw new SiegeAttackError(
        'siege_finished',
        'siege_finished',
        'Стіна вже зруйнована.'
      );
    }

    let participant = await lockClanSiegeParticipantInTx(
      tx,
      locked.id,
      char.id
    );

    if (!participant) {
      try {
        await tx.clanSiegeParticipant.create({
          data: {
            siegeId: locked.id,
            characterId: char.id,
            clanId: char.clanId!,
            lastSeenAt: new Date(now),
          },
        });
      } catch (_eUnique) {
        /* concurrent first hit */
      }
      participant = await lockClanSiegeParticipantInTx(
        tx,
        locked.id,
        char.id
      );
    }

    if (!participant) {
      throw new SiegeAttackError(
        'internal_error',
        'internal_error',
        'Не вдалося зареєструвати учасника.'
      );
    }

    if (participant.lastActionId === act) {
      const clanRow = await tx.clanSiegeClanDamage.findUnique({
        where: {
          siegeId_clanId: { siegeId: locked.id, clanId: char.clanId! },
        },
        select: { totalDamage: true },
      });
      return buildAttackResponseFromRows({
        siege: locked,
        damage: 0,
        clanTotalDamage: clanRow?.totalDamage ?? 0,
        characterTotalDamage: participant.totalWallDamage,
        finished: locked.state === CLAN_SIEGE_STATE.finished,
        idempotentReplay: true,
      });
    }

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

    const updatedSiege = await tx.clanSiege.update({
      where: { id: locked.id },
      data: {
        wallHp: newWallHp,
        version: { increment: 1 },
        state: CLAN_SIEGE_STATE.active,
      },
    });

    const updatedParticipant = await tx.clanSiegeParticipant.update({
      where: { id: participant.id },
      data: {
        totalWallDamage: { increment: appliedDamage },
        lastWallAttackAt: hitAt,
        lastActionId: act,
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
        totalDamage: { increment: appliedDamage },
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
