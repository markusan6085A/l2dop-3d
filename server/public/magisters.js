/**
 * Сторінка «Магістри»: хаб навчання навичок лише через посилання magister.html
 * (без заглушок «Вивчити…» без href і без квестів із town — одна поведінка для всіх пристроїв).
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  /** Лише дії з реальним переходом на сторінку магістра (як хаб навчання навичок на ПК). */
  function isMagisterLearnHref(a) {
    return !!(a && a.href && String(a.href).indexOf('magister.html') !== -1);
  }

  /** У списк потрапляє лише НПС з хоч одним робочим посиланням на magister.html (без текстових заглушок). */
  function npcTeachesSkills(n) {
    var acts = n.actions || [];
    for (var i = 0; i < acts.length; i++) {
      if (isMagisterLearnHref(acts[i])) return true;
    }
    return false;
  }

  function showStub(msg) {
    var el = $('magisters-stub-msg');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function updateHeroLine(c) {
    if (!c) return;
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(c);
    }
  }

  function magisterLearnedHref(learnHref) {
    var base = String(learnHref || '').trim();
    if (!base) return '/char.html';
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + 'mode=learned';
  }

  function renderSkillTrainerNpcs(payload) {
    var main = $('magisters-main');
    var list = $('magisters-npc-list');
    if (!main || !list) return;
    list.innerHTML = '';
    var raw = payload && Array.isArray(payload.npcs) ? payload.npcs : [];
    var npcs = raw.filter(npcTeachesSkills);
    if (!npcs.length) {
      main.hidden = false;
      var empty = document.createElement('li');
      empty.className = 'l2-magisters-empty';
      empty.textContent =
        'У цьому місті ще немає записаних наставників з умінь. Пізніше додамо з l2dop.';
      list.appendChild(empty);
      return;
    }
    main.hidden = false;
    npcs.forEach(function (n) {
      var li = document.createElement('li');
      li.className = 'l2-city-npc-card';
      var actionsWrap = document.createElement('div');
      actionsWrap.className = 'l2-city-npc-card__actions';
      (n.actions || []).forEach(function (a) {
        if (!isMagisterLearnHref(a)) return;
        var link = document.createElement('a');
        link.className = 'l2-magisters-link';
        link.href = a.href;
        link.textContent = a.labelUk;
        actionsWrap.appendChild(link);

        var learnedLink = document.createElement('a');
        learnedLink.className = 'l2-magisters-link';
        learnedLink.href = magisterLearnedHref(a.href);
        learnedLink.textContent = 'Вивчені скіли';
        actionsWrap.appendChild(learnedLink);
      });
      if (!actionsWrap.childNodes.length) return;
      li.appendChild(actionsWrap);
      list.appendChild(li);
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var tail =
            window.L2 && L2.tr ? L2.tr('stub_later') : 'заглушка, з’явиться пізніше.';
          showStub('«' + label + '» — ' + tail);
        },
      });
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var t = localStorage.getItem('token');
    var errEl = $('magisters-load-err');
    var main = $('magisters-main');

    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          window.L2 && L2.tr
            ? L2.tr('magisters_need_login')
            : 'Потрібен вхід. Перейди на головну.';
      }
      if (main) main.hidden = true;
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    var cHero =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? await L2.resyncCharacterWhenRequired()
        : null;
    var c = cHero;
    var jCh = { character: cHero };
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }
    updateHeroLine(c);

    var rTown = await fetch('/character/town', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (!rTown.ok) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          window.L2 && L2.tr
            ? L2.tr('magisters_load_town_fail')
            : 'Не вдалося завантажити список міста.';
      }
      if (main) main.hidden = true;
      return;
    }
    if (errEl) errEl.hidden = true;
    var town = await rTown.json().catch(function () {
      return {};
    });
    renderSkillTrainerNpcs(town);
  }

  init();
})();
