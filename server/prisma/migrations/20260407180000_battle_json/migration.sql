-- Активний бій (map spawn) — snapshot у JSON
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "battleJson" JSONB;
