-- Test siege row key (CLAN_SIEGE_TEST_ENABLED override).
ALTER TABLE "ClanSiege" ADD COLUMN "testKey" TEXT;

CREATE UNIQUE INDEX "ClanSiege_cityId_testKey_key"
  ON "ClanSiege"("cityId", "testKey");
