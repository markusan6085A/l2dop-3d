import { L2DOP_NPC_ID_BY_NAME } from './l2dopNpcIdByName.generated.js';
import { L2DOP_NPC_ID_BY_LINEAGE_NAME } from './l2dopNpcIdByLineageName.generated.js';
import { L2DOP_MOB_NAME_ALIASES } from './l2dopNpcNameAliases.js';

/**
 * Ім'я моба з карти → npcid для XML-дропу та EXP/SP з lineage.
 * Спочатку англ. каталог (text-rpg), потім імена з lineage.sql (RU), потім аліаси.
 */
export function resolveL2dopNpcIdByMobName(name: string): number | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;

  const alias = L2DOP_MOB_NAME_ALIASES[trimmed];
  if (typeof alias === 'number') return alias;
  const resolvedName = typeof alias === 'string' ? alias : trimmed;

  const en = L2DOP_NPC_ID_BY_NAME[resolvedName];
  if (en != null) return en;

  const ru = L2DOP_NPC_ID_BY_LINEAGE_NAME[resolvedName];
  if (ru != null) return ru;

  if (trimmed === 'Yeti') {
    const frost =
      L2DOP_NPC_ID_BY_NAME['Frost Yeti'] ??
      L2DOP_NPC_ID_BY_LINEAGE_NAME['Frost Yeti'];
    if (frost != null) return frost;
  }

  return undefined;
}
