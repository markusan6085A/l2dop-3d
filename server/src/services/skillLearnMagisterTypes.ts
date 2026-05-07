import type { HumanFighterSkillKind } from '../data/humanFighterSkillCatalog.js';

/** Magister Rohmer — Town of Gludio (lineage npc 30344). */
export const GLUDIO_MAGISTER_NPC = {
  npcId: 30344,
  nameUk: 'Магістр Ромер',
  nameEn: 'Magister Rohmer',
  titleUk: 'Гільдія магів · Глудіо',
} as const;

export type MagisterNpcPayload = {
  npcId: number;
  nameUk: string;
  nameEn: string;
  titleUk: string;
};

export interface MagisterSkillOffer {
  battleId: string;
  l2SkillId: number;
  minLevel: number;
  spCost: number;
  nameUk: string;
  hintUk: string;
  kind: HumanFighterSkillKind;
  iconUrl: string;
  /** Поточний ранг скіла (0 — не вивчено). */
  skillLevel: number;
  /** Максимальний ранг для цієї здібності. */
  maxSkillLevel: number;
  /** Досягнуто верхнього рангу. */
  learnedMax: boolean;
  /** Є хоча б 1 ранг (для підписів). */
  learned: boolean;
  canLearn: boolean;
  /** Для бойових скілів — базова «сила» з датапаку (не фінальний урон по HP). */
  mpCost: number | null;
  damagePower: number | null;
  statsNoteUk: string | null;
  /** Орієнтовна база удару (як у бою до P. Def.); null — без удару або умови не збігаються. */
  damageHintUk: string | null;
}

export interface MagisterProfessionBanner {
  l2Profession: string;
  /** Кнопки зміни профи для не-людських воїнів (slug → POST /character/profession/{slug}). */
  fighterProfessionChoices?: ReadonlyArray<{ slug: string; labelUk: string }>;
  canBecomeWarrior: boolean;
  warriorMinLevel: number;
  /** Fighter → Human Knight (гілка лицаря). */
  canBecomeKnight: boolean;
  knightMinLevel: number;
  /** Warrior → Warlord (гілка алебарди), рівень як у IL (~40). */
  canBecomeWarlord: boolean;
  warlordMinLevel: number;
  /** Warrior → Gladiator (гілка подвійних мечів), той самий мін. рівень. */
  canBecomeGladiator: boolean;
  gladiatorMinLevel: number;
  /** Human Knight → Paladin. */
  canBecomePaladin: boolean;
  paladinMinLevel: number;
  /** Warlord → Dreadnought (гілка алебарди), мін. 76 р. */
  canBecomeDreadnought: boolean;
  dreadnoughtMinLevel: number;
  /** Gladiator → Duelist, мін. 76 р. */
  canBecomeDuelist: boolean;
  duelistMinLevel: number;
  /** Paladin → Phoenix Knight. */
  canBecomePhoenixKnight: boolean;
  phoenixKnightMinLevel: number;
  /** Human Knight → Dark Avenger (альтернатива Paladin). */
  canBecomeDarkAvenger: boolean;
  darkAvengerMinLevel: number;
  /** Dark Avenger → Hell Knight. */
  canBecomeHellKnight: boolean;
  hellKnightMinLevel: number;
  /** Fighter → Rogue (гілка розбійника). */
  canBecomeRogue: boolean;
  rogueMinLevel: number;
  /** Rogue → Treasure Hunter. */
  canBecomeTreasureHunter: boolean;
  treasureHunterMinLevel: number;
  /** Treasure Hunter → Adventurer. */
  canBecomeAdventurer: boolean;
  adventurerMinLevel: number;
  /** Rogue → Hawkeye (друга профа лучника, l2db). */
  canBecomeHawkeye: boolean;
  hawkeyeMinLevel: number;
  /** Hawkeye → Sagittarius. */
  canBecomeSagittarius: boolean;
  sagittariusMinLevel: number;
  messageUk: string;
  /** Ельф-містик: 1-ша профа (20 р.), гілки l2db. */
  canBecomeElfElvenWizard?: boolean;
  canBecomeElfElvenOracle?: boolean;
  elfMysticFirstMinLevel?: number;
  /** 2-га профа чарівника / жреця (40 р.). */
  canBecomeElfElementalSummoner?: boolean;
  canBecomeElfSpellsinger?: boolean;
  canBecomeElfElvenElder?: boolean;
  elfMysticSecondMinLevel?: number;
  /** 3-тя профа (76 р.). */
  canBecomeElfElementalMaster?: boolean;
  canBecomeElfMysticMuse?: boolean;
  canBecomeElfEvasSaint?: boolean;
  elfMysticThirdMinLevel?: number;
  /** Людина-містик. */
  canBecomeHumanWizard?: boolean;
  canBecomeHumanCleric?: boolean;
  humanMysticFirstMinLevel?: number;
  canBecomeHumanSorcerer?: boolean;
  canBecomeHumanNecromancer?: boolean;
  canBecomeHumanWarlock?: boolean;
  canBecomeHumanBishop?: boolean;
  canBecomeHumanProphet?: boolean;
  humanMysticSecondMinLevel?: number;
  canBecomeHumanArchmage?: boolean;
  canBecomeHumanSoultaker?: boolean;
  canBecomeHumanArcanaLord?: boolean;
  canBecomeHumanCardinal?: boolean;
  canBecomeHumanHierophant?: boolean;
  humanMysticThirdMinLevel?: number;
  /** Темний ельф-містик. */
  canBecomeDarkElfDarkWizard?: boolean;
  canBecomeDarkElfShillienOracle?: boolean;
  darkElfMysticFirstMinLevel?: number;
  canBecomeDarkElfPhantomSummoner?: boolean;
  canBecomeDarkElfSpellhowler?: boolean;
  canBecomeDarkElfShillienElder?: boolean;
  darkElfMysticSecondMinLevel?: number;
  canBecomeDarkElfSpectralMaster?: boolean;
  canBecomeDarkElfStormScreamer?: boolean;
  canBecomeDarkElfShillienSaint?: boolean;
  darkElfMysticThirdMinLevel?: number;
  /** Орк-містик (шаман). */
  canBecomeOrcShaman?: boolean;
  orcMysticFirstMinLevel?: number;
  canBecomeOrcOverlord?: boolean;
  canBecomeOrcWarcryer?: boolean;
  orcMysticSecondMinLevel?: number;
  canBecomeOrcDominator?: boolean;
  canBecomeOrcDoomcryer?: boolean;
  orcMysticThirdMinLevel?: number;
}

export interface MagisterDialogPayload {
  npc: MagisterNpcPayload;
  noteUk: string | null;
  skills: MagisterSkillOffer[];
  profession: MagisterProfessionBanner | null;
}
