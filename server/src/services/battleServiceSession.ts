import { Prisma } from '@prisma/client';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';
import { mobMaxCpFromMobMaxHp } from '../data/wrathSkillConstants.js';
import {
  BATTLE_RANGE,
  jsonFiniteNum,
  type BattleJsonState,
  mobCombatFromSpawn,
} from '../domain/battle.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
  worldCombatStateFromBattleJson,
} from '../domain/worldCombatState.js';
import { prisma } from '../lib/prisma.js';
import {
  combatOptsFromRow,
  ensureSanitizedSkillsLearnedRow,
  ensureMysticStarterSkillsRow,
  GameConflictError,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import {
  computeCombatStats,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { parseInventory } from '../data/inventory.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { parseSkillsLearnedJson } from './skillLearnService.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { battleViewFromState, skillCooldownUiContextFromParts } from './battleServiceBattleUi.js';
import type { BattleView } from './battleServiceTypes.js';
import { applyPassiveAndMove } from './battleServiceApplyPassive.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import {
  mergeMobSpawnHpEntry,
  mobSpawnHpFromBattleJson,
  parseMobSpawnHpState,
  resolveMobHpAtSpawnStart,
  serializeMobSpawnHpState,
} from '../domain/mobSpawnHpState.js';
import {
  isMobSpawnOnRespawn,
  isRegularMobRespawnKind,
} from '../domain/mobSpawnRespawn.js';

function randomMobRetaliationWindowHits(): number {
  return 1 + Math.floor(Math.random() * 3);
}


export async function startBattleInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  spawnId: string,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  const spawn = getWorldSpawnById(spawnId);
  if (!spawn) {
    throw new Error('battle_spawn_unknown');
  }

  const mc = mobCombatFromSpawn(spawn);
  const startLog = [
    'Бій розпочато: [' + spawn.name + '] (ур. ' + spawn.level + ').',
  ];

  const char = await tx.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!char) throw new Error('no_character');
  const cr0 = char as CharacterRow;
  const base = resolveMapMovement(applyPassiveHpRegen(cr0));
  const distAtCommit = Math.hypot(
    base.worldX - spawn.worldX,
    base.worldY - spawn.worldY
  );
  if (distAtCommit > BATTLE_RANGE) {
    throw new Error('battle_too_far');
  }
  const inv0 = parseInventory(base.inventoryJson);
  const effLv0 = levelFromTotalExp(base.exp);
  const combat0 = computeCombatStats(
    effLv0,
    base.race,
    base.classBranch,
    inv0,
    combatOptsFromRow(base)
  );
  const vit0 = computeVitals(
    effLv0,
    base.race,
    base.classBranch,
    combat0.con,
    combat0.men
  );
  const maxMp0 = effectiveMaxMpWithJewelFlat(vit0.maxMp, combat0);

  const wTick = tickWorldCombatState(
    parseWorldCombatState(base.worldCombatStateJson),
    maxMp0,
    Date.now(),
    combat0.regenMp
  );

  const mobMaxCp0 = mobMaxCpFromMobMaxHp(mc.maxHp);
  const nowStartMs = Date.now();
  const spawnHpState = parseMobSpawnHpState(base.mobSpawnHpJson, nowStartMs);
  if (
    isRegularMobRespawnKind(spawn.kind) &&
    isMobSpawnOnRespawn(spawnHpState, spawnId, nowStartMs)
  ) {
    throw new Error('mob_on_respawn');
  }
  const mobHpStart = resolveMobHpAtSpawnStart(
    spawnHpState,
    spawnId,
    mc.maxHp
  );
  if (mobHpStart < mc.maxHp) {
    startLog.push(
      'Моб ще поранений: HP ' + mobHpStart + ' / ' + mc.maxHp + '.'
    );
  }
  const mobCpStart =
    mobHpStart >= mc.maxHp
      ? mobMaxCp0
      : Math.max(
          0,
          Math.min(
            mobMaxCp0,
            Math.floor((mobMaxCp0 * mobHpStart) / mc.maxHp)
          )
        );
  const st: BattleJsonState = {
    spawnId,
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
    playerMp: wTick ? wTick.playerMp : maxMp0,
    lastRegenTickMs: nowStartMs,
    lastPlayerAttackAtMs: nowStartMs,
    mobHitsUntilRetaliation: randomMobRetaliationWindowHits(),
  };
  if (wTick?.battleMods) {
    st.battleMods = wTick.battleMods;
  }
  if (
    wTick?.battleModsExpiresAtMsBySkillId &&
    Object.keys(wTick.battleModsExpiresAtMsBySkillId).length > 0
  ) {
    st.battleModsExpiresAtMsBySkillId = {
      ...wTick.battleModsExpiresAtMsBySkillId,
    };
  }
  if (
    typeof wTick?.sonicCharges === 'number' &&
    wTick.sonicCharges > 0
  ) {
    st.sonicCharges = Math.floor(wTick.sonicCharges);
  }
  if (
    typeof wTick?.maxSonicCharges === 'number' &&
    wTick.maxSonicCharges > 0
  ) {
    st.maxSonicCharges = Math.floor(wTick.maxSonicCharges);
  }
  const wcSync = wTick?.battleMods
    ? jsonFiniteNum(wTick.battleMods.warCryPatkMul)
    : undefined;
  if (wcSync !== undefined && wcSync > 1) {
    st.warCryPatkMul = wcSync;
  }

  const freezeX = base.worldX;
  const freezeY = base.worldY;
  const result = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: base.hp,
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
  const crSt = base;
  const prof0 =
    typeof crSt.l2Profession === 'string' && crSt.l2Profession.trim()
      ? crSt.l2Profession.trim()
      : 'human_fighter';
  const learned0 = parseSkillsLearnedJson(
    base.skillsLearnedJson,
    prof0,
    base.race,
    base.classBranch
  );
  const view = battleViewFromState(
    spawnId,
    st,
    {
      name: spawn.name,
      level: spawn.level,
      aggressive: spawn.aggressive,
      kind: spawn.kind,
    },
    effLv0,
    base.race,
    base.classBranch,
    learned0,
    prof0,
    parseInventory(base.inventoryJson),
    persistableActiveBuffsFromJson(row.activeBuffsJson, Date.now()),
    parseSkillCooldowns(row.skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromParts(
      base.classBranch,
      snap.castSpd,
      snap.pAtkSpd,
      snap.learnedBattleSkillsDetail
    )
  );
  return { character: snap, battle: view };
}

export async function startBattle(
  userId: string,
  spawnId: string,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  return prisma.$transaction(async (tx) =>
    startBattleInTx(tx, userId, spawnId, expectedRevision)
  );
}

export async function getBattleState(
  userId: string
): Promise<{ character: CharacterSnapshot; battle: BattleView | null } | null> {
  let row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) return null;
  row = (await ensureSanitizedSkillsLearnedRow(
    row as CharacterRow
  )) as CharacterRow;
  row = (await ensureMysticStarterSkillsRow(
    row as CharacterRow
  )) as CharacterRow;
  row = (await applyPassiveAndMove(row as CharacterRow)) as CharacterRow;
  const snap = toSnapshot(row as CharacterRow);
  const bj = parseBattleJson((row as CharacterRow).battleJson);
  if (!bj) return { character: snap, battle: null };
  const spawn = getWorldSpawnById(bj.spawnId);
  if (!spawn) return { character: snap, battle: null };
  const cr = row as CharacterRow;
  const prof =
    typeof cr.l2Profession === 'string' && cr.l2Profession.trim()
      ? cr.l2Profession.trim()
      : 'human_fighter';
  const learned = parseSkillsLearnedJson(
    (row as CharacterRow).skillsLearnedJson,
    prof,
    row.race,
    row.classBranch
  );
  const view = battleViewFromState(
    bj.spawnId,
    bj,
    {
      name: spawn.name,
      level: spawn.level,
      aggressive: spawn.aggressive,
      kind: spawn.kind,
    },
    snap.level,
    row.race,
    row.classBranch,
    learned,
    prof,
    snap.inventory,
    persistableActiveBuffsFromJson(
      (row as CharacterRow).activeBuffsJson,
      Date.now()
    ),
    parseSkillCooldowns((row as CharacterRow).skillCooldownsJson, Date.now()),
    skillCooldownUiContextFromParts(
      row.classBranch,
      snap.castSpd,
      snap.pAtkSpd,
      snap.learnedBattleSkillsDetail
    )
  );
  return { character: snap, battle: view };
}

export async function leaveBattle(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const cr = char as CharacterRow;
    const bj = parseBattleJson(cr.battleJson);
    const invL = parseInventory(cr.inventoryJson);
    const effLvL = levelFromTotalExp(char.exp);
    const combatL = computeCombatStats(
      effLvL,
      char.race,
      char.classBranch,
      invL,
      combatOptsFromRow(cr)
    );
    const vitL = computeVitals(
      effLvL,
      char.race,
      char.classBranch,
      combatL.con,
      combatL.men
    );
    const maxMpL = effectiveMaxMpWithJewelFlat(vitL.maxMp, combatL);
    const worldLeave =
      bj != null ? worldCombatStateFromBattleJson(bj, maxMpL, Date.now()) : null;

    /** Якщо бою вже немає (перемога очистила battleJson), не затирати світовий стан — там лишаються соски/заряди між боями. */
    let nextWorldJson: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      Prisma.JsonNull;
    if (worldLeave != null) {
      nextWorldJson = JSON.parse(JSON.stringify(worldLeave)) as Prisma.InputJsonValue;
    } else if (
      cr.worldCombatStateJson != null &&
      typeof cr.worldCombatStateJson === 'object'
    ) {
      nextWorldJson = cr.worldCombatStateJson as Prisma.InputJsonValue;
    }

    let nextMobSpawnHpJson: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      serializeMobSpawnHpState(parseMobSpawnHpState(cr.mobSpawnHpJson));
    const hpSnap = mobSpawnHpFromBattleJson(bj);
    if (hpSnap) {
      const merged = mergeMobSpawnHpEntry(
        parseMobSpawnHpState(cr.mobSpawnHpJson),
        hpSnap.spawnId,
        hpSnap.mobHp,
        hpSnap.mobMaxHp
      );
      nextMobSpawnHpJson = serializeMobSpawnHpState(merged);
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      () => ({
        changed: true,
        data: {
          battleJson: Prisma.JsonNull,
          worldCombatStateJson: nextWorldJson,
          mobSpawnHpJson: nextMobSpawnHpJson,
        },
      })
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}
