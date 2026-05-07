-- L2-перша профа: людина-воїн (Fighter → Warrior). Каталог скілів фільтрується за цим полем.

ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "l2Profession" TEXT NOT NULL DEFAULT 'human_fighter';
