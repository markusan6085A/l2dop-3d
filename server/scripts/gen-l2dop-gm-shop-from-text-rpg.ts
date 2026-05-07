/**
 * Читає text-rpg: grade-магазини + itemsDB → генерує
 * server/src/data/l2dopGmShopCatalog.generated.ts для l2dop-3d (ITEM_CATALOG).
 *
 * За замовчуванням у каталог потрапляють лише предмети, які вже є в l2dop-3d як
 * позиції дроп-магазину: `dropsShopCatalog.generated.ts` (ключ `shopKey` =
 * каталог під `/icons/drops/…`) або явний `itemId` у `dropsShopOverrides.json`.
 *
 * Увесь текст-рог магазин без фільтра: GM_SHOP_ALL_FROM_TEXT_RPG=1
 *
 * Запуск з кореня репо: npx tsx server/scripts/gen-l2dop-gm-shop-from-text-rpg.ts
 * Якщо text-rpg лежить не в sibling-папці: TEXT_RPG_ROOT=/abs/path
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEXT_RPG_ROOT = process.env.TEXT_RPG_ROOT
  ? path.resolve(process.env.TEXT_RPG_ROOT)
  : path.resolve(REPO_ROOT, '..', 'text-rpg');

const OUT = path.resolve(REPO_ROOT, 'server/src/data/l2dopGmShopCatalog.generated.ts');

type GmGrade = 'NG' | 'D' | 'C' | 'B' | 'A' | 'S';
type WeaponKind =
  | 'sword'
  | 'blunt'
  | 'dagger'
  | 'bow'
  | 'bigsword'
  | 'bigblunt'
  | 'dual'
  | 'pole'
  | 'fist';

const WEAPON_BY_XML: Partial<Record<string, WeaponKind>> = {
  SWORD: 'sword',
  BLUNT: 'blunt',
  BIGBLUNT: 'bigblunt',
  DAGGER: 'dagger',
  BOW: 'bow',
  BIGSWORD: 'bigsword',
  DUALSWORD: 'dual',
  DUALDAGGER: 'dual',
  POLE: 'pole',
  DUALFIST: 'fist',
  FIST: 'fist',
  RAPIER: 'sword',
  ANCIENTSWORD: 'bigsword',
  CROSSBOW: 'bow',
};

function normalizeGrade(g: string): GmGrade {
  const u = String(g).trim().toUpperCase();
  if (u === 'NG') return 'NG';
  if (u === 'D' || u === 'C' || u === 'B' || u === 'A' || u === 'S') return u;
  return 'D';
}

function gmWeaponType(xml: string | undefined, shopId: string): WeaponKind {
  const key = String(xml || '')
    .trim()
    .toUpperCase();
  if (WEAPON_BY_XML[key]) return WEAPON_BY_XML[key]!;
  console.warn('[gen gm shop] weaponType fallback → sword', shopId, xml);
  return 'sword';
}

function gradeOrder(g: GmGrade): number {
  const o: Record<GmGrade, number> = {
    NG: -1,
    D: 0,
    C: 1,
    B: 2,
    A: 3,
    S: 4,
  };
  return o[g] ?? 99;
}

function pickNameUk(shop: { name: string; description?: string }): string {
  const d = String(shop.description || '').trim();
  if (/[А-Яа-яІіЇїЄєґҐ]/.test(d)) {
    const line = d.split(/\n+/)[0]!.replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (line) return line;
  }
  return shop.name;
}

function armorSlotFromShop(
  bodypart: string | undefined,
  category: string,
): 'head' | 'chest' | 'legs' | 'gloves' | 'feet' | 'fullarmor' | 'lhand' {
  const bp = String(bodypart || '').toLowerCase();
  const cat = String(category || '').toLowerCase();
  if (cat === 'shield' || bp === 'lhand') return 'lhand';
  if (bp === 'head') return 'head';
  if (bp === 'chest') return 'chest';
  if (bp === 'legs' || bp === 'gaiters') return 'legs';
  if (bp === 'gloves') return 'gloves';
  if (bp === 'feet' || bp === 'boots') return 'feet';
  console.warn('[gen gm shop] unknown bodypart → chest:', bodypart, category);
  return 'chest';
}

function gmArmorType(armor?: string): string {
  if (!armor || armor === 'none' || armor === 'pet') return 'heavy';
  if (armor === 'robe' || armor === 'magic') return 'magic';
  return armor === 'heavy' ? 'heavy' : 'light';
}

function jewelryKind(cat: string): 'ring' | 'neck' | 'earring' {
  const c = String(cat || '').toLowerCase();
  if (c.includes('neck')) return 'neck';
  // У іконках/ id часто «earing» (без подвійного r) — у ньому є підрядок «ring»;
  // тому спочатку сережки, потім кільця.
  if (c.includes('earring') || c.includes('earing')) return 'earring';
  if (c.includes('ring')) return 'ring';
  if (c.includes('ear')) return 'earring';
  console.warn('[gen gm shop] jewelry category fallback → ring:', cat);
  return 'ring';
}

type ItemDefLite = {
  stats?: Record<string, number | undefined>;
  armorType?: string;
};

type ShopItemLite = {
  id: string;
  itemId: number;
  grade: string;
  type: string;
  bodypart?: string;
  category: string;
  price: number;
  weaponType?: string;
  name: string;
  description?: string;
  /** Як у text-rpeg: `/items/drops/arrom_d/file.jpg` — зіставляється з `shopKey` у дроп-каталозі. */
  icon?: string;
};

/** `folder/file.ext` нижнім регістром — як ключ до DROPS_SHOP_CATALOG.shopKey */
function shopKeyLowerFromAnyDropsIcon(icon: string | undefined): string | null {
  const s = String(icon || '').replace(/\\/g, '/').trim();
  if (!s) return null;
  const m = s.match(/\/drops\/(.+)/i);
  if (!m) return null;
  return m[1]!.replace(/^\/+/, '').toLowerCase();
}

function loadDropsOverrideItemIds(repoRoot: string): Set<number> {
  const p = path.join(repoRoot, 'server/src/data/dropsShopOverrides.json');
  const out = new Set<number>();
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== 'object') return out;
    for (const v of Object.values(j as Record<string, unknown>)) {
      if (!v || typeof v !== 'object') continue;
      const id = Number((v as Record<string, unknown>).itemId);
      if (Number.isFinite(id) && id > 0) out.add(Math.floor(id));
    }
  } catch {
    /* файл відсутній або порожній */
  }
  return out;
}

async function main() {
  const itemsDbPath = path.join(TEXT_RPG_ROOT, 'src/data/items/itemsDB.ts');
  if (!fs.existsSync(itemsDbPath)) {
    console.error(
      'Не знайдено text-rpg:',
      TEXT_RPG_ROOT,
      '(ожидається src/data/items/itemsDB.ts). Задай TEXT_RPG_ROOT.',
    );
    process.exit(1);
  }

  const { itemsDB } = await import(
    pathToFileURL(path.join(TEXT_RPG_ROOT, 'src/data/items/itemsDB.ts')).href
  );
  const { NG_GRADE_SHOP_ITEMS } = await import(
    pathToFileURL(path.join(TEXT_RPG_ROOT, 'src/data/shop/ngGradeShop.ts')).href
  );
  const { D_GRADE_SHOP_ITEMS } = await import(
    pathToFileURL(path.join(TEXT_RPG_ROOT, 'src/data/shop/dGradeShop.ts')).href
  );
  const { C_GRADE_SHOP_ITEMS } = await import(
    pathToFileURL(path.join(TEXT_RPG_ROOT, 'src/data/shop/cGradeShop.ts')).href
  );
  const { B_GRADE_SHOP_ITEMS } = await import(
    pathToFileURL(path.join(TEXT_RPG_ROOT, 'src/data/shop/bGradeShop.ts')).href
  );
  const { A_GRADE_SHOP_ITEMS } = await import(
    pathToFileURL(path.join(TEXT_RPG_ROOT, 'src/data/shop/aGradeShop.ts')).href
  );
  const { S_GRADE_SHOP_ITEMS } = await import(
    pathToFileURL(path.join(TEXT_RPG_ROOT, 'src/data/shop/sGradeShop.ts')).href
  );

  const allowAllFromTextRpg =
    process.env.GM_SHOP_ALL_FROM_TEXT_RPG === '1' ||
    String(process.env.GM_SHOP_ALL_FROM_TEXT_RPG || '').toLowerCase() === 'true';

  const { DROPS_SHOP_CATALOG } = await import(
    pathToFileURL(path.join(REPO_ROOT, 'server/src/data/dropsShopCatalog.generated.ts'))
      .href,
  );

  /** shopKey нижнім регістром → офіційний shopKey та iconUrl магазину дропів */
  const dropsShopKeysLower = new Set<string>();
  const dropsCatalogByShopKeyLower = new Map<
    string,
    { shopKey: string; iconUrl: string }
  >();
  for (const row of DROPS_SHOP_CATALOG) {
    const k = row.shopKey.toLowerCase();
    dropsShopKeysLower.add(k);
    if (!dropsCatalogByShopKeyLower.has(k)) {
      dropsCatalogByShopKeyLower.set(k, {
        shopKey: row.shopKey,
        iconUrl: row.iconUrl,
      });
    }
  }

  const overrideItemIds = loadDropsOverrideItemIds(REPO_ROOT);

  const allRaw: ShopItemLite[] = [
    ...NG_GRADE_SHOP_ITEMS,
    ...D_GRADE_SHOP_ITEMS,
    ...C_GRADE_SHOP_ITEMS,
    ...B_GRADE_SHOP_ITEMS,
    ...A_GRADE_SHOP_ITEMS,
    ...S_GRADE_SHOP_ITEMS,
  ] as ShopItemLite[];

  const shopEquip = allRaw.filter(
    (s) => s.type === 'weapon' || s.type === 'armor' || s.type === 'jewelry',
  );

  /** Один рядок на itemId (перший у порядку проходу масивів). */
  const byItemId = new Map<number, ShopItemLite>();
  for (const shop of shopEquip) {
    const id = Number(shop.itemId);
    if (!Number.isFinite(id) || id <= 0) {
      console.warn('пропуск: некоректний itemId', shop.id);
      continue;
    }
    if (byItemId.has(id)) continue;
    byItemId.set(id, shop);
  }

  const weapons: Record<string, unknown>[] = [];
  const armor: Record<string, unknown>[] = [];
  const jewelryRows: Record<string, unknown>[] = [];

  for (const shop of byItemId.values()) {
    const itemIdNum = Number(shop.itemId);
    const def = itemsDB[shop.id] as ItemDefLite | undefined;
    if (!def) {
      console.warn('[нема itemsDB запису]', shop.id, 'itemId', itemIdNum);
      continue;
    }

    const st = def.stats || {};
    const nameUk = pickNameUk(shop);
    const grade = normalizeGrade(shop.grade);
    const priceAdena = Math.max(0, Math.floor(Number(shop.price ?? 0)));

    if (!def.stats || Object.keys(def.stats).length === 0) {
      if (shop.type === 'jewelry') {
        // рідко: біжутерія без чисел після патчера
        console.warn('[itemsDB без stats — пропуск]', shop.id);
      }
      continue;
    }

    const dropsKeyLower = shopKeyLowerFromAnyDropsIcon(shop.icon);
    const inDropsIcons =
      dropsKeyLower != null && dropsShopKeysLower.has(dropsKeyLower);
    const inOverrideIds = overrideItemIds.has(itemIdNum);
    if (
      !allowAllFromTextRpg &&
      !inDropsIcons &&
      !inOverrideIds
    ) {
      continue;
    }
    const gmIconFromDropsCatalog =
      inDropsIcons && dropsKeyLower != null
        ? dropsCatalogByShopKeyLower.get(dropsKeyLower)?.iconUrl
        : undefined;

    if (shop.type === 'weapon') {
      const pAtk = Number(st.pAtk);
      const mAtk = Number(st.mAtk);
      const atkSpd = Number(st.pAtkSpd);
      const rCrit = Number(st.rCrit ?? 0);
      if (!Number.isFinite(pAtk) || !Number.isFinite(mAtk) || !Number.isFinite(atkSpd)) {
        console.warn('[зброя без pAtk/mAtk/pAtkSpd — пропуск]', shop.id);
        continue;
      }
      const weaponType = gmWeaponType(
        shop.weaponType ?? shop.category,
        shop.id,
      );
      weapons.push({
        itemId: itemIdNum,
        grade,
        priceAdena,
        nameUk,
        weaponType,
        pAtk,
        mAtk,
        rCrit: Number.isFinite(rCrit) ? rCrit : 0,
        weight: 0,
        crystals: 0,
        atkSpd,
        ...(gmIconFromDropsCatalog ? { iconUrl: gmIconFromDropsCatalog } : {}),
      });
      continue;
    }

    if (shop.type === 'armor') {
      const slot = armorSlotFromShop(shop.bodypart, shop.category);
      let pDef = Number(st.pDef);
      if (!Number.isFinite(pDef)) pDef = Number(st.sDef);
      if (!Number.isFinite(pDef)) {
        console.warn('[броня/щит без pDef — пропуск]', shop.id);
        continue;
      }
      armor.push({
        itemId: itemIdNum,
        grade,
        priceAdena,
        nameUk,
        armorSlot: slot,
        pDef,
        weight: 0,
        armorType: gmArmorType(def.armorType),
        ...(gmIconFromDropsCatalog ? { iconUrl: gmIconFromDropsCatalog } : {}),
      });
      continue;
    }

    if (shop.type === 'jewelry') {
      const md = Number(st.mDef);
      const mAtkVal = Number.isFinite(md) ? md : 0;
      const pDefJewel = Number(st.pDef ?? 0);
      if (!Number.isFinite(mAtkVal) || mAtkVal < 0) {
        console.warn('[біжутерія без mDef у stats — пропуск]', shop.id);
        continue;
      }
      jewelryRows.push({
        itemId: itemIdNum,
        grade,
        priceAdena,
        nameUk,
        jewelryKind: jewelryKind(shop.category || shop.bodypart || ''),
        mAtk: mAtkVal,
        pDef: Number.isFinite(pDefJewel) ? pDefJewel : 0,
        weight: 0,
        ...(gmIconFromDropsCatalog ? { iconUrl: gmIconFromDropsCatalog } : {}),
      });
    }
  }

  weapons.sort(
    (a, b) =>
      gradeOrder(a.grade as GmGrade) - gradeOrder(b.grade as GmGrade) ||
      (a.itemId as number) - (b.itemId as number),
  );
  armor.sort(
    (a, b) =>
      gradeOrder(a.grade as GmGrade) - gradeOrder(b.grade as GmGrade) ||
      (a.itemId as number) - (b.itemId as number),
  );
  jewelryRows.sort(
    (a, b) =>
      gradeOrder(a.grade as GmGrade) - gradeOrder(b.grade as GmGrade) ||
      (a.itemId as number) - (b.itemId as number),
  );

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    `// AUTO-GENERATED — npx tsx server/scripts/gen-l2dop-gm-shop-from-text-rpg.ts
// Джерело: text-rpg grade-магазин + itemsDB; лише позиції з іконою з dropsShopCatalog
// або itemId із dropsShopOverrides.json (повний набір без фільтра: GM_SHOP_ALL_FROM_TEXT_RPG=1).
// Не редагувати вручну.

export type GmShopGrade = "NG" | "D" | "C" | "B" | "A" | "S";

export type GmShopWeaponKind =
  | "sword"
  | "blunt"
  | "dagger"
  | "bow"
  | "bigsword"
  | "bigblunt"
  | "dual"
  | "pole"
  | "fist";

export interface GmShopWeaponRow {
  itemId: number;
  grade: GmShopGrade;
  priceAdena: number;
  nameUk: string;
  weaponType: GmShopWeaponKind;
  pAtk: number;
  mAtk: number;
  /** items3 crit — rCrit / $WpnCRIT у calc_stats.php */
  rCrit: number;
  weight: number;
  crystals: number;
  atkSpd: number;
  iconUrl?: string;
}

export interface GmShopArmorRow {
  itemId: number;
  grade: GmShopGrade;
  priceAdena: number;
  nameUk: string;
  armorSlot: "chest" | "legs" | "head" | "gloves" | "feet" | "fullarmor" | "lhand";
  pDef: number;
  weight: number;
  armorType: string;
  iconUrl?: string;
}

export type GmShopJewelryKind = "ring" | "neck" | "earring";

export interface GmShopJewelryRow {
  itemId: number;
  grade: GmShopGrade;
  priceAdena: number;
  nameUk: string;
  jewelryKind: GmShopJewelryKind;
  /** Бонус M.Atk / параметр з items (часто колонка 23). */
  mAtk: number;
  pDef: number;
  weight: number;
  iconUrl?: string;
}

export const L2DOP_GM_SHOP_WEAPONS: GmShopWeaponRow[] = ${JSON.stringify(weapons, null, 2)};

export const L2DOP_GM_SHOP_ARMOR: GmShopArmorRow[] = ${JSON.stringify(armor, null, 2)};

export const L2DOP_GM_SHOP_JEWELRY: GmShopJewelryRow[] = ${JSON.stringify(jewelryRows, null, 2)};
`,
    'utf8',
  );

  console.log(
    [
      `OK → ${OUT} (${weapons.length} зброя, ${armor.length} броня/щит, ${jewelryRows.length} біжутерія)`,
      allowAllFromTextRpg
        ? 'режим: увесь текст-рог магазин (GM_SHOP_ALL_FROM_TEXT_RPG)'
        : `фільтр: лише позиції з icons/drops (каталог ${dropsShopKeysLower.size}) + itemId із overrides (${overrideItemIds.size})`,
    ].join(' — '),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
