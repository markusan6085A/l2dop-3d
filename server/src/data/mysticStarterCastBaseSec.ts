/**
 * Базовий час касту стартових магічних bolt-скілів при castSpd = 600.
 * Фінальний каст = base × (600 / castSpd) — вищий castSpd → коротший каст.
 *
 * Один l2SkillId → однаковий base у всіх расах/професіях, де скіл є в каталозі.
 */
export const MYSTIC_STARTER_CAST_BASE_SEC: Readonly<Record<number, number>> = {
  1177: 2.8, // Wind Strike / Удар вітру
  1184: 2.8, // Ice Bolt / Крижана блискавка (ельфи: 3.0, див. нижче)
  1147: 3.2, // Vampiric Touch / Вампірний дотик
  1031: 1.9, // Disrupt Undead / Розсіювання мерців
  1178: 2.8, // Aqua Swirl
  1172: 1.8, // Aura Burn / Аура полум'я
  1274: 2.0, // Energy Bolt / Енергетична блискавка
  1090: 2.8, // Life Drain (орк-маг)
};

const ELF_ICE_BOLT_CAST_BASE_SEC = 3.0;

/** Базовий каст @ castSpd 600, або null якщо скіл не в таблиці override. */
export function mysticStarterCastBaseSec(
  l2SkillId: number,
  classBranch: string
): number | null {
  const id = Math.floor(l2SkillId);
  if (id === 1184 && classBranch.startsWith('elf_')) {
    return ELF_ICE_BOLT_CAST_BASE_SEC;
  }
  const base = MYSTIC_STARTER_CAST_BASE_SEC[id];
  return typeof base === 'number' && base > 0 ? base : null;
}
