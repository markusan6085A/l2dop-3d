/**
 * Перевірка покупки розхідників у магазині (без HTTP): резолв ціни + addItemToBag.
 * Запуск: npx tsx server/scripts/audit-drops-shop-buy-mutation.ts
 */
import assert from 'node:assert/strict';
import { addItemToBag, parseInventory } from '../src/data/inventory.js';
import {
  buildDropsShopCatalogForClient,
  clearDropsShopOverridesCache,
  loadDropsShopOverrides,
} from '../src/services/dropsShopService.js';

const CONSUMABLE_KEYS = [
  'consumable/arrow_ng',
  'consumable/arrow_d',
  'consumable/potion_lesser_healing',
  'consumable/fighter_soulshot_ng',
  'consumable/blessed_spiritshot_ng',
];

clearDropsShopOverridesCache();
const overrides = loadDropsShopOverrides();
assert.ok(
  overrides['consumable/arrow_ng']?.itemId === 17,
  'arrow_ng override must resolve item 17'
);

const client = buildDropsShopCatalogForClient();
const byKey = new Map<string, { itemId: number; priceAdena: number }>();
for (const g of client.grades) {
  for (const s of g.sections) {
    if (s.category !== 'consumable') continue;
    for (const it of s.items) {
      if (it.itemId != null && it.priceAdena != null) {
        byKey.set(it.shopKey, {
          itemId: it.itemId,
          priceAdena: it.priceAdena,
        });
      }
    }
  }
}

for (const key of CONSUMABLE_KEYS) {
  const row = byKey.get(key);
  assert.ok(row, `${key} must be purchasable in client catalog`);
}

const inv0 = parseInventory({ stacks: [], eq: {} });
const bought = addItemToBag(inv0, 17, 50);
const stack = bought.stacks.find((s) => s.itemId === 17);
assert.equal(stack?.qty, 50, 'arrow id 17 must land in bag stacks');

console.log('drops-shop buy mutation audit: OK');
console.log(
  'consumables purchasable:',
  [...byKey.entries()].map(([k, v]) => `${k} -> ${v.itemId} @ ${v.priceAdena}`).join('\n')
);
