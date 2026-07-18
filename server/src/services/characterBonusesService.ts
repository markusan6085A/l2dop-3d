import { prisma } from '../lib/prisma.js';
import {
  buildCharacterBonusesView,
  type CharacterBonusesViewDto,
} from '../domain/characterBonusesView.js';
import type { CharacterRow } from './charTypes.js';

export type { CharacterBonusesViewDto };

export async function getCharacterBonusesForUser(
  userId: string
): Promise<CharacterBonusesViewDto | null> {
  const id = String(userId || '').trim();
  if (!id) return null;

  const row = await prisma.character.findFirst({
    where: { userId: id },
    orderBy: { lastUpdate: 'desc' },
    include: {
      clan: {
        select: {
          name: true,
          level: true,
          hallBlessingAt: true,
        },
      },
    },
  });
  if (!row) return null;

  return buildCharacterBonusesView(row as CharacterRow);
}
