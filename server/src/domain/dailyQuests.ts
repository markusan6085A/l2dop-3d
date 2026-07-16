/**
 * Щоденні завдання — чиста логіка (прогрес у `dailyQuestsJson`).
 */
import {
  dailyResetDayKey,
  DAILY_QUEST_RESET_HINT_UK,
} from './dailyQuestReset.js';

export { dailyResetDayKey, DAILY_QUEST_RESET_HINT_UK };

export const DAILY_QUEST_IDS = [
  'hunt_start_500',
  'strong_enemy_20',
  'raid_boss_participate',
  'skill_master_50',
  'daily_playtime_2h',
  'chat_social_10',
  'damage_dealer_500k',
] as const;

export type DailyQuestId = (typeof DAILY_QUEST_IDS)[number];

export const DAILY_QUEST_NEEDS: Record<DailyQuestId, number> = {
  hunt_start_500: 500,
  strong_enemy_20: 1,
  raid_boss_participate: 1,
  skill_master_50: 50,
  /** 2 години в секундах */
  daily_playtime_2h: 7200,
  chat_social_10: 10,
  damage_dealer_500k: 500_000,
};

export type DailyQuestTaskState = {
  have: number;
  done: boolean;
  claimed: boolean;
};

export type DailyQuestsJson = {
  v: 1;
  resetDayKey: string;
  /** Накопичений онлайн за поточний день (сек). */
  playtimeSec: number;
  /** Останній tick для віртуального додавання часу між мутаціями. */
  lastPlaytimeTickMs: number;
  tasks: Record<string, DailyQuestTaskState>;
};

export type DailyQuestTaskSnapshot = {
  have: number;
  need: number;
  done: boolean;
  claimed: boolean;
};

export type DailyQuestsSnapshot = {
  tasks: Record<string, DailyQuestTaskSnapshot>;
};

function emptyTaskState(): DailyQuestTaskState {
  return { have: 0, done: false, claimed: false };
}

function freshTasks(): Record<string, DailyQuestTaskState> {
  const tasks: Record<string, DailyQuestTaskState> = Object.create(null);
  for (const id of DAILY_QUEST_IDS) {
    tasks[id] = emptyTaskState();
  }
  return tasks;
}

export function isDailyQuestId(raw: unknown): raw is DailyQuestId {
  return (
    typeof raw === 'string' &&
    (DAILY_QUEST_IDS as readonly string[]).includes(raw)
  );
}

export function emptyDailyQuestsJson(nowMs = Date.now()): DailyQuestsJson {
  return {
    v: 1,
    resetDayKey: dailyResetDayKey(nowMs),
    playtimeSec: 0,
    lastPlaytimeTickMs: nowMs,
    tasks: freshTasks(),
  };
}

export function effectivePlaytimeSec(
  state: DailyQuestsJson,
  nowMs: number
): number {
  const deltaSec = Math.max(
    0,
    Math.floor((nowMs - state.lastPlaytimeTickMs) / 1000)
  );
  const virtualCap = DAILY_QUEST_NEEDS.daily_playtime_2h;
  return state.playtimeSec + Math.min(deltaSec, virtualCap);
}

function normalizeTask(raw: unknown, need: number): DailyQuestTaskState {
  if (!raw || typeof raw !== 'object') return emptyTaskState();
  const o = raw as Record<string, unknown>;
  const have = Math.min(need, Math.max(0, Math.floor(Number(o.have) || 0)));
  const claimed = o.claimed === true;
  return {
    have,
    done: claimed || have >= need,
    claimed,
  };
}

export function parseDailyQuestsJson(
  raw: unknown,
  nowMs = Date.now()
): DailyQuestsJson {
  if (!raw || typeof raw !== 'object') return emptyDailyQuestsJson(nowMs);
  const o = raw as Record<string, unknown>;
  if (o.v !== 1) return emptyDailyQuestsJson(nowMs);

  const tasksRaw = o.tasks;
  const tasks: Record<string, DailyQuestTaskState> = freshTasks();
  if (tasksRaw && typeof tasksRaw === 'object') {
    for (const id of DAILY_QUEST_IDS) {
      const t = normalizeTask(
        (tasksRaw as Record<string, unknown>)[id],
        DAILY_QUEST_NEEDS[id]
      );
      tasks[id] = t;
    }
  }

  const resetDayKey =
    typeof o.resetDayKey === 'string' && o.resetDayKey.trim()
      ? o.resetDayKey.trim()
      : dailyResetDayKey(nowMs);
  const playtimeSec = Math.max(0, Math.floor(Number(o.playtimeSec) || 0));
  const lastPlaytimeTickMs =
    typeof o.lastPlaytimeTickMs === 'number' && o.lastPlaytimeTickMs > 0
      ? Math.floor(o.lastPlaytimeTickMs)
      : nowMs;

  let state: DailyQuestsJson = {
    v: 1,
    resetDayKey,
    playtimeSec,
    lastPlaytimeTickMs,
    tasks,
  };
  state = maybeResetDailyQuests(state, nowMs);
  return state;
}

export function serializeDailyQuestsJson(
  state: DailyQuestsJson
): DailyQuestsJson {
  return JSON.parse(JSON.stringify(state)) as DailyQuestsJson;
}

export function maybeResetDailyQuests(
  state: DailyQuestsJson,
  nowMs: number
): DailyQuestsJson {
  const key = dailyResetDayKey(nowMs);
  if (state.resetDayKey === key) return state;
  return emptyDailyQuestsJson(nowMs);
}

function syncPlaytimeTask(state: DailyQuestsJson, playtimeSec: number): void {
  const id: DailyQuestId = 'daily_playtime_2h';
  const need = DAILY_QUEST_NEEDS[id];
  const task = state.tasks[id] ?? emptyTaskState();
  if (task.claimed) return;
  const have = Math.min(need, playtimeSec);
  state.tasks[id] = {
    have,
    done: have >= need,
    claimed: false,
  };
}

/** Закріпити віртуальний онлайн у state (перед persist). */
export function tickDailyQuestPlaytimePersist(
  state: DailyQuestsJson,
  nowMs: number
): DailyQuestsJson {
  state = maybeResetDailyQuests(state, nowMs);
  const effective = effectivePlaytimeSec(state, nowMs);
  const next: DailyQuestsJson = {
    ...state,
    playtimeSec: effective,
    lastPlaytimeTickMs: nowMs,
    tasks: { ...state.tasks },
  };
  syncPlaytimeTask(next, effective);
  return next;
}

function bumpTask(
  state: DailyQuestsJson,
  taskId: DailyQuestId,
  delta: number
): DailyQuestsJson {
  if (delta <= 0) return state;
  const need = DAILY_QUEST_NEEDS[taskId];
  const prev = state.tasks[taskId] ?? emptyTaskState();
  if (prev.claimed || prev.done) return state;
  const have = Math.min(need, prev.have + Math.floor(delta));
  const next: DailyQuestsJson = {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        have,
        done: have >= need,
        claimed: false,
      },
    },
  };
  return next;
}

export function applyDailyQuestBattleTurn(
  state: DailyQuestsJson,
  args: {
    nowMs: number;
    action: string;
    mpCostEff: number;
    damageDealt: number;
  }
): DailyQuestsJson {
  let next = tickDailyQuestPlaytimePersist(state, args.nowMs);
  if (args.damageDealt > 0) {
    next = bumpTask(next, 'damage_dealer_500k', args.damageDealt);
  }
  const action = String(args.action || '');
  if (
    args.mpCostEff > 0 &&
    action !== 'attack' &&
    action !== 'bolt'
  ) {
    next = bumpTask(next, 'skill_master_50', 1);
  }
  return next;
}

export function applyDailyQuestMobKill(
  state: DailyQuestsJson,
  args: {
    nowMs: number;
    playerLevel: number;
    mobLevel: number;
    isWorldBoss: boolean;
  }
): DailyQuestsJson {
  if (args.isWorldBoss) return tickDailyQuestPlaytimePersist(state, args.nowMs);
  let next = tickDailyQuestPlaytimePersist(state, args.nowMs);
  next = bumpTask(next, 'hunt_start_500', 1);
  return next;
}

export function applyDailyQuestChatMessage(
  state: DailyQuestsJson,
  nowMs: number
): DailyQuestsJson {
  const next = tickDailyQuestPlaytimePersist(state, nowMs);
  return bumpTask(next, 'chat_social_10', 1);
}

export function applyDailyQuestRaidBossParticipation(
  state: DailyQuestsJson,
  nowMs: number
): DailyQuestsJson {
  let next = tickDailyQuestPlaytimePersist(state, nowMs);
  next = bumpTask(next, 'raid_boss_participate', 1);
  next = bumpTask(next, 'strong_enemy_20', 1);
  return next;
}

export function dailyQuestsJsonChanged(
  before: unknown,
  after: DailyQuestsJson
): boolean {
  return (
    JSON.stringify(parseDailyQuestsJson(before)) !==
    JSON.stringify(serializeDailyQuestsJson(after))
  );
}

export function dailyQuestsSnapshot(
  raw: unknown,
  nowMs = Date.now()
): DailyQuestsSnapshot {
  const state = parseDailyQuestsJson(raw, nowMs);
  const playtimeSec = effectivePlaytimeSec(state, nowMs);
  const tasks: Record<string, DailyQuestTaskSnapshot> = Object.create(null);

  for (const id of DAILY_QUEST_IDS) {
    const need = DAILY_QUEST_NEEDS[id];
    const t = state.tasks[id] ?? emptyTaskState();
    let have = t.have;
    if (id === 'daily_playtime_2h') {
      have = Math.min(need, playtimeSec);
    }
    tasks[id] = {
      have,
      need,
      done: t.claimed ? true : have >= need,
      claimed: t.claimed,
    };
  }

  return { tasks };
}

export function dailyQuestEffectiveHave(
  state: DailyQuestsJson,
  taskId: DailyQuestId,
  nowMs: number
): number {
  const need = DAILY_QUEST_NEEDS[taskId];
  const t = state.tasks[taskId] ?? emptyTaskState();
  if (taskId === 'daily_playtime_2h') {
    return Math.min(need, effectivePlaytimeSec(state, nowMs));
  }
  return Math.min(need, Math.max(0, Math.floor(t.have)));
}

export function claimDailyQuestTask(
  state: DailyQuestsJson,
  taskId: DailyQuestId,
  nowMs: number
): DailyQuestsJson {
  let next = tickDailyQuestPlaytimePersist(state, nowMs);
  const task = next.tasks[taskId] ?? emptyTaskState();
  if (task.claimed) throw new Error('daily_quest_already_claimed');
  const have = dailyQuestEffectiveHave(next, taskId, nowMs);
  const need = DAILY_QUEST_NEEDS[taskId];
  if (have < need) throw new Error('daily_quest_not_done');
  next = {
    ...next,
    tasks: {
      ...next.tasks,
      [taskId]: {
        have: Math.max(have, task.have),
        done: true,
        claimed: true,
      },
    },
  };
  return next;
}
