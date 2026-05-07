/**
 * Модель ефектів скілів узгоджена з text-rpg (`src/data/skills/types`, `effects[].stat` + `mode` + `power`).
 * Дані скіла в text-rpg — джерело правди для формул; l2dop-3d мапить у `L2dopCombatBuffModifiers` / окремі хуки бою.
 *
 * Режими (як у `applySinglePassive` / `applySkillBuffs` у text-rpg):
 * - **percent**: для ресурсів і бойових статів — `base * (1 + power/100)` (у нас часто як множник `buff*` поверх уже порахованої бази).
 * - **flat**: додавання до бази або до полів `add*`.
 * - **multiplier**: `base * power`, де `power` — готовий множник (як `mod.multiplier` / інколи `level.power` у text-rpg).
 */

export type TextRpgEffectMode = 'flat' | 'percent' | 'multiplier';

/**
 * Підмножина `SkillStat` з text-rpg, для якої є мапінг у `l2dopBuffDeltaFromTextRpgEffect`.
 * Інші значення — повертають `null` (потрібні окремі системи: резисти, STR, тощо).
 */
export type TextRpgMappedCombatStat =
  | 'pAtk'
  | 'mAtk'
  | 'pDef'
  | 'mDef'
  | 'maxHp'
  | 'maxMp'
  | 'maxCp'
  | 'hpRegen'
  | 'mpRegen'
  | 'attackSpeed'
  | 'atkSpeed'
  | 'castSpeed'
  | 'runSpeed'
  | 'accuracy'
  | 'evasion'
  | 'critRate'
  | 'critDamage';
