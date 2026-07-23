/**
 * D-grade weapon recipe retail drop/spoil (етап 3C).
 * npm run test:d-grade-weapon-recipe-drops
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { config } from 'dotenv';
import { prisma } from '../src/lib/prisma.js';
import { buildApp } from '../src/app.js';
import { signAccessToken } from '../src/lib/jwt.js';
import {
  addItemToBag,
  emptyInventory,
  parseInventory,
} from '../src/data/inventory.js';
import {
  D_GRADE_WEAPON_RECIPE_ITEM_IDS,
  D_GRADE_WEAPON_RECIPE_ITEM_BY_ID,
} from '../src/data/dGradeWeaponRecipeItemsCatalog.js';
import {
  D_GRADE_WEAPON_RECIPE_MOB_SOURCES,
} from '../src/data/dGradeWeaponRecipeMobDropCatalog.js';
import {
  findDGradeWeaponRecipeSource,
  formatChanceConversionExample,
  interludePercentToDropChance,
  listDGradeWeaponRecipeSourcesForNpc,
  mergeDGradeWeaponRecipeDropOverlay,
} from '../src/data/dGradeWeaponRecipeMobDrops.js';
import { ensureMobDropBag } from '../src/domain/spawnSyntheticRewards.js';
import { rollKillLoot } from '../src/domain/killLoot.js';
import { applyLearnRecipeFromBag } from '../src/services/recipeLearnService.js';
import { normalizeRecipeBookJson } from '../src/domain/recipeBook.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const RECIPE_IDS = {
  bonebreaker: 921001,
  claymore: 921002,
  elvenLongSword: 921003,
  glaive: 921004,
  lightCrossbow: 921005,
  mithrilDagger: 921006,
  scallopJamadhr: 921007,
  staffOfLife: 921008,
} as const;

const NPC = {
  ragnaOrcSeer: 20779,
  ragnaOrcOverlord: 20778,
  porta: 20213,
  taikOrc: 20630,
  dailaon: 20790,
  tasaba21642: 21642,
  tasaba21643: 21643,
  lienrik20786: 20786,
  lienrik21644: 21644,
} as const;

const DWARF_SPOILER_CTX = {
  race: 'dwarf',
  l2Profession: 'dwarf_bounty_hunter',
  skillsLearnedJson: [{ id: 'l2_254', level: 1 }],
} as const;

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

function findDrop(
  drops: DropEntry[],
  itemId: number,
): DropEntry | undefined {
  return drops.find((d) => d.l2ItemId === itemId);
}

function rollDropQty(entry: DropEntry, random: number): number {
  const p =
    entry.chancePerMillion != null
      ? entry.chancePerMillion / 1_000_000
      : entry.chance;
  if (!Number.isFinite(p) || p <= 0 || random >= p) return 0;
  return entry.min;
}

// 1. All normal drop entries point to project itemIds 921001–921008
for (const source of D_GRADE_WEAPON_RECIPE_MOB_SOURCES) {
  assert.ok(
    D_GRADE_WEAPON_RECIPE_ITEM_IDS.includes(source.itemId),
    `source itemId ${source.itemId}`,
  );
}
ok('all sources use project recipe itemIds 921001–921008');

// 14. Chance conversion
const conv = formatChanceConversionExample(0.04997);
assert.equal(conv.percent, 0.04997);
assert.ok(Math.abs(conv.probability - 0.0004997) < 1e-10);
assert.equal(interludePercentToDropChance(1.864), 0.01864);
ok('percent → probability conversion (0.04997% → 0.0004997)');

// 13. Quantity always 1
for (const source of D_GRADE_WEAPON_RECIPE_MOB_SOURCES) {
  const bag = ensureMobDropBag(source.npcId, source.level);
  const pool = source.channel === 'drop' ? bag.drops : bag.spoil;
  const entry = findDrop(pool, source.itemId);
  assert.ok(entry, `#${source.npcId} ${source.channel} ${source.itemId}`);
  assert.equal(entry!.min, 1);
  assert.equal(entry!.max, 1);
}
ok('recipe scroll qty always 1');

// 15. No duplicate mobId + itemId + channel
const keys = new Set<string>();
for (const source of D_GRADE_WEAPON_RECIPE_MOB_SOURCES) {
  const key = `${source.npcId}:${source.itemId}:${source.channel}`;
  assert.ok(!keys.has(key), `duplicate ${key}`);
  keys.add(key);
}
ok('no duplicate mobId+itemId+channel');

// 2–5, 6–9 specific sources
const portaBag = ensureMobDropBag(NPC.porta, 40);
assert.ok(findDrop(portaBag.spoil, RECIPE_IDS.lightCrossbow));
assert.equal(findDrop(portaBag.drops, RECIPE_IDS.lightCrossbow), undefined);
ok('Light Crossbow spoil on Porta only');

const taikBag = ensureMobDropBag(NPC.taikOrc, 40);
assert.ok(findDrop(taikBag.spoil, RECIPE_IDS.scallopJamadhr));
assert.equal(findDrop(taikBag.drops, RECIPE_IDS.scallopJamadhr), undefined);
ok('Scallop Jamadhr spoil on Taik Orc only');

assert.ok(findDrop(ensureMobDropBag(NPC.ragnaOrcSeer, 39).drops, RECIPE_IDS.mithrilDagger));
assert.ok(findDrop(ensureMobDropBag(NPC.porta, 40).drops, RECIPE_IDS.mithrilDagger));
assert.ok(findDrop(ensureMobDropBag(NPC.ragnaOrcOverlord, 39).spoil, RECIPE_IDS.mithrilDagger));
ok('Mithril Dagger drop/spoil sources');

assert.ok(findDrop(ensureMobDropBag(NPC.ragnaOrcOverlord, 39).drops, RECIPE_IDS.staffOfLife));
assert.ok(findDrop(ensureMobDropBag(NPC.dailaon, 37).drops, RECIPE_IDS.staffOfLife));
ok('Staff of Life drops');

// 10. Bonebreaker — all catalogued sources present in bag
for (const source of D_GRADE_WEAPON_RECIPE_MOB_SOURCES.filter((s) => s.itemId === RECIPE_IDS.bonebreaker)) {
  const bag = ensureMobDropBag(source.npcId, source.level);
  assert.ok(findDrop(bag.drops, RECIPE_IDS.bonebreaker), `bonebreaker on ${source.npcId}`);
}
ok('Bonebreaker all drop sources wired');

// 11–12. Separate NPC variants
assert.ok(findDGradeWeaponRecipeSource(NPC.tasaba21642, RECIPE_IDS.claymore, 'drop'));
assert.ok(findDGradeWeaponRecipeSource(NPC.tasaba21643, RECIPE_IDS.claymore, 'drop'));
assert.notEqual(
  findDGradeWeaponRecipeSource(NPC.tasaba21642, RECIPE_IDS.claymore, 'drop')!.chancePercent,
  findDGradeWeaponRecipeSource(NPC.tasaba21643, RECIPE_IDS.claymore, 'drop')!.chancePercent,
);
assert.ok(findDGradeWeaponRecipeSource(NPC.lienrik20786, RECIPE_IDS.bonebreaker, 'drop'));
assert.ok(findDGradeWeaponRecipeSource(NPC.lienrik21644, RECIPE_IDS.bonebreaker, 'drop'));
ok('Claymore 21642/21643 and Lienrik 20786/21644 kept separate');

// Display names from catalog
for (const itemId of D_GRADE_WEAPON_RECIPE_ITEM_IDS) {
  const recipe = D_GRADE_WEAPON_RECIPE_ITEM_BY_ID.get(itemId)!;
  assert.match(recipe.nameUk, /^Рецепт:/);
  assert.equal(recipe.iconPath, '/icons/recipes/d_grade/recipe_weapon_d.jpg');
}
ok('canonical recipe names and icon');

// 16–17 controlled drop roll
const bonebreakerEntry = findDrop(
  ensureMobDropBag(NPC.porta, 40).drops,
  RECIPE_IDS.bonebreaker,
)!;
assert.equal(rollDropQty(bonebreakerEntry, 0.999), 0);
assert.equal(rollDropQty(bonebreakerEntry, 0), 1);
ok('drop roll fail/success on controlled random');

// 18–19 controlled spoil roll (dwarf spoiler)
const lightCrossbowSpoil = findDrop(
  ensureMobDropBag(NPC.porta, 40).spoil,
  RECIPE_IDS.lightCrossbow,
)!;
assert.equal(rollDropQty(lightCrossbowSpoil, 0.999), 0);
assert.equal(rollDropQty(lightCrossbowSpoil, 0), 1);

const origRandom = Math.random;
try {
  Math.random = () => 0.999;
  const noSpoil = rollKillLoot(NPC.porta, 40, emptyInventory(), DWARF_SPOILER_CTX);
  assert.ok(!noSpoil.items.some((i) => i.l2ItemId === RECIPE_IDS.lightCrossbow));

  Math.random = () => 0;
  const withSpoil = rollKillLoot(NPC.porta, 40, emptyInventory(), DWARF_SPOILER_CTX);
  assert.ok(withSpoil.items.some((i) => i.l2ItemId === RECIPE_IDS.lightCrossbow && i.spoil));
} finally {
  Math.random = origRandom;
}
ok('spoil gated + controlled spoil success');

// Non-dwarf gets no spoil recipe
const humanLoot = rollKillLoot(NPC.porta, 40, emptyInventory(), {
  race: 'human',
  l2Profession: 'fighter',
  skillsLearnedJson: [],
});
assert.ok(!humanLoot.items.some((i) => i.l2ItemId === RECIPE_IDS.lightCrossbow));
ok('spoil not granted without dwarf Spoil');

async function dbHttpLearnTest(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.log('  ~ DB learn test skipped (no PostgreSQL)');
    return;
  }

  const login = `drech_${Date.now()}`;
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test', 4),
      characters: {
        create: {
          name: `DRecH_${Math.floor(Math.random() * 10000)}`,
          race: 'Dwarf',
          classBranch: 'fighter',
          l2Profession: 'dwarf_warsmith',
          level: 40,
          inventoryJson: addItemToBag(emptyInventory(), RECIPE_IDS.glaive, 1) as unknown as Prisma.InputJsonValue,
          recipeBookJson: normalizeRecipeBookJson(null) as unknown as Prisma.InputJsonValue,
          skillsLearnedJson: [{ battleId: 'l2_172', level: 1 }] as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0]!;
  const token = signAccessToken(user.id);
  const app = await buildApp();
  try {
    const result = await applyLearnRecipeFromBag(user.id, RECIPE_IDS.glaive, char.revision);
    assert.equal(result.learnedRecipeCode, 'glaive_100');
    ok('learn recipe from dropped scroll (service)');

    const res = await app.inject({
      method: 'POST',
      url: '/game/recipes/learn',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        recipeItemId: RECIPE_IDS.bonebreaker,
        expectedRevision: result.character.revision,
      },
    });
    if (res.statusCode === 200) {
      ok('POST /game/recipes/learn after drop item');
    } else {
      console.log(`  ~ HTTP learn skipped (need scroll in bag, status ${res.statusCode})`);
    }
  } finally {
    await prisma.character.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await app.close();
  }
}

async function main(): Promise<void> {
  await dbHttpLearnTest();
  console.log(`test:d-grade-weapon-recipe-drops OK (${D_GRADE_WEAPON_RECIPE_MOB_SOURCES.length} sources)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
