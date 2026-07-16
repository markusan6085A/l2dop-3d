import type { BattleActionId } from './battle.js';
import { compactBattleSkillLogLineUk } from './battleLogFormat.js';

export function pvpSkillLabelUkFromTurn(args: {
  action: BattleActionId;
  skillLine?: string | null;
}): string | null {
  if (args.skillLine) {
    const compact = compactBattleSkillLogLineUk(args.skillLine);
    if (compact) return compact.replace(/\.\s*$/, '');
  }
  if (args.action === 'attack') return 'атака';
  if (args.action === 'bolt') return 'магія';
  return null;
}

function pvpSkillSuffix(label: string | null | undefined): string {
  const s = String(label || '').trim();
  return s ? ' (' + s + ')' : '';
}

/** Пара рядків логу: атакуючий бачить ціль, жертва — ім'я атакуючого. */
export function buildPvpHitLogPair(args: {
  attackerName: string;
  targetName: string;
  damage: number;
  isCrit?: boolean;
  isMiss?: boolean;
  skillLabelUk?: string | null;
}): { attackerLine: string; victimLine: string } {
  const target = String(args.targetName || 'Гравець').trim() || 'Гравець';
  const attacker = String(args.attackerName || '—').trim() || '—';
  const suffix = pvpSkillSuffix(args.skillLabelUk);
  const dmg = Math.max(0, Math.floor(args.damage));

  if (args.isMiss || (dmg <= 0 && !args.isCrit)) {
    return {
      attackerLine: '→ [' + target + ']: промах' + suffix + '.',
      victimLine: '[' + attacker + '] промахнувся' + suffix + '.',
    };
  }
  if (args.isCrit && dmg > 0) {
    return {
      attackerLine: '→ [' + target + ']: крит! −' + dmg + ' HP' + suffix + '.',
      victimLine: '[' + attacker + '] — крит! −' + dmg + ' HP' + suffix + '.',
    };
  }
  return {
    attackerLine: '→ [' + target + ']: −' + dmg + ' HP' + suffix + '.',
    victimLine: '[' + attacker + '] −' + dmg + ' HP' + suffix + '.',
  };
}
