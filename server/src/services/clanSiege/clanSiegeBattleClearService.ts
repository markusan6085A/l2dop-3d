import { Prisma } from '@prisma/client';
import {
  isPvpBattleJson,
  isSiegePvpBattleJson,
  isWorldPvpBattleJson,
} from '../../domain/battlePvpContext.js';
import { parseBattleJson } from '../battleServiceParseBattleJson.js';
import { persistCharacterFieldsInTx } from '../charInternalPersist.js';
import type { CharacterRow } from '../charService.js';

export type ClearBattleForSiegeResult =
  | { action: 'unchanged'; row: CharacterRow }
  | { action: 'cleared_pve'; row: CharacterRow }
  | { action: 'cleared_stale'; row: CharacterRow }
  | { action: 'resume_siege_pvp'; row: CharacterRow }
  | { action: 'incompatible_pvp'; row: CharacterRow; role: 'attacker' | 'target' };

/**
 * Скасувати PvE/stale battleJson для входу на облогу або старту Siege PvP.
 * PvE — без нагороди, без kill моба; PvP цієї облоги — залишити; world/інша облога — помилка (strict).
 */
export async function clearNonPlayerBattleForSiegeInTx(
  tx: Prisma.TransactionClient,
  args: {
    row: CharacterRow;
    siegeId: string;
    role: 'attacker' | 'target' | 'viewer';
    strictPvpCheck?: boolean;
  }
): Promise<ClearBattleForSiegeResult> {
  const siegeId = String(args.siegeId || '').trim();
  const raw = args.row.battleJson;
  if (raw == null) {
    return { action: 'unchanged', row: args.row };
  }

  const bj = parseBattleJson(raw);
  if (bj && isPvpBattleJson(bj)) {
    if (isSiegePvpBattleJson(bj) && String(bj.siegeId || '').trim() === siegeId) {
      return { action: 'resume_siege_pvp', row: args.row };
    }
    if (args.strictPvpCheck && args.role !== 'viewer') {
      return {
        action: 'incompatible_pvp',
        row: args.row,
        role: args.role === 'attacker' ? 'attacker' : 'target',
      };
    }
    if (isWorldPvpBattleJson(bj) || isSiegePvpBattleJson(bj)) {
      return { action: 'unchanged', row: args.row };
    }
    return { action: 'unchanged', row: args.row };
  }

  if (!bj) {
    await persistCharacterFieldsInTx(tx, args.row.id, {
      battleJson: Prisma.JsonNull,
    });
    const fresh = await tx.character.findUnique({ where: { id: args.row.id } });
    return {
      action: 'cleared_stale',
      row: (fresh as CharacterRow) ?? args.row,
    };
  }

  await persistCharacterFieldsInTx(tx, args.row.id, {
    battleJson: Prisma.JsonNull,
  });
  const fresh = await tx.character.findUnique({ where: { id: args.row.id } });
  return {
    action: 'cleared_pve',
    row: (fresh as CharacterRow) ?? args.row,
  };
}

/** Один раз при вході на активну облогу (не кожен poll). */
export async function maybeClearPveBattleOnSiegeEnterInTx(
  tx: Prisma.TransactionClient,
  args: {
    characterId: string;
    siegeId: string;
    cityId: string;
    viewerCityId: string | null | undefined;
    effectiveStateActive: boolean;
  }
): Promise<void> {
  if (!args.effectiveStateActive) return;
  if (String(args.viewerCityId || '').trim() !== String(args.cityId || '').trim()) {
    return;
  }

  const row = await tx.character.findUnique({ where: { id: args.characterId } });
  if (!row || row.battleJson == null) return;

  await clearNonPlayerBattleForSiegeInTx(tx, {
    row: row as CharacterRow,
    siegeId: args.siegeId,
    role: 'viewer',
    strictPvpCheck: false,
  });
}
