/**
 * Smoke-тести соціальної системи паті (фаза 1).
 * Запуск: npm run test:party-social
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';
import {
  acceptPartyInviteForUser,
  declinePartyInviteForUser,
  sendPartyInviteForUser,
} from '../src/services/party/partyInviteService.js';
import {
  createPartyForUser,
  disbandPartyForUser,
  getPartyForUser,
  kickPartyMemberForUser,
  leavePartyForUser,
} from '../src/services/party/partyService.js';
import { PARTY_INVITE_TTL_MS } from '../src/services/party/partyConstants.js';

type TestAccount = {
  userId: string;
  characterId: string;
  name: string;
};

async function createTestAccount(label: string): Promise<TestAccount> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `party_${label}_${suffix}`;
  const name = `P${label}${suffix.slice(-4)}`.slice(0, 16);
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name,
          race: 'Human',
          classBranch: 'fighter',
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0]!;
  return { userId: user.id, characterId: char.id, name: char.name };
}

async function revisionOf(characterId: string): Promise<number> {
  const row = await prisma.character.findUnique({
    where: { id: characterId },
    select: { revision: true },
  });
  return row?.revision ?? -1;
}

async function partyVersionOf(partyId: string): Promise<number> {
  const row = await prisma.party.findUnique({
    where: { id: partyId },
    select: { version: true },
  });
  return row?.version ?? -1;
}

async function assertLeaderIsMember(partyId: string): Promise<void> {
  const party = await prisma.party.findUnique({
    where: { id: partyId },
    select: { leaderCharacterId: true },
  });
  assert.ok(party);
  const mem = await prisma.partyMember.findUnique({
    where: { characterId: party!.leaderCharacterId },
    select: { partyId: true },
  });
  assert.ok(mem);
  assert.equal(mem!.partyId, partyId);
}

async function inviteAndAccept(
  leader: TestAccount,
  target: TestAccount,
  version: number
): Promise<{ partyVersion: number; partyId: string }> {
  await sendPartyInviteForUser(leader.userId, target.characterId, version);
  const inv = await prisma.partyInvite.findFirst({
    where: { targetCharacterId: target.characterId },
  });
  assert.ok(inv);
  const accepted = await acceptPartyInviteForUser(
    target.userId,
    inv!.id,
    version
  );
  return { partyVersion: accepted.party.version, partyId: accepted.party.id };
}

async function cleanupAccounts(accounts: TestAccount[]): Promise<void> {
  const userIds = accounts.map((a) => a.userId);
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

async function testCreateAddsLeaderAsMember() {
  const a = await createTestAccount('lead');
  try {
    const { party } = await createPartyForUser(a.userId);
    assert.equal(party.members.length, 1);
    assert.equal(party.members[0]!.characterId, a.characterId);
    assert.equal(party.members[0]!.isLeader, true);
    assert.equal(party.leaderCharacterId, a.characterId);
    assert.equal(party.members[0]!.slotOrder, 0);
    await assertLeaderIsMember(party.id);
  } finally {
    await cleanupAccounts([a]);
  }
}

async function testOneCharacterOneParty() {
  const a = await createTestAccount('one');
  try {
    await createPartyForUser(a.userId);
    await assert.rejects(
      () => createPartyForUser(a.userId),
      (e: Error) => e.message === 'party_already_member'
    );
  } finally {
    await cleanupAccounts([a]);
  }
}

async function testMaxFiveMembers() {
  const accounts = await Promise.all(
    Array.from({ length: 6 }, (_, i) => createTestAccount(`m${i}`))
  );
  try {
    const leader = accounts[0]!;
    const { party: p0 } = await createPartyForUser(leader.userId);
    let version = p0.version;

    for (let i = 1; i < 5; i++) {
      const target = accounts[i]!;
      await sendPartyInviteForUser(
        leader.userId,
        target.characterId,
        version
      );
      const invites = await prisma.partyInvite.findMany({
        where: { targetCharacterId: target.characterId },
      });
      assert.equal(invites.length, 1);
      const accepted = await acceptPartyInviteForUser(
        target.userId,
        invites[0]!.id,
        version
      );
      version = accepted.party.version;
    }

    const sixth = accounts[5]!;
    await assert.rejects(
      () => sendPartyInviteForUser(leader.userId, sixth.characterId, version),
      (e: Error) => e.message === 'party_full'
    );

    const count = await prisma.partyMember.count({
      where: { partyId: p0.id },
    });
    assert.equal(count, 5);
  } finally {
    await cleanupAccounts(accounts);
  }
}

async function testConcurrentAcceptMaxFive() {
  const accounts = await Promise.all(
    Array.from({ length: 6 }, (_, i) => createTestAccount(`c${i}`))
  );
  try {
    const leader = accounts[0]!;
    const { party } = await createPartyForUser(leader.userId);
    let version = party.version;

    for (let i = 1; i < 4; i++) {
      await sendPartyInviteForUser(
        leader.userId,
        accounts[i]!.characterId,
        version
      );
      const inv = await prisma.partyInvite.findFirst({
        where: { targetCharacterId: accounts[i]!.characterId },
      });
      const acc = await acceptPartyInviteForUser(
        accounts[i]!.userId,
        inv!.id,
        version
      );
      version = acc.party.version;
    }

    const a4 = accounts[4]!;
    const a5 = accounts[5]!;
    await sendPartyInviteForUser(leader.userId, a4.characterId, version);
    await sendPartyInviteForUser(leader.userId, a5.characterId, version);
    const inv4 = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: a4.characterId },
    });
    const inv5 = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: a5.characterId },
    });
    const acceptVersion = version;

    const results = await Promise.allSettled([
      acceptPartyInviteForUser(a4.userId, inv4!.id, acceptVersion),
      acceptPartyInviteForUser(a5.userId, inv5!.id, acceptVersion),
    ]);

    const ok = results.filter((r) => r.status === 'fulfilled');
    const fail = results.filter((r) => r.status === 'rejected');
    assert.equal(ok.length, 1);
    assert.equal(fail.length, 1);
    const failReason = (fail[0] as PromiseRejectedResult).reason as Error;
    assert.ok(
      failReason.message === 'party_full' ||
        failReason.message === 'party_version_mismatch'
    );

    const count = await prisma.partyMember.count({
      where: { partyId: party.id },
    });
    assert.equal(count, 5);

    const slots = (
      await prisma.partyMember.findMany({
        where: { partyId: party.id },
        select: { slotOrder: true },
      })
    ).map((m) => m.slotOrder);
    assert.equal(new Set(slots).size, slots.length);
  } finally {
    await cleanupAccounts(accounts);
  }
}

async function testExpiredInviteNotAccepted() {
  const leader = await createTestAccount('lex');
  const target = await createTestAccount('tex');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      target.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: target.characterId },
    });
    assert.ok(inv);
    await prisma.partyInvite.update({
      where: { id: inv!.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const fresh = await prisma.party.findUnique({ where: { id: party.id } });
    await assert.rejects(
      () =>
        acceptPartyInviteForUser(
          target.userId,
          inv!.id,
          fresh!.version
        ),
      (e: Error) => e.message === 'party_invite_expired'
    );
  } finally {
    await cleanupAccounts([leader, target]);
  }
}

async function testDuplicateInvite() {
  const leader = await createTestAccount('ldup');
  const target = await createTestAccount('tdup');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      target.characterId,
      party.version
    );
    const fresh = await prisma.party.findUnique({ where: { id: party.id } });
    await assert.rejects(
      () =>
        sendPartyInviteForUser(
          leader.userId,
          target.characterId,
          fresh!.version
        ),
      (e: Error) => e.message === 'party_invite_exists'
    );
  } finally {
    await cleanupAccounts([leader, target]);
  }
}

async function testMemberLeave() {
  const leader = await createTestAccount('ll');
  const member = await createTestAccount('lm');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      member.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: member.characterId },
    });
    const joined = await acceptPartyInviteForUser(
      member.userId,
      inv!.id,
      party.version
    );
    await leavePartyForUser(member.userId, joined.party.version);
    const mem = await prisma.partyMember.findUnique({
      where: { characterId: member.characterId },
    });
    assert.equal(mem, null);
  } finally {
    await cleanupAccounts([leader, member]);
  }
}

async function testLeaderTransferOnLeave() {
  const leader = await createTestAccount('ltl');
  const member = await createTestAccount('ltm');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      member.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: member.characterId },
    });
    await acceptPartyInviteForUser(member.userId, inv!.id, party.version);
    const fresh = await prisma.party.findUnique({ where: { id: party.id } });
    await leavePartyForUser(leader.userId, fresh!.version);
    const updated = await prisma.party.findUnique({
      where: { id: party.id },
    });
    assert.ok(updated);
    assert.equal(updated!.leaderCharacterId, member.characterId);
    await assertLeaderIsMember(party.id);
  } finally {
    await cleanupAccounts([leader, member]);
  }
}

async function testLastLeaderLeaveDeletesParty() {
  const solo = await createTestAccount('solo');
  try {
    const { party } = await createPartyForUser(solo.userId);
    await leavePartyForUser(solo.userId, party.version);
    const gone = await prisma.party.findUnique({ where: { id: party.id } });
    assert.equal(gone, null);
  } finally {
    await cleanupAccounts([solo]);
  }
}

async function testKickLeaderOnly() {
  const leader = await createTestAccount('kl');
  const member = await createTestAccount('km');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      member.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: member.characterId },
    });
    const joined = await acceptPartyInviteForUser(
      member.userId,
      inv!.id,
      party.version
    );
    await assert.rejects(
      () =>
        kickPartyMemberForUser(
          member.userId,
          leader.characterId,
          joined.party.version
        ),
      (e: Error) => e.message === 'party_forbidden'
    );
    const kicked = await kickPartyMemberForUser(
      leader.userId,
      member.characterId,
      joined.party.version
    );
    assert.equal(kicked.party.memberCount, 1);
    await assertLeaderIsMember(party.id);
  } finally {
    await cleanupAccounts([leader, member]);
  }
}

async function testDisbandLeaderOnly() {
  const leader = await createTestAccount('dl');
  const member = await createTestAccount('dm');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      member.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: member.characterId },
    });
    const joined = await acceptPartyInviteForUser(
      member.userId,
      inv!.id,
      party.version
    );
    await assert.rejects(
      () => disbandPartyForUser(member.userId, joined.party.version),
      (e: Error) => e.message === 'party_forbidden'
    );
    await disbandPartyForUser(leader.userId, joined.party.version);
    const gone = await prisma.party.findUnique({ where: { id: party.id } });
    assert.equal(gone, null);
  } finally {
    await cleanupAccounts([leader, member]);
  }
}

async function testSocialOpsDoNotBumpCharacterRevision() {
  const leader = await createTestAccount('revl');
  const member = await createTestAccount('revm');
  try {
    const revBeforeLeader = await revisionOf(leader.characterId);
    const revBeforeMember = await revisionOf(member.characterId);

    const { party } = await createPartyForUser(leader.userId);
    assert.equal(await revisionOf(leader.characterId), revBeforeLeader);

    await sendPartyInviteForUser(
      leader.userId,
      member.characterId,
      party.version
    );
    assert.equal(await revisionOf(leader.characterId), revBeforeLeader);

    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: member.characterId },
    });
    const joined = await acceptPartyInviteForUser(
      member.userId,
      inv!.id,
      party.version
    );
    assert.equal(await revisionOf(member.characterId), revBeforeMember);

    await kickPartyMemberForUser(
      leader.userId,
      member.characterId,
      joined.party.version
    );
    assert.equal(await revisionOf(leader.characterId), revBeforeLeader);
    assert.equal(await revisionOf(member.characterId), revBeforeMember);
  } finally {
    await cleanupAccounts([leader, member]);
  }
}

async function testForeignUserCannotManageCharacter() {
  const owner = await createTestAccount('own');
  const intruder = await createTestAccount('int');
  try {
    await createPartyForUser(owner.userId);
    await assert.rejects(
      () => createPartyForUser(intruder.userId, owner.characterId),
      (e: Error) => e.message === 'no_character'
    );
  } finally {
    await cleanupAccounts([owner, intruder]);
  }
}

async function testPartyVersionConflictReturnsFreshParty() {
  const leader = await createTestAccount('ver');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await assert.rejects(
      () => leavePartyForUser(leader.userId, party.version + 99),
      (e: Error) => e.message === 'party_version_mismatch'
    );
  } finally {
    await cleanupAccounts([leader]);
  }
}

async function testGetPartyNotForeign() {
  const a = await createTestAccount('ga');
  const b = await createTestAccount('gb');
  try {
    await createPartyForUser(a.userId);
    const view = await getPartyForUser(b.userId);
    assert.equal(view.party, null);
  } finally {
    await cleanupAccounts([a, b]);
  }
}

async function testInviteTtlConstant() {
  assert.equal(PARTY_INVITE_TTL_MS, 2 * 60 * 1000);
}

async function testAcceptFillsSlotGapAfterLeave() {
  const leader = await createTestAccount('sgl');
  const m1 = await createTestAccount('sg1');
  const m2 = await createTestAccount('sg2');
  const m3 = await createTestAccount('sg3');
  try {
    const { party } = await createPartyForUser(leader.userId);
    let version = party.version;
    ({ partyVersion: version } = await inviteAndAccept(leader, m1, version));
    ({ partyVersion: version } = await inviteAndAccept(leader, m2, version));

    await leavePartyForUser(m1.userId, version);
    version += 1;

    await sendPartyInviteForUser(leader.userId, m3.characterId, version);
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: m3.characterId },
    });
    await acceptPartyInviteForUser(m3.userId, inv!.id, version);

    const row = await prisma.partyMember.findUnique({
      where: { characterId: m3.characterId },
      select: { slotOrder: true },
    });
    assert.equal(row!.slotOrder, 1);
  } finally {
    await cleanupAccounts([leader, m1, m2, m3]);
  }
}

async function testAcceptClearsOtherInvites() {
  const leaderA = await createTestAccount('cia');
  const leaderB = await createTestAccount('cib');
  const target = await createTestAccount('cit');
  try {
    const partyA = await createPartyForUser(leaderA.userId);
    await createPartyForUser(leaderB.userId);
    await sendPartyInviteForUser(
      leaderA.userId,
      target.characterId,
      partyA.party.version
    );
    await sendPartyInviteForUser(
      leaderB.userId,
      target.characterId,
      1
    );
    const invA = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: target.characterId, partyId: partyA.party.id },
    });
    assert.ok(invA);
    assert.equal(
      await prisma.partyInvite.count({
        where: { targetCharacterId: target.characterId },
      }),
      2
    );
    await acceptPartyInviteForUser(
      target.userId,
      invA!.id,
      partyA.party.version
    );
    assert.equal(
      await prisma.partyInvite.count({
        where: { targetCharacterId: target.characterId },
      }),
      0
    );
  } finally {
    await cleanupAccounts([leaderA, leaderB, target]);
  }
}

async function testCreateClearsInvites() {
  const leader = await createTestAccount('ccl');
  const target = await createTestAccount('cct');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      target.characterId,
      party.version
    );
    assert.equal(
      await prisma.partyInvite.count({
        where: { targetCharacterId: target.characterId },
      }),
      1
    );
    await createPartyForUser(target.userId);
    assert.equal(
      await prisma.partyInvite.count({
        where: { targetCharacterId: target.characterId },
      }),
      0
    );
  } finally {
    await cleanupAccounts([leader, target]);
  }
}

async function testInviteDoesNotBumpVersion() {
  const leader = await createTestAccount('inv');
  const target = await createTestAccount('int');
  try {
    const { party } = await createPartyForUser(leader.userId);
    const before = party.version;
    const res = await sendPartyInviteForUser(
      leader.userId,
      target.characterId,
      before
    );
    assert.equal(res.partyVersion, before);
    assert.equal(await partyVersionOf(party.id), before);
  } finally {
    await cleanupAccounts([leader, target]);
  }
}

async function testDeclineDoesNotBumpVersion() {
  const leader = await createTestAccount('dcl');
  const target = await createTestAccount('dct');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      target.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: target.characterId },
    });
    assert.ok(inv);
    const before = await partyVersionOf(party.id);
    await declinePartyInviteForUser(target.userId, inv!.id);
    assert.equal(await partyVersionOf(party.id), before);
  } finally {
    await cleanupAccounts([leader, target]);
  }
}

async function testAcceptBumpsVersionOnce() {
  const leader = await createTestAccount('abv');
  const target = await createTestAccount('abt');
  try {
    const { party } = await createPartyForUser(leader.userId);
    assert.equal(party.version, 1);
    await sendPartyInviteForUser(
      leader.userId,
      target.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: target.characterId },
    });
    const accepted = await acceptPartyInviteForUser(
      target.userId,
      inv!.id,
      party.version
    );
    assert.equal(accepted.party.version, 2);
    assert.equal(await partyVersionOf(party.id), 2);
  } finally {
    await cleanupAccounts([leader, target]);
  }
}

async function testConcurrentLeaderLeaveKick() {
  const leader = await createTestAccount('clk');
  const member = await createTestAccount('ckm');
  try {
    const { party } = await createPartyForUser(leader.userId);
    await sendPartyInviteForUser(
      leader.userId,
      member.characterId,
      party.version
    );
    const inv = await prisma.partyInvite.findFirst({
      where: { targetCharacterId: member.characterId },
    });
    await acceptPartyInviteForUser(member.userId, inv!.id, party.version);
    const version = await partyVersionOf(party.id);

    await Promise.allSettled([
      leavePartyForUser(leader.userId, version),
      kickPartyMemberForUser(leader.userId, member.characterId, version),
    ]);

    const remaining = await prisma.party.findUnique({ where: { id: party.id } });
    if (remaining) {
      await assertLeaderIsMember(party.id);
    }
  } finally {
    await cleanupAccounts([leader, member]);
  }
}

async function testLeaderInvariantAfterKickAndMemberLeave() {
  const leader = await createTestAccount('invk');
  const m1 = await createTestAccount('in1');
  const m2 = await createTestAccount('in2');
  try {
    const { party } = await createPartyForUser(leader.userId);
    let version = party.version;
    ({ partyVersion: version } = await inviteAndAccept(leader, m1, version));
    ({ partyVersion: version } = await inviteAndAccept(leader, m2, version));
    await assertLeaderIsMember(party.id);

    await kickPartyMemberForUser(leader.userId, m2.characterId, version);
    version += 1;
    await assertLeaderIsMember(party.id);

    await leavePartyForUser(m1.userId, version);
    version += 1;
    await assertLeaderIsMember(party.id);
  } finally {
    await cleanupAccounts([leader, m1, m2]);
  }
}

async function assertNoOrphanParties(): Promise<void> {
  const orphans = await prisma.party.count({
    where: { members: { none: {} } },
  });
  assert.equal(orphans, 0);
}

const CANONICAL_RACE_ERRORS = new Set([
  'party_target_in_party',
  'party_already_member',
]);

async function testConcurrentCreateVsAccept() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const leader = await createTestAccount(`rcl${attempt}`);
    const target = await createTestAccount(`rct${attempt}`);
    const otherLeader = await createTestAccount(`rco${attempt}`);
    try {
      const { party: leaderParty } = await createPartyForUser(leader.userId);
      await createPartyForUser(otherLeader.userId);
      await sendPartyInviteForUser(
        leader.userId,
        target.characterId,
        leaderParty.version
      );
      await sendPartyInviteForUser(
        otherLeader.userId,
        target.characterId,
        1
      );
      const inv = await prisma.partyInvite.findFirst({
        where: {
          targetCharacterId: target.characterId,
          partyId: leaderParty.id,
        },
      });
      assert.ok(inv);

      const results = await Promise.allSettled([
        createPartyForUser(target.userId),
        acceptPartyInviteForUser(
          target.userId,
          inv!.id,
          leaderParty.version
        ),
      ]);

      const ok = results.filter((r) => r.status === 'fulfilled');
      const fail = results.filter((r) => r.status === 'rejected');
      assert.equal(ok.length, 1, `attempt ${attempt}: one success expected`);
      assert.equal(fail.length, 1, `attempt ${attempt}: one failure expected`);

      const failErr = (fail[0] as PromiseRejectedResult).reason;
      assert.ok(failErr instanceof Error, `attempt ${attempt}: Error expected`);
      assert.ok(
        CANONICAL_RACE_ERRORS.has(failErr.message),
        `attempt ${attempt}: unexpected ${String(failErr.message)}`
      );
      assert.ok(!String(failErr.message).includes('P2002'));
      assert.ok(!String(failErr.message).includes('Prisma'));

      const memberships = await prisma.partyMember.findMany({
        where: { characterId: target.characterId },
      });
      assert.equal(memberships.length, 1);

      await assertNoOrphanParties();
      await assertLeaderIsMember(memberships[0]!.partyId);

      assert.equal(
        await prisma.partyInvite.count({
          where: { targetCharacterId: target.characterId },
        }),
        0
      );
    } finally {
      await cleanupAccounts([leader, target, otherLeader]);
    }
  }
}

async function main() {
  const tests: Array<[string, () => Promise<void>]> = [
    ['create додає leader як PartyMember', testCreateAddsLeaderAsMember],
    ['один character — одна party', testOneCharacterOneParty],
    ['максимум 5 учасників', testMaxFiveMembers],
    ['concurrent accept не створює 6', testConcurrentAcceptMaxFive],
    ['expired invite не приймається', testExpiredInviteNotAccepted],
    ['duplicate invite', testDuplicateInvite],
    ['member leave', testMemberLeave],
    ['leader transfer on leave', testLeaderTransferOnLeave],
    ['last leader leave видаляє party', testLastLeaderLeaveDeletesParty],
    ['kick тільки leader', testKickLeaderOnly],
    ['disband тільки leader', testDisbandLeaderOnly],
    [
      'social operations не змінюють Character.revision',
      testSocialOpsDoNotBumpCharacterRevision,
    ],
    ['чужий user не керує character', testForeignUserCannotManageCharacter],
    ['partyVersion conflict', testPartyVersionConflictReturnsFreshParty],
    ['GET party не показує чужу party', testGetPartyNotForeign],
    ['invite TTL 2 хв', testInviteTtlConstant],
    ['accept заповнює дірку slotOrder', testAcceptFillsSlotGapAfterLeave],
    ['accept очищає інші invites', testAcceptClearsOtherInvites],
    ['create очищає invites', testCreateClearsInvites],
    ['invite не bump Party.version', testInviteDoesNotBumpVersion],
    ['decline не bump Party.version', testDeclineDoesNotBumpVersion],
    ['accept bump Party.version один раз', testAcceptBumpsVersionOnce],
    ['concurrent leader leave/kick', testConcurrentLeaderLeaveKick],
    ['leader invariant після kick/leave', testLeaderInvariantAfterKickAndMemberLeave],
    [
      'concurrent create vs accept для одного character',
      testConcurrentCreateVsAccept,
    ],
  ];

  for (const [name, fn] of tests) {
    process.stdout.write(`· ${name}… `);
    await fn();
    process.stdout.write('ok\n');
  }
  console.log(`\nУсі ${tests.length} тестів пройшли.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
