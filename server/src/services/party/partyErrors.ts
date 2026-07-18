import type { PartyView } from './partyTypes.js';

export class PartyVersionConflictError extends Error {
  readonly code = 'party_version_conflict' as const;
  readonly serverPartyVersion: number;
  readonly party: PartyView | null;

  constructor(serverPartyVersion: number, party: PartyView | null) {
    super('party_version_conflict');
    this.name = 'PartyVersionConflictError';
    this.serverPartyVersion = serverPartyVersion;
    this.party = party;
  }
}
