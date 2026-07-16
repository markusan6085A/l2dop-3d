/**
 * Пасивні скіли з `skillsLearnedJson` → модифікатори бою (як users_skills у l2dop / applyPassive у text-rpg).
 * **Лише** `TEXT_RPG_HF_PASSIVE_EFFECTS` + `textRpgPassiveBuffApply.ts` — cs1/rawdata для пасивів HF не підмішується.
 * Майстерності легкої/важкої броні (l2_227 / l2_231) — лише при відповідному екіпі (`equippedArmorKindForPassives`);
 * для магів пізніше: окремі пасиви з перевіркою `armorKind === 'magic'` (robe у даті = magic).
 */
import type { InventoryState } from './inventory.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
  partialCombatBuffDeltaFromNeutral,
  type L2dopCombatBuffModifiers,
} from './l2dopCombatBuffModifiers.js';
import {
  textRpgPassiveDeltaForSkill,
  textRpgWeaponMastery142Delta,
} from './textRpgPassiveBuffApply.js';
import { TEXT_RPG_HF_PASSIVE_EFFECTS } from './textRpgPassiveEffects.generated.js';
import {
  canonicalBattleSkillId,
  catalogEntryVisibleForProfession,
  humanFighterCatalogEntry,
  maxSkillRankForBattleId,
  type LearnedSkillEntry,
} from './humanFighterSkillCatalog.js';

const TEXT_RPG_PASSIVE_BY_BATTLE_ID = new Map(
  TEXT_RPG_HF_PASSIVE_EFFECTS.map((row) => [row.battleId, row])
);

/** Усі `battleId` з автогену пасивів HF (text-rpg) — для аудиту / «одне джерело». */
export const TEXT_RPG_HF_PASSIVE_BATTLE_IDS = new Set(
  TEXT_RPG_HF_PASSIVE_EFFECTS.map((r) => r.battleId)
);

function clampRank(battleId: string, level: number): number {
  const max = maxSkillRankForBattleId(battleId);
  return Math.max(1, Math.min(max, Math.floor(level)));
}

/**
 * Сумарний шар пасивок для `computeCombatStats` (`options.buffs` поверх activeBuffsJson).
 */
export function learnedPassivesBuffDelta(
  entries: LearnedSkillEntry[],
  inv: InventoryState,
  l2Profession: string,
  currentHp?: number,
  currentMaxHp?: number
): Partial<L2dopCombatBuffModifiers> {
  const prof = String(l2Profession || '').trim() || 'human_fighter';
  const hp = typeof currentHp === 'number' && Number.isFinite(currentHp) ? currentHp : undefined;
  const maxHp =
    typeof currentMaxHp === 'number' && Number.isFinite(currentMaxHp) && currentMaxHp > 0
      ? currentMaxHp
      : undefined;
  const hpRatio = hp != null && maxHp != null ? hp / maxHp : undefined;

  let acc: L2dopCombatBuffModifiers = neutralCombatBuffs();

  for (const e of entries) {
    if (e.level < 1) continue;
    const cat = humanFighterCatalogEntry(e.battleId);
    if (!cat || cat.kind !== 'passive') continue;
    if (!catalogEntryVisibleForProfession(cat, prof)) continue;

    const bid = canonicalBattleSkillId(e.battleId);
    const r = clampRank(e.battleId, e.level);
    const row = TEXT_RPG_PASSIVE_BY_BATTLE_ID.get(bid);
    if (!row) continue;
    /**
     * Final Frenzy (290): пасив має діяти лише на low HP (Interlude, <=30% HP),
     * а не постійно.
     */
    if (row.l2SkillId === 290) {
      if (hpRatio == null || hpRatio > 0.3 + 1e-9) continue;
    }
    /** Final Fortress (291): +P.Def лише при HP <= 20%. */
    if (row.l2SkillId === 291) {
      if (hpRatio == null || hpRatio > 0.2 + 1e-9) continue;
    }

    if (row.l2SkillId === 142) {
      const d = textRpgWeaponMastery142Delta(row, r);
      if (d) acc = applyBuffDelta(acc, d);
      continue;
    }

    const d = textRpgPassiveDeltaForSkill(row, r, inv, prof);
    if (d) acc = applyBuffDelta(acc, d);
  }

  return partialCombatBuffDeltaFromNeutral(acc);
}
