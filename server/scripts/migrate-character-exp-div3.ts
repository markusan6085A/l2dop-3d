/**
 * Синхронізація EXP ÷3 + level / maxHp / hp після зміни таблиці рівнів.
 * Ідемпотентно: повторний запуск не ділить EXP вдруге.
 *
 *   npm run migrate:exp-div3
 *   npm run migrate:exp-div3 -- --dry-run
 */

import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { parseInventory } from '../src/data/inventory.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
} from '../src/data/l2dopCombatFormulas.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import {
  levelFromTotalExp,
} from '../src/data/l2dopExpgain.js';
import { combatOptsFromRow, type CharacterRow } from '../src/services/charService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

/** Канонічні пороги до балансу ÷3 (expgain.php). */
const LEGACY_LEVEL_MIN_EXP: readonly bigint[] = [
  0n,
  67n,
  362n,
  1167n,
  2883n,
  6037n,
  11286n,
  19422n,
  31377n,
  48228n,
  71201n,
  101676n,
  141192n,
  191453n,
  254329n,
  331866n,
  426287n,
  539999n,
  675595n,
  835861n,
  1023783n,
  1242545n,
  1301364n,
  1447733n,
  2118873n,
  2497076n,
  2925249n,
  3407896n,
  3949754n,
  4555797n,
  5231244n,
  5981575n,
  6812513n,
  7730043n,
  8740421n,
  9850165n,
  11066071n,
  12395215n,
  13844951n,
  15422930n,
  17137087n,
  18995665n,
  21007200n,
  23180554n,
  25524869n,
  28049631n,
  30764650n,
  33680051n,
  36806283n,
  40154161n,
  45525131n,
  51262487n,
  57383992n,
  63907914n,
  70853089n,
  80700827n,
  91162660n,
  102265882n,
  114038590n,
  126509649n,
  146308201n,
  167244350n,
  189364870n,
  212717913n,
  237352657n,
  271975264n,
  308443162n,
  346827140n,
  387199536n,
  429634534n,
  474207973n,
  532695010n,
  606322765n,
  696381299n,
  804225311n,
  931275813n,
  1351275550n,
  1911275986n,
  2799275960n,
  4000000000n,
];

const LEGACY_MAX_EXP_EXCLUSIVE = 500000000000n;

function levelFromLegacyTotalExp(exp: bigint): number {
  const e = exp < 0n ? 0n : exp;
  if (e >= LEGACY_MAX_EXP_EXCLUSIVE) return 80;
  for (let L = 80; L >= 1; L--) {
    if (e >= LEGACY_LEVEL_MIN_EXP[L - 1]!) return L;
  }
  return 1;
}

/** EXP ще в старій шкалі, якщо збережений level збігається з legacy-таблицею. */
function needsExpScaleDown(exp: bigint, storedLevel: number): boolean {
  if (exp <= 0n) return false;
  const legacyLv = levelFromLegacyTotalExp(exp);
  const newLv = levelFromTotalExp(exp);
  if (legacyLv === storedLevel && newLv > storedLevel) return true;
  /** Ручний grant: exp = новий поріг, level уже новий. */
  if (newLv === storedLevel) return false;
  /** Розсинхрон — лишаємо exp, лише підженемо level/HP. */
  return false;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const rows = await prisma.character.findMany({ orderBy: { name: 'asc' } });

  let updated = 0;
  let scaled = 0;

  for (const row of rows) {
    const cr = row as CharacterRow;
    const scaleDown = needsExpScaleDown(cr.exp, cr.level);
    const nextExp = scaleDown ? cr.exp / 3n : cr.exp;
    const effLv = levelFromTotalExp(nextExp);

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
    const hp = Math.min(Math.max(0, cr.hp), maxHp);

    const changed =
      scaleDown ||
      effLv !== cr.level ||
      maxHp !== cr.maxHp ||
      hp !== cr.hp;

    if (!changed) continue;

    if (dryRun) {
      console.log('[dry-run]', {
        name: cr.name,
        scaleDown,
        exp: `${cr.exp.toString()} → ${nextExp.toString()}`,
        level: `${cr.level} → ${effLv}`,
        maxHp: `${cr.maxHp} → ${maxHp}`,
        hp: `${cr.hp} → ${hp}`,
      });
      updated += 1;
      if (scaleDown) scaled += 1;
      continue;
    }

    await prisma.character.update({
      where: { id: cr.id },
      data: {
        exp: nextExp,
        level: effLv,
        maxHp,
        hp,
        revision: { increment: 1 },
      },
    });

    console.log('OK', {
      name: cr.name,
      scaleDown,
      exp: scaleDown ? `${cr.exp.toString()} → ${nextExp.toString()}` : cr.exp.toString(),
      level: `${cr.level} → ${effLv}`,
      maxHp: `${cr.maxHp} → ${maxHp}`,
      hp: `${cr.hp} → ${hp}`,
    });
    updated += 1;
    if (scaleDown) scaled += 1;
  }

  console.log(
    dryRun
      ? `Dry-run: ${updated} персонаж(ів), з них EXP÷3: ${scaled}.`
      : `Готово: ${updated} персонаж(ів), EXP÷3: ${scaled}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
