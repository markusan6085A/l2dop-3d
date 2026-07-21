/**
 * Об'єднаний lookup D/C-grade канонічної броні.
 */
import { cGradeArmorCatalogRow, type CGradeArmorCatalogRow } from './cGradeArmorCatalog.js';
import { dGradeArmorCatalogRow, type DGradeArmorCatalogRow } from './dGradeArmorCatalog.js';

export type GradeArmorCatalogRow = DGradeArmorCatalogRow | CGradeArmorCatalogRow;

export function gradeArmorCatalogRow(itemId: number): GradeArmorCatalogRow | undefined {
  return dGradeArmorCatalogRow(itemId) ?? cGradeArmorCatalogRow(itemId);
}
