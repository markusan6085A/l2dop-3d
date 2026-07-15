import { Prisma } from '@prisma/client';
import {
  isStanceAccuracyActive,
  isStanceViciousActive,
  isStanceParryActive,
  isFocusAttackActive,
  jsonFiniteNum,
  jsonBoolLike,
  getWeaknessDetectMap,
  ZEALOT_EFFECT_DURATION_MS,
  type BattleBattleMods,
  type BattleJsonState,
} from '../domain/battle.js';
import type { WeaknessKind } from '../domain/mobWeaknessFamily.js';
import { isRiposteStanceActive } from '../domain/riposteStance.js';
import { warCryPatkPercentAtRank } from '../data/warCryTables.js';
import type { ActiveBuffEntry } from '../data/l2dopActiveBuffs.js';
import { buffDurationSecForSkillId } from '../data/l2dopBuffDurations.js';
import type { BattleBuffIcon } from './battleServiceTypes.js';

const MYSTIC_TOGGLE_SKILL_IDS = new Set([336, 337, 338]);
const ACTIVE_BUFF_LABEL_UK_BY_SKILL_ID: Readonly<Partial<Record<number, string>>> = {
  78: 'Бойовий клич',
  99: 'Швидкий постріл',
  1036: 'Магічний барʼєр',
  1040: 'Щит',
  1045: 'Благословення тіла',
  1048: 'Благословення душі',
  1059: 'Посилення',
  1062: 'Дух берсерка',
  1068: 'Сила',
  1077: 'Фокус',
  1085: 'Кмітливість',
  1086: 'Швидкість',
  1204: 'Хода вітру',
  121: 'Бойовий рик',
  1240: 'Наведення',
  130: 'Азарт бою',
  287: 'Левине серце',
  336: 'Таємна мудрість',
  337: 'Таємна сила',
  338: 'Таємна спритність',
};

function isMysticToggleSkillId(skillId: number): boolean {
  return MYSTIC_TOGGLE_SKILL_IDS.has(Math.floor(skillId));
}

function activeBuffLabelUk(skillId: number): string {
  return (
    ACTIVE_BUFF_LABEL_UK_BY_SKILL_ID[Math.floor(skillId)] ??
    'Ефект #' + String(Math.floor(skillId))
  );
}

/**
 * `buffExpiresAtMs` + `buffDurationTotalMs` для будь-якого self-buff, що має
 * запис в `activeBuffsJson` і відому тривалість у `l2dopBuffDurations`.
 * Клієнт (`battle.js`) рендерить тонкий conic-gradient ring навколо іконки.
 *
 * Працює генерик-канал: як тільки скіл додано в уніфіковану систему
 * (`activeBuffsJson` + `l2dopBuffDurations`), його іконка автоматично
 * отримує duration-ring — без правок цього модуля.
 */
function buffDurationInfoForSkillId(
  skillId: number,
  entry: ActiveBuffEntry | undefined
): { buffExpiresAtMs: number; buffDurationTotalMs: number } | undefined {
  if (!entry || entry.expiresAt === undefined) return undefined;
  const durSec = buffDurationSecForSkillId(skillId);
  if (durSec === undefined) return undefined;
  return {
    buffExpiresAtMs: entry.expiresAt,
    buffDurationTotalMs: Math.max(1, Math.floor(durSec * 1000)),
  };
}

/**
 * Допоміжний розширювач іконки — додає поля тривалості з `activeBuffs[skillId]`,
 * якщо вони є. Використовується для всіх non-toggle іконок, щоб не дублювати код.
 */
function iconDurationExtras(
  skillId: number,
  activeById: Map<number, ActiveBuffEntry>
): Partial<BattleBuffIcon> {
  const entry = activeById.get(skillId);
  const info = buffDurationInfoForSkillId(skillId, entry);
  if (info) return info;
  if (entry?.expiresAt !== undefined) {
    const remMs = Math.max(1000, Math.floor(entry.expiresAt - Date.now()));
    return { buffExpiresAtMs: entry.expiresAt, buffDurationTotalMs: remMs };
  }
  return {};
}

/**
 * Розширювач для legacy-бафів у `battleMods` (Rage/Frenzy/Guts/Lionheart/Howl/
 * Dash/Rapid Shot/Snipe/детекти/Eye of Hunter/Slayer/Focus Attack): якщо в
 * `st.battleModsExpiresAtMsBySkillId[skillId]` є `expiresAt`, повертаємо його
 * разом з `buffDurationTotalMs` з `l2dopBuffDurations`. Без активного скіла в
 * `activeBuffsJson`.
 */
function legacyIconDurationExtras(
  skillId: number,
  st: BattleJsonState
): Partial<BattleBuffIcon> {
  const exp = st.battleModsExpiresAtMsBySkillId?.[String(skillId)];
  if (typeof exp !== 'number' || !Number.isFinite(exp) || exp <= 0) return {};
  const durSec = buffDurationSecForSkillId(skillId);
  if (durSec === undefined) {
    const remMs = Math.max(1000, Math.floor(exp - Date.now()));
    return { buffExpiresAtMs: exp, buffDurationTotalMs: remMs };
  }
  return {
    buffExpiresAtMs: exp,
    buffDurationTotalMs: Math.max(1, Math.floor(durSec * 1000)),
  };
}

/**
 * Комбінований розширювач: спочатку пробуємо `activeBuffsJson`-шлях (War Cry /
 * Battle Roar / Thrill Fight — уже уніфіковані), якщо немає — дивимося в
 * `battleModsExpiresAtMsBySkillId` (legacy-бафи у `battleMods`).
 */
function iconDurationExtrasCombined(
  skillId: number,
  activeById: Map<number, ActiveBuffEntry>,
  st: BattleJsonState
): Partial<BattleBuffIcon> {
  const fromActive = iconDurationExtras(skillId, activeById);
  if (fromActive.buffExpiresAtMs !== undefined) return fromActive;
  return legacyIconDurationExtras(skillId, st);
}

/** Глибока копія в plain JSON — Prisma/драйвер інколи псує вкладені об’єкти. */
export function serializeBattleJsonForDb(st: BattleJsonState): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(st)) as Prisma.InputJsonValue;
}

export function battleBuffLinesUk(
  st: BattleJsonState,
  activeBuffs: readonly ActiveBuffEntry[] = []
): string[] {
  const m = (st.battleMods ?? {}) as BattleBattleMods;
  const out: string[] = [];
  const activeByIdForLines = new Map<number, ActiveBuffEntry>();
  for (const b of activeBuffs) activeByIdForLines.set(b.skillId, b);
  const wc = jsonFiniteNum(m?.warCryPatkMul ?? st.warCryPatkMul);
  const wcEntry = activeByIdForLines.get(78);
  if ((wc !== undefined && wc > 1) || wcEntry) {
    const wcPct = warCryPatkPercentAtRank(wcEntry?.level ?? 1);
    out.push('Бойовий клич: +' + wcPct + '% до P.Atk');
  }
  const dash = jsonFiniteNum(m.dashRunSpeedFlat);
  if (dash !== undefined && dash > 0) {
    const sonicMoveExp = st.battleModsExpiresAtMsBySkillId?.['451'];
    const isSonicMove =
      typeof sonicMoveExp === 'number' && sonicMoveExp > Date.now();
    out.push(
      (isSonicMove ? 'Звуковий ривок' : 'Ривок') +
        ': +' +
        Math.round(dash) +
        ' до швидкості пересування'
    );
  }
  const rspd = jsonFiniteNum(m.rapidShotAspdMul);
  if (rspd !== undefined && rspd > 1) {
    out.push(
      'Швидкий постріл: ×' + rspd.toFixed(2) + ' до швидкості атаки з луком'
    );
  }
  const snp = jsonFiniteNum(m.snipePatkFlat);
  if (snp !== undefined && snp > 0) {
    out.push(
      'Точний постріл: +' +
        Math.floor(snp) +
        ' до P.Atk / точності, +' +
        (jsonFiniteNum(m.snipeCritRateAdd) ?? 20) +
        ' до шансу криту'
    );
  }
  const br = jsonFiniteNum(m.battleRoarMaxHpMul);
  if ((br !== undefined && br > 1) || activeByIdForLines.has(121)) {
    out.push('Бойовий рик: +Max HP');
  }
  const mysPatk = jsonFiniteNum(m.mysticPatkBuffMul);
  if (mysPatk !== undefined && mysPatk > 1) {
    out.push('Сила: +' + Math.round((mysPatk - 1) * 100) + '% до P.Atk');
  }
  const mysMatk = jsonFiniteNum(m.mysticMatkBuffMul);
  if (mysMatk !== undefined && mysMatk > 1) {
    out.push('Посилення: +' + Math.round((mysMatk - 1) * 100) + '% до M.Atk');
  }
  const mysCast = jsonFiniteNum(m.mysticCastSpdBuffMul);
  if (mysCast !== undefined && mysCast > 1) {
    out.push(
      'Концентрація: +' + Math.round((mysCast - 1) * 100) + '% до швидкості касту'
    );
  }
  const mysPdef = jsonFiniteNum(m.mysticPdefBuffMul);
  if (mysPdef !== undefined && mysPdef > 1) {
    out.push('Щит: +' + Math.round((mysPdef - 1) * 100) + '% до P.Def');
  }
  const mysMdef = jsonFiniteNum(m.mysticMdefBuffMul);
  if (mysMdef !== undefined && mysMdef > 1) {
    out.push('Магзахист: +' + Math.round((mysMdef - 1) * 100) + '% до M.Def');
  }
  if (isStanceAccuracyActive(m)) {
    out.push('Стійка точності (+точність)');
  }
  if (isStanceViciousActive(m)) {
    out.push('Жорстка стійка (+урон)');
  }
  if (isStanceParryActive(m)) {
    out.push('Стійка парування');
  }
  if (isFocusAttackActive(m)) {
    out.push('Зосереджений удар (сила криту)');
  }
  const wd = getWeaknessDetectMap(m);
  for (const kindStr of Object.keys(wd)) {
    const wk = kindStr as WeaknessKind;
    const wp = wd[wk];
    if (wp !== undefined && wp > 1) {
      out.push(weaknessDetectBuffLineUk(wk, wp));
    }
  }
  const tf = jsonFiniteNum(m.thrillFightPatkMul);
  if ((tf !== undefined && tf > 1) || activeByIdForLines.has(130)) {
    out.push('Азарт бою: +ASPD');
  }
  const rgAtk = jsonFiniteNum(m.rageBattlePatkMul);
  const rgDef = jsonFiniteNum(m.rageBattlePdefMul);
  if (rgAtk !== undefined && rgAtk > 1) {
    out.push('Rage: +' + Math.round((rgAtk - 1) * 100) + '% до P.Atk у бою');
  }
  if (rgDef !== undefined && rgDef > 0 && rgDef < 1) {
    out.push('Rage: нижчий P.Def');
  }
  const fzAtk = jsonFiniteNum(m.frenzyBattlePatkMul);
  if (fzAtk !== undefined && fzAtk > 1) {
    out.push(
      'Frenzy: ×' +
        fzAtk.toFixed(2) +
        ' до P.Atk у бою' +
        (jsonFiniteNum(m.frenzyBattleAccFlat) !== undefined &&
        (jsonFiniteNum(m.frenzyBattleAccFlat) ?? 0) > 0
          ? ', +' + Math.floor(jsonFiniteNum(m.frenzyBattleAccFlat) ?? 0) + ' точн.'
          : '')
    );
  }
  const gutsD = jsonFiniteNum(m.gutsBattlePdefMul);
  if (gutsD !== undefined && gutsD > 1) {
    out.push('Guts: +' + Math.round((gutsD - 1) * 100) + '% до P.Def у бою');
  }
  const zAspd = jsonFiniteNum(m.zealotAspdMul);
  if (zAspd !== undefined && zAspd > 1) {
    const parts: string[] = [
      '+' + Math.round((zAspd - 1) * 100) + '% швидк. атаки',
    ];
    const zRun = jsonFiniteNum(m.zealotRunSpeedFlat);
    if (zRun !== undefined && zRun > 0) {
      parts.push('+' + Math.floor(zRun) + ' швидк. бігу');
    }
    const zAcc = jsonFiniteNum(m.zealotAccuracyFlat);
    if (zAcc !== undefined && zAcc > 0) {
      parts.push('+' + Math.floor(zAcc) + ' точн.');
    }
    const zCr = jsonFiniteNum(m.zealotCritRateAdd);
    if (zCr !== undefined && zCr > 0) {
      parts.push('+' + Math.floor(zCr) + ' шанс криту');
    }
    const zCd = jsonFiniteNum(m.zealotCritDmgMul);
    if (zCd !== undefined && zCd > 1) {
      parts.push('×' + zCd.toFixed(2) + ' сила криту');
    }
    out.push('Zealot: ' + parts.join(', '));
  }
  if (activeByIdForLines.has(287)) {
    out.push(
      'Левине серце: +40% стійкості до шоку, сну, утримання та паралічу'
    );
  }
  // Моб-цільові дебафи не показуємо в рядку бафів гравця.
  if (jsonFiniteNum(m.focusChanceCritRateAdd) !== undefined) {
    out.push('Фокус шансу: бонус до криту');
  }
  if (jsonFiniteNum(m.focusPowerPatkMul) !== undefined) {
    out.push('Фокус сили: сильніша атака');
  }
  if (jsonBoolLike(m.silentMoveActive)) {
    out.push('Безшумний рух');
  }
  if (jsonBoolLike(m.ultimateEvasionActive)) {
    out.push('Абсолютне ухилення');
  }
  if (jsonBoolLike(m.fakeDeathActive)) {
    out.push('Удавана смерть');
  }
  if (
    jsonFiniteNum(m.sanctuaryIncomingPhysMul) !== undefined &&
    (jsonFiniteNum(m.sanctuaryIncomingPhysMul) ?? 1) < 1
  ) {
    const sonicGuardExp = st.battleModsExpiresAtMsBySkillId?.['442'];
    const isSonicGuard =
      typeof sonicGuardExp === 'number' && sonicGuardExp > Date.now();
    out.push(
      (isSonicGuard ? 'Звуковий захист' : 'Святилище') +
        ': менший вхідний урон'
    );
  }
  if (jsonBoolLike(m.aegisStanceActive)) {
    out.push('Стійка егіда');
  }
  if (jsonFiniteNum(m.shieldFortressPDefMul) !== undefined) {
    out.push('Фортеця щита');
  }
  if (jsonFiniteNum(m.reflectDamageReturnRatio) !== undefined && !isRiposteStanceActive(m)) {
    out.push('Відбиття шкоди');
  }
  if (jsonFiniteNum(m.physicalMirrorReflectRatio) !== undefined) {
    out.push('Фізичне дзеркало');
  }
  if (
    jsonFiniteNum(m.vengeanceIncomingPhysMul) !== undefined &&
    (jsonFiniteNum(m.vengeanceIncomingPhysMul) ?? 1) < 1
  ) {
    out.push('Відплата: захист і відбиття');
  }
  return out;
}

export function battleMobDebuffLinesUk(st: BattleJsonState): string[] {
  const m = st.battleMods;
  if (!m) return [];
  const out: string[] = [];
  const md = jsonFiniteNum(m.mobPatkDebuffMul);
  if (md !== undefined && md > 0 && md < 1) {
    out.push('Атк. сила моба знижена');
  }
  const mtd = jsonFiniteNum(m.mobTargetPDefMul);
  if (mtd !== undefined && mtd > 0 && mtd < 1) {
    out.push('P.Def моба знижено');
  }
  const mtm = jsonFiniteNum(m.mobTargetMDefMul);
  if (mtm !== undefined && mtm > 0 && mtm < 1) {
    out.push('M.Def (резист магії) моба знижено');
  }
  const sleepUntil = jsonFiniteNum(m.mobSleepUntilMs);
  if (sleepUntil !== undefined && sleepUntil > Date.now()) {
    out.push('Моб приспаний (Sleep)');
  }
  const stunUntil = jsonFiniteNum(m.mobStunUntilMs);
  if (stunUntil !== undefined && stunUntil > Date.now()) {
    out.push('Моб оглушений (Shock/Stun)');
  }
  return out;
}

export function battleMobDebuffIconsForUi(
  st: BattleJsonState
): BattleBuffIcon[] {
  const m = st.battleMods;
  if (!m) return [];
  const out: BattleBuffIcon[] = [];
  const seenSkillIds = new Set<number>();
  const pushIcon = (key: string, l2SkillId: number, labelUk: string) => {
    const sid = Math.max(1, Math.floor(l2SkillId));
    if (seenSkillIds.has(sid)) return;
    seenSkillIds.add(sid);
    out.push({
      key,
      l2SkillId: sid,
      labelUk,
    });
  };
  const md = jsonFiniteNum(m.mobPatkDebuffMul);
  if (md !== undefined && md > 0 && md < 1) {
    const ids = Array.isArray(m.mobPatkDebuffIconSkillIds)
      ? m.mobPatkDebuffIconSkillIds
      : [jsonFiniteNum(m.mobPatkDebuffIconSkillId) ?? 116];
    const seen = new Set<number>();
    for (let i = 0; i < ids.length; i++) {
      const sid = Math.floor(Number(ids[i]));
      if (!Number.isFinite(sid) || sid <= 0) continue;
      if (seen.has(sid)) continue;
      seen.add(sid);
      pushIcon('mob_debuff_patk_' + sid + '_' + i, sid, 'Атк. сила моба знижена');
    }
  }
  const pdef = jsonFiniteNum(m.mobTargetPDefMul);
  if (pdef !== undefined && pdef > 0 && pdef < 1) {
    const ids = Array.isArray(m.mobTargetPDefDebuffIconSkillIds)
      ? m.mobTargetPDefDebuffIconSkillIds
      : [jsonFiniteNum(m.mobTargetPDefDebuffIconSkillId) ?? 12];
    const seen = new Set<number>();
    for (let i = 0; i < ids.length; i++) {
      const sid = Math.floor(Number(ids[i]));
      if (!Number.isFinite(sid) || sid <= 0) continue;
      if (seen.has(sid)) continue;
      seen.add(sid);
      pushIcon('mob_debuff_pdef_' + sid + '_' + i, sid, 'P.Def моба знижено');
    }
  }
  const mdef = jsonFiniteNum(m.mobTargetMDefMul);
  if (mdef !== undefined && mdef > 0 && mdef < 1) {
    const ids = Array.isArray(m.mobTargetMDefDebuffIconSkillIds)
      ? m.mobTargetMDefDebuffIconSkillIds
      : [jsonFiniteNum(m.mobTargetMDefDebuffIconSkillId) ?? 1263];
    const seen = new Set<number>();
    for (let i = 0; i < ids.length; i++) {
      const sid = Math.floor(Number(ids[i]));
      if (!Number.isFinite(sid) || sid <= 0) continue;
      if (seen.has(sid)) continue;
      seen.add(sid);
      pushIcon(
        'mob_debuff_mdef_' + sid + '_' + i,
        sid,
        'M.Def (резист магії) моба знижено'
      );
    }
  }
  const sleepUntil = jsonFiniteNum(m.mobSleepUntilMs);
  if (sleepUntil !== undefined && sleepUntil > Date.now()) {
    const sid = jsonFiniteNum(m.mobSleepIconSkillId) ?? 1069;
    pushIcon('mob_debuff_sleep', sid, 'Сон (моб не атакує)');
  }
  const stunUntil = jsonFiniteNum(m.mobStunUntilMs);
  if (stunUntil !== undefined && stunUntil > Date.now()) {
    const sid = jsonFiniteNum(m.mobStunIconSkillId) ?? 260;
    pushIcon('mob_debuff_stun', sid, 'Оглушення (Shock)');
  }
  return out;
}

function weaknessDetectBuffLineUk(kind: WeaknessKind, mul: number): string {
  const labels: Record<WeaknessKind, string> = {
    insect: 'комахи',
    monster: 'монстрів',
    animal: 'звірів',
    plant: 'рослин',
    dragon: 'драконів',
    eye_hunter: 'Око мисливця',
    eye_slayer: 'Око вбивці',
  };
  const lab = labels[kind];
  if (kind === 'eye_hunter' || kind === 'eye_slayer') {
    return `${lab}: ×${mul.toFixed(2)} до відповідних цілей`;
  }
  return `Детект слабкості (${lab}): ×${mul.toFixed(2)} до відповідних цілей`;
}

function weaknessDetectIconLabelUk(kind: WeaknessKind): string {
  const labels: Record<WeaknessKind, string> = {
    insect: 'Детект: комахи',
    monster: 'Детект: монстри',
    animal: 'Детект: звірі',
    plant: 'Детект: рослини',
    dragon: 'Детект: дракони',
    eye_hunter: 'Око мисливця',
    eye_slayer: 'Око вбивці',
  };
  return labels[kind];
}

function weaknessKindToL2SkillId(
  wk: NonNullable<BattleBattleMods['weaknessKind']>
): number {
  switch (wk) {
    case 'insect':
      return 75;
    case 'monster':
      return 80;
    case 'animal':
      return 87;
    case 'dragon':
      return 88;
    case 'plant':
      return 104;
    case 'eye_hunter':
      return 359;
    case 'eye_slayer':
      return 360;
    default:
      return 75;
  }
}

export function battleBuffIconsForUi(
  st: BattleJsonState,
  activeBuffs: readonly ActiveBuffEntry[] = []
): BattleBuffIcon[] {
  const out: BattleBuffIcon[] = [];
  const m = (st.battleMods ?? {}) as BattleBattleMods;
  const activeByIdForIcons = new Map<number, ActiveBuffEntry>();
  for (const b of activeBuffs) activeByIdForIcons.set(b.skillId, b);
  /**
   * Sonic Focus charges (Gladiator/Duelist): показуємо ліворуч бафів як окрему
   * іконку з бейджем «N/Max» — це канонічна L2 Interlude поведінка (заряди
   * видно біля інших бафів). Заряди не мають тривалості — висять доки їх не
   * витратить sonic-скіл або поки гравця не вб'ють. Не рендеримо, якщо 0 зарядів.
   */
  const sonicCur =
    typeof st.sonicCharges === 'number' && st.sonicCharges > 0
      ? Math.floor(st.sonicCharges)
      : 0;
  if (sonicCur > 0) {
    const sonicMax =
      typeof st.maxSonicCharges === 'number' && st.maxSonicCharges > 0
        ? Math.floor(st.maxSonicCharges)
        : sonicCur;
    out.push({
      key: 'sonic_focus_charges',
      l2SkillId: 8,
      labelUk: 'Sonic Focus: ' + sonicCur + '/' + sonicMax,
      chargeCount: sonicCur,
      chargeMax: sonicMax,
    });
  }
  const wc = jsonFiniteNum(m?.warCryPatkMul ?? st.warCryPatkMul);
  const wcActive = activeByIdForIcons.get(78);
  if ((wc !== undefined && wc > 1) || wcActive) {
    out.push({
      key: 'war_cry',
      l2SkillId: 78,
      labelUk: 'Бойовий клич',
      ...iconDurationExtrasCombined(78, activeByIdForIcons, st),
    });
  }
  const dashFlat = jsonFiniteNum(m.dashRunSpeedFlat);
  if (dashFlat !== undefined && dashFlat > 0) {
    /**
     * Якщо джерело — Sonic Move (451), показуємо його іконку + тривалість;
     * інакше — Ривок (4). Пріоритет за наявністю запису в
     * `battleModsExpiresAtMsBySkillId`, бо обидва скіли пишуть в одне поле.
     */
    const sonicMoveExp = st.battleModsExpiresAtMsBySkillId?.['451'];
    const useSonicMove =
      typeof sonicMoveExp === 'number' && sonicMoveExp > Date.now();
    if (useSonicMove) {
      out.push({
        key: 'sonic_move',
        l2SkillId: 451,
        labelUk: 'Звуковий ривок',
        ...iconDurationExtrasCombined(451, activeByIdForIcons, st),
      });
    } else {
      out.push({
        key: 'dash',
        l2SkillId: 4,
        labelUk: 'Ривок',
        ...iconDurationExtrasCombined(4, activeByIdForIcons, st),
      });
    }
  }
  /**
   * Sonic Guard (442): наш ефект — `sanctuaryIncomingPhysMul < 1`. Якщо скіл ще
   * активний згідно з `battleModsExpiresAtMsBySkillId["442"]`, показуємо власну
   * іконку замість «Святилища» (97) — щоб не плутати гравця в UI.
   */
  const sanM = jsonFiniteNum(m.sanctuaryIncomingPhysMul);
  if (sanM !== undefined && sanM > 0 && sanM < 1) {
    const sonicGuardExp = st.battleModsExpiresAtMsBySkillId?.['442'];
    if (typeof sonicGuardExp === 'number' && sonicGuardExp > Date.now()) {
      out.push({
        key: 'sonic_guard',
        l2SkillId: 442,
        labelUk: 'Звуковий захист',
        ...iconDurationExtrasCombined(442, activeByIdForIcons, st),
      });
    }
  }
  const rspdIcon = jsonFiniteNum(m.rapidShotAspdMul);
  if (rspdIcon !== undefined && rspdIcon > 1) {
    out.push({
      key: 'rapid_shot',
      l2SkillId: 99,
      labelUk: 'Швидкий постріл',
      ...iconDurationExtrasCombined(99, activeByIdForIcons, st),
    });
  }
  const snIcon = jsonFiniteNum(m.snipePatkFlat);
  if (snIcon !== undefined && snIcon > 0) {
    out.push({
      key: 'snipe',
      l2SkillId: 313,
      labelUk: 'Точний постріл',
      ...iconDurationExtrasCombined(313, activeByIdForIcons, st),
    });
  }
  const br = jsonFiniteNum(m.battleRoarMaxHpMul);
  const brActive = activeByIdForIcons.get(121);
  if ((br !== undefined && br > 1) || brActive) {
    out.push({
      key: 'battle_roar',
      l2SkillId: 121,
      labelUk: 'Бойовий рик',
      ...iconDurationExtrasCombined(121, activeByIdForIcons, st),
    });
  }
  const mysPatkI = jsonFiniteNum(m.mysticPatkBuffMul);
  if (mysPatkI !== undefined && mysPatkI > 1) {
    const iconId =
      jsonFiniteNum(m.mysticPatkBuffIconSkillId) ?? 1068;
    const resolvedId = Math.max(1, Math.floor(iconId));
    out.push({
      key: 'mystic_might',
      l2SkillId: resolvedId,
      labelUk: 'Сила',
      ...(isMysticToggleSkillId(resolvedId) ? { isToggle: true } : {}),
      ...iconDurationExtrasCombined(resolvedId, activeByIdForIcons, st),
    });
  }
  const mysMatkI = jsonFiniteNum(m.mysticMatkBuffMul);
  if (mysMatkI !== undefined && mysMatkI > 1) {
    const iconId =
      jsonFiniteNum(m.mysticMatkBuffIconSkillId) ?? 1059;
    const resolvedId = Math.max(1, Math.floor(iconId));
    out.push({
      key: 'mystic_empower',
      l2SkillId: resolvedId,
      labelUk: 'Посилення',
      ...(isMysticToggleSkillId(resolvedId) ? { isToggle: true } : {}),
      ...iconDurationExtrasCombined(resolvedId, activeByIdForIcons, st),
    });
  }
  const mysCastI = jsonFiniteNum(m.mysticCastSpdBuffMul);
  if (mysCastI !== undefined && mysCastI > 1) {
    const iconId =
      jsonFiniteNum(m.mysticCastSpdBuffIconSkillId) ?? 1078;
    const resolvedId = Math.max(1, Math.floor(iconId));
    out.push({
      key: 'mystic_concentration',
      l2SkillId: resolvedId,
      labelUk: 'Концентрація',
      ...(isMysticToggleSkillId(resolvedId) ? { isToggle: true } : {}),
      ...iconDurationExtrasCombined(resolvedId, activeByIdForIcons, st),
    });
  }
  const mysPdefI = jsonFiniteNum(m.mysticPdefBuffMul);
  if (mysPdefI !== undefined && mysPdefI > 1) {
    const iconId =
      jsonFiniteNum(m.mysticPdefBuffIconSkillId) ?? 1040;
    const resolvedId = Math.max(1, Math.floor(iconId));
    out.push({
      key: 'mystic_shield',
      l2SkillId: resolvedId,
      labelUk: 'Щит',
      ...(isMysticToggleSkillId(resolvedId) ? { isToggle: true } : {}),
      ...iconDurationExtrasCombined(resolvedId, activeByIdForIcons, st),
    });
  }
  const mysMdefI = jsonFiniteNum(m.mysticMdefBuffMul);
  if (mysMdefI !== undefined && mysMdefI > 1) {
    const iconId =
      jsonFiniteNum(m.mysticMdefBuffIconSkillId) ?? 1036;
    const resolvedId = Math.max(1, Math.floor(iconId));
    out.push({
      key: 'mystic_magic_barrier',
      l2SkillId: resolvedId,
      labelUk: 'Магзахист',
      ...(isMysticToggleSkillId(resolvedId) ? { isToggle: true } : {}),
      ...iconDurationExtrasCombined(resolvedId, activeByIdForIcons, st),
    });
  }
  if (isStanceAccuracyActive(m)) {
    out.push({
      key: 'stance_accuracy',
      l2SkillId: 256,
      labelUk: 'Стійка точності',
      isToggle: true,
    });
  }
  if (isStanceViciousActive(m)) {
    out.push({
      key: 'stance_vicious',
      l2SkillId: 312,
      labelUk: 'Жорстка стійка',
      isToggle: true,
    });
  }
  if (isStanceParryActive(m)) {
    out.push({
      key: 'stance_parry',
      l2SkillId: 339,
      labelUk: 'Стійка парування',
      isToggle: true,
    });
  }
  if (isRiposteStanceActive(m)) {
    out.push({
      key: 'riposte_stance',
      l2SkillId: 340,
      labelUk: 'Стійка відбиття',
      isToggle: true,
    });
  }
  if (isFocusAttackActive(m)) {
    out.push({
      key: 'focus_attack',
      l2SkillId: 317,
      labelUk: 'Зосереджений удар',
      ...iconDurationExtrasCombined(317, activeByIdForIcons, st),
    });
  }
  const wdIcons = getWeaknessDetectMap(m);
  for (const kindStr of Object.keys(wdIcons)) {
    const wk = kindStr as WeaknessKind;
    const wp = wdIcons[wk];
    if (wp === undefined || wp <= 1) continue;
    const wkSkillId = weaknessKindToL2SkillId(wk);
    out.push({
      key: 'weakness_' + wk,
      l2SkillId: wkSkillId,
      labelUk: weaknessDetectIconLabelUk(wk),
      ...iconDurationExtrasCombined(wkSkillId, activeByIdForIcons, st),
    });
  }
  const tf = jsonFiniteNum(m.thrillFightPatkMul);
  const tfActive = activeByIdForIcons.get(130);
  if ((tf !== undefined && tf > 1) || tfActive) {
    out.push({
      key: 'thrill_fight',
      l2SkillId: 130,
      labelUk: 'Азарт бою',
      ...iconDurationExtrasCombined(130, activeByIdForIcons, st),
    });
  }
  const rgAtkI = jsonFiniteNum(m.rageBattlePatkMul);
  if (rgAtkI !== undefined && rgAtkI > 1) {
    out.push({
      key: 'rage',
      l2SkillId: 94,
      labelUk: 'Rage',
      ...iconDurationExtrasCombined(94, activeByIdForIcons, st),
    });
  }
  const fzAtkI = jsonFiniteNum(m.frenzyBattlePatkMul);
  if (fzAtkI !== undefined && fzAtkI > 1) {
    out.push({
      key: 'frenzy',
      l2SkillId: 176,
      labelUk: 'Frenzy',
      ...iconDurationExtrasCombined(176, activeByIdForIcons, st),
    });
  }
  const gutsI = jsonFiniteNum(m.gutsBattlePdefMul);
  if (gutsI !== undefined && gutsI > 1) {
    out.push({
      key: 'guts',
      l2SkillId: 139,
      labelUk: 'Guts',
      ...iconDurationExtrasCombined(139, activeByIdForIcons, st),
    });
  }
  const zAspdI = jsonFiniteNum(m.zealotAspdMul);
  if (zAspdI !== undefined && zAspdI > 1) {
    const zUntil = jsonFiniteNum(m.zealotUntilMs);
    out.push({
      key: 'zealot',
      l2SkillId: 420,
      labelUk: 'Zealot',
      ...(zUntil !== undefined && zUntil > 0
        ? {
            buffExpiresAtMs: zUntil,
            buffDurationTotalMs: ZEALOT_EFFECT_DURATION_MS,
          }
        : {}),
    });
  }
  // Моб-цільові дебафи не рендеримо в смузі бафів гравця.
  if (jsonFiniteNum(m.focusChanceCritRateAdd) !== undefined) {
    out.push({
      key: 'focus_chance',
      l2SkillId: 356,
      labelUk: 'Фокус шансу',
      ...iconDurationExtrasCombined(356, activeByIdForIcons, st),
    });
  }
  if (jsonFiniteNum(m.focusPowerPatkMul) !== undefined) {
    out.push({
      key: 'focus_power',
      l2SkillId: 357,
      labelUk: 'Фокус сили',
      ...iconDurationExtrasCombined(357, activeByIdForIcons, st),
    });
  }
  if (jsonBoolLike(m.silentMoveActive)) {
    out.push({
      key: 'silent_move',
      l2SkillId: 221,
      labelUk: 'Безшумний рух',
      ...iconDurationExtrasCombined(221, activeByIdForIcons, st),
    });
  }
  if (jsonBoolLike(m.ultimateEvasionActive)) {
    out.push({
      key: 'ultimate_evasion',
      l2SkillId: 111,
      labelUk: 'Абсолютне ухилення',
      ...iconDurationExtrasCombined(111, activeByIdForIcons, st),
    });
  }
  if (jsonBoolLike(m.fakeDeathActive)) {
    out.push({
      key: 'fake_death',
      l2SkillId: 60,
      labelUk: 'Удавана смерть',
      ...iconDurationExtrasCombined(60, activeByIdForIcons, st),
    });
  }
  if (
    jsonFiniteNum(m.sanctuaryIncomingPhysMul) !== undefined &&
    (jsonFiniteNum(m.sanctuaryIncomingPhysMul) ?? 1) < 1
  ) {
    out.push({
      key: 'sanctuary',
      l2SkillId: 97,
      labelUk: 'Святилище',
      ...iconDurationExtrasCombined(97, activeByIdForIcons, st),
    });
  }
  if (jsonBoolLike(m.aegisStanceActive)) {
    out.push({
      key: 'aegis_stance',
      l2SkillId: 318,
      labelUk: 'Стійка егіда',
      isToggle: true,
    });
  }
  if (jsonFiniteNum(m.shieldFortressPDefMul) !== undefined) {
    out.push({
      key: 'shield_fortress',
      l2SkillId: 322,
      labelUk: 'Фортеця щита',
      ...iconDurationExtrasCombined(322, activeByIdForIcons, st),
    });
  }
  if (jsonFiniteNum(m.reflectDamageReturnRatio) !== undefined && !isRiposteStanceActive(m)) {
    out.push({
      key: 'reflect_damage',
      l2SkillId: 86,
      labelUk: 'Відбиття шкоди',
      ...iconDurationExtrasCombined(86, activeByIdForIcons, st),
    });
  }
  if (jsonFiniteNum(m.physicalMirrorReflectRatio) !== undefined) {
    out.push({
      key: 'physical_mirror',
      l2SkillId: 350,
      labelUk: 'Фізичне дзеркало',
      ...iconDurationExtrasCombined(350, activeByIdForIcons, st),
    });
  }
  if (
    jsonFiniteNum(m.vengeanceIncomingPhysMul) !== undefined &&
    (jsonFiniteNum(m.vengeanceIncomingPhysMul) ?? 1) < 1
  ) {
    out.push({
      key: 'vengeance',
      l2SkillId: 368,
      labelUk: 'Відплата',
      ...iconDurationExtrasCombined(368, activeByIdForIcons, st),
    });
  }
  /**
   * Generic-шлях для всіх активних self-бафів із `activeBuffsJson`:
   * якщо баф ще не показаний через legacy battleMods-гілку, додаємо його в ту ж
   * смугу іконок (поруч із toggle). Це покриває міського бафера та майбутні бафи
   * без окремих hardcode-гілок.
   */
  const seenSkillIds = new Set<number>();
  for (const x of out) {
    const sid = Math.floor(Number(x.l2SkillId));
    if (Number.isFinite(sid) && sid > 0) seenSkillIds.add(sid);
  }
  for (const e of activeBuffs) {
    const sid = Math.floor(Number(e.skillId));
    if (!Number.isFinite(sid) || sid <= 0) continue;
    if (seenSkillIds.has(sid)) continue;
    seenSkillIds.add(sid);
    out.push({
      key: 'active_buff_' + sid,
      l2SkillId: sid,
      labelUk: activeBuffLabelUk(sid),
      ...(isMysticToggleSkillId(sid) ? { isToggle: true } : {}),
      ...iconDurationExtras(sid, activeByIdForIcons),
    });
  }
  return out;
}
