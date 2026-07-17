import { mammonBlacksmithSlotIndex } from './mammonBlacksmithRotation.js';
import { mammonMerchantSlotIndex } from './mammonMerchantRotation.js';

/** Підпис для map/sync — змінюється при переході торговця або коваля на іншу локацію. */
export function mammonRotationSig(nowMs: number = Date.now()): string {
  return `${mammonMerchantSlotIndex(nowMs)}:${mammonBlacksmithSlotIndex(nowMs)}`;
}
