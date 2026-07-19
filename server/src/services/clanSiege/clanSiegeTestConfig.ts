import { isSiegeCityId } from '../../domain/clanSiegeConfig.js';

/** Стабільний ключ рядка тестової облоги (unique cityId + testKey). */
export const CLAN_SIEGE_TEST_ROW_KEY = '__clan_siege_test__';

export type ClanSiegeTestConfig = {
  enabled: boolean;
  cityId: string;
  startInMinutes: number;
  durationMinutes: number;
};

export function readClanSiegeTestConfig(
  env: NodeJS.ProcessEnv = process.env
): ClanSiegeTestConfig {
  const cityId = String(env.CLAN_SIEGE_TEST_CITY_ID || 'l2dop_giran').trim();
  const startRaw = Number(env.CLAN_SIEGE_TEST_START_IN_MINUTES ?? 2);
  const durationRaw = Number(env.CLAN_SIEGE_TEST_DURATION_MINUTES ?? 20);
  return {
    enabled: env.CLAN_SIEGE_TEST_ENABLED === 'true',
    cityId: isSiegeCityId(cityId) ? cityId : 'l2dop_giran',
    startInMinutes: Number.isFinite(startRaw) && startRaw >= 0 ? startRaw : 2,
    durationMinutes:
      Number.isFinite(durationRaw) && durationRaw >= 1 ? durationRaw : 20,
  };
}
