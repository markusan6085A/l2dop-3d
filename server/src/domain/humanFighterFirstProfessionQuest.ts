/**
 * Квест 1-ї профи людини-воїна (Warrior / Human Knight / Rogue) — чиста логіка.
 */
import { countBagQty, removeBagQty, type InventoryState } from '../data/inventory.js';

export const HUMAN_FIGHTER_FIRST_PROF_QUEST_ID = 'human_fighter_first_prof';

export const HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_ID = 1867;
export const HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_QTY = 15;

export const HUMAN_FIGHTER_FIRST_PROF_QUEST_REWARD_ADENA = 100_000n;
export const HUMAN_FIGHTER_FIRST_PROF_QUEST_REWARD_SP = 50_000;

export const HUMAN_FIGHTER_FIRST_PROF_QUEST_TARGETS = [
  'human_warrior',
  'human_knight',
  'human_rogue',
] as const;

export type HumanFighterFirstProfTarget =
  (typeof HUMAN_FIGHTER_FIRST_PROF_QUEST_TARGETS)[number];

export const HUMAN_FIGHTER_FIRST_PROF_QUEST_MOBS = [
  { npcId: 20073, nameUk: 'Ol Mahum Legionnaire', level: 28, need: 15 },
  { npcId: 20160, nameUk: 'Neer Crawler', level: 26, need: 20 },
] as const;

export const HUMAN_FIGHTER_FIRST_PROF_SLUG_TO_TARGET: Readonly<
  Record<string, HumanFighterFirstProfTarget>
> = {
  'human-warrior': 'human_warrior',
  'human-knight': 'human_knight',
  'human-rogue': 'human_rogue',
};

export type FirstProfessionQuestActive = {
  questId: typeof HUMAN_FIGHTER_FIRST_PROF_QUEST_ID;
  targetProfession: HumanFighterFirstProfTarget;
  kills: Record<string, number>;
};

export type QuestProgressJson = {
  v: 1;
  active: FirstProfessionQuestActive | null;
};

export function emptyQuestProgressJson(): QuestProgressJson {
  return { v: 1, active: null };
}

export function parseQuestProgressJson(raw: unknown): QuestProgressJson {
  if (!raw || typeof raw !== 'object') return emptyQuestProgressJson();
  const o = raw as Record<string, unknown>;
  if (o.v !== 1) return emptyQuestProgressJson();
  const activeRaw = o.active;
  if (activeRaw == null) return { v: 1, active: null };
  if (typeof activeRaw !== 'object') return emptyQuestProgressJson();
  const a = activeRaw as Record<string, unknown>;
  const questId = a.questId;
  const targetProfession = a.targetProfession;
  if (questId !== HUMAN_FIGHTER_FIRST_PROF_QUEST_ID) {
    return emptyQuestProgressJson();
  }
  if (
    typeof targetProfession !== 'string' ||
    !(HUMAN_FIGHTER_FIRST_PROF_QUEST_TARGETS as readonly string[]).includes(
      targetProfession
    )
  ) {
    return emptyQuestProgressJson();
  }
  const killsRaw = a.kills;
  const kills: Record<string, number> = Object.create(null);
  if (killsRaw && typeof killsRaw === 'object') {
    for (const [k, v] of Object.entries(killsRaw as Record<string, unknown>)) {
      const n = Math.max(0, Math.floor(Number(v) || 0));
      if (n > 0) kills[String(k)] = n;
    }
  }
  return {
    v: 1,
    active: {
      questId: HUMAN_FIGHTER_FIRST_PROF_QUEST_ID,
      targetProfession: targetProfession as HumanFighterFirstProfTarget,
      kills,
    },
  };
}

export function serializeQuestProgressJson(
  state: QuestProgressJson
): QuestProgressJson {
  return JSON.parse(JSON.stringify(state)) as QuestProgressJson;
}

export function questKillNeed(npcId: number): number {
  const row = HUMAN_FIGHTER_FIRST_PROF_QUEST_MOBS.find((m) => m.npcId === npcId);
  return row?.need ?? 0;
}

export function questKillHave(
  active: FirstProfessionQuestActive,
  npcId: number
): number {
  return Math.max(0, Math.floor(Number(active.kills[String(npcId)]) || 0));
}

export function killsRequirementMet(active: FirstProfessionQuestActive): boolean {
  for (const mob of HUMAN_FIGHTER_FIRST_PROF_QUEST_MOBS) {
    if (questKillHave(active, mob.npcId) < mob.need) return false;
  }
  return true;
}

export function itemsRequirementMet(inv: InventoryState): boolean {
  return (
    countBagQty(inv, HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_ID) >=
    HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_QTY
  );
}

export function firstProfessionQuestReady(
  active: FirstProfessionQuestActive | null,
  inv: InventoryState
): boolean {
  if (!active) return false;
  return killsRequirementMet(active) && itemsRequirementMet(inv);
}

export function incrementQuestKillOnVictory(
  state: QuestProgressJson,
  npcId: number | null
): QuestProgressJson {
  if (!state.active || npcId == null) return state;
  const need = questKillNeed(npcId);
  if (need <= 0) return state;
  const key = String(npcId);
  const have = questKillHave(state.active, npcId);
  if (have >= need) return state;
  const next: QuestProgressJson = {
    v: 1,
    active: {
      ...state.active,
      kills: { ...state.active.kills, [key]: have + 1 },
    },
  };
  return next;
}

export function acceptFirstProfessionQuest(
  state: QuestProgressJson,
  targetProfession: HumanFighterFirstProfTarget
): QuestProgressJson {
  if (
    state.active &&
    state.active.targetProfession === targetProfession &&
    state.active.questId === HUMAN_FIGHTER_FIRST_PROF_QUEST_ID
  ) {
    return state;
  }
  if (state.active && state.active.targetProfession !== targetProfession) {
    throw new Error('profession_quest_wrong_target');
  }
  return {
    v: 1,
    active: {
      questId: HUMAN_FIGHTER_FIRST_PROF_QUEST_ID,
      targetProfession,
      kills: Object.create(null),
    },
  };
}

export function assertFirstProfessionQuestForChange(
  state: QuestProgressJson,
  targetProfession: HumanFighterFirstProfTarget,
  inv: InventoryState
): { nextInv: InventoryState; cleared: QuestProgressJson } {
  const active = state.active;
  if (!active) throw new Error('profession_quest_not_accepted');
  if (active.targetProfession !== targetProfession) {
    throw new Error('profession_quest_wrong_target');
  }
  if (!killsRequirementMet(active)) {
    throw new Error('profession_quest_kills_incomplete');
  }
  if (!itemsRequirementMet(inv)) {
    throw new Error('profession_quest_items_missing');
  }
  const nextInv = removeBagQty(
    inv,
    HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_ID,
    HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_QTY
  );
  return { nextInv, cleared: emptyQuestProgressJson() };
}

export interface FirstProfessionQuestSnapshot {
  accepted: boolean;
  targetProfession: string | null;
  ready: boolean;
  kills: Array<{
    npcId: number;
    nameUk: string;
    level: number;
    need: number;
    have: number;
  }>;
  itemId: number;
  itemNeed: number;
  itemHave: number;
  itemNameUk: string;
}

export function firstProfessionQuestSnapshot(
  state: QuestProgressJson,
  inv: InventoryState
): FirstProfessionQuestSnapshot | null {
  const active = state.active;
  const itemHave = countBagQty(
    inv,
    HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_ID
  );
  const kills = HUMAN_FIGHTER_FIRST_PROF_QUEST_MOBS.map((mob) => ({
    npcId: mob.npcId,
    nameUk: mob.nameUk,
    level: mob.level,
    need: mob.need,
    have: active ? questKillHave(active, mob.npcId) : 0,
  }));
  if (!active) {
    return {
      accepted: false,
      targetProfession: null,
      ready: false,
      kills,
      itemId: HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_ID,
      itemNeed: HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_QTY,
      itemHave,
      itemNameUk: 'Шкура звіра (Animal Skin)',
    };
  }
  return {
    accepted: true,
    targetProfession: active.targetProfession,
    ready: firstProfessionQuestReady(active, inv),
    kills,
    itemId: HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_ID,
    itemNeed: HUMAN_FIGHTER_FIRST_PROF_QUEST_ANIMAL_SKIN_QTY,
    itemHave,
    itemNameUk: 'Шкура звіра (Animal Skin)',
  };
}
