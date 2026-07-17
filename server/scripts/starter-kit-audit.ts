/**
 * Smoke: стартовий набір воїна / мага — екіп, сумка, без дублів eq+stacks.
 * npm run test:starter-kit
 */
import {
  STARTER_ADENA,
  STARTER_KIT_VERSION,
  countBagQty,
  describeStarterKit,
  normalizeEqSlot,
  starterInventory,
  type StarterClassBranch,
} from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';

const ITEM_LABEL: Record<number, string> = {
  4: 'Club',
  7: "Apprentice's Rod",
  1060: 'Lesser Healing Potion',
  726: 'Mana Potion (S)',
  1835: 'Soulshot (fighter)',
  3947: 'Blessed Spiritshot',
  9002261: 'Devotion Helmet',
  9002263: 'Tunic of devotion',
  9002265: 'Stockings of devotion',
  9002267: 'Devotion gloves',
};

function label(id: number): string {
  return ITEM_LABEL[id] ?? ITEM_CATALOG[id]?.nameUk ?? '#' + id;
}

function auditBranch(branch: StarterClassBranch): string[] {
  const errors: string[] = [];
  const raw = starterInventory(branch);
  const kit = describeStarterKit(branch);

  if (raw._sk !== STARTER_KIT_VERSION) {
    errors.push('_sk !== STARTER_KIT_VERSION');
  }
  if (branch === 'mystic' && raw._mysticRobePatch !== 1) {
    errors.push('mystic: missing _mysticRobePatch');
  }
  if (branch === 'fighter' && raw._mysticRobePatch != null) {
    errors.push('fighter: unexpected _mysticRobePatch');
  }

  const allIds = new Set<number>();
  for (const s of raw.stacks) allIds.add(s.itemId);
  for (const v of Object.values(raw.eq || {})) {
    const n = normalizeEqSlot(v as Parameters<typeof normalizeEqSlot>[0]);
    if (n) allIds.add(n.itemId);
  }
  for (const id of allIds) {
    if (!ITEM_CATALOG[id]) errors.push('missing ITEM_CATALOG: ' + id);
  }

  for (const v of Object.values(raw.eq || {})) {
    const slot = normalizeEqSlot(v as Parameters<typeof normalizeEqSlot>[0]);
    if (!slot) continue;
    if (countBagQty(raw, slot.itemId) > 0) {
      errors.push('duplicate eq+bag itemId ' + slot.itemId);
    }
  }

  if (JSON.stringify(raw.stacks) !== JSON.stringify(kit.bagStacks)) {
    errors.push('describeStarterKit bagStacks mismatch');
  }
  if (JSON.stringify(kit.bagSnapshotStacks) !== JSON.stringify(kit.bagStacks)) {
    errors.push('snapshot stacks !== raw stacks (strip should be no-op on starter)');
  }

  if (branch === 'mystic') {
    const eqIds = new Set(kit.equipped.map((e) => e.itemId));
    for (const id of [9002263, 9002265, 9002261, 9002267, 7]) {
      if (!eqIds.has(id)) errors.push('mystic missing equipped #' + id);
    }
    if (raw.stacks.some((s) => s.itemId === 1835)) {
      errors.push('mystic should not start with soulshot in bag');
    }
    if (!raw.stacks.some((s) => s.itemId === 3947 && s.qty === 1000)) {
      errors.push('mystic missing spiritshot x1000');
    }
  }

  if (branch === 'fighter') {
    const eqIds = new Set(kit.equipped.map((e) => e.itemId));
    for (const id of [4, 9002261, 9002267]) {
      if (!eqIds.has(id)) errors.push('fighter missing equipped #' + id);
    }
    if (raw.stacks.some((s) => s.itemId === 3947)) {
      errors.push('fighter should not start with spiritshot in bag');
    }
    if (!raw.stacks.some((s) => s.itemId === 1835 && s.qty === 1000)) {
      errors.push('fighter missing soulshot x1000');
    }
  }

  console.log('\n=== ' + branch.toUpperCase() + ' (sk v' + STARTER_KIT_VERSION + ') ===');
  console.log('Adena at register:', STARTER_ADENA);
  console.log('Equipped:');
  for (const e of kit.equipped) {
    console.log('  ' + e.slot + ': ' + label(e.itemId) + ' (' + e.itemId + ')');
  }
  console.log('Bag (raw = snapshot):');
  for (const s of kit.bagStacks) {
    console.log('  ' + label(s.itemId) + ' x' + s.qty + ' (' + s.itemId + ')');
  }
  if (errors.length) {
    console.log('ERRORS:', errors.join('; '));
  } else {
    console.log('OK');
  }
  return errors;
}

const allErrors = [...auditBranch('fighter'), ...auditBranch('mystic')];
if (allErrors.length) {
  console.error('\nStarter kit audit FAILED (' + allErrors.length + ')');
  process.exit(1);
}
console.log('\nStarter kit audit passed.');
