import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  dragonHpPercent,
  getDragonBossConfig,
  parseDragonBossId,
  remainingSecondsUntil,
} from '../domain/dragonDungeon.js';
import {
  appendDragonBattleLog,
  emptyDragonBattleState,
  isDragonBattleStunned,
  parseDragonBattleState,
  type DragonDungeonBattleState,
} from '../domain/dragonDungeonBattleState.js';
import {
  pickCancelableBuffSkillId,
  rollDragonNormalAttackDamage,
  rollDragonSpecialOutcome,
} from '../domain/dragonDungeonBattle.js';
import {
  endContributionAttempt,
  expireClanDragonDungeonIfNeeded,
  finalizeClanDragonDefeatIfNeeded,
  finalizeStaleContributionAttempt,
  isClanDragonDungeonAlive,
  loadClanDragonDungeonById,
  resolveDragonConfigForRow,
} from './dragonDungeonLifecycle.js';
import { postClanDragonJournalVictory } from './dragonDungeonJournal.js';
import { rollDragonDungeonPlayerDamage } from './dragonDungeonPlayerAttack.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusInTx,
} from './characterClanHallVitals.js';
import { type CharacterRow } from './charService.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';

export type DragonBattleDto = {
  dungeonId: string;
  dragonId: string;
  nameUk: string;
  nameEn: string;
  titleEn: string;
  imageUrl: string;
  maxHp: string;
  currentHp: string;
  hpPercent: number;
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  damageDealt: string;
  battleEndsAt: string;
  battleRemainingSeconds: number;
  stunUntil: string | null;
  stunRemainingSeconds: number;
  logTail: string[];
  battleActive: boolean;
};

function characterSelect() {
  return {
    id: true,
    userId: true,
    name: true,
    level: true,
    hp: true,
    maxHp: true,
    exp: true,
    race: true,
    classBranch: true,
    l2Profession: true,
    cityId: true,
    gender: true,
    adena: true,
    sp: true,
    mobsKilled: true,
    karma: true,
    pvpWins: true,
    pvpAggressorUntilMs: true,
    profileStatus: true,
    inventoryJson: true,
    warehouseJson: true,
    worldX: true,
    worldY: true,
    targetX: true,
    targetY: true,
    moveStartAt: true,
    moveFromX: true,
    moveFromY: true,
    battleJson: true,
    skillsLearnedJson: true,
    activeBuffsJson: true,
    skillCooldownsJson: true,
    worldCombatStateJson: true,
    mobSpawnHpJson: true,
    battleHotbarJson: true,
    questProgressJson: true,
    dungeonStateJson: true,
    dailyQuestsJson: true,
    buffHeroicTier: true,
    buffZealotStacks: true,
    revision: true,
    lastUpdate: true,
    clanId: true,
    clanRole: true,
    pvePendingDefeatJson: true,
    pvpPendingDefeatJson: true,
    raidBossKills: true,
    chatRepliesReadAt: true,
  } as const;
}

async function loadBattleContext(userId: string, dungeonId: string) {
  const char = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: characterSelect(),
  });
  if (!char?.clanId) throw new Error('clan_required');
  let dungeon = await loadClanDragonDungeonById(prisma, dungeonId);
  if (!dungeon || dungeon.clanId !== char.clanId) throw new Error('dragon_dungeon_forbidden');
  dungeon = (await expireClanDragonDungeonIfNeeded(prisma, dungeonId)) ?? dungeon;
  const boss = resolveDragonConfigForRow(dungeon);
  if (!boss) throw new Error('dragon_not_found');
  return { char: char as CharacterRow, dungeon, boss };
}

async function ensureContribution(
  tx: Prisma.TransactionClient,
  dungeonId: string,
  characterId: string
) {
  return tx.clanDragonContribution.upsert({
    where: { dungeonId_characterId: { dungeonId, characterId } },
    create: { dungeonId, characterId },
    update: {},
  });
}

function buildBattleDto(
  dungeon: NonNullable<Awaited<ReturnType<typeof loadClanDragonDungeonById>>>,
  boss: ReturnType<typeof getDragonBossConfig>,
  st: DragonDungeonBattleState,
  damageDealt: bigint,
  battleEndsAt: Date,
  now: Date
): DragonBattleDto {
  const nowMs = now.getTime();
  const stunRemaining =
    st.stunUntilMs != null && st.stunUntilMs > nowMs
      ? Math.ceil((st.stunUntilMs - nowMs) / 1000)
      : 0;
  return {
    dungeonId: dungeon.id,
    dragonId: boss.id,
    nameUk: boss.nameUk,
    nameEn: boss.nameEn,
    titleEn: boss.titleEn,
    imageUrl: boss.imageUrl,
    maxHp: dungeon.maxHp.toString(),
    currentHp: dungeon.currentHp.toString(),
    hpPercent: dragonHpPercent(dungeon.currentHp, dungeon.maxHp),
    playerHp: st.playerHp,
    playerMaxHp: st.playerMaxHp,
    playerMp: st.playerMp,
    playerMaxMp: st.playerMaxMp,
    damageDealt: damageDealt.toString(),
    battleEndsAt: battleEndsAt.toISOString(),
    battleRemainingSeconds: remainingSecondsUntil(battleEndsAt, now),
    stunUntil:
      st.stunUntilMs != null && st.stunUntilMs > nowMs
        ? new Date(st.stunUntilMs).toISOString()
        : null,
    stunRemainingSeconds: stunRemaining,
    logTail: st.log.slice(-8),
    battleActive: true,
  };
}

async function initBattleState(
  tx: Prisma.TransactionClient,
  row: CharacterRow
): Promise<DragonDungeonBattleState> {
  const clanHallBonus = await resolveClanHallBonusInTx(tx, row);
  const vitals = computeCharacterVitalsBundle({ row, clanHallBonus });
  const nowMs = Date.now();
  return emptyDragonBattleState(
    Math.min(row.hp, vitals.maxHpChain.maxHpWithClanHall),
    vitals.maxHpChain.maxHpWithClanHall,
    vitals.maxMp,
    vitals.maxMp,
    nowMs
  );
}

function applyDragonTicks(
  st: DragonDungeonBattleState,
  boss: ReturnType<typeof getDragonBossConfig>,
  combatPDef: number,
  combatMDef: number,
  activeBuffSkillIds: string[],
  nowMs: number
): DragonDungeonBattleState {
  let next = { ...st, log: [...st.log] };
  const normalIntervalMs = boss.combat.normalAttackIntervalSeconds * 1000;
  while (nowMs - next.lastDragonAttackAtMs >= normalIntervalMs) {
    next.lastDragonAttackAtMs += normalIntervalMs;
    const dmg = rollDragonNormalAttackDamage(
      boss.combat,
      next.playerMaxHp,
      combatPDef,
      combatMDef
    );
    next.playerHp = Math.max(0, next.playerHp - dmg);
    next = appendDragonBattleLog(next, `Дракон завдав ${dmg} урону.`);
  }

  const specialIntervalMs = boss.combat.specialIntervalSeconds * 1000;
  while (nowMs - next.lastDragonSpecialAtMs >= specialIntervalMs) {
    next.lastDragonSpecialAtMs += specialIntervalMs;
    const outcome = rollDragonSpecialOutcome(boss.combat);
    if (outcome === 'stun') {
      next.stunUntilMs = nowMs + boss.combat.stunDurationSeconds * 1000;
      next = appendDragonBattleLog(next, 'Дракон оглушив вас на 3 сек.');
    } else if (outcome === 'cancel') {
      const skillId = pickCancelableBuffSkillId(activeBuffSkillIds);
      if (skillId) {
        next = appendDragonBattleLog(next, `Cancel зняв баф: ${skillId}.`);
      } else {
        next = appendDragonBattleLog(next, 'Cancel не знайшов активного бафа.');
      }
    }
  }
  return next;
}

/** POST /game/dragon-dungeon/active/enter */
export async function enterDragonBattleForUser(
  userId: string,
  rawDungeonId: unknown
): Promise<DragonBattleDto> {
  const dungeonId = String(rawDungeonId ?? '').trim();
  if (!dungeonId) throw new Error('dragon_dungeon_forbidden');

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: characterSelect(),
    });
    if (!char?.clanId) throw new Error('clan_required');
    if (char.battleJson != null && typeof char.battleJson === 'object') {
      throw new Error('battle_incompatible');
    }

    let dungeon = await loadClanDragonDungeonById(tx, dungeonId);
    if (!dungeon || dungeon.clanId !== char.clanId) {
      throw new Error('dragon_dungeon_forbidden');
    }
    dungeon = (await expireClanDragonDungeonIfNeeded(tx, dungeonId)) ?? dungeon;
    if (!isClanDragonDungeonAlive(dungeon) || dungeon.expiresAt <= new Date()) {
      throw new Error('dragon_not_active');
    }
    const boss = resolveDragonConfigForRow(dungeon);
    if (!boss) throw new Error('dragon_not_found');

    const contrib = await ensureContribution(tx, dungeonId, char.id);
    await finalizeStaleContributionAttempt(
      tx,
      contrib.id,
      boss.entryCooldownSeconds
    );
    const fresh = await tx.clanDragonContribution.findUnique({
      where: { id: contrib.id },
    });
    if (!fresh) throw new Error('dragon_battle_conflict');
    const now = new Date();
    if (fresh.nextEntryAt && fresh.nextEntryAt > now) {
      throw new Error('dragon_entry_cooldown');
    }
    if (fresh.activeBattleAt && fresh.battleEndsAt && fresh.battleEndsAt > now) {
      const st = parseDragonBattleState(fresh.battleStateJson);
      if (st) {
        return buildBattleDto(
          dungeon,
          boss,
          st,
          fresh.damageDealt,
          fresh.battleEndsAt,
          now
        );
      }
    }

    const battleEndsAt = new Date(
      now.getTime() + boss.battleDurationSeconds * 1000
    );
    const battleState = await initBattleState(tx, char as CharacterRow);
    await tx.clanDragonContribution.update({
      where: { id: fresh.id },
      data: {
        attempts: { increment: 1 },
        activeBattleAt: now,
        battleEndsAt,
        lastEnteredAt: now,
        battleStateJson: battleState,
      },
    });
    const updated = await tx.clanDragonContribution.findUnique({
      where: { id: fresh.id },
    });
    return buildBattleDto(
      dungeon,
      boss,
      battleState,
      updated!.damageDealt,
      battleEndsAt,
      now
    );
  });
}

/** POST /game/dragon-dungeon/active/attack */
export async function attackDragonForUser(
  userId: string,
  rawDungeonId: unknown,
  actionRaw: unknown
): Promise<DragonBattleDto> {
  const dungeonId = String(rawDungeonId ?? '').trim();
  if (!dungeonId) throw new Error('dragon_dungeon_forbidden');

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: characterSelect(),
    });
    if (!char?.clanId) throw new Error('clan_required');

    let dungeon = await loadClanDragonDungeonById(tx, dungeonId);
    if (!dungeon || dungeon.clanId !== char.clanId) {
      throw new Error('dragon_dungeon_forbidden');
    }
    dungeon = (await expireClanDragonDungeonIfNeeded(tx, dungeonId)) ?? dungeon;
    const boss = resolveDragonConfigForRow(dungeon);
    if (!boss) throw new Error('dragon_not_found');
    if (!isClanDragonDungeonAlive(dungeon)) throw new Error('dragon_not_active');

    const contrib = await tx.clanDragonContribution.findUnique({
      where: { dungeonId_characterId: { dungeonId, characterId: char.id } },
    });
    if (!contrib?.activeBattleAt || !contrib.battleEndsAt) {
      throw new Error('dragon_battle_not_active');
    }
    const now = new Date();
    if (contrib.battleEndsAt <= now) {
      await endContributionAttempt(tx, contrib.id, {
        entryCooldownSeconds: boss.entryCooldownSeconds,
      });
      throw new Error('dragon_battle_expired');
    }

    let st = parseDragonBattleState(contrib.battleStateJson);
    if (!st) throw new Error('dragon_battle_not_active');
    const nowMs = now.getTime();
    if (isDragonBattleStunned(st, nowMs)) throw new Error('dragon_battle_stunned');

    const clanHallBonus = await resolveClanHallBonusInTx(tx, char as CharacterRow);
    const vitals = computeCharacterVitalsBundle({
      row: char as CharacterRow,
      clanHallBonus,
    });
    const buffIds = persistableActiveBuffsFromJson(char.activeBuffsJson, nowMs).map(
      (b) => String(b.skillId)
    );
    st = applyDragonTicks(
      st,
      boss,
      vitals.combatWithClan.pDef,
      vitals.combatWithClan.mDef,
      buffIds,
      nowMs
    );
    if (st.playerHp <= 0) {
      await endContributionAttempt(tx, contrib.id, {
        death: true,
        entryCooldownSeconds: boss.entryCooldownSeconds,
      });
      await tx.character.update({
        where: { id: char.id },
        data: { hp: 0 },
      });
      throw new Error('dragon_battle_player_dead');
    }

    const atk = await rollDragonDungeonPlayerDamage(
      tx,
      char as CharacterRow,
      boss,
      actionRaw,
      st.playerMp
    );
    st.playerMp = atk.playerMpAfter;
    st = appendDragonBattleLog(st, atk.logLine);

    const hpBefore = dungeon.currentHp;
    const applied = BigInt(Math.min(atk.damage, Number(hpBefore)));
    const newHp = hpBefore - applied;
    await tx.clanDragonDungeon.update({
      where: { id: dungeonId },
      data: { currentHp: newHp < 0n ? 0n : newHp },
    });
    await tx.clanDragonContribution.update({
      where: { id: contrib.id },
      data: {
        damageDealt: { increment: applied },
        battleStateJson: st,
      },
    });

    dungeon = (await loadClanDragonDungeonById(tx, dungeonId))!;
    const freshContrib = await tx.clanDragonContribution.findUnique({
      where: { id: contrib.id },
    });

    if (dungeon.currentHp <= 0n) {
      const paid = await finalizeClanDragonDefeatIfNeeded(tx, dungeonId, boss, now);
      if (paid) {
        await postClanDragonJournalVictory(tx, char.clanId, char.id, boss.id);
      }
    }

    return buildBattleDto(
      dungeon,
      boss,
      st,
      freshContrib!.damageDealt,
      freshContrib!.battleEndsAt!,
      now
    );
  });
}

/** POST /game/dragon-dungeon/active/leave */
export async function leaveDragonBattleForUser(
  userId: string,
  rawDungeonId: unknown
): Promise<{ ok: true }> {
  const dungeonId = String(rawDungeonId ?? '').trim();
  if (!dungeonId) throw new Error('dragon_dungeon_forbidden');

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, clanId: true },
    });
    if (!char?.clanId) throw new Error('clan_required');
    const dungeon = await loadClanDragonDungeonById(tx, dungeonId);
    if (!dungeon || dungeon.clanId !== char.clanId) {
      throw new Error('dragon_dungeon_forbidden');
    }
    const bossId = parseDragonBossId(dungeon.dragonId);
    const boss = bossId ? getDragonBossConfig(bossId) : null;
    const contrib = await tx.clanDragonContribution.findUnique({
      where: { dungeonId_characterId: { dungeonId, characterId: char.id } },
    });
    if (!contrib?.activeBattleAt) return;
    const st = parseDragonBattleState(contrib.battleStateJson);
    if (st) {
      await tx.character.update({
        where: { id: char.id },
        data: { hp: Math.max(1, st.playerHp) },
      });
    }
    await endContributionAttempt(tx, contrib.id, {
      entryCooldownSeconds: boss?.entryCooldownSeconds ?? 14_400,
    });
  });
  return { ok: true };
}

/** GET /game/dragon-dungeon/active/sync?dungeonId= */
export async function syncDragonBattleForUser(
  userId: string,
  rawDungeonId: unknown
): Promise<DragonBattleDto & { nextEntryAt: string | null; defeatedAt: string | null }> {
  const { char, dungeon: initialDungeon, boss } = await loadBattleContext(
    userId,
    String(rawDungeonId ?? '').trim()
  );
  let dungeon = initialDungeon;
  const now = new Date();
  const contrib = await prisma.clanDragonContribution.findUnique({
    where: { dungeonId_characterId: { dungeonId: dungeon.id, characterId: char.id } },
  });

  if (contrib?.activeBattleAt && contrib.battleEndsAt) {
    await finalizeStaleContributionAttempt(
      prisma,
      contrib.id,
      boss.entryCooldownSeconds,
      now
    );
  }

  const freshContrib = await prisma.clanDragonContribution.findUnique({
    where: {
      dungeonId_characterId: { dungeonId: dungeon.id, characterId: char.id },
    },
  });
  dungeon = (await loadClanDragonDungeonById(prisma, dungeon.id))!;

  if (
    freshContrib?.activeBattleAt &&
    freshContrib.battleEndsAt &&
    freshContrib.battleEndsAt > now
  ) {
    let st = parseDragonBattleState(freshContrib.battleStateJson);
    if (st) {
      const clanHallBonus = await resolveClanHallBonusInTx(prisma, char);
      const vitals = computeCharacterVitalsBundle({ row: char, clanHallBonus });
      const nowMs = now.getTime();
      const buffIds = persistableActiveBuffsFromJson(char.activeBuffsJson, nowMs).map(
        (b) => String(b.skillId)
      );
      st = applyDragonTicks(
        st,
        boss,
        vitals.combatWithClan.pDef,
        vitals.combatWithClan.mDef,
        buffIds,
        nowMs
      );
      if (st.playerHp <= 0) {
        await prisma.$transaction(async (tx) => {
          await endContributionAttempt(tx, freshContrib.id, {
            death: true,
            entryCooldownSeconds: boss.entryCooldownSeconds,
          });
          await tx.character.update({ where: { id: char.id }, data: { hp: 0 } });
        });
      } else {
        await prisma.clanDragonContribution.update({
          where: { id: freshContrib.id },
          data: { battleStateJson: st },
        });
      }
      const dto = buildBattleDto(
        dungeon,
        boss,
        st,
        freshContrib.damageDealt,
        freshContrib.battleEndsAt,
        now
      );
      return {
        ...dto,
        nextEntryAt: freshContrib.nextEntryAt?.toISOString() ?? null,
        defeatedAt: dungeon.defeatedAt?.toISOString() ?? null,
      };
    }
  }

  const fallbackSt = emptyDragonBattleState(char.hp, char.maxHp, 0, 0, now.getTime());
  const dto = buildBattleDto(
    dungeon,
    boss,
    fallbackSt,
    freshContrib?.damageDealt ?? 0n,
    freshContrib?.battleEndsAt ?? now,
    now
  );
  return {
    ...dto,
    battleActive: false,
    nextEntryAt: freshContrib?.nextEntryAt?.toISOString() ?? null,
    defeatedAt: dungeon.defeatedAt?.toISOString() ?? null,
  };
}
