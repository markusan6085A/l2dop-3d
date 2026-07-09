import type {
  ArmorTypeKind,
  ItemMeta,
  ItemSlotKind,
} from '../data/itemsCatalog.js';
import type { WeaponKindForEnchant } from '../data/l2dopEnchant.js';

export type DropsShopStatLineUk = { labelUk: string; valueUk: string };

const ARMOR_SLOT_UK: Partial<Record<ItemSlotKind, string>> = {
  head: 'Голова',
  chest: 'Нагрудник',
  legs: 'Низ',
  gloves: 'Рукавиці',
  feet: 'Черевики',
  fullarmor: 'Повний доспех',
  lhand: 'Ліва рука (щит)',
};

const ARMOR_TYPE_UK: Record<ArmorTypeKind, string> = {
  heavy: 'Тяжка',
  light: 'Легка',
  magic: 'Мантія',
};

function weaponKindUk(k: WeaponKindForEnchant): string {
  switch (k) {
    case 'sword':
      return 'Меч';
    case 'blunt':
      return 'Булава';
    case 'dagger':
      return 'Кинджал';
    case 'bow':
      return 'Лук';
    case 'bigsword':
      return 'Дворучний меч';
    case 'bigblunt':
      return 'Дворучний тупий';
    case 'dual':
      return 'Подвійні мечі';
    case 'pole':
      return 'Спис';
    case 'fist':
      return 'Кастети';
    default:
      return String(k);
  }
}

function pctFromMulUk(mul: number): string {
  const p = Math.round((mul - 1) * 100);
  return (p >= 0 ? '+' : '') + p + '%';
}

/** Рядки для модалки «характеристики » у крамниці дропів. */
export function buildDropsShopStatsPreviewUk(
  meta: ItemMeta,
): DropsShopStatLineUk[] {
  const lines: DropsShopStatLineUk[] = [];

  if (meta.slot === 'consumable') {
    lines.push({ labelUk: 'Тип', valueUk: 'Розхідник' });
    lines.push({ labelUk: 'Примітка', valueUk: 'Не екіпірується; лише сумка.' });
    return lines;
  }

  if (meta.slot === 'rhand') {
    if (meta.pAtk != null) {
      lines.push({ labelUk: 'Фіз. атака', valueUk: String(meta.pAtk) });
    }
    if (meta.mAtk != null) {
      lines.push({ labelUk: 'Маг. атака', valueUk: String(meta.mAtk) });
    }
    if (meta.atkSpd != null) {
      lines.push({ labelUk: 'Швидкість бою', valueUk: String(meta.atkSpd) });
    }
    if (meta.weaponType) {
      lines.push({
        labelUk: 'Тип зброї',
        valueUk: weaponKindUk(meta.weaponType),
      });
    }
    if (meta.wpnCrit != null) {
      lines.push({
        labelUk: 'Крит.',
        valueUk: String(meta.wpnCrit),
      });
    }
    if (meta.rCrit != null && meta.rCrit > 0) {
      lines.push({ labelUk: 'Крит.', valueUk: '+' + meta.rCrit });
    }
    return lines;
  }

  if (
    meta.slot === 'chest' ||
    meta.slot === 'legs' ||
    meta.slot === 'head' ||
    meta.slot === 'gloves' ||
    meta.slot === 'feet' ||
    meta.slot === 'fullarmor' ||
    meta.slot === 'lhand'
  ) {
    if (meta.pDef != null) {
      lines.push({ labelUk: 'Фіз. захист (P.Def)', valueUk: String(meta.pDef) });
    }
    const slotUk = ARMOR_SLOT_UK[meta.slot];
    if (slotUk) {
      lines.push({ labelUk: 'Слот', valueUk: slotUk });
    }
    if (meta.armorType) {
      lines.push({
        labelUk: 'Тип броні',
        valueUk: ARMOR_TYPE_UK[meta.armorType],
      });
    }
    return lines;
  }

  if (
    meta.slot === 'ring' ||
    meta.slot === 'neck' ||
    meta.slot === 'earring'
  ) {
    const mdef =
      meta.jewelMdefFlat != null ? meta.jewelMdefFlat : meta.mAtk;
    if (mdef != null) {
      lines.push({
        labelUk: 'Маг. захист (M.Def)',
        valueUk: String(mdef),
      });
    }
    if (meta.jewelMaxHp != null && meta.jewelMaxHp > 0) {
      lines.push({
        labelUk: 'HP макс.',
        valueUk: '+' + meta.jewelMaxHp,
      });
    }
    if (meta.jewelMaxMp != null && meta.jewelMaxMp > 0) {
      lines.push({
        labelUk: 'MP макс.',
        valueUk: '+' + meta.jewelMaxMp,
      });
    }
    if (meta.jewelAcc != null && meta.jewelAcc > 0) {
      lines.push({
        labelUk: 'Точність',
        valueUk: '+' + meta.jewelAcc,
      });
    }
    if (meta.jewelEva != null && meta.jewelEva > 0) {
      lines.push({
        labelUk: 'Ухилення',
        valueUk: '+' + meta.jewelEva,
      });
    }
    if (
      meta.jewelMpRegenMul != null &&
      meta.jewelMpRegenMul > 1 &&
      Number.isFinite(meta.jewelMpRegenMul)
    ) {
      lines.push({
        labelUk: 'Реген MP',
        valueUk: pctFromMulUk(meta.jewelMpRegenMul),
      });
    }
    if (
      meta.jewelHoldResistMul != null &&
      meta.jewelHoldResistMul > 1 &&
      Number.isFinite(meta.jewelHoldResistMul)
    ) {
      lines.push({
        labelUk: 'Стійкість до утримання',
        valueUk: pctFromMulUk(meta.jewelHoldResistMul),
      });
    }
    if (meta.pDef != null && meta.pDef > 0) {
      lines.push({ labelUk: 'Фіз. захист', valueUk: String(meta.pDef) });
    }
    const accUk =
      meta.slot === 'neck'
        ? 'Прикраса шиї'
        : meta.slot === 'ring'
          ? 'Персень'
          : 'Сережка';
    lines.push({ labelUk: 'Тип аксесуара', valueUk: accUk });
    return lines;
  }

  lines.push({
    labelUk: 'Примітка',
    valueUk: 'Слот предмета: ' + meta.slot,
  });
  return lines;
}
