/**
 * РБ 20–25 lvl: канонічні стати, EXP/SP без адени та предметів.
 * npm run test:rb20-25-exp-rewards
 */
import assert from 'node:assert/strict';
import {
  RB_LV20_25_BOSSES,
  RB_LV20_25_NPC_IDS,
} from '../src/data/l2dopRaidBossLv20_25Catalog.js';
import { raidBossCombatOverrideForNpcId } from '../src/data/l2dopRaidBossCombatPatches.js';
import {
  raidBossRewardPreviewForNpcId,
  rollRaidBossKillReward,
} from '../src/data/l2dopRaidBossRewardPatches.js';
import { customNpcDropBagForMob } from '../src/data/l2dopRaidBossDropPatches.js';
import { getWorldSpawnById } from '../src/data/mapWorldSpawns.js';
import { mobCombatFromSpawn } from '../src/domain/battleMobSpawn.js';
import { rollKillLoot } from '../src/domain/killLoot.js';
import { parseInventory } from '../src/data/inventory.js';
import { l2dopPhysicalBaseDamage } from '../src/data/l2dopDamageFormulas.js';
import { getSpawnCatalogInfo } from '../src/services/spawnCatalogService.js';

function assertUniqueIds(): void {
  const spawnIds = RB_LV20_25_BOSSES.map((b) => b.spawnId);
  const npcIds = RB_LV20_25_BOSSES.map((b) => b.npcId);
  assert.equal(
    new Set(spawnIds).size,
    spawnIds.length,
    'duplicate spawnId in RB_LV20_25 catalog'
  );
  assert.equal(
    new Set(npcIds).size,
    npcIds.length,
    'duplicate npcId in RB_LV20_25 catalog'
  );
  assert.equal(RB_LV20_25_BOSSES.length, 15, 'expected exactly 15 RB 20–25');
}

function assertCatalogPresence(): void {
  for (const spec of RB_LV20_25_BOSSES) {
    const spawn = getWorldSpawnById(spec.spawnId);
    assert.ok(spawn, `${spec.spawnId}: spawn missing from MAP_WORLD_SPAWNS`);
    assert.equal(spawn!.kind, 'raid', `${spec.spawnId}: kind must be raid`);
    assert.equal(spawn!.name, spec.nameUk, `${spec.spawnId}: Ukrainian name`);
    assert.equal(spawn!.level, spec.level, `${spec.spawnId}: level`);
  }
}

function assertCombatStats(): void {
  for (const spec of RB_LV20_25_BOSSES) {
    const ovr = raidBossCombatOverrideForNpcId(spec.npcId);
    assert.ok(ovr, `${spec.npcId}: combat override missing`);
    assert.equal(ovr!.maxHp, spec.maxHp, `${spec.npcId}: maxHp`);
    assert.equal(ovr!.pAtk, spec.pAtk, `${spec.npcId}: pAtk`);
    assert.equal(ovr!.mAtk, spec.mAtk, `${spec.npcId}: mAtk`);
    assert.equal(ovr!.pDef, spec.pDef, `${spec.npcId}: pDef`);
    assert.equal(ovr!.mDef, spec.mDef, `${spec.npcId}: mDef`);

    const spawn = getWorldSpawnById(spec.spawnId)!;
    const combat = mobCombatFromSpawn(spawn);
    assert.equal(combat.maxHp, spec.maxHp, `${spec.spawnId}: battle maxHp`);
    assert.equal(combat.pAtk, spec.pAtk, `${spec.spawnId}: battle pAtk`);
    assert.equal(combat.mAtk, spec.mAtk, `${spec.spawnId}: battle mAtk`);
    assert.equal(combat.pDef, spec.pDef, `${spec.spawnId}: battle pDef`);
    assert.equal(combat.mDef, spec.mDef, `${spec.spawnId}: battle mDef`);
  }
}

function assertDamageUsesDefenses(): void {
  const spec = RB_LV20_25_BOSSES[0]!;
  const spawn = getWorldSpawnById(spec.spawnId)!;
  const combat = mobCombatFromSpawn(spawn);
  const playerPDef = 200;
  const playerMDef = 180;
  const phys = l2dopPhysicalBaseDamage(combat.pAtk, playerPDef);
  const magic = l2dopPhysicalBaseDamage(combat.mAtk, playerMDef);
  assert.ok(phys > 0, 'physical damage must be positive');
  assert.ok(magic >= 0, 'magical damage must be non-negative');
  const physHigherDef = l2dopPhysicalBaseDamage(combat.pAtk, playerPDef + 500);
  const magicHigherDef = l2dopPhysicalBaseDamage(combat.mAtk, playerMDef + 500);
  assert.ok(physHigherDef < phys, 'higher pDef must reduce physical damage');
  assert.ok(magicHigherDef <= magic, 'higher mDef must reduce magical damage');
}

function assertExpSpRewards(): void {
  for (const spec of RB_LV20_25_BOSSES) {
    const preview = raidBossRewardPreviewForNpcId(spec.npcId);
    assert.ok(preview, `${spec.npcId}: reward preview missing`);
    assert.equal(
      preview!.expLabel,
      spec.exp.toLocaleString('uk-UA'),
      `${spec.npcId}: exp preview`
    );
    assert.equal(
      preview!.spLabel,
      spec.sp.toLocaleString('uk-UA'),
      `${spec.npcId}: sp preview`
    );

    const rolled = rollRaidBossKillReward(spec.npcId);
    assert.ok(rolled, `${spec.npcId}: rollRaidBossKillReward`);
    assert.equal(rolled!.exp, spec.exp, `${spec.npcId}: rolled exp`);
    assert.equal(rolled!.sp, spec.sp, `${spec.npcId}: rolled sp`);
  }
}

function assertKeyMaterialOrNoLoot(): void {
  for (const spec of RB_LV20_25_BOSSES) {
    const bag = customNpcDropBagForMob(spec.npcId);
    assert.ok(bag, `${spec.npcId}: custom drop bag`);
    assert.equal(bag!.spoil.length, 0, `${spec.npcId}: no spoil lines`);

    if (spec.npcId === 25149) {
      assert.equal(bag!.drops.length, 0, `${spec.npcId}: Krool no drop lines`);
      continue;
    }

    assert.equal(bag!.drops.length, 1, `${spec.npcId}: one key material drop`);
    const line = bag!.drops[0]!;
    assert.ok(line.l2ItemId != null && line.l2ItemId >= 4113);
    assert.ok(line.chance === 0.11 || line.chance === 0.13);
    assert.equal(line.min, 1);
    assert.equal(line.max, 2);
  }

  const sample = RB_LV20_25_BOSSES.find((b) => b.npcId === 25372)!;
  const spawn = getWorldSpawnById(sample.spawnId)!;
  const loot = rollKillLoot(sample.npcId, spawn.level, parseInventory(null), null, {
    spawnKind: 'raid',
    mobName: spawn.name,
    spawnId: sample.spawnId,
  });
  assert.equal(loot.adena, BigInt(0), 'kill loot adena must be 0');
  assert.equal(Number(loot.expGain), sample.exp, 'kill loot exp');
  assert.equal(loot.spGain, sample.sp, 'kill loot sp');
}

function assertSpawnCatalogUi(): void {
  for (const spec of RB_LV20_25_BOSSES) {
    const info = getSpawnCatalogInfo(spec.spawnId);
    assert.ok(info, `${spec.spawnId}: spawn catalog info`);
    assert.equal(info!.stats.maxHp, spec.maxHp, `${spec.spawnId}: UI maxHp`);
    assert.equal(info!.stats.pAtk, spec.pAtk, `${spec.spawnId}: UI pAtk`);
    assert.equal(info!.stats.mAtk, spec.mAtk, `${spec.spawnId}: UI mAtk`);
    assert.equal(info!.stats.pDef, spec.pDef, `${spec.spawnId}: UI pDef`);
    assert.equal(info!.stats.mDef, spec.mDef, `${spec.spawnId}: UI mDef`);
    assert.equal(info!.rewardExp, spec.exp.toLocaleString('uk-UA'));
    assert.equal(info!.rewardSp, spec.sp.toLocaleString('uk-UA'));
    if (spec.npcId === 25149) {
      assert.equal(info!.drops.length, 0, `${spec.spawnId}: UI drops empty (Krool)`);
    } else {
      assert.equal(info!.drops.length, 1, `${spec.spawnId}: UI key material drop`);
    }
  }
}

function run(): void {
  assertUniqueIds();
  assertCatalogPresence();
  assertCombatStats();
  assertDamageUsesDefenses();
  assertExpSpRewards();
  assertKeyMaterialOrNoLoot();
  assertSpawnCatalogUi();
  console.log('[test:rb20-25-exp-rewards] OK — 15 RB 20–25 verified');
}

run();
