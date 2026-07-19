import type { Prisma } from '@prisma/client';

/** Лідер + 4 учасники. */
export const PARTY_MAX_MEMBERS = 5;

/** TTL активного запрошення (мс). */
export const PARTY_INVITE_TTL_MS = 2 * 60 * 1000;

export const PARTY_MEMBER_INCLUDE = {
  character: {
    select: {
      id: true,
      name: true,
      level: true,
      l2Profession: true,
      clan: { select: { emblemId: true } },
    },
  },
} satisfies Prisma.PartyMemberInclude;

export const PARTY_VIEW_INCLUDE = {
  leader: { select: { id: true, name: true } },
  members: {
    orderBy: [{ slotOrder: 'asc' as const }, { joinedAt: 'asc' as const }],
    include: PARTY_MEMBER_INCLUDE,
  },
  _count: { select: { members: true } },
} satisfies Prisma.PartyInclude;

export type PartyDbRow = Prisma.PartyGetPayload<{
  include: typeof PARTY_VIEW_INCLUDE;
}>;
