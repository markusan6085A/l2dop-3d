/**
 * Спільні перевірки inline-preview зброї в магазині (тести).
 */
import type { DropsShopStatLineUk } from '../../src/domain/dropsShopStatsPreviewUk.js';

export interface WeaponShopPreviewExpected {
  pAtk: number;
  mAtk: number;
  atkSpd: number;
  wpnCrit: number;
}

export function assertWeaponShopPreviewLines(
  previewLines: DropsShopStatLineUk[],
  expected: WeaponShopPreviewExpected,
  itemId: number,
  errors: string[],
): void {
  if (previewLines.length !== 2) {
    errors.push(
      `#${itemId} preview lines: expected 2 rows, got ${previewLines.length}`,
    );
    return;
  }
  const line1 = previewLines[0]!.valueUk;
  const line2 = previewLines[1]!.valueUk;
  const text = `${line1} ${line2}`;

  if (!line1.includes('Фіз. атака')) {
    errors.push(`#${itemId} preview line 1 missing «Фіз. атака»`);
  }
  if (!line1.includes('Маг. атака')) {
    errors.push(`#${itemId} preview line 1 missing «Маг. атака»`);
  }
  if (!text.includes(`Фіз. атака: ${expected.pAtk}`)) {
    errors.push(`#${itemId} preview missing pAtk ${expected.pAtk}`);
  }
  if (!text.includes(`Маг. атака: ${expected.mAtk}`)) {
    errors.push(`#${itemId} preview missing mAtk ${expected.mAtk}`);
  }
  if (!text.includes(`Швидкість: ${expected.atkSpd}`)) {
    errors.push(`#${itemId} preview missing speed ${expected.atkSpd}`);
  }
  if (!text.includes(`Крит.: ${expected.wpnCrit}`)) {
    errors.push(`#${itemId} preview missing crit ${expected.wpnCrit}`);
  }
}
