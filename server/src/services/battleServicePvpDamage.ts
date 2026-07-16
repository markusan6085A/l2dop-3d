import { Prisma } from '@prisma/client';
import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import type { BattleJsonState } from '../domain/battleTypes.js';
import { nextPvpAggressorUntilMs } from '../domain/pvpKarma.js';
import { deflectArrowIncomingPhysMulFromActiveBuffs } from '../data/deflectArrowTables.js';
import { rollPhysicalMirrorReflect } from '../domain/physicalMirrorReflect.js';
import type { PhysicalMirrorReflectKind } from '../domain/physicalMirrorReflect.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';

/** Синхронізує урон PvP із HP жертви в БД (обидва боки взаємного бою). */
export async function applyPvpHitToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    damage: number;
    nowMs: number;
    isBowAttack?: boolean;
    /** Для Physical Mirror (350): фізичний скіл або магія. */
    mirrorReflectKind?: PhysicalMirrorReflectKind;
  }
): Promise<{ mirrorLogLineUk?: string }> {
  let dmg = Math.max(0, Math.floor(args.damage));
  if (dmg <= 0) return {};

  const victimId = String(args.victimId || '').trim();
  const attackerId = String(args.attackerId || '').trim();
  if (!victimId || !attackerId || victimId === attackerId) return {};

  const victimPre = await tx.character.findFirst({
    where: { id: victimId },
    select: { activeBuffsJson: true, battleJson: true },
  });

  if (args.isBowAttack === true && victimPre) {
    const mul = deflectArrowIncomingPhysMulFromActiveBuffs(
      victimPre.activeBuffsJson,
      args.nowMs
    );
    if (mul < 1) {
      dmg = Math.max(0, Math.floor(dmg * mul));
    }
  }
  if (dmg <= 0) return {};

  let mirrorLogLineUk: string | undefined;
  const victimBjPre = parseBattleJson(victimPre?.battleJson);
  const mirrorKind = args.mirrorReflectKind;
  if (mirrorKind && victimBjPre?.battleMods) {
    const mirror = rollPhysicalMirrorReflect(
      victimBjPre.battleMods,
      mirrorKind,
      dmg
    );
    if (mirror.absorbed && mirror.reflectDamage > 0) {
      dmg = 0;
      mirrorLogLineUk = mirror.logLineUk;
      const atkRows = await tx.$queryRaw<
        Array<{ hp: number; battleJson: Prisma.JsonValue | null }>
      >`
        UPDATE "Character"
        SET hp = GREATEST(0, hp - ${mirror.reflectDamage})
        WHERE id = ${attackerId}
        RETURNING hp, "battleJson"
      `;
      const attacker = atkRows[0];
      if (attacker) {
        const atkHp = Math.max(0, Math.floor(Number(attacker.hp) || 0));
        const atkBj = parseBattleJson(attacker.battleJson);
        if (
          atkBj &&
          isPvpBattleJson(atkBj) &&
          atkBj.pvpTargetCharacterId === victimId
        ) {
          await persistCharacterFieldsInTx(tx, attackerId, {
            battleJson: serializeBattleJsonForDb({
              ...atkBj,
              playerHp: atkHp,
            } as BattleJsonState),
          });
        }
      }
    }
  }
  if (dmg <= 0) {
    return { ...(mirrorLogLineUk ? { mirrorLogLineUk } : {}) };
  }

  const rows = await tx.$queryRaw<
    Array<{ hp: number; battleJson: Prisma.JsonValue | null }>
  >`
    UPDATE "Character"
    SET hp = GREATEST(0, hp - ${dmg})
    WHERE id = ${victimId}
    RETURNING hp, "battleJson"
  `;
  const victim = rows[0];
  if (!victim) return {};

  const newHp = Math.max(0, Math.floor(Number(victim.hp) || 0));
  const victimData: Prisma.CharacterUncheckedUpdateInput = {};

  const victimBj = parseBattleJson(victim.battleJson);
  if (
    victimBj &&
    isPvpBattleJson(victimBj) &&
    victimBj.pvpTargetCharacterId === attackerId
  ) {
    const patch = {
      ...victimBj,
      playerHp: newHp,
    };
    if (victimBj.pvpIsAggressor === true) {
      patch.pvpVictimFoughtBack = true;
    }
    victimData.battleJson = serializeBattleJsonForDb(patch);
  }

  if (Object.keys(victimData).length > 0) {
    await persistCharacterFieldsInTx(tx, victimId, victimData);
  }

  await persistCharacterFieldsInTx(tx, attackerId, {
    pvpAggressorUntilMs: nextPvpAggressorUntilMs(args.nowMs),
  });
  return { ...(mirrorLogLineUk ? { mirrorLogLineUk } : {}) };
}

/**
 * PvP: дзеркалить stun з battleMods атакуючого на жертву (`playerStunUntilMs`).
 * Якщо stun прострочений або знятий — очищає поля на стороні жертви.
 */
export async function mirrorPvpStunToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    stunUntilMs?: number;
    iconSkillId?: number;
    nowMs: number;
  }
): Promise<void> {
  const victimId = String(args.victimId || '').trim();
  const attackerId = String(args.attackerId || '').trim();
  if (!victimId || !attackerId || victimId === attackerId) return;

  const victim = await tx.character.findFirst({
    where: { id: victimId },
    select: { battleJson: true },
  });
  if (!victim) return;

  const victimBj = parseBattleJson(victim.battleJson);
  if (
    !victimBj ||
    !isPvpBattleJson(victimBj) ||
    victimBj.pvpTargetCharacterId !== attackerId
  ) {
    return;
  }

  const untilRaw = args.stunUntilMs;
  const nowMs = args.nowMs;
  const active =
    typeof untilRaw === 'number' &&
    Number.isFinite(untilRaw) &&
    untilRaw > nowMs;

  const prevMods =
    victimBj.battleMods && typeof victimBj.battleMods === 'object'
      ? { ...victimBj.battleMods }
      : {};

  if (active) {
    const sid =
      typeof args.iconSkillId === 'number' &&
      Number.isFinite(args.iconSkillId) &&
      args.iconSkillId > 0
        ? Math.floor(args.iconSkillId)
        : 260;
    prevMods.playerStunUntilMs = Math.floor(untilRaw);
    prevMods.playerStunIconSkillId = sid;
  } else {
    delete prevMods.playerStunUntilMs;
    delete prevMods.playerStunIconSkillId;
  }

  const patch: BattleJsonState = {
    ...victimBj,
    ...(Object.keys(prevMods).length > 0
      ? { battleMods: prevMods }
      : { battleMods: undefined }),
  };
  if (!patch.battleMods || Object.keys(patch.battleMods).length === 0) {
    delete patch.battleMods;
  }

  await persistCharacterFieldsInTx(tx, victimId, {
    battleJson: serializeBattleJsonForDb(patch),
  });
}

/**
 * PvP: дзеркалить Shield Slam (353) з battleMods атакуючого на жертву
 * (`playerPhysSkillsBlockedUntilMs`).
 */
export async function mirrorPvpPhysSkillsBlockToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    blockUntilMs?: number;
    iconSkillId?: number;
    nowMs: number;
  }
): Promise<void> {
  const victimId = String(args.victimId || '').trim();
  const attackerId = String(args.attackerId || '').trim();
  if (!victimId || !attackerId || victimId === attackerId) return;

  const victim = await tx.character.findFirst({
    where: { id: victimId },
    select: { battleJson: true },
  });
  if (!victim) return;

  const victimBj = parseBattleJson(victim.battleJson);
  if (
    !victimBj ||
    !isPvpBattleJson(victimBj) ||
    victimBj.pvpTargetCharacterId !== attackerId
  ) {
    return;
  }

  const untilRaw = args.blockUntilMs;
  const nowMs = args.nowMs;
  const active =
    typeof untilRaw === 'number' &&
    Number.isFinite(untilRaw) &&
    untilRaw > nowMs;

  const prevMods =
    victimBj.battleMods && typeof victimBj.battleMods === 'object'
      ? { ...victimBj.battleMods }
      : {};

  if (active) {
    const sid =
      typeof args.iconSkillId === 'number' &&
      Number.isFinite(args.iconSkillId) &&
      args.iconSkillId > 0
        ? Math.floor(args.iconSkillId)
        : 353;
    prevMods.playerPhysSkillsBlockedUntilMs = Math.floor(untilRaw);
    prevMods.playerPhysSkillsBlockedIconSkillId = sid;
  } else {
    delete prevMods.playerPhysSkillsBlockedUntilMs;
    delete prevMods.playerPhysSkillsBlockedIconSkillId;
  }

  const patch: BattleJsonState = {
    ...victimBj,
    ...(Object.keys(prevMods).length > 0
      ? { battleMods: prevMods }
      : { battleMods: undefined }),
  };
  if (!patch.battleMods || Object.keys(patch.battleMods).length === 0) {
    delete patch.battleMods;
  }

  await persistCharacterFieldsInTx(tx, victimId, {
    battleJson: serializeBattleJsonForDb(patch),
  });
}

/** Wrath (320): знімає CP у жертви PvP, якщо вона в mutual-бою з атакуючим. */
export async function applyPvpCpDrainToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    cpDrain: number;
  }
): Promise<void> {
  const drain = Math.max(0, Math.floor(args.cpDrain));
  if (drain <= 0) return;

  const victimId = String(args.victimId || '').trim();
  const attackerId = String(args.attackerId || '').trim();
  if (!victimId || !attackerId || victimId === attackerId) return;

  const victim = await tx.character.findFirst({
    where: { id: victimId },
    select: { battleJson: true },
  });
  if (!victim) return;

  const victimBj = parseBattleJson(victim.battleJson);
  if (
    !victimBj ||
    !isPvpBattleJson(victimBj) ||
    victimBj.pvpTargetCharacterId !== attackerId
  ) {
    return;
  }

  const maxCp =
    typeof victimBj.playerMaxCp === 'number' && victimBj.playerMaxCp > 0
      ? Math.floor(victimBj.playerMaxCp)
      : typeof victimBj.mobMaxCp === 'number' && victimBj.mobMaxCp > 0
        ? Math.floor(victimBj.mobMaxCp)
        : 0;
  const cur =
    typeof victimBj.playerCp === 'number'
      ? Math.max(0, Math.floor(victimBj.playerCp))
      : maxCp;
  const nextCp = Math.max(0, cur - drain);
  if (nextCp === cur) return;

  const patch: BattleJsonState = {
    ...victimBj,
    playerCp: nextCp,
    ...(maxCp > 0 ? { playerMaxCp: maxCp } : {}),
  };
  await persistCharacterFieldsInTx(tx, victimId, {
    battleJson: serializeBattleJsonForDb(patch),
  });
}
