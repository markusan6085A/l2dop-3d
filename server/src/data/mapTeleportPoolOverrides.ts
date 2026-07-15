/**
 * Окремі пули мобів за teleportId (Gludio / Dion / Oren + пілотні зони).
 * Імена — l2dopNpcIdByName; рівні — l2dopNpcMeta / lineage spawnlist.
 */

import type { MapLocalityMob } from './mapLocalities.js';
import { TELEPORT_POOL_OVERRIDES_GIRAN_ADEN } from './mapTeleportPoolOverridesGiranAden.js';
import { TELEPORT_POOL_OVERRIDES_HEINE_SCHUTTGART } from './mapTeleportPoolOverridesHeineSchuttgart.js';
import { TELEPORT_POOL_OVERRIDES_GLUDIN_STARTER } from './mapTeleportPoolOverridesGludinStarter.js';

const TELEPORT_POOL_OVERRIDES_GLUDIO_OREN: Record<string, MapLocalityMob[]> = {
  // —— Gludio ——
  gludio: [
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
  ruins_of_agony: [
    { name: 'Ruin Zombie', level: 15 },
    { name: 'Ruin Zombie Leader', level: 16 },
    { name: 'Tracker Skeleton', level: 17 },
    { name: 'Tracker Skeleton Leader', level: 18 },
    { name: 'Skeleton Scout', level: 19 },
    { name: 'Skeleton Bowman', level: 20 },
    { name: 'Ruin Spartoi', level: 21 },
    { name: 'Raging Spartoi', level: 22 },
    { name: 'Ratman Warrior', level: 19 },
    { name: 'Stinger Wasp', level: 30 },
    { name: 'Troll', level: 33 },
    { name: 'Medusa', level: 34 },
    { name: 'Dead Seeker', level: 34 },
    { name: 'Two-Headed Giant', level: 35 },
  ],
  ruins_of_despair: [
    { name: 'Shield Skeleton', level: 15 },
    { name: 'Skeleton Infantryman', level: 16 },
    { name: 'Ruin Imp', level: 17 },
    { name: 'Scavenger Bat', level: 18 },
    { name: 'Ruin Bat', level: 20 },
    { name: 'Ruin Imp Elder', level: 21 },
    { name: 'Ruin Spartoi', level: 21 },
    { name: 'Raging Spartoi', level: 22 },
    { name: 'Skeleton Pikeman', level: 27 },
    { name: 'Skeleton Knight', level: 32 },
  ],
  ant_nest: [
    { name: 'Ant', level: 30 },
    { name: 'Ant Captain', level: 31 },
    { name: 'Ant Overseer', level: 32 },
    { name: 'Ant Recruit', level: 33 },
    { name: 'Ant Patrol', level: 34 },
    { name: 'Ant Guard', level: 35 },
    { name: 'Ant Soldier', level: 35 },
    { name: 'Ant Warrior Captain', level: 36 },
    { name: 'Noble Ant', level: 37 },
  ],
  windawood_manor: [
    { name: 'Ol Mahum Guard', level: 22 },
    { name: 'Hungry Eye', level: 22 },
    { name: 'Ol Mahum Reserve', level: 23 },
    { name: 'Ol Mahum Shooter', level: 24 },
    { name: 'Ol Mahum Patrolman', level: 25 },
    { name: 'Ol Mahum Officer', level: 24 },
  ],

  // —— Dion ——
  dion: [
    { name: 'Basilisk', level: 28 },
    { name: 'Ol Mahum Legionnaire', level: 28 },
    { name: 'Neer Crawler', level: 28 },
    { name: 'Ol Mahum Marksman', level: 28 },
    { name: 'Giant Crimson Ant', level: 28 },
    { name: 'Ol Mahum Guerilla', level: 26 },
    { name: 'Ol Mahum Raider', level: 27 },
    { name: 'Ol Mahum Sergeant', level: 29 },
    { name: 'Ol Mahum Captain', level: 30 },
    { name: 'Tumran Bugbear', level: 23 },
    { name: 'Ol Mahum Ranger', level: 22 },
  ],
  cruma_marshlands: [
    { name: 'Neer Crawler', level: 28 },
    { name: 'Marsh Stakato', level: 29 },
    { name: 'Marsh Stakato Worker', level: 31 },
    { name: 'Marsh Stakato Soldier', level: 33 },
    { name: 'Marsh Stakato Drone', level: 35 },
  ],
  cruma_tower: [
    { name: 'Porta', level: 40 },
    { name: 'Excuro', level: 41 },
    { name: 'Mordeo', level: 42 },
    { name: 'Catherok', level: 42 },
    { name: 'Ricenseo', level: 43 },
    { name: 'Krator', level: 44 },
    { name: 'Premo', level: 45 },
    { name: 'Validus', level: 46 },
    { name: 'Dicor', level: 47 },
    { name: 'Perum', level: 48 },
    { name: 'Torfe', level: 49 },
  ],
  fortress_of_resistance: [
    { name: 'Ol Mahum Guerilla', level: 26 },
    { name: 'Ol Mahum Raider', level: 27 },
    { name: 'Ol Mahum Marksman', level: 28 },
    { name: 'Ol Mahum Sergeant', level: 29 },
    { name: 'Ol Mahum Captain', level: 30 },
    { name: 'Ol Mahum Reserve', level: 23 },
    { name: 'Ol Mahum Shooter', level: 24 },
  ],
  plains_of_dion: [
    { name: 'Enku Orc Shaman', level: 20 },
    { name: 'Enku Orc Champion', level: 21 },
    { name: 'Tumran Bugbear', level: 23 },
    { name: 'Watchman of the Plains', level: 30 },
    { name: 'Roughly Hewn Rock Golem', level: 31 },
    { name: 'Ol Mahum Ranger', level: 22 },
  ],
  bee_hive: [
    { name: 'Stinger Wasp', level: 30 },
    { name: 'Hatu Weird Bee', level: 30 },
    { name: 'Wasp Worker', level: 35 },
    { name: 'Wasp Leader', level: 37 },
    { name: 'Giant Crimson Ant', level: 28 },
  ],
  tanor_canyon: [
    { name: 'Tanor Silenos', level: 40 },
    { name: 'Tanor Silenos Grunt', level: 42 },
    { name: 'Tanor Silenos Scout', level: 44 },
    { name: 'Tanor Silenos Warrior', level: 46 },
    { name: 'Nightmare Lord', level: 47 },
    { name: 'Tanor Silenos Chieftain', level: 50 },
  ],

  // —— Oren ——
  oren: [
    { name: 'Turek Orc Warlord', level: 30 },
    { name: 'Ant Larva', level: 29 },
    { name: 'Ant Captain', level: 31 },
    { name: 'Ant Soldier', level: 35 },
    { name: 'Marsh Stakato Drone', level: 35 },
    { name: 'Marsh Stakato Soldier', level: 33 },
    { name: 'Crimson Spider', level: 15 },
    { name: 'Pincer Spider', level: 17 },
    { name: 'Ol Mahum Raider', level: 27 },
    { name: 'Lesser Dark Horror', level: 15 },
    { name: 'Dark Horror', level: 16 },
  ],
  ivory_tower: [
    { name: 'Manashen Gargoyle', level: 40 },
    { name: 'Enchanted Monstereye', level: 41 },
    { name: 'Enchanted Stone Golem', level: 42 },
  ],
  skyshadow_meadow: [
    { name: 'Connabi', level: 54 },
  ],
  plains_of_the_lizardman: [
    { name: 'Leto Lizardman', level: 35 },
    { name: 'Leto Lizardman Archer', level: 36 },
    { name: 'Leto Lizardman Soldier', level: 37 },
    { name: 'Leto Lizardman Warrior', level: 38 },
    { name: 'Leto Lizardman Shaman', level: 39 },
  ],
  outlaw_forest: [
    { name: 'Tarlk Basilisk', level: 50 },
    { name: 'Elder Tarlk Basilisk', level: 51 },
    { name: 'Ol Mahum Transcender', level: 50 },
    { name: 'Hunter Gargoyle', level: 52 },
    { name: 'Oel Mahum', level: 53 },
    { name: 'Oel Mahum Warrior', level: 54 },
    { name: 'Oel Mahum Witch Doctor', level: 55 },
  ],
  sea_of_spores: [
    { name: 'Giant Fungus', level: 40 },
    { name: 'Giant Monstereye', level: 41 },
    { name: 'Dire Wyrm', level: 42 },
  ],
};

export const TELEPORT_POOL_OVERRIDES: Record<string, MapLocalityMob[]> = {
  ...TELEPORT_POOL_OVERRIDES_GLUDIO_OREN,
  ...TELEPORT_POOL_OVERRIDES_GIRAN_ADEN,
  ...TELEPORT_POOL_OVERRIDES_HEINE_SCHUTTGART,
  ...TELEPORT_POOL_OVERRIDES_GLUDIN_STARTER,
};
