/**
 * Текст логу бою для гравця: прибираємо "(id, EngName)" / "(EngName)" з рядка скіла.
 */
export function compactBattleSkillLogLineUk(line: string): string {
  let s = String(line || '').trim();
  if (!s) return s;
  s = s.replace(/\s*\(\d+,\s*[^)]+\)/g, '');
  s = s.replace(/\s*\(([A-Za-z][A-Za-z0-9\s\-',/+]*)\)/g, '');
  s = s.replace(/\s+/g, ' ').replace(/\s+\./g, '.').trim();
  return s;
}
