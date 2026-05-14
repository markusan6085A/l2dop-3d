import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import { L2DOP_LEVEL_MIN_EXP } from '../src/data/l2dopExpgain.js';
import { addItemToBag, parseInventory } from '../src/data/inventory.js';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:3000';

type JsonObject = Record<string, unknown>;

async function jsonRequest(
  path: string,
  init: RequestInit = {}
): Promise<{ status: number; json: JsonObject }> {
  const r = await fetch(`${BASE_URL}${path}`, init);
  let j: JsonObject = {};
  try {
    j = (await r.json()) as JsonObject;
  } catch {
    j = {};
  }
  return { status: r.status, json: j };
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function eqItemId(slotVal: unknown): number | null {
  if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
  if (
    slotVal &&
    typeof slotVal === 'object' &&
    'itemId' in slotVal &&
    typeof (slotVal as { itemId?: unknown }).itemId === 'number'
  ) {
    const n = (slotVal as { itemId: number }).itemId;
    return n > 0 ? n : null;
  }
  return null;
}

function findSlotByItemId(eq: unknown, itemId: number): string | null {
  if (!eq || typeof eq !== 'object') return null;
  const rec = eq as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    if (eqItemId(rec[key]) === itemId) return key;
  }
  return null;
}

function firstFilledEqSlot(eq: unknown): { slot: string; itemId: number } | null {
  if (!eq || typeof eq !== 'object') return null;
  const rec = eq as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    const id = eqItemId(rec[key]);
    if (id != null) return { slot: key, itemId: id };
  }
  return null;
}

async function main() {
  const login = `smoke_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const password = 'secret123';

  const reg = await jsonRequest('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login,
      password,
      password2: password,
      characterName: `Smoke${Math.floor(Math.random() * 1000)}`,
      race: 'Human',
      classBranch: 'fighter',
    }),
  });
  assert.equal(reg.status, 201, 'register must be 201');
  const token = String((reg.json as { token?: unknown }).token ?? '');
  assert.ok(token, 'register must return token');
  const dbUser = await prisma.user.findUnique({
    where: { login },
    select: { id: true },
  });
  assert.ok(dbUser?.id, 'db user row must exist');

  const ch0 = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(ch0.status, 200, 'GET /character must be 200');
  let character = (ch0.json as { character?: JsonObject }).character as JsonObject;
  assert.ok(character, 'GET /character must return character');

  // 1) battle/start valid
  const around = await jsonRequest('/game/map/around', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(around.status, 200, 'GET /game/map/around must be 200');
  const nearbySpawns =
    ((around.json as { nearbySpawns?: unknown }).nearbySpawns as Array<JsonObject>) ?? [];
  const nearSpawn = nearbySpawns.find((s) => s.inBattleRange === true);
  assert.ok(nearSpawn, 'must have at least one spawn in battle range');

  const startOk = await jsonRequest('/game/battle/start', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      spawnId: String(nearSpawn?.id),
      expectedRevision: Number(character.revision),
    }),
  });
  assert.equal(startOk.status, 200, 'battle/start valid must be 200');
  character = (startOk.json as { character?: JsonObject }).character as JsonObject;
  assert.ok(character, 'battle/start must return character');

  // leave battle before further checks
  const leave0 = await jsonRequest('/game/battle/leave', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ expectedRevision: Number(character.revision) }),
  });
  if (leave0.status === 200) {
    character = (leave0.json as { character?: JsonObject }).character as JsonObject;
  }

  // 2) battle/start target too far
  const farSpawn = nearbySpawns.find((s) => s.inBattleRange === false);
  if (farSpawn) {
    const startFar = await jsonRequest('/game/battle/start', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        spawnId: String(farSpawn.id),
        expectedRevision: Number(character.revision),
      }),
    });
    assert.equal(startFar.status, 400, 'battle/start too far must be 400');
  }

  // 3) battle action duplicate/409
  const start2 = await jsonRequest('/game/battle/start', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      spawnId: String(nearSpawn?.id),
      expectedRevision: Number(character.revision),
    }),
  });
  assert.equal(start2.status, 200, 'battle/start second must be 200');
  character = (start2.json as { character?: JsonObject }).character as JsonObject;
  const revForDup = Number(character.revision);
  const [actA, actB] = await Promise.all([
    jsonRequest('/game/battle/action', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ action: 'attack', expectedRevision: revForDup }),
    }),
    jsonRequest('/game/battle/action', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ action: 'attack', expectedRevision: revForDup }),
    }),
  ]);
  const codes = [actA.status, actB.status].sort((a, b) => a - b);
  assert.deepEqual(codes, [200, 409], 'duplicate battle action must produce 200 + 409');
  const okAction = actA.status === 200 ? actA : actB;
  const okChar = (okAction.json as { character?: JsonObject }).character;
  if (okChar) {
    character = okChar;
  }
  const leaveAfterDup = await jsonRequest('/game/battle/leave', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ expectedRevision: Number(character.revision) }),
  });
  if (leaveAfterDup.status === 200) {
    character = (leaveAfterDup.json as { character?: JsonObject }).character as JsonObject;
  } else {
    const chSync = await jsonRequest('/character', {
      headers: { Authorization: `Bearer ${token}` },
    });
    character = (chSync.json as { character?: JsonObject }).character as JsonObject;
  }

  // 4) teleport success + snapshot
  const locs = await jsonRequest('/game/teleport/locations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(locs.status, 200, 'teleport locations must be 200');
  const firstLoc = ((locs.json as { locations?: Array<JsonObject> }).locations ?? [])[0];
  assert.ok(firstLoc && firstLoc.teleportId, 'must have teleport destination');
  const revBeforeTeleport = Number(character.revision);
  const tpOk = await jsonRequest('/game/teleport', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      teleportId: String(firstLoc.teleportId),
      expectedRevision: revBeforeTeleport,
    }),
  });
  assert.equal(tpOk.status, 200, 'teleport success must be 200');
  character = (tpOk.json as { character?: JsonObject }).character as JsonObject;
  assert.ok(
    Number(character.revision) > revBeforeTeleport,
    'teleport success must increase revision'
  );

  // 5) teleport 409 + resync source
  const tpConflict = await jsonRequest('/game/teleport', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      teleportId: String(firstLoc.teleportId),
      expectedRevision: revBeforeTeleport,
    }),
  });
  assert.equal(tpConflict.status, 409, 'teleport stale revision must be 409');
  const chSyncAfterTp409 = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(chSyncAfterTp409.status, 200, 'resync GET /character must be 200');
  character = (chSyncAfterTp409.json as { character?: JsonObject }).character as JsonObject;

  // 6) equip/unequip revision
  let inv = (character.inventory as { stacks?: Array<JsonObject>; eq?: unknown }) ?? {};
  const stacks = inv.stacks ?? [];
  const eqItem = stacks.find((s) => typeof s.itemId === 'number' && Number(s.itemId) > 0);
  if (eqItem) {
    const eqItemIdVal = Number((eqItem as { itemId: number }).itemId);
    const revBeforeEquip = Number(character.revision);
    const equipRes = await jsonRequest('/character/equip', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        action: 'equip',
        itemId: eqItemIdVal,
        expectedRevision: revBeforeEquip,
      }),
    });
    assert.equal(equipRes.status, 200, 'equip must be 200');
    character = (equipRes.json as { character?: JsonObject }).character as JsonObject;
    assert.ok(Number(character.revision) > revBeforeEquip, 'equip must increase revision');

    const eqNow = ((character.inventory as { eq?: unknown }) ?? {}).eq;
    const slot = findSlotByItemId(eqNow, eqItemIdVal);
    assert.ok(slot, 'equipped item must appear in eq slots');
    const revBeforeUnequip = Number(character.revision);
    const unequipRes = await jsonRequest('/character/equip', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        action: 'unequip',
        slot,
        expectedRevision: revBeforeUnequip,
      }),
    });
    assert.equal(unequipRes.status, 200, 'unequip must be 200');
    character = (unequipRes.json as { character?: JsonObject }).character as JsonObject;
    assert.ok(Number(character.revision) > revBeforeUnequip, 'unequip must increase revision');
  } else {
    let filled = firstFilledEqSlot(inv.eq);
    if (!filled) {
      const withHints = await jsonRequest('/character', {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(withHints.status, 200, 'GET /character (for hints) must be 200');
      const slotHints =
        ((withHints.json as { itemSlotHints?: Record<string, string> }).itemSlotHints ?? {});
      const weaponItemId = Number(
        Object.keys(slotHints).find((k) => slotHints[k] === 'rhand') ?? '0'
      );
      assert.ok(weaponItemId > 0, 'must resolve weapon itemId from itemSlotHints');
      const dbChar = await prisma.character.findFirst({
        where: { userId: dbUser!.id },
        orderBy: { lastUpdate: 'desc' },
        select: { id: true, inventoryJson: true },
      });
      assert.ok(dbChar?.id, 'db character row must exist for bag seed');
      const seeded = addItemToBag(parseInventory(dbChar!.inventoryJson), weaponItemId, 1);
      await prisma.character.update({
        where: { id: dbChar!.id },
        data: {
          inventoryJson: seeded as never,
          revision: { increment: 1 },
        },
      });
      const seededChar = await jsonRequest('/character', {
        headers: { Authorization: `Bearer ${token}` },
      });
      character = (seededChar.json as { character?: JsonObject }).character as JsonObject;
      inv = (character.inventory as { stacks?: Array<JsonObject>; eq?: unknown }) ?? {};
      filled = firstFilledEqSlot(inv.eq);
      if (!filled) {
        const seededStacks = inv.stacks ?? [];
        const seededItem = seededStacks.find(
          (s) => typeof s.itemId === 'number' && Number(s.itemId) === weaponItemId
        );
        assert.ok(seededItem, 'seeded weapon must appear in bag');
        const revBeforeEquipSeed = Number(character.revision);
        const equipSeed = await jsonRequest('/character/equip', {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({
            action: 'equip',
            itemId: weaponItemId,
            expectedRevision: revBeforeEquipSeed,
          }),
        });
        assert.equal(equipSeed.status, 200, 'seeded equip must be 200');
        character = (equipSeed.json as { character?: JsonObject }).character as JsonObject;
        filled = firstFilledEqSlot(
          ((character.inventory as { eq?: unknown }) ?? {}).eq
        );
      }
    }
    assert.ok(filled, 'must have at least one equipped item for equip test fallback');
    const revBeforeUnequip = Number(character.revision);
    const unequipRes = await jsonRequest('/character/equip', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        action: 'unequip',
        slot: filled!.slot,
        expectedRevision: revBeforeUnequip,
      }),
    });
    assert.equal(unequipRes.status, 200, 'fallback unequip must be 200');
    character = (unequipRes.json as { character?: JsonObject }).character as JsonObject;
    assert.ok(Number(character.revision) > revBeforeUnequip, 'fallback unequip must increase revision');

    const revBeforeEquipBack = Number(character.revision);
    const equipBack = await jsonRequest('/character/equip', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
        action: 'equip',
        itemId: filled!.itemId,
        expectedRevision: revBeforeEquipBack,
      }),
    });
    assert.equal(equipBack.status, 200, 'fallback equip must be 200');
    character = (equipBack.json as { character?: JsonObject }).character as JsonObject;
    assert.ok(
      Number(character.revision) > revBeforeEquipBack,
      'fallback equip must increase revision'
    );
  }

  // 7) learn skill revision
  const row = await prisma.character.findFirst({
    where: { userId: dbUser!.id },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  assert.ok(row?.id, 'db character row must exist');
  await prisma.character.update({
    where: { id: row!.id },
    data: {
      exp: L2DOP_LEVEL_MIN_EXP[7]!, // level 8 floor
      sp: 100_000,
      revision: { increment: 1 },
    },
  });
  const chBeforeLearn = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  character = (chBeforeLearn.json as { character?: JsonObject }).character as JsonObject;
  const revBeforeLearn = Number(character.revision);
  const learnRes = await jsonRequest('/character/skills/learn', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      battleId: 'l2_3',
      expectedRevision: revBeforeLearn,
    }),
  });
  assert.equal(learnRes.status, 200, 'learn skill must be 200');
  character = (learnRes.json as { character?: JsonObject }).character as JsonObject;
  assert.ok(
    Number(character.revision) > revBeforeLearn,
    'learn skill must increase revision'
  );

  // 8) GET /character has no extra write on immediate repeat
  const g1 = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const g2 = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(g1.status, 200, 'GET /character first must be 200');
  assert.equal(g2.status, 200, 'GET /character second must be 200');
  const c1 = (g1.json as { character?: JsonObject }).character as JsonObject;
  const c2 = (g2.json as { character?: JsonObject }).character as JsonObject;
  assert.equal(
    Number(c2.revision),
    Number(c1.revision),
    'immediate repeated GET /character must not change revision'
  );
  assert.equal(
    String(c2.lastUpdate),
    String(c1.lastUpdate),
    'immediate repeated GET /character must not write row'
  );

  console.log('integration-stability-smoke: OK');
}

main()
  .catch((err) => {
    console.error('integration-stability-smoke: FAIL');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
