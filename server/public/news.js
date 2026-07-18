/**
 * Новости — стрічка подій сервера (GET /game/news).
 */
(function () {
  var currentPage = 1;

  function $(id) {
    return document.getElementById(id);
  }

  function formatAgoUk(iso) {
    var ts = Date.parse(iso);
    if (!Number.isFinite(ts)) return '[—]';
    var diff = Math.max(0, Date.now() - ts);
    var sec = Math.floor(diff / 1000);
    if (sec < 45) return '[щойно]';
    var min = Math.floor(sec / 60);
    if (min < 60) {
      if (min === 1) return '[1 хв тому]';
      return '[' + min + ' хв тому]';
    }
    var hr = Math.floor(min / 60);
    if (hr < 24) {
      if (hr === 1) return '[1 год тому]';
      return '[' + hr + ' год тому]';
    }
    var day = Math.floor(hr / 24);
    if (day === 1) return '[1 день тому]';
    return '[' + day + ' дн тому]';
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderEntry(entry) {
    var p = document.createElement('p');
    p.className = 'l2-news-item';
    var ago = formatAgoUk(entry.createdAt);
    var html = '';
    if (entry.kind === 'mammon_spawn') {
      html =
        '<a class="l2-news-item__mammon-link" href="/mammon-merchant-loc.html">Торговець Маммона</a>' +
        '<span class="l2-news-item__mammon-tail"> з\'явився у ' +
        escapeHtml(entry.locationEn || '—') +
        '</span> <span class="l2-news-item__ago">' +
        escapeHtml(ago) +
        '</span>';
    } else if (entry.kind === 'mammon_blacksmith_spawn') {
      html =
        '<a class="l2-news-item__mammon-link" href="/mammon-blacksmith-loc.html">Коваль Маммона</a>' +
        '<span class="l2-news-item__mammon-tail"> з\'явився у ' +
        escapeHtml(entry.locationEn || '—') +
        '</span> <span class="l2-news-item__ago">' +
        escapeHtml(ago) +
        '</span>';
    } else if (entry.kind === 'player_join') {
      var lead = document.createElement('span');
      lead.className = 'l2-news-item__join-lead';
      lead.textContent = 'У грі з\'явився новий гравець: ';
      p.appendChild(lead);
      var nick =
        window.L2 && typeof L2.createPlayerProfileNickEl === 'function'
          ? L2.createPlayerProfileNickEl({
              name: entry.playerName,
              className: 'l2-news-item__nick',
            })
          : (function () {
              var span = document.createElement('span');
              span.className = 'l2-news-item__nick';
              span.textContent = String(entry.playerName || '—');
              return span;
            })();
      p.appendChild(nick);
      var agoEl = document.createElement('span');
      agoEl.className = 'l2-news-item__ago';
      agoEl.textContent = ' ' + ago;
      p.appendChild(agoEl);
      return p;
    } else {
      html = '— <span class="l2-news-item__ago">' + escapeHtml(ago) + '</span>';
    }
    p.innerHTML = html;
    return p;
  }

  function renderPager(page, totalPages) {
    var nav = $('news-pages');
    if (!nav) return;
    if (totalPages <= 1) {
      nav.hidden = true;
      nav.innerHTML = '';
      return;
    }
    nav.hidden = false;
    nav.innerHTML = '';
    for (var i = 1; i <= totalPages; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-news-pages__btn';
      if (i === page) btn.className += ' l2-news-pages__btn--active';
      btn.textContent = String(i);
      btn.dataset.page = String(i);
      btn.addEventListener('click', function () {
        var p = Number(this.dataset.page);
        if (Number.isFinite(p) && p >= 1) {
          currentPage = p;
          loadNews();
        }
      });
      nav.appendChild(btn);
    }
  }

  async function loadNews() {
    var listEl = $('news-list');
    var t = localStorage.getItem('token');
    if (!listEl || !t) return;

    listEl.innerHTML = '';
    var loading = document.createElement('p');
    loading.className = 'l2-news-empty';
    loading.textContent = 'Завантаження…';
    listEl.appendChild(loading);

    var r = await fetch('/game/news?page=' + encodeURIComponent(String(currentPage)), {
      headers: { Authorization: 'Bearer ' + t },
      cache: 'no-store',
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) {
      listEl.innerHTML = '';
      var err = document.createElement('p');
      err.className = 'l2-news-empty';
      err.textContent =
        'Не вдалося завантажити новини. Якщо щойно оновлювали сервер — npm run db:push і перезапуск.';
      listEl.appendChild(err);
      return;
    }

    var j = await r.json();
    var entries = j && j.entries ? j.entries : [];
    listEl.innerHTML = '';
    if (!entries.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-news-empty';
      empty.textContent = 'Новин поки немає.';
      listEl.appendChild(empty);
    } else {
      for (var i = 0; i < entries.length; i++) {
        listEl.appendChild(renderEntry(entries[i]));
      }
    }
    renderPager(j.page || 1, j.totalPages || 1);
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    await loadNews();
    setInterval(function () {
      if (document.hidden) return;
      loadNews();
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
