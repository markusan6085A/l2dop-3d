-- L2DOP: EXP ÷3 під нову таблицю рівнів (l2dopExpgain.ts).
-- Рекомендовано: npm run migrate:exp-div3 (ідемпотентно, level/HP + перевірка).
-- Швидкий SQL-варіант (лише exp), якщо migrate deploy уже застосовано вручну:

-- UPDATE "Character"
-- SET "exp" = "exp" / 3, "revision" = "revision" + 1
-- WHERE "exp" > 0;

SELECT 1;
