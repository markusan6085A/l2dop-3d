/**
 * Єдине джерело nameUk/hintUk для спільних пасивів воїнів (усі раси).
 * Редагуй тут → `npm run gen:race-fighter-skills` оновить расові каталоги.
 * Бойові таблиці (powerByRank) — у textRpgPassiveEffects / mastery tables.
 */
export const FIGHTER_COMMON_PASSIVE_UK_BY_L2_ID = {
  211: {
    nameUk: 'Підсилення HP (Boost HP)',
    hintUk:
      'Пасив: збільшує максимальне HP (1 р. — +60, 10 р. — +480). Однакова таблиця для всіх класів.',
  },
  216: {
    nameUk: 'Майстерність древка (Polearm Mastery)',
    hintUk:
      'Пасив: +P. Atk (flat) зі списом або алебардою (1 р. — +4.5, 43 р. — +122.1).',
  },
  217: {
    nameUk: 'Майстерність меча й булави (Sword / Blunt Mastery)',
    hintUk:
      'Пасив: +P. Atk (flat) з мечем або булавою (1 р. — +1.5, 8 р. — +11.1). Elf / Dark Elf / Orc.',
  },
  227: {
    nameUk: 'Майстерність легкої броні (Light Armor Mastery)',
    hintUk:
      'Пасив: +P. Def (%) і ухилення в легкій броні (1 р. — +4.2% P. Def / +3 ухил., 50 р. — +81.3% / +6).',
  },
  231: {
    nameUk: 'Майстерність важкої броні (Heavy Armor Mastery)',
    hintUk:
      'Пасив: підвищує P. Def (%) у важкій броні (1 р. — +1.9%, 50 р. — +79.3%).',
  },
  257: {
    nameUk: 'Майстерність меча й булави (Sword / Blunt Mastery)',
    hintUk:
      'Пасив: +P. Atk (flat) з мечем або булавою (1 р. — +4.5, 43 р. — +122.1). Human Fighter.',
  },
} as const;

export type FighterPassiveDisplay = {
  nameUk: string;
  hintUk: string;
};

export function fighterPassiveDisplay(
  l2SkillId: number
): FighterPassiveDisplay | undefined {
  const row =
    FIGHTER_COMMON_PASSIVE_UK_BY_L2_ID[
      l2SkillId as keyof typeof FIGHTER_COMMON_PASSIVE_UK_BY_L2_ID
    ];
  return row ?? undefined;
}

export function fighterPassiveNameUk(l2SkillId: number): string | undefined {
  return fighterPassiveDisplay(l2SkillId)?.nameUk;
}

export function fighterPassiveHintUk(l2SkillId: number): string | undefined {
  return fighterPassiveDisplay(l2SkillId)?.hintUk;
}
