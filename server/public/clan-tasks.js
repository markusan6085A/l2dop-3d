/**
 * Кланові завдання — cooperative clan tasks UI.
 */
(function () {
  var state = {
    token: '',
    view: null,
    takeInFlight: false,
    helpInFlight: false,
    claimInFlight: false,
    cancelInFlight: false,
    pendingTaskType: '',
    pendingTaskId: '',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function fmtNum(n) {
    var x = Number(n);
    if (!Number.isFinite(x)) return String(n);
    return x.toLocaleString('uk-UA');
  }

  function showErr(msg) {
    var el = $('clan-tasks-err');
    var ok = $('clan-tasks-ok');
    if (ok) ok.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showOk(msg) {
    var el = $('clan-tasks-ok');
    var err = $('clan-tasks-err');
    if (err) err.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function clearMsgs() {
    var err = $('clan-tasks-err');
    var ok = $('clan-tasks-ok');
    if (err) err.hidden = true;
    if (ok) ok.hidden = true;
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text == null ? '' : String(text);
  }

  function appendAccentSpan(parent, text) {
    var span = document.createElement('span');
    span.className = 'l2-clan-tasks-accent';
    span.textContent = text;
    parent.appendChild(span);
    return span;
  }

  function appendMetaSpan(parent, text) {
    var span = document.createElement('span');
    span.className = 'l2-clan-tasks-meta';
    span.textContent = text;
    parent.appendChild(span);
    return span;
  }

  function progressUnitLabel(taskType) {
    if (taskType === 'earn_adena') return 'адени';
    if (taskType === 'kill_monsters') return 'монстрів';
    if (taskType === 'earn_sp_from_monsters') return 'SP';
    if (taskType === 'kill_raid_boss') return 'рейдовий бос';
    return 'урону стіні';
  }

  function appendProgressLine(parent, task) {
    var p = document.createElement('p');
    appendAccentSpan(p, 'Прогрес: ');
    appendNormalText(
      p,
      fmtNum(task.progress) + ' / ' + fmtNum(task.target) + ' '
    );
    appendAccentSpan(p, progressUnitLabel(task.taskType));
    parent.appendChild(p);
    return p;
  }

  function appendNormalText(parent, text) {
    parent.appendChild(document.createTextNode(text));
  }

  function appendDescLine(parent, className, text) {
    var p = document.createElement('p');
    if (className) p.className = className;
    var s = text == null ? '' : String(text);
    var re = /\d[\d\s]*/g;
    var last = 0;
    var match;
    while ((match = re.exec(s))) {
      if (match.index > last) {
        appendAccentSpan(p, s.slice(last, match.index));
      }
      appendNormalText(p, match[0]);
      last = match.index + match[0].length;
    }
    if (last < s.length) {
      appendAccentSpan(p, s.slice(last));
    }
    parent.appendChild(p);
    return p;
  }

  function appendRewardValueParts(parent, reward) {
    if (!reward) {
      appendNormalText(parent, '—');
      return;
    }
    var first = true;
    if (reward.exp > 0) {
      if (!first) appendNormalText(parent, ', ');
      appendNormalText(parent, fmtNum(reward.exp) + ' ');
      appendAccentSpan(parent, 'досвіду');
      first = false;
    }
    if (reward.adena > 0) {
      if (!first) appendNormalText(parent, ', ');
      appendNormalText(parent, fmtNum(reward.adena) + ' ');
      appendAccentSpan(parent, 'адени');
      first = false;
    }
    if (reward.coinOfLuck > 0) {
      if (!first) appendNormalText(parent, ', ');
      appendNormalText(parent, String(reward.coinOfLuck) + ' ');
      appendAccentSpan(parent, 'Coin of Luck');
    }
    if (first) appendNormalText(parent, '—');
  }

  function apiErrUk(body) {
    if (body && body.messageUk) return body.messageUk;
    if (body && body.error === 'clan_required') {
      return 'Для виконання кланових завдань потрібен клан.';
    }
    return 'Помилка. Спробуйте ще раз.';
  }

  async function loadView() {
    var r = await fetch('/game/clan-tasks', {
      headers: { Authorization: 'Bearer ' + state.token },
    });
    if (r.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    var body = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      showErr(apiErrUk(body));
      return;
    }
    state.view = body;
    render();
  }

  function renderHeader(view) {
    var noClan = $('clan-tasks-no-clan');
    if (!view.clan) {
      setText($('clan-tasks-clan-name'), '—');
      setText($('clan-tasks-diamonds'), '0');
      if (noClan) {
        noClan.hidden = false;
        noClan.textContent = 'Для виконання кланових завдань потрібен клан.';
      }
      return;
    }
    if (noClan) noClan.hidden = true;
    setText($('clan-tasks-clan-name'), view.clan.name);
    setText($('clan-tasks-diamonds'), fmtNum(view.clan.diamonds));
  }

  function appendText(parent, className, text) {
    var p = document.createElement('p');
    if (className) p.className = className;
    p.textContent = text;
    parent.appendChild(p);
    return p;
  }

  function appendClanTasksDivider(parent) {
    if (!parent) return null;
    var hr = document.createElement('hr');
    hr.className = 'l2-clan-tasks-divider';
    hr.setAttribute('aria-hidden', 'true');
    parent.appendChild(hr);
    return hr;
  }

  function createDiamondIcon() {
    var img = document.createElement('img');
    img.className = 'l2-clan-tasks-diamond-ico';
    img.src = '/assets/diamond-.png';
    img.alt = '';
    img.width = 16;
    img.height = 16;
    img.decoding = 'async';
    return img;
  }

  function appendClanRewardLine(parent, diamonds) {
    var p = document.createElement('p');
    p.className = 'l2-clan-tasks-clan-reward';
    appendAccentSpan(p, 'Нагорода клану: ');
    p.appendChild(createDiamondIcon());
    appendNormalText(p, ' ' + String(diamonds) + ' алмази');
    parent.appendChild(p);
    return p;
  }

  function appendPlayerNickEl(parent, player) {
    if (window.L2 && typeof L2.createPlayerProfileNickEl === 'function') {
      parent.appendChild(
        L2.createPlayerProfileNickEl({
          characterId: player.id || player.characterId,
          name: player.name || player.characterName,
        })
      );
      return;
    }
    var nick = document.createElement('span');
    nick.className = 'l2-clan-tasks-nick';
    nick.textContent =
      (player && (player.name || player.characterName)) || '—';
    parent.appendChild(nick);
  }

  function appendPlayerLabelLine(parent, label, player, emptyText) {
    var p = document.createElement('p');
    appendAccentSpan(p, label);
    if (player && (player.name || player.characterName)) {
      appendPlayerNickEl(p, player);
    } else {
      appendAccentSpan(p, emptyText || '—');
    }
    parent.appendChild(p);
    return p;
  }

  function appendPersonalRewardLine(parent, label, reward) {
    var p = document.createElement('p');
    p.className = 'l2-clan-tasks-personal-reward';
    appendAccentSpan(p, label);
    appendRewardValueParts(p, reward);
    parent.appendChild(p);
    return p;
  }

  function appendContributionLine(parent, contribution) {
    var p = document.createElement('p');
    appendPlayerNickEl(p, contribution);
    p.appendChild(
      document.createTextNode(' — ' + fmtNum(contribution.progress))
    );
    parent.appendChild(p);
    return p;
  }

  function renderActiveTasks(view) {
    var wrap = $('clan-tasks-active-list');
    if (!wrap) return;
    wrap.textContent = '';
    if (!view.activeClanTasks || !view.activeClanTasks.length) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    appendText(wrap, 'l2-clan-tasks-active-title', 'Активні завдання клану');

    view.activeClanTasks.forEach(function (task, idx) {
      if (idx > 0) appendClanTasksDivider(wrap);
      var card = document.createElement('div');
      card.className = 'l2-clan-tasks-card';

      appendText(card, 'l2-clan-tasks-card__name', task.name);
      appendPlayerLabelLine(card, 'Виконує: ', task.owner);
      appendPlayerLabelLine(card, 'Допомагає: ', task.helper, 'немає');
      appendProgressLine(card, task);

      var bar = document.createElement('div');
      bar.className = 'l2-clan-tasks-progress-bar';
      var fill = document.createElement('div');
      fill.className = 'l2-clan-tasks-progress-bar__fill';
      fill.style.width = Math.min(100, Number(task.progressPercent) || 0) + '%';
      bar.appendChild(fill);
      card.appendChild(bar);

      appendPersonalRewardLine(
        card,
        'Особиста нагорода власнику: ',
        task.personalReward
      );
      appendClanRewardLine(card, task.clanRewardDiamonds);

      if (task.contributions && task.contributions.length) {
        var contrib = document.createElement('div');
        contrib.className = 'l2-clan-tasks-contrib';
        var contribTitle = document.createElement('p');
        appendMetaSpan(contribTitle, 'Внесок:');
        contrib.appendChild(contribTitle);
        task.contributions.forEach(function (c) {
          appendContributionLine(contrib, c);
        });
        card.appendChild(contrib);
      }

      var actions = document.createElement('div');
      actions.className = 'l2-clan-tasks-actions';

      if (task.canHelp) {
        var helpBtn = document.createElement('button');
        helpBtn.type = 'button';
        helpBtn.textContent = state.helpInFlight ? 'Зачекайте…' : 'Допомогти';
        helpBtn.disabled = state.helpInFlight;
        helpBtn.addEventListener('click', function () {
          postHelp(task.id);
        });
        actions.appendChild(helpBtn);
      }

      if (task.canClaim) {
        var claimBtn = document.createElement('button');
        claimBtn.type = 'button';
        claimBtn.textContent = state.claimInFlight ? 'Зачекайте…' : 'Завершити завдання';
        claimBtn.disabled = state.claimInFlight;
        claimBtn.addEventListener('click', function () {
          postClaim(task);
        });
        actions.appendChild(claimBtn);
      }

      if (task.canCancel) {
        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = state.cancelInFlight ? 'Зачекайте…' : 'Скасувати завдання';
        cancelBtn.disabled = state.cancelInFlight;
        cancelBtn.addEventListener('click', function () {
          postCancel(task);
        });
        actions.appendChild(cancelBtn);
      }

      card.appendChild(actions);
      wrap.appendChild(card);
    });
  }

  function renderDefinitions(view) {
    var wrap = $('clan-tasks-definitions');
    if (!wrap) return;
    wrap.textContent = '';

    var hadActive = !!(view.activeClanTasks && view.activeClanTasks.length);

    (view.taskDefinitions || []).forEach(function (def, idx) {
      if (idx > 0 || hadActive) appendClanTasksDivider(wrap);
      var card = document.createElement('div');
      card.className = 'l2-clan-tasks-card';
      appendText(card, 'l2-clan-tasks-card__name', def.name);
      appendDescLine(card, 'l2-clan-tasks-card__desc', def.description);
      appendPersonalRewardLine(card, 'Особиста нагорода: ', def.personalReward);
      appendClanRewardLine(card, def.clanRewardDiamonds);

      var actions = document.createElement('div');
      actions.className = 'l2-clan-tasks-actions';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent =
        state.takeInFlight && state.pendingTaskType === def.id
          ? 'Зачекайте…'
          : 'Взяти завдання';
      btn.disabled = !def.canTake || state.takeInFlight;
      if (!def.canTake && def.blockedReason === 'participant_busy') {
        appendText(card, 'l2-clan-tasks-busy-note', 'Ви вже виконуєте інше завдання.');
      }
      btn.addEventListener('click', function () {
        postTake(def.id);
      });
      actions.appendChild(btn);
      card.appendChild(actions);
      wrap.appendChild(card);
    });
  }

  function render() {
    var view = state.view;
    if (!view) return;
    renderHeader(view);
    renderActiveTasks(view);
    renderDefinitions(view);
  }

  async function postTake(taskType) {
    if (state.takeInFlight) return;
    state.takeInFlight = true;
    state.pendingTaskType = taskType;
    clearMsgs();
    render();
    try {
      var r = await fetch('/game/clan-tasks/' + encodeURIComponent(taskType) + '/take', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      var body = await r.json().catch(function () {
        return {};
      });
      if (r.status === 409 || !r.ok) {
        if (r.status === 409) await loadView();
        showErr(apiErrUk(body));
        return;
      }
      state.view = body;
      showOk('Завдання взято.');
      render();
    } finally {
      state.takeInFlight = false;
      state.pendingTaskType = '';
      render();
    }
  }

  async function postHelp(taskId) {
    if (state.helpInFlight) return;
    state.helpInFlight = true;
    clearMsgs();
    render();
    try {
      var r = await fetch('/game/clan-tasks/' + encodeURIComponent(taskId) + '/help', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      var body = await r.json().catch(function () {
        return {};
      });
      if (r.status === 409 || !r.ok) {
        if (r.status === 409) await loadView();
        showErr(apiErrUk(body));
        return;
      }
      state.view = body;
      showOk('Ви приєдналися до виконання завдання.');
      render();
    } finally {
      state.helpInFlight = false;
      render();
    }
  }

  async function postClaim(task) {
    if (state.claimInFlight) return;
    state.claimInFlight = true;
    clearMsgs();
    render();
    try {
      var r = await fetch('/game/clan-tasks/' + encodeURIComponent(task.id) + '/claim', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      var body = await r.json().catch(function () {
        return {};
      });
      if (r.status === 409 || !r.ok) {
        if (r.status === 409) await loadView();
        showErr(apiErrUk(body));
        return;
      }
      state.view = body;
      var ownerName = task.owner && task.owner.name ? task.owner.name : 'власник';
      showOk(
        'Завдання завершено!\n' +
          'Особисту нагороду отримав ' +
          ownerName +
          '.\n' +
          'Клан отримав ' +
          task.clanRewardDiamonds +
          ' алмази.'
      );
      render();
    } finally {
      state.claimInFlight = false;
      render();
    }
  }

  async function postCancel(task) {
    if (state.cancelInFlight) return;
    if (task.status === 'READY_TO_CLAIM') {
      var ok = window.confirm(
        'Завдання виконано, але нагороду ще не отримано. Скасувати його без нагороди?'
      );
      if (!ok) return;
    }
    state.cancelInFlight = true;
    clearMsgs();
    render();
    try {
      var r = await fetch('/game/clan-tasks/' + encodeURIComponent(task.id) + '/cancel', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      var body = await r.json().catch(function () {
        return {};
      });
      if (r.status === 409 || !r.ok) {
        if (r.status === 409) await loadView();
        showErr(apiErrUk(body));
        return;
      }
      state.view = body;
      showOk('Завдання скасовано.');
      render();
    } finally {
      state.cancelInFlight = false;
      render();
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') L2.mountL2Nav({});
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }
    if (window.L2 && typeof L2.applyPageI18n === 'function') {
      L2.applyPageI18n(document);
    }

    var t =
      window.L2 && typeof L2.token === 'function'
        ? L2.token()
        : localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showErr('Потрібен вхід.');
      return;
    }
    state.token = t;

    if (typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (typeof L2.resyncCharacterWhenRequired === 'function') {
      void L2.resyncCharacterWhenRequired()
        .then(function (snap) {
          if (snap && typeof L2.applyMutationSnapshot === 'function') {
            L2.applyMutationSnapshot(snap);
          }
        })
        .catch(function () {});
    }

    try {
      await loadView();
      clearMsgs();
    } catch (_e) {
      showErr('Не вдалося завантажити кланові завдання.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
