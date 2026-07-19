-- AlterTable
ALTER TABLE "ClanSiegeParticipant" ADD COLUMN "lastIncomingAttackerCharacterId" TEXT,
ADD COLUMN "lastIncomingAttackerName" TEXT,
ADD COLUMN "lastIncomingDamage" INTEGER,
ADD COLUMN "lastIncomingAt" TIMESTAMP(3);
