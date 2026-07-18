/**
 * Smoke: deposit inventory → warehouse атомарно; rollback при помилці складу.
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { addItemToBag, emptyInventory, parseInventory } from '../src/data/inventory.js';
import { depositBagToWarehouse, emptyWarehouse, parseWarehouse } from '../src/data/warehouse.js';
import { prisma } from '../src/lib/prisma.js';
import { mutateCharacterWithRevision } from '../src/services/characterMutation.js';
import { applyWarehouseDeposit } from '../src/services/warehouseService.js';

const TEST_ITEM_ID = 57;

async function createSmokeUser(): Promise<{ userId: string; characterId: string }> {
  const login = `wh_smoke_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name: `WhSmoke${Math.floor(Math.random() * 1000)}`,
          race: 'Human',
          classBranch: 'fighter',
          level: 1,
          inventoryJson: addItemToBag(emptyInventory(), TEST_ITEM_ID, 3) as unknown as Prisma.InputJsonValue,
          warehouseJson: emptyWarehouse() as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0];
  assert.ok(char, 'character created');
  return { userId: user.id, characterId: char.id };
}

async function cleanup(userId: string) {
  await prisma.character.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

function stackQty(stacks: { itemId: number; qty: number }[], itemId: number): number {
  return stacks
    .filter((s) => s.itemId === itemId)
    .reduce((sum, s) => sum + s.qty, 0);
}

async function main() {
  const { userId, characterId } = await createSmokeUser();

  try {
    const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
    const invBefore = parseInventory(before.inventoryJson);
    const whBefore = parseWarehouse(before.warehouseJson);
    assert.equal(stackQty(invBefore.stacks, TEST_ITEM_ID), 3);
    assert.equal(stackQty(whBefore.stacks, TEST_ITEM_ID), 0);

    const snap = await applyWarehouseDeposit(userId, before.revision, {
      itemId: TEST_ITEM_ID,
      enchant: 0,
      qty: 2,
    });
    assert.equal(stackQty(snap.inventory.stacks, TEST_ITEM_ID), 1);
    assert.equal(stackQty(snap.warehouse.stacks, TEST_ITEM_ID), 2);
    assert.ok(snap.revision > before.revision);

    const after = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
    const invAfter = parseInventory(after.inventoryJson);
    const whAfter = parseWarehouse(after.warehouseJson);
    assert.equal(stackQty(invAfter.stacks, TEST_ITEM_ID), 1);
    assert.equal(stackQty(whAfter.stacks, TEST_ITEM_ID), 2);

    const dup = await applyWarehouseDeposit(userId, after.revision, {
      itemId: TEST_ITEM_ID,
      enchant: 0,
      qty: 99,
    }).then(
      () => null,
      (e: Error) => e.message
    );
    assert.ok(dup && dup !== 'ok', 'over-deposit must fail');

    const afterDup = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
    const invDup = parseInventory(afterDup.inventoryJson);
    const whDup = parseWarehouse(afterDup.warehouseJson);
    assert.equal(stackQty(invDup.stacks, TEST_ITEM_ID), 1);
    assert.equal(stackQty(whDup.stacks, TEST_ITEM_ID), 2);

    let rollbackOk = false;
    try {
      await prisma.$transaction(async (tx) => {
        const char = await tx.character.findUniqueOrThrow({ where: { id: characterId } });
        await mutateCharacterWithRevision(tx, characterId, char.revision, (current) => {
          const inv = parseInventory(current.inventoryJson);
          const wh = parseWarehouse(current.warehouseJson);
          depositBagToWarehouse(wh, inv, TEST_ITEM_ID, 0, 1);
          throw new Error('simulate_warehouse_write_fail');
        });
      });
    } catch {
      rollbackOk = true;
    }
    assert.ok(rollbackOk, 'forced warehouse failure must abort transaction');

    const afterRollback = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
    const invRb = parseInventory(afterRollback.inventoryJson);
    const whRb = parseWarehouse(afterRollback.warehouseJson);
    assert.equal(stackQty(invRb.stacks, TEST_ITEM_ID), 1);
    assert.equal(stackQty(whRb.stacks, TEST_ITEM_ID), 2);

    console.log('warehouse-deposit-atomic-smoke: OK');
  } finally {
    await cleanup(userId);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
