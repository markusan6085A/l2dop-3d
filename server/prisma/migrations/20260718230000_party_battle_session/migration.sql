-- CreateEnum
CREATE TYPE "PartyBattleSessionState" AS ENUM ('active', 'victory', 'ended');

-- CreateTable
CREATE TABLE "PartyBattleSession" (
    "id" TEXT NOT NULL,
    "partyId" TEXT,
    "originPartyId" TEXT NOT NULL,
    "activePartyKey" TEXT,
    "spawnId" TEXT NOT NULL,
    "canonicalMobTemplateId" TEXT NOT NULL,
    "mobWorldX" INTEGER NOT NULL,
    "mobWorldY" INTEGER NOT NULL,
    "mobHp" INTEGER NOT NULL,
    "mobMaxHp" INTEGER NOT NULL,
    "battleVersion" INTEGER NOT NULL DEFAULT 1,
    "state" "PartyBattleSessionState" NOT NULL DEFAULT 'active',
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "endReason" TEXT,

    CONSTRAINT "PartyBattleSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyBattleParticipant" (
    "partyBattleId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDamagingHitAtMs" BIGINT,
    "totalDamage" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "PartyBattleParticipant_pkey" PRIMARY KEY ("partyBattleId","characterId")
);

-- CreateTable
CREATE TABLE "PartyKillReward" (
    "partyBattleId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "expGain" INTEGER NOT NULL,
    "spGain" INTEGER NOT NULL,
    "adenaGain" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyKillReward_pkey" PRIMARY KEY ("partyBattleId","characterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartyBattleSession_activePartyKey_key" ON "PartyBattleSession"("activePartyKey");

-- CreateIndex
CREATE INDEX "PartyBattleSession_originPartyId_idx" ON "PartyBattleSession"("originPartyId");

-- CreateIndex
CREATE INDEX "PartyBattleSession_spawnId_state_idx" ON "PartyBattleSession"("spawnId", "state");

-- CreateIndex
CREATE INDEX "PartyBattleSession_lastActivityAt_state_idx" ON "PartyBattleSession"("lastActivityAt", "state");

-- CreateIndex
CREATE INDEX "PartyBattleParticipant_characterId_idx" ON "PartyBattleParticipant"("characterId");

-- AddForeignKey
ALTER TABLE "PartyBattleSession" ADD CONSTRAINT "PartyBattleSession_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBattleParticipant" ADD CONSTRAINT "PartyBattleParticipant_partyBattleId_fkey" FOREIGN KEY ("partyBattleId") REFERENCES "PartyBattleSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBattleParticipant" ADD CONSTRAINT "PartyBattleParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyKillReward" ADD CONSTRAINT "PartyKillReward_partyBattleId_fkey" FOREIGN KEY ("partyBattleId") REFERENCES "PartyBattleSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
