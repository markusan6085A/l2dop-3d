-- Stage D: reward notice acknowledgement (non-killer HUD)
ALTER TABLE "PartyKillReward" ADD COLUMN "notifiedAt" TIMESTAMP(3);
