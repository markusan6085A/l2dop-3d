/**
 * Авторські стати біжутерії з дроп-магазину (M.Def як число в jewelMdefFlat, без LVLMOD;
 * плоскі HP/MP, точність, ухил., реген MP %, стійкість до утримання).
 * Зливається в ITEM_CATALOG після GM-рядків.
 */
export type JewelryAuthorRow = {
  jewelMdefFlat: number;
  /** Гасимо класичний mAtk з GM, щоб не дублювати M.Def. */
  mAtk: number;
  pDef?: number;
  jewelMaxHp?: number;
  jewelMaxMp?: number;
  jewelAcc?: number;
  jewelEva?: number;
  /** Множник до regenMp (напр. 1.05 = +5%). */
  jewelMpRegenMul?: number;
  /** Множник holdResist (напр. 1.05 = +5%). */
  jewelHoldResistMul?: number;
};

export const JEWELRY_AUTHOR_ITEM_PATCH: Record<number, JewelryAuthorRow> = {
  // —— S ——
  858: { mAtk: 0, jewelMdefFlat: 205, jewelMaxMp: 90, jewelMaxHp: 70 },
  920: { mAtk: 0, jewelMdefFlat: 255, jewelMaxHp: 170, jewelMaxMp: 70 },
  889: { mAtk: 0, jewelMdefFlat: 175, jewelAcc: 5, jewelMaxMp: 45 },
  // —— A Cerberus ——
  872: { mAtk: 0, jewelMdefFlat: 140, jewelMaxHp: 60, jewelAcc: 2 },
  934: { mAtk: 0, jewelMdefFlat: 180, jewelMaxHp: 110, jewelAcc: 2 },
  903: { mAtk: 0, jewelMdefFlat: 125, jewelAcc: 3, jewelMaxHp: 40 },
  // —— A Phantom ——
  868: { mAtk: 0, jewelMdefFlat: 138, jewelAcc: 3 },
  930: { mAtk: 0, jewelMdefFlat: 178, jewelAcc: 4 },
  899: { mAtk: 0, jewelMdefFlat: 122, jewelAcc: 5 },
  // —— A Inferno I00 ——
  862: { mAtk: 0, jewelMdefFlat: 140, jewelMaxMp: 75 },
  924: { mAtk: 0, jewelMdefFlat: 180, jewelMaxHp: 90, jewelMaxMp: 50 },
  893: { mAtk: 0, jewelMdefFlat: 125, jewelMaxMp: 30, jewelAcc: 3 },
  // —— A Inferno I02 (sealed) ——
  6327: { mAtk: 0, jewelMdefFlat: 155, jewelMaxMp: 95 },
  6326: { mAtk: 0, jewelMdefFlat: 195, jewelMaxHp: 110, jewelMaxMp: 65 },
  6328: { mAtk: 0, jewelMdefFlat: 135, jewelMaxMp: 45, jewelAcc: 3 },
  // —— A Phoenix I00 ——
  871: { mAtk: 0, jewelMdefFlat: 140, jewelMaxHp: 100 },
  933: { mAtk: 0, jewelMdefFlat: 180, jewelMaxHp: 150 },
  902: { mAtk: 0, jewelMdefFlat: 125, jewelMaxHp: 70, jewelAcc: 2 },
  // —— A Phoenix I02 ——
  6324: { mAtk: 0, jewelMdefFlat: 155, jewelMaxHp: 125 },
  6323: { mAtk: 0, jewelMdefFlat: 195, jewelMaxHp: 180 },
  6325: { mAtk: 0, jewelMdefFlat: 135, jewelMaxHp: 90, jewelAcc: 2 },
  // —— B Adamantite ——
  856: { mAtk: 0, jewelMdefFlat: 100, jewelMaxHp: 40 },
  918: { mAtk: 0, jewelMdefFlat: 125, jewelMaxHp: 70 },
  887: { mAtk: 0, jewelMdefFlat: 85, jewelMaxHp: 30 },
  // —— B Another World ——
  866: { mAtk: 0, jewelMdefFlat: 105, jewelMaxMp: 35 },
  928: { mAtk: 0, jewelMdefFlat: 130, jewelMaxMp: 55 },
  897: { mAtk: 0, jewelMdefFlat: 90, jewelMaxMp: 25 },
  // —— B Black Ore ——
  864: { mAtk: 0, jewelMdefFlat: 105, jewelAcc: 2 },
  926: { mAtk: 0, jewelMdefFlat: 130, jewelAcc: 2 },
  895: { mAtk: 0, jewelMdefFlat: 90, jewelAcc: 3 },
  // —— B Elemental ——
  867: { mAtk: 0, jewelMdefFlat: 98, jewelMaxMp: 30 },
  929: { mAtk: 0, jewelMdefFlat: 123, jewelMaxHp: 55 },
  898: { mAtk: 0, jewelMdefFlat: 85, jewelAcc: 2 },
  // —— B Paradia ——
  861: { mAtk: 0, jewelMdefFlat: 100, jewelMaxHp: 35, jewelMaxMp: 20 },
  923: { mAtk: 0, jewelMdefFlat: 125, jewelMaxHp: 60, jewelMaxMp: 30 },
  892: { mAtk: 0, jewelMdefFlat: 85, jewelAcc: 2, jewelMaxMp: 15 },
  // —— B Sage ——
  860: { mAtk: 0, jewelMdefFlat: 100, jewelMaxMp: 45 },
  922: { mAtk: 0, jewelMdefFlat: 125, jewelMaxMp: 65 },
  891: { mAtk: 0, jewelMdefFlat: 85, jewelMaxMp: 35 },
  // —— B Assistance ——
  873: { mAtk: 0, jewelMdefFlat: 95, jewelMaxHp: 30 },
  935: { mAtk: 0, jewelMdefFlat: 142, jewelMaxHp: 45 },
  904: { mAtk: 0, jewelMdefFlat: 76, jewelMaxHp: 24 },
  // —— B Blessing ——
  874: { mAtk: 0, jewelMdefFlat: 95, jewelMaxMp: 30 },
  936: { mAtk: 0, jewelMdefFlat: 142, jewelMaxMp: 45 },
  905: { mAtk: 0, jewelMdefFlat: 76, jewelMaxMp: 24 },
  // —— B Grace ——
  869: { mAtk: 0, jewelMdefFlat: 95, jewelEva: 1 },
  931: { mAtk: 0, jewelMdefFlat: 142, jewelEva: 2 },
  900: { mAtk: 0, jewelMdefFlat: 76, jewelEva: 1 },
  // —— B Holy Spirit ——
  870: { mAtk: 0, jewelMdefFlat: 95, jewelMpRegenMul: 1.05 },
  932: { mAtk: 0, jewelMdefFlat: 142, jewelMpRegenMul: 1.075 },
  901: { mAtk: 0, jewelMdefFlat: 76, jewelMpRegenMul: 1.04 },
  // —— B Mana ——
  859: { mAtk: 0, jewelMdefFlat: 95, jewelMaxMp: 40 },
  921: { mAtk: 0, jewelMdefFlat: 142, jewelMaxMp: 60 },
  117: { mAtk: 0, jewelMdefFlat: 76, jewelMaxMp: 32 },
  // —— B Sola Eclipse ——
  863: { mAtk: 0, jewelMdefFlat: 95, jewelAcc: 2 },
  925: { mAtk: 0, jewelMdefFlat: 142, jewelAcc: 3 },
  894: { mAtk: 0, jewelMdefFlat: 76, jewelAcc: 1 },
  // —— B Summons (лише M.Def) ——
  865: { mAtk: 0, jewelMdefFlat: 95 },
  927: { mAtk: 0, jewelMdefFlat: 142 },
  896: { mAtk: 0, jewelMdefFlat: 76 },
  // —— C ——
  857: { mAtk: 0, jewelMdefFlat: 62, jewelMaxMp: 20 },
  852: { mAtk: 0, jewelMdefFlat: 60, jewelAcc: 1 },
  855: { mAtk: 0, jewelMdefFlat: 63, jewelMaxHp: 20 },
  854: { mAtk: 0, jewelMdefFlat: 61, jewelHoldResistMul: 1.05 },
  853: { mAtk: 0, jewelMdefFlat: 64, pDef: 10 },
  919: { mAtk: 0, jewelMdefFlat: 78, jewelMaxHp: 40 },
  119: { mAtk: 0, jewelMdefFlat: 76, jewelHoldResistMul: 1.07 },
  917: { mAtk: 0, jewelMdefFlat: 80, jewelMaxMp: 25 },
  916: { mAtk: 0, jewelMdefFlat: 82, pDef: 20 },
  885: { mAtk: 0, jewelMdefFlat: 50, jewelAcc: 2 },
  886: { mAtk: 0, jewelMdefFlat: 52, jewelHoldResistMul: 1.05 },
  884: { mAtk: 0, jewelMdefFlat: 53, pDef: 10 },
  // —— D ——
  850: { mAtk: 0, jewelMdefFlat: 36, jewelMaxMp: 10 },
  848: { mAtk: 0, jewelMdefFlat: 38, jewelMaxMp: 12 },
  851: { mAtk: 0, jewelMdefFlat: 34, jewelAcc: 1 },
  847: { mAtk: 0, jewelMdefFlat: 33, jewelMaxHp: 10 },
  849: { mAtk: 0, jewelMdefFlat: 32 },
  913: { mAtk: 0, jewelMdefFlat: 46, jewelMaxHp: 20 },
  911: { mAtk: 0, jewelMdefFlat: 48, jewelMaxMp: 15 },
  912: { mAtk: 0, jewelMdefFlat: 44, jewelMaxHp: 15 },
  914: { mAtk: 0, jewelMdefFlat: 43 },
  910: { mAtk: 0, jewelMdefFlat: 47, jewelMaxMp: 20 },
  882: { mAtk: 0, jewelMdefFlat: 30, jewelAcc: 1 },
  880: { mAtk: 0, jewelMdefFlat: 29, jewelMaxHp: 10 },
  890: { mAtk: 0, jewelMdefFlat: 31, jewelMaxMp: 15 },
  // —— NG ——
  112: { mAtk: 0, jewelMdefFlat: 20, jewelMaxMp: 5 },
  845: { mAtk: 0, jewelMdefFlat: 21, jewelAcc: 1 },
  846: { mAtk: 0, jewelMdefFlat: 22, jewelMaxHp: 5 },
  113: { mAtk: 0, jewelMdefFlat: 23, jewelMaxMp: 8 },
  114: { mAtk: 0, jewelMdefFlat: 22, jewelMaxHp: 7 },
  115: { mAtk: 0, jewelMdefFlat: 22, jewelMaxMp: 7 },
  909: { mAtk: 0, jewelMdefFlat: 30, jewelMaxHp: 15 },
  907: { mAtk: 0, jewelMdefFlat: 25, jewelMaxHp: 10 },
  1506: { mAtk: 0, jewelMdefFlat: 27, jewelMaxHp: 12 },
  906: { mAtk: 0, jewelMdefFlat: 28, jewelMaxMp: 10 },
  118: { mAtk: 0, jewelMdefFlat: 29, jewelMaxMp: 12 },
  1507: { mAtk: 0, jewelMdefFlat: 27, jewelMaxHp: 12 },
  908: { mAtk: 0, jewelMdefFlat: 28, jewelMaxMp: 10 },
  878: { mAtk: 0, jewelMdefFlat: 15, jewelAcc: 1 },
  116: { mAtk: 0, jewelMdefFlat: 16, jewelMaxMp: 5 },
  876: { mAtk: 0, jewelMdefFlat: 15, jewelMaxHp: 5 },
  1509: { mAtk: 0, jewelMdefFlat: 15, jewelEva: 1 },
  875: { mAtk: 0, jewelMdefFlat: 16, jewelMaxMp: 6 },
  1508: { mAtk: 0, jewelMdefFlat: 15, jewelMaxHp: 5 },
  877: { mAtk: 0, jewelMdefFlat: 16, jewelMaxMp: 6 },
};
