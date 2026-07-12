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
  combatOptsFromRow,
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { parseSkillsLearnedJson } from './skillLearnService.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { battleViewFromState, skillCooldownUiContextFromParts } from './battleServiceBattleUi.js';
import type { BattleView } from './battleServiceTypes.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function randomMobRetaliationWindowHitsLocal(): number {
  return 1 + Math.floor(Math.random() * 3);
}

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
  if (attackerRow.battleJson != null) throw new Error('already_in_battle');

  const targetRow = await tx.character.findFirst({
    where: { id: targetId },
  });
  if (!targetRow) throw new Error('pvp_target_unknown');
  if (targetRow.battleJson != null) throw new Error('pvp_target_in_battle');

  const atkBase = resolveMapMovement(applyPassiveHpRegen(attackerRow as CharacterRow));
  const tgtBase = resolveMapMovement(applyPassiveHpRegen(targetRow as CharacterRow));
  const distAtCommit = Math.hypot(
    atkBase.worldX - tgtBase.worldX,
    atkBase.worldY - tgtBase.worldY
  );
  if (distAtCommit > BATTLE_RANGE) {
    throw new Error('pvp_too_far');
  }

  const opp = opponentCombatFromRow(tgtBase as CharacterRow);
  const startLog = [
    'PvP-бій розпочато: [' + opp.name + '] (ур. ' + opp.effLv + ').',
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
    mobHitsUntilRetaliation: randomMobRetaliationWindowHitsLocal(),
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
  if (!result.ok) throw new GameConflictError();

  const row = result.character as CharacterRow;
  const snap = toSnapshot(row);
  const prof0 =
    typeof atkBase.l2Profession === 'string' && atkBase.l2Profession.trim()
      ? atkBase.l2Profession.trim()
      : 'human_fighter';
  const learned0 = parseSkillsLearnedJson(
    atkBase.skillsLearnedJson,
    prof0,
    atkBase.race,
    atkBase.classBranch
  );
  const view = battleViewFromState(
    spawnId,
    st,
    {
      name: opp.name,
      level: opp.effLv,
      aggressive: true,
      kind: 'aggressive',
    },
    effLv0,
    atkBase.race,
    atkBase.classBranch,
    learned0,
    prof0,
    parseInventory(atkBase.inventoryJson),
    persistableActiveBuffsFromJson(row.activeBuffsJson, Date.now()),
    parseSkillCooldowns(row.skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromParts(
      atkBase.classBranch,
      snap.castSpd,
      snap.pAtkSpd,
      snap.learnedBattleSkillsDetail
    )
  );
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
