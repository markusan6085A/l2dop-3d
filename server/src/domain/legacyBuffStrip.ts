/**
 * Таблиця «як прибрати legacy-баф з `battleMods`» за його L2 skillId.
 *
 * Використовується в `performBattleAction`: коли `battleModsExpiresAtMsBySkillId[id]`
 * ≤ nowMs, ми викликаємо відповідну функцію, щоб зняти з `battleMods` поля,
 * що представляють ефект цього бафа (мультиплікатори / прапорці / weaknessKind).
 *
 * НЕ дублюємо тривалості з `l2dopBuffDurations` — тут лише mapping skillId → cleanup.
 */
import type { BattleBattleMods } from './battle.js';
import type { WeaknessKind } from './mobWeaknessFamily.js';

function stripWeaknessKindIfEq(m: BattleBattleMods, kind: WeaknessKind): void {
  if (m.weaknessKind === kind) {
    delete m.weaknessKind;
    delete m.weaknessPatkMul;
  }
}

/** `skillId → (mods) => mutates mods, removing the buff's fields`. */
export const LEGACY_BUFF_STRIP_BY_SKILL_ID: Readonly<
  Record<number, (m: BattleBattleMods) => void>
> = {
  // Human Fighter
  4: (m) => {
    delete m.dashRunSpeedFlat;
  },
  18: (m) => {
    delete m.mobPatkDebuffMul;
  },
  65: (m) => {
    delete m.mobPatkDebuffMul;
  },
  75: (m) => stripWeaknessKindIfEq(m, 'insect'),
  80: (m) => stripWeaknessKindIfEq(m, 'monster'),
  86: (m) => {
    delete m.reflectDamageReturnRatio;
  },
  87: (m) => stripWeaknessKindIfEq(m, 'animal'),
  88: (m) => stripWeaknessKindIfEq(m, 'dragon'),
  94: (m) => {
    delete m.rageBattlePatkMul;
    delete m.rageBattlePdefMul;
  },
  97: (m) => {
    delete m.sanctuaryIncomingPhysMul;
  },
  99: (m) => {
    delete m.rapidShotAspdMul;
  },
  104: (m) => stripWeaknessKindIfEq(m, 'plant'),
  111: (m) => {
    delete m.ultimateEvasionActive;
    delete m.ultimateEvasionEvasionFlat;
  },
  116: (m) => {
    delete m.mobPatkDebuffMul;
  },
  139: (m) => {
    delete m.gutsBattlePdefMul;
  },
  176: (m) => {
    delete m.frenzyBattlePatkMul;
    delete m.frenzyBattleAccFlat;
  },
  287: () => {
    /* Lionheart — через `activeBuffsJson`, legacy-поле не використовується. */
  },
  283: (m) => {
    delete m.thrillFightPatkMul;
  },
  313: (m) => {
    delete m.snipePatkFlat;
    delete m.snipeAccuracyFlat;
    delete m.snipeCritRateAdd;
  },
  356: (m) => {
    delete m.focusChanceCritRateAdd;
  },
  357: (m) => {
    delete m.focusPowerPatkMul;
  },
  358: (m) => {
    delete m.mobTargetPDefMul;
    delete m.bluffCritDmgMul;
  },
  317: (m) => {
    delete m.focusAttackActive;
  },
  322: (m) => {
    delete m.shieldFortressPDefMul;
  },
  341: (_m) => {
    // Touch of Life — одноразовий хіл, полів у battleMods не лишає.
  },
  350: (m) => {
    delete m.physicalMirrorReflectRatio;
  },
  359: (m) => stripWeaknessKindIfEq(m, 'eye_hunter'),
  360: (m) => stripWeaknessKindIfEq(m, 'eye_slayer'),
  361: (m) => {
    delete m.mobTargetPDefMul;
  },
  368: (m) => {
    delete m.vengeanceIncomingPhysMul;
    delete m.vengeanceReflectRatio;
  },
  /** Sonic Move (Gladiator/Duelist, +run speed; використовує той самий
   *  `dashRunSpeedFlat`, що й Dash). */
  451: (m) => {
    delete m.dashRunSpeedFlat;
  },
  /** Sonic Guard (Duelist, −incoming phys). Використовує `sanctuaryIncomingPhysMul`
   *  як єдине поле зниження вхідної фіз. шкоди в `BattleBattleMods`. */
  442: (m) => {
    delete m.sanctuaryIncomingPhysMul;
  },
};

/**
 * Знімає з `battleMods` ефекти N випадкових legacy-бафів, які ще «живі» згідно
 * з `expiresMap` (ключі — skillId-як-рядок). Використовується для Cancel/Mass
 * Cancel: мобовий (або ворожий гравця) скіл діспелить частину self-бафів.
 *
 * Повертає новий об'єкт `battleMods` + оновлений expires map + список знятих
 * skillId (для лог-рядків). Чиста функція — вхідні не мутуються.
 */
export function cancelRandomLegacyBuffs(
  mods: BattleBattleMods,
  expiresMap: Readonly<Record<string, number>>,
  count: number,
  rng: () => number = Math.random
): {
  nextMods: BattleBattleMods;
  nextExpires: Record<string, number>;
  removedSkillIds: number[];
} {
  const candidates: number[] = [];
  for (const key of Object.keys(expiresMap)) {
    const sid = parseInt(key, 10);
    if (Number.isFinite(sid) && sid > 0 && LEGACY_BUFF_STRIP_BY_SKILL_ID[sid]) {
      candidates.push(sid);
    }
  }
  if (count <= 0 || candidates.length === 0) {
    return {
      nextMods: { ...mods },
      nextExpires: { ...expiresMap },
      removedSkillIds: [],
    };
  }
  const n = Math.min(count, candidates.length);
  const pool = candidates.slice();
  const removed: number[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    const taken = pool.splice(idx, 1)[0];
    if (taken !== undefined) removed.push(taken);
  }
  const nextMods: BattleBattleMods = { ...mods };
  const nextExpires: Record<string, number> = { ...expiresMap };
  for (const sid of removed) {
    const strip = LEGACY_BUFF_STRIP_BY_SKILL_ID[sid];
    if (strip) strip(nextMods);
    delete nextExpires[String(sid)];
  }
  return { nextMods, nextExpires, removedSkillIds: removed };
}

/**
 * Людське повідомлення для лога бою при закінченні бафа. Якщо нема — логуємо
 * generic-рядок.
 */
export const LEGACY_BUFF_EXPIRE_LOG_BY_SKILL_ID: Readonly<
  Record<number, string>
> = {
  4: 'Ривок: час вичерпано.',
  18: 'Аура ненависті: час вичерпано.',
  75: 'Вразливість комах: час вичерпано.',
  80: 'Вразливість монстрів: час вичерпано.',
  87: 'Вразливість звірів: час вичерпано.',
  88: 'Вразливість драконів: час вичерпано.',
  65: 'Жах: час вичерпано.',
  86: 'Відбиття шкоди: час вичерпано.',
  94: 'Rage: час вичерпано.',
  97: 'Святилище: час вичерпано.',
  99: 'Швидкий постріл: час вичерпано.',
  104: 'Вразливість рослин: час вичерпано.',
  111: 'Абсолютне ухилення: час вичерпано.',
  116: 'Звіриний рев: час вичерпано.',
  139: 'Guts: час вичерпано.',
  176: 'Frenzy: час вичерпано.',
  287: 'Левине серце: час вичерпано.',
  283: 'Темна пантера: час вичерпано.',
  313: 'Точний постріл: час вичерпано.',
  356: 'Фокус шансу: час вичерпано.',
  357: 'Фокус сили: час вичерпано.',
  358: 'Блеф: ефект вичерпано.',
  317: 'Зосереджений удар: час вичерпано.',
  322: 'Фортеця щита: час вичерпано.',
  341: 'Дотик життя: готовий знову.',
  350: 'Фізичне дзеркало: час вичерпано.',
  342: 'Дотик смерті: готовий знову.',
  359: 'Око мисливця: час вичерпано.',
  360: 'Око вбивці: час вичерпано.',
  361: 'Ударний імпульс: захист цілі відновлено.',
  368: 'Відплата: час вичерпано.',
  442: 'Звуковий захист: час вичерпано.',
  451: 'Звуковий ривок: час вичерпано.',
};
