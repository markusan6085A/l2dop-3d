/**
 * Пули мобів за teleportId (кожна зона телепорту — свій пул).
 * За замовчуванням успадковує cityId; окремі зони — у TELEPORT_POOL_OVERRIDES.
 */

import type { MapLocalityMob, MapTownRef } from './mapLocalities.js';
import { TELEPORT_POOL_OVERRIDES } from './mapTeleportPoolOverrides.js';

/** Шаблони пулів за містом/регіоном (як у text-rpg cities.ts). */
export const MOBS_BY_CITY: Record<string, MapLocalityMob[]> = {
  l2dop_giran: [
    { name: 'Monster Eye Destroyer', level: 26 },
    { name: 'Selu Lizardman Scout', level: 26 },
    { name: 'Skeleton Royal Guard', level: 26 },
    { name: 'Ol Mahum Guerilla', level: 30 },
    { name: 'Gray Ant', level: 28 },
    { name: 'Dead Pit Spartoi', level: 32 },
    { name: 'Grim Grizzly', level: 35 },
    { name: 'Lesser Basilisk', level: 34 },
    { name: 'Turek Orc Footman', level: 30 },
    { name: 'Gargoyle', level: 36 },
    { name: 'Ol Mahum Raider', level: 32 },
    { name: 'Glass Jaguar', level: 38 },
    { name: 'Kuran Kobold', level: 27 },
    { name: 'Lafi Lizardman', level: 29 },
  ],
  /** Fallback для cityId без override: англ. імена з l2dopNpcIdByName (як у gludio teleport). */
  l2dop_gludio: [
    { name: 'Hungry Eye', level: 22 },
    { name: 'Ol Mahum Deserter', level: 23 },
    { name: 'Wandering Eye', level: 21 },
    { name: 'Monster Eye Watcher', level: 25 },
    { name: 'Ol Mahum Guard', level: 22 },
    { name: 'Ol Mahum Patrol', level: 21 },
    { name: 'Arachnid Predator', level: 20 },
    { name: 'Grizzly Bear', level: 17 },
    { name: 'Goblin', level: 5 },
  ],
  l2dop_dion: [
    { name: 'Basilisk', level: 25 },
    { name: 'Ol Mahum Legionnaire', level: 28 },
    { name: 'Neer Crawler', level: 26 },
    { name: 'Giant Crimson Ant', level: 30 },
    { name: 'Skeleton Axeman', level: 29 },
    { name: 'Turek Orc Skirmisher', level: 31 },
    { name: 'Kuran Kobold Warrior', level: 28 },
    { name: 'Lafi Lizardman Scout', level: 26 },
    { name: 'Talakin Archer', level: 32 },
    { name: 'Maille Lizardman Shaman', level: 30 },
    { name: 'Ol Mahum Marksman', level: 29 },
  ],
  l2dop_oren: [
    { name: 'Turek Orc Warlord', level: 18 },
    { name: 'Ant Larva', level: 16 },
    { name: 'Ant Captain', level: 20 },
    { name: 'Ant Warrior', level: 19 },
    { name: 'Marsh Stakato Drone', level: 22 },
    { name: 'Marsh Stakato Soldier', level: 24 },
    { name: 'Crimson Spider', level: 21 },
    { name: 'Pincer Spider', level: 23 },
    { name: 'Ol Mahum Support', level: 20 },
    { name: 'Ol Mahum Raider', level: 22 },
    { name: 'Lesser Dark Horror', level: 25 },
    { name: 'Dark Horror', level: 27 },
  ],
  hunters_village: [
    { name: 'Crimson Spider', level: 40 },
    { name: 'Plunder Tarantula', level: 42 },
    { name: 'Hunter Gargoyle', level: 44 },
    { name: 'Breka Orc Overlord', level: 43 },
    { name: 'Breka Orc Shaman', level: 41 },
    { name: 'Fettered Soul', level: 45 },
    { name: 'Windsus', level: 40 },
    { name: 'Taik Orc Supply', level: 42 },
    { name: 'Taik Orc Captain', level: 44 },
    { name: 'Marsh Predator', level: 43 },
    { name: 'Hunter Bear', level: 41 },
    { name: 'Kronbe Spider', level: 46 },
  ],
  l2dop_aden: [
    { name: 'Cave Servant Archer', level: 40 },
    { name: 'Cave Servant Warrior', level: 42 },
    { name: 'Cave Servant Captain', level: 44 },
    { name: 'Cave Keeper', level: 46 },
    { name: 'Royal Cave Servant', level: 48 },
    { name: 'Cave Maiden', level: 50 },
    { name: 'Headless Knight', level: 52 },
    { name: 'Dustwind Gargoyle', level: 54 },
    { name: 'Blazing Ifrit', level: 56 },
    { name: 'Bloody Priest', level: 58 },
    { name: 'Taik Orc Supply', level: 44 },
    { name: 'Taik Orc Captain', level: 46 },
    { name: 'Crimson Drake', level: 50 },
    { name: 'Drake', level: 48 },
  ],
  floran_village: [
    { name: 'Young Red Keltir', level: 5 },
    { name: 'Red Keltir', level: 7 },
    { name: 'Elder Red Keltir', level: 9 },
    { name: 'Goblin Raider', level: 8 },
    { name: 'Goblin Scout', level: 6 },
    { name: 'Goblin Fighter', level: 7 },
    { name: 'Dryad', level: 10 },
    { name: 'Green Dryad', level: 11 },
    { name: 'Arachnid Predator', level: 12 },
    { name: 'Hook Spider', level: 10 },
    { name: 'Lesser Dark Horror', level: 14 },
    { name: 'Skeleton Marksman', level: 13 },
  ],
  l2dop_schuttgart: [
    { name: 'Snow Lynx', level: 55 },
    { name: 'Lost Buffalo', level: 56 },
    { name: 'Ursus Cub', level: 54 },
    { name: 'Ursus', level: 58 },
    { name: 'Frost Yeti', level: 57 },
    { name: 'Alpen Kookaburra', level: 59 },
    { name: 'Alpen Cougar', level: 60 },
    { name: 'Frost Buffalo', level: 58 },
    { name: 'Lost Yeti', level: 59 },
    { name: 'Hoarfrost Yeti', level: 61 },
    { name: 'Frost Iron Golem', level: 62 },
    { name: 'Ice Giant', level: 63 },
  ],
  gludin_village: [
    { name: 'Goblin Raider', level: 4 },
    { name: 'Goblin Scout', level: 3 },
    { name: 'Goblin Fighter', level: 5 },
    { name: 'Vuku Orc', level: 6 },
    { name: 'Vuku Orc Archer', level: 7 },
    { name: 'Rakeclaw Imp', level: 8 },
    { name: 'Imp Elder', level: 9 },
    { name: 'Ol Mahum Raider', level: 10 },
    { name: 'Ol Mahum Sniper', level: 11 },
    { name: 'Ol Mahum Lookout', level: 10 },
    { name: 'Lesser Basilisk', level: 12 },
    { name: 'Basilisk', level: 13 },
  ],
  l2dop_heine: [
    { name: 'Coral Golem', level: 44 },
    { name: 'Shark', level: 42 },
    { name: 'Doll Blader', level: 46 },
    { name: 'Crokian Lad', level: 45 },
    { name: 'Crokian Warrior', level: 47 },
    { name: 'Farhite', level: 43 },
    { name: 'Crokian Lad Warrior', level: 48 },
    { name: 'Trives', level: 46 },
    { name: 'Crokian', level: 49 },
    { name: 'Crokian Warrior Captain', level: 50 },
    { name: 'Trives Chief', level: 51 },
    { name: 'Crokian Chief', level: 52 },
  ],
  l2dop_rune: [
    { name: 'Ice Tarantula', level: 58 },
    { name: 'Frost Tarantula', level: 59 },
    { name: 'Frost Tarantula Soldier', level: 60 },
    { name: 'Frost Buffalo', level: 57 },
    { name: 'Lost Buffalo', level: 56 },
    { name: 'Alpen Cougar', level: 61 },
    { name: 'Alpen Kookaburra', level: 60 },
    { name: 'Hoarfrost Yeti', level: 62 },
    { name: 'Frost Yeti', level: 58 },
    { name: 'Ice Giant', level: 63 },
    { name: 'Frost Iron Golem', level: 62 },
    { name: 'Ursus', level: 58 },
  ],
  l2dop_goddard: [
    { name: 'Buffalo Slave', level: 52 },
    { name: 'Buffalo Slave Leader', level: 54 },
    { name: 'Grazing Antelope', level: 50 },
    { name: 'Antelope', level: 51 },
    { name: 'Antelope Slayer', level: 53 },
    { name: 'Kookaburra', level: 55 },
    { name: 'Cougar', level: 56 },
    { name: 'Grendel', level: 57 },
    { name: 'Yeti', level: 58 },
    { name: 'Yeti Shaman', level: 59 },
    { name: 'Frost Yeti', level: 60 },
    { name: 'Iron Golem', level: 61 },
    { name: 'Hot Springs Bandersnatchling', level: 73 },
    { name: 'Hot Springs Buffalo', level: 73 },
    { name: 'Hot Springs Flava', level: 74 },
    { name: 'Hot Springs Atroxspawn', level: 74 },
    { name: 'Hot Springs Antelope', level: 74 },
    { name: 'Hot Springs Nepenthes', level: 75 },
    { name: 'Hot Springs Yeti', level: 75 },
    { name: 'Hot Springs Atrox', level: 76 },
    { name: 'Hot Springs Bandersnatch', level: 76 },
    { name: 'Hot Springs Grendel', level: 76 },
    { name: 'Ketra Orc Footman', level: 77 },
    { name: "Ketra's War Hound", level: 77 },
    { name: 'Grazing Kookaburra', level: 77 },
    { name: 'Ketra Orc Raider', level: 78 },
    { name: 'Ketra Orc Scout', level: 78 },
    { name: 'Ketra Orc Shaman', level: 79 },
    { name: 'Grazing Buffalo', level: 79 },
    { name: 'Ketra Orc Warrior', level: 80 },
    { name: 'Ketra Orc Lieutenant', level: 80 },
    { name: 'Grazing Windsus', level: 80 },
    { name: 'Ketra Orc Medium', level: 80 },
    { name: 'Ketra Orc Elite Soldier', level: 80 },
  ],
  ancient_tomb_fields: [
    { name: 'Tomb Raider', level: 48 },
    { name: 'Tomb Guardian', level: 50 },
    { name: 'Tomb Sage', level: 52 },
    { name: 'Grave Scarab', level: 49 },
    { name: 'Grave Ant', level: 51 },
    { name: 'Bone Snatcher', level: 47 },
    { name: 'Bone Scavenger', level: 50 },
    { name: 'Bone Scorpion', level: 53 },
    { name: 'Bone Soldier', level: 52 },
    { name: 'Bone Knight', level: 54 },
    { name: 'Bone Warlord', level: 55 },
    { name: 'Bone Archer', level: 51 },
  ],
};

const MOBS_BY_TELEPORT: Record<string, MapLocalityMob[]> = {};
let teleportPoolsBuilt = false;

function cityPool(cityId: string): MapLocalityMob[] {
  return MOBS_BY_CITY[cityId] ?? MOBS_BY_CITY.l2dop_gludio!;
}

function ensureTeleportPoolsBuilt(getTowns: () => MapTownRef[]): void {
  if (teleportPoolsBuilt) return;
  for (const t of getTowns()) {
    MOBS_BY_TELEPORT[t.teleportId] =
      TELEPORT_POOL_OVERRIDES[t.teleportId] ?? cityPool(t.cityId);
  }
  teleportPoolsBuilt = true;
}

type TownsProvider = () => MapTownRef[];
let townsProvider: TownsProvider | null = null;

/** Реєструє провайдер MAP_TOWNS (викликається з mapLocalities після оголошення масиву). */
export function registerMapTownsProvider(provider: TownsProvider): void {
  townsProvider = provider;
}

function getTowns(): MapTownRef[] {
  if (!townsProvider) {
    throw new Error('mapTeleportMobPools: MAP_TOWNS provider not registered');
  }
  return townsProvider();
}

/** Пул мобів для міста (legacy / fallback). */
export function mobPoolForCity(cityId: string): MapLocalityMob[] {
  return cityPool(cityId);
}

/** Пул мобів для конкретної зони телепорту. */
export function mobPoolForTeleport(teleportId: string, cityIdFallback?: string): MapLocalityMob[] {
  ensureTeleportPoolsBuilt(getTowns);
  return (
    MOBS_BY_TELEPORT[teleportId] ??
    (cityIdFallback ? cityPool(cityIdFallback) : cityPool('l2dop_gludio'))
  );
}
