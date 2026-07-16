/**
 * Базовий час касту стартових магічних bolt-скілів при castSpd = 600.
 * Фінальний каст = base × (600 / castSpd) — вищий castSpd → коротший каст.
 *
 * НЕ плутати з reuse delay («відкат»): він у `L2DOP_SKILL_REUSE_DELAY_SEC` /
 * `cooldownSec` каталогу і не береться з цьої таблиці.
 */
export const MYSTIC_STARTER_CAST_BASE_SEC: Readonly<Record<number, number>> = {
  1015: 2, // Battle Heal / Бойове зцілення
  1027: 7, // Group Heal / Групове зцілення
  1177: 4, // Wind Strike / Удар вітру
  1184: 3.1, // Ice Bolt / Крижана блискавка (human; elf: 3.0 нижче)
  1164: 1.5, // Curse: Weakness / Прокляття слабкості
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
