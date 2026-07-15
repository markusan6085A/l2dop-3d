import fs from 'node:fs';
import path from 'node:path';

/** Те саме розв’язання кореня, що в app.ts (`server/public` vs `public`). */
function resolvePublicRoot(): string {
  const cwd = process.cwd();
  const fromRoot = path.join(cwd, 'server', 'public');
  const fromServer = path.join(cwd, 'public');
  if (fs.existsSync(path.join(fromRoot, 'map.html'))) return fromRoot;
  if (fs.existsSync(path.join(fromServer, 'map.html'))) return fromServer;
  return fromRoot;
}

const EXT_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function mimeTypeForPublicSkillIcon(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return EXT_MIME[ext] ?? 'application/octet-stream';
}

/**
 * Локальні іконки з `public/skills/` (наприклад скопійовані з text-rpg): skill5.gif, skill0056.jpg …
 * Пріоритет над деревом l2dop у `/game/skill-icon/:id`.
 */
export function resolvePublicSkillIconPath(skillId: number): string | null {
  if (!Number.isFinite(skillId) || skillId < 1) return null;
  const id = Math.floor(skillId);
  const base = path.join(resolvePublicRoot(), 'skills');
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return null;

  const pad4 = String(id).padStart(4, '0');
  /** l2_1 Triple Slash (Gladiator): канонічний арт `0001.jpg`; `attack.jpg` — лише для кнопки «Удар» у hotbar. */
  const candidates =
    id === 1
      ? [
          `${pad4}.jpg`,
          `${pad4}.jpeg`,
          `${pad4}.png`,
          'attack.jpg',
          'Attack.jpg',
          'attack.jpeg',
          'attack.png',
        ]
      : [];
  candidates.push(
    /* text-rpg часто кладе «0005.jpg» без префікса skill */
    `${pad4}.jpg`,
    `${pad4}.jpeg`,
    `${pad4}.gif`,
    `${pad4}.png`,
    `${id}.jpg`,
    `${id}.gif`,
    `${id}.png`,
    `skill${id}.gif`,
    `skill${id}.jpg`,
    `skill${id}.jpeg`,
    `skill${id}.png`,
    `skill${id}.webp`,
    `Skill${id}.gif`,
    `Skill${id}.jpg`,
    `Skill${id}.png`,
    `skill${pad4}.gif`,
    `skill${pad4}.jpg`,
    `skill${pad4}.jpeg`,
    `skill${pad4}.png`,
    `Skill${pad4}.gif`,
    `Skill${pad4}.jpg`,
    `Skill${pad4}_0.jpg`,
    `skill${pad4}_0.jpg`,
  );

  for (const name of candidates) {
    const p = path.join(base, name);
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/** Відносний URL для статики `public/skills/` (надійніше за dynamic `/game/skill-icon/` у магістрі). */
export function resolvePublicSkillIconWebPath(skillId: number): string | null {
  const filePath = resolvePublicSkillIconPath(skillId);
  if (!filePath) return null;
  const base = path.join(resolvePublicRoot(), 'skills');
  const rel = path.relative(base, filePath).replace(/\\/g, '/');
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return '/skills/' + rel;
}
