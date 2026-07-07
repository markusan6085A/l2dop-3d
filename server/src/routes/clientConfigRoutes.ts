import type { FastifyPluginAsync } from 'fastify';
import { isDevSelfBoostEnabled } from '../services/devSelfBoostService.js';

/** Публічні прапорці для UI (без auth). */
export const clientConfigRoutes: FastifyPluginAsync = async (app) => {
  app.get('/client-config', async () => ({
    devSelfBoost: isDevSelfBoostEnabled(),
  }));
};
