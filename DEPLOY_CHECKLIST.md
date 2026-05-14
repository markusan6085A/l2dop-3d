# DEPLOY CHECKLIST (VPS)

Цей чекліст для безпечного деплою без змін ігрового runtime-коду.

## 0) Перед деплоєм (локально)

- `npm run build`
- `npm run test:integration:stability`
- Переконатися, що робоча гілка чиста або всі зміни закомічені.

## 1) Оновлення коду на VPS

- `cd /opt/text-rpg/server`
- `git pull`
- `npm ci`

## 2) Міграції БД

- `npx prisma migrate deploy`

## 3) Збірка

- `npm run build`

## 4) Рестарт процесу

- `pm2 restart text-rpg-api`
- `pm2 save`

## 5) Health checks після рестарту

- `curl -fsS http://127.0.0.1:3000/health`
- `pm2 status`
- `pm2 logs text-rpg-api --lines 100`

## 6) Мінімальна smoke-перевірка API

- `curl -i http://127.0.0.1:3000/health`
- Перевірити, що reverse proxy віддає API на `api.l2dop.com`.
- За можливості: короткий ручний сценарій 409/resync у UI.

## Rollback notes

1. Визначити останній стабільний commit: `git log --oneline -n 10`
2. Переключитися на стабільний commit/тег:
   - `git checkout <stable-commit-or-tag>`
3. Повторити:
   - `npm ci`
   - `npx prisma migrate deploy` (тільки forward-сумісні міграції)
   - `npm run build`
   - `pm2 restart text-rpg-api`
4. Перевірити `/health` і базові endpoint-и.

## Важливо

- Не робити hotfix прямо на VPS без commit у репо.
- Не логувати секрети (token/cookie/body повністю) під час дебагу.
