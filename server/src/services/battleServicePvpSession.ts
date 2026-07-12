import { Prisma } from '@prisma/client';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
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
import {
  parseWorldCombatState,
  tickWorldCombatState,
} from '../domain/worldCombatState.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { prisma } from '../lib/prisma.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
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
import { battleViewFromState, skillCooldownUiContextFromParts } from './battleServiceBattleUi.js';
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
  const maxHp = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const hp = Math.max(0, Math.min(maxHp, row.hp));
  return {
    effLv,
    maxHp,
    hp,
    pAtk: combat.pAtk,
    pDef: combat.pDef,
    mAtk: combat.mAtk,
    mDef: combat.mDef,
    evasion: combat.evasion,
    name: row.name,
  };
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
    },
    effLv0,
    attackerRow.race,
    attackerRow.classBranch,
    learned0,
    prof0,
    parseInventory(attackerRow.inventoryJson),
    persistableActiveBuffsFromJson(attackerRow.activeBuffsJson, Date.now()),
    parseSkillCooldowns(attackerRow.skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromParts(
      attackerRow.classBranch,
      snap.castSpd,
      snap.pAtkSpd,
      snap.learnedBattleSkillsDetail
    )
  );
}

async function markAggressorVictimFoughtBackInTx(
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
    if (existingBj.pvpTargetCharacterId === targetId) {
      const atkBase = resolveMapMovement(
        applyPassiveHpRegen(attackerRow as CharacterRow)
      );
      const targetRow = await tx.character.findFirst({
        where: { id: targetId },
      });
      if (!targetRow) throw new Error('pvp_target_unknown');
      const opp = opponentCombatFromRow(targetRow as CharacterRow);
      const snap = toSnapshot(atkBase as CharacterRow);
      const st = {
        ...existingBj,
        mobHp: Math.max(0, Math.min(opp.maxHp, targetRow.hp)),
        mobMaxHp: opp.maxHp,
      };
      return {
        character: snap,
        battle: buildPvpBattleView(atkBase as CharacterRow, st, opp, snap),
      };
    }
    throw new Error('already_in_battle');
  }
  if (attackerRow.battleJson != null) throw new Error('already_in_battle');

  const targetRow = await tx.character.findFirst({
    where: { id: targetId },
  });
  if (!targetRow) throw new Error('pvp_target_unknown');

  const tgtBj = parseBattleJson(targetRow.battleJson);
  let defenderCounter = false;
  if (tgtBj && isPvpBattleJson(tgtBj)) {
    if (tgtBj.pvpTargetCharacterId === attackerRow.id) {
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

  const atkBase = resolveMapMovement(applyPassiveHpRegen(attackerRow as CharacterRow));
  const tgtBase = resolveMapMovement(applyPassiveHpRegen(targetRow as CharacterRow));
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

  const opp = opponentCombatFromRow(tgtBase as CharacterRow);
  const startLog = [
    defenderCounter
      ? 'Відсіч у PvP: [' + opp.name + '] (ур. ' + opp.effLv + ').'
      : 'PvP-бій розпочато: [' + opp.name + '] (ур. ' + opp.effLv + ').',
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
  const st: BattleJsonState = {
    spawnId,
    battleMode: 'pvp',
    pvpTargetCharacterId: targetId,
    pvpTargetName: opp.name,
    pvpTargetLevel: opp.effLv,
    pvpIsAggressor: !defenderCounter,
    mobHp: opp.hp,
    mobMaxHp: opp.maxHp,
    mobPAtk: opp.pAtk,
    mobPDef: opp.pDef,
    mobMAtk: opp.mAtk,
    mobMDef: opp.mDef,
    mobEvasion: opp.evasion,
    log: startLog,
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

export async function startPvpBattle(
  userId: string,
  targetCharacterId: string,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  return prisma.$transaction(async (tx) =>
    startPvpBattleInTx(tx, userId, targetCharacterId, expectedRevision)
  );
}
