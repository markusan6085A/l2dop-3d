-- Активні бафи персонажа (skillId+level з l2dop cs1.php / rawdata) для computeCombatStats.
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "activeBuffsJson" JSONB;
