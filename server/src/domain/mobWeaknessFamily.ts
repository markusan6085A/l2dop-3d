/**
 * Груба класифікація моба за ім’ям для детектів слабкості (немає типу в спавні).
 */
export type MobWeaknessFamily =
  | 'insect'
  | 'beast'
  | 'plant'
  | 'dragon'
  | 'giant'
  | 'magic'
  | 'undead'
  | 'default';

export type WeaknessKind =
  | 'insect'
  | 'monster'
  | 'animal'
  | 'plant'
  | 'dragon'
  | 'eye_hunter'
  | 'eye_slayer';

/**
 * Класифікація за підрядками в імені (EN + UA/RU). Порядок гілок важливий.
 */
export function inferMobWeaknessFamilyFromName(name: string): MobWeaknessFamily {
  const n = String(name || '').toLowerCase();

  if (
    /dragon|drake|wyrm|lindvior|antharas|valakas|baium|дракон|дрейк|антарас|валакас/i.test(
      n
    )
  ) {
    return 'dragon';
  }

  if (
    /spider|tarantula|bee|bees|beetle|scorpion|larva|stakato|bug|crawler|giant\s+crimson\s+ant|gray\s+ant|crimson\s+ant|ant\s+larva|ant\s+captain|ant\s+warrior|ant\s+worker|паук|мурав|муравей|бджіл|бджол|пчел|пчіл|тарантул|оса|жалящ|комах|шершень|гусениц|черв'як|червяк|клоп|вош|стрибун/i.test(
      n
    )
  ) {
    return 'insect';
  }

  if (
    /treant|fungus|vine|dryad|root|grove|spore|tree\b|plant\b|дриад|дерево|спора|растен|рослин|споров/i.test(
      n
    )
  ) {
    return 'plant';
  }

  if (/giant|golem|colossus|великан/i.test(n)) {
    return 'giant';
  }

  if (
    /wolf|bear|grizzly|boar|fox|rat|hound|lycan|tiger|lion|orc|goblin|keltir|buffalo|unicorn|pixy|sprite|animal|beast|волк|гоблин|гоблін|медвед|медведь|ведмед|ведмідь|ведмеж|кабан|шакал|лис|лиси|лисиц|кобольд|орк|гризл|гризли|тигр|заєц|заяц|овець|овец|козел|коза|конь|кінь|собак|пес|пташк|ворон|сова|орел|лебідь|лебед|качк|гусь|індик|курк|кролик|білк|белк|білочк|птиц/i.test(
      n
    )
  ) {
    return 'beast';
  }

  if (
    /skeleton|zombie|undead|lich|ghost|spectre|corpse|grave|revenant|ghoul|banshee|wight|necro|necromancer|скелет|зомби|зомбі|призрак|привид|дух|нежить|развалин|вампір|вамп|гуль|гуля|упир|упыр|мумі|мертвець|мертвяк|некромант|скелетон/i.test(
      n
    )
  ) {
    return 'undead';
  }

  if (/elemental|ifrit|salamander|undine|sylph/i.test(n)) {
    return 'magic';
  }

  return 'default';
}

export function weaknessMatchesKind(
  kind: WeaknessKind,
  spawnName: string
): boolean {
  const f = inferMobWeaknessFamilyFromName(spawnName);
  switch (kind) {
    case 'monster':
      return true;
    case 'insect':
      return f === 'insect';
    case 'animal':
      return f === 'beast';
    case 'plant':
      return f === 'plant';
    case 'dragon':
      return f === 'dragon';
    case 'eye_hunter':
      return f === 'insect' || f === 'plant' || f === 'beast';
    case 'eye_slayer':
      return (
        f === 'beast' ||
        f === 'dragon' ||
        f === 'giant' ||
        f === 'magic' ||
        f === 'undead' ||
        f === 'default'
      );
    default:
      return false;
  }
}

/**
 * Рядок у лог бою, коли вразливість реально множить урон (не для «monster» — універсальний баф без окремого рядка).
 */
export function formatWeaknessBattleLogUk(
  kind: WeaknessKind,
  weaknessPatkMul: number
): string {
  const pct = Math.round((weaknessPatkMul - 1) * 100);
  switch (kind) {
    case 'insect':
      return `(Вразливість комах: +${pct}% урону!)`;
    case 'animal':
      return `(Вразливість звірів: +${pct}% урону!)`;
    case 'plant':
      return `(Вразливість рослин: +${pct}% урону!)`;
    case 'dragon':
      return `(Вразливість драконів: +${pct}% урону!)`;
    case 'eye_hunter':
      return `(Око мисливця: +${pct}% урону!)`;
    case 'eye_slayer':
      return `(Око вбивці: +${pct}% урону!)`;
    case 'monster':
      return `(Вразливість монстрів: +${pct}% урону!)`;
    default: {
      const _k: never = kind;
      return _k;
    }
  }
}
