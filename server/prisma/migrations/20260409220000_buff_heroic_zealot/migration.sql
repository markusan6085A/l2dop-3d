-- Контекст бафів з cs1.php ($heroic, $zealot), щоб Hero / Zealot застосовувались з БД.
ALTER TABLE "Character" ADD COLUMN "buffHeroicTier" INTEGER;
ALTER TABLE "Character" ADD COLUMN "buffZealotStacks" INTEGER;
