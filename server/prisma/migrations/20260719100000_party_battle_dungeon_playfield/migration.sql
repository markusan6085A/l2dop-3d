-- CreateEnum
CREATE TYPE "PartyBattlePlayfield" AS ENUM ('world', 'dungeon');

-- AlterTable
ALTER TABLE "PartyBattleSession" ADD COLUMN "playfield" "PartyBattlePlayfield" NOT NULL DEFAULT 'world';
ALTER TABLE "PartyBattleSession" ADD COLUMN "dungeonId" TEXT;
ALTER TABLE "PartyBattleSession" ADD COLUMN "mobMapX" INTEGER;
ALTER TABLE "PartyBattleSession" ADD COLUMN "mobMapY" INTEGER;
ALTER TABLE "PartyBattleSession" ALTER COLUMN "mobWorldX" DROP NOT NULL;
ALTER TABLE "PartyBattleSession" ALTER COLUMN "mobWorldY" DROP NOT NULL;
