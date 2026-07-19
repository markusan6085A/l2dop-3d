-- AlterTable
ALTER TABLE "ClanSiegeParticipant" ADD COLUMN "eliminatedAt" TIMESTAMP(3),
ADD COLUMN "eliminatedByCharacterId" TEXT;
