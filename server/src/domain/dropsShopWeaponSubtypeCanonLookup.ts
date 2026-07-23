/**
 * Фільтр типу зброї в магазині дропів: відповідність канонічних назв (L2) підкатегорії.
 * Підписи з каталогу / патчів нормалізуються (Weapon … I00, «S» замість «'s» тощо).
 */
import type { DropsShopWeaponSubtype } from './dropsShopWeaponSubtype.js';

/** Ключ пошуку: літери/цифри без роздільників, нижній регістр. */
export function slugifyDropsWeaponLabel(raw: string): string {
  let s = String(raw || '').trim();
  const em = s.search(/\s[—–-]\s/);
  if (em !== -1) s = s.slice(0, em).trim();
  s = s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2018\u2019\u201B\u2032`]/g, '');
  s = s.replace(/^weapon\s+/i, '').replace(/\s+I00\b.*$/i, '').trim();
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

const ROWS: ReadonlyArray<readonly [string, DropsShopWeaponSubtype]> = [
  // —— Мечі ——
  ['Short Sword', 'sword'],
  ['Small Sword', 'sword'],
  ['Handmade Sword', 'sword'],
  ['Gladius', 'sword'],
  ['Broad Sword', 'sword'],
  ['Broadsword', 'sword'],
  ['Falchion', 'sword'],
  ['Long Sword', 'sword'],
  ['Orcish Sword', 'sword'],
  ['Sickle', 'blunt'],
  ['Sword of Watershadow', 'sword'],
  ["Knight's Sword", 'sword'],
  ['Two-Handed Sword', 'sword'],
  ['Berserker Blade', 'sword'],
  ['Ecliptic Sword', 'sword'],
  ["Pa'agrio Sword", 'sword'],
  ['Samurai Longsword', 'sword'],
  ['Guardian Sword', 'sword'],
  ['Sword of Damascus', 'sword'],
  ['Great Sword', 'sword'],
  ["Dark Legion's Edge", 'sword'],
  ['Tallum Blade', 'sword'],
  ['Sword of Ipos', 'sword'],
  ["Sirra's Blade", 'sword'],
  ['Dragon Slayer', 'sword'],
  ["God's Blade", 'sword'],
  ["Heaven's Divider", 'sword'],
  // —— Кинжали ——
  ['Knife', 'dagger'],
  ['Bone Dagger', 'dagger'],
  ['Dirk', 'dagger'],
  ['Doomed Dagger', 'dagger'],
  ['Doom Dagger', 'dagger'],
  ['Shining Knife', 'dagger'],
  ['Sword Breaker', 'dagger'],
  ['Throw Knife', 'dagger'],
  ['Throwing Knife', 'dagger'],
  ["Viper's Canine", 'fist'],
  ["Viper's Fang", 'fist'],
  ['Shilen Knife', 'dagger'],
  ['Crystal Dagger', 'dagger'],
  ['Dark Screamer', 'dagger'],
  ['Scorpion', 'dagger'],
  ['Hell Knife', 'dagger'],
  ['Kris', 'dagger'],
  ['Bloody Orchid', 'dagger'],
  ['Naga Storm', 'dagger'],
  ['Soul Separator', 'dagger'],
  ['Angel Slayer', 'dagger'],
  // —— Луки ——
  ['Short Bow', 'bow'],
  ['Bow', 'bow'],
  ['Hunting Bow', 'bow'],
  ['Composition Bow', 'bow'],
  ['Dark Elven Bow', 'bow'],
  ['Akat Long Bow', 'bow'],
  ['Eminence Bow', 'bow'],
  ['Bow of Peril', 'bow'],
  ['Dark Elven Long Bow', 'bow'],
  ['Carnage Bow', 'bow'],
  ["Shyeed's Bow", 'bow'],
  ['Soul Bow', 'bow'],
  ['Draconic Bow', 'bow'],
  ['Shining Bow', 'bow'],
  // —— Булави / сокири ——
  ['Club', 'blunt'],
  ['Mace', 'blunt'],
  ['Buzdygan', 'blunt'],
  ['Iron Hammer', 'blunt'],
  ['Heavy Chisel', 'blunt'],
  ['Dwarven Mace', 'blunt'],
  ['War Hammer', 'pole'],
  ['Atuba Hammer', 'blunt'],
  ['Tomahawk', 'blunt'],
  ['Battle Axe', 'blunt'],
  ['Big Hammer', 'blunt'],
  ['Dwarven Hammer', 'blunt'],
  ['Heavy Doom Axe', 'blunt'],
  ['Heavy Doom Hammer', 'blunt'],
  ['War Axe', 'blunt'],
  ['Yaksa Mace', 'blunt'],
  ["Buffalo's Horn", 'blunt'],
  ['Buffalo Horn', 'blunt'],
  ['Art of Battle Axe', 'blunt'],
  ["Deadman's Glory", 'blunt'],
  ['Great Axe', 'blunt'],
  ['Ice Storm Hammer', 'blunt'],
  ['Star Buster', 'blunt'],
  ["Barakiel's Axe", 'blunt'],
  ['Elysian', 'blunt'],
  ['Infernal Master', 'blunt'],
  ['Meteor Shower', 'blunt'],
  ["Sobekk's Hurricane", 'fist'],
  ['Basalt Battlehammer', 'blunt'],
  ['Dragon Hunter Axe', 'blunt'],
  // —— Списи ——
  ['Short Spear', 'pole'],
  ['Long Spear', 'pole'],
  ['Orcish Poleaxe', 'pole'],
  ['Widow Maker', 'pole'],
  ['Lance', 'pole'],
  ['Halberd', 'pole'],
  ['Tallum Glaive', 'pole'],
  ["Tiphon's Spear", 'pole'],
  ['Saint Spear', 'pole'],
  // —— Кастети ——
  ["Fox's Nail", 'fist'],
  ['Fox Claw Gloves', 'fist'],
  ['Iron Glove', 'fist'],
  ['Iron Gloves', 'fist'],
  ['Spike Glove', 'fist'],
  ['Spiked Gloves', 'fist'],
  ['Triple-Edged Jamadhr', 'fist'],
  ['Knuckle Duster', 'fist'],
  ['Fisted Blade', 'fist'],
  ['Great Pata', 'fist'],
  ['Arthro Nail', 'fist'],
  ['Bellion Cestus', 'fist'],
  /** У магазині дропів — як кастети (іконка/підрозділ автора). */
  ['Blood Tornado', 'fist'],
  ['Dragon Grinder', 'fist'],
  ['Demon Splinter', 'fist'],
  // —— Магія ——
  ["Apprentice's Spellbook", 'magic'],
  ["Apprentice's Rod", 'magic'],
  ["Apprentice's Wand", 'magic'],
  ["Apprentice's Staff", 'magic'],
  ["Journeyman's Staff", 'magic'],
  ['Cedar Staff', 'magic'],
  ['Willow Staff', 'magic'],
  ['Crucifix of Blessing', 'magic'],
  ['Tears of Eva', 'magic'],
  ['Voodoo Doll', 'magic'],
  ['Tome of Blood', 'magic'],
  ["Demon's Staff", 'magic'],
  ["Heathen's Book", 'magic'],
  ["Homunkulus's Sword", 'magic'],
  ["Kaim Vanul's Bones", 'magic'],
  ['Spell Breaker', 'magic'],
  ["Spirit's Staff", 'magic'],
  ['Staff of Evil Spirits', 'magic'],
  ['Sword of Valhalla', 'magic'],
  ["Wizard's Tear", 'magic'],
  ["Behemoth's Tuning Fork", 'magic'],
  ['Branch of the Mother Tree', 'magic'],
  ['Daimon Crystal', 'magic'],
  ["Dasparion's Staff", 'magic'],
  ['Spiritual Eye', 'magic'],
  ['Sword of Miracles', 'magic'],
  ["Themis' Tongue", 'magic'],
  ['Arcana Mace', 'magic'],
  ['Imperial Staff', 'magic'],
  // —— Дуалі ——
  ["Baguette's Dualsword", 'dual'],
  // —— Варіанти підписів у dropsShopCatalog / патчах (без апострофа, «S») ——
  ['Apprentices Spellbook', 'magic'],
  ['Apprentices Rod', 'magic'],
  ['Apprentices Wand', 'magic'],
  ['Apprentices Staff', 'magic'],
  ['Demon S Staff', 'magic'],
  ['Heathens Book', 'magic'],
  ['Homunkulus S Sword', 'magic'],
  ['Kaim Vanul S Bones', 'magic'],
  ['Wizard S Tear', 'magic'],
  ['Behemoth S Tuning Fork', 'magic'],
  ['Dasparion S Staff', 'magic'],
  ['Spirit S Staff', 'magic'],
  ['Two Handed Sword', 'sword'],
  ['God S Blade', 'sword'],
  ['Heaven S Divider', 'sword'],
  ['Dark Legion S Edge', 'sword'],
  ['Sirra S Blade', 'sword'],
  ['Shyeed S Bow', 'bow'],
  ['Barakiel S Axe', 'blunt'],
  ['Sobekk S Hurricane', 'fist'],
  ['Tiphon S Spear', 'pole'],
  /** У каталозі дропів помилково «Agrian» замість Pa'agrio. */
  ['Pa Agrian Sword', 'sword'],
  ['Baguette S Dualsword', 'dual'],
];

let lookupMap: ReadonlyMap<string, DropsShopWeaponSubtype> | undefined;

function buildMap(): ReadonlyMap<string, DropsShopWeaponSubtype> {
  const m = new Map<string, DropsShopWeaponSubtype>();
  for (const [label, st] of ROWS) {
    const slug = slugifyDropsWeaponLabel(label);
    const prev = m.get(slug);
    if (prev != null && prev !== st) {
      throw new Error(
        `dropsShopWeaponSubtypeCanonLookup: slug "${slug}" maps to both ${prev} and ${st}`,
      );
    }
    m.set(slug, st);
  }
  return m;
}

export function lookupCanonWeaponSubtypeFromDisplayLabel(
  displayLabel: string,
): DropsShopWeaponSubtype | undefined {
  if (!lookupMap) lookupMap = buildMap();
  const slug = slugifyDropsWeaponLabel(displayLabel);
  return lookupMap.get(slug);
}
