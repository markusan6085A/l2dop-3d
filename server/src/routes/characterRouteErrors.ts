import { Prisma } from '@prisma/client';

export function characterDbErrorPayload(err: unknown): {
  code: number;
  body: Record<string, unknown>;
} {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      code: 503,
      body: {
        error: 'database_error',
        prismaCode: err.code,
        messageUk:
          'База даних недоступна або схема не збігається з проєктом. Перевір, що PostgreSQL запущений, у server/.env правильний DATABASE_URL, потім у корені репозиторію виконай: npm run db:push',
      },
    };
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      code: 503,
      body: {
        error: 'database_error',
        messageUk:
          'Не вдалося підключитися до PostgreSQL. Перевір DATABASE_URL у server/.env і що сервер БД запущений.',
      },
    };
  }
  if (err instanceof Prisma.PrismaClientRustPanicError) {
    return {
      code: 503,
      body: {
        error: 'database_error',
        messageUk: 'Помилка рушія Prisma. Спробуй npm run db:generate і перезапусти сервер.',
      },
    };
  }
  return {
    code: 500,
    body: {
      error: 'internal_error',
      messageUk: 'Внутрішня помилка сервера при завантаженні героя.',
    },
  };
}
