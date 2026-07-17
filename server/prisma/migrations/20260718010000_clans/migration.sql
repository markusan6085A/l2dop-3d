-- CreateTable
CREATE TABLE "Clan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Character" ADD COLUMN "clanId" TEXT;
ALTER TABLE "Character" ADD COLUMN "clanRole" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Clan_name_key" ON "Clan"("name");
CREATE UNIQUE INDEX "Clan_leaderId_key" ON "Clan"("leaderId");
CREATE INDEX "Character_clanId_idx" ON "Character"("clanId");

-- AddForeignKey
ALTER TABLE "Clan" ADD CONSTRAINT "Clan_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Character" ADD CONSTRAINT "Character_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
