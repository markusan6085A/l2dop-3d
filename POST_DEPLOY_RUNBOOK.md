# POST DEPLOY RUNBOOK

Виконувати після кожного деплою на VPS.

## 1) API health

- `curl -fsS http://127.0.0.1:3000/health`
- Очікування: `{"ok":true}`.

## 2) Перевірка endpoint, який не має бути 404

- `curl -i http://127.0.0.1:3000/auth/refresh`
- Очікування: **не 404** (може бути 400/401/405, залежно від реалізації).

## 3) Перевірка `/character` з авторизацією

- Отримати токен через login/register тестового користувача.
- `curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:3000/character`
- Очікування: `200` + `character` у JSON.

## 4) Прогнати інтеграційний smoke

- `npm run test:integration:stability`
- Очікування: `integration-stability-smoke: OK`.

## 5) Логи PM2

- `pm2 logs text-rpg-api --lines 200`
- Перевірити:
  - немає stacktrace-лавини;
  - немає `database_unavailable`;
  - 409 конфлікти логуються читабельно (action/characterId/revision).

## 6) Ручний 409/resync сценарій

- У UI зробити швидкі повторні кліки на battle action / equip.
- Зробити teleport і повторити дію.
- Перевірити:
  - кнопки не зависають;
  - HUD оновлюється;
  - після 409 є коректний resync.
