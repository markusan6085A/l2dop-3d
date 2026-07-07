import type { FastifyPluginAsync } from 'fastify';
import { registerCharacterReadRoutes } from './characterReadRoutes.js';
import { registerCharacterProfessionRoutes } from './characterProfessionRoutes.js';
import { registerCharacterSkillsBuffEquipRoutes } from './characterSkillsBuffEquipRoutes.js';
import { registerCharacterConsumableUseRoutes } from './characterConsumableUseRoutes.js';
import { registerDevSelfBoostRoutes } from './devSelfBoostRoutes.js';

/**
 * Маршрути /character/* — тонкий фасад; реєстрація в `character*Routes.ts`.
 */
export const characterRoutes: FastifyPluginAsync = async (app) => {
  registerCharacterReadRoutes(app);
  registerCharacterProfessionRoutes(app);
  registerCharacterSkillsBuffEquipRoutes(app);
  registerCharacterConsumableUseRoutes(app);
  registerDevSelfBoostRoutes(app);
};
