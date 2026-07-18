/**
 * Дерево професій для dev-self-profession (локальний тест портретів).
 * Джерело гілок — MAGISTER_IMMEDIATE_NEXT_PROFESSIONS.
 */
import { MAGISTER_IMMEDIATE_NEXT_PROFESSIONS } from './magisterProfessionGate.js';

const RACE_ROOTS: Readonly<
  Record<
    string,
    { labelUk: string; fighter: string; mystic?: string }
  >
> = {
  Human: { labelUk: 'Людина', fighter: 'human_fighter', mystic: 'human_mage' },
  'Dark Elf': {
    labelUk: 'Темний ельф',
    fighter: 'dark_elf_fighter',
    mystic: 'dark_elf_mage',
  },
  Elf: { labelUk: 'Ельф', fighter: 'elf_fighter', mystic: 'elf_mage' },
  Orc: { labelUk: 'Орк', fighter: 'orc_fighter', mystic: 'orc_mage' },
  Dwarf: { labelUk: 'Гном', fighter: 'dwarf_fighter' },
};

function collectSubtree(root: string): Set<string> {
  const out = new Set<string>([root]);
  const q = [root];
  while (q.length) {
    const p = q.pop()!;
    for (const n of MAGISTER_IMMEDIATE_NEXT_PROFESSIONS[p] ?? []) {
      if (!out.has(n)) {
        out.add(n);
        q.push(n);
      }
    }
  }
  return out;
}

const MYSTIC_PROFESSIONS = new Set<string>();
for (const def of Object.values(RACE_ROOTS)) {
  if (def.mystic) {
    for (const p of collectSubtree(def.mystic)) MYSTIC_PROFESSIONS.add(p);
  }
}

const ALL_DEV_PROFESSIONS = new Set<string>();
for (const def of Object.values(RACE_ROOTS)) {
  for (const p of collectSubtree(def.fighter)) ALL_DEV_PROFESSIONS.add(p);
  if (def.mystic) {
    for (const p of collectSubtree(def.mystic)) ALL_DEV_PROFESSIONS.add(p);
  }
}

export function isDevProfessionAllowed(profRaw: string): boolean {
  const p = String(profRaw || '').trim();
  return p.length > 0 && ALL_DEV_PROFESSIONS.has(p);
}

export function resolveDevProfessionMeta(profRaw: string): {
  race: string;
  classBranch: 'fighter' | 'mystic';
} {
  const p = String(profRaw || '').trim();
  if (p.startsWith('dark_elf_')) {
    return {
      race: 'Dark Elf',
      classBranch: MYSTIC_PROFESSIONS.has(p) ? 'mystic' : 'fighter',
    };
  }
  if (p.startsWith('elf_')) {
    return {
      race: 'Elf',
      classBranch: MYSTIC_PROFESSIONS.has(p) ? 'mystic' : 'fighter',
    };
  }
  if (p.startsWith('orc_')) {
    return {
      race: 'Orc',
      classBranch: MYSTIC_PROFESSIONS.has(p) ? 'mystic' : 'fighter',
    };
  }
  if (p.startsWith('dwarf_')) {
    return { race: 'Dwarf', classBranch: 'fighter' };
  }
  return {
    race: 'Human',
    classBranch: MYSTIC_PROFESSIONS.has(p) ? 'mystic' : 'fighter',
  };
}

function buildTierColumns(root: string): string[][] {
  const tiers: string[][] = [[root]];
  let frontier = [root];
  while (frontier.length) {
    const next: string[] = [];
    for (const p of frontier) {
      for (const c of MAGISTER_IMMEDIATE_NEXT_PROFESSIONS[p] ?? []) {
        next.push(c);
      }
    }
    if (!next.length) break;
    tiers.push(next);
    frontier = next;
  }
  return tiers;
}

export type DevProfessionTreeBranch = {
  branch: 'fighter' | 'mystic';
  labelUk: string;
  tiers: string[][];
};

export type DevProfessionTreeRace = {
  id: string;
  labelUk: string;
  trees: DevProfessionTreeBranch[];
};

export function buildDevProfessionTreePayload(): {
  races: DevProfessionTreeRace[];
} {
  const races: DevProfessionTreeRace[] = [];
  for (const [id, def] of Object.entries(RACE_ROOTS)) {
    const trees: DevProfessionTreeBranch[] = [
      {
        branch: 'fighter',
        labelUk: 'Воїн',
        tiers: buildTierColumns(def.fighter),
      },
    ];
    if (def.mystic) {
      trees.push({
        branch: 'mystic',
        labelUk: 'Маг',
        tiers: buildTierColumns(def.mystic),
      });
    }
    races.push({ id, labelUk: def.labelUk, trees });
  }
  return { races };
}
