import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, '..', '..');
const textRpgRoot = process.env.TEXT_RPG_ROOT
  ? String(process.env.TEXT_RPG_ROOT)
  : path.join(repoRoot, '..', 'text-rpg');
const distGmShopPath = path.join(
  repoRoot,
  'dist',
  'server',
  'src',
  'data',
  'l2dopGmShopCatalog.generated.js'
);

const gradeShopFiles = [
  path.join(textRpgRoot, 'src', 'data', 'shop', 'dGradeShop.ts'),
  path.join(textRpgRoot, 'src', 'data', 'shop', 'cGradeShop.ts'),
  path.join(textRpgRoot, 'src', 'data', 'shop', 'bGradeShop.ts'),
  path.join(textRpgRoot, 'src', 'data', 'shop', 'aGradeShop.ts'),
  path.join(textRpgRoot, 'src', 'data', 'shop', 'sGradeShop.ts'),
];

function getLiteralValue(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  return undefined;
}

function extractObjectsFromArrayInitializer(sourceFile, varName) {
  let target;
  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!decl.name || decl.name.getText() !== varName) continue;
      if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) continue;
      target = decl.initializer;
    }
  }
  if (!target) return [];

  const out = [];
  for (const el of target.elements) {
    if (ts.isObjectLiteralExpression(el)) out.push(el);
  }
  return out;
}

function parseGradeShopFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const base = path.basename(filePath);
  const varName =
    base.startsWith('dGradeShop') ? 'D_GRADE_SHOP_ITEMS' :
    base.startsWith('cGradeShop') ? 'C_GRADE_SHOP_ITEMS' :
    base.startsWith('bGradeShop') ? 'B_GRADE_SHOP_ITEMS' :
    base.startsWith('aGradeShop') ? 'A_GRADE_SHOP_ITEMS' :
    base.startsWith('sGradeShop') ? 'S_GRADE_SHOP_ITEMS' :
    null;
  if (!varName) return [];

  const objects = extractObjectsFromArrayInitializer(sf, varName);
  const out = [];
  for (const obj of objects) {
    /** @type {Record<string, any>} */
    const m = {};
    for (const prop of obj.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = prop.name && ts.isIdentifier(prop.name) ? prop.name.text : prop.name?.getText();
      if (!key) continue;
      const v = getLiteralValue(prop.initializer);
      if (v === undefined) continue;
      m[key] = v;
    }

    const type = m.type;
    const grade = m.grade;
    const itemId = m.itemId;
    const name = m.name;
    const category = m.category;
    const icon = m.icon;
    if (!type || !grade || !itemId || !name) continue;
    if (!['weapon', 'armor', 'jewelry'].includes(type)) continue;
    if (!['NG', 'D', 'C', 'B', 'A', 'S'].includes(grade)) continue;
    if (!['d', 'c', 'b', 'a', 's', 'NG', 'D', 'C', 'B', 'A', 'S'].includes(grade)) continue;

    out.push({ itemId, grade, type, category, name, icon });
  }
  return out;
}

function normalizeGrade(g) {
  const s = String(g || '').trim().toUpperCase();
  return s === 'NG' ? 'NG' : (['D','C','B','A','S'].includes(s) ? s : s);
}

function main() {
  const textItems = [];
  for (const f of gradeShopFiles) {
    if (!fs.existsSync(f)) continue;
    textItems.push(...parseGradeShopFile(f));
  }

  // exclude NG because GM shop tabs are D/C/B/A/S
  const textEquip = textItems.filter((x) => normalizeGrade(x.grade) !== 'NG');

  const textById = new Map();
  for (const it of textEquip) {
    const prev = textById.get(it.itemId);
    // keep first (there can be duplicates in some shops)
    if (!prev) textById.set(it.itemId, it);
  }

  const gmUrl = pathToFileURL(distGmShopPath).href;
  return import(gmUrl).then((gm) => {
    const weapons = gm.L2DOP_GM_SHOP_WEAPONS || [];
    const armor = gm.L2DOP_GM_SHOP_ARMOR || [];
    const jewelry = gm.L2DOP_GM_SHOP_JEWELRY || [];

    const gmById = new Map();
    for (const w of weapons) gmById.set(w.itemId, { itemId: w.itemId, grade: w.grade, type: 'weapon', name: w.nameUk });
    for (const a of armor) gmById.set(a.itemId, { itemId: a.itemId, grade: a.grade, type: 'armor', name: a.nameUk });
    for (const j of jewelry) gmById.set(j.itemId, { itemId: j.itemId, grade: j.grade, type: 'jewelry', name: j.nameUk });

    const textIds = new Set(textById.keys());
    const gmIds = new Set(gmById.keys());

    const missing = [...textIds].filter((id) => !gmIds.has(id));
    const extra = [...gmIds].filter((id) => !textIds.has(id));

    const gradeMismatches = [];
    for (const id of textIds) {
      const t = textById.get(id);
      const g = gmById.get(id);
      if (!t || !g) continue;
      if (normalizeGrade(t.grade) !== normalizeGrade(g.grade)) {
        gradeMismatches.push({ itemId: id, textGrade: t.grade, gmGrade: g.grade, textName: t.name, gmName: g.name });
      }
    }

    missing.sort((a, b) => a - b);
    extra.sort((a, b) => a - b);
    gradeMismatches.sort((a, b) => a.itemId - b.itemId);

    const preview = (arr) => arr.slice(0, 30);

    console.log('=== audit: text-rpg (D/C/B/A) vs l2dop GM-shop ===');
    console.log('text equip count:', textEquip.length, 'unique ids:', textIds.size);
    console.log('gm equip count:', weapons.length + armor.length + jewelry.length, 'unique ids:', gmIds.size);
    console.log('missing in gm:', missing.length, 'preview:', preview(missing));
    console.log('extra in gm:', extra.length, 'preview:', preview(extra));
    console.log('grade mismatches:', gradeMismatches.length, 'preview:', preview(gradeMismatches));
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

