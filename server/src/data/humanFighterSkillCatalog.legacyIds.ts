/** Старі battleId до канонічних `l2_<id>` (міграція без зміни БД вручну). */
export const LEGACY_BATTLE_SKILL_ID_TO_CANONICAL: Record<string, string> = {
  power_strike: 'l2_3',
  mortal_blow: 'l2_16',
  power_shot: 'l2_56',
  war_cry: 'l2_78',
  zealot: 'l2_420',
  stun_attack: 'l2_100',
  whirlwind: 'l2_36',
  thunder_storm: 'l2_48',
  provoke: 'l2_286',
  /** text-rpg: 141 = Armor, 142 = Weapon; файли іконок у датапаку — навпаки, див. skillIconAssetIdForDisplay */
  armor_mastery: 'l2_141',
  weapon_mastery: 'l2_142',
  vicious_stance: 'l2_312',
  focused_attack: 'l2_257',
  /** Старий id «майстерність алебарди» → той самий пасив у text-rpg (216) */
  warlord_polearm_mastery: 'l2_216',
};

export function canonicalBattleSkillId(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return s;
  if (LEGACY_BATTLE_SKILL_ID_TO_CANONICAL[s]) {
    return LEGACY_BATTLE_SKILL_ID_TO_CANONICAL[s]!;
  }
  return s;
}
