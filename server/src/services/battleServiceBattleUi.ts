import type { BattleActionId, BattleJsonState } from '../domain/battle.js';
import { ZEALOT_EFFECT_DURATION_MS } from '../domain/battleTypes.js';
import {
  battleLogSeqFromState,
  battleVersionFromState,
} from '../domain/battleVersion.js';
import type { InventoryState } from '../data/inventory.js';
import {
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isFighterClassBranch,
  legacyMeleeSkillBar,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  defaultMysticL2ProfessionForRace,
  humanMysticBattleSkillBar,
  isMysticClassBranch,
  mysticBattleActionAllowed,
} from '../data/l2dopHumanMysticBattleSkills.js';
import {
  battleActionNamedFromL2IfMapped,
  canonicalBattleSkillId,
  filterBattleSkillBarRows,
  humanFighterCatalogEntry,
  learnedHumanFighterHotbarPickSkills,
  l2SkillIdForBattleActionIcon,
} from '../data/humanFighterSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../data/fighterSkillCatalog.byRace.js';
import { mysticCatalogEntryForRace } from '../data/mysticSkillCatalog.byRace.js';
import {
  CAST_SPD_BASELINE,
  PATK_SPD_BASELINE,
  resolveBattleSkillCooldownSec,
} from '../data/skillCooldownScaling.js';
import type { BattleView } from './battleServiceTypes.js';
import {
  battleBuffLinesUk,
  battleBuffIconsForUi,
  battleMobDebuffIconsForUi,
} from './battleServiceBattleBuffs.js';
import type { ActiveBuffEntry } from '../data/l2dopActiveBuffs.js';
import { cooldownSecForSkillId, type SkillCooldownEntry } from '../data/skillCooldowns.js';

/** Та сама нормалізація профи, що й у `parseSkillsLearnedJson` — інакше зникають бафи/гілкові скіли з `battle.skills`. */
function effectiveBattleProfession(
  l2Profession: string | undefined,
  classBranch: string,
  race: string
): string {
  const resolved = resolveL2ProfessionForSkillsRow({
    l2Profession,
    classBranch,
    race,
  });
  const t = String(resolved || '').trim();
  if (t) return t;
  return isMysticClassBranch(classBranch)
    ? defaultMysticL2ProfessionForRace(race)
    : 'human_fighter';
}

function catalogEntryCategory(entry: unknown): string | null | undefined {
  if (!entry || typeof entry !== 'object') return undefined;
  const c = (entry as { category?: unknown }).category;
  return typeof c === 'string' ? c : undefined;
}

export type SkillCooldownUiContext = {
  classBranch: string;
  castSpd?: number;
  pAtkSpd?: number;
  cooldownReductionMul?: number;
  learnedSkillRanks?: Record<string, number>;
};

export function skillCooldownUiContextFromParts(
  classBranch: string,
  castSpd?: number,
  pAtkSpd?: number,
  learnedEntries?: readonly { battleId: string; level: number }[],
  cooldownReductionMul?: number
): SkillCooldownUiContext {
  const learnedSkillRanks: Record<string, number> = {};
  if (learnedEntries) {
    for (const e of learnedEntries) {
      if (e.level >= 1) learnedSkillRanks[e.battleId] = e.level;
    }
  }
  return {
    classBranch,
    castSpd,
    pAtkSpd,
    cooldownReductionMul,
    learnedSkillRanks,
  };
}

function skillRankForUi(
  battleId: string,
  cdCtx?: SkillCooldownUiContext
): number {
  const v = cdCtx?.learnedSkillRanks?.[battleId];
  return typeof v === 'number' && v >= 1 ? Math.floor(v) : 1;
}

function resolveUiSkillCooldownSec(
  input: {
    classBranch: string;
    category?: string | null;
    kind?: string | null;
    battleId: string;
    baseCdSec?: number | null;
  },
  cdCtx?: SkillCooldownUiContext
): number | undefined {
  const l2Match = /^l2_(\d+)$/.exec(input.battleId);
  const l2SkillId = l2Match ? parseInt(l2Match[1]!, 10) : undefined;
  const cd = resolveBattleSkillCooldownSec({
    classBranch: input.classBranch,
    category: input.category,
    kind: input.kind,
    skillRank: skillRankForUi(input.battleId, cdCtx),
    baseCdSec: input.baseCdSec,
    l2SkillId,
    castSpd: cdCtx?.castSpd ?? CAST_SPD_BASELINE,
    pAtkSpd: cdCtx?.pAtkSpd ?? PATK_SPD_BASELINE,
    cooldownReductionMul: cdCtx?.cooldownReductionMul,
  });
  return cd > 0 ? cd : undefined;
}

function mysticCooldownSecForBattleAction(
  id: BattleActionId,
  race: string,
  cdCtx?: SkillCooldownUiContext
): number | undefined {
  const s = String(id);
  if (!/^l2_\d+$/.test(s)) return undefined;
  const battleId = canonicalBattleSkillId(s);
  const e = mysticCatalogEntryForRace(race, battleId);
  if (!e || e.kind === 'passive') return undefined;
  const fixed =
    typeof e.cooldownSec === 'number' && e.cooldownSec > 0
      ? e.cooldownSec
      : (() => {
          const m = /^l2_(\d+)$/.exec(battleId);
          if (!m) return null;
          const sid = parseInt(m[1]!, 10);
          const reuseCd = cooldownSecForSkillId(sid);
          return typeof reuseCd === 'number' && reuseCd > 0 ? reuseCd : null;
        })();
  return resolveUiSkillCooldownSec(
    {
      classBranch: cdCtx?.classBranch ?? 'mystic',
      category: catalogEntryCategory(e),
      kind: e.kind,
      battleId,
      baseCdSec: fixed,
    },
    cdCtx
  );
}

/**
 * КД воїна / расового файтера з каталогу (Zealot, Earthquake, …).
 * Дія може приходити або як `l2_<id>`, або як канонічне ім'я (`war_cry`, `battle_roar`,
 * `thrill_fight`, …). Для іменованих конвертуємо через `l2SkillIdForBattleActionIcon`.
 */
function fighterCooldownSecForBattleAction(
  id: BattleActionId,
  race: string,
  classBranch: string,
  cdCtx?: SkillCooldownUiContext
): number | undefined {
  let bid = canonicalBattleSkillId(String(id));
  if (!/^l2_\d+$/.test(bid)) {
    const l2Id = l2SkillIdForBattleActionIcon(id);
    if (!Number.isFinite(l2Id) || l2Id <= 0) return undefined;
    bid = 'l2_' + l2Id;
  }
  const e =
    humanFighterCatalogEntry(bid) ??
    fighterCatalogEntryForRace(race, classBranch, bid);
  if (!e) return undefined;
  let rawCd =
    typeof e.cooldownSec === 'number' && e.cooldownSec > 0 ? e.cooldownSec : null;
  if (rawCd == null) {
    const m = /^l2_(\d+)$/.exec(bid);
    if (m) {
      const sid = parseInt(m[1]!, 10);
      if (Number.isFinite(sid) && sid > 0) {
        const xmlCd = cooldownSecForSkillId(sid);
        if (typeof xmlCd === 'number' && xmlCd > 0) rawCd = xmlCd;
      }
    }
  }
  return resolveUiSkillCooldownSec(
    {
      classBranch,
      category: catalogEntryCategory(e),
      kind: e.kind,
      battleId: bid,
      baseCdSec: rawCd,
    },
    {
      ...(cdCtx ?? {}),
      classBranch,
    }
  );
}

export function battleSkillBarForChar(
  level: number,
  _race: string,
  classBranch: string,
  learnedBattle: string[],
  l2Profession: string,
  _inv?: InventoryState | null,
  cdCtx?: SkillCooldownUiContext
): {
  id: BattleActionId;
  labelUk: string;
  l2SkillId?: number;
  cooldownSec?: number;
}[] {
  const prof = effectiveBattleProfession(l2Profession, classBranch, _race);
  if (isMysticClassBranch(classBranch)) {
    const learnedSet = new Set(
      learnedBattle.map((x) => canonicalBattleSkillId(x))
    );
    const bar = humanMysticBattleSkillBar(level, learnedSet, prof, _race);
    const out: {
      id: BattleActionId;
      labelUk: string;
      l2SkillId: number;
      cooldownSec?: number;
    }[] = bar.map((s) => {
      const cdSec = mysticCooldownSecForBattleAction(s.id, _race, {
        ...(cdCtx ?? {}),
        classBranch,
      });
      return {
        id: s.id,
        labelUk: s.labelUk,
        l2SkillId: l2SkillIdForBattleActionIcon(s.id),
        ...(cdSec != null ? { cooldownSec: cdSec } : {}),
      };
    });
    return filterBattleSkillBarRows(out);
  }
  if (isFighterClassBranch(classBranch)) {
    /**
     * Як text-rpg `SkillBar` / `useLearnedActive`: усі вивчені battle/toggle з каталогу, без пасивок.
     * Обмеження зброї — лише при застосуванні скіла на сервері.
     */
    const out: {
      id: BattleActionId;
      labelUk: string;
      l2SkillId: number;
      cooldownSec?: number;
    }[] = [
      {
        id: 'attack',
        labelUk: 'Атака',
        l2SkillId: l2SkillIdForBattleActionIcon('attack'),
      },
    ];
    const seen = new Set<BattleActionId>(['attack']);
    for (const row of learnedHumanFighterHotbarPickSkills(
      learnedBattle,
      prof,
      _race,
      classBranch
    )) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      const cdPick = fighterCooldownSecForBattleAction(
        row.id,
        _race,
        classBranch,
        {
          ...(cdCtx ?? {}),
          classBranch,
        }
      );
      out.push({
        id: row.id,
        labelUk: row.labelUk,
        l2SkillId: row.l2SkillId,
        ...(cdPick != null ? { cooldownSec: cdPick } : {}),
      });
    }
    return filterBattleSkillBarRows(out);
  }
  return filterBattleSkillBarRows(
    legacyMeleeSkillBar().map((s) => ({
      id: s.id,
      labelUk: s.labelUk,
      l2SkillId: l2SkillIdForBattleActionIcon(s.id),
    }))
  );
}

export function stanceBattleActionAllowed(
  action: BattleActionId,
  learnedBattle: string[],
  l2Profession: string,
  classBranch: string
): boolean {
  const learned = new Set(
    learnedBattle.map((x) => canonicalBattleSkillId(x))
  );
  const prof = String(l2Profession || '').trim();
  const fighterBranch = isFighterClassBranch(classBranch);
  const wTrack =
    prof === 'human_warrior' ||
    prof === 'human_warlord' ||
    prof === 'human_dreadnought' ||
    prof === 'human_gladiator' ||
    prof === 'human_duelist' ||
    prof === 'human_knight' ||
    prof === 'human_paladin' ||
    prof === 'human_phoenix_knight' ||
    prof === 'human_dark_avenger' ||
    prof === 'human_hell_knight' ||
    prof === 'human_rogue' ||
    prof === 'human_treasure_hunter' ||
    prof === 'human_adventurer' ||
    prof === 'human_hawkeye' ||
    prof === 'human_sagittarius' ||
    (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && prof === 'human_fighter') ||
    fighterBranch;
  if (action === 'accuracy_stance') {
    return learned.has('l2_256') && wTrack;
  }
  if (action === 'vicious_stance') {
    return learned.has('l2_312') && wTrack;
  }
  if (action === 'parry_stance') {
    return (
      learned.has('l2_339') &&
      (        prof === 'human_dreadnought' ||
        prof === 'human_duelist' ||
        prof === 'human_phoenix_knight' ||
        prof === 'human_hell_knight' ||
        (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && prof === 'human_fighter') ||
        fighterBranch)
    );
  }
  if (action === 'riposte_stance') {
    return (
      learned.has('l2_340') &&
      (prof === 'human_duelist' ||
        prof === 'orc_grand_khavatari' ||
        prof === 'dwarf_fortune_seeker' ||
        prof === 'dwarf_maestro' ||
        (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && prof === 'human_fighter'))
    );
  }
  return false;
}

export function battleViewFromState(
  spawnId: string,
  st: BattleJsonState,
  spawnMeta: { name: string; level: number; aggressive: boolean; kind: string },
  charLevel: number,
  race: string,
  classBranch: string,
  learnedBattle: string[],
  l2Profession: string,
  inv?: InventoryState | null,
  activeBuffs: readonly ActiveBuffEntry[] = [],
  skillCooldowns: readonly SkillCooldownEntry[] = [],
  cdCtx?: SkillCooldownUiContext
): BattleView {
  const buffs = battleBuffLinesUk(st, activeBuffs);
  const mobDebuffIcons = battleMobDebuffIconsForUi(st);
  const isSonicClass =
    l2Profession === 'human_gladiator' || l2Profession === 'human_duelist';
  const buffIcons = battleBuffIconsForUi(st, activeBuffs).filter((x) =>
    x.key === 'sonic_focus_charges' ? isSonicClass : true
  );
  /**
   * Об'єднуємо in-battle `st.mysticSkillCdUntil` (ключі `l2_<id>`, readyAt ms) з
   * персистентними `skillCooldownsJson` — щоб хотбар (`applySkillCdOverlay`) показав
   * кулдаун War Cry/Battle Roar/Thrill Fight навіть після F5 або при вході в бій
   * після out-of-battle касту. Вибираємо `max(readyAt)` як фактичну межу.
   */
  const mergedCd: Record<string, number> = {};
  const nowMs = Date.now();
  if (st.mysticSkillCdUntil) {
    for (const [key, readyAt] of Object.entries(st.mysticSkillCdUntil)) {
      if (typeof readyAt === 'number' && Number.isFinite(readyAt) && readyAt > nowMs) {
        mergedCd[key] = readyAt;
      }
    }
  }
  for (const cd of skillCooldowns) {
    const key = 'l2_' + cd.skillId;
    if (cd.readyAt <= nowMs) continue;
    const prev = mergedCd[key];
    if (typeof prev !== 'number' || cd.readyAt > prev) {
      mergedCd[key] = cd.readyAt;
    }
  }
  return {
    spawnId,
    mobName: spawnMeta.name,
    mobLevel: spawnMeta.level,
    mobHp: st.mobHp,
    mobMaxHp: st.mobMaxHp,
    ...(typeof st.mobCp === 'number' &&
    typeof st.mobMaxCp === 'number' &&
    st.mobMaxCp > 0
      ? { mobCp: st.mobCp, mobMaxCp: st.mobMaxCp }
      : {}),
    aggressive: spawnMeta.aggressive,
    kind: spawnMeta.kind,
    log: st.log,
    zealotEffectDurationMs: ZEALOT_EFFECT_DURATION_MS,
    skills: battleSkillBarForChar(
      charLevel,
      race,
      classBranch,
      learnedBattle,
      l2Profession,
      inv,
      {
        ...(cdCtx ?? {}),
        classBranch,
      }
    ),
    ...(st.battleMods ? { battleMods: st.battleMods } : {}),
    ...(buffs.length > 0 ? { battleBuffsUk: buffs } : {}),
    ...(mobDebuffIcons.length > 0 ? { mobDebuffIcons } : {}),
    ...(buffIcons.length > 0 ? { battleBuffIcons: buffIcons } : {}),
    ...(Object.keys(mergedCd).length > 0
      ? { mysticSkillCdUntil: mergedCd }
      : {}),
    ...(st.whirlwindExtras && st.whirlwindExtras.length > 0
      ? {
          whirlwindExtras: st.whirlwindExtras.map((e) => ({
            spawnId: e.spawnId,
            name: e.name,
            mobHp: e.mobHp,
            mobMaxHp: e.mobMaxHp,
          })),
        }
      : {}),
    ...(typeof st.sonicCharges === 'number' && st.sonicCharges > 0
      ? { sonicCharges: Math.floor(st.sonicCharges) }
      : {}),
    ...(typeof st.maxSonicCharges === 'number' && st.maxSonicCharges > 0
      ? { sonicMaxCharges: Math.floor(st.maxSonicCharges) }
      : {}),
    battleVersion: battleVersionFromState(st),
    logSeq: battleLogSeqFromState(st),
  };
}

export function battleActionAllowed(
  action: BattleActionId,
  level: number,
  _race: string,
  classBranch: string,
  learnedBattle: string[],
  l2Profession: string,
  _inv?: InventoryState | null
): boolean {
  const prof = effectiveBattleProfession(l2Profession, classBranch, _race);
  if (action === 'fighter_soulshot_toggle') {
    return true;
  }
  if (action === 'mystic_spiritshot_toggle') {
    return true;
  }
  if (action === 'battle_potion_use') {
    return true;
  }
  if (isMysticClassBranch(classBranch)) {
    return mysticBattleActionAllowed(action, level, learnedBattle, prof, _race);
  }
  if (isFighterClassBranch(classBranch)) {
    const act = battleActionNamedFromL2IfMapped(action);
    if (act === 'attack') return true;
    if (
      learnedHumanFighterHotbarPickSkills(
        learnedBattle,
        prof,
        _race,
        classBranch
      ).some((s) => s.id === act)
    ) {
      return true;
    }
    return stanceBattleActionAllowed(act, learnedBattle, prof, classBranch);
  }
  return (
    action === 'attack' ||
    action === 'power' ||
    action === 'bolt' ||
    action === 'stun'
  );
}
