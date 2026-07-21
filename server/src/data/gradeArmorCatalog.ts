/**
 * Об'єднаний lookup D/C/B-grade канонічної броні.
 */
import { bGradeArmorCatalogRow, type BGradeArmorCatalogRow } from './bGradeArmorCatalog.js';
import { cGradeArmorCatalogRow, type CGradeArmorCatalogRow } from './cGradeArmorCatalog.js';
import { dGradeArmorCatalogRow, type DGradeArmorCatalogRow } from './dGradeArmorCatalog.js';

export type GradeArmorCatalogRow =
  | DGradeArmorCatalogRow
  | CGradeArmorCatalogRow
  | BGradeArmorCatalogRow;

export function gradeArmorCatalogRow(itemId: number): GradeArmorCatalogRow | undefined {
  return (
    dGradeArmorCatalogRow(itemId) ??
    cGradeArmorCatalogRow(itemId) ??
    bGradeArmorCatalogRow(itemId)
  );
}
