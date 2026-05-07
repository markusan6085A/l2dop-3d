import type { MysticDebuffControlKind } from './l2dopMysticDebuffProfiles.js';

type SpotDebuffTuningRow = {
  id: string;
  nameUk: string;
  mobNameIncludes: readonly string[];
  hardMul: number;
  softMul: number;
  noneMul: number;
};

const SPOT_DEBUFF_TUNING: readonly SpotDebuffTuningRow[] = [
  {
    id: 'ketra',
    nameUk: 'Кетра',
    mobNameIncludes: ['ketra '],
    hardMul: 0.96,
    softMul: 0.98,
    noneMul: 1,
  },
  {
    id: 'varka',
    nameUk: 'Варка',
    mobNameIncludes: ['varka '],
    hardMul: 0.95,
    softMul: 0.98,
    noneMul: 1,
  },
  {
    id: 'toi',
    nameUk: 'Tower of Insolence',
    mobNameIncludes: ['toi ', 'tower of insolence'],
    hardMul: 0.88,
    softMul: 0.92,
    noneMul: 0.96,
  },
  {
    id: 'imperial_tomb',
    nameUk: 'Imperial Tomb',
    mobNameIncludes: ['imperial tomb', 'sepulcher', 'sepulch', 'hallate'],
    hardMul: 0.84,
    softMul: 0.9,
    noneMul: 0.95,
  },
  {
    id: 'frozen_labyrinth',
    nameUk: 'Frozen Labyrinth',
    mobNameIncludes: ['frozen labyrinth', 'ice ', 'frost '],
    hardMul: 0.9,
    softMul: 0.94,
    noneMul: 0.98,
  },
  {
    id: 'hot_springs',
    nameUk: 'Hot Springs',
    mobNameIncludes: ['hot springs'],
    hardMul: 0.97,
    softMul: 1,
    noneMul: 1.02,
  },
];

function detectSpotByMobName(mobName: string): SpotDebuffTuningRow | undefined {
  const n = mobName.trim().toLowerCase();
  if (!n) return undefined;
  return SPOT_DEBUFF_TUNING.find((row) =>
    row.mobNameIncludes.some((token) => n.includes(token))
  );
}

export function mysticDebuffSpotChanceMultiplier(
  mobName: string,
  control: MysticDebuffControlKind
): number {
  const spot = detectSpotByMobName(mobName);
  if (!spot) return 1;
  if (control === 'hard') return spot.hardMul;
  if (control === 'soft') return spot.softMul;
  return spot.noneMul;
}

export function mysticDebuffSpotLabelUk(mobName: string): string | null {
  const spot = detectSpotByMobName(mobName);
  return spot?.nameUk ?? null;
}
