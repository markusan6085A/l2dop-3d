/**
 * Об'єднаний lookup D/C/B/A-grade канонічної броні.
 */
import { aGradeArmorCatalogRow, type AGradeArmorCatalogRow } from './aGradeArmorCatalog.js';
import { bGradeArmorCatalogRow, type BGradeArmorCatalogRow } from './bGradeArmorCatalog.js';
import { cGradeArmorCatalogRow, type CGradeArmorCatalogRow } from './cGradeArmorCatalog.js';
import { dGradeArmorCatalogRow, type DGradeArmorCatalogRow } from './dGradeArmorCatalog.js';

export type GradeArmorCatalogRow =
  | DGradeArmorCatalogRow
  | CGradeArmorCatalogRow
  | BGradeArmorCatalogRow
  | AGradeArmorCatalogRow;

export function gradeArmorCatalogRow(itemId: number): GradeArmorCatalogRow | undefined {
  return (
    dGradeArmorCatalogRow(itemId) ??
    cGradeArmorCatalogRow(itemId) ??
    bGradeArmorCatalogRow(itemId) ??
    aGradeArmorCatalogRow(itemId)
  );
}
