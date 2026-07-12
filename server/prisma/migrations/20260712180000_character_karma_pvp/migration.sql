-- AlterTable (ідемпотентно: колонки могли вже з'явитись через db push)
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "karma" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "pvpAggressorUntilMs" BIGINT NOT NULL DEFAULT 0;
