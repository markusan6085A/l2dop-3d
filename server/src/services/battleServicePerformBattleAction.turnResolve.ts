import {
  jsonFiniteNum,
  type BattleActionId,
  type BattleBattleMods,
  type BattleJsonState,
} from '../domain/battle.js';
import type { ActiveBuffEntry } from '../data/l2dopActiveBuffs.js';
import type { CombatStatsSnapshot } from '../data/l2dopCombatFormulas.js';
import type { InventoryState } from '../data/inventory.js';
import {
  equippedWeaponKind,
  isFighterClassBranch,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { battleActionNamedFromL2IfMapped } from '../data/humanFighterSkillCatalog.js';
import { MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS } from '../data/mysticBlessedSpiritshot.js';
import { resolveMagicBoltHit } from '../data/l2dopHitResolution.js';
import { resolvePlayerBattleTurn } from '../domain/battleSkills/index.js';
import type { BattleSkillTurnResult } from '../domain/battleSkills/types.js';
import {
  applyBattlePotionHoTTicks,
  startBattlePotionHoT,
} from '../domain/battleCombatPotions.js';
import { applyFighterSoulshotToggle } from '../domain/battleFighterSoulshotToggle.js';
import { applyMysticBlessedSpiritshotToggle } from '../domain/battleMysticBlessedSpiritshotToggle.js';
import { stripChargeShotsIfWeaponGradeMismatch } from '../domain/battleChargeGradeSanitize.js';
import { assertBowArrowsForBattleAction } from '../domain/battleBowArrowConsumption.js';
import { rollPlayerPhysicalDmg } from './battleServiceDamageRolls.js';

export type BattleTurnResolveInput = {
  action: BattleActionId;
  preLevel: number;
  race: string;
  classBranch: string;
  profAct: string;
  combat: CombatStatsSnapshot;
  st: BattleJsonState;
  spawnLevel: number;
  spawnStunResistPct?: number;
  spawnDebuffResistPct?: number;
  spawnMobName: string;
  spawnKind?: import('../data/mapWorldSpawns.js').MapWorldSpawn['kind'];
  playerHp: number;
  maxHpBattle: number;
  maxMpEff: number;
  currentMp: number;
  mobEva: number;
  inv: InventoryState;
  learnedSkillLevelByBattleId: Record<string, number>;
  activeBuffsPre: ActiveBuffEntry[];
  modsForPlayerPhysicalRoll?: BattleBattleMods;
  nowMsTurn: number;
  log: string[];
  opts?: {
    fighterSoulshotItemId?: number;
    mysticSpiritshotItemId?: number;
    battlePotionItemId?: number;
  };
};

export type BattleTurnResolveOutput = {
  inv: InventoryState;
  inventoryDirty: boolean;
  playerHp: number;
  currentMp: number;
  resolvedTurn: BattleSkillTurnResult;
};

export function executeBattleTurnResolve(
  input: BattleTurnResolveInput
): BattleTurnResolveOutput {
  const {
    action,
    preLevel,
    race,
    classBranch,
    profAct,
    combat,
    st,
    spawnLevel,
    spawnStunResistPct,
    spawnDebuffResistPct,
    spawnMobName,
    spawnKind,
    maxHpBattle,
    maxMpEff,
    mobEva,
    learnedSkillLevelByBattleId,
    activeBuffsPre,
    modsForPlayerPhysicalRoll,
    nowMsTurn,
    log,
    opts,
  } = input;

  let inv = input.inv;
  let inventoryDirty = false;
  let playerHp = input.playerHp;
  let currentMp = input.currentMp;

  if (action === 'fighter_soulshot_toggle') {
    const raw = opts?.fighterSoulshotItemId;
    const sid =
      typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : NaN;
    if (!Number.isFinite(sid) || sid <= 0) {
      throw new Error('battle_soulshot_bad_item');
    }
    applyFighterSoulshotToggle({
      st,
      inv,
      log,
      classBranch,
      itemId: sid,
    });
  }

  if (action === 'mystic_spiritshot_toggle') {
    const raw = opts?.mysticSpiritshotItemId;
    const sid =
      typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : NaN;
    if (!Number.isFinite(sid) || sid <= 0) {
      throw new Error('mystic_spiritshot_bad_item');
    }
    applyMysticBlessedSpiritshotToggle({
      st,
      inv,
      log,
      classBranch,
      itemId: sid,
    });
  }

  if (action === 'battle_potion_use') {
    const raw = opts?.battlePotionItemId;
    const pid =
      typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : NaN;
    if (!Number.isFinite(pid) || pid <= 0) {
      throw new Error('battle_bad_potion');
    }
    inv = startBattlePotionHoT({
      st,
      inv,
      log,
      itemId: pid,
      nowMs: nowMsTurn,
    });
    const hoNow = applyBattlePotionHoTTicks({
      nowMs: nowMsTurn,
      st,
      playerHp,
      maxHpBattle,
      currentMp,
      maxMpEff,
      log,
    });
    playerHp = hoNow.playerHp;
    currentMp = hoNow.currentMp;
    st.playerMp = currentMp;
    inventoryDirty = true;
  }

  stripChargeShotsIfWeaponGradeMismatch({
    inv,
    st,
    log,
    classBranch,
  });

  const skipResolveTurn =
    action === 'fighter_soulshot_toggle' ||
    action === 'mystic_spiritshot_toggle' ||
    action === 'battle_potion_use';

  if (!skipResolveTurn) {
    assertBowArrowsForBattleAction(action, inv, race, classBranch);
  }

  const resolvedTurn: BattleSkillTurnResult = skipResolveTurn
    ? {
        mpCost: 0,
        pDmg: 0,
        skillLine: '',
        physOutcome: null,
        magicOutcome: null,
      }
    : resolvePlayerBattleTurn(
        {
          action,
          preLevel,
          race,
          classBranch,
          l2Profession: profAct,
          combat,
          st,
          spawnLevel,
          spawnStunResistPct,
          spawnDebuffResistPct,
          spawnMobName,
          spawnKind,
          playerHpInBattle: playerHp,
          playerMaxHpInBattle: maxHpBattle,
          weaponKind: equippedWeaponKind(inv),
          learnedSkillLevelByBattleId,
          activeBuffs: activeBuffsPre,
        },
        (atk, options) =>
          rollPlayerPhysicalDmg(
            atk,
            combat,
            st,
            spawnLevel,
            spawnMobName,
            learnedSkillLevelByBattleId,
            modsForPlayerPhysicalRoll,
            {
              ...(options ?? {}),
              forceNoMiss:
                options?.forceNoMiss ??
                (isFighterClassBranch(classBranch) &&
                  battleActionNamedFromL2IfMapped(action) !== 'attack'),
            }
          ),
        () => {
          const mm =
            jsonFiniteNum(modsForPlayerPhysicalRoll?.mysticMatkBuffMul) ?? 1;
          let mAtkEff = Math.max(
            1,
            Math.floor(combat.mAtk * (mm > 1 ? mm : 1))
          );
          if (isMysticClassBranch(classBranch) && st.battleMods) {
            const bMul = jsonFiniteNum(
              st.battleMods.mysticBlessedSpiritshotMatkMul
            );
            const bRaw = st.battleMods.mysticBlessedSpiritshotItemId;
            const bId =
              typeof bRaw === 'number' && Number.isFinite(bRaw)
                ? Math.floor(bRaw)
                : undefined;
            if (
              bMul !== undefined &&
              bMul > 1 &&
              bId !== undefined &&
              bId > 0 &&
              MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS.has(bId)
            ) {
              mAtkEff = Math.max(1, Math.floor(mAtkEff * bMul));
            }
          }
          const mobMdefMul =
            jsonFiniteNum(modsForPlayerPhysicalRoll?.mobTargetMDefMul) ?? 1;
          const mobMDefEff =
            mobMdefMul > 0 && mobMdefMul < 1
              ? Math.max(1, Math.floor(st.mobMDef * mobMdefMul))
              : st.mobMDef;
          return resolveMagicBoltHit({
            mAtk: mAtkEff,
            mobMDef: mobMDefEff,
            playerInt: combat.int,
            playerWit: combat.wit,
            playerMen: combat.men,
            playerLevel: preLevel,
            mobEvasion: mobEva,
            mCritPct: combat.mCritPct,
            magicCritDmgMul: combat.magicCritDmgMul,
          });
        }
      );

  return {
    inv,
    inventoryDirty,
    playerHp,
    currentMp,
    resolvedTurn,
  };
}
