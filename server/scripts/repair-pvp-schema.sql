-- Відновлення PvP-колонок, якщо migrate resolve --applied без реального SQL.
-- psql "$DATABASE_URL" -f server/scripts/repair-pvp-schema.sql

ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "karma" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "pvpAggressorUntilMs" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "pvpPendingDefeatJson" JSONB;

-- Якщо pvpAggressorUntilMs випадково INTEGER — привести до BIGINT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Character'
      AND column_name = 'pvpAggressorUntilMs'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE "Character"
      ALTER COLUMN "pvpAggressorUntilMs" TYPE BIGINT
      USING "pvpAggressorUntilMs"::bigint;
  END IF;
END $$;
