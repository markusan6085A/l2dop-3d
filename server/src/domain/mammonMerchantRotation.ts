import {
  MAMMON_MERCHANT_NECROPOLISES,
  type MammonMerchantNecropolis,
} from '../data/mammonMerchantNecropolises.js';

/** 4 години на одну локацію. */
export const MAMMON_MERCHANT_ROTATION_MS = 4 * 60 * 60 * 1000;

export interface MammonMerchantRotationView {
  slotIndex: number;
  current: MammonMerchantNecropolis;
  next: MammonMerchantNecropolis;
  rotatesAtMs: number;
  rotationMs: number;
}

function normalizeSlotIndex(slot: number, len: number): number {
  if (len <= 0) return 0;
  const mod = slot % len;
  return mod < 0 ? mod + len : mod;
}

/** Стабільний індекс слота ротації (усі гравці бачать однакову локацію). */
export function mammonMerchantSlotIndex(nowMs: number = Date.now()): number {
  const len = MAMMON_MERCHANT_NECROPOLISES.length;
  if (len <= 0) return 0;
  const slot = Math.floor(nowMs / MAMMON_MERCHANT_ROTATION_MS);
  return normalizeSlotIndex(slot, len);
}

/** Підпис для map/sync — змінюється при переході на інший некрополь. */
export function mammonMerchantRotationSig(nowMs: number = Date.now()): string {
  return String(mammonMerchantSlotIndex(nowMs));
}

export function resolveMammonMerchantRotation(
  nowMs: number = Date.now()
): MammonMerchantRotationView {
  const len = MAMMON_MERCHANT_NECROPOLISES.length;
  const slotIndex = mammonMerchantSlotIndex(nowMs);
  const current = MAMMON_MERCHANT_NECROPOLISES[slotIndex]!;
  const next = MAMMON_MERCHANT_NECROPOLISES[normalizeSlotIndex(slotIndex + 1, len)]!;
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
