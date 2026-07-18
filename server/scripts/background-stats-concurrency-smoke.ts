/**
 * Smoke: атомарність фонової RB-статистики та dailyQuestsJson без revision++.
 * Запуск: npm run test:background-stats-concurrency
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';
import {
  applyDailyQuestChatMessage,
  applyDailyQuestRaidBossParticipation,
  claimDailyQuestTask,
  dailyQuestEffectiveHave,
  emptyDailyQuestsJson,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
} from '../src/domain/dailyQuests.js';
import { applyDailyQuestRewardToInventory, DAILY_QUEST_REWARDS } from '../src/domain/dailyQuestRewards.js';
import { parseInventory } from '../src/data/inventory.js';
import { applyDailyQuestsJsonAtomicInTx } from '../src/services/charDailyQuestPersist.js';
import { creditDailyQuestRaidBossParticipationInTx } from '../src/services/dailyQuestProgressService.js';
import { creditRaidBossKillInTx } from '../src/services/ratingsStatsService.js';
import { mutateCharacterWithRevision } from '../src/services/characterMutation.js';

const PARALLEL_RB_CREDITS = 12;

async function createTestCharacter(): Promise<{ userId: string; characterId: string }> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `bgstat_${suffix}`;
  const name = `BgStat${suffix.slice(-8)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name,
          raidBossKills: 0,
          dailyQuestsJson: serializeDailyQuestsJson(emptyDailyQuestsJson()) as object,
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0];
  if (!char) throw new Error('character_create_failed');
  return { userId: user.id, characterId: char.id };
}

async function cleanupTestCharacter(characterId: string, userId: string): Promise<void> {
  await prisma.character.delete({ where: { id: characterId } }).catch(() => undefined);
  await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
}

async function testParallelRaidBossKillsIncrement(characterId: string): Promise<void> {
  await prisma.character.update({
    where: { id: characterId },
    data: { raidBossKills: 0 },
  });

  await Promise.all(
    Array.from({ length: PARALLEL_RB_CREDITS }, () =>
      prisma.$transaction(async (tx) => {
        await creditRaidBossKillInTx(tx, characterId);
      })
    )
  );

  const row = await prisma.character.findUnique({
    where: { id: characterId },
    select: { raidBossKills: true },
  });
  assert.equal(
    row?.raidBossKills,
    PARALLEL_RB_CREDITS,
    `raidBossKills must be ${PARALLEL_RB_CREDITS} after parallel increments`
  );
}

async function testParallelDailyQuestChatAndRb(characterId: string): Promise<void> {
  const nowMs = Date.now();
  await prisma.character.update({
    where: { id: characterId },
    data: {
      dailyQuestsJson: serializeDailyQuestsJson(emptyDailyQuestsJson(nowMs)) as object,
    },
  });

  await Promise.all([
    prisma.$transaction(async (tx) => {
      await applyDailyQuestsJsonAtomicInTx(tx, characterId, nowMs, (before) =>
        applyDailyQuestChatMessage(before, nowMs)
      );
    }),
    prisma.$transaction(async (tx) => {
      await creditDailyQuestRaidBossParticipationInTx(tx, characterId, nowMs);
    }),
  ]);

  const row = await prisma.character.findUnique({
    where: { id: characterId },
    select: { dailyQuestsJson: true },
  });
  const state = parseDailyQuestsJson(row?.dailyQuestsJson, nowMs);
  assert.equal(
    state.tasks.chat_social_10?.have ?? 0,
    1,
    'chat progress must survive parallel RB credit'
  );
  assert.equal(
    state.tasks.raid_boss_participate?.have ?? 0,
    1,
    'raid_boss_participate must survive parallel chat credit'
  );
  assert.equal(
    state.tasks.strong_enemy_20?.have ?? 0,
    1,
    'strong_enemy_20 must survive parallel chat credit'
  );
}

async function testBackgroundCreditDoesNotBumpRevision(characterId: string): Promise<void> {
  const before = await prisma.character.findUnique({
    where: { id: characterId },
    select: { revision: true, raidBossKills: true, dailyQuestsJson: true },
  });
  if (!before) throw new Error('character_missing');

  const nowMs = Date.now();
  await prisma.$transaction(async (tx) => {
    await creditRaidBossKillInTx(tx, characterId);
    await creditDailyQuestRaidBossParticipationInTx(tx, characterId, nowMs);
  });

  const mid = await prisma.character.findUnique({
    where: { id: characterId },
    select: { revision: true, raidBossKills: true },
  });
  assert.equal(
    mid?.revision,
    before.revision,
    'background RB stats must not bump Character.revision'
  );
  assert.ok(
    (mid?.raidBossKills ?? 0) > (before.raidBossKills ?? 0),
    'raidBossKills must still increment'
  );

  const playerMutation = await prisma.$transaction(async (tx) => {
    return mutateCharacterWithRevision(tx, characterId, before.revision, () => ({
      changed: true,
      data: { hp: 99 },
    }));
  });
  assert.equal(playerMutation.ok, true, 'player mutation with stale revision must succeed');
  if (playerMutation.ok) {
    assert.equal(
      playerMutation.character.revision,
      before.revision + 1,
      'player mutation bumps revision once'
    );
  }
}

async function testClaimRewardNotIssuedTwice(characterId: string): Promise<void> {
  const nowMs = Date.now();
  const freshDaily = emptyDailyQuestsJson(nowMs);
  freshDaily.tasks.chat_social_10 = { have: 10, done: true, claimed: false };

  await prisma.character.update({
    where: { id: characterId },
    data: {
      dailyQuestsJson: serializeDailyQuestsJson(freshDaily) as object,
      inventoryJson: parseInventory(null) as object,
    },
  });

  const row0 = await prisma.character.findUnique({ where: { id: characterId } });
  if (!row0) throw new Error('character_missing');
  const rev0 = row0.revision;

  const first = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findUnique({ where: { id: characterId } });
    if (!char) throw new Error('character_missing');
    if (char.revision !== rev0) throw new Error('unexpected_revision');

    const nextDaily = claimDailyQuestTask(
      parseDailyQuestsJson(char.dailyQuestsJson, nowMs),
      'chat_social_10',
      nowMs
    );
    let inv = parseInventory(char.inventoryJson);
    const grant = DAILY_QUEST_REWARDS.chat_social_10;
    inv = applyDailyQuestRewardToInventory(inv, grant);

    const result = await mutateCharacterWithRevision(tx, characterId, rev0, () => ({
      changed: true,
      data: {
        dailyQuestsJson: serializeDailyQuestsJson(nextDaily) as object,
        inventoryJson: inv as object,
        ...(grant.adena != null && grant.adena > 0n
          ? { adena: { increment: grant.adena } }
          : {}),
      },
    }));
    if (!result.ok) throw new Error('claim_first_failed');
    return result.character;
  });

  assert.equal(first.revision, rev0 + 1);

  const second = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findUnique({ where: { id: characterId } });
    if (!char) throw new Error('character_missing');
    try {
      claimDailyQuestTask(
        parseDailyQuestsJson(char.dailyQuestsJson, nowMs),
        'chat_social_10',
        nowMs
      );
      throw new Error('second_claim_should_throw');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      assert.equal(msg, 'daily_quest_already_claimed');
    }
    return char;
  });

  const after = await prisma.character.findUnique({
    where: { id: characterId },
    select: { adena: true, dailyQuestsJson: true },
  });
  const daily = parseDailyQuestsJson(after?.dailyQuestsJson, nowMs);
  assert.equal(daily.tasks.chat_social_10?.claimed, true);
  assert.equal(
    dailyEffectiveHaveSafe(daily, 'chat_social_10', nowMs) >= 10,
    true
  );
  assert.equal(after?.adena, 15_000n, 'reward adena must not double on blocked second claim');
  void second;
}

function dailyEffectiveHaveSafe(
  state: ReturnType<typeof parseDailyQuestsJson>,
  taskId: 'chat_social_10',
  nowMs: number
): number {
  return dailyQuestEffectiveHave(state, taskId, nowMs);
}

async function main(): Promise<void> {
  const { userId, characterId } = await createTestCharacter();
  try {
    await testParallelRaidBossKillsIncrement(characterId);
    console.log('[test:background-stats-concurrency] parallel raidBossKills OK');

    await testParallelDailyQuestChatAndRb(characterId);
    console.log('[test:background-stats-concurrency] parallel dailyQuest JSON OK');

    await testBackgroundCreditDoesNotBumpRevision(characterId);
    console.log('[test:background-stats-concurrency] no revision bump on background credit OK');

    await testClaimRewardNotIssuedTwice(characterId);
    console.log('[test:background-stats-concurrency] claim not doubled OK');

    console.log('[test:background-stats-concurrency] ALL OK');
  } finally {
    await cleanupTestCharacter(characterId, userId);
  }
}

main().catch((err) => {
  console.error('[test:background-stats-concurrency] FAIL', err);
  process.exit(1);
});
