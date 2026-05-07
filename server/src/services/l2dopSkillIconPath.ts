import fs from 'node:fs';
import path from 'node:path';

/**
 * Лише l2dop: `img/skills/<категорія>/skill{n}.jpg` (sortSkills.js) або легасі `img/buffs/skill{n}_0.jpg`.
 * ENV: L2DOP_SKILL_ICONS_DIR, L2DOP_BUFF_ICONS_DIR.
 */
const SKILL_SUBDIRS = [
  'passive',
  'buffs',
  'active',
  'physical',
  'magic',
  'debuffs',
  'special',
  'unknown',
] as const;

/** Дзеркало detectCategory() з l2dop/img/skills/sortSkills.js */
export function l2dopSkillIconSubdir(skillId: number): (typeof SKILL_SUBDIRS)[number] {
  const id = Math.floor(skillId);
  if (id >= 1 && id <= 50) return 'passive';
  if (id >= 51 && id <= 150) return 'buffs';
  if (id >= 151 && id <= 300) return 'active';
  if (id >= 301 && id <= 450) return 'physical';
  if (id >= 451 && id <= 650) return 'magic';
  if (id >= 651 && id <= 800) return 'debuffs';
  if (id >= 801 && id <= 1000) return 'special';
  return 'unknown';
}

function collectSkillsBaseDirs(): string[] {
  const cwd = process.cwd();
  const out: string[] = [];
  const env = process.env.L2DOP_SKILL_ICONS_DIR?.trim();
  if (env) out.push(env);
  out.push(
    path.join(cwd, '..', 'l2dop', 'img', 'skills'),
    path.join(cwd, '..', '..', 'l2dop', 'img', 'skills'),
    path.join(cwd, 'l2dop', 'img', 'skills')
  );
  return out;
}

function collectLegacyBuffsDirs(): string[] {
  const cwd = process.cwd();
  const out: string[] = [];
  const env = process.env.L2DOP_BUFF_ICONS_DIR?.trim();
  if (env) out.push(env);
  out.push(
    path.join(cwd, '..', 'l2dop', 'img', 'buffs'),
    path.join(cwd, '..', '..', 'l2dop', 'img', 'buffs'),
    path.join(cwd, 'l2dop', 'img', 'buffs')
  );
  return out;
}

/**
 * Шлях до JPG іконки скіла (L2 id) у l2dop.
 */
export function resolveL2dopSkillIconJpgPath(skillId: number): string | null {
  if (!Number.isFinite(skillId) || skillId < 1 || skillId > 9_999_999) {
    return null;
  }
  const id = Math.floor(skillId);
  const modern = `skill${id}.jpg`;
  const legacy = `skill${id}_0.jpg`;

  const preferred = l2dopSkillIconSubdir(id);
  const subdirOrder = [preferred, ...SKILL_SUBDIRS.filter((s) => s !== preferred)];

  for (const base of collectSkillsBaseDirs()) {
    if (!fs.existsSync(base)) continue;
    for (const sub of subdirOrder) {
      const p = path.join(base, sub, modern);
      if (fs.existsSync(p)) return p;
    }
    const root = path.join(base, modern);
    if (fs.existsSync(root)) return root;
  }

  for (const buffDir of collectLegacyBuffsDirs()) {
    if (!fs.existsSync(buffDir)) continue;
    const p = path.join(buffDir, legacy);
    if (fs.existsSync(p)) return p;
  }

  return null;
}
