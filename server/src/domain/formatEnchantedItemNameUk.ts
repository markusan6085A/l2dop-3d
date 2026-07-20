export function formatEnchantedItemNameUk(
  itemName: string,
  enchantLevel: number
): string {
  const base = String(itemName || '').trim();
  const enchant = Math.max(0, Math.floor(Number(enchantLevel) || 0));
  if (!base) return enchant > 0 ? `+${enchant}` : '';
  if (enchant <= 0) return base;
  return `+${enchant} ${base}`;
}
