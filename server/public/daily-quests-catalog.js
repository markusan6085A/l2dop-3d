/**
 * Каталог щоденних завдань (статичні описи; прогрес — з snapshot/API пізніше).
 *
 * Додавай завдання в `tasks`:
 * - id — унікальний ключ
 * - titleUk — назва
 * - descriptionUk — короткий опис для гравця
 * - goalUk — що треба зробити (текст)
 * - rewardUk — нагорода (текст, поки без серверної видачі)
 */
(function (global) {
  global.L2DailyQuestsCatalog = {
    tasks: [
      {
        id: 'hunt_start_500',
        titleUk: 'Початок полювання',
        descriptionUk: 'Убий 500 монстрів.',
        goalUk: 'Монстрів вбито: {progress}',
        rewardUk: 'Adena 100 000 + EXP 60 000',
        need: 500,
      },
      {
        id: 'strong_enemy_20',
        titleUk: 'Сильний противник',
        descriptionUk: 'Убий 1 рейд-боса.',
        goalUk: 'Рейд-босів вбито: {progress}',
        rewardUk: 'EXP 30 000 + SP 50 000',
        need: 1,
      },
      {
        id: 'raid_boss_participate',
        titleUk: 'Мисливець на рейд-босів',
        descriptionUk: 'Візьми участь у вбивстві Raid Boss.',
        goalUk: 'Участь у вбивстві Raid Boss: {have} / {need}',
        rewardUk: 'Adena 50 000',
        need: 1,
      },
      {
        id: 'skill_master_50',
        titleUk: 'Майстер умінь',
        descriptionUk: 'Використай активні вміння 50 разів у бою.',
        goalUk: 'Активних умінь використано: {have} / {need}',
        rewardUk: 'SP 20 000 + MP-зілля 50 шт',
        need: 50,
      },
      {
        id: 'daily_playtime_2h',
        titleUk: 'Щоденна активність',
        descriptionUk: 'Проведи у грі 2 години.',
        goalUk: 'Час у грі: {progress}',
        rewardUk: '1 Coin of Luck',
        need: 7200,
      },
      {
        id: 'chat_social_10',
        titleUk: 'Товариський',
        descriptionUk: 'Напиши в чаті 10 повідомлень.',
        goalUk: 'Повідомлень у чаті: {have} / {need}',
        rewardUk: 'Adena 15 000',
        need: 10,
      },
      {
        id: 'damage_dealer_500k',
        titleUk: 'Завдає шкоди',
        descriptionUk: 'Нанеси 500 000 урону.',
        goalUk: 'Урон нанесено: {have} / {need}',
        rewardUk: '1 Coin of Luck',
        need: 500000,
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
