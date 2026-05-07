/**
 * Копіює іконки скілів у формат l2dop: `img/skills/<категорія>/skill{n}.jpg`.
 *
 * Джерело — папка з тими ж іменами, що й у text-rpg (`0056.jpg`, `skill0056.gif`,
 * `Skill0100.gif` тощо), наприклад скопійована з продакшену `public/skills` або з CDN.
 *
 * Приклад:
 *   npm run sync:skill-icons-text-rpg -- --from "C:/games/text-rpg-assets/skills"
 *
 * Вихід за замовчуванням: env L2DOP_SKILL_ICONS_DIR або `../l2dop/img/skills` від кореня репо.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..');
const repoRoot = path.join(serverRoot, '..');

function parseArgs() {
  const a = process.argv.slice(2);
  let from = null;
  let out = null;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--from' && a[i + 1]) {
      from = a[++i];
      continue;
    }
    if (a[i] === '--out' && a[i + 1]) {
      out = a[++i];
      continue;
    }
    if (a[i] === '--help' || a[i] === '-h') {
      return { help: true };
    }
  }
  return { from, out, help: false };
}

/** Дзеркало l2dopSkillIconSubdir з server/src/services/l2dopSkillIconPath.ts */
function l2dopSkillIconSubdir(skillId) {
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

/** Варіанти імен як у text-rpg (skillIconUrls + типові файли). */
function candidateRelPaths(skillId) {
  const sid = Math.floor(skillId);
  const pad4 = String(sid).padStart(4, '0');
  const raw = [
    `${pad4}.jpg`,
    `${sid}.jpg`,
    `skill${pad4}.gif`,
    `skill${sid}.gif`,
    `Skill${pad4}.gif`,
    `Skill${sid}.gif`,
    `skill${pad4}.jpg`,
    `Skill${pad4}.jpg`,
    `skill${pad4}.jpg`,
    `Skill${pad4}_0.jpg`,
    `skill${pad4}_0.jpg`,
    `Skill${sid}_0.jpg`,
  ];
  const out = [];
  for (const f of raw) {
    if (!out.includes(f)) out.push(f);
    const low = f.toLowerCase();
    if (!out.includes(low)) out.push(low);
  }
  return out;
}

function parseCatalogSkillIds() {
  const catalogPath = path.join(
    serverRoot,
    'src',
    'data',
    'humanFighterSkillCatalog.ts'
  );
  const text = fs.readFileSync(catalogPath, 'utf8');
  const ids = [];
  const re = /l2SkillId:\s*(\d+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    ids.push(parseInt(m[1], 10));
  }
  return [...new Set(ids)].sort((a, b) => a - b);
}

function findSourceFile(fromDir, skillId) {
  const names = candidateRelPaths(skillId);
  for (const rel of names) {
    const p = path.join(fromDir, rel);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function defaultOutDir() {
  const env = process.env.L2DOP_SKILL_ICONS_DIR?.trim();
  if (env) return env;
  return path.join(repoRoot, '..', 'l2dop', 'img', 'skills');
}

/**
 * JPG без 4:2:0 (4:4:4), щоб при перезбереженні менше «мило» краї.
 * GIF/PNG → jpeg; готовий .jpg копіюємо байт-у-байт.
 */
async function writeAsL2dopJpg(srcPath, destPath) {
  const ext = path.extname(srcPath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    await fs.promises.copyFile(srcPath, destPath);
    return 'copy';
  }
  await sharp(srcPath)
    .jpeg({
      quality: 94,
      mozjpeg: false,
      chromaSubsampling: '4:4:4',
    })
    .toFile(destPath);
  return 'convert';
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    console.log(`Використання:
  npm run sync:skill-icons-text-rpg -- --from <папка_з_іконками_text-rpg> [--out <l2dop/img/skills>]

Типові імена у джерелі: 0056.jpg, skill0056.gif, Skill0100.gif …
Вихід: skill{id}.jpg у підкаталозі passive/buffs/… як у PHP l2dop.
За замовчуванням --out = L2DOP_SKILL_ICONS_DIR або ..\\l2dop\\img\\skills
`);
    process.exit(0);
  }
  if (!args.from) {
    console.error('Потрібно: --from <папка>. Переглянь --help.');
    process.exit(1);
  }

  const fromDir = path.resolve(args.from);
  const outRoot = path.resolve(args.out || defaultOutDir());

  if (!fs.existsSync(fromDir)) {
    console.error('Немає папки --from:', fromDir);
    process.exit(1);
  }

  const ids = parseCatalogSkillIds();
  console.log('skillId з humanFighterSkillCatalog:', ids.join(', '));
  console.log('Джерело:', fromDir);
  console.log('Запис у:', outRoot);

  let ok = 0;
  let miss = 0;

  for (const id of ids) {
    const src = findSourceFile(fromDir, id);
    const sub = l2dopSkillIconSubdir(id);
    const dir = path.join(outRoot, sub);
    const dest = path.join(dir, `skill${id}.jpg`);

    if (!src) {
      console.warn('✗', id, '— немає файлу в', fromDir, '(шукав', candidateRelPaths(id).slice(0, 6).join(', '), '…)');
      miss++;
      continue;
    }

    fs.mkdirSync(dir, { recursive: true });
    const how = await writeAsL2dopJpg(src, dest);
    console.log('+', id, '←', path.basename(src), '→', path.relative(outRoot, dest), '(' + how + ')');
    ok++;
  }

  console.log('Готово:', ok, 'ок, пропущено (нема джерела):', miss);
  if (miss) {
    console.log(
      'Поклади в --from файли з text-rpg (той самий номер скіла, що L2 id у каталозі).'
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
