/**
 * З кореня репозиторію: `npm run audit:hf-battle-catalog-gap`
 *
 * Знаходить записи каталогу HF з kind `battle` або `toggle`, для яких немає
 * рядка в `CANONICAL_L2_SKILL_TO_BATTLE_ACTION` (панель «Магія» / резолвер дії).
 */
import {
  BATTLE_BAR_BLOCKED_L2_SKILL_IDS,
  CANONICAL_L2_SKILL_TO_BATTLE_ACTION,
  HUMAN_FIGHTER_SKILL_CATALOG,
  canonicalBattleSkillId,
} from '../src/data/humanFighterSkillCatalog.js';

type Row = {
  battleId: string;
  l2SkillId: number;
  kind: 'battle' | 'toggle';
  nameUk: string;
  professionReq: string | null;
  blockedBar: boolean;
};

function main(): void {
  const mapped = new Set(
    Object.keys(CANONICAL_L2_SKILL_TO_BATTLE_ACTION)
  );
  const gaps: Row[] = [];

  for (const e of HUMAN_FIGHTER_SKILL_CATALOG) {
    if (e.kind !== 'battle' && e.kind !== 'toggle') continue;
    const bid = canonicalBattleSkillId(e.battleId);
    if (mapped.has(bid)) continue;
    gaps.push({
      battleId: bid,
      l2SkillId: e.l2SkillId,
      kind: e.kind,
      nameUk: e.nameUk,
      professionReq: e.professionReq,
      blockedBar: BATTLE_BAR_BLOCKED_L2_SKILL_IDS.has(e.l2SkillId),
    });
  }

  gaps.sort((a, b) => a.l2SkillId - b.l2SkillId);

  console.log(
    'HF каталог: battle/toggle без CANONICAL_L2_SKILL_TO_BATTLE_ACTION\n' +
      'Всього прогалин: ' +
      gaps.length +
      '\n'
  );

  const byProf = new Map<string | null, Row[]>();
  for (const r of gaps) {
    const k = r.professionReq;
    const arr = byProf.get(k) ?? [];
    arr.push(r);
    byProf.set(k, arr);
  }

  const profKeys = [...byProf.keys()].sort((a, b) => {
    if (a === null) return -1;
    if (b === null) return 1;
    return String(a).localeCompare(String(b));
  });

  for (const pk of profKeys) {
    const rows = byProf.get(pk) ?? [];
    console.log(
      '— ' +
        (pk === null ? '(база Fighter / null professionReq)' : pk) +
        ' — ' +
        rows.length
    );
    for (const r of rows) {
      const bar = r.blockedBar ? ' [заблоковано для панелі]' : '';
      console.log(
        '  l2_' +
          r.l2SkillId +
          '\t' +
          r.kind +
          '\t' +
          r.nameUk +
        bar
      );
    }
    console.log('');
  }

  const ids = gaps.map((g) => g.l2SkillId).join(', ');
  console.log('l2SkillId (через кому): ' + ids);
}

main();
