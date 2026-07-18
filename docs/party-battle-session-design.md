# PartyBattleSession — design note (фаза 2, фінальна)

> **Статус:** Етап A реалізовано (helpers, Prisma, session CRUD, tests).  
> **Етап B+:** battle routes, shared damage, reward writes, UI — лише після окремого OK.

## Legacy mismatch жовтого радіуса (важливо)

| Константа | Значення | Де використовується |
|-----------|----------|---------------------|
| `MAP_NEARBY_LIST_RADIUS` | **26 000** | Жовте коло map.html, список/маркери мобів |
| `BATTLE_RANGE` | **28 000** | **Canonical** серверна перевірка join/attack (`startBattleInTx`, `isWithinMobBattleRange`) |

**Це не один «жовтий радіус».** Сервер може дозволити атаку на ~2000 од. далі, ніж жовте UI-коло показує.

- Етап A: `isWithinMobBattleRange()` використовує **лише `BATTLE_RANGE`**.
- Етап D: вирівняти жовте UI-коло з `BATTLE_RANGE`, щоб гравець бачив ту саму дистанцію, що перевіряє сервер.
- `MAP_NEARBY_LIST_RADIUS` **не** використовувати для серверного дозволу атаки.

## Головне правило радіусів

| Колір на map.html | Константа | Роль |
|-------------------|-----------|------|
| **Жовте коло** (`#map-view-radius`) | `MAP_NEARBY_LIST_RADIUS` | UI: список і маркери мобів |
| **Жовта перевірка join/attack (сервер)** | `BATTLE_RANGE` | Чи моб доступний для бою / «Приєднатися» / battle action |
| **Червоне коло** (`#map-hero-view-radius`) | `MAP_NEARBY_HERO_RADIUS` | Гравці поруч, паті, eligibility нагороди, «У локації з вами» |

**Не створювати `PARTY_RANGE` і не хардкодити нові числа в party-коді.**

---

## 1. Поточна реалізація двох радіусів (audit)

### Константи (canonical source of truth)

| Константа | Значення | Файл |
|-----------|----------|------|
| `MAP_NEARBY_LIST_RADIUS` | `26_000` | `server/src/data/mapWorldSpawns.ts` |
| `MAP_NEARBY_HERO_RADIUS` | `12_000` | `server/src/data/mapWorldSpawns.ts` |
| `BATTLE_RANGE` | `28_000` | `server/src/domain/battleTypes.ts` (re-export `domain/battle.js`) |
| `DUNGEON_NEARBY_RADIUS_PX` | `70` | `server/src/domain/dungeonNearbyMobsQuery.ts` (подземелля; **не v1 party battle**) |

Коментар у `mapWorldSpawns.ts`: жовтий список мобів — менший за `BATTLE_RANGE`, щоб не шумити; серверна атака перевіряє `BATTLE_RANGE`.

### Координати і «instance»

| Поле | Призначення |
|------|-------------|
| `Character.worldX`, `Character.worldY` | Позиція на світовій карті |
| `Character.targetX/Y`, `moveStartAt`, `moveFromX/Y` | Інтерполяція руху (`resolveMapMovement`) |
| `Character.dungeonStateJson` | `null` = світ; `{ v:1, dungeonId, mapX, mapY, … }` = подземелля |
| `activeDungeonId` у snapshot | `parseDungeonStateJson(row.dungeonStateJson)?.dungeonId ?? null` |

**Стабільне правило «та сама карта/instance» для v1 (світова party battle):**

- обидва персонажі мають `dungeonStateJson == null`;
- координати порівнюються через `resolveMapMovement(row)` → `worldX/worldY`.

Подземелля в v1 **не** підтримуються (party battle лише для звичайного world PvE-моба).

### Distance / range helpers (існуючі)

| Функція | Файл | Радіус |
|---------|------|--------|
| `isWithinMapNearbyHeroRadius(px, py, tx, ty, radius?)` | `server/src/domain/mapNearbyRadius.ts` | `MAP_NEARBY_HERO_RADIUS` (default) |
| `Math.hypot(...) <= BATTLE_RANGE` (inline) | `battleServiceSession.ts`, `battleServicePvpSession.ts`, `worldBossSession.ts` | `BATTLE_RANGE` |
| `inBattleRange: d <= BATTLE_RANGE` | `mapNearbySpawnsQuery.ts`, `mapNearbyHeroesService.ts` | `BATTLE_RANGE` |
| `querySpawnsWithinRadius(..., MAP_NEARBY_LIST_RADIUS)` | `mapNearbySpawnsQuery.ts` | `MAP_NEARBY_LIST_RADIUS` |

### Сервер: nearby players

| Функція | Файл |
|---------|------|
| `getNearbyHeroesForMap(worldX, worldY, excludeId)` | `server/src/services/mapNearbyHeroesService.ts` |
| `getNearbyHeroesForDungeon(dungeonId, mapX, mapY, …)` | `server/src/services/dungeonNearbyHeroesService.ts` |
| `getMapAroundAt(...)` / `getCharacterMapStateForUser` | `server/src/services/mapAroundService.ts`, `charMapStateService.ts` |

Фільтри nearby heroes (world): bbox → `MAP_NEARBY_HERO_RADIUS` → online (`isCharacterOnlineNow`) → alive → не safe zone → не pending defeat.

### Сервер: nearby mobs

| Функція | Файл |
|---------|------|
| `buildMapNearbySpawnViews(worldX, worldY, mobSpawnHpJson)` | `server/src/services/mapNearbySpawnsQuery.ts` |
| `startBattleInTx` distance check | `server/src/services/battleServiceSession.ts` |

### Клієнт: map.html

| Елемент | Файл | Радіус |
|---------|------|--------|
| `#map-view-radius` (жовте) | `server/public/map.html`, `map.js` | `MAP_NEARBY_LIST_RADIUS` (26000) |
| `#map-hero-view-radius` (червоне) | `server/public/map.html`, `map.js` | `MAP_NEARBY_HERO_RADIUS` (12000) |
| `placeViewRadius(...)` | `server/public/map.js` | — |
| Стилі кіл | `server/public/css/styles-partials/part-02.css` | `.l2-map-view-radius`, `.l2-map-hero-view-radius` |

Дубльовані числа на клієнті (`map.js` рядки 7–11) — лише для малювання; **сервер — єдине джерело істини** для party logic.

### Online

| Функція | TTL |
|---------|-----|
| `isCharacterOnlineNow(characterId)` | `ONLINE_TTL_MS = 10 min` у `onlinePresenceService.ts` |

---

## 2. Новий canonical helper (Етап A, без дубляжу формули)

Розширити **`server/src/domain/mapNearbyRadius.ts`** (або barrel `mapPlayfieldRadius.ts`):

```typescript
// re-export MAP_NEARBY_HERO_RADIUS, BATTLE_RANGE з існуючих модулів

/** Червоний player-radius — те саме, що getNearbyHeroesForMap. */
export function isWithinPlayerVisibilityRadius(
  viewerX: number, viewerY: number,
  targetX: number, targetY: number
): boolean {
  return isWithinMapNearbyHeroRadius(viewerX, viewerY, targetX, targetY);
}

/** Жовтий mob-radius для join/attack — те саме, що startBattleInTx. */
export function isWithinMobBattleRange(
  playerX: number, playerY: number,
  mobWorldX: number, mobWorldY: number
): boolean {
  return isWithinMapNearbyHeroRadius(
    playerX, playerY, mobWorldX, mobWorldY, BATTLE_RANGE
  );
}

/** v1: обидва на світовій карті (не в dungeon). */
export function isSameWorldPlayfield(
  a: { dungeonStateJson: unknown },
  b: { dungeonStateJson: unknown }
): boolean {
  return parseDungeonStateJson(a.dungeonStateJson) == null
      && parseDungeonStateJson(b.dungeonStateJson) == null;
}

/** Eligibility / nearby party member від killer. */
export function isPartyMemberNearbyForReward(
  killer: ResolvedMapPosition,
  member: ResolvedMapPosition
): boolean {
  if (!isSameWorldPlayfield(killer.row, member.row)) return false;
  return isWithinPlayerVisibilityRadius(
    killer.worldX, killer.worldY,
    member.worldX, member.worldY
  );
}
```

`ResolvedMapPosition` = `{ row, worldX, worldY }` після `resolveMapMovement`.

**Заборонено:** копіювати `dx*dx+dy*dy` у party-сервісах; імпорт лише з canonical helper.

---

## 3. Розподіл ролей радіусів

### Жовтий (`BATTLE_RANGE` на сервері)

- які моби в `inBattleRange` у списку;
- старт party battle / join session;
- виконання battle action по цьому мобу;
- кнопка «Приєднатися» (додаткова перевірка для кожного member).

### Червоний (`MAP_NEARBY_HERO_RADIUS`)

- показ членів паті поруч на карті (через існуючі nearby heroes + badge);
- `nearby: true/false` у battle sync;
- live HP/MP у party column (лише `nearby`);
- eligibility EXP/SP/Adena;
- «У локації з вами: Name».

**Не використовувати `battleJson.spawnId` як заміну player proximity.** Персонаж може стояти поруч без активного `battleJson`.

---

## 4. Правило «член паті поруч»

Член паті **nearby**, якщо одночасно:

1. `PartyMember` існує;
2. `isSameWorldPlayfield(killer, member)` (v1);
3. `isWithinPlayerVisibilityRadius(killer, member)` — та сама функція, що `getNearbyHeroesForMap`;
4. `isCharacterOnlineNow(member.id)`.

### UI статуси (battle sync `members[]`)

| Стан | Вигляд |
|------|--------|
| nearby + online + alive | активний |
| PartyMember, але поза червоним радіусом | сірий, «Далеко» |
| offline | «Не в мережі» |
| hp ≤ 0 | «Загинув» |

---

## 5. Reward eligibility (фінал)

На момент lethal action (snapshot **всередині** victory tx):

1. досі `PartyMember` цієї Party;
2. `isSameWorldPlayfield(killer, member)`;
3. `isPartyMemberNearbyForReward(killer, member)` — червоний радіус **від killer**;
4. online;
5. alive (`hp > 0`), без `pvePendingDefeat`;
6. не kick/leave **до** snapshot eligibility.

**Не вимагати `lastDamagingHitAtMs` / `totalDamage`.** Healer/buffer поруч отримує рівну частку.

`totalDamage` у `PartyBattleParticipant` — лише статистика.

Leave/kick **після** зафіксованого `eligibleIds[]` не ламає reward tx.

---

## 6. Join vs reward (жовтий + червоний)

| Дія | Перевірка |
|-----|-----------|
| Бачить party battle / sync | PartyMember + (опційно) session active |
| `nearby` у UI | червоний радіус |
| «Приєднатися» / атака | **додатково** `isWithinMobBattleRange(member, mobWorldX, mobWorldY)` |
| Reward | червоний радіус від killer (§5) |

Моб поза жовтим радіусом member → «Підійдіть ближче до монстра», без телепорту.

---

## 7. PartyBattleSession — Prisma (фінал, Етап A)

```prisma
enum PartyBattleSessionState {
  active
  victory
  ended
}

model PartyBattleSession {
  id                     String                   @id @default(uuid())
  partyId                String?
  originPartyId          String
  activePartyKey         String?                  @unique
  spawnId                String
  canonicalMobTemplateId String
  mobWorldX              Int
  mobWorldY              Int
  mobHp                  Int
  mobMaxHp               Int
  battleVersion          Int                      @default(1)
  state                  PartyBattleSessionState  @default(active)
  lastActivityAt         DateTime                 @default(now())
  createdAt              DateTime                 @default(now())
  updatedAt              DateTime                 @updatedAt
  endedAt                DateTime?
  endReason              String?                  // victory | timeout | no_participants | party_disbanded

  party        Party? @relation(..., onDelete: SetNull)
  participants PartyBattleParticipant[]
  rewards      PartyKillReward[]

  @@index([originPartyId])
  @@index([spawnId, state])
  @@index([lastActivityAt, state])
}

model PartyBattleParticipant {
  partyBattleId       String
  characterId         String
  joinedAt            DateTime  @default(now())
  lastActivityAt      DateTime  @default(now())
  lastDamagingHitAtMs BigInt?
  totalDamage         Int       @default(0)
  active              Boolean   @default(true)
  leftAt              DateTime?
  // без defeated — dead state через Character.hp (Етап C)
  @@id([partyBattleId, characterId])
}

model PartyKillReward {
  partyBattleId String
  characterId   String
  expGain / spGain / adenaGain
  @@id([partyBattleId, characterId])
  // FK → PartyBattleSession.id (не killEventId)
}
```

**FK при disband Party:** `partyId` → `SetNull`; `originPartyId` і session/rewards **зберігаються**.  
Migration: `20260718230000_party_battle_session`.

**Lifecycle `activePartyKey`:**

- create session: `activePartyKey = partyId`, `mobHp = mobMaxHp`;
- end (victory/abandoned): `activePartyKey = null`, `state = ended|victory`, `endedAt = now`.

Одна session v1 = один mob = одне HP = одна victory transaction.

---

## 8. Character.battleJson

Додати лише pointer:

```typescript
partyBattleId?: string;
```

| Режим | Canonical mobHp |
|-------|-----------------|
| Solo PvE | `Character.battleJson.mobHp` (як зараз) |
| Party PvE | `PartyBattleSession.mobHp`; `battleJson.mobHp` — **mirror** для UI/логу |
| RB/epic | `WorldBossSession` — без змін |
| PvP | без змін |

---

## 9. Старт / join party battle

Лише **звичайний world PvE** (`!isSharedWorldBossKind`, не PvP).

1. Lock `Party` FOR UPDATE.
2. Active session для `partyId`:
   - **немає** → create session, `mobHp = mobMaxHp`, перший participant;
   - **той самий `spawnId`** → join (якщо жовтий радіус OK);
   - **інший spawnId** → `party_battle_wrong_spawn` («Паті вже б’ється з іншим монстром»).

**Не конвертувати активний solo battle у party mid-fight.** Гравець має завершити/leave solo, потім новий party start з **повним HP** моба.

---

## 10. Attack flow (без battleVersion gate на атаку)

**Не робити** `assert session.battleVersion === clientPartyBattleVersion` для відхилення атак.

Правильний flow:

1. Lock `PartyBattleSession` FOR UPDATE.
2. Read актуальний `mobHp`.
3. Apply damage, clamp `mobHp >= 0`.
4. Update participant stats (`totalDamage`, optional `lastDamagingHitAtMs`).
5. `battleVersion++`.
6. Mirror `mobHp` у actor `battleJson`.
7. Commit.

`battleVersion` — для sync delta / stale client poll, **не** для блокування атак інших учасників.

Duplicate action одного character — `expectedRevision` / inFlight на клієнті.

**Whirlwind / nearby extra mob kills — вимкнено** у party battle v1.

---

## 11. Reward split (v1)

`eligibleMembers` = snapshot §5.

```
base = floor(total / eligibleCount)
remainder → +1 у stable order, killer first, потім characterId asc
```

**Killer отримує:** items, kill-credit, daily quest kill, mob kill stats, quest progress.

**Інші eligible:** лише EXP, SP, Adena, level-up, `revision++`. Без побічних daily/quest/mobsKilled mutation.

Idempotency: `PartyKillReward @@id([partyBattleId, characterId])` — FK на `PartyBattleSession.id`, **не** nullable `killEventId`.

---

## 12. Defeat / вихід з радіуса

| Подія | Ефект |
|-------|--------|
| Participant dead | `defeated=true`; інші продовжують; no reward якщо мертвий на kill; після revive може join знову |
| Вихід за **червоний** радіус | лишається PartyMember; UI «Далеко»; no reward якщо не повернувся до kill |
| Вихід за **жовтий** mob-radius | не атакує; reward eligibility все одно по **червоному** (v1) |
| Leave/kick до lethal | excluded з eligibility snapshot |

---

## 13. Session cleanup

Якщо немає active participants **або** `lastActivityAt` старше **2 хв**:

- `state = ended`;
- `activePartyKey = null`;
- `endReason = abandoned_timeout | abandoned_no_participants`;
- reward **не** видавати;
- stale `partyBattleId` у `Character.battleJson` очищати на battle sync/resync.

---

## 14. Lock order (Етап B — audit перед інтеграцією)

> **Етап A:** session CRUD lock-ить **лише `PartyBattleSession`** у межах своєї tx.  
> **Не** інтегрувати універсальний lock helper у `battleService` / `performBattleActionInTx`.

Перед Етапом B окремо зафіксувати поточний порядок у:

- `performBattleActionInTx` (Character lock? → mutateCharacterWithRevision);
- world boss / victory tx (Session → Character recipients);
- майбутній party action/victory.

**Цільовий порядок (після audit):**

```
Party → PartyBattleSession → Character[] (sorted id, лише reward tx)
```

**Заборонено:** tx A `Character→Session`, tx B `Session→Character` (deadlock risk).

---

## 15. Solo / RB / PvP compatibility

| Режим | Поведінка |
|-------|-----------|
| Solo PvE | без змін; без `partyBattleId` |
| RB/epic | `WorldBossSession`; **не** PartyBattleSession |
| PvP | без змін |
| Party + RB | party members fight RB окремо через існуючий RB flow |

---

## 16. Battle sync (lightweight)

```typescript
partyBattle?: {
  partyBattleId: string;
  battleVersion: number;
  spawnId: string;
  mobHp: number;
  mobMaxHp: number;
  members: Array<{
    characterId: string;
    name: string;
    level: number;
    profession: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    online: boolean;
    nearby: boolean;       // MAP_NEARBY_HERO_RADIUS від viewer
    dead: boolean;
    isLeader: boolean;
    activeInBattle: boolean;
    buffIcons: BattleBuffIcon[];
    buffOverflow: number;
  }>;
};
```

Viewer **не** дублюється у `members[]`. HP/MP live — лише для `nearby`.

---

## 17. Map / location UI (Етап D)

- Party member у червоному радіусі → існуючий nearby hero marker + badge «Паті» / колір ніка.
- Під картою: «У локації з вами: Name1, Name2» — лише nearby + same playfield.
- «Паті б’ється з Mob» + «Приєднатися» з перевіркою жовтого радіусу.

Файли: `map.js`, `mapAroundService.ts` / `charMapStateService.ts`, CSS `part-02.css`.

---

## 18. Victory UI

**Killer:** «Нагороду поділено між N учасниками паті» + personal share.

**Інші eligible:** «Паті перемогло монстра» + share через sync/notification.

---

## 19. Етапи реалізації

### Етап A — foundation (без battle routes)

- цей design note ✓
- `mapNearbyRadius.ts` helpers
- Prisma models + migration
- `partyBattleSessionService.ts`: CRUD, lock, timeout, idempotency table
- unit tests: split, activePartyKey, cleanup

**Файли:** `schema.prisma`, `migrations/`, `domain/mapNearbyRadius.ts`, `domain/partyBattleReward.ts`, `services/party/partyBattleSessionService.ts`, `scripts/party-battle-session-smoke.ts`

### Етап B — shared mobHp (без reward)

- `startBattleInTx` / join hooks
- `performBattleAction` party branch (lock session, shared HP, no version gate)
- `battleServiceSync` + `partyBattle` DTO
- simultaneous attack tests
- solo/RB/PvP regression

**Файли:** `battleServiceSession.ts`, `battleServicePerformBattleAction.ts`, `battleServiceSync.ts`, `battleServiceDeltaTypes.ts`, `party/partyBattleSyncService.ts`

### Етап C — reward

- `partyBattleVictoryService.ts` atomic split
- killer-only items/quests
- rollback + idempotency tests

**Файли:** `partyBattleVictoryService.ts`, `battleServicePerformBattleAction.outcome.ts`

### Етап D — UI

- `battle.html` / `battle.js` party column
- map markers + «У локації з вами»
- victory notifications

**Файли:** `battle.html`, `battle.js`, `styles-partials/part-03.css`, `map.js`

### Gate після кожного етапу

```bash
npm run build
npm run check:public-js
# + party-battle smoke для відповідного етапу
```

---

## 20. Тести (acceptance)

| # | Сценарій |
|---|----------|
| 1 | 2 nearby eligible → 50/50 EXP |
| 2 | 5 nearby → рівні частки |
| 3 | Remainder не губиться (1001/2 → 501+500) |
| 4 | Member поза **червоним** радіусом → no reward |
| 5 | Member без damage → **отримує** reward (healer) |
| 6 | Один shared mobHp для всіх учасників |
| 7 | Concurrent attacks → mobHp не < 0 |
| 8 | Два lethal requests → одна нагорода (PartyKillReward) |
| 9 | Leave/kick до lethal → excluded |
| 10 | Leave після eligibility snapshot → tx OK |
| 11 | Level-up двох учасників, revision++ кожного |
| 12 | Items лише killer |
| 13 | Rollback одного recipient → rollback усіх |
| 14 | Victory → session ended, activePartyKey=null |
| 15 | Join потребує жовтий радіус; reward — червоний |
| 16 | Solo mid-fight не конвертується в party |
| 17 | Timeout 2 min → abandoned, no reward |
| 18 | Whirlwind extras вимкнено в party battle |

---

## 21. Свідомо не включено

- окремий `PARTY_RANGE`;
- `lastDamagingHitAtMs` як умова reward;
- battleVersion gate на атаку;
- party battle у dungeon / RB / PvP;
- item split між party;
- конвертація solo → party mid-fight.

---

## Changelog design note

- + reuse `MAP_NEARBY_HERO_RADIUS` / `BATTLE_RANGE` замість нових радіусів
- + eligibility без damage requirement; killer-centered red radius
- + `activePartyKey` замість partial unique index
- + `PartyKillReward` FK на session.id
- + `partyId SetNull` + `originPartyId` для history after disband
- + legacy yellow mismatch 26k UI vs 28k server documented
- − `killEventId`; − battleVersion attack gate; − damage TTL 60s; − participant.defeated

---

## 22. Етап A — реалізовано (2026-07-18)

| Артефакт | Шлях |
|----------|------|
| Radius helpers | `server/src/domain/mapNearbyRadius.ts` |
| splitEvenly | `server/src/domain/partyBattleReward.ts` |
| Constants | `server/src/domain/partyBattleSessionConstants.ts` |
| Session CRUD | `server/src/services/party/partyBattleSessionService.ts` |
| Migration | `server/prisma/migrations/20260718230000_party_battle_session/` |
| Tests | `npm run test:party-battle-stage-a` |

**Не змінено:** battle routes, `battleJson`, map UI, reward writes, `performBattleActionInTx`.
