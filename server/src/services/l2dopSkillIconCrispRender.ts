import sharp from 'sharp';

/** Логічний масштаб у UI (×1: 32→32 CSS px — компактні іконки, без збільшення растру). */
export const L2_SKILL_ICON_UI_SCALE = 1;

/**
 * PNG з nearest-neighbour: `оригінал × UI_SCALE × dpr` — щоб у фізичних px не було інтерполяції браузера.
 */
export async function renderL2dopSkillIconCrispPng(
  filePath: string,
  dpr: number
): Promise<Buffer> {
  const safeDpr = Math.min(3, Math.max(1, dpr));
  const meta = await sharp(filePath).metadata();
  const sw = meta.width ?? 1;
  const sh = meta.height ?? 1;
  const tw = Math.max(1, Math.round(sw * L2_SKILL_ICON_UI_SCALE * safeDpr));
  const th = Math.max(1, Math.round(sh * L2_SKILL_ICON_UI_SCALE * safeDpr));
  return sharp(filePath)
    .resize(tw, th, { kernel: sharp.kernel.nearest, fit: 'fill' })
    .png({ compressionLevel: 6, effort: 4 })
    .toBuffer();
}
