/**
 * Перетворення світ ↔ пікселі на JPG карти — як у l2dop/map.php + mapcreate.php.
 */

/** Піксель (mx, my) на повній картинці карти. */
export function worldToMapPixel(x: number, y: number): { mx: number; my: number } {
  const dx = (x + 130000) / 3600;
  const dy = (y + 0) / 5250;
  const mx = Math.floor(18.12 * dx);
  const my = Math.floor(26.2 * dy + 1300);
  return { mx, my };
}

/** Зворотне до worldToMapPixel (рядки 1253–1261 map.php). */
export function mapPixelToWorld(mx: number, my: number): { x: number; y: number } {
  const px = mx / 18.12;
  const py = (my - 1300) / 26.2;
  const x = Math.floor(px * 3600 - 130000);
  const y = Math.floor(py * 5250);
  return { x, y };
}

/** Кут курсора як у map.php (atan2). */
export function mapAngleDeg(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): number {
  const ax = fromX - toX;
  const ay = fromY - toY;
  let ang = Math.floor((Math.atan2(ax, ay) * 180) / Math.PI + 90);
  if (ang <= 0) ang += 360;
  return ang;
}
