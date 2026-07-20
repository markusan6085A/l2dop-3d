/**
 * Magic statue buffs must preserve enchant-aware equipment stats in snapshot.
 * npm run test:magic-statue-enchant-stats
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import {
  addEnchantedToBag,
  emptyInventory,
  equipFromBag,
} from '../src/data/inventory.js';
import { emptyWarehouse } from '../src/data/warehouse.js';
import { applyTownBuffer } from '../src/services/townBufferService.js';
import { applyEquipFromBag, getSnapshotForUser } from '../src/services/charMutations.js';
import { toSnapshot } from '../src/services/charSnapshotLogic.js';
import { applyCharacterReadView } from '../src/services/charReadView.js';
import type { CharacterRow } from '../src/services/charTypes.js';

const D_WEAPON_ID = 128;
const D_CHEST_ID = 58;
const D_SHIELD_ID = 628;
const D_RING_ID = 880;
const TOME_ID = 317;

function mkMinimalRow(partial: Partial<CharacterRow> & Pick<CharacterRow, 'inventoryJson'>): CharacterRow {
  const now = new Date();
  return {
    id: partial.id ?? 'test-char',
    name: partial.name ?? 'TestHero',
    level: partial.level ?? 40,
    hp: partial.hp ?? 5000,
    maxHp: partial.maxHp ?? 5000,
    cityId: partial.cityId ?? 'gludio',
    race: partial.race ?? 'Human',
    classBranch: partial.classBranch ?? 'fighter',
    gender: partial.gender ?? 'male',
    l2Profession: partial.l2Profession ?? 'human_fighter',
    adena: partial.adena ?? 100_000n,
    exp: partial.exp ?? 1_000_000_000n,
    sp: partial.sp ?? 0,
    mobsKilled: partial.mobsKilled ?? 0,
    karma: partial.karma ?? 0,
    pvpWins: partial.pvpWins ?? 0,
    raidBossKills: partial.raidBossKills ?? 0,
    pvpAggressorUntilMs: partial.pvpAggressorUntilMs ?? 0n,
    pvpPendingDefeatJson: partial.pvpPendingDefeatJson ?? null,
    pvePendingDefeatJson: partial.pvePendingDefeatJson ?? null,
    profileStatus: partial.profileStatus ?? null,
    revision: partial.revision ?? 1,
    userId: partial.userId ?? 'test-user',
    lastUpdate: partial.lastUpdate ?? now,
    inventoryJson: partial.inventoryJson,
    warehouseJson: partial.warehouseJson ?? emptyWarehouse(),
    worldX: partial.worldX ?? 0,
    worldY: partial.worldY ?? 0,
    targetX: partial.targetX ?? 0,
    targetY: partial.targetY ?? 0,
    moveStartAt: partial.moveStartAt ?? null,
    moveFromX: partial.moveFromX ?? 0,
    moveFromY: partial.moveFromY ?? 0,
    battleJson: partial.battleJson ?? null,
    worldCombatStateJson: partial.worldCombatStateJson ?? null,
    mobSpawnHpJson: partial.mobSpawnHpJson ?? null,
    skillsLearnedJson: partial.skillsLearnedJson ?? null,
    activeBuffsJson: partial.activeBuffsJson ?? null,
    skillCooldownsJson: partial.skillCooldownsJson ?? null,
    battleHotbarJson: partial.battleHotbarJson ?? null,
    questProgressJson: partial.questProgressJson ?? null,
    dungeonStateJson: partial.dungeonStateJson ?? null,
    dailyQuestsJson: partial.dailyQuestsJson ?? null,
    buffHeroicTier: partial.buffHeroicTier ?? null,
    buffZealotStacks: partial.buffZealotStacks ?? null,
    chatRepliesReadAt: partial.chatRepliesReadAt ?? now,
    clanId: partial.clanId ?? null,
    clanRole: partial.clanRole ?? null,
    clan: partial.clan ?? null,
  };
}

const TOWN_BUFFER_BUFFS = [
  { skillId: 1036, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1040, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1045, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1048, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1059, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1062, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1068, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1077, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1085, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1086, level: 3, expiresAt: Date.now() + 3_600_000 },
  { skillId: 1240, level: 3, expiresAt: Date.now() + 3_600_000 },
] as const;

function assertEnchantPreservedAfterBuff(
  label: string,
  before: { pAtk: number; mAtk: number; pDef: number; mDef: number },
  after: { pAtk: number; mAtk: number; pDef: number; mDef: number }
): void {
  assert.ok(after.pAtk >= before.pAtk, `${label}: P.Atk dropped after buff (${before.pAtk} -> ${after.pAtk})`);
  assert.ok(after.mAtk >= before.mAtk, `${label}: M.Atk dropped after buff (${before.mAtk} -> ${after.mAtk})`);
}

function assertEnchantContribution(
  label: string,
  withEnchant: number,
  withoutEnchant: number,
  afterBuffWithEnchant: number,
  afterBuffWithoutEnchant: number
): void {
  const bonus = withEnchant - withoutEnchant;
  const bonusAfter = afterBuffWithEnchant - afterBuffWithoutEnchant;
  assert.ok(
    bonus > 0,
    `${label}: expected positive enchant contribution before buff (${withEnchant} vs ${withoutEnchant})`
  );
  assert.ok(
    bonusAfter >= bonus * 0.85,
    `${label}: enchant contribution lost after buff (${bonus} -> ${bonusAfter})`
  );
}

async function runPurePipelineTests(): Promise<void> {
  let inv = emptyInventory();
  inv = addEnchantedToBag(inv, D_WEAPON_ID, 1, 7);
  inv = equipFromBag(inv, D_WEAPON_ID, 7);
  inv = addEnchantedToBag(inv, D_CHEST_ID, 1, 7);
  inv = equipFromBag(inv, D_CHEST_ID, 7);
  inv = addEnchantedToBag(inv, D_SHIELD_ID, 1, 7);
  inv = equipFromBag(inv, D_SHIELD_ID, 7);
  inv = addEnchantedToBag(inv, D_RING_ID, 1, 7);
  inv = equipFromBag(inv, D_RING_ID, 7);

  const row = mkMinimalRow({ inventoryJson: inv as unknown as Prisma.JsonValue });
  const before = toSnapshot(row);
  const buffedRow = mkMinimalRow({
    ...row,
    activeBuffsJson: [...TOWN_BUFFER_BUFFS] as unknown as Prisma.JsonValue,
  });
  const after = toSnapshot(buffedRow);
  const canonicalAfter = toSnapshot(applyCharacterReadView(buffedRow));

  assertEnchantPreservedAfterBuff('fighter weapon+7', before, after);
  assert.equal(
    canonicalAfter.pAtk,
    after.pAtk,
    'read-view mutation snapshot must match canonical stat pipeline P.Atk'
  );

  let inv0 = emptyInventory();
  inv0 = addEnchantedToBag(inv0, D_WEAPON_ID, 1, 0);
  inv0 = equipFromBag(inv0, D_WEAPON_ID, 0);
  const row0 = mkMinimalRow({ inventoryJson: inv0 as unknown as Prisma.JsonValue });
  const snap0 = toSnapshot(row0);
  const snap0Buff = toSnapshot({
    ...row0,
    activeBuffsJson: buffedRow.activeBuffsJson,
  });
  assertEnchantContribution(
    'fighter P.Atk',
    before.pAtk,
    snap0.pAtk,
    after.pAtk,
    snap0Buff.pAtk
  );

  let mysticInv = emptyInventory();
  mysticInv = addEnchantedToBag(mysticInv, TOME_ID, 1, 7);
  mysticInv = equipFromBag(mysticInv, TOME_ID, 7);
  const mysticRow = mkMinimalRow({
    inventoryJson: mysticInv as unknown as Prisma.JsonValue,
    classBranch: 'mystic',
    l2Profession: 'human_mystic',
  });
  const mysticBefore = toSnapshot(mysticRow);
  const mysticAfter = toSnapshot({
    ...mysticRow,
    activeBuffsJson: buffedRow.activeBuffsJson,
  });
  assert.ok(
    mysticAfter.mAtk >= mysticBefore.mAtk,
    `mystic M.Atk dropped (${mysticBefore.mAtk} -> ${mysticAfter.mAtk})`
  );

  const readViewSnap = toSnapshot(applyCharacterReadView(row));
  assert.equal(readViewSnap.pAtk, before.pAtk, 'read-view must not drop enchant-aware P.Atk');
}

async function createEnchantedUser(): Promise<{ userId: string; charId: string }> {
  const login = `magic_statue_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  let inv = emptyInventory();
  inv = addEnchantedToBag(inv, D_WEAPON_ID, 1, 7);
  inv = addEnchantedToBag(inv, D_CHEST_ID, 1, 7);
  inv = addEnchantedToBag(inv, D_SHIELD_ID, 1, 7);
  inv = addEnchantedToBag(inv, D_RING_ID, 1, 7);
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name: `MagicStatue${Math.floor(Math.random() * 1000)}`,
          race: 'Human',
          classBranch: 'fighter',
          level: 40,
          adena: 100_000n,
          inventoryJson: inv as unknown as Prisma.InputJsonValue,
          warehouseJson: emptyWarehouse() as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0];
  assert.ok(char?.id);
  return { userId: user.id, charId: char.id };
}

async function runDbTests(): Promise<void> {
  const { userId } = await createEnchantedUser();
  try {
    let snap = await applyEquipFromBag(userId, D_WEAPON_ID, 1, 7);
    snap = await applyEquipFromBag(userId, D_CHEST_ID, snap.revision, 7);
    snap = await applyEquipFromBag(userId, D_SHIELD_ID, snap.revision, 7);
    snap = await applyEquipFromBag(userId, D_RING_ID, snap.revision, 7);

    const beforePatk = snap.pAtk;
    const beforeMatk = snap.mAtk;
    const beforePdef = snap.pDef;
    const beforeMdef = snap.mDef;

    const buffRes = await applyTownBuffer(userId, snap.revision);
    const after = buffRes.character;

    assert.ok(Array.isArray(after.activeBuffs) && after.activeBuffs.length > 0);
    assert.ok(after.pAtk >= beforePatk, `DB: P.Atk dropped (${beforePatk} -> ${after.pAtk})`);
    assert.ok(after.mAtk >= beforeMatk, `DB: M.Atk dropped (${beforeMatk} -> ${after.mAtk})`);
    assert.ok(after.pDef >= beforePdef * 0.9, `DB: P.Def dropped too much (${beforePdef} -> ${after.pDef})`);
    assert.ok(after.mDef >= beforeMdef * 0.9, `DB: M.Def dropped too much (${beforeMdef} -> ${after.mDef})`);

    const eqWeapon = after.inventory?.eq?.l1;
    const en =
      eqWeapon && typeof eqWeapon === 'object' && 'enchant' in eqWeapon
        ? Number((eqWeapon as { enchant?: number }).enchant)
        : 0;
    assert.equal(en, 7, 'enchant level must remain on equipped weapon');

    const getSnap = await getSnapshotForUser(userId);
    assert.ok(getSnap);
    assert.equal(getSnap!.pAtk, after.pAtk, 'GET snapshot must match town buffer mutation stats');
    assert.ok(
      getSnap!.pAtk >= beforePatk,
      `GET after buff: P.Atk dropped (${beforePatk} -> ${getSnap!.pAtk})`
    );

    const second = await applyTownBuffer(userId, after.revision);
    assert.ok(
      second.character.pAtk >= beforePatk,
      `repeat buff: P.Atk dropped (${beforePatk} -> ${second.character.pAtk})`
    );
    assert.ok(
      Math.abs(second.character.pAtk - after.pAtk) <= Math.ceil(after.pAtk * 0.05),
      'repeat buff must not inflate P.Atk beyond ~5% jitter'
    );
  } finally {
    await prisma.character.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }
}

async function run() {
  await runPurePipelineTests();
  console.log('test:magic-statue-enchant-stats OK (pure pipeline)');

  if (!process.env.DATABASE_URL) {
    console.log('test:magic-statue-enchant-stats WARN: DATABASE_URL missing, DB checks skipped');
    return;
  }

  await runDbTests();
  console.log('test:magic-statue-enchant-stats OK');
}

run()
  .catch((err) => {
    console.error('test:magic-statue-enchant-stats FAIL');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
