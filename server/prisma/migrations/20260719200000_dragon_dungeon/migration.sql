-- AlterTable
ALTER TABLE "Character" ADD COLUMN "diamonds" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CharacterDragonDungeonUnlock" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "dragonId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterDragonDungeonUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterDragonDungeonUnlock_characterId_idx" ON "CharacterDragonDungeonUnlock"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterDragonDungeonUnlock_characterId_dragonId_key" ON "CharacterDragonDungeonUnlock"("characterId", "dragonId");

-- AddForeignKey
ALTER TABLE "CharacterDragonDungeonUnlock" ADD CONSTRAINT "CharacterDragonDungeonUnlock_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
