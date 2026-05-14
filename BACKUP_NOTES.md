# BACKUP NOTES (PostgreSQL)

## 1) Ручний backup (pg_dump)

Приклад:

```bash
export PGPASSWORD='<DB_PASSWORD>'
pg_dump \
  -h 127.0.0.1 \
  -p 5432 \
  -U <DB_USER> \
  -d <DB_NAME> \
  -Fc \
  -f /var/backups/text-rpg/db_$(date +%F_%H-%M).dump
```

`-Fc` = custom format (зручний для `pg_restore`).

## 2) Restore command

```bash
export PGPASSWORD='<DB_PASSWORD>'
createdb -h 127.0.0.1 -p 5432 -U <DB_USER> <TARGET_DB_NAME>
pg_restore \
  -h 127.0.0.1 \
  -p 5432 \
  -U <DB_USER> \
  -d <TARGET_DB_NAME> \
  --clean \
  --if-exists \
  /var/backups/text-rpg/db_YYYY-MM-DD_HH-MM.dump
```

## 3) Nightly cron example

Відкрити crontab:

```bash
crontab -e
```

Приклад на щоденний backup о 03:10:

```cron
10 3 * * * export PGPASSWORD='<DB_PASSWORD>' && \
pg_dump -h 127.0.0.1 -p 5432 -U <DB_USER> -d <DB_NAME> -Fc -f /var/backups/text-rpg/db_$(date +\%F_\%H-\%M).dump
```

## 4) Ротація backup-файлів (приклад)

Тримати лише останні 14 днів:

```bash
find /var/backups/text-rpg -type f -name 'db_*.dump' -mtime +14 -delete
```

## 5) Рекомендації

- Тестувати restore мінімум 1 раз на тиждень.
- Зберігати копії не тільки на тому ж VPS (off-site storage).
- Не писати пароль БД у git-репо; використовувати env/secret manager.
