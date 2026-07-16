export type MysticDebuffControlKind = 'none' | 'soft' | 'hard';

export type MysticDebuffLandProfile = {
  baseChance: number;
  minChance: number;
  maxChance: number;
  control: MysticDebuffControlKind;
};

export type MysticDebuffMode = 'pve' | 'pvp';

type MysticDebuffProfileMap = Readonly<Record<number, MysticDebuffLandProfile>>;

const PVE_PROFILES: MysticDebuffProfileMap = {
  // Cardinal / Bishop / Hierophant
  1034: { baseChance: 0.52, minChance: 0.14, maxChance: 0.84, control: 'soft' }, // Repose
  1042: { baseChance: 0.48, minChance: 0.12, maxChance: 0.8, control: 'soft' }, // Hold Undead
  1049: { baseChance: 0.5, minChance: 0.14, maxChance: 0.82, control: 'soft' }, // Requiem
  1075: { baseChance: 0.52, minChance: 0.15, maxChance: 0.84, control: 'soft' }, // Peace
  // Archmage / Sorcerer
  1056: { baseChance: 0.38, minChance: 0.1, maxChance: 0.78, control: 'hard' }, // Cancel
  // Eva's Saint / Elven Elder
  1273: { baseChance: 0.44, minChance: 0.12, maxChance: 0.82, control: 'hard' }, // Eva's Serenade
  1160: { baseChance: 0.66, minChance: 0.2, maxChance: 0.94, control: 'soft' }, // Slow
  1164: { baseChance: 0.8, minChance: 0.2, maxChance: 0.95, control: 'soft' }, // Curse Weakness
  1184: { baseChance: 0.6, minChance: 0.14, maxChance: 0.84, control: 'soft' }, // Ice Bolt
  1168: { baseChance: 0.69, minChance: 0.2, maxChance: 0.94, control: 'soft' }, // Poison
  1233: { baseChance: 0.63, minChance: 0.18, maxChance: 0.9, control: 'soft' }, // Decay
  // Soultaker / Necromancer
  1156: { baseChance: 0.4, minChance: 0.1, maxChance: 0.78, control: 'hard' }, // Forget
  1163: { baseChance: 0.58, minChance: 0.15, maxChance: 0.88, control: 'soft' }, // Curse Disorder
  1167: { baseChance: 0.62, minChance: 0.18, maxChance: 0.9, control: 'soft' }, // Poison Cloud
  1169: { baseChance: 0.42, minChance: 0.1, maxChance: 0.8, control: 'hard' }, // Fear
  1170: { baseChance: 0.35, minChance: 0.08, maxChance: 0.72, control: 'hard' }, // Anchor
  1263: { baseChance: 0.64, minChance: 0.18, maxChance: 0.9, control: 'soft' }, // Curse Gloom
  1269: { baseChance: 0.67, minChance: 0.2, maxChance: 0.92, control: 'soft' }, // Curse Disease
  1336: { baseChance: 0.33, minChance: 0.07, maxChance: 0.65, control: 'hard' }, // Curse of Doom
  1337: { baseChance: 0.56, minChance: 0.14, maxChance: 0.84, control: 'soft' }, // Curse of Abyss
  1344: { baseChance: 0.52, minChance: 0.12, maxChance: 0.8, control: 'soft' }, // Mass Curse Warrior
  1345: { baseChance: 0.52, minChance: 0.12, maxChance: 0.8, control: 'soft' }, // Mass Curse Mage
};

const PVP_PROFILES: MysticDebuffProfileMap = Object.fromEntries(
  Object.entries(PVE_PROFILES).map(([k, v]) => [
    Number(k),
    {
      ...v,
      baseChance: Math.max(0.2, v.baseChance - (v.control === 'hard' ? 0.1 : 0.08)),
      maxChance: Math.max(0.55, v.maxChance - (v.control === 'hard' ? 0.12 : 0.08)),
    },
  ])
) as MysticDebuffProfileMap;

export function mysticDebuffModeFromEnv(): MysticDebuffMode {
  const raw = String(process.env.L2DOP_MYSTIC_DEBUFF_MODE || '')
    .trim()
    .toLowerCase();
  return raw === 'pvp' ? 'pvp' : 'pve';
}

export function mysticDebuffLandProfileForSkillId(
  skillId: number,
  mode: MysticDebuffMode = mysticDebuffModeFromEnv()
): MysticDebuffLandProfile | undefined {
  const src = mode === 'pvp' ? PVP_PROFILES : PVE_PROFILES;
  return src[skillId];
}

export function mysticDebuffProfileNoteUk(
  skillId: number,
  mode: MysticDebuffMode = mysticDebuffModeFromEnv()
): string | null {
  const p = mysticDebuffLandProfileForSkillId(skillId, mode);
  if (!p) return null;
  const controlUk =
    p.control === 'hard' ? 'жорсткий контроль' : p.control === 'soft' ? 'м`який контроль' : 'дебаф';
  return (
    'Шанс проходу: ~' +
    Math.round(p.baseChance * 100) +
    '% (' +
    Math.round(p.minChance * 100) +
    '-' +
    Math.round(p.maxChance * 100) +
    '%, ' +
    controlUk +
    ', режим ' +
    mode.toUpperCase() +
    ').'
  );
}
