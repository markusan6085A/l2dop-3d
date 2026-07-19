import { Prisma } from '@prisma/client';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { parseInventory } from '../data/inventory.js';
import { BATTLE_RANGE, type BattleJsonState } from '../domain/battle.js';
import {
  isPvpBattleJson,
  pvpSpawnIdForCharacter,
} from '../domain/battlePvpContext.js';
import type { PlayerCombatMode } from '../domain/playerCombatMode.js';
import { resolvePlayerCombatMode } from '../domain/playerCombatMode.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
} from '../domain/worldCombatState.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { resolveClanHallPassiveBonus } from '../domain/clanHall.js';
import { computeCharacterVitalsBundle } from './characterClanHallVitals.js';
import { prisma } from '../lib/prisma.js';
import { applyPassiveHpRegen, applyPassiveHpRegenPure } from './charPassiveRegen.js';
import {
  gameConflictFromMutation,
  combatOptsFromRow,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { parseSkillsLearnedJson } from './skillLearnService.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { isInPvpSafeZone } from '../domain/pvpSafeZones.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { battleViewFromState, skillCooldownUiContextFromRow } from './battleServiceBattleUi.js';
import type { BattleView } from './battleServiceTypes.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function opponentCombatFromRow(row: CharacterRow) {
  const effLv = levelFromTotalExp(row.exp);
  const inv = parseInventory(row.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row)
  );
  const vit = computeVitals(
    effLv,
    row.race,
    row.classBranch,
    combat.con,
    combat.men
  );
  const vitals = computeCharacterVitalsBundle({
    row,
    clanHallBonus: resolveClanHallPassiveBonus(row.clan ?? null),
  });
  const maxHp = vitals.maxHpChain.maxHpWithClanHall;
  const hp = vitals.displayHp;
  const maxCp = Math.max(0, Math.floor(vit.maxCp * combat.buffMaxCpMul));
  return {
    effLv,
    maxHp,
    hp,
    maxCp,
    pAtk: combat.pAtk,
    pDef: combat.pDef,
    mAtk: combat.mAtk,
    mDef: combat.mDef,
    evasion: combat.evasion,
    name: row.name,
    clanEmblemId: row.clan?.emblemId ?? null,
  };
}

/** Актуальні HP/макс цілі PvP з рядка персонажа (без пасивного регену під час активного PvP). */
export function resolvePvpTargetCombatFromRow(
  row: CharacterRow,
  opts?: { allowPassiveRegen?: boolean }
) {
  const allowPassiveRegen = opts?.allowPassiveRegen === true;
  const hp = allowPassiveRegen
    ? applyPassiveHpRegenPure(row).nextHp
    : Math.max(0, Math.floor(Number(row.hp) || 0));
  const opp = opponentCombatFromRow({
    ...row,
    hp,
  });
  opp.hp = hp;
  return opp;
}

/** Підтягнути HP суперника з БД у battleJson атакуючого (без revision++). */
export async function refreshPvpOpponentHpForCharacterInTx(
  tx: Prisma.TransactionClient,
  char: CharacterRow
): Promise<CharacterRow> {
  const bj = parseBattleJson(char.battleJson);
  if (!bj || !isPvpBattleJson(bj) || !bj.pvpTargetCharacterId) {
    return char;
  }
  const targetRow = await tx.character.findFirst({
    where: { id: bj.pvpTargetCharacterId },
    include: { clan: { select: { emblemId: true } } },
  });
  if (!targetRow) return char;

  const opp = resolvePvpTargetCombatFromRow(targetRow as CharacterRow, {
    allowPassiveRegen: false,
  });
  let oppCp = opp.maxCp;
  const tgtBj = parseBattleJson(targetRow.battleJson);
  if (
    tgtBj &&
    isPvpBattleJson(tgtBj) &&
    tgtBj.pvpTargetCharacterId === char.id &&
    typeof tgtBj.playerCp === 'number'
  ) {
    oppCp = Math.max(0, Math.floor(tgtBj.playerCp));
  }
  const oppMaxCp =
    tgtBj &&
    isPvpBattleJson(tgtBj) &&
    tgtBj.pvpTargetCharacterId === char.id &&
    typeof tgtBj.playerMaxCp === 'number'
      ? Math.max(0, Math.floor(tgtBj.playerMaxCp))
      : opp.maxCp;

  if (
    bj.mobHp === opp.hp &&
    bj.mobMaxHp === opp.maxHp &&
    (bj.mobCp ?? oppMaxCp) === oppCp &&
    (bj.mobMaxCp ?? oppMaxCp) === oppMaxCp
  ) {
    return char;
  }

  const nextBj: BattleJsonState = {
    ...bj,
    mobHp: opp.hp,
    mobMaxHp: opp.maxHp,
    mobCp: oppCp,
    mobMaxCp: oppMaxCp,
    mobPAtk: opp.pAtk,
    mobPDef: opp.pDef,
    mobMAtk: opp.mAtk,
    mobMDef: opp.mDef,
    mobEvasion: opp.evasion,
    pvpTargetName: opp.name,
    pvpTargetLevel: opp.effLv,
  };
  await persistCharacterFieldsInTx(tx, char.id, {
    battleJson: serializeBattleJsonForDb(nextBj),
  });
  const fresh = await tx.character.findUnique({ where: { id: char.id } });
  return (fresh as CharacterRow) ?? char;
}

function buildPvpBattleView(
  attackerRow: CharacterRow,
  st: BattleJsonState,
  opp: ReturnType<typeof opponentCombatFromRow>,
  snap: CharacterSnapshot
): BattleView {
  const effLv0 = levelFromTotalExp(attackerRow.exp);
  const prof0 =
    typeof attackerRow.l2Profession === 'string' && attackerRow.l2Profession.trim()
      ? attackerRow.l2Profession.trim()
      : 'human_fighter';
  const learned0 = parseSkillsLearnedJson(
    attackerRow.skillsLearnedJson,
    prof0,
    attackerRow.race,
    attackerRow.classBranch
  );
  return battleViewFromState(
    st.spawnId,
    st,
    {
      name: opp.name,
      level: opp.effLv,
      aggressive: true,
      kind: 'aggressive',
      clanEmblemId: opp.clanEmblemId,
    },
    effLv0,
    attackerRow.race,
    attackerRow.classBranch,
    learned0,
    prof0,
    parseInventory(attackerRow.inventoryJson),
    persistableActiveBuffsFromJson(attackerRow.activeBuffsJson, Date.now()),
    parseSkillCooldowns(attackerRow.skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromRow(
      attackerRow,
      effLv0,
      snap.learnedBattleSkillsDetail
    )
  );
}

export async function markAggressorVictimFoughtBackInTx(
  tx: Prisma.TransactionClient,
  aggressorId: string,
  defenderId: string
): Promise<void> {
  const aggressor = await tx.character.findFirst({
    where: { id: aggressorId },
  });
  if (!aggressor) return;
  const bj = parseBattleJson(aggressor.battleJson);
  if (!bj || !isPvpBattleJson(bj) || bj.pvpTargetCharacterId !== defenderId) return;
  await persistCharacterFieldsInTx(tx, aggressorId, {
    battleJson: serializeBattleJsonForDb({
      ...bj,
      pvpVictimFoughtBack: true,
    }),
  });
}

export type PlayerPvpStartCtx = {
  playerCombatMode: PlayerCombatMode;
  siegeId?: string;
  siegeCityId?: string;
  skipWorldGeoChecks?: boolean;
};

function pvpStartLogLine(
  mode: PlayerCombatMode,
  defenderCounter: boolean,
  opp: ReturnType<typeof opponentCombatFromRow>
): string {
  const who = '[' + opp.name + '] (ур. ' + opp.effLv + ').';
  if (mode === 'siege') {
    return defenderCounter
      ? 'Відсіч на облозі: ' + who
      : 'PvP на облозі розпочато: ' + who;
  }
  return defenderCounter
    ? 'Відсіч у PvP: ' + who
    : 'PvP-бій розпочато: ' + who;
}

/** Спільний старт PvP (world / siege / …) — однакові формули, різні правила режиму. */
export async function commitPlayerPvpBattleStartInTx(
  tx: Prisma.TransactionClient,
  args: {
    attackerRow: CharacterRow;
    targetRow: CharacterRow;
    expectedRevision: number;
    ctx: PlayerPvpStartCtx;
    defenderCounter?: boolean;
  }
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  const { attackerRow, targetRow, expectedRevision, ctx } = args;
  const defenderCounter = args.defenderCounter === true;
  const targetId = targetRow.id;
  const atkBase = resolveMapMovement(
    applyPassiveHpRegen(attackerRow as CharacterRow)
  );
  const tgtBase = resolveMapMovement(
    applyPassiveHpRegen(targetRow as CharacterRow)
  );

  if (!ctx.skipWorldGeoChecks) {
    const distAtCommit = Math.hypot(
      atkBase.worldX - tgtBase.worldX,
      atkBase.worldY - tgtBase.worldY
    );
    if (distAtCommit > BATTLE_RANGE) {
      throw new Error('pvp_too_far');
    }
    if (isInPvpSafeZone(tgtBase.worldX, tgtBase.worldY)) {
      throw new Error('pvp_target_safe');
    }
    if (isInPvpSafeZone(atkBase.worldX, atkBase.worldY)) {
      throw new Error('pvp_attacker_safe');
    }
  }

  const opp = resolvePvpTargetCombatFromRow(tgtBase as CharacterRow, {
    allowPassiveRegen: false,
  });
  const startLog = [
    pvpStartLogLine(ctx.playerCombatMode, defenderCounter, opp),
  ];

  const inv0 = parseInventory(atkBase.inventoryJson);
  const effLv0 = levelFromTotalExp(atkBase.exp);
  const combat0 = computeCombatStats(
    effLv0,
    atkBase.race,
    atkBase.classBranch,
    inv0,
    combatOptsFromRow(atkBase as CharacterRow)
  );
  const vit0 = computeVitals(
    effLv0,
    atkBase.race,
    atkBase.classBranch,
    combat0.con,
    combat0.men
  );
  const maxMp0 = effectiveMaxMpWithJewelFlat(vit0.maxMp, combat0);
  const wTick = tickWorldCombatState(
    parseWorldCombatState(atkBase.worldCombatStateJson),
    maxMp0,
    Date.now(),
    combat0.regenMp
  );

  const nowStartMs = Date.now();
  const spawnId = pvpSpawnIdForCharacter(targetId);
  const atkMaxCp = Math.max(0, Math.floor(vit0.maxCp * combat0.buffMaxCpMul));
  const st: BattleJsonState = {
    spawnId,
    battleMode: 'pvp',
    playerCombatMode: ctx.playerCombatMode,
    ...(ctx.siegeId ? { siegeId: ctx.siegeId } : {}),
    ...(ctx.siegeCityId ? { siegeCityId: ctx.siegeCityId } : {}),
    pvpTargetCharacterId: targetId,
    pvpTargetName: opp.name,
    pvpTargetLevel: opp.effLv,
    pvpIsAggressor: !defenderCounter,
    mobHp: opp.hp,
    mobMaxHp: opp.maxHp,
    mobCp: opp.maxCp,
    mobMaxCp: opp.maxCp,
    playerCp: atkMaxCp,
    playerMaxCp: atkMaxCp,
    mobPAtk: opp.pAtk,
    mobPDef: opp.pDef,
    mobMAtk: opp.mAtk,
    mobMDef: opp.mDef,
    mobEvasion: opp.evasion,
    log: startLog,
    battleVersion: 1,
    lastLogSeq: startLog.length,
    playerMp: wTick ? wTick.playerMp : maxMp0,
    lastRegenTickMs: nowStartMs,
    lastPlayerAttackAtMs: nowStartMs,
  };
  if (wTick?.battleMods) st.battleMods = wTick.battleMods;
  if (
    wTick?.battleModsExpiresAtMsBySkillId &&
    Object.keys(wTick.battleModsExpiresAtMsBySkillId).length > 0
  ) {
    st.battleModsExpiresAtMsBySkillId = {
      ...wTick.battleModsExpiresAtMsBySkillId,
    };
  }

  const freezeX = atkBase.worldX;
  const freezeY = atkBase.worldY;
  const result = await mutateCharacterWithRevision(
    tx,
    attackerRow.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: atkBase.hp,
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
  const snap = toSnapshot(row);
  const view = buildPvpBattleView(row, st, opp, snap);
  return { character: snap, battle: view };
}

export async function resumePlayerPvpBattleInTx(
  tx: Prisma.TransactionClient,
  attackerRow: CharacterRow,
  targetId: string,
  mode: PlayerCombatMode
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  const refreshed = await refreshPvpOpponentHpForCharacterInTx(
    tx,
    attackerRow as CharacterRow
  );
  const st = parseBattleJson(refreshed.battleJson);
  if (!st) throw new Error('battle_none');
  if (resolvePlayerCombatMode(st) !== mode) {
    throw new Error('already_in_battle');
  }
  const targetRow = await tx.character.findFirst({
    where: { id: targetId },
    include: { clan: { select: { emblemId: true } } },
  });
  if (!targetRow) throw new Error('pvp_target_unknown');
  const opp = resolvePvpTargetCombatFromRow(targetRow as CharacterRow, {
    allowPassiveRegen: false,
  });
  const snap = toSnapshot(refreshed);
  return {
    character: snap,
    battle: buildPvpBattleView(refreshed, st, opp, snap),
  };
}

export async function startPvpBattleInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  targetCharacterId: string,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  const targetId = String(targetCharacterId || '').trim();
  if (!targetId) throw new Error('pvp_target_unknown');

  const attackerRow = await tx.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!attackerRow) throw new Error('no_character');
  if (attackerRow.id === targetId) throw new Error('pvp_self');

  const existingBj = parseBattleJson(attackerRow.battleJson);
  if (existingBj && isPvpBattleJson(existingBj)) {
    if (
      existingBj.pvpTargetCharacterId === targetId &&
      resolvePlayerCombatMode(existingBj) === 'world'
    ) {
      return resumePlayerPvpBattleInTx(
        tx,
        attackerRow as CharacterRow,
        targetId,
        'world'
      );
    }
    throw new Error('already_in_battle');
  }
  if (attackerRow.battleJson != null) throw new Error('already_in_battle');

  const targetRow = await tx.character.findFirst({
    where: { id: targetId },
    include: { clan: { select: { emblemId: true } } },
  });
  if (!targetRow) throw new Error('pvp_target_unknown');

  const tgtBj = parseBattleJson(targetRow.battleJson);
  let defenderCounter = false;
  if (tgtBj && isPvpBattleJson(tgtBj)) {
    if (
      tgtBj.pvpTargetCharacterId === attackerRow.id &&
      resolvePlayerCombatMode(tgtBj) === 'world'
    ) {
      defenderCounter = true;
      await markAggressorVictimFoughtBackInTx(
        tx,
        targetId,
        attackerRow.id
      );
    } else {
      throw new Error('pvp_target_busy');
    }
  }

  return commitPlayerPvpBattleStartInTx(tx, {
    attackerRow: attackerRow as CharacterRow,
    targetRow: targetRow as CharacterRow,
    expectedRevision,
    ctx: { playerCombatMode: 'world' },
    defenderCounter,
  });
}

export async function startPvpBattle(
  userId: string,
  targetCharacterId: string,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  return prisma.$transaction(async (tx) =>
    startPvpBattleInTx(tx, userId, targetCharacterId, expectedRevision)
  );
}
