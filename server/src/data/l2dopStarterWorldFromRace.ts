/**
 * Стартові координати світу як у l2dop `new_hero.php` (рядки 33–41): `x`,`y` в INSERT `users`.
 * `cityId` — найближча точка з `MAP_TOWNS` (околиці для пулів мобів / UI).
 */
import { nearestMapTown } from './mapLocalities.js';

export function starterWorldForNewCharacter(
  race: string,
  classBranch: string
): { worldX: number; worldY: number; cityId: string } {
  const mystic = String(classBranch || '').trim().toLowerCase() === 'mystic';
  const r = String(race || '').trim();
  let x: number;
  let y: number;

  if (r === 'Human') {
    if (mystic) {
      x = -90861;
      y = 249074;
    } else {
      x = -70597;
      y = 257490;
    }
  } else if (r === 'Elf') {
    x = 46026;
    y = 42480;
  } else if (r === 'Dark Elf') {
    x = 27350;
    y = 11622;
  } else if (r === 'Orc') {
    x = -57285;
    y = -113817;
  } else if (r === 'Dwarf') {
    x = 107615;
    y = -175936;
  } else {
    x = -70597;
    y = 257490;
  }

  const near = nearestMapTown(x, y);
  return { worldX: x, worldY: y, cityId: near.cityId };
}
