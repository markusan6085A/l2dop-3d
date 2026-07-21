/**
 * Глобальний аудит колізій itemId у dropsShopOverrides.json.
 * npm run test:drops-item-id-collisions
 */
import {
  auditDropsShopItemIdCollisions,
  listDropsShopItemIdBindings,
} from '../src/domain/dropsShopItemIdCollisions.js';

function main(): void {
  const collisions = auditDropsShopItemIdCollisions();

  if (collisions.length > 0) {
    console.error('dropsShop itemId collisions FAILED:\n');
    for (const c of collisions) {
      console.error(`  itemId ${c.itemId} — ${c.reason}:`);
      for (const b of c.bindings) {
        console.error(
          `    - [${b.grade}] ${b.shopKey} (${b.category}) fp=${b.statFingerprint}`,
        );
      }
    }
    process.exit(1);
  }

  const multi = new Map<number, string[]>();
  for (const b of listDropsShopItemIdBindings()) {
    if (!multi.has(b.itemId)) multi.set(b.itemId, []);
    multi.get(b.itemId)!.push(b.shopKey);
  }
  const shared = [...multi.entries()].filter(([, keys]) => keys.length > 1);
  if (shared.length > 0) {
    console.log('Shared itemId bindings (allowlisted or identical stats):');
    for (const [id, keys] of shared) {
      console.log(`  ${id}: ${keys.join(', ')}`);
    }
  }

  console.log(
    `dropsShop itemId collisions OK (${listDropsShopItemIdBindings().length} bindings)`,
  );
}

main();
