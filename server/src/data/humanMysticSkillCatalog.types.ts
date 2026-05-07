/** Рівень скіла (text-rpg SkillLevelDefinition). */
export type HumanMysticSkillLevelRow = {
  level: number;
  requiredLevel: number;
  spCost: number;
  mpCost: number;
  power: number;
};

export type HumanMysticSkillEffectRow = {
  stat: string;
  mode: string;
  value?: number;
};

export type HumanMysticSkillKind = 'battle' | 'passive' | 'toggle';

export interface HumanMysticSkillCatalogEntry {
  battleId: string;
  l2SkillId: number;
  minLevel: number;
  spCost: number;
  nameUk: string;
  hintUk: string;
  kind: HumanMysticSkillKind;
  /** Категорія з text-rpg (magic_attack, buff, …). */
  category: string;
  /** l2Profession, для яких рядок магістра / бойова перевірка. */
  visibleForProfessions: readonly string[];
  levels: readonly HumanMysticSkillLevelRow[];
  effects: readonly HumanMysticSkillEffectRow[];
  cooldownSec: number | null;
  /** Дія без зміни HP моба (баф, зцілення гравця, toggle тощо). */
  skipMobHp: boolean;
  /**
   * Автоген каталогів воїнів (не-людь): скіл лише з common і minLevel > 20 —
   * не показувати в магістрі для базового Fighter без 1-ї професії.
   */
  hideAtBaseFighterUntilFirstProf?: boolean;
}
