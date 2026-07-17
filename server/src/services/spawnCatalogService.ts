import { getWorldSpawnById, type MapWorldSpawn } from '../data/mapWorldSpawns.js';
import {
  ensureMobDropBag,
  rewardExpSpForSpawn,
} from '../domain/spawnSyntheticRewards.js';
import { resourceDropsForSpawnCatalog } from '../domain/mobResourceLoot.js';
import { mobCombatFromSpawn } from '../domain/battle.js';
import { mobKillRewardMult } from '../domain/championMobRules.js';
import type { DropEntry } from '../types/combatDrop.js';
import { raidBossRewardPreviewForNpcId } from '../data/l2dopRaidBossRewardPatches.js';
import { sevenSignsDungeonMobRewardPreviewForNpcId } from '../data/l2dopSevenSignsDungeonMobRewards.js';
import { hasCustomNpcDropBag } from '../data/npcDropsResolved.js';
import { resolveL2dopNpcIdByMobName } from '../data/l2dopNpcResolve.js';
import {
  getLineageEpicGrandBossIconUrl,
  getMobIconFromL2dopNpcId,
  getMobPublicIconSrc,
  l2dopNpcIdFromMobId,
  resolveMobIconFromName,
} from '../utils/mobPublicIcon.js';
import { dropDisplayNameShort } from '../utils/dropDisplayName.js';
import { resolveItemIconPublicUrl } from './l2dopItemIconPath.js';
import { viewerMaySeeSpoilLoot } from '../domain/dwarfSpoilerLootGate.js';
import type { Prisma } from '@prisma/client';

export { resolveL2dopNpcIdByMobName };

export function mobIconUrlForSpawn(s: MapWorldSpawn): string {
  const portrait = s.icon?.trim();
  if (portrait) return portrait;
  const npcFromSpawn =
    l2dopNpcIdFromMobId(s.templateId) ?? l2dopNpcIdFromMobId(s.id);
  if (npcFromSpawn != null) {
    return getMobIconFromL2dopNpcId(npcFromSpawn);
  }
  const npcFromName = resolveL2dopNpcIdByMobName(s.name);
  const nameIcon = resolveMobIconFromName(s.name);
  if (npcFromName != null) {
    if (getLineageEpicGrandBossIconUrl(npcFromName)) {
      return getMobIconFromL2dopNpcId(npcFromName);
    }
    if (nameIcon) return nameIcon;
    return getMobIconFromL2dopNpcId(npcFromName);
  }
  return nameIcon ?? getMobPublicIconSrc(s.name) ?? '/mobs/1.png';
}

/** Статика репо або GET /game/item-icon/:id для canonical l2dop. */
function dropRowIconUrl(d: DropEntry): string {
  if (d.iconUrl) return d.iconUrl;
  if (d.l2ItemId != null && d.l2ItemId > 0) {
    return resolveItemIconPublicUrl(d.l2ItemId);
  }
  if (d.kind === 'adena') return resolveItemIconPublicUrl(57);
  return '/icons/drops/other.svg';
}

function serializeDropScaled(d: DropEntry, rewardMult: number) {
  if (rewardMult !== 1 && d.kind === 'adena') {
    const min = Math.max(0, Math.floor(d.min * rewardMult));
    const max = Math.max(min, Math.floor(d.max * rewardMult));
    return serializeDrop({ ...d, min, max });
  }
  return serializeDrop(d);
}

function serializeDrop(d: DropEntry) {
  return {
    id: d.id,
    kind: d.kind,
    chance: d.chance,
    min: d.min,
    max: d.max,
    displayName: dropDisplayNameShort(d.displayName ?? d.id, d.l2ItemId),
    chancePerMillion: d.chancePerMillion,
    l2ItemId: d.l2ItemId,
    iconUrl: dropRowIconUrl(d),
  };
}

function scaleRewardNumber(value: number, rewardMult: number): number {
  if (!Number.isFinite(value) || rewardMult === 1) return value;
  return Math.max(0, Math.floor(value * rewardMult));
}

export interface SpawnCatalogViewerContext {
  race: string;
  l2Profession: string;
  skillsLearnedJson?: Prisma.JsonValue | null;
}

export interface SpawnCatalogInfo {
  spawnId: string;
  name: string;
  level: number;
  kind: string;
  aggressive: boolean;
  templateId: string;
  npcId: number | null;
  icon: string;
  stats: {
    maxHp: number;
    pAtk: number;
    pDef: number;
    mAtk: number;
    mDef: number;
  };
  drops: ReturnType<typeof serializeDrop>[];
  spoil: ReturnType<typeof serializeDrop>[];
  /** Чи показувати блок «Спойл» цьому персонажу (гном-Spoiler). */
  viewerMaySeeSpoil: boolean;
  /** EXP/SP для картки моба (число або діапазон «150 000–180 000» для кастомних РБ). */
  rewardExp: number | string;
  rewardSp: number | string;
  /** EXP/SP за формулою рівня (у дампі 0/0 або немає npc). */
  rewardExpSynthetic: boolean;
  /** Застаріле поле API; табличного XML-дропу немає, прев’ю — процедурне (ресурси + адена). */
  dropsSynthetic: boolean;
}

export function getSpawnCatalogInfo(
  spawnId: string,
  viewer?: SpawnCatalogViewerContext | null
): SpawnCatalogInfo | null {
  const spawn = getWorldSpawnById(spawnId);
  if (!spawn) return null;
  const npcId =
    resolveL2dopNpcIdByMobName(spawn.name) ??
    l2dopNpcIdFromMobId(spawn.templateId) ??
    null;
  const icon = mobIconUrlForSpawn(spawn);
  const c = mobCombatFromSpawn(spawn);
  const bag = ensureMobDropBag(npcId, spawn.level, spawnId);
  const customDropOnly = hasCustomNpcDropBag(npcId, spawnId);
  const resPreview = customDropOnly
    ? { drops: [], spoil: [] }
    : resourceDropsForSpawnCatalog(spawn.level, spawn.id);
  const showSpoil =
    !customDropOnly &&
    viewer != null &&
    viewerMaySeeSpoilLoot(viewer.race, viewer.l2Profession, viewer.skillsLearnedJson ?? null);
  const sdPreview =
    npcId != null
      ? sevenSignsDungeonMobRewardPreviewForNpcId(npcId, spawnId)
      : undefined;
  const rbPreview =
    !sdPreview && npcId != null
      ? raidBossRewardPreviewForNpcId(npcId)
      : undefined;
  const rewardMult =
    rbPreview || sdPreview
      ? 1
      : mobKillRewardMult({ spawnKind: spawn.kind, mobName: spawn.name });
  const drops = [...bag.drops, ...resPreview.drops].map((d) =>
    serializeDropScaled(d, rewardMult)
  );
  const spoil = showSpoil
    ? [...bag.spoil, ...resPreview.spoil].map((d) =>
        serializeDropScaled(d, rewardMult)
      )
    : [];
  const rw = rewardExpSpForSpawn(npcId, spawn.level);
  const rewardExp =
    sdPreview?.expLabel ??
    rbPreview?.expLabel ??
    scaleRewardNumber(rw.exp, rewardMult);
  const rewardSp =
    sdPreview?.spLabel ??
    rbPreview?.spLabel ??
    scaleRewardNumber(rw.sp, rewardMult);
  const rewardExpSynthetic =
    sdPreview != null || rbPreview != null ? false : rw.synthetic;
  return {
    spawnId: spawn.id,
    name: spawn.name,
    level: spawn.level,
    kind: spawn.kind,
    aggressive: spawn.aggressive,
    templateId: spawn.templateId,
    npcId,
    icon,
    stats: {
      maxHp: c.maxHp,
      pAtk: c.pAtk,
      pDef: c.pDef,
      mAtk: c.mAtk,
      mDef: c.mDef,
    },
    drops,
    spoil,
    viewerMaySeeSpoil: showSpoil,
    rewardExp,
    rewardSp,
    rewardExpSynthetic,
    dropsSynthetic: customDropOnly,
  };
}
