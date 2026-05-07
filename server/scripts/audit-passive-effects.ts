import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { toSnapshot, type CharacterRow } from '../src/services/charService.js';

type LearnedRow = { battleId?: string; level?: number };

const prisma = new PrismaClient();

function num(v: unknown): number {
  return Number(v ?? 0);
}

function deltaLine(label: string, before: number, after: number): string | null {
  const d = after - before;
  if (d === 0) return null;
  const sign = d > 0 ? '+' : '';
  return `${label}: ${before} -> ${after} (${sign}${d})`;
}

async function main() {
  const name = String(process.argv[2] || '').trim();
  if (!name) {
    console.log('Usage: npx tsx server/scripts/audit-passive-effects.ts <char_name>');
    return;
  }
  const row = await prisma.character.findUnique({ where: { name } });
  if (!row) {
    console.log(`Character "${name}" not found.`);
    return;
  }

  const base = row as CharacterRow;
  const baseSnap = toSnapshot(base);
  const learned = Array.isArray(base.skillsLearnedJson)
    ? (base.skillsLearnedJson as LearnedRow[])
    : [];

  const out: Array<{ skill: string; lines: string[] }> = [];
  for (const s of learned) {
    const bid = String(s?.battleId || '').trim();
    const lvl = Math.max(0, Math.floor(Number(s?.level || 0)));
    if (!bid || lvl < 1) continue;

    const nextSkills = learned.filter((x) => String(x?.battleId || '').trim() !== bid);
    const fake = { ...base, skillsLearnedJson: nextSkills } as CharacterRow;
    const snap = toSnapshot(fake);

    const lines = [
      deltaLine('pAtk', num(baseSnap.pAtk), num(snap.pAtk)),
      deltaLine('mAtk', num(baseSnap.mAtk), num(snap.mAtk)),
      deltaLine('pDef', num(baseSnap.pDef), num(snap.pDef)),
      deltaLine('mDef', num(baseSnap.mDef), num(snap.mDef)),
      deltaLine('accuracy', num(baseSnap.accuracy), num(snap.accuracy)),
      deltaLine('evasion', num(baseSnap.evasion), num(snap.evasion)),
      deltaLine('pAtkSpd', num(baseSnap.pAtkSpd), num(snap.pAtkSpd)),
      deltaLine('castSpd', num(baseSnap.castSpd), num(snap.castSpd)),
      deltaLine('runSpeed', num(baseSnap.runSpeed), num(snap.runSpeed)),
      deltaLine('regenHp', num(baseSnap.regenHp), num(snap.regenHp)),
      deltaLine('regenMp', num(baseSnap.regenMp), num(snap.regenMp)),
      deltaLine('regenCp', num(baseSnap.regenCp), num(snap.regenCp)),
    ].filter((x): x is string => x != null);

    out.push({ skill: `${bid} lvl ${lvl}`, lines });
  }

  console.log(`Character: ${name}`);
  console.log(`Profession: ${base.l2Profession}, branch: ${base.classBranch}, level: ${baseSnap.level}`);
  console.log(`Base stats: castSpd=${baseSnap.castSpd}, regenHp=${baseSnap.regenHp}, regenMp=${baseSnap.regenMp}, regenCp=${baseSnap.regenCp}`);
  console.log('---');
  for (const rowOut of out) {
    console.log(rowOut.skill);
    if (rowOut.lines.length === 0) {
      console.log('  (no visible delta in profile snapshot stats)');
    } else {
      for (const l of rowOut.lines) console.log('  ' + l);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
