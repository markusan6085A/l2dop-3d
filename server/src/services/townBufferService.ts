import { Prisma } from '@prisma/client';
import { gameConflictFromMutation } from './charConflict.js';
import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  activeBuffExpiresAt,
  buffDurationSecForSkillId,
} from '../data/l2dopBuffDurations.js';
import {
  persistableActiveBuffsFromJson,
  type ActiveBuffEntry,
} from '../data/l2dopActiveBuffs.js';
import { L2DB_SKILL_LEVELS_BY_ID } from '../data/l2dbSkillLevelsById.generated.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { buildMutationCharacterSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

const TOWN_BUFFER_FREE_MAX_LEVEL = 40;
const TOWN_BUFFER_FEE_ADENA = 1n;

/**
 * Набір міського бафера (за скріном): утилітарні сапорт-бафи без топ-рангу.
 * Видаємо передостанній рівень, щоб топ лишався через власну прокачку.
 */
const TOWN_BUFFER_SKILL_IDS: readonly number[] = [
  1036, // Magic Barrier
  1040, // Shield
  1045, // Bless the Body
  1048, // Bless the Soul
  1059, // Empower
  1062, // Berserker Spirit
  1068, // Might
  1077, // Focus
  1085, // Acumen
  1086, // Haste
  1240, // Guidance
];

function townBufferSkillLevel(skillId: number): number {
  const rows = L2DB_SKILL_LEVELS_BY_ID[skillId];
  if (!rows || rows.length === 0) return 1;
  if (rows.length === 1) return Math.max(1, Math.floor(rows[0]!.level || 1));
  const penultimate = rows[rows.length - 2];
  return Math.max(1, Math.floor((penultimate?.level ?? 1) || 1));
}

function upsertTownBufferSet(
  rawActiveBuffs: Prisma.JsonValue | null,
  nowMs: number
): ActiveBuffEntry[] {
  const current = persistableActiveBuffsFromJson(rawActiveBuffs, nowMs);
  const bySkill = new Map<number, ActiveBuffEntry>();
  for (const e of current) bySkill.set(e.skillId, e);

  for (const skillId of TOWN_BUFFER_SKILL_IDS) {
    // У буфер кладемо тільки навички, для яких знаємо тривалість як abnormalTime.
    if (buffDurationSecForSkillId(skillId) === undefined) continue;
    const baseLevel = townBufferSkillLevel(skillId);
    const prev = bySkill.get(skillId);
    const level =
      prev && prev.level > baseLevel ? Math.floor(prev.level) : baseLevel;
    const expiresAt = activeBuffExpiresAt(skillId, nowMs);
    bySkill.set(
      skillId,
      expiresAt !== undefined
        ? { skillId, level, expiresAt }
        : { skillId, level }
    );
  }
  return [...bySkill.values()];
}

export interface TownBufferResult {
  character: CharacterSnapshot;
  feeAdena: string;
}

function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function movementFieldsChanged(a: CharacterRow, b: CharacterRow): boolean {
  return (
    a.worldX !== b.worldX ||
    a.worldY !== b.worldY ||
    a.targetX !== b.targetX ||
    a.targetY !== b.targetY ||
    (a.moveStartAt?.getTime() ?? 0) !== (b.moveStartAt?.getTime() ?? 0) ||
    a.moveFromX !== b.moveFromX ||
    a.moveFromY !== b.moveFromY
  );
}

export async function applyTownBuffer(
  userId: string,
  expectedRevision: number
): Promise<TownBufferResult> {
  const nextRow = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const level = levelFromTotalExp(base.exp);
        const fee = level <= TOWN_BUFFER_FREE_MAX_LEVEL ? 0n : TOWN_BUFFER_FEE_ADENA;
        if (fee > 0n && base.adena < fee) {
          throw new Error('town_buffer_not_enough_adena');
        }
        const nowMs = Date.now();
        const nextActiveBuffs = upsertTownBufferSet(base.activeBuffsJson, nowMs);
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          JSON.stringify(base.activeBuffsJson ?? null) !==
            JSON.stringify(nextActiveBuffs) ||
          fee > 0n;
        if (!changed) {
          return { changed: false };
        }
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            activeBuffsJson: nextActiveBuffs as unknown as Prisma.InputJsonValue,
            ...(fee > 0n ? { adena: { decrement: fee } } : {}),
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });

  const fee =
    levelFromTotalExp(nextRow.exp) <= TOWN_BUFFER_FREE_MAX_LEVEL
      ? 0n
      : TOWN_BUFFER_FEE_ADENA;
  return {
    character: await buildMutationCharacterSnapshot(nextRow, userId),
    feeAdena: String(fee),
  };
}
