-- AlterTable
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "chatRepliesReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "replyToCharacterId" TEXT;
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "replyToCharacterName" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ChatMessage_replyToCharacterId_createdAt_idx" ON "ChatMessage"("replyToCharacterId", "createdAt" DESC);
