import type { BattleActionId, BattleJsonState } from '../domain/battle.js';
import type { DragonBossConfig } from '../domain/dragonDungeon.js';
import { jsonFiniteNum } from '../domain/battle.js';
import { computeCombatStats, playerHasEquippedShield } from '../data/l2dopCombatFormulas.js';
import { parseInventory } from '../data/inventory.js';
import { equippedWeaponKind, isFighterClassBranch } from '../data/l2dopHumanFighterBattleSkills.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  battleActionNamedFromL2IfMapped,
  normalizeLearnedSkillsJson,
} from '../data/humanFighterSkillCatalog.js';
import { filterLearnedSkillEntriesForCharacter } from '../data/charLearnedSkillsFilter.js';
import { resolvePlayerBattleTurn } from '../domain/battleSkills/index.js';
import { resolveMagicBoltHit } from '../data/l2dopHitResolution.js';
import { MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS } from '../data/mysticBlessedSpiritshot.js';
import { rollPlayerPhysicalDmg, mobEvasionForBattle } from './battleServiceDamageRolls.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusInTx,
} from './characterClanHallVitals.js';
import { combatOptsFromRow, type CharacterRow } from './charService.js';
import type { Prisma } from '@prisma/client';
import { parseWorldCombatState } from '../domain/worldCombatState.js';
import { mergeDisplayBattleMods } from '../domain/combatDisplayContext.js';
import { persistableActiveBuffsFromJson } from '../data/l2dopActiveBuffs.js';

export type DragonPlayerAttackResult = {
  damage: number;
  logLine: string;
  mpCost: number;
  playerMpAfter: number;
};

function syntheticBattleJson(playerMp: number, boss: DragonBossConfig): BattleJsonState {
  return {
    spawnId: 'dragon_dungeon',
    mobHp: 1,
    mobMaxHp: 1,
    mobPAtk: 100,
    mobPDef: boss.combat.mobPDef,
    mobMAtk: 100,
    mobMDef: boss.combat.mobMDef,
    log: [],
    playerMp,
    battleMods: {},
  };
}

export async function rollDragonDungeonPlayerDamage(
  tx: Prisma.TransactionClient,
  row: CharacterRow,
  boss: DragonBossConfig,
  actionRaw: unknown,
  playerMp: number
): Promise<DragonPlayerAttackResult> {
  const action = String(actionRaw ?? 'attack').trim() as BattleActionId;
  const nowMs = Date.now();
  const clanHallBonus = await resolveClanHallBonusInTx(tx, row);
  const worldSt = parseWorldCombatState(row.worldCombatStateJson);
  const vitals = computeCharacterVitalsBundle({
    row,
    clanHallBonus,
    worldBattleMods: worldSt?.battleMods,
  });
  const effLv = levelFromTotalExp(row.exp);
  const inv = parseInventory(row.inventoryJson);
  const learnedEntries = filterLearnedSkillEntriesForCharacter(
    normalizeLearnedSkillsJson(row.skillsLearnedJson),
    row.race,
    row.classBranch,
    row.l2Profession
  );
  const learnedMap: Record<string, number> = {};
  for (const e of learnedEntries) learnedMap[e.battleId] = e.level;

  const st = syntheticBattleJson(playerMp, boss);
  const effectiveMods = mergeDisplayBattleMods(
    worldSt?.battleMods,
    st.battleMods
  );
  const combat = vitals.combatWithClan;
  const maxHpBattle = vitals.maxHpChain.maxHpWithClanHall;
  const mobEva = mobEvasionForBattle(st, boss.combat.mobLevel);
  const activeBuffsPre = persistableActiveBuffsFromJson(row.activeBuffsJson, nowMs);

  const turn = resolvePlayerBattleTurn(
    {
      action,
      preLevel: effLv,
      race: row.race,
      classBranch: row.classBranch,
      l2Profession: row.l2Profession,
      combat,
      st,
      spawnLevel: boss.combat.mobLevel,
      spawnMobName: boss.nameEn,
      playerHpInBattle: row.hp,
      playerMaxHpInBattle: maxHpBattle,
      weaponKind: equippedWeaponKind(inv),
      hasEquippedShield: playerHasEquippedShield(inv.eq),
      learnedSkillLevelByBattleId: learnedMap,
      activeBuffs: activeBuffsPre,
    },
    (atk, options) =>
      rollPlayerPhysicalDmg(
        atk,
        computeCombatStats(
          effLv,
          row.race,
          row.classBranch,
          inv,
          combatOptsFromRow(row)
        ),
        st,
        boss.combat.mobLevel,
        boss.nameEn,
        learnedMap,
        effectiveMods,
        {
          ...(options ?? {}),
          weaponKind: equippedWeaponKind(inv),
          forceNoMiss:
            options?.forceNoMiss ??
            (isFighterClassBranch(row.classBranch) &&
              battleActionNamedFromL2IfMapped(action) !== 'attack'),
        }
      ),
    () => {
      const mm = jsonFiniteNum(effectiveMods?.mysticMatkBuffMul) ?? 1;
      let mAtkEff = Math.max(1, Math.floor(combat.mAtk * (mm > 1 ? mm : 1)));
      if (isMysticClassBranch(row.classBranch) && st.battleMods) {
        const bMul = jsonFiniteNum(st.battleMods.mysticBlessedSpiritshotMatkMul);
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
      const mobMdefMul = jsonFiniteNum(effectiveMods?.mobTargetMDefMul) ?? 1;
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
        playerLevel: effLv,
        mobEvasion: mobEva,
      });
    }
  );

  const dmg = Math.max(0, Math.floor(turn.pDmg ?? 0));
  const mpAfter = Math.max(0, playerMp - Math.max(0, turn.mpCost ?? 0));
  const logLine =
    turn.skillLine?.trim() ||
    (dmg <= 0 ? 'Промах!' : `Ви завдали ${dmg} урону.`);
  return {
    damage: dmg,
    logLine,
    mpCost: Math.max(0, turn.mpCost ?? 0),
    playerMpAfter: mpAfter,
  };
}
