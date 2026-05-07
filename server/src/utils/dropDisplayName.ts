import { L2DOP_ITEM_DISPLAY_NAME_UK } from '../data/l2dopItemDisplayNameUk.js';

/**
 * Коротка назва предмета/ресурсу для UI та логів бою (без info з дампу l2dop).
 * `l2ItemId` — за потреби підставляємо нормальну українську назву замість зламаного рядка з автогену.
 */
export function dropDisplayNameShort(
  raw: string | undefined | null,
  l2ItemId?: number | null
): string {
  if (l2ItemId != null && l2ItemId > 0) {
    const uk = L2DOP_ITEM_DISPLAY_NAME_UK[l2ItemId];
    if (uk) return uk;
  }
  if (raw == null || raw === '') return '—';
  let t = String(raw)
    .replace(/\\n/g, '\n')
    .split('\n')[0]
    .trim();
  const gu = t.indexOf('«');
  if (gu >= 0) t = t.slice(0, gu).trim();

  const cutAt = (s: string, needle: string): string => {
    const i = s.indexOf(needle);
    return i >= 0 ? s.slice(0, i).trim() : s;
  };
  t = cutAt(t, 'Баз.');
  t = cutAt(t, 'Баз ');
  t = cutAt(t, 'Base.');
  t = cutAt(t, '. Может также');
  t = cutAt(t, '. Можно также');
  t = cutAt(t, '. Требуется умение');
  t = cutAt(t, ' Требуется');

  t = t.replace(/[''`]+$/g, '').trim();
  return t || '—';
}
