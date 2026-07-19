-- Clan dragon dungeon: move diamonds to clan, shared HP battles.

-- AlterTable Clan: treasury + diamonds
ALTER TABLE "Clan" ADD COLUMN "diamonds" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Clan" ADD COLUMN "treasuryAdena" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "Clan" ADD COLUMN "treasuryCoinOfLuck" INTEGER NOT NULL DEFAULT 0;

-- Drop personal dragon unlock table
DROP TABLE IF EXISTS "CharacterDragonDungeonUnlock";

-- Remove personal diamonds (do not migrate values to clan)
ALTER TABLE "Character" DROP COLUMN IF EXISTS "diamonds";

-- CreateTable ClanDragonDungeon
CREATE TABLE "ClanDragonDungeon" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "dragonId" TEXT NOT NULL,
    "maxHp" BIGINT NOT NULL,
    "currentHp" BIGINT NOT NULL,
    "openedById" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "defeatedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "rewardPaidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanDragonDungeon_pkey" PRIMARY KEY ("id")
);

-- CreateTable ClanDragonContribution
CREATE TABLE "ClanDragonContribution" (
    "id" TEXT NOT NULL,
    "dungeonId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "damageDealt" BIGINT NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "activeBattleAt" TIMESTAMP(3),
    "battleEndsAt" TIMESTAMP(3),
    "lastEnteredAt" TIMESTAMP(3),
    "nextEntryAt" TIMESTAMP(3),
    "battleStateJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanDragonContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClanDragonDungeon_clanId_idx" ON "ClanDragonDungeon"("clanId");
CREATE INDEX "ClanDragonDungeon_clanId_dragonId_idx" ON "ClanDragonDungeon"("clanId", "dragonId");
CREATE INDEX "ClanDragonDungeon_expiresAt_idx" ON "ClanDragonDungeon"("expiresAt");

CREATE UNIQUE INDEX "ClanDragonContribution_dungeonId_characterId_key" ON "ClanDragonContribution"("dungeonId", "characterId");
CREATE INDEX "ClanDragonContribution_dungeonId_damageDealt_idx" ON "ClanDragonContribution"("dungeonId", "damageDealt");
CREATE INDEX "ClanDragonContribution_characterId_idx" ON "ClanDragonContribution"("characterId");

-- AddForeignKey
ALTER TABLE "ClanDragonDungeon" ADD CONSTRAINT "ClanDragonDungeon_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanDragonDungeon" ADD CONSTRAINT "ClanDragonDungeon_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClanDragonContribution" ADD CONSTRAINT "ClanDragonContribution_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "ClanDragonDungeon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanDragonContribution" ADD CONSTRAINT "ClanDragonContribution_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
