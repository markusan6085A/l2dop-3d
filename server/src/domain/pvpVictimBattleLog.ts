import { MAX_BATTLE_LOG } from './battle.js';
import { buildPvpHitLogPair } from './pvpBattleLog.js';

const ATTACKER_CRIT_RE = /^Крит! Ти завдав (\d+) урона\.?$/;
const ATTACKER_HIT_RE = /^Ти завдав (\d+) урона\.?$/;
const ATTACKER_PVP_CRIT_RE =
  /^→ \[([^\]]+)\]: крит! −(\d+) HP(?: \(([^)]+)\))?\.?$/;
const ATTACKER_PVP_HIT_RE = /^→ \[([^\]]+)\]: −(\d+) HP(?: \(([^)]+)\))?\.?$/;
const ATTACKER_PVP_MISS_RE = /^→ \[([^\]]+)\]: промах(?: \(([^)]+)\))?\.?$/;
const VICTIM_CRIT_RE = /^Крит! Ти завдав (\d+) урона\.?$/;
const VICTIM_HIT_RE = /^Ти завдав (\d+) урона\.?$/;

function stripSkillLogPrefix(line: string): string {
  return String(line || '')
    .replace(/^[\u2060\u200B\d]+/, '')
    .trim();
}

function mapAttackerLineToVictim(line: string, attackerName: string): string | null {
  const trimmed = stripSkillLogPrefix(line);
  if (!trimmed) return null;
  let m = trimmed.match(ATTACKER_PVP_CRIT_RE);
  if (m) {
    return buildPvpHitLogPair({
      attackerName,
      targetName: m[1],
      damage: Number(m[2]),
      isCrit: true,
      skillLabelUk: m[3] || null,
    }).victimLine;
  }
  m = trimmed.match(ATTACKER_PVP_HIT_RE);
  if (m) {
    return buildPvpHitLogPair({
      attackerName,
      targetName: m[1],
      damage: Number(m[2]),
      skillLabelUk: m[3] || null,
    }).victimLine;
  }
  m = trimmed.match(ATTACKER_PVP_MISS_RE);
  if (m) {
    return buildPvpHitLogPair({
      attackerName,
      targetName: m[1],
      isMiss: true,
      damage: 0,
      skillLabelUk: m[2] || null,
    }).victimLine;
  }
  m = trimmed.match(ATTACKER_CRIT_RE);
  if (m) {
    return '[' + attackerName + '] — крит! −' + m[1] + ' HP.';
  }
  m = trimmed.match(ATTACKER_HIT_RE);
  if (m) {
    return '[' + attackerName + '] −' + m[1] + ' HP.';
  }
  if (trimmed === 'Промах.' || trimmed === 'Промах (магія).') {
    return '[' + attackerName + '] промахнувся.';
  }
  if (trimmed.startsWith('Відсіч у PvP:')) return trimmed;
  if (trimmed.startsWith('PvP-бій розпочато:')) {
    return 'На вас напали: [' + attackerName + '].';
  }
  return null;
}

function mapVictimCounterLine(line: string): string | null {
  const trimmed = String(line || '').trim();
  if (!trimmed) return null;
  let m = trimmed.match(VICTIM_CRIT_RE);
  if (m) return 'Відсіч — крит! −' + m[1] + ' HP суперника.';
  m = trimmed.match(VICTIM_HIT_RE);
  if (m) return 'Відсіч — −' + m[1] + ' HP суперника.';
  if (trimmed === 'Промах.' || trimmed === 'Промах (магія).') {
    return 'Відсіч — промах.';
  }
  return null;
}

/** Лог поразки для жертви: удари атакуючого + відсіч (якщо була). */
export function buildPvpVictimDefeatLog(args: {
  attackerName: string;
  attackerLog: string[];
  victimLog?: string[];
}): string[] {
  const attackerName = String(args.attackerName || '—').trim() || '—';
  const out: string[] = [];
  let opened = false;

  for (const line of args.attackerLog) {
    const mapped = mapAttackerLineToVictim(line, attackerName);
    if (mapped) {
      if (!opened && mapped.startsWith('На вас напали')) opened = true;
      else if (!opened) {
        out.push('На вас напали: [' + attackerName + '].');
        opened = true;
      }
      out.push(mapped);
    }
  }
  if (!opened) {
    out.push('На вас напали: [' + attackerName + '].');
  }

  const victimLog = args.victimLog ?? [];
  for (const line of victimLog) {
    const mapped = mapVictimCounterLine(line);
    if (mapped) out.push(mapped);
  }

  out.push('Вас вбив гравець [' + attackerName + ']!');
  return out.slice(-MAX_BATTLE_LOG);
}

export function pvpVictimHitLogLine(args: {
  attackerName: string;
  damage: number;
  isCrit?: boolean;
  isMiss?: boolean;
  skillLabelUk?: string | null;
}): string {
  return buildPvpHitLogPair({
    attackerName: args.attackerName,
    targetName: '—',
    damage: args.damage,
    isCrit: args.isCrit,
    isMiss: args.isMiss,
    skillLabelUk: args.skillLabelUk,
  }).victimLine;
}
