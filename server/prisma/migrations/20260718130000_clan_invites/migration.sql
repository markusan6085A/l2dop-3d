-- CreateTable
CREATE TABLE "ClanInvite" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "inviterCharacterId" TEXT NOT NULL,
    "targetCharacterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "ClanInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClanInvite_targetCharacterId_deliveredAt_idx" ON "ClanInvite"("targetCharacterId", "deliveredAt");

-- CreateIndex
CREATE INDEX "ClanInvite_clanId_targetCharacterId_idx" ON "ClanInvite"("clanId", "targetCharacterId");

-- AddForeignKey
ALTER TABLE "ClanInvite" ADD CONSTRAINT "ClanInvite_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanInvite" ADD CONSTRAINT "ClanInvite_inviterCharacterId_fkey" FOREIGN KEY ("inviterCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanInvite" ADD CONSTRAINT "ClanInvite_targetCharacterId_fkey" FOREIGN KEY ("targetCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
