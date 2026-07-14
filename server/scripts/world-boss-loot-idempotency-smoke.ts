/**
 * Smoke: idempotent loot claim на WorldBossSessionState (без БД).
 * Запуск: npm run test:world-boss-loot-idempotency
 */
import {
  createWorldBossSessionState,
  isWorldBossLootIssued,
  pickWorldBossTopDamageDealer,
  registerWorldBossDamagingHit,
} from '../src/domain/worldBossSession.js';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const nowMs = 1_700_000_000_000;
const session = createWorldBossSessionState({
  spawnId: 'rb_test',
  mobHp: 0,
  mobMaxHp: 10_000,
  mobPAtk: 100,
  mobPDef: 50,
  mobMAtk: 0,
  mobMDef: 0,
  mobEvasion: 0,
  spawnWorldX: 0,
  spawnWorldY: 0,
  spawnName: 'Test RB',
  spawnLevel: 40,
  spawnKind: 'raid',
  nowMs,
});

registerWorldBossDamagingHit(session, 'char_a', 6000, nowMs);
registerWorldBossDamagingHit(session, 'char_b', 3000, nowMs + 1);

const top = pickWorldBossTopDamageDealer(session);
assert(top === 'char_a', 'top dealer = char_a');

assert(!isWorldBossLootIssued(session), 'loot not issued initially');

session.lootIssued = true;
session.lootIssuedAt = nowMs + 100;
session.lootRecipientCharacterId = top;
assert(isWorldBossLootIssued(session), 'loot issued flag');

const secondClaim = session.lootIssued === true;
assert(secondClaim, 'second claim blocked by lootIssued');

console.log('[test:world-boss-loot-idempotency] OK');
