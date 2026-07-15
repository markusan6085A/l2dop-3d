import type { BattleActionId } from '../domain/battle.js';

/**
 * Канонічний `l2_*` → дія в бою (реалізована в humanFighterTurn / заглушка для стійок).
 * Скилів без запису в бою немає в панелі «Магія».
 */
export const CANONICAL_L2_SKILL_TO_BATTLE_ACTION: Partial<
  Record<string, BattleActionId>
> = {
  l2_3: 'power_strike',
  l2_16: 'mortal_blow',
  l2_56: 'power_shot',
  l2_19: 'double_shot',
  l2_24: 'burst_shot',
  l2_99: 'rapid_shot',
  l2_313: 'snipe',
  l2_101: 'stun_shot',
  l2_343: 'lethal_shot',
  l2_354: 'hamstring_shot',
  l2_78: 'war_cry',
  l2_4: 'dash',
  l2_100: 'stun_attack',
  l2_245: 'wild_sweep',
  l2_255: 'power_smash',
  l2_36: 'whirlwind',
  l2_48: 'thunder_storm',
  l2_286: 'provoke',
  l2_256: 'accuracy_stance',
  l2_312: 'vicious_stance',
  l2_339: 'parry_stance',
  l2_340: 'riposte_stance',
  l2_75: 'detect_insect_weakness',
  l2_80: 'detect_monster_weakness',
  l2_87: 'detect_animal_weakness',
  l2_88: 'detect_dragon_weakness',
  l2_104: 'detect_plant_weakness',
  l2_116: 'howl',
  l2_121: 'battle_roar',
  l2_130: 'thrill_fight',
  l2_181: 'revival',
  l2_287: 'lionheart',
  l2_317: 'focus_attack',
  l2_320: 'wrath',
  l2_347: 'earthquake',
  l2_359: 'eye_hunter',
  l2_360: 'eye_slayer',
  l2_361: 'shock_blast',
  l2_30: 'backstab',
  l2_263: 'deadly_blow_dagger',
  l2_12: 'switch_target',
  l2_27: 'unlock',
  l2_51: 'lure',
  l2_60: 'fake_death',
  l2_111: 'ultimate_evasion',
  l2_221: 'silent_move',
  l2_344: 'lethal_blow_adv',
  l2_356: 'focus_chance',
  l2_357: 'focus_power',
  l2_358: 'bluff',
  l2_18: 'aggression',
  l2_44: 'remedy',
  l2_49: 'holy_strike',
  l2_97: 'sanctuary',
  l2_318: 'aegis_stance',
  l2_65: 'horror',
  l2_86: 'reflect_damage',
  l2_103: 'corpse_plague',
  l2_127: 'hamstring_slash',
  l2_283: 'summon_dark_panther',
  l2_322: 'shield_fortress',
  l2_341: 'touch_of_life',
  l2_342: 'touch_of_death',
  l2_350: 'physical_mirror',
  l2_368: 'vengeance',
  /** Zealot (420) — Orc Destroyer / Titan / Tyrant / Grand Khavatari. */
  l2_420: 'zealot',
  /** Gladiator / Duelist — дуальні мечі + sonic-заряди (l2db/text-rpg). */
  l2_1: 'triple_slash',
  l2_5: 'double_sonic_slash',
  l2_6: 'sonic_blaster',
  l2_7: 'sonic_storm',
  l2_8: 'sonic_focus',
  l2_9: 'sonic_buster',
  l2_190: 'fatal_strike',
  l2_260: 'hammer_crush',
  l2_261: 'triple_sonic_slash',
  l2_451: 'sonic_move',
  l2_442: 'sonic_guard',
  l2_345: 'sonic_rage',
};

/** Один `BattleActionId` на один `l2_*` (для рангу з БД у резолвері). */
export const CANONICAL_BATTLE_ID_FOR_ACTION: Partial<
  Record<BattleActionId, string>
> = (() => {
  const m: Partial<Record<BattleActionId, string>> = {};
  for (const [l2id, act] of Object.entries(
    CANONICAL_L2_SKILL_TO_BATTLE_ACTION
  ) as [string, BattleActionId][]) {
    if (m[act] != null && m[act] !== l2id) {
      throw new Error(`BattleActionId ${act} maps to multiple l2 ids`);
    }
    m[act] = l2id;
  }
  return m;
})();

export function canonicalBattleIdForAction(
  action: BattleActionId
): string | undefined {
  return CANONICAL_BATTLE_ID_FOR_ACTION[action];
}

/**
 * Клієнт / маршрут інколи передають `l2_255` замість `power_smash`.
 * Без цього `battleActionAllowed` відхиляє уміння, а людина-воїн не потрапляє в гілку резолвера (race-каталог для Human = null).
 */
export function battleActionNamedFromL2IfMapped(
  action: BattleActionId
): BattleActionId {
  const s = String(action);
  if (!/^l2_\d+$/.test(s)) return action;
  const mapped =
    CANONICAL_L2_SKILL_TO_BATTLE_ACTION[
      s as keyof typeof CANONICAL_L2_SKILL_TO_BATTLE_ACTION
    ];
  return (mapped ?? action) as BattleActionId;
}

/**
 * Той самий `l2SkillId`, що в каталозі магістра (`HUMAN_FIGHTER_SKILL_CATALOG`), для `/game/skill-icon/:id`.
 * `attack` — окремого скіла в каталозі немає; 1 — прийнята нейтральна іконка (як у хотбарі).
 * Для legacy (`power` / `bolt` / `stun`) — іконки загального набору L2, поки немає окремого каталогу магістра.
 */
export function l2SkillIdForBattleActionIcon(action: BattleActionId): number {
  switch (action) {
    case 'attack':
      return 1;
    case 'power_strike':
      return 3;
    case 'mortal_blow':
      return 16;
    case 'power_shot':
      return 56;
    case 'double_shot':
      return 19;
    case 'burst_shot':
      return 24;
    case 'war_cry':
      return 78;
    case 'dash':
      return 4;
    case 'rapid_shot':
      return 99;
    case 'snipe':
      return 313;
    case 'stun_shot':
      return 101;
    case 'lethal_shot':
      return 343;
    case 'hamstring_shot':
      return 354;
    case 'stun_attack':
      return 100;
    case 'wild_sweep':
      return 245;
    case 'power_smash':
      return 255;
    case 'whirlwind':
      return 36;
    case 'thunder_storm':
      return 48;
    case 'provoke':
      return 286;
    case 'accuracy_stance':
      return 256;
    case 'vicious_stance':
      return 312;
    case 'parry_stance':
      return 339;
    case 'riposte_stance':
      return 340;
    case 'detect_insect_weakness':
      return 75;
    case 'detect_monster_weakness':
      return 80;
    case 'detect_animal_weakness':
      return 87;
    case 'detect_dragon_weakness':
      return 88;
    case 'detect_plant_weakness':
      return 104;
    case 'howl':
      return 116;
    case 'battle_roar':
      return 121;
    case 'thrill_fight':
      return 130;
    case 'revival':
      return 181;
    case 'lionheart':
      return 287;
    case 'focus_attack':
      return 317;
    case 'wrath':
      return 320;
    case 'earthquake':
      return 347;
    case 'eye_hunter':
      return 359;
    case 'eye_slayer':
      return 360;
    case 'shock_blast':
      return 361;
    case 'backstab':
      return 30;
    case 'deadly_blow_dagger':
      return 263;
    case 'switch_target':
      return 12;
    case 'unlock':
      return 27;
    case 'lure':
      return 51;
    case 'fake_death':
      return 60;
    case 'ultimate_evasion':
      return 111;
    case 'silent_move':
      return 221;
    case 'lethal_blow_adv':
      return 344;
    case 'focus_chance':
      return 356;
    case 'focus_power':
      return 357;
    case 'bluff':
      return 358;
    case 'aggression':
      return 18;
    case 'remedy':
      return 44;
    case 'holy_strike':
      return 49;
    case 'sanctuary':
      return 97;
    case 'aegis_stance':
      return 318;
    case 'horror':
      return 65;
    case 'reflect_damage':
      return 86;
    case 'corpse_plague':
      return 103;
    case 'hamstring_slash':
      return 127;
    case 'summon_dark_panther':
      return 283;
    case 'shield_fortress':
      return 322;
    case 'touch_of_life':
      return 341;
    case 'touch_of_death':
      return 342;
    case 'physical_mirror':
      return 350;
    case 'vengeance':
      return 368;
    case 'zealot':
      return 420;
    case 'triple_slash':
      return 1;
    case 'double_sonic_slash':
      return 5;
    case 'sonic_blaster':
      return 6;
    case 'sonic_storm':
      return 7;
    case 'sonic_focus':
      return 8;
    case 'sonic_buster':
      return 9;
    case 'fatal_strike':
      return 190;
    case 'hammer_crush':
      return 260;
    case 'triple_sonic_slash':
      return 261;
    case 'sonic_move':
      return 451;
    case 'sonic_guard':
      return 442;
    case 'sonic_rage':
      return 345;
    case 'power':
      return 3;
    case 'bolt':
      /** 117 у пакеті іконок часто відсутній → placeholder; 1177 — «Удар вітру» (той самий слот у UI мага). */
      return 1177;
    case 'stun':
      return 100;
    default: {
      const a = String(action);
      if (/^l2_\d+$/.test(a)) {
        const id = Number(a.slice(3));
        if (Number.isFinite(id) && id > 0) return id;
      }
      return 1177;
    }
  }
}
