import type { FastifyPluginAsync } from 'fastify';
import { registerCharacterReadRoutes } from './characterReadRoutes.js';
import { registerCharacterProfessionRoutes } from './characterProfessionRoutes.js';
import { registerCharacterSkillsBuffEquipRoutes } from './characterSkillsBuffEquipRoutes.js';
import { registerCharacterConsumableUseRoutes } from './characterConsumableUseRoutes.js';
import { registerCharacterProfileStatusRoutes } from './characterProfileStatusRoutes.js';
import { registerDevSelfBoostRoutes } from './devSelfBoostRoutes.js';
import { registerWarehouseRoutes } from './warehouseRoutes.js';
import { registerCharacterProfessionQuestRoutes } from './characterProfessionQuestRoutes.js';
import { registerCharacterDailyQuestRoutes } from './characterDailyQuestRoutes.js';
import { registerMarketMutationRoutes } from './marketRoutes.js';

/**
 * Маршрути /character/* — тонкий фасад; реєстрація в `character*Routes.ts`.
 */
export const characterRoutes: FastifyPluginAsync = async (app) => {
  registerCharacterReadRoutes(app);
  registerCharacterProfessionRoutes(app);
  registerCharacterSkillsBuffEquipRoutes(app);
  registerCharacterConsumableUseRoutes(app);
  registerCharacterProfileStatusRoutes(app);
  registerDevSelfBoostRoutes(app);
  registerWarehouseRoutes(app);
  registerCharacterProfessionQuestRoutes(app);
  registerCharacterDailyQuestRoutes(app);
  registerMarketMutationRoutes(app);
};
