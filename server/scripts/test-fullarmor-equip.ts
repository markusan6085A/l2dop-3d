/**
 * Regression — fullarmor equip button contract, slot hints, equip conflicts, read-repair.
 */
import assert from 'node:assert/strict';
import {
  buildItemClientView,
  resolveEquippedArmorSetBonuses,
} from '../src/data/armorSetResolver.js';
import { sumEquippedArmorPDef } from '../src/data/l2dopCombatFormulas.js';
import {
  equipFromBag,
  parseInventoryRaw,
  type InventoryState,
} from '../src/data/inventory.js';
import {
  itemSlotHintsForClient,
  listGearCatalogForClient,
  ITEM_CATALOG,
} from '../src/data/itemsCatalog.js';
import { S_DRACONIC_LIGHT_SET } from '../src/data/armorSetCatalog.js';

const FULLARMOR_IDS = [6379, 6383, 30002, 30009, 7864, 2409] as const;

function eq(pieces: Record<string, number>): InventoryState['eq'] {
  const out: InventoryState['eq'] = {};
  for (const [slot, itemId] of Object.entries(pieces)) {
    out[slot as keyof InventoryState['eq']] = { itemId, enchant: 0 };
  }
  return out;
}

function inv(pieces: Record<string, number>, stacks: InventoryState['stacks'] = []): InventoryState {
  return { v: 1, stacks, eq: eq(pieces) };
}

function mergeClientSlotById(itemId: number): string | undefined {
  const itemSlotById: Record<number, string> = {};
  for (const row of listGearCatalogForClient()) {
    if (row.itemId === itemId && row.slot) itemSlotById[itemId] = row.slot;
  }
  const hints = itemSlotHintsForClient();
  if (hints[itemId] != null) itemSlotById[itemId] = hints[itemId]!;
  return itemSlotById[itemId];
}

function isEquippableGearSlot(slot: string | undefined): boolean {
  return (
    slot === 'rhand' ||
    slot === 'lhand' ||
    slot === 'shield' ||
    slot === 'chest' ||
    slot === 'legs' ||
    slot === 'head' ||
    slot === 'gloves' ||
    slot === 'feet' ||
    slot === 'fullarmor' ||
    slot === 'ring' ||
    slot === 'neck' ||
    slot === 'earring'
  );
}

function canEquipFromBagSim(itemId: number): boolean {
  const slot = mergeClientSlotById(itemId);
  if (!isEquippableGearSlot(slot)) return false;
  /** Як `L2.isEquippableGearItem` + оновлений `canEquipFromBag`: ресурсна евристика не блокує екіп. */
  return true;
}

console.log('=== Fullarmor equip regression ===\n');

// Payload audit (before/after slot contract)
{
  const gearById = new Map(listGearCatalogForClient().map((r) => [r.itemId, r]));
  const hints = itemSlotHintsForClient();
  for (const itemId of [...FULLARMOR_IDS, 398]) {
    const view = buildItemClientView(itemId);
    const clientSlot = mergeClientSlotById(itemId);
    assert.equal(view.slot, ITEM_CATALOG[itemId]?.slot);
    assert.equal(hints[itemId], ITEM_CATALOG[itemId]?.slot);
    assert.equal(gearById.get(itemId)?.slot, ITEM_CATALOG[itemId]?.slot);
    assert.equal(clientSlot, ITEM_CATALOG[itemId]?.slot);
    if (view.slot === 'fullarmor') {
      assert.deepEqual(view.occupies, ['chest', 'legs']);
    }
  }
  console.log('Payload audit — gear/hints/client slot = ITEM_CATALOG — OK');
}

// A. Draconic in bag → equippable
{
  assert.equal(canEquipFromBagSim(6379), true);
  assert.equal(mergeClientSlotById(6379), 'fullarmor');
  console.log('A. Draconic Leather Armor → isEquippable / [Одіти] — OK');
}

// B. Plated Leather in bag → equippable (chest, not fullarmor)
{
  assert.equal(ITEM_CATALOG[398]?.slot, 'chest');
  assert.equal(canEquipFromBagSim(398), true);
  console.log('B. Plated Leather → [Одіти] — OK');
}

// C. chest + legs equipped → equip fullarmor returns pieces to bag once
{
  const start = inv(
    { l3: 365, l4: 388 },
    [{ itemId: 6379, qty: 1 }],
  );
  const next = equipFromBag(start, 6379);
  assert.equal(next.eq.l3, 6379);
  assert.equal(next.eq.l4, undefined);
  assert.ok(next.stacks.some((s) => s.itemId === 365));
  assert.ok(next.stacks.some((s) => s.itemId === 388));
  console.log('C. chest+legs → fullarmor — OK');
}

// D. fullarmor equipped → equip pants returns fullarmor once
{
  const start = inv(
    { l3: 6379 },
    [{ itemId: 418, qty: 1 }],
  );
  const next = equipFromBag(start, 418);
  assert.equal(next.eq.l3, undefined);
  assert.equal(next.eq.l4, 418);
  assert.equal(
    next.stacks.filter((s) => s.itemId === 6379).reduce((n, s) => n + s.qty, 0),
    1,
  );
  console.log('D. fullarmor → pants — OK');
}

// E. fullarmor P.Def once (після read-repair дубля l3+l4)
{
  const repaired = parseInventoryRaw({
    v: 1,
    stacks: [],
    eq: { l3: 6379, l4: 6379 },
  });
  assert.equal(sumEquippedArmorPDef(repaired.eq!), 249);
  assert.equal(sumEquippedArmorPDef(inv({ l3: 6379 }).eq!), 249);
  console.log('E. fullarmor P.Def counted once — OK');
}

// F. fullarmor set progress = one core piece
{
  const worn = resolveEquippedArmorSetBonuses(
    inv({ l3: 6379, lh: 6382, lg: 6380, lf: 6381 }),
  );
  const active = worn.activeSets.find((s) => s.setId === S_DRACONIC_LIGHT_SET.setId);
  assert.ok(active);
  assert.equal(active?.equippedCorePieces, S_DRACONIC_LIGHT_SET.corePieceIds.length);
  console.log('F. fullarmor set progress — one core piece — OK');
}

// G. duplicate fullarmor in chest+legs → read-repair
{
  const raw = parseInventoryRaw({
    v: 1,
    stacks: [],
    eq: { l3: 6379, l4: 6379, lh: 6382 },
  });
  assert.equal(raw.eq.l3, 6379);
  assert.equal(raw.eq.l4, undefined);
  assert.equal(raw.stacks.length, 1);
  assert.equal(raw.stacks[0]?.itemId, 6379);
  console.log('G. duplicate fullarmor read-repair — OK');
}

// H. buildItemClientView consistency (shop/inventory/modal contract)
{
  for (const itemId of FULLARMOR_IDS) {
    const bag = buildItemClientView(itemId);
    const equipped = buildItemClientView(itemId, inv({ l3: itemId }));
    assert.equal(bag.slot, equipped.slot);
    assert.deepEqual(bag.occupies, equipped.occupies);
    assert.equal(bag.pDef, equipped.pDef);
    assert.equal(bag.armorSetInfo?.setId, equipped.armorSetInfo?.setId);
  }
  console.log('H. buildItemClientView slot/occupies/pDef/setId consistent — OK');
}

// fullarmor + separate pants → read-repair
{
  const raw = parseInventoryRaw({
    v: 1,
    stacks: [],
    eq: { l3: 6379, l4: 418 },
  });
  assert.equal(raw.eq.l3, 6379);
  assert.equal(raw.eq.l4, undefined);
  assert.ok(raw.stacks.some((s) => s.itemId === 418));
  console.log('Extra. fullarmor + pants read-repair — OK');
}

console.log('\nAll fullarmor equip regression tests passed.');
