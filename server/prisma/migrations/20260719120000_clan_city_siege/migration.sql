-- Clan City Siege Stage A: castles, sieges, damage, participants, reward ledger, clanPoints.

ALTER TABLE "Clan" ADD COLUMN "clanPoints" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "CityCastle" (
    "cityId" TEXT NOT NULL,
    "ownerClanId" TEXT,
    "capturedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityCastle_pkey" PRIMARY KEY ("cityId")
);

CREATE TABLE "ClanSiege" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "wallHp" INTEGER NOT NULL,
    "wallMaxHp" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "winnerClanId" TEXT,
    "finishedAt" TIMESTAMP(3),
    "finishReason" TEXT,
    "rewardGrantedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanSiege_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClanSiegeClanDamage" (
    "id" TEXT NOT NULL,
    "siegeId" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "totalDamage" INTEGER NOT NULL DEFAULT 0,
    "firstHitAt" TIMESTAMP(3),
    "lastHitAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanSiegeClanDamage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClanSiegeParticipant" (
    "id" TEXT NOT NULL,
    "siegeId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "totalWallDamage" INTEGER NOT NULL DEFAULT 0,
    "lastWallAttackAt" TIMESTAMP(3),
    "lastActionId" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanSiegeParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClanSiegeRewardLedger" (
    "id" TEXT NOT NULL,
    "siegeId" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanSiegeRewardLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClanSiege_cityId_startsAt_key" ON "ClanSiege"("cityId", "startsAt");
CREATE INDEX "ClanSiege_state_startsAt_idx" ON "ClanSiege"("state", "startsAt");
CREATE INDEX "ClanSiege_state_endsAt_idx" ON "ClanSiege"("state", "endsAt");
CREATE INDEX "ClanSiege_cityId_state_idx" ON "ClanSiege"("cityId", "state");

CREATE UNIQUE INDEX "ClanSiegeClanDamage_siegeId_clanId_key" ON "ClanSiegeClanDamage"("siegeId", "clanId");
CREATE INDEX "ClanSiegeClanDamage_siegeId_idx" ON "ClanSiegeClanDamage"("siegeId");
CREATE INDEX "ClanSiegeClanDamage_siegeId_totalDamage_idx" ON "ClanSiegeClanDamage"("siegeId", "totalDamage" DESC);
CREATE INDEX "ClanSiegeClanDamage_clanId_idx" ON "ClanSiegeClanDamage"("clanId");

CREATE UNIQUE INDEX "ClanSiegeParticipant_siegeId_characterId_key" ON "ClanSiegeParticipant"("siegeId", "characterId");
CREATE INDEX "ClanSiegeParticipant_siegeId_idx" ON "ClanSiegeParticipant"("siegeId");
CREATE INDEX "ClanSiegeParticipant_characterId_idx" ON "ClanSiegeParticipant"("characterId");

CREATE UNIQUE INDEX "ClanSiegeRewardLedger_siegeId_key" ON "ClanSiegeRewardLedger"("siegeId");

ALTER TABLE "CityCastle" ADD CONSTRAINT "CityCastle_ownerClanId_fkey" FOREIGN KEY ("ownerClanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClanSiege" ADD CONSTRAINT "ClanSiege_winnerClanId_fkey" FOREIGN KEY ("winnerClanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClanSiegeClanDamage" ADD CONSTRAINT "ClanSiegeClanDamage_siegeId_fkey" FOREIGN KEY ("siegeId") REFERENCES "ClanSiege"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanSiegeClanDamage" ADD CONSTRAINT "ClanSiegeClanDamage_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanSiegeParticipant" ADD CONSTRAINT "ClanSiegeParticipant_siegeId_fkey" FOREIGN KEY ("siegeId") REFERENCES "ClanSiege"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanSiegeParticipant" ADD CONSTRAINT "ClanSiegeParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanSiegeRewardLedger" ADD CONSTRAINT "ClanSiegeRewardLedger_siegeId_fkey" FOREIGN KEY ("siegeId") REFERENCES "ClanSiege"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanSiegeRewardLedger" ADD CONSTRAINT "ClanSiegeRewardLedger_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
