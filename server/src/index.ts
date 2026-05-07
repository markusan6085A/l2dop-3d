import './env.js';
import { buildApp } from './app.js';

const port = Number(process.env.PORT) || 3000;

async function main() {
  const app = await buildApp();
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`listening on ${port}`);
}

main().catch((err: unknown) => {
  const e = err as NodeJS.ErrnoException & { code?: string };
  if (e.code === 'EADDRINUSE') {
    console.error(
      '\n[Порт зайнятий] Не вдалося запустити сервер: порт ' +
        port +
        ' уже використовується (часто це другий `npm run dev` у фоні).\n' +
        'Що зробити:\n' +
        '  • Закрий зайвий термінал із сервером або заверши старий процес Node.\n' +
        '  • Windows: `netstat -ano | findstr :' +
        port +
        '` → знайди PID → `taskkill /PID <номер> /F`\n' +
        '  • Або в server/.env вкажи інший порт, наприклад: PORT=3001\n'
    );
  }
  console.error(err);
  process.exit(1);
});
