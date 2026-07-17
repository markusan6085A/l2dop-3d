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

/** The Pilgrim's Necropolis — Lv.32–40, 12 видів × 10 шт. */
export const PILGRIMS_NECROPOLIS_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21213, name: 'Hallowed Monk', level: 32, aggressive: true, exp: 4443 },
  { npcId: 21191, name: 'Gigant Cleric', level: 33, aggressive: false, exp: 5231 },
  { npcId: 21170, name: 'Lith Medium', level: 33, aggressive: false, exp: 5231 },
  { npcId: 21144, name: 'Catacomb Shadow', level: 34, aggressive: true, exp: 5016 },
  { npcId: 21214, name: 'Vault Sentinel', level: 35, aggressive: true, exp: 5603 },
  { npcId: 21192, name: 'Gigant Officer', level: 36, aggressive: false, exp: 6677 },
  { npcId: 21171, name: 'Lith Overlord', level: 36, aggressive: false, exp: 6677 },
  { npcId: 21215, name: 'Vault Monk', level: 37, aggressive: true, exp: 5940 },
  { npcId: 21145, name: 'Catacomb Stakato Soldier', level: 38, aggressive: true, exp: 6444 },
  { npcId: 21193, name: 'Gigant Raider', level: 39, aggressive: false, exp: 7888 },
  { npcId: 21172, name: 'Lith Patrolman', level: 39, aggressive: false, exp: 7888 },
  { npcId: 21146, name: 'Grave Keeper Dark Horror', level: 40, aggressive: true, exp: 6943 },
];

/** Necropolis of Worship — Lv.42–51, 12 видів × 10 шт. */
export const NECROPOLIS_OF_WORSHIP_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21217, name: 'Hallowed Priest', level: 42, aggressive: true, exp: 7654 },
  { npcId: 21147, name: 'Catacomb Gargoyle', level: 43, aggressive: true, exp: 8457 },
  { npcId: 21148, name: 'Catacomb Liviona', level: 44, aggressive: true, exp: 8401 },
  { npcId: 21195, name: 'Gigant Commander', level: 45, aggressive: false, exp: 10925 },
  { npcId: 21174, name: 'Lith Commander', level: 45, aggressive: false, exp: 10925 },
  { npcId: 21218, name: 'Vault Overlord', level: 45, aggressive: true, exp: 9263 },
  { npcId: 21149, name: 'Decayed Ancient Pikeman', level: 46, aggressive: true, exp: 9679 },
  { npcId: 21219, name: 'Vault Priest', level: 47, aggressive: true, exp: 9585 },
  { npcId: 21175, name: 'Lilim Butcher', level: 48, aggressive: false, exp: 12374 },
  { npcId: 21196, name: 'Nephilim Sentinel', level: 48, aggressive: false, exp: 12374 },
  { npcId: 21176, name: 'Lilim Magus', level: 51, aggressive: false, exp: 12493 },
  { npcId: 21197, name: 'Nephilim Priest', level: 51, aggressive: false, exp: 13567 },
];

/** Patriot's Necropolis — Lv.52–60, 11 видів × 10 шт. (Sepulcher Inquisitor — один npcId). */
export const PATRIOTS_NECROPOLIS_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21221, name: 'Sepulcher Inquisitor', level: 57, aggressive: true, exp: 14098 },
  { npcId: 21177, name: 'Lilim Knight Errant', level: 54, aggressive: false, exp: 17542 },
  { npcId: 21198, name: 'Nephilim Swordsman', level: 54, aggressive: false, exp: 17542 },
  { npcId: 21220, name: 'Sepulcher Archon', level: 55, aggressive: true, exp: 13837 },
  { npcId: 21153, name: 'Purgatory Serpent', level: 56, aggressive: true, exp: 14344 },
  { npcId: 21178, name: 'Lilim Marauder', level: 57, aggressive: false, exp: 18790 },
  { npcId: 21199, name: 'Nephilim Guard', level: 57, aggressive: false, exp: 18790 },
  { npcId: 21154, name: 'Hell Keeper Medusa', level: 58, aggressive: true, exp: 15013 },
  { npcId: 21155, name: 'Purgatory Conjurer', level: 59, aggressive: true, exp: 15105 },
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false, exp: 17292 },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false, exp: 18777 },
];

/** Necropolis of Devotion — Lv.60–67, 11 видів × 10 шт. (Sepulcher Guardian — один npcId). */
export const NECROPOLIS_OF_DEVOTION_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false, exp: 17292 },
  { npcId: 21224, name: 'Sepulcher Guardian', level: 65, aggressive: true, exp: 19326 },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false, exp: 18777 },
  { npcId: 21156, name: 'Purgatory Shadow', level: 61, aggressive: true, exp: 16146 },
  { npcId: 21225, name: 'Sepulcher Sage', level: 62, aggressive: true, exp: 16680 },
  { npcId: 21180, name: 'Lilim Knight', level: 63, aggressive: false, exp: 25957 },
  { npcId: 21201, name: 'Nephilim Centurion', level: 63, aggressive: false, exp: 25957 },
  { npcId: 21157, name: 'Purgatory Tarantula', level: 64, aggressive: true, exp: 18280 },
  { npcId: 21181, name: 'Lilim Assassin', level: 66, aggressive: false, exp: 27475 },
  { npcId: 21202, name: 'Nephilim Scout', level: 66, aggressive: false, exp: 27475 },
  { npcId: 21158, name: 'Hell Keeper Crimson Doll', level: 67, aggressive: true, exp: 20533 },
];

/** Necropolis of Martyrdom — Lv.65–72, 12 видів × 10 шт. */
export const NECROPOLIS_OF_MARTYRDOM_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21224, name: 'Sepulcher Guardian', level: 65, aggressive: true, exp: 19326 },
  { npcId: 21181, name: 'Lilim Assassin', level: 66, aggressive: false, exp: 27475 },
  { npcId: 21202, name: 'Nephilim Scout', level: 66, aggressive: false, exp: 27475 },
  { npcId: 21158, name: 'Hell Keeper Crimson Doll', level: 67, aggressive: true, exp: 20533 },
  { npcId: 21225, name: 'Sepulcher Sage', level: 67, aggressive: true, exp: 21777 },
  { npcId: 21159, name: 'Purgatory Gargoyle', level: 68, aggressive: true, exp: 21151 },
  { npcId: 21182, name: 'Lilim Soldier', level: 69, aggressive: false, exp: 22868 },
  { npcId: 21203, name: 'Nephilim Archbishop', level: 69, aggressive: false, exp: 24833 },
  { npcId: 21228, name: 'Sepulcher Guard', level: 70, aggressive: false, exp: 20845 },
  { npcId: 21160, name: 'Purgatory Liviona', level: 71, aggressive: true, exp: 21874 },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false, exp: 33903 },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false, exp: 33903 },
];

/** The Saint's Necropolis — Lv.70–78, 11 видів × 10 шт. (Sepulcher Guard — один npcId). */
export const SAINTS_NECROPOLIS_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21228, name: 'Sepulcher Guard', level: 75, aggressive: true, exp: 25729 },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false, exp: 33903 },
  { npcId: 21229, name: 'Sepulcher Preacher', level: 72, aggressive: true, exp: 22494 },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false, exp: 33903 },
  { npcId: 21161, name: 'Lesser Ancient Soldier', level: 73, aggressive: true, exp: 23782 },
  { npcId: 21162, name: 'Lesser Ancient Scout', level: 74, aggressive: true, exp: 23761 },
  { npcId: 21184, name: 'Lilim Slayer', level: 75, aggressive: false, exp: 35479 },
  { npcId: 21205, name: 'Nephilim Royal Guard', level: 75, aggressive: false, exp: 35479 },
  { npcId: 21163, name: 'Lesser Ancient Shaman', level: 76, aggressive: true, exp: 25063 },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false, exp: 29223 },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false, exp: 31734 },
];

/** The Disciple's Necropolis — Lv.70–78, 14 видів × 10 шт. (+ РБ Death Lord Shax). */
export const DISCIPLES_NECROPOLIS_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21228, name: 'Sepulcher Guard', level: 75, aggressive: true, exp: 25729 },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false, exp: 33903 },
  { npcId: 21229, name: 'Sepulcher Preacher', level: 77, aggressive: true, exp: 25727 },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false, exp: 33903 },
  { npcId: 21161, name: 'Lesser Ancient Soldier', level: 73, aggressive: true, exp: 23782 },
  { npcId: 21162, name: 'Lesser Ancient Scout', level: 74, aggressive: true, exp: 23761 },
  { npcId: 21184, name: 'Lilim Slayer', level: 75, aggressive: false, exp: 35479 },
  { npcId: 21205, name: 'Nephilim Royal Guard', level: 75, aggressive: false, exp: 35479 },
  { npcId: 21164, name: 'Guardian Spirit of Ancient Holy Ground', level: 78, aggressive: true, exp: 28547 },
  { npcId: 21165, name: 'Lesser Ancient Warrior', level: 78, aggressive: true, exp: 31048 },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false, exp: 29223 },
  { npcId: 21186, name: 'Lilim Court Knight', level: 78, aggressive: false, exp: 41856 },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false, exp: 31734 },
  { npcId: 21207, name: 'Nephilim Commander', level: 78, aggressive: false, exp: 41856 },
];

/** Catacomb of the Heretic — Lv.30–40, 16 видів × 10 шт. */
export const CATACOMB_OF_THE_HERETIC_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21236, name: 'Barrow Sentinel', level: 30, aggressive: false, exp: 3829 },
  { npcId: 21190, name: 'Gigant Footman', level: 30, aggressive: false, exp: 4532 },
  { npcId: 21169, name: 'Lith Guard', level: 30, aggressive: false, exp: 4532 },
  { npcId: 21143, name: 'Catacomb Scavenger Bat', level: 31, aggressive: true, exp: 4170 },
  { npcId: 21237, name: 'Barrow Monk', level: 32, aggressive: true, exp: 4443 },
  { npcId: 21191, name: 'Gigant Cleric', level: 33, aggressive: false, exp: 5231 },
  { npcId: 21170, name: 'Lith Medium', level: 33, aggressive: false, exp: 5231 },
  { npcId: 21144, name: 'Catacomb Shadow', level: 34, aggressive: true, exp: 5016 },
  { npcId: 21238, name: 'Grave Sentinel', level: 35, aggressive: true, exp: 5603 },
  { npcId: 21192, name: 'Gigant Officer', level: 36, aggressive: false, exp: 6677 },
  { npcId: 21171, name: 'Lith Overlord', level: 36, aggressive: false, exp: 6677 },
  { npcId: 21239, name: 'Grave Monk', level: 37, aggressive: true, exp: 5940 },
  { npcId: 21145, name: 'Catacomb Stakato Soldier', level: 38, aggressive: true, exp: 6444 },
  { npcId: 21193, name: 'Gigant Raider', level: 39, aggressive: false, exp: 7888 },
  { npcId: 21172, name: 'Lith Patrolman', level: 39, aggressive: false, exp: 7888 },
  { npcId: 21146, name: 'Grave Keeper Dark Horror', level: 40, aggressive: true, exp: 6943 },
];

/** Catacomb of the Branded — Lv.40–51, 16 видів × 10 шт. */
export const CATACOMB_OF_THE_BRANDED_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21240, name: 'Barrow Overlord', level: 40, aggressive: false, exp: 6807 },
  { npcId: 21241, name: 'Barrow Priest', level: 42, aggressive: true, exp: 7654 },
  { npcId: 21194, name: 'Gigant Confessor', level: 42, aggressive: false, exp: 8473 },
  { npcId: 21173, name: 'Lith Shaman', level: 42, aggressive: false, exp: 8473 },
  { npcId: 21147, name: 'Catacomb Gargoyle', level: 43, aggressive: true, exp: 8457 },
  { npcId: 21195, name: 'Gigant Commander', level: 45, aggressive: false, exp: 10925 },
  { npcId: 21242, name: 'Grave Overlord', level: 45, aggressive: true, exp: 9263 },
  { npcId: 21174, name: 'Lith Commander', level: 45, aggressive: false, exp: 10925 },
  { npcId: 21149, name: 'Decayed Ancient Pikeman', level: 46, aggressive: true, exp: 9679 },
  { npcId: 21243, name: 'Grave Priest', level: 47, aggressive: true, exp: 9585 },
  { npcId: 21175, name: 'Lilim Butcher', level: 48, aggressive: false, exp: 12374 },
  { npcId: 21196, name: 'Nephilim Sentinel', level: 48, aggressive: false, exp: 12374 },
  { npcId: 21150, name: 'Decayed Ancient Soldier', level: 49, aggressive: true, exp: 10982 },
  { npcId: 21151, name: 'Decayed Ancient Knight', level: 50, aggressive: true, exp: 11435 },
  { npcId: 21176, name: 'Lilim Magus', level: 51, aggressive: false, exp: 12493 },
  { npcId: 21197, name: 'Nephilim Priest', level: 51, aggressive: false, exp: 13567 },
];

/** Catacomb of the Apostate — Lv.50–60, 16 видів × 10 шт. */
export const CATACOMB_OF_THE_APOSTATE_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21244, name: 'Crypt Archon', level: 50, aggressive: false, exp: 10635 },
  { npcId: 21176, name: 'Lilim Magus', level: 51, aggressive: false, exp: 12493 },
  { npcId: 21197, name: 'Nephilim Priest', level: 51, aggressive: false, exp: 13567 },
  { npcId: 21245, name: 'Crypt Inquisitor', level: 52, aggressive: true, exp: 11733 },
  { npcId: 21152, name: 'Purgatory Wisp', level: 53, aggressive: true, exp: 12189 },
  { npcId: 21177, name: 'Lilim Knight Errant', level: 54, aggressive: false, exp: 17542 },
  { npcId: 21198, name: 'Nephilim Swordsman', level: 54, aggressive: false, exp: 17542 },
  { npcId: 21246, name: 'Tomb Archon', level: 55, aggressive: true, exp: 13837 },
  { npcId: 21153, name: 'Purgatory Serpent', level: 56, aggressive: true, exp: 14344 },
  { npcId: 21178, name: 'Lilim Marauder', level: 57, aggressive: false, exp: 18790 },
  { npcId: 21199, name: 'Nephilim Guard', level: 57, aggressive: false, exp: 18790 },
  { npcId: 21247, name: 'Tomb Inquisitor', level: 57, aggressive: true, exp: 14098 },
  { npcId: 21154, name: 'Hell Keeper Medusa', level: 58, aggressive: true, exp: 15013 },
  { npcId: 21155, name: 'Purgatory Conjurer', level: 59, aggressive: true, exp: 15105 },
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false, exp: 17292 },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false, exp: 18777 },
];

/** Catacomb of the Witch — Lv.60–72, 19 видів × 10 шт. */
export const CATACOMB_OF_THE_WITCH_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21248, name: 'Crypt Guardian', level: 60, aggressive: false, exp: 15315 },
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false, exp: 17292 },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false, exp: 18777 },
  { npcId: 21156, name: 'Purgatory Shadow', level: 61, aggressive: true, exp: 16146 },
  { npcId: 21249, name: 'Crypt Sage', level: 62, aggressive: true, exp: 16680 },
  { npcId: 21180, name: 'Lilim Knight', level: 63, aggressive: false, exp: 25957 },
  { npcId: 21201, name: 'Nephilim Centurion', level: 63, aggressive: false, exp: 25957 },
  { npcId: 21157, name: 'Purgatory Tarantula', level: 64, aggressive: true, exp: 18280 },
  { npcId: 21250, name: 'Tomb Guardian', level: 65, aggressive: true, exp: 19326 },
  { npcId: 21181, name: 'Lilim Assassin', level: 66, aggressive: false, exp: 27475 },
  { npcId: 21202, name: 'Nephilim Scout', level: 66, aggressive: false, exp: 27475 },
  { npcId: 21251, name: 'Tomb Sage', level: 67, aggressive: true, exp: 21777 },
  { npcId: 21159, name: 'Purgatory Gargoyle', level: 68, aggressive: true, exp: 21151 },
  { npcId: 21182, name: 'Lilim Soldier', level: 69, aggressive: false, exp: 22868 },
  { npcId: 21203, name: 'Nephilim Archbishop', level: 69, aggressive: false, exp: 24833 },
  { npcId: 21252, name: 'Crypt Guard', level: 70, aggressive: false, exp: 20845 },
  { npcId: 21160, name: 'Purgatory Liviona', level: 71, aggressive: true, exp: 21874 },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false, exp: 33903 },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false, exp: 33903 },
];

/** Catacomb of Dark Omens — Lv.72–78, 12 видів × 10 шт. */
export const CATACOMB_OF_DARK_OMENS_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21253, name: 'Crypt Preacher', level: 72, aggressive: true, exp: 22494 },
  { npcId: 21162, name: 'Lesser Ancient Scout', level: 74, aggressive: true, exp: 23761 },
  { npcId: 21184, name: 'Lilim Slayer', level: 75, aggressive: false, exp: 35479 },
  { npcId: 21205, name: 'Nephilim Royal Guard', level: 75, aggressive: false, exp: 35479 },
  { npcId: 21254, name: 'Tomb Guard', level: 75, aggressive: true, exp: 25729 },
  { npcId: 21163, name: 'Lesser Ancient Shaman', level: 76, aggressive: true, exp: 25063 },
  { npcId: 21255, name: 'Tomb Preacher', level: 77, aggressive: true, exp: 28763 },
  { npcId: 21165, name: 'Lesser Ancient Warrior', level: 78, aggressive: true, exp: 31048 },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false, exp: 29223 },
  { npcId: 21186, name: 'Lilim Court Knight', level: 78, aggressive: false, exp: 41856 },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false, exp: 31734 },
  { npcId: 21207, name: 'Nephilim Commander', level: 78, aggressive: false, exp: 41856 },
];

/** Catacomb of the Forbidden Path — Lv.75–78, 9 видів × 10 шт. */
export const CATACOMB_OF_THE_FORBIDDEN_PATH_MOBS: readonly SevenSignsDungeonMobType[] = [
  { npcId: 21254, name: 'Tomb Guard', level: 75, aggressive: true, exp: 25729 },
  { npcId: 21163, name: 'Lesser Ancient Shaman', level: 76, aggressive: true, exp: 25063 },
  { npcId: 21255, name: 'Tomb Preacher', level: 77, aggressive: true, exp: 28763 },
  { npcId: 21164, name: 'Guardian Spirit of Ancient Holy Ground', level: 78, aggressive: true, exp: 28547 },
  { npcId: 21165, name: 'Lesser Ancient Warrior', level: 78, aggressive: true, exp: 31048 },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false, exp: 29223 },
  { npcId: 21186, name: 'Lilim Court Knight', level: 78, aggressive: false, exp: 41856 },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false, exp: 31734 },
  { npcId: 21207, name: 'Nephilim Commander', level: 78, aggressive: false, exp: 41856 },
];

export const SEVEN_SIGNS_DUNGEON_MOB_TYPES_BY_DUNGEON: Readonly<
  Record<string, readonly SevenSignsDungeonMobType[]>
> = {
  necropolis_of_sacrifice: NECROPOLIS_OF_SACRIFICE_MOBS,
  pilgrims_necropolis: PILGRIMS_NECROPOLIS_MOBS,
  necropolis_of_worship: NECROPOLIS_OF_WORSHIP_MOBS,
  patriots_necropolis: PATRIOTS_NECROPOLIS_MOBS,
  necropolis_of_devotion: NECROPOLIS_OF_DEVOTION_MOBS,
  necropolis_of_martyrdom: NECROPOLIS_OF_MARTYRDOM_MOBS,
  saints_necropolis: SAINTS_NECROPOLIS_MOBS,
  disciples_necropolis: DISCIPLES_NECROPOLIS_MOBS,
  catacomb_of_the_heretic: CATACOMB_OF_THE_HERETIC_MOBS,
  catacomb_of_the_branded: CATACOMB_OF_THE_BRANDED_MOBS,
  catacomb_of_the_apostate: CATACOMB_OF_THE_APOSTATE_MOBS,
  catacomb_of_the_witch: CATACOMB_OF_THE_WITCH_MOBS,
  catacomb_of_dark_omens: CATACOMB_OF_DARK_OMENS_MOBS,
  catacomb_of_the_forbidden_path: CATACOMB_OF_THE_FORBIDDEN_PATH_MOBS,
};

export function dungeonMobTypesForId(
  dungeonId: string
): readonly SevenSignsDungeonMobType[] {
  return SEVEN_SIGNS_DUNGEON_MOB_TYPES_BY_DUNGEON[dungeonId] ?? [];
}
