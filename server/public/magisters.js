/**
 * Сторінка «Магістри»: тільки НПС з навчанням умінь (фільтр з /character/town).
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  /** Хоч одна дія веде до магістра або явно про вивчення навичок. */
  function npcTeachesSkills(n) {
    var acts = n.actions || [];
    for (var i = 0; i < acts.length; i++) {
      var a = acts[i];
      if (a.href && String(a.href).indexOf('magister.html') !== -1) return true;
      var lab = String(a.labelUk || '').toLowerCase();
      if (lab.indexOf('вивчити') !== -1) return true;
      if (lab.indexOf('навич') !== -1) return true;
      if (lab.indexOf('умінн') !== -1) return true;
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
      var head = document.createElement('div');
      head.className = 'l2-city-npc-card__head';
      var line = document.createElement('strong');
      line.textContent = n.titleUk + ' · ' + n.nameUk;
      head.appendChild(line);
      if (n.l2NpcId != null) {
        var sid = document.createElement('span');
        sid.className = 'l2-city-npc-card__id';
        sid.textContent = 'L2 npc ' + n.l2NpcId;
        head.appendChild(sid);
      }
      li.appendChild(head);
      var actionsWrap = document.createElement('div');
      actionsWrap.className = 'l2-city-npc-card__actions';
      (n.actions || []).forEach(function (a) {
        if (a.href) {
          var link = document.createElement('a');
          link.className = 'l2-town-btn';
          link.href = a.href;
          link.textContent = a.labelUk;
          actionsWrap.appendChild(link);
        } else {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'l2-town-btn';
          btn.textContent = a.labelUk;
          btn.setAttribute('data-stub', a.stubUk || 'Незабаром.');
          btn.addEventListener('click', function () {
            showStub(btn.getAttribute('data-stub') || '');
          });
          actionsWrap.appendChild(btn);
        }
      });
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

    var rCh = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (rCh.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!rCh.ok) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          window.L2 && L2.tr ? L2.tr('city_load_hero_fail') : 'Не вдалося завантажити героя.';
      }
      if (main) main.hidden = true;
      return;
    }
    var jCh = await rCh.json();
    var c = jCh.character;
    if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(c);
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
