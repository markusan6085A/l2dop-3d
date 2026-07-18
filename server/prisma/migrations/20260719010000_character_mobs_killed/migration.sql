-- PvE kill counter (Character.mobsKilled in schema.prisma).
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "mobsKilled" INTEGER NOT NULL DEFAULT 0;
