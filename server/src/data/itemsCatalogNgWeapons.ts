/**
 * NG-grade зброя з магазину дропів: item id з `l2dop/lineage.sql` (items3).
 * P.Atk / M.Atk: базові співвідношення з `l2dop/newstats/items` масштабовані під
 * показники l2dopNgWeaponDropsPatches там, де авторський баланс відрізняється.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

function wCrit(wt: WeaponKindForEnchant): number {
  return wt === 'sword' ||
    wt === 'bigsword' ||
    wt === 'dual' ||
    wt === 'pole' ||
    wt === 'fist'
    ? 80
    : 120;
}

function phys(
  nameUk: string,
  wt: WeaponKindForEnchant,
  pAtk: number,
  mAtk: number | undefined,
  atkSpd: number,
  extras?: Partial<Pick<ItemMeta, 'rCrit'>>,
): ItemMeta {
  return {
    nameUk,
    slot: 'rhand',
    pAtk,
    ...(mAtk != null ? { mAtk } : {}),
    weaponType: wt,
    atkSpd,
    wpnCrit: wCrit(wt),
    ...extras,
  };
}

function magicHybrid(
  nameUk: string,
  wt: WeaponKindForEnchant,
  pAtk: number,
  mAtk: number,
  atkSpd: number,
): ItemMeta {
  return phys(nameUk, wt, pAtk, mAtk, atkSpd, { rCrit: wt === 'blunt' ? 4 : 8 });
}

/** Якщо id ще не з GM-каталогу — додає запис (основний каталог має пріоритет). */
export function mergeNgDropsWeapons(
  target: Record<number, ItemMeta>,
): void {
  const add = (id: number, meta: ItemMeta): void => {
    if (!target[id]) target[id] = meta;
  };

  /** Луки */
  add(13, phys('Короткий лук NG-grade.', 'bow', 46, 17, 293, { rCrit: 12 }));
  add(14, phys('Лук NG-grade.', 'bow', 54, 21, 293, { rCrit: 12 }));
  add(271, phys('Мисливський лук NG-grade.', 'bow', 62, 22, 293, { rCrit: 12 }));
  add(273, phys('Композитний лук NG-grade.', 'bow', 70, 23, 293, { rCrit: 12 }));

  /** Кинжали (+ кастети «ікло», patch). */
  add(12, phys('Ніж NG-grade.', 'dagger', 21, 19, 433, { rCrit: 12 }));
  add(11, phys('Кістковий кинжал NG-grade.', 'dagger', 25, 21, 433, { rCrit: 12 }));
  add(216, phys('Стилет NG-grade.', 'dagger', 29, 25, 433, { rCrit: 12 }));
  add(215, phys('Приречений кинжал NG-grade.', 'dagger', 33, 28, 433, {
    rCrit: 12,
  }));
  add(217, phys('Блискучий ніж NG-grade.', 'dagger', 37, 32, 433, {
    rCrit: 12,
  }));
  add(219, phys('Зламвач мечів NG-grade.', 'dagger', 41, 35, 433, {
    rCrit: 12,
  }));
  add(
    257,
    phys('Ікло гадюки NG-grade.', 'fist', 45, 25, 433, { rCrit: 4 }),
  );
  add(218, phys('Метальний ніж NG-grade.', 'dagger', 19, 16, 433, {
    rCrit: 12,
  }));

  /** Одноручні мечі (Short Sword як «малий меч»). */
  add(1, phys('Малий меч NG-grade.', 'sword', 21, 18, 379, { rCrit: 8 }));
  add(122, phys('Меч ручної кування NG-grade.', 'sword', 29, 25, 379, {
    rCrit: 8,
  }));
  add(66, phys('Гладіус NG-grade.', 'sword', 33, 29, 379, { rCrit: 8 }));
  add(3, phys('Широкий меч NG-grade.', 'sword', 36, 31, 379, { rCrit: 8 }));
  add(68, phys('Фалькіон NG-grade.', 'sword', 41, 35, 379, { rCrit: 8 }));
  add(2, phys('Довгий меч NG-grade.', 'sword', 45, 38, 379, { rCrit: 8 }));
  add(67, phys('Меч орків NG-grade.', 'sword', 48, 41, 379, { rCrit: 8 }));
  add(153, phys('Серп NG-grade.', 'blunt', 25, 18, 379, { rCrit: 4 }));

  /** Булави */
  add(4, phys('Бита NG-grade.', 'blunt', 25, 18, 379, { rCrit: 4 }));
  add(5, phys('Булава NG-grade.', 'blunt', 33, 24, 379, { rCrit: 4 }));
  add(155, phys('Буздиган NG-grade.', 'blunt', 41, 30, 379, { rCrit: 4 }));
  add(87, phys('Залізний молот NG-grade.', 'blunt', 37, 28, 379, {
    rCrit: 4,
  }));
  add(152, phys('Велике зубило NG-grade.', 'blunt', 45, 33, 379, {
    rCrit: 4,
  }));
  add(
    154,
    phys('Гномяча булава NG-grade.', 'blunt', 48, 35, 379, { rCrit: 4 }),
  );

  /** Кастети (dualfist), крім 257. */
  add(308, phys('Ріг буйвола NG-grade.', 'fist', 25, undefined, 379, { rCrit: 4 }));
  add(255, phys('Цвях лисячих лап NG-grade.', 'fist', 29, 17, 325, {
    rCrit: 4,
  }));
  add(254, phys('Залізні рукавички NG-grade.', 'fist', 33, 23, 325, {
    rCrit: 4,
  }));
  add(253, phys('Рукавички з шипами NG-grade.', 'fist', 37, 22, 325, {
    rCrit: 4,
  }));

  /** Списи */
  add(
    15,
    phys('Короткий спис NG-grade.', 'pole', 33, 23, 325, { rCrit: 8 }),
  );
  add(16, phys('Довгий спис NG-grade.', 'pole', 48, 33, 325, { rCrit: 8 }));

  /** Магія */
  add(
    99,
    magicHybrid('Посібник недосвідченого NG-grade.', 'sword', 15, 20, 379),
  );
  add(
    6,
    magicHybrid('Палиця недосвідченого NG-grade.', 'blunt', 19, 26, 379),
  );
  add(
    7,
    magicHybrid('Жезло недосвідченого NG-grade.', 'blunt', 17, 23, 379),
  );
  add(
    176,
    magicHybrid('Посох недосвідченого NG-grade.', 'bigblunt', 32, 33, 325),
  );
  add(
    9,
    magicHybrid(
      'Кедровий посох NG-grade.',
      'bigblunt',
      36,
      40,
      325,
    ),
  );
  add(
    8,
    magicHybrid('Вербовий посох NG-grade.', 'bigblunt', 42, 50, 325),
  );
  add(
    311,
    magicHybrid('Розп’яття благословення NG-grade.', 'sword', 31, 35, 379),
  );
  add(
    121,
    magicHybrid('Меч водяної тіні NG-grade.', 'sword', 24, 42, 379),
  );
  add(
    309,
    magicHybrid('Сльози Еви NG-grade.', 'sword', 41, 48, 379),
  );
  add(
    100,
    magicHybrid('Лялька вуду NG-grade.', 'sword', 40, 45, 379),
  );
}
