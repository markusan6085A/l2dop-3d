/**
 * Словник інтерфейсу uk / ru. Ключ: L2.UI[key] = { uk, ru }; текст: L2.tr('ключ').
 * Статичний HTML: data-i18n="ключ" (після завантаження викликається applyPageI18n).
 */
(function (global) {
  var L2 = global.L2 || (global.L2 = {});

  L2.UI = {
    tagline: {
      uk: 'Онлайн гра L2WAP',
      ru: 'Онлайн игра L2WAP',
    },
    page_home_title: { uk: 'Головна — L2WAP', ru: 'Главная — L2WAP' },
    page_register_title: { uk: 'Реєстрація — L2WAP', ru: 'Регистрация — L2WAP' },
    auth_home_head: { uk: 'Онлайн гра L2WAP', ru: 'Онлайн игра L2WAP' },
    auth_brand_name: { uk: 'L2WAP', ru: 'L2WAP' },
    aria_header: { uk: 'Заголовок', ru: 'Заголовок' },

    stub_later: {
      uk: 'заглушка, з’явиться пізніше.',
      ru: 'заглушка, скоро будет.',
    },

    /** Навігація верх */
    nav_chat: { uk: 'Чат', ru: 'Чат' },
    nav_chat_title: { uk: 'Чат', ru: 'Чат' },
    nav_pers: { uk: 'Перс', ru: 'Перс' },
    nav_pers_title: {
      uk: 'Персонаж · екіп / інвентар',
      ru: 'Персонаж · экип / инвентарь',
    },
    nav_map: { uk: 'Карта', ru: 'Карта' },
    nav_map_title: { uk: 'Карта', ru: 'Карта' },
    /** Підпис під іконкою на верхній сітці (коротко «Мапа»). */
    nav_top_map: { uk: 'Мапа', ru: 'Карта' },
    nav_top_map_title: { uk: 'Карта світу', ru: 'Карта мира' },
    nav_top_donate: { uk: 'Донат', ru: 'Донат' },
    nav_quests: { uk: 'Квести', ru: 'Квесты' },
    nav_quests_title: { uk: 'Квести', ru: 'Квесты' },
    nav_top_strip_aria: {
      uk: 'Короткий стан персонажа',
      ru: 'Кратко: персонаж',
    },
    nav_top_icons_aria: {
      uk: 'Верхні кнопки: чат, перс, мапа, донат, квести, клан, ринок',
      ru: 'Верхние кнопки: чат, перс, карта, донат, квесты, клан, рынок',
    },
    nav_donate_label: { uk: 'ДОНАТ', ru: 'ДОНАТ' },
    nav_donate_title: { uk: 'Донат', ru: 'Донат' },
    nav_quest: { uk: 'Квест', ru: 'Квест' },
    nav_quest_title: { uk: 'Квест', ru: 'Квест' },
    nav_clan: { uk: 'Клан', ru: 'Клан' },
    nav_clan_title: { uk: 'Клан', ru: 'Клан' },
    nav_market: { uk: 'Ринок', ru: 'Рынок' },
    nav_market_title: { uk: 'Ринок', ru: 'Рынок' },

    nav_profile: { uk: 'Персонаж', ru: 'Персонаж' },
    nav_profile_title: {
      uk: 'Персонаж · стати й характеристики',
      ru: 'Персонаж · статы и характеристики',
    },
    nav_magic: { uk: 'Магія', ru: 'Магия' },
    nav_magic_title: {
      uk: 'Магія · магістри та навчання скілів',
      ru: 'Магия · магистры и изучение скиллов',
    },
    nav_town: { uk: 'Город', ru: 'Город' },
    nav_town_title: { uk: 'Город', ru: 'Город' },
    nav_mail: { uk: 'Пошта', ru: 'Почта' },
    nav_mail_title: { uk: 'Пошта', ru: 'Почта' },
    nav_mammon: { uk: 'Маммон', ru: 'Маммон' },
    nav_mammon_title: { uk: 'Маммон / Rift', ru: 'Маммон / Rift' },
    page_mammon_title: { uk: 'Маммон — L2WAP', ru: 'Маммон — L2WAP' },
    mammon_section_aria: { uk: 'Маммон', ru: 'Маммон' },
    page_clans_title: { uk: 'Клани — L2WAP', ru: 'Кланы — L2WAP' },
    clans_section_aria: { uk: 'Клани', ru: 'Кланы' },
    clans_back_city: { uk: '<< Назад до міста', ru: '<< Назад в город' },
    clans_back_list: { uk: '<< Назад до кланів', ru: '<< Назад к кланам' },
    clans_intro: {
      uk: 'Створи власний клан, збери під своїм прапором відданих воїнів і впиши його ім’я в історію світу. Разом захоплюйте замки, перемагайте могутніх ворогів і ведіть свій клан до слави.',
      ru: 'Создай собственный клан, собери под своим знаменем верных воинов и впиши его имя в историю мира. Вместе захватывайте замки, побеждайте могучих врагов и веди свой клан к славе.',
    },
    clans_btn_create: { uk: 'Створити Клан', ru: 'Создать клан' },
    clans_btn_my: { uk: 'Мій клан', ru: 'Мой клан' },
    page_clans_create_title: { uk: 'Створити клан — L2WAP', ru: 'Создать клан — L2WAP' },
    clans_create_section_aria: { uk: 'Створити клан', ru: 'Создать клан' },
    clans_create_rules_title: { uk: 'Умови створення клану', ru: 'Условия создания клана' },
    clans_create_rule_level: { uk: 'Рівень персонажа — не нижче 20.', ru: 'Уровень персонажа — не ниже 20.' },
    clans_create_rule_cost: { uk: 'Вартість створення — 1 Adena.', ru: 'Стоимость создания — 1 Adena.' },
    clans_create_rule_not_in_clan: {
      uk: 'Персонаж не повинен перебувати в іншому клані.',
      ru: 'Персонаж не должен состоять в другом клане.',
    },
    clans_create_rule_name_len: {
      uk: 'Назва клану має бути унікальною та містити від 3 до 16 символів.',
      ru: 'Название клана должно быть уникальным и содержать от 3 до 16 символов.',
    },
    clans_create_rule_name_chars: {
      uk: 'Заборонено використовувати образливі назви та спеціальні символи.',
      ru: 'Запрещено использовать оскорбительные названия и спецсимволы.',
    },
    clans_create_name_label: { uk: 'Назва клану', ru: 'Название клана' },
    clans_create_name_ph: { uk: 'Введи назву', ru: 'Введи название' },
    clans_create_submit: { uk: 'Створити клан!', ru: 'Создать клан!' },
    page_clan_my_title: { uk: 'Мій клан — L2WAP', ru: 'Мой клан — L2WAP' },
    clan_my_section_aria: { uk: 'Мій клан', ru: 'Мой клан' },
    page_ancient_trader_title: { uk: 'Ancient Trader — L2WAP', ru: 'Ancient Trader — L2WAP' },
    ancient_trader_section_aria: { uk: 'Ancient Trader', ru: 'Ancient Trader' },
    city_btn_ancient_trader: { uk: 'Ancient Trader', ru: 'Ancient Trader' },
    nav_menu: { uk: 'Меню', ru: 'Меню' },
    nav_menu_title: { uk: 'Меню', ru: 'Меню' },
    nav_inventory: { uk: 'Інвентар', ru: 'Инвентарь' },
    nav_inventory_title: { uk: 'Інвентар', ru: 'Инвентарь' },
    nav_options: { uk: 'Опції', ru: 'Опции' },
    nav_options_title: { uk: 'Опції', ru: 'Опции' },

    nav_top_aria: { uk: 'Верхнє меню', ru: 'Верхнее меню' },
    nav_bottom_aria: { uk: 'Нижнє меню', ru: 'Нижнее меню' },
    foot_aria: { uk: 'Посилання', ru: 'Ссылки' },
    foot_row2_aria: { uk: 'Швидкі посилання', ru: 'Быстрые ссылки' },

    foot_forum: { uk: 'Форум', ru: 'Форум' },
    foot_news: { uk: 'Новини', ru: 'Новости' },
    foot_donate: { uk: 'ДОНАТ', ru: 'ДОНАТ' },
    foot_gm_shop: { uk: 'GM SHOP', ru: 'GM SHOP' },
    foot_support: { uk: 'Підтримка', ru: 'Поддержка' },
    foot_rules: { uk: 'Правила', ru: 'Правила' },

    /** Міста (екран міста / телепорт) */
    cityid_floran_village: { uk: 'Селище Флоран', ru: 'Деревня Флоран' },
    cityid_gludin_village: { uk: 'Селище Глудін', ru: 'Деревня Глудин' },
    cityid_hunters_village: { uk: 'Селище мисливців', ru: 'Деревня охотников' },
    cityid_l2dop_heine: { uk: 'Гейне', ru: 'Хейн' },
    cityid_l2dop_rune: { uk: 'Рун (Rune Township)', ru: 'Рун (Rune Township)' },
    cityid_l2dop_aden: { uk: 'Місто Аден', ru: 'Город Аден' },
    cityid_l2dop_dion: { uk: 'Місто Діон', ru: 'Город Дион' },
    cityid_l2dop_giran: { uk: 'Місто Гіран', ru: 'Город Гиран' },
    cityid_l2dop_gludio: { uk: 'Місто Глудіо', ru: 'Город Глудио' },
    cityid_l2dop_goddard: { uk: 'Місто Годдарт', ru: 'Город Годдард' },
    cityid_l2dop_oren: { uk: 'Місто Орен', ru: 'Город Орен' },
    cityid_l2dop_schuttgart: { uk: 'Місто Штутгарт', ru: 'Город Штутгарт' },
    cityid_ancient_tomb_fields: {
      uk: 'Поля стародавніх могил',
      ru: 'Поля древних могил',
    },

    /** API / спільні помилки */
    api_unknown: { uk: 'Невідома помилка.', ru: 'Неизвестная ошибка.' },
    api_invalid_input: { uk: 'Некоректні дані.', ru: 'Некорректные данные.' },
    api_forbidden: {
      uk: 'Немає доступу або невірні облікові дані.',
      ru: 'Нет доступа или неверные учётные данные.',
    },
    api_unauthorized: { uk: 'Потрібна авторизація.', ru: 'Нужна авторизация.' },
    api_revision_conflict: {
      uk: 'Конфлікт версії даних — оновлено з сервера.',
      ru: 'Конфликт версии данных — обновлено с сервера.',
    },

    login_fill: {
      uk: 'Введіть логін і пароль.',
      ru: 'Введите логин и пароль.',
    },
    login_err_prefix: { uk: 'Помилка: ', ru: 'Ошибка: ' },

    /** Місто */
    city_need_login: {
      uk: 'Потрібен вхід. Перейди на головну.',
      ru: 'Нужен вход. Перейдите на главную.',
    },
    city_loading: { uk: 'Завантаження…', ru: 'Загрузка…' },
    city_load_hero_fail: {
      uk: 'Не вдалося завантажити героя.',
      ru: 'Не удалось загрузить персонажа.',
    },
    city_aria_services: { uk: 'Місто', ru: 'Город' },
    page_city_title: { uk: 'Місто — L2WAP', ru: 'Город — L2WAP' },
    page_warehouse_title: { uk: 'Склад — L2WAP', ru: 'Склад — L2WAP' },
    page_market_title: { uk: 'Ринок — L2WAP', ru: 'Рынок — L2WAP' },
    warehouse_intro: {
      uk: 'Вітаю! Тут можна зберігати речі, щоб інвентар не переповнювався.',
      ru: 'Привет! Здесь можно хранить вещи, чтобы инвентарь не переполнялся.',
    },

    city_btn_trade: { uk: 'Торгова площа', ru: 'Торговая площадь' },
    city_link_gm_shop: { uk: 'Магазин вищей', ru: 'Магазин вищей' },
    city_btn_tvt: { uk: 'TvT менеджер', ru: 'TvT менеджер' },
    city_btn_buffer: { uk: 'Бафер', ru: 'Бафер' },
    city_btn_sellers: { uk: 'Продавці', ru: 'Продавцы' },
    city_link_teleport: { uk: 'Телепорт', ru: 'Телепорт' },
    city_btn_warehouse: { uk: 'Склад', ru: 'Склад' },
    city_link_skills: { uk: 'Вивчити навички', ru: 'Изучить навыки' },
    city_link_magisters: { uk: 'Магістри', ru: 'Магистры' },
    city_btn_blacksmith: { uk: 'Кузнеці', ru: 'Кузнецы' },
    city_btn_mammon_npc: { uk: 'Торговець Маммон', ru: 'Торговец Маммон' },
    city_btn_olympiad: { uk: 'Менеджер Олімпіади', ru: 'Менеджер Олимпиады' },
    city_btn_supremacy: { uk: 'Верховенство', ru: 'Верховенство' },
    city_btn_residents: { uk: 'Усі мешканці', ru: 'Все жители' },
    city_btn_arena_pvp: { uk: 'Арена PVP', ru: 'Арена PVP' },
    city_btn_buffer_statue: { uk: 'Магічна статуя', ru: 'Магическая статуя' },
    city_link_gm_shop_items: { uk: 'Магазин речей', ru: 'Магазин вещей' },
    city_link_magisters_guild: { uk: 'Гільдія магів', ru: 'Гильдия магов' },
    city_btn_fisher: { uk: 'Рибалка', ru: 'Рыбак' },
    city_btn_manor: { uk: 'Манор', ru: 'Манор' },
    city_btn_seven_seals: { uk: '7 Печатей', ru: '7 Печатей' },
    city_btn_olympiad_short: { uk: 'Олімпіада', ru: 'Олимпиада' },
    city_btn_brave_hunter: { uk: 'Відважний мисливець', ru: 'Отважный охотник' },
    city_btn_clans: { uk: 'Клани', ru: 'Кланы' },

    /** Профіль */
    pers_need_login: {
      uk: 'Потрібен вхід. Перейди на головну.',
      ru: 'Нужен вход. Перейдите на главную.',
    },
    pers_load_fail: {
      uk: 'Не вдалося завантажити персонажа.',
      ru: 'Не удалось загрузить персонажа.',
    },
    pers_bad_json: {
      uk: 'Некоректна відповідь сервера (немає даних героя).',
      ru: 'Некорректный ответ сервера (нет данных героя).',
    },
    pers_render_err: {
      uk: 'Не вдалося показати профіль. Онови сторінку (F5) або перевір консоль.',
      ru: 'Не удалось показать профиль. Обновите страницу (F5) или проверьте консоль.',
    },

    /** Бій — UI */
    battle_title: { uk: 'Бій — L2WAP', ru: 'Бой — L2WAP' },
    battle_lbl_cp: { uk: 'CP', ru: 'CP' },
    battle_lbl_hp: { uk: 'HP', ru: 'HP' },
    battle_lbl_mp: { uk: 'MP', ru: 'MP' },
    battle_lbl_exp: { uk: 'Exp', ru: 'Exp' },

    magisters_load_town_fail: {
      uk: 'Не вдалося завантажити список міста.',
      ru: 'Не удалось загрузить список города.',
    },
    magisters_need_login: {
      uk: 'Потрібен вхід. Перейди на головну.',
      ru: 'Нужен вход. Перейдите на главную.',
    },
    magisters_empty_trainers: {
      uk:
        'У цьому місті ще немає записаних наставників з умінь. Пізніше додамо з l2dop.',
      ru:
        'В этом городе пока нет записанных наставников умений. Позже добавим из l2dop.',
    },
    battle_buffs_aria: {
      uk: 'Активні ефекти на персонажі',
      ru: 'Активные эффекты на персонаже',
    },
    battle_enemy_aria: { uk: 'Ворог', ru: 'Враг' },
    battle_log_title: { uk: 'Лог бою', ru: 'Лог боя' },
    battle_back_map: { uk: 'Назад на карту', ru: 'Назад на карту' },
    battle_victory_aria: { uk: 'Перемога', ru: 'Победа' },
    battle_victory_shout: {
      uk: 'Ти переміг монстра!',
      ru: 'Ты победил монстра!',
    },
    battle_continue: { uk: 'Продовжити', ru: 'Продолжить' },
    battle_hunt_more: { uk: 'Полювати далі', ru: 'Охотиться дальше' },
    battle_defeat_aria: { uk: 'Поразка', ru: 'Поражение' },
    battle_defeat_shout: {
      uk: 'Тебе переміг монстр!',
      ru: 'Тебя победил монстр!',
    },
    battle_defeat_tocity: {
      uk: 'Повернутися в місто',
      ru: 'Вернуться в город',
    },
    battle_err_no_mob: {
      uk: 'Не вказано моба. Перейди з карти.',
      ru: 'Не указан моб. Перейдите с карты.',
    },
    battle_need_login: { uk: 'Потрібен вхід.', ru: 'Нужен вход.' },
    battle_err_load_char: {
      uk: 'Не вдалося завантажити персонажа.',
      ru: 'Не удалось загрузить персонажа.',
    },
    battle_err_state: {
      uk: 'Не вдалося отримати стан бою.',
      ru: 'Не удалось получить состояние боя.',
    },
    battle_err_start: {
      uk: 'Не вдалося розпочати бій.',
      ru: 'Не удалось начать бой.',
    },
    battle_toast_network: {
      uk: 'Збій мережі або сервера.',
      ru: 'Сбой сети или сервера.',
    },
    battle_toast_revision_conflict: {
      uk: 'Стан персонажа оновлено з сервера. Повтори дію.',
      ru: 'Состояние персонажа обновлено с сервера. Повтори действие.',
    },
    battle_toast_action_fail: {
      uk: 'Дія не виконалася (код ',
      ru: 'Действие не выполнено (код ',
    },
    battle_toast_no_response: {
      uk: 'Немає відповіді від сервера.',
      ru: 'Нет ответа от сервера.',
    },
    battle_log_done: { uk: 'Бій завершено.', ru: 'Бой завершён.' },
    battle_log_done_toast: { uk: 'Бій завершено.', ru: 'Бой завершён.' },
    battle_buffs_prefix: {
      uk: 'Активні ефекти: ',
      ru: 'Активные эффекты: ',
    },
    battle_mob_aggro: { uk: ' (агр)', ru: ' (агр)' },
    battle_aggressive: { uk: 'агресивний', ru: 'агрессивный' },
    battle_mob_lvl_short: { uk: ' · ур. ', ru: ' · ур. ' },
    battle_level_new: { uk: 'Новий рівень: ', ru: 'Новый уровень: ' },
    battle_defeat_hint_prefix: {
      uk: 'Найближче безпечне місце на карті: ',
      ru: 'Ближайшее безопасное место на карте: ',
    },
    battle_defeat_hint_suffix: {
      uk: '. Натисни кнопку — опинишся там.',
      ru: '. Нажми кнопку — окажешься там.',
    },
    battle_stub_alert: { uk: 'заглушка.', ru: 'заглушка.' },
    battle_loot_adena: { uk: ' аден', ru: ' аден' },
    battle_victory_dropped: { uk: 'Випало: ', ru: 'Выпало: ' },
    battle_loot_and: { uk: ' і ', ru: ' и ' },
    battle_exp_abbr: { uk: 'EXP', ru: 'EXP' },
    battle_sp_abbr: { uk: 'SP', ru: 'SP' },

    /** Головна / вхід */
    auth_start: { uk: 'Почати гру', ru: 'Начать игру' },
    auth_online: {
      uk: 'Онлайн: залежить від сервера',
      ru: 'Онлайн: зависит от сервера',
    },
    auth_thin_client: {
      uk: 'Тонкий клієнт · snapshot з API',
      ru: 'Тонкий клиент · snapshot с API',
    },
    auth_login_desc: {
      uk: 'Логін і пароль. Новий акаунт — через реєстрацію.',
      ru: 'Логин и пароль. Новый аккаунт — через регистрацию.',
    },
    auth_register: { uk: 'Реєстрація', ru: 'Регистрация' },
    auth_label_login: { uk: 'Логін', ru: 'Логин' },
    auth_label_pass: { uk: 'Пароль', ru: 'Пароль' },
    auth_submit: { uk: 'Увійти', ru: 'Войти' },
    auth_tabs_aria: {
      uk: 'Вхід або реєстрація',
      ru: 'Вход или регистрация',
    },
    auth_tab_login: { uk: 'Вхід', ru: 'Вход' },
    auth_tab_register: { uk: 'Реєстрація', ru: 'Регистрация' },
    auth_placeholder_login: { uk: 'Введіть логін', ru: 'Введите логин' },
    auth_placeholder_pass: { uk: 'Введіть пароль', ru: 'Введите пароль' },
    auth_remember: { uk: 'Запам’ятати мене', ru: 'Запомнить меня' },
    auth_forgot_pass: { uk: 'Забули пароль?', ru: 'Забыли пароль?' },
    auth_forgot_stub: {
      uk: 'Відновлення пароля ще не підключено — зверніться до адміністрації сервера.',
      ru: 'Восстановление пароля пока не подключено — обратитесь к администратору сервера.',
    },
    auth_toggle_pass_aria: {
      uk: 'Показати або приховати пароль',
      ru: 'Показать или скрыть пароль',
    },
    auth_dock_home: { uk: 'Головна', ru: 'Главная' },
    auth_dock_city: { uk: 'Місто', ru: 'Город' },
    auth_dock_about: { uk: 'Про сервер', ru: 'О сервере' },
    auth_dock_aria: { uk: 'Швидкі посилання', ru: 'Быстрые ссылки' },
    auth_sub: {
      uk: 'Мобільна онлайн гра · Lineage II',
      ru: 'Мобильная онлайн-игра · Lineage II',
    },
    auth_badge: {
      uk: 'Greenfield · сервер правди',
      ru: 'Greenfield · сервер истины',
    },

    abbr_level: { uk: 'ур.', ru: 'ур.' },

    page_profile_title: { uk: 'Профіль — L2WAP', ru: 'Профиль — L2WAP' },
    page_magisters_title: { uk: 'Магістри — L2WAP', ru: 'Магистры — L2WAP' },
    magisters_back_city: { uk: 'Назад до міста', ru: 'Назад в город' },
    magisters_intro_p1: {
      uk:
        'Досвідчені майстри готові передати тобі знання про бойові техніки, магічні закляття та особливі навички класу.',
      ru:
        'Опытные мастера готовы передать тебе знания о боевых техниках, магических заклинаниях и особых умениях класса.',
    },
    magisters_intro_p2: {
      uk:
        'Вивчай нові уміння, посилюй свого героя та готуйся до небезпечних пригод і битв.',
      ru:
        'Изучай новые умения, усиливай героя и готовься к опасным приключениям и сражениям.',
    },
    magisters_section_aria: { uk: 'Магістри', ru: 'Магистры' },

    /** Сторінка magister.html (один НПС, список скілів) */
    magister_page_intro_p1: {
      uk:
        'Привіт, мандрівнику. Бачу, ти вже дістався сюди — отже настав час стати сильнішим.',
      ru:
        'Привет, странник. Вижу, ты уже добрался сюда — значит, пришло время стать сильнее.',
    },
    magister_page_intro_p2: {
      uk:
        'Тут досвідчені магістри навчають героїв мистецтву бою, могутнім технікам і секретам свого класу.',
      ru:
        'Здесь опытные магистры учат героев искусству боя, могущественным техникам и секретам своего класса.',
    },
    magister_page_intro_p3: {
      uk:
        'Вивчай активні навички, що допоможуть нищити ворогів у бою, та пасивні вміння, які підвищать твою силу, захист і витривалість.',
      ru:
        'Изучай активные умения, что помогут крушить врагов в бою, и пассивные навыки, что повысят твою силу, защиту и выносливость.',
    },
    magister_page_intro_p4: {
      uk:
        'Кожна нова навичка зробить тебе небезпечнішим суперником на шляху до слави.',
      ru:
        'Каждое новое умение сделает тебя более опасным соперником на пути к славе.',
    },
  };

  L2.tr = function (key) {
    var row = L2.UI[key];
    if (!row || typeof row !== 'object') return String(key);
    var lang = L2.getUiLang ? L2.getUiLang() : 'uk';
    if (lang === 'ru' && row.ru != null && String(row.ru) !== '') return row.ru;
    return row.uk != null ? row.uk : row.ru || key;
  };

  /**
   * Заповнити елементи з data-i18n="ключ". Для aria: data-i18n-attr="aria-label:ключ"
   */
  L2.applyPageI18n = function (root) {
    if (!L2.tr) return;
    var scope = root && root.querySelectorAll ? root : document;
    if (!scope.querySelectorAll) return;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!k) return;
      var translated = L2.tr(k);
      if (translated && translated !== k) {
        el.textContent = translated;
      }
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var raw = el.getAttribute('data-i18n-attr');
      if (!raw) return;
      var parts = raw.split(':');
      if (parts.length < 2) return;
      var attr = parts[0].trim();
      var k = parts.slice(1).join(':').trim();
      var translated = L2.tr(k);
      if (translated && translated !== k) {
        el.setAttribute(attr, translated);
      }
    });
  };

  function runApply() {
    if (typeof document === 'undefined') return;
    L2.applyPageI18n(document);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runApply);
    } else {
      runApply();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
