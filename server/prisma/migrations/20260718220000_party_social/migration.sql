-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "leaderCharacterId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyMember" (
    "partyId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "slotOrder" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyMember_pkey" PRIMARY KEY ("partyId","characterId")
);

-- CreateTable
CREATE TABLE "PartyInvite" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "inviterCharacterId" TEXT NOT NULL,
    "targetCharacterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_leaderCharacterId_key" ON "Party"("leaderCharacterId");

-- CreateIndex
CREATE UNIQUE INDEX "PartyMember_characterId_key" ON "PartyMember"("characterId");

-- CreateIndex
CREATE INDEX "PartyMember_partyId_idx" ON "PartyMember"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "PartyInvite_partyId_targetCharacterId_key" ON "PartyInvite"("partyId", "targetCharacterId");

-- CreateIndex
CREATE INDEX "PartyInvite_targetCharacterId_idx" ON "PartyInvite"("targetCharacterId");

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_leaderCharacterId_fkey" FOREIGN KEY ("leaderCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyMember" ADD CONSTRAINT "PartyMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyMember" ADD CONSTRAINT "PartyMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyInvite" ADD CONSTRAINT "PartyInvite_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyInvite" ADD CONSTRAINT "PartyInvite_inviterCharacterId_fkey" FOREIGN KEY ("inviterCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyInvite" ADD CONSTRAINT "PartyInvite_targetCharacterId_fkey" FOREIGN KEY ("targetCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
