import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
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

function firstFilledEqSlot(eq: unknown): { slot: string; itemId: number } | null {
  if (!eq || typeof eq !== 'object') return null;
  const rec = eq as Record<string, unknown>;
  for (const k of Object.keys(rec)) {
    const id = eqItemId(rec[k]);
    if (id != null) return { slot: k, itemId: id };
  }
  return null;
}

async function main() {
  const login = `stress_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const password = 'secret123';

  const reg = await jsonRequest('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login,
      password,
      password2: password,
      characterName: `Str${Math.floor(Math.random() * 1000)}`,
      race: 'Human',
      classBranch: 'fighter',
    }),
  });
  assert.equal(reg.status, 201, 'register must be 201');
  const token = String((reg.json as { token?: unknown }).token ?? '');
  assert.ok(token, 'token must exist');

  const user = await prisma.user.findUnique({
    where: { login },
    select: { id: true },
  });
  assert.ok(user?.id, 'db user must exist');

  const ch = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(ch.status, 200, 'GET /character must be 200');
  let character = (ch.json as { character?: JsonObject }).character as JsonObject;
  assert.ok(character, 'character snapshot required');

  // --- Battle spam ---
  const around = await jsonRequest('/game/map/around', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const near = (((around.json as { nearbySpawns?: Array<JsonObject> }).nearbySpawns) ?? [])
    .find((s) => s.inBattleRange === true);
  assert.ok(near, 'need in-range spawn');

  const bs = await jsonRequest('/game/battle/start', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      spawnId: String(near?.id),
      expectedRevision: Number(character.revision),
    }),
  });
  assert.equal(bs.status, 200, 'battle/start must be 200');
  character = (bs.json as { character?: JsonObject }).character as JsonObject;
  const battleRev = Number(character.revision);

  const spamBattle = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      jsonRequest('/game/battle/action', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ action: 'attack', expectedRevision: battleRev }),
      })
    )
  );
  const battle200 = spamBattle.filter((x) => x.status === 200).length;
  const battle409 = spamBattle.filter((x) => x.status === 409).length;
  assert.ok(battle200 >= 1, 'battle spam must have at least one 200');
  assert.ok(battle409 >= 1, 'battle spam must have at least one 409');

  const fresh = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  character = (fresh.json as { character?: JsonObject }).character as JsonObject;
  const leave = await jsonRequest('/game/battle/leave', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ expectedRevision: Number(character.revision) }),
  });
  if (leave.status === 200) {
    character = (leave.json as { character?: JsonObject }).character as JsonObject;
  }

  // --- Equip spam ---
  let inv = (character.inventory as { stacks?: Array<JsonObject>; eq?: unknown }) ?? {};
  const slotHintsResp = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const slotHints =
    ((slotHintsResp.json as { itemSlotHints?: Record<string, string> }).itemSlotHints ?? {});
  const weaponItemId = Number(
    Object.keys(slotHints).find((k) => slotHints[k] === 'rhand') ?? '0'
  );
  assert.ok(weaponItemId > 0, 'must resolve weapon item');

  const dbChar = await prisma.character.findFirst({
    where: { userId: user!.id },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, inventoryJson: true, revision: true },
  });
  assert.ok(dbChar?.id, 'db character must exist');
  const seededInv = addItemToBag(parseInventory(dbChar!.inventoryJson), weaponItemId, 1);
  await prisma.character.update({
    where: { id: dbChar!.id },
    data: {
      inventoryJson: seededInv as never,
      revision: { increment: 1 },
    },
  });
  const seededSnap = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  character = (seededSnap.json as { character?: JsonObject }).character as JsonObject;
  inv = (character.inventory as { stacks?: Array<JsonObject>; eq?: unknown }) ?? {};

  const equipRev = Number(character.revision);
  const equipSpam = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      jsonRequest('/character/equip', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          action: 'equip',
          itemId: weaponItemId,
          expectedRevision: equipRev,
        }),
      })
    )
  );
  const equip200 = equipSpam.filter((x) => x.status === 200).length;
  const equip409 = equipSpam.filter((x) => x.status === 409).length;
  assert.ok(equip200 >= 1, 'equip spam must have at least one 200');
  assert.ok(equip409 >= 1, 'equip spam must have at least one 409');

  const afterEquip = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  character = (afterEquip.json as { character?: JsonObject }).character as JsonObject;
  const eqInfo = firstFilledEqSlot(
    ((character.inventory as { eq?: unknown }) ?? {}).eq
  );
  if (eqInfo) {
    const unequipRev = Number(character.revision);
    const unequipSpam = await Promise.all(
      Array.from({ length: 10 }).map(() =>
        jsonRequest('/character/equip', {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({
            action: 'unequip',
            slot: eqInfo.slot,
            expectedRevision: unequipRev,
          }),
        })
      )
    );
    const unequip200 = unequipSpam.filter((x) => x.status === 200).length;
    const unequip409 = unequipSpam.filter((x) => x.status === 409).length;
    assert.ok(unequip200 >= 1, 'unequip spam must have at least one 200');
    assert.ok(unequip409 >= 1, 'unequip spam must have at least one 409');
  }

  // --- Teleport spam ---
  const tpLocs = await jsonRequest('/game/teleport/locations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const tp = ((tpLocs.json as { locations?: Array<JsonObject> }).locations ?? [])[0];
  assert.ok(tp?.teleportId, 'teleport destination required');

  const preTp = await jsonRequest('/character', {
    headers: { Authorization: `Bearer ${token}` },
  });
  character = (preTp.json as { character?: JsonObject }).character as JsonObject;
  const tpRev = Number(character.revision);
  const tpSpam = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      jsonRequest('/game/teleport', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          teleportId: String(tp.teleportId),
          expectedRevision: tpRev,
        }),
      })
    )
  );
  const tp200 = tpSpam.filter((x) => x.status === 200).length;
  const tp409 = tpSpam.filter((x) => x.status === 409).length;
  assert.ok(tp200 >= 1, 'teleport spam must have at least one 200');
  assert.ok(tp409 >= 1, 'teleport spam must have at least one 409');

  console.log('stress-rapid-actions: OK');
}

main()
  .catch((err) => {
    console.error('stress-rapid-actions: FAIL');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
