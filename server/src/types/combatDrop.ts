/** Типізація рядків дропу в бою / каталозі (XML/lineage таблиці прибрано). */
export type DropKind = 'adena' | 'resource' | 'equipment' | 'other';

export interface DropEntry {
  id: string;
  kind: DropKind;
  chance: number;
  min: number;
  max: number;
  chancePerMillion?: number;
  l2ItemId?: number;
  displayName?: string;
  /** Як у магазині D-grade (`/icons/drops/…`), якщо item-icon не підходить. */
  iconUrl?: string;
}
