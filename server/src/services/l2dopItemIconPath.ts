import fs from 'node:fs';
import path from 'node:path';
import { sealStoneIconUrlForItemId } from '../data/sevenSignsSealStoneItems.js';
import {
  COIN_OF_LUCK_ICON_URL,
  COIN_OF_LUCK_ITEM_ID,
} from '../domain/dailyQuestRewards.js';

function publicDirCandidates(relParts: string[]): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, 'public', ...relParts),
    path.join(cwd, 'server', 'public', ...relParts),
  ];
}

function firstExistingPath(candidates: string[]): string | null {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Реальні іконки предметів:
 * 1) L2DOP_ITEM_ICONS_DIR / `{id}.jpg`
 * 2) зовнішній l2dop `img/items/{id}.jpg`
 * 3) статика репо `icons/drops/resours/l2dop-by-itemid/{id}.jpg`
 * 4) adena `assets/l2dop/etc_adena_i00.png`
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

  const byItemId = firstExistingPath(
    publicDirCandidates(['icons', 'drops', 'resours', 'l2dop-by-itemid', file]),
  );
  if (byItemId) return byItemId;

  const cwd = process.cwd();
  const legacyCandidates = [
    path.join(cwd, '..', 'l2dop', 'img', 'items', file),
    path.join(cwd, '..', '..', 'l2dop', 'img', 'items', file),
    path.join(cwd, 'l2dop', 'img', 'items', file),
  ];
  const legacy = firstExistingPath(legacyCandidates);
  if (legacy) return legacy;

  if (itemId === 57) {
    return firstExistingPath(
      publicDirCandidates(['assets', 'l2dop', 'etc_adena_i00.png']),
    );
  }
  if (itemId === COIN_OF_LUCK_ITEM_ID) {
    return firstExistingPath(
      publicDirCandidates(['assets', 'l2dop', '4037.jpg']),
    );
  }
  return null;
}

/** URL для `<img src>`: прямий шлях до статики, інакше проксі `/game/item-icon/`. */
export function resolveItemIconPublicUrl(itemId: number): string {
  if (!Number.isFinite(itemId) || itemId < 1) {
    return '/icons/drops/other.svg';
  }
  if (itemId === 57) {
    const adena = firstExistingPath(
      publicDirCandidates(['assets', 'l2dop', 'etc_adena_i00.png']),
    );
    if (adena) return '/assets/l2dop/etc_adena_i00.png';
  }
  if (itemId === COIN_OF_LUCK_ITEM_ID) {
    return COIN_OF_LUCK_ICON_URL;
  }
  const sealStoneUrl = sealStoneIconUrlForItemId(itemId);
  if (sealStoneUrl) return sealStoneUrl;
  const file = `${itemId}.jpg`;
  const byItemId = firstExistingPath(
    publicDirCandidates(['icons', 'drops', 'resours', 'l2dop-by-itemid', file]),
  );
  if (byItemId) {
    return `/icons/drops/resours/l2dop-by-itemid/${file}`;
  }
  return `/game/item-icon/${itemId}`;
}
