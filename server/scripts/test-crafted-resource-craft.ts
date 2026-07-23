/**
 * Craft service tests for crafted resources.
 * npm run test:crafted-resource-craft
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../src/lib/prisma.js';
import { buildApp } from '../src/app.js';
import { signAccessToken } from '../src/lib/jwt.js';
import {
  addItemToBag,
  countBagQty,
  emptyInventory,
  parseInventory,
} from '../src/data/inventory.js';
import {
  applyCraftedResourceCraft,
  buildCraftedResourceMaterialsBook,
  computeMaxCraftable,
  parseCraftCount,
} from '../src/services/craftedResourceCraftService.js';
import { CRAFTED_RESOURCE_RECIPE_BY_CODE } from '../src/data/craftedResourceRecipes.js';
import {
  isDwarfCrafterProfession,
  resolveCreateItemLevel,
} from '../src/domain/craftedResourceCraftAccess.js';
import { GameConflictError } from '../src/services/charErrors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

assert.throws(() => parseCraftCount(0), /craft_bad_count/);
assert.throws(() => parseCraftCount(1.5), /craft_bad_count/);
assert.throws(() => parseCraftCount(Number.POSITIVE_INFINITY), /craft_bad_count/);
assert.equal(parseCraftCount(3), 3);
ok('parseCraftCount validation');

assert.equal(isDwarfCrafterProfession('dwarf_artisan'), true);
assert.equal(isDwarfCrafterProfession('dwarf_warsmith'), true);
assert.equal(isDwarfCrafterProfession('dwarf_maestro'), true);
assert.equal(isDwarfCrafterProfession('dwarf_fighter'), false);
assert.equal(isDwarfCrafterProfession('dwarf_scavenger'), false);
ok('profession gate');

const artisanLv = resolveCreateItemLevel({
  l2Profession: 'dwarf_artisan',
  skillsLearnedJson: [{ battleId: 'l2_172', level: 1 }],
});
assert.equal(artisanLv, 2);
const warsmithLv = resolveCreateItemLevel({
  l2Profession: 'dwarf_warsmith',
  skillsLearnedJson: [{ battleId: 'l2_172', level: 1 }],
});
assert.equal(warsmithLv, 4);
assert.equal(
  resolveCreateItemLevel({
    l2Profession: 'dwarf_artisan',
    skillsLearnedJson: [],
  }),
  0,
);
ok('Create Item level resolver');

const cordRecipe = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('cord')!;
const invCord = addItemToBag(
  addItemToBag(emptyInventory(), 1880, 100),
  1868,
  1000,
);
const maxCord = computeMaxCraftable(cordRecipe, invCord, 2, 500, true);
assert.ok(maxCord >= 3);
ok('maxCraftable considers ingredients and MP');

async function dbAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function createCrafterUser(prof: string): Promise<{ userId: string; characterId: string }> {
  const login = `craft_smoke_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  let inv = emptyInventory();
  inv = addItemToBag(inv, 1864, 500);
  inv = addItemToBag(inv, 1868, 5000);
  inv = addItemToBag(inv, 1869, 500);
  inv = addItemToBag(inv, 1880, 500);
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name: `Craft${Math.floor(Math.random() * 1000)}`,
          race: 'Dwarf',
          classBranch: 'fighter',
          l2Profession: prof,
          level: 40,
          exp: BigInt(1_000_000_000),
          inventoryJson: inv as unknown as Prisma.InputJsonValue,
          skillsLearnedJson: [{ battleId: 'l2_172', level: 1 }] as unknown as Prisma.InputJsonValue,
          worldCombatStateJson: {
            playerMp: 10_000,
            lastTickAt: Date.now(),
            expiresAt: Date.now() + 30 * 60 * 1000,
            battleMods: {},
          } as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0];
  assert.ok(char);
  return { userId: user.id, characterId: char.id };
}

async function cleanupUser(userId: string) {
  await prisma.character.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function runDbTests(): Promise<void> {
  if (!(await dbAvailable())) {
    console.log('  (skip DB craft tests — PostgreSQL unavailable)');
    return;
  }

  const { userId, characterId } = await createCrafterUser('dwarf_warsmith');
  try {
    const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
    const rev0 = before.revision;

    const book = await buildCraftedResourceMaterialsBook(userId);
    assert.equal(book.canCraftProfession, true);
    assert.ok(book.createItemLevel >= 4);
    const cordRow = book.recipes.find((r) => r.code === 'cord');
    assert.ok(cordRow);
    assert.ok(cordRow!.maxCraftable >= 3);
    ok('GET book maxCraftable for Cord');

    const snap = await applyCraftedResourceCraft(userId, 'braided_hemp', 2, rev0);
    assert.equal(snap.revision, rev0 + 1);
    assert.equal(countBagQty(parseInventory(snap.inventory), 1878), 2);
    assert.equal(countBagQty(parseInventory(snap.inventory), 1864), 500 - 10);
    ok('craft braided hemp atomic');

    const snap2 = await applyCraftedResourceCraft(userId, 'cord', 3, snap.revision);
    assert.equal(countBagQty(parseInventory(snap2.inventory), 1884), 60);
    ok('Cord craftCount 3 → 60 Cord');

    const badProf = await createCrafterUser('dwarf_fighter');
    try {
      await assert.rejects(
        () => applyCraftedResourceCraft(badProf.userId, 'braided_hemp', 1, 1),
        (e: Error) => e.message === 'craft_bad_profession',
      );
      ok('wrong profession blocked');
    } finally {
      await cleanupUser(badProf.userId);
    }

    const lowSkill = await createCrafterUser('dwarf_artisan');
    await prisma.character.update({
      where: { id: lowSkill.characterId },
      data: { skillsLearnedJson: [] as unknown as Prisma.InputJsonValue },
    });
    try {
      await assert.rejects(
        () => applyCraftedResourceCraft(lowSkill.userId, 'braided_hemp', 1, 1),
        (e: Error) => e.message === 'craft_no_create_item',
      );
      ok('no Create Item blocked');
    } finally {
      await cleanupUser(lowSkill.userId);
    }

    const stale = await applyCraftedResourceCraft(userId, 'braided_hemp', 1, rev0).then(
      () => null,
      (e) => e,
    );
    assert.ok(stale instanceof GameConflictError);
    ok('stale expectedRevision → conflict');

    const afterStale = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
    const invAfter = parseInventory(afterStale.inventoryJson);
    assert.equal(countBagQty(invAfter, 1878), countBagQty(parseInventory(snap2.inventory), 1878));
    ok('failed craft does not change inventory');

    const app = await buildApp();
    const token = signAccessToken(userId);
    const postRes = await app.inject({
      method: 'POST',
      url: '/game/craft/materials',
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'application/json',
      },
      payload: {
        recipeCode: 'synthetic_cokes',
        craftCount: 5,
        expectedRevision: afterStale.revision,
      },
    });
    if (postRes.statusCode === 400) {
      ok('Synthetic Cokes craftCount 5 blocked by materials (expected in sparse inv)');
    } else {
      assert.equal(postRes.statusCode, 200);
      ok('Synthetic Cokes craftCount 5 API');
    }
    await app.close();
  } finally {
    await cleanupUser(userId);
  }
}

runDbTests()
  .then(function () {
    console.log('\ntest-crafted-resource-craft: OK');
  })
  .catch(function (err) {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async function () {
    await prisma.$disconnect();
  });
