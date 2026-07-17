/** Правила створення клану (pure). */
export const CLAN_CREATE_MIN_LEVEL = 20;
export const CLAN_CREATE_COST_ADENA = 1n;
export const CLAN_NAME_MIN_LEN = 3;
export const CLAN_NAME_MAX_LEN = 16;

/** Латиниця, кирилиця, цифри — без пробілів і спецсимволів. */
const CLAN_NAME_RE = /^[\p{L}\p{N}]+$/u;

const CLAN_NAME_BLOCKED = [
  'admin',
  'gm',
  'moderator',
  'хуй',
  'пизд',
  'бля',
  'сука',
  'fuck',
  'shit',
];

export type ClanNameValidation =
  | { ok: true; name: string }
  | { ok: false; code: string };

export function normalizeClanName(raw: unknown): ClanNameValidation {
  if (raw == null) {
    return { ok: false, code: 'clan_name_required' };
  }
  const name = String(raw).trim();
  if (name.length < CLAN_NAME_MIN_LEN || name.length > CLAN_NAME_MAX_LEN) {
    return { ok: false, code: 'clan_name_length' };
  }
  if (!CLAN_NAME_RE.test(name)) {
    return { ok: false, code: 'clan_name_chars' };
  }
  const lower = name.toLowerCase();
  for (const bad of CLAN_NAME_BLOCKED) {
    if (lower.includes(bad)) {
      return { ok: false, code: 'clan_name_offensive' };
    }
  }
  return { ok: true, name };
}
