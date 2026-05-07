import { resolveMapMovement } from '../domain/mapMovement.js';
import { applyPassiveHpRegen, type CharacterRow } from './charService.js';

export async function applyPassiveAndMove(
  row: CharacterRow
): Promise<CharacterRow> {
  let r = await applyPassiveHpRegen(row);
  r = (await resolveMapMovement(r)) as CharacterRow;
  return r;
}
