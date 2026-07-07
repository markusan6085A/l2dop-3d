# DEPLOY CHECKLIST (VPS)

Чекліст для деплою **l2dop-3d** на VPS (Польща або інший хост). Один процес Fastify віддає API і статику (`server/public/`).

## 0) Перед деплоєм (локально)

- `npm run build`
- `npm run test:integration:stability` (сервер має бути запущений)
- Закомітити зміни або зафіксувати commit для rollback.

## 1) Підготовка VPS

- Node.js 20+ (LTS)
- PostgreSQL 16+ (локально на VPS або managed DB)
- nginx + certbot (HTTPS)
- pm2: `npm i -g pm2`
- Каталог проєкту, напр. `/opt/l2dop-3d`

## 2) Env (server/.env)

Скопіюй `server/.env.example` → `server/.env` і задай:

```env
DATABASE_URL="postgresql://USER:PASS@HOST:5432/l2reborn?schema=public"
JWT_SECRET="<унікальний рядок ≥32 символів>"
PORT=3000
```

**На production не вмикати:** `L2DOP_DEV_SELF_BOOST=1`

## 3) Оновлення коду на VPS

```bash
cd /opt/l2dop-3d
git pull
npm ci
```

`postinstall` автоматично виконає `prisma generate`.

## 4) Міграції БД

```bash
npm run db:migrate:deploy
```

(Не використовуй `db:push` на prod.)

## 5) Збірка

```bash
npm run build
```

## 6) Старт / рестарт (pm2)

Перший запуск з кореня репо:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # один раз — автозапуск після reboot
```

Оновлення:

```bash
pm2 restart l2dop-3d
pm2 save
```

## 7) nginx

- Шаблон: `nginx.api.l2dop.com.conf.template` — проксі на `127.0.0.1:3000`
- Для одного домену (UI + API): `server_name game.example.com;` → `proxy_pass http://127.0.0.1:3000;`
- HTTPS: `certbot --nginx -d game.example.com`

## 8) Health checks після рестарту

```bash
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3000/game/client-config
pm2 status
pm2 logs l2dop-3d --lines 100
```

## 9) Smoke у браузері

- Реєстрація / вхід
- Карта, бій, екіп, телепорт
- Craft (гном), magister
- F5 — стан не зникає
- Подвійний клік на мутацію → 409 resync без «зависання» кнопки
- `/dev-boost.html` на prod **не** доступний (редirect на меню)

## Rollback

1. `git log --oneline -n 10`
2. `git checkout <stable-commit>`
3. `npm ci && npm run db:migrate:deploy && npm run build && pm2 restart l2dop-3d`
4. Перевір `/health`

## Важливо

- Не робити hotfix прямо на VPS без commit у репо.
- Не логувати token/cookie/повний body під час дебагу.
- Слабкий `JWT_SECRET` блокує старт у `NODE_ENV=production`.
