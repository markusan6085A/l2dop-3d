import type { FastifyReply } from 'fastify';

export function isPartyBattleWrongSpawnMessage(msg: string): boolean {
  return msg === 'party_battle_wrong_spawn';
}

export function sendPartyBattleWrongSpawn(
  reply: FastifyReply
): ReturnType<FastifyReply['send']> {
  return reply.code(409).send({
    error: 'party_battle_wrong_spawn',
    code: 'party_battle_wrong_spawn',
    messageUk: 'Паті вже б\'ється з іншим монстром.',
  });
}

export function isBattleHuntNotAvailableForPvpMessage(msg: string): boolean {
  return msg === 'battle_hunt_not_available_for_pvp';
}

export function sendBattleHuntNotAvailableForPvp(
  reply: FastifyReply
): ReturnType<FastifyReply['send']> {
  return reply.code(400).send({
    error: 'battle_hunt_not_available_for_pvp',
    messageUk: 'Після PvP повернись на карту — полювання недоступне.',
  });
}
