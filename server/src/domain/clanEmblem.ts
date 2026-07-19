export const CLAN_EMBLEM_MIN_ID = 1;
export const CLAN_EMBLEM_MAX_ID = 40;

export type ParsedClanEmblemId =
  | { ok: true; emblemId: number }
  | { ok: false; code: 'clan_emblem_invalid' };

export function clanEmblemPublicUrl(emblemId: number): string {
  return `/clans-emblems/${Math.floor(emblemId)}.jpg`;
}

export function parseClanEmblemId(raw: unknown): ParsedClanEmblemId {
  if (raw === null || raw === undefined || raw === '') {
    return { ok: false, code: 'clan_emblem_invalid' };
  }
  if (typeof raw === 'number' && !Number.isInteger(raw)) {
    return { ok: false, code: 'clan_emblem_invalid' };
  }
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n)) {
    return { ok: false, code: 'clan_emblem_invalid' };
  }
  if (n < CLAN_EMBLEM_MIN_ID || n > CLAN_EMBLEM_MAX_ID) {
    return { ok: false, code: 'clan_emblem_invalid' };
  }
  return { ok: true, emblemId: n };
}
