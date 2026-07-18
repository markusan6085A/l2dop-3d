export type PartyMemberView = {
  characterId: string;
  name: string;
  level: number;
  professionLabelUk: string;
  isLeader: boolean;
  slotOrder: number;
  joinedAt: string;
  /** Stage D — read-only status (null коли UI вимкнено). */
  online?: boolean;
  nearby?: boolean;
  activeInBattle?: boolean;
};

export type PartyHudActiveBattle = {
  partyBattleId: string;
  spawnId: string;
  mobName: string;
  mobHp: number;
  mobMaxHp: number;
  state: string;
  memberNearby: boolean;
  mobInBattleRange: boolean;
  canJoin: boolean;
};

export type PartyHudRewardNotice = {
  partyBattleId: string;
  expGain: number;
  spGain: number;
  adenaGain: string;
  createdAt: string;
};

export type PartyView = {
  id: string;
  version: number;
  leaderCharacterId: string;
  leaderName: string;
  memberCount: number;
  maxMembers: number;
  createdAt: string;
  members: PartyMemberView[];
  viewerCharacterId: string;
  viewerIsLeader: boolean;
  /** Stage D — active battle summary для party page. */
  activeBattle?: PartyHudActiveBattle | null;
};

export type PartyInviteView = {
  inviteId: string;
  partyId: string;
  partyVersion: number;
  inviterName: string;
  leaderName: string;
  memberCount: number;
  maxMembers: number;
  expiresAt: string;
  createdAt: string;
};

export type GetPartyResult = {
  party: PartyView | null;
};

export type PartyMutationResult = {
  party: PartyView;
};

export type PartyLeaveResult = {
  party: null;
};

export type PartyInvitesListResult = {
  invites: PartyInviteView[];
};

export type PartyHudInvite = {
  inviteId: string;
  inviterCharacterId: string;
  inviterName: string;
  partyVersion: number;
  expiresAt: string;
};

export type PartyHudParty = {
  partyId: string;
  partyVersion: number;
  leaderCharacterId: string;
  memberCount: number;
  maxMembers: number;
  isLeader: boolean;
};

export type PartyHudResult = {
  party: PartyHudParty | null;
  invite: PartyHudInvite | null;
  extraInviteCount: number;
  activeBattle?: PartyHudActiveBattle | null;
  rewardNotice?: PartyHudRewardNotice | null;
};

export type PartyProfileInviteResult = {
  ok: true;
  partyVersion: number;
  createdParty: boolean;
};
