import { jsonFiniteNum } from './battleModsJson.js';
import type { BattleBattleMods } from './battleTypes.js';
import {
  PHYSICAL_MIRROR_MAGIC_REFLECT_CHANCE_PCT,
  PHYSICAL_MIRROR_PHYS_SKILL_REFLECT_CHANCE_PCT,
} from '../data/physicalMirrorTables.js';

export type PhysicalMirrorReflectKind = 'physical' | 'magic';

export type PhysicalMirrorReflectResult = {
  absorbed: boolean;
  reflectDamage: number;
  logLineUk?: string;
};

export function physicalMirrorReflectChancePct(
  mods: BattleBattleMods | undefined,
  kind: PhysicalMirrorReflectKind
): number {
  if (!mods) return 0;
  const raw =
    kind === 'physical'
      ? jsonFiniteNum(mods.physicalMirrorPhysReflectChancePct)
      : jsonFiniteNum(mods.physicalMirrorMagicReflectChancePct);
  if (raw === undefined || raw <= 0) return 0;
  return Math.min(100, Math.floor(raw));
}

/** Чи активне дзеркало (хоча б один шанс > 0). */
export function isPhysicalMirrorActive(
  mods: BattleBattleMods | undefined
): boolean {
  return (
    physicalMirrorReflectChancePct(mods, 'physical') > 0 ||
    physicalMirrorReflectChancePct(mods, 'magic') > 0
  );
}

export function rollPhysicalMirrorReflect(
  mods: BattleBattleMods | undefined,
  kind: PhysicalMirrorReflectKind,
  incomingDamage: number
): PhysicalMirrorReflectResult {
  const dmg = Math.max(0, Math.floor(incomingDamage));
  if (dmg <= 0) return { absorbed: false, reflectDamage: 0 };

  const chance = physicalMirrorReflectChancePct(mods, kind);
  if (chance <= 0) return { absorbed: false, reflectDamage: 0 };
  if (Math.random() * 100 >= chance) {
    return { absorbed: false, reflectDamage: 0 };
  }

  return {
    absorbed: true,
    reflectDamage: dmg,
    logLineUk:
      kind === 'physical'
        ? 'Фізичне дзеркало (350): фізичний скіл відбито — −' +
          dmg +
          ' HP противнику.'
        : 'Фізичне дзеркало (350): магія відбита — −' +
          dmg +
          ' HP противнику.',
  };
}

/** Патч battleMods при активації Physical Mirror. */
export function physicalMirrorBattleModsPatch(): Partial<BattleBattleMods> {
  return {
    physicalMirrorPhysReflectChancePct:
      PHYSICAL_MIRROR_PHYS_SKILL_REFLECT_CHANCE_PCT,
    physicalMirrorMagicReflectChancePct:
      PHYSICAL_MIRROR_MAGIC_REFLECT_CHANCE_PCT,
    physicalMirrorIconSkillId: 350,
  };
}
