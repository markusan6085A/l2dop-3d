/** Макс. перевищення рівня гравця над РБ для атаки та кланового завдання kill_raid_boss. */
export const MAX_RAID_BOSS_OVERLEVEL = 9;

export function minRaidBossLevelForCharacter(characterLevel: number): number {
  const lv = Math.floor(Number(characterLevel) || 0);
  return Math.max(1, lv - MAX_RAID_BOSS_OVERLEVEL);
}

/** raidBoss.level >= character.level - 9 (вищий РБ — без верхньої межі). */
export function canCharacterAttackRaidBoss(
  characterLevel: number,
  raidBossLevel: number
): boolean {
  const charLv = Math.floor(Number(characterLevel) || 0);
  const bossLv = Math.floor(Number(raidBossLevel) || 0);
  return charLv - bossLv <= MAX_RAID_BOSS_OVERLEVEL;
}

export function getRaidBossLevelRestrictionMessageUk(characterLevel: number): string {
  const min = minRaidBossLevelForCharacter(characterLevel);
  return (
    'Ваш рівень занадто високий для цього Raid Boss. Ви можете атакувати РБ не нижче ' +
    min +
    ' рівня.'
  );
}

export function raidBossAttackBlockedReasonUk(
  characterLevel: number,
  raidBossLevel: number
): string | null {
  if (canCharacterAttackRaidBoss(characterLevel, raidBossLevel)) return null;
  return 'Недоступно: РБ нижче дозволеного рівня.';
}

export function assertCharacterCanAttackRaidBoss(
  characterLevel: number,
  raidBossLevel: number
): void {
  if (!canCharacterAttackRaidBoss(characterLevel, raidBossLevel)) {
    throw new Error('raid_boss_level_too_high');
  }
}
