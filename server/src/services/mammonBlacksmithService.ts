import {
  MAMMON_BLACKSMITH_L2_NPC_ID,
  type MammonBlacksmithCatacomb,
} from '../data/mammonBlacksmithCatacombs.js';
import { resolveMammonBlacksmithRotation } from '../domain/mammonBlacksmithRotation.js';
import { getMobIconFromL2dopNpcId } from '../utils/mobPublicIcon.js';

export interface MammonBlacksmithStatePayload {
  npcId: number;
  nameEn: string;
  nameUk: string;
  iconUrl: string;
  rotationMs: number;
  rotatesAtMs: number;
  slotIndex: number;
  current: MammonBlacksmithCatacomb & { slotIndex: number };
  next: Pick<MammonBlacksmithCatacomb, 'id' | 'labelEn' | 'labelUk'>;
}

export function getMammonBlacksmithState(
  nowMs: number = Date.now()
): MammonBlacksmithStatePayload {
  const rot = resolveMammonBlacksmithRotation(nowMs);
  return {
    npcId: MAMMON_BLACKSMITH_L2_NPC_ID,
    nameEn: 'Blacksmith of Mammon',
    nameUk: 'Коваль Маммона',
    iconUrl: getMobIconFromL2dopNpcId(MAMMON_BLACKSMITH_L2_NPC_ID),
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
