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
import { battleViewFromState } from './battleServiceBattleUi.js';
import type { BattleView } from './battleServiceTypes.js';
import { applyPassiveAndMove } from './battleServiceApplyPassive.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';

function randomMobRetaliationWindowHits(): number {
  return 1 + Math.floor(Math.random() * 3);
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
    parseSkillCooldowns((row as CharacterRow).skillCooldownsJson, Date.now())
  );
  return { character: snap, battle: view };
}

export async function startBattle(
  userId: string,
  spawnId: string,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  const spawn = getWorldSpawnById(spawnId);
  if (!spawn) {
    throw new Error('battle_spawn_unknown');
  }

  let pre = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!pre) throw new Error('no_character');
  pre = (await applyPassiveAndMove(pre as CharacterRow)) as CharacterRow;

  const dist = Math.hypot(
    pre.worldX - spawn.worldX,
    pre.worldY - spawn.worldY
  );
  if (dist > BATTLE_RANGE) {
    throw new Error('battle_too_far');
  }

  const mc = mobCombatFromSpawn(spawn);
  const startLog = [
    'Бій розпочато: [' + spawn.name + '] (ур. ' + spawn.level + ').',
  ];

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const inv0 = parseInventory((char as CharacterRow).inventoryJson);
    const effLv0 = levelFromTotalExp(char.exp);
    const cr0 = char as CharacterRow;
    const combat0 = computeCombatStats(
      effLv0,
      char.race,
      char.classBranch,
      inv0,
      combatOptsFromRow(cr0)
    );
    const vit0 = computeVitals(
      effLv0,
      char.race,
      char.classBranch,
      combat0.con,
      combat0.men
    );
    const maxMp0 = effectiveMaxMpWithJewelFlat(vit0.maxMp, combat0);

    const wTick = tickWorldCombatState(
      parseWorldCombatState((char as CharacterRow).worldCombatStateJson),
      maxMp0,
      Date.now(),
      combat0.regenMp
    );

    const mobMaxCp0 = mobMaxCpFromMobMaxHp(mc.maxHp);
    const nowStartMs = Date.now();
    const st: BattleJsonState = {
      spawnId,
      mobHp: mc.maxHp,
      mobMaxHp: mc.maxHp,
      mobCp: mobMaxCp0,
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

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        battleJson: serializeBattleJsonForDb(st),
        worldCombatStateJson: Prisma.JsonNull,
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();

    const row = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    const snap = toSnapshot(row as CharacterRow);
    const crSt = char as CharacterRow;
    const prof0 =
      typeof crSt.l2Profession === 'string' && crSt.l2Profession.trim()
        ? crSt.l2Profession.trim()
        : 'human_fighter';
    const learned0 = parseSkillsLearnedJson(
      char.skillsLearnedJson,
      prof0,
      char.race,
      char.classBranch
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
      char.race,
      char.classBranch,
      learned0,
      prof0,
      parseInventory((char as CharacterRow).inventoryJson),
      persistableActiveBuffsFromJson(
        (row as CharacterRow).activeBuffsJson,
        Date.now()
      ),
      parseSkillCooldowns(
        (row as CharacterRow).skillCooldownsJson,
        Date.now()
      )
    );
    return { character: snap, battle: view };
  });
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

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        battleJson: Prisma.JsonNull,
        worldCombatStateJson:
          worldLeave != null
            ? (JSON.parse(JSON.stringify(worldLeave)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();
    const row = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(row as CharacterRow);
  });
}
