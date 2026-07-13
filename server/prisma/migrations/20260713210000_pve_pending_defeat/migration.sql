-- PvE-поразка: гравець має натиснути «В місто» перед новим боєм.
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "pvePendingDefeatJson" JSONB;
