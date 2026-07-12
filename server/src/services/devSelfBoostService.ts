/**
 * Тимчасовий самопіднімач ЛВЛ / адени / SP для розробки (увімкнути L2DOP_DEV_SELF_BOOST=1).
 */
import { prisma } from '../lib/prisma.js';
import { parseInventory } from '../data/inventory.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import {
  L2DOP_LEVEL_MIN_EXP,
  levelFromTotalExp,
} from '../data/l2dopExpgain.js';
import {
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

const MAX_SP = 2_147_483_647;
/** Обмеження адени в патчі (надмірні значення не відправляємо в snapshot як неконтрольовані). */
const MAX_ADENA_PATCH = BigInt('999999999999999999'); // 10^18 - 1

export function isDevSelfBoostEnabled(): boolean {
  return process.env.L2DOP_DEV_SELF_BOOST === '1';
}

export async function applyDevSelfBoostForUser(
  userId: string,
  expectedRevision: number,
  patch: { level?: number; adena?: bigint; sp?: number }
): Promise<CharacterSnapshot> {
  const hasPatch =
    patch.level !== undefined ||
    patch.adena !== undefined ||
    patch.sp !== undefined;
  if (!hasPatch) {
    throw new Error('dev_boost_empty');
  }

  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) throw new Error('no_character');

  const nextLevel =
    patch.level !== undefined
      ? Math.max(1, Math.min(80, Math.floor(patch.level)))
      : row.level;

  let nextAdena = patch.adena !== undefined ? patch.adena : row.adena;
  if (nextAdena < 0n) nextAdena = 0n;
  if (nextAdena > MAX_ADENA_PATCH) nextAdena = MAX_ADENA_PATCH;

  const nextSp =
    patch.sp !== undefined
      ? Math.min(MAX_SP, Math.max(0, Math.floor(patch.sp)))
      : row.sp;

  const exp = L2DOP_LEVEL_MIN_EXP[nextLevel - 1]!;
  const effLv = levelFromTotalExp(exp);
  const cr = row as CharacterRow;
  const inv = parseInventory(cr.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    cr.race,
    cr.classBranch,
    inv,
    combatOptsFromRow(cr)
  );
  const vit = computeVitals(
    effLv,
    cr.race,
    cr.classBranch,
    combat.con,
    combat.men
  );
  const maxHp = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);

  const result = await prisma.$transaction(async (tx) =>
    mutateCharacterWithRevision(tx, row.id, expectedRevision, () => ({
      changed: true,
      data: {
        exp,
        level: effLv,
        adena: nextAdena,
        sp: nextSp,
        hp: maxHp,
        maxHp,
      },
    }))
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  return toSnapshot(result.character as CharacterRow);
}
