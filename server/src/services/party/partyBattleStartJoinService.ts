import { Prisma } from '@prisma/client';
import type { MapWorldSpawn } from '../../data/mapWorldSpawns.js';
import { mobMaxCpFromMobMaxHp } from '../../data/wrathSkillConstants.js';
import {
  mobCombatFromSpawn,
  type BattleJsonState,
} from '../../domain/battle.js';
import { applyRiposteReflectToBattleMods } from '../../domain/riposteStance.js';
import { isWithinMobBattleRange } from '../../domain/mapNearbyRadius.js';
import { jsonFiniteNum } from '../../domain/battle.js';
import {
  canStartPartyBattleViaRoute,
  isPartyBattleDungeonEnabled,
  isPartyBattleEngineEnabled,
  isPartyBattleRewardDistributionReady,
  throwIfPartyBattleRouteBlocked,
} from '../../domain/partyBattleFlags.js';
import type { MapSpawnKind } from '../../data/mapWorldSpawns.js';
import { isSharedWorldBossKind } from '../../domain/worldBossSession.js';
import {
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from '../charService.js';
import { ensureClanHallOnRow } from '../charClientSnapshot.js';
import { computeCombatStats, effectiveMaxMpWithJewelFlat } from '../../data/l2dopCombatFormulas.js';
import { parseInventory } from '../../data/inventory.js';
import { computeVitals } from '../../data/l2dopVitals.js';
import { levelFromTotalExp } from '../../data/l2dopExpgain.js';
import { parseSkillsLearnedJson } from '../skillLearnService.js';
import { serializeBattleJsonForDb } from '../battleServiceBattleBuffs.js';
import { battleViewFromState, skillCooldownUiContextFromRow } from '../battleServiceBattleUi.js';
import type { BattleView } from '../battleServiceTypes.js';
import { persistableActiveBuffsFromJson } from '../../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../../data/skillCooldowns.js';
import { mutateCharacterWithRevision } from '../characterMutation.js';
import { lockPartyForUpdateInTx } from './partyLock.js';
import {
  createActivePartyBattleSessionInTx,
  findActivePartyBattleSessionByPartyIdInTx,
  joinPartyBattleParticipantInTx,
} from './partyBattleSessionService.js';
import type { Prisma as PrismaTypes } from '@prisma/client';

type Tx = PrismaTypes.TransactionClient;

function randomMobRetaliationWindowHits(): number {
  return 1 + Math.floor(Math.random() * 3);
}

export type PartyBattleStartJoinArgs = {
  userId: string;
  char: CharacterRow;
  spawn: MapWorldSpawn;
  expectedRevision: number;
  partyId: string;
  wTick: ReturnType<
    typeof import('../../domain/worldCombatState.js').tickWorldCombatState
  > | null;
  nowStartMs: number;
};

/**
 * Party → Session → Character. Regular world PvE only (caller перевіряє RB/dungeon).
 */
export async function startOrJoinPartyBattleInTx(
  tx: Tx,
  args: PartyBattleStartJoinArgs
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  throwIfPartyBattleRouteBlocked();

  const mc = mobCombatFromSpawn(args.spawn);
  const pos = args.char;
  if (
    !isWithinMobBattleRange(
      { worldX: pos.worldX, worldY: pos.worldY },
      { worldX: args.spawn.worldX, worldY: args.spawn.worldY }
    )
  ) {
    throw new Error('battle_too_far');
  }

  const lockedParty = await lockPartyForUpdateInTx(tx, args.partyId);
  if (!lockedParty) throw new Error('party_not_found');

  let session = await findActivePartyBattleSessionByPartyIdInTx(tx, args.partyId);
  if (!session) {
    try {
      session = await createActivePartyBattleSessionInTx(tx, {
        partyId: args.partyId,
        spawnId: args.spawn.id,
        canonicalMobTemplateId: args.spawn.templateId ?? args.spawn.id,
        playfield: 'world',
        mobWorldX: args.spawn.worldX,
        mobWorldY: args.spawn.worldY,
        mobMaxHp: mc.maxHp,
        starterCharacterId: args.char.id,
        nowMs: args.nowStartMs,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'party_battle_session_already_active') {
        session = await findActivePartyBattleSessionByPartyIdInTx(tx, args.partyId);
        if (session && session.spawnId === args.spawn.id) {
          await joinPartyBattleParticipantInTx(tx, {
            sessionId: session.id,
            characterId: args.char.id,
            nowMs: args.nowStartMs,
          });
        }
      }
      if (!session) throw err;
    }
  } else if (session.spawnId !== args.spawn.id) {
    throw new Error('party_battle_wrong_spawn');
  } else {
    await joinPartyBattleParticipantInTx(tx, {
      sessionId: session.id,
      characterId: args.char.id,
      nowMs: args.nowStartMs,
    });
    session = await tx.partyBattleSession.findUniqueOrThrow({
      where: { id: session.id },
    });
  }

  const mobHpStart = session.mobHp;
  const mobMaxCp0 = mobMaxCpFromMobMaxHp(mc.maxHp);
  const startLog = [
    'Бій розпочато: [' + args.spawn.name + '] (ур. ' + args.spawn.level + ').',
    'Паті-бій: спільне HP монстра.',
  ];

  const inv0 = parseInventory(args.char.inventoryJson);
  const effLv0 = levelFromTotalExp(args.char.exp);
  const combat0 = computeCombatStats(
    effLv0,
    args.char.race,
    args.char.classBranch,
    inv0,
    combatOptsFromRow(args.char)
  );
  const vit0 = computeVitals(
    effLv0,
    args.char.race,
    args.char.classBranch,
    combat0.con,
    combat0.men
  );
  const maxMp0 = effectiveMaxMpWithJewelFlat(vit0.maxMp, combat0);

  const mobCpStart =
    mobHpStart >= mc.maxHp
      ? mobMaxCp0
      : Math.max(
          0,
          Math.min(mobMaxCp0, Math.floor((mobMaxCp0 * mobHpStart) / mc.maxHp))
        );

  const st: BattleJsonState = {
    spawnId: args.spawn.id,
    partyBattleId: session.id,
    mobHp: mobHpStart,
    mobMaxHp: mc.maxHp,
    mobCp: mobCpStart,
    mobMaxCp: mobMaxCp0,
    mobPAtk: mc.pAtk,
    mobPDef: mc.pDef,
    mobMAtk: mc.mAtk,
    mobMDef: mc.mDef,
    mobEvasion: mc.evasion,
    log: startLog,
    battleVersion: session.battleVersion,
    lastLogSeq: startLog.length,
    playerMp: args.wTick ? args.wTick.playerMp : maxMp0,
    lastRegenTickMs: args.nowStartMs,
    lastPlayerAttackAtMs: args.nowStartMs,
    mobHitsUntilRetaliation: randomMobRetaliationWindowHits(),
  };

  if (args.wTick?.battleMods) {
    const bm = { ...args.wTick.battleMods };
    applyRiposteReflectToBattleMods(bm);
    st.battleMods = bm;
  }
  if (
    args.wTick?.battleModsExpiresAtMsBySkillId &&
    Object.keys(args.wTick.battleModsExpiresAtMsBySkillId).length > 0
  ) {
    st.battleModsExpiresAtMsBySkillId = {
      ...args.wTick.battleModsExpiresAtMsBySkillId,
    };
  }
  if (typeof args.wTick?.sonicCharges === 'number' && args.wTick.sonicCharges > 0) {
    st.sonicCharges = Math.floor(args.wTick.sonicCharges);
  }
  if (
    typeof args.wTick?.maxSonicCharges === 'number' &&
    args.wTick.maxSonicCharges > 0
  ) {
    st.maxSonicCharges = Math.floor(args.wTick.maxSonicCharges);
  }
  const wcSync = args.wTick?.battleMods
    ? jsonFiniteNum(args.wTick.battleMods.warCryPatkMul)
    : undefined;
  if (wcSync !== undefined && wcSync > 1) {
    st.warCryPatkMul = wcSync;
  }

  const freezeX = args.char.worldX;
  const freezeY = args.char.worldY;
  const result = await mutateCharacterWithRevision(
    tx,
    args.char.id,
    args.expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: args.char.hp,
        worldX: freezeX,
        worldY: freezeY,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: freezeX,
        moveFromY: freezeY,
        battleJson: serializeBattleJsonForDb(st),
        worldCombatStateJson: Prisma.JsonNull,
      },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);

  const row = result.character as CharacterRow;
  const rowReady = await ensureClanHallOnRow(row, tx);
  const snap = toSnapshot(rowReady);
  const prof0 =
    typeof args.char.l2Profession === 'string' && args.char.l2Profession.trim()
      ? args.char.l2Profession.trim()
      : 'human_fighter';
  const learned0 = parseSkillsLearnedJson(
    args.char.skillsLearnedJson,
    prof0,
    args.char.race,
    args.char.classBranch
  );
  const view = battleViewFromState(
    args.spawn.id,
    st,
    {
      name: args.spawn.name,
      level: args.spawn.level,
      aggressive: args.spawn.aggressive,
      kind: args.spawn.kind,
    },
    effLv0,
    args.char.race,
    args.char.classBranch,
    learned0,
    prof0,
    inv0,
    persistableActiveBuffsFromJson(row.activeBuffsJson, Date.now()),
    parseSkillCooldowns(row.skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromRow(args.char, effLv0, snap.learnedBattleSkillsDetail)
  );
  return { character: snap, battle: view };
}

/** Чи цей start має йти через party battle (не викликає party tables якщо false). */
export async function shouldStartPartyBattleInTx(
  tx: Tx,
  characterId: string,
  spawnKind: string,
  isDungeonMob: boolean,
  isDungeonRaidMob?: boolean
): Promise<{ partyId: string; dungeon: boolean } | null> {
  if (!isPartyBattleEngineEnabled()) return null;
  if (isSharedWorldBossKind(spawnKind as MapSpawnKind)) return null;

  const membership = await tx.partyMember.findUnique({
    where: { characterId },
    select: { partyId: true },
  });
  if (!membership) return null;

  if (!canStartPartyBattleViaRoute()) {
    throwIfPartyBattleRouteBlocked();
  }

  if (isDungeonMob) {
    if (!isPartyBattleDungeonEnabled()) return null;
    if (isDungeonRaidMob) return null;
    return { partyId: membership.partyId, dungeon: true };
  }

  /** Stage C: world open-field — shared session + reward split (не solo на кожного). */
  if (!isPartyBattleRewardDistributionReady()) return null;
  return { partyId: membership.partyId, dungeon: false };
}
