/**
 * D-grade weapon craft tests (етап 3B).
 * npm run test:d-grade-weapon-craft
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { config } from 'dotenv';
import { prisma } from '../src/lib/prisma.js';
import { buildApp } from '../src/app.js';
import { signAccessToken } from '../src/lib/jwt.js';
import {
  addItemToBag,
  countBagQty,
  emptyInventory,
  parseInventory,
} from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_CATALOG,
  D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS,
} from '../src/data/dGradeWeaponKeyMaterialsCatalog.js';
import {
  D_GRADE_WEAPON_RECIPE_ITEM_CATALOG,
  D_GRADE_WEAPON_RECIPE_ITEM_IDS,
} from '../src/data/dGradeWeaponRecipeItemsCatalog.js';
import {
  D_GRADE_WEAPON_CRAFT_RECIPES,
  D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE,
} from '../src/data/dGradeWeaponCraftRecipes.js';
import {
  CRYSTAL_D_ITEM_ID,
  GEMSTONE_D_ITEM_ID,
} from '../src/data/gradeCraftMaterialsCatalog.js';
import {
  applyDGradeWeaponCraft,
  buildDGradeWeaponCraftBook,
} from '../src/services/dGradeWeaponCraftService.js';
import { applyLearnRecipeFromBag } from '../src/services/recipeLearnService.js';
import {
  normalizeRecipeBookJson,
  addLearnedRecipe,
} from '../src/domain/recipeBook.js';
import { GameConflictError } from '../src/services/charErrors.js';
import {
  resolveItemIconPublicUrl,
  resolveL2dopItemIconFilePath,
} from '../src/services/l2dopItemIconPath.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
config({ path: path.join(__dirname, '../.env') });

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

const OUTPUT_IDS = [159, 70, 2499, 297, 280, 225, 262, 189];
for (const id of OUTPUT_IDS) {
  assert.ok(ITEM_CATALOG[id], `output weapon ${id} exists in ITEM_CATALOG`);
}
ok('all 8 weapon output itemId exist');

assert.equal(new Set(D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS).size, 8);
assert.equal(new Set(D_GRADE_WEAPON_RECIPE_ITEM_IDS).size, 8);
ok('unique key material and recipe itemIds');

for (const id of [...D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS, ...D_GRADE_WEAPON_RECIPE_ITEM_IDS]) {
  assert.ok(!Object.prototype.hasOwnProperty.call(ITEM_CATALOG, id) || ITEM_CATALOG[id], `catalog has ${id}`);
  const others = Object.keys(ITEM_CATALOG).map(Number).filter((x) => x === id);
  assert.equal(others.length, 1);
}
ok('no ITEM_CATALOG collisions');

for (const row of D_GRADE_WEAPON_KEY_MATERIAL_CATALOG) {
  const p = path.join(repoRoot, 'server/public', row.iconPath.replace(/^\//, ''));
  assert.ok(fs.existsSync(p), `icon ${row.iconPath}`);
  assert.ok(resolveL2dopItemIconFilePath(row.itemId), `resolver ${row.itemId}`);
}
assert.ok(
  fs.existsSync(
    path.join(repoRoot, 'server/public/icons/recipes/d_grade/recipe_weapon_d.jpg'),
  ),
);
for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
  assert.equal(row.iconPath, '/icons/recipes/d_grade/recipe_weapon_d.jpg');
}
ok('all iconPath exist');

/** Етап 3D.1 — канонічні кількості (key ×8, mp 129, success 100%). */
const EXPECTED_RECIPE_QUANTITIES: Record<
  string,
  Array<{ itemId: number; quantity: number }>
> = {
  bonebreaker_100: [
    { itemId: 4113, quantity: 8 },
    { itemId: 1880, quantity: 12 },
    { itemId: 1879, quantity: 12 },
    { itemId: 1885, quantity: 6 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 135 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 31 },
  ],
  glaive_100: [
    { itemId: 4117, quantity: 8 },
    { itemId: 1880, quantity: 12 },
    { itemId: 1879, quantity: 7 },
    { itemId: 1885, quantity: 4 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 115 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 30 },
  ],
  elven_long_sword_100: [
    { itemId: 4116, quantity: 8 },
    { itemId: 1880, quantity: 10 },
    { itemId: 1879, quantity: 10 },
    { itemId: 1883, quantity: 1 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 90 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 22 },
  ],
  claymore_100: [
    { itemId: 4114, quantity: 8 },
    { itemId: 1880, quantity: 13 },
    { itemId: 1879, quantity: 8 },
    { itemId: 1883, quantity: 1 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 115 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 28 },
  ],
  mithril_dagger_100: [
    { itemId: 4119, quantity: 8 },
    { itemId: 1880, quantity: 8 },
    { itemId: 1879, quantity: 8 },
    { itemId: 1883, quantity: 1 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 85 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 26 },
  ],
  light_crossbow_100: [
    { itemId: 4118, quantity: 8 },
    { itemId: 1880, quantity: 18 },
    { itemId: 1885, quantity: 4 },
    { itemId: 1878, quantity: 4 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 185 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 45 },
  ],
  scallop_jamadhr_100: [
    { itemId: 4120, quantity: 8 },
    { itemId: 1880, quantity: 10 },
    { itemId: 1879, quantity: 10 },
    { itemId: 1885, quantity: 6 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 105 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 28 },
  ],
  staff_of_life_100: [
    { itemId: 4121, quantity: 8 },
    { itemId: 1880, quantity: 10 },
    { itemId: 1881, quantity: 14 },
    { itemId: 1878, quantity: 8 },
    { itemId: CRYSTAL_D_ITEM_ID, quantity: 145 },
    { itemId: GEMSTONE_D_ITEM_ID, quantity: 32 },
  ],
};

for (const recipe of D_GRADE_WEAPON_CRAFT_RECIPES) {
  assert.equal(recipe.mpCost, 129, `${recipe.recipeCode} mpCost`);
  assert.equal(recipe.successRate, 100, `${recipe.recipeCode} successRate`);
  assert.equal(recipe.outputCount, 1, `${recipe.recipeCode} outputCount`);
  const expected = EXPECTED_RECIPE_QUANTITIES[recipe.recipeCode];
  assert.ok(expected, `expected map for ${recipe.recipeCode}`);
  assert.equal(recipe.ingredients.length, expected!.length);
  for (const exp of expected!) {
    const ing = recipe.ingredients.find((i) => i.itemId === exp.itemId);
    assert.ok(ing, `${recipe.recipeCode} has item ${exp.itemId}`);
    assert.equal(ing!.quantity, exp.quantity, `${recipe.recipeCode} qty ${exp.itemId}`);
  }
  const keyMat = recipe.ingredients.find((i) =>
    D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS.includes(i.itemId),
  );
  assert.ok(keyMat && keyMat.quantity === 8, `${recipe.recipeCode} key ×8`);
}
ok('all 8 recipes have exact stage-3D.1 quantities');

assert.equal(normalizeRecipeBookJson(null).learned.length, 0);
assert.equal(normalizeRecipeBookJson({ learned: ['bonebreaker_100', 'bonebreaker_100', 'bad'] }).learned.join(','), 'bonebreaker_100');
ok('recipeBookJson normalization');

async function dbAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.character.findFirst({ select: { id: true, recipeBookJson: true } });
    return true;
  } catch {
    return false;
  }
}

function grantMaterialsForRecipe(recipeCode: string, inv: ReturnType<typeof emptyInventory>) {
  const recipe = D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE.get(recipeCode)!;
  let next = inv;
  for (const ing of recipe.ingredients) {
    next = addItemToBag(next, ing.itemId, ing.quantity * 2);
  }
  return next;
}

async function createCrafterUser(
  prof: string,
  extra?: {
    recipeBook?: string[];
    inventory?: ReturnType<typeof emptyInventory>;
  },
): Promise<{ userId: string; characterId: string; token: string }> {
  const login = `dweapon_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  let inv = extra?.inventory ?? emptyInventory();
  inv = addItemToBag(inv, 921001, 5);
  const book = normalizeRecipeBookJson(
    extra?.recipeBook ? { v: 1, learned: extra.recipeBook } : null,
  );
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name: `DW${Math.floor(Math.random() * 10000)}`,
          race: 'Dwarf',
          classBranch: 'fighter',
          l2Profession: prof,
          level: 40,
          exp: BigInt(1_000_000_000),
          inventoryJson: inv as unknown as Prisma.InputJsonValue,
          recipeBookJson: book as unknown as Prisma.InputJsonValue,
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
  const char = user.characters[0]!;
  const token = signAccessToken(user.id);
  return { userId: user.id, characterId: char.id, token };
}

async function cleanupUser(userId: string) {
  await prisma.character.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function runDbTests(): Promise<void> {
  if (!(await dbAvailable())) {
    console.log('  (skip DB weapon craft tests — PostgreSQL unavailable or recipeBookJson migration not applied)');
    return;
  }

  // learn tests
  {
    const { userId, characterId } = await createCrafterUser('dwarf_warsmith');
    try {
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      const rev = before.revision;
      const r = await applyLearnRecipeFromBag(userId, 921001, rev);
      assert.equal(r.learnedRecipeCode, 'bonebreaker_100');
      assert.equal(countBagQty(parseInventory(r.character.inventory), 921001), 4);
      const book = normalizeRecipeBookJson(
        (await prisma.character.findUniqueOrThrow({ where: { id: characterId } })).recipeBookJson,
      );
      assert.ok(book.learned.includes('bonebreaker_100'));
      ok('learn consumes one scroll and writes targetRecipeCode');

      const rev2 = r.character.revision;
      await assert.rejects(
        () => applyLearnRecipeFromBag(userId, 921001, rev2),
        (e: unknown) => e instanceof Error && e.message === 'RECIPE_ALREADY_LEARNED',
      );
      const afterDup = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      assert.equal(countBagQty(parseInventory(afterDup.inventoryJson), 921001), 4);
      ok('duplicate learn does not consume scroll');

      await assert.rejects(
        () => applyLearnRecipeFromBag(userId, 999999, rev2),
        (e: unknown) => e instanceof Error && e.message === 'recipe_unknown_item',
      );
      ok('unknown recipe item rejected');
    } finally {
      await cleanupUser(userId);
    }
  }

  {
    const { userId, characterId } = await createCrafterUser('dwarf_artisan');
    try {
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      await assert.rejects(
        () => applyLearnRecipeFromBag(userId, 921001, before.revision),
        (e: unknown) => e instanceof Error && e.message === 'RECIPE_CREATE_LEVEL_TOO_LOW',
      );
      ok('Artisan cannot learn level-4 recipe');
    } finally {
      await cleanupUser(userId);
    }
  }

  for (const prof of ['dwarf_warsmith', 'dwarf_maestro'] as const) {
    const { userId } = await createCrafterUser(prof, {
      inventory: addItemToBag(emptyInventory(), 921002, 1),
    });
    try {
      const before = await prisma.character.findFirstOrThrow({ where: { userId } });
      const r = await applyLearnRecipeFromBag(userId, 921002, before.revision);
      assert.equal(r.learnedRecipeCode, 'claymore_100');
      ok(`${prof} can learn recipe`);
    } finally {
      await cleanupUser(userId);
    }
  }

  {
    const { userId } = await createCrafterUser('human_fighter', {
      inventory: addItemToBag(emptyInventory(), 921001, 1),
    });
    try {
      const before = await prisma.character.findFirstOrThrow({ where: { userId } });
      await assert.rejects(
        () => applyLearnRecipeFromBag(userId, 921001, before.revision),
        (e: unknown) => e instanceof Error && e.message === 'recipe_bad_profession',
      );
      ok('other profession cannot learn');
    } finally {
      await cleanupUser(userId);
    }
  }

  // craft tests per weapon
  const craftCases: Array<{ code: string; outputId: number }> = [
    { code: 'bonebreaker_100', outputId: 159 },
    { code: 'glaive_100', outputId: 297 },
    { code: 'elven_long_sword_100', outputId: 2499 },
    { code: 'claymore_100', outputId: 70 },
    { code: 'mithril_dagger_100', outputId: 225 },
    { code: 'light_crossbow_100', outputId: 280 },
    { code: 'scallop_jamadhr_100', outputId: 262 },
    { code: 'staff_of_life_100', outputId: 189 },
  ];

  for (const { code, outputId } of craftCases) {
    let inv = grantMaterialsForRecipe(code, emptyInventory());
    inv = addItemToBag(inv, D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE.get(code)!.recipeItemId, 3);
    const { userId, characterId } = await createCrafterUser('dwarf_warsmith', {
      recipeBook: [code],
      inventory: inv,
    });
    try {
      await prisma.character.update({
        where: { id: characterId },
        data: {
          worldCombatStateJson: {
            playerMp: 500,
            lastTickAt: Date.now(),
            expiresAt: Date.now() + 30 * 60 * 1000,
            battleMods: {},
          },
        },
      });
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      const recipe = D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE.get(code)!;
      const scrollBefore = countBagQty(parseInventory(before.inventoryJson), recipe.recipeItemId);
      const mpBefore = 500;
      const snap = await applyDGradeWeaponCraft(userId, code, before.revision);
      const after = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      const invAfter = parseInventory(after.inventoryJson);
      for (const ing of recipe.ingredients) {
        const expected = ing.quantity * 2 - ing.quantity;
        assert.equal(countBagQty(invAfter, ing.itemId), expected, `${code} material ${ing.itemId}`);
      }
      assert.equal(countBagQty(invAfter, outputId), 1);
      assert.equal(countBagQty(invAfter, recipe.recipeItemId), scrollBefore);
      const mpAfter = (
        after.worldCombatStateJson as { playerMp?: number }
      ).playerMp!;
      assert.equal(mpAfter, mpBefore - 129);
      assert.equal(snap.revision, before.revision + 1);
      ok(`${code} craft deducts exact materials and adds weapon`);
    } finally {
      await cleanupUser(userId);
    }
  }

  // insufficient by 1 unit — per weapon
  for (const { code } of craftCases) {
    const recipe = D_GRADE_WEAPON_CRAFT_RECIPE_BY_CODE.get(code)!;
    const shortIng = recipe.ingredients[1]!;
    let inv = emptyInventory();
    for (const ing of recipe.ingredients) {
      const qty =
        ing.itemId === shortIng.itemId ? ing.quantity - 1 : ing.quantity;
      inv = addItemToBag(inv, ing.itemId, qty);
    }
    const { userId, characterId } = await createCrafterUser('dwarf_warsmith', {
      recipeBook: [code],
      inventory: inv,
    });
    try {
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      await assert.rejects(
        () => applyDGradeWeaponCraft(userId, code, before.revision),
        (e: unknown) => e instanceof Error && e.message === 'craft_no_materials',
      );
      const after = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      assert.equal(after.revision, before.revision);
      ok(`${code} rejects craft when one material short by 1`);
    } finally {
      await cleanupUser(userId);
    }
  }

  // not learned
  {
    let inv = grantMaterialsForRecipe('bonebreaker_100', emptyInventory());
    const { userId } = await createCrafterUser('dwarf_warsmith', { inventory: inv });
    try {
      const before = await prisma.character.findFirstOrThrow({ where: { userId } });
      await assert.rejects(
        () => applyDGradeWeaponCraft(userId, 'bonebreaker_100', before.revision),
        (e: unknown) => e instanceof Error && e.message === 'craft_recipe_not_learned',
      );
      ok('unlearned recipe cannot craft');
    } finally {
      await cleanupUser(userId);
    }
  }

  // insufficient resource
  {
    const { userId, characterId } = await createCrafterUser('dwarf_warsmith', {
      recipeBook: ['bonebreaker_100'],
      inventory: addItemToBag(emptyInventory(), 4113, 1),
    });
    try {
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      await assert.rejects(
        () => applyDGradeWeaponCraft(userId, 'bonebreaker_100', before.revision),
        (e: unknown) => e instanceof Error && e.message === 'craft_no_materials',
      );
      const after = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      assert.equal(after.revision, before.revision);
      assert.equal(countBagQty(parseInventory(after.inventoryJson), 4113), 1);
      ok('missing resource — no partial deduct');
    } finally {
      await cleanupUser(userId);
    }
  }

  // insufficient MP
  {
    let inv = grantMaterialsForRecipe('bonebreaker_100', emptyInventory());
    const { userId, characterId } = await createCrafterUser('dwarf_warsmith', {
      recipeBook: ['bonebreaker_100'],
      inventory: inv,
    });
    try {
      await prisma.character.update({
        where: { id: characterId },
        data: {
          worldCombatStateJson: {
            playerMp: 10,
            lastTickAt: Date.now(),
            expiresAt: Date.now() + 30 * 60 * 1000,
            battleMods: {},
          },
        },
      });
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      await assert.rejects(
        () => applyDGradeWeaponCraft(userId, 'bonebreaker_100', before.revision),
        (e: unknown) => e instanceof Error && e.message === 'craft_no_mp',
      );
      ok('missing MP — nothing spent');
    } finally {
      await cleanupUser(userId);
    }
  }

  // 409 revision conflict
  {
    let inv = grantMaterialsForRecipe('bonebreaker_100', emptyInventory());
    const { userId, characterId, token } = await createCrafterUser('dwarf_warsmith', {
      recipeBook: ['bonebreaker_100'],
      inventory: inv,
    });
    try {
      const app = await buildApp();
      await app.ready();
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      const badRev = before.revision + 999;
      const res = await app.inject({
        method: 'POST',
        url: '/game/craft/weapons',
        headers: { authorization: `Bearer ${token}` },
        payload: { recipeCode: 'bonebreaker_100', expectedRevision: badRev },
      });
      assert.equal(res.statusCode, 409);
      ok('wrong expectedRevision returns 409');

      const res2 = await app.inject({
        method: 'POST',
        url: '/game/craft/weapons',
        headers: { authorization: `Bearer ${token}` },
        payload: { recipeCode: 'bonebreaker_100', expectedRevision: before.revision, craftCount: 2 },
      });
      assert.equal(res2.statusCode, 400);
      ok('craftCount > 1 rejected');

      await app.close();
    } finally {
      await cleanupUser(userId);
    }
  }

  // concurrent revision
  {
    let inv = grantMaterialsForRecipe('bonebreaker_100', emptyInventory());
    const { userId, characterId } = await createCrafterUser('dwarf_warsmith', {
      recipeBook: ['bonebreaker_100'],
      inventory: inv,
    });
    try {
      const before = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      const first = applyDGradeWeaponCraft(userId, 'bonebreaker_100', before.revision);
      const second = applyDGradeWeaponCraft(userId, 'bonebreaker_100', before.revision);
      const results = await Promise.allSettled([first, second]);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      assert.equal(fulfilled.length, 1);
      assert.equal(rejected.length, 1);
      const after = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
      assert.equal(countBagQty(parseInventory(after.inventoryJson), 159), 1);
      ok('concurrent same revision does not duplicate weapon');
    } finally {
      await cleanupUser(userId);
    }
  }

  {
    const { userId } = await createCrafterUser('dwarf_warsmith', { recipeBook: ['bonebreaker_100'] });
    try {
      const book = await buildDGradeWeaponCraftBook(userId);
      assert.ok(book.recipes.length === 8);
      ok('GET weapon craft book');
    } finally {
      await cleanupUser(userId);
    }
  }
}

async function main(): Promise<void> {
  await runDbTests();
  console.log('\nD-grade weapon craft tests OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
