import { HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ } from '../data/l2dopHumanFighterBattleSkills.js';

const WEAK_JWT_SECRETS = new Set([
  'my-super-secret-l2-key-2026',
  'replace-with-long-random-string-min-32-chars',
  'secret',
  'changeme',
  'jwt-secret',
]);

/** Блокує старт production з небезпечним JWT або dev-boost. */
export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const secret = process.env.JWT_SECRET ?? '';
  if (secret.length < 32 || WEAK_JWT_SECRETS.has(secret)) {
    console.error(
      '[production] JWT_SECRET занадто слабкий. Задай унікальний рядок ≥32 символів у server/.env.'
    );
    process.exit(1);
  }

  if (process.env.L2DOP_DEV_SELF_BOOST === '1') {
    console.error(
      '[production] L2DOP_DEV_SELF_BOOST=1 заборонено на prod. Прибери змінну з server/.env.'
    );
    process.exit(1);
  }

  if (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ) {
    console.error(
      '[production] HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ=true заборонено на prod. Вимкни в l2dopHumanFighterBattleSkills.ts.'
    );
    process.exit(1);
  }
}
