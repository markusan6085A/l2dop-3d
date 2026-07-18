-- Reconcile Prisma schema drift: objects present in schema.prisma but missing from migration chain.
-- Safe for production-like DBs (db push history): ADD COLUMN / CREATE INDEX IF NOT EXISTS; no DROP/TRUNCATE.

-- Character JSON columns (nullable Json? — no DEFAULT in schema; app: parseInventory(null) → emptyInventory()).
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "battleHotbarJson" JSONB;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "dungeonStateJson" JSONB;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "inventoryJson" JSONB;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "mobSpawnHpJson" JSONB;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "skillCooldownsJson" JSONB;

-- @updatedAt columns: Prisma manages timestamps; remove legacy DEFAULT from early migrations.
ALTER TABLE "Character" ALTER COLUMN "lastUpdate" DROP DEFAULT;
ALTER TABLE "WorldBossSession" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE IF NOT EXISTS "ServerNewsEntry" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "locationEn" TEXT,
    "playerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerNewsEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServerMeta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ServerMeta_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "ServerNewsEntry_createdAt_idx" ON "ServerNewsEntry"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Character_userId_lastUpdate_idx" ON "Character"("userId", "lastUpdate" DESC);
