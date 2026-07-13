-- AlterTable
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "gender" TEXT NOT NULL DEFAULT 'male';
