/** Каталог типів мобів Seven Signs подземель (перший пул — Necropolis of Sacrifice). */

export interface SevenSignsDungeonMobType {
  npcId: number;
  name: string;
  level: number;
  aggressive: boolean;
  /** Фіксований EXP за кілл (L2DOP tuning). */
  exp: number;
}

/** Necropolis of Sacrifice — Lv.20–30, 16 видів × 10 шт. */
export const NECROPOLIS_OF_SACRIFICE_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21208, name: 'Hallowed Watchman', level: 20, aggressive: false, exp: 2085 },
  { npcId: 21187, name: 'Gigant Slave', level: 21, aggressive: false, exp: 2380 },
  { npcId: 21166, name: 'Lith Scout', level: 21, aggressive: false, exp: 2380 },
  { npcId: 21209, name: 'Hallowed Seer', level: 22, aggressive: true, exp: 2450 },
  { npcId: 21139, name: 'Catacomb Barbed Bat', level: 23, aggressive: true, exp: 2621 },
  { npcId: 21188, name: 'Gigant Acolyte', level: 24, aggressive: false, exp: 2763 },
  { npcId: 21167, name: 'Lith Witch', level: 24, aggressive: false, exp: 2763 },
  { npcId: 21210, name: 'Vault Guardian', level: 25, aggressive: true, exp: 3121 },
  { npcId: 21140, name: 'Catacomb Wisp', level: 26, aggressive: true, exp: 3153 },
  { npcId: 21189, name: 'Gigant Overseer', level: 27, aggressive: false, exp: 3420 },
  { npcId: 21168, name: 'Lith Warrior', level: 27, aggressive: false, exp: 3420 },
  { npcId: 21211, name: 'Vault Seer', level: 27, aggressive: true, exp: 3321 },
  { npcId: 21141, name: 'Catacomb Serpent', level: 28, aggressive: true, exp: 3706 },
  { npcId: 21142, name: 'Grave Keeper Spartoi', level: 29, aggressive: true, exp: 3710 },
  { npcId: 21190, name: 'Gigant Footman', level: 30, aggressive: false, exp: 4532 },
  { npcId: 21169, name: 'Lith Guard', level: 30, aggressive: false, exp: 4532 },
];

export const SEVEN_SIGNS_DUNGEON_MOB_TYPES_BY_DUNGEON: Readonly<
  Record<string, readonly SevenSignsDungeonMobType[]>
> = {
  necropolis_of_sacrifice: NECROPOLIS_OF_SACRIFICE_MOBS,
};

export function dungeonMobTypesForId(
  dungeonId: string
): readonly SevenSignsDungeonMobType[] {
  return SEVEN_SIGNS_DUNGEON_MOB_TYPES_BY_DUNGEON[dungeonId] ?? [];
}
