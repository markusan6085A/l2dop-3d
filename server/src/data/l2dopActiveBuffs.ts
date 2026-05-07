/**
 * Активні бафи — спочатку **text-rpg** (`textRpgHfActiveBuffDelta` для Human Fighter з `TEXT_RPG_HF_BUFF_EFFECTS`),
 * інакше cs1-правила нижче. Для skillId з `textRpgHfOwnsActiveBuffSkillId` cs1 **не** реєструється в мапі — без дубля з rawdata.
 *
 * Ланцюг elseif з l2dop `cs1.php` для **`users_buffs`** (~рядки 1728–2307) — лише для id, яких немає в generated HF.
 *
 * Окремо в PHP йде цикл **`users_skills`** (~1431+): майстерності, кланові бафи, 137/228 тощо з умовами `$cont`.
 * Ті ефекти **не з цього JSON**; якщо потрібен паритет — окреме джерело (`skillsLearnedJson` / пасиви).
 *
 * Відомі «криві» місця в PHP (для звірки): `1096` і `7029` мають дубль-пізні гілки (перший elseif уже з’їв id);
 * `1340` + «Light Vortex» друга гілка недосяжна після Ice; `317` Focus + polearm — друга гілка недосяжна.
 *
 * Формат `activeBuffsJson`: `[{ "skillId": number, "level": number, "expiresAt"?: number }, ...]`
 * або рядкова форма `"1068:3"` / `"1068:3@<expiresAtMs>"`. `expiresAt` у мс epoch — мітка
 * кінця дії бафа за Interlude (див. `l2dopBuffDurations.ts`); без поля — постійний.
 * Прострочені записи зрізаються `stripExpiredActiveBuffs` і всередині `combatBuffsFromActiveJson`.
 *
 * Таблиці рівнів: rawdata.php → l2dopRawdataBuffTables.
 */

import type { InventoryState } from './inventory.js';
import { normalizeEqSlot } from './inventory.js';
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';
import {
  applyBuffDelta,
  neutralCombatBuffs,
} from './l2dopCombatBuffModifiers.js';
import {
  textRpgHfActiveBuffDelta,
  textRpgHfOwnsActiveBuffSkillId,
} from './textRpgHfActiveBuffApply.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import {
  L2DOP_ACUMEN,
  L2DOP_AGILITY,
  L2DOP_BOP,
  L2DOP_BTB,
  L2DOP_BTS,
  L2DOP_CRITICAL_CHANCE,
  L2DOP_CURSEOFSHADE,
  L2DOP_DASH,
  L2DOP_DEACC,
  L2DOP_DEADEYEACC,
  L2DOP_DEADEYEPATK,
  L2DOP_DEASPD,
  L2DOP_EMPOWER,
  L2DOP_FASTCAST,
  L2DOP_FOCUS,
  L2DOP_FRENZY,
  L2DOP_FRENZY2HS,
  L2DOP_FRENZY2HSACC,
  L2DOP_GREATER_MIGHT,
  L2DOP_GREATER_SHIELD,
  L2DOP_GUIDANCE,
  L2DOP_GUTS,
  L2DOP_HASTE,
  L2DOP_HAWKEYE,
  L2DOP_HEX,
  L2DOP_HSMALARIA,
  L2DOP_HSCHOLACC,
  L2DOP_HSCHOLEVA,
  L2DOP_MAGIC_BARRIER,
  L2DOP_MAJESTY,
  L2DOP_MAJESTY_EVA,
  L2DOP_MIGHT,
  L2DOP_PGIFT,
  L2DOP_RAGE,
  L2DOP_RAGE2HS,
  L2DOP_RAGE2HSACC,
  L2DOP_RAPIDFIRE,
  L2DOP_RAPIDSHOT,
  L2DOP_SEOS,
  L2DOP_SHIELD,
  L2DOP_SLOW,
  L2DOP_SNIPE,
  L2DOP_SNIPEACC,
  L2DOP_SOULOFSAG,
  L2DOP_STEALTH,
  L2DOP_STEALTHEVA,
  L2DOP_TGOP,
  L2DOP_THRILLFIGHT,
  L2DOP_TTOP,
  L2DOP_TWOP,
  L2DOP_UDMDEF,
  L2DOP_UDPDEF,
  L2DOP_UE,
  L2DOP_WEAKNESS,
  L2DOP_WINDWALK,
  l2dopTableAt,
} from './l2dopRawdataBuffTables.js';

export type ActiveBuffEntry = {
  skillId: number;
  level: number;
  /** Мс epoch — по досягненні `nowMs >= expiresAt` баф знімається (L2 abnormalTime). */
  expiresAt?: number;
};

/** Контекст зброї для гілок як $WpnMAS / $WpnType у cs1.php */
export type BuffWeaponContext = {
  /** $WpnMAS == "Bow" */
  isBow: boolean;
  /** $WpnType == "2hs" OR "2hb" */
  isTwoHandHeavy: boolean;
  /** $WpnType == "Duals" */
  isDualWield: boolean;
};

export const DEFAULT_BUFF_WEAPON_CONTEXT: BuffWeaponContext = {
  isBow: false,
  isTwoHandHeavy: false,
  isDualWield: false,
};

/**
 * Додатковий контекст (не з JSON бафів): геройський режим, стеки Zealot.
 * `zealotDarkElf` — як cs1 `if ($job=="DE")` біля Zealot: +33×stacks до гілки криту (у PHP $AddCRIT30).
 */
export type BuffExtraContext = {
  heroicTier?: 1 | 2 | 3;
  zealotStacks?: number;
  /** Наближення: расa «Dark Elf» (cs1 job DE). */
  zealotDarkElf?: boolean;
};

export const DEFAULT_BUFF_EXTRA: BuffExtraContext = {};

export function buffWeaponContextFromInv(
  inv: InventoryState
): BuffWeaponContext {
  const wSlot = normalizeEqSlot(inv.eq?.l1);
  const wId = wSlot?.itemId;
  if (!wId || typeof wId !== 'number') return DEFAULT_BUFF_WEAPON_CONTEXT;
  const m = ITEM_CATALOG[wId];
  const wt = m?.weaponType;
  return {
    isBow: wt === 'bow',
    isTwoHandHeavy: wt === 'bigsword' || wt === 'bigblunt',
    isDualWield: wt === 'dual',
  };
}

type BuffApply = (
  lvl: number,
  ctx: BuffWeaponContext,
  extra?: BuffExtraContext
) => Partial<L2dopCombatBuffModifiers>;

type Rule = { ids: readonly number[]; apply: BuffApply };

// --- Skill id з cs1.php (коментарі = місце в файлі для аудиту) ---

const ACC_DEBUFF_IDS = [412, 1096, 1222] as const;

const ACUMEN_IDS = [
  1085, 2053, 2313, 3047, 4329, 4355, 4400, 4595, 4601, 4631, 4632, 4633,
  4634, 4635, 4636, 4637, 4638, 4639, 5215, 7048,
] as const;

const AGILITY_IDS = [
  1087, 381, 2055, 2315, 3139, 3221, 3247, 4406, 5161, 7047,
] as const;

const ANGELIC_IDS = [406] as const;

const ARMOR_CRUSH_IDS = [362] as const;

const ASPD_DOWN_IDS = [102, 105, 109, 127] as const;

const BERSERKER_IDS = [1062] as const;

const BLINDING_IDS = [321, 5084] as const;
const BLOCK_SHIELD_IDS = [1358, 1360] as const;
const BLOCK_WW_IDS = [1359, 1361] as const;

const CURSE_GLOOM_IDS = [1263, 4480] as const;
const CURSE_ABYSS_IDS = [1337] as const;
const CURSE_DOOM_IDS = [1336] as const;
const CURSE_SHADE_IDS = [4705, 4706] as const;

const DANCE_CONC_IDS = [276] as const;
const DANCE_FURY_IDS = [275] as const;
const DANCE_INSP_IDS = [272] as const;
const DANCE_MYST_IDS = [273] as const;
const DANCE_SHADOW_IDS = [366] as const;
const DANCE_WARR_IDS = [271] as const;

const DASH_IDS = [4, 4048] as const;

const DEAD_EYE_IDS = [414] as const;

const EMPOWER_IDS = [
  378, 1059, 2056, 2316, 3072, 3076, 3133, 3216, 3141, 3575, 4264, 4331, 4356,
  4401, 4632, 4633, 4634, 4638, 4639, 5156, 5217, 7054,
] as const;

const EVADE_SHOT_IDS = [369] as const;
const FIRE_VORTEX_IDS = [1339] as const;

const FOCUS_IDS = [
  317, 356, 357, 1077, 2052, 2312, 3010, 3011, 3027, 3044, 3050, 3051, 3071,
  3141, 3223, 3249, 3565, 3566, 3567, 4359, 4404, 4601, 4610, 4645, 5163, 7041,
] as const;

const FOCUS_DEATH_IDS = [355] as const;
const FRENZY_IDS = [176, 290] as const;

const GREATER_MIGHT_IDS = [1388, 7057] as const;
const GREATER_SHIELD_IDS = [1389, 7058] as const;

const GUIDANCE_IDS = [
  380, 1240, 2050, 2310, 3007, 3008, 3046, 3064, 3065, 3140, 3222, 3248, 3573,
  3602, 4358, 4403, 5162, 7044,
] as const;

const GUTS_IDS = [139] as const;

const HASTE_IDS = [
  1086, 1141, 1282, 2011, 2034, 2054, 2169, 2314, 3032, 3033, 3034, 3036,
  3037, 3038, 3045, 3056, 3068, 3564, 3601, 4074, 4175, 4213, 4263, 4327, 4357,
  4402, 4575, 4588, 4644, 5079, 5080, 5213, 7029, 7043,
] as const;

const HAWK_EYE_IDS = [131] as const;

const HOT_CHOLERA_IDS = [4552] as const;
const HOT_MALARIA_IDS = [4554] as const;

const ICE_VORTEX_IDS = [1340] as const;

const MAGIC_BARRIER_IDS = [
  1036, 3136, 3219, 3245, 4349, 4396, 5159, 7052,
] as const;

const MAJESTY_IDS = [82] as const;

const MIGHT_IDS = [
  376, 1068, 2057, 2317, 3132, 3134, 3215, 3217, 3240, 3243, 4028, 4030, 4173,
  4211, 4265, 4345, 4393, 4585, 4647, 5080, 5154, 5157, 7050,
] as const;

const WEAKNESS_IDS = [1164] as const;
const HEX_DEBUFF_IDS = [122, 4481] as const;

const PROPHECY_FIRE_IDS = [1363, 7064] as const;
const PROPHECY_EARTH_IDS = [1356, 7062] as const;
const PROPHECY_WIND_IDS = [1355, 7061] as const;
const PROPHECY_WATER_IDS = [1357, 7063] as const;

const RAGE_IDS = [94, 1253] as const;

const RAPID_FIRE_IDS = [413] as const;
const RAPID_SHOT_IDS = [99] as const;

const SEAL_DESPAIR_IDS = [1366] as const;

const SHIELD_IDS = [
  1040, 2059, 2319, 3135, 3218, 3244, 4029, 4174, 4212, 4266, 4323, 4344,
  4576, 4595, 4631, 4648, 5158, 5209, 7051,
] as const;

const SHOCK_BLAST_IDS = [361] as const;

const SLOW_IDS = [
  1160, 1268, 3083, 3096, 3111, 3187, 3226, 3574, 3594, 4247, 4248, 4250, 4251,
  4252, 4253, 4254, 4255, 4258, 4493, 4564, 4567, 4570, 4623, 4651, 4656, 4666,
  4669, 5166,
] as const;

const SNIPE_IDS = [313] as const;

const BLESS_BODY_IDS = [
  1045, 3124, 3208, 4324, 4347, 4394, 5147, 5210, 7045,
] as const;
const BLESS_SOUL_IDS = [
  1048, 3128, 3211, 4328, 4348, 4395, 5150, 5214, 7046,
] as const;

const SONG_EARTH_IDS = [264] as const;
const SONG_HUNTER_IDS = [269] as const;
const SONG_VITALITY_IDS = [304] as const;
const SONG_WARDING_IDS = [267] as const;
const SONG_WATER_IDS = [266] as const;
const SONG_WIND_IDS = [268] as const;
const SOUL_SAG_IDS = [303] as const;

const STEALTH_IDS = [411, 3159] as const;

const THRILL_FIGHT_IDS = [130] as const;

const TOTEM_VAMPIRE_IDS = [76, 4089] as const;
const TOTEM_VAMPIRE2_IDS = [425] as const;
const TOTEM_SHIELD_IDS = [109, 4091] as const;
const TOTEM_BERSERK_IDS = [282, 4092] as const;
const TOTEM_GHOST_IDS = [298] as const;
const TOTEM_WW_IDS = [83, 4090] as const;
/** Тотем: у PHP модифікує $BuffPATK60 — наближення на основі P.Atk. */
const TOTEM_PATK60_IDS = [292] as const;

const TOUCH_DEATH_IDS = [342] as const;

const ULT_DEF_IDS = [110, 5044] as const;
const ULT_EVA_IDS = [111, 4103] as const;

const WIND_VORTEX_IDS = [1341] as const;

const WIND_WALK_IDS = [
  1204, 2058, 2318, 4262, 4322, 4342, 4391, 4468, 5208,
] as const;

const PAAGRIAN_GIFT_IDS = [1003] as const;
const SEAL_SCOURGE_IDS = [1247] as const;

const SEAL_WINTER_IDS = [1104] as const;

const GLORY_PA_ORC_IDS = [1008] as const;
const TACT_PA_ORC_IDS = [1260] as const;
const WISDOM_PA_ORC_IDS = [1004] as const;
const BLESS_PA_ORC_IDS = [1005] as const;
const SEAL_SLOW_IDS = [1099] as const;

const PAAGRIAN_RAGE_IDS = [1261] as const;

const HERO_IDS = [395, 396, 1374, 1375, 1376] as const;
const ZEALOT_IDS = [420] as const;

const POTION_LESSER_HP_IDS = [2031] as const;
const POTION_HP_IDS = [2032] as const;
const POTION_GREATER_HP_IDS = [2037] as const;
const MANA_DRUG_IDS = [2003] as const;

const CRITICAL_CHANCE_IDS = [137, 4086] as const;
const FAST_CAST_IDS = [228, 4642] as const;

function paagrioRageDelta(
  lvl: number
): Partial<L2dopCombatBuffModifiers> {
  const L = Math.floor(lvl);
  if (L <= 1) {
    return {
      buffMatk: 1.1,
      buffPatk: 1.05,
      buffPdef: 0.95,
      buffMdef: 0.9,
      buffCast: 1.05,
      buffAspd: 1.05,
      addSpeed: 5,
      buffEva: 2,
    };
  }
  return {
    buffMatk: 1.16,
    buffPatk: 1.08,
    buffPdef: 0.92,
    buffMdef: 0.84,
    buffCast: 1.08,
    buffAspd: 1.08,
    addSpeed: 8,
    buffEva: 4,
  };
}

/**
 * Правила в **строго такому ж порядку**, як elseif у cs1.php (перший збіг для skillId).
 */
const ORDERED_BUFF_RULES: Rule[] = [
  {
    ids: ACC_DEBUFF_IDS,
    apply: (lvl) => ({ buffAcc: -l2dopTableAt(L2DOP_DEACC, lvl) }),
  },
  {
    ids: ACUMEN_IDS,
    apply: (lvl) => ({ buffCast: l2dopTableAt(L2DOP_ACUMEN, lvl) }),
  },
  {
    ids: AGILITY_IDS,
    apply: (lvl) => ({ buffEva: l2dopTableAt(L2DOP_AGILITY, lvl) }),
  },
  {
    ids: ANGELIC_IDS,
    apply: () => ({
      buffAspd: 1.3,
      buffAcc: 6,
      addSpeed: 30,
      addCrit: 100,
      buffPdef: 1.5,
      buffMdef: 1.5,
    }),
  },
  {
    ids: ARMOR_CRUSH_IDS,
    apply: () => ({ buffPdef: 0.7, buffMdef: 0.7 }),
  },
  {
    ids: ASPD_DOWN_IDS,
    apply: (lvl) => ({ buffAspd: l2dopTableAt(L2DOP_DEASPD, lvl) }),
  },
  {
    ids: BERSERKER_IDS,
    apply: () => ({
      buffPatk: 1.05,
      buffPdef: 0.95,
      buffMatk: 1.1,
      buffMdef: 0.9,
      buffEva: -2,
      addSpeed: 5,
      buffAspd: 1.05,
      buffCast: 1.05,
    }),
  },
  {
    ids: BLESS_BODY_IDS,
    apply: (lvl) => ({ buffMaxHp: l2dopTableAt(L2DOP_BTB, lvl) }),
  },
  {
    ids: BLESS_SOUL_IDS,
    apply: (lvl) => ({ buffMaxMp: l2dopTableAt(L2DOP_BTS, lvl) }),
  },
  {
    ids: BLINDING_IDS,
    apply: () => ({ buffSpeed: 1.4 }),
  },
  {
    ids: BLOCK_SHIELD_IDS,
    apply: () => ({ buffPdef: 0.9 }),
  },
  {
    ids: BLOCK_WW_IDS,
    apply: () => ({ buffSpeed: 0.9 }),
  },
  {
    ids: CURSE_GLOOM_IDS,
    apply: () => ({ buffMdef: 0.77 }),
  },
  {
    ids: CURSE_ABYSS_IDS,
    apply: () => ({
      buffMatk: 0.7,
      buffEva: -6,
      buffSpeed: 0.9,
      buffCast: 0.8,
    }),
  },
  {
    ids: CURSE_DOOM_IDS,
    apply: () => ({ buffPatk: 0.83 }),
  },
  {
    ids: CURSE_SHADE_IDS,
    apply: (lvl) => {
      const k = l2dopTableAt(L2DOP_CURSEOFSHADE, lvl);
      return { buffPdef: k, buffMdef: k };
    },
  },
  {
    ids: DANCE_CONC_IDS,
    apply: () => ({ buffCast: 1.3 }),
  },
  {
    ids: DANCE_FURY_IDS,
    apply: () => ({ buffAspd: 1.15 }),
  },
  {
    ids: DANCE_INSP_IDS,
    apply: () => ({ buffAcc: 4 }),
  },
  {
    ids: DANCE_MYST_IDS,
    apply: () => ({ buffMatk: 1.2 }),
  },
  {
    ids: DANCE_SHADOW_IDS,
    apply: () => ({ buffSpeed: 0.5 }),
  },
  {
    ids: DANCE_WARR_IDS,
    apply: () => ({ buffPatk: 1.12 }),
  },
  {
    ids: DASH_IDS,
    apply: (lvl) => ({ buffSpeed: l2dopTableAt(L2DOP_DASH, lvl) }),
  },
  {
    ids: DEAD_EYE_IDS,
    apply: (lvl, ctx) => {
      if (!ctx.isBow) return {};
      return {
        addPatk: l2dopTableAt(L2DOP_DEADEYEPATK, lvl),
        buffAcc: l2dopTableAt(L2DOP_DEADEYEACC, lvl),
        buffAspd: 0.8,
      };
    },
  },
  {
    ids: EMPOWER_IDS,
    apply: (lvl) => ({ buffMatk: l2dopTableAt(L2DOP_EMPOWER, lvl) }),
  },
  {
    ids: EVADE_SHOT_IDS,
    apply: () => ({ buffEva: 6 }),
  },
  {
    ids: FIRE_VORTEX_IDS,
    apply: () => ({
      buffSpeed: 0.9,
      buffAspd: 0.7,
      buffCast: 0.9,
    }),
  },
  {
    ids: FOCUS_IDS,
    apply: (lvl) => ({
      subcriticalMulOfBase: l2dopTableAt(L2DOP_FOCUS, lvl),
    }),
  },
  {
    ids: FOCUS_DEATH_IDS,
    apply: () => ({ subcriticalMulOfBase: -0.3 }),
  },
  {
    ids: FRENZY_IDS,
    apply: (lvl, ctx) => {
      if (ctx.isTwoHandHeavy) {
        return {
          buffPatk: l2dopTableAt(L2DOP_FRENZY2HS, lvl),
          buffAcc: l2dopTableAt(L2DOP_FRENZY2HSACC, lvl),
        };
      }
      return { buffPatk: l2dopTableAt(L2DOP_FRENZY, lvl) };
    },
  },
  {
    ids: GREATER_MIGHT_IDS,
    apply: (lvl) => ({
      buffPatk: l2dopTableAt(L2DOP_GREATER_MIGHT, lvl),
    }),
  },
  {
    ids: GREATER_SHIELD_IDS,
    apply: (lvl) => ({
      buffPdef: l2dopTableAt(L2DOP_GREATER_SHIELD, lvl),
    }),
  },
  {
    ids: GUIDANCE_IDS,
    apply: (lvl) => ({ buffAcc: l2dopTableAt(L2DOP_GUIDANCE, lvl) }),
  },
  {
    ids: GUTS_IDS,
    apply: (lvl) => ({ buffPdef: l2dopTableAt(L2DOP_GUTS, lvl) }),
  },
  {
    ids: HASTE_IDS,
    apply: (lvl) => ({ buffAspd: l2dopTableAt(L2DOP_HASTE, lvl) }),
  },
  {
    ids: HAWK_EYE_IDS,
    apply: (lvl) => ({
      buffPdef: 0.9,
      buffAcc: l2dopTableAt(L2DOP_HAWKEYE, lvl),
    }),
  },
  {
    ids: HERO_IDS,
    apply: (_lvl, _ctx, extra) => {
      const h = extra?.heroicTier;
      if (!h) return {};
      if (h === 1) {
        return {
          addPatk: 500,
          addMatk: 500,
          buffPdef: 0.75,
          addMdef: -25,
          buffAcc: 8,
          buffEva: -8,
          addSpeed: 20,
          addAspd: 100,
          addCast: 100,
        };
      }
      if (h === 2) {
        return { addPdef: 5400, addMdef: 4050, addSpeed: 5 };
      }
      return { addPatk: 250, addPdef: 500 };
    },
  },
  {
    ids: HOT_CHOLERA_IDS,
    apply: (lvl) => ({
      buffAcc: l2dopTableAt(L2DOP_HSCHOLACC, lvl),
      buffEva: l2dopTableAt(L2DOP_HSCHOLEVA, lvl),
    }),
  },
  {
    ids: HOT_MALARIA_IDS,
    apply: (lvl) => ({ buffCast: l2dopTableAt(L2DOP_HSMALARIA, lvl) }),
  },
  {
    ids: ICE_VORTEX_IDS,
    apply: () => ({
      buffSpeed: 0.7,
      buffAspd: 0.9,
      buffCast: 0.9,
    }),
  },
  {
    ids: MAGIC_BARRIER_IDS,
    apply: (lvl) => ({
      buffMdef: l2dopTableAt(L2DOP_MAGIC_BARRIER, lvl),
    }),
  },
  {
    ids: MAJESTY_IDS,
    apply: (lvl) => ({
      buffPdef: l2dopTableAt(L2DOP_MAJESTY, lvl),
      buffEva: l2dopTableAt(L2DOP_MAJESTY_EVA, lvl),
    }),
  },
  {
    ids: MIGHT_IDS,
    apply: (lvl) => ({ buffPatk: l2dopTableAt(L2DOP_MIGHT, lvl) }),
  },
  {
    ids: WEAKNESS_IDS,
    apply: (lvl) => ({ buffPatk: l2dopTableAt(L2DOP_WEAKNESS, lvl) }),
  },
  {
    ids: HEX_DEBUFF_IDS,
    apply: (lvl) => ({ buffPdef: l2dopTableAt(L2DOP_HEX, lvl) }),
  },
  {
    ids: PROPHECY_FIRE_IDS,
    apply: () => ({
      buffMaxHp: 1.2,
      buffPatk: 1.1,
      buffMatk: 1.2,
      buffPdef: 1.2,
      buffMdef: 1.2,
      buffAcc: 4,
      subcriticalMulOfBase: 0.2,
      buffSpeed: 0.8,
      buffAspd: 1.2,
      buffCast: 1.2,
    }),
  },
  {
    ids: PROPHECY_EARTH_IDS,
    apply: () => ({
      buffMaxHp: 1.2,
      buffPatk: 1.1,
      buffPdef: 1.2,
      buffAcc: 4,
      buffSpeed: 0.9,
      buffAspd: 1.2,
    }),
  },
  {
    ids: PROPHECY_WIND_IDS,
    apply: () => ({
      buffMatk: 1.2,
      buffMdef: 1.2,
      buffSpeed: 0.9,
      buffCast: 1.2,
    }),
  },
  {
    ids: PROPHECY_WATER_IDS,
    apply: () => ({
      buffAcc: 4,
      buffEva: 4,
      buffAspd: 1.2,
    }),
  },
  {
    ids: RAGE_IDS,
    apply: (lvl, ctx) => {
      if (ctx.isTwoHandHeavy) {
        return {
          buffPatk: l2dopTableAt(L2DOP_RAGE2HS, lvl),
          buffPdef: 0.8,
          buffEva: -3,
          buffAcc: l2dopTableAt(L2DOP_RAGE2HSACC, lvl),
        };
      }
      return {
        buffPatk: l2dopTableAt(L2DOP_RAGE, lvl),
        buffPdef: 0.8,
        buffEva: -3,
      };
    },
  },
  {
    ids: RAPID_FIRE_IDS,
    apply: (lvl, ctx) => {
      if (!ctx.isBow) return {};
      return {
        addPatk: l2dopTableAt(L2DOP_RAPIDFIRE, lvl),
        buffAspd: 1.2,
      };
    },
  },
  {
    ids: RAPID_SHOT_IDS,
    apply: (lvl, ctx) => {
      if (!ctx.isBow) return {};
      return { buffAspd: l2dopTableAt(L2DOP_RAPIDSHOT, lvl) };
    },
  },
  {
    ids: SEAL_DESPAIR_IDS,
    apply: () => ({
      buffMdef: 0.7,
      buffAcc: -6,
      subcriticalMulOfBase: -0.3,
      buffSpeed: 0.8,
      buffAspd: 0.8,
    }),
  },
  {
    ids: SHIELD_IDS,
    apply: (lvl) => ({ buffPdef: l2dopTableAt(L2DOP_SHIELD, lvl) }),
  },
  {
    ids: SHOCK_BLAST_IDS,
    apply: () => ({ buffPdef: 0.7, buffMdef: 0.7 }),
  },
  {
    ids: SLOW_IDS,
    apply: (lvl) => ({ buffSpeed: l2dopTableAt(L2DOP_SLOW, lvl) }),
  },
  {
    ids: SNIPE_IDS,
    apply: (lvl) => ({
      addPatk: l2dopTableAt(L2DOP_SNIPE, lvl),
      buffAcc: l2dopTableAt(L2DOP_SNIPEACC, lvl),
      subcriticalMulOfBase: 0.2,
    }),
  },
  {
    ids: SONG_EARTH_IDS,
    apply: () => ({ buffPdef: 1.25 }),
  },
  {
    ids: SONG_HUNTER_IDS,
    apply: () => ({ subcriticalMulOfBase: 1 }),
  },
  {
    ids: SONG_VITALITY_IDS,
    apply: () => ({ buffMaxHp: 1.3 }),
  },
  {
    ids: SONG_WARDING_IDS,
    apply: () => ({ buffMdef: 1.3 }),
  },
  {
    ids: SONG_WATER_IDS,
    apply: () => ({ buffEva: 3 }),
  },
  {
    ids: SONG_WIND_IDS,
    apply: () => ({ addSpeed: 20 }),
  },
  {
    ids: SOUL_SAG_IDS,
    apply: (lvl) => ({ buffMaxMp: l2dopTableAt(L2DOP_SOULOFSAG, lvl) }),
  },
  {
    ids: STEALTH_IDS,
    apply: (lvl) => ({
      buffPatk: 0.55,
      buffPdef: l2dopTableAt(L2DOP_STEALTH, lvl),
      buffMdef: l2dopTableAt(L2DOP_STEALTH, lvl),
      buffAcc: -12,
      buffEva: l2dopTableAt(L2DOP_STEALTHEVA, lvl),
    }),
  },
  {
    ids: THRILL_FIGHT_IDS,
    apply: (lvl) => ({
      buffSpeed: 0.8,
      buffAspd: l2dopTableAt(L2DOP_THRILLFIGHT, lvl),
    }),
  },
  {
    ids: TOTEM_VAMPIRE_IDS,
    apply: () => ({ buffPatk: 1.2, buffSpeed: 0.7 }),
  },
  {
    ids: TOTEM_VAMPIRE2_IDS,
    apply: () => ({ addCrit: 100, buffAcc: 6 }),
  },
  {
    ids: TOTEM_SHIELD_IDS,
    apply: () => ({
      buffMdef: 1.3,
      buffPdef: 1.3,
      buffEva: -9,
      buffSpeed: 0.7,
    }),
  },
  {
    ids: TOTEM_BERSERK_IDS,
    apply: () => ({ buffAcc: 6, buffAspd: 1.2 }),
  },
  {
    ids: TOTEM_GHOST_IDS,
    apply: () => ({
      buffPatk: 0.7,
      buffEva: 12,
      buffSpeed: 1.3,
      buffAcc: -9,
    }),
  },
  {
    ids: TOTEM_WW_IDS,
    apply: () => ({ buffSpeed: 1.2, buffAcc: 3 }),
  },
  {
    ids: TOTEM_PATK60_IDS,
    apply: () => ({
      buffPatk: 1.43,
      addCrit: 100,
      buffAcc: 6,
    }),
  },
  {
    ids: TOUCH_DEATH_IDS,
    apply: () => ({ buffMaxCp: 0.1 }),
  },
  {
    ids: ULT_DEF_IDS,
    apply: (lvl) => ({
      addPdef: l2dopTableAt(L2DOP_UDPDEF, lvl),
      addMdef: l2dopTableAt(L2DOP_UDMDEF, lvl),
    }),
  },
  {
    ids: ULT_EVA_IDS,
    apply: (lvl) => ({ buffEva: l2dopTableAt(L2DOP_UE, lvl) }),
  },
  {
    ids: WIND_VORTEX_IDS,
    apply: () => ({
      buffSpeed: 0.9,
      buffAspd: 0.9,
      buffCast: 0.7,
    }),
  },
  {
    ids: WIND_WALK_IDS,
    apply: (lvl) => ({ addSpeed: l2dopTableAt(L2DOP_WINDWALK, lvl) }),
  },
  {
    ids: ZEALOT_IDS,
    apply: (_lvl, _ctx, extra) => {
      const z = Math.max(1, Math.min(3, extra?.zealotStacks ?? 1));
      const d: Partial<L2dopCombatBuffModifiers> = {
        buffAspd: 1.1 * z,
        buffAcc: 4 + 2 * z,
        addSpeed: 10 * z,
      };
      if (extra?.zealotDarkElf) {
        d.addCrit = 33 * z;
      }
      return d;
    },
  },
  {
    ids: POTION_HP_IDS,
    apply: () => ({ addRegenHp: 24 }),
  },
  {
    ids: POTION_GREATER_HP_IDS,
    apply: () => ({ addRegenHp: 50 }),
  },
  {
    ids: POTION_LESSER_HP_IDS,
    apply: () => ({ addRegenHp: 8 }),
  },
  {
    ids: MANA_DRUG_IDS,
    apply: () => ({ addRegenMp: 20 }),
  },
  {
    ids: PAAGRIAN_GIFT_IDS,
    apply: (lvl) => ({ buffPatk: l2dopTableAt(L2DOP_PGIFT, lvl) }),
  },
  {
    ids: SEAL_SCOURGE_IDS,
    apply: () => ({ regenHpMul: 0 }),
  },
  {
    ids: SEAL_WINTER_IDS,
    apply: () => ({ buffAspd: 0.77 }),
  },
  {
    ids: GLORY_PA_ORC_IDS,
    apply: (lvl) => ({ buffMdef: l2dopTableAt(L2DOP_TGOP, lvl) }),
  },
  {
    ids: TACT_PA_ORC_IDS,
    apply: (lvl) => ({ buffEva: l2dopTableAt(L2DOP_TTOP, lvl) }),
  },
  {
    ids: WISDOM_PA_ORC_IDS,
    apply: (lvl) => ({ buffCast: l2dopTableAt(L2DOP_TWOP, lvl) }),
  },
  {
    ids: BLESS_PA_ORC_IDS,
    apply: (lvl) => ({ buffPdef: l2dopTableAt(L2DOP_BOP, lvl) }),
  },
  {
    ids: SEAL_SLOW_IDS,
    apply: (lvl) => ({ buffSpeed: l2dopTableAt(L2DOP_SEOS, lvl) }),
  },
  {
    ids: PAAGRIAN_RAGE_IDS,
    apply: (lvl) => paagrioRageDelta(lvl),
  },
  {
    ids: CRITICAL_CHANCE_IDS,
    apply: (lvl) => ({
      subcriticalMulOfBase: l2dopTableAt(L2DOP_CRITICAL_CHANCE, lvl),
    }),
  },
  {
    ids: FAST_CAST_IDS,
    apply: (lvl) => ({ buffCast: l2dopTableAt(L2DOP_FASTCAST, lvl) }),
  },
];

function buildBuffHandlerMap(): Map<number, BuffApply> {
  const m = new Map<number, BuffApply>();
  for (const rule of ORDERED_BUFF_RULES) {
    for (const id of rule.ids) {
      /** Усі skillId з `TEXT_RPG_HF_BUFF_EFFECTS`, крім `TEXT_RPG_HF_ACTIVE_BUFF_CS1_FALLBACK_IDS` — без дубля cs1. */
      if (textRpgHfOwnsActiveBuffSkillId(id)) continue;
      if (!m.has(id)) m.set(id, rule.apply);
    }
  }
  return m;
}

const BUFF_APPLY_BY_SKILL_ID = buildBuffHandlerMap();

function parseExpiresAtField(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string'
        ? parseInt(v, 10)
        : NaN;
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

export function parseActiveBuffEntries(raw: unknown): ActiveBuffEntry[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const out: ActiveBuffEntry[] = [];
  for (const item of raw) {
    if (item != null && typeof item === 'object' && !Array.isArray(item)) {
      const o = item as Record<string, unknown>;
      const sidRaw = o.skillId ?? o.skill_id ?? o.buffId ?? o.buff_id;
      const lvRaw = o.level ?? o.lvl ?? o.skill_lvl ?? 1;
      const sid =
        typeof sidRaw === 'number'
          ? sidRaw
          : typeof sidRaw === 'string'
            ? parseInt(sidRaw, 10)
            : NaN;
      let lvl =
        typeof lvRaw === 'number'
          ? Math.floor(lvRaw)
          : parseInt(String(lvRaw), 10);
      if (!Number.isFinite(sid) || sid <= 0) continue;
      if (!Number.isFinite(lvl) || lvl < 1) lvl = 1;
      const exp = parseExpiresAtField(
        o.expiresAt ?? o.expires_at ?? o.expireAt ?? o.expire_at
      );
      out.push(
        exp !== undefined
          ? { skillId: sid, level: lvl, expiresAt: exp }
          : { skillId: sid, level: lvl }
      );
      continue;
    }
    if (typeof item === 'string') {
      /** Формат: `"<id>:<lvl>"` або `"<id>:<lvl>@<expiresAtMs>"` */
      const atIdx = item.indexOf('@');
      const main = atIdx >= 0 ? item.slice(0, atIdx) : item;
      const tail = atIdx >= 0 ? item.slice(atIdx + 1).trim() : '';
      const parts = main.split(':');
      const sid = parseInt(parts[0]!.trim(), 10);
      const lvl =
        parts.length > 1 ? parseInt(parts[1]!.trim(), 10) : 1;
      if (Number.isFinite(sid) && sid > 0) {
        const exp = tail ? parseExpiresAtField(tail) : undefined;
        out.push(
          exp !== undefined
            ? {
                skillId: sid,
                level: Number.isFinite(lvl) && lvl > 0 ? lvl : 1,
                expiresAt: exp,
              }
            : {
                skillId: sid,
                level: Number.isFinite(lvl) && lvl > 0 ? lvl : 1,
              }
        );
      }
    }
  }
  return out;
}

/**
 * Прибирає записи з `expiresAt <= nowMs`. Записи без `expiresAt` вважаються постійними
 * і лишаються. Повертає нову копію списку; не модифікує вхідний масив.
 */
export function stripExpiredActiveBuffs(
  entries: readonly ActiveBuffEntry[],
  nowMs: number
): ActiveBuffEntry[] {
  const out: ActiveBuffEntry[] = [];
  for (const e of entries) {
    if (e.expiresAt !== undefined && e.expiresAt <= nowMs) continue;
    out.push(e);
  }
  return out;
}

/**
 * Зручний хелпер: прочитати `activeBuffsJson`, одразу відкинути прострочені
 * (використовувати перед persist: щоб не писати в БД мертві записи).
 */
export function persistableActiveBuffsFromJson(
  raw: unknown,
  nowMs: number
): ActiveBuffEntry[] {
  return stripExpiredActiveBuffs(parseActiveBuffEntries(raw), nowMs);
}

/**
 * Список skillId, що НЕ знімаються через Cancel/Cleanse (Noblesse Blessing
 * 1323, Bless of Soul 1048 series тощо — ми трактуємо їх як protected).
 * У L2 Interlude ці бафи залишаються при смерті та при касті Cancel.
 * Зараз тримаємо вузько; розширимо, коли додамо Noblesse / Heroic бафи.
 */
export const CANCEL_PROTECTED_SKILL_IDS: ReadonlySet<number> = new Set([
  1323,
]);

/**
 * Знімає з активних бафів `count` випадкових — аналог L2 Cancel (skillId 1056)
 * і Mass Cancel (1081). `protectedIds` залишаються недоторканими (Noblesse).
 *
 * Повертає новий масив `next` + список знятих `removed` (для лог-рядків бою).
 * Якщо `count <= 0` або всі бафи protected — повертає копію без змін.
 *
 * NB: для mass/targeted-варіантів виклик робить бойовий резолвер, тут лише
 * чиста логіка без побічних ефектів. Для legacy-бафів у `battleMods`, яких ще
 * немає в `activeBuffsJson` (Rage / Frenzy / Guts / Lionheart / Howl / Focus
 * Attack / детекти), потрібно також викликати `stripLegacyBuffsRandomly`
 * (додамо, коли мистичний клас матиме Cancel).
 */
export function cancelRandomActiveBuffs(
  entries: readonly ActiveBuffEntry[],
  count: number,
  rng: () => number = Math.random,
  protectedIds: ReadonlySet<number> = CANCEL_PROTECTED_SKILL_IDS
): { next: ActiveBuffEntry[]; removed: ActiveBuffEntry[] } {
  if (count <= 0 || entries.length === 0) {
    return { next: entries.slice(), removed: [] };
  }
  const kept: ActiveBuffEntry[] = [];
  const pool: ActiveBuffEntry[] = [];
  for (const e of entries) {
    if (protectedIds.has(e.skillId)) kept.push(e);
    else pool.push(e);
  }
  const removed: ActiveBuffEntry[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    const taken = pool.splice(idx, 1)[0];
    if (taken) removed.push(taken);
  }
  return { next: [...kept, ...pool], removed };
}

export function combatBuffsFromActiveJson(
  raw: unknown,
  weaponCtx: BuffWeaponContext = DEFAULT_BUFF_WEAPON_CONTEXT,
  extra: BuffExtraContext = DEFAULT_BUFF_EXTRA,
  nowMs: number = Date.now()
): L2dopCombatBuffModifiers {
  let b = neutralCombatBuffs();
  const entries = stripExpiredActiveBuffs(parseActiveBuffEntries(raw), nowMs);
  for (const { skillId, level } of entries) {
    const tr = textRpgHfActiveBuffDelta(skillId, level, weaponCtx);
    if (tr && Object.keys(tr).length > 0) {
      b = applyBuffDelta(b, tr);
      continue;
    }
    const fn = BUFF_APPLY_BY_SKILL_ID.get(skillId);
    if (fn) {
      const d = fn(level, weaponCtx, extra);
      if (d && Object.keys(d).length > 0) b = applyBuffDelta(b, d);
    }
  }
  return b;
}
