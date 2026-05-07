import type { FastifyInstance } from 'fastify';
import { registerCharacterProfessionRoutesFighterBase } from './characterProfessionRoutesFighterBase.js';
import { registerCharacterProfessionRoutesRogueArcher } from './characterProfessionRoutesRogueArcher.js';
import { registerCharacterProfessionRoutesKnight } from './characterProfessionRoutesKnight.js';
import { registerCharacterProfessionRoutesWarriorBranches } from './characterProfessionRoutesWarriorBranches.js';
import { registerCharacterProfessionRoutesNonHumanFighters } from './characterProfessionRoutesNonHumanFighters.js';
import { registerCharacterProfessionRoutesElfMystic } from './characterProfessionRoutesElfMystic.js';
import { registerCharacterProfessionRoutesHumanMystic } from './characterProfessionRoutesHumanMystic.js';
import { registerCharacterProfessionRoutesDarkElfMystic } from './characterProfessionRoutesDarkElfMystic.js';
import { registerCharacterProfessionRoutesOrcMystic } from './characterProfessionRoutesOrcMystic.js';

/** POST /character/profession/* — зміна l2Profession. */
export function registerCharacterProfessionRoutes(app: FastifyInstance): void {
  registerCharacterProfessionRoutesFighterBase(app);
  registerCharacterProfessionRoutesRogueArcher(app);
  registerCharacterProfessionRoutesKnight(app);
  registerCharacterProfessionRoutesWarriorBranches(app);
  registerCharacterProfessionRoutesNonHumanFighters(app);
  registerCharacterProfessionRoutesHumanMystic(app);
  registerCharacterProfessionRoutesElfMystic(app);
  registerCharacterProfessionRoutesDarkElfMystic(app);
  registerCharacterProfessionRoutesOrcMystic(app);
}
