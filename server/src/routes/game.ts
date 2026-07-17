import type { FastifyPluginAsync } from 'fastify';
import { registerGameBattleRoutes } from './gameBattleRoutes.js';
import { registerGameIconRoutes } from './gameIconRoutes.js';
import { registerGameChatRoutes } from './gameChatRoutes.js';
import { registerGameOnlineRoutes } from './gameOnlineRoutes.js';
import { registerGameRatingsRoutes } from './gameRatingsRoutes.js';
import { marketReadRoutes } from './marketRoutes.js';
import { registerGamePlayerRoutes } from './gamePlayerRoutes.js';
import { registerGameResourceCraftRoutes } from './gameResourceCraftRoutes.js';
import { registerGameWorldRoutes } from './gameWorldRoutes.js';
import { registerGameNewsRoutes } from './gameNewsRoutes.js';

export const gameRoutes: FastifyPluginAsync = async (app) => {
  registerGameIconRoutes(app);
  registerGameWorldRoutes(app);
  registerGameNewsRoutes(app);
  registerGameBattleRoutes(app);
  registerGameResourceCraftRoutes(app);
  registerGameOnlineRoutes(app);
  registerGameRatingsRoutes(app);
  await app.register(marketReadRoutes);
  registerGameChatRoutes(app);
  registerGamePlayerRoutes(app);
};
