CREATE TABLE IF NOT EXISTS "WorldBossSession" (
    "spawnId" TEXT NOT NULL,
    "stateJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorldBossSession_pkey" PRIMARY KEY ("spawnId")
);
