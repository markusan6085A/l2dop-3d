import fs from 'node:fs';
import path from 'node:path';

/**
 * Реальні іконки предметів як у PHP l2dop: `img/items/{itemId}.jpg`
 * (див. index.php `$allimg/items/$item_id.jpg`).
 */
export function resolveL2dopItemIconJpgPath(itemId: number): string | null {
  if (!Number.isFinite(itemId) || itemId < 1 || itemId > 9_999_999) {
    return null;
  }
  const file = `${itemId}.jpg`;
  const baseEnv = process.env.L2DOP_ITEM_ICONS_DIR;
  if (baseEnv) {
    const p = path.join(baseEnv, file);
    if (fs.existsSync(p)) return p;
  }
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, '..', 'l2dop', 'img', 'items', file),
    path.join(cwd, '..', '..', 'l2dop', 'img', 'items', file),
    path.join(cwd, 'l2dop', 'img', 'items', file),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}
