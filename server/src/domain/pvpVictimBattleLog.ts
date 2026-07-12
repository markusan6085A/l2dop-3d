import { MAX_BATTLE_LOG } from './battle.js';

const ATTACKER_CRIT_RE = /^Крит! Ти завдав (\d+) урона\.?$/;
const ATTACKER_HIT_RE = /^Ти завдав (\d+) урона\.?$/;
const VICTIM_CRIT_RE = /^Крит! Ти завдав (\d+) урона\.?$/;
const VICTIM_HIT_RE = /^Ти завдав (\d+) урона\.?$/;

function mapAttackerLineToVictim(line: string, attackerName: string): string | null {
  const trimmed = String(line || '').trim();
  if (!trimmed) return null;
  let m = trimmed.match(ATTACKER_CRIT_RE);
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
}): string {
  const name = String(args.attackerName || '—').trim() || '—';
  if (args.isMiss) return '[' + name + '] промахнувся.';
  const dmg = Math.max(0, Math.floor(args.damage));
  if (args.isCrit && dmg > 0) {
    return '[' + name + '] — крит! −' + dmg + ' HP.';
  }
  if (dmg > 0) return '[' + name + '] −' + dmg + ' HP.';
  return '[' + name + '] промахнувся.';
}
