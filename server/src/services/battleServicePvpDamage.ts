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
    /** Якщо false — без world PK/aggressor (siege/arena/olympiad). */
    applyWorldPkRules?: boolean;
  }
): Promise<{ mirrorLogLineUk?: string; victimHp?: number }> {
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
        SET hp = GREATEST(0, hp - ${mirror.reflectDamage}), "lastUpdate" = NOW()
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
    SET hp = GREATEST(0, hp - ${dmg}), "lastUpdate" = NOW()
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

  if (args.applyWorldPkRules !== false) {
    await persistCharacterFieldsInTx(tx, attackerId, {
      pvpAggressorUntilMs: nextPvpAggressorUntilMs(args.nowMs),
    });
  }
  return {
    victimHp: newHp,
    ...(mirrorLogLineUk ? { mirrorLogLineUk } : {}),
  };
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

/** Lethal Shot (343): CP жертви PvP = фіксоване значення (зазвичай 1). */
export async function applyPvpCpSetToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    cp: number;
  }
): Promise<void> {
  const cp = Math.max(0, Math.floor(args.cp));
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
  const nextCp = maxCp > 0 ? Math.min(maxCp, cp) : cp;

  const patch: BattleJsonState = {
    ...victimBj,
    playerCp: nextCp,
    ...(maxCp > 0 ? { playerMaxCp: maxCp } : {}),
  };
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

/**
 * PvP: дзеркалить Touch of Death (342) з battleMods атакуючого на жертву.
 */
export async function mirrorPvpTouchOfDeathToVictimInTx(
  tx: Prisma.TransactionClient,
  args: {
    victimId: string;
    attackerId: string;
    untilMs?: number;
    iconSkillId?: number;
    debuffResistPenaltyPct?: number;
    healReceivedPenaltyPct?: number;
    maxCpSet?: number;
    maxCpBaseline?: number;
    stripAllBuffs?: boolean;
    nowMs: number;
  }
): Promise<void> {
  const victimId = String(args.victimId || '').trim();
  const attackerId = String(args.attackerId || '').trim();
  if (!victimId || !attackerId || victimId === attackerId) return;

  const victim = await tx.character.findFirst({
    where: { id: victimId },
    select: { battleJson: true, activeBuffsJson: true },
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

  const untilRaw = args.untilMs;
  const nowMs = args.nowMs;
  const active =
    typeof untilRaw === 'number' &&
    Number.isFinite(untilRaw) &&
    untilRaw > nowMs;

  const prevMods =
    victimBj.battleMods && typeof victimBj.battleMods === 'object'
      ? { ...victimBj.battleMods }
      : {};

  const victimData: Prisma.CharacterUncheckedUpdateInput = {};

  if (active) {
    const sid =
      typeof args.iconSkillId === 'number' &&
      Number.isFinite(args.iconSkillId) &&
      args.iconSkillId > 0
        ? Math.floor(args.iconSkillId)
        : 342;
    prevMods.playerTouchOfDeathUntilMs = Math.floor(untilRaw);
    prevMods.playerTouchOfDeathIconSkillId = sid;
    const dr = args.debuffResistPenaltyPct;
    if (typeof dr === 'number' && Number.isFinite(dr) && dr > 0) {
      prevMods.playerTouchOfDeathDebuffResistPenaltyPct = dr;
    } else {
      delete prevMods.playerTouchOfDeathDebuffResistPenaltyPct;
    }
    const healPen = args.healReceivedPenaltyPct;
    if (typeof healPen === 'number' && Number.isFinite(healPen) && healPen > 0) {
      prevMods.playerTouchOfDeathHealReceivedPenaltyPct = healPen;
    } else {
      delete prevMods.playerTouchOfDeathHealReceivedPenaltyPct;
    }
    const baseline = args.maxCpBaseline;
    if (typeof baseline === 'number' && Number.isFinite(baseline) && baseline > 0) {
      prevMods.touchOfDeathPlayerMaxCpBaseline = Math.floor(baseline);
    }
  } else {
    delete prevMods.playerTouchOfDeathUntilMs;
    delete prevMods.playerTouchOfDeathIconSkillId;
    delete prevMods.playerTouchOfDeathDebuffResistPenaltyPct;
    delete prevMods.playerTouchOfDeathHealReceivedPenaltyPct;
    delete prevMods.touchOfDeathPlayerMaxCpBaseline;
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

  if (active) {
    const baseline =
      typeof args.maxCpBaseline === 'number' &&
      Number.isFinite(args.maxCpBaseline) &&
      args.maxCpBaseline > 0
        ? Math.floor(args.maxCpBaseline)
        : typeof patch.playerMaxCp === 'number' && patch.playerMaxCp > 0
          ? Math.floor(patch.playerMaxCp)
          : 0;
    if (baseline > 0) {
      patch.playerMaxCp = baseline;
      if (
        typeof args.maxCpSet === 'number' &&
        Number.isFinite(args.maxCpSet) &&
        args.maxCpSet >= 0
      ) {
        patch.playerMaxCp = Math.floor(args.maxCpSet);
      }
      const cur =
        typeof patch.playerCp === 'number'
          ? Math.max(0, Math.floor(patch.playerCp))
          : baseline;
      patch.playerCp = Math.min(cur, patch.playerMaxCp);
    }
    const expires = {
      ...(patch.battleModsExpiresAtMsBySkillId ?? {}),
      '342': Math.floor(untilRaw as number),
    };
    patch.battleModsExpiresAtMsBySkillId = expires;
  } else {
    const expires = { ...(patch.battleModsExpiresAtMsBySkillId ?? {}) };
    delete expires['342'];
    if (Object.keys(expires).length > 0) {
      patch.battleModsExpiresAtMsBySkillId = expires;
    } else {
      delete patch.battleModsExpiresAtMsBySkillId;
    }
  }

  victimData.battleJson = serializeBattleJsonForDb(patch);

  if (args.stripAllBuffs === true) {
    victimData.activeBuffsJson = [];
  }

  await persistCharacterFieldsInTx(tx, victimId, victimData);
}
