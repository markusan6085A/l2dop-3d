-- Clan starts at level 0; normalize existing test clans (keep clanPoints).
ALTER TABLE "Clan" ALTER COLUMN "level" SET DEFAULT 0;
UPDATE "Clan" SET "level" = 0;
