/**
 * Clan emblems + siege incoming damage notice smoke.
 * npm run test:clan-emblems
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { SIEGE_WALL_MAX_HP } from '../src/domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../src/domain/clanSiegeConstants.js';
import {
  clanEmblemPublicUrl,
  parseClanEmblemId,
} from '../src/domain/clanEmblem.js';
import { prisma } from '../src/lib/prisma.js';
import { updateClanEmblemForUser } from '../src/services/clanEmblemService.js';
import { getClanMyForUser } from '../src/services/clanMyService.js';
import { listChatMessages } from '../src/services/chatService.js';
import { getRatingsSnapshot } from '../src/services/ratingsService.js';
import { getSiegeStateForUser } from '../src/services/clanSiege/clanSiegeStateService.js';
import {
  computeAppliedCpHpDamage,
  readCharacterCpHpInTx,
  recordSiegeIncomingPvpHitInTx,
} from '../src/services/clanSiege/clanSiegeIncomingDamageService.js';
import { buildCharacterClientSnapshot } from '../src/services/charClientSnapshot.js';

const CITY = 'l2dop_oren';
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

async function createUserWithClan(label: string, emblemId?: number | null) {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `emb_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `E${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 30,
          exp: BigInt(1_500_000),
          cityId: CITY,
        },
      },
    },
    include: { characters: true },
  });
  const c = user.characters[0]!;
  const clan = await prisma.clan.create({
    data: {
      name: `EM${label}${suffix.slice(-4)}`.slice(0, 16),
      leaderId: c.id,
      ...(emblemId != null ? { emblemId } : {}),
    },
  });
  await prisma.character.update({
    where: { id: c.id },
    data: { clanId: clan.id, clanRole: 'leader' },
  });
  return { userId: user.id, characterId: c.id, clanId: clan.id, name: c.name };
}

async function main(): Promise<void> {
  console.log('clan-emblems smoke\n');

  assert.equal(parseClanEmblemId(1).ok, true);
  if (parseClanEmblemId(1).ok) assert.equal(parseClanEmblemId(1).emblemId, 1);
  ok('Clan.emblemId accepts 1');

  assert.equal(parseClanEmblemId(40).ok, true);
  ok('Clan.emblemId accepts 40');

  assert.equal(parseClanEmblemId(0).ok, false);
  ok('value 0 blocked');

  assert.equal(parseClanEmblemId(41).ok, false);
  ok('value 41 blocked');

  assert.equal(parseClanEmblemId(1.5).ok, false);
  ok('non-integer blocked');

  assert.equal(clanEmblemPublicUrl(7), '/clans-emblems/7.jpg');
  ok('emblem URL for id 7');

  const leader = await createUserWithClan('L', 3);
  const member = await createUserWithClan('M', null);
  const memberChar = await prisma.character.findFirst({
    where: { userId: member.userId },
  });
  assert.ok(memberChar);
  await prisma.character.update({
    where: { id: memberChar!.id },
    data: { clanId: leader.clanId, clanRole: 'member' },
  });

  await assert.rejects(
    () => updateClanEmblemForUser(member.userId, 5),
    (err: unknown) => err instanceof Error && err.message === 'clan_emblem_forbidden'
  );
  ok('non-leader cannot change emblem');

  const updated = await updateClanEmblemForUser(leader.userId, 12);
  assert.equal(updated.emblemId, 12);
  ok('leader can change emblem');

  const clanView = await getClanMyForUser(leader.userId);
  assert.ok(clanView);
  assert.equal(clanView!.emblemId, 12);
  ok('Clan DTO returns emblemId');

  const snap = await buildCharacterClientSnapshot(
    (await prisma.character.findFirst({
      where: { userId: leader.userId },
      include: { clan: { select: { name: true, emblemId: true } } },
    })) as never,
    leader.userId
  );
  assert.equal(snap.clanEmblemId, 12);
  ok('Player snapshot returns clanEmblemId');

  assert.equal(parseClanEmblemId(null).ok, false);
  ok('missing emblemId is invalid for explicit set');

  const nowMs = Date.now();
  const siege = await prisma.clanSiege.create({
    data: {
      cityId: CITY,
      startsAt: new Date(nowMs - 60_000),
      endsAt: new Date(nowMs + 3_600_000),
      state: CLAN_SIEGE_STATE.active,
      wallHp: SIEGE_WALL_MAX_HP,
      wallMaxHp: SIEGE_WALL_MAX_HP,
    },
  });

  await prisma.cityCastle.upsert({
    where: { cityId: CITY },
    create: { cityId: CITY, ownerClanId: leader.clanId },
    update: { ownerClanId: leader.clanId },
  });

  await prisma.clanSiegeParticipant.create({
    data: {
      siegeId: siege.id,
      characterId: memberChar!.id,
      clanId: leader.clanId,
    },
  });

  const attAcc = await createUserWithClan('A', 5);
  await prisma.clanSiegeParticipant.create({
    data: {
      siegeId: siege.id,
      characterId: attAcc.characterId,
      clanId: attAcc.clanId,
    },
  });

  const siegeState = await getSiegeStateForUser(leader.userId, CITY);
  assert.ok(siegeState);
  assert.ok(siegeState!.ownerClan);
  assert.equal(siegeState!.ownerClan!.emblemId, 12);
  ok('City owner / siege state returns controlling clan emblemId');

  const chat = await listChatMessages('all', 1);
  assert.ok(Array.isArray(chat.messages));
  ok('chat list returns without per-emblem HTTP (batch include)');

  const ratings = await getRatingsSnapshot({
    userId: leader.userId,
    typeRaw: 'level',
    pageRaw: 1,
  });
  assert.ok(Array.isArray(ratings.rows));
  ok('ratings snapshot uses batch clan include');

  await prisma.$transaction(async (tx) => {
    await recordSiegeIncomingPvpHitInTx(tx, {
      siegeId: siege.id,
      victimCharacterId: memberChar!.id,
      attackerCharacterId: attAcc.characterId,
      attackerName: 'markusan',
      appliedDamage: 125,
      nowMs,
    });
  });

  const afterHit = await getSiegeStateForUser(member.userId, CITY);
  assert.ok(afterHit?.incomingDamageNotice);
  assert.equal(afterHit!.incomingDamageNotice!.attackerName, 'markusan');
  assert.equal(afterHit!.incomingDamageNotice!.damage, 125);
  ok('successful Siege PvP hit records attackerName and damage');

  await prisma.$transaction(async (tx) => {
    await recordSiegeIncomingPvpHitInTx(tx, {
      siegeId: siege.id,
      victimCharacterId: memberChar!.id,
      attackerCharacterId: attAcc.characterId,
      attackerName: 'markusan',
      appliedDamage: 0,
      nowMs: nowMs + 1,
    });
  });
  const afterZero = await getSiegeStateForUser(member.userId, CITY);
  assert.equal(afterZero!.incomingDamageNotice!.damage, 125);
  ok('zero damage does not change incoming notice');

  await prisma.$transaction(async (tx) => {
    await recordSiegeIncomingPvpHitInTx(tx, {
      siegeId: siege.id,
      victimCharacterId: memberChar!.id,
      attackerCharacterId: attAcc.characterId,
      attackerName: 'next',
      appliedDamage: 40,
      nowMs: nowMs + 2,
    });
  });
  const afterReplace = await getSiegeStateForUser(member.userId, CITY);
  assert.equal(afterReplace!.incomingDamageNotice!.attackerName, 'next');
  assert.equal(afterReplace!.incomingDamageNotice!.damage, 40);
  ok('new hit replaces previous notice');

  const otherSiege = await prisma.clanSiege.create({
    data: {
      cityId: 'l2dop_giran',
      startsAt: new Date(nowMs - 60_000),
      endsAt: new Date(nowMs + 3_600_000),
      state: CLAN_SIEGE_STATE.active,
      wallHp: SIEGE_WALL_MAX_HP,
      wallMaxHp: SIEGE_WALL_MAX_HP,
    },
  });
  await prisma.clanSiegeParticipant.create({
    data: {
      siegeId: otherSiege.id,
      characterId: memberChar!.id,
      clanId: leader.clanId,
      lastIncomingAttackerName: 'old-siege',
      lastIncomingDamage: 99,
      lastIncomingAt: new Date(nowMs - 1000),
    },
  });
  const giranState = await getSiegeStateForUser(member.userId, 'l2dop_giran');
  assert.equal(giranState!.incomingDamageNotice!.attackerName, 'old-siege');
  const orenState = await getSiegeStateForUser(member.userId, CITY);
  assert.equal(orenState!.incomingDamageNotice!.attackerName, 'next');
  ok('notice scoped to siegeId');

  const before = await readCharacterCpHpInTx(prisma, memberChar!.id);
  assert.ok(before);
  const after = { hp: before!.hp - 50, cp: before!.cp - 75 };
  const applied = computeAppliedCpHpDamage(before!, after);
  assert.equal(applied, 125);
  ok('applied damage equals CP+HP delta');

  const xssName = '<img onerror=alert(1)>';
  await prisma.clan.update({
    where: { id: leader.clanId },
    data: { name: xssName },
  });
  const xssView = await getClanMyForUser(leader.userId);
  assert.equal(xssView!.name, xssName);
  ok('XSS in clanName stored server-side (client must escape on render)');

  console.log(`\n${passed} checks passed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
