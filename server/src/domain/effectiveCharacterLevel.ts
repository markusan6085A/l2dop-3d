/**
 * Рівень для бойової логіки та формул: тільки з накопиченого EXP (поле level у БД — кеш/UI).
 */
import { levelFromTotalExp } from '../data/l2dopExpgain.js';

export function getEffectiveCharacterLevel(exp: bigint): number {
  return levelFromTotalExp(exp);
}
