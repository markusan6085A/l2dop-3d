/**
 * Аудит магазину дропів: які позиції purchasable і чому ні.
 * Запуск: npx tsx server/scripts/audit-drops-shop-purchasable.ts
 */
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { DROPS_SHOP_CATALOG } from '../src/data/dropsShopCatalog.generated.js';
import { DROPS_SHOP_ARROW_ROWS } from '../src/data/dropsShopArrowsCatalog.js';
import { DROPS_SHOP_CONSUMABLE_ROWS } from '../src/data/dropsShopConsumablesCatalog.js';
import { DROPS_SHOP_FIGHTER_SOULSHOT_ROWS } from '../src/data/dropsShopFighterSoulshotsCatalog.js';
import {
  buildDropsShopCatalogForClient,
  dropsShopItemMatchesCategory,
  loadDropsShopOverrides,
} from '../src/services/dropsShopService.js';
import {
  dropsGmPurchaseByShopKeyLower,
  dropsShopRelPathFromGmIcon,
} from '../src/domain/dropsShopGmItemIdByShopKey.js';

const ALL_ROWS = DROPS_SHOP_CATALOG.concat(
  DROPS_SHOP_CONSUMABLE_ROWS,
  DROPS_SHOP_ARROW_ROWS,
  DROPS_SHOP_FIGHTER_SOULSHOT_ROWS,
);

const overrides = loadDropsShopOverrides();
const gm = dropsGmPurchaseByShopKeyLower();

type FailReason =
  | 'no_override_no_gm'
  | 'bad_item_id'
  | 'no_catalog_meta'
  | 'category_mismatch'
  | 'ok';

function diagnose(row: (typeof ALL_ROWS)[number]): {
  reason: FailReason;
  itemId: number | null;
  price: number | null;
} {
  const o = overrides[row.shopKey];
  const keyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
  const iconRel = dropsShopRelPathFromGmIcon(row.iconUrl);
  const gmByShopKey = gm.get(keyNorm);
  const gmByIcon = iconRel ? gm.get(iconRel) : undefined;
  const itemId = o?.itemId ?? gmByShopKey?.itemId ?? gmByIcon?.itemId ?? null;
  const price =
    o?.priceAdena ?? gmByShopKey?.priceAdena ?? gmByIcon?.priceAdena ?? null;

  if (itemId == null || price == null) {
    return { reason: 'no_override_no_gm', itemId, price };
  }
  const meta = ITEM_CATALOG[itemId];
  if (!meta) return { reason: 'no_catalog_meta', itemId, price };
  if (!dropsShopItemMatchesCategory(itemId, row.category)) {
    return { reason: 'category_mismatch', itemId, price };
  }
  return { reason: 'ok', itemId, price };
}

console.log('overrides loaded:', Object.keys(overrides).length);
console.log('gm map size (by icon rel path):', gm.size);

const fails: string[] = [];
const consumableFails: string[] = [];
for (const row of ALL_ROWS) {
  const d = diagnose(row);
  if (d.reason !== 'ok') {
    const line = `${row.shopKey} [${row.category}/${row.grade}] -> ${d.reason} itemId=${d.itemId} slot=${d.itemId != null ? ITEM_CATALOG[d.itemId]?.slot : 'n/a'}`;
    fails.push(line);
    if (row.category === 'consumable') consumableFails.push(line);
  }
}

console.log('\n=== CONSUMABLES FAIL ===');
if (!consumableFails.length) console.log('(none — all OK at source level)');
else consumableFails.forEach((l) => console.log(l));

console.log('\n=== ALL FAIL (first 40) ===');
if (!fails.length) console.log('(none)');
else fails.slice(0, 40).forEach((l) => console.log(l));
if (fails.length > 40) console.log(`... +${fails.length - 40} more`);

const client = buildDropsShopCatalogForClient();
let clientTotal = 0;
let clientConsumable = 0;
for (const g of client.grades) {
  for (const s of g.sections) {
    clientTotal += s.items.length;
    if (s.category === 'consumable') clientConsumable += s.items.length;
  }
}
console.log('\nclient purchasable total:', clientTotal);
console.log('client purchasable consumables:', clientConsumable);

const ng = client.grades.find((g) => g.grade === 'NG');
const ngCons = ng?.sections.find((s) => s.category === 'consumable');
console.log(
  'NG consumables in client:',
  ngCons?.items.map((i) => `${i.shopKey} id=${i.itemId} price=${i.priceAdena}`) ?? []
);
console.log('ITEM_CATALOG[17]:', ITEM_CATALOG[17]);
