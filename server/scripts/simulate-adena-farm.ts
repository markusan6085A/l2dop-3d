/**
 * Оцінка адени з моделі дропу сервера (як rollKillLoot) для спавнів карти за діапазоном рівнів.
 *
 * npm run sim:adena-farm
 * npm run sim:adena-farm -- --level-min 60 --level-max 80 --kills 10000 --samples 500
 *
 * Як брати npcId (як для картки моба / дропів у каталозі спавну за замовчуванням): ім'я → templateId.
 * Прапорець --battle-npc лише по імені (як після перемоги в бою, якщо ім’я не зіставилося — синтетична адена).
 */
import {
  MAP_WORLD_SPAWNS,
  type MapWorldSpawn,
} from '../src/data/mapWorldSpawns.js';
import { emptyInventory } from '../src/data/inventory.js';
import { rollKillLoot } from '../src/domain/killLoot.js';
import { resolveL2dopNpcIdByMobName } from '../src/data/l2dopNpcResolve.js';
import { l2dopNpcIdFromMobId } from '../src/utils/mobPublicIcon.js';

interface CliOpts {
  levelMin: number;
  levelMax: number;
  kills: number;
  samplesPerArchetype: number;
  /** Ймовірність спавну зважена кількістю пінів на карті. */
  weightedByPins: boolean;
  /** Включити raid / epic / epic_guard (за замовчуванням лише звичайні поля та данжі). */
  includeBossPins: boolean;
  battleNpcOnly: boolean;
  topN: number;
}

function parseArgs(argv: string[]): CliOpts {
  const getNum = (name: string, def: number): number => {
    const raw = argv.find((a) => a.startsWith(`--${name}=`));
    if (!raw) {
      const ii = argv.indexOf(`--${name}`);
      if (ii >= 0) {
        const n = Number(argv[ii + 1]);
        return Number.isFinite(n) ? n : def;
      }
      return def;
    }
    const n = Number(raw.split('=')[1]);
    return Number.isFinite(n) ? n : def;
  };

  const has = (flag: string) => argv.includes(`--${flag}`);

  return {
    levelMin: getNum('level-min', 60),
    levelMax: getNum('level-max', 80),
    kills: getNum('kills', 10000),
    samplesPerArchetype: getNum('samples', 400),
    weightedByPins: !has('uniform-types'),
    includeBossPins: has('include-boss-pins'),
    battleNpcOnly: has('battle-npc'),
    topN: getNum('top', 15),
  };
}

function resolveNpcForSpawn(spawn: MapWorldSpawn, battleOnly: boolean): number | null {
  if (battleOnly) {
    return resolveL2dopNpcIdByMobName(spawn.name) ?? null;
  }
  return (
    resolveL2dopNpcIdByMobName(spawn.name) ??
    l2dopNpcIdFromMobId(spawn.templateId) ??
    null
  );
}

function archetypeKey(spawn: MapWorldSpawn, battleOnly: boolean): string {
  const npcId = resolveNpcForSpawn(spawn, battleOnly);
  return `${spawn.level}:${npcId ?? '∅'}:${spawn.name}:${spawn.kind}`;
}

function excludedKind(spawn: MapWorldSpawn, includeBossPins: boolean): boolean {
  if (includeBossPins) return false;
  return spawn.kind === 'raid' || spawn.kind === 'epic' || spawn.kind === 'epic_guard';
}

function fmtBig(n: bigint): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

interface ArchetypeStat {
  name: string;
  level: number;
  kind: MapWorldSpawn['kind'];
  npcId: number | null;
  pins: number;
  meanPerKillAdena: number;
}

function monteMeanAdenaPerKill(
  npcId: number | null,
  level: number,
  samples: number,
): number {
  const inv = emptyInventory();
  let sum = 0;
  for (let i = 0; i < samples; i++) {
    sum += Number(rollKillLoot(npcId, level, inv).adena);
  }
  return sum / samples;
}

/** Дроп залежить лише від npcId і рівня спавну (не від passive/aggressive тощо). */
function lootRollKey(npcId: number | null, level: number): string {
  return `${npcId ?? '∅'}@${level}`;
}

function main(): void {
  const argv = process.argv.slice(2);
  const opts = parseArgs(argv);
  const {
    levelMin,
    levelMax,
    kills,
    samplesPerArchetype,
    weightedByPins,
    includeBossPins,
    battleNpcOnly,
    topN,
  } = opts;

  if (levelMin > levelMax || kills < 1 || samplesPerArchetype < 1) {
    console.error('Неприпустимі параметри: level-min ≤ level-max, kills ≥ 1, samples ≥ 1.');
    process.exit(1);
  }

  const eligible = MAP_WORLD_SPAWNS.filter(
    (s) =>
      s.level >= levelMin &&
      s.level <= levelMax &&
      !excludedKind(s, includeBossPins)
  );

  if (eligible.length === 0) {
    console.log('Немає відповідних спавнів під заданий фільтр.');
    return;
  }

  const byArchetype = new Map<
    string,
    { pins: number; spawn: MapWorldSpawn; npcId: number | null }
  >();

  for (const s of eligible) {
    const key = archetypeKey(s, battleNpcOnly);
    const npcId = resolveNpcForSpawn(s, battleNpcOnly);
    const cur = byArchetype.get(key);
    if (cur) {
      cur.pins += 1;
    } else {
      byArchetype.set(key, { pins: 1, spawn: s, npcId });
    }
  }

  const stats: ArchetypeStat[] = [];
  let weightedMean = 0;

  const archeEntries = [...byArchetype.entries()];
  const totalPins = eligible.length;
  const monteCache = new Map<string, number>();

  for (const [, { pins, spawn, npcId }] of archeEntries) {
    const lk = lootRollKey(npcId, spawn.level);
    let mean = monteCache.get(lk);
    if (mean === undefined) {
      mean = monteMeanAdenaPerKill(npcId, spawn.level, samplesPerArchetype);
      monteCache.set(lk, mean);
    }
    stats.push({
      name: spawn.name,
      level: spawn.level,
      kind: spawn.kind,
      npcId,
      pins,
      meanPerKillAdena: mean,
    });
    if (weightedByPins) {
      weightedMean += mean * pins;
    } else {
      weightedMean += mean;
    }
  }

  weightedMean /= weightedByPins ? totalPins : stats.length;

  const totalEstimated = BigInt(Math.round(weightedMean * kills));
  stats.sort((a, b) => b.meanPerKillAdena - a.meanPerKillAdena);

  /** Для топу одна строка на npc+рівень (сума пінів між passive/neutral/aggr/champion). */
  const topByLoot = new Map<string, ArchetypeStat>();
  for (const s of stats) {
    const lk = lootRollKey(s.npcId, s.level);
    const cur = topByLoot.get(lk);
    if (!cur) topByLoot.set(lk, { ...s });
    else {
      cur.pins += s.pins;
      if (cur.kind !== 'aggressive' && s.kind === 'aggressive')
        Object.assign(cur, { name: s.name, kind: s.kind });
    }
  }
  const topList = [...topByLoot.values()].sort(
    (a, b) =>
      b.meanPerKillAdena - a.meanPerKillAdena ||
      b.pins - a.pins
  );

  const npcModeUk = battleNpcOnly
    ? 'npcId лише по імені моба (як код перемоги в бої)'
    : 'npcId як у каталозі спавну (імʼя або templateId)';

  console.log('=== Оцінка адени (серверна модель дропу) ===');
  console.log(`Рівні: ${levelMin}–${levelMax}, симульованих кілів підсумком: ${kills}`);
  console.log(
    `Спавни на карті (після фільтра): ${totalPins}; унікальних рядків (ім'я/kind): ${stats.length}; окремих моделей дропу (npcId+рівень): ${monteCache.size}`
  );
  console.log(
    weightedByPins
      ? 'Екстраполяція: середня адена × кількість кілів; одна модель одного «кілу» зважена кількістю пінів (де на карті частіше трапляється моб).'
      : 'Екстраполяція: кожен архетип рівномірний; середня береться між унікальними парами npc/імʼя без зважування пінів.'
  );
  console.log(`Режим npc: ${npcModeUk}`);
  console.log(`Симуляцій на кожну модель дропу (npcId+рівень): ${samplesPerArchetype}`);
  if (!includeBossPins) console.log('РБ/епіки/охорона епіка: виключені (є --include-boss-pins)');
  console.log('');
  console.log(`Очікування адени за ~${kills} кілів (оцінка): ${fmtBig(totalEstimated)}`);
  console.log(`Середня адена за 1 убивство під обраною моделлю: ${weightedMean.toFixed(1)}`);
  console.log('');
  console.log(
    `ТОП-${topN} моделей дропу ( npcId + рівень ) за середньою аденою за кіл; піни сумовані між passive/neutral/aggr/champion:`
  );

  const show = topList.slice(0, Math.min(topN, topList.length));
  for (let i = 0; i < show.length; i++) {
    const x = show[i]!;
    const extrap = BigInt(Math.round(x.meanPerKillAdena * kills));
    console.log(
      `  ${i + 1}. Lv.${x.level} ${x.name} [${x.kind}] npc=${x.npcId ?? '∅'} · пінів×${x.pins} · ~${Math.round(x.meanPerKillAdena)} ад./кіл × ${kills} ≈ ${fmtBig(extrap)}`
    );
  }
}

main();
