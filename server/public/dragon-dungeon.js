/**
 * Підземелля драконів — клановий режим.
 */
(function () {
  var state = {
    token: '',
    view: null,
    unlockInFlight: false,
    unlockDragonId: '',
    pollTimer: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function fmtNum(n) {
    var x = Number(n);
    if (!Number.isFinite(x)) return String(n);
    return x.toLocaleString('uk-UA');
  }

  function fmtTime(sec) {
    var s = Math.max(0, Math.floor(Number(sec) || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    function pad(v) {
      return v < 10 ? '0' + v : String(v);
    }
    return pad(h) + ':' + pad(m) + ':' + pad(r);
  }

  function showErr(msg) {
    var el = $('dragon-dungeon-err');
    var ok = $('dragon-dungeon-ok');
    if (ok) ok.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showOk(msg) {
    var el = $('dragon-dungeon-ok');
    var err = $('dragon-dungeon-err');
    if (err) err.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function clearMsgs() {
    var err = $('dragon-dungeon-err');
    var ok = $('dragon-dungeon-ok');
    if (err) err.hidden = true;
    if (ok) ok.hidden = true;
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text == null ? '' : String(text);
  }

  function lockedReasonUk(code, boss) {
    if (code === 'clan_required') return 'Для участі потрібен клан.';
    if (code === 'clan_leader_required') return 'Дракона може відкрити глава клану.';
    if (code === 'clan_diamonds_insufficient') {
      var missing = boss && state.view && state.view.clan
        ? Math.max(0, boss.unlockCostDiamonds - state.view.clan.diamonds)
        : 0;
      return missing > 0 ? 'Не вистачає ' + missing + ' алмазів' : 'У клану недостатньо алмазів.';
    }
    if (code === 'dragon_already_active') return 'Клан уже б’ється з іншим драконом.';
    return '';
  }

  function renderReward(parent, reward) {
    if (!parent || !reward) return;
    var p = document.createElement('p');
    p.className = 'l2-dragon-card__reward';
    p.textContent =
      'Нагорода клану: ' +
      fmtNum(reward.adena) +
      ' адени, ' +
      reward.coinOfLuck +
      ' Coin of Luck, ' +
      reward.clanReputation +
      ' репутації';
    parent.appendChild(p);
  }

  function renderActiveBlock(view) {
    var el = $('dragon-dungeon-active');
    if (!el) return;
    var d = view.activeDungeon;
    if (!d) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = '';
    var img = document.createElement('img');
    img.className = 'l2-dragon-card__img';
    img.src = d.imageUrl;
    img.alt = d.nameUk;
    el.appendChild(img);
    var name = document.createElement('p');
    name.className = 'l2-dragon-card__name';
    name.textContent = d.nameUk;
    el.appendChild(name);
    var sub = document.createElement('p');
    sub.className = 'l2-dragon-card__subtitle';
    sub.textContent = d.nameEn + ' — ' + d.titleEn;
    el.appendChild(sub);
    var hp = document.createElement('p');
    hp.className = 'l2-dragon-card__hp';
    hp.textContent =
      'HP: ' + fmtNum(d.currentHp) + ' / ' + fmtNum(d.maxHp) + ' (' + d.hpPercent + '%)';
    el.appendChild(hp);
    var bar = document.createElement('div');
    bar.className = 'l2-dragon-hp-bar';
    var fill = document.createElement('div');
    fill.className = 'l2-dragon-hp-bar__fill';
    fill.style.width = Math.max(0, Math.min(100, d.hpPercent)) + '%';
    bar.appendChild(fill);
    el.appendChild(bar);
    var timer = document.createElement('p');
    timer.className = 'l2-dragon-card__timer';
    timer.textContent = 'До завершення: ' + fmtTime(d.remainingSeconds);
    el.appendChild(timer);
    renderReward(el, d.reward);
    var mc = view.myContribution;
    if (mc && mc.cooldownRemainingSeconds > 0 && !mc.inBattle) {
      var cd = document.createElement('p');
      cd.className = 'l2-dragon-card__missing';
      cd.textContent = 'Кулдаун входу: ' + fmtTime(mc.cooldownRemainingSeconds);
      el.appendChild(cd);
    }
    if (mc && mc.canEnter) {
      var enter = document.createElement('a');
      enter.className = 'l2-dragon-card__enter';
      enter.href = '/dragon-boss.html?dungeonId=' + encodeURIComponent(d.id);
      enter.textContent = 'Увійти в бій';
      el.appendChild(enter);
    } else if (mc && mc.inBattle) {
      var resume = document.createElement('a');
      resume.className = 'l2-dragon-card__enter';
      resume.href = '/dragon-boss.html?dungeonId=' + encodeURIComponent(d.id);
      resume.textContent = 'Продовжити бій';
      el.appendChild(resume);
    }
  }

  function renderBossCards(view) {
    var listEl = $('dragon-dungeon-list');
    if (!listEl || !Array.isArray(view.bosses)) return;
    if (view.activeDungeon) {
      listEl.hidden = true;
      return;
    }
    listEl.hidden = false;
    if (!listEl.dataset.built) {
      listEl.textContent = '';
      view.bosses.forEach(function (boss) {
        var card = document.createElement('article');
        card.className = 'l2-dragon-card';
        card.dataset.dragonId = boss.id;
        var imgWrap = document.createElement('div');
        imgWrap.className = 'l2-dragon-card__img-wrap';
        var img = document.createElement('img');
        img.className = 'l2-dragon-card__img';
        img.src = boss.imageUrl;
        img.alt = boss.nameUk;
        img.loading = 'lazy';
        imgWrap.appendChild(img);
        card.appendChild(imgWrap);
        var name = document.createElement('p');
        name.className = 'l2-dragon-card__name';
        name.textContent = boss.nameUk;
        card.appendChild(name);
        var subtitle = document.createElement('p');
        subtitle.className = 'l2-dragon-card__subtitle';
        subtitle.textContent = boss.nameEn + ' — ' + boss.titleEn;
        card.appendChild(subtitle);
        var cost = document.createElement('p');
        cost.className = 'l2-dragon-card__cost';
        cost.textContent = 'Відкриття: ' + boss.unlockCostDiamonds + ' алмазів';
        card.appendChild(cost);
        renderReward(card, boss.reward);
        var note = document.createElement('p');
        note.className = 'l2-dragon-card__missing';
        card.appendChild(note);
        var leaderNote = document.createElement('p');
        leaderNote.className = 'l2-dragon-card__subtitle';
        card.appendChild(leaderNote);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'l2-dragon-card__btn';
        btn.addEventListener('click', function () {
          void unlockDragon(boss.id);
        });
        card.appendChild(btn);
        listEl.appendChild(card);
      });
      listEl.dataset.built = '1';
    }
    view.bosses.forEach(function (boss) {
      var card = listEl.querySelector('[data-dragon-id="' + boss.id + '"]');
      if (!card) return;
      var note = card.querySelector('.l2-dragon-card__missing');
      var leaderNote = card.querySelectorAll('.l2-dragon-card__subtitle')[1];
      var btn = card.querySelector('.l2-dragon-card__btn');
      var inFlight = state.unlockInFlight && state.unlockDragonId === boss.id;
      if (view.clan && view.clan.isLeader && boss.canUnlock) {
        if (note) note.hidden = true;
        if (leaderNote) leaderNote.hidden = true;
        if (btn) {
          btn.hidden = false;
          btn.disabled = inFlight;
          btn.textContent = inFlight
            ? 'Відкриття…'
            : 'Відкрити за ' + boss.unlockCostDiamonds + ' алмазів';
        }
        return;
      }
      if (btn) {
        btn.hidden = view.clan && view.clan.isLeader ? false : true;
        btn.disabled = true;
        btn.textContent = 'Відкрити за ' + boss.unlockCostDiamonds + ' алмазів';
      }
      if (leaderNote) {
        leaderNote.hidden = !!(view.clan && view.clan.isLeader);
        leaderNote.textContent = 'Дракона може відкрити глава клану';
      }
      if (note) {
        var msg = lockedReasonUk(boss.lockedReason, boss);
        note.hidden = !msg;
        note.textContent = msg;
      }
    });
  }

  function renderContributions(view) {
    var el = $('dragon-dungeon-contrib');
    if (!el) return;
    if (!view.activeDungeon || !Array.isArray(view.contributions) || !view.contributions.length) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = '';
    var title = document.createElement('p');
    title.className = 'l2-dragon-contrib__title';
    title.textContent = 'Внесок учасників';
    el.appendChild(title);
    var ol = document.createElement('ol');
    ol.className = 'l2-dragon-contrib__list';
    view.contributions.forEach(function (row, idx) {
      var li = document.createElement('li');
      li.textContent =
        idx +
        1 +
        '. ' +
        row.characterName +
        ' — ' +
        fmtNum(row.damageDealt) +
        ' урону — ' +
        row.attempts +
        ' заходів — ' +
        row.deaths +
        ' смертей';
      ol.appendChild(li);
    });
    el.appendChild(ol);
  }

  function renderView(view) {
    state.view = view;
    if (!view) return;
    setText($('dragon-dungeon-clan-name'), view.clan ? view.clan.name : '—');
    setText($('dragon-dungeon-diamonds'), view.clan ? view.clan.diamonds : 0);
    var noClan = $('dragon-dungeon-no-clan');
    if (noClan) {
      if (view.noClanMessageUk) {
        noClan.hidden = false;
        noClan.textContent = view.noClanMessageUk;
      } else {
        noClan.hidden = true;
      }
    }
    renderActiveBlock(view);
    renderBossCards(view);
    renderContributions(view);
  }

  function stopPoll() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  function startPoll() {
    stopPoll();
    if (document.hidden) return;
    state.pollTimer = setInterval(function () {
      if (document.hidden || !state.token) return;
      void loadView(state.token)
        .then(renderView)
        .catch(function () {});
    }, 12000);
  }

  async function loadView(token) {
    var r = await fetch('/game/dragon-dungeon', {
      headers: { Authorization: 'Bearer ' + token },
    });
    var data = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) throw new Error(data.messageUk || 'dragon_dungeon_load_fail');
    return data;
  }

  async function unlockDragon(dragonId) {
    if (state.unlockInFlight || !state.token || !dragonId) return;
    state.unlockInFlight = true;
    state.unlockDragonId = dragonId;
    renderView(state.view);
    try {
      var r = await fetch(
        '/game/dragon-dungeon/' + encodeURIComponent(dragonId) + '/unlock',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + state.token,
            'Content-Type': 'application/json',
          },
          body: '{}',
        }
      );
      var data = await r.json().catch(function () {
        return {};
      });
      if (r.status === 409) {
        state.view = await loadView(state.token);
        renderView(state.view);
        showErr(data.messageUk || 'Стан підземелля змінився. Оновіть сторінку.');
        return;
      }
      if (!r.ok) {
        showErr(data.messageUk || 'Не вдалося відкрити дракона.');
        return;
      }
      state.view = data;
      renderView(state.view);
      showOk('Дракона відкрито для клану!');
    } catch (_e) {
      showErr('Не вдалося відкрити дракона.');
    } finally {
      state.unlockInFlight = false;
      state.unlockDragonId = '';
      if (state.view) renderView(state.view);
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') L2.mountL2Nav({});
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }
    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showErr('Потрібен вхід.');
      return;
    }
    state.token = t;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopPoll();
      else startPoll();
    });
    try {
      var view = await loadView(t);
      renderView(view);
      clearMsgs();
      startPoll();
    } catch (_e) {
      showErr('Не вдалося завантажити підземелля драконів.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
