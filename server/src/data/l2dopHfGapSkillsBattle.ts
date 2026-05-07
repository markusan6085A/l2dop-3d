/**
 * MP / power для «gap» скілів HF (text-rpg TreasureHunter / Adventurer / Knight / DA).
 * Лінійна інтерполяція між 1-м і останнім рангом, якщо повний ряд не винесено.
 */

function clampRank(rank: number, max: number): number {
  return Math.min(Math.max(1, Math.floor(rank)), max);
}

function lin(
  rank: number,
  rMax: number,
  v1: number,
  vMax: number
): number {
  const r = clampRank(rank, rMax);
  if (rMax <= 1) return v1;
  return Math.round(v1 + ((r - 1) * (vMax - v1)) / (rMax - 1));
}

/** Удар у спину (30) — Skill_0030, 37 рангів. */
export function backstabMpAndPower(rank: number): { mp: number; power: number } {
  return {
    mp: lin(rank, 37, 53, 111),
    power: lin(rank, 37, 1107, 5479),
  };
}

/** Смертельний удар TH (263) — Skill_0263. */
export function deadlyBlowThMpAndPower(rank: number): {
  mp: number;
  power: number;
} {
  return {
    mp: lin(rank, 37, 36, 75),
    power: lin(rank, 37, 1107, 5479),
  };
}

/** Підміна (12) — Skill_0012, 14 рангів. */
export function switchMp(rank: number): number {
  return lin(rank, 14, 45, 83);
}

/** Без ключа: відмикання (27) — рівні 6–14 у text-rpg. */
export function unlockMp(rank: number): number {
  const r = clampRank(rank, 14);
  return lin(r, 14, 35, 67);
}

export function lureMp(): number {
  return 44;
}

/** Lethal Blow Adventurer (344) — один ранг у text-rpg. */
export function lethalBlowAdvMpAndPower(_rank: number): {
  mp: number;
  power: number;
} {
  return { mp: 85, power: 5773 };
}

/** Святий удар (49) — наближено. */
export function holyStrikeMpAndPower(rank: number): {
  mp: number;
  power: number;
} {
  return { mp: lin(rank, 10, 40, 55), power: lin(rank, 10, 1200, 2100) };
}

/** Підріз сухожилля DA (127). */
export function hamstringDaMpAndPower(rank: number): {
  mp: number;
  power: number;
} {
  return { mp: lin(rank, 10, 32, 48), power: lin(rank, 10, 900, 1600) };
}

/** Чума трупа (103). */
export function corpsePlagueMpAndPower(rank: number): {
  mp: number;
  power: number;
} {
  return { mp: lin(rank, 8, 45, 62), power: lin(rank, 8, 800, 1400) };
}

/** Дотик життя / смерті (341/342). */
export function touchOfLifeMpAndPower(rank: number): {
  mp: number;
  power: number;
} {
  return { mp: lin(rank, 5, 55, 75), power: lin(rank, 5, 2000, 3500) };
}

export function touchOfDeathMpAndPower(rank: number): {
  mp: number;
  power: number;
} {
  return { mp: lin(rank, 5, 50, 70), power: lin(rank, 5, 2500, 4200) };
}
