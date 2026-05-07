/**
 * Зміна l2Profession (без квестів; expectedRevision у БД).
 * Реалізація — charProfession*.ts.
 */
export {
  performFirstProfessionHumanWarrior,
  performFirstProfessionHumanKnight,
  performFirstProfessionHumanRogue,
} from './charProfessionFirst.js';
export {
  performSecondProfessionHumanTreasureHunter,
  performSecondProfessionHumanHawkeye,
  performThirdProfessionHumanAdventurer,
  performThirdProfessionHumanSagittarius,
} from './charProfessionRogueArcher.js';
export {
  performSecondProfessionHumanPaladin,
  performThirdProfessionHumanPhoenixKnight,
  performSecondProfessionHumanDarkAvenger,
  performThirdProfessionHumanHellKnight,
} from './charProfessionKnight.js';
export {
  performSecondProfessionHumanWarlord,
  performThirdProfessionHumanDreadnought,
  performSecondProfessionHumanGladiator,
  performThirdProfessionHumanDuelist,
} from './charProfessionWarriorBranches.js';
export {
  performFirstProfessionHumanCleric,
  performFirstProfessionHumanWizard,
  performSecondProfessionHumanBishop,
  performSecondProfessionHumanNecromancer,
  performSecondProfessionHumanProphet,
  performSecondProfessionHumanSorcerer,
  performSecondProfessionHumanWarlock,
  performThirdProfessionHumanArcanaLord,
  performThirdProfessionHumanArchmage,
  performThirdProfessionHumanCardinal,
  performThirdProfessionHumanHierophant,
  performThirdProfessionHumanSoultaker,
} from './charProfessionHumanMystic.js';
export {
  performFirstProfessionElfElvenOracle,
  performFirstProfessionElfElvenWizard,
  performSecondProfessionElfElementalSummoner,
  performSecondProfessionElfElvenElder,
  performSecondProfessionElfSpellsinger,
  performThirdProfessionElfElementalMaster,
  performThirdProfessionElfEvasSaint,
  performThirdProfessionElfMysticMuse,
} from './charProfessionElfMystic.js';
export {
  performFirstProfessionDarkElfDarkWizard,
  performFirstProfessionDarkElfShillienOracle,
  performSecondProfessionDarkElfPhantomSummoner,
  performSecondProfessionDarkElfShillienElder,
  performSecondProfessionDarkElfSpellhowler,
  performThirdProfessionDarkElfShillienSaint,
  performThirdProfessionDarkElfSpectralMaster,
  performThirdProfessionDarkElfStormScreamer,
} from './charProfessionDarkElfMystic.js';
export {
  performFirstProfessionOrcShaman,
  performSecondProfessionOrcOverlord,
  performSecondProfessionOrcWarcryer,
  performThirdProfessionOrcDominator,
  performThirdProfessionOrcDoomcryer,
} from './charProfessionOrcMystic.js';
