-- Рейтинги: лічильники PvP-перемог і участі в рейд-босах.
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "pvpWins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "raidBossKills" INTEGER NOT NULL DEFAULT 0;
