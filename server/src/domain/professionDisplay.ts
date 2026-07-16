/** Коротка назва професії з l2Profession (узгоджено з HUD у common.js). */
export function professionDisplayUk(l2Profession: string | null | undefined): string {
  const p = String(l2Profession ?? '').trim().toLowerCase();
  if (!p) return '—';
  let core = p;
  const prefixes = [
    'dark_elf_',
    'human_',
    'elf_',
    'orc_',
    'dwarf_',
  ] as const;
  for (const pref of prefixes) {
    if (core.startsWith(pref)) {
      core = core.slice(pref.length);
      break;
    }
  }
  if (!core) return '—';
  const words = core.split('_').filter(Boolean);
  if (!words.length) return core;
  const text = words.join(' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
