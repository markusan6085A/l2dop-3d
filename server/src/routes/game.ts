import type { FastifyPluginAsync } from 'fastify';
import { registerGameBattleRoutes } from './gameBattleRoutes.js';
import { registerGameIconRoutes } from './gameIconRoutes.js';
import { registerGameOnlineRoutes } from './gameOnlineRoutes.js';
import { registerGameResourceCraftRoutes } from './gameResourceCraftRoutes.js';
import { registerGameWorldRoutes } from './gameWorldRoutes.js';

export const gameRoutes: FastifyPluginAsync = async (app) => {
  registerGameIconRoutes(app);
  registerGameWorldRoutes(app);
  registerGameBattleRoutes(app);
  registerGameResourceCraftRoutes(app);
  registerGameOnlineRoutes(app);
};
