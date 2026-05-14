/**
 * Перезарядки скілів на персонажі: `[{ skillId, readyAt }]` у БД.
 *
 * Чому не в `battleJson`: у L2 частина скілів має cd > тривалість бою
 * (напр., Battle Roar 10 min, Touch of Life 5 min). Вони мають переживати вихід з бою і F5.
 * Джерело `cooldownSec`: `humanFighterSkillCooldowns.generated.ts` (автоген з XML l2dop,
 * скрипт `gen:hf-cooldowns`).
 */

import { HUMAN_FIGHTER_L2_COOLDOWN_SEC } from './humanFighterSkillCooldowns.generated.js';

export type SkillCooldownEntry = {
  skillId: number;
  readyAt: number;
};

function toFiniteNum(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Читає `skillCooldownsJson` у нормалізований список, без прострочених. */
export function parseSkillCooldowns(
  raw: unknown,
  nowMs: number
): SkillCooldownEntry[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const byId = new Map<number, number>();
  for (const item of raw) {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const o = item as Record<string, unknown>;
    const sid = toFiniteNum(o.skillId ?? o.skill_id);
    const rdy = toFiniteNum(o.readyAt ?? o.ready_at);
    if (sid === undefined || sid <= 0) continue;
    if (rdy === undefined || rdy <= nowMs) continue;
    const prev = byId.get(sid) ?? 0;
    if (rdy > prev) byId.set(sid, Math.floor(rdy));
  }
  return Array.from(byId.entries())
    .map(([skillId, readyAt]) => ({ skillId, readyAt }))
    .sort((a, b) => a.skillId - b.skillId);
}

/** `true` — скіл не на кулдауні; `false` — ще на перезарядці. */
export function isSkillReady(
  cooldowns: readonly SkillCooldownEntry[],
  skillId: number,
  nowMs: number
): boolean {
  for (const c of cooldowns) {
    if (c.skillId === skillId) return c.readyAt <= nowMs;
  }
  return true;
}

/** Скільки секунд лишилось до готовності (0, якщо готовий). */
export function skillRemainingSec(
  cooldowns: readonly SkillCooldownEntry[],
  skillId: number,
  nowMs: number
): number {
  for (const c of cooldowns) {
    if (c.skillId === skillId) {
      return Math.max(0, Math.ceil((c.readyAt - nowMs) / 1000));
    }
  }
  return 0;
}

/**
 * Встановлює `readyAt = now + cd*1000` на `skillId`, лишаючи інші записи.
 * Повертає нову копію списку; вхідний не модифікує.
 */
export function markSkillCast(
  cooldowns: readonly SkillCooldownEntry[],
  skillId: number,
  cooldownSec: number,
  nowMs: number
): SkillCooldownEntry[] {
  const readyAt = nowMs + Math.max(0, Math.floor(cooldownSec * 1000));
  const out: SkillCooldownEntry[] = [];
  let replaced = false;
  for (const c of cooldowns) {
    if (c.skillId === skillId) {
      out.push({ skillId, readyAt });
      replaced = true;
    } else {
      out.push(c);
    }
  }
  if (!replaced) out.push({ skillId, readyAt });
  return out.sort((a, b) => a.skillId - b.skillId);
}

/**
 * Довідник cooldown (сек) за `l2SkillId`; поки Human Fighter. Для інших класів — розширити
 * (`gen:race-fighter-skills` / майбутні `gen:*-cooldowns`).
 */
export function cooldownSecForSkillId(skillId: number): number | undefined {
  const v = HUMAN_FIGHTER_L2_COOLDOWN_SEC[skillId];
  if (typeof v !== 'number' || v < 0) return undefined;
  return v;
}
