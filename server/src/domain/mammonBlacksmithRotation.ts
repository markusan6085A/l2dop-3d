import {
  MAMMON_BLACKSMITH_CATACOMBS,
  type MammonBlacksmithCatacomb,
} from '../data/mammonBlacksmithCatacombs.js';
import { MAMMON_MERCHANT_ROTATION_MS } from './mammonMerchantRotation.js';

export interface MammonBlacksmithRotationView {
  slotIndex: number;
  current: MammonBlacksmithCatacomb;
  next: MammonBlacksmithCatacomb;
  rotatesAtMs: number;
  rotationMs: number;
}

function normalizeSlotIndex(slot: number, len: number): number {
  if (len <= 0) return 0;
  const mod = slot % len;
  return mod < 0 ? mod + len : mod;
}

export function mammonBlacksmithSlotIndex(nowMs: number = Date.now()): number {
  const len = MAMMON_BLACKSMITH_CATACOMBS.length;
  if (len <= 0) return 0;
  const slot = Math.floor(nowMs / MAMMON_MERCHANT_ROTATION_MS);
  return normalizeSlotIndex(slot, len);
}

export function resolveMammonBlacksmithRotation(
  nowMs: number = Date.now()
): MammonBlacksmithRotationView {
  const len = MAMMON_BLACKSMITH_CATACOMBS.length;
  const slotIndex = mammonBlacksmithSlotIndex(nowMs);
  const current = MAMMON_BLACKSMITH_CATACOMBS[slotIndex]!;
  const next = MAMMON_BLACKSMITH_CATACOMBS[normalizeSlotIndex(slotIndex + 1, len)]!;
  const slotStartMs =
    Math.floor(nowMs / MAMMON_MERCHANT_ROTATION_MS) * MAMMON_MERCHANT_ROTATION_MS;
  const rotatesAtMs = slotStartMs + MAMMON_MERCHANT_ROTATION_MS;
  return {
    slotIndex,
    current,
    next,
    rotatesAtMs,
    rotationMs: MAMMON_MERCHANT_ROTATION_MS,
  };
}
