-- CreateTable
CREATE TABLE "ClanChatMessage" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClanChatMessage_clanId_createdAt_idx" ON "ClanChatMessage"("clanId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ClanChatMessage" ADD CONSTRAINT "ClanChatMessage_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanChatMessage" ADD CONSTRAINT "ClanChatMessage_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
