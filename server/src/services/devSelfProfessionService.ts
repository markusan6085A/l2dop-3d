/**
 * Dev: миттєва зміна l2Profession + race/classBranch для тесту портретів.
 * Увімкнення: L2DOP_DEV_SELF_BOOST=1
 */
import { prisma } from '../lib/prisma.js';
import { parseInventory } from '../data/inventory.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import {
  isDevProfessionAllowed,
  resolveDevProfessionMeta,
} from '../data/devProfessionTree.js';
import { isDevSelfBoostEnabled } from './devSelfBoostService.js';

export function isDevSelfProfessionEnabled(): boolean {
  return isDevSelfBoostEnabled();
}

export async function applyDevSelfProfessionForUser(
  userId: string,
  expectedRevision: number,
  l2ProfessionRaw: string
): Promise<CharacterSnapshot> {
  const l2Profession = String(l2ProfessionRaw || '').trim();
  if (!isDevProfessionAllowed(l2Profession)) {
    throw new Error('dev_prof_invalid');
  }

  const meta = resolveDevProfessionMeta(l2Profession);
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) throw new Error('no_character');

  const effLv = levelFromTotalExp(row.exp);
  const cr = row as CharacterRow;
  const inv = parseInventory(cr.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    meta.race,
    meta.classBranch,
    inv,
    combatOptsFromRow({ ...cr, race: meta.race, classBranch: meta.classBranch })
  );
  const vit = computeVitals(
    effLv,
    meta.race,
    meta.classBranch,
    combat.con,
    combat.men
  );
  const maxHp = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const hp = Math.min(Math.max(1, row.hp), maxHp);

  const result = await prisma.$transaction(async (tx) =>
    mutateCharacterWithRevision(tx, row.id, expectedRevision, () => ({
      changed: true,
      data: {
        l2Profession,
        race: meta.race,
        classBranch: meta.classBranch,
        hp,
        maxHp,
      },
    }))
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  return toSnapshot(result.character as CharacterRow);
}
