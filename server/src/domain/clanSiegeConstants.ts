export const CLAN_SIEGE_STATE = {
  scheduled: 'scheduled',
  active: 'active',
  finished: 'finished',
} as const;

export type ClanSiegeStateValue =
  (typeof CLAN_SIEGE_STATE)[keyof typeof CLAN_SIEGE_STATE];

export const CLAN_SIEGE_FINISH_REASON = {
  wallDestroyed: 'wall_destroyed',
  timeExpired: 'time_expired',
} as const;

export type ClanSiegeFinishReasonValue =
  (typeof CLAN_SIEGE_FINISH_REASON)[keyof typeof CLAN_SIEGE_FINISH_REASON];
