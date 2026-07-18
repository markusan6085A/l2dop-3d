import { Prisma } from '@prisma/client';

/** Unique violation (P2002). */
export function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
  );
}

/** Unique violation на PartyMember.characterId (@unique). */
export function isPartyMemberCharacterUniqueViolation(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (err.code !== 'P2002') return false;
  const target = err.meta?.target;
  if (typeof target === 'string') {
    return target.includes('characterId');
  }
  if (Array.isArray(target)) {
    return target.some(
      (field) => typeof field === 'string' && field.includes('characterId')
    );
  }
  return false;
}
