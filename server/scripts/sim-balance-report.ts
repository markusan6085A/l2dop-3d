/**
 * Фаза 3: звіт балансу бою / фарму (симуляція з фіксованим seed).
 *
 * npm run sim:balance
 * npm run sim:balance -- --seed=7 --fights=400 --save-baseline
 * npm run sim:balance -- --baseline=server/scripts/balance-sim-baseline.json
 *
 * Baseline: зберегти поточний прогін як v1 — `--save-baseline`. Наступні прогони порівнюють метрики (~% різниці).
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { MapWorldSpawn } from '../src/data/mapWorldSpawns.js';
import { mobCombatFromSpawn } from '../src/domain/battleMobSpawn.js';
import { emptyInventory, type InventoryState } from '../src/data/inventory.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import { resolveMagicBoltHit } from '../src/data/l2dopHitResolution.js';
import {
  rollPlayerPhysicalDmg,
  rollMobPhysicalVsPlayer,
} from '../src/services/battleServiceDamageRolls.js';
import type { BattleJsonState } from '../src/domain/battle.js';
import {
  effectiveMobDebuffResistPct,
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../src/domain/controlLandResist.js';
import { rollKillLoot } from '../src/domain/killLoot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_BASELINE_PATH = join(__dirname, 'balance-sim-baseline.json');

type Archetype = 'warrior' | 'archer' | 'mage';
type Tier = 'low' | 'mid' | 'high';
type MobKind = 'field' | 'champion' | 'dungeon';

interface EqSet {
  l1: number;
  l2?: number;
  l3: number;
  l4: number;
  lh: number;
  lg: number;
  lf: number;
}

const TIER_LEVEL: Record<Tier, number> = { low: 18, mid: 45, high: 76 };

/** Екіп під рівень (GM-каталог): воїн/лучник/маг. */
const EQ_BY_TIER: Record<Tier, Record<Archetype, EqSet>> = {
  low: {
    warrior: { l1: 86, l2: 626, l3: 58, l4: 59, lh: 499, lg: 61, lf: 62 },
    archer: { l1: 277, l3: 394, l4: 416, lh: 44, lg: 720, lf: 2422 },
    mage: { l1: 317, l3: 436, l4: 469, lh: 41, lg: 2447, lf: 2423 },
  },
  mid: {
    warrior: { l1: 135, l2: 107, l3: 398, l4: 418, lh: 1816, lg: 2455, lf: 2431 },
    archer: { l1: 286, l3: 398, l4: 418, lh: 1816, lg: 2455, lf: 2431 },
    mage: { l1: 84, l3: 439, l4: 471, lh: 20002, lg: 2454, lf: 2430 },
  },
  high: {
    warrior: { l1: 79, l2: 673, l3: 358, l4: 2380, lh: 2416, lg: 2487, lf: 2439 },
    archer: { l1: 7575, l3: 30009, l4: 2380, lh: 30008, lg: 30010, lf: 30011 },
    mage: { l1: 8336, l3: 30002, l4: 471, lh: 30001, lg: 30003, lf: 30004 },
  },
};

const MOB_KIND: Record<MobKind, MapWorldSpawn['kind']> = {
  field: 'passive',
  champion: 'champion',
  dungeon: 'dungeon',
};

function makeSpawn(level: number, kind: MobKind, name: string): MapWorldSpawn {
  return {
    id: `sim-${name}-${level}-${kind}`,
    worldX: 0,
    worldY: 0,
    templateId: 'sim',
    name,
    level,
    kind: MOB_KIND[kind],
    aggressive: false,
  };
}

function invFromEq(eq: EqSet): InventoryState {
  const inv = emptyInventory();
  const e: InventoryState['eq'] = {
    l1: eq.l1,
    l3: eq.l3,
    l4: eq.l4,
    lh: eq.lh,
    lg: eq.lg,
    lf: eq.lf,
  };
  if (eq.l2 != null) e.l2 = eq.l2;
  inv.eq = e;
  return inv;
}

function archetypeBranch(a: Archetype): 'fighter' | 'mystic' {
  return a === 'mage' ? 'mystic' : 'fighter';
}

function runWithSeed(seed: number, fn: () => void): void {
  const saved = Math.random;
  let s = seed >>> 0;
  Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  try {
    fn();
  } finally {
    Math.random = saved;
  }
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const a = [...sorted].sort((x, y) => x - y);
  const pos = (a.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return a[lo]!;
  return a[lo]! + (a[hi]! - a[lo]!) * (pos - lo);
}

interface ScenarioMetrics {
  avgDmgOnHit: number;
  avgTtkSec: number;
  ttkP50: number;
  ttkP90: number;
  ttkP95: number;
  physCritRate: number;
  magicCritRate: number;
  stunLandRate: number;
  debuffLandRate: number;
  missRate: number;
  hpNetPerFight: number;
  mpNetPerFight: number;
  adenaMeanPerKill: number;
  adenaPer10kKills: number;
  deathOrTimeoutRate: number;
}

interface ScenarioRow extends ScenarioMetrics {
  key: string;
  archetype: Archetype;
  tier: Tier;
  mob: MobKind;
  playerLevel: number;
  mobLevel: number;
}

function simulateScenario(
  archetype: Archetype,
  tier: Tier,
  mobKind: MobKind,
  fights: number
): ScenarioRow {
  const playerLevel = TIER_LEVEL[tier];
  const mobLevel = playerLevel;
  const race = 'Human';
  const classBranch = archetypeBranch(archetype);
  const inv = invFromEq(EQ_BY_TIER[tier][archetype]);
  const combat = computeCombatStats(playerLevel, race, classBranch, inv, {});
  const vit = computeVitals(playerLevel, race, classBranch, combat.con, combat.men);

  const spawn = makeSpawn(mobLevel, mobKind, 'Сим-моб');
  const mc = mobCombatFromSpawn(spawn);

  const secAuto = archetype === 'mage' ? 1.85 : archetype === 'archer' ? 1.65 : 1.45;
  const skillMulPhys = archetype === 'warrior' ? 1.18 : 1.12;
  const skillMp = archetype === 'mage' ? 44 : archetype === 'archer' ? 36 : 34;
  const powerskByTier: Record<Tier, number> = { low: 38, mid: 58, high: 78 };

  let totalDmgDealt = 0;
  let totalHitsAll = 0;
  const ttkList: number[] = [];
  let physSwing = 0;
  let physMiss = 0;
  let physCrit = 0;
  let magCast = 0;
  let magCrit = 0;
  let stunTry = 0;
  let stunOk = 0;
  let debTry = 0;
  let debOk = 0;
  let sumHpNet = 0;
  let sumMpNet = 0;
  let sumAdena = 0;
  let badFights = 0;

  for (let f = 0; f < fights; f++) {
    const st: BattleJsonState = {
      spawnId: spawn.id,
      log: [],
      mobHp: mc.maxHp,
      mobMaxHp: mc.maxHp,
      mobPAtk: mc.pAtk,
      mobPDef: mc.pDef,
      mobMAtk: mc.mAtk,
      mobMDef: mc.mDef,
      mobEvasion: mc.evasion,
      playerMp: vit.maxMp,
      battleMods: {},
    };

    let mobHp = mc.maxHp;
    let playerHp = vit.maxHp;
    let playerMp = vit.maxMp;
    let elapsed = 0;
    let action = 0;
    let localPhysSwing = 0;
    let localPhysMiss = 0;
    let localPhysCrit = 0;
    let localMag = 0;
    let localMagCrit = 0;
    let localDmgSum = 0;
    let localHits = 0;
    let dmgTaken = 0;
    let mpSpent = 0;
    let guardDeath = 0;

    while (mobHp > 0 && playerHp > 0 && guardDeath < 60_000) {
      guardDeath++;
      const rot = action % 3;
      action++;

      if (archetype === 'mage') {
        elapsed += secAuto;
        localMag++;
        const r = resolveMagicBoltHit({
          mAtk: combat.mAtk,
          mobMDef: mc.mDef,
          playerInt: combat.int,
          playerWit: combat.wit,
          playerMen: combat.men,
          playerLevel,
          mobEvasion: mc.evasion,
          skillPower: powerskByTier[tier],
          bonusSps: 1,
          mCritPct: combat.mCritPct,
          magicCritDmgMul: combat.magicCritDmgMul,
          allowMiss: false,
          allowMagicCrit: true,
        });
        if (r.outcome === 'crit') localMagCrit++;
        mobHp -= r.damage;
        if (r.damage > 0) {
          localDmgSum += r.damage;
          localHits++;
        }
        playerMp = Math.max(0, playerMp - skillMp);
        mpSpent += skillMp;

        if (action % 2 === 0) {
          debTry++;
          const p = 0.52 * (1 - effectiveMobDebuffResistPct({ level: mobLevel }) / 100);
          if (Math.random() < p) debOk++;
        }
      } else {
        elapsed += secAuto;
        localPhysSwing++;
        const isSkill = rot === 2;
        const atk = isSkill
          ? Math.floor(combat.pAtk * skillMulPhys)
          : combat.pAtk;
        const pr = rollPlayerPhysicalDmg(
          atk,
          combat,
          st,
          mobLevel,
          spawn.name,
          {},
          st.battleMods,
          { forceNoMiss: false }
        );
        if (pr.outcome === 'miss') localPhysMiss++;
        if (pr.outcome === 'crit') localPhysCrit++;
        mobHp -= pr.damage;
        if (pr.damage > 0) {
          localDmgSum += pr.damage;
          localHits++;
        }
        if (isSkill) {
          playerMp = Math.max(0, playerMp - skillMp);
          mpSpent += skillMp;
          stunTry++;
          const baseStun = archetype === 'archer' ? 36 : 38;
          const eff = scaleLandChancePercentAfterResist(
            baseStun,
            effectiveMobStunResistPct({ level: mobLevel })
          );
          if (Math.random() * 100 < eff) stunOk++;
        }
      }

      if (mobHp <= 0) break;

      /** Контратака моба ~кожні 2 дії гравця (спрощено). */
      if (action % 2 === 0) {
        const counter = rollMobPhysicalVsPlayer(
          mc.pAtk,
          mobLevel,
          combat,
          st,
          st.battleMods
        );
        if (counter.damage > 0) dmgTaken += counter.damage;
        playerHp = Math.max(0, playerHp - counter.damage);
      }

      playerHp = Math.min(
        vit.maxHp,
        playerHp + combat.regenHp * (secAuto / 1)
      );
      playerMp = Math.min(
        vit.maxMp,
        playerMp + combat.regenMp * (secAuto / 1)
      );
    }

    if (mobHp > 0 || playerHp <= 0) {
      badFights++;
      continue;
    }

    ttkList.push(elapsed);
    totalDmgDealt += localDmgSum;
    totalHitsAll += localHits;

    physSwing += localPhysSwing;
    physMiss += localPhysMiss;
    physCrit += localPhysCrit;
    magCast += localMag;
    magCrit += localMagCrit;

    const regenHpFight = combat.regenHp * elapsed;
    const regenMpFight = combat.regenMp * elapsed;
    sumHpNet += regenHpFight - dmgTaken;
    sumMpNet += regenMpFight - mpSpent;

    const lootInv = emptyInventory();
    sumAdena += Number(rollKillLoot(null, mobLevel, lootInv).adena);
  }

  const n = ttkList.length;
  const avgTtk = n > 0 ? ttkList.reduce((a, b) => a + b, 0) / n : 0;

  return {
    key: `${archetype}_${tier}_${mobKind}`,
    archetype,
    tier,
    mob: mobKind,
    playerLevel,
    mobLevel,
    avgDmgOnHit: totalHitsAll > 0 ? totalDmgDealt / totalHitsAll : 0,
    avgTtkSec: avgTtk,
    ttkP50: quantile(ttkList, 0.5),
    ttkP90: quantile(ttkList, 0.9),
    ttkP95: quantile(ttkList, 0.95),
    physCritRate: physSwing > 0 ? physCrit / physSwing : 0,
    magicCritRate: magCast > 0 ? magCrit / magCast : 0,
    stunLandRate: stunTry > 0 ? stunOk / stunTry : 0,
    debuffLandRate: debTry > 0 ? debOk / debTry : 0,
    missRate: physSwing > 0 ? physMiss / physSwing : 0,
    hpNetPerFight: n > 0 ? sumHpNet / n : 0,
    mpNetPerFight: n > 0 ? sumMpNet / n : 0,
    adenaMeanPerKill: n > 0 ? sumAdena / n : 0,
    adenaPer10kKills: n > 0 ? (sumAdena / n) * 10_000 : 0,
    deathOrTimeoutRate: fights > 0 ? badFights / fights : 0,
  };
}

function pctDiff(cur: number, base: number): string {
  if (base === 0 && cur === 0) return '0%';
  if (base === 0) return '—';
  const d = ((cur - base) / Math.abs(base)) * 100;
  const sign = d > 0 ? '+' : '';
  return `${sign}${d.toFixed(1)}%`;
}

interface BaselineFile {
  version: 1;
  seed: number;
  fightsPerScenario: number;
  createdAt: string;
  scenarios: Record<string, ScenarioMetrics>;
}

function runAllScenarios(fightsPerScenario: number): ScenarioRow[] {
  const rows: ScenarioRow[] = [];
  const archetypes: Archetype[] = ['warrior', 'archer', 'mage'];
  const tiers: Tier[] = ['low', 'mid', 'high'];
  const mobs: MobKind[] = ['field', 'champion', 'dungeon'];
  for (const a of archetypes) {
    for (const t of tiers) {
      for (const m of mobs) {
        rows.push(simulateScenario(a, t, m, fightsPerScenario));
      }
    }
  }
  return rows;
}

function printReport(
  rows: ScenarioRow[],
  baseline: BaselineFile | null,
  seed: number,
  fights: number
): void {
  console.log('=== sim:balance (фаза 3) ===');
  console.log(`seed=${seed}, боїв на сценарій=${fights}`);
  console.log(
    'Ротація: фіз — 2 auto + 1 skill (MP); маг — лише bolt (powersk за tier); контроль — спроба stun на skill / debuff кожен 2-й bolt.'
  );
  console.log('');
  for (const r of rows) {
    console.log(
      `${r.key} · Lv.${r.playerLevel} vs ${r.mob} (моб Lv.${r.mobLevel})`
    );
    const b = baseline?.scenarios[r.key];
    const line = (
      label: string,
      v: number,
      base: number | undefined,
      fmt: (x: number) => string
    ) => {
      const curS = fmt(v);
      if (base === undefined) {
        console.log(`  ${label}: ${curS}`);
        return;
      }
      console.log(`  ${label}: ${curS} (baseline ${fmt(base)}, ${pctDiff(v, base)})`);
    };
    line('avg damage / успішний удар', r.avgDmgOnHit, b?.avgDmgOnHit, (x) =>
      x.toFixed(1)
    );
    line('avg TTK (с)', r.avgTtkSec, b?.avgTtkSec, (x) => x.toFixed(2));
    line('TTK p50 (с)', r.ttkP50, b?.ttkP50, (x) => x.toFixed(2));
    line('TTK p90 (с)', r.ttkP90, b?.ttkP90, (x) => x.toFixed(2));
    line('TTK p95 (с)', r.ttkP95, b?.ttkP95, (x) => x.toFixed(2));
    line('phys crit rate', r.physCritRate, b?.physCritRate, (x) =>
      (x * 100).toFixed(2) + '%'
    );
    line('magic crit rate', r.magicCritRate, b?.magicCritRate, (x) =>
      (x * 100).toFixed(2) + '%'
    );
    line('stun land (на спробу скіла)', r.stunLandRate, b?.stunLandRate, (x) =>
      (x * 100).toFixed(1) + '%'
    );
    line('debuff land (спроба)', r.debuffLandRate, b?.debuffLandRate, (x) =>
      (x * 100).toFixed(1) + '%'
    );
    line('miss rate (фіз)', r.missRate, b?.missRate, (x) =>
      (x * 100).toFixed(2) + '%'
    );
    line(
      'HP net/бій (реген − отримано)',
      r.hpNetPerFight,
      b?.hpNetPerFight,
      (x) => x.toFixed(1)
    );
    line(
      'MP net/бій (реген − витрати)',
      r.mpNetPerFight,
      b?.mpNetPerFight,
      (x) => x.toFixed(1)
    );
    line(
      'adena / убивство (mean, npc∅)',
      r.adenaMeanPerKill,
      b?.adenaMeanPerKill,
      (x) => x.toFixed(1)
    );
    line(
      'adena / 10k kills (оцінка)',
      r.adenaPer10kKills,
      b?.adenaPer10kKills,
      (x) => Math.round(x).toString()
    );
    line('невдалі бої/таймаут', r.deathOrTimeoutRate, b?.deathOrTimeoutRate, (x) =>
      (x * 100).toFixed(2) + '%'
    );
    console.log('');
  }
}

function parseArgs(argv: string[]) {
  let seed = 42;
  let fights = 250;
  let saveBaseline = false;
  let baselinePath = DEFAULT_BASELINE_PATH;
  for (const a of argv) {
    if (a.startsWith('--seed=')) {
      seed = Number(a.split('=')[1]);
    } else if (a === '--save-baseline') {
      saveBaseline = true;
    } else if (a.startsWith('--baseline=')) {
      baselinePath = a.split('=')[1]!.trim();
    } else if (a.startsWith('--fights=')) {
      const n = Math.floor(Number(a.split('=')[1]));
      if (Number.isFinite(n) && n >= 1) fights = Math.min(50_000, n);
    }
  }
  return { seed, fights, saveBaseline, baselinePath };
}

function main(): void {
  const { seed, fights, saveBaseline, baselinePath } = parseArgs(
    process.argv.slice(2)
  );
  let baseline: BaselineFile | null = null;
  if (existsSync(baselinePath)) {
    try {
      baseline = JSON.parse(
        readFileSync(baselinePath, 'utf8')
      ) as BaselineFile;
    } catch {
      baseline = null;
    }
  }

  let rows: ScenarioRow[] = [];
  runWithSeed(seed, () => {
    rows = runAllScenarios(fights);
  });

  printReport(rows, baseline, seed, fights);

  if (!existsSync(baselinePath)) {
    console.log(
      `Baseline не знайдено: ${baselinePath}. Зберегти v1: npm run sim:balance -- --save-baseline`
    );
  }

  if (saveBaseline) {
    const scenarios: Record<string, ScenarioMetrics> = {};
    for (const r of rows) {
      scenarios[r.key] = {
        avgDmgOnHit: r.avgDmgOnHit,
        avgTtkSec: r.avgTtkSec,
        ttkP50: r.ttkP50,
        ttkP90: r.ttkP90,
        ttkP95: r.ttkP95,
        physCritRate: r.physCritRate,
        magicCritRate: r.magicCritRate,
        stunLandRate: r.stunLandRate,
        debuffLandRate: r.debuffLandRate,
        missRate: r.missRate,
        hpNetPerFight: r.hpNetPerFight,
        mpNetPerFight: r.mpNetPerFight,
        adenaMeanPerKill: r.adenaMeanPerKill,
        adenaPer10kKills: r.adenaPer10kKills,
        deathOrTimeoutRate: r.deathOrTimeoutRate,
      };
    }
    const out: BaselineFile = {
      version: 1,
      seed,
      fightsPerScenario: fights,
      createdAt: new Date().toISOString(),
      scenarios,
    };
    writeFileSync(baselinePath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Збережено baseline: ${baselinePath}`);
  }
}

main();
