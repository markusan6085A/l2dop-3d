# PartyBattleSession — design note (фаза 2+)

> **Не реалізовано у фазі 1.** Документ описує майбутній спільний PvE-бій паті.

## Проблема поточного PvE

У звичайному PvE `mobHp` зберігається в `Character.battleJson` **окремо для кожного гравця**.
Персональний kill одного учасника **не створює спільний бій** і не дозволяє безпечно ділити нагороду
після `persistBattleVictoryInTx` без архітектурної зміни.

## PartyBattleSession (пропозиція)

Окрема сутність (таблиця або JSON-сесія на кшталт `WorldBossSession`), яка об’єднує паті в один бій:

| Поле | Призначення |
|------|-------------|
| `battleId` | UUID спільного instance бою |
| `partyId` | FK на `Party` |
| `spawnId` | Спавн моба на карті |
| `mobHp` / `mobMaxHp` | **Спільне** HP (як у RB) |
| `battleVersion` | Монотонний лічильник змін бою (не `Character.revision`) |
| `killEventId` | Idempotency key одного kill (захист від double reward) |
| `participants` | Map `characterId → { joinedAtMs, lastDamageAtMs, totalDamageDealt? }` |
| `state` | `active` \| `ended` |
| `endedAt` | Час завершення |

## Відмінності від WorldBossSession

- Прив’язка до `partyId`, не глобальний spawn для всіх
- Учасники — лише члени паті, що пройшли eligibility
- Reward split (фаза 2) через `PartyKillReward` + спільний `rollKillLoot` один раз на `killEventId`

## Eligibility (нагадування для фази 2)

- `PartyMember` + same `spawnId` + active `PartyBattleSession`
- `lastDamageAtMs` у межах TTL
- `BATTLE_RANGE`, alive, не `pvePendingDefeat`
- RB: перетин з `isWorldBossParticipantValid`

## Інтеграція з battle sync

Легкий delta (окремо від full character snapshots):

```typescript
partyBattle?: {
  battleId: string;
  battleVersion: number;
  spawnId: string;
  mobHp: number;
  mobMaxHp: number;
};
```

## Свідомо не включено у фазу 1

- `PartyKillReward`
- зміни `persistBattleVictoryInTx` / `resolveWorldBossVictoryInTx`
- battle UI (кнопка «Паті», HP/MP bars учасників)
- `lastDamagingHitAtMs` у `battleJson` (може знадобитися до PartyBattleSession)
