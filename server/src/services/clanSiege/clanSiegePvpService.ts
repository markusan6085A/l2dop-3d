import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  isSiegeCityId,
  SIEGE_PARTICIPANT_PRESENCE_MS,
} from '../../domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../../domain/clanSiegeConstants.js';
import {
  deriveEffectiveSiegeState,
  findSiegeRowForCityAtTime,
} from './clanSiegeScheduleService.js';
import {
  commitPlayerPvpBattleStartInTx,
  markAggressorVictimFoughtBackInTx,
  resumePlayerPvpBattleInTx,
} from '../battleServicePvpSession.js';
import { parseBattleJson } from '../battleServiceParseBattleJson.js';
import { isPvpBattleJson } from '../../domain/battlePvpContext.js';
import { resolvePlayerCombatMode } from '../../domain/playerCombatMode.js';
import type { CharacterRow, CharacterSnapshot } from '../charService.js';
import type { BattleView } from '../battleServiceTypes.js';
import { lockClanSiegeParticipantInTx } from './clanSiegeFinishService.js';

export class SiegePvpError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly messageUk: string
  ) {
    super(message);
    this.name = 'SiegePvpError';
  }
}

async function ensureSiegeParticipantInTx(
  tx: Prisma.TransactionClient,
  siegeId: string,
  characterId: string,
  clanId: string,
  nowMs: number
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
      /* concurrent insert */
    }
    participant = await lockClanSiegeParticipantInTx(tx, siegeId, characterId);
  }
  if (!participant) {
    throw new SiegePvpError(
      'internal_error',
      'internal_error',
      'Не вдалося зареєструвати учасника облоги.'
    );
  }
  await tx.clanSiegeParticipant.update({
    where: { id: participant.id },
    data: { lastSeenAt: new Date(nowMs) },
  });
  return participant;
}

function assertCharacterAliveInSiegeCity(
  row: CharacterRow,
  cityId: string,
  role: 'attacker' | 'target'
): void {
  if (Math.max(0, Math.floor(Number(row.hp) || 0)) <= 0) {
    throw new SiegePvpError(
      role === 'attacker' ? 'siege_pvp_attacker_dead' : 'siege_pvp_target_dead',
      role === 'attacker' ? 'siege_pvp_attacker_dead' : 'siege_pvp_target_dead',
      role === 'attacker'
        ? 'Ви не можете атакувати — персонаж неживий.'
        : 'Ціль нежива.'
    );
  }
  if (String(row.cityId || '').trim() !== cityId) {
    throw new SiegePvpError(
      role === 'attacker' ? 'siege_pvp_wrong_city' : 'siege_pvp_target_wrong_city',
      role === 'attacker' ? 'siege_pvp_wrong_city' : 'siege_pvp_target_wrong_city',
      role === 'attacker'
        ? 'Для PvP на облозі потрібно перебувати в місті облоги.'
        : 'Ціль не в місті облоги.'
    );
  }
}

export async function startSiegePvpBattleInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  cityId: string,
  targetCharacterId: string,
  expectedRevision: number,
  characterId?: string | null,
  nowMs = Date.now()
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  const cid = String(cityId || '').trim();
  const targetId = String(targetCharacterId || '').trim();
  if (!isSiegeCityId(cid)) {
    throw new SiegePvpError(
      'siege_invalid_city',
      'siege_invalid_city',
      'Місто не бере участі в облозі.'
    );
  }
  if (!targetId) {
    throw new SiegePvpError(
      'invalid_input',
      'invalid_input',
      'Потрібна ціль для PvP.'
    );
  }

  const attackerRow = await tx.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: characterId } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!attackerRow) {
    throw new SiegePvpError('no_character', 'no_character', 'Немає персонажа.');
  }
  if (attackerRow.id === targetId) {
    throw new SiegePvpError(
      'siege_pvp_self',
      'siege_pvp_self',
      'Не можна атакувати себе.'
    );
  }
  if (!attackerRow.clanId) {
    throw new SiegePvpError(
      'siege_no_clan',
      'siege_no_clan',
      'Для участі в облозі потрібно перебувати в клані.'
    );
  }

  const castle = await tx.cityCastle.findUnique({
    where: { cityId: cid },
    select: { ownerClanId: true },
  });
  if (castle?.ownerClanId && castle.ownerClanId === attackerRow.clanId) {
    throw new SiegePvpError(
      'siege_defender',
      'siege_defender',
      'Ваш клан захищає це місто.'
    );
  }

  let siegeRow = await findSiegeRowForCityAtTime(cid, nowMs);
  if (!siegeRow) {
    siegeRow = await tx.clanSiege.findFirst({
      where: {
        cityId: cid,
        startsAt: { lte: new Date(nowMs) },
      },
      orderBy: { startsAt: 'desc' },
    });
  }
  if (!siegeRow) {
    throw new SiegePvpError(
      'siege_not_started',
      'siege_not_started',
      'Облога ще не розпочалась.'
    );
  }

  const effectiveState = deriveEffectiveSiegeState(siegeRow, nowMs);
  if (effectiveState !== CLAN_SIEGE_STATE.active) {
    throw new SiegePvpError(
      effectiveState === CLAN_SIEGE_STATE.finished
        ? 'siege_finished'
        : 'siege_not_active',
      effectiveState === CLAN_SIEGE_STATE.finished
        ? 'siege_finished'
        : 'siege_not_active',
      effectiveState === CLAN_SIEGE_STATE.finished
        ? 'Облога завершилась.'
        : 'Облога не активна.'
    );
  }
  if (nowMs >= siegeRow.endsAt.getTime()) {
    throw new SiegePvpError(
      'siege_finished',
      'siege_finished',
      'Облога завершилась.'
    );
  }

  assertCharacterAliveInSiegeCity(attackerRow as CharacterRow, cid, 'attacker');

  const existingBj = parseBattleJson(attackerRow.battleJson);
  if (existingBj && isPvpBattleJson(existingBj)) {
    if (
      existingBj.pvpTargetCharacterId === targetId &&
      resolvePlayerCombatMode(existingBj) === 'siege' &&
      existingBj.siegeId === siegeRow.id
    ) {
      return resumePlayerPvpBattleInTx(
        tx,
        attackerRow as CharacterRow,
        targetId,
        'siege'
      );
    }
    throw new SiegePvpError(
      'already_in_battle',
      'already_in_battle',
      'Персонаж уже в бою.'
    );
  }
  if (attackerRow.battleJson != null) {
    throw new SiegePvpError(
      'already_in_battle',
      'already_in_battle',
      'Персонаж уже в бою.'
    );
  }

  const targetRow = await tx.character.findFirst({
    where: { id: targetId },
  });
  if (!targetRow) {
    throw new SiegePvpError(
      'siege_pvp_target_unknown',
      'siege_pvp_target_unknown',
      'Гравця не знайдено.'
    );
  }
  assertCharacterAliveInSiegeCity(targetRow as CharacterRow, cid, 'target');

  if (!targetRow.clanId) {
    throw new SiegePvpError(
      'siege_pvp_target_no_clan',
      'siege_pvp_target_no_clan',
      'Ціль не бере участі в облозі.'
    );
  }
  if (targetRow.clanId === attackerRow.clanId) {
    throw new SiegePvpError(
      'siege_pvp_same_clan',
      'siege_pvp_same_clan',
      'Не можна атакувати сокланівця.'
    );
  }

  const presenceSince = new Date(nowMs - SIEGE_PARTICIPANT_PRESENCE_MS);
  await ensureSiegeParticipantInTx(
    tx,
    siegeRow.id,
    attackerRow.id,
    attackerRow.clanId,
    nowMs
  );

  const targetParticipant = await tx.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: {
        siegeId: siegeRow.id,
        characterId: targetId,
      },
    },
  });
  if (
    !targetParticipant ||
    !targetParticipant.lastSeenAt ||
    targetParticipant.lastSeenAt < presenceSince
  ) {
    throw new SiegePvpError(
      'siege_pvp_target_not_participant',
      'siege_pvp_target_not_participant',
      'Гравець не поруч або не бере участі в облозі.'
    );
  }
  if (targetParticipant.clanId !== targetRow.clanId) {
    throw new SiegePvpError(
      'siege_pvp_target_not_participant',
      'siege_pvp_target_not_participant',
      'Гравець не бере участі в цій облозі.'
    );
  }

  const tgtBj = parseBattleJson(targetRow.battleJson);
  let defenderCounter = false;
  if (tgtBj && isPvpBattleJson(tgtBj)) {
    if (
      tgtBj.pvpTargetCharacterId === attackerRow.id &&
      resolvePlayerCombatMode(tgtBj) === 'siege' &&
      tgtBj.siegeId === siegeRow.id
    ) {
      defenderCounter = true;
      await markAggressorVictimFoughtBackInTx(tx, targetId, attackerRow.id);
    } else {
      throw new SiegePvpError(
        'siege_pvp_target_busy',
        'siege_pvp_target_busy',
        'Гравець уже в бою.'
      );
    }
  } else if (targetRow.battleJson != null) {
    throw new SiegePvpError(
      'siege_pvp_target_busy',
      'siege_pvp_target_busy',
      'Гравець уже в бою.'
    );
  }

  return commitPlayerPvpBattleStartInTx(tx, {
    attackerRow: attackerRow as CharacterRow,
    targetRow: targetRow as CharacterRow,
    expectedRevision,
    ctx: {
      playerCombatMode: 'siege',
      siegeId: siegeRow.id,
      siegeCityId: cid,
      skipWorldGeoChecks: true,
    },
    defenderCounter,
  });
}

export async function startSiegePvpBattleForUser(
  userId: string,
  cityId: string,
  targetCharacterId: string,
  expectedRevision: number,
  characterId?: string | null
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  return prisma.$transaction(async (tx) =>
    startSiegePvpBattleInTx(
      tx,
      userId,
      cityId,
      targetCharacterId,
      expectedRevision,
      characterId
    )
  );
}
