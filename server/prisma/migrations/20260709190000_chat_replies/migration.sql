-- AlterTable
ALTER TABLE "Character" ADD COLUMN "chatRepliesReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "replyToCharacterId" TEXT,
ADD COLUMN "replyToCharacterName" TEXT;

-- CreateIndex
CREATE INDEX "ChatMessage_replyToCharacterId_createdAt_idx" ON "ChatMessage"("replyToCharacterId", "createdAt" DESC);
