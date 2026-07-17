import {
  MAMMON_MERCHANT_L2_NPC_ID,
  type MammonMerchantNecropolis,
} from '../data/mammonMerchantNecropolises.js';
import { resolveMammonMerchantRotation } from '../domain/mammonMerchantRotation.js';
import { getMobIconFromL2dopNpcId } from '../utils/mobPublicIcon.js';

export interface MammonMerchantStatePayload {
  npcId: number;
  nameEn: string;
  nameUk: string;
  iconUrl: string;
  rotationMs: number;
  rotatesAtMs: number;
  slotIndex: number;
  current: MammonMerchantNecropolis & { slotIndex: number };
  next: Pick<MammonMerchantNecropolis, 'id' | 'labelEn' | 'labelUk'>;
}

export function getMammonMerchantState(
  nowMs: number = Date.now()
): MammonMerchantStatePayload {
  const rot = resolveMammonMerchantRotation(nowMs);
  return {
    npcId: MAMMON_MERCHANT_L2_NPC_ID,
    nameEn: 'Merchant of Mammon',
    nameUk: 'Торговець Маммона',
    iconUrl: getMobIconFromL2dopNpcId(MAMMON_MERCHANT_L2_NPC_ID),
    rotationMs: rot.rotationMs,
    rotatesAtMs: rot.rotatesAtMs,
    slotIndex: rot.slotIndex,
    current: {
      ...rot.current,
      slotIndex: rot.slotIndex,
    },
    next: {
      id: rot.next.id,
      labelEn: rot.next.labelEn,
      labelUk: rot.next.labelUk,
    },
  };
}
