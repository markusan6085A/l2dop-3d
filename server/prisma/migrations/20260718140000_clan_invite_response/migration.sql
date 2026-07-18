-- AlterTable
ALTER TABLE "ClanInvite" ADD COLUMN "respondedAt" TIMESTAMP(3);
ALTER TABLE "ClanInvite" ADD COLUMN "response" TEXT;

-- CreateIndex
CREATE INDEX "ClanInvite_targetCharacterId_respondedAt_idx" ON "ClanInvite"("targetCharacterId", "respondedAt");
