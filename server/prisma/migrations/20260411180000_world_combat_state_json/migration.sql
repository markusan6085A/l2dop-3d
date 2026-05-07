-- Поза боєм: стійки / бойові моди з останнього бою (MP-пул для тоглів, згасання по часу).
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "worldCombatStateJson" JSONB;
