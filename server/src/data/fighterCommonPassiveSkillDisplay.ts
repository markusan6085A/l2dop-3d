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
      'Пасив: +P.Def (%) у важкій броні (Warrior / Warlord / Orc / Dwarf). ' +
      '1 р. — +1.9%, 50 р. — +79.3%. Лише важка броня.',
  },
  232: {
    nameUk: 'Майстерність важкої броні (Heavy Armor Mastery)',
    hintUk:
      'Пасив: +P.Def (flat) у важкій броні. 1 р. — +17.7 (20 лв), 52 р. — +172.6 (74 лв). ' +
      'Knight / Temple / Shillien Knight. Лише важка броня.',
  },
  257: {
    nameUk: 'Майстерність меча й булави (Sword / Blunt Mastery)',
    hintUk:
      'Пасив: +P.Atk (flat) з мечем або булавою. 1 р. — +1.5 (20 лв), 45 р. — +76.4 (74 лв). ' +
      'Human Knight → Dark Avenger; також Orc / Gladiator.',
  },
  147: {
    nameUk: 'Опір магії (Magic Resistance)',
    hintUk:
      'Пасив: +M.Def (flat). 1 р. — +19, 51 р. (74 лв) — +108. Knight / Paladin / Dark Avenger та Elf/Dark Elf лицарі.',
  },
  153: {
    nameUk: 'Майстерність щита (Shield Mastery)',
    hintUk:
      'Пасив: підвищує ефективність захисту щита при блоці (Shield Defence Rate). 1 р. — 50%, 4 р. (52 лв) — 100%. Ранги 1–2 — Knight; 3–4 — Paladin / Dark Avenger / Temple / Shillien Knight. Лише з екіпованим щитом.',
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
