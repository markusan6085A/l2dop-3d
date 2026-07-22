-- L2 world party kill reward idempotency (solo battle, shared economy split)

CREATE TABLE "WorldPartyKillReward" (
    "killerCharacterId" TEXT NOT NULL,
    "spawnId" TEXT NOT NULL,
    "killRevision" INTEGER NOT NULL,
    "recipientCharacterId" TEXT NOT NULL,
    "expGain" INTEGER NOT NULL,
    "spGain" INTEGER NOT NULL,
    "adenaGain" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "WorldPartyKillReward_pkey" PRIMARY KEY ("killerCharacterId","spawnId","killRevision","recipientCharacterId")
);

CREATE INDEX "WorldPartyKillReward_recipientCharacterId_notifiedAt_idx" ON "WorldPartyKillReward"("recipientCharacterId", "notifiedAt");
