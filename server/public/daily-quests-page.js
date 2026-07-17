/**
 * Сторінка «Щоденні завдання» — каталог + прогрес + claim із snapshot.
 */
(function () {
  var claimInFlight = false;
  var lastSnapshot = null;

  function $(id) {
    return document.getElementById(id);
  }

  function catalog() {
    return window.L2DailyQuestsCatalog || { tasks: [], resetHintUk: '' };
  }

  function fmtNum(n) {
    var x = Math.max(0, Math.floor(Number(n) || 0));
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function fmtPlaytimeSec(sec) {
    var s = Math.max(0, Math.floor(Number(sec) || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    if (h > 0 && m > 0) return h + ' год ' + m + ' хв';
    if (h > 0) return h + ' год';
    if (m > 0) return m + ' хв';
    return s + ' сек';
  }

  function progressForTask(snapshot, taskId) {
    var dq =
      snapshot && snapshot.dailyQuests && snapshot.dailyQuests.tasks
        ? snapshot.dailyQuests.tasks
        : null;
    var row = dq && dq[taskId] ? dq[taskId] : null;
    if (row) {
      return {
        have: Math.max(0, Math.floor(Number(row.have) || 0)),
        need: Math.max(1, Math.floor(Number(row.need) || 1)),
        done: !!row.done,
        claimed: !!row.claimed,
      };
    }
    return { have: 0, need: 1, done: false, claimed: false };
  }

  function formatProgressLabel(taskId, have, need) {
    if (taskId === 'daily_playtime_2h') {
      return fmtPlaytimeSec(have) + ' / ' + fmtPlaytimeSec(need);
    }
    return fmtNum(have) + ' / ' + fmtNum(need);
  }

  function fillGoalText(template, taskId, have, need) {
    var t = String(template || '');
    var label = formatProgressLabel(taskId, have, need);
    return t
      .replace(/\{have\}/g, String(have))
      .replace(/\{need\}/g, String(need))
      .replace(/\{progress\}/g, label);
  }

  function progressPct(have, need) {
    if (need <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((have / need) * 100)));
  }

  function renderProgressBar(taskId, have, need, done, claimed) {
    var wrap = document.createElement('div');
    wrap.className = 'l2-daily-quests-progress';

    var label = document.createElement('p');
    label.className = 'l2-daily-quests-progress__label';
    label.textContent = formatProgressLabel(taskId, have, need);
    wrap.appendChild(label);

    var track = document.createElement('div');
    track.className = 'l2-daily-quests-progress__track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(need));
    track.setAttribute('aria-valuenow', String(have));

    var fill = document.createElement('div');
    fill.className = 'l2-daily-quests-progress__fill';
    if (done) fill.classList.add('l2-daily-quests-progress__fill--done');
    if (claimed) fill.classList.add('l2-daily-quests-progress__fill--claimed');
    fill.style.width = progressPct(have, need) + '%';
    track.appendChild(fill);
    wrap.appendChild(track);

    return wrap;
  }

  function applyScreenFromSnapshot(snapshot) {
    var listEl = $('daily-quests-list');
    renderTaskList(listEl, snapshot);
  }

  function showClaimMsg(text, isErr) {
    var errEl = $('daily-quests-load-err');
    if (!errEl) return;
    if (!text) {
      errEl.hidden = true;
      errEl.textContent = '';
      return;
    }
    errEl.hidden = false;
    errEl.textContent = text;
    if (!isErr) errEl.classList.add('l2-daily-quests-msg--ok');
    else errEl.classList.remove('l2-daily-quests-msg--ok');
  }

  async function claimDailyQuest(taskId, btn) {
    if (claimInFlight) return;
    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    var rev =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? L2.lastSnapshot()?.revision
        : lastSnapshot && lastSnapshot.revision;
    if (rev == null && lastSnapshot) rev = lastSnapshot.revision;
    if (typeof rev !== 'number') {
      showClaimMsg('Немає revision — онови сторінку.', true);
      return;
    }

    claimInFlight = true;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Забираємо…';
    }
    showClaimMsg('', false);

    try {
      var r = await fetch('/character/daily-quests/claim', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: taskId, expectedRevision: rev }),
      });
      var j = await r.json().catch(function () {
        return null;
      });

      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          var snap = await L2.resyncCharacterAfterConflict(applyScreenFromSnapshot, j);
          if (snap) lastSnapshot = snap;
        }
        showClaimMsg('Стан оновлено — спробуй ще раз.', true);
        return;
      }

      if (!r.ok) {
        var errUk =
          j && j.messageUk
            ? j.messageUk
            : 'Не вдалося забрати нагороду.';
        showClaimMsg(errUk, true);
        return;
      }

      var c = j && j.character ? j.character : null;
      if (!c) {
        showClaimMsg('Порожня відповідь сервера.', true);
        return;
      }

      lastSnapshot = c;
      if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(c, applyScreenFromSnapshot);
      } else if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(c, applyScreenFromSnapshot);
      } else {
        applyScreenFromSnapshot(c);
      }
      showClaimMsg('Нагороду отримано!', false);
    } catch (_e) {
      showClaimMsg('Помилка мережі.', true);
    } finally {
      claimInFlight = false;
      if (btn && btn.isConnected) {
        btn.disabled = false;
        btn.textContent = 'Забрати нагороду';
      }
    }
  }

  function renderTaskList(listEl, snapshot) {
    if (!listEl) return;
    listEl.innerHTML = '';
    var cat = catalog();
    var tasks = Array.isArray(cat.tasks) ? cat.tasks : [];

    if (!tasks.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-daily-quests-empty';
      empty.textContent =
        'Список щоденних завдань порожній — додай завдання в daily-quests-catalog.js.';
      listEl.appendChild(empty);
      return;
    }

    tasks.forEach(function (task) {
      if (!task || !task.id) return;
      var prog = progressForTask(snapshot, task.id);
      var need = prog.need;
      var have = prog.have;

      var card = document.createElement('article');
      card.className = 'l2-daily-quests-card';
      if (prog.done) card.classList.add('l2-daily-quests-card--done');
      if (prog.claimed) card.classList.add('l2-daily-quests-card--claimed');
      card.dataset.dailyQuestId = String(task.id);

      var title = document.createElement('h2');
      title.className = 'l2-daily-quests-card__title';
      title.textContent = task.titleUk || task.id;
      card.appendChild(title);

      if (task.descriptionUk) {
        var desc = document.createElement('p');
        desc.className = 'l2-daily-quests-card__desc';
        desc.textContent = task.descriptionUk;
        card.appendChild(desc);
      }

      if (task.goalUk) {
        var goal = document.createElement('p');
        goal.className = 'l2-daily-quests-card__goal';
        goal.textContent = fillGoalText(task.goalUk, task.id, have, need);
        card.appendChild(goal);
      }

      card.appendChild(renderProgressBar(task.id, have, need, prog.done, prog.claimed));

      if (task.rewardUk) {
        var reward = document.createElement('p');
        reward.className = 'l2-daily-quests-card__reward';
        reward.textContent = 'Нагорода: ' + task.rewardUk;
        card.appendChild(reward);
      }

      if (prog.done && !prog.claimed) {
        var claimBtn = document.createElement('button');
        claimBtn.type = 'button';
        claimBtn.className = 'l2-daily-quests-claim-btn';
        claimBtn.textContent = 'Забрати нагороду';
        claimBtn.addEventListener('click', function () {
          claimDailyQuest(task.id, claimBtn);
        });
        card.appendChild(claimBtn);
      }

      var status = document.createElement('p');
      status.className = 'l2-daily-quests-card__status';
      if (prog.claimed) {
        status.textContent = 'Нагороду отримано.';
      } else if (prog.done) {
        status.textContent = 'Виконано — натисни «Забрати нагороду».';
      } else if (have > 0) {
        status.textContent = 'У процесі…';
      } else {
        status.textContent = 'Активне — просто грай.';
      }
      card.appendChild(status);

      listEl.appendChild(card);
    });
  }

  async function fetchSnapshot() {
    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      return L2.resyncCharacterWhenRequired();
    }
    return null;
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    var errEl = $('daily-quests-load-err');
    var content = $('daily-quests-content');
    var listEl = $('daily-quests-list');
    var hintEl = $('daily-quests-reset-hint');
    var loadingEl = $('daily-quests-loading');

    if (content) content.hidden = false;

    try {
      var c = await fetchSnapshot();
      if (!c) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      lastSnapshot = c;
      if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(c);
      } else if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(c);
      }

      var cat = catalog();
      if (hintEl && cat.resetHintUk) {
        hintEl.textContent = cat.resetHintUk;
        hintEl.hidden = false;
      }

      renderTaskList(listEl, c);
      if (listEl) listEl.hidden = false;
      if (loadingEl) loadingEl.hidden = true;
      if (errEl) errEl.hidden = true;
    } catch (_e) {
      if (loadingEl) loadingEl.hidden = true;
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити щоденні завдання.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
