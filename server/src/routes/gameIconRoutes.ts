import { createReadStream } from 'node:fs';
import type { FastifyInstance } from 'fastify';
import { resolveL2dopItemIconJpgPath } from '../services/l2dopItemIconPath.js';
import { resolveL2dopSkillIconJpgPath } from '../services/l2dopSkillIconPath.js';
import { renderL2dopSkillIconCrispPng } from '../services/l2dopSkillIconCrispRender.js';
import {
  mimeTypeForPublicSkillIcon,
  resolvePublicSkillIconPath,
} from '../services/publicSkillIconPath.js';

export function registerGameIconRoutes(app: FastifyInstance): void {
  /**
   * Реальні іконки `l2dop/img/items/{id}.jpg` (як у PHP). Без авторизації — для `<img src>`.
   * Якщо файлу немає — редірект на локальну SVG-заглушку.
   */
  app.get('/item-icon/:itemId', async (request, reply) => {
    const raw = (request.params as { itemId: string }).itemId;
    const itemId = parseInt(raw, 10);
    if (!Number.isFinite(itemId) || itemId < 1) {
      return reply.code(404).send();
    }
    const filePath = resolveL2dopItemIconJpgPath(itemId);
    if (!filePath) {
      return reply.redirect('/icons/drops/other.svg', 302);
    }
    reply.header('Cache-Control', 'public, max-age=86400');
    return reply.type('image/jpeg').send(createReadStream(filePath));
  });

  /**
   * Іконки скіла: 1) `server/public/skills/skill{n}.*` (gif/jpg/png) — твій імпорт з text-rpg;
   * 2) інакше l2dop `skill{n}.jpg`. З `?dpr=` — PNG nearest-neighbour (×2 UI × dpr).
   */
  app.get('/skill-icon/:skillId', async (request, reply) => {
    const raw = (request.params as { skillId: string }).skillId;
    const skillId = parseInt(raw, 10);
    if (!Number.isFinite(skillId) || skillId < 1) {
      return reply.code(404).send();
    }
    const fromPublic = resolvePublicSkillIconPath(skillId);
    const filePath = fromPublic ?? resolveL2dopSkillIconJpgPath(skillId);
    if (!filePath) {
      return reply.redirect('/icons/drops/other.svg', 302);
    }
    const q = request.query as { dpr?: string };
    const dprParsed = Number.parseFloat(String(q?.dpr ?? ''));
    const hasDpr = Number.isFinite(dprParsed) && dprParsed > 0;
    reply.header('Cache-Control', 'public, max-age=86400');
    if (hasDpr) {
      try {
        const png = await renderL2dopSkillIconCrispPng(filePath, dprParsed);
        return reply.type('image/png').send(png);
      } catch (err) {
        request.log.warn({ err }, 'skill-icon crisp PNG failed, fallback stream');
      }
    }
    const mime = fromPublic
      ? mimeTypeForPublicSkillIcon(filePath)
      : 'image/jpeg';
    return reply.type(mime).send(createReadStream(filePath));
  });
}
