-- Clan siege wall action ledger + drop participant.lastActionId.

CREATE TABLE "ClanSiegeWallAction" (
    "id" TEXT NOT NULL,
    "siegeId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "damage" INTEGER NOT NULL,
    "wallHpAfter" INTEGER NOT NULL,
    "siegeVersionAfter" INTEGER NOT NULL,
    "characterTotalAfter" INTEGER NOT NULL,
    "clanTotalAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanSiegeWallAction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClanSiegeWallAction_siegeId_characterId_actionId_key"
  ON "ClanSiegeWallAction"("siegeId", "characterId", "actionId");
CREATE INDEX "ClanSiegeWallAction_siegeId_idx" ON "ClanSiegeWallAction"("siegeId");

ALTER TABLE "ClanSiegeWallAction"
  ADD CONSTRAINT "ClanSiegeWallAction_siegeId_fkey"
  FOREIGN KEY ("siegeId") REFERENCES "ClanSiege"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanSiegeWallAction"
  ADD CONSTRAINT "ClanSiegeWallAction_characterId_fkey"
  FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClanSiegeParticipant" DROP COLUMN IF EXISTS "lastActionId";
