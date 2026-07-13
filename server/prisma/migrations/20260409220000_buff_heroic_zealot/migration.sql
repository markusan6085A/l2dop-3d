-- Контекст бафів з cs1.php ($heroic, $zealot), щоб Hero / Zealot застосовувались з БД.
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "buffHeroicTier" INTEGER;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "buffZealotStacks" INTEGER;
