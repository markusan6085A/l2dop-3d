/** Емблеми без файлу в `server/public/clans-emblems/` (37 шт. загалом). */
export const CLAN_EMBLEM_GAP_IDS = [36, 38, 39] as const;

export const CLAN_EMBLEM_MIN_ID = 1;
export const CLAN_EMBLEM_MAX_ID = 40;
export const CLAN_EMBLEM_COUNT =
  CLAN_EMBLEM_MAX_ID - CLAN_EMBLEM_MIN_ID + 1 - CLAN_EMBLEM_GAP_IDS.length;

export type ParsedClanEmblemId =
  | { ok: true; emblemId: number }
  | { ok: false; code: 'clan_emblem_invalid' };

const GAP_SET = new Set<number>(CLAN_EMBLEM_GAP_IDS);

export function listClanEmblemIds(): number[] {
  const ids: number[] = [];
  for (let id = CLAN_EMBLEM_MIN_ID; id <= CLAN_EMBLEM_MAX_ID; id++) {
    if (!GAP_SET.has(id)) ids.push(id);
  }
  return ids;
}

export function isValidClanEmblemId(raw: number): boolean {
  return (
    Number.isInteger(raw) &&
    raw >= CLAN_EMBLEM_MIN_ID &&
    raw <= CLAN_EMBLEM_MAX_ID &&
    !GAP_SET.has(raw)
  );
}

export function clanEmblemPublicUrl(emblemId: number): string {
  return `/clans-emblems/${Math.floor(emblemId)}.png`;
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
  if (!isValidClanEmblemId(n)) {
    return { ok: false, code: 'clan_emblem_invalid' };
  }
  return { ok: true, emblemId: n };
}
