/** Єдиний серверний конфіг облог міст (Stage A). */

export const SIEGE_TIME_ZONE = 'Europe/Kyiv';

/** 0=неділя … 6=субота (JS getDay у Europe/Kyiv). Змінюй тут без переписування логіки. */
export const SIEGE_WEEKDAY = 6;

export const SIEGE_DURATION_MINUTES = 20;
export const SIEGE_WALL_MAX_HP = 600_000;
export const SIEGE_WALL_DAMAGE_MIN = 1;
export const SIEGE_WALL_DAMAGE_MAX = 1000;
export const SIEGE_ATTACK_MIN_INTERVAL_MS = 350;
export const SIEGE_REWARD_CLAN_POINTS = 8000;
export const SIEGE_ACTIVE_POLL_MS = 4000;
export const SIEGE_WAITING_SYNC_MS = 60_000;

/** Фоновий tick: активація/завершення облог (не частіше). */
export const SIEGE_SERVER_TICK_MS = 45_000;

export type SiegeCitySlot = {
  cityId: string;
  labelEn: string;
  labelUk: string;
  /** Початок блоку HH:MM за Europe/Kyiv. */
  startHour: number;
  startMinute: number;
};

/** 8 міст × 20 хв = 18:00–20:40 Kyiv. Одночасно активна лише одна облога. */
export const SIEGE_CITY_SLOTS: readonly SiegeCitySlot[] = [
  { cityId: 'l2dop_oren', labelEn: 'Town of Oren', labelUk: 'Місто Орен', startHour: 18, startMinute: 0 },
  { cityId: 'l2dop_giran', labelEn: 'Town of Giran', labelUk: 'Місто Гіран', startHour: 18, startMinute: 20 },
  { cityId: 'l2dop_aden', labelEn: 'Town of Aden', labelUk: 'Місто Аден', startHour: 18, startMinute: 40 },
  { cityId: 'l2dop_goddard', labelEn: 'Town of Goddard', labelUk: 'Місто Годдарт', startHour: 19, startMinute: 0 },
  { cityId: 'l2dop_rune', labelEn: 'Rune Township', labelUk: 'Рун', startHour: 19, startMinute: 20 },
  { cityId: 'l2dop_gludio', labelEn: 'Town of Gludio', labelUk: 'Місто Глудіо', startHour: 19, startMinute: 40 },
  { cityId: 'l2dop_dion', labelEn: 'Town of Dion', labelUk: 'Місто Діон', startHour: 20, startMinute: 0 },
  { cityId: 'l2dop_schuttgart', labelEn: 'Town of Schuttgart', labelUk: 'Місто Штутгарт', startHour: 20, startMinute: 20 },
] as const;

const slotByCityId = new Map(SIEGE_CITY_SLOTS.map((s) => [s.cityId, s]));

export function getSiegeCitySlot(cityId: string): SiegeCitySlot | null {
  return slotByCityId.get(String(cityId || '').trim()) ?? null;
}

export function isSiegeCityId(cityId: string): boolean {
  return slotByCityId.has(String(cityId || '').trim());
}

export function siegeCityLabelUk(cityId: string): string {
  return getSiegeCitySlot(cityId)?.labelUk ?? cityId;
}
