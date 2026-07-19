-- Clan cooperative tasks
CREATE TABLE "ClanTask" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "helperId" TEXT,
    "target" BIGINT NOT NULL,
    "progress" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "helperJoinedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "rewardPaidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClanTaskContribution" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "progress" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanTaskContribution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClanTaskParticipantLock" (
    "characterId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanTaskParticipantLock_pkey" PRIMARY KEY ("characterId")
);

CREATE TABLE "ClanTaskProgressEvent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanTaskProgressEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClanTask_clanId_status_idx" ON "ClanTask"("clanId", "status");
CREATE INDEX "ClanTask_ownerId_status_idx" ON "ClanTask"("ownerId", "status");
CREATE INDEX "ClanTask_helperId_status_idx" ON "ClanTask"("helperId", "status");
CREATE INDEX "ClanTask_clanId_taskType_idx" ON "ClanTask"("clanId", "taskType");

CREATE UNIQUE INDEX "ClanTaskContribution_taskId_characterId_key" ON "ClanTaskContribution"("taskId", "characterId");
CREATE INDEX "ClanTaskContribution_taskId_progress_idx" ON "ClanTaskContribution"("taskId", "progress");
CREATE INDEX "ClanTaskContribution_characterId_idx" ON "ClanTaskContribution"("characterId");

CREATE INDEX "ClanTaskParticipantLock_taskId_idx" ON "ClanTaskParticipantLock"("taskId");

CREATE UNIQUE INDEX "ClanTaskProgressEvent_taskId_eventKey_key" ON "ClanTaskProgressEvent"("taskId", "eventKey");
CREATE INDEX "ClanTaskProgressEvent_taskId_characterId_idx" ON "ClanTaskProgressEvent"("taskId", "characterId");

ALTER TABLE "ClanTask" ADD CONSTRAINT "ClanTask_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanTask" ADD CONSTRAINT "ClanTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanTask" ADD CONSTRAINT "ClanTask_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClanTask" ADD CONSTRAINT "ClanTask_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClanTaskContribution" ADD CONSTRAINT "ClanTaskContribution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ClanTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanTaskContribution" ADD CONSTRAINT "ClanTaskContribution_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClanTaskParticipantLock" ADD CONSTRAINT "ClanTaskParticipantLock_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClanTaskParticipantLock" ADD CONSTRAINT "ClanTaskParticipantLock_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ClanTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClanTaskProgressEvent" ADD CONSTRAINT "ClanTaskProgressEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ClanTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
